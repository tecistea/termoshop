# Preguntas de repaso — Final

> **Materia:** Aplicaciones Web Cliente · **ISTEA** · Proyecto: `termoshop`
> **Objetivo:** prepararte para la defensa oral. El profe avisó que va a preguntar
> sobre temas del proyecto (async, promesas, etc.). Acá tenés **20 consignas**
> basadas en tu propio código, con una guía de respuesta para cada una.

## Cómo usar esta guía

1. Leé la **consigna** e intentá responderla en voz alta **sin mirar la guía**.
2. Abrí el archivo de **código de referencia** y ubicá las líneas de las que hablás.
3. Recién ahí compará con **"Qué deberías responder"**.
4. Si podés, hacelo señalando el código en pantalla: en la defensa eso suma.

> Contexto técnico del proyecto (tenelo claro de entrada, es la base de casi todo):
> HTML/CSS/JS **vanilla** (sin frameworks ni build tools). El backend es **Supabase**,
> y toda la comunicación es con **`fetch` nativo** contra su REST API (PostgREST, en
> `/rest/v1`) y Auth (`/auth/v1`), **sin SDK**. La sesión es un **JWT** guardado en
> `localStorage` y la seguridad de fondo la da **RLS** en la base de datos.

---

## Sección A — Async, promesas y `fetch` (lo que más recalcó el profe)

### 1. ¿Qué es una Promise y en qué estados puede estar?
**Consigna:** Definí qué es una Promise y sus estados, usando `obtenerProductos()` como ejemplo.
**Código:** `app.js` → `obtenerProductos`, `js/api.js` → `apiGet`
**Qué deberías responder:**
- Una Promise es un **objeto que representa el resultado futuro** de una operación asíncrona (algo que todavía no terminó).
- Tres estados: **pending** (pendiente), **fulfilled/resolved** (se cumplió, tiene un valor) y **rejected** (falló, tiene un error).
- `fetch(...)` devuelve una Promise; como `apiGet` es `async`, también devuelve una Promise.
- Cuando la red responde y se parsea el JSON → pasa a **fulfilled** con el array de productos. Si falla la red o Supabase → **rejected** con un `Error`.

### 2. `async/await` vs `.then()/.catch()`
**Consigna:** El proyecto usa las dos formas. Explicá la diferencia y mostrá dónde uso cada una y por qué.
**Código:** `js/api.js` (await) · `app.js` → `handlerCatalogo` y `carrito.js` → final de `iniciarPaginaCarrito` (`.catch`)
**Qué deberías responder:**
- `async/await` es **azúcar sintáctico** sobre las promesas: deja escribir código asíncrono de forma **lineal y legible**, y capturo errores con `try/catch`. `await` **solo** se puede usar dentro de una función `async`.
- Uso `await` en casi todo (`apiGet`, `renderCatalogo`, `agregarAlCarrito`).
- Uso `.catch()` cuando el que llama **no es async** y es un "disparar y olvidar": ej. `agregarAlCarrito(idProducto).catch(...)` dentro de un handler de evento, o `render().catch(...)` en el arranque. Encadeno `.catch()` para atrapar el rechazo sin tener que volver `async` a toda la función.

### 3. Ciclo de vida de una request en `apiGet`
**Consigna:** Recorré qué hace `await fetch(...)`, qué devuelve, y por qué hay **dos** `await` en juego.
**Código:** `js/api.js` → `apiGet` y `manejarRespuesta`
**Qué deberías responder:**
- `await fetch(url, opts)` **pausa** la función hasta que llega la **respuesta HTTP** y devuelve un objeto **`Response`** (trae status, headers, ok...).
- El **segundo** `await` está en `manejarRespuesta` con `respuesta.json()` (o `.text()`): **leer y parsear el body también es asíncrono** (llega como stream), así que también devuelve una Promise.
- Detalle clave: `fetch` **no rechaza** por un status 4xx/5xx; por eso chequeo `respuesta.ok` a mano (ver pregunta 4).

