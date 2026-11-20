import { StyleSheet, Text, View } from "react-native";
import type { ReactNode } from "react";

import { COLORES, ESPACIOS, RADIOS, TIPOGRAFIA } from "@/constants/tema";

type Props = {
  titulo: string;
  children: ReactNode;
};

export function Tarjeta({ titulo, children }: Props) {
  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.titulo}>{titulo}</Text>
      {children}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    backgroundColor: COLORES.superficie,
    borderColor: COLORES.borde,
    borderRadius: RADIOS.md,
    borderWidth: StyleSheet.hairlineWidth,
    gap: ESPACIOS.sm,
    padding: ESPACIOS.md,
  },
  titulo: {
    color: COLORES.texto,
    fontSize: TIPOGRAFIA.subtitulo,
    fontWeight: "600",
  },
});
