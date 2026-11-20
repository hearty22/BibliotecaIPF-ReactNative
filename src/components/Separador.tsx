import { StyleSheet, View } from "react-native";

import { ESPACIOS } from "@/constants/tema";

/** Separación entre filas de una lista. */
export function Separador() {
  return <View style={estilos.separador} />;
}

const estilos = StyleSheet.create({
  separador: {
    height: ESPACIOS.sm,
  },
});
