/* ====================================================================
   tools/cache-bust.js
   --------------------------------------------------------------------
   Cache-busting automatico para un sitio estatico sin build.

   Reescribe el parametro ?v=<hash> en las referencias a nuestros assets
   locales (estilos.css, app.js y js/*.js) de todos los .html de la raiz,
   usando el hash corto del commit git actual. Al cambiar el hash en cada
   commit, el navegador ve una URL nueva y descarga la version fresca en
   vez de servir una cacheada.

   Uso:
     node tools/cache-bust.js          -> versiona con el commit actual
     node tools/cache-bust.js abc1234  -> versiona con un hash dado

   Idempotente: si ya hay ?v=... lo reemplaza; si no, lo agrega.
   Solo toca assets propios (href/src que empiezan con estilos.css,
   app.js o js/); no toca fuentes de Google ni el iframe del mapa.
   ==================================================================== */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/* Version: primer argumento de CLI o el hash corto del commit actual. */
const obtenerVersion = () => {
    const arg = process.argv[2];
    if (arg) {
        return arg;
    }
    try {
        return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
    } catch (error) {
        console.error('No se pudo leer el commit git. Pasa un hash como argumento.');
        process.exit(1);
    }
};

/* Aplica ?v=<version> a una URL de asset local. Reemplaza un ?v= previo
   (idempotente) y preserva cualquier otro querystring que pudiera existir. */
const versionarUrl = (url, version) => {
    const [ruta, query = ''] = url.split('?');
    const params = query
        .split('&')
        .filter((par) => par && !par.startsWith('v='));
    params.push(`v=${version}`);
    return `${ruta}?${params.join('&')}`;
};

/* Reescribe en un HTML los href/src de nuestros assets locales. El regex
   captura href="..." o src="..." cuyo valor empieza con estilos.css,
   app.js o js/ (con o sin ?v= existente). */
const procesarHtml = (contenido, version) => {
    const patron = /(href|src)="((?:estilos\.css|app\.js|js\/[^"]+?\.js)(?:\?[^"]*)?)"/g;
    let cambios = 0;
    const nuevo = contenido.replace(patron, (_completo, attr, url) => {
        cambios += 1;
        return `${attr}="${versionarUrl(url, version)}"`;
    });
    return { nuevo, cambios };
};

const main = () => {
    const version = obtenerVersion();
    const raiz = path.join(__dirname, '..');
    const htmls = fs.readdirSync(raiz).filter((f) => f.endsWith('.html'));

    let totalArchivos = 0;
    let totalRefs = 0;

    htmls.forEach((archivo) => {
        const ruta = path.join(raiz, archivo);
        const contenido = fs.readFileSync(ruta, 'utf8');
        const { nuevo, cambios } = procesarHtml(contenido, version);
        if (nuevo !== contenido) {
            fs.writeFileSync(ruta, nuevo);
            totalArchivos += 1;
            totalRefs += cambios;
            console.log(`  ${archivo}: ${cambios} referencia(s) versionada(s)`);
        }
    });

    console.log(`\nVersion aplicada: ?v=${version}`);
    console.log(`${totalRefs} referencias en ${totalArchivos} archivo(s).`);
};

main();
