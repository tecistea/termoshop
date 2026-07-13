/* ====================================================================
   termoshop - js/admin.js (Parcial 2)
   --------------------------------------------------------------------
   Panel CRUD de productos. Solo accesible para admin (guard al inicio).
   Las escrituras usan los helpers authPost/authPatch/authDelete de
   sesion.js, que mandan el JWT del admin para pasar RLS (es_admin()).
   Render con createElement + textContent (sin innerHTML para datos).
   ==================================================================== */

'use strict';

/* iniciarAdmin agrupa el arranque del panel (arrow, como todo el proyecto).
   Se define antes de llamarla para no depender de hoisting. */
const iniciarAdmin = () => {
    const form = document.querySelector('#form-producto');
    const tbody = document.querySelector('#admin-tbody');
    const mensaje = document.querySelector('#admin-mensaje');
    const tituloForm = document.querySelector('#form-producto-titulo');
    const btnCancelar = document.querySelector('#btn-cancelar');

    /* mostrarMensaje: feedback reutilizable (verde / rojo). */
    const mostrarMensaje = (texto, esError) => {
        mensaje.textContent = texto;
        mensaje.hidden = false;
        mensaje.classList.toggle('form__exito--error', esError);
    };

    /* leerFormulario: arma el objeto producto desde los inputs.
       precio y stock se castean a Number; badge vacio queda null. */
    const leerFormulario = () => ({
        nombre: document.querySelector('#p-nombre').value.trim(),
        marca: document.querySelector('#p-marca').value.trim(),
        capacidad: document.querySelector('#p-capacidad').value.trim(),
        material: document.querySelector('#p-material').value.trim(),
        precio: Number(document.querySelector('#p-precio').value),
        stock: Number(document.querySelector('#p-stock').value),
        badge: document.querySelector('#p-badge').value || null,
        imagen: document.querySelector('#p-imagen').value.trim(),
        descripcion: document.querySelector('#p-descripcion').value.trim()
    });

    /* cargarEnFormulario: vuelca un producto en los inputs para editar. */
    const cargarEnFormulario = (p) => {
        document.querySelector('#p-nombre').value = p.nombre || '';
        document.querySelector('#p-marca').value = p.marca || '';
        document.querySelector('#p-capacidad').value = p.capacidad || '';
        document.querySelector('#p-material').value = p.material || '';
        document.querySelector('#p-precio').value = p.precio ?? '';
        document.querySelector('#p-stock').value = p.stock ?? '';
        document.querySelector('#p-badge').value = p.badge || '';
        document.querySelector('#p-imagen').value = p.imagen || '';
        document.querySelector('#p-descripcion').value = p.descripcion || '';
    };

    /* salirDeEdicion: vuelve el form a modo "crear". */
    const salirDeEdicion = () => {
        form.dataset.editando = '';
        tituloForm.textContent = 'Nuevo producto';
        btnCancelar.hidden = true;
        form.reset();
    };

    /* renderTabla: pide los productos y arma una fila por cada uno. */
    const renderTabla = async () => {
        tbody.replaceChildren();
        const productos = await apiGet('productos', '?select=*&order=id.asc');

        productos.forEach((p) => {
            const fila = document.createElement('tr');

            const celdas = [p.id, p.nombre, p.marca, formatearPrecio(p.precio), p.stock];
            celdas.forEach((valor) => {
                const td = document.createElement('td');
                td.textContent = valor;
                fila.append(td);
            });

            /* Celda de acciones: editar / borrar con data-id */
            const tdAcciones = document.createElement('td');

            const btnEditar = document.createElement('button');
            btnEditar.type = 'button';
            btnEditar.className = 'btn btn--secundario';
            btnEditar.textContent = 'Editar';
            btnEditar.dataset.id = p.id;
            btnEditar.dataset.accion = 'editar';

            const btnBorrar = document.createElement('button');
            btnBorrar.type = 'button';
            btnBorrar.className = 'btn btn--peligro';
            btnBorrar.textContent = 'Borrar';
            btnBorrar.dataset.id = p.id;
            btnBorrar.dataset.accion = 'borrar';

            tdAcciones.append(btnEditar, btnBorrar);
            fila.append(tdAcciones);
            tbody.append(fila);
        });
    };

    /* Submit: crea (POST) o actualiza (PATCH) segun data-editando. */
    form.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        const datos = leerFormulario();

        if (!datos.nombre || Number.isNaN(datos.precio)) {
            mostrarMensaje('Nombre y precio son obligatorios.', true);
            return;
        }

        try {
            const editandoId = form.dataset.editando;
            if (editandoId) {
                await authPatch('productos', `?id=eq.${editandoId}`, datos);
                mostrarMensaje('Producto actualizado.', false);
            } else {
                await authPost('productos', datos);
                mostrarMensaje('Producto creado.', false);
            }
            salirDeEdicion();
            await renderTabla();
        } catch (error) {
            mostrarMensaje(error.message, true);
        }
    });

    /* Listener delegado del tbody: editar o borrar segun data-accion. */
    tbody.addEventListener('click', async (evento) => {
        const boton = evento.target.closest('button[data-accion]');
        if (!boton) {
            return;
        }
        const id = boton.dataset.id;

        if (boton.dataset.accion === 'editar') {
            const filas = await apiGet('productos', `?id=eq.${id}&select=*`);
            if (filas.length > 0) {
                cargarEnFormulario(filas[0]);
                form.dataset.editando = id;
                tituloForm.textContent = `Editando producto #${id}`;
                btnCancelar.hidden = false;
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } else if (boton.dataset.accion === 'borrar') {
            if (!confirm('¿Seguro que querés borrar este producto?')) {
                return;
            }
            try {
                await authDelete('productos', `?id=eq.${id}`);
                await renderTabla();
            } catch (error) {
                mostrarMensaje(error.message, true);
            }
        }
    });

    /* Cancelar edicion */
    btnCancelar.addEventListener('click', salirDeEdicion);

    /* Arranque: pintamos la tabla */
    renderTabla().catch((error) => mostrarMensaje(error.message, true));
};


/* Guard: si no es admin, requerirAdmin redirige y devuelve null.
   Solo si es admin pintamos la navbar y arrancamos el panel. */
const sesionAdmin = requerirAdmin();
if (sesionAdmin) {
    pintarNavSesion();
    iniciarAdmin();
}
