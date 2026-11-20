import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import { COLORES } from "@/constants/tema";

// La tab de Catálogo es la que se muestra al abrir la app y al volver con "atrás".
// Según la documentación, el anchor de una tab exige `backBehavior: "initialRoute"`.
// En expo-router 58.0.32 ese warning igual aparece: la prop llega al router pero no
// al chequeo interno. No es un problema de esta configuración.
export const unstable_settings = {
  anchor: "(catalogo)",
};

export default function TabsLayout() {
  return (
    <Tabs
      backBehavior="initialRoute"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORES.primario,
        tabBarInactiveTintColor: COLORES.textoSuave,
        tabBarStyle: {
          backgroundColor: COLORES.superficie,
          borderTopColor: COLORES.borde,
        },
      }}
    >
      <Tabs.Screen
        name="(catalogo)"
        options={{
          title: "Catálogo",
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              color={focused ? COLORES.primario : COLORES.textoSuave}
              name="library-outline"
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="reservas"
        options={{
          title: "Mis reservas",
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              color={focused ? COLORES.primario : COLORES.textoSuave}
              name="bookmark-outline"
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
