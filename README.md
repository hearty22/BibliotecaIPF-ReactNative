# Biblioteca IPF

App mobile de la biblioteca del Instituto Politécnico Formosa, hecha con **Expo SDK 58** y **Expo Router**. Permite consultar el catálogo, reservar libros o anotarse en la lista de espera, recibir un recordatorio antes del vencimiento y, desde el mostrador, entregar el próximo libro respetando el orden de las reservas.

Trabajo Práctico N° 4 — Taller Complementario React Native II.

## Cómo ejecutar el proyecto

Requisitos: Node 22.13 o superior, pnpm y la app **Expo Go** en el teléfono.

```bash
pnpm install
pnpm exec expo start
```

Escaneá el QR con Expo Go (Android) o con la cámara (iOS). También podés abrir la versión web con `pnpm exec expo start --web`, aunque la cámara y las notificaciones solo se prueban en el teléfono.

Comandos de verificación:

```bash
pnpm exec tsc --noEmit   # sin salida = sin errores
pnpm exec expo lint      # sin salida = sin errores
pnpm test                # 9 pruebas de Pila y Cola
```

Versión del SDK: **Expo 58.0.26** (React Native 0.88.1, React 19.3.0).

### Personal de biblioteca

El acceso al mostrador usa credenciales fijas en `src/constants/config.ts`:

- Usuario: `biblioteca`
- Clave: `ipf2026`

### Demostración de los recordatorios

En modo demostración el recordatorio se programa **15 segundos** después de activar «Recordarme» (`SEGUNDOS_RECORDATORIO` en `src/constants/config.ts`), para poder mostrarlo sin esperar una semana.

### Libros para probar el escáner

El catálogo usa ISBN EAN-13 válidos. Para la prueba con cámara:

- `9789507310003` — Cien años de soledad (2 ejemplares)
- `9788437600109` — Rayuela (0 ejemplares, con lista de espera)

## Árbol de rutas

Cada `_layout.tsx` define un navegador. El árbol de `src/app` es:

```
src/app/
├── _layout.tsx                        Stack raíz (provider, modales, rutas protegidas)
├── (tabs)/
│   ├── _layout.tsx                    Tabs (Catálogo / Mis reservas), anchor "(catalogo)"
│   ├── (catalogo)/
│   │   ├── _layout.tsx                Stack de la tab Catálogo
│   │   ├── index.tsx                  /
│   │   └── libro/[isbn].tsx           /libro/[isbn]
│   └── reservas.tsx                   /reservas
├── buscar.tsx                         /buscar?q=
├── escanear.tsx                       /escanear
├── reservar/[isbn].tsx                /reservar/[isbn]      modal
├── permisos/[recurso].tsx             /permisos/[recurso]   modal (camara | notificaciones)
├── login.tsx                          /login               modal, solo sin sesión
├── mostrador.tsx                      /mostrador           solo con sesión
├── reserva.tsx                        /reserva → <Redirect href="/reservas" />
└── +not-found.tsx                     cualquier otra URL
```

`/login` y `/mostrador` no se protegen con redirects manuales: el layout raíz los envuelve en `Stack.Protected` con `guard={!sesion}` y `guard={sesion}`.

## Configuración nativa (`app.json`)

Bloque `plugins`, con la razón de cada entrada:

```json
"plugins": [
  "expo-router",
  ["expo-splash-screen", { "backgroundColor": "#208AEF", "image": "./assets/images/splash-icon.png", "imageWidth": 76 }],
  ["expo-camera", {
    "cameraPermission": "Usamos tu cámara para leer el código de barras del libro que querés reservar.",
    "microphonePermission": false,
    "recordAudioAndroid": false,
    "barcodeScannerEnabled": true
  }],
  ["expo-notifications", { "color": "#1F5FBF", "defaultChannel": "prestamos" }]
]
```

