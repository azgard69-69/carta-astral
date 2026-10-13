/* Carta Astral — motor de cálculo astronómico.
 * Sin dependencias: fórmulas de Jean Meeus (Sol, Luna, casas) y elementos
 * keplerianos del JPL para los planetas (válidos de 1800 a 2050).
 * Precisión aproximada: Sol 0,01°, Luna 0,05°, planetas 0,2° como máximo.
 */
(function (g) {
  'use strict';

  var RAD = Math.PI / 180;
  function n360(x) { x %= 360; return x < 0 ? x + 360 : x; }
  function sin(x) { return Math.sin(x * RAD); }
  function cos(x) { return Math.cos(x * RAD); }
  function tan(x) { return Math.tan(x * RAD); }
  function atan2(y, x) { return Math.atan2(y, x) / RAD; }

  var SIGNOS = ['Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo', 'Libra',
    'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis'];

  var ASPECTOS = [
    { id: 'conjuncion', nombre: 'conjunción', angulo: 0, orbe: 8 },
    { id: 'sextil', nombre: 'sextil', angulo: 60, orbe: 5 },
    { id: 'cuadratura', nombre: 'cuadratura', angulo: 90, orbe: 7 },
    { id: 'trigono', nombre: 'trígono', angulo: 120, orbe: 7 },
    { id: 'oposicion', nombre: 'oposición', angulo: 180, orbe: 8 }
  ];

  var PLANETAS = [
    ['mercurio', 'Mercurio'], ['venus', 'Venus'], ['marte', 'Marte'],
    ['jupiter', 'Júpiter'], ['saturno', 'Saturno'], ['urano', 'Urano'],
    ['neptuno', 'Neptuno'], ['pluton', 'Plutón']
  ];

  // ---------- Tiempo ----------

  function diaJuliano(ms) { return ms / 86400000 + 2440587.5; }

  // Diferencia entre el tiempo de los relojes y el de las efemérides, en segundos.
  function deltaT(anio) {
    var t;
    if (anio >= 2005) { t = anio - 2000; return 62.92 + 0.32217 * t + 0.005589 * t * t; }
    if (anio >= 1986) {
      t = anio - 2000;
      return 63.86 + 0.3345 * t - 0.060374 * t * t + 0.0017275 * t * t * t +
        0.000651814 * Math.pow(t, 4) + 0.00002373599 * Math.pow(t, 5);
    }
    if (anio >= 1961) { t = anio - 1975; return 45.45 + 1.067 * t - t * t / 260 - t * t * t / 718; }
    if (anio >= 1941) { t = anio - 1950; return 29.07 + 0.407 * t - t * t / 233 + t * t * t / 2547; }
    if (anio >= 1920) { t = anio - 1920; return 21.20 + 0.84493 * t - 0.076100 * t * t + 0.0020936 * t * t * t; }
    if (anio >= 1900) {
      t = anio - 1900;
      return -2.79 + 1.494119 * t - 0.0598939 * t * t + 0.0061966 * t * t * t - 0.000197 * Math.pow(t, 4);
    }
    t = (anio - 1820) / 100;
    return -20 + 32 * t * t;
  }

  // Desfase (ms) de una zona horaria respecto a UTC en un instante dado.
  function desfaseZona(zona, ms) {
    var f = new Intl.DateTimeFormat('en-US', {
      timeZone: zona, hourCycle: 'h23', year: 'numeric', month: 'numeric',
      day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'
    });
    var p = {};
    f.formatToParts(new Date(ms)).forEach(function (x) { p[x.type] = Number(x.value); });
    return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(ms / 1000) * 1000;
  }

  // Hora local de una zona (con su horario de verano histórico) → instante UTC en ms.
  function aUTC(anio, mes, dia, hora, minuto, zona) {
    var local = Date.UTC(anio, mes - 1, dia, hora, minuto);
    var d1 = desfaseZona(zona, local);
    var d2 = desfaseZona(zona, local - d1);
    return local - d2;
  }

  // ---------- Sol, Luna y Lilith ----------

  function nutacion(T) { return -0.00478 * sin(125.04 - 1934.136 * T); }

  function lonSol(T) {
    var L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    var M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
    var C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * sin(M) +
      (0.019993 - 0.000101 * T) * sin(2 * M) + 0.000289 * sin(3 * M);
    return n360(L0 + C - 0.00569 + nutacion(T));
  }

  // Términos periódicos de la longitud lunar: [D, M, M', F, coeficiente en grados]
  var LUNA = [
    [0, 0, 1, 0, 6.288774], [2, 0, -1, 0, 1.274027], [2, 0, 0, 0, 0.658314],
    [0, 0, 2, 0, 0.213618], [0, 1, 0, 0, -0.185116], [0, 0, 0, 2, -0.114332],
    [2, 0, -2, 0, 0.058793], [2, -1, -1, 0, 0.057066], [2, 0, 1, 0, 0.053322],
    [2, -1, 0, 0, 0.045758], [0, 1, -1, 0, -0.040923], [1, 0, 0, 0, -0.034720],
    [0, 1, 1, 0, -0.030383], [2, 0, 0, -2, 0.015327], [0, 0, 1, 2, -0.012528],
    [0, 0, 1, -2, 0.010980], [4, 0, -1, 0, 0.010675], [0, 0, 3, 0, 0.010034],
    [4, 0, -2, 0, 0.008548], [2, 1, -1, 0, -0.007888], [2, 1, 0, 0, -0.006766],
    [1, 0, -1, 0, -0.005163], [1, 1, 0, 0, 0.004987], [2, -1, 1, 0, 0.004036],
    [2, 0, 2, 0, 0.003994], [4, 0, 0, 0, 0.003861], [2, 0, -3, 0, 0.003665],
    [0, 1, -2, 0, -0.002689], [2, 0, -1, 2, -0.002602], [2, -1, -2, 0, 0.002390],
    [1, 0, 1, 0, -0.002348], [2, -2, 0, 0, 0.002236], [0, 1, 2, 0, -0.002120],
    [0, 2, 0, 0, -0.002069], [2, -2, -1, 0, 0.002048], [2, 0, 1, -2, -0.001773],
    [2, 0, 0, 2, -0.001595], [4, -1, -1, 0, 0.001215], [0, 0, 2, 2, -0.001110]
  ];

  function lonLuna(T) {
    var L = 218.3164477 + 481267.88123421 * T;
    var D = 297.8501921 + 445267.1114034 * T;
    var M = 357.5291092 + 35999.0502909 * T;
    var Mp = 134.9633964 + 477198.8675055 * T;
    var F = 93.2720950 + 483202.0175233 * T;
    var s = 0, i, t;
    for (i = 0; i < LUNA.length; i++) {
      t = LUNA[i];
      s += t[4] * sin(t[0] * D + t[1] * M + t[2] * Mp + t[3] * F);
    }
    s += 0.003958 * sin(119.75 + 131.849 * T) + 0.001962 * sin(L - F) +
      0.000318 * sin(53.09 + 479264.290 * T);
    return n360(L + s + nutacion(T));
  }

  // Lilith media (Luna Negra): el apogeo medio de la órbita lunar.
  function lonLilith(T) {
    return n360(83.3532465 + 4069.0137287 * T - 0.0103200 * T * T + 180);
  }

  // ---------- Planetas ----------

  // a, e, I, L, perihelio, nodo y su variación por siglo (JPL, 1800-2050).
  var ELEM = {
    mercurio: [0.38709927, 0.20563593, 7.00497902, 252.25032350, 77.45779628, 48.33076593,
      0.00000037, 0.00001906, -0.00594749, 149472.67411175, 0.16047689, -0.12534081],
    venus: [0.72333566, 0.00677672, 3.39467605, 181.97909950, 131.60246718, 76.67984255,
      0.00000390, -0.00004107, -0.00078890, 58517.81538729, 0.00268329, -0.27769418],
    tierra: [1.00000261, 0.01671123, -0.00001531, 100.46457166, 102.93768193, 0.0,
      0.00000562, -0.00004392, -0.01294668, 35999.37244981, 0.32327364, 0.0],
    marte: [1.52371034, 0.09339410, 1.84969142, -4.55343205, -23.94362959, 49.55953891,
      0.00001847, 0.00007882, -0.00813131, 19140.30268499, 0.44441088, -0.29257343],
    jupiter: [5.20288700, 0.04838624, 1.30439695, 34.39644051, 14.72847983, 100.47390909,
      -0.00011607, -0.00013253, -0.00183714, 3034.74612775, 0.21252668, 0.20469106],
    saturno: [9.53667594, 0.05386179, 2.48599187, 49.95424423, 92.59887831, 113.66242448,
      -0.00125060, -0.00050991, 0.00193609, 1222.49362201, -0.41897216, -0.28867794],
    urano: [19.18916464, 0.04725744, 0.77263783, 313.23810451, 170.95427630, 74.01692503,
      -0.00196176, -0.00004397, -0.00242939, 428.48202785, 0.40805281, 0.04240589],
    neptuno: [30.06992276, 0.00859048, 1.77004347, -55.12002969, 44.96476227, 131.78422574,
      0.00026291, 0.00005105, 0.00035372, 218.45945325, -0.32241464, -0.00508664],
    pluton: [39.48211675, 0.24882730, 17.14001206, 238.92903833, 224.06891629, 110.30393684,
      -0.00031596, 0.00005170, 0.00004818, 145.20780515, -0.04062942, -0.01183482]
  };

  // Posición heliocéntrica (x, y, z) en unidades astronómicas.
  function helio(id, T) {
    var e = ELEM[id];
    var a = e[0] + e[6] * T, ex = e[1] + e[7] * T, I = e[2] + e[8] * T;
    var L = e[3] + e[9] * T, peri = e[4] + e[10] * T, N = e[5] + e[11] * T;
    var w = peri - N;
    var M = n360(L - peri);
    if (M > 180) M -= 360;
    var Mr = M * RAD, E = Mr, i;
    for (i = 0; i < 30; i++) E = E - (E - ex * Math.sin(E) - Mr) / (1 - ex * Math.cos(E));
    var xp = a * (Math.cos(E) - ex), yp = a * Math.sqrt(1 - ex * ex) * Math.sin(E);
    var cw = cos(w), sw = sin(w), cN = cos(N), sN = sin(N), cI = cos(I), sI = sin(I);
    return [
      (cw * cN - sw * sN * cI) * xp + (-sw * cN - cw * sN * cI) * yp,
      (cw * sN + sw * cN * cI) * xp + (-sw * sN + cw * cN * cI) * yp,
      (sw * sI) * xp + (cw * sI) * yp
    ];
  }

  // Longitud eclíptica vista desde la Tierra, con corrección por el tiempo de viaje de la luz.
  function lonPlaneta(id, jd) {
    var T = (jd - 2451545) / 36525;
    var t = helio('tierra', T), p = helio(id, T);
    var dx = p[0] - t[0], dy = p[1] - t[1], dz = p[2] - t[2];
    var dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    p = helio(id, (jd - dist * 0.0057755183 - 2451545) / 36525);
    return n360(atan2(p[1] - t[1], p[0] - t[0]) + 1.396971 * T + nutacion(T));
  }

  // ---------- Casas ----------

  function casaDe(lon, cusp) {
    for (var i = 1; i <= 12; i++) {
      var a = cusp[i], b = cusp[i % 12 + 1];
      if (n360(lon - a) < n360(b - a)) return i;
    }
    return 1;
  }

  // sistema: 'placidus' o 'iguales'. lonEste: longitud geográfica, positiva hacia el este.
  function casas(jdUT, lat, lonEste, sistema) {
    var T = (jdUT - 2451545) / 36525;
    var ramc = n360(280.46061837 + 360.98564736629 * (jdUT - 2451545) + 0.000387933 * T * T + lonEste);
    var eps = 23.4392911 - 0.0130042 * T;
    var mc = n360(atan2(sin(ramc), cos(ramc) * cos(eps)));
    var asc = n360(atan2(cos(ramc), -(sin(ramc) * cos(eps) + tan(lat) * sin(eps))));
    if (n360(asc - mc) > 180) asc = n360(asc + 180);

    var c = [0], i, usado = sistema;
    function cuspide(desfase, fraccion, bajoHorizonte) {
      var ra = (ramc + desfase) * RAD, k, dec, ad;
      for (k = 0; k < 100; k++) {
        dec = Math.atan(Math.sin(ra) * tan(eps));
        ad = Math.asin(tan(lat) * Math.tan(dec));
        ra = bajoHorizonte ? ramc * RAD + Math.PI - fraccion * (Math.PI / 2 - ad)
          : ramc * RAD + fraccion * (Math.PI / 2 + ad);
      }
      return n360(Math.atan2(Math.sin(ra), Math.cos(ra) * cos(eps)) / RAD);
    }
    if (sistema === 'placidus') {
      c[1] = asc; c[10] = mc;
      c[11] = cuspide(30, 1 / 3, false); c[12] = cuspide(60, 2 / 3, false);
      c[2] = cuspide(120, 2 / 3, true); c[3] = cuspide(150, 1 / 3, true);
      c[4] = n360(mc + 180); c[5] = n360(c[11] + 180); c[6] = n360(c[12] + 180);
      c[7] = n360(asc + 180); c[8] = n360(c[2] + 180); c[9] = n360(c[3] + 180);
      for (i = 1; i <= 12; i++) if (isNaN(c[i])) usado = 'iguales';
    }
    if (usado !== 'placidus') {
      usado = 'iguales';
      for (i = 1; i <= 12; i++) c[i] = n360(asc + 30 * (i - 1));
    }
    return { asc: asc, mc: mc, cuspides: c, sistema: usado };
  }

  // Hora solar verdadera del lugar (de 0 a 24): la que marca el Sol en el cielo, no el reloj.
  function horaSolar(jdUT, lonEste, lonSol) {
    var T = (jdUT - 2451545) / 36525;
    var ramc = n360(280.46061837 + 360.98564736629 * (jdUT - 2451545) + 0.000387933 * T * T + lonEste);
    var eps = 23.4392911 - 0.0130042 * T;
    var ascensionRecta = n360(atan2(sin(lonSol) * cos(eps), cos(lonSol)));
    return n360(ramc - ascensionRecta + 180) / 15;
  }

  // ---------- Zodiaco y aspectos ----------

  function posicion(lon) {
    lon = n360(lon);
    var minutos = Math.floor(lon * 60 + 1e-9);
    var signo = Math.floor(minutos / 1800) % 12;
    var resto = minutos - signo * 1800;
    var grado = Math.floor(resto / 60), min = resto % 60;
    return {
      signo: signo, grado: grado, minuto: min, decanato: Math.floor(grado / 10),
      fraccion: (lon - signo * 30) / 30,
      texto: SIGNOS[signo] + ' ' + grado + '°' + (min < 10 ? '0' : '') + min + '′'
    };
  }

  function textoOrbe(o) {
    var m = Math.round(o * 60);
    return Math.floor(m / 60) + '°' + (m % 60 < 10 ? '0' : '') + (m % 60) + '′';
  }

  // Aspectos entre dos listas de puntos {id, nombre, lon}. Si b se omite, entre los de a.
  function aspectos(a, b, orbeMax) {
    var res = [], i, j, k, d, dif, asp, lim;
    for (i = 0; i < a.length; i++) {
      for (j = b ? 0 : i + 1; j < (b || a).length; j++) {
        d = Math.abs(n360(a[i].lon - (b || a)[j].lon + 180) - 180);
        for (k = 0; k < ASPECTOS.length; k++) {
          asp = ASPECTOS[k];
          dif = Math.abs(d - asp.angulo);
          lim = orbeMax === undefined ? asp.orbe : Math.min(asp.orbe, orbeMax);
          if (dif <= lim) res.push({ a: a[i], b: (b || a)[j], aspecto: asp, orbe: dif });
        }
      }
    }
    res.sort(function (x, y) { return x.orbe - y.orbe; });
    return res;
  }

  // ---------- Carta completa ----------

  // o: { ms (instante UTC), lat, lon (este +), sistema, sinHora }
  function calcularCarta(o) {
    var jd = diaJuliano(o.ms);
    var jdTT = jd + deltaT(new Date(o.ms).getUTCFullYear()) / 86400;
    var T = (jdTT - 2451545) / 36525;
    var puntos = [
      { id: 'sol', nombre: 'Sol', lon: lonSol(T), retro: false },
      { id: 'luna', nombre: 'Luna', lon: lonLuna(T), retro: false }
    ];
    PLANETAS.forEach(function (p) {
      var lon = lonPlaneta(p[0], jdTT);
      var mov = n360(lonPlaneta(p[0], jdTT + 0.5) - lonPlaneta(p[0], jdTT - 0.5) + 180) - 180;
      puntos.push({ id: p[0], nombre: p[1], lon: lon, retro: mov < 0 });
    });
    puntos.push({ id: 'lilith', nombre: 'Lilith', lon: lonLilith(T), retro: false });

    var cs = null, angulos = [];
    if (!o.sinHora) {
      cs = casas(jd, o.lat, o.lon, o.sistema || 'placidus');
      puntos.forEach(function (p) { p.casa = casaDe(p.lon, cs.cuspides); });
      angulos = [
        { id: 'asc', nombre: 'Ascendente', lon: cs.asc },
        { id: 'mc', nombre: 'Medio Cielo', lon: cs.mc }
      ];
    }
    puntos.forEach(function (p) { p.pos = posicion(p.lon); });
    angulos.forEach(function (p) { p.pos = posicion(p.lon); });
    return {
      jd: jd, puntos: puntos, angulos: angulos, casas: cs,
      horaSolar: o.sinHora ? null : horaSolar(jd, o.lon, puntos[0].lon),
      aspectos: aspectos(puntos.concat(angulos))
    };
  }

  // Próximos cambios de signo y fases lunares a partir de un instante (resolución de una hora).
  function proximosEventos(ms, dias) {
    var HORA = 3600000, ev = [], k, t, T, s, l, e;
    function estado(m) {
      var Tm = (diaJuliano(m) + deltaT(new Date(m).getUTCFullYear()) / 86400 - 2451545) / 36525;
      var so = lonSol(Tm), lu = lonLuna(Tm);
      return [so, lu, n360(lu - so)];
    }
    var prev = estado(ms);
    var FASES = [[90, 'Cuarto creciente'], [180, 'Luna llena'], [270, 'Cuarto menguante']];
    for (k = 1; k <= dias * 24; k++) {
      t = ms + k * HORA;
      T = estado(t); s = T[0]; l = T[1]; e = T[2];
      if (Math.floor(s / 30) !== Math.floor(prev[0] / 30)) {
        ev.push({ ms: t, texto: 'Sol entra en ' + SIGNOS[Math.floor(s / 30)] });
      }
      if (Math.floor(l / 30) !== Math.floor(prev[1] / 30)) {
        ev.push({ ms: t, texto: 'Luna entra en ' + SIGNOS[Math.floor(l / 30)], menor: true });
      }
      FASES.forEach(function (f) {
        if (prev[2] < f[0] && e >= f[0]) ev.push({ ms: t, texto: f[1] + ' en ' + SIGNOS[Math.floor(l / 30)] });
      });
      if (e < prev[2] - 300) ev.push({ ms: t, texto: 'Luna nueva en ' + SIGNOS[Math.floor(l / 30)] });
      prev = T;
    }
    return ev;
  }

  var Astro = {
    SIGNOS: SIGNOS, ASPECTOS: ASPECTOS, n360: n360,
    diaJuliano: diaJuliano, deltaT: deltaT, aUTC: aUTC, desfaseZona: desfaseZona,
    lonSol: lonSol, lonLuna: lonLuna, lonLilith: lonLilith, lonPlaneta: lonPlaneta,
    casas: casas, casaDe: casaDe, horaSolar: horaSolar, posicion: posicion, textoOrbe: textoOrbe,
    aspectos: aspectos, calcularCarta: calcularCarta, proximosEventos: proximosEventos
  };
  g.Astro = Astro;
  if (typeof module !== 'undefined' && module.exports) module.exports = Astro;
})(typeof window !== 'undefined' ? window : globalThis);
