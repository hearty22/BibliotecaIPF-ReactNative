import { StyleSheet, Text, View } from "react-native";

import { Boton } from "@/components/Boton";
import { COLORES, ESPACIOS, RADIOS, TIPOGRAFIA } from "@/constants/tema";
import type { Aviso } from "@/types";

type Props = {
  avisos: Aviso[];
  alDescartar: (id: string) => void;
};

export function AvisosBiblioteca({ avisos, alDescartar }: Props) {
  if (avisos.length === 0) {
    return null;
  }

  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.titulo}>Avisos de la biblioteca</Text>
      {avisos.map((aviso) => (
        <View key={aviso.id} style={estilos.aviso}>
          <Text style={estilos.texto}>{aviso.texto}</Text>
          <Boton
            onPress={() => alDescartar(aviso.id)}
            titulo="Entendido"
            variante="secundario"
          />
        </View>
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    gap: ESPACIOS.sm,
  },
  titulo: {
    color: COLORES.textoSuave,
    fontSize: TIPOGRAFIA.detalle,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  aviso: {
    backgroundColor: COLORES.primarioSuave,
    borderRadius: RADIOS.md,
    gap: ESPACIOS.sm,
    padding: ESPACIOS.md,
  },
  texto: {
    color: COLORES.texto,
    fontSize: TIPOGRAFIA.cuerpo,
  },
});
