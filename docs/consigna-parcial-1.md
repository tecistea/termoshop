# Consigna — Parcial 1

> **Materia:** Aplicaciones Web Cliente
> **Institución:** ISTEA
> **Cuatrimestre:** 1° / 2026
> **Proyecto:** `termoshop` (ecommerce simple de termos, sin carrito ni checkout)

---

## Origen de esta consigna

La cátedra no entrega una hoja de requisitos explícita. La evaluación se basa en lo que se ve en cada PR contra los temas vistos en clase.

Este archivo **reconstruye los requisitos verificables a partir de las 6 clases dictadas** (PDFs subidos al campus):

1. Clase 1 — Setup · HTML5 · Tu primer agente de terminal
2. Clase 2 — DevTools · Formularios HTML5 · Multimedia
3. Clase 3 — CSS Moderno · Selectores · Flexbox · Variables
4. Clase 4 — Position · Transiciones · Animaciones · Layout Completo
5. Clase 5 — JavaScript · DOM · Eventos · Selectores
6. Clase 6 — Programando en JavaScript · Variables · Funciones · Arrays

Cada slide final de "Práctica de hoy" + las decisiones técnicas mostradas en las slides intermedias se traducen acá en **36 ítems numerados y verificables**, contra los cuales el alumno puede autoevaluarse y el docente puede chequear en el PR.

---

## Entregables

- **Código:** `index.html`, `estilos.css`, `app.js` (archivos separados, vanilla, sin frameworks).
- **Documentación:** `README.md` (descripción + cómo abrir + checklist) y `docs/PR.md` (explicaciones técnicas + casos de error de la IA).
- **Log de prompts:** `docs/prompts-usados.md` con los prompts importantes y reflexión.
- **Entrega formal:** rama `parcial-1` pusheada a GitHub + Pull Request abierto contra `main`.

---

## Criterios de evaluación

| Criterio | Peso | Qué se mira |
|---|---|---|
| **Historial de PRs** | 30% | Commits semánticos por clase, mensajes claros, secuencia lógica del trabajo. |
| **Calidad de prompts** | 30% | Evolución desde prompts vagos hacia prompts técnicos y precisos. Reflexión documentada. |
| **Cuándo la IA se equivocó** | 20% | Mínimo 3 casos reales documentados con qué pasó / cómo lo detecté / cómo lo resolví. |
| **Proyecto funcionando** | 20% | Demo en vivo de 10 min en la última clase. Se permite usar la IA durante la defensa. |

---

## Requisitos verificables (36 ítems)

### Clase 1 — HTML5 semántico

1. `<!DOCTYPE html>`, `<html lang="es">`, `<meta charset="UTF-8">`, `<meta name="viewport">`.
2. Estructura con tags semánticos: `header`, `nav`, `main`, `section`, `article`, `footer`. Un solo `<main>` en el documento.
3. Vinculación externa: `<link>` a `estilos.css` y `<script src>` con `defer` a `app.js`.

### Clase 2 — Formularios HTML5 y multimedia

4. Formulario de contacto con `method` y `action` declarados.
5. Cada input con su `<label for/id>` vinculado (placeholder NO reemplaza al label).
6. Validación HTML5 nativa: `required`, `minlength`/`maxlength`, `pattern`, `type=email`, `type=tel`.
7. Controles usados: `text`, `email`, `tel`, `select` con `<option>`, `textarea`, `checkbox` con `required`.
8. Multimedia: al menos 1 `<img>` con atributo `alt` obligatorio y `loading="lazy"`.
9. Al menos 1 `<iframe>` (Google Maps o similar) con atributo `title` y `loading="lazy"`.

### Clase 3 — CSS moderno

10. Vinculación externa: archivo `estilos.css` separado (NO inline, NO `<style>`).
11. `:root` con mínimo 6 variables CSS custom properties.
12. Reset universal: `*, *::before, *::after { box-sizing: border-box }`.
13. Layout en 2 dimensiones con **CSS Grid** para el catálogo de cards.
14. Layout en 1 dimensión con **Flexbox** para la navbar y/o footer.
15. Responsive **mobile-first** con `@media (min-width: ...)`. Mínimo 3 breakpoints (base mobile, tablet ~768px, desktop ≥1024px). Grid de cards: 1 col mobile, 2 cols tablet, 3 cols desktop.
16. Uso de unidades modernas: `rem` para tipografía, `fr` para grid, al menos un uso de `clamp()` o `calc()`.

### Clase 4 — Position, transitions, animations

17. Navbar con `position: fixed`, `z-index ≥ 100`.
18. Al menos 1 elemento con padre `position: relative` + hijo `position: absolute` (ej: badge "NUEVO"/"OFERTA" sobre las cards).
19. Cards con `transition` en `transform` y `box-shadow` (NO usar `transition: all`). Hover effect con `transform: translateY()` y/o `scale()`.
20. Al menos 1 `@keyframes` (ej: `fadeInUp`) aplicado a las cards al cargar la página, con `animation-delay` escalonado entre cards (`:nth-child`) y `animation-fill-mode: forwards`.
21. Al menos 1 pseudo-elemento `::before` o `::after` con `content: ''` cumpliendo función decorativa.

