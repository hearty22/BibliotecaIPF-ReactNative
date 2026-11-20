import { router } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";

import { COLORES, ESPACIOS, TAMANIOS, TIPOGRAFIA } from "@/constants/tema";
import { useBiblioteca } from "@/context/BibliotecaContext";

/** Acceso del personal desde el header del Catálogo: login o mostrador. */
export function AccesoPersonal() {
  const { sesion } = useBiblioteca();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        router.push(sesion ? "/mostrador" : "/login");
      }}
      style={({ pressed }) => [estilos.boton, pressed && estilos.presionado]}
    >
      <Text style={estilos.texto}>{sesion ? "Mostrador" : "Personal"}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  boton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: TAMANIOS.toque,
    paddingHorizontal: ESPACIOS.md,
  },
  presionado: {
    opacity: 0.6,
  },
  texto: {
    color: COLORES.primario,
    fontSize: TIPOGRAFIA.cuerpo,
    fontWeight: "600",
  },
});
