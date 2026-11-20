import { Stack } from "expo-router";

import { AccesoPersonal } from "@/components/AccesoPersonal";
import { COLORES } from "@/constants/tema";

export default function CatalogoLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: COLORES.fondo },
        headerStyle: { backgroundColor: COLORES.superficie },
        headerTintColor: COLORES.primario,
        headerTitleStyle: { color: COLORES.texto },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Biblioteca IPF",
          headerRight: () => <AccesoPersonal />,
        }}
      />
      <Stack.Screen name="libro/[isbn]" options={{ title: "Detalle" }} />
    </Stack>
  );
}
