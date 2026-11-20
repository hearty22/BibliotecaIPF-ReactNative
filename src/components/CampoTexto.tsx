import { StyleSheet, TextInput, Text, View, type KeyboardTypeOptions } from "react-native";

import { COLORES, ESPACIOS, RADIOS, TIPOGRAFIA } from "@/constants/tema";

type Props = {
  etiqueta: string;
  valor: string;
  alCambiar: (texto: string) => void;
  marcador?: string;
  tipoTeclado?: KeyboardTypeOptions;
  maximo?: number;
  seguro?: boolean;
  alEnviar?: () => void;
};

export function CampoTexto({
  etiqueta,
  valor,
  alCambiar,
  marcador,
  tipoTeclado = "default",
  maximo,
  seguro = false,
  alEnviar,
}: Props) {
  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>
      <TextInput
        accessibilityLabel={etiqueta}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType={tipoTeclado}
        maxLength={maximo}
        onChangeText={alCambiar}
        onSubmitEditing={alEnviar}
        placeholder={marcador}
        placeholderTextColor={COLORES.textoSuave}
        secureTextEntry={seguro}
        style={estilos.campo}
        value={valor}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    gap: ESPACIOS.xs,
  },
  etiqueta: {
    color: COLORES.textoSuave,
    fontSize: TIPOGRAFIA.detalle,
    fontWeight: "600",
  },
  campo: {
    backgroundColor: COLORES.superficie,
    borderColor: COLORES.borde,
    borderRadius: RADIOS.md,
    borderWidth: 1,
    color: COLORES.texto,
    fontSize: TIPOGRAFIA.cuerpo,
    minHeight: 44,
    paddingHorizontal: ESPACIOS.md,
    paddingVertical: ESPACIOS.sm,
  },
});
