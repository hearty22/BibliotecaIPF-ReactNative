import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";

import { Cargando } from "@/components/Cargando";
import { COLORES, ESPACIOS } from "@/constants/tema";
import { BibliotecaProvider, useBiblioteca } from "@/context/BibliotecaContext";

// Un deep link a /buscar o /escanear deja las tabs debajo en la pila.
export const unstable_settings = {
  anchor: "(tabs)",
};

function Navegacion() {
  const { sesion, hidratando } = useBiblioteca();

  if (hidratando) {
    return (
      <View style={estilos.espera}>
        <Cargando texto="Abriendo la biblioteca…" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: COLORES.fondo },
        headerStyle: { backgroundColor: COLORES.superficie },
        headerTintColor: COLORES.primario,
        headerTitleStyle: { color: COLORES.texto },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="buscar" options={{ title: "Buscar" }} />
      <Stack.Screen name="escanear" options={{ title: "Escanear" }} />
      <Stack.Screen
        name="+not-found"
        options={{ title: "Página no encontrada" }}
      />
      <Stack.Screen
        name="reservar/[isbn]"
        options={{ presentation: "modal", title: "Confirmar reserva" }}
      />
      <Stack.Screen
        name="permisos/[recurso]"
        options={{ presentation: "modal", title: "Permiso" }}
      />
      <Stack.Protected guard={!sesion}>
        <Stack.Screen
          name="login"
          options={{ presentation: "modal", title: "Personal" }}
        />
      </Stack.Protected>
      <Stack.Protected guard={sesion}>
        <Stack.Screen name="mostrador" options={{ title: "Mostrador" }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <BibliotecaProvider>
      <StatusBar style="dark" />
      <Navegacion />
    </BibliotecaProvider>
  );
}

const estilos = StyleSheet.create({
  espera: {
    backgroundColor: COLORES.fondo,
    flex: 1,
    justifyContent: "center",
    padding: ESPACIOS.xl,
  },
});
