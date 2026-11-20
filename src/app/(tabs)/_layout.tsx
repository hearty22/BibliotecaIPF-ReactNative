import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import { COLORES } from "@/constants/tema";

// Ancla la tab de Catálogo: un deep link a /buscar deja las pestañas debajo.
export const unstable_settings = {
  anchor: "(catalogo)",
};

export default function TabsLayout() {
  return (
    <Tabs
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
