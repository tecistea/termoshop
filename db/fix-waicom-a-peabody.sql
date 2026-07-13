-- ====================================================================
-- termoshop - fix-waicom-a-peabody.sql
-- --------------------------------------------------------------------
-- "Waicom" no es una marca real de termos (era un nombre inventado del
-- parcial 1 y su imagen era un placeholder verde generado, no una foto).
-- Este UPDATE lo reemplaza por un producto real: el eTermo de Peabody
-- (marca real), con foto real y fondo blanco en productos-imagenes/.
--
-- USO: pegar y correr en Supabase > SQL Editor con un usuario ADMIN
-- (el CRUD de productos requiere rol admin por RLS; la anon key del
-- cliente NO puede correr esto).
--
-- Afecta 1 fila (id = 5). No toca ninguna otra.
-- ====================================================================

update productos set
    nombre      = 'eTermo Acero 1L',
    marca       = 'Peabody',
    capacidad   = '1000 ml',
    material    = 'Acero inoxidable doble pared',
    imagen      = 'productos-imagenes/peabody-etermo-1l.webp',
    descripcion = 'Termo de acero inoxidable con doble pared al vacio y pico cebador. Excelente relacion calidad-precio.'
where id = 5;

-- Verificacion (deberia mostrar la fila ya como Peabody):
-- select id, nombre, marca, imagen from productos where id = 5;
