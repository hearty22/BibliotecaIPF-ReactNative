# RESPUESTAS — TP 4 Biblioteca IPF

> **Cómo se verificó.** Las respuestas están ancladas al código de este repositorio. El comportamiento de montaje y limpieza de **B1** se midió ejecutando la app con un `console.log` temporal en la limpieza de `useLibros` (el log se sacó después; el código entregado no tiene `console.log`). Los valores por defecto de React Navigation se verificaron en el código instalado de `expo-router`, y la política de permisos en la documentación de Android. Reescribí con tus palabras lo que haga falta: la cátedra evalúa que las respuestas sean propias.

---

## Parte B · Estado, efectos y renderizado

### B1. El ciclo de vida de `useLibros`

**a) Render por render.** `useLibros` guarda una máquina de estados (`src/hooks/useLibros.ts:22`) en lugar de tres `useState` separados, para que `cargando` y `error` nunca puedan contradecirse.

1. **Montaje.** `fase = { nombre: "cargando", intento: 0 }`. Primer render: `cargando = true`, `libros = []`, `error = null`. Después del render corre el efecto (`useLibros.ts:24`), que dispara `obtenerLibros()` (800 ms, falla 1 de cada 5).
2. **Respuesta OK.** El `.then` (`:30`) hace `setFase({ nombre: "listo", libros })`. Segundo render: `cargando = false`, `libros` con los 18 libros, `error = null`. La lista aparece.
3. **Respuesta con error.** El `.catch` (`:35`) hace `setFase({ nombre: "error" })`. Render: `error` con el mensaje en español y `libros = []`. La pantalla muestra `MensajeEstado` + botón "Reintentar" (`src/app/(tabs)/(catalogo)/index.tsx:28-33`).
4. **Reintentar.** `reintentar()` (`useLibros.ts:45`) pasa la fase a `cargando` **y** suma 1 a `intento` en la misma actualización. Ese cambio de `fase.intento` vuelve a ejecutar el efecto: la limpieza marca `vigente = false` en el pedido anterior y arranca uno nuevo. Renders: cargando → listo/error.

**b) ¿Se desmonta el Catálogo?** No, en ninguno de los dos casos.

- Las tabs montan la pantalla en el primer foco (`lazyByDefault: true` en el navegador de tabs de React Navigation) y después **no la desmontan** al cambiar de pestaña.
- Abrir un detalle apila la pantalla nueva **encima** del Catálogo dentro del stack de la tab (`src/app/(tabs)/(catalogo)/_layout.tsx`), así que el Catálogo sigue montado abajo.

Medido con un `console.log` temporal en la limpieza de `useLibros.ts:40` y la app abierta en un navegador controlado por protocolo (Chrome DevTools):

| Acción | ¿Aparece el log de limpieza? |
|---|---|
| Cambiar a la tab "Mis reservas" | No |
| Volver a la tab "Catálogo" | No (y el detalle sigue en pantalla) |
| Abrir un detalle | No |
| Tocar "Reintentar" | **Sí** |
| Recargar la página (desmontar el árbol) | **Sí** |

Por eso la limpieza es un seguro para los casos en que el efecto **se vuelve a ejecutar** (reintentar) o la pantalla **se desmonta** (recarga, cierre de la app), no para los cambios de pestaña: ahí la respuesta que llega sigue siendo la vigente.

La limpieza (`useLibros.ts:40-42`) se ejecuta en dos situaciones reales:

- al tocar "Reintentar", porque cambian las dependencias del efecto y React limpia antes de volver a ejecutarlo;
- al desmontarse la pantalla (recarga en desarrollo, cierre de la app o cualquier futuro `router.replace` que saque la tab de la pila).

Para comprobarlo: agregar un `console.log("limpieza")` dentro del `return` de `useLibros.ts:40`, cambiar de pestaña (no aparece), abrir un detalle (no aparece) y tocar "Reintentar" (aparece).

**c) ¿Por qué no una función `async` en `useEffect`?** Porque `useEffect` espera que la función devuelva `undefined` o una función de limpieza, y una función `async` devuelve siempre una `Promise`. React no puede ejecutar una promesa como limpieza y avisa del error. La solución del proyecto: la función async vive adentro del efecto y se invoca sin `await`, y la limpieza se registra aparte:

```ts
useEffect(() => {
  let vigente = true;
  obtenerLibros().then(...).catch(...);
  return () => { vigente = false; };
}, [fase.intento]);
```

**d) ¿Cómo implementé `reintentar`?** Sumando un contador: `setFase({ nombre: "cargando", intento: previa.intento + 1 })` (`useLibros.ts:46`). El efecto depende de `fase.intento` (`:42`), así que un valor distinto lo vuelve a ejecutar. Elegí ese valor y no `libros`, `cargando` o el resultado del pedido: la única entrada que debe disparar el efecto es "el usuario pidió otra vez", y ese contador es exactamente eso. Si dependiera de `cargando`, el propio `setFase` del `.then` volvería a disparar el efecto y entraría en un ciclo.

### B2. La condición de carrera del buscador

| Momento | Qué pasa | Sin limpieza | Con el código de `buscar.tsx` |
|---|---|---|---|
| t = 0 ms | Escribe "bor": se pide `buscarLibros("bor")`, tarda 1.400 ms | Se ve "Buscando…" | Se ve "Buscando…" |
| t = 200 ms | Escribe "borges": se pide `buscarLibros("borges")`, tarda 300 ms | Se ve "Buscando…" | Se ve "Buscando…" |
| t = 500 ms | Llega la respuesta de "borges" | Resultados de "borges" | Resultados de "borges" |
| t = 1.400 ms | Llega la respuesta de "bor" | **Se pisan los resultados y quedan los de "bor"**, aunque la persona buscó "borges" | La respuesta vieja se descarta y siguen los de "borges" |

**a) Qué hace la limpieza.** Cada ejecución del efecto tiene su propia variable `vigente` (`src/app/buscar.tsx:60`). Cuando `consulta` cambia, React ejecuta la limpieza del efecto anterior y la pone en `false`. La respuesta vieja igual llega, pero el `.then`/`.catch` chequea `if (vigente)` (`:49`, `:54`) y no escribe nada. Se ejecuta cuando cambian las dependencias (`consulta`) o al desmontar la pantalla.

Además el estado guarda la consulta que lo generó (`:50`) y en el render solo se usan los resultados si coinciden con la consulta actual (`:65-66`). Son dos defensas: la primera evita escribir, la segunda evita mostrar.

**b) La propuesta del compañero.** No funciona como está escrita. La función del `.then` es una clausura creada en el render que lanzó la búsqueda, y ahí `texto` vale lo mismo que `q` para *esa* ejecución: la comparación es verdadera siempre, incluso para la respuesta vieja. Para que sirviera, `texto` tendría que leerse desde una referencia mutable (`useRef`) que guarde siempre la última consulta; comparar `ref.current === q` sí distingue la respuesta vieja. Es el mismo problema de clausuras del TP 2: cada ejecución "congela" los valores del render en el que nació.

**c) URL y botón atrás.** El texto se escribe en `texto` local y, 300 ms después, se copia a la URL con `router.setParams({ q: texto })` (`src/app/buscar.tsx:36`). `setParams` **reemplaza los parámetros de la ruta actual**: no apila pantallas y el botón atrás no recorre letra por letra. Con `router.push` cada tecleo (después del debounce) crearía una pantalla nueva, y "atrás" iría mostrando búsquedas intermedias hasta salir del buscador.

### B3. Mutar o reemplazar

**a)** El texto sigue mostrando **0**. `useState` guarda la instancia de `Cola` y `encolar` la muta por dentro, pero React no se entera: no hay `setState`, así que no hay re-render y el `tamanio` que se ve es el del último render.

**b)** Al escribir en el `TextInput` controlado, el estado del texto cambia y la pantalla se vuelve a renderizar; en ese render se vuelve a leer `espera.tamanio`, que ahora es 3. Por eso el número "salta". Un error que aparece solo cuando otra cosa re-renderiza es peor que uno permanente: no se puede reproducir de forma confiable, aparece en producción y no en la prueba, y encima el valor mostrado es correcto por casualidad.

**c) Cómo lo resolví.** `Pila` y `Cola` viven dentro de un objeto `Interno` en el provider. Después de mutar la clase, `mutar` reemplaza el contenedor: `setInterno({ ...interno })` (`src/context/BibliotecaContext.tsx:167-170`). Las instancias son las mismas, pero la referencia del Context cambia y todos los consumidores se re-renderizan; el `useMemo` del valor (`:166`) se recalcula y expone datos planos (`recientes` ya como arreglo invertido, `esperas` como `Record<string, string[]>`), así ningún componente toca las clases directamente.

