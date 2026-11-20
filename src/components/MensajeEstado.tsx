import { StyleSheet, Text, View } from "react-native";

import { COLORES, ESPACIOS, TIPOGRAFIA } from "@/constants/tema";

type Props = {
  mensaje: string;
};

/** Mensaje en español para la persona usuaria, nunca el texto crudo del error. */
export function MensajeEstado({ mensaje }: Props) {
  return (
    <View style={estilos.contenedor} accessibilityRole="alert">
      <Text style={estilos.texto}>{mensaje}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    backgroundColor: COLORES.peligroSuave,
    borderRadius: 12,
    padding: ESPACIOS.md,
  },
  texto: {
    color: COLORES.peligro,
    fontSize: TIPOGRAFIA.cuerpo,
  },
});
