# Prompts usados — Parcial 1 termoshop

> Log cronológico de los prompts que usé durante el desarrollo del parcial.
> Vale el **30% de la nota** (calidad de prompts: evolución desde prompts vagos hasta prompts técnicos y precisos).

## Metodología de trabajo

Usé un **workflow de dos modelos** durante todo el parcial:

1. **Claude.ai** (chat web) lo usé como **asistente de planificación y revisión**: para sintetizar la consigna a partir de los PDFs de las clases, armar prompts técnicos, verificar el estado del repo y revisar visualmente las imágenes descargadas.
2. **Claude Code** (CLI en VS Code) lo usé como **ejecutor**: el que efectivamente genera, modifica y commitea archivos en el repo local.

Esta separación me dio dos ventajas concretas:
- Claude.ai tiene contexto del proyecto (los 6 PDFs de las clases subidos como referencia) y puede leer todo de una sola vez sin gastar tokens en cada turno.
- Claude Code trabaja directo sobre el filesystem y hace los commits, sin tener que copiar/pegar archivos entre ventanas.

Los prompts de abajo están en orden cronológico, con `[A]` para los que pasé a Claude.ai y `[CC]` para los que pasé a Claude Code.

---

## Prompt 1 `[A]` — Planteo inicial del parcial

### Contexto
Antes de tocar código, le pedí a Claude.ai que me armara un prompt para Claude Code, dándole los datos básicos del proyecto y el repo.

### Prompt
```
armame un prompt para cumplir con el parcial 1 de la materia,
el mismo sera alojado en:

proyecto termoshop, ecommerce simple, especializado en termos

https://github.com/tecistea/termoshop.git

carpeta local: C:\Development\ISTEA\repos\termoshop
```

### Reflexión
Este fue mi prompt más "vago" del parcial — no di constraints, no expliqué qué evaluaba la cátedra, no aclaré que iba a usar Claude Code. Pero fue útil como punto de partida porque me obligó a darme cuenta de que **no tenía una consigna escrita**. La cátedra evalúa por evolución de PRs y por documentación, no entrega una hoja con requisitos. Esto me marcó el problema central: sin requisitos verificables explícitos, ningún agente puede planificar bien.

---

## Prompt 2 `[A]` — Consigna sintetizada de los 6 PDFs

### Contexto
Claude Code, en su primera respuesta, me dijo literalmente: *"no puedo avanzar con un plan serio sin la consigna, porque define qué cosas son requisitos calificables versus decisiones libres mías"*. Tenía razón. Volví a Claude.ai y le pedí que extrajera los requisitos verificables de los 6 PDFs de las clases (Position, Formularios, CSS Moderno, JS y DOM, Programar en JS, Intro).

El resultado fue una consigna de 36 ítems numerados, agrupados por clase. La pegué tal cual como contrato del proyecto.