Alternativas:

| Solución | Ventaja | Costo |
|---|---|---|
| Instancia nueva en cada cambio (`new Cola(cola.aArray())`) | Inmutable de verdad, se puede comparar por referencia | Copia O(n) y hay que reconstruir la clase en cada operación |
| Contador de versión (lo que hace el proyecto) | Barato, no copia nada, no hay que serializar | La instancia se muta: si alguien la guarda y la usa después, ve el estado nuevo |
| `useReducer` con arreglos | Flujo explícito, testeable, sin clases mutables | Perdés la encapsulación de `Pila`/`Cola` que pide el TP |

### B4. ¿Dónde vive cada dato?

| Dato | Dónde vive | Por qué ahí |
|---|---|---|
| Texto del buscador | URL (`q`) + estado local del input | Se comparte, se puede abrir por deep link y el atrás no acumula tecleos |
| Préstamos y reservas | Context (`prestamos`) | Los usan dos pestañas y el mostrador; tienen que sobrevivir a la navegación |
| Listas de espera | Context (`esperas`, una `Cola` por ISBN) | Mismo motivo, y el orden de atención es global |
| Vistos recientemente | Context (`recientes`, una `Pila`) | El Catálogo los muestra y el Detalle los alimenta: cruza pantallas |
| Sesión del personal | Context (`sesion`) | `Stack.Protected` la lee en el layout raíz |
| Ejemplares disponibles | Se calcula (`disponibles`, `BibliotecaContext.tsx:186`) | Es `ejemplares - (tengo el préstamo ? 1 : 0)`; guardarlo abre la puerta a que se desincronice |
| Estado del permiso de cámara | Lo sabe el sistema operativo; la app lo consulta con `usePermiso` | No se puede "guardar" la verdad: cambia desde Ajustes |
| Id de la notificación programada | Context (`prestamo.recordatorioId`) + AsyncStorage | Hay que poder cancelarla después de cerrar la app |

Cuando cambia el `value` del Context se vuelven a renderizar **todos** sus consumidores: Catálogo, Detalle, Reservas, Mostrador, `AccesoPersonal` y las pantallas de reserva y permisos. Sí: el Catálogo se re-renderiza cuando activás un recordatorio en "Mis reservas", aunque solo use `recientes` y `disponibles`. Para evitarlo se separaría en dos providers (catálogo/recientes y préstamos) o se usaría un selector con `useSyncExternalStore`. En una app de este tamaño no vale la pena: son cuatro consumidores y listas de menos de 20 filas.

---

## Parte C · Navegación y rutas

### C1. La pila en tu app

| # | Acción | Pilas resultantes |
|---|---|---|
| 1 | Abre la app | Raíz: `[(tabs)]`. Tab Catálogo: `[index]`. La tab Reservas todavía no está montada |
| 2 | Toca un libro | Raíz: `[(tabs)]`. Catálogo: `[index, libro/9789507310003]` |
| 3 | Toca "Reservar" | Raíz: `[(tabs), reservar/9789507310003 (modal)]`. Catálogo: `[index, libro/…]` |
| 4 | Toca "Confirmar" | Raíz: `[(tabs)]` (el modal se cerró) y la tab activa pasa a ser Reservas. Catálogo: `[index, libro/…]` |
| 5 | Atrás (Android) | En Reservas no hay nada que desapilar en la raíz: el atrás lo maneja el navegador de tabs. Con el `backBehavior` por defecto (`firstRoute`) vuelve a la tab Catálogo, que conserva el detalle en su stack |
| 6 | Toca la tab Catálogo | El detalle: cada tab conserva su propio stack y nadie lo limpió |

**a) Paso 4.** Usé `router.dismissTo("/reservas")` (`src/app/reservar/[isbn].tsx:44`).

- Con `push` se apilaría `/reservas` **encima del modal**; "atrás" volvería a la confirmación, que es justo lo que la consigna prohíbe.
- Con `replace` se cambiaría el modal por `/reservas`, pero esa pantalla quedaría en la pila raíz en lugar de la tab, y el botón atrás seguiría teniendo un paso artificial.
- `dismissTo` cierra los modales hasta llegar al destino y deja `/reservas` como pantalla visible, sin la confirmación en el historial.

