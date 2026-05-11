# Pull Request - Parcial 1 termoshop

> **Documentación del desarrollo del parcial.**
> Para cada clase: (a) lo construí, (b) explicaciones técnicas pegadas literales de Claude Code, (c) qué modifiqué del código generado y por qué, (d) "cuando la IA se equivocó".

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
- **Agregue `<meta name="description">` y `<meta name="author">`** que Claude Code no habia incluido. Para un ecommerce real, el meta description es lo que aparece en los resultados de Google, asi que vale la pena ponerlo desde el dia 1.
- **Sumé `preconnect` a `fonts.googleapis.com` y `fonts.gstatic.com`** antes del `<link>` de Google Fonts. Sin esto, el browser tiene que resolver DNS + abrir conexion TLS recien al ver el `<link>`, lo que retrasa el primer pintado de texto. Con preconnect, esas dos cosas pasan en paralelo al parseo del HTML.
- **Pase el `<a>` de "Mi carrito" del nav a un `<a class="nav__cta">`** porque, aunque la consigna no pide carrito, queria que se vea como un boton de accion principal y no como un link mas del menu.

### (d) Cuando la IA se equivoco — Clase 1
La primera version del HTML tenia varios `<h1>` (uno por seccion). Solo deberia haber un `<h1>` por documento (el del hero). Lo detecte cuando le pase el HTML por el validador W3C y me devolvio warnings. Lo corregi cambiando los titulos de seccion a `<h2 class="seccion__titulo">`.

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
- **Pattern del telefono lo ajuste a `[0-9]{10,15}`**. La primera version era `[0-9]{8}` (estricto a 8 digitos), pero en Argentina los celulares tienen 10-13 digitos segun el formato (con o sin prefijo 11 / 54-9). El rango 10-15 cubre todos los casos comunes incluyendo internacional.
- **Agregue `autocomplete="name"`, `autocomplete="email"`, `autocomplete="tel"`** en los inputs correspondientes. No es un requisito del parcial pero mejora mucho la UX en mobile (el browser autocompleta con los datos guardados).
- **Saque el campo "apellido"** que Claude Code habia agregado por su cuenta. La consigna no lo pedia y prefiero un form mas corto que aumente la tasa de conversion.

### (d) Cuando la IA se equivoco — Clase 2
La primera version del checkbox de terminos no tenia `required`, asi que el form se podia enviar sin aceptar terminos. Ademas el `<label>` estaba ANTES del `<input>` (afuera). Lo cambie para que el `<input type="checkbox">` viva DENTRO del `<label>`, asi el click en el texto tambien tickea el checkbox sin necesidad de `for/id`. Es un detalle de accesibilidad chico pero importante.

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
- **Cambie la paleta original** (que era azul/gris generico) por una mas tematica del rubro: verde militar Stanley (`#2C3E2D`), dorado mate (`#C9A961`), crema fondo (`#F5F1EA`). Estos colores conectan con la cultura del mate/termo argentino y diferencian la marca de un ecommerce genérico.
- **Agregue `scroll-padding-top: var(--altura-nav)`** al `html` para que cuando se haga scroll a un ancla (`#catalogo`), el contenido no quede TAPADO por la navbar fixed. Sin esto, el primer renglon de cada seccion quedaba escondido.
- **Use `clamp(2rem, 6vw, 4rem)` en el h1 del hero** en lugar de un `font-size` fijo o con media queries. Asi el titulo escala SUAVEMENTE entre mobile y desktop sin necesidad de breakpoints adicionales.

### (d) Cuando la IA se equivoco — Clase 3
La primera version del CSS tenia `transition: all 0.3s ease` en `.producto`. La consigna explicitamente prohibe usar `transition: all` (el PDF de Clase 4 lo aclara: "transicioná propiedades específicas — el all puede afectar propiedades que no querías"). Lo reemplace por `transition: transform 0.3s ease, box-shadow 0.3s ease`. Tambien tuve que verificar uno por uno los otros `transition` del archivo, porque la IA habia usado `all` en mas de un lugar.

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
- **Reduje el `animation-delay` escalonado de 200ms a 100ms entre cards**. La primera version (200ms) hacia que la ultima card recien apareciera a los 1200ms, lo que se sentia lento. Con 100ms el efecto cascada se completa en 600ms, que es el sweet spot para no parecer lento ni demasiado abrupto (regla de UI: las animaciones de entrada deberian durar entre 200-500ms).
- **Cambie el hover de las cards de `transform: scale(1.05)` a `translateY(-4px) scale(1.02)`**. Solo escalar daba la sensacion de "zoom" raro; combinado con un leve "elevarse" simula que la card cobra profundidad, que es el efecto premium que querias.
- **Agregue `transform-origin: bottom` en el underline animado de los nav links**, pero despues lo saque porque `width: 0 -> 100%` ya hacia el efecto sin necesidad de transform.

