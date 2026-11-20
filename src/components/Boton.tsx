import { Pressable, StyleSheet, Text } from "react-native";

import { COLORES, ESPACIOS, RADIOS, TAMANIOS, TIPOGRAFIA } from "@/constants/tema";

type Variante = "primario" | "secundario" | "peligro";

type Props = {
  titulo: string;
  onPress: () => void;
  variante?: Variante;
  deshabilitado?: boolean;
  etiquetaAccesible?: string;
};

export function Boton({
  titulo,
  onPress,
  variante = "primario",
  deshabilitado = false,
  etiquetaAccesible,
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={etiquetaAccesible ?? titulo}
      accessibilityState={{ disabled: deshabilitado }}
      disabled={deshabilitado}
      onPress={onPress}
      style={({ pressed }) => [
        estilos.base,
        estilos[variante],
        pressed && !deshabilitado && estilos.presionado,
        deshabilitado && estilos.deshabilitado,
      ]}
    >
      <Text style={[estilos.texto, estilos[`texto${variante}`]]}>{titulo}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    minHeight: TAMANIOS.toque,
    borderRadius: RADIOS.md,
    paddingHorizontal: ESPACIOS.md,
    paddingVertical: ESPACIOS.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  primario: {
    backgroundColor: COLORES.primario,
  },
  secundario: {
    backgroundColor: COLORES.primarioSuave,
  },
  peligro: {
    backgroundColor: COLORES.peligroSuave,
  },
  presionado: {
    opacity: 0.75,
  },
  deshabilitado: {
    opacity: 0.45,
  },
  texto: {
    fontSize: TIPOGRAFIA.cuerpo,
    fontWeight: "600",
  },
  textoprimario: {
    color: COLORES.superficie,
  },
  textosecundario: {
    color: COLORES.primario,
  },
  textopeligro: {
    color: COLORES.peligro,
  },
});
