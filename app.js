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
   formatearPrecio y crearElemento viven en js/utils.js (compartidos con
   admin.js y carrito.js). Este archivo los usa asumiendo que utils.js se
   carga antes (ver orden de <script> en index.html). */


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

    /* La descripcion completa se muestra en producto.html; en la card solo
       van los datos resumidos. */
    cuerpo.append(
        crearElemento('span', 'producto__marca', producto.marca),
        crearElemento('h3', 'producto__nombre', producto.nombre),
        crearElemento('p', 'producto__meta', `${producto.capacidad} - ${producto.material}`),
        crearElemento('p', 'producto__precio', formatearPrecio(producto.precio)),
        crearElemento('p', 'producto__stock', `Stock disponible: ${producto.stock} unidades`)
    );

    /* "Ver detalle": link a la pagina de detalle con el id en la URL.
       Es la accion secundaria (contorno), para diferenciarla del CTA
       principal "Agregar al carrito" (relleno). */
    const boton = crearBotonIcono('a', 'btn btn--secundario btn--bloque producto__boton', 'Ver detalle', 'info');
    boton.href = `producto.html?id=${producto.id}`;
    cuerpo.append(boton);

    /* Boton "agregar al carrito" (Parcial 2): CTA principal (relleno).
       El listener delegado lo distingue por su clase y usa dataset.id. */
    const botonCarrito = crearBotonIcono('button', 'btn btn--primario btn--bloque producto__carrito', 'Agregar al carrito', 'carrito');
    botonCarrito.type = 'button';
    botonCarrito.dataset.id = producto.id;
    cuerpo.append(botonCarrito);

    card.append(cuerpo);
    return card;
};

/* crearSkeletonCard: placeholder animado con la misma silueta que una card
   real (imagen + lineas + boton). Se muestran varios mientras carga el fetch
   para dar percepcion de velocidad y evitar el salto de layout. */
const crearSkeletonCard = () => {
    const card = crearElemento('div', 'skeleton-card');
    card.append(crearElemento('div', 'skeleton-card__imagen'));

    const cuerpo = crearElemento('div', 'skeleton-card__cuerpo');
    cuerpo.append(
        crearElemento('div', 'skeleton-linea skeleton-linea--corta'),
        crearElemento('div', 'skeleton-linea skeleton-linea--larga'),
        crearElemento('div', 'skeleton-linea skeleton-linea--media'),
        crearElemento('div', 'skeleton-linea skeleton-linea--corta'),
        crearElemento('div', 'skeleton-linea skeleton-linea--boton')
    );
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

    /* Estado de carga: skeletons con la silueta de las cards (6 placeholders,
       suficientes para cubrir el viewport en las 3 grillas responsive). */
    contenedor.replaceChildren();
    for (let i = 0; i < 6; i += 1) {
        contenedor.append(crearSkeletonCard());
    }

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
                'No pudimos cargar los productos. Revisá la conexión e intentá de nuevo.')
        );
    }
};

/* renderDestacados: llena el carrusel con los productos destacados (los que
   tienen badge NUEVO u OFERTA) y cablea las flechas de scroll. Si no hay
   destacados, oculta la seccion entera. Reutiliza crearCard y productosCargados,
   asi que se llama despues de renderCatalogo. */
const renderDestacados = () => {
    const seccion = document.querySelector('#destacados');
    const pista = document.querySelector('#destacados-pista');
    if (!seccion || !pista) {
        return;
    }

    const destacados = productosCargados.filter((p) => p.badge);

    /* Sin destacados: no mostramos la seccion */
    if (destacados.length === 0) {
        seccion.hidden = true;
        return;
    }

    pista.replaceChildren();
    destacados.forEach((producto) => pista.append(crearCard(producto)));
    seccion.hidden = false;

    /* Flechas: desplazan la pista ~un ancho de card (80% del viewport de la pista). */
    const prev = document.querySelector('#destacados-prev');
    const next = document.querySelector('#destacados-next');
    const paso = () => Math.round(pista.clientWidth * 0.8);
    if (prev) {
        prev.addEventListener('click', () => pista.scrollBy({ left: -paso(), behavior: 'smooth' }));
    }
    if (next) {
        next.addEventListener('click', () => pista.scrollBy({ left: paso(), behavior: 'smooth' }));
    }
};


/* La validacion del formulario de contacto se movio a js/contacto.js
   junto con la pagina contacto.html. app.js queda enfocado en el catalogo. */


/* ====== 5. HANDLERS ====== */

/* Handler delegado del catalogo: un solo listener en el contenedor (req 28).
   closest() sube por el DOM hasta encontrar el boton de carrito.
   "Ver detalle" ya no pasa por aca: es un link a producto.html. */
const handlerCatalogo = (evento) => {
    /* Click en "agregar al carrito": upsert del item (Parcial 2). */
    const botonCarrito = evento.target.closest('.producto__carrito');
    if (!botonCarrito) {
        return;
    }
    const idProducto = Number(botonCarrito.dataset.id);
    /* agregarAlCarrito viene de js/carrito.js (cargado en index.html). */
    agregarAlCarrito(idProducto).catch((error) => {
        console.error('No se pudo agregar al carrito:', error);
        mostrarToast('No se pudo agregar al carrito. Intentá de nuevo.', 'error');
    });
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
    /* a) estado de sesion en la navbar (login / email + salir) */
    pintarNavSesion();
    /* badge con la cantidad de items del carrito (viene de js/carrito.js) */
    actualizarBadgeCarrito();

    /* b) renderizamos las cards desde Supabase */
    await renderCatalogo();

    /* c) carrusel de destacados (usa productosCargados ya poblado) */
    renderDestacados();

    /* d) demos funcionales con los datos ya cargados */
    correrDemosFuncionales(productosCargados);
};

/* Listener 1: click delegado en el grid de catalogo (req 28).
   Un solo listener captura clicks de todas las cards/botones.
   (El submit del form de contacto ahora vive en js/contacto.js.) */
const catalogoEl = document.querySelector('#catalogo-grid');
if (catalogoEl) {
    catalogoEl.addEventListener('click', handlerCatalogo);
}

/* Listener 1b: el carrusel de Destacados usa las MISMAS cards (crearCard),
   pero vive en otro contenedor (#destacados-pista). Sin este listener, el
   boton "Agregar al carrito" de las cards destacadas no hacia nada. */
const destacadosEl = document.querySelector('#destacados-pista');
if (destacadosEl) {
    destacadosEl.addEventListener('click', handlerCatalogo);
}

/* Listener 2: click en cada link del nav para togglear la clase activa.
   Usamos forEach con arrow para cumplir req 31. */
document.querySelectorAll('.nav__link').forEach((link) => {
    link.addEventListener('click', handlerNavLink);
});

/* Arranque */
init();