### 4. ¿Por qué `fetch` no lanza error con un 404 o 500?
**Consigna:** Explicá el comportamiento de `fetch` ante errores HTTP y cómo lo manejás.
**Código:** `js/api.js` → `manejarRespuesta`
**Qué deberías responder:**
- `fetch` **solo rechaza** la promesa ante un **fallo de red** (sin conexión, DNS, CORS, timeout). Un 404 o 500 es una **respuesta HTTP válida** → la promesa **se cumple** igual.
- Por eso, en `manejarRespuesta` hago `if (!respuesta.ok) throw new Error(...)` incluyendo el `status` y el detalle (`await respuesta.text()`).
- Ese `throw` convierte el error HTTP en un rechazo que **viaja** hasta el `try/catch` del que llamó.
- Bonus: contemplo el `204 No Content` (algunos DELETE no traen body) devolviendo `null` en vez de intentar `.json()`.

### 5. Dos `await` en secuencia: ¿por qué no en paralelo?
**Consigna:** En `agregarAlCarrito` primero busco si el item ya existe y **después** hago POST o PATCH. ¿Por qué secuencial? ¿Cuándo usarías `Promise.all`?
**Código:** `js/carrito.js` → `agregarAlCarrito`
**Qué deberías responder:**
- Son operaciones **dependientes**: necesito el resultado del `authGet` (¿ya está el producto en el carrito?) para **decidir** si hago `authPatch` (sumar +1 a la cantidad) o `authPost` (crearlo). No se pueden lanzar juntas porque la segunda depende del dato de la primera.
- `Promise.all([...])` sirve cuando las operaciones son **independientes** y quiero esperarlas **juntas** (ej. traer productos y perfil a la vez). Espera a que todas resuelvan y, si una rechaza, rechaza todo.

### 6. El `await` en `init()` y el orden de ejecución
**Consigna:** En `init()` hay `await renderCatalogo()` antes de `renderDestacados()` y las demos. ¿Qué pasaría si sacás ese `await`?
**Código:** `app.js` → `init`, `renderCatalogo`, `renderDestacados`, `correrDemosFuncionales`
**Qué deberías responder:**
- `renderCatalogo` es quien **llena `productosCargados`** con los datos que trae Supabase (dentro de un `await obtenerProductos()`).
- Si saco el `await`, `renderDestacados()` y `correrDemosFuncionales(productosCargados)` correrían **antes** de que llegue la respuesta → trabajarían con el **array vacío** (la Promise todavía pendiente): carrusel vacío y `console.table` sin datos.
- El `await` **garantiza el orden temporal**: primero los datos, después lo que depende de ellos.

### 7. ¿Qué implica marcar una función como `async`?
**Consigna:** En `const obtenerProductos = async () => ...`, ¿qué agrega el `async`? ¿Qué devuelve **siempre** una función async?
**Código:** `app.js` → `obtenerProductos` · `js/producto.js` → `obtenerProducto`
**Qué deberías responder:**
- `async` marca la función como asíncrona: **siempre devuelve una Promise**, aunque adentro devuelva un valor plano (se envuelve automáticamente).
- Si adentro **lanzo** (`throw`), la Promise devuelta **se rechaza**.
- Por eso el que llama puede hacer `await obtenerProductos()` o `obtenerProductos().then(...)`.

### 8. Estado de carga y feedback en operaciones asíncronas
**Consigna:** Explicá el `"Cargando productos..."` de `renderCatalogo`. ¿Por qué es importante en una app que usa `fetch`?
**Código:** `app.js` → `renderCatalogo` (bloque `try/catch`)
**Qué deberías responder:**
- Entre que disparo el `fetch` y llega la respuesta pasa **tiempo** (la red no es instantánea). Muestro `"Cargando productos..."` con `replaceChildren` para dar **feedback** y no dejar un grid mudo.
- Cuando llegan los datos, limpio con `replaceChildren()` y pinto las cards. Si la tabla vino vacía, aviso ("No hay productos...").
- Si el `fetch` falla, el `catch` muestra un **mensaje de error** en vez de romper la página. Manejar los 3 casos (cargando / éxito / error) es buena UX de operaciones asíncronas.

---

## Sección B — Manejo de errores

