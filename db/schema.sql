-- ====================================================================
-- termoshop - schema.sql (Parcial 2)
-- --------------------------------------------------------------------
-- DDL + RLS + seed para el ecommerce con Supabase.
-- Correr completo en: Supabase > SQL Editor > New query.
--
-- SEGURIDAD (este parcial prioriza datos sensibles):
--   - NO guardamos passwords. La autenticacion la maneja Supabase Auth
--     (tabla interna auth.users): hashea las passwords y emite JWT.
--   - El rol (usuario/admin) vive en la tabla `perfiles`, 1-a-1 con
--     auth.users. Un usuario NO puede cambiar su propio rol (RLS).
--   - RLS es ESTRICTO: cada quien ve/edita solo lo suyo; el CRUD de
--     productos requiere rol admin; el carrito/ordenes estan aislados
--     por auth.uid(). La anon key del cliente NO puede saltarse esto.
-- ====================================================================

-- Limpieza previa (orden por dependencias de FK)
drop table if exists ordenes cascade;
drop table if exists carrito_items cascade;
drop table if exists productos cascade;
drop table if exists perfiles cascade;
drop function if exists es_admin cascade;
drop function if exists crear_perfil_nuevo_usuario cascade;


-- ====== TABLA perfiles ======
-- Extiende auth.users con datos propios de la app (el rol).
-- id = mismo id del usuario en auth.users (FK 1-a-1).
create table perfiles (
    id        uuid primary key references auth.users(id) on delete cascade,
    email     text,
    rol       text not null default 'usuario' check (rol in ('usuario', 'admin')),
    creado_en timestamptz not null default now()
);

-- Trigger: al registrarse un usuario en auth.users, crear su perfil
-- automaticamente con rol 'usuario'. Asi el rol nunca lo setea el cliente.
create function crear_perfil_nuevo_usuario()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    insert into public.perfiles (id, email, rol)
    values (new.id, new.email, 'usuario');
    return new;
end;
$$;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function crear_perfil_nuevo_usuario();

-- Helper: devuelve true si el usuario actual es admin.
-- security definer para poder leer `perfiles` sin recursion de RLS.
create function es_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
    select exists (
        select 1 from public.perfiles
        where id = auth.uid() and rol = 'admin'
    );
$$;


-- ====== TABLA productos ======
-- Migracion del array PRODUCTOS hardcodeado del parcial 1.
create table productos (
    id          bigint generated always as identity primary key,
    nombre      text not null,
    marca       text,
    capacidad   text,
    material    text,
    precio      numeric not null,
    stock       integer not null default 0,
    badge       text,                 -- 'NUEVO' | 'OFERTA' | null
    imagen      text,
    descripcion text,
    creado_en   timestamptz not null default now()
);


-- ====== TABLA carrito_items ======
-- Un renglon por (usuario, producto). usuario_id apunta a auth.users.
create table carrito_items (
    id          bigint generated always as identity primary key,
    usuario_id  uuid not null references auth.users(id) on delete cascade,
    producto_id bigint not null references productos(id) on delete cascade,
    cantidad    integer not null default 1 check (cantidad > 0),
    unique (usuario_id, producto_id)
);


-- ====== TABLA ordenes ======
-- Snapshot del checkout: total + items comprados en jsonb.
create table ordenes (
    id         bigint generated always as identity primary key,
    usuario_id uuid not null references auth.users(id) on delete cascade,
    total      numeric not null,
    items      jsonb not null,
    creado_en  timestamptz not null default now()
);


-- ====================================================================
-- RLS (ESTRICTO)
-- ====================================================================
alter table perfiles      enable row level security;
alter table productos     enable row level security;
alter table carrito_items enable row level security;
alter table ordenes       enable row level security;

-- --- perfiles ---
-- Cada usuario lee/edita SOLO su propio perfil.
-- (No se incluye policy de UPDATE del rol: el rol no se cambia desde la app;
--  se promueve a admin manualmente desde el panel de Supabase.)
create policy "perfil propio - leer"
    on perfiles for select to authenticated
    using (id = auth.uid());

