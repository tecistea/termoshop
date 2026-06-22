/* ====================================================================
   termoshop - js/api.js (Parcial 2)
   --------------------------------------------------------------------
   Wrapper minimo sobre la REST API de Supabase (PostgREST) usando fetch.
   SIN SDK, sin librerias: solo fetch nativo.

   PostgREST usa filtros en el querystring, por ejemplo:
     ?select=*              -> trae todas las columnas
     ?id=eq.5               -> where id = 5
     ?email=eq.vos@ej.com   -> where email = 'vos@ej.com'
     ?order=creado_en.desc  -> order by

   Reglas (igual que el parcial 1): const por defecto, arrow functions,
   === siempre, nunca var.
   ==================================================================== */

'use strict';

/* Headers comunes a todas las requests:
   - apikey + Authorization: autentican con la anon key.
   - Content-Type: el body va como JSON.
   - Prefer return=representation: que el POST/PATCH devuelva la fila
     resultante (asi el cliente recibe el registro creado/actualizado). */
const headersBase = () => ({
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
});

/* manejarRespuesta: centraliza el chequeo de errores HTTP.
   Si la respuesta no es ok, lanza con el detalle que devuelve Supabase. */
const manejarRespuesta = async (respuesta) => {
    if (!respuesta.ok) {
        const detalle = await respuesta.text();
        throw new Error(`Supabase ${respuesta.status}: ${detalle}`);
    }
    /* 204 No Content (algunos DELETE) no traen body parseable. */
    if (respuesta.status === 204) {
        return null;
    }
    return respuesta.json();
};

/* apiGet: lee filas. `query` es el querystring PostgREST (sin la tabla).
   Ej: apiGet('productos', '?select=*&order=id.asc') */
const apiGet = async (tabla, query = '?select=*') => {
    const respuesta = await fetch(`${SUPABASE_REST}/${tabla}${query}`, {
        method: 'GET',
        headers: headersBase()
    });
    return manejarRespuesta(respuesta);
};

/* apiPost: inserta una fila (o varias si body es array). */
const apiPost = async (tabla, body) => {
    const respuesta = await fetch(`${SUPABASE_REST}/${tabla}`, {
        method: 'POST',
        headers: headersBase(),
        body: JSON.stringify(body)
    });
    return manejarRespuesta(respuesta);
};

/* apiPatch: actualiza las filas que matcheen el filtro.
   Ej: apiPatch('productos', '?id=eq.5', { precio: 100000 }) */
const apiPatch = async (tabla, query, body) => {
    const respuesta = await fetch(`${SUPABASE_REST}/${tabla}${query}`, {
        method: 'PATCH',
        headers: headersBase(),
        body: JSON.stringify(body)
    });
    return manejarRespuesta(respuesta);
};

/* apiDelete: borra las filas que matcheen el filtro.
   Ej: apiDelete('carrito_items', '?id=eq.5') */
const apiDelete = async (tabla, query) => {
    const respuesta = await fetch(`${SUPABASE_REST}/${tabla}${query}`, {
        method: 'DELETE',
        headers: headersBase()
    });
    return manejarRespuesta(respuesta);
};