### 9. Propagación de un error de red hasta la UI
**Consigna:** Seguí un error desde `manejarRespuesta` hasta el mensaje que ve el usuario.
**Código:** `js/api.js` → `manejarRespuesta` · `app.js` → `renderCatalogo`
**Qué deberías responder:**
- `manejarRespuesta` hace `throw new Error(...)` → esto **rechaza** la Promise que devuelve `apiGet`/`obtenerProductos`.
- Como `renderCatalogo` hace `await obtenerProductos()` **dentro de un `try`**, el rechazo cae en el **`catch`**.
- En el `catch` hago `console.error(...)` (para el desarrollador) y muestro un `<p>` de error con `replaceChildren` (para el usuario). Es la **cadena de propagación** de una promesa rechazada.

### 10. `.catch()` vs `try/catch` en un handler de evento
**Consigna:** ¿Por qué en `handlerCatalogo` uso `agregarAlCarrito(id).catch(...)` y no un `try/catch`?
**Código:** `app.js` → `handlerCatalogo`
**Qué deberías responder:**
- `handlerCatalogo` **no es `async`**. Para usar `try/catch` con `await` tendría que marcarlo `async`.
- Como es un callback de evento del tipo "disparo la acción y sigo", encadenar `.catch()` a la Promise es más directo para **capturar el rechazo** (mostrar `alert` + `console.error`) sin volver async al handler entero.
- Las dos formas son válidas; es una decisión de estilo según el contexto.

---

## Sección C — DOM y eventos

### 11. Event delegation con `closest()`
**Consigna:** Explicá cómo funciona la delegación de eventos en el catálogo. ¿Por qué un solo listener y no uno por card?
**Código:** `app.js` → `handlerCatalogo` y el `addEventListener` sobre `#catalogo-grid`
**Qué deberías responder:**
- Pongo **un solo** `addEventListener('click')` en el contenedor `#catalogo-grid`. Los clicks en las cards **burbujean** (bubbling) hasta él.
- `e.target.closest('.producto__carrito')` **sube por el DOM** desde el elemento clickeado hasta encontrar el botón de carrito (o `null` si el click fue en otro lado).
- Ventajas: **menos listeners** (mejor memoria/performance) y funciona con cards **agregadas dinámicamente** después del render, sin recablear nada.
- El `dataset.id` del botón me dice **a qué producto** corresponde.

### 12. `createElement` + `textContent` vs `innerHTML` (XSS)
**Consigna:** ¿Por qué construyo el DOM con `createElement`/`textContent` y nunca con `innerHTML` para datos? Dame el riesgo concreto.
**Código:** `js/utils.js` → `crearElemento` · `app.js` → `crearCard`
**Qué deberías responder:**
- `innerHTML` **interpreta el string como HTML**. Si un dato (nombre de producto, email, descripción) trae algo como `<img src=x onerror="...">` o `<script>`, se **ejecuta** → eso es un **XSS** (Cross-Site Scripting).
- `textContent` trata todo como **texto plano**: nunca ejecuta código, solo lo muestra como caracteres.
- En un ecommerce con datos que vienen de la base o de usuarios, es la **defensa** por defecto. Por eso hasta el helper `crearElemento` usa `textContent`, y las imágenes se setean por propiedad (`img.src`, `img.alt`), no por interpolación.

### 13. `replaceChildren()` para re-render
**Consigna:** ¿Qué hace `replaceChildren()` y por qué lo preferís antes que `innerHTML = ''`?
**Código:** `app.js` → `renderCatalogo` · `js/carrito.js` → `render`
**Qué deberías responder:**
- `replaceChildren()` sin argumentos **vacía** el contenedor; con nodos, **reemplaza** todo el contenido por esos nodos, todo **sin parsear HTML**.
- Lo uso para pasar de "Cargando..." a las cards y para el **re-render** del carrito tras un cambio.
- Es coherente con la regla de **no tocar `innerHTML`**, es explícito y evita reparsear strings.

---

## Sección D — Programación funcional

### 14. `.reduce()`: acumulador y valor inicial
**Consigna:** Explicá el `reduce` de `calcularTotal` (carrito) y el del "total facturable con IVA" (demos). ¿Qué son el acumulador y el valor inicial?
**Código:** `js/carrito.js` → `calcularTotal` · `app.js` → `correrDemosFuncionales`
**Qué deberías responder:**
- `reduce` recorre el array **acumulando** en un único valor. En el carrito: `(acc, item) => acc + item.productos.precio * item.cantidad`, con valor inicial **`0`**.
- El **valor inicial** importa: si no lo paso, `reduce` toma el primer elemento como acumulador inicial, lo que puede romper el tipo o el cálculo si el array es raro/vacío.
- En las demos acumulo `precio * 1.21` (IVA 21%) para el total facturable.

