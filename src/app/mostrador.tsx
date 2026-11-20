import { FlatList, StyleSheet, Text, View } from "react-native";

import { Boton } from "@/components/Boton";
import { Separador } from "@/components/Separador";
import { COLORES, ESPACIOS, RADIOS, TIPOGRAFIA } from "@/constants/tema";
import { useBiblioteca } from "@/context/BibliotecaContext";
import { LIBROS } from "@/data/libros";

export default function Mostrador() {
  const { cerrarSesion, entregarSiguiente, esperas } = useBiblioteca();
  const libros = LIBROS.filter((libro) => (esperas[libro.isbn]?.length ?? 0) > 0);

  return (
    <FlatList
      contentContainerStyle={estilos.lista}
      data={libros}
      keyExtractor={(libro) => libro.isbn}
      ListEmptyComponent={
        <Text style={estilos.vacio}>
          No hay listas de espera: no queda nadie para atender.
        </Text>
      }
      ListFooterComponent={
        <View style={estilos.pie}>
          <Boton onPress={cerrarSesion} titulo="Cerrar sesión" variante="secundario" />
        </View>
      }
      renderItem={({ item }) => {
        const personas = esperas[item.isbn] ?? [];
        return (
          <View style={estilos.fila}>
            <Text style={estilos.titulo}>{item.titulo}</Text>
            <Text style={estilos.detalle}>Al frente: {personas[0]}</Text>
            <Text style={estilos.detalle}>
              {personas.length}{" "}
              {personas.length === 1 ? "persona espera" : "personas esperan"}
            </Text>
            <Boton
              onPress={() => {
                void entregarSiguiente(item.isbn);
              }}
              titulo="Entregar al siguiente"
            />
          </View>
        );
      }}
      ItemSeparatorComponent={Separador}
    />
  );
}

const estilos = StyleSheet.create({
  lista: {
    padding: ESPACIOS.md,
    paddingBottom: ESPACIOS.xl,
  },
  fila: {
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
  detalle: {
    color: COLORES.textoSuave,
    fontSize: TIPOGRAFIA.detalle,
  },
  vacio: {
    color: COLORES.textoSuave,
    fontSize: TIPOGRAFIA.cuerpo,
  },
  pie: {
    marginTop: ESPACIOS.lg,
  },
});
