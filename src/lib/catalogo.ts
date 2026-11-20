import { LIBROS } from "@/data/libros";
import type { Libro } from "@/types";

const FORMATO_ISBN = /^\d{13}$/;

export function esIsbnValido(valor: string): boolean {
  return FORMATO_ISBN.test(valor);
}

/** Los params de ruta llegan como `string | string[] | undefined`. */
export function normalizarParametro(valor: string | string[] | undefined): string {
  if (Array.isArray(valor)) {
    return valor[0]?.trim() ?? "";
  }
  return valor?.trim() ?? "";
}

export function buscarLibroPorIsbn(isbn: string): Libro | undefined {
  return LIBROS.find((libro) => libro.isbn === isbn);
}