**b) Paso 6.** Se ve el detalle. El stack de la tab Catálogo quedó con `[index, libro/…]` y cambiar de pestaña no lo reinicia. Para esta app me parece correcto: si estabas mirando un libro, volver a la pestaña te devuelve a ese libro. Si se quisiera el catálogo limpio habría que escuchar el `blur` de la tab y hacer `router.dismissAll()` o navegar a `index`.

### C2. El escáner que dispara de más

**a)** `onBarcodeScanned` se ejecuta muchas veces por segundo. Sin protección, cada lectura encola un `router.push`: decenas de pantallas de detalle apiladas (el mismo problema de la cola de acciones de navegación del TP 2). Al volver atrás habría que desapilar una por una, y mientras tanto se disparan animaciones y renders innecesarios.

**b)** Usé `useRef` (`src/app/escanear.tsx:24-25`). Un `useState(true)` no alcanza porque el valor se lee desde la clausura del render actual: los llamados que ocurren antes del re-render siguen viendo `false`, y en una ráfaga de lecturas alcanza para navegar varias veces. El `ref` cambia en el acto y lo ven todos los llamados, sin esperar un render.

**c)** Conviene `replace` (`src/app/escanear.tsx:44`) porque el escáner no debe quedar en el historial: si se usara `push`, "atrás" volvería a la cámara con el mismo código todavía enfrente y el rebote sería inmediato.

**d)** Si el ISBN no existe, `abrirLibro` muestra un mensaje y **no** navega (`escanear.tsx:39-42`); el escáner sigue activo. Para que el mismo aviso no se repita diez veces, `alEscanear` guarda el último código y su horario y descarta el mismo código dentro de los 3 segundos (`MS_ENTRE_LECTURAS`, `escanear.tsx:48-56`).

### C3. Deep links y rutas protegidas

| Enlace | Qué ve la persona | Qué queda debajo | Qué parte del código lo decide |
|---|---|---|---|
| `bibliotecaipf://libro/9789507310003` | Detalle del libro, con tabs | Tabs + Catálogo (el detalle vive en el stack de la tab) | `src/app/(tabs)/(catalogo)/libro/[isbn].tsx` y el grupo `(catalogo)` |
| `bibliotecaipf://libro/123` | Detalle con "El ISBN 123 no está en el catálogo" y enlace al catálogo | Tabs | La validación del parámetro dentro de la pantalla (`normalizarParametro` + `buscarLibroPorIsbn`) |
| `bibliotecaipf://buscar?q=borges` | Buscador con la consulta cargada | Tabs con el Catálogo, porque el layout raíz declara `anchor: "(tabs)"` | `src/app/_layout.tsx` (`unstable_settings.anchor`) |
| `bibliotecaipf://mostrador` (sin sesión) | Catálogo: la ruta no existe | — | `Stack.Protected guard={sesion}` en `src/app/_layout.tsx:50-52` |
| `bibliotecaipf://reserva` | Redirige a `/reservas` | Tabs | `src/app/reserva.tsx` (`<Redirect>`) |
| `bibliotecaipf://escanear` (cámara bloqueada) | Escáner con el aviso y el botón "Abrir Ajustes" | — | `usePermiso` + `src/app/escanear.tsx` |

`/libro/123` llega a la pantalla de detalle porque el router hace coincidencia **por patrón**, no por datos: `[isbn]` acepta cualquier segmento. La responsabilidad de responder bien es de la pantalla, que valida formato y existencia antes de mostrar contenido.

### C4. Foco, montaje y primer plano

**a)** Tres herramientas, tres eventos distintos:

- `useEffect(..., [])`: se ejecuta una vez al **montar** la pantalla (y se limpia al desmontarla).
- `useFocusEffect`: se ejecuta cada vez que la pantalla **recibe el foco** (al volver a la tab o al volver de otra pantalla) y su limpieza corre al perderlo.
- `AppState`: escucha el estado de la **app** (background → active). Es la única que se entera de una ida a Ajustes, porque la pantalla nunca perdió el foco.

**b)** Al salir a Ajustes y volver, se entera `AppState` (`src/app/permisos/[recurso].tsx:49-53` y `src/app/(tabs)/reservas.tsx:46-51`). Al ir a la tab Catálogo y volver a Mis reservas, se entera `useFocusEffect` (`reservas.tsx:39-43`). Por eso el hook `usePermiso` expone `refrescar` y las pantallas lo llaman desde los dos lados.

