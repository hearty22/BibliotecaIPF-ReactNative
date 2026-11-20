import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { Boton } from "@/components/Boton";
import { MensajeEstado } from "@/components/MensajeEstado";
import { Tarjeta } from "@/components/Tarjeta";
import { DIAS_PRESTAMO } from "@/constants/config";
import { COLORES, ESPACIOS, TIPOGRAFIA } from "@/constants/tema";
import { useBiblioteca } from "@/context/BibliotecaContext";
import { buscarLibroPorIsbn, normalizarParametro } from "@/lib/catalogo";
import { fechaEnDias, formatearFecha } from "@/lib/formato";

export default function ConfirmarReserva() {
  const { isbn } = useLocalSearchParams<{ isbn: string }>();
  const codigo = normalizarParametro(isbn);
  const libro = buscarLibroPorIsbn(codigo);
  const { disponibles, esperas, reservar } = useBiblioteca();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (!libro) {
    return (
      <View style={estilos.contenido}>
        <MensajeEstado mensaje="Ese libro no está en el catálogo de la biblioteca." />
        <Link href="/" style={estilos.enlace}>
          Volver al catálogo
        </Link>
      </View>
    );
  }

  const copias = disponibles(libro);
  const esperando = esperas[libro.isbn]?.length ?? 0;

  const confirmar = () => {
    const resultado = reservar(libro);
    if (resultado.tipo === "duplicado") {
      setError("Ya tenés este libro reservado o estás en su lista de espera.");
      return;
    }
    // Cierra el modal y deja /reservas como pantalla visible: "atrás" no
    // vuelve a la confirmación.
    router.dismissTo("/reservas");
  };

  return (
    <ScrollView contentContainerStyle={estilos.contenido}>
      <Tarjeta titulo={libro.titulo}>
        <Text style={estilos.autor}>
          {libro.autor} · {libro.anio}
        </Text>
      </Tarjeta>

      {copias > 0 ? (
        <Text style={estilos.detalle}>
          Hay {copias} {copias === 1 ? "ejemplar" : "ejemplares"}. El préstamo dura{" "}
          {DIAS_PRESTAMO} días y vence el{" "}
          {formatearFecha(fechaEnDias(DIAS_PRESTAMO))}.
        </Text>
      ) : (
        <Text style={estilos.detalle}>
          No quedan ejemplares. Si confirmás, entrás en la lista de espera en la
          posición {esperando + 1}.
        </Text>
      )}

      {error && <MensajeEstado mensaje={error} />}

      <Boton onPress={confirmar} titulo="Confirmar" />
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenido: {
    gap: ESPACIOS.md,
    padding: ESPACIOS.md,
  },
  autor: {
    color: COLORES.textoSuave,
    fontSize: TIPOGRAFIA.cuerpo,
  },
  detalle: {
    color: COLORES.texto,
    fontSize: TIPOGRAFIA.cuerpo,
    lineHeight: 21,
  },
  enlace: {
    color: COLORES.primario,
    fontSize: TIPOGRAFIA.cuerpo,
    fontWeight: "600",
    minHeight: 44,
    paddingVertical: ESPACIOS.sm,
  },
});
