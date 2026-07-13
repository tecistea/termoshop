/* ====================================================================
   termoshop - js/toast.js
   --------------------------------------------------------------------
   Sistema de notificaciones no intrusivas (toasts) que reemplaza los
   alert() nativos. Un alert() bloquea el hilo, corta el flujo y no
   combina con el diseño; el toast aparece en una esquina, se anuncia a
   lectores de pantalla (aria-live) y se va solo.

   API:
     mostrarToast('Producto agregado al carrito');            // exito (default)
     mostrarToast('No se pudo agregar', 'error');             // error
     mostrarToast('Inicia sesion para continuar', 'info');    // info

   Reglas (clases 5 y 6): const por defecto, arrow functions, ===,
   createElement + textContent (NO innerHTML). Reutiliza crearElemento
   de js/utils.js si esta disponible; si no, hace fallback local.
   ==================================================================== */

'use strict';

/* Contenedor unico donde se apilan los toasts. Se crea la primera vez
   que se necesita (lazy) y se reutiliza. Es aria-live para que el lector
   de pantalla anuncie cada toast que se agrega. */
const obtenerContenedorToast = () => {
    let contenedor = document.querySelector('#toast-contenedor');
    if (!contenedor) {
        contenedor = document.createElement('div');
        contenedor.id = 'toast-contenedor';
        contenedor.className = 'toast-contenedor';
        /* role=status + aria-live=polite: los toasts se anuncian sin
           interrumpir lo que el usuario esta leyendo. */
        contenedor.setAttribute('role', 'status');
        contenedor.setAttribute('aria-live', 'polite');
        contenedor.setAttribute('aria-atomic', 'true');
        document.body.append(contenedor);
    }
    return contenedor;
};

/* mostrarToast: crea un toast del tipo indicado y lo quita solo tras
   `duracion` ms. tipo: 'exito' (default) | 'error' | 'info'. */
const mostrarToast = (mensaje, tipo = 'exito', duracion = 3000) => {
    const contenedor = obtenerContenedorToast();

    const toast = document.createElement('div');
    toast.className = `toast toast--${tipo}`;
    toast.textContent = mensaje;
    contenedor.append(toast);

    /* Forzamos un reflow y agregamos la clase visible en el siguiente
       frame para que la transicion de entrada se dispare. */
    requestAnimationFrame(() => {
        toast.classList.add('toast--visible');
    });

    /* Salida: quitamos la clase visible (fade out) y removemos el nodo
       cuando termina la transicion. */
    const cerrar = () => {
        toast.classList.remove('toast--visible');
        toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    };

    setTimeout(cerrar, duracion);
};
