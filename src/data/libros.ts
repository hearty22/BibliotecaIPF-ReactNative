import type { Libro } from "@/types";

export const LIBROS: Libro[] = [
  {
    isbn: "9789507310003",
    titulo: "Cien años de soledad",
    autor: "Gabriel García Márquez",
    anio: 1967,
    ejemplares: 2,
  },
  {
    isbn: "9788437600109",
    titulo: "Rayuela",
    autor: "Julio Cortázar",
    anio: 1963,
    ejemplares: 0,
  },
  {
    isbn: "9788420630205",
    titulo: "Ficciones",
    autor: "Jorge Luis Borges",
    anio: 1944,
    ejemplares: 1,
  },
  {
    isbn: "9788432210303",
    titulo: "La ciudad y los perros",
    autor: "Mario Vargas Llosa",
    anio: 1963,
    ejemplares: 3,
  },
  {
    isbn: "9789500390408",
    titulo: "El túnel",
    autor: "Ernesto Sabato",
    anio: 1948,
    ejemplares: 1,
  },
  {
    isbn: "9789685200509",
    titulo: "Pedro Páramo",
    autor: "Juan Rulfo",
    anio: 1955,
    ejemplares: 0,
  },
  {
    isbn: "9789500710602",
    titulo: "La casa de los espíritus",
    autor: "Isabel Allende",
    anio: 1982,
    ejemplares: 2,
  },
  {
    isbn: "9788420460703",
    titulo: "Ensayo sobre la ceguera",
    autor: "José Saramago",
    anio: 1995,
    ejemplares: 1,
  },
  {
    isbn: "9789871130801",
    titulo: "El amor en los tiempos del cólera",
    autor: "Gabriel García Márquez",
    anio: 1985,
    ejemplares: 2,
  },
  {
    isbn: "9789500420907",
    titulo: "Bestiario",
    autor: "Julio Cortázar",
    anio: 1951,
    ejemplares: 1,
  },
  {
    isbn: "9788497591003",
    titulo: "El Aleph",
    autor: "Jorge Luis Borges",
    anio: 1949,
    ejemplares: 1,
  },
  {
    isbn: "9789500421102",
    titulo: "Santa Evita",
    autor: "Tomás Eloy Martínez",
    anio: 1995,
    ejemplares: 1,
  },
  {
    isbn: "9788437601205",
    titulo: "Los premios",
    autor: "Julio Cortázar",
    anio: 1960,
    ejemplares: 1,
  },
  {
    isbn: "9788401241307",
    titulo: "Yo el Supremo",
    autor: "Augusto Roa Bastos",
    anio: 1974,
    ejemplares: 1,
  },
  {
    isbn: "9789875661400",
    titulo: "La invención de Morel",
    autor: "Adolfo Bioy Casares",
    anio: 1940,
    ejemplares: 2,
  },
  {
    isbn: "9789500391504",
    titulo: "Martín Fierro",
    autor: "José Hernández",
    anio: 1872,
    ejemplares: 3,
  },
  {
    isbn: "9788420411606",
    titulo: "Respiración artificial",
    autor: "Ricardo Piglia",
    anio: 1980,
    ejemplares: 1,
  },
  {
    isbn: "9789507311703",
    titulo: "Zama",
    autor: "Antonio Di Benedetto",
    anio: 1956,
    ejemplares: 2,
  },
];

/**
 * Listas de espera con las que arranca la biblioteca (personas que ya estaban
 * anotadas antes de abrir la app). La app se suma al final de cada cola.
 */
export const ESPERA_INICIAL: Record<string, string[]> = {
  "9788437600109": ["Ana Quiroga", "Bruno Salas"],
  "9789685200509": ["Carla Méndez"],
};
