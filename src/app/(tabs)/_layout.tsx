import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import { COLORES } from "@/constants/tema";

// El anchor que deja las tabs debajo de un deep link a /buscar o /escanear vive en
// el layout raíz (src/app/_layout.tsx). Declararlo acá con `anchor: "(catalogo)"`
// hace que un deep link a /reservas abra el Catálogo, porque el anchor de una tab
// pisa la tab pedida por la URL.
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
