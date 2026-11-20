import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { COLORES, ESPACIOS, TIPOGRAFIA } from "@/constants/tema";

type Props = {
  texto: string;
};

export function Cargando({ texto }: Props) {
  return (
    <View style={estilos.contenedor}>
      <ActivityIndicator color={COLORES.primario} size="large" />
      <Text style={estilos.texto}>{texto}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    alignItems: "center",
    justifyContent: "center",
    gap: ESPACIOS.sm,
    padding: ESPACIOS.xl,
  },
  texto: {
    color: COLORES.textoSuave,
    fontSize: TIPOGRAFIA.cuerpo,
  },
});
