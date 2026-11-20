import * as Notifications from "expo-notifications";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  DIAS_PRESTAMO,
  PERSONA_ACTUAL,
  PERSONAL,
} from "@/constants/config";
import { ESPERA_INICIAL } from "@/data/libros";
import { Cola } from "@/estructuras/Cola";
import { Pila } from "@/estructuras/Pila";
import { leerEstado, guardarEstado, type EstadoPersistido } from "@/lib/almacenamiento";
import { buscarLibroPorIsbn } from "@/lib/catalogo";
import {
  cancelarRecordatorio,
  configurarNotificaciones,
  prepararCanalPrestamos,
  programarAvisoRetiro,
  programarRecordatorio,
} from "@/lib/notificaciones";
import type { Aviso, Libro, Prestamo, ResultadoReserva } from "@/types";

/**
 * Datos mutables que viven en el provider. `Pila` y `Cola` se mutan en el
 * lugar, así que después de cada cambio se reemplaza el objeto contenedor para
 * que React vuelva a renderizar a quien consume el Context.
 */
type Interno = {
  prestamos: Prestamo[];
  esperas: Map<string, Cola<string>>;
  recientes: Pila<string>;
  sesion: boolean;
  avisos: Aviso[];
};

export type BibliotecaContexto = {
  hidratando: boolean;
  prestamos: Prestamo[];
  esperas: Record<string, string[]>;
  recientes: string[];
  sesion: boolean;
  avisos: Aviso[];
  estaPrestado: (isbn: string) => boolean;
  estaEnEspera: (isbn: string) => boolean;
  posicionEnEspera: (isbn: string) => number;
  disponibles: (libro: Libro) => number;
  registrarVisita: (isbn: string) => void;
  reservar: (libro: Libro) => ResultadoReserva;
  devolver: (isbn: string) => Promise<void>;
  activarRecordatorio: (isbn: string) => Promise<boolean>;
  desactivarRecordatorio: (isbn: string) => Promise<void>;
  entregarSiguiente: (isbn: string) => Promise<void>;
  avisarCambioDePermiso: () => void;
  iniciarSesion: (usuario: string, clave: string) => boolean;
  cerrarSesion: () => void;
  descartarAviso: (id: string) => void;
};

const BibliotecaContext = createContext<BibliotecaContexto | null>(null);

function crearEsperasIniciales(): Map<string, Cola<string>> {
  const esperas = new Map<string, Cola<string>>();
  for (const [isbn, personas] of Object.entries(ESPERA_INICIAL)) {
    const cola = new Cola<string>();
    personas.forEach((persona) => cola.encolar(persona));
    esperas.set(isbn, cola);
  }
  return esperas;
}

function crearEstadoInicial(): Interno {
  return {
    prestamos: [],
    esperas: crearEsperasIniciales(),
    recientes: new Pila<string>(),
    sesion: false,
    avisos: [],
  };
}

function pilaDesde(isbns: string[]): Pila<string> {
  const pila = new Pila<string>();
  isbns.forEach((isbn) => pila.apilar(isbn));
  return pila;
}

function esperasDesde(guardadas: Record<string, string[]>): Map<string, Cola<string>> {
  const esperas = new Map<string, Cola<string>>();
  for (const [isbn, personas] of Object.entries(guardadas)) {
    const cola = new Cola<string>();
    personas.forEach((persona) => cola.encolar(persona));
    esperas.set(isbn, cola);
  }
  return esperas;
}

function aPersistir(interno: Interno): EstadoPersistido {
  const esperas: Record<string, string[]> = {};
  interno.esperas.forEach((cola, isbn) => {
    esperas[isbn] = cola.aArray();
  });
  return {
    prestamos: interno.prestamos,
    esperas,
    recientes: interno.recientes.aArray(),
    avisos: interno.avisos,
  };
}

function crearId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function fechaDeDevolucion(): string {
  const vence = new Date();
  vence.setDate(vence.getDate() + DIAS_PRESTAMO);
  return vence.toISOString();
}

