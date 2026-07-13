/* ====================================================================
   termoshop - js/footer.js
   --------------------------------------------------------------------
   Footer unico e identico para todas las paginas. Antes estaba copiado
   a mano en cada HTML (con 3 variantes distintas). Ahora hay una sola
   fuente de verdad: se define aca y se inyecta en el contenedor
   <footer class="pie" id="pie"></footer> de cada pagina.

   Patron calcado de pintarNavSesion() en js/sesion.js: createElement +
   textContent (nunca innerHTML). Con <script defer> el DOM ya esta
   parseado, asi que el archivo se auto-ejecuta al final sin necesidad
   de que cada pagina llame a la funcion.
   ==================================================================== */

'use strict';

/* Datos de contacto centralizados: si cambian, se editan en un solo lugar. */
const DATOS_CONTACTO = {
    email: 'info@termoshop.ar',
    direccion: 'Av. Belgrano 723, CABA'
};

/* crearColumnaFooter: arma una <div class="pie__col"> con su titulo y
   una lista de nodos ya construidos (parrafos o links). */
const crearColumnaFooter = (titulo, nodos) => {
    const col = crearElemento('div', 'pie__col');
    col.append(crearElemento('h3', 'pie__titulo', titulo));
    nodos.forEach((nodo) => col.append(nodo));
    return col;
};

/* pintarFooter: construye las 3 columnas y las inyecta en #pie.
   Si la pagina no tiene el contenedor, no hace nada (guard). */
const pintarFooter = () => {
    const contenedor = document.querySelector('#pie');
    if (!contenedor) {
        return;
    }
    contenedor.replaceChildren();

    /* Columna 1: marca */
    const colMarca = crearColumnaFooter('termoshop', [
        crearElemento('p', '', 'Termos premium en Argentina desde 2026.')
    ]);

    /* Columna 2: contacto. La direccion linkea a la pagina de contacto
       y el email es un mailto real (antes era texto plano). */
    const linkDireccion = document.createElement('a');
    linkDireccion.href = 'contacto.html#ubicacion';
    linkDireccion.className = 'pie__link';
    linkDireccion.textContent = DATOS_CONTACTO.direccion;
    const pDireccion = crearElemento('p');
    pDireccion.append(linkDireccion);

    const linkEmail = document.createElement('a');
    linkEmail.href = `mailto:${DATOS_CONTACTO.email}`;
    linkEmail.className = 'pie__link';
    linkEmail.textContent = DATOS_CONTACTO.email;
    const pEmail = crearElemento('p');
    pEmail.append(linkEmail);

    const colContacto = crearColumnaFooter('Contacto', [pDireccion, pEmail]);

    /* Columna 3: legales */
    const colLegales = crearColumnaFooter('Legales', [
        crearElemento('p', '', '© 2026 termoshop. ISTEA - Aplicaciones Web Cliente.')
    ]);

    contenedor.append(colMarca, colContacto, colLegales);
};

/* Auto-arranque: con defer el DOM ya esta listo. */
pintarFooter();