**c)** Usé las dos en "Mis reservas" y en la pantalla previa de permisos; el escáner usa `useFocusEffect` (`escanear.tsx:29`). Si usara solo `useEffect([])`, el estado quedaría viejo en los dos casos (volver de Ajustes y volver de otra tab).

---

## Parte D · Permisos en tu app

### D1. Recorrido completo de la cámara

Desde Android 11, si la persona rechaza el permiso **dos veces**, el sistema deja de mostrar el diálogo y `canAskAgain` pasa a `false`. En iOS hay **un solo** pedido: el primer rechazo ya bloquea (algunos fabricantes con capas propias pueden cambiar el texto del diálogo, no la cantidad de pedidos).

| # | Acción | Qué muestra la app | `status` | `canAskAgain` |
|---|---|---|---|---|
| 1 | Toca "Escanear" por primera vez | `/escanear` con "Necesitamos tu cámara" y botón "Continuar" | `undetermined` | `true` |
| 2 | "Continuar" → "No permitir" | Vuelve a `/escanear` con el mismo aviso | `denied` | `true` (Android permite volver a preguntar) |
| 3 | Toca "Escanear" otra vez | Igual: "Continuar" | `denied` | `true` |
| 4 | "Continuar" → "No permitir" | Aviso de que hay que habilitarlo desde Ajustes, botón "Abrir Ajustes" | `denied` | `false` |
| 5 | Toca "Escanear" otra vez | "La cámara está bloqueada" + "Abrir Ajustes" | `denied` | `false` |
| 6 | Ajustes → habilita → vuelve | La `CameraView` aparece sin reiniciar la app | `granted` | `true` |

**a) En iOS** el sistema permite un solo pedido: después del primer "No permitir" `canAskAgain` ya es `false`, así que el paso 3 muestra directamente "Abrir Ajustes".

**b) La línea que decide** es `return respuesta.canAskAgain ? "preguntable" : "bloqueado";` (`src/hooks/usePermiso.ts:23`), y el botón se elige en `src/app/permisos/[recurso].tsx:104-110`. No alcanza con `status`: un permiso `denied` puede seguir siendo "preguntable" (el sistema todavía muestra el diálogo) o estar bloqueado (solo se arregla desde Ajustes). `canAskAgain` es el único campo que distingue esos dos casos.

**c) En el paso 6 se entera** el listener de `AppState` (`permisos/[recurso].tsx:49`): al volver a `active` llama a `refrescar()`. Sin esa parte, la pantalla seguiría mostrando "La cámara está bloqueada" y el botón seguiría mandando a Ajustes aunque el permiso ya esté concedido.

### D2. Notificaciones y consistencia

**a)** Si no se cancelara, la notificación llegaría igual a los 15 segundos aunque el libro ya esté devuelto: un recordatorio falso. Por eso `devolver` llama a `cancelarRecordatorio` antes de borrar el préstamo (`BibliotecaContext.tsx:230-239`) y `desactivarRecordatorio` hace lo mismo al apagar el interruptor.

**b)** El id se guarda en el préstamo (`recordatorioId`) dentro del Context, y el Context se persiste en AsyncStorage (`src/lib/almacenamiento.ts`). Si la app se cierra antes de que llegue, la notificación **igual se entrega**, porque ya está programada en el sistema operativo, y el id sobrevive en el almacenamiento, así que todavía se puede cancelar al abrir la app. El problema aparece si el almacenamiento se borra (reinstalación, limpieza de datos): el sistema ya no tiene la notificación y la app perdió el id. La solución sería reconciliar al iniciar con `getAllScheduledNotificationsAsync()` y cancelar lo que ya no corresponda a un préstamo activo.

**c) El canal antes del permiso.** Desde Android 13, `POST_NOTIFICATIONS` es un permiso en tiempo de ejecución y el diálogo del sistema muestra las notificaciones **del canal** que la app declara. Si el canal no existe cuando se pide el permiso, la persona no tiene contexto de qué está habilitando y las notificaciones publicadas en un canal inexistente se descartan. Por eso el canal `prestamos` se crea al abrir la app (`BibliotecaContext.tsx:131`) y otra vez antes de programar (`lib/notificaciones.ts:30-38`). En Android 12 y anteriores no hay permiso en tiempo de ejecución: el canal igual importa porque define la importancia y el sonido.

