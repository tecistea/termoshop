/* ====================================================================
   termoshop - js/contacto.js
   --------------------------------------------------------------------
   Validacion del formulario de contacto. Antes vivia en app.js (junto
   al catalogo), pero el form se movio a su propia pagina contacto.html,
   asi que la logica se extrajo aca para que app.js quede enfocado en el
   catalogo y esta pagina cargue solo lo que necesita.

   Reglas (clases 5 y 6): const por defecto, arrow functions, ===,
   createElement + textContent (NO innerHTML). Reutiliza crearElemento
   de js/utils.js.
   ==================================================================== */

'use strict';

/* limpiarErrores: quita los mensajes y estados de error de una pasada
   anterior para no acumularlos al revalidar. */
const limpiarErrores = () => {
    document.querySelectorAll('.form__error').forEach((nodo) => nodo.remove());
    document.querySelectorAll('.form__input.con-error').forEach((input) => {
        input.classList.remove('con-error');
    });
};

/* mostrarError: marca el input y agrega un span con el mensaje. Si el
   input esta dentro de un <label> (checkbox de terminos), pone el error
   despues del label completo. */
const mostrarError = (input, mensaje) => {
    input.classList.add('con-error');
    const span = crearElemento('span', 'form__error', mensaje);
    const labelEnvoltorio = input.closest('label');
    const anchor = labelEnvoltorio || input;
    anchor.after(span);
};

/* validarFormulario: valida los 6 campos y, si esta todo OK, muestra el
   aviso de exito y resetea. No envia datos a ningun backend (action=#). */
const validarFormulario = (evento) => {
    /* preventDefault frena el submit nativo para que JS controle todo (req 29) */
    evento.preventDefault();
    limpiarErrores();

    const form = evento.currentTarget;
    const inputNombre   = form.querySelector('#input-nombre');
    const inputEmail    = form.querySelector('#input-email');
    const inputTelefono = form.querySelector('#input-telefono');
    const inputAsunto   = form.querySelector('#input-asunto');
    const inputMensaje  = form.querySelector('#input-mensaje');
    const inputTerminos = form.querySelector('#input-terminos');
    const avisoExito    = form.querySelector('#form-exito');

    let hayErrores = false;

    /* Validacion nombre: minimo 2 caracteres, maximo 50 */
    const nombre = inputNombre.value.trim();
    if (nombre.length < 2 || nombre.length > 50) {
        mostrarError(inputNombre, 'El nombre debe tener entre 2 y 50 caracteres.');
        hayErrores = true;
    }

    /* Validacion email: usamos checkValidity() que aplica el type=email del HTML */
    if (!inputEmail.checkValidity() || inputEmail.value.trim() === '') {
        mostrarError(inputEmail, 'Ingresá un email válido (ej: vos@ejemplo.com).');
        hayErrores = true;
    }

    /* Validacion telefono: pattern HTML5 evalua si son 10-15 digitos */
    if (!inputTelefono.checkValidity() || inputTelefono.value.trim() === '') {
        mostrarError(inputTelefono, 'El teléfono debe tener entre 10 y 15 dígitos numéricos.');
        hayErrores = true;
    }

    /* Validacion asunto: el value vacio del placeholder hace que required dispare */
    if (inputAsunto.value === '') {
        mostrarError(inputAsunto, 'Elegí un motivo de consulta.');
        hayErrores = true;
    }

    /* Validacion mensaje: minimo 10 caracteres */
    const mensaje = inputMensaje.value.trim();
    if (mensaje.length < 10) {
        mostrarError(inputMensaje, 'El mensaje debe tener al menos 10 caracteres.');
        hayErrores = true;
    }

    /* Validacion checkbox terminos */
    if (!inputTerminos.checked) {
        mostrarError(inputTerminos, 'Tenés que aceptar los términos para continuar.');
        hayErrores = true;
    }

    /* Si todo OK: mostrar exito, resetear form */
    if (!hayErrores) {
        avisoExito.hidden = false;
        form.reset();
        setTimeout(() => {
            avisoExito.hidden = true;
        }, 4000);
    } else {
        avisoExito.hidden = true;
        /* Llevamos el foco al primer campo con error para que el usuario no
           tenga que buscarlo (mejora la correccion con teclado y mouse). */
        const primerInvalido = form.querySelector('.con-error');
        if (primerInvalido) {
            primerInvalido.focus();
        }
    }
};


/* ====== INICIALIZACION ======
   Con defer el DOM ya esta parseado. Registramos el submit y pintamos
   la navbar (login / email + salir), igual que las demas paginas. */
pintarNavSesion();

const form = document.querySelector('#form-contacto');
if (form) {
    form.addEventListener('submit', validarFormulario);
}
