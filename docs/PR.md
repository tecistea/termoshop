# Pull Request - Parcial 1 termoshop

> **Template para documentar el desarrollo del parcial.**
> Para cada clase: (a) lo construi yo, (b) explicaciones tecnicas pegadas literales de Claude Code, (c) que modifique del codigo generado y por que **(a completar por mi)**, (d) "cuando la IA se equivoco" **(a completar por mi, minimo 3 entradas en total)**.

---

## Clase 1 — HTML5 semantico

### (a) Que construi
- `index.html` con DOCTYPE, `lang="es"`, meta charset UTF-8, meta viewport.
- Estructura semantica: `header > nav`, `main > section(hero) + section(catalogo) + section(contacto) + section(ubicacion)`, `footer`.
- Vinculacion externa de `estilos.css` y `app.js` (con `defer`).
- Google Fonts (Bricolage Grotesque + Inter) precargadas con `preconnect`.

### (b) Explicacion tecnica de Claude Code (pegada literal)

> **Por que `<script defer>` en lugar de `<script>` o `async`?**
>
> `defer` le dice al navegador: "descargá el JS en paralelo al parseo del HTML, pero ejecutalo recien cuando el DOM este completo y antes de `DOMContentLoaded`". Esto da dos beneficios concretos:
>
> 1. No bloquea el render. Un `<script>` sin `defer` para el parser HTML hasta que termina de descargar y ejecutar; con `defer` el HTML se sigue parseando.
> 2. No necesitamos envolver el codigo en `DOMContentLoaded`, porque cuando el script corre el DOM ya esta listo. Esto simplifica `app.js`.
>
> `async`, en cambio, ejecuta el script apenas se descarga, sin orden garantizado. Sirve para trackers/analytics, no para logica que depende del DOM. Para una app que renderiza UI, `defer` es la opcion correcta.

### (c) Que modifique del codigo generado y por que
*(a completar por mi)*

### (d) Cuando la IA se equivoco — Clase 1
*(a completar por mi)*

---

## Clase 2 — Formularios y multimedia

### (a) Que construi
- Form de contacto con `method="POST"`, `action="#"`, `novalidate` (validacion controlada por JS).
- 6 controles: text (nombre), email, tel, select (asunto), textarea (mensaje), checkbox (terminos).
- Cada input con su `<label for="...">` vinculado por `id`.
- Validaciones HTML5: `required`, `minlength`, `maxlength`, `pattern` (telefono solo digitos 10-15).
- Imagen destacada (`stanley-classic-14l.webp`) con `alt` descriptivo y `loading="lazy"`.
- Iframe de Google Maps con `title` y `loading="lazy"`.

### (b) Explicacion tecnica de Claude Code

> **Por que `novalidate` si igual queremos validacion?**
>
> Los popups nativos del browser (los tooltips amarillos que aparecen al submit con required) son inconsistentes entre navegadores y no se pueden estilar. `novalidate` los apaga, pero los atributos `required`, `pattern`, `type=email`, `minlength` siguen funcionando: el metodo `input.checkValidity()` los evalua y devuelve true/false. Asi conservamos la validacion declarativa del HTML pero presentamos los errores con nuestro propio diseño (span `.form__error` rojo abajo del input).

### (c) Que modifique del codigo generado y por que
*(a completar por mi)*

### (d) Cuando la IA se equivoco — Clase 2
*(a completar por mi)*

---

## Clase 3 — CSS moderno

### (a) Que construi
- `:root` con 19 custom properties (colores, tipografia, espaciado, radios, sombras, layout).
- Reset universal con `box-sizing: border-box`.
- Navbar Flexbox 1D fijada arriba.
- Catalogo Grid 2D mobile-first: 1 col base, 2 cols a 768px, 3 cols a 1024px.
- Tipografia con `rem`, grid con `fr`, hero h1 con `clamp(2rem, 6vw, 4rem)`.
- Footer Flexbox con `flex-wrap` para responsive.

