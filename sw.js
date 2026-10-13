/* Carta Astral — guardián de la copia sin conexión.
 * Solo actúa cuando la app está publicada en internet: guarda sus archivos en el equipo para que
 * se pueda instalar y abrir sin conexión. Con conexión, siempre trae la versión más nueva.
 * Al cambiar la lista de archivos, sube el número de VERSION.
 */
const VERSION = 'carta-astral-2';
const ARCHIVOS = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "css/estilos.css",
  "css/brillantina.png",
  "letras/Courgette-Regular.ttf",
  "iconos/icono-192.png",
  "iconos/icono-512.png",
  "js/app.js",
  "js/astro.js",
  "js/ciudades-mundo.js",
  "js/ciudades.js",
  "js/guia.js",
  "js/musica.js",
  "js/nombres.js",
  "js/numerologia.js",
  "js/rueda.js",
  "js/textos.js"
];

self.addEventListener('install', (ev) => {
  ev.waitUntil(caches.open(VERSION).then((copia) => copia.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (ev) => {
  ev.waitUntil(caches.keys()
    .then((nombres) => Promise.all(nombres.filter((n) => n !== VERSION).map((n) => caches.delete(n))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (ev) => {
  if (ev.request.method !== 'GET') return;
  ev.respondWith(fetch(ev.request).then((respuesta) => {
    const duplicado = respuesta.clone();
    caches.open(VERSION).then((copia) => copia.put(ev.request, duplicado));
    return respuesta;
  }).catch(() => caches.match(ev.request, { ignoreSearch: true })));
});