**d)** Si el permiso está denegado y me entregan un libro, `entregarSiguiente` consulta el permiso **en ese momento** con `getPermissionsAsync()` (`BibliotecaContext.tsx:291`), no un valor guardado al activar el interruptor:

```ts
const permiso = await Notifications.getPermissionsAsync();
if (permiso.granted) {
  await programarAvisoRetiro(libro);
  return;
}
agregarAviso(`Te toca retirar "${libro.titulo}". Acercate al mostrador.`);
```

Importa porque la persona pudo cambiar el permiso desde Ajustes después de activar el recordatorio: usar un valor cacheado haría que se programe una notificación que el sistema va a descartar (y la persona no se enteraría de nada).

### D3. Lo que tu app pide y lo que no

| Plataforma | Permiso o clave | Función que lo justifica | Quién lo agrega |
|---|---|---|---|
| Android | `android.permission.CAMERA` | Leer el código de barras en `/escanear` | Plugin `expo-camera` |
| Android | `android.permission.POST_NOTIFICATIONS` (13+) | Recordatorio de devolución y aviso de retiro | Plugin `expo-notifications` |
| Android | `android.permission.VIBRATE` | Aviso del recordatorio | Plugin `expo-notifications` |
| Android | `android.permission.RECEIVE_BOOT_COMPLETED` | Reprogramar avisos tras reiniciar | Plugin `expo-notifications` |
| Android | `android.permission.INTERNET` | Cargar el bundle en desarrollo / API | Expo |
| iOS | `NSCameraUsageDescription` | Igual que CAMERA | Plugin `expo-camera` |
| iOS | *ninguna clave* para notificaciones locales | El permiso lo pide `UNUserNotificationCenter` | — |

**a)** La app no declara `RECORD_AUDIO` porque el plugin de cámara lo desactiva explícitamente:

```json
["expo-camera", {
  "cameraPermission": "Usamos tu cámara para leer el código de barras del libro que querés reservar.",
  "microphonePermission": false,
  "recordAudioAndroid": false
}]
```

`recordAudioAndroid: false` evita que el plugin agregue `RECORD_AUDIO` al manifiesto, y `microphonePermission: false` evita el texto de propósito de micrófono en iOS. Además figura en `android.blockedPermissions` (`app.json:21-28`) como recordatorio del mínimo privilegio.

**b) Galería.** Usaría `expo-image-picker` (o `expo-media-library` si además hay que guardar). En Android 13+ el permiso es `READ_MEDIA_IMAGES` (en versiones anteriores, `READ_EXTERNAL_STORAGE`); en iOS, `NSPhotoLibraryUsageDescription`. **No alcanza con una actualización OTA**: un permiso nuevo es configuración nativa (manifiesto/Info.plist), así que requiere una build nueva con `expo run:android|ios` o EAS; la OTA solo puede actualizar el JavaScript.

**c) Lo que no se verifica del todo en Expo Go.** El texto de propósito del diálogo del sistema lo muestra **Expo Go**, no la app, y el canal de notificaciones de Android pertenece a Expo Go, así que su comportamiento (importancia, sonido) no es el de la app. Se verifica con un development build (`pnpm exec expo run:android` o `eas build --profile development`) instalado en el teléfono.

---

## Parte E · Buenas prácticas y decisiones de diseño

### E1. Revisión de código

**a) Problemas del Catálogo entregado.**

