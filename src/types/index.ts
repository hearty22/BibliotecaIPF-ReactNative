export type Libro = {
  isbn: string; // 13 dígitos, sin guiones
  titulo: string;
  autor: string;
  anio: number;
  ejemplares: number; // ejemplares en el estante al iniciar la app
};

export type Prestamo = {
  isbn: string;
  /** Fecha de devolución en formato ISO, calculada al reservar. */
  vence: string;
  recordar: boolean;
  recordatorioId: string | null;
};

export type Aviso = {
  id: string;
  texto: string;
};

export type RecursoPermiso = "camara" | "notificaciones";

/** Los cuatro estados que puede mostrar la pantalla previa de permisos. */
export type EstadoPermiso = "cargando" | "concedido" | "preguntable" | "bloqueado";

export type ResultadoReserva =
  | { tipo: "prestamo"; vence: string }
  | { tipo: "espera"; posicion: number }
  | { tipo: "duplicado" };
