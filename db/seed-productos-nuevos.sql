-- ====================================================================
-- termoshop - seed-productos-nuevos.sql (Parcial 2)
-- --------------------------------------------------------------------
-- INSERT de los 6 productos NUEVOS agregados en el parcial 2.
--
-- USO: pegar y correr en Supabase > SQL Editor > New query.
--
-- Este script NO borra ni recrea nada: solo agrega estos 6 termos a la
-- tabla `productos` existente (los 6 del parcial 1 quedan intactos).
-- Los ids se autogeneran (columna identity), asi que es seguro correrlo
-- una sola vez. Si lo corres dos veces vas a duplicar estas filas.
--
-- Las imagenes reales ya estan en productos-imagenes/ (mismas rutas que
-- referencian las columnas `imagen` de abajo). Para regenerarlas desde
-- las URLs oficiales: python scripts/descargar_imagenes.py
-- ====================================================================

insert into productos (nombre, marca, capacidad, material, precio, stock, badge, imagen, descripcion) values
    ('Adventure To-Go 1L', 'Stanley', '1000 ml', 'Acero inoxidable 18/8', 128000, 10, 'NUEVO',
     'productos-imagenes/stanley-adventure-togo-1l.webp',
     'Botella todoterreno con tapa que funciona como taza. Doble pared al vacio: caliente 15 hs, frio 20 hs.'),

    ('Trigger-Action Travel Mug 590ml', 'Stanley', '590 ml', 'Acero inoxidable doble pared', 72000, 18, null,
     'productos-imagenes/stanley-trigger-action-590.webp',
     'Vaso termico con tapa de gatillo: se abre y cierra con una sola mano. Antiderrame y apto para posavasos del auto.'),

    ('Terra Estampado 1L', 'Lumilagro', '1000 ml', 'Plastico con ampolla de vidrio', 27500, 22, 'OFERTA',
     'productos-imagenes/lumilagro-terra-estampado-1l.webp',
     'El clasico Terra en edicion estampada. Ampolla de vidrio de doble pared al vacio y cuerpo liviano para la mochila.'),

    ('Lumina 1L', 'Termolar', '1000 ml', 'Acero inoxidable con tapa cebadora', 41000, 16, null,
     'productos-imagenes/termolar-lumina-1l.webp',
     'Termo de acero con pico cebador y cierre a rosca. Diseño moderno pensado para el mate de todos los dias.'),

    ('IceFlow Flip Straw 700ml', 'Stanley', '700 ml', 'Acero inoxidable 18/8', 89000, 14, 'NUEVO',
     'productos-imagenes/stanley-iceflow-flip-straw-700.webp',
     'Botella con sorbete rebatible antiderrame y manija para colgar. Mantiene el frio hasta 2 dias.'),

    ('Quencher H2.0 FlowState 1.2L', 'Stanley', '1200 ml', 'Acero inoxidable doble pared', 112000, 12, 'OFERTA',
     'productos-imagenes/stanley-quencher-h2-12l.webp',
     'El vaso termico icono: manija ergonomica, sorbete reutilizable y tapa FlowState de 3 posiciones. Entra en el portavasos.');
