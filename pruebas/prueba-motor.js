/* Comprueba el motor de cálculo contra valores de referencia.
 * Uso:  node pruebas/prueba-motor.js
 */
const Astro = require('../js/astro.js');
const Num = require('../js/numerologia.js');

let fallos = 0;
function cerca(nombre, valor, esperado, margen) {
  const dif = Math.abs(((valor - esperado + 540) % 360) - 180);
  const ok = dif <= margen;
  if (!ok) fallos++;
  console.log((ok ? '  bien ' : '  MAL  ') + nombre.padEnd(22) + valor.toFixed(2).padStart(8) +
    '  esperado ' + esperado.toFixed(2) + '  (dif ' + dif.toFixed(3) + '°)');
}
function igual(nombre, valor, esperado) {
  const ok = valor === esperado;
  if (!ok) fallos++;
  console.log((ok ? '  bien ' : '  MAL  ') + nombre.padEnd(22) + String(valor) + '  esperado ' + String(esperado));
}

// Carta de ejemplo: 5 abr 1990, 14:30, Ciudad de México.
console.log('Hora local → UTC');
const ms = Astro.aUTC(1990, 4, 5, 14, 30, 'America/Mexico_City');
igual('CDMX 1990 (UTC−6)', new Date(ms).toISOString(), '1990-04-05T20:30:00.000Z');
igual('Madrid verano (UTC+2)', new Date(Astro.aUTC(2020, 7, 1, 12, 0, 'Europe/Madrid')).toISOString(), '2020-07-01T10:00:00.000Z');
igual('Madrid invierno (UTC+1)', new Date(Astro.aUTC(2020, 1, 15, 12, 0, 'Europe/Madrid')).toISOString(), '2020-01-15T11:00:00.000Z');

console.log('Carta natal de ejemplo');
const c = Astro.calcularCarta({ ms, lat: 19.4326, lon: -99.1332, sistema: 'placidus' });
const p = {};
c.puntos.forEach(x => { p[x.id] = x; });
// Referencia: cálculo independiente (prototipo en Python) y efemérides publicadas de abril de 1990.
cerca('Sol', p.sol.lon, 15.79, 0.02);
cerca('Luna', p.luna.lon, 147.24, 0.15);
cerca('Mercurio', p.mercurio.lon, 32.60, 0.25);
cerca('Venus', p.venus.lon, 329.46, 0.25);
cerca('Marte', p.marte.lon, 318.74, 0.25);
cerca('Júpiter', p.jupiter.lon, 93.35, 0.25);
cerca('Saturno', p.saturno.lon, 294.59, 0.25);
cerca('Urano', p.urano.lon, 279.56, 0.25);
cerca('Neptuno', p.neptuno.lon, 284.54, 0.25);
cerca('Plutón', p.pluton.lon, 227.22, 0.25);
cerca('Lilith', p.lilith.lon, 227.02, 0.05);
cerca('Ascendente', c.casas.asc, 135.64, 0.05);
cerca('Medio Cielo', c.casas.mc, 44.71, 0.05);
cerca('Casa 2', c.casas.cuspides[2], 162.50, 0.05);
cerca('Casa 11', c.casas.cuspides[11], 76.26, 0.05);
igual('Plutón retrógrado', p.pluton.retro, true);
igual('Saturno directo', p.saturno.retro, false);
igual('Sol en casa', p.sol.casa, 9);
igual('Luna en casa', p.luna.casa, 1);
igual('Texto del Sol', p.sol.pos.texto, 'Aries 15°47′');
// 14:30 de reloj en Ciudad de México equivale a las 13:51 según el Sol.
igual('Hora solar (13:51)', Math.round(c.horaSolar * 60), 13 * 60 + 51);
igual('Decanato del Sol', p.sol.pos.decanato, 1);

console.log('Zona polar');
const polar = Astro.calcularCarta({ ms, lat: 78.2232, lon: 15.6267, sistema: 'placidus' });
igual('Placidus → iguales', polar.casas.sistema, 'iguales');
cerca('Casa 2 = AC + 30°', polar.casas.cuspides[2], polar.casas.asc + 30, 0.0001);

console.log('Cielo del 12 oct 2026, 18:00 UT');
const hoy = Astro.calcularCarta({ ms: Date.UTC(2026, 9, 12, 18, 0), sinHora: true });
cerca('Sol', hoy.puntos[0].lon, 199.43, 0.02);
cerca('Luna', hoy.puntos[1].lon, 224.03, 0.15);
const ev = Astro.proximosEventos(Date.UTC(2026, 9, 12), 20).filter(e => !e.menor).map(e => e.texto);
igual('Próximos eventos', ev.join(' | '), 'Cuarto creciente en Capricornio | Sol entra en Escorpio | Luna llena en Tauro');

console.log('Numerología');
igual('Camino de vida 5/4/1990', Num.caminoDeVida(5, 4, 1990), 1);
igual('Camino maestro 29/11/1980', Num.caminoDeVida(29, 11, 1980), 4);
igual('Expresión de "Ana"', Num.expresion('Ana'), 7);
igual('Alma de "Ana"', Num.alma('Ana'), 2);
igual('Ñ vale 5 ("Ñu")', Num.expresion('Ñu'), 8);
igual('Acentos ("José"="Jose")', Num.expresion('José'), Num.expresion('Jose'));
igual('Expresión con apellidos', Num.expresion('Ana García López'), 3);
igual('Alma con apellidos', Num.alma('Ana García López'), 6);

console.log('Textos y nombres');
global.window = global.window || {};
require('../js/textos.js'); require('../js/nombres.js'); require('../js/guia.js');
const T = global.window.TEXTOS;
igual('Planetas con 12 textos', Object.keys(T.enSigno).filter(k => T.enSigno[k].length === 12).length, 8);
igual('Casas con texto', Object.keys(T.casas).length, 12);
igual('Astros con frase corta', c.puntos.concat(c.angulos).every(x => T.astros[x.id] && T.astros[x.id].corto), true);
igual('Aspectos con frase', Astro.ASPECTOS.every(a => T.aspectosNatal[a.id] && T.aspectosHoy[a.id].length === 2), true);
igual('Nombres (más de 600)', Object.keys(global.window.NOMBRES).length > 600, true);
igual('Guía corregida (e hígado)', global.window.GUIA.signos[8].anatomia.includes('e hígado'), true);

console.log(fallos ? '\n' + fallos + ' comprobación(es) fallaron.' : '\nTodo bien.');
process.exit(fallos ? 1 : 0);