### (d) Cuando la IA se equivoco — Clase 4
La primera version aplicaba `animation: fadeInUp` directamente a `.producto` SIN `animation-fill-mode: forwards`. Resultado: las cards aparecian con la animacion, pero al terminar volvian al estado inicial del keyframe (opacity: 0). Las cards se mostraban un segundo y desaparecian. Lo agregue, y ahi recien se quedaron visibles. Es un error tipico de quien copia un snippet sin entender que el estado final del @keyframes no persiste por defecto.

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
- **Corregi el bug de insercion del error en el checkbox de terminos**. La version original hacia `input.after(span)`, pero el `<input type="checkbox">` esta envuelto DENTRO del `<label>`, asi que el `span.form__error` quedaba entre el checkbox y el texto "Acepto los terminos". Visualmente quedaba feo. Lo cambie a:
  ```js
  const labelEnvoltorio = input.closest('label');
  const anchor = labelEnvoltorio || input;
  anchor.after(span);
  ```
  Asi el error queda DESPUES del label completo, alineado con como se ven los errores de los otros campos.
- **Agregue `if (!contenedor) return;`** y `if (form)` antes de hacer querySelector y addEventListener. La IA originalmente asumia que los elementos siempre existian. En caso de que el HTML cambie o se incluya el JS en otra pagina, esos guards evitan errores del estilo `Cannot read property 'addEventListener' of null`.
- **Use `Number(boton.dataset.id)`** para convertir el `data-id` (que siempre es string) a numero antes de buscarlo con `.find()`. Sin la conversion, el `===` del find no matchea (`'4' === 4` es `false`).

### (d) Cuando la IA se equivoco — Clase 5
La IA me genero un boton con `<button onclick="...">` en una version intermedia del codigo cuando le pedi agregar un detalle. Esto rompe TODA la regla de separar JS del HTML (Clase 5 explicitamente prohibe inline JS). Lo detecte revisando el HTML antes de commitear y le dije que reemplazara por `addEventListener` en el JS. Es el reflejo tipico de la IA: cuando esta apurada, vuelve a patrones viejos faciles de explicar.

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
- **Cambie el producto #4 de "Lumilagro Senderito 500ml" (inventado) a "Lumilagro Terra 600cc" (producto real)**. Verifique en lumilagro.com.ar/tienda/ y el "Senderito" no figura en el catalogo actual de la marca. Terra es un producto real con presencia oficial. Cambie nombre, capacidad, precio, descripcion y nombre de archivo de imagen.
- **Ajuste los precios de los productos a valores mas realistas para mayo 2026 en Argentina** (Stanley Classic 1.4L a $215.000, Lumilagro Luminox a $39.500, etc). La primera version tenia precios de 2023 que ya no son creibles en una economia inflacionaria.
- **Use `maximumFractionDigits: 0` en `Intl.NumberFormat`** para que los precios se muestren como `$ 215.000` y no como `$ 215.000,00`. Para precios redondos de termos, los decimales sobran y ensucian la UI.

### (d) Cuando la IA se equivoco — Clase 6
La IA invento un producto que no existe: "Lumilagro Senderito 500ml". Lo presento con descripcion convincente y precio coherente, asi que parecia real. Recien lo detecte cuando buscamos su imagen real en lumilagro.com.ar y no aparecio en ninguna categoria. **Aprendizaje: la IA confabula con confianza. Si pedis "6 productos reales", asume que sabe los nombres correctos, pero puede inventar uno que suene plausible**. Para el proximo proyecto: pedir explicitamente que cada producto venga con un link de verificacion al sitio oficial.

---

## Cuando la IA se equivoco — Casos principales (vale 20% de la nota)

> Tres casos representativos donde Claude Code se equivoco o me sugirio algo subóptimo, y como los detecte/resolvi. Estos son los mas grandes; los chicos quedan documentados en cada (d) por clase.

### Caso 1 — Producto inventado: "Lumilagro Senderito 500ml"

