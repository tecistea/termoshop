/* ====================================================================
   termoshop - js/producto.js
   --------------------------------------------------------------------
   Pagina de detalle de un producto (producto.html?id=N). Lee el id de
   la URL, pide ese producto a Supabase (reutiliza apiGet de js/api.js)
   y lo renderiza completo. Maneja id invalido, producto inexistente y
   error de red con mensajes, igual que renderCatalogo en app.js.

   Reglas (clases 5 y 6): const por defecto, arrow functions, ===,
   createElement + textContent (NO innerHTML). Reutiliza crearElemento y
   formatearPrecio de js/utils.js, y agregarAlCarrito de js/carrito.js.
   ==================================================================== */

'use strict';

/* obtenerProducto: GET a productos filtrando por id. PostgREST devuelve
   un array; tomamos el primer elemento (o undefined si no existe). */
const obtenerProducto = async (id) => {
    const filas = await apiGet('productos', `?id=eq.${id}&select=*`);
    return filas[0];
};

/* mostrarEstado: reemplaza el contenido del contenedor por un mensaje
   (carga / no encontrado / error), con clase opcional para el estilo. */
const mostrarEstado = (contenedor, mensaje, claseExtra = '') => {
    const clase = claseExtra ? `catalogo__estado ${claseExtra}` : 'catalogo__estado';
    contenedor.replaceChildren(crearElemento('p', clase, mensaje));
};

/* crearDetalle: arma el bloque de detalle del producto con createElement
   + textContent (nunca innerHTML). Devuelve el <div> listo para insertar. */
const crearDetalle = (producto) => {
    const detalle = crearElemento('div', 'detalle');

    /* Columna imagen */
    const figura = crearElemento('div', 'detalle__media');
    const img = document.createElement('img');
    img.src = producto.imagen;
    img.alt = `${producto.nombre} de la marca ${producto.marca}`;
    img.loading = 'lazy';
    img.width = 600;
    img.height = 600;
    img.className = 'detalle__imagen';
    figura.append(img);

    /* Badge condicional (NUEVO u OFERTA), mismo criterio que crearCard */
    if (producto.badge) {
        const claseBadge = producto.badge === 'OFERTA' ? 'badge badge--oferta' : 'badge badge--nuevo';
        figura.append(crearElemento('span', claseBadge, producto.badge));
    }

    /* Columna info */
    const info = crearElemento('div', 'detalle__info');
    info.append(
        crearElemento('span', 'producto__marca', producto.marca),
        crearElemento('h1', 'detalle__nombre', producto.nombre),
        crearElemento('p', 'producto__meta', `${producto.capacidad} - ${producto.material}`),
        crearElemento('p', 'detalle__precio', formatearPrecio(producto.precio)),
        crearElemento('p', 'producto__stock', `Stock disponible: ${producto.stock} unidades`),
        crearElemento('p', 'detalle__descripcion', producto.descripcion)
    );

    /* Acciones: agregar al carrito + volver al catalogo */
    const acciones = crearElemento('div', 'detalle__acciones');

    const btnCarrito = crearBotonIcono('button', 'btn btn--primario', 'Agregar al carrito', 'carrito');
    btnCarrito.type = 'button';
    btnCarrito.addEventListener('click', () => {
        /* agregarAlCarrito viene de js/carrito.js */
        agregarAlCarrito(producto.id).catch((error) => {
            console.error('No se pudo agregar al carrito:', error);
            mostrarToast('No se pudo agregar al carrito. Intentá de nuevo.', 'error');
        });
    });

    const btnVolver = crearElemento('a', 'btn btn--secundario', 'Volver al catálogo');
    btnVolver.href = 'index.html#catalogo';

    acciones.append(btnCarrito, btnVolver);
    info.append(acciones);

    detalle.append(figura, info);
    return detalle;
};

/* renderDetalle: orquesta lectura de URL, fetch y render con manejo de
   los tres casos de error. */
const renderDetalle = async () => {
    const contenedor = document.querySelector('#detalle-producto');
    if (!contenedor) {
        return;
    }

    /* 1) Leer y validar el id de la URL (?id=N) */
    const idCrudo = new URLSearchParams(window.location.search).get('id');
    const id = Number(idCrudo);
    if (!idCrudo || !Number.isInteger(id) || id <= 0) {
        mostrarEstado(contenedor, 'Producto no válido. Volvé al catálogo y elegí uno.', 'catalogo__estado--error');
        return;
    }

    /* 2) Pedir el producto */
    mostrarEstado(contenedor, 'Cargando producto...');
    try {
        const producto = await obtenerProducto(id);
        if (!producto) {
            mostrarEstado(contenedor, 'No encontramos ese producto. Puede que ya no esté disponible.', 'catalogo__estado--error');
            return;
        }
        /* Titulo de la pestana con el nombre del producto */
        document.title = `termoshop - ${producto.nombre}`;
        contenedor.replaceChildren(crearDetalle(producto));
    } catch (error) {
        console.error('Error cargando el producto:', error);
        mostrarEstado(contenedor, 'No pudimos cargar el producto. Revisá la conexión e intentá de nuevo.', 'catalogo__estado--error');
    }
};


/* ====== INICIALIZACION ======
   Con defer el DOM ya esta parseado. */
pintarNavSesion();
actualizarBadgeCarrito();
renderDetalle();
