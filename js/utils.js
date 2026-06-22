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
