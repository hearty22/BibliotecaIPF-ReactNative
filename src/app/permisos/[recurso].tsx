import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { AppState, Linking, ScrollView, StyleSheet, Text } from "react-native";

import { Boton } from "@/components/Boton";
import { MensajeEstado } from "@/components/MensajeEstado";
import { Tarjeta } from "@/components/Tarjeta";
import { COLORES, ESPACIOS, TIPOGRAFIA } from "@/constants/tema";
import { useBiblioteca } from "@/context/BibliotecaContext";
import { usePermiso } from "@/hooks/usePermiso";
import { normalizarParametro } from "@/lib/catalogo";
import type { RecursoPermiso } from "@/types";

const BENEFICIOS: Record<RecursoPermiso, { titulo: string; texto: string }> = {
  camara: {
    titulo: "Usar la cámara",
    texto:
      "Usamos tu cámara para leer el código de barras del libro y abrir su ficha sin escribir el ISBN a mano.",
  },
  notificaciones: {
    titulo: "Recibir recordatorios",
    texto:
      "Usamos tus notificaciones para avisarte antes del vencimiento del préstamo y cuando te toca retirar un libro.",
  },
};

const DESTINOS: Record<RecursoPermiso, "/escanear" | "/reservas"> = {
  camara: "/escanear",
  notificaciones: "/reservas",
};

function esRecurso(valor: string): valor is RecursoPermiso {
  return valor === "camara" || valor === "notificaciones";
}

export default function Permisos() {
  const params = useLocalSearchParams<{ recurso?: string; isbn?: string }>();
  const recurso = normalizarParametro(params.recurso);
  const isbn = normalizarParametro(params.isbn);
  const valido = esRecurso(recurso);
  const { estado, pedir, refrescar } = usePermiso(valido ? recurso : "camara");
  const { activarRecordatorio } = useBiblioteca();
  const [pendiente, setPendiente] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // La persona puede ir a Ajustes y volver: al recuperar el foco se relee.
  useEffect(() => {
    const suscripcion = AppState.addEventListener("change", (siguiente) => {
      if (siguiente === "active") {
        void refrescar();
      }
    });
    return () => suscripcion.remove();
  }, [refrescar]);

  if (!valido) {
    return (
      <ScrollView contentContainerStyle={estilos.contenido}>
        <MensajeEstado mensaje="Ese permiso no existe en la aplicación." />
        <Boton onPress={() => router.back()} titulo="Volver" variante="secundario" />
      </ScrollView>
    );
  }

  const beneficio = BENEFICIOS[recurso];

  const continuar = async () => {
    if (estado === "bloqueado") {
      await Linking.openSettings();
      return;
    }

    setPendiente(true);
    setError(null);
    const nuevo = await pedir();
    setPendiente(false);

    if (nuevo !== "concedido") {
      return;
    }

    if (recurso === "notificaciones" && isbn) {
      const programado = await activarRecordatorio(isbn);
      if (!programado) {
        setError("No pudimos programar el recordatorio. Probá de nuevo.");
        return;
      }
    }

    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(DESTINOS[recurso]);
  };

  return (
    <ScrollView contentContainerStyle={estilos.contenido}>
      <Tarjeta titulo={beneficio.titulo}>
        <Text style={estilos.texto}>{beneficio.texto}</Text>
      </Tarjeta>

      {estado === "bloqueado" && (
        <Text style={estilos.aviso}>
          El permiso está bloqueado en los ajustes del teléfono. Podés habilitarlo
          desde Ajustes y volver a esta pantalla.
        </Text>
      )}

      {error && <MensajeEstado mensaje={error} />}

      <Boton
        deshabilitado={pendiente || estado === "cargando"}
        onPress={() => {
          void continuar();
        }}
        titulo={estado === "bloqueado" ? "Abrir Ajustes" : "Continuar"}
      />
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenido: {
    gap: ESPACIOS.md,
    padding: ESPACIOS.md,
  },
  texto: {
    color: COLORES.textoSuave,
    fontSize: TIPOGRAFIA.cuerpo,
    lineHeight: 21,
  },
  aviso: {
    color: COLORES.alerta,
    fontSize: TIPOGRAFIA.detalle,
  },
});
