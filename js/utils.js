/* ====================================================================
   termoshop - js/utils.js (Parcial 2)
   --------------------------------------------------------------------
   Helpers compartidos por varias paginas (catalogo, admin, carrito).
   Antes vivian en app.js, pero admin.html y carrito.html no cargan
   app.js, asi que se extrajeron aca para reutilizarlos sin duplicar.

   Reglas (clases 5 y 6): const por defecto, arrow functions, ===,
   createElement + textContent (NO innerHTML para datos).
   ==================================================================== */

'use strict';

/* formatearPrecio: usa Intl.NumberFormat con locale es-AR para mostrar
   $215.000 con separadores argentinos (req 34). Arrow para cumplir req 31. */
const formatearPrecio = (numero) =>
    new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        maximumFractionDigits: 0
    }).format(numero);

/* crearElemento: shortcut para crear un nodo con clases y texto.
   Usa textContent (no innerHTML) para evitar inyeccion de HTML. */
const crearElemento = (tag, clases = '', texto = '') => {
    const el = document.createElement(tag);
    if (clases) {
        el.className = clases;
    }
    if (texto) {
        el.textContent = texto;
    }
    return el;
};

/* ====== ICONOS SVG ======
   Set de iconos de trazo (estilo Feather) definidos como datos: cada uno es
   una lista de formas [tag, atributos]. crearIcono los arma con createElementNS
   (nada de innerHTML) y devuelve un <svg> que hereda el color del texto via
   currentColor (stroke) y se dimensiona en 'em' desde la clase .icono en CSS.

   Sin librerias externas ni CDN: cumplen la regla vanilla del proyecto y
   funcionan offline / sobre file://. */
const SVG_NS = 'http://www.w3.org/2000/svg';

const ICONOS = {
    /* carrito de compras */
    carrito: [
        ['circle', { cx: '9', cy: '21', r: '1' }],
        ['circle', { cx: '20', cy: '21', r: '1' }],
        ['path', { d: 'M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6' }]
    ],
    /* flecha hacia la derecha (avanzar / explorar) */
    flecha: [
        ['path', { d: 'M5 12h14M13 6l6 6-6 6' }]
    ],
    /* info en circulo (ver detalle / mas informacion) */
    info: [
        ['circle', { cx: '12', cy: '12', r: '10' }],
        ['path', { d: 'M12 16v-4' }],
        ['path', { d: 'M12 8h.01' }]
    ],
    /* check (finalizar / confirmar) */
    check: [
        ['path', { d: 'M20 6 9 17l-5-5' }]
    ],
    /* sobre con flecha de salida (enviar consulta) */
    enviar: [
        ['path', { d: 'M22 4H8a2 2 0 0 0-2 2v1' }],
        ['path', { d: 'm22 4-9.5 7L8 7.5' }],
        ['path', { d: 'M6 12H2m4 4H3' }],
        ['path', { d: 'M22 4v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-3' }]
    ],
    /* sobre (email) */
    sobre: [
        ['rect', { x: '2', y: '4', width: '20', height: '16', rx: '2' }],
        ['path', { d: 'm22 6-10 7L2 6' }]
    ],
    /* pin de ubicacion (direccion) */
    pin: [
        ['path', { d: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' }],
        ['circle', { cx: '12', cy: '10', r: '3' }]
    ],
    /* reloj (horario) */
    reloj: [
        ['circle', { cx: '12', cy: '12', r: '10' }],
        ['path', { d: 'M12 6v6l4 2' }]
    ]
};

/* crearIcono: devuelve un <svg class="icono icono--<nombre>"> con las formas
   del icono pedido. aria-hidden porque el icono es decorativo (el texto del
   boton/enlace ya comunica la accion). Si el nombre no existe, devuelve un
   <svg> vacio en vez de romper. */
const crearIcono = (nombre) => {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.classList.add('icono', `icono--${nombre}`);

    const formas = ICONOS[nombre] || [];
    formas.forEach(([tag, atributos]) => {
        const forma = document.createElementNS(SVG_NS, tag);
        Object.entries(atributos).forEach(([clave, valor]) => {
            forma.setAttribute(clave, valor);
        });
        svg.append(forma);
    });
    return svg;
};

/* crearBotonIcono: crea un boton/enlace con un icono + texto. Es como
   crearElemento pero antepone (o pospone) el <svg> del icono al texto, que
   queda en su propio <span> para no mezclar nodos. posicion: 'inicio' (default)
   pone el icono antes del texto; 'fin' lo pone despues. */
const crearBotonIcono = (tag, clases, texto, icono, posicion = 'inicio') => {
    const el = crearElemento(tag, clases);
    const svg = crearIcono(icono);
    const span = crearElemento('span', '', texto);
    if (posicion === 'fin') {
        el.append(span, svg);
    } else {
        el.append(svg, span);
    }
    return el;
};