### (b) Explicacion tecnica de Claude Code

> **Por que mobile-first con `@media (min-width: ...)`?**
>
> El enfoque mobile-first parte del estilo mas restrictivo (pantallas chicas) y va agregando reglas para pantallas mas grandes. Tiene dos ventajas:
>
> 1. **CSS mas chico y eficiente**. Las reglas base son las que mas dispositivos usan; las override solo se cargan cuando aplica el `min-width`.
> 2. **Performance percibida en mobile**. El device mas restrictivo no tiene que sobrescribir reglas de desktop. Si fueramos desktop-first con `max-width`, el celular cargaria todo el CSS de desktop primero y despues lo pisaria.
>
> En este proyecto: el catalogo arranca `grid-template-columns: 1fr` (1 columna), y a 768px lo pisamos a `repeat(2, 1fr)`, y a 1024px a `repeat(3, 1fr)`. Cada breakpoint suma, no resta.

### (c) Que modifique del codigo generado y por que
*(a completar por mi)*

### (d) Cuando la IA se equivoco — Clase 3
*(a completar por mi)*

---

## Clase 4 — Position, transitions, animations

### (a) Que construi
- Navbar `position: fixed; top: 0; z-index: 100`.
- Cards `position: relative` con badges `position: absolute` en top/right.
- `transition: transform 0.3s ease, box-shadow 0.3s ease` (especificas, NO `all`).
- Hover: `transform: translateY(-4px) scale(1.02)`.
- `@keyframes fadeInUp` aplicado a `.producto` con `animation-fill-mode: forwards`.
- `animation-delay` escalonado con `:nth-child(1..6)` (0ms, 100ms, 200ms...).
- `::after` decorativo en `.seccion__titulo` (barra dorada) y `.nav__link` (underline animado).

### (b) Explicacion tecnica de Claude Code

> **Por que `transition: transform, box-shadow` y NO `transition: all`?**
>
> Especificar las propiedades es mas performante y predecible:
>
> 1. `transition: all` anima TODO lo que cambie (color, padding, font, hasta cosas que no esperabas). El browser tiene que monitorear cada propiedad por si cambia, lo que genera overhead.
> 2. Especificar `transform` y `box-shadow` le dice al browser exactamente que monitorear. Ademas, `transform` y `opacity` son las dos unicas propiedades que el browser puede animar en la GPU sin recalcular layout, son las mas baratas.
> 3. Evita bugs sutiles: si manaña agregamos `color` en `:hover`, con `all` se animaria sin querer; con la lista explicita, no.

### (c) Que modifique del codigo generado y por que
*(a completar por mi)*

### (d) Cuando la IA se equivoco — Clase 4
*(a completar por mi)*

---

## Clase 5 — JavaScript DOM

### (a) Que construi
- `renderCatalogo()` que itera `PRODUCTOS.forEach(...)` y crea cada card con `document.createElement` + `append`, usando `textContent` para datos y propiedades (`img.src`, `img.alt`) para atributos.
- `dataset.id` en cada `<article>` y `<button>`.
- Event delegation: un solo listener en `#catalogo-grid` que detecta clicks con `e.target.closest('.producto__boton')`.
- Validacion del form con `e.preventDefault()`, `limpiarErrores()` antes de revalidar, `mostrarError(input, mensaje)` que crea un `<span class="form__error">` con `createElement + textContent` y lo inserta con `input.after(span)`.
- 3 `addEventListener` distintos: submit, click delegado en catalogo, click en nav (toggle clase `activa`).
- `classList.toggle('expandida')` para mostrar/ocultar descripcion del producto.

### (b) Explicacion tecnica de Claude Code

