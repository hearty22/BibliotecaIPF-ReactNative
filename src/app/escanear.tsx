import { type BarcodeScanningResult, CameraView } from "expo-camera";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Linking, ScrollView, StyleSheet, Text, View } from "react-native";

import { Boton } from "@/components/Boton";
import { Cargando } from "@/components/Cargando";
import { CampoTexto } from "@/components/CampoTexto";
import { MensajeEstado } from "@/components/MensajeEstado";
import { MS_ENTRE_LECTURAS } from "@/constants/config";
import {
  COLORES,
  ESPACIOS,
  RADIOS,
  TIPOGRAFIA,
} from "@/constants/tema";
import { usePermiso } from "@/hooks/usePermiso";
import { buscarLibroPorIsbn, esIsbnValido } from "@/lib/catalogo";

export default function Escanear() {
  const { estado, refrescar } = usePermiso("camara");
  const [manual, setManual] = useState("");
  const [mensaje, setMensaje] = useState<string | null>(null);
  const navegando = useRef(false);
  const ultimoAviso = useRef<{ codigo: string; cuando: number } | null>(null);
  const router = useRouter();

  // Al volver de Ajustes o de la pantalla previa, el permiso se relee.
  useFocusEffect(
    useCallback(() => {
      void refrescar();
    }, [refrescar]),
  );

  const abrirLibro = (isbn: string) => {
    if (navegando.current) {
      return;
    }
    if (!buscarLibroPorIsbn(isbn)) {
      setMensaje(`El ISBN ${isbn} no está en el catálogo. Podés seguir escaneando.`);
      return;
    }
    navegando.current = true;
    setMensaje(null);
    router.replace(`/libro/${isbn}`);
  };

  const alEscanear = ({ data }: BarcodeScanningResult) => {
    const ahora = Date.now();
    const ultimo = ultimoAviso.current;
    if (ultimo && ultimo.codigo === data && ahora - ultimo.cuando < MS_ENTRE_LECTURAS) {
      return;
    }
    ultimoAviso.current = { codigo: data, cuando: ahora };
    abrirLibro(data);
  };

  const abrirManual = () => {
    if (!esIsbnValido(manual)) {
      setMensaje("El ISBN tiene que tener 13 dígitos, sin guiones ni espacios.");
      return;
    }
    abrirLibro(manual);
  };

  if (estado === "cargando") {
    return <Cargando texto="Revisando el permiso de cámara…" />;
  }

  return (
    <ScrollView contentContainerStyle={estilos.contenido}>
      {estado === "concedido" ? (
        <CameraView
          barcodeScannerSettings={{ barcodeTypes: ["ean13"] }}
          facing="back"
          onBarcodeScanned={alEscanear}
          style={estilos.camara}
        />
      ) : (
        <View style={estilos.avisoCamara}>
          <Text style={estilos.tituloAviso}>
            {estado === "bloqueado"
              ? "La cámara está bloqueada"
              : "Necesitamos tu cámara"}
          </Text>
          <Text style={estilos.textoAviso}>
            Usamos la cámara para leer el código de barras del libro. Si preferís,
            escribí el ISBN a mano acá abajo.
          </Text>
          <Boton
            onPress={() => {
              if (estado === "bloqueado") {
                void Linking.openSettings();
                return;
              }
              router.push("/permisos/camara");
            }}
            titulo={estado === "bloqueado" ? "Abrir Ajustes" : "Continuar"}
          />
        </View>
      )}

      {mensaje && <MensajeEstado mensaje={mensaje} />}

      <View style={estilos.manual}>
        <CampoTexto
          etiqueta="ISBN del libro"
          marcador="9789507310003"
          maximo={13}
          tipoTeclado="number-pad"
          alCambiar={setManual}
          alEnviar={abrirManual}
          valor={manual}
        />
        <Boton onPress={abrirManual} titulo="Abrir libro" variante="secundario" />
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenido: {
    gap: ESPACIOS.md,
    padding: ESPACIOS.md,
  },
  camara: {
    borderRadius: RADIOS.md,
    height: 280,
    overflow: "hidden",
  },
  avisoCamara: {
    backgroundColor: COLORES.superficie,
    borderColor: COLORES.borde,
    borderRadius: RADIOS.md,
    borderWidth: StyleSheet.hairlineWidth,
    gap: ESPACIOS.sm,
    padding: ESPACIOS.md,
  },
  tituloAviso: {
    color: COLORES.texto,
    fontSize: TIPOGRAFIA.subtitulo,
    fontWeight: "600",
  },
  textoAviso: {
    color: COLORES.textoSuave,
    fontSize: TIPOGRAFIA.cuerpo,
  },
  manual: {
    gap: ESPACIOS.sm,
  },
});