| Línea | Problema | Clasificación | Corrección |
|---|---|---|---|
| 10 | `useState<any[]>` | Mala práctica (tipos) | `useState<Libro[]>([])`, con el tipo de `src/types` |
| 13-16 | Pide cámara **y** notificaciones al montar la pantalla | Mala práctica / error de política | Pedir en contexto: `/permisos/[recurso]` y solo al usar la función |
| 15 | Pide notificaciones sin haber creado el canal | Error de ejecución (Android 13+) | Crear el canal `prestamos` antes del pedido |
| 14-15 | `useEffect` sin limpieza para pedidos de permiso | Mala práctica | Guardar el resultado y cancelar/releer al desmontar |
| 18-20 | Efecto sin array de dependencias: pide datos en **cada** render | Error de ejecución / rendimiento | Dependencias correctas y una sola carga |
| 19 | `setLibros` sin `catch`: si falla, queda cargando para siempre | Error de ejecución | `.catch` con mensaje y acción de reintentar |
| 22 | Componente `Fila` declarado **dentro** del componente | Error de rendimiento / mala práctica | Moverlo a `src/components` (como `FilaLibro`) |
| 24 | `router.push('/libro/' + libro.isbn)` con concatenación sin tipos | Mala práctica | Ruta tipada: `` router.push(`/libro/${libro.isbn}`) `` |
| 25 | Estilos en línea con colores y tamaños inventados | Mala práctica | `StyleSheet.create` + `tema.ts` |
| 33-36 | `ScrollView` + `map` en lugar de `FlatList` | Rendimiento | `FlatList` con `keyExtractor` por ISBN |
| 35 | `key={i}` (índice) | Error de ejecución al reordenar/filtrar | `key={libro.isbn}` |
| 37-39 | Botón de solo ícono sin `accessibilityLabel`, sin rol y con área táctil chica | Accesibilidad | `accessibilityRole="button"`, etiqueta y 44 × 44 |
| — | No hay estados de cargando, error ni vacío | Mala práctica | Los tres estados, como en el Catálogo real |

**b) El efecto sin dependencias durante el primer minuto.** Se ejecuta después de **cada** render: pedido → `setLibros` → render → nuevo pedido → … Es un ciclo de unos 800 ms por vuelta, así que en un minuto hay decenas de pedidos: la lista parpadea, el teléfono se calienta y las respuestas pueden llegar desordenadas. Si `obtenerLibros()` devolviera **el mismo array**, `setLibros(datos)` recibiría la misma referencia que ya tiene el estado y React cortaría el ciclo (bailout): no hay re-render, no hay nuevo pedido. El comentario de `api.ts` ("cada respuesta trae objetos nuevos") es justamente lo que rompe esa casualidad.

**c) Reescritura con los componentes del proyecto.**

```tsx
export default function Catalogo() {
  const { libros, cargando, error, reintentar } = useLibros();
  const { disponibles, estaEnEspera } = useBiblioteca();
  const router = useRouter();

  if (cargando) return <Cargando texto="Cargando el catálogo…" />;
  if (error) {
    return (
      <View style={estilos.error}>
        <MensajeEstado mensaje={error} />
        <Boton onPress={reintentar} titulo="Reintentar" />
      </View>
    );
  }

  return (
    <FlatList
      data={libros}
      keyExtractor={(libro) => libro.isbn}
      ListEmptyComponent={<MensajeEstado mensaje="No hay libros cargados." />}
      renderItem={({ item }) => (
        <FilaLibro
          libro={item}
          disponibles={disponibles(item)}
          enEspera={estaEnEspera(item.isbn)}
          onPress={() => router.push(`/libro/${item.isbn}`)}
        />
      )}
    />
  );
}
```

**d)** El que podría hacer rechazar la app en una tienda es el pedido de permisos al abrir, sin contexto ni texto de propósito: las políticas de Apple y Google lo consideran una solicitud injustificada, y en iOS el permiso de cámara sin `NSCameraUsageDescription` directamente rompe la app. El que haría desinstalarla primero es el ciclo de pedidos del punto (b): batería, datos y una lista que parpadea.

### E2. Organización y acoplamiento

**a)** El grafo va en un solo sentido:

```
app → components, hooks, context → lib, estructuras → data, types, constants
```

`app` importa de todas las capas; `components`/`hooks`/`context` importan de `lib`/`estructuras`/`data`/`types`/`constants`; `lib`/`estructuras` solo de `data`/`types`/`constants`. **No hay importaciones hacia arriba**: ningún hook importa de `src/app`. Si lo hubiera, se crearía un ciclo (la ruta importa el hook, el hook importa la ruta), el código de rutas se metería en cualquier bundle que use el hook y los tests de lógica arrastrarían el router.

**b)** Si el catálogo viniera de una API real, cambiarían **`src/lib/api.ts`** (implementación de `obtenerLibros` y `buscarLibros`) y, como mucho, `src/data/libros.ts` (que dejaría de ser la fuente). Las pantallas, hooks y componentes no se tocan porque consumen las funciones, no la fuente. Que sean dos archivos (o uno) confirma que la capa de datos está aislada.

