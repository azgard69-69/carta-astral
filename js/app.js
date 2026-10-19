/* Carta Astral — interfaz. Une el formulario, el motor de cálculo y los textos. */
(function () {
  'use strict';

  const A = window.Astro, Num = window.Numerologia, GUIA = window.GUIA, TEXTOS = window.TEXTOS;
  const CIUDADES = window.CIUDADES, NOMBRES = window.NOMBRES, Rueda = window.Rueda;
  const CLAVE = 'cartaAstral.v1';
  const TXT = '︎'; // pide al sistema el símbolo como texto, no como emoji
  const SIMBOLO = {
    sol: '☉', luna: '☽', mercurio: '☿', venus: '♀', marte: '♂', jupiter: '♃',
    saturno: '♄', urano: '♅', neptuno: '♆', pluton: '♇', lilith: '⚸'
  };
  const SIGNO_SIMBOLO = '♈♉♊♋♌♍♎♏♐♑♒♓';
  const ORDINAL = ['1.er', '2.º', '3.er'];
  const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const TRIADA = [['sol', 'Signo solar', 'Sombra solar'], ['luna', 'Signo lunar', 'Sombra lunar'],
    ['asc', 'Ascendente', 'Sombra del Ascendente']];
  const DE_LA_GUIA = { sol: true, luna: true, asc: true };
  const TENSOS = { cuadratura: true, oposicion: true };
  const TEXTO_RETRO = 'Cuando naciste, este planeta parecía ir hacia atrás en el cielo. Su energía se vive más hacia dentro: cuesta más mostrarla, pero se piensa mejor.';
  const EJEMPLO = {
    nombre: '', apellidos: '', fecha: '1990-04-05', hora: '14:30', sinHora: false,
    lugar: 'Ciudad de México, México', lat: 19.4326, lon: -99.1332,
    zona: 'America/Mexico_City', polar: false
  };

  const estado = { datos: null, carta: null, detalle: 'sol', polarAuto: false };

  const $ = (s) => document.querySelector(s);
  const esc = (t) => String(t).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const glifo = (id) => SIMBOLO[id] ? SIMBOLO[id] + TXT : '';
  const claseDe = (id) => (id === 'sol' || id === 'luna' || id === 'asc') ? 'oro' : id === 'lilith' ? 'rosa' : '';
  const mayuscula = (t) => t.charAt(0).toUpperCase() + t.slice(1);
  const grados = (pos) => pos.grado + '°' + String(pos.minuto).padStart(2, '0') + '′';
  const nombreCompleto = (d) => [d.nombre, d.apellidos].filter(Boolean).join(' ');

  // ---------- Frases en lenguaje llano ----------

  // Aspecto dentro de la carta: «Tu identidad y tu imagen fluyen sin esfuerzo…»
  function fraseNatal(x) {
    return mayuscula(TEXTOS.astros[x.a.id].corto) + ' y ' + TEXTOS.astros[x.b.id].corto + ' ' +
      TEXTOS.aspectosNatal[x.aspecto.id];
  }

  // Aspecto del cielo de hoy con la carta: «La Luna de hoy mueve el ánimo del momento y…»
  function fraseHoy(x) {
    const a = TEXTOS.astros[x.a.id], p = TEXTOS.aspectosHoy[x.aspecto.id];
    return `${a.articulo} de hoy mueve ${a.mueve} y ${p[0]} ${TEXTOS.astros[x.b.id].corto}${p[1]} Se nota durante ${a.dura}.`;
  }

  const fraseCasa = (id, casa) => `${TEXTOS.casas[casa]} Es el escenario principal de ${TEXTOS.astros[id].corto}.`;

  // ---------- Lugar ----------
  // Hay dos listas: la propia (js/ciudades.js, con nombres en español) y la mundial de GeoNames
  // (js/ciudades-mundo.js, unas 170.000 ciudades y pueblos de más de 1.000 habitantes), que solo se
  // carga al usar el campo de lugar.

  const etiquetaCiudad = (c) => c[0] + ', ' + c[1];
  let paises = null;
  try { paises = new Intl.DisplayNames(['es'], { type: 'region' }); } catch (e) { /* navegador antiguo */ }
  const nombrePais = (codigo) => { try { return paises ? paises.of(codigo) : codigo; } catch (e) { return codigo; } };

  let mundo = null, cargandoMundo = false, sugerencias = [], activa = -1, coordenadasAMano = false;

  function cargarMundo() {
    if (mundo || cargandoMundo) return;
    cargandoMundo = true;
    const guion = document.createElement('script');
    guion.src = 'js/ciudades-mundo.js';
    guion.onload = () => {
      const M = window.CIUDADES_MUNDO, lineas = M.datos.split('\n');
      // Casi todos los nombres van sin acentos: solo esos pocos pasan por la normalización completa, que es lenta.
      const clave = (t) => /[^ -~]/.test(t) ? Num.normalizar(t) : t.toLowerCase();
      const claves = lineas.map((l) => clave(l.slice(0, l.indexOf('|'))));
      // Todos los nombres en un solo texto, uno por renglón: buscar ahí con indexOf es mucho más
      // rápido que mirar las 170.000 líneas una por una en cada tecla.
      const inicios = new Int32Array(claves.length);
      let pos = 1;
      claves.forEach((c, i) => { inicios[i] = pos; pos += c.length + 1; });
      mundo = { lineas: lineas, zonas: M.zonas, claves: claves, inicios: inicios, texto: '\n' + claves.join('\n') + '\n' };
      if (document.activeElement === $('#lugar')) sugerir();
    };
    guion.onerror = () => { cargandoMundo = false; };
    document.head.appendChild(guion);
  }

  // Para comparar: sin acentos ni mayúsculas, y las comas como espacios («Morelia, México» = «morelia mexico»).
  const limpiar = (t) => Num.normalizar(t).replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
  const paisLimpio = {}, regionLimpia = {};
  let propias = null;

  // Número de la línea del mundo que contiene la posición «pos» del texto de nombres.
  function lineaEn(pos) {
    const ini = mundo.inicios;
    let a = 0, b = ini.length - 1;
    while (a < b) {
      const m = (a + b + 1) >> 1;
      if (ini[m] <= pos) a = m; else b = m - 1;
    }
    return a;
  }

  // Recorre en orden (de más a menos poblada) las líneas cuyo nombre contiene «trozo».
  // Si «trozo» empieza con salto de línea, solo las que empiezan así. Se detiene cuando «cada» devuelve false.
  function recorrer(trozo, cada) {
    let desde = 0, ultima = -1;
    for (;;) {
      const p = mundo.texto.indexOf(trozo, desde);
      if (p < 0) return;
      const i = lineaEn(trozo[0] === '\n' ? p + 1 : p);
      desde = p + 1;
      if (i !== ultima && cada(i) === false) return;
      ultima = i;
    }
  }

  // Hasta ocho lugares que coinciden con lo escrito: primero los de la lista propia, luego
  // los del mundo, de la ciudad más poblada a la menos. Tras el nombre se puede escribir el
  // estado o el país para distinguir lugares que se llaman igual: «San José Chiapas».
  function buscarLugares(texto) {
    const q = limpiar(texto), res = [], MAXIMO = 8;
    if (q.length < 2) return res;
    if (!propias) propias = CIUDADES.map((c) => ({ c: c, clave: limpiar(etiquetaCiudad(c)) }));
    propias.filter((p) => p.clave.startsWith(q)).concat(propias.filter((p) => !p.clave.startsWith(q) && p.clave.includes(q)))
      .slice(0, MAXIMO).forEach((p) => res.push({ etiqueta: etiquetaCiudad(p.c), lat: p.c[2], lon: p.c[3], zona: p.c[4] }));
    if (mundo) {
      const repetida = (lat, lon) => res.some((r) => Math.abs(r.lat - lat) < 0.15 && Math.abs(r.lon - lon) < 0.15);
      const agregar = (i) => {
        const p = mundo.lineas[i].split('|'), lat = Number(p[3]), lon = Number(p[4]);
        if (repetida(lat, lon)) return;
        res.push({ etiqueta: [p[0], p[1], nombrePais(p[2])].filter(Boolean).join(', '), lat: lat, lon: lon, zona: mundo.zonas[Number(p[5])] });
      };
      const sigue = () => res.length < MAXIMO;
      // 1. El nombre empieza por lo escrito.
      recorrer('\n' + q, (i) => { agregar(i); return sigue(); });
      // 2. Nombre seguido del estado o el país: «san jose chiapas», «guadalajara, españa».
      const palabras = q.split(' ');
      if (palabras.length > 1 && sigue()) {
        recorrer('\n' + palabras[0], (i) => {
          const c = mundo.claves[i];
          if (!c.startsWith(q)) {
            const p = mundo.lineas[i].split('|');
            if (!(p[2] in paisLimpio)) paisLimpio[p[2]] = limpiar(nombrePais(p[2]) + ' ' + p[2]);
            if (!(p[1] in regionLimpia)) regionLimpia[p[1]] = limpiar(p[1]);
            const lugar = ' ' + c + ' ' + regionLimpia[p[1]] + ' ' + paisLimpio[p[2]];
            if (palabras.every((w) => lugar.includes(' ' + w))) agregar(i);
          }
          return sigue();
        });
      }
      // 3. El nombre contiene lo escrito en otra parte: «tlaquepaque» encuentra «San Pedro Tlaquepaque».
      if (q.length >= 3 && sigue()) recorrer(q, (i) => { if (!mundo.claves[i].startsWith(q)) agregar(i); return sigue(); });
    }
    return res;
  }

  function prepararLugar() {
    let zonas = CIUDADES.map((c) => c[4]);
    try { zonas = zonas.concat(Intl.supportedValuesOf('timeZone')); } catch (e) { /* navegador antiguo */ }
    zonas = Array.from(new Set(zonas)).sort();
    $('#zona').innerHTML = '<option value="">Elige una zona…</option>' +
      zonas.map((z) => `<option value="${esc(z)}">${esc(z.replace(/_/g, ' '))}</option>`).join('');
  }

  // Elige una zona horaria en el desplegable; si no estaba en la lista, la añade.
  function ponerZona(zona) {
    const lista = $('#zona');
    if (zona && !Array.from(lista.options).some((o) => o.value === zona)) {
      lista.insertAdjacentHTML('beforeend', `<option value="${esc(zona)}">${esc(zona.replace(/_/g, ' '))}</option>`);
    }
    lista.value = zona || '';
  }

  function textoCoordenadas(lat, lon) {
    return Math.abs(lat).toFixed(2) + '° ' + (lat >= 0 ? 'N' : 'S') + ', ' +
      Math.abs(lon).toFixed(2) + '° ' + (lon >= 0 ? 'E' : 'O');
  }

  function cerrarSugerencias() {
    $('#lugar-sugerencias').hidden = true;
    $('#lugar-sugerencias').innerHTML = '';
    $('#lugar').setAttribute('aria-expanded', 'false');
    sugerencias = []; activa = -1;
  }

  function sugerir() {
    const caja = $('#lugar-sugerencias');
    sugerencias = buscarLugares($('#lugar').value); activa = -1;
    caja.innerHTML = sugerencias.map((s, i) => `<li role="option" data-i="${i}">${esc(s.etiqueta)}</li>`).join('');
    caja.hidden = !sugerencias.length;
    $('#lugar').setAttribute('aria-expanded', String(sugerencias.length > 0));
  }

  function elegirLugar(s) {
    $('#lugar').value = s.etiqueta; $('#lat').value = s.lat; $('#lon').value = s.lon;
    ponerZona(s.zona);
    coordenadasAMano = false;
    $('#lugar-estado').textContent = `Elegida: ${textoCoordenadas(s.lat, s.lon)} · zona ${s.zona.replace(/_/g, ' ')}.`;
    cerrarSugerencias();
    actualizarPolar();
  }

  function alCambiarLugar() {
    const texto = $('#lugar').value.trim(), nota = $('#lugar-estado');
    // Al escribir otra cosa, las coordenadas de la ciudad anterior ya no valen.
    if (!coordenadasAMano) { $('#lat').value = ''; $('#lon').value = ''; $('#zona').value = ''; }
    if (!texto) {
      nota.textContent = 'Empieza a escribir y elige tu ciudad de la lista.';
      cerrarSugerencias();
    } else {
      sugerir();
      nota.textContent = sugerencias.length || !mundo
        ? 'Elige tu ciudad de la lista que aparece debajo.'
        : 'No encuentro esa ciudad. Abre «Mi ciudad no aparece» y escribe sus coordenadas.';
      if (!sugerencias.length && mundo && texto.length >= 3) $('#ajustes').open = true;
    }
    actualizarPolar();
  }

  // Tras rellenar el formulario con datos guardados o con el ejemplo: pone la nota al día
  // sin tocar las coordenadas.
  function refrescarLugar() {
    const lat = parseFloat($('#lat').value), lon = parseFloat($('#lon').value), zona = $('#zona').value;
    $('#lugar-estado').textContent = !isNaN(lat) && !isNaN(lon) && zona
      ? `Elegida: ${textoCoordenadas(lat, lon)} · zona ${zona.replace(/_/g, ' ')}.`
      : 'Empieza a escribir y elige tu ciudad de la lista.';
    cerrarSugerencias();
    actualizarPolar();
  }

  function teclaEnLugar(ev) {
    if (!sugerencias.length) return;
    if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
      ev.preventDefault();
      activa = (activa + (ev.key === 'ArrowDown' ? 1 : -1) + sugerencias.length) % sugerencias.length;
      $('#lugar-sugerencias').querySelectorAll('li').forEach((li, i) => li.classList.toggle('activa', i === activa));
    } else if (ev.key === 'Enter') {
      ev.preventDefault();
      elegirLugar(sugerencias[Math.max(activa, 0)]);
    } else if (ev.key === 'Escape') {
      cerrarSugerencias();
    }
  }

  // La casilla polar se marca sola más allá de 66° de latitud.
  function actualizarPolar() {
    const lat = parseFloat($('#lat').value);
    const casilla = $('#polar');
    if (!isNaN(lat) && Math.abs(lat) >= 66) {
      casilla.checked = true; casilla.disabled = true; estado.polarAuto = true;
      $('#polar-nota').textContent = 'Marcada sola: este lugar está a ' + Math.abs(lat).toFixed(1) + '° de latitud.';
    } else {
      if (estado.polarAuto) casilla.checked = false;
      casilla.disabled = false; estado.polarAuto = false;
      $('#polar-nota').textContent = 'Se marca sola si tu ciudad está más allá de 66° de latitud. También puedes marcarla tú.';
    }
  }

  // ---------- Formulario ----------

  function leerFormulario() {
    return {
      nombre: $('#nombre').value.trim(), apellidos: $('#apellidos').value.trim(),
      fecha: $('#fecha').value, hora: $('#hora').value,
      sinHora: $('#sinhora').checked, lugar: $('#lugar').value.trim(),
      lat: parseFloat($('#lat').value), lon: parseFloat($('#lon').value),
      zona: $('#zona').value, polar: $('#polar').checked, aMano: coordenadasAMano
    };
  }

  function llenarFormulario(d) {
    $('#nombre').value = d.nombre || ''; $('#apellidos').value = d.apellidos || '';
    $('#fecha').value = d.fecha || ''; $('#hora').value = d.hora || '';
    $('#sinhora').checked = !!d.sinHora; $('#lugar').value = d.lugar || '';
    $('#lat').value = isNaN(d.lat) || d.lat === null ? '' : d.lat;
    $('#lon').value = isNaN(d.lon) || d.lon === null ? '' : d.lon;
    ponerZona(d.zona);
    coordenadasAMano = !!d.aMano;
    $('#hora').disabled = !!d.sinHora;
    estado.polarAuto = false; $('#polar').checked = !!d.polar;
    actualizarPolar();
  }

  function validar(d) {
    if (!d.fecha) return 'Falta la fecha de nacimiento.';
    const anio = Number(d.fecha.slice(0, 4));
    if (anio < 1800 || anio > 2050) return 'Por ahora la app calcula fechas entre los años 1800 y 2050.';
    if (!d.sinHora && !d.hora) return 'Falta la hora de nacimiento. Si no la conoces, marca «No conozco mi hora exacta».';
    const hayLugar = !isNaN(d.lat) && !isNaN(d.lon) && d.zona;
    if (!d.sinHora && !hayLugar) return 'Falta el lugar de nacimiento: elige una ciudad de la lista o escribe sus coordenadas y zona horaria.';
    if (hayLugar && (Math.abs(d.lat) > 90 || Math.abs(d.lon) > 180)) return 'Revisa las coordenadas: la latitud va de −90 a 90 y la longitud de −180 a 180.';
    return '';
  }

  function calcular(d) {
    const f = d.fecha.split('-').map(Number);
    const h = d.sinHora ? [12, 0] : d.hora.split(':').map(Number);
    const ms = A.aUTC(f[0], f[1], f[2], h[0], h[1], d.zona || 'UTC');
    return A.calcularCarta({
      ms: ms, lat: d.lat, lon: d.lon, sinHora: d.sinHora,
      sistema: d.polar ? 'iguales' : 'placidus'
    });
  }

  function alEnviar(ev) {
    ev.preventDefault();
    const d = leerFormulario();
    const error = validar(d);
    $('#error').hidden = !error;
    $('#error').textContent = error;
    if (error) return;
    try {
      estado.carta = calcular(d);
    } catch (e) {
      $('#error').hidden = false;
      $('#error').textContent = 'No pude calcular la carta con esos datos. Revisa la zona horaria.';
      return;
    }
    estado.datos = d;
    try { localStorage.setItem(CLAVE, JSON.stringify(d)); } catch (e) { /* sin almacenamiento */ }
    ir('carta');
  }

  // ---------- Leyenda de la rueda (el dibujo está en js/rueda.js) ----------

  const ORO = '#E3B341', NEGRO = '#14100C';

  function leyendaRueda(c) {
    const item = (color, texto, extra) => `<span><i style="background: ${color}; ${extra || ''}"></i>${texto}</span>`;
    let hora = '';
    if (c.horaSolar != null) {
      const minutos = Math.round(c.horaSolar * 60) % 1440;
      hora = `<span>Números romanos: la mano del Sol marca tu hora solar, las ${Math.floor(minutos / 60)}:${String(minutos % 60).padStart(2, '0')}</span>`;
    }
    return '<div class="leyenda">' + item('#F7D774', 'Mano dorada: tu Sol') + item('#DADDE6', 'Esfera plateada: tu Luna') + hora +
      (c.casas
        ? item('#2D5A9E', 'Azul: sobre el horizonte') + item('#C8683A', 'Terracota y negro: bajo el horizonte') +
          item(NEGRO, 'Borde negro: tus casas', 'border: 1.5px solid ' + ORO)
        : '<span>Sin hora de nacimiento se dibuja como si fuera mediodía, sin horizonte ni casas.</span>') + '</div>';
  }

  // ---------- Carta natal ----------

  function puntoDe(id) {
    const c = estado.carta;
    return c.puntos.concat(c.angulos).find((p) => p.id === id);
  }

  function textoFecha(d) {
    const f = d.fecha.split('-').map(Number);
    const partes = [f[2] + ' ' + MESES[f[1] - 1] + ' ' + f[0]];
    partes.push(d.sinHora ? 'hora desconocida' : d.hora);
    if (d.lugar) partes.push(d.lugar);
    return partes;
  }

  function textoSistema(c) {
    return !c.casas ? 'sin casas' : c.casas.sistema === 'placidus' ? 'casas Placidus' : 'casas iguales';
  }

  // ---------- Significado del nombre ----------

  // Una misma forma para las variantes de escritura: Mitzy y Mitzi, Lizbeth y Lisbeth, Jhonatan y Jonathan…
  const esqueleto = (t) => t.replace(/ph/g, 'f').replace(/([^cs])h/g, '$1').replace(/^h/, '')
    .replace(/y/g, 'i').replace(/k/g, 'c').replace(/z/g, 's').replace(/v/g, 'b').replace(/(.)\1+/g, '$1');
  let porEsqueleto = null;

  // Devuelve [origen, significado, nombre base o null] para una palabra del nombre, o null si no se conoce.
  // En js/nombres.js una entrada puede ser solo texto: entonces es otra forma de escribir ese nombre.
  function buscarNombre(palabra) {
    const clave = Num.normalizar(palabra);
    let dato = NOMBRES[clave], base = null;
    if (!dato) {
      if (!porEsqueleto) {
        porEsqueleto = {};
        Object.keys(NOMBRES).forEach((k) => {
          const e = esqueleto(k);
          if (!porEsqueleto[e] || typeof NOMBRES[porEsqueleto[e]] === 'string') porEsqueleto[e] = k;
        });
      }
      const parecido = porEsqueleto[esqueleto(clave)];
      if (!parecido) return null;
      dato = NOMBRES[parecido];
      base = typeof dato === 'string' ? dato : mayuscula(parecido);
    }
    if (typeof dato === 'string') {
      base = dato;
      dato = NOMBRES[Num.normalizar(dato)];
    }
    return Array.isArray(dato) ? [dato[0], dato[1], base] : null;
  }

  const PARTICULAS = ['de', 'del', 'la', 'las', 'los', 'y', 'e'];
  const ABREVIATURAS = { ma: 'María', 'mª': 'María' };

  // Significado de cada nombre de pila (María José → los dos).
  function significadosNombre(nombre) {
    const hallados = [], faltan = [];
    String(nombre || '').replace(/[.,;]/g, ' ').trim().split(/\s+/).filter((w) => w && !PARTICULAS.includes(Num.normalizar(w))).forEach((w) => {
      w = ABREVIATURAS[Num.normalizar(w)] || w;
      const n = mayuscula(w.toLowerCase()), dato = buscarNombre(w);
      if (dato) hallados.push(`${n}${dato[2] ? ` (variante de ${dato[2]})` : ''}: ${dato[0]}. ${dato[1]}`);
      else faltan.push(n);
    });
    if (hallados.length && faltan.length) {
      hallados.push(`Aún no tengo el significado de ${faltan.join(' ni de ')}.`);
    }
    return hallados;
  }

  // Significado del nombre y los tres números. Devuelve los datos; cada vista los pinta a su manera.
  function datosNombre(d) {
    const f = d.fecha.split('-').map(Number);
    const completo = nombreCompleto(d);
    const conApellidos = d.apellidos ? 'nombre y apellidos' : 'nombre';
    return {
      completo: completo,
      significados: significadosNombre(d.nombre),
      numeros: [
        ['Camino de vida', Num.caminoDeVida(f[2], f[1], f[0]), 'De tu fecha de nacimiento.'],
        ['Expresión', completo ? Num.expresion(completo) : null, `De todas las letras de tu ${conApellidos}.`],
        ['Alma', completo ? Num.alma(completo) : null, `De las vocales de tu ${conApellidos}.`]
      ]
    };
  }

  function tarjetaNombre(d) {
    const n = datosNombre(d);
    let cab;
    if (n.completo) {
      cab = `<p class="nombre-grande">${esc(n.completo)}</p>` + (n.significados.length
        ? n.significados.map((t) => `<p class="subtitulo">${esc(t)}</p>`).join('')
        : (d.nombre ? '<p class="subtitulo">Aún no tengo el significado de este nombre; sus números sí se calculan.</p>' : ''));
      if (!d.apellidos) cab += '<p class="nota">Añade tus apellidos en «Mis datos» para que expresión y alma se calculen con tu nombre completo.</p>';
    } else {
      cab = '<p class="subtitulo">Escribe tu nombre en «Mis datos» para ver su significado y sus números.</p>';
    }
    return `<section class="tarjeta"><h2 class="etiqueta">Tu nombre y tus números</h2>${cab}
      <div class="numeros">${n.numeros.map((x) => `<div class="numero"><span class="cifra">${x[1] === null ? '—' : x[1]}</span>
        <b>${x[0]}</b><span>${x[2]}${x[1] === null ? '' : ' ' + Num.SIGNIFICADOS[x[1]]}</span></div>`).join('')}</div></section>`;
  }

  // Las tres tarjetas grandes de arriba: signo solar, signo lunar y Ascendente.
  function tarjetasTriada(c) {
    return '<section class="triada" aria-label="Tu tríada">' + TRIADA.map((x) => {
      const p = puntoDe(x[0]);
      if (!p) {
        return `<div class="tarjeta triada-carta apagada"><span class="etiqueta">${x[1]}</span>
          <span class="triada-signo">—</span><span class="nota">Hace falta tu hora de nacimiento para calcularlo.</span></div>`;
      }
      const s = GUIA.signos[p.pos.signo];
      return `<button type="button" class="tarjeta triada-carta" data-detalle="${x[0]}">
        <span class="etiqueta">${x[1]}</span>
        <span class="triada-signo"><span class="simbolo oro" aria-hidden="true">${SIGNO_SIMBOLO[p.pos.signo]}${TXT}</span>${s.nombre}</span>
        <span class="nota">${p.nombre} en ${grados(p.pos)} · ${ORDINAL[p.pos.decanato]} decanato${p.casa ? ' · casa ' + p.casa : ''}</span>
        <span>${esc(s.triada[x[0]])}</span>
        <span class="triada-ver">Ver luz y lado oscuro ›</span></button>`;
    }).join('') + '</section>';
  }

  function filaPosicion(p, conCasas, conEnlace) {
    const nombre = conEnlace
      ? `<button type="button" class="enlace ${claseDe(p.id)}" data-detalle="${p.id}">${p.nombre}</button>`
      : `<b>${p.nombre}</b>`;
    const sigla = p.id === 'asc' ? 'AC' : p.id === 'mc' ? 'MC' : '';
    return `<tr><td><span class="simbolo ${sigla ? 'sigla ' : ''}${claseDe(p.id)}" aria-hidden="true">${sigla || glifo(p.id)}</span>${nombre}</td>
      <td>${p.pos.texto}${p.retro ? ' R' : ''}</td><td>${ORDINAL[p.pos.decanato]}</td>` +
      (conCasas ? `<td>${p.casa || (p.id === 'asc' ? 1 : '')}</td>` : '') + '</tr>';
  }

  function tablaPosiciones(c, conEnlace) {
    const orden = c.puntos.slice(0, 2).concat(c.angulos.slice(0, 1), c.puntos.slice(2));
    return `<table><thead><tr><th scope="col">Astro</th><th scope="col">Signo y grado</th>
      <th scope="col">Decanato</th>${c.casas ? '<th scope="col">Casa</th>' : ''}</tr></thead>
      <tbody>${orden.map((p) => filaPosicion(p, !!c.casas, conEnlace)).join('')}</tbody></table>`;
  }

  // Tema de vida donde actúa un punto de la carta, según su casa.
  function temaDe(p) {
    const casa = p.id === 'asc' ? 1 : p.id === 'mc' ? 10 : p.casa;
    return casa ? TEXTOS.casasCorto[casa] : null;
  }

  function fuerzaOrbe(orbe) {
    return orbe < 1 ? 'Muy marcado: es de los rasgos más fuertes de tu carta.'
      : orbe < 3 ? 'Claro: se nota con frecuencia.' : 'Suave: aparece en momentos puntuales.';
  }

  // Dónde se nota un aspecto y cómo aprovecharlo.
  function usoAspecto(x) {
    const ta = temaDe(x.a), tb = temaDe(x.b);
    return {
      donde: ta && tb ? `Sobre todo en ${ta}${ta === tb ? '' : ' y en ' + tb}.` : '',
      como: TEXTOS.aspectosUso[x.aspecto.id]
    };
  }

  // Un aspecto en la lista. Al pasar el cursor, tocarlo o enfocarlo, se despliega la explicación amplia.
  function renglonAspecto(x) {
    const uso = usoAspecto(x);
    return `<div class="renglon aspecto" tabindex="0"><span><b>${x.a.nombre}</b> ${x.aspecto.nombre} <b>${x.b.nombre}</b></span>
      <span class="orbe">orbe ${A.textoOrbe(x.orbe)}</span><small>${esc(fraseNatal(x))}</small>
      <div class="amplia" role="note">
        <p><b>${x.a.nombre}.</b> ${esc(TEXTOS.astros[x.a.id].que)}</p>
        <p><b>${x.b.nombre}.</b> ${esc(TEXTOS.astros[x.b.id].que)}</p>
        ${uso.donde ? `<p><b>Dónde lo notas.</b> ${esc(uso.donde)}</p>` : ''}
        <p><b>Cómo usarlo.</b> ${esc(uso.como)}</p>
        <p><b>Fuerza.</b> ${fuerzaOrbe(x.orbe)}</p>
      </div></div>`;
  }

  function pintarCarta() {
    const d = estado.datos, c = estado.carta;
    let h = `<header class="cabecera"><div>
        <div class="sobretitulo">${nombreCompleto(d) ? esc(nombreCompleto(d)) : 'Tu carta'}</div>
        <h1>Carta natal</h1>
        <p class="subtitulo">${esc(textoFecha(d).join(' · '))} · ${textoSistema(c)}</p>
      </div><div class="acciones">
        <button type="button" class="boton" data-accion="imprimir">Imprimir o guardar PDF</button>
        <button type="button" class="boton secundario" data-vista="datos">Cambiar datos</button>
      </div></header>
      ${tarjetasTriada(c)}
      <div class="columnas"><div class="col">${Rueda.dibujar(c)}${leyendaRueda(c)}${tarjetaNombre(d)}`;
    if (c.casas) {
      h += '<section class="tarjeta"><h2 class="etiqueta">Inicio de cada casa</h2><div class="casas-rejilla">';
      for (let i = 1; i <= 12; i++) h += `<span><b>${i}</b> · ${A.posicion(c.casas.cuspides[i]).texto}</span>`;
      h += '</div></section>';
    }
    h += `</div><div class="col"><section class="tarjeta"><h2 class="etiqueta">Posiciones</h2>
      <div class="tabla-caja">${tablaPosiciones(c, true)}</div>
      <p class="nota">R = retrógrado. Pulsa cualquier astro para leer qué significa en tu carta.${
        d.sinHora ? ' Sin hora de nacimiento, la Luna puede variar hasta 7°.' : ''}</p></section>
      <section class="tarjeta" style="gap: 0"><h2 class="etiqueta" style="margin-bottom: 4px">Aspectos más exactos</h2>
      <p class="nota">Pasa el cursor por encima de un aspecto, o tócalo, para ver dónde se nota y cómo usarlo.</p>
      ${c.aspectos.slice(0, 10).map(renglonAspecto).join('')}</section></div></div>`;
    $('#vista-carta').innerHTML = h;
  }

  // ---------- Detalle de un astro ----------

  function tarjeta(titulo, texto, clase, nota) {
    return `<section class="tarjeta ${clase || ''}"><h3 class="etiqueta ${clase && clase.indexOf('sombra') >= 0 ? 'rosa' : ''}">${titulo}</h3>
      <p>${esc(texto)}</p>${nota ? `<p class="nota">${nota}</p>` : ''}</section>`;
  }

  // Tarjetas del lado oscuro: las tres sombras de la tríada y Lilith.
  function tarjetasSombra(c, destacada) {
    let h = '';
    TRIADA.forEach((x) => {
      const p = puntoDe(x[0]);
      if (!p) return;
      const s = GUIA.signos[p.pos.signo];
      h += tarjeta(x[2] + ' · ' + s.nombre, s.sombra[x[0]], 'sombra' + (x[0] === destacada ? ' destacada' : ''));
    });
    const sl = GUIA.signos[puntoDe('lilith').pos.signo];
    return h + tarjeta('Lilith en ' + sl.nombre + ' · la sombra reprimida', sl.lilith,
      'sombra' + (destacada === 'lilith' ? ' destacada' : ''));
  }

  function pintarDetalle() {
    const c = estado.carta;
    const disponibles = c.puntos.slice(0, 2).concat(c.angulos.slice(0, 1), c.puntos.slice(2));
    if (!puntoDe(estado.detalle) || estado.detalle === 'mc') estado.detalle = 'sol';
    const id = estado.detalle, p = puntoDe(id), astro = TEXTOS.astros[id];
    const signo = GUIA.signos[p.pos.signo], dec = signo.decanatos[p.pos.decanato];

    let h = `<button type="button" class="volver" data-vista="carta">‹ Carta natal</button>
      <header class="cabecera"><div class="heroe">
        <span class="glifo ${id === 'asc' ? 'texto' : ''} ${id === 'lilith' ? 'rosa' : ''}" aria-hidden="true">${id === 'asc' ? 'AC' : glifo(id)}</span>
        <div><h1>${p.nombre} en ${signo.nombre}</h1>
        <p class="subtitulo">${grados(p.pos)} de ${signo.nombre} · ${signo.elemento}${
          p.casa ? ' · casa ' + p.casa : ''}${p.retro ? ' · retrógrado' : ''}</p></div>
      </div></header>
      <div class="selector" role="group" aria-label="Elegir astro">${disponibles.map((x) =>
        `<button type="button" data-detalle="${x.id}" aria-pressed="${x.id === id}">${x.nombre}</button>`).join('')}</div>`;

    h += `<section class="tarjeta" style="gap: 10px"><div class="entre"><b>${ORDINAL[p.pos.decanato]} decanato de ${signo.nombre}</b>
        <span class="nota">${dec.grados} · regente ${esc(dec.regente)}${dec.matiz !== signo.nombre ? ' · matiz ' + esc(dec.matiz) : ''}</span></div>
      <div class="decanato-barra">${[0, 1, 2].map((i) => `<i class="${i === p.pos.decanato ? 'activo' : ''}"></i>`).join('')}
        <span class="marca-grado" style="left: ${(p.pos.fraccion * 100).toFixed(1)}%"></span></div>
      <div class="decanato-pie">${signo.decanatos.map((x, i) =>
        `<span class="${i === p.pos.decanato ? 'activo' : ''}">${ORDINAL[i]} · ${esc(x.regente)}</span>`).join('')}</div></section>`;

    // Columna izquierda: qué significa, en claro.
    h += `<div class="columnas"><div class="col"><h2 class="titulo-col">${DE_LA_GUIA[id] ? 'Luz' : 'En claro'}</h2>`;
    h += tarjeta('Qué representa', astro.que);
    if (DE_LA_GUIA[id]) {
      h += tarjeta(astro.articulo + ' en ' + signo.nombre, signo.triada[id]) +
        tarjeta('El matiz de tu decanato', dec[id]);
    } else if (TEXTOS.enSigno[id]) {
      h += tarjeta(p.nombre + ' en ' + signo.nombre, TEXTOS.enSigno[id][p.pos.signo], '', astro.generacion
        ? `${p.nombre} tarda ${astro.generacion} en cada signo: este rasgo lo compartes con la gente de tu edad. Lo personal lo marca su casa.`
        : '');
    }
    if (p.casa) h += tarjeta('En tu casa ' + p.casa, fraseCasa(id, p.casa));
    if (p.retro) h += tarjeta('Retrógrado', TEXTO_RETRO);
    if (DE_LA_GUIA[id]) {
      h += tarjeta('Planeta regente · ' + esc(signo.regente.nombre), signo.regente.descripcion) +
        tarjeta('Compatibilidad', signo.compatibilidad) +
        tarjeta('Cuerpo y salud', signo.anatomia, '', 'Tradición astrológica: no sustituye el consejo de un médico.');
    }

    // Columna derecha: lado oscuro (tríada y Lilith) y cómo se lleva con el resto.
    h += '</div><div class="col">';
    if (DE_LA_GUIA[id] || id === 'lilith') {
      h += `<h2 class="titulo-col rosa">Lado oscuro</h2>${tarjetasSombra(c, id)}`;
    }
    const suyos = c.aspectos.filter((x) => x.a.id === id || x.b.id === id).slice(0, 8);
    h += `<h2 class="titulo-col">Cómo se lleva con el resto</h2>
      <section class="tarjeta" style="gap: 0">${suyos.length ? suyos.map(renglonAspecto).join('')
        : '<p>No forma aspectos mayores con otros puntos de tu carta: actúa por su cuenta.</p>'}</section>
      </div></div><p class="nota">Tríada, decanatos, sombras y Lilith: ${esc(GUIA.fuente)}, recopilación propia hecha con ayuda de inteligencia artificial (Gemini). El resto de los textos son borradores escritos con ayuda de inteligencia artificial (Claude).</p>`;
    $('#vista-detalle').innerHTML = h;
  }

  // ---------- Cielo de hoy ----------

  function textoMomento(ms) {
    const f = new Date(ms);
    return f.getDate() + ' ' + MESES[f.getMonth()] + ', ' + f.getHours() + ' h';
  }

  function pintarHoy() {
    const ahora = Date.now(), f = new Date(ahora);
    const cielo = A.calcularCarta({ ms: ahora, sinHora: true });
    let h = `<header class="cabecera"><div>
        <div class="sobretitulo">${f.getDate()} ${MESES[f.getMonth()]} ${f.getFullYear()} · ${f.getHours()}:${String(f.getMinutes()).padStart(2, '0')} h</div>
        <h1>Cielo de hoy</h1>
        <p class="subtitulo">Dónde está cada astro en este momento y qué puntos de tu carta toca.</p>
      </div></header>
      <section class="col" style="flex: none"><h2 class="etiqueta tenue">Ahora</h2><div class="fichas">${cielo.puntos.map((p) =>
        `<div class="ficha"><span class="glifo ${claseDe(p.id)}" aria-hidden="true">${glifo(p.id)}</span>
          <div><b>${p.nombre}${p.retro ? ' R' : ''}</b><span>${p.pos.texto}</span></div></div>`).join('')}</div></section>
      <div class="columnas"><section class="col"><h2 class="etiqueta tenue">Qué toca en tu carta</h2>`;
    if (estado.carta) {
      const natal = estado.carta.puntos.concat(estado.carta.angulos);
      const toques = A.aspectos(cielo.puntos.filter((p) => p.id !== 'lilith'), natal, 3).slice(0, 8);
      h += toques.length ? toques.map((x) => `<article class="tarjeta">
          <span class="pastilla ${TENSOS[x.aspecto.id] ? 'tensa' : ''}">${x.aspecto.nombre} · orbe ${A.textoOrbe(x.orbe)}</span>
          <h3>${x.a.nombre} de hoy con tu ${x.b.nombre} natal</h3>
          <p>${esc(fraseHoy(x))}</p>
          <p class="nota">${x.a.nombre} en ${x.a.pos.texto} · tu ${x.b.nombre} en ${x.b.pos.texto}</p></article>`).join('')
        : '<p class="tarjeta">Hoy ningún astro forma un aspecto cerrado con tu carta.</p>';
    } else {
      h += '<div class="tarjeta"><p>Calcula primero tu carta para ver qué toca hoy.</p><button type="button" class="boton" data-vista="datos" style="align-self: flex-start">Ir a mis datos</button></div>';
    }
    const eventos = A.proximosEventos(ahora, 30).filter((e) => !e.menor).slice(0, 8);
    h += `</section><section class="col col-estrecha"><h2 class="etiqueta tenue">Próximos eventos</h2>
      <div class="tarjeta" style="gap: 0">${eventos.map((e) =>
        `<div class="renglon"><span>${e.texto}</span><span class="orbe">${textoMomento(e.ms)}</span></div>`).join('')}</div>
      <p class="nota">Fechas en la hora de este equipo, con margen de una hora.</p></section></div>`;
    $('#vista-hoy').innerHTML = h;
  }

  // ---------- Informe para imprimir o guardar en PDF ----------

  function pintarInforme() {
    if (!estado.carta) {
      $('#informe').innerHTML = '<p>Calcula primero tu carta para poder imprimirla.</p>';
      return;
    }
    const d = estado.datos, c = estado.carta, n = datosNombre(d);
    const parrafo = (titulo, texto, clase) => texto ? `<p><b class="${clase || ''}">${esc(titulo)}.</b> ${esc(texto)}</p>` : '';
    const cabeceraAstro = (p, signo) => `<h3 class="${p.id === 'lilith' ? 'sombra' : ''}">${p.id === 'asc' ? '' : glifo(p.id) + ' '}${p.nombre} en ${signo.nombre}
      <span class="inf-nota">${grados(p.pos)} · ${ORDINAL[p.pos.decanato]} decanato${p.casa ? ' · casa ' + p.casa : ''}${p.retro ? ' · retrógrado' : ''}</span></h3>`;
    // Lista corta de los aspectos de un astro; la explicación completa va en su propio apartado.
    const aspectosDe = (id) => {
      const suyos = c.aspectos.filter((x) => x.a.id === id || x.b.id === id);
      if (!suyos.length) return '<p><b>Aspectos.</b> No forma aspectos mayores con otros puntos de tu carta: actúa por su cuenta.</p>';
      return '<p><b>Aspectos.</b> ' + suyos.map((x) =>
        `${x.aspecto.nombre} con ${x.a.id === id ? x.b.nombre : x.a.nombre} (${A.textoOrbe(x.orbe)})`).join(', ') +
        '. Se explican en «Todos tus aspectos».</p>';
    };

    // --- Portada ---
    let h = `<header class="inf-cabecera"><div class="inf-etq">Carta astral</div>
      <h1>${n.completo ? esc(n.completo) : 'Carta natal'}</h1>
      <p>${esc(textoFecha(d).join(' · '))} · ${textoSistema(c)}</p></header>
      <div class="inf-portada">${Rueda.dibujar(c)}<div>`;
    TRIADA.forEach((x) => {
      const p = puntoDe(x[0]);
      if (!p) return;
      h += `<div class="inf-bloque"><div class="inf-etq">${x[1]}</div>
        <p class="inf-signo">${SIGNO_SIMBOLO[p.pos.signo]}${TXT} ${GUIA.signos[p.pos.signo].nombre}</p>
        <p class="inf-nota">${p.nombre} en ${grados(p.pos)} · ${ORDINAL[p.pos.decanato]} decanato${p.casa ? ' · casa ' + p.casa : ''}</p></div>`;
    });
    if (c.horaSolar != null) {
      const minutos = Math.round(c.horaSolar * 60) % 1440;
      h += `<p class="inf-nota">Hora solar de nacimiento: ${Math.floor(minutos / 60)}:${String(minutos % 60).padStart(2, '0')}. Es la que marca la mano dorada del Sol en los números romanos.</p>`;
    }
    h += `</div></div>
      <p class="inf-nota">En la rueda: la mano dorada es tu Sol y la esfera plateada, tu Luna. ${c.casas
        ? 'Lo azul estaba sobre el horizonte al nacer; lo terracota y negro, por debajo. El borde negro numera tus casas.'
        : 'Sin hora de nacimiento se dibuja como si fuera mediodía, sin horizonte ni casas.'}</p>
      <h2>Cómo leer este informe</h2>
      <p>Cada frase de tu carta se arma con cuatro piezas. El <b>astro</b> dice qué parte de ti habla. El <b>signo</b>, con qué estilo lo hace.
      El <b>decanato</b> (cada 10° del signo) le da un matiz. La <b>casa</b> señala en qué terreno de tu vida se nota.
      Y los <b>aspectos</b> cuentan cómo se llevan los astros entre sí.</p>`;

    // --- Tríada ---
    h += '<h2>Tu tríada: Sol, Luna y Ascendente</h2>';
    TRIADA.forEach((x) => {
      const p = puntoDe(x[0]);
      if (!p) return;
      const s = GUIA.signos[p.pos.signo], dec = s.decanatos[p.pos.decanato], astro = TEXTOS.astros[x[0]];
      h += `<div class="inf-astro">${cabeceraAstro(p, s)}
        <p class="inf-etq">${x[1]}: ${s.nombre} · elemento ${s.elemento}</p>
        ${parrafo('Qué representa', astro.que)}
        ${parrafo(astro.articulo + ' en ' + s.nombre, s.triada[x[0]])}
        ${parrafo(`Tu decanato: el ${ORDINAL[p.pos.decanato]}, de ${dec.grados}, regente ${dec.regente}${dec.matiz !== s.nombre ? ', matiz ' + dec.matiz : ''}`, dec[x[0]])}
        ${p.casa ? parrafo('En tu casa ' + p.casa, fraseCasa(x[0], p.casa)) : ''}
        ${x[0] === 'asc' ? '<p><b>Casa.</b> El Ascendente marca el inicio de tu casa 1.</p>' : ''}
        ${parrafo('Planeta regente del signo: ' + s.regente.nombre, s.regente.descripcion)}
        ${parrafo('Compatibilidad', s.compatibilidad)}
        ${parrafo('Cuerpo y salud', s.anatomia)}
        ${parrafo('Lado oscuro', s.sombra[x[0]], 'sombra')}
        ${aspectosDe(x[0])}</div>`;
    });
    if (!c.casas) h += '<p class="inf-nota">Falta el Ascendente: para calcularlo hace falta la hora de nacimiento.</p>';

    // --- Lilith ---
    const lil = puntoDe('lilith'), sl = GUIA.signos[lil.pos.signo];
    h += `<h2>Lilith: la sombra reprimida</h2><div class="inf-astro">${cabeceraAstro(lil, sl)}
      ${parrafo('Qué representa', TEXTOS.astros.lilith.que)}
      ${parrafo('Lilith en ' + sl.nombre, sl.lilith, 'sombra')}
      ${lil.casa ? parrafo('En tu casa ' + lil.casa, fraseCasa('lilith', lil.casa)) : ''}
      ${aspectosDe('lilith')}</div>`;

    // --- Planetas ---
    h += '<h2>Tus planetas</h2>';
    c.puntos.slice(2, 10).forEach((p) => {
      const s = GUIA.signos[p.pos.signo], astro = TEXTOS.astros[p.id];
      h += `<div class="inf-astro">${cabeceraAstro(p, s)}
        ${parrafo('Qué representa', astro.que)}
        ${parrafo(p.nombre + ' en ' + s.nombre, TEXTOS.enSigno[p.id][p.pos.signo])}
        ${astro.generacion ? `<p class="inf-nota">${p.nombre} tarda ${astro.generacion} en cada signo: este rasgo lo compartes con la gente de tu edad. Lo personal lo marca su casa.</p>` : ''}
        ${p.casa ? parrafo('En tu casa ' + p.casa, fraseCasa(p.id, p.casa)) : ''}
        ${p.retro ? parrafo('Retrógrado', TEXTO_RETRO) : ''}
        ${aspectosDe(p.id)}</div>`;
    });

    // --- Casas ---
    if (c.casas) {
      h += `<h2>Tus doce casas</h2>
        <p class="inf-nota">Cada casa es un terreno de tu vida. El signo donde empieza le da su estilo y los astros que caen dentro lo activan.
        Están calculadas con ${c.casas.sistema === 'placidus' ? 'el sistema Placidus' : 'casas iguales'}.</p>`;
      for (let i = 1; i <= 12; i++) {
        const dentro = c.puntos.filter((p) => p.casa === i).map((p) => p.nombre);
        h += `<div class="inf-bloque"><h3>Casa ${i} <span class="inf-nota">empieza en ${A.posicion(c.casas.cuspides[i]).texto}</span></h3>
          <p>${esc(TEXTOS.casas[i])} ${dentro.length ? '<b>Aquí tienes:</b> ' + dentro.join(', ') + '.'
            : 'Sin astros dentro: este terreno se vive con el estilo de su signo.'}</p></div>`;
      }
    }

    // --- Aspectos ---
    h += `<h2>Todos tus aspectos</h2>
      <p class="inf-nota">Un aspecto es el ángulo entre dos puntos de tu carta. El orbe es cuánto se aparta del ángulo exacto:
      cuanto menor, más se nota. Van del más exacto al más suave.</p>`;
    c.aspectos.forEach((x) => {
      const uso = usoAspecto(x);
      h += `<div class="inf-bloque"><h3>${x.a.nombre} ${x.aspecto.nombre} ${x.b.nombre}
        <span class="inf-nota">${x.aspecto.angulo}° · orbe ${A.textoOrbe(x.orbe)}</span></h3>
        <p>${esc(fraseNatal(x))}</p>
        ${parrafo('Dónde lo notas', uso.donde)}${parrafo('Cómo usarlo', uso.como)}${parrafo('Fuerza', fuerzaOrbe(x.orbe))}</div>`;
    });

    // --- Nombre y numerología ---
    h += '<h2>Tu nombre y tus números</h2>';
    if (n.significados.length) h += `<p><b>Tu nombre.</b> ${n.significados.map(esc).join(' ')}</p>`;
    else if (d.nombre) h += '<p>Aún no tengo el significado de este nombre; sus números sí se calculan.</p>';
    h += '<div class="inf-numeros">' + n.numeros.map((x) => `<div class="inf-bloque"><span class="inf-cifra">${x[1] === null ? '—' : x[1]}</span>
      <b>${x[0]}</b><p>${x[2]}${x[1] === null ? ' Falta el nombre para calcularlo.' : ' ' + Num.SIGNIFICADOS[x[1]]}</p></div>`).join('') + '</div>' +
      '<p class="inf-nota">Numerología pitagórica. Los números 11, 22 y 33 se consideran maestros y no se reducen.</p>';

    // --- Tabla y pie ---
    h += `<h2>Tabla de posiciones</h2>${tablaPosiciones(c, false)}
      <p class="inf-nota">R = retrógrado.${d.sinHora ? ' Sin hora de nacimiento, la Luna puede variar hasta 7°.' : ''}</p>`;
    const hoy = new Date();
    h += `<footer class="inf-pie">Carta Astral · impreso el ${hoy.getDate()} ${MESES[hoy.getMonth()]} ${hoy.getFullYear()} ·
      Tríada, decanatos, sombras y Lilith: ${esc(GUIA.fuente)}, recopilación propia hecha con ayuda de inteligencia artificial (Gemini).
      Los demás textos son borradores escritos con ayuda de inteligencia artificial (Claude). Es astrología tradicional, no consejo profesional.
      Cuerpo y salud son tradición astrológica, no consejo médico.</footer>`;
    $('#informe').innerHTML = h;
  }

  // El informe se arma justo antes de imprimir, también si se usa Ctrl+P o el menú del navegador.
  let tituloPagina = document.title;
  window.addEventListener('beforeprint', () => {
    pintarInforme();
    tituloPagina = document.title;
    const nombre = estado.datos ? nombreCompleto(estado.datos) : '';
    document.title = 'Carta astral' + (nombre ? ' de ' + nombre : '');
  });
  window.addEventListener('afterprint', () => { document.title = tituloPagina; });

  function imprimir() {
    if (estado.carta) window.print();
  }

  // ---------- Navegación ----------

  function ir(vista) {
    if ((vista === 'carta' || vista === 'detalle') && !estado.carta) vista = 'datos';
    if (vista === 'carta') pintarCarta();
    if (vista === 'detalle') pintarDetalle();
    if (vista === 'hoy') pintarHoy();
    ['datos', 'carta', 'detalle', 'hoy', 'guia'].forEach((v) => { $('#vista-' + v).hidden = v !== vista; });
    const marcada = vista === 'detalle' ? 'carta' : vista;
    document.querySelectorAll('.menu-lista button').forEach((b) => {
      if (b.dataset.vista === marcada) b.setAttribute('aria-current', 'page');
      else b.removeAttribute('aria-current');
    });
    window.scrollTo(0, 0);
  }

  document.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-vista], [data-detalle], [data-accion]');
    if (!b) return;
    if (b.dataset.accion === 'imprimir') imprimir();
    else if (b.dataset.detalle) { estado.detalle = b.dataset.detalle; ir('detalle'); } else ir(b.dataset.vista);
  });

  // ---------- Arranque ----------

  prepararLugar();
  $('#formulario').addEventListener('submit', alEnviar);
  $('#lugar').addEventListener('input', alCambiarLugar);
  $('#lugar').addEventListener('focus', cargarMundo);
  $('#lugar').addEventListener('keydown', teclaEnLugar);
  $('#lugar').addEventListener('blur', () => setTimeout(cerrarSugerencias, 150));
  $('#lugar-sugerencias').addEventListener('mousedown', (ev) => {
    const li = ev.target.closest('li');
    if (li && sugerencias[Number(li.dataset.i)]) { ev.preventDefault(); elegirLugar(sugerencias[Number(li.dataset.i)]); }
  });
  ['#lat', '#lon', '#zona'].forEach((s) => $(s).addEventListener('input', () => { coordenadasAMano = true; }));
  $('#lat').addEventListener('input', actualizarPolar);
  $('#sinhora').addEventListener('change', () => { $('#hora').disabled = $('#sinhora').checked; });
  $('#ejemplo').addEventListener('click', () => { llenarFormulario(EJEMPLO); refrescarLugar(); });
  $('#borrar').addEventListener('click', () => {
    try { localStorage.removeItem(CLAVE); } catch (e) { /* sin almacenamiento */ }
    estado.datos = null; estado.carta = null;
    llenarFormulario({}); refrescarLugar();
    $('#error').hidden = true;
  });

  let guardado = null;
  try { guardado = JSON.parse(localStorage.getItem(CLAVE)); } catch (e) { /* nada guardado */ }
  if (guardado && !validar(guardado)) {
    llenarFormulario(guardado); refrescarLugar();
    try { estado.carta = calcular(guardado); estado.datos = guardado; } catch (e) { estado.carta = null; }
  }
  if (location.hash === '#ejemplo') {
    llenarFormulario(EJEMPLO); refrescarLugar();
    estado.datos = leerFormulario(); estado.carta = calcular(estado.datos);
  }
  ir(estado.carta ? 'carta' : 'datos');

  // Para pruebas: permite generar el informe sin abrir el diálogo de impresión.
  window.CartaAstral = { pintarInforme: pintarInforme };
})();