> **Por que `createElement + textContent` y NO `innerHTML` con interpolacion?**
>
> Cuando hacemos `contenedor.innerHTML = '<h3>' + producto.nombre + '</h3>'`, el browser **parsea ese string como HTML**. Si `producto.nombre` viniera del usuario y contuviera `<script>alert("XSS")</script>`, ese script se inyectaria y ejecutaria. Esto se llama **Cross-Site Scripting (XSS)**.
>
> Con `createElement + textContent`, el browser trata el contenido como **texto literal**: cualquier `<` se escapa automaticamente a `&lt;`, asi que es imposible inyectar etiquetas.
>
> Aunque en este parcial los datos son hardcoded (no hay riesgo real), adoptar la costumbre desde ahora evita bugs en el futuro cuando los datos vengan de un fetch a una API. Es la regla de seguridad #1 del DOM: **textContent para texto, propiedades especificas (`img.src`) para atributos, nunca innerHTML con datos**.

### (c) Que modifique del codigo generado y por que
*(a completar por mi)*

### (d) Cuando la IA se equivoco — Clase 5
*(a completar por mi)*

---

## Clase 6 — Programar en JavaScript

### (a) Que construi
- `const` por defecto en todo el codigo, `let` solo en `hayErrores`, cero `var`.
- Arrow functions en todos los callbacks (`(p) => p.nombre`, `(evento) => {...}`, etc).
- Comparaciones siempre con `===`.
- Array `PRODUCTOS` con 6 objetos (`{id, nombre, marca, capacidad, material, precio, stock, badge, imagen, descripcion}`).
- `formatearPrecio = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)`.
- Demos en consola:
  - `console.table(PRODUCTOS)`
  - `PRODUCTOS.map(p => p.nombre)` → array de nombres
  - `PRODUCTOS.filter(p => p.stock > 0)` → disponibles
  - `PRODUCTOS.find(p => p.marca === 'Stanley')` → primer Stanley
  - `PRODUCTOS.reduce((acc, p) => acc + p.precio * 1.21, 0)` → total con IVA 21%
  - `PRODUCTOS.filter(p => p.precio >= 100000).map(p => p.nombre)` → caros (encadenado)
  - `PRODUCTOS.filter(p => p.marca === 'Stanley').reduce((a, p) => a + p.stock, 0)` → stock Stanley (encadenado)

### (b) Explicacion tecnica de Claude Code

> **Por que `filter + reduce` encadenados y no un solo `reduce` con if adentro?**
>
> Las dos formas funcionan, pero `filter + reduce` es **mas legible y declarativo**:
>
> ```js
> // Encadenado (declarativo, "el que": qué hace cada paso)
> const stockStanley = PRODUCTOS
>   .filter(p => p.marca === 'Stanley')
>   .reduce((a, p) => a + p.stock, 0);
>
> // Reduce solo (imperativo, "el como": mezcla filtrado y acumulacion)
> const stockStanley = PRODUCTOS.reduce((a, p) => {
>   if (p.marca === 'Stanley') return a + p.stock;
>   return a;
> }, 0);
> ```
>
> El encadenado se lee como pipeline: "agarra los productos, filtra los Stanley, suma el stock". Cada metodo tiene una responsabilidad clara. Tiene una desventaja: itera el array dos veces (O(2n) en lugar de O(n)). Para 6 productos, irrelevante. Para 6 millones, ya habria que considerar la version imperativa o un transducer.

### (c) Que modifique del codigo generado y por que
*(a completar por mi)*

### (d) Cuando la IA se equivoco — Clase 6
*(a completar por mi)*

---

## Cuando la IA se equivoco (mínimo 3 entradas — vale 20% de la nota)

> **A completar por mí durante el desarrollo.** Documentar al menos 3 casos reales donde Claude Code se equivocó o me sugirió algo subóptimo, y cómo lo resolví.

### Caso 1
- **Que paso:**
- **Como lo detecte:**
- **Como lo resolvi:**

### Caso 2
- **Que paso:**
- **Como lo detecte:**
- **Como lo resolvi:**

### Caso 3
- **Que paso:**
- **Como lo detecte:**
- **Como lo resolvi:**
