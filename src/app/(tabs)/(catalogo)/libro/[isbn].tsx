import { Link, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { Boton } from "@/components/Boton";
import { MensajeEstado } from "@/components/MensajeEstado";
import { COLORES, ESPACIOS, RADIOS, TIPOGRAFIA } from "@/constants/tema";
import { useBiblioteca } from "@/context/BibliotecaContext";
import { buscarLibroPorIsbn, normalizarParametro } from "@/lib/catalogo";
import { formatearFecha } from "@/lib/formato";

export default function DetalleLibro() {
  const { isbn } = useLocalSearchParams<{ isbn: string }>();
  const codigo = normalizarParametro(isbn);
  const libro = buscarLibroPorIsbn(codigo);
  const {
    disponibles,
    estaEnEspera,
    esperas,
    posicionEnEspera,
    prestamos,
    registrarVisita,
  } = useBiblioteca();
  const router = useRouter();
  const visitado = useRef<string | null>(null);

  useEffect(() => {
    if (!libro || visitado.current === codigo) {
      return;
    }
    visitado.current = codigo;
    registrarVisita(codigo);
  }, [codigo, libro, registrarVisita]);

  if (!libro) {
    return (
      <View style={estilos.centro}>
        <MensajeEstado
          mensaje={
            codigo.length > 0
              ? `El ISBN ${codigo} no está en el catálogo de la biblioteca.`
              : "La dirección no incluye un ISBN válido."
          }
        />
        <Link href="/" style={estilos.enlace}>
          Volver al catálogo
        </Link>
      </View>
    );
  }

  const copias = disponibles(libro);
  const prestamo = prestamos.find((item) => item.isbn === libro.isbn);
  const enEspera = estaEnEspera(libro.isbn);
  const personas = esperas[libro.isbn]?.length ?? 0;

  return (
    <ScrollView contentContainerStyle={estilos.contenido}>
      <Stack.Screen options={{ title: libro.titulo }} />
      <Text style={estilos.titulo}>{libro.titulo}</Text>
      <Text style={estilos.autor}>{libro.autor}</Text>

      <View style={estilos.datos}>
        <Text style={estilos.dato}>Año: {libro.anio}</Text>
        <Text style={estilos.dato}>
          Ejemplares disponibles: {copias > 0 ? copias : "ninguno"}
        </Text>
        <Text style={estilos.dato}>
          Personas en lista de espera: {personas}
        </Text>
      </View>

      {prestamo && (
        <Text style={estilos.aviso}>
          Ya tenés este libro. Devolvelo antes del {formatearFecha(prestamo.vence)}.
        </Text>
      )}
      {enEspera && (
        <Text style={estilos.aviso}>
          Estás en la lista de espera: posición {posicionEnEspera(libro.isbn)}.
        </Text>
      )}

      <Boton
        deshabilitado={Boolean(prestamo) || enEspera}
        onPress={() => router.push(`/reservar/${libro.isbn}`)}
        titulo="Reservar"
      />
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenido: {
    gap: ESPACIOS.md,
    padding: ESPACIOS.md,
  },
  centro: {
    gap: ESPACIOS.md,
    padding: ESPACIOS.md,
  },
  titulo: {
    color: COLORES.texto,
    fontSize: TIPOGRAFIA.titulo,
    fontWeight: "700",
  },
  autor: {
    color: COLORES.textoSuave,
    fontSize: TIPOGRAFIA.subtitulo,
  },
  datos: {
    backgroundColor: COLORES.superficie,
    borderColor: COLORES.borde,
    borderRadius: RADIOS.md,
    borderWidth: StyleSheet.hairlineWidth,
    gap: ESPACIOS.sm,
    padding: ESPACIOS.md,
  },
  dato: {
    color: COLORES.texto,
    fontSize: TIPOGRAFIA.cuerpo,
  },
  aviso: {
    backgroundColor: COLORES.alertaSuave,
    borderRadius: RADIOS.md,
    color: COLORES.alerta,
    fontSize: TIPOGRAFIA.cuerpo,
    padding: ESPACIOS.md,
  },
  enlace: {
    color: COLORES.primario,
    fontSize: TIPOGRAFIA.cuerpo,
    fontWeight: "600",
    minHeight: 44,
    paddingVertical: ESPACIOS.sm,
  },
});
