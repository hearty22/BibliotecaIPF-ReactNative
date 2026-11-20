import { useRouter } from "expo-router";
import { FlatList, StyleSheet, View } from "react-native";

import { Boton } from "@/components/Boton";
import { Cargando } from "@/components/Cargando";
import { EncabezadoCatalogo } from "@/components/EncabezadoCatalogo";
import { FilaLibro } from "@/components/FilaLibro";
import { MensajeEstado } from "@/components/MensajeEstado";
import { MAX_RECIENTES } from "@/constants/config";
import { ESPACIOS } from "@/constants/tema";
import { useBiblioteca } from "@/context/BibliotecaContext";
import { useLibros } from "@/hooks/useLibros";
import type { Libro } from "@/types";

export default function Catalogo() {
  const { libros, cargando, error, reintentar } = useLibros();
  const { recientes, disponibles, estaEnEspera } = useBiblioteca();
  const router = useRouter();

  const abrirLibro = (isbn: string) => {
    router.push(`/libro/${isbn}`);
  };

  if (cargando) {
    return <Cargando texto="Cargando el catálogo…" />;
  }

  if (error) {
    return (
      <View style={estilos.error}>
        <MensajeEstado mensaje={error} />
        <Boton onPress={reintentar} titulo="Reintentar" />
      </View>
    );
  }

  const renderizarLibro = ({ item }: { item: Libro }) => (
    <FilaLibro
      disponibles={disponibles(item)}
      enEspera={estaEnEspera(item.isbn)}
      libro={item}
      onPress={() => abrirLibro(item.isbn)}
    />
  );

  return (
    <FlatList
      contentContainerStyle={estilos.lista}
      data={libros}
      keyExtractor={(libro) => libro.isbn}
      ListEmptyComponent={
        <MensajeEstado mensaje="La biblioteca todavía no tiene libros cargados." />
      }
      ListHeaderComponent={
        <EncabezadoCatalogo
          alAbrirLibro={abrirLibro}
          alBuscar={() => router.push("/buscar")}
          alEscanear={() => router.push("/escanear")}
          recientes={recientes.slice(0, MAX_RECIENTES)}
        />
      }
      renderItem={renderizarLibro}
    />
  );
}

const estilos = StyleSheet.create({
  lista: {
    gap: ESPACIOS.sm,
    paddingBottom: ESPACIOS.xl,
    paddingHorizontal: ESPACIOS.md,
  },
  error: {
    gap: ESPACIOS.md,
    padding: ESPACIOS.md,
  },
});
