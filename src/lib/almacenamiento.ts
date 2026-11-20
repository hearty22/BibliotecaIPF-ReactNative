import AsyncStorage from "@react-native-async-storage/async-storage";

import type { Aviso, Prestamo } from "@/types";

const CLAVE = "bibliotecaipf.estado.v1";

export type EstadoPersistido = {
  prestamos: Prestamo[];
  esperas: Record<string, string[]>;
  recientes: string[];
  avisos: Aviso[];
};

function esEstadoPersistido(valor: unknown): valor is EstadoPersistido {
  if (typeof valor !== "object" || valor === null) {
    return false;
  }
  const candidato = valor as Partial<EstadoPersistido>;
  return (
    Array.isArray(candidato.prestamos) &&
    Array.isArray(candidato.recientes) &&
    Array.isArray(candidato.avisos) &&
    typeof candidato.esperas === "object" &&
    candidato.esperas !== null
  );
}

/** Devuelve `null` si no hay nada guardado o si el guardado está corrupto. */
export async function leerEstado(): Promise<EstadoPersistido | null> {
  const crudo = await AsyncStorage.getItem(CLAVE);
  if (!crudo) {
    return null;
  }
  try {
    const valor: unknown = JSON.parse(crudo);
    return esEstadoPersistido(valor) ? valor : null;
  } catch {
    return null;
  }
}

export async function guardarEstado(estado: EstadoPersistido): Promise<void> {
  await AsyncStorage.setItem(CLAVE, JSON.stringify(estado));
}
