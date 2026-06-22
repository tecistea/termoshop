/* ====================================================================
   termoshop - js/ordenes.js (Parcial 2)
   --------------------------------------------------------------------
   Pagina de ordenes (ordenes.html). Muestra el historial de compras:
     - usuario comun: RLS le devuelve SOLO sus ordenes.
     - admin: la policy "ordenes - admin lee todas" le devuelve TODAS.
   El mismo GET sirve para ambos; es la base (RLS) la que filtra segun
   el rol, no el cliente. Render con createElement + textContent.
   ==================================================================== */

'use strict';

/* iniciarPaginaOrdenes: arma la pagina. Solo corre si existe el
   contenedor #ordenes-lista (es decir, estamos en ordenes.html). */
const iniciarPaginaOrdenes = () => {
    const lista = document.querySelector('#ordenes-lista');
    if (!lista) {
        return;
    }

    /* Guard: hay que estar logueado */
    const sesion = requerirSesion();
    if (!sesion) {
        return;
    }

    const subtitulo = document.querySelector('#ordenes-subtitulo');
    const esAdmin = sesion.rol === 'admin';

    /* formatearFecha: pasa el timestamptz de Supabase a algo legible es-AR. */
    const formatearFecha = (iso) =>
        new Date(iso).toLocaleString('es-AR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });

    /* render: pide las ordenes y arma una tarjeta por cada una.
       El admin recibe todas (RLS); el usuario solo las suyas. */
    const render = async () => {
        lista.replaceChildren();

        /* Mas nuevas primero. No filtramos por usuario en el cliente:
           RLS ya decide que filas devuelve segun el rol. */
        const ordenes = await authGet('ordenes', '?select=*&order=creado_en.desc');

        if (ordenes.length === 0) {
            lista.append(crearElemento('p', 'catalogo__estado',
                esAdmin ? 'Todavia no hay ordenes.' : 'Todavia no hiciste ninguna compra.'));
            return;
        }

        ordenes.forEach((orden) => {
            const tarjeta = crearElemento('article', 'orden');

            /* Encabezado: numero de orden + fecha + total */
            const cabecera = crearElemento('div', 'orden__cabecera');
            cabecera.append(
                crearElemento('span', 'orden__id', `Orden #${orden.id}`),
                crearElemento('span', 'orden__fecha', formatearFecha(orden.creado_en)),
                crearElemento('span', 'orden__total', formatearPrecio(orden.total))
            );
            tarjeta.append(cabecera);

            /* Si es admin, mostramos a que usuario pertenece (UUID) */
            if (esAdmin) {
                tarjeta.append(
                    crearElemento('p', 'orden__usuario', `Usuario: ${orden.usuario_id}`)
                );
            }

            /* Detalle de items: el snapshot guardado en jsonb al hacer checkout */
            const ul = crearElemento('ul', 'orden__items');
            orden.items.forEach((item) => {
                const li = crearElemento('li', '',
                    `${item.cantidad} x ${item.nombre} - ${formatearPrecio(item.precio)}`);
                ul.append(li);
            });
            tarjeta.append(ul);

            lista.append(tarjeta);
        });
    };

    /* Subtitulo segun rol */
    if (subtitulo) {
        subtitulo.textContent = esAdmin
            ? 'Todas las ordenes de la tienda (vista de administrador).'
            : 'Tu historial de compras.';
    }

    /* Arranque */
    pintarNavSesion();
    render().catch((error) => {
        console.error('Error cargando ordenes:', error);
        lista.replaceChildren(
            crearElemento('p', 'catalogo__estado catalogo__estado--error',
                'No pudimos cargar las ordenes. Intenta de nuevo.')
        );
    });
};

iniciarPaginaOrdenes();
