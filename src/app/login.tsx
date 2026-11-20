import { useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";

import { Boton } from "@/components/Boton";
import { CampoTexto } from "@/components/CampoTexto";
import { MensajeEstado } from "@/components/MensajeEstado";
import { Tarjeta } from "@/components/Tarjeta";
import { COLORES, ESPACIOS, TIPOGRAFIA } from "@/constants/tema";
import { useBiblioteca } from "@/context/BibliotecaContext";

export default function Login() {
  const { iniciarSesion } = useBiblioteca();
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState<string | null>(null);

  const entrar = () => {
    if (!iniciarSesion(usuario, clave)) {
      setError("Usuario o clave incorrectos.");
      return;
    }
    // Al cambiar la sesión, `Stack.Protected` desmonta este modal solo.
    setError(null);
  };

  return (
    <ScrollView contentContainerStyle={estilos.contenido}>
      <Tarjeta titulo="Personal de biblioteca">
        <Text style={estilos.texto}>
          Ingresá con el usuario y la clave que entrega la biblioteca. Solo el
          personal puede entregar libros de la lista de espera.
        </Text>
      </Tarjeta>

      <CampoTexto
        alCambiar={setUsuario}
        etiqueta="Usuario"
        marcador="biblioteca"
        valor={usuario}
      />
      <CampoTexto
        alCambiar={setClave}
        etiqueta="Clave"
        seguro
        valor={clave}
        alEnviar={entrar}
      />

      {error && <MensajeEstado mensaje={error} />}

      <Boton onPress={entrar} titulo="Ingresar" />
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenido: {
    gap: ESPACIOS.md,
    padding: ESPACIOS.md,
  },
  texto: {
    color: COLORES.textoSuave,
    fontSize: TIPOGRAFIA.cuerpo,
    lineHeight: 21,
  },
});
