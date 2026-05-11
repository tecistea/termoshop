# termoshop

Ecommerce educativo de termos (Stanley, Lumilagro, Waicom, Termolar) construido como entrega del **Parcial 1 de Aplicaciones Web Cliente — ISTEA 2026**.

Catalogo + detalle + contacto + ubicacion. Sin carrito ni checkout (fuera del alcance del parcial).

## Tecnologias

- **HTML5 semantico** (header, nav, main, section, article, footer)
- **CSS3 moderno** (custom properties, Grid 2D, Flexbox 1D, mobile-first con 3 breakpoints, animaciones con `@keyframes`, pseudo-elementos decorativos)
- **JavaScript vanilla ES6+** (const/let/arrow, ===, querySelector, createElement + textContent, event delegation con `closest()`, validacion con `preventDefault`, `Intl.NumberFormat`, metodos funcionales `.map/.filter/.find/.reduce`)
- **Google Fonts** (Bricolage Grotesque para titulos, Inter para cuerpo)

**Sin frameworks, sin build tools, sin librerias JS externas.**

## Como abrir el proyecto

### Opcion recomendada: Live Server (VS Code)

1. Abrir la carpeta del repo en **VS Code**.
2. Instalar la extension **Live Server** (`ritwickdey.LiveServer`) si todavia no la tenes.
3. Click derecho sobre `index.html` -> "**Open with Live Server**".
4. Se abre en el navegador en `http://127.0.0.1:5500/`.

### Alternativa: doble click en `index.html`

Funciona, pero algunos features (Google Fonts con `display=swap`, `loading=lazy` para imagenes/iframe) se comportan mejor sobre `http://` que sobre `file://`.

### Para ver las demos de programacion funcional

Abrir DevTools del navegador (F12) → pestaña **Console**. Al cargar la pagina vas a ver:

- `console.table(PRODUCTOS)` con la tabla del catalogo
- Logs de `.map`, `.filter`, `.find`, `.reduce`
- Logs de los dos encadenamientos: `filter + map` y `filter + reduce`

## Estructura del proyecto

```
termoshop/
├── index.html               Estructura semantica + form + iframe
├── estilos.css              Variables, layout responsive, animaciones
├── app.js                   Render dinamico, validacion, demos funcionales
├── README.md                Este archivo
├── .gitignore
├── docs/
│   ├── PR.md                Template del Pull Request (lo lleno yo durante el desarrollo)
│   └── prompts-usados.md    Log cronologico de prompts a Claude Code
├── scripts/
│   └── descargar_imagenes.py  Descarga + optimiza las imagenes (Pillow + requests)
└── productos-imagenes/      6 webp 600x600 RGB, total ~45 KB
```

Las imagenes de `productos-imagenes/` fueron descargadas desde sitios oficiales/retailers y optimizadas por `scripts/descargar_imagenes.py` (Pillow + requests). El producto Waicom Premium 1L usa un placeholder generado por el script porque la marca es regional y no tiene presencia online publica.

## Checklist de requisitos (36 items)

### Clase 1 — HTML5 semantico
- [x] DOCTYPE, `<html lang="es">`, meta charset UTF-8, meta viewport
- [x] Tags semanticos (`header`, `nav`, `main`, `section`, `article`, `footer`), un solo `<main>`
- [x] Vinculacion externa: `<link>` a `estilos.css` y `<script src defer>` a `app.js`

### Clase 2 — Formularios HTML5 y multimedia
- [x] Form con `method` y `action`
- [x] `<label for/id>` vinculado en cada input (placeholder NO es label)
- [x] Validacion HTML5 nativa: `required`, `minlength`, `maxlength`, `pattern`, `type=email`, `type=tel`
- [x] Controles: text, email, tel, select, textarea, checkbox required
- [x] `<img>` con `alt` y `loading="lazy"`
- [x] `<iframe>` con `title` y `loading="lazy"`

### Clase 3 — CSS moderno
- [x] CSS externo (sin inline, sin `<style>`)
- [x] `:root` con 10+ custom properties (colores, tipografia, espaciado, radios, sombras)
- [x] Reset universal con `box-sizing: border-box`
- [x] Grid 2D para el catalogo
- [x] Flexbox 1D para navbar y footer
- [x] Mobile-first con 3 breakpoints (base, 768px, 1024px) → grid 1/2/3 cols
- [x] `rem` en tipografia, `fr` en grid, `clamp()` en h1 del hero

### Clase 4 — Position, transitions, animations
- [x] Navbar `position: fixed; z-index: 100`
- [x] `.producto { position: relative }` + `.badge { position: absolute }`
- [x] `transition: transform 0.3s ease, box-shadow 0.3s ease` (NO `all`)
- [x] Hover: `translateY(-4px) scale(1.02)`
- [x] `@keyframes fadeInUp` aplicado a cards con `animation-delay` escalonado (`:nth-child(1..6)`) y `animation-fill-mode: forwards`
- [x] `::after` decorativo en `h2` (barra dorada) y en `.nav__link` (underline animado)

### Clase 5 — JavaScript DOM
- [x] JS externo con `defer`
- [x] `querySelector` / `querySelectorAll` en todo el codigo
- [x] Render de cards con `createElement` + `append` (cero `innerHTML` para datos del array)
- [x] `classList.add/remove/toggle` (nav activo, card expandida, input con-error)
- [x] `dataset.id` en cada card y boton
- [x] 3 `addEventListener` distintos: submit form, click delegado en catalogo, click en links del nav
- [x] Event delegation con `e.target.closest('.producto__boton')`
- [x] Validacion `submit` con `preventDefault`, errores con `createElement + textContent + .after()`, limpieza previa con `forEach(el => el.remove())`

### Clase 6 — Programacion en JavaScript
- [x] `const` por defecto, `let` solo si reasigna, NUNCA `var`
- [x] Arrow functions en TODOS los callbacks
- [x] `===` siempre, nunca `==`
- [x] Array de 6 productos con `{id, nombre, marca, capacidad, material, precio, stock, badge, imagen, descripcion}`
- [x] `formatearPrecio` arrow con `Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' })`
- [x] Demos: `.map`, `.filter`, `.find`, `.reduce`, `filter + map` y `filter + reduce` encadenados
- [x] `console.table(PRODUCTOS)`

## Regenerar imagenes

Si necesitas regenerar las imagenes de productos:

```bash
python scripts/descargar_imagenes.py
# para forzar la redescarga aunque ya existan:
python scripts/descargar_imagenes.py --force
```

El script requiere `Pillow` y `requests` (`pip install Pillow requests`).

## Autor

David Wuscovi (`dakovid`) — ISTEA 2026

Materia: Aplicaciones Web Cliente
