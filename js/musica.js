/* Carta Astral — música de fondo.
 * Las melodías no son archivos: el sonido se genera en el momento, nota por nota,
 * así que no pesa nada ni tiene derechos de autor, y nunca se repite igual.
 * También puede tocar música propia elegida del equipo (no se guarda ni se sube a ningún sitio).
 */
(function (g) {
  'use strict';

  const CLAVE = 'cartaAstral.musica';
  const elegir = (lista) => lista[Math.floor(Math.random() * lista.length)];

  // ---------- Ladrillos de sonido ----------

  // Una nota suave: entra poco a poco, se sostiene y se apaga sola.
  // o: { f (frecuencia), t (cuándo), dur, vol, tipo, ataque, caida, vibrato, desde (resbala desde otra nota) }
  function tono(ctx, salida, o) {
    const osc = ctx.createOscillator(), amp = ctx.createGain();
    const fin = o.t + o.dur;
    const ataque = Math.min(o.ataque || 0.3, o.dur / 2), caida = Math.min(o.caida || 1.5, o.dur - ataque);
    osc.type = o.tipo || 'sine';
    if (o.desde) {
      osc.frequency.setValueAtTime(o.desde, o.t);
      osc.frequency.exponentialRampToValueAtTime(o.f, o.t + 0.14);
    } else {
      osc.frequency.setValueAtTime(o.f, o.t);
    }
    amp.gain.setValueAtTime(0.0001, o.t);
    amp.gain.exponentialRampToValueAtTime(o.vol, o.t + ataque);
    amp.gain.setValueAtTime(o.vol, fin - caida);
    amp.gain.exponentialRampToValueAtTime(0.0001, fin);
    if (o.vibrato) {
      const temblor = ctx.createOscillator(), hondura = ctx.createGain();
      temblor.frequency.value = 5;
      hondura.gain.setValueAtTime(0, o.t);
      hondura.gain.linearRampToValueAtTime(o.f * 0.004, o.t + ataque + 0.5);
      temblor.connect(hondura); hondura.connect(osc.frequency);
      temblor.start(o.t); temblor.stop(fin + 0.1);
    }
    osc.connect(amp); amp.connect(salida);
    osc.start(o.t); osc.stop(fin + 0.1);
  }

  // Ruido de aire para el soplo de la flauta: se genera una vez por cada salida de sonido.
  const ruidos = new WeakMap();
  function aire(ctx) {
    if (!ruidos.has(ctx)) {
      const n = ctx.sampleRate * 2, memoria = ctx.createBuffer(1, n, ctx.sampleRate), datos = memoria.getChannelData(0);
      for (let i = 0; i < n; i++) datos[i] = Math.random() * 2 - 1;
      ruidos.set(ctx, memoria);
    }
    return ruidos.get(ctx);
  }

  // Una nota de flauta de bambú: varios armónicos, un soplo de aire al atacar, la afinación
  // que sube un pelo al entrar y un temblor que aparece cuando la nota ya está sonando.
  // o: { f, t, dur, vol, desde (resbala desde la nota anterior) }
  function flauta(ctx, salida, o) {
    const fin = o.t + o.dur, cuerpo = ctx.createGain();
    const subida = Math.min(0.3, o.dur * 0.35), caida = Math.min(0.35, o.dur * 0.4);
    cuerpo.gain.setValueAtTime(0.0001, o.t);
    cuerpo.gain.exponentialRampToValueAtTime(o.vol * 0.75, o.t + 0.06);
    cuerpo.gain.linearRampToValueAtTime(o.vol, o.t + subida);
    cuerpo.gain.setValueAtTime(o.vol, fin - caida);
    cuerpo.gain.exponentialRampToValueAtTime(0.0001, fin);
    cuerpo.connect(salida);

    const temblor = ctx.createOscillator(), hondura = ctx.createGain();
    temblor.frequency.value = 5.2;
    hondura.gain.setValueAtTime(0, o.t);
    hondura.gain.setValueAtTime(0, o.t + 0.3);
    hondura.gain.linearRampToValueAtTime(o.dur > 0.9 ? 11 : 0, o.t + 0.8); // en centésimas de tono
    temblor.connect(hondura);
    temblor.start(o.t); temblor.stop(fin + 0.1);

    [[1, 1], [2, 0.30], [3, 0.11], [4, 0.045]].forEach((armonico) => {
      const osc = ctx.createOscillator(), parte = ctx.createGain();
      if (o.desde) {
        osc.frequency.setValueAtTime(o.desde * armonico[0], o.t);
        osc.frequency.exponentialRampToValueAtTime(o.f * armonico[0], o.t + 0.11);
      } else {
        osc.frequency.setValueAtTime(o.f * armonico[0], o.t);
        osc.detune.setValueAtTime(-35, o.t);
        osc.detune.linearRampToValueAtTime(0, o.t + 0.07);
      }
      parte.gain.value = armonico[1];
      hondura.connect(osc.detune);
      osc.connect(parte); parte.connect(cuerpo);
      osc.start(o.t); osc.stop(fin + 0.1);
    });

    // El soplo: un golpe de aire al empezar y un susurro mientras dura la nota.
    const soplo = ctx.createBufferSource(), paso = ctx.createBiquadFilter(), fuerzaAire = ctx.createGain();
    soplo.buffer = aire(ctx); soplo.loop = true;
    paso.type = 'bandpass'; paso.frequency.value = Math.min(o.f * 3, 4200); paso.Q.value = 0.7;
    fuerzaAire.gain.setValueAtTime(0.0001, o.t);
    fuerzaAire.gain.exponentialRampToValueAtTime(o.vol * 0.42, o.t + 0.03);
    fuerzaAire.gain.exponentialRampToValueAtTime(o.vol * 0.07, o.t + 0.2);
    fuerzaAire.gain.setValueAtTime(o.vol * 0.07, fin - caida);
    fuerzaAire.gain.exponentialRampToValueAtTime(0.0001, fin);
    soplo.connect(paso); paso.connect(fuerzaAire); fuerzaAire.connect(salida);
    soplo.start(o.t, Math.random()); soplo.stop(fin + 0.1);
  }

  // Un «Om» cantado: una voz grave (varias voces casi iguales, como un grupo) que pasa
  // despacio por A, O, U y termina en una M larga con la boca cerrada.
  // La vocal se consigue con filtros que imitan cómo resuena la boca en cada sonido.
  // o: { f, t, dur, vol }
  function canto(ctx, salida, o) {
    const fin = o.t + o.dur, d = o.dur;
    const boca = ctx.createBiquadFilter(), fuerzaVoz = ctx.createGain();
    boca.type = 'lowpass';
    boca.frequency.setValueAtTime(3000, o.t);
    boca.frequency.setValueAtTime(3000, o.t + 0.5 * d);
    boca.frequency.exponentialRampToValueAtTime(430, o.t + 0.66 * d); // la boca se cierra: llega la M
    fuerzaVoz.gain.setValueAtTime(0.0001, o.t);
    fuerzaVoz.gain.exponentialRampToValueAtTime(o.vol, o.t + 1.1);
    fuerzaVoz.gain.setValueAtTime(o.vol, o.t + 0.5 * d);
    fuerzaVoz.gain.linearRampToValueAtTime(o.vol * 0.8, o.t + 0.66 * d);
    fuerzaVoz.gain.setValueAtTime(o.vol * 0.8, fin - 2.6);
    fuerzaVoz.gain.exponentialRampToValueAtTime(0.0001, fin);
    boca.connect(fuerzaVoz); fuerzaVoz.connect(salida);

    // Resonancias de la boca para A → O → U → M: [frecuencias en cada momento, fuerza]
    const resonancias = [[[680, 480, 330, 250], 1], [[1100, 850, 720, 950], 0.45], [[2500, 2500, 2500, 2500], 0.12]].map((r) => {
      const filtro = ctx.createBiquadFilter(), parte = ctx.createGain();
      filtro.type = 'bandpass'; filtro.Q.value = 6;
      filtro.frequency.setValueAtTime(r[0][0], o.t);
      filtro.frequency.linearRampToValueAtTime(r[0][1], o.t + 0.25 * d);
      filtro.frequency.linearRampToValueAtTime(r[0][2], o.t + 0.5 * d);
      filtro.frequency.linearRampToValueAtTime(r[0][3], o.t + 0.64 * d);
      parte.gain.value = r[1];
      filtro.connect(parte); parte.connect(boca);
      return filtro;
    });

    const temblor = ctx.createOscillator(), hondura = ctx.createGain();
    temblor.frequency.value = 4.6;
    hondura.gain.setValueAtTime(0, o.t + 1.5);
    hondura.gain.linearRampToValueAtTime(7, o.t + 3.2);
    temblor.connect(hondura);
    temblor.start(o.t); temblor.stop(fin + 0.1);

    [-8, 0, 7].forEach((desafinado) => {
      const voz = ctx.createOscillator(), parte = ctx.createGain();
      voz.type = 'sawtooth'; voz.frequency.value = o.f; voz.detune.value = desafinado;
      hondura.connect(voz.detune);
      parte.gain.value = 0.33;
      voz.connect(parte);
      resonancias.forEach((filtro) => parte.connect(filtro));
      voz.start(o.t); voz.stop(fin + 0.1);
    });
    // El zumbido del pecho, que es lo que más se oye en la M final.
    const pecho = ctx.createOscillator(), partePecho = ctx.createGain();
    pecho.frequency.value = o.f; partePecho.gain.value = 0.3;
    hondura.connect(pecho.detune);
    pecho.connect(partePecho); partePecho.connect(fuerzaVoz);
    pecho.start(o.t); pecho.stop(fin + 0.1);
  }

  // Eco de sala grande, para que todo suene lejano y tranquilo.
  function sala(ctx, segundos) {
    const n = Math.floor(ctx.sampleRate * segundos), memoria = ctx.createBuffer(2, n, ctx.sampleRate);
    for (let canal = 0; canal < 2; canal++) {
      const datos = memoria.getChannelData(canal);
      for (let i = 0; i < n; i++) datos[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3);
    }
    const eco = ctx.createConvolver();
    eco.buffer = memoria;
    return eco;
  }

  function montar(ctx, volumen) {
    const entrada = ctx.createGain(), seco = ctx.createGain(), mojado = ctx.createGain();
    const maestro = ctx.createGain(), limite = ctx.createDynamicsCompressor(), eco = sala(ctx, 3);
    seco.gain.value = 0.75; mojado.gain.value = 0.55; maestro.gain.value = volumen;
    entrada.connect(seco); seco.connect(maestro);
    entrada.connect(eco); eco.connect(mojado); mojado.connect(maestro);
    maestro.connect(limite); limite.connect(ctx.destination);
    return { entrada: entrada, maestro: maestro };
  }

  const VOLUMEN_OM = 0.27;

  // Todas las melodías van afinadas con el la en 432 Hz (lo habitual es 440 Hz).
  const LA = 432;
  const la432 = (f) => f * LA / 440;

  // ---------- Las melodías ----------
  // Cada una devuelve una función que programa las notas que faltan hasta el instante pedido.

  const PISTAS = {
    gayatri: {
      nombre: 'Gayatri mantra (flauta)',
      crear(ctx, salida) {
        // Entonación védica tradicional del Gayatri mantra (Rigveda 3.62.10), tocada con sonido de flauta.
        // El canto antiguo usa solo tres alturas, marcadas por los acentos del texto:
        // G = grave (anudatta), M = media (udatta), A = aguda (svarita). '-' es un silencio.
        // Cada sílaba dura los pulsos indicados: las largas valen el doble que las cortas.
        const SOL = la432(392.00), PULSO = 0.55;
        const ALTURA = { G: SOL * Math.pow(2, -2 / 12), M: SOL, A: SOL * Math.pow(2, 2 / 12) };
        const CANTO = [
          ['M', 4], ['-', 1],                                                                  // om
          ['M', 2], ['M', 1], ['G', 2], ['A', 2], ['M', 2], ['-', 2],                          // bhur bhu-vah svah
          ['M', 2], ['A', 1], ['G', 1], ['M', 2], ['M', 1], ['A', 2], ['M', 1], ['G', 2], ['-', 1],   // tat sa-vi-tur va-re-ni-yam
          ['M', 2], ['A', 2], ['G', 2], ['M', 2], ['A', 1], ['M', 2], ['M', 1], ['M', 3], ['-', 2],   // bhar-go de-vas-ya dhi-ma-hi
          ['M', 1], ['G', 2], ['M', 2], ['A', 2], ['M', 1], ['G', 2], ['M', 1], ['A', 2], ['M', 3], ['-', 4] // dhi-yo yo nah pra-cho-da-yat
        ];
        // Fondo de tanpura: cuatro cuerdas pulsadas una tras otra (quinta, tónica, tónica, tónica grave).
        const TANPURA = [146.83, 196.00, 196.00, 98.00].map(la432), ENTRE_CUERDAS = 1.15;
        const suave = ctx.createBiquadFilter();
        suave.type = 'lowpass'; suave.frequency.value = 1300; suave.connect(salida);
        let sig = ctx.currentTime + 3, cuerda = ctx.currentTime + 0.3, c = 0, i = 0, anterior = 0;
        return (hasta) => {
          const ahora = ctx.currentTime;
          if (cuerda < ahora) cuerda = ahora + 0.1;
          if (sig < ahora) sig = ahora + 0.2;
          while (cuerda < hasta) {
            tono(ctx, suave, { f: TANPURA[c % 4], t: cuerda, dur: 4.6, vol: 0.02, tipo: 'sawtooth', ataque: 0.02, caida: 4.58 });
            cuerda += ENTRE_CUERDAS; c++;
          }
          while (sig < hasta) {
            const paso = CANTO[i % CANTO.length], dur = paso[1] * PULSO;
            if (paso[0] === '-') {
              anterior = 0;
            } else {
              const f = ALTURA[paso[0]];
              // La flauta resbala de una nota a la siguiente, como en la música india.
              flauta(ctx, salida, { f: f, t: sig, dur: dur * 1.05, vol: 0.075, desde: anterior && anterior !== f ? anterior : 0 });
              anterior = f;
            }
            sig += dur; i++;
          }
        };
      }
    },

    om: {
      nombre: 'Om',
      crear(ctx, salida) {
        // El Om cantado una y otra vez, con un silencio para respirar entre uno y otro.
        // Todo está afinado en 432 Hz y sus octavas: la voz canta en 108 Hz (dos octavas por debajo),
        // la tanpura suena en 108, 162 y 216 Hz, y un halo muy suave marca los 216 y los 432 Hz.
        const BASE = LA, VOZ = BASE / 4, TANPURA = [BASE * 3 / 8, BASE / 2, BASE / 2, BASE / 4];
        const suave = ctx.createBiquadFilter();
        suave.type = 'lowpass'; suave.frequency.value = 1300; suave.connect(salida);
        let sig = ctx.currentTime + 1.5, cuerda = ctx.currentTime + 0.3, c = 0;
        return (hasta) => {
          const ahora = ctx.currentTime;
          if (cuerda < ahora) cuerda = ahora + 0.1;
          if (sig < ahora) sig = ahora + 0.5;
          while (cuerda < hasta) {
            tono(ctx, suave, { f: TANPURA[c % 4], t: cuerda, dur: 4.6, vol: 0.013, tipo: 'sawtooth', ataque: 0.02, caida: 4.58 });
            cuerda += 1.15; c++;
          }
          while (sig < hasta + 2) {
            canto(ctx, salida, { f: VOZ, t: sig, dur: 11, vol: VOLUMEN_OM });
            tono(ctx, salida, { f: BASE / 2, t: sig + 0.4, dur: 10, vol: 0.022, ataque: 3, caida: 4 });
            tono(ctx, salida, { f: BASE, t: sig + 0.4, dur: 10, vol: 0.012, ataque: 3.5, caida: 4.5 });
            sig += 14.5;
          }
        };
      }
    },

    cuencos: {
      nombre: 'Cuencos',
      crear(ctx, salida) {
        // Cuencos que suenan de vez en cuando y se apagan despacio, sobre un fondo grave muy suave.
        const BASES = [196.00, 261.63, 293.66, 392.00, 523.25].map(la432);
        let sig = ctx.currentTime + 0.8, bordon = ctx.currentTime;
        return (hasta) => {
          const ahora = ctx.currentTime;
          if (bordon < ahora) bordon = ahora;
          if (sig < ahora) sig = ahora + 0.2;
          while (bordon < hasta + 2) {
            [[65.41, 0.035], [98.00, 0.022]].forEach((v) =>
              tono(ctx, salida, { f: la432(v[0]), t: bordon, dur: 16, vol: v[1], ataque: 5, caida: 6 }));
            bordon += 10;
          }
          while (sig < hasta) {
            const f = elegir(BASES), largo = 9 + Math.random() * 5;
            [[1, 0.11], [2.76, 0.035], [5.4, 0.012]].forEach((parcial) => {
              const dur = largo / Math.sqrt(parcial[0]);
              // Dos notas casi iguales producen el latido lento típico de un cuenco.
              tono(ctx, salida, { f: f * parcial[0], t: sig, dur: dur, vol: parcial[1], ataque: 0.015, caida: dur });
              tono(ctx, salida, { f: f * parcial[0] + 0.8, t: sig, dur: dur, vol: parcial[1] * 0.6, ataque: 0.015, caida: dur });
            });
            sig += 3.5 + Math.random() * 4.5;
          }
        };
      }
    },

    luna: {
      nombre: 'Claro de luna (Beethoven)',
      crear(ctx, salida) {
        // Primeros compases de la sonata «Claro de luna» (1801, dominio público), tocados nota a nota.
        // Las notas van en números MIDI (60 = do central). Cada compás tiene cuatro tresillos.
        const frecuencia = (midi) => LA * Math.pow(2, (midi - 69) / 12);
        const NOTA = 0.44, TIEMPO = 3 * NOTA, COMPAS = 4 * TIEMPO;
        const COMPASES = [
          { bajo: [[[37, 49], 0, 4]], tresillos: [[56, 61, 64], [56, 61, 64], [56, 61, 64], [56, 61, 64]] },
          { bajo: [[[35, 47], 0, 4]], tresillos: [[56, 61, 64], [56, 61, 64], [56, 61, 64], [56, 61, 64]] },
          { bajo: [[[33, 45], 0, 2], [[30, 42], 2, 2]], tresillos: [[57, 61, 64], [57, 61, 64], [57, 62, 66], [57, 62, 66]] },
          { bajo: [[[32, 44], 0, 2], [[32, 44], 2, 2]], tresillos: [[56, 60, 66], [56, 61, 64], [56, 61, 63], [54, 60, 63]] },
          { bajo: [[[37, 44, 49], 0, 4]], tresillos: [[56, 61, 64], [56, 61, 64], [56, 61, 64], [56, 61, 64]],
            melodia: [[68, 3, 0.75], [68, 3.75, 0.25]] }
        ];
        // Sonido de piano suave: entra de golpe y se apaga despacio, como con el pedal pisado.
        const tecla = (midi, t, dur, vol) => {
          const f = frecuencia(midi);
          tono(ctx, salida, { f: f, t: t, dur: dur, vol: vol, tipo: 'triangle', ataque: 0.012, caida: dur });
          tono(ctx, salida, { f: f * 2, t: t, dur: dur * 0.6, vol: vol * 0.18, ataque: 0.012, caida: dur * 0.6 });
        };
        let compas = ctx.currentTime + 0.5, n = 0;
        return (hasta) => {
          if (compas < ctx.currentTime) compas = ctx.currentTime + 0.2;
          while (compas < hasta) {
            const c = COMPASES[n % COMPASES.length];
            c.bajo.forEach((b) => b[0].forEach((m) => tecla(m, compas + b[1] * TIEMPO, b[2] * TIEMPO + 1.5, 0.075)));
            c.tresillos.forEach((grupo, i) => grupo.forEach((m, j) => tecla(m, compas + i * TIEMPO + j * NOTA, 2.6, 0.050)));
            (c.melodia || []).forEach((m) => tecla(m[0], compas + m[1] * TIEMPO, m[2] * TIEMPO + 1.2, 0.095));
            // Al volver a empezar, la melodía descansa en su nota larga.
            if (n > 0 && n % COMPASES.length === 0) tecla(68, compas, 3 * TIEMPO, 0.095);
            compas += COMPAS; n++;
          }
        };
      }
    },

    noche: {
      nombre: 'Noche serena',
      crear(ctx, salida) {
        // Acordes lentos que se funden uno en otro, con algún destello agudo.
        const ACORDES = [[110.00, 164.81, 246.94, 261.63, 392.00], [87.31, 130.81, 220.00, 329.63],
          [130.81, 196.00, 329.63, 493.88], [98.00, 146.83, 220.00, 293.66]];
        const DESTELLOS = [880.00, 1046.50, 1174.66, 1318.51, 1567.98];
        const filtro = ctx.createBiquadFilter();
        filtro.type = 'lowpass'; filtro.frequency.value = 900; filtro.connect(salida);
        let acorde = ctx.currentTime, n = 0, destello = ctx.currentTime + 6;
        return (hasta) => {
          const ahora = ctx.currentTime;
          if (acorde < ahora) acorde = ahora;
          if (destello < ahora) destello = ahora + 1;
          while (acorde < hasta + 2) {
            ACORDES[n % ACORDES.length].forEach((f) => [-3, 3].forEach((centesimas) =>
              tono(ctx, filtro, { f: la432(f) * Math.pow(2, centesimas / 1200), t: acorde, dur: 18, vol: 0.03, tipo: 'triangle', ataque: 5, caida: 6 })));
            acorde += 12; n++;
          }
          while (destello < hasta) {
            tono(ctx, salida, { f: la432(elegir(DESTELLOS)), t: destello, dur: 3.5, vol: 0.022, ataque: 0.05, caida: 3.4 });
            destello += 5 + Math.random() * 7;
          }
        };
      }
    }
  };

  // ---------- Reproductor ----------

  const estado = { melodia: 'gayatri', volumen: 0.5, encendida: false };
  let ctx = null, maestro = null, reloj = null, audio = null, propias = [], indice = 0, desdeElPrincipio = true;

  // El volumen del control (0 a 1) se traduce a la fuerza real del sonido.
  const fuerza = (v) => 2.2 * v * v;

  function apagar() {
    if (reloj) { clearInterval(reloj); reloj = null; }
    if (ctx) {
      const viejo = ctx;
      try { maestro.gain.setTargetAtTime(0, viejo.currentTime, 0.12); } catch (e) { /* ya cerrado */ }
      setTimeout(() => { viejo.close(); }, 700);
      ctx = null; maestro = null;
    }
    if (audio) audio.pause();
    estado.encendida = false;
  }

  function tocarPropia(i) {
    if (!audio) {
      audio = new Audio();
      audio.addEventListener('ended', () => tocarPropia((indice + 1) % propias.length));
    }
    indice = i;
    audio.src = propias[i].url;
    audio.volume = Math.min(1, estado.volumen);
    audio.play().catch(() => { /* el navegador no dejó sonar */ });
  }

  function encender() {
    apagar();
    if (estado.melodia === 'propia') {
      if (!propias.length) return false;
      // Si estaba en pausa, sigue donde se quedó; si se eligieron canciones nuevas, empieza por la primera.
      if (audio && audio.src && !desdeElPrincipio) audio.play().catch(() => { /* el navegador no dejó sonar */ });
      else tocarPropia(0);
      desdeElPrincipio = false;
    } else {
      const Contexto = g.AudioContext || g.webkitAudioContext;
      if (!Contexto) return false;
      ctx = new Contexto();
      const m = montar(ctx, fuerza(estado.volumen));
      maestro = m.maestro;
      const programar = PISTAS[estado.melodia].crear(ctx, m.entrada);
      const paso = () => programar(ctx.currentTime + 4);
      paso();
      reloj = setInterval(paso, 1000);
    }
    estado.encendida = true;
    return true;
  }

  function ponerVolumen(v) {
    estado.volumen = v;
    if (maestro) maestro.gain.setTargetAtTime(fuerza(v), ctx.currentTime, 0.05);
    if (audio) audio.volume = Math.min(1, v);
  }

  function cargarPropias(archivos) {
    propias.forEach((p) => URL.revokeObjectURL(p.url));
    propias = Array.from(archivos).map((a) => ({ nombre: a.name, url: URL.createObjectURL(a) }));
    desdeElPrincipio = true;
  }

  // Para pruebas: genera unos segundos de una melodía sin que suene y mide su volumen.
  function probar(id, segundos) {
    const Fuera = g.OfflineAudioContext || g.webkitOfflineAudioContext;
    const c = new Fuera(2, 44100 * segundos, 44100);
    PISTAS[id].crear(c, montar(c, fuerza(estado.volumen)).entrada)(segundos);
    return c.startRendering().then((sonido) => {
      const d = sonido.getChannelData(0);
      let pico = 0, suma = 0;
      for (let i = 0; i < d.length; i++) { pico = Math.max(pico, Math.abs(d[i])); suma += d[i] * d[i]; }
      return { pico: +pico.toFixed(3), media: +Math.sqrt(suma / d.length).toFixed(4) };
    });
  }

  g.Musica = { PISTAS: PISTAS, estado: estado, encender: encender, apagar: apagar, volumen: ponerVolumen, probar: probar };

  // ---------- Controles en la página ----------

  const boton = document.getElementById('musica-boton');
  if (!boton) return;
  const lista = document.getElementById('musica-melodia'), barra = document.getElementById('musica-volumen');
  const archivos = document.getElementById('musica-archivos'), aviso = document.getElementById('musica-aviso');

  let guardado = null;
  try { guardado = JSON.parse(localStorage.getItem(CLAVE)); } catch (e) { /* nada guardado */ }
  if (guardado && PISTAS[guardado.melodia]) estado.melodia = guardado.melodia;
  if (guardado && guardado.volumen >= 0 && guardado.volumen <= 1) estado.volumen = guardado.volumen;
  // La música empieza encendida, salvo que la persona la haya pausado la última vez.
  const quiereMusica = !(guardado && guardado.encendida === false);

  const guardar = () => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify({
        melodia: PISTAS[estado.melodia] ? estado.melodia : 'gayatri', volumen: estado.volumen, encendida: estado.encendida
      }));
    } catch (e) { /* sin almacenamiento */ }
  };

  const ICONO_PAUSA = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
  const ICONO_TOCAR = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>';

  function pintar() {
    // El texto va aparte para poder esconderlo en pantallas muy estrechas (queda solo el icono).
    boton.innerHTML = (estado.encendida ? ICONO_PAUSA : ICONO_TOCAR) +
      `<span class="musica-texto">${estado.encendida ? 'Pausar música' : 'Poner música'}</span>`;
    boton.setAttribute('aria-pressed', String(estado.encendida));
    lista.value = estado.melodia;
    aviso.textContent = estado.encendida && ctx && ctx.state === 'suspended'
      ? 'Sonará en cuanto hagas clic en cualquier parte.'
      : estado.melodia === 'propia' && propias.length ? 'Suena: ' + propias.map((p) => p.nombre).join(', ') : '';
  }

  // Los navegadores no dejan sonar nada hasta el primer clic o tecla: si la música
  // quedó en espera, arranca en ese momento.
  function despertar() {
    document.removeEventListener('pointerdown', despertar);
    document.removeEventListener('keydown', despertar);
    if (ctx && ctx.state === 'suspended') ctx.resume().then(pintar, pintar);
  }

  lista.innerHTML = Object.keys(PISTAS).map((id) => `<option value="${id}">${PISTAS[id].nombre}</option>`).join('') +
    '<option value="propia">Mi propia música…</option>';
  barra.value = Math.round(estado.volumen * 100);
  if (quiereMusica && encender() && ctx && ctx.state !== 'running') {
    document.addEventListener('pointerdown', despertar);
    document.addEventListener('keydown', despertar);
  }
  pintar();
  if (ctx) ctx.addEventListener('statechange', pintar);

  boton.addEventListener('click', () => {
    if (estado.encendida) apagar();
    else if (estado.melodia === 'propia' && !propias.length) archivos.click();
    else if (!encender()) aviso.textContent = 'Este navegador no puede reproducir la música.';
    guardar(); pintar();
  });
  lista.addEventListener('change', () => {
    estado.melodia = lista.value;
    if (estado.melodia === 'propia' && !propias.length) archivos.click();
    else if (estado.encendida) encender();
    guardar(); pintar();
  });
  barra.addEventListener('input', () => { ponerVolumen(barra.value / 100); guardar(); });
  const mas = document.getElementById('musica-mas'), opciones = document.getElementById('musica-opciones');
  mas.addEventListener('click', () => {
    opciones.hidden = !opciones.hidden;
    mas.setAttribute('aria-expanded', String(!opciones.hidden));
  });
  archivos.addEventListener('change', () => {
    if (!archivos.files.length) return;
    cargarPropias(archivos.files);
    estado.melodia = 'propia';
    encender();
    pintar();
  });
})(window);
