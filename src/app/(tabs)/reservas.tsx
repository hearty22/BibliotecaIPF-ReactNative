import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect } from "react";
import { AppState, FlatList, StyleSheet, Text, View } from "react-native";

import { AvisosBiblioteca } from "@/components/AvisosBiblioteca";
import { Cargando } from "@/components/Cargando";
import { FilaPrestamo } from "@/components/FilaPrestamo";
import { PERSONA_ACTUAL } from "@/constants/config";
import { COLORES, ESPACIOS, RADIOS, TIPOGRAFIA } from "@/constants/tema";
import { useBiblioteca } from "@/context/BibliotecaContext";
import { usePermiso } from "@/hooks/usePermiso";
import { buscarLibroPorIsbn } from "@/lib/catalogo";
import type { EstadoPermiso, Prestamo } from "@/types";

const TEXTO_PERMISO: Record<EstadoPermiso, string> = {
  cargando: "Revisando el permiso de notificaciones…",
  concedido: "Las notificaciones están activadas.",
  preguntable:
    "Las notificaciones están desactivadas. Activá «Recordarme» en un préstamo para recibirlas.",
  bloqueado:
    "Las notificaciones están bloqueadas en el sistema. Los avisos aparecen en esta pantalla.",
};

export default function Reservas() {
  const {
    avisos,
    descartarAviso,
    desactivarRecordatorio,
    devolver,
    esperas,
    activarRecordatorio,
    prestamos,
  } = useBiblioteca();
  const { estado, refrescar } = usePermiso("notificaciones");
  const router = useRouter();

  // Una vuelta por Ajustes cambia el permiso sin desmontar la pantalla.
  useFocusEffect(
    useCallback(() => {
      void refrescar();
    }, [refrescar]),
  );

  useEffect(() => {
    const suscripcion = AppState.addEventListener("change", (siguiente) => {
      if (siguiente === "active") {
        void refrescar();
      }
    });
    return () => suscripcion.remove();
  }, [refrescar]);

  const cambiarRecordar = async (prestamo: Prestamo, valor: boolean) => {
    if (!valor) {
      await desactivarRecordatorio(prestamo.isbn);
      return;
    }
    if (estado === "concedido") {
      await activarRecordatorio(prestamo.isbn);
      return;
    }
    router.push({
      pathname: "/permisos/[recurso]",
      params: { recurso: "notificaciones", isbn: prestamo.isbn },
    });
  };

  const misEsperas = Object.entries(esperas).flatMap(([isbn, personas]) => {
    const libro = buscarLibroPorIsbn(isbn);
    const posicion = personas.indexOf(PERSONA_ACTUAL) + 1;
    if (!libro || posicion === 0) {
      return [];
    }
    return [{ libro, posicion }];
  });

  if (estado === "cargando") {
    return <Cargando texto="Revisando tus reservas…" />;
  }

  return (
    <FlatList
      contentContainerStyle={estilos.lista}
      data={prestamos}
      keyExtractor={(prestamo) => prestamo.isbn}
      ListEmptyComponent={
        <Text style={estilos.vacio}>No tenés préstamos activos.</Text>
      }
      ListHeaderComponent={
        <View style={estilos.cabecera}>
          <Text style={estilos.estadoPermiso}>{TEXTO_PERMISO[estado]}</Text>
          <AvisosBiblioteca alDescartar={descartarAviso} avisos={avisos} />
          <Text style={estilos.subtitulo}>Mis préstamos</Text>
        </View>
      }
      ListFooterComponent={
        <View style={estilos.seccion}>
          <Text style={estilos.subtitulo}>Reservas en espera</Text>
          {misEsperas.length === 0 ? (
            <Text style={estilos.vacio}>
              No estás en ninguna lista de espera.
            </Text>
          ) : (
            misEsperas.map(({ libro, posicion }) => (
              <View key={libro.isbn} style={estilos.espera}>
                <Text style={estilos.tituloEspera}>{libro.titulo}</Text>
                <Text style={estilos.detalleEspera}>Posición {posicion}</Text>
              </View>
            ))
          )}
        </View>
      }
      renderItem={({ item }) => {
        const libro = buscarLibroPorIsbn(item.isbn);
        if (!libro) {
          return null;
        }
        return (
          <FilaPrestamo
            alCambiarRecordar={(valor) => {
              void cambiarRecordar(item, valor);
            }}
            alDevolver={() => {
              void devolver(item.isbn);
            }}
            libro={libro}
            prestamo={item}
          />
        );
      }}
      ItemSeparatorComponent={Separador}
    />
  );
}

function Separador() {
  return <View style={estilos.separador} />;
}

const estilos = StyleSheet.create({
  lista: {
    padding: ESPACIOS.md,
    paddingBottom: ESPACIOS.xl,
  },
  cabecera: {
    gap: ESPACIOS.md,
    marginBottom: ESPACIOS.md,
  },
  estadoPermiso: {
    color: COLORES.textoSuave,
    fontSize: TIPOGRAFIA.detalle,
  },
  subtitulo: {
    color: COLORES.textoSuave,
    fontSize: TIPOGRAFIA.detalle,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  vacio: {
    color: COLORES.textoSuave,
    fontSize: TIPOGRAFIA.cuerpo,
  },
  seccion: {
    gap: ESPACIOS.sm,
    marginTop: ESPACIOS.lg,
  },
  espera: {
    backgroundColor: COLORES.superficie,
    borderColor: COLORES.borde,
    borderRadius: RADIOS.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: ESPACIOS.md,
  },
  tituloEspera: {
    color: COLORES.texto,
    fontSize: TIPOGRAFIA.cuerpo,
    fontWeight: "600",
  },
  detalleEspera: {
    color: COLORES.textoSuave,
    fontSize: TIPOGRAFIA.detalle,
  },
  separador: {
    height: ESPACIOS.sm,
  },
});
