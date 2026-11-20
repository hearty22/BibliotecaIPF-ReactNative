import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";

import { COLORES, TAMANIOS } from "@/constants/tema";

type Props = {
  icono: keyof typeof Ionicons.glyphMap;
  etiqueta: string;
  onPress: () => void;
};

/** Botón de solo ícono: siempre lleva `accessibilityLabel` y 44 × 44 mínimos. */
export function BotonIcono({ icono, etiqueta, onPress }: Props) {
  return (
    <Pressable
      accessibilityLabel={etiqueta}
      accessibilityRole="button"
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [estilos.boton, pressed && estilos.presionado]}
    >
      <Ionicons color={COLORES.primario} name={icono} size={TAMANIOS.icono} />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  boton: {
    alignItems: "center",
    height: TAMANIOS.toque,
    justifyContent: "center",
    width: TAMANIOS.toque,
  },
  presionado: {
    opacity: 0.6,
  },
});