### 15. `.map()`, `.filter()`, `.find()` y encadenamiento
**Consigna:** Diferenciá los tres con un ejemplo del proyecto y mostrá un encadenamiento.
**Código:** `app.js` → `correrDemosFuncionales` · `renderDestacados`
**Qué deberías responder:**
- `.map()` **transforma** cada elemento y devuelve un array del **mismo largo**: `productos.map(p => p.nombre)`.
- `.filter()` **selecciona** los que cumplen una condición y devuelve un **subconjunto**: `productos.filter(p => p.stock > 0)`; también `filter(p => p.badge)` en `renderDestacados`.
- `.find()` devuelve **un solo** elemento (el primero que cumple) o `undefined`: `productos.find(p => p.marca === 'Stanley')`.
- **Encadenamiento**: `productos.filter(p => p.precio >= 100000).map(p => p.nombre)` — primero filtro los caros, después me quedo con sus nombres.

---

## Sección E — Fundamentos de JavaScript

### 16. `const`/`let`/`var` y `===` vs `==`
**Consigna:** ¿Por qué `const` por defecto y dónde usás `let`? ¿Por qué siempre `===`?
**Código:** `app.js` → `productosCargados` (es `let`) y el resto (casi todo `const`)
**Qué deberías responder:**
- `const` por defecto **evita reasignaciones accidentales** (impide reasignar el binding; no vuelve inmutable el objeto). Uso `let` **solo cuando reasigno**: `productosCargados` cambia cuando llega la respuesta del fetch.
- Nunca `var` porque tiene *hoisting* raro y scope de función (no de bloque).
- `===` compara **valor y tipo sin coerción**; `==` convierte tipos y da sorpresas (`0 == ''` es `true`, `null == undefined` es `true`). Usar `===` siempre = menos bugs y código más predecible.

### 17. `Number()`, `Number.isNaN()`, `Number.isInteger()` y validación de la URL
**Consigna:** ¿Por qué caste­o a `Number` y valido el `id` que viene de la URL?
**Código:** `js/producto.js` → `renderDetalle` (lectura de `?id=`) · `js/admin.js` → `leerFormulario`, `submit`
**Qué deberías responder:**
- Los `value` de los inputs y los **query params de la URL son strings**. `Number(...)` los convierte a número (`precio`, `stock`, `id`).
- En `producto.js` leo el id con `URLSearchParams` y valido `Number.isInteger(id) && id > 0` **antes de pedirlo a la API**, porque el usuario puede escribir `?id=abc` o `?id=-5` a mano → así no mando basura a Supabase y muestro "Producto no válido".
- En `admin.js` valido `Number.isNaN(datos.precio)` para no crear un producto con precio inválido. `Number.isNaN` es más seguro que el `isNaN` global (no hace coerción).

### 18. Template literals para armar las queries de PostgREST
**Consigna:** ¿Qué son los template literals y dónde los uso? ¿Algún riesgo?
**Código:** `js/carrito.js`, `js/sesion.js`, `js/api.js` (queries y headers)
**Qué deberías responder:**
- Son strings con **backticks** que permiten **interpolar** con `${...}` y escribir multilínea.
- Los uso para armar URLs de PostgREST: `?usuario_id=eq.${sesion.id}&producto_id=eq.${productoId}`, y headers: `` `Bearer ${token}` ``.
- Riesgo/matiz: interpolar en el querystring está OK acá porque son **ids/UUID controlados**. La regla de oro es **nunca** interpolar datos crudos del usuario dentro de **HTML** (para eso uso `textContent`, ver pregunta 12).

---

## Sección F — Sesión, `localStorage` y seguridad

