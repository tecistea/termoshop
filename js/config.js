/* ====================================================================
   termoshop - js/config.js (Parcial 2)
   --------------------------------------------------------------------
   Configuracion de conexion a Supabase.

   La anon key es PUBLICA por diseno: viaja al navegador y, en un deploy
   estatico como GitHub Pages, es inevitablemente visible. Eso es correcto.
   La seguridad de los datos NO depende de ocultar esta key, sino de:
     - Supabase Auth: hashea las passwords; nunca las guardamos nosotros.
     - RLS estricto (ver db/schema.sql): cada usuario solo accede a lo
       suyo y el CRUD de productos requiere rol admin.
   Por eso esta key se commitea sin problema. La que NUNCA debe estar en
   el cliente ni en el repo es la service_role key (bypassa RLS).
   ==================================================================== */

'use strict';

/* URL base del proyecto Supabase */
const SUPABASE_URL = 'https://bdjhrzuobupdcsceihut.supabase.co';

/* anon key (JWT clasico) - publica, protegida por RLS. NO es la service_role. */
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkamhyenVvYnVwZGNzY2VpaHV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMzY4MzksImV4cCI6MjA5NzcxMjgzOX0.1NtnNPqQdqXqNuuuPXiftQMSt3l1gKGnldk7XiS_5Co';

/* Endpoint de la REST API (PostgREST). Cada tabla cuelga de aca:
   `${SUPABASE_REST}/productos`, `${SUPABASE_REST}/usuarios`, etc. */
const SUPABASE_REST = `${SUPABASE_URL}/rest/v1`;
