import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Boton } from "@/components/Boton";
import { COLORES, ESPACIOS, RADIOS, TAMANIOS, TIPOGRAFIA } from "@/constants/tema";
import { buscarLibroPorIsbn } from "@/lib/catalogo";
import type { Libro } from "@/types";

type Props = {
  recientes: string[];
  alBuscar: () => void;
  alEscanear: () => void;
  alAbrirLibro: (isbn: string) => void;
};

export function EncabezadoCatalogo({
  recientes,
  alBuscar,
  alEscanear,
  alAbrirLibro,
}: Props) {
  const librosRecientes = recientes
    .map(buscarLibroPorIsbn)
    .filter((libro): libro is Libro => libro !== undefined);

  return (
    <View style={estilos.contenedor}>
      {librosRecientes.length > 0 && (
        <View style={estilos.seccion}>
          <Text style={estilos.subtitulo}>Vistos recientemente</Text>
          <ScrollView
            contentContainerStyle={estilos.chips}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {librosRecientes.map((libro) => (
              <Pressable
                accessibilityLabel={`Abrir ${libro.titulo}`}
                accessibilityRole="button"
                key={libro.isbn}
                onPress={() => alAbrirLibro(libro.isbn)}
                style={({ pressed }) => [
                  estilos.chip,
                  pressed && estilos.presionado,
                ]}
              >
                <Text numberOfLines={1} style={estilos.textoChip}>
                  {libro.titulo}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={estilos.acciones}>
        <View style={estilos.accion}>
          <Boton titulo="Buscar" onPress={alBuscar} variante="secundario" />
        </View>
        <View style={estilos.accion}>
          <Boton titulo="Escanear" onPress={alEscanear} />
        </View>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    gap: ESPACIOS.md,
    paddingTop: ESPACIOS.md,
  },
  seccion: {
    gap: ESPACIOS.sm,
  },
  subtitulo: {
    color: COLORES.textoSuave,
    fontSize: TIPOGRAFIA.detalle,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  chips: {
    gap: ESPACIOS.sm,
  },
  chip: {
    backgroundColor: COLORES.primarioSuave,
    borderRadius: RADIOS.sm,
    justifyContent: "center",
    minHeight: TAMANIOS.toque,
    paddingHorizontal: ESPACIOS.md,
  },
  presionado: {
    opacity: 0.7,
  },
  textoChip: {
    color: COLORES.primario,
    fontSize: TIPOGRAFIA.cuerpo,
    maxWidth: 200,
  },
  acciones: {
    flexDirection: "row",
    gap: ESPACIOS.sm,
  },
  accion: {
    flex: 1,
  },
});
