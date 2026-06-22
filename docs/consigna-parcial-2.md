# Consigna — Parcial 2

> **Materia:** Aplicaciones Web Cliente
> **Institución:** ISTEA
> **Cuatrimestre:** 1° / 2026
> **Proyecto:** `termoshop` — evolución del parcial 1 a un ecommerce con backend (Supabase)

---

## Origen de esta consigna

El parcial 1 dejó un catálogo **vanilla** (HTML/CSS/JS) con los productos hardcodeados en un array. El parcial 2 lleva ese proyecto a **datos reales**: persistencia en **Supabase**, **autenticación con roles** y un **carrito de compras**.

Se mantienen los constraints del parcial 1 (vanilla, sin frameworks ni build tools) y se suma una regla nueva: **toda la comunicación con el backend usa `fetch` contra la REST API de Supabase, sin SDK**.

---

## Alcance funcional

1. **CRUD de productos** persistido en Supabase (tabla `productos`).
2. **Dos roles**: `usuario` (ve catálogo y compra) y `admin` (gestiona productos). El rol vive en la tabla `perfiles`.
3. **Autenticación con Supabase Auth** vía `fetch` a `/auth/v1` (registro/login con email+password). Supabase **hashea las contraseñas**; la app nunca las guarda.
4. **Carrito persistido en DB** por usuario (`carrito_items`) + **checkout** que genera una orden (`ordenes`).

---

## Constraints técnicos

- **HTML + CSS + JS vanilla**, archivos separados. Sin frameworks, sin build tools, sin librerías JS.
- **Backend:** Supabase. Acceso **solo vía `fetch`** a la REST API (`/rest/v1`) y a Auth (`/auth/v1`), **sin SDK** (`@supabase/supabase-js` prohibido).
- Código en **español** (variables, funciones, comentarios).
- Mismas reglas JS del parcial 1: `const` por defecto, arrow functions, `===`, nunca `var`, `querySelector`, `createElement`/`textContent` (no `innerHTML` con datos).
- **Commits atómicos** con prefijo semántico (`feat`, `fix`, `docs`, `chore`).
- **Un Pull Request por funcionalidad**, con explicación breve de qué hace.

---

## Modelo de datos

| Tabla | Propósito | Campos clave |
|---|---|---|
| `auth.users` | Usuarios y credenciales (gestionada por Supabase Auth — **passwords hasheadas**) | interno de Supabase |
| `perfiles` | Rol de cada usuario, 1-a-1 con `auth.users` | `id (uuid), email, rol, creado_en` |
| `productos` | Catálogo (CRUD admin) | `id, nombre, marca, capacidad, material, precio, stock, badge, imagen, descripcion` |
| `carrito_items` | Carrito por usuario | `id, usuario_id (uuid), producto_id, cantidad` (unique por usuario+producto) |
| `ordenes` | Snapshot de checkout | `id, usuario_id (uuid), total, items (jsonb), creado_en` |

DDL + RLS + seed completo en [db/schema.sql](../db/schema.sql). Un **trigger** crea el `perfil` automáticamente al registrarse (rol `usuario`); el rol solo se eleva a `admin` manualmente desde Supabase.

---

## Plan de entrega (PRs)

| PR | Rama | Contenido |
|---|---|---|
| 0 | `chore/setup-supabase` | `schema.sql`, `config.js`, `api.js`, esta consigna |
| 1 | `feat/catalogo-remoto` | Catálogo leído desde Supabase (reemplaza el array) |
| 2 | `feat/auth-roles` | Registro/login con Supabase Auth, sesión (JWT) y guard de roles |
| 3 | `feat/admin-crud` | Panel admin: crear / editar / eliminar productos |
| 4 | `feat/carrito` | Agregar al carrito, listar, checkout y orden |
| 5 | `docs/cierre-parcial-2` | README, PR.md y prompts-usados actualizados |

Todas las ramas hijas se mergean contra `parcial-2`.

---

## Seguridad de datos sensibles

Decisiones tomadas para **proteger los datos**, no solo para que funcione:

- **Contraseñas:** las maneja **Supabase Auth**. Se hashean en el servidor y **nunca** se guardan ni viajan en claro por nuestras tablas. La app solo manda email+password al endpoint `/auth/v1` por HTTPS.
- **anon key en el cliente:** es **pública por diseño** y, en un deploy estático (GitHub Pages), inevitablemente visible. No es un secreto. La que **jamás** debe estar en el cliente/repo es la `service_role` key (bypassa RLS).
- **RLS estricto** ([db/schema.sql](../db/schema.sql)): cada usuario solo lee/edita **lo suyo** (carrito y órdenes filtrados por `auth.uid()`). El **CRUD de productos exige rol admin** verificado en la base con la función `es_admin()` — no se puede saltar desde el cliente.
- **Rol:** se asigna en `perfiles` y **no puede modificarse desde la app**; un usuario no puede auto-promoverse a admin. El admin se crea manualmente desde Supabase.

> Deuda de seguridad asumida (educativa): el rol llega al cliente y la UI confía en él para mostrar/ocultar el panel admin. Aunque alguien fuerce la UI, **RLS bloquea la escritura** si no es admin real. La defensa de fondo está en la base, no en el front.

---

## Verificación (end-to-end)

1. Correr [db/schema.sql](../db/schema.sql) en el SQL Editor de Supabase (crea tablas, RLS, trigger y seed).
2. Verificar `SUPABASE_URL` y anon key en [js/config.js](../js/config.js).
3. Abrir con **Live Server** (no `file://`, por CORS).
4. Catálogo (`index.html`) muestra los productos desde Supabase (lectura pública, sin login).
5. Registrar un usuario desde `login.html`; iniciar sesión (Supabase Auth devuelve JWT).
6. Promover ese usuario a admin con `update perfiles set rol='admin' where email='...'` y volver a entrar.
7. Como admin (`admin.html`): crear/editar/borrar un producto y verlo reflejado. Verificar que un **usuario común NO** puede (RLS lo rechaza).
8. Como usuario: agregar al carrito, cambiar cantidades, hacer checkout; verificar la orden en `ordenes` (y que no ve órdenes de otros).
9. En DevTools: confirmar que todo va por `fetch` a `/auth/v1` y `/rest/v1/...` sin errores.
