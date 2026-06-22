/* ====================================================================
   termoshop - app.js
   --------------------------------------------------------------------
   Logica del ecommerce: render de catalogo, validacion de form,
   eventos delegados, y demos de programacion funcional en consola.

   Reglas seguidas (clases 5 y 6):
     - const por defecto, let solo si reasigno, NUNCA var.
     - Arrow functions en TODOS los callbacks.
     - Comparaciones siempre con === (nunca ==).
     - querySelector / querySelectorAll, NUNCA getElementById.
     - createElement + textContent para datos del array (NO innerHTML
       porque interpolar strings de un array al HTML abre la puerta a XSS
       si esos datos vienen del usuario; mejor adoptar el habito siempre).
     - Event delegation con e.target.closest() para no atar un listener
       a cada card.
   ==================================================================== */

'use strict';


/* ====== 1. DATOS ======
   Parcial 2: los productos ya NO estan hardcodeados. Se traen de Supabase
   (tabla productos) via fetch usando el wrapper de js/api.js.

   productosCargados guarda el resultado de la ultima carga para que los
   handlers (ej: el detalle delegado) y las demos funcionales puedan
   trabajar sobre los mismos datos sin volver a pedirlos. Es let porque
   se reasigna cuando llega la respuesta. */
let productosCargados = [];

/* obtenerProductos: GET a la tabla productos ordenados por id.
   Devuelve el array (o lanza si falla la red / Supabase). */
const obtenerProductos = async () =>
    apiGet('productos', '?select=*&order=id.asc');


/* ====== 2. UTILS ======
   Helpers chicos que reutilizan render y validacion. */

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


/* ====== 3. RENDER ======
   Arma las cards del catalogo a partir de los productos de Supabase.
   Importante: cada subelemento usa textContent o propiedades especificas
   (img.src, img.alt) - nunca innerHTML con datos. */

/* crearCard: construye el <article> de un producto. Separado de
   renderCatalogo para que el render quede legible. */
const crearCard = (producto) => {
    const card = crearElemento('article', 'producto');
    /* dataset.id queda como atributo data-id en el DOM (req 26).
       Luego el event delegation usa esto para saber a que producto se hizo click. */
    card.dataset.id = producto.id;

    /* Badge condicional (NUEVO u OFERTA) */
    if (producto.badge) {
        const claseBadge = producto.badge === 'OFERTA' ? 'badge badge--oferta' : 'badge badge--nuevo';
        const badge = crearElemento('span', claseBadge, producto.badge);
        card.append(badge);
    }

    /* Imagen del producto con alt descriptivo y lazy loading.
       Asignamos por propiedad, no por innerHTML, para evitar XSS. */
    const img = document.createElement('img');
    img.src = producto.imagen;
    img.alt = `${producto.nombre} de la marca ${producto.marca}`;
    img.loading = 'lazy';
    img.width = 600;
    img.height = 600;
    img.className = 'producto__imagen';
    card.append(img);

    /* Cuerpo de la card */
    const cuerpo = crearElemento('div', 'producto__cuerpo');

    cuerpo.append(
        crearElemento('span', 'producto__marca', producto.marca),
        crearElemento('h3', 'producto__nombre', producto.nombre),
        crearElemento('p', 'producto__meta', `${producto.capacidad} - ${producto.material}`),
        crearElemento('p', 'producto__precio', formatearPrecio(producto.precio)),
        crearElemento('p', 'producto__stock', `Stock disponible: ${producto.stock} unidades`),
        crearElemento('p', 'producto__descripcion', producto.descripcion)
    );

    /* Boton "ver detalle": tambien tiene dataset.id (req 26) para que
       el listener delegado lo identifique con closest(). */
    const boton = crearElemento('button', 'producto__boton', 'Ver detalle');
    boton.type = 'button';
    boton.dataset.id = producto.id;
    cuerpo.append(boton);

    card.append(cuerpo);
    return card;
};

/* renderCatalogo: async porque espera la respuesta de Supabase.
   Muestra un estado de carga, pide los productos, y si falla muestra
   un mensaje de error en vez de romper la pagina. */
const renderCatalogo = async () => {
    const contenedor = document.querySelector('#catalogo-grid');
    if (!contenedor) {
        return;
    }

    /* Estado de carga mientras viaja el fetch */
    contenedor.replaceChildren(crearElemento('p', 'catalogo__estado', 'Cargando productos...'));

    try {
        const productos = await obtenerProductos();
        productosCargados = productos;

        /* Si la tabla esta vacia, avisamos en vez de dejar el grid mudo */
        if (productos.length === 0) {
            contenedor.replaceChildren(crearElemento('p', 'catalogo__estado', 'No hay productos disponibles por ahora.'));
            return;
        }

        /* Limpiamos el estado de carga y pintamos las cards */
        contenedor.replaceChildren();
        productos.forEach((producto) => contenedor.append(crearCard(producto)));
    } catch (error) {
        console.error('Error cargando el catalogo:', error);
        contenedor.replaceChildren(
            crearElemento('p', 'catalogo__estado catalogo__estado--error',
                'No pudimos cargar los productos. Revisa la conexion e intenta de nuevo.')
        );
    }
};


/* ====== 4. VALIDACION DEL FORMULARIO ======
   Estrategia:
     a) limpiar errores previos antes de revalidar (sino se acumulan).
     b) recorrer reglas, crear span de error con createElement + textContent.
     c) si no hay errores, mostrar exito y resetear form. */

const limpiarErrores = () => {
    /* querySelectorAll devuelve un NodeList iterable con forEach */
    document.querySelectorAll('.form__error').forEach((nodo) => nodo.remove());
    document.querySelectorAll('.form__input.con-error').forEach((input) => {
        input.classList.remove('con-error');
    });
};