export function BibliotecaProvider({ children }: { children: ReactNode }) {
  const [interno, setInterno] = useState<Interno>(crearEstadoInicial);
  const [hidratando, setHidratando] = useState(true);

  useEffect(() => {
    let activo = true;
    configurarNotificaciones();

    const hidratar = async () => {
      // Si el almacenamiento falla, la app arranca vacía en vez de romperse.
      const guardado = await leerEstado().catch(() => null);
      if (!activo) {
        return;
      }
      if (guardado) {
        setInterno((previo) => ({
          ...previo,
          prestamos: guardado.prestamos,
          avisos: guardado.avisos,
          recientes: pilaDesde(guardado.recientes),
          esperas: esperasDesde(guardado.esperas),
        }));
      }
      setHidratando(false);
    };

    void hidratar();

    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    if (hidratando) {
      return;
    }
    // El guardado es best-effort: si falla, la app sigue funcionando en memoria.
    guardarEstado(aPersistir(interno)).catch(() => undefined);
  }, [interno, hidratando]);

  const valor = useMemo<BibliotecaContexto>(() => {
    const mutar = (fn: (estado: Interno) => void) => {
      fn(interno);
      setInterno({ ...interno });
    };

    const estaPrestado = (isbn: string) =>
      interno.prestamos.some((prestamo) => prestamo.isbn === isbn);

    const estaEnEspera = (isbn: string) =>
      (interno.esperas.get(isbn)?.aArray() ?? []).includes(PERSONA_ACTUAL);

    const posicionEnEspera = (isbn: string) => {
      const cola = interno.esperas.get(isbn);
      if (!cola) {
        return 0;
      }
      return cola.aArray().indexOf(PERSONA_ACTUAL) + 1;
    };

    const disponibles = (libro: Libro) =>
      libro.ejemplares - (estaPrestado(libro.isbn) ? 1 : 0);

    const agregarAviso = (texto: string) => {
      mutar((estado) => {
        estado.avisos = [{ id: crearId(), texto }, ...estado.avisos];
      });
    };

    const registrarVisita = (isbn: string) => {
      if (interno.recientes.tope() === isbn) {
        return;
      }
      const previos = interno.recientes.aArray().filter((item) => item !== isbn);
      const pila = pilaDesde([...previos, isbn]);
      mutar((estado) => {
        estado.recientes = pila;
      });
    };

    const reservar = (libro: Libro): ResultadoReserva => {
      if (estaPrestado(libro.isbn) || estaEnEspera(libro.isbn)) {
        return { tipo: "duplicado" };
      }

      if (disponibles(libro) > 0) {
        const vence = fechaDeDevolucion();
        mutar((estado) => {
          estado.prestamos = [
            { isbn: libro.isbn, vence, recordar: false, recordatorioId: null },
            ...estado.prestamos,
          ];
        });
        return { tipo: "prestamo", vence };
      }

      const cola = interno.esperas.get(libro.isbn) ?? new Cola<string>();
      cola.encolar(PERSONA_ACTUAL);
      mutar((estado) => {
        estado.esperas.set(libro.isbn, cola);
      });
      return { tipo: "espera", posicion: cola.tamanio };
    };

    const devolver = async (isbn: string) => {
      const prestamo = interno.prestamos.find((item) => item.isbn === isbn);
      if (!prestamo) {
        return;
      }
      await cancelarRecordatorio(prestamo.recordatorioId);
      mutar((estado) => {
        estado.prestamos = estado.prestamos.filter((item) => item.isbn !== isbn);
      });
    };

    const activarRecordatorio = async (isbn: string) => {
      const prestamo = interno.prestamos.find((item) => item.isbn === isbn);
      const libro = buscarLibroPorIsbn(isbn);
      if (!prestamo || !libro) {
        return false;
      }
      const permiso = await Notifications.getPermissionsAsync();
      if (!permiso.granted) {
        return false;
      }
      await prepararCanalPrestamos();
      const recordatorioId = await programarRecordatorio(libro);
      mutar((estado) => {
        const actual = estado.prestamos.find((item) => item.isbn === isbn);
        if (actual) {
          actual.recordar = true;
          actual.recordatorioId = recordatorioId;
        }
      });
      return true;
    };

    const desactivarRecordatorio = async (isbn: string) => {
      const prestamo = interno.prestamos.find((item) => item.isbn === isbn);
      if (!prestamo) {
        return;
      }
      await cancelarRecordatorio(prestamo.recordatorioId);
      mutar((estado) => {
        const actual = estado.prestamos.find((item) => item.isbn === isbn);
        if (actual) {
          actual.recordar = false;
          actual.recordatorioId = null;
        }
      });
    };

    const entregarSiguiente = async (isbn: string) => {
      const cola = interno.esperas.get(isbn);
      const libro = buscarLibroPorIsbn(isbn);
      if (!cola || !libro || cola.tamanio === 0) {
        return;
      }
      const persona = cola.desencolar();
      mutar((estado) => {
        estado.esperas.set(isbn, cola);
      });
      if (persona !== PERSONA_ACTUAL) {
        return;
      }
      const permiso = await Notifications.getPermissionsAsync();
      if (permiso.granted) {
        await programarAvisoRetiro(libro);
        return;
      }
      agregarAviso(`Te toca retirar "${libro.titulo}". Acercate al mostrador.`);
    };

    const avisarCambioDePermiso = () => {
      agregarAviso(
        "Cambió el permiso de notificaciones. Los avisos de la biblioteca aparecen acá.",
      );
    };

    const iniciarSesion = (usuario: string, clave: string) => {
      const valido = usuario.trim() === PERSONAL.usuario && clave === PERSONAL.clave;
      if (valido) {
        mutar((estado) => {
          estado.sesion = true;
        });
      }
      return valido;
    };

    const cerrarSesion = () => {
      mutar((estado) => {
        estado.sesion = false;
      });
    };

    const descartarAviso = (id: string) => {
      mutar((estado) => {
        estado.avisos = estado.avisos.filter((aviso) => aviso.id !== id);
      });
    };

    const esperas: Record<string, string[]> = {};
    interno.esperas.forEach((cola, isbn) => {
      esperas[isbn] = cola.aArray();
    });

    return {
      hidratando,
      prestamos: interno.prestamos,
      esperas,
      recientes: interno.recientes.aArray().reverse(),
      sesion: interno.sesion,
      avisos: interno.avisos,
      estaPrestado,
      estaEnEspera,
      posicionEnEspera,
      disponibles,
      registrarVisita,
      reservar,
      devolver,
      activarRecordatorio,
      desactivarRecordatorio,
      entregarSiguiente,
      avisarCambioDePermiso,
      iniciarSesion,
      cerrarSesion,
      descartarAviso,
    };
  }, [interno, hidratando]);

  return (
    <BibliotecaContext.Provider value={valor}>
      {children}
    </BibliotecaContext.Provider>
  );
}

export function useBiblioteca(): BibliotecaContexto {
  const contexto = useContext(BibliotecaContext);
  if (!contexto) {
    throw new Error("useBiblioteca debe usarse dentro de BibliotecaProvider");
  }
  return contexto;
}
