/* ====================================================================
   termoshop - js/sesion.js (Parcial 2)
   --------------------------------------------------------------------
   Autenticacion contra Supabase Auth (/auth/v1) usando fetch, SIN SDK.
   Maneja registro, login, logout, la sesion en localStorage y el guard
   de roles para proteger paginas (admin.html, carrito.html).

   Seguridad: las passwords las hashea Supabase; aca nunca se guardan.
   En localStorage solo persiste el access_token (JWT) + datos del usuario
   (id, email, rol). El rol se lee de la tabla perfiles y la base lo
   protege via RLS, asi que aunque alguien lo edite a mano en localStorage,
   no podra escribir productos si no es admin de verdad.
   ==================================================================== */

'use strict';

/* Clave bajo la cual guardamos la sesion en localStorage */
const SESION_KEY = 'termoshop_sesion';

/* Endpoints de Supabase Auth */
const AUTH_URL = `${SUPABASE_URL}/auth/v1`;


/* ====== PERSISTENCIA DE SESION ====== */

/* guardarSesion: serializa { token, id, email, rol } a localStorage. */
const guardarSesion = (sesion) => {
    localStorage.setItem(SESION_KEY, JSON.stringify(sesion));
};

/* obtenerSesion: devuelve el objeto sesion o null si no hay. */
const obtenerSesion = () => {
    const crudo = localStorage.getItem(SESION_KEY);
    return crudo ? JSON.parse(crudo) : null;
};

/* cerrarSesion: borra la sesion y redirige al inicio. */
const cerrarSesion = () => {
    localStorage.removeItem(SESION_KEY);
    window.location.href = 'index.html';
};


/* ====== AUTH ====== */

/* obtenerRol: con el JWT del usuario, consulta su perfil y devuelve el rol.
   Usamos el token del usuario (no la anon key) para que RLS permita leer
   SOLO su propio perfil. */