### Prompt (versión final que terminé usando contra Claude Code)
```
CONSIGNA - PARCIAL 1 - APLICACIONES WEB CLIENTE (ISTEA 2026)

Proyecto: termoshop (ecommerce de termos, sin carrito ni checkout)

ENTREGABLES:
- index.html, estilos.css, app.js (archivos separados)
- README.md y PR documentado en rama `parcial-1`

REQUISITOS VERIFICABLES POR CLASE:

[CLASE 1 - HTML5 semantico]
1. DOCTYPE html5, html lang="es", meta charset UTF-8, meta viewport.
2. Estructura con tags semanticos: header, nav, main, section, article, footer.
   Un solo <main> en el documento.
3. Vinculacion externa: <link> a estilos.css y <script src> con defer a app.js.

[CLASE 2 - Formularios HTML5 y multimedia]
4. Formulario de contacto con method y action declarados.
5. Cada input con su <label for/id> vinculado (placeholder NO es label).
6. Validacion HTML5 nativa: required, minlength/maxlength, pattern,
   type=email, type=tel.
7. Controles usados: text, email, tel, select con options, textarea,
   checkbox required.
8. Multimedia: al menos 1 <img> con alt obligatorio y loading="lazy".
9. Al menos 1 iframe (Google Maps o similar) con atributo title y
   loading="lazy".

[CLASE 3 - CSS moderno]
10. Vinculacion externa: archivo estilos.css separado (NO inline,
    NO <style>).
11. :root con minimo 6 variables CSS custom properties.
12. Reset: *, *::before, *::after { box-sizing: border-box }.
13. Layout en 2 dimensiones con CSS Grid para el catalogo de cards.
14. Layout en 1 dimension con Flexbox para la navbar y/o footer.
15. Responsive MOBILE-FIRST con @media (min-width: ...). Minimo 3
    breakpoints: base mobile, tablet ~768px, desktop >=1024px.
    Grid de cards: 1 col mobile, 2 cols tablet, 3 cols desktop.
16. Uso de unidades modernas: rem para tipografia, fr para grid,
    al menos un uso de clamp() o calc().

[CLASE 4 - Position, transitions, animations]
17. Navbar con position: fixed, z-index >= 100.
18. Al menos 1 elemento con padre position: relative + hijo position:
    absolute (ej: badge "NUEVO"/"OFERTA" sobre las cards).
19. Cards con transition en transform y box-shadow (NO usar
    transition: all). Hover effect con transform: translateY() y/o scale().
20. Al menos 1 @keyframes (ej: fadeInUp) aplicado a las cards al
    cargar la pagina, con animation-delay escalonado entre cards
    (:nth-child) y animation-fill-mode: forwards.
21. Al menos 1 pseudo-elemento ::before o ::after con content: ''
    cumpliendo funcion decorativa.

[CLASE 5 - JavaScript y DOM]
22. JS en archivo externo. Vinculacion con <script src> defer.
23. Seleccion de elementos con querySelector / querySelectorAll.
24. Render dinamico de las cards del catalogo desde un array,
    usando document.createElement + append. Prohibido innerHTML
    para datos del array (XSS).
25. Uso de classList (add/remove/toggle) para estados.
26. Uso de dataset para guardar el id de producto en cada boton.
27. Al menos 3 addEventListener distintos.
28. Event delegation con e.target.closest().
29. Validacion JS del form en 'submit' con e.preventDefault().
    Mostrar errores con createElement + textContent (NO innerHTML).
    Limpiar errores previos antes de revalidar.

[CLASE 6 - Programando en JavaScript]
30. const por defecto, let solo si reasigno, NUNCA var.
31. Arrow functions en todos los callbacks.
32. Comparaciones SIEMPRE con === (nunca ==).
33. Array de minimo 6 productos como objetos.
34. Funcion arrow para formatear precios (Intl.NumberFormat 'es-AR').
35. Uso de .map(), .filter(), .find(), .reduce() + al menos un
    encadenamiento.
36. console.table() del catalogo al cargar.

CONSTRAINTS: HTML + CSS + JS vanilla, archivos separados.
NO frameworks, NO build tools, NO librerias JS externas
(Google Fonts permitido).
```

### Reflexión
Este fue el cambio cualitativo más grande de mi proceso. Pasé de "haceme el parcial" a un **contrato verificable de 36 ítems numerados**. Cada ítem describe un comportamiento que el docente puede chequear sin ambigüedad. Lo más interesante: el README del proyecto reusa esta misma numeración como checklist, así que el contrato me sirvió tanto para hablarle a la IA como para autoevaluarme. La lección que me llevo: **si no podés escribir el requisito en una oración verificable, no es un requisito — es un deseo**.

---

## Prompt 3 `[CC]` — Plan Mode (planificación sin ejecutar)

### Contexto
Con la consigna armada, abrí Claude Code en la carpeta del proyecto y entré en **Plan Mode** (Shift+Tab). Plan Mode hace que Claude Code arme un plan detallado pero NO ejecute nada hasta que vos confirmes. Es la herramienta más útil para evitar que la IA dispare comandos sin pensar.

### Prompt
```
Vamos a construir el parcial 1 de termoshop. Necesito que armes un
plan detallado (sin ejecutar nada todavia) que cubra TODO lo siguiente,
basado en estos 6 temas que se evaluan:

[acá pegué los 36 ítems del Prompt 2]

En el plan, decime:
1. Que archivos vas a crear/modificar.
2. El orden en que vas a hacerlo.
3. Que decisiones de diseño vas a tomar (paleta, tipografia,
   nombres de productos reales con precios coherentes en pesos
   argentinos 2026).
4. Donde podrian aparecer dudas o trade-offs.

NO ejecutes nada. Solo planifica y mostrame el plan.
```