- `expo-camera`: solo se usa el escáner de códigos de barras. `microphonePermission: false` evita el texto de propósito de micrófono en iOS y `recordAudioAndroid: false` evita que el plugin agregue `RECORD_AUDIO` al manifiesto de Android. `barcodeScannerEnabled` habilita el lector EAN-13.
- `expo-notifications`: `defaultChannel` apunta al canal `prestamos`, que además se crea en código antes de pedir el permiso (obligatorio en Android 13+).
- `expo-splash-screen`: mantiene la pantalla de inicio del template.

## Permisos

| Recurso | Módulo | Cuándo se pide | Si la persona niega |
|---|---|---|---|
| Cámara | `expo-camera` | Al tocar «Escanear»: `/escanear` muestra el estado y deriva a `/permisos/camara`, que explica el beneficio antes del diálogo del sistema | El ISBN se escribe a mano; si el permiso quedó bloqueado (`canAskAgain === false`) el botón pasa a «Abrir Ajustes» |
| Notificaciones | `expo-notifications` | Solo al activar «Recordarme» en un préstamo: `/permisos/notificaciones` → diálogo | Los avisos de la biblioteca aparecen dentro de `/reservas` |

Ningún permiso se pide al abrir la app. Los estados de cámara se calculan con `canAskAgain`, no solo con `status`, y se releen al volver de Ajustes o al recuperar el foco.

### `blockedPermissions`

```json
"blockedPermissions": [
  "android.permission.RECORD_AUDIO",
  "android.permission.ACCESS_COARSE_LOCATION",
  "android.permission.ACCESS_FINE_LOCATION",
  "android.permission.READ_EXTERNAL_STORAGE",
  "android.permission.WRITE_EXTERNAL_STORAGE",
  "android.permission.READ_MEDIA_IMAGES"
]
```

La app no graba audio, no usa la ubicación y no lee ni escribe archivos ni la galería. Bloquear esos permisos en el manifiesto deja explícito el mínimo privilegio y evita que un módulo transitivo los agregue sin que la app los necesite.

## Deep links de prueba

Con el servidor de desarrollo corriendo (`pnpm exec expo start`), usando la IP de la computadora:

| Enlace | Qué debe pasar |
|---|---|
| `exp://IP:8081/--/libro/9789507310003` | Abre el detalle del libro con las tabs debajo |
| `exp://IP:8081/--/libro/123` | Mensaje de ISBN inexistente y enlace al catálogo |
| `exp://IP:8081/--/buscar?q=borges` | Buscador con la consulta cargada y las tabs debajo |
| `exp://IP:8081/--/mostrador` | Sin sesión: no existe la ruta, vuelve al catálogo |
| `exp://IP:8081/--/reserva` | Redirige a `/reservas` |
| `exp://IP:8081/--/escanear` | Pantalla del escáner con el estado real del permiso |
| `exp://IP:8081/--/cualquier-cosa` | Pantalla 404 con la URL inexistente |

Con la app instalada (development build) el esquema propio es `bibliotecaipf://`, por ejemplo `bibliotecaipf://libro/9789507310003`.

## Organización del código

```
src/app/          rutas y layouts
src/components/   un componente por archivo
src/hooks/        useLibros, usePermiso
src/lib/          api.ts (provista), catálogo, notificaciones, almacenamiento, formato
src/data/         libros.ts y listas de espera iniciales
src/types/        Libro y tipos compartidos
src/context/      provider de préstamos, esperas, recientes y sesión
src/estructuras/  Pila y Cola
src/constants/    tema.ts y configuración del dominio
```

Las importaciones van en un solo sentido: `app` → `components`/`hooks`/`context` → `lib`/`estructuras` → `data`/`types`/`constants`.

## Verificación

Salida de los comandos al cerrar el trabajo:

```
$ pnpm exec tsc --noEmit
(sin salida, código 0)

$ pnpm exec expo lint
(sin salida, código 0)

$ pnpm test
Test Suites: 1 passed, 1 total
Tests:       9 passed, 9 total
```
