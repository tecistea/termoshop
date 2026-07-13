/* ====================================================================
   termoshop - js/nav.js
   --------------------------------------------------------------------
   Menu hamburguesa para mobile. En desktop el nav es una fila horizontal
   (logo | links | sesion); en mobile esos elementos no entran, sobre todo
   con sesion iniciada (email + Carrito + Ordenes + Admin + Salir), asi que
   los colapsamos en un panel desplegable controlado por el boton .nav__toggle.

   Accesibilidad: el boton usa aria-expanded / aria-controls, se cierra con
   Escape, al clickear un link y al pasar a viewport de desktop.

   Reglas (clases 5 y 6): const por defecto, arrow functions, ===,
   querySelector. Con <script defer> el DOM ya esta parseado.
   ==================================================================== */

'use strict';

const iniciarNavMobile = () => {
    const toggle = document.querySelector('.nav__toggle');
    const menu = document.querySelector('.nav__menu');
    if (!toggle || !menu) {
        return;
    }

    /* abrir/cerrar: unico punto que sincroniza la clase visual y el estado
       aria del boton. */
    const setAbierto = (abierto) => {
        menu.classList.toggle('nav__menu--abierto', abierto);
        toggle.setAttribute('aria-expanded', String(abierto));
        toggle.classList.toggle('nav__toggle--activo', abierto);
    };

    const estaAbierto = () => toggle.getAttribute('aria-expanded') === 'true';

    /* Toggle al click del boton */
    toggle.addEventListener('click', () => setAbierto(!estaAbierto()));

    /* Cerrar al clickear cualquier link o boton del menu (navegacion o accion) */
    menu.addEventListener('click', (evento) => {
        if (evento.target.closest('a, button')) {
            setAbierto(false);
        }
    });

    /* Cerrar con Escape */
    document.addEventListener('keydown', (evento) => {
        if (evento.key === 'Escape' && estaAbierto()) {
            setAbierto(false);
            toggle.focus();
        }
    });

    /* Al agrandar a desktop, el menu vuelve a ser fila: reseteamos el estado
       para no dejar el panel "abierto" colgado si el usuario rota o agranda. */
    const mqDesktop = window.matchMedia('(min-width: 768px)');
    const alCambiarViewport = (evento) => {
        if (evento.matches) {
            setAbierto(false);
        }
    };
    /* addEventListener('change') es el estandar moderno de MediaQueryList */
    mqDesktop.addEventListener('change', alCambiarViewport);
};

/* Auto-arranque: con defer el DOM ya esta listo. */
iniciarNavMobile();
