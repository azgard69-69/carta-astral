/* Carta Astral — numerología pitagórica (tabla en español, con Ñ).
 * Los números maestros 11, 22 y 33 no se reducen.
 */
(function (g) {
  'use strict';

  var VALOR = {
    a: 1, j: 1, s: 1, b: 2, k: 2, t: 2, c: 3, l: 3, u: 3, d: 4, m: 4, v: 4,
    e: 5, n: 5, 'ñ': 5, w: 5, f: 6, o: 6, x: 6, g: 7, p: 7, y: 7, h: 8, q: 8, z: 8, i: 9, r: 9
  };
  var VOCALES = 'aeiou';

  var SIGNIFICADOS = {
    1: 'Inicio, liderazgo e independencia.',
    2: 'Cooperación, sensibilidad y vínculo con los demás.',
    3: 'Expresión, creatividad y alegría.',
    4: 'Orden, trabajo constante y estabilidad.',
    5: 'Libertad, cambio y aventura.',
    6: 'Responsabilidad, hogar y cuidado de otros.',
    7: 'Análisis, introspección y búsqueda espiritual.',
    8: 'Poder, logro y manejo de lo material.',
    9: 'Compasión, entrega y cierre de ciclos.',
    11: 'Número maestro: intuición e inspiración.',
    22: 'Número maestro: construir grandes obras.',
    33: 'Número maestro: servicio y guía para otros.'
  };

  // Minúsculas y sin acentos, pero conservando la ñ.
  function normalizar(texto) {
    return String(texto || '').toLowerCase().replace(/ñ/g, '\u0001')
      .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\u0001/g, 'ñ');
  }

  function sumaDigitos(n) {
    var s = 0;
    String(Math.abs(n)).split('').forEach(function (d) { s += Number(d); });
    return s;
  }

  function reducir(n) {
    while (n > 9 && n !== 11 && n !== 22 && n !== 33) n = sumaDigitos(n);
    return n;
  }

  function sumaLetras(nombre, filtro) {
    var s = 0;
    normalizar(nombre).split('').forEach(function (c) {
      if (VALOR[c] && (!filtro || filtro(c))) s += VALOR[c];
    });
    return s;
  }

  // De la fecha de nacimiento: se reduce día, mes y año por separado y se suman.
  function caminoDeVida(dia, mes, anio) {
    return reducir(reducir(dia) + reducir(mes) + reducir(sumaDigitos(anio)));
  }

  // De todas las letras del nombre.
  function expresion(nombre) {
    var s = sumaLetras(nombre);
    return s ? reducir(s) : null;
  }

  // Solo de las vocales del nombre.
  function alma(nombre) {
    var s = sumaLetras(nombre, function (c) { return VOCALES.indexOf(c) >= 0; });
    return s ? reducir(s) : null;
  }

  g.Numerologia = {
    SIGNIFICADOS: SIGNIFICADOS, normalizar: normalizar, reducir: reducir,
    caminoDeVida: caminoDeVida, expresion: expresion, alma: alma
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = g.Numerologia;
})(typeof window !== 'undefined' ? window : globalThis);