### Reflexión
El plan que devolvió fue muy bueno: archivos en orden HTML → CSS → JS, paleta de colores acorde a marca de termos (verde Stanley + dorado mate), 6 productos reales con marcas argentinas. Pero ya en la planificación vi un problema: propuso un producto "Lumilagro Senderito 500ml" que después resultó ser inventado (no existe en el catálogo actual de Lumilagro). Aprendí que **el plan también puede tener errores fácticos**, no solo el código. Si lo hubiera revisado más a fondo en este paso, me habría ahorrado la corrección posterior.

---

## Prompt 4 `[CC]` — Ejecución del plan

### Contexto
Aprobado el plan, salí de Plan Mode y le pedí que ejecutara todo el plan en orden, con commits semánticos separados por archivo.

### Prompt
```
Aprobado. Ejecuta el plan completo. Reglas durante la implementacion:

- Trabaja en orden: HTML primero, despues CSS, despues JS.
- Despues de cada archivo, hace `git add` y un commit semantico:
  * "feat(html): estructura semantica y formulario de contacto"
  * "feat(css): sistema de variables, grid responsive y animaciones"
  * "feat(js): render dinamico, validacion y metodos funcionales"
- Al final, generar README.md y PR.md con commit
  "docs: README y template de PR".
- NO hagas push todavia, lo hago yo al final.

Mientras vas avanzando, en cada archivo agrega comentarios cortos en
español que expliquen las decisiones clave (por que mobile-first, por
que textContent y no innerHTML, por que filter+reduce, etc).

Al terminar TODO, hace un resumen final con:
1. Lista de archivos creados.
2. Las 3 explicaciones tecnicas mas importantes (una de HTML, una de
   CSS, una de JS) que voy a pegar literal en el PR.
3. Comandos PowerShell para pushear.
4. Sugerencias de que probar en DevTools para screenshots del PR.
```

### Reflexión
Tres decisiones de este prompt fueron clave:

1. **Pedirle commits semánticos por archivo** en vez de un solo commit gigante. Esto deja un historial limpio donde cada paso del proceso es visible, y matchea con la evaluación por clases.
2. **Pedirle comentarios en español explicando las decisiones** dentro del código. Después esos comentarios fueron material directo para el `docs/PR.md` (parte b "explicación técnica").
3. **Prohibirle el push**. La IA tiende a "completar" tareas cerrando todo, pero el push y el PR los quiero controlar yo porque son la entrega real.

Si no le hubiera pedido los puntos 1 y 2 al inicio, me habría tocado refactorear el historial de git o agregar comentarios después.

---

## Prompt 5 `[A]` — Auditoría del repo

### Contexto
Antes de seguir, volví a Claude.ai y le pedí que revisara el repo local archivo por archivo, verificando los 36 ítems del contrato y detectando lo que faltaba.

### Prompt
```
bien, verifica el repo local y fijate que falta
```

### Reflexión
Este prompt corto generó el reporte más útil del proyecto. Claude.ai leyó index.html, estilos.css, app.js, README.md y los archivos de docs/. Detectó:

- **Crítico**: la carpeta `productos-imagenes/` no existía. Sin esto, las 6 cards mostrarían íconos rotos.
- **Importante**: `docs/prompts-usados.md` y partes del `docs/PR.md` estaban vacíos (50% de la nota).
- **Bug menor**: el span de error del checkbox de términos se insertaba en el lugar equivocado (dentro del label envolvente).
- **Inconsistencia**: el README mencionaba archivos webp <100KB que no existían.

Lección: la IA escribe rápido pero no se da cuenta sola de lo que dejó a medias. Una **auditoría explícita pidiendo "qué falta"** es más útil que pedirle que "complete el proyecto".

---

## Prompt 6 `[CC]` — Descargar imágenes reales

### Contexto
Para resolver el problema crítico de las imágenes, le pedí a Claude Code que escribiera un script Python que descargue, optimice y guarde las 6 imágenes de producto. Pedí que sea **idempotente** (no re-descargar si ya existe) y con **fallback a placeholder** (si la descarga falla, generar uno con la marca y modelo sobre fondo de la paleta).