### Clase 5 — JavaScript y DOM

22. JS en archivo externo (NO inline, NO `<script>` embebido). Vinculación con `<script src>` `defer`.
23. Selección de elementos con `querySelector` / `querySelectorAll`.
24. Render dinámico de las cards del catálogo desde un array, usando `document.createElement` + `append`. **Prohibido** usar `innerHTML` para datos del array (XSS).
25. Uso de `classList` (`add` / `remove` / `toggle`) para estados.
26. Uso de `dataset` para guardar el id de producto en cada botón (`data-id` en HTML, `dataset.id` en JS).
27. Al menos 3 `addEventListener` distintos (ej: click en links del nav, submit del form, click delegado en el grid).
28. Event delegation: un solo listener en el contenedor del catálogo que detecte clicks usando `e.target.closest()`.
29. Validación JS del formulario en el evento `submit` con `e.preventDefault()`. Mensajes de error creados con `createElement` + `textContent` (NO `innerHTML`). Limpiar errores previos antes de revalidar.

### Clase 6 — Programando en JavaScript

30. `const` por defecto, `let` solo si se reasigna, **nunca** `var`.
31. Arrow functions en todos los callbacks.
32. Comparaciones **siempre** con `===` (nunca `==`).
33. Array de mínimo 6 productos como objetos con propiedades `{ id, nombre, precio, stock, ... }`.
34. Función arrow para formatear precios (sugerencia: `Intl.NumberFormat('es-AR')`).
35. Uso demostrado en consola de los 4 métodos funcionales: `.map()` (transformar), `.filter()` (seleccionar), `.find()` (uno), `.reduce()` (acumular). Incluir al menos un encadenamiento `filter + map` o `filter + reduce`.
36. `console.table()` del catálogo al cargar.

---

## Constraints técnicos

- **HTML + CSS + JS vanilla**, archivos separados.
- **NO frameworks** (React, Vue, Angular, etc).
- **NO build tools** (Webpack, Vite, Parcel, etc).
- **NO librerías JS externas** (jQuery, Lodash, etc).
- **Google Fonts permitido** (es CSS externo, no JS).
- Código en español (variables, funciones, comentarios).
- Indentación prolija, comentarios cortos donde haga falta.

---

## Documentación esperada en el repo

```
termoshop/
├── index.html
├── estilos.css
├── app.js
├── README.md                  Descripción + tecnologías + cómo abrir + checklist
├── .gitignore
├── docs/
│   ├── consigna-parcial-1.md  Este archivo
│   ├── PR.md                  Template del PR con explicaciones técnicas
│   └── prompts-usados.md      Log de prompts importantes
├── productos-imagenes/        Imágenes de los productos
└── scripts/                   Scripts auxiliares (opcional)
```

### `README.md`
Descripción del proyecto, stack, cómo abrirlo (Live Server), estructura, checklist de los 36 requisitos cumplidos.

### `docs/PR.md`
Por cada una de las 6 clases:
- **(a)** Qué construí en esa clase.
- **(b)** Explicación técnica de la IA (pegada literal del output).
- **(c)** Qué modifiqué del código generado y por qué.
- **(d)** Cuando la IA se equivocó en esta clase.

Al final: 3 casos representativos donde la IA se equivocó (con qué pasó / cómo lo detecté / cómo lo resolví).

### `docs/prompts-usados.md`
Log cronológico de los prompts importantes:
- Contexto (qué estaba intentando lograr).
- Prompt literal.
- Reflexión (qué funcionó, qué cambiaría).

---

## Flujo de trabajo (sugerido)

1. `git checkout -b parcial-1` desde `main`.
2. Implementar HTML → commit `feat(html): ...`.
3. Implementar CSS → commit `feat(css): ...`.
4. Implementar JS → commit `feat(js): ...`.
5. Documentar README y PR.md → commit `docs: ...`.
6. Sumar assets faltantes (imágenes, scripts) → commit `feat(assets): ...`.
7. Corregir bugs y refactorear → commits `fix: ...`.
8. Completar `docs/prompts-usados.md` y `docs/PR.md` con reflexión real → commit `docs: ...`.
9. `git push -u origin parcial-1`.
10. Abrir Pull Request `parcial-1 → main` en GitHub con descripción que incluya checklist y casos de IA.
11. Defender en vivo el día de la fecha.

---

**Nota:** Esta consigna NO es un documento oficial de la cátedra. Es una **interpretación verificable** de los temas vistos en clase, construida para servir como contrato del proyecto. Si la cátedra publica requisitos formales que contradicen este documento, prevalecen los oficiales.
