import {
  AndroidImportance,
  SchedulableTriggerInputTypes,
  cancelScheduledNotificationAsync,
  scheduleNotificationAsync,
  setNotificationChannelAsync,
  setNotificationHandler,
} from "expo-notifications";
import { Platform } from "react-native";

import { CANAL_PRESTAMOS, SEGUNDOS_RECORDATORIO } from "@/constants/config";
import type { Libro } from "@/types";

/** Sin esto, una notificación local no se muestra con la app abierta. */
export function configurarNotificaciones(): void {
  setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

/**
 * Android 13+ exige el canal creado antes de pedir el permiso; si se crea
 * después, el diálogo del sistema ya perdió el contexto de la notificación.
 */
export async function prepararCanalPrestamos(): Promise<void> {
  if (Platform.OS !== "android") {
    return;
  }
  await setNotificationChannelAsync(CANAL_PRESTAMOS, {
    name: "Recordatorios de devolución",
    importance: AndroidImportance.DEFAULT,
  });
}

export async function programarRecordatorio(libro: Libro): Promise<string> {
  return scheduleNotificationAsync({
    content: {
      title: "Devolvé el libro",
      body: `"${libro.titulo}" vence pronto. Pasá por la biblioteca.`,
      data: { isbn: libro.isbn },
    },
    trigger: {
      type: SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: SEGUNDOS_RECORDATORIO,
      channelId: CANAL_PRESTAMOS,
    },
  });
}

export async function programarAvisoRetiro(libro: Libro): Promise<string> {
  return scheduleNotificationAsync({
    content: {
      title: "Te toca retirar",
      body: `"${libro.titulo}" te está esperando en el mostrador.`,
      data: { isbn: libro.isbn },
    },
    trigger: {
      type: SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 1,
      channelId: CANAL_PRESTAMOS,
    },
  });
}

export async function cancelarRecordatorio(id: string | null): Promise<void> {
  if (!id) {
    return;
  }
  await cancelScheduledNotificationAsync(id);
}
