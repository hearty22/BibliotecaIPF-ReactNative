import { Pressable, StyleSheet, Text, View } from "react-native";

import { COLORES, ESPACIOS, RADIOS, TIPOGRAFIA } from "@/constants/tema";
import type { Libro } from "@/types";

type Props = {
  libro: Libro;
  disponibles: number;
  enEspera: boolean;
  onPress: () => void;
};

export function FilaLibro({ libro, disponibles, enEspera, onPress }: Props) {
  const estado =
    disponibles > 0
      ? `${disponibles} ${disponibles === 1 ? "ejemplar" : "ejemplares"}`
      : enEspera
        ? "Estás en la lista de espera"
        : "Sin ejemplares";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${libro.titulo}, de ${libro.autor}. ${estado}`}
      onPress={onPress}
      style={({ pressed }) => [estilos.contenedor, pressed && estilos.presionado]}
    >
      <Text style={estilos.titulo}>{libro.titulo}</Text>
      <Text style={estilos.autor}>
        {libro.autor} · {libro.anio}
      </Text>
      <View
        style={[
          estilos.etiqueta,
          disponibles > 0 ? estilos.etiquetaDisponible : estilos.etiquetaSinCopias,
        ]}
      >
        <Text
          style={[
            estilos.textoEtiqueta,
            disponibles > 0 ? estilos.textoDisponible : estilos.textoSinCopias,
          ]}
        >
          {estado}
        </Text>
      </View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    backgroundColor: COLORES.superficie,
    borderRadius: RADIOS.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORES.borde,
    padding: ESPACIOS.md,
    gap: ESPACIOS.xs,
  },
  presionado: {
    opacity: 0.7,
  },
  titulo: {
    color: COLORES.texto,
    fontSize: TIPOGRAFIA.subtitulo,
    fontWeight: "600",
  },
  autor: {
    color: COLORES.textoSuave,
    fontSize: TIPOGRAFIA.detalle,
  },
  etiqueta: {
    alignSelf: "flex-start",
    borderRadius: RADIOS.sm,
    marginTop: ESPACIOS.xs,
    paddingHorizontal: ESPACIOS.sm,
    paddingVertical: 2,
  },
  etiquetaDisponible: {
    backgroundColor: COLORES.exitoSuave,
  },
  etiquetaSinCopias: {
    backgroundColor: COLORES.alertaSuave,
  },
  textoEtiqueta: {
    fontSize: TIPOGRAFIA.detalle,
    fontWeight: "600",
  },
  textoDisponible: {
    color: COLORES.exito,
  },
  textoSinCopias: {
    color: COLORES.alerta,
  },
});