const obtenerRol = async (token, usuarioId) => {
    const respuesta = await fetch(`${SUPABASE_REST}/perfiles?id=eq.${usuarioId}&select=rol`, {
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${token}`
        }
    });
    if (!respuesta.ok) {
        throw new Error('No se pudo obtener el perfil del usuario.');
    }
    const filas = await respuesta.json();
    /* Si el trigger ya creo el perfil, viene una fila; por las dudas, default. */
    return filas.length > 0 ? filas[0].rol : 'usuario';
};

/* registrar: crea el usuario en Supabase Auth. El trigger de la base
   crea su perfil con rol 'usuario'. No inicia sesion automaticamente:
   devolvemos el resultado para que la UI muestre el mensaje adecuado. */
const registrar = async (email, password) => {
    const respuesta = await fetch(`${AUTH_URL}/signup`, {
        method: 'POST',
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });
    const data = await respuesta.json();
    if (!respuesta.ok) {
        /* Supabase devuelve el motivo en msg / error_description */
        throw new Error(data.msg || data.error_description || 'No se pudo registrar.');
    }
    return data;
};

/* iniciarSesion: login con grant_type=password. Si va bien, guarda la
   sesion (token + datos + rol) y la devuelve. */
const iniciarSesion = async (email, password) => {
    const respuesta = await fetch(`${AUTH_URL}/token?grant_type=password`, {
        method: 'POST',
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });
    const data = await respuesta.json();
    if (!respuesta.ok) {
        throw new Error(data.msg || data.error_description || 'Email o contrasena incorrectos.');
    }

    const token = data.access_token;
    const usuario = data.user;
    const rol = await obtenerRol(token, usuario.id);

    const sesion = { token, id: usuario.id, email: usuario.email, rol };
    guardarSesion(sesion);
    return sesion;
};


/* ====== FETCH AUTENTICADO ======
   Las operaciones que RLS protege (CRUD de productos, carrito, ordenes)
   deben ir con el JWT del usuario, NO con la anon key. Estos helpers son
   como los de api.js pero mandan Authorization: Bearer <token del usuario>.
   Asi la base aplica las policies por auth.uid() / es_admin(). */

const headersAuth = () => {
    const sesion = obtenerSesion();
    return {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${sesion ? sesion.token : SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    };
};

const manejarRespuestaAuth = async (respuesta) => {
    if (!respuesta.ok) {
        const detalle = await respuesta.text();
        throw new Error(`Supabase ${respuesta.status}: ${detalle}`);
    }
    if (respuesta.status === 204) {
        return null;
    }
    return respuesta.json();
};

const authGet = async (tabla, query = '?select=*') =>
    manejarRespuestaAuth(await fetch(`${SUPABASE_REST}/${tabla}${query}`, { headers: headersAuth() }));

const authPost = async (tabla, body) =>
    manejarRespuestaAuth(await fetch(`${SUPABASE_REST}/${tabla}`, {
        method: 'POST', headers: headersAuth(), body: JSON.stringify(body)
    }));

const authPatch = async (tabla, query, body) =>
    manejarRespuestaAuth(await fetch(`${SUPABASE_REST}/${tabla}${query}`, {
        method: 'PATCH', headers: headersAuth(), body: JSON.stringify(body)
    }));

const authDelete = async (tabla, query) =>
    manejarRespuestaAuth(await fetch(`${SUPABASE_REST}/${tabla}${query}`, {
        method: 'DELETE', headers: headersAuth()
    }));


/* ====== GUARD DE ROLES ======
   requerirSesion: si no hay sesion, manda a login. Devuelve la sesion.
   requerirAdmin: ademas exige rol admin; si no, vuelve al inicio.
   Se llaman al tope de los scripts de paginas protegidas. */

const requerirSesion = () => {
    const sesion = obtenerSesion();
    if (!sesion) {
        window.location.href = 'login.html';
        return null;
    }
    return sesion;
};

const requerirAdmin = () => {
    const sesion = requerirSesion();
    if (sesion && sesion.rol !== 'admin') {
        alert('Esta seccion es solo para administradores.');
        window.location.href = 'index.html';
        return null;
    }
    return sesion;
};


/* ====== NAVBAR ======
   pintarNavSesion: muestra "Iniciar sesion" o el email + Salir segun
   haya sesion. Se llama desde cada pagina que tenga el contenedor
   #nav-sesion en la navbar. */
const pintarNavSesion = () => {
    const contenedor = document.querySelector('#nav-sesion');
    if (!contenedor) {
        return;
    }
    contenedor.replaceChildren();
    const sesion = obtenerSesion();

    if (!sesion) {
        const link = document.createElement('a');
        link.href = 'login.html';
        link.className = 'nav__link';
        link.textContent = 'Iniciar sesion';
        contenedor.append(link);
        return;
    }

    /* Saludo */
    const saludo = document.createElement('span');
    saludo.className = 'nav__sesion-email';
    saludo.textContent = `Hola, ${sesion.email}`;
    contenedor.append(saludo);

    /* Link al panel admin solo si es admin */
    if (sesion.rol === 'admin') {
        const admin = document.createElement('a');
        admin.href = 'admin.html';
        admin.className = 'nav__link';
        admin.textContent = 'Admin';
        contenedor.append(admin);
    }

    /* Link al carrito */
    const carrito = document.createElement('a');
    carrito.href = 'carrito.html';
    carrito.className = 'nav__link';
    carrito.textContent = 'Carrito';
    contenedor.append(carrito);

    /* Link a ordenes (historial propio; el admin ve todas) */
    const ordenes = document.createElement('a');
    ordenes.href = 'ordenes.html';
    ordenes.className = 'nav__link';
    ordenes.textContent = 'Ordenes';
    contenedor.append(ordenes);

    /* Boton salir */
    const salir = document.createElement('button');
    salir.type = 'button';
    salir.className = 'btn btn--secundario nav__salir';
    salir.textContent = 'Salir';
    salir.addEventListener('click', cerrarSesion);
    contenedor.append(salir);
};