### Prompt (resumido — la versión completa son ~70 líneas)
```
Tengo el catalogo con 6 productos en app.js que referencian imagenes en
`productos-imagenes/` pero esa carpeta no existe. Necesito que las
descargues, optimices y dejes funcionando.

PROCEDIMIENTO:
1) Crear la carpeta productos-imagenes/.
2) Para cada producto, WebSearch del modelo + marca, encontrar
   imagen de producto en fondo blanco (>=500x500, URL directa).
3) Descargar con script Python (`scripts/descargar_imagenes.py`)
   usando requests + Pillow:
   - Resize a max 600x600 manteniendo aspect ratio.
   - Convertir a WebP quality=85.
   - Idempotente (saltea si existe; --force para regenerar).
   - Fallback a placeholder SVG/WebP con marca + modelo sobre
     fondo de la paleta si la descarga falla.
4) Verificar que las 6 esten en productos-imagenes/ con <100KB cada una.
5) Git commit: "feat(assets): descarga y optimizacion de imagenes
   de productos".

[+ detalles de SO Windows/PowerShell, dependencias, trazabilidad]
```

### Reflexión
Le pedí 3 cosas que no son obvias y que después fueron clave:

- **Idempotencia con `--force`**: pude regenerar imágenes específicas borrándolas y corriendo el script, sin tener que re-descargar las 6.
- **Fallback a placeholder**: una de las marcas (Waicom, regional argentina) no tiene presencia online pública. Sin el fallback, el script habría fallado o dejado una imagen rota. Con el fallback, generó un placeholder dorado con "WAICOM Premium 1L" que queda profesional y consistente con la paleta.
- **URLs comentadas en el código**: como trazabilidad. Si en el futuro alguien quiere ver de dónde salió cada imagen, está documentado.

Lo que la IA hizo mal acá: dos de las URLs que eligió tenían problemas (Stanley con overlay promocional, Lumilagro con un producto inventado). Eso lo descubrí recién en la siguiente verificación visual.

---

## Prompt 7 `[A]` — Verificación visual de las imágenes

### Contexto
Antes de seguir, volví a Claude.ai con las 6 imágenes descargadas y le pedí que las inspeccionara visualmente una por una.

### Prompt
```
listo, volver a revisar repo local
```

### Reflexión
Otro prompt cortito que disparó una auditoría compleja. Claude.ai armó un mosaico 3x2 con las 6 imágenes etiquetadas y detectó:

- **Stanley Mate System**: imagen oficial pero con overlay promocional encima ("CON PICO CEBADOR INCLUIDO" y "la tapa es un mate"). No es una imagen limpia de producto.
- **Lumilagro Senderito 500ml**: la imagen muestra 3 botellas térmicas deportivas de colores, no el "Senderito" cebador. Más adelante descubrimos que **el modelo Senderito no existe en el catálogo actual de Lumilagro** — fue inventado por la IA en la planificación.
- Las otras 4 estaban bien.

Esta verificación habría sido imposible de hacer a ojo en una terminal — necesitás ver las imágenes. Por eso conviene usar dos modelos: uno que escribe código, otro que mira el resultado.

---

## Prompt 8 `[CC]` — Reemplazos finales y correcciones

### Contexto
Con los problemas identificados, armé un único prompt que resolvía todo en un solo commit: cambiar 2 URLs en el script, cambiar el producto inventado por uno real (Terra 600cc), corregir el bug del checkbox, actualizar el README.

### Prompt (resumido — la versión completa son ~120 líneas)
```
Hace estos 4 cambios en un solo commit. Trabaja en parcial-1.

CAMBIO 1: reemplazar imagen del Stanley Mate System
  - URL nueva: cloudfront de toromates.com (fondo blanco limpio)

CAMBIO 2: reemplazar producto "Senderito 500ml" por "Terra 600cc"
  - RAZON: Senderito no existe en el catalogo actual de Lumilagro.
  - Editar app.js (objeto id:4) y scripts/descargar_imagenes.py.
  - URL nueva: lumilagro.com.ar (imagen Terra verde oficial).
  - Borrar lumilagro-senderito-500.webp.

CAMBIO 3: regenerar las 2 imagenes afectadas

CAMBIO 4: bug del checkbox en app.js
  - En mostrarError(), si el input esta envuelto en un <label>,
    insertar el error despues del label, no despues del input.
  - Usar input.closest('label').

CAMBIO 5: README alineado con el estado real
  - Reemplazar mencion a "6 webp <100KB" por descripcion correcta.
  - Agregar scripts/ a la estructura del proyecto.
  - Agregar seccion "Regenerar imagenes" con instrucciones.

COMMIT FINAL: "fix: imagenes limpias, producto Terra real, bug
checkbox, readme alineado"
```

