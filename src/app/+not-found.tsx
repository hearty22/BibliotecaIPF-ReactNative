import { Link, usePathname } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { COLORES, ESPACIOS, TIPOGRAFIA } from "@/constants/tema";

export default function NoEncontrada() {
  const ruta = usePathname();

  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.titulo}>No encontramos esta pantalla</Text>
      <Text style={estilos.ruta}>{ruta}</Text>
      <Link href="/" style={estilos.enlace}>
        Volver al catálogo
      </Link>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    backgroundColor: COLORES.fondo,
    flex: 1,
    gap: ESPACIOS.md,
    justifyContent: "center",
    padding: ESPACIOS.xl,
  },
  titulo: {
    color: COLORES.texto,
    fontSize: TIPOGRAFIA.titulo,
    fontWeight: "700",
  },
  ruta: {
    color: COLORES.textoSuave,
    fontSize: TIPOGRAFIA.cuerpo,
  },
  enlace: {
    color: COLORES.primario,
    fontSize: TIPOGRAFIA.cuerpo,
    fontWeight: "600",
    minHeight: 44,
    paddingVertical: ESPACIOS.sm,
  },
});
