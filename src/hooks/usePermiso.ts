import type { PermissionResponse } from "expo";
import { useCameraPermissions } from "expo-camera";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";

import type { EstadoPermiso, RecursoPermiso } from "@/types";

export type UsePermiso = {
  estado: EstadoPermiso;
  pedir: () => Promise<EstadoPermiso>;
  refrescar: () => Promise<EstadoPermiso>;
};

function estadoDesde(respuesta: PermissionResponse | null): EstadoPermiso {
  if (!respuesta) {
    return "cargando";
  }
  if (respuesta.granted) {
    return "concedido";
  }
  // `status === "denied"` no alcanza: solo `canAskAgain` dice si el sistema
  // todavía puede mostrar el diálogo o si hay que mandar a Ajustes.
  return respuesta.canAskAgain ? "preguntable" : "bloqueado";
}

export function usePermiso(recurso: RecursoPermiso): UsePermiso {
  const [permisoCamara, pedirCamara, consultarCamara] = useCameraPermissions();
  const [permisoNotificaciones, setPermisoNotificaciones] =
    useState<PermissionResponse | null>(null);
  const [consultaFallida, setConsultaFallida] = useState(false);

  const esCamara = recurso === "camara";

  useEffect(() => {
    if (esCamara) {
      return;
    }

    let vigente = true;

    Notifications.getPermissionsAsync()
      .then((respuesta) => {
        if (vigente) {
          setPermisoNotificaciones(respuesta);
        }
      })
      .catch(() => {
        if (vigente) {
          setConsultaFallida(true);
        }
      });

    return () => {
      vigente = false;
    };
  }, [esCamara]);

  const respuesta = esCamara ? permisoCamara : permisoNotificaciones;
  const estado: EstadoPermiso = respuesta
    ? estadoDesde(respuesta)
    : consultaFallida
      ? "preguntable"
      : "cargando";

  const pedir = async (): Promise<EstadoPermiso> => {
    const nueva = esCamara
      ? await pedirCamara()
      : await Notifications.requestPermissionsAsync();
    if (!esCamara) {
      setPermisoNotificaciones(nueva);
    }
    return estadoDesde(nueva);
  };

  const refrescar = async (): Promise<EstadoPermiso> => {
    const nueva = esCamara
      ? await consultarCamara()
      : await Notifications.getPermissionsAsync();
    if (!esCamara) {
      setPermisoNotificaciones(nueva);
    }
    return estadoDesde(nueva);
  };

  return { estado, pedir, refrescar };
}