### 19. Persistencia de sesión con `localStorage` + `JSON`
**Consigna:** ¿Cómo persiste la sesión entre recargas? ¿Qué guardo y qué NO?
**Código:** `js/sesion.js` → `guardarSesion`, `obtenerSesion`, `cerrarSesion`
**Qué deberías responder:**
- Al loguearse, guardo el objeto `{ token, id, email, rol }` en `localStorage` serializado con **`JSON.stringify`** (localStorage solo guarda strings, y **persiste** aunque cierre la pestaña).
- Para leerlo lo deserializo con **`JSON.parse`**; si no hay nada, devuelvo `null`.
- **NO** guardo la contraseña: la hashea **Supabase Auth** en el servidor y nunca viaja ni se persiste en claro. Lo que guardo del lado del cliente es el **token (JWT)** y datos no sensibles.
- `cerrarSesion` hace `localStorage.removeItem(...)` y redirige al inicio.

### 20. `anon key` vs `service_role`, RLS y el rol en `localStorage`
**Consigna:** ¿Por qué la `anon key` puede estar en el repo pero la `service_role` no? ¿Qué es RLS? ¿Qué pasa si un usuario se pone `rol: "admin"` a mano en `localStorage`?
**Código:** `js/config.js` (comentarios) · `js/sesion.js` → `requerirAdmin`, `headersAuth` · `docs/consigna-parcial-2.md`
**Qué deberías responder:**
- La **anon key** es **pública por diseño**: en un deploy estático (GitHub Pages) es inevitablemente visible y **no es un secreto**. Está protegida por **RLS**.
- **RLS (Row Level Security)** son **políticas en la base de datos** que deciden, fila por fila, qué puede leer/escribir cada quien según su JWT: cada usuario solo accede a **lo suyo** (`auth.uid()`), y el CRUD de productos exige rol admin verificado en la base (`es_admin()`).
- La **service_role key bypassa RLS** → jamás debe estar en el cliente ni en el repo.
- Si alguien edita `rol: "admin"` en `localStorage`: la **UI** le mostraría el link al panel (porque el front confía en ese valor para mostrar/ocultar), **pero** cuando intente **escribir** un producto, la base **rechaza** la operación, porque RLS valida el **JWT real** (no el localStorage). **La defensa de fondo está en el backend, no en el front** — es la deuda de seguridad educativa que documenté a propósito.

---

## Bonus — Términos que tenés que poder definir en una frase

Repaso relámpago; si te tiran la palabra suelta, tené la definición lista:

- **Promise:** objeto que representa el resultado futuro de una operación asíncrona (pending → fulfilled/rejected).
- **`async`:** marca una función que siempre devuelve una Promise.
- **`await`:** pausa una función `async` hasta que una Promise se resuelve; solo se usa dentro de `async`.
- **`fetch`:** API nativa del navegador para hacer requests HTTP; devuelve una Promise que resuelve a un `Response`.
- **`Response.ok`:** `true` si el status HTTP está en 200–299.
- **Event bubbling:** un evento se propaga desde el elemento clickeado hacia arriba por sus ancestros.
- **Event delegation:** un único listener en un ancestro que atiende eventos de muchos hijos (con `closest()`).
- **`dataset` / `data-*`:** atributos personalizados para guardar datos (ej. `data-id`) leídos en JS con `elemento.dataset.id`.
- **XSS:** inyección de código malicioso al insertar datos como HTML; se evita con `textContent`.
- **JWT:** token firmado que prueba la identidad del usuario; lo mando en el header `Authorization: Bearer`.
- **RLS:** reglas en la base de datos que filtran el acceso a las filas según quién sos.
- **PostgREST:** capa que expone las tablas de Postgres como una REST API con filtros en el querystring (`?id=eq.5`).
- **`localStorage`:** almacenamiento clave-valor del navegador, por origen, que persiste entre sesiones (solo strings).
- **CORS:** política del navegador que controla requests entre orígenes distintos (por eso abro con Live Server, no `file://`).
- **`defer`:** atributo del `<script>` que ejecuta el JS después de parsear el HTML (por eso no necesito `DOMContentLoaded`).

---

> **Tip para la defensa:** cuando expliques algo asíncrono, hacelo mostrando el
> recorrido: *"disparo el `fetch` → muestro 'Cargando' → `await` la respuesta →
> chequeo `ok` → parseo el JSON → pinto o muestro error"*. Contar el flujo completo
> demuestra que entendés el modelo asíncrono, que es lo que el profe quiere ver.
