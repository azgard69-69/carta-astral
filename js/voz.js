/* Carta Astral — lectura en voz alta con las voces del propio equipo o teléfono.
 * Lee la sección que está a la vista. Mientras habla, la música baja de volumen.
 * Si el equipo no tiene ninguna voz en español, el botón «Escuchar» no aparece.
 */
(function (g) {
  'use strict';

  const sintesis = g.speechSynthesis;
  const Voz = { disponible: false, hablando: false, leer: leer, parar: parar, textosDe: textosDe, alCambiar: null };
  g.Voz = Voz;
  if (!sintesis || !g.SpeechSynthesisUtterance) return;

  let voz = null;

  // Preferencia: español de México y Latinoamérica, luego de España; mejor las voces del propio equipo,
  // que funcionan sin internet.
  function elegirVoz() {
    const puntos = (v) => (/^es[-_](MX|US|419)/i.test(v.lang) ? 4 : /^es[-_]ES/i.test(v.lang) ? 2 : 1) +
      (v.localService ? 2 : 0) + (/natural|enhanced|premium|neural/i.test(v.name) ? 1 : 0);
    const voces = sintesis.getVoices().filter((v) => /^es([-_]|$)/i.test(v.lang));
    voz = voces.sort((a, b) => puntos(b) - puntos(a))[0] || null;
    Voz.disponible = !!voz;
    if (Voz.alCambiar) Voz.alCambiar();
  }
  elegirVoz();
  if (sintesis.addEventListener) sintesis.addEventListener('voiceschanged', elegirVoz);
  else sintesis.onvoiceschanged = elegirVoz;

  // Lo escrito para la vista, dicho para el oído: sin símbolos, con grados y ordinales en palabras.
  const MESES = { ene: 'enero', feb: 'febrero', mar: 'marzo', abr: 'abril', may: 'mayo', jun: 'junio', jul: 'julio',
    ago: 'agosto', sep: 'septiembre', oct: 'octubre', nov: 'noviembre', dic: 'diciembre' };
  function pulir(t) {
    return t
      .replace(/[☀-➿︎️]/g, '')
      .replace(/\b(\d{1,2}) (ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)\b,? ?(\d{4})?/g,
        (x, d, m, a) => d + ' de ' + MESES[m] + (a ? ' de ' + a : ''))
      .replace(/(\d+)°\s?(\d+)′/g, (x, gr, mi) => gr + ' grados ' + Number(mi) + ' minutos')
      .replace(/(\d+)°/g, '$1 grados')
      .replace(/\b1\.er\b/g, 'primer').replace(/\b2\.º/g, 'segundo').replace(/\b3\.er\b/g, 'tercer')
      .replace(/\s*[·›‹]\s*/g, ', ').replace(/,\s*,/g, ',').replace(/\s+/g, ' ').replace(/[\s,]+$/, '').trim();
  }

  // Qué se lee de una sección: títulos, párrafos y renglones, en orden; nada de dibujos, tablas,
  // botones ni notas al pie.
  const BLOQUES = 'h1, h2, h3, p, li, .triada-carta > span, .renglon > span:first-child, .renglon > small, .lista-datos > div, .numero';
  const FUERA = 'svg, table, .acciones, .leyenda, .amplia, .sugerencias, label, [hidden], .triada-ver, .boton, p.nota, .musica';
  function textosDe(el) {
    const res = [];
    el.querySelectorAll(BLOQUES).forEach((b) => {
      if (b.closest(FUERA)) return;
      if (b.parentElement && b.parentElement.closest(BLOQUES)) return; // ya se lee con su bloque
      const t = (b.innerText || b.textContent || '').trim();
      if (t) res.push(t);
    });
    return res;
  }

  // La música baja mientras se habla y vuelve a su volumen al terminar.
  let volumenAntes = null;
  function bajarMusica(bajar) {
    const M = g.Musica;
    if (!M) return;
    if (bajar && volumenAntes === null && M.estado.encendida) { volumenAntes = M.estado.volumen; M.volumen(volumenAntes * 0.3); }
    // Se devuelve aunque la música se haya pausado mientras tanto, para que no quede guardada más baja.
    if (!bajar && volumenAntes !== null) { M.volumen(volumenAntes); volumenAntes = null; }
  }

  function terminar() {
    Voz.hablando = false;
    bajarMusica(false);
    if (Voz.alCambiar) Voz.alCambiar();
  }

  function parar() {
    if (!Voz.hablando) return;
    sintesis.cancel();
    terminar();
  }

  // Lee una lista de textos. Va frase por frase: algunos navegadores cortan las lecturas largas.
  function leer(textos) {
    parar();
    if (!voz) return;
    const frases = [];
    textos.map(pulir).filter(Boolean).forEach((t) => {
      (t.match(/[^.!?;]+[.!?;]*/g) || [t]).forEach((f) => { if (f.trim()) frases.push(f.trim()); });
    });
    if (!frases.length) return;
    Voz.hablando = true;
    bajarMusica(true);
    if (Voz.alCambiar) Voz.alCambiar();
    frases.forEach((f, i) => {
      const u = new g.SpeechSynthesisUtterance(f);
      u.voice = voz; u.lang = voz.lang; u.rate = 0.95;
      if (i === frases.length - 1) u.onend = terminar;
      u.onerror = (e) => { if (e.error !== 'interrupted' && e.error !== 'canceled') terminar(); };
      sintesis.speak(u);
    });
  }
})(window);
