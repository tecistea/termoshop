/* ====================================================================
   termoshop - js/login.js (Parcial 2)
   --------------------------------------------------------------------
   Logica de login.html y registro.html: cada pagina tiene un solo form.
   Este archivo se carga en ambas y engancha el que exista usando las
   funciones de js/sesion.js. Sin innerHTML.
   ==================================================================== */

'use strict';

/* mostrarMensaje: reutiliza el <p> de feedback de cada form.
   esError pinta en rojo (clase con-error) o deja el verde de exito. */
const mostrarMensaje = (elemento, texto, esError) => {
    elemento.textContent = texto;
    elemento.hidden = false;
    elemento.classList.toggle('form__exito--error', esError);
};

/* Si ya hay sesion activa, no tiene sentido quedarse en login: al inicio. */
const sesionActiva = obtenerSesion();
if (sesionActiva) {
    window.location.href = 'index.html';
}

/* Pintamos el estado de sesion en la navbar */
pintarNavSesion();


/* ====== LOGIN ====== */
const formLogin = document.querySelector('#form-login');
if (formLogin) {
    formLogin.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        const mensaje = document.querySelector('#login-mensaje');
        const email = document.querySelector('#login-email').value.trim();
        const password = document.querySelector('#login-password').value;

        if (!email || password.length < 6) {
            mostrarMensaje(mensaje, 'Completá email y contraseña (mínimo 6 caracteres).', true);
            return;
        }

        try {
            await iniciarSesion(email, password);
            /* Sesion guardada: vamos al inicio ya logueados */
            window.location.href = 'index.html';
        } catch (error) {
            mostrarMensaje(mensaje, error.message, true);
        }
    });
}


/* ====== REGISTRO ====== */
const formRegistro = document.querySelector('#form-registro');
if (formRegistro) {
    formRegistro.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        const mensaje = document.querySelector('#reg-mensaje');
        const email = document.querySelector('#reg-email').value.trim();
        const password = document.querySelector('#reg-password').value;

        if (!email || password.length < 6) {
            mostrarMensaje(mensaje, 'Completá email y contraseña (mínimo 6 caracteres).', true);
            return;
        }

        try {
            await registrar(email, password);
            mostrarMensaje(mensaje, 'Cuenta creada. Te llevamos a iniciar sesión...', false);
            formRegistro.reset();
            /* Ya con cuenta, mandamos a la pagina de login */
            setTimeout(() => { window.location.href = 'login.html'; }, 1200);
        } catch (error) {
            mostrarMensaje(mensaje, error.message, true);
        }
    });
}
