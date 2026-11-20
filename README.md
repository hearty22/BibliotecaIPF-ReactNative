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
│   ├── _layout.tsx                    Tabs (Catálogo / Mis reservas)
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

El `anchor` está en el **layout raíz** (`anchor: "(tabs)"`), no en `(tabs)`: así un deep link a `/buscar` o `/escanear` deja las tabs debajo. Declararlo también en `(tabs)` con `anchor: "(catalogo)"` hacía que un deep link a `/reservas` abriera el Catálogo, porque el anchor de una tab pisa la tab pedida por la URL (verificado en el build de producción). Nota: en desarrollo web, `expo start` usa rutas asíncronas y los `unstable_settings` pueden no aplicarse; el comportamiento se comprueba en el teléfono o en un export.

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

## Capturas

En `capturas/` están las pantallas del build web (`pnpm exec expo start --web`) en un viewport de teléfono (390 × 844):

| Archivo | Pantalla |
|---|---|
| `01-catalogo-cargando.png` | Catálogo con el indicador de carga |
| `02-catalogo-datos.png` | Catálogo con datos y "Vistos recientemente" |
| `03-catalogo-error.png` | Catálogo con el error y el botón "Reintentar" |
| `04-buscador.png` | `/buscar?q=borges` con resultados |
| `05-detalle-inexistente.png` | `/libro/123` con el mensaje y el enlace al catálogo |
| `06-detalle-valido.png` | Detalle con ejemplares y año |
| `07-reserva-con-ejemplares.png` | Confirmación con préstamo de 7 días |
| `08-reserva-sin-ejemplares.png` | Confirmación con ingreso a la lista de espera (posición 3) |
| `09-reservas.png` | Mis préstamos con vencimiento, "Recordarme" y espera con posición |
| `10-escaner-pendiente.png` | Escáner en el estado "preguntable", con ISBN manual |
| `11-login.png` | Ingreso del personal |
| `12-mostrador-antes.png` | Mostrador con Rayuela al frente (Ana Quiroga) y 2 personas esperando |
| `13-mostrador-despues.png` | Después de "Entregar al siguiente" (Bruno Salas, 1 persona) |
| `14-404.png` | Pantalla 404 con la URL inexistente |

Estas capturas no reemplazan las que solo se pueden sacar en el teléfono, porque en el build web no existen:

- los cuatro estados reales de cámara y el diálogo del sistema con el texto de propósito,
- la notificación recibida a los 15 segundos,
- el canal `prestamos` en los ajustes de Android.

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