const mostrarError = (input, mensaje) => {
    input.classList.add('con-error');
    const span = crearElemento('span', 'form__error', mensaje);
    /* Si el input esta envuelto en un <label> (como el checkbox de
       terminos), insertamos el error despues del label completo,
       no entre el input y el texto del label. */
    const labelEnvoltorio = input.closest('label');
    const anchor = labelEnvoltorio || input;
    anchor.after(span);
};

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
        mostrarError(inputEmail, 'Ingresa un email valido (ej: vos@ejemplo.com).');
        hayErrores = true;
    }

    /* Validacion telefono: pattern HTML5 evalua si son 10-15 digitos */
    if (!inputTelefono.checkValidity() || inputTelefono.value.trim() === '') {
        mostrarError(inputTelefono, 'El telefono debe tener entre 10 y 15 digitos numericos.');
        hayErrores = true;
    }

    /* Validacion asunto: el value vacio del placeholder hace que required dispare */
    if (inputAsunto.value === '') {
        mostrarError(inputAsunto, 'Elegi un motivo de consulta.');
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
        mostrarError(inputTerminos, 'Tenes que aceptar los terminos para continuar.');
        hayErrores = true;
    }

    /* Si todo OK: mostrar exito, resetear form */
    if (!hayErrores) {
        avisoExito.hidden = false;
        form.reset();
        /* despues de 4 segundos ocultamos el aviso */
        setTimeout(() => {
            avisoExito.hidden = true;
        }, 4000);
    } else {
        avisoExito.hidden = true;
    }
};


/* ====== 5. HANDLERS ====== */

/* Handler delegado del catalogo: un solo listener en el contenedor (req 28).
   closest() sube por el DOM hasta encontrar un elemento con data-id.
   Si el click cayo fuera de un boton/card, closest devuelve null y salimos. */
const handlerCatalogo = (evento) => {
    const boton = evento.target.closest('.producto__boton');
    if (!boton) {
        return;
    }
    const idProducto = Number(boton.dataset.id);
    const card = boton.closest('.producto');
    /* classList.toggle: si esta la clase la saca, si no la pone (req 25) */
    card.classList.toggle('expandida');
    const producto = productosCargados.find((p) => p.id === idProducto);
    console.log('Detalle clickeado:', producto);
};

/* Handler de los links del nav: marca el link clickeado como activo */
const handlerNavLink = (evento) => {
    const linkClickeado = evento.currentTarget;
    /* limpiamos la clase activa de todos y la ponemos solo en el actual */
    document.querySelectorAll('.nav__link').forEach((link) => {
        link.classList.remove('activa');
    });
    linkClickeado.classList.add('activa');
};


/* ====== 6. DEMOS DE PROGRAMACION FUNCIONAL (CLASE 6) ======
   Demuestran los 4 metodos del array + encadenamientos + console.table.
   Ahora operan sobre los productos traidos de Supabase (productosCargados),
   por eso reciben el array por parametro y se llaman despues del render. */
const correrDemosFuncionales = (productos) => {
    /* console.table arma una tabla con todas las propiedades del array (req 36) */
    console.table(productos);

    /* .map(): transforma cada producto en su nombre */
    const nombres = productos.map((p) => p.nombre);
    console.log('Nombres (map):', nombres);

    /* .filter(): productos con stock > 0 */
    const disponibles = productos.filter((p) => p.stock > 0);
    console.log('Disponibles (filter):', disponibles);

    /* .find(): primer producto de la marca Stanley */
    const stanleyDestacado = productos.find((p) => p.marca === 'Stanley');
    console.log('Primer Stanley (find):', stanleyDestacado);

    /* .reduce(): total facturable acumulando precio * 1.21 (IVA 21%) */
    const totalFacturable = productos.reduce((acumulado, p) => acumulado + p.precio * 1.21, 0);
    console.log('Total facturable con IVA 21% (reduce):', formatearPrecio(totalFacturable));

    /* Encadenamiento filter + map: productos >= $100.000 mapeados a sus nombres. */
    const productosCarosNombres = productos
        .filter((p) => p.precio >= 100000)
        .map((p) => p.nombre);
    console.log('Productos caros >= $100.000 (filter + map):', productosCarosNombres);

    /* Encadenamiento filter + reduce: stock total de Stanley. */
    const stockStanley = productos
        .filter((p) => p.marca === 'Stanley')
        .reduce((acc, p) => acc + p.stock, 0);
    console.log('Stock total Stanley (filter + reduce):', stockStanley);
};


/* ====== 7. INICIALIZACION ======
   Como el <script> usa defer, el DOM ya esta parseado cuando corre este codigo.
   No hace falta DOMContentLoaded.

   init es async: primero esperamos el render (que llena productosCargados
   desde Supabase) y recien ahi corremos las demos sobre esos datos. */
const init = async () => {
    /* a) renderizamos las cards desde Supabase */
    await renderCatalogo();

    /* b) demos funcionales con los datos ya cargados */
    correrDemosFuncionales(productosCargados);
};

/* c) registramos los 3 listeners distintos (req 27).
      Listener 1: submit del formulario con validacion. */
const form = document.querySelector('#form-contacto');
if (form) {
    form.addEventListener('submit', validarFormulario);
}

/* Listener 2: click delegado en el grid de catalogo (req 28).
   Un solo listener captura clicks de todas las cards/botones. */
const catalogoEl = document.querySelector('#catalogo-grid');
if (catalogoEl) {
    catalogoEl.addEventListener('click', handlerCatalogo);
}

/* Listener 3: click en cada link del nav para togglear la clase activa.
   Usamos forEach con arrow para cumplir req 31. */
document.querySelectorAll('.nav__link').forEach((link) => {
    link.addEventListener('click', handlerNavLink);
});

/* Arranque */
init();
