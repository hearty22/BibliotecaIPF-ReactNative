import { StyleSheet, Switch, Text, View } from "react-native";

import { Boton } from "@/components/Boton";
import { COLORES, ESPACIOS, RADIOS, TIPOGRAFIA } from "@/constants/tema";
import { formatearFecha } from "@/lib/formato";
import type { Libro, Prestamo } from "@/types";

type Props = {
  libro: Libro;
  prestamo: Prestamo;
  alDevolver: () => void;
  alCambiarRecordar: (valor: boolean) => void;
};

export function FilaPrestamo({
  libro,
  prestamo,
  alDevolver,
  alCambiarRecordar,
}: Props) {
  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.titulo}>{libro.titulo}</Text>
      <Text style={estilos.vencimiento}>
        Devolver antes del {formatearFecha(prestamo.vence)}
      </Text>

      <View style={estilos.interruptor}>
        <Text style={estilos.etiqueta}>Recordarme</Text>
        <Switch
          accessibilityLabel={`Recordarme para ${libro.titulo}`}
          accessibilityRole="switch"
          onValueChange={alCambiarRecordar}
          thumbColor={COLORES.superficie}
          trackColor={{ false: COLORES.borde, true: COLORES.primario }}
          value={prestamo.recordar}
        />
      </View>

      <Boton onPress={alDevolver} titulo="Devolver" variante="peligro" />
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
  vencimiento: {
    color: COLORES.textoSuave,
    fontSize: TIPOGRAFIA.detalle,
  },
  interruptor: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 44,
  },
  etiqueta: {
    color: COLORES.texto,
    fontSize: TIPOGRAFIA.cuerpo,
  },
});
