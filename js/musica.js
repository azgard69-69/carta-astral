/* Carta Astral — música de fondo.
 * Las melodías no son archivos: el sonido se genera en el momento, nota por nota, así que no pesa
 * nada. Todas son de dominio público (las de Satie y Vivaldi, con notas de las ediciones del Mutopia Project).
 * También puede tocar música propia del equipo, afinada a 432 Hz si se quiere; se guarda solo en ese
 * navegador y no se sube a ningún sitio.
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

  // ---------- Partituras ----------

  // Número MIDI de una nota escrita como «F#5», «Bb3» o «C4» (60 = do central).
  const PASOS = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function nota(texto) {
    const m = /^([A-G])(#|b)?(-?\d)$/.exec(texto);
    return 12 * (Number(m[3]) + 1) + PASOS[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
  }
  const hz = (midi) => LA * Math.pow(2, (midi - 69) / 12);

  // Escribe una voz en la lista de eventos. «texto»: notas separadas por espacios, «:n» para durar n
  // unidades (1 por omisión), «*n» para repetir la nota n veces, «r» para un silencio y «+» para
  // tocar varias a la vez («C4+E4+A4»). Devuelve dónde termina.
  function voz(eventos, texto, desde, vol, extra) {
    let p = desde;
    texto.trim().split(/\s+/).forEach((x) => {
      const rep = /\*(\d+)$/.exec(x), veces = rep ? Number(rep[1]) : 1;
      const [n, d] = x.replace(/\*\d+$/, '').split(':'), dur = Number(d || 1);
      for (let k = 0; k < veces; k++) {
        if (n !== 'r') eventos.push(Object.assign({ b: p, d: dur, m: n.split('+').map(nota), v: vol }, extra || {}));
        p += dur;
      }
    });
    return p;
  }

  // Toca en bucle una lista de eventos; «unidad» son los segundos de cada unidad de tiempo y «largo»
  // las unidades que dura una vuelta. Si la pestaña se durmió y se quedó atrás, sigue desde ahora.
  function secuencia(ctx, eventos, unidad, largo, tocar) {
    eventos.sort((x, y) => x.b - y.b);
    let ciclo = ctx.currentTime + 0.5, i = 0;
    return (hasta) => {
      for (;;) {
        if (i >= eventos.length) { ciclo += largo * unidad; i = 0; }
        const e = eventos[i];
        let t = ciclo + e.b * unidad;
        if (t < ctx.currentTime) { ciclo += ctx.currentTime + 0.2 - t; t = ciclo + e.b * unidad; }
        if (t >= hasta) return;
        tocar(e, t);
        i++;
      }
    };
  }

  // Piano suave, como con el pedal pisado: entra de golpe y se apaga despacio.
  function piano(ctx, salida, midi, t, dur, vol) {
    const f = hz(midi);
    tono(ctx, salida, { f: f, t: t, dur: dur, vol: vol, tipo: 'triangle', ataque: 0.012, caida: dur });
    tono(ctx, salida, { f: f * 2, t: t, dur: dur * 0.6, vol: vol * 0.18, ataque: 0.012, caida: dur * 0.6 });
  }

  // Cuerda frotada (violín, viola, chelo): una onda rica en armónicos, suavizada con un filtro;
  // dos voces casi iguales para que suene a grupo, y algo de vibrato en las notas largas.
  function cuerda(ctx, salida, midi, t, dur, vol) {
    const f = hz(midi), fin = t + dur, filtro = ctx.createBiquadFilter(), amp = ctx.createGain();
    filtro.type = 'lowpass'; filtro.frequency.value = Math.min(f * 5, 4500); filtro.Q.value = 0.7;
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.012, dur / 3));
    amp.gain.setValueAtTime(vol, Math.max(t + 0.013, fin - 0.04));
    amp.gain.exponentialRampToValueAtTime(0.0001, fin + 0.03);
    filtro.connect(amp); amp.connect(salida);
    [-6, 6].forEach((centesimas) => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = f; osc.detune.value = centesimas;
      if (dur > 0.3) {
        const temblor = ctx.createOscillator(), hondura = ctx.createGain();
        temblor.frequency.value = 5.5; hondura.gain.value = 9;
        temblor.connect(hondura); hondura.connect(osc.detune);
        temblor.start(t); temblor.stop(fin + 0.1);
      }
      osc.connect(filtro); osc.start(t); osc.stop(fin + 0.1);
    });
  }

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

    satie: {
      nombre: 'Gymnopédie n.º 1 (Satie)',
      crear(ctx, salida) {
        // Erik Satie, 1888 (dominio público). Notas de la edición del Mutopia Project (dominio público).
        // La pieza completa, con su repetición: 78 compases de tres pulsos, «lento y doloroso».
        const ev = [], PULSO = 0.8;
        const MELODIA = 'r:13 F#5 A5 G5 F#5 C#5 B4 C#5 D5 A4:3 F#4:12 r F#5 A5 G5 F#5 C#5 B4 C#5 D5 A4:3 C#5:3 F#5:3 E4:9 ' +
          'A4 B4 C5 E5 D5 B4 D5 C5 B4 D5:5 D5 E5 F5 G5 A5 C5 D5 E5 D5 B4 D5:5 D5';
        const FINALES = [
          'G5:3 F#5:3 B4 A4 B4 C#5 D5 E5 C#5 D5 E5 F#4:3 C4+E4+A4+C5:3 D4+F#4+A4+D5:3',
          'G5:3 F5:3 B4 C5 F5 E5 D5 C5 E5 D5 C5 F4:3 C4+E4+A4+C5:3 D4+F4+A4+D5:3'
        ];
        // Acompañamiento: el bajo en el primer pulso y el acorde en el segundo y el tercero.
        const SOL = ['G2', 'B3+D4+F#4'], RE = ['D2', 'A3+C#4+F#4'];
        const A = [SOL, RE, SOL, RE, SOL, RE, SOL, RE, SOL, RE, SOL, RE, SOL, RE, SOL, RE,
          ['F#2', 'A3+C#4+F#4'], ['B1', 'B3+D4+F#4'], ['E2', 'G3+B3'], ['E2', 'B3+D4+G4'], ['D2', 'F3+A3+D4'],
          ['A1', 'A3+C4+E4'], ['D2', 'G3+B3+E4'], ['D2', 'D3+G3+B3+E4'], ['D2', 'C3+E3+A3+D4'], ['D2', 'C3+F#3+A3+D4'],
          ['D2', 'A3+C4+F4'], ['D2', 'A3+C4+E4'], ['D2', 'D3+G3+B3+E4'], ['D2', 'C3+E3+A3+D4'], ['D2', 'C3+F#3+A3+D4']];
        const ACOMPANA_FINALES = [
          [['E2', 'B3+E4+G4'], ['F#2', 'A3+C#4+F#4'], ['B1', 'B3+D4+F#4'], ['E2', 'C#4+E4+A4'], ['E2', 'A3+C#4+F#4+A4']],
          [['E2', 'B3+E4+G4'], ['E2', 'A3+D4+F4+A4'], ['E2', 'A3+C4+F4'], ['E2', 'C4+E4+A4'], ['E2', 'A3+C4+F4+A4']]
        ];
        let inicio = 0;
        [0, 1].forEach((vuelta) => {
          voz(ev, MELODIA, inicio, 0.1);
          const finales = voz(ev, FINALES[vuelta], inicio + 93, 0.1);
          A.concat(ACOMPANA_FINALES[vuelta]).forEach((c, k) => {
            voz(ev, c[0] + ':3', inicio + 3 * k, 0.07);
            voz(ev, 'r ' + c[1] + ':2', inicio + 3 * k, 0.045);
          });
          // Compás 37: el bajo con una voz interior y dos acordes; 38 y 39: los acordes del final.
          voz(ev, 'E2:3', inicio + 108, 0.07); voz(ev, 'r B2 E3', inicio + 108, 0.05); voz(ev, 'r A3+D4 B3+D4+G4', inicio + 108, 0.045);
          voz(ev, 'A2+G3:3 D2+A2+D3:3', inicio + 111, 0.07);
          inicio = finales;
        });
        return secuencia(ctx, ev, PULSO, inicio + 3, (e, t) =>
          e.m.forEach((m) => piano(ctx, salida, m, t, e.d * PULSO + 1.2, e.v)));
      }
    },

    tormenta: {
      nombre: 'Tormenta del Verano (Vivaldi)',
      crear(ctx, salida) {
        // Antonio Vivaldi, «El verano» de Las cuatro estaciones, tercer movimiento, compases 1 a 28 (1725,
        // dominio público). Notas de la edición del Mutopia Project (licencia CC BY-SA). Unidad: semicorchea.
        const ev = [], SEMI = 0.1, BARRA = 12;
        const VIOLIN = [
          'G4 G3*11', 'F4 G3*11', 'Eb4 G3*11', 'D4 G3*7 G3:2 r:2', 'r:18',
          'D5 D4*11', 'C5 D4*11', 'Bb4 D4*11', 'A4 D4*7 D4:2 r:2',
          'r D5 C5 Bb4 A4 G4 F#4 E4 D4 C4 Bb3 A3', 'G3*12', 'G3 G5 F5 Eb5 D5 C5 Bb4 A4 G4 F4 Eb4 D4',
          'C4*12', 'C4 Bb5 A5 G5 F5 Eb5 D5 C5 Bb4 A4 G4 F4', 'Eb4*12', 'Eb4 D6 C6 Bb5 A5 G5 F#5 E5 D5 C5 Bb4 A4',
          'G4*12', 'G4 D6 C6 Bb5 A5 G5 F#5 E5 D5 C5 Bb4 A4', 'G4*12', 'D5 G4 G4 G4 D5 G4 G4 G4 D5 G4 G4 G4',
          'D4 A4 Bb4 C5 D5 E5 F#5 G5 A5:2 r:2', 'r A4 Bb4 C5 D5 E5 F#5 G5 A5:2 r:2',
          'r Bb4 C5 D5 Eb5 F#5 G5 A5 Bb5:2 r:2', 'r D5 E5 F#5 G5 A5 Bb5 C6 D6:2 r:2', 'r D5 E5 F#5 G5 A5 Bb5 C6 D6:2 r:2',
          'r A4 Bb4 C5 D5 E5 F#5 G5 A5:2 r:2', 'r Bb4 C5 D5 Eb5 F#5 G5 A5 Bb5:2 r:2', 'r D5 E5 F#5 G5 A5 Bb5 C6 D6:2 r:2'
        ];
        const BAJO = ['r:12', 'G2:2*6', 'G2:2*6', 'C3:2*6', 'C3:2*6', 'Eb2:2*6', 'Eb2:2*6', 'G2:2*6', 'G2:2*6', 'G2:2*6',
          'G2*4 D3 G2*3 D3 G2*3'].concat(Array(8).fill('D2 D3 D2 D3 D2 D3 D2 D3 D2 D3 D2 D3'));
        let p = 0;
        VIOLIN.forEach((compas, k) => {
          const fin = voz(ev, compas, p, 0.05, { violin: true });
          // Al principio toda la orquesta toca el trémolo al unísono: violas y chelos una y dos octavas abajo.
          if (k < 9) {
            voz(ev, compas.replace(/([A-G][#b]?)(\d)/g, (x, n, o) => n + (o - 1)), p, 0.035);
            voz(ev, compas.replace(/([A-G][#b]?)(\d)/g, (x, n, o) => n + (o - 2)), p, 0.045);
          } else {
            voz(ev, BAJO[k - 9], p, 0.05);
          }
          p = fin;
        });
        return secuencia(ctx, ev, SEMI, p + 6, (e, t) =>
          e.m.forEach((m) => cuerda(ctx, salida, m, t, e.d * SEMI * (e.violin && e.d > 1 ? 0.95 : 0.9), e.v)));
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

  const estado = { melodia: 'gayatri', volumen: 0.5, encendida: false, a432: true };
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
    afinar();
    sonarPropia();
  }

  // Si el navegador no deja sonar todavía, se intenta de nuevo con el primer clic o tecla.
  function sonarPropia() {
    audio.play().catch(() => {
      if (g.Musica.esperarClic) g.Musica.esperarClic();
    });
  }

  // La música de cada quien suele estar afinada en 440 Hz. Tocada un 1,8 % más despacio y sin corregir
  // el tono, queda en 432 Hz, como las melodías de la app.
  function afinar() {
    if (!audio) return;
    const conservar = !estado.a432;
    audio.preservesPitch = conservar;
    audio.mozPreservesPitch = conservar;
    audio.webkitPreservesPitch = conservar;
    audio.defaultPlaybackRate = audio.playbackRate = estado.a432 ? 432 / 440 : 1;
  }

  // Las canciones propias se guardan en el navegador de este equipo (no se suben a ningún lado),
  // para que sigan ahí la próxima vez que se abra la app.
  function abrirBase() {
    return new Promise((ok, mal) => {
      if (!g.indexedDB) { mal(new Error('sin IndexedDB')); return; }
      const pedido = g.indexedDB.open('cartaAstral', 1);
      pedido.onupgradeneeded = () => pedido.result.createObjectStore('canciones');
      pedido.onsuccess = () => ok(pedido.result);
      pedido.onerror = () => mal(pedido.error);
    });
  }

  function guardarCanciones(lista) {
    return abrirBase().then((db) => new Promise((ok) => {
      const tx = db.transaction('canciones', 'readwrite');
      tx.objectStore('canciones').put(lista.map((a) => ({ nombre: a.name, datos: a })), 'lista');
      tx.oncomplete = tx.onerror = () => { db.close(); ok(); };
    })).catch(() => { /* sin almacenamiento: valen solo esta vez */ });
  }

  function leerCanciones() {
    return abrirBase().then((db) => new Promise((ok) => {
      const pedido = db.transaction('canciones').objectStore('canciones').get('lista');
      pedido.onsuccess = () => { db.close(); ok(pedido.result || []); };
      pedido.onerror = () => { db.close(); ok([]); };
    })).catch(() => []);
  }

  function encender() {
    apagar();
    if (estado.melodia === 'propia') {
      if (!propias.length) return false;
      // Si estaba en pausa, sigue donde se quedó; si se eligieron canciones nuevas, empieza por la primera.
      if (audio && audio.src && !desdeElPrincipio) sonarPropia();
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

  function cargarPropias(archivos, guardarlas) {
    propias.forEach((p) => URL.revokeObjectURL(p.url));
    propias = Array.from(archivos).map((a) => ({ nombre: a.name, url: URL.createObjectURL(a) }));
    desdeElPrincipio = true;
    if (guardarlas) guardarCanciones(Array.from(archivos));
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
  const propia = document.getElementById('musica-propia'), casilla432 = document.getElementById('musica-432');

  let guardado = null;
  try { guardado = JSON.parse(localStorage.getItem(CLAVE)); } catch (e) { /* nada guardado */ }
  if (guardado && (PISTAS[guardado.melodia] || guardado.melodia === 'propia')) estado.melodia = guardado.melodia;
  if (guardado && guardado.a432 === false) estado.a432 = false;
  if (guardado && guardado.volumen >= 0 && guardado.volumen <= 1) estado.volumen = guardado.volumen;
  // La música empieza encendida, salvo que la persona la haya pausado la última vez.
  const quiereMusica = !(guardado && guardado.encendida === false);

  const guardar = () => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify({
        melodia: PISTAS[estado.melodia] || estado.melodia === 'propia' ? estado.melodia : 'gayatri',
        volumen: estado.volumen, encendida: estado.encendida, a432: estado.a432
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
    const enEspera = estado.encendida && ((ctx && ctx.state === 'suspended') || (estado.melodia === 'propia' && audio && audio.paused));
    aviso.textContent = enEspera
      ? 'Sonará en cuanto hagas clic en cualquier parte.'
      : estado.melodia === 'propia' && propias.length ? 'Suena: ' + propias.map((p) => p.nombre).join(', ') : '';
    propia.hidden = estado.melodia !== 'propia';
    casilla432.checked = estado.a432;
  }

  // Los navegadores no dejan sonar nada hasta el primer clic o tecla: si la música
  // quedó en espera, arranca en ese momento.
  function despertar() {
    document.removeEventListener('pointerdown', despertar);
    document.removeEventListener('keydown', despertar);
    if (ctx && ctx.state === 'suspended') ctx.resume().then(pintar, pintar);
    if (estado.encendida && estado.melodia === 'propia' && audio && audio.paused) audio.play().then(pintar, pintar);
  }
  g.Musica.esperarClic = () => {
    document.addEventListener('pointerdown', despertar);
    document.addEventListener('keydown', despertar);
    pintar();
  };

  lista.innerHTML = Object.keys(PISTAS).map((id) => `<option value="${id}">${PISTAS[id].nombre}</option>`).join('') +
    '<option value="propia">Mi propia música…</option>';
  barra.value = Math.round(estado.volumen * 100);
  if (quiereMusica && encender() && ctx && ctx.state !== 'running') {
    document.addEventListener('pointerdown', despertar);
    document.addEventListener('keydown', despertar);
  }
  pintar();
  if (ctx) ctx.addEventListener('statechange', pintar);
  // Si la última vez sonaba tu propia música, se recupera del navegador y vuelve a sonar.
  if (estado.melodia === 'propia') {
    leerCanciones().then((guardadas) => {
      if (!guardadas.length) {
        estado.melodia = 'gayatri';
        if (quiereMusica && encender() && ctx && ctx.state !== 'running') g.Musica.esperarClic();
        pintar();
        return;
      }
      cargarPropias(guardadas.map((x) => x.datos), false);
      propias.forEach((p, i) => { p.nombre = guardadas[i].nombre; });
      if (quiereMusica) encender();
      pintar();
    });
  }

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
    cargarPropias(archivos.files, true);
    estado.melodia = 'propia';
    encender();
    guardar(); pintar();
  });
  casilla432.addEventListener('change', () => { estado.a432 = casilla432.checked; afinar(); guardar(); });
  document.getElementById('musica-cambiar').addEventListener('click', () => archivos.click());
})(window);
