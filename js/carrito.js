/* ====================================================================
   termoshop - js/carrito.js (Parcial 2)
   --------------------------------------------------------------------
   Carrito persistido en Supabase (tabla carrito_items) por usuario y
   checkout que genera una orden (tabla ordenes). Usa los helpers
   autenticados de sesion.js para que RLS aisle cada carrito por usuario.

   Este archivo se usa en dos contextos:
     - En index.html: solo se necesita agregarAlCarrito (boton de cada card).
     - En carrito.html: ademas se lista, edita y hace checkout.
   Por eso las funciones de pagina se ejecutan solo si existe su contenedor.
   ==================================================================== */

'use strict';

/* agregarAlCarrito: upsert de (usuario, producto). Si ya existe el item,
   PostgREST con resolution=merge-duplicates actualiza la fila. Para sumar
   cantidad de forma simple, leemos la cantidad actual y mandamos +1. */
const agregarAlCarrito = async (productoId) => {
    const sesion = obtenerSesion();
    if (!sesion) {
        alert('Inicia sesion para agregar productos al carrito.');
        window.location.href = 'login.html';
        return;
    }

    /* Buscamos si ya esta en el carrito para sumar cantidad */
    const existentes = await authGet(
        'carrito_items',
        `?usuario_id=eq.${sesion.id}&producto_id=eq.${productoId}&select=*`
    );

    if (existentes.length > 0) {
        const item = existentes[0];
        await authPatch('carrito_items', `?id=eq.${item.id}`, { cantidad: item.cantidad + 1 });
    } else {
        await authPost('carrito_items', {
            usuario_id: sesion.id,
            producto_id: productoId,
            cantidad: 1
        });
    }
    alert('Producto agregado al carrito.');
};


/* obtenerCarrito: trae los items del usuario con los datos del producto
   embebidos (PostgREST embed: productos(*)) para mostrar nombre y precio. */
const obtenerCarrito = async (usuarioId) =>
    authGet(
        'carrito_items',
        `?usuario_id=eq.${usuarioId}&select=*,productos(*)&order=id.asc`
    );


/* iniciarPaginaCarrito: arma la pagina carrito.html. Solo corre si hay
   contenedor #carrito-lista (es decir, estamos en carrito.html). */
const iniciarPaginaCarrito = () => {
    const lista = document.querySelector('#carrito-lista');
    if (!lista) {
        return;
    }

    /* Guard: hay que estar logueado para tener carrito */
    const sesion = requerirSesion();
    if (!sesion) {
        return;
    }

    const totalEl = document.querySelector('#carrito-total');
    const btnCheckout = document.querySelector('#btn-checkout');
    const mensaje = document.querySelector('#carrito-mensaje');

    const mostrarMensaje = (texto, esError) => {
        mensaje.textContent = texto;
        mensaje.hidden = false;
        mensaje.classList.toggle('form__exito--error', esError);
    };

    /* calcularTotal: suma precio * cantidad de cada item. */
    const calcularTotal = (items) =>
        items.reduce((acc, item) => acc + item.productos.precio * item.cantidad, 0);

    /* render: pinta cada item con su cantidad editable y boton de quitar. */
    const render = async () => {
        lista.replaceChildren();
        const items = await obtenerCarrito(sesion.id);

        if (items.length === 0) {
            lista.append(crearElemento('p', 'catalogo__estado', 'Tu carrito esta vacio.'));
            totalEl.textContent = '';
            btnCheckout.hidden = true;
            return;
        }

        items.forEach((item) => {
            const fila = crearElemento('div', 'carrito__item');
            fila.dataset.id = item.id;

            const info = crearElemento('span', '',
                `${item.productos.nombre} - ${formatearPrecio(item.productos.precio)}`);

            /* Input de cantidad: al cambiar, PATCH de la fila */
            const cantidad = document.createElement('input');
            cantidad.type = 'number';
            cantidad.min = 1;
            cantidad.value = item.cantidad;
            cantidad.className = 'carrito__cantidad';
            cantidad.dataset.id = item.id;
            cantidad.dataset.accion = 'cantidad';

            const quitar = crearElemento('button', 'boton--secundario boton--peligro', 'Quitar');
            quitar.type = 'button';
            quitar.dataset.id = item.id;
            quitar.dataset.accion = 'quitar';

            fila.append(info, cantidad, quitar);
            lista.append(fila);
        });

        totalEl.textContent = `Total: ${formatearPrecio(calcularTotal(items))}`;
        btnCheckout.hidden = false;
    };

    /* Listener delegado: cambiar cantidad (change) y quitar (click). */
    lista.addEventListener('change', async (evento) => {
        const input = evento.target.closest('input[data-accion="cantidad"]');
        if (!input) {
            return;
        }
        const nueva = Number(input.value);
        if (nueva < 1 || Number.isNaN(nueva)) {
            input.value = 1;
            return;
        }
        try {
            await authPatch('carrito_items', `?id=eq.${input.dataset.id}`, { cantidad: nueva });
            await render();
        } catch (error) {
            mostrarMensaje(error.message, true);
        }
    });

    lista.addEventListener('click', async (evento) => {
        const boton = evento.target.closest('button[data-accion="quitar"]');
        if (!boton) {
            return;
        }
        try {
            await authDelete('carrito_items', `?id=eq.${boton.dataset.id}`);
            await render();
        } catch (error) {
            mostrarMensaje(error.message, true);
        }
    });

    /* Checkout: crea una orden con snapshot de items + total y vacia el carrito. */
    btnCheckout.addEventListener('click', async () => {
        try {
            const items = await obtenerCarrito(sesion.id);
            if (items.length === 0) {
                return;
            }

            /* Snapshot legible de lo comprado (no dependemos de FKs futuras) */
            const snapshot = items.map((item) => ({
                producto_id: item.producto_id,
                nombre: item.productos.nombre,
                precio: item.productos.precio,
                cantidad: item.cantidad
            }));
            const total = calcularTotal(items);

            await authPost('ordenes', {
                usuario_id: sesion.id,
                total,
                items: snapshot
            });

            /* Vaciamos el carrito del usuario */
            await authDelete('carrito_items', `?usuario_id=eq.${sesion.id}`);

            mostrarMensaje(`Compra realizada por ${formatearPrecio(total)}. Gracias!`, false);
            await render();
        } catch (error) {
            mostrarMensaje(error.message, true);
        }
    });

    /* Arranque */
    pintarNavSesion();
    render().catch((error) => mostrarMensaje(error.message, true));
};

/* Si estamos en carrito.html, iniciamos la pagina. */
iniciarPaginaCarrito();