**c)** `<ConPermiso recurso="camara">`: ganarías un único lugar para los cuatro estados y menos repetición. Perderías control sobre **cuándo** se pide (el envoltorio pediría al renderizar el árbol) y sobre el texto de la pantalla previa, que tiene que explicar el beneficio concreto de esa función. Para notificaciones no sirve: no se piden al abrir una pantalla, se piden al activar un interruptor, y la decisión depende de si hay una notificación que programar.

### E3. Mapa de fallas

| Situación | Qué ve la persona | Dónde se maneja |
|---|---|---|
| `obtenerLibros()` falla | Mensaje en español + botón "Reintentar" | `useLibros.ts:33-37` y `(catalogo)/index.tsx:28-33` |
| Se abre `/libro/abc` | "La dirección no incluye un ISBN válido" + enlace al catálogo | `libro/[isbn].tsx:35-47` |
| Se escanea un ISBN inexistente | "El ISBN … no está en el catálogo. Podés seguir escaneando." | `escanear.tsx:39-42` |
| La cámara está bloqueada | "La cámara está bloqueada" + "Abrir Ajustes" | `escanear.tsx:80-99` y `permisos/[recurso].tsx:104-119` |
| Las notificaciones están denegadas | Avisos dentro de "Mis reservas" | `BibliotecaContext.tsx:291-296` y `AvisosBiblioteca` |
| Se intenta reservar un libro ya reservado | Botón deshabilitado en el detalle y mensaje en la confirmación | `libro/[isbn].tsx:84-88` y `reservar/[isbn].tsx:38-41` |
| "Entregar al siguiente" sin nadie | Esa lista no aparece; si no hay ninguna, "No hay listas de espera" | `mostrador.tsx:16-21` |
| Login con clave incorrecta | "Usuario o clave incorrectos." | `login.tsx:18-20` |

### E4. Decisiones con argumentos

**a) Identificador.** Usé el **ISBN como parámetro de ruta y como `key`**. En este catálogo es el identificador natural: único, de 13 dígitos, validable con una expresión regular y el mismo dato que devuelve el escáner. Las desventajas son reales: un libro sin ISBN no tiene ruta, dos ediciones del mismo título comparten ISBN si el editor no lo cambió, y `useLocalSearchParams` lo entrega como `string | string[] | undefined`, así que hay que normalizarlo (`lib/catalogo.ts`). Un id interno resolvería ediciones y libros sin ISBN, pero agregaría un mapeo en cada deep link y en el escáner. Para una biblioteca escolar, el ISBN alcanza.

**b) Estructuras.** La clase `Pila`/`Cola` me dio el contrato del TP (campos privados, `tamanio`, `aArray`) y una `Cola` sin `shift()`. Lo que complicó fue React: una clase mutable no dispara renders, así que el Context tiene que reemplazar el contenedor después de cada operación (`BibliotecaContext.tsx:167-170`). Un arreglo en el estado con `[...cola, x]` y `slice` sería idiomático y más simple de testear, pero habría que reimplementar la posición y el orden a mano.

**c) Memorización.** Usé `useMemo` en el `value` del Context (`BibliotecaContext.tsx:166`): sin él, cualquier render del provider (por ejemplo, el que dispara la hidratación) crearía un valor nuevo y re-renderizaría a todos los consumidores. También `useCallback` en `pedir`/`refrescar` de `usePermiso` (`usePermiso.ts:65-83`), porque se usan como dependencia de `useFocusEffect` y del listener de `AppState`: con funciones nuevas en cada render, el efecto se resuscribiría en loop. Donde sería ruido: envolver cada `FilaLibro` o cada `disponibles(item)` en `useMemo`; son cálculos de milisegundos y React Compiler ya memoiza el render. Se comprueba con el Profiler de React DevTools (o `why-did-you-render`), no por intuición.

**d) Datos duplicados.** Los ejemplares disponibles **se calculan**: `libro.ejemplares - (estaPrestado(isbn) ? 1 : 0)` (`BibliotecaContext.tsx:186-187`). Si se guardaran en el estado, cualquier camino que no los actualice deja el número mintiendo: por ejemplo, devolver un libro desde "Mis reservas" sin pasar por la pantalla de detalle, o entregar desde el mostrador. Con el cálculo hay una sola fuente de verdad (`ejemplares` del catálogo + mis préstamos) y el error no puede aparecer.
