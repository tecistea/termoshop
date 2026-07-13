# termoshop

Ecommerce educativo de termos (Stanley, Lumilagro, Waicom, Termolar) de **Aplicaciones Web Cliente — ISTEA 2026**.

- **Parcial 1:** catálogo + detalle + contacto + ubicación (vanilla puro, datos hardcodeados).
- **Parcial 2:** backend con **Supabase** — CRUD de productos, autenticación con roles y carrito de compras (ver [sección Parcial 2](#parcial-2--supabase-roles-y-carrito)).

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

---

# Parcial 2 — Supabase, roles y carrito

El parcial 2 evoluciona el proyecto a un ecommerce con **backend real (Supabase)** manteniendo el stack vanilla: **todo el acceso al backend es vía `fetch` a la REST/Auth API de Supabase, sin SDK**.

Consigna completa: [docs/consigna-parcial-2.md](docs/consigna-parcial-2.md).

## Qué se agregó

- **CRUD de productos** persistido en Supabase (el catálogo deja de estar hardcodeado).
- **Autenticación** con Supabase Auth y **dos roles** (`usuario`, `admin`).
- **Carrito de compras** por usuario + **checkout** que genera una orden.

### Páginas nuevas

| Página | Para qué |
|---|---|
| `index.html` | Catálogo (ahora desde Supabase) + botón "Agregar al carrito" |
| `login.html` | Inicio de sesión |
| `registro.html` | Registro de nuevos usuarios |
| `admin.html` | Panel CRUD de productos (solo admin) |
| `carrito.html` | Carrito del usuario + checkout |

### Archivos JS nuevos (`js/`)

- `config.js` — URL y anon key de Supabase.
- `api.js` — wrapper `fetch` sobre la REST (anon key).
- `sesion.js` — auth, sesión, guard de roles y `fetch` autenticado (JWT del usuario).
- `login.js`, `admin.js`, `carrito.js` — lógica de cada página.

## Cache-busting de los assets

Los `<script>` y el `<link>` del CSS llevan un parámetro de versión
(`estilos.css?v=<hash>`, `js/app.js?v=<hash>`) para que el navegador no
sirva versiones viejas cacheadas cuando cambia el código. El `<hash>` es
el del commit git, así que se renueva en cada commit.

Se aplica con [tools/cache-bust.js](tools/cache-bust.js):

```bash
node tools/cache-bust.js          # versiona con el commit actual
node tools/cache-bust.js abc1234  # versiona con un hash a mano
```

Para que se ejecute **solo** en cada commit, hay un hook pre-commit
versionado en [tools/hooks/pre-commit](tools/hooks/pre-commit). Instalarlo
una vez tras clonar:

```bash
git config core.hooksPath tools/hooks
```

(en Windows/macOS/Linux funciona igual). Desde ahí, `git commit` renueva
los `?v=` y re-agrega los HTML automáticamente.

## Puesta en marcha (Supabase)

1. Crear un proyecto en [supabase.com](https://supabase.com).
2. **SQL Editor → New query** → pegar y correr [db/schema.sql](db/schema.sql) (crea tablas, RLS, trigger y seed de los 6 termos).
3. En `js/config.js`, poner tu `SUPABASE_URL` y tu **anon key** (Project Settings → API).
4. Abrir el sitio con **Live Server** (no `file://`, por CORS).

### Crear un admin

1. Registrarse desde `login.html` con el email que será admin.
2. En el SQL Editor de Supabase:
   ```sql
   update perfiles set rol = 'admin' where email = 'tu-email@ejemplo.com';
   ```
3. Volver a iniciar sesión: ya verás el link **Admin** en la navbar.

> El rol **no se puede cambiar desde la app** (lo protege RLS): se eleva a admin solo desde Supabase.

## Seguridad de datos sensibles

- **Contraseñas:** las gestiona **Supabase Auth** (hasheadas en el servidor). La app **nunca** las guarda ni las pone en tablas propias.
- **anon key:** es **pública por diseño** y, en un deploy estático (GitHub Pages), inevitablemente visible. No es un secreto. La `service_role` key **jamás** debe estar en el cliente ni en el repo.
- **RLS estricto:** cada usuario solo accede a **su** carrito y **sus** órdenes (`auth.uid()`); el CRUD de productos exige rol admin verificado en la base (`es_admin()`). Aunque alguien fuerce la UI, la base rechaza la operación.

> Deuda asumida (educativa): el rol llega al cliente y la UI confía en él para mostrar/ocultar el panel admin. La defensa de fondo está en RLS, no en el front.

## Despliegue en GitHub Pages

Al ser un sitio estático, se puede publicar en **GitHub Pages** (Settings → Pages → rama y carpeta raíz). La anon key viaja al cliente (es correcto); la seguridad la sostienen Supabase Auth + RLS.

---

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