create policy "perfil propio - editar"
    on perfiles for update to authenticated
    using (id = auth.uid())
    with check (id = auth.uid() and rol = (select rol from perfiles where id = auth.uid()));

-- --- productos ---
-- Lectura publica (catalogo visible sin login). Escritura solo admin.
create policy "productos - lectura publica"
    on productos for select to anon, authenticated
    using (true);

create policy "productos - escribe admin"
    on productos for insert to authenticated
    with check (es_admin());

create policy "productos - actualiza admin"
    on productos for update to authenticated
    using (es_admin()) with check (es_admin());

create policy "productos - borra admin"
    on productos for delete to authenticated
    using (es_admin());

-- --- carrito_items ---
-- Cada usuario opera SOLO sobre su propio carrito.
create policy "carrito propio"
    on carrito_items for all to authenticated
    using (usuario_id = auth.uid())
    with check (usuario_id = auth.uid());

-- --- ordenes ---
-- Cada usuario ve/crea SOLO sus propias ordenes.
create policy "ordenes propias - leer"
    on ordenes for select to authenticated
    using (usuario_id = auth.uid());

create policy "ordenes propias - crear"
    on ordenes for insert to authenticated
    with check (usuario_id = auth.uid());


-- ====================================================================
-- SEED productos (los 6 termos del parcial 1, precios ARS mayo 2026)
-- ====================================================================
insert into productos (nombre, marca, capacidad, material, precio, stock, badge, imagen, descripcion) values
    ('Classic Legendary 1.4L', 'Stanley', '1400 ml', 'Acero inoxidable 18/8', 215000, 8, null,
     'productos-imagenes/stanley-classic-14l.webp',
     'El termo legendario verde Hammertone. Mantiene caliente 24 hs y frio 36 hs. A prueba de golpes y filtraciones.'),

    ('Mate System 800ml', 'Stanley', '800 ml', 'Acero inoxidable con pico cebador', 159000, 12, 'NUEVO',
     'productos-imagenes/stanley-mate-system.webp',
     'Termo de acero con pico cebador integrado. Pensado para el mate argentino, no se cae ni se voltea.'),

    ('Luminox 1L', 'Lumilagro', '1000 ml', 'ABS con ampolla de vidrio', 39500, 25, 'OFERTA',
     'productos-imagenes/lumilagro-luminox-1l.webp',
     'Clasico cebador argentino. Cuerpo plastico resistente y ampolla de vidrio que mantiene la temperatura ideal.'),

    ('Terra 600cc', 'Lumilagro', '600 ml', 'Plastico con ampolla de vidrio', 19500, 30, null,
     'productos-imagenes/lumilagro-terra-600.webp',
     'Termo compacto de 600cc, ideal para llevar en la mochila. Ampolla de vidrio con sistema de doble pared al vacio.'),

    ('Premium 1L Acero', 'Waicom', '1000 ml', 'Acero inoxidable doble pared', 64000, 15, 'NUEVO',
     'productos-imagenes/waicom-premium-1l.webp',
     'Acero doble pared con aislante al vacio. Excelente relacion calidad-precio entre los termos premium.'),

    ('Magic Pump 1L', 'Termolar', '1000 ml', 'Plastico con sistema bomba', 32500, 20, null,
     'productos-imagenes/termolar-magic-pump-1l.webp',
     'Termo con sistema bomba, perfecto para servir sin levantarlo. Ideal para mesa familiar.');


-- ====================================================================
-- COMO CREAR EL ADMIN
-- --------------------------------------------------------------------
-- 1) Registrate normalmente desde la app (login.html) con el email que
--    quieras usar de admin. Eso crea el usuario en auth.users y su perfil.
-- 2) Promovelo a admin corriendo (reemplazando el email):
--      update perfiles set rol = 'admin'
--      where email = 'admin@termoshop.com';
-- El rol NO se puede cambiar desde la app: solo desde aca (Supabase).
-- ====================================================================
