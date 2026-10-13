/* Carta Astral — la rueda de la carta, dibujada al estilo del reloj astronómico de Praga.
 * Uso: Rueda.dibujar(carta) devuelve el dibujo (SVG) como texto.
 * Solo usa formas planas, unos pocos degradados y un grano fino: no pesa al dibujarse.
 */
(function (g) {
  'use strict';

  const A = g.Astro;
  const TXT = '\uFE0E'; // pide al sistema el símbolo como texto, no como emoji
  const SIMBOLO = {
    sol: '☉', luna: '☽', mercurio: '☿', venus: '♀', marte: '♂', jupiter: '♃',
    saturno: '♄', urano: '♅', neptuno: '♆', pluton: '♇', lilith: '⚸'
  };
  const SIGNO_SIMBOLO = '♈♉♊♋♌♍♎♏♐♑♒♓';
  const glifo = (id) => SIMBOLO[id] ? SIMBOLO[id] + TXT : '';

  // ---------- Rueda al estilo del reloj astronómico de Praga ----------
  // Los ángulos son los de siempre (Ascendente a la izquierda); lo que cambia es el dibujo:
  // borde negro con las casas, anillo azul de 24 horas, placa de día y noche,
  // anillo de signos descentrado, mano dorada del Sol y esfera plateada de la Luna.

  const R = { C: 320, borde: 300, casas: 262, placa: 232, ecuador: 152.3, cancer: 100,
    desc: 66, anillo: 166, banda: 28, tierra: 36 };
  const ROMANOS = ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
  const ORO = '#E3B341', NEGRO = '#14100C';
  let ruedas = 0;

  function punto(r, ang) {
    const a = ang * Math.PI / 180;
    return [R.C + r * Math.cos(a), R.C - r * Math.sin(a)];
  }
  const xy = (r, ang) => punto(r, ang).map((v) => v.toFixed(1)).join(' ');
  const en = (p) => `x="${p[0].toFixed(1)}" y="${p[1].toFixed(1)}"`;
  const circulo = (p, r, extra) => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${r}" ${extra}/>`;

  function rueda(carta) {
    const id = 'rueda' + (++ruedas) + '-';
    const sol = carta.puntos[0], luna = carta.puntos[1];
    // Sin hora de nacimiento no hay horizonte: se dibuja con el Sol arriba, como a mediodía.
    const asc = carta.casas ? carta.casas.asc : A.n360(sol.lon + 90);
    const fi = (lon) => A.n360(180 + lon - asc);

    // El anillo de los signos va descentrado hacia Capricornio, como en el reloj original.
    const fc = fi(270) * Math.PI / 180, ox = R.desc * Math.cos(fc), oy = R.desc * Math.sin(fc);
    const centro = [R.C + ox, R.C - oy];
    const hasta = (ang, radio) => {
      const a = ang * Math.PI / 180, uc = Math.cos(a) * ox + Math.sin(a) * oy;
      return uc + Math.sqrt(uc * uc - R.desc * R.desc + radio * radio);
    };
    const ext = (ang) => hasta(ang, R.anillo), int = (ang) => hasta(ang, R.anillo - R.banda);
    const medio = (ang) => (ext(ang) + int(ang)) / 2;
    const oro = `url(#${id}oro)`;

    let s = `<svg class="rueda" viewBox="0 0 640 640" role="img" aria-label="Rueda de la carta natal, al estilo del reloj astronómico de Praga"><defs>
      <linearGradient id="${id}oro" gradientUnits="userSpaceOnUse" x1="90" y1="90" x2="550" y2="550"><stop offset="0" stop-color="#FFE9A8"/><stop offset=".5" stop-color="${ORO}"/><stop offset="1" stop-color="#B8862B"/></linearGradient>
      <radialGradient id="${id}borde" gradientUnits="userSpaceOnUse" cx="320" cy="320" r="300"><stop offset=".86" stop-color="#2A2016"/><stop offset="1" stop-color="#0B0806"/></radialGradient>
      <radialGradient id="${id}horas" gradientUnits="userSpaceOnUse" cx="320" cy="320" r="262"><stop offset=".88" stop-color="#2C58A8"/><stop offset="1" stop-color="#142F68"/></radialGradient>
      <radialGradient id="${id}cielo" gradientUnits="userSpaceOnUse" cx="320" cy="320" r="232"><stop offset="0" stop-color="#4C82CC"/><stop offset="1" stop-color="#21467F"/></radialGradient>
      <radialGradient id="${id}suelo" gradientUnits="userSpaceOnUse" cx="320" cy="320" r="232"><stop offset="0" stop-color="#DE8A54"/><stop offset="1" stop-color="#A24A25"/></radialGradient>
      <radialGradient id="${id}noche" gradientUnits="userSpaceOnUse" cx="320" cy="438" r="110"><stop offset="0" stop-color="#2D2219"/><stop offset="1" stop-color="#0B0806"/></radialGradient>
      <radialGradient id="${id}tierra" gradientUnits="userSpaceOnUse" cx="308" cy="306" r="46"><stop offset="0" stop-color="#5BA0D0"/><stop offset="1" stop-color="#143A60"/></radialGradient>
      <pattern id="${id}grano" patternUnits="userSpaceOnUse" width="23" height="23"><circle cx="3" cy="4" r=".7" fill="#fff" opacity=".10"/><circle cx="14" cy="9" r=".6" opacity=".20"/><circle cx="8" cy="18" r=".8" fill="#fff" opacity=".07"/><circle cx="19" cy="20" r=".6" opacity=".16"/></pattern>
    </defs>
    <circle cx="320" cy="320" r="${R.borde}" fill="url(#${id}borde)" stroke="${oro}" stroke-width="3"/>
    <circle cx="320" cy="320" r="${R.casas}" fill="url(#${id}horas)" stroke="${oro}" stroke-width="1.5"/>`;

    // Placa: de día sobre el horizonte, crepúsculo y noche por debajo.
    if (carta.casas) {
      s += `<path d="M88 320 A232 232 0 0 1 552 320 Z" fill="url(#${id}cielo)"/>
        <path d="M88 320 A232 232 0 0 0 552 320 Z" fill="url(#${id}suelo)"/>
        <circle cx="320" cy="438" r="110" fill="url(#${id}noche)"/>`;
    } else {
      s += `<circle cx="320" cy="320" r="${R.placa}" fill="url(#${id}cielo)"/>`;
    }
    s += `<circle cx="320" cy="320" r="${R.placa}" fill="none" stroke="${oro}" stroke-width="1.5"/>
      <g fill="none" stroke="${ORO}" opacity=".55"><circle cx="320" cy="320" r="${R.ecuador}"/><circle cx="320" cy="320" r="${R.cancer}"/></g>`;

    let d;
    if (carta.casas) {
      const c = carta.casas.cuspides, mc = carta.casas.mc;
      d = '';
      for (let i = 1; i <= 12; i++) d += `M${xy(R.tierra, fi(c[i]))} L${xy(R.placa, fi(c[i]))} `;
      s += `<path fill="none" stroke="${ORO}" opacity=".5" d="${d}"/>`;
      d = [asc, asc + 180, mc, mc + 180].map((l) => `M${xy(R.tierra, fi(l))} L${xy(R.placa, fi(l))}`).join(' ');
      s += `<path fill="none" stroke="${oro}" stroke-width="2" d="${d}"/>`;
      // Rótulos en latín del reloj: solo donde el anillo de signos no los tapa.
      const libre = (x, y) => {
        const dist = Math.hypot(x - centro[0], y - centro[1]);
        return dist > R.anillo + 8 || dist < R.anillo - R.banda - 8;
      };
      s += '<g class="r-rotulos">';
      [['ORTUS', 134, 311, 28, '#FBE9A9'], ['OCCASUS', 506, 311, 36, '#FBE9A9'],
        ['AURORA', 152, 404, 32, '#160F0A'], ['CREPUSCULUM', 486, 404, 46, '#160F0A']].forEach((r) => {
        if (libre(r[1] - r[3], r[2]) && libre(r[1], r[2]) && libre(r[1] + r[3], r[2])) {
          s += `<text x="${r[1]}" y="${r[2]}" fill="${r[4]}">${r[0]}</text>`;
        }
      });
      s += '</g>';
    }
    s += `<circle cx="320" cy="320" r="${R.borde}" fill="url(#${id}grano)"/>`;

    // Anillo de los signos.
    s += circulo(centro, R.anillo - R.banda / 2, `fill="none" stroke="${NEGRO}" stroke-width="${R.banda}"`) +
      `<g fill="none" stroke="${oro}" stroke-width="1.5">${circulo(centro, R.anillo, '')}${circulo(centro, R.anillo - R.banda, '')}`;
    d = '';
    for (let k = 0; k < 12; k++) d += `M${xy(int(fi(30 * k)), fi(30 * k))} L${xy(ext(fi(30 * k)), fi(30 * k))} `;
    s += `<path d="${d}"/></g><g class="r-signos">`;
    for (let k = 0; k < 12; k++) {
      // Si la mano del Sol o de la Luna pasa por el centro del signo, su símbolo se hace a un lado.
      let lon = 30 * k + 15;
      [sol.lon, luna.lon].forEach((m) => {
        const dif = A.n360(m - lon + 180) - 180;
        if (Math.abs(dif) < 7.5) lon = Math.min(30 * k + 26, Math.max(30 * k + 4, A.n360(m) + (dif >= 0 ? -8.5 : 8.5)));
      });
      s += `<text ${en(punto(medio(fi(lon)), fi(lon)))}>${SIGNO_SIMBOLO[k]}${TXT}</text>`;
    }
    s += '</g>';

    // Planetas: fichas por dentro del anillo, separadas para que no se encimen.
    const radioFicha = (ang) => Math.max(int(ang) - 17, R.tierra + 15);
    const fichas = carta.puntos.slice(2).map((p) => ({ id: p.id, real: fi(p.lon), vis: fi(p.lon) }));
    fichas.sort((a, b) => a.real - b.real);
    for (let vuelta = 0; vuelta < 300; vuelta++) {
      let movido = false;
      for (let i = 0; i < fichas.length; i++) {
        const a = fichas[i], b = fichas[(i + 1) % fichas.length];
        if (a === b) continue;
        const pa = punto(radioFicha(a.vis), a.vis), pb = punto(radioFicha(b.vis), b.vis);
        const dist = Math.hypot(pa[0] - pb[0], pa[1] - pb[1]);
        if (dist < 25) {
          const giro = Math.max(0.3, (25 - dist) / (radioFicha(a.vis) + radioFicha(b.vis)) * 57.3);
          a.vis -= giro; b.vis += giro; movido = true;
        }
      }
      if (!movido) break;
    }
    let marcas = '', discos = '', simbolos = '';
    fichas.forEach((f) => {
      const p = punto(radioFicha(f.vis), f.vis), color = f.id === 'lilith' ? '#FF9CB5' : ORO;
      marcas += `M${xy(int(f.real), f.real)} L${xy(int(f.real) - 7, f.real)} `;
      discos += circulo(p, 11, `fill="${NEGRO}" stroke="${color}" stroke-width="1.5"`);
      simbolos += `<text class="${f.id === 'lilith' ? 'rosa' : ''}" ${en(p)}>${glifo(f.id)}</text>`;
    });
    s += `<path fill="none" stroke="${ORO}" stroke-width="1.5" d="${marcas}"/>${discos}<g class="r-fichas">${simbolos}</g>`;

    // Luna: esfera mitad plateada, mitad negra, sobre su mano.
    const fs = fi(sol.lon), fl = fi(luna.lon);
    const solFuera = ext(fs) + 45 <= R.placa;
    const juntos = Math.abs(A.n360(fs - fl + 180) - 180) < 14;
    const rSol = solFuera ? ext(fs) + 24 : medio(fs);
    const lunaFuera = ext(fl) + 31 <= R.placa;
    // En luna nueva el Sol y la Luna caen juntos: uno va fuera del anillo y la otra sobre él o más adentro.
    const rLuna = !juntos ? (lunaFuera ? ext(fl) + 18 : medio(fl))
      : solFuera ? medio(fl) : (lunaFuera ? ext(fl) + 18 : Math.max(int(fl) - 44, R.tierra + 15));
    const pl = punto(rLuna, fl);
    s += `<path d="M${xy(R.tierra, fl)} L${xy(R.placa - 10, fl)}" stroke="#DADDE6" stroke-width="2.5" stroke-linecap="round"/>
      <g transform="translate(${pl[0].toFixed(1)} ${pl[1].toFixed(1)})"><circle r="11" fill="#DADDE6" stroke="${NEGRO}"/><path d="M0 -11 A11 11 0 0 1 0 11 Z" fill="${NEGRO}"/></g>`;

    // Sol: mano dorada con su punta hacia el anillo de las horas.
    const ps = punto(rSol, fs), a = fs * Math.PI / 180;
    const v = [Math.sin(a), Math.cos(a)];
    const base = punto(R.placa - 10, fs), punta = punto(R.placa + 6, fs);
    s += `<path d="M${xy(R.tierra, fs)} L${xy(R.placa - 10, fs)}" stroke="${oro}" stroke-width="3" stroke-linecap="round"/>
      <polygon fill="${oro}" points="${punta[0].toFixed(1)},${punta[1].toFixed(1)} ${(base[0] + 6 * v[0]).toFixed(1)},${(base[1] + 6 * v[1]).toFixed(1)} ${(base[0] - 6 * v[0]).toFixed(1)},${(base[1] - 6 * v[1]).toFixed(1)}"/>
      <g transform="translate(${ps[0].toFixed(1)} ${ps[1].toFixed(1)})" stroke="${oro}" stroke-width="2.5" stroke-linecap="round">
        <path d="M0 -15 L0 -21 M10.6 -10.6 L14.8 -14.8 M15 0 L21 0 M10.6 10.6 L14.8 14.8 M0 15 L0 21 M-10.6 10.6 L-14.8 14.8 M-15 0 L-21 0 M-10.6 -10.6 L-14.8 -14.8"/>
        <circle r="11" fill="${oro}" stroke="${NEGRO}" stroke-width="1"/></g>`;

    // La Tierra en el centro.
    s += `<circle cx="320" cy="320" r="${R.tierra}" fill="url(#${id}tierra)" stroke="${oro}" stroke-width="2"/>
      <g fill="none" stroke="${ORO}" opacity=".7"><ellipse cx="320" cy="320" rx="16" ry="36"/><ellipse cx="320" cy="320" rx="36" ry="12"/></g>
      <g class="r-horas">`;

    // Anillo de las 24 horas. Se gira lo justo para que la mano del Sol señale la hora solar
    // real del nacimiento (el mediodía queda hacia el Medio Cielo). Sin hora, mediodía arriba.
    const giro = carta.horaSolar == null ? 0 : (90 - fs) - 15 * (carta.horaSolar - 12);
    for (let k = 0; k < 24; k++) {
      const grados = 15 * k + giro, g = grados * Math.PI / 180;
      const x = (R.C + 247 * Math.sin(g)).toFixed(1), y = (R.C - 247 * Math.cos(g)).toFixed(1);
      s += `<text x="${x}" y="${y}" transform="rotate(${grados.toFixed(1)} ${x} ${y})">${ROMANOS[k % 12]}</text>`;
    }
    s += '</g>';

    // Borde negro: las doce casas y los cuatro ángulos.
    if (carta.casas) {
      const c = carta.casas.cuspides, mc = carta.casas.mc;
      d = '';
      for (let i = 1; i <= 12; i++) d += `M${xy(R.casas, fi(c[i]))} L${xy(R.borde, fi(c[i]))} `;
      s += `<path fill="none" stroke="${ORO}" stroke-width="1.5" d="${d}"/><g class="r-casas">`;
      for (let i = 1; i <= 12; i++) {
        const mitad = c[i] + A.n360(c[i % 12 + 1] - c[i]) / 2;
        s += `<text ${en(punto(281, fi(mitad)))}>${i}</text>`;
      }
      s += '</g><g class="r-angulos">';
      [['AC', asc], ['DC', asc + 180], ['MC', mc], ['IC', mc + 180]].forEach((e) => {
        s += `<text ${en(punto(273, fi(e[1]) - 3.4))}>${e[0]}</text>`;
      });
      s += '</g>';
    }
    return s + '</svg>';
  }

  g.Rueda = { dibujar: rueda };
})(window);
