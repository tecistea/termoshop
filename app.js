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
   Array de productos con precios en ARS mayo 2026.
   Cada objeto sigue el shape: id, nombre, marca, capacidad, material,
   precio, stock, badge, imagen, descripcion. */
const PRODUCTOS = [
    {
        id: 1,
        nombre: 'Classic Legendary 1.4L',
        marca: 'Stanley',
        capacidad: '1400 ml',
        material: 'Acero inoxidable 18/8',
        precio: 215000,
        stock: 8,
        badge: null,
        imagen: 'productos-imagenes/stanley-classic-14l.webp',
        descripcion: 'El termo legendario verde Hammertone. Mantiene caliente 24 hs y frio 36 hs. A prueba de golpes y filtraciones.'
    },
    {
        id: 2,
        nombre: 'Mate System 800ml',
        marca: 'Stanley',
        capacidad: '800 ml',
        material: 'Acero inoxidable con pico cebador',
        precio: 159000,
        stock: 12,
        badge: 'NUEVO',
        imagen: 'productos-imagenes/stanley-mate-system.webp',
        descripcion: 'Termo de acero con pico cebador integrado. Pensado para el mate argentino, no se cae ni se voltea.'
    },
    {
        id: 3,
        nombre: 'Luminox 1L',
        marca: 'Lumilagro',
        capacidad: '1000 ml',
        material: 'ABS con ampolla de vidrio',
        precio: 39500,
        stock: 25,
        badge: 'OFERTA',
        imagen: 'productos-imagenes/lumilagro-luminox-1l.webp',
        descripcion: 'Clasico cebador argentino. Cuerpo plastico resistente y ampolla de vidrio que mantiene la temperatura ideal.'
    },
    {
        id: 4,
        nombre: 'Terra 600cc',
        marca: 'Lumilagro',
        capacidad: '600 ml',
        material: 'Plastico con ampolla de vidrio',
        precio: 19500,
        stock: 30,
        badge: null,
        imagen: 'productos-imagenes/lumilagro-terra-600.webp',
        descripcion: 'Termo compacto de 600cc, ideal para llevar en la mochila. Ampolla de vidrio con sistema de doble pared al vacio.'
    },
    {
        id: 5,
        nombre: 'Premium 1L Acero',
        marca: 'Waicom',
        capacidad: '1000 ml',
        material: 'Acero inoxidable doble pared',
        precio: 64000,
        stock: 15,
        badge: 'NUEVO',
        imagen: 'productos-imagenes/waicom-premium-1l.webp',
        descripcion: 'Acero doble pared con aislante al vacio. Excelente relacion calidad-precio entre los termos premium.'
    },
    {
        id: 6,
        nombre: 'Magic Pump 1L',
        marca: 'Termolar',
        capacidad: '1000 ml',
        material: 'Plastico con sistema bomba',
        precio: 32500,
        stock: 20,
        badge: null,
        imagen: 'productos-imagenes/termolar-magic-pump-1l.webp',
        descripcion: 'Termo con sistema bomba, perfecto para servir sin levantarlo. Ideal para mesa familiar.'
    }
];


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
   Crea las cards del catalogo a partir del array PRODUCTOS.
   Importante: cada subelemento usa textContent o propiedades especificas
   (img.src, img.alt) - nunca innerHTML con datos. */
const renderCatalogo = () => {
    const contenedor = document.querySelector('#catalogo-grid');
    if (!contenedor) {
        return;
    }

    PRODUCTOS.forEach((producto) => {
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
        contenedor.append(card);
    });
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
    const producto = PRODUCTOS.find((p) => p.id === idProducto);
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


/* ====== 6. INICIALIZACION ======
   Como el <script> usa defer, el DOM ya esta parseado cuando corre este codigo.
   No hace falta DOMContentLoaded. */

/* a) renderizamos las cards */
renderCatalogo();

/* b) registramos los 3 listeners distintos (req 27).
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


/* ====== 7. DEMOS DE PROGRAMACION FUNCIONAL (CLASE 6) ======
   Demuestran los 4 metodos del array + un encadenamiento + console.table.
   Todo loggeado en consola para que el profe lo vea al abrir DevTools. */

/* console.table arma una tabla con todas las propiedades del array (req 36) */
console.table(PRODUCTOS);

/* .map(): transforma cada producto en su nombre */
const nombres = PRODUCTOS.map((p) => p.nombre);
console.log('Nombres (map):', nombres);

/* .filter(): productos con stock > 0 (todos en este caso, demostrativo) */
const disponibles = PRODUCTOS.filter((p) => p.stock > 0);
console.log('Disponibles (filter):', disponibles);

/* .find(): primer producto de la marca Stanley */
const stanleyDestacado = PRODUCTOS.find((p) => p.marca === 'Stanley');
console.log('Primer Stanley (find):', stanleyDestacado);

/* .reduce(): total facturable acumulando precio * 1.21 (IVA 21%) */
const totalFacturable = PRODUCTOS.reduce((acumulado, p) => acumulado + p.precio * 1.21, 0);
console.log('Total facturable con IVA 21% (reduce):', formatearPrecio(totalFacturable));

/* Encadenamiento filter + map: productos >= $100.000 mapeados a sus nombres.
   Pipeline funcional: primero seleccionamos los caros, despues los aplanamos a nombre. */
const productosCarosNombres = PRODUCTOS
    .filter((p) => p.precio >= 100000)
    .map((p) => p.nombre);
console.log('Productos caros >= $100.000 (filter + map):', productosCarosNombres);

/* Encadenamiento filter + reduce: stock total de Stanley.
   filter selecciona los Stanley, reduce los suma. */
const stockStanley = PRODUCTOS
    .filter((p) => p.marca === 'Stanley')
    .reduce((acc, p) => acc + p.stock, 0);
console.log('Stock total Stanley (filter + reduce):', stockStanley);