- **Que paso:** Al pedirle 6 productos reales de termos argentinos, Claude Code inventó "Lumilagro Senderito 500ml" como uno de los productos. Le puso descripcion plausible ("termo compacto para llevar al trabajo o caminata"), precio coherente ($22.000) y nombre de archivo de imagen consistente con el resto del catalogo. La invencion era indistinguible de un producto real solo leyendo el codigo.
- **Como lo detecte:** Cuando lleg el momento de descargar la imagen, le pedi que la buscara en el sitio oficial de Lumilagro. La IA descargo una imagen que mostraba 3 botellas termicas de colores, claramente no un "termo Senderito" tradicional. En la verificacion visual (mosaico de las 6 imagenes) note que la imagen no coincidia con la descripcion del producto. Verifique manualmente en lumilagro.com.ar/tienda/ y el modelo "Senderito" no figura en ninguna categoria actual del catalogo (Luminox, Terra, Pampa, etc.).
- **Como lo resolvi:** Reemplace el producto inventado por "Lumilagro Terra 600cc" (producto real, vigente, con imagen oficial limpia en lumilagro.com.ar). Actualice `app.js` (objeto id:4), `scripts/descargar_imagenes.py` (URL y nombre de archivo) y borre la imagen vieja. Todo en un solo commit `fix:`.

### Caso 2 — Imagen oficial con overlay promocional encima del producto

- **Que paso:** Para el "Stanley Mate System 800ml", la IA descargo una imagen del sitio oficial de Stanley Argentina (stanley1913.ar). El URL era oficial y la marca correcta, pero la imagen tenia un overlay promocional pegado encima del producto: "CON PICO CEBADOR INCLUIDO" arriba y "la tapa es un mate" al costado, sobre badges decorativos. No era una imagen limpia de producto sobre fondo blanco — parecia banner publicitario.
- **Como lo detecte:** Verificacion visual con el mosaico 3x2 de las 6 imagenes. La imagen pasaba el filtro automatico del script (es 600x600, fondo blanco, pesa <100KB), pero a simple vista no era apropiada para una card de ecommerce profesional.
- **Como lo resolvi:** Le pedi que buscara una URL alternativa, sugiriendo retailers (toromates.com en CloudFront/Empretienda) que suelen tener imagenes limpias. La nueva imagen vino sin overlays, fondo blanco prolijo, y reemplaza a la anterior en el mismo nombre de archivo asi `app.js` no necesito ningun cambio.

### Caso 3 — Carpeta `productos-imagenes/` referenciada en codigo pero nunca creada

- **Que paso:** Despues de generar HTML + CSS + JS + README, el codigo referenciaba `productos-imagenes/stanley-classic-14l.webp` y otras 5 imagenes. El README incluso decia "6 webp optimizados (<100KB c/u) en productos-imagenes/". Pero la carpeta no existia. Al abrir la pagina con Live Server, las 6 cards y la imagen destacada de la seccion "Ubicacion" mostraban iconos rotos.
- **Como lo detecte:** Le pedi a Claude.ai una auditoria del repo local antes de pushear: "fijate que falta". Lei los archivos uno por uno contra los 36 requisitos del contrato y detecto que el README mencionaba `productos-imagenes/` pero `Filesystem:list_directory` no la encontraba en el repo.
- **Como lo resolvi:** Le pedi a Claude Code que escribiera un script Python (`scripts/descargar_imagenes.py`) que descarga las 6 imagenes desde sitios oficiales / retailers, las redimensiona a 600x600 max, las convierte a WebP quality 85, y deja un fallback a placeholder generado si la descarga falla (caso util para Waicom, marca regional sin presencia online publica). El script es idempotente con `--force` para regenerar. Final: 6 imagenes correctas, total 42.5 KB.

---

## Resumen del historial de commits en `parcial-1`

```
feat(html): estructura semantica y formulario de contacto
feat(css): sistema de variables, grid responsive y animaciones
feat(js): render dinamico, validacion y metodos funcionales
docs: README y template de PR
feat(assets): descarga y optimizacion de imagenes de productos
fix: imagenes limpias, producto Terra real, error en checkbox y README
chore: ignorar .claude/ y CLAUDE.md
docs: completar prompts-usados, casos de IA y screenshots
```

Cada commit corresponde a una etapa logica del desarrollo, alineada con la evaluacion por clases.

---

**Autor:** David Wuscovi (`dakovid`)
**Materia:** Aplicaciones Web Cliente — ISTEA 2026
