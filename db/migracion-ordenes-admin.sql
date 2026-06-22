-- ====================================================================
-- termoshop - migracion: admin puede leer todas las ordenes
-- --------------------------------------------------------------------
-- Correr SOLO esto en Supabase > SQL Editor (no hace falta re-correr
-- schema.sql ni borrar datos). Agrega una policy para que el rol admin
-- vea TODAS las ordenes (panel de ventas), ademas de la policy existente
-- por la que cada usuario ve solo las suyas.
--
-- Es idempotente: borra la policy si ya existe antes de crearla.
-- ====================================================================

drop policy if exists "ordenes - admin lee todas" on ordenes;

create policy "ordenes - admin lee todas"
    on ordenes for select to authenticated
    using (es_admin());
