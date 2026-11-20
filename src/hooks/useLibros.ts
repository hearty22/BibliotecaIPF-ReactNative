import { useEffect, useState } from "react";

import { obtenerLibros } from "@/lib/api";
import type { Libro } from "@/types";

const MENSAJE_ERROR =
  "No pudimos cargar el catálogo. Probá de nuevo en unos segundos.";

type Fase =
  | { nombre: "cargando"; intento: number }
  | { nombre: "listo"; intento: number; libros: Libro[] }
  | { nombre: "error"; intento: number };

export type UseLibros = {
  libros: Libro[];
  cargando: boolean;
  error: string | null;
  reintentar: () => void;
};

export function useLibros(): UseLibros {
  const [fase, setFase] = useState<Fase>({ nombre: "cargando", intento: 0 });

  useEffect(() => {
    let vigente = true;

    obtenerLibros()
      .then((datos) => {
        if (vigente) {
          setFase({ nombre: "listo", intento: fase.intento, libros: datos });
        }
      })
      .catch(() => {
        if (vigente) {
          setFase({ nombre: "error", intento: fase.intento });
        }
      });

    // La limpieza descarta la respuesta de un pedido que ya no importa.
    return () => {
      vigente = false;
    };
  }, [fase.intento]);

  const reintentar = () => {
    setFase((previa) => ({ nombre: "cargando", intento: previa.intento + 1 }));
  };

  return {
    libros: fase.nombre === "listo" ? fase.libros : [],
    cargando: fase.nombre === "cargando",
    error: fase.nombre === "error" ? MENSAJE_ERROR : null,
    reintentar,
  };
}
