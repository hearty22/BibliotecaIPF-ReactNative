import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { Cargando } from "@/components/Cargando";
import { CampoTexto } from "@/components/CampoTexto";
import { FilaLibro } from "@/components/FilaLibro";
import { MensajeEstado } from "@/components/MensajeEstado";
import { MS_DEBOUNCE_BUSQUEDA } from "@/constants/config";
import { COLORES, ESPACIOS, TIPOGRAFIA } from "@/constants/tema";
import { useBiblioteca } from "@/context/BibliotecaContext";
import { buscarLibros } from "@/lib/api";
import { normalizarParametro } from "@/lib/catalogo";
import type { Libro } from "@/types";

type Resultado = {
  consulta: string;
  libros: Libro[];
};

export default function Buscar() {
  const { q } = useLocalSearchParams<{ q?: string }>();
  const consulta = normalizarParametro(q);
  const [texto, setTexto] = useState(consulta);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const { disponibles, estaEnEspera } = useBiblioteca();
  const router = useRouter();

  // El texto vive en la URL: cada tecleo se refleja sin apilar pantallas.
  useEffect(() => {
    if (texto === consulta) {
      return;
    }
    const temporizador = setTimeout(() => {
      router.setParams({ q: texto });
    }, MS_DEBOUNCE_BUSQUEDA);
    return () => clearTimeout(temporizador);
  }, [texto, consulta, router]);

  useEffect(() => {
    if (consulta.length === 0) {
      return;
    }

    let vigente = true;

    buscarLibros(consulta)
      .then((datos) => {
        if (vigente) {
          setResultado({ consulta, libros: datos });
        }
      })
      .catch(() => {
        if (vigente) {
          setResultado({ consulta, libros: [] });
        }
      });

    // Solo la última búsqueda puede escribir en pantalla.
    return () => {
      vigente = false;
    };
  }, [consulta]);

  const cargando = consulta.length > 0 && resultado?.consulta !== consulta;
  const libros = resultado?.consulta === consulta ? resultado.libros : [];

  const renderizarLibro = ({ item }: { item: Libro }) => (
    <FilaLibro
      disponibles={disponibles(item)}
      enEspera={estaEnEspera(item.isbn)}
      libro={item}
      onPress={() => router.push(`/libro/${item.isbn}`)}
    />
  );

  return (
    <View style={estilos.contenedor}>
      <CampoTexto
        etiqueta="Título o autor"
        marcador="Por ejemplo: Borges"
        tipoTeclado="default"
        alCambiar={setTexto}
        valor={texto}
      />

      {consulta.length === 0 ? (
        <Text style={estilos.pista}>
          Escribí un título o un autor para buscar en el catálogo.
        </Text>
      ) : cargando ? (
        <Cargando texto="Buscando…" />
      ) : (
        <FlatList
          contentContainerStyle={estilos.lista}
          data={libros}
          keyExtractor={(libro) => libro.isbn}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <MensajeEstado
              mensaje={`No encontramos libros para "${consulta}".`}
            />
          }
          renderItem={renderizarLibro}
        />
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    gap: ESPACIOS.md,
    padding: ESPACIOS.md,
  },
  pista: {
    color: COLORES.textoSuave,
    fontSize: TIPOGRAFIA.cuerpo,
  },
  lista: {
    gap: ESPACIOS.sm,
    paddingBottom: ESPACIOS.xl,
  },
});
