/** Reglas del préstamo y de los recordatorios, en un solo lugar. */
export const DIAS_PRESTAMO = 7;

/** En modo demostración el recordatorio llega a los 15 segundos, no a los 7 días. */
export const SEGUNDOS_RECORDATORIO = 15;

export const CANAL_PRESTAMOS = "prestamos";

export const MAX_RECIENTES = 3;

/** Debounce del buscador: espera sin tecleo antes de consultar. */
export const MS_DEBOUNCE_BUSQUEDA = 300;

/** Ventana para ignorar el mismo código de barras leído dos veces seguidas. */
export const MS_ENTRE_LECTURAS = 3000;

/** Nombre con el que la persona usuaria aparece en las listas de espera. */
export const PERSONA_ACTUAL = "Vos";

/** Credenciales fijas del personal de biblioteca. */
export const PERSONAL = {
  usuario: "biblioteca",
  clave: "ipf2026",
} as const;