### Reflexión
Compactar varios fixes en un solo commit fue una decisión consciente: los 5 cambios son consecuencia de la misma auditoría visual. Separarlos en 5 commits habría inflado el historial sin agregar claridad. La etiqueta `fix:` (convencional commits) lo identifica como corrección y no como nueva feature.

Lo importante de este prompt: **especifico EXACTAMENTE qué texto reemplazar por qué texto**, mostrando el "ANTES" y el "DESPUÉS". No le pido "arreglá el bug del checkbox" — le pido `input.closest('label')` con el comentario explicativo. La IA es mucho mejor ejecutando cambios precisos que infiriendo cambios desde una descripción.

---

## Reflexión global sobre la calidad de prompts

Mirando todo el log en retrospectiva, mi proceso evolucionó así:

| Etapa | Estilo de prompt | Resultado |
|---|---|---|
| Inicio | "armame algo para el parcial" | Claude Code no podía planear sin requisitos |
| Consigna | Lista numerada de 36 ítems verificables | Plan sólido + checklist reusable |
| Ejecución | Reglas de proceso (orden, commits, comentarios) | Historial limpio + código autoexplicativo |
| Auditoría | "qué falta" → verificación contra el contrato | Detección temprana de huecos críticos |
| Correcciones | "ANTES → DESPUÉS" línea por línea | Cambios precisos sin regresiones |

**Patrones que funcionaron bien:**

- Separar planificación (Plan Mode) de ejecución.
- Usar dos modelos para roles diferentes (planificación/auditoría vs ejecución).
- Pedir explicaciones inline en los comentarios del código generado.
- Prohibir explícitamente acciones irreversibles (push, deploy) hasta confirmar.
- Especificar el "qué" y el "cómo" cuando importa la implementación exacta.

**Patrones que voy a evitar en el próximo parcial:**

- Confiar en nombres de producto/feature sin verificarlos (caso Senderito).
- Aceptar la primera imagen/URL que devuelve sin revisión visual.
- Pedir cambios genéricos cuando puedo dar el reemplazo exacto.

---

# Parcial 2 — Supabase, roles y carrito

## Prompt inicial `[CC]` — Planteo del parcial 2

### Contexto
Arranqué pidiéndole a Claude Code que primero **armara el plan** antes de tocar código, dándole los requisitos de alto nivel.

### Prompt
```
necesito crear una rama nueva, que se llame parcial-2, y vamos a hacer
lo siguiente, armemos el plan primero, necesito armar un crud basico
con supabase, dos roles usuarios y admin, y un carrito simple, usamos
fetch, sin sdk, commits atomicos, y pr por funcionalidad, explicando
brevemente, que necesitas?
```

### Reflexión
Mucho mejor que el prompt inicial del parcial 1: di **constraints concretos** (fetch sin SDK, commits atómicos, un PR por funcionalidad) y pedí **plan antes de ejecutar**. Eso hizo que el agente hiciera preguntas de arquitectura (auth real vs tabla simple, carrito local vs en DB) en lugar de asumir.

## Prompt clave `[CC]` — Seguridad de datos sensibles

### Contexto
A mitad del setup, agregué un requisito que cambió el diseño.

### Prompt
```
importante la seguridad de datos sensibles
```

### Reflexión
Un prompt corto pero de alto impacto. Obligó a revisar decisiones ya tomadas: se descartó "login por tabla con password plano" y se pasó a **Supabase Auth + RLS estricto**. Aprendizaje: conviene declarar los requisitos no-funcionales (seguridad) **antes** de planificar, porque reescriben la arquitectura. También me sirvió para entender que en un sitio estático (GitHub Pages) la anon key **siempre** es pública y la seguridad real está en RLS, no en ocultar la clave.

## Lo que funcionó del workflow

- Pedir el **plan primero** y responder las preguntas de arquitectura redujo retrabajo.
- Constraints explícitos (sin SDK, commits atómicos, PR por feature) dieron un historial de PRs limpio y evaluable.
- Inyectar el requisito de seguridad, aunque tarde, se absorbió bien porque el plan todavía no estaba implementado.

---

**Autor:** David Wuscovi (`dakovid`)
**Materia:** Aplicaciones Web Cliente — ISTEA 2026
