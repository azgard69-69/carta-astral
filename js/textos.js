/* Carta Astral — textos en lenguaje llano para planetas, casas y aspectos.
 * BORRADOR para revisar. Estos textos no vienen de la guía: se pueden editar aquí a mano.
 * Los de Sol, Luna, Ascendente, decanatos, sombras y Lilith siguen saliendo de js/guia.js.
 */
window.TEXTOS = {
  // que: lo que representa · corto: cómo se nombra dentro de una frase
  // mueve y dura: lo que agita cuando pasa por el cielo de hoy y cuánto se nota
  astros: {
    sol: { articulo: 'El Sol', que: 'Tu identidad: quién eres y qué te da vida.', corto: 'tu identidad',
      mueve: 'la vitalidad y la atención', dura: 'unos días' },
    luna: { articulo: 'La Luna', que: 'Tus emociones y lo que necesitas para sentirte en calma.', corto: 'tus emociones',
      mueve: 'el ánimo del momento', dura: 'unas horas' },
    mercurio: { articulo: 'Mercurio', que: 'Tu manera de pensar, hablar y aprender.', corto: 'tu manera de pensar',
      mueve: 'las ideas y las conversaciones', dura: 'un par de días' },
    venus: { articulo: 'Venus', que: 'Tu manera de querer, lo que te gusta y lo que valoras.', corto: 'tu manera de querer',
      mueve: 'los afectos y los gustos', dura: 'unos días' },
    marte: { articulo: 'Marte', que: 'Tu energía, tu deseo y tu forma de pelear por lo que quieres.', corto: 'tu energía',
      mueve: 'el impulso y las ganas de actuar', dura: 'alrededor de una semana' },
    jupiter: { articulo: 'Júpiter', que: 'Dónde creces, confías y tienes suerte.', corto: 'tu confianza',
      mueve: 'las oportunidades', dura: 'varias semanas' },
    saturno: { articulo: 'Saturno', que: 'Tus límites y miedos, y lo que construyes con paciencia.', corto: 'tu sentido del deber',
      mueve: 'las responsabilidades', dura: 'varios meses' },
    urano: { articulo: 'Urano', que: 'Dónde necesitas libertad y rompes las reglas.', corto: 'tu necesidad de libertad',
      mueve: 'los cambios repentinos', dura: 'cerca de un año', generacion: 'unos 7 años' },
    neptuno: { articulo: 'Neptuno', que: 'Tus sueños, tu intuición y tu lado espiritual.', corto: 'tu imaginación',
      mueve: 'la inspiración y la confusión', dura: 'uno o dos años', generacion: 'unos 14 años' },
    pluton: { articulo: 'Plutón', que: 'Tu poder de transformarte y lo que te cuesta soltar.', corto: 'tu poder de transformación',
      mueve: 'las transformaciones profundas', dura: 'uno o dos años', generacion: 'entre 12 y 30 años' },
    lilith: { articulo: 'Lilith', que: 'Lo que reprimes: tu lado más salvaje y tus tabúes.', corto: 'tu lado reprimido',
      mueve: 'lo reprimido', dura: 'unos días' },
    asc: { articulo: 'El Ascendente', que: 'La imagen que das y tu forma de empezar las cosas.', corto: 'tu imagen' },
    mc: { articulo: 'El Medio Cielo', que: 'Tu vocación y el lugar que ocupas ante los demás.', corto: 'tu vocación' }
  },

  casas: {
    1: 'Tu persona: tu cuerpo, tu carácter y la primera impresión que das.',
    2: 'Tu dinero, tus bienes y lo que valoras.',
    3: 'Tu entorno cercano: hermanos, vecinos, estudios básicos y viajes cortos.',
    4: 'Tu hogar, tu familia y tus raíces.',
    5: 'Tu creatividad, los romances, los hijos y la diversión.',
    6: 'Tu trabajo diario, tus rutinas y tu salud.',
    7: 'Tu pareja, tus socios y los acuerdos con otros.',
    8: 'Lo que compartes con otros: intimidad, herencias, crisis y renacimientos.',
    9: 'Los viajes largos, los estudios superiores y tus creencias.',
    10: 'Tu profesión, tus metas y tu reputación.',
    11: 'Tus amistades, los grupos y tus proyectos a futuro.',
    12: 'Tu mundo interior: lo oculto, el descanso y lo espiritual.'
  },

  // Tema de cada casa dicho en corto, para frases como «Sobre todo en el hogar y la familia».
  casasCorto: {
    1: 'tu persona y tu imagen', 2: 'el dinero y lo que valoras', 3: 'el entorno cercano y los estudios',
    4: 'el hogar y la familia', 5: 'la creatividad y los romances', 6: 'el trabajo diario y la salud',
    7: 'la pareja y los socios', 8: 'lo que compartes con otros y las crisis', 9: 'los viajes y las creencias',
    10: 'la profesión y tus metas', 11: 'las amistades y los proyectos', 12: 'tu mundo interior'
  },

  // Cómo aprovechar cada tipo de aspecto. Sale al pasar el cursor por encima.
  aspectosUso: {
    conjuncion: 'Estas dos partes de ti siempre actúan juntas, así que ponlas a trabajar para el mismo fin. Vigila cuando una tape a la otra.',
    sextil: 'No se activa solo. Busca actividades donde uses las dos cosas a la vez; con práctica se vuelve una habilidad.',
    cuadratura: 'No intentes eliminar el roce. Cuando notes la tensión, dale su turno a cada parte en vez de dejar que una gane siempre: de ahí sale tu fuerza.',
    trigono: 'Apóyate en él cuando algo se complique. Y no lo des por hecho: lo que sale fácil también hay que trabajarlo para que rinda.',
    oposicion: 'Funciona como un balancín. Si te vas a un extremo, el otro aparece en las personas que te rodean. Busca el punto medio y escucha lo que el otro lado te muestra.'
  },

  // Aspectos dentro de tu carta. La frase se arma así: «{A} y {B} + texto».
  aspectosNatal: {
    conjuncion: 'actúan como una sola fuerza: se mezclan y se refuerzan.',
    sextil: 'se ayudan cuando te pones en marcha: es un talento que crece si lo usas.',
    cuadratura: 'chocan: sientes que una cosa estorba a la otra, y ese roce te empuja a madurar.',
    trigono: 'fluyen sin esfuerzo: es un don natural que quizá das por hecho.',
    oposicion: 'tiran hacia lados contrarios: el reto es darles su lugar a las dos cosas.'
  },

  // Aspectos del cielo de hoy con tu carta: «{Astro} de hoy mueve {mueve} y + [0] + {B} + [1]».
  aspectosHoy: {
    conjuncion: ['se posa sobre', ': ese tema se enciende.'],
    sextil: ['le da una mano a', ': buen momento para aprovecharlo.'],
    cuadratura: ['presiona sobre', ': puede haber roces o prisas; conviene ir con calma.'],
    trigono: ['acompaña a', ': las cosas salen con facilidad.'],
    oposicion: ['queda frente a', ': otras personas o situaciones te ponen ese tema delante.']
  },

  // Planeta en cada signo, en orden: Aries, Tauro, Géminis, Cáncer, Leo, Virgo,
  // Libra, Escorpio, Sagitario, Capricornio, Acuario, Piscis.
  enSigno: {
    mercurio: [
      'Piensas rápido y dices las cosas sin rodeos. Decides en el momento; te cuesta escuchar hasta el final.',
      'Piensas despacio y con sentido práctico. Cuando te formas una opinión, es difícil que la cambies.',
      'Mente ágil y curiosa: aprendes de todo un poco y te encanta conversar. Te cuesta concentrarte en una sola cosa.',
      'Piensas con el corazón y tienes muy buena memoria. Tu estado de ánimo tiñe lo que dices.',
      'Hablas con seguridad y calidez, y sabes contar historias. Te cuesta aceptar que te equivocaste.',
      'Mente ordenada y detallista: analizas todo y encuentras el error. Puedes preocuparte de más.',
      'Buscas el equilibrio al hablar y ves los dos lados de todo. Por eso te cuesta decidirte.',
      'Mente profunda e investigadora: no te quedas en la superficie. Callas mucho de lo que piensas.',
      'Piensas en grande y hablas con franqueza. Te entusiasman las ideas, aunque se te escapen los detalles.',
      'Piensas con seriedad y método. Hablas poco, pero con peso; prefieres lo útil a lo bonito.',
      'Tienes ideas originales y adelantadas. Piensas con lógica y te gusta llevar la contraria.',
      'Mente intuitiva e imaginativa: captas lo que no se dice. Te cuesta explicarte con orden.'
    ],
    venus: [
      'Quieres con pasión y sin esperar. Te gusta conquistar; la rutina en el amor te aburre pronto.',
      'Quieres con calma y lealtad. Disfrutas el contacto, la buena comida y la comodidad; tu punto débil es la posesividad.',
      'Te enamoras por la conversación. Necesitas variedad y humor; el compromiso pesado te agobia.',
      'Quieres cuidando: das ternura y pides seguridad. Te cuesta soltar a quien amaste.',
      'Quieres a lo grande, con generosidad y detalles. Necesitas sentir que tu pareja te admira.',
      'Demuestras cariño ayudando y cuidando los detalles. Te cuesta relajarte y tiendes a criticar de más.',
      'Necesitas pareja y armonía. Tienes buen gusto y trato amable; evitas las peleas, a veces demasiado.',
      'Quieres con intensidad: todo o nada. Entregas mucho y esperas lo mismo; los celos son tu punto débil.',
      'Quieres con alegría y libertad. Buscas a alguien con quien compartir aventuras, no una jaula.',
      'Quieres en serio y a largo plazo. Demuestras amor con hechos más que con palabras.',
      'Quieres desde la amistad y con mucho espacio propio. Te atraen las personas distintas.',
      'Quieres con entrega y romanticismo. Idealizas a quien amas y te cuesta poner límites.'
    ],
    marte: [
      'Energía directa y competitiva: actúas primero y piensas después. Empiezas con fuerza; terminar te cuesta más.',
      'Energía lenta pero imparable. Tardas en arrancar y en enojarte, pero cuando lo haces no hay quien te mueva.',
      'Energía inquieta y mental: haces varias cosas a la vez y peleas con palabras. Te dispersas con facilidad.',
      'Actúas según lo que sientes. Defiendes a los tuyos con fuerza; el enojo te sale de forma indirecta.',
      'Energía orgullosa y creativa: actúas con valentía y te gusta mandar. Te hiere que no reconozcan tu esfuerzo.',
      'Energía precisa y trabajadora. Rindes más con un plan claro; te irritan el desorden y la ineficacia.',
      'Te cuesta el enfrentamiento directo y buscas lo justo. Actúas mejor en compañía que a solas.',
      'Energía intensa y resistente. Vas hasta el fondo de lo que te propones y no olvidas una ofensa.',
      'Energía entusiasta y aventurera. Necesitas moverte y tener una meta que te inspire; a veces exageras.',
      'Energía disciplinada y ambiciosa. Avanzas paso a paso y aguantas lo que haga falta para llegar.',
      'Actúas a tu manera y por tus ideas. Te mueven las causas y el trabajo en grupo; no soportas que te den órdenes.',
      'Energía suave y cambiante: actúas por intuición. Te cuesta imponerte, pero sacas mucha fuerza para ayudar a otros.'
    ],
    jupiter: [
      'Creces cuando te atreves a empezar cosas por tu cuenta. La suerte te llega al tomar la iniciativa.',
      'Creces con paciencia y constancia. Tienes buena mano para el dinero y para disfrutar lo que consigues.',
      'Creces aprendiendo, hablando y conociendo gente. Las oportunidades te llegan por tus contactos.',
      'Creces cuidando y sintiéndote en familia. Tu suerte está en el hogar y en tu buena intuición.',
      'Creces cuando te muestras con confianza. Tu generosidad y tu creatividad te abren puertas.',
      'Creces siendo útil y haciendo bien tu trabajo. Tu suerte está en los detalles que otros pasan por alto.',
      'Creces en compañía. Las oportunidades te llegan a través de la pareja, los socios y tu buen trato.',
      'Creces en las crisis: sales de ellas con más fuerza. Tienes buen olfato para lo oculto y para los recursos compartidos.',
      'Creces viajando, estudiando y ampliando horizontes. Tu optimismo atrae la buena suerte.',
      'Creces con esfuerzo y responsabilidad. Tu suerte llega tarde, pero es sólida y dura.',
      'Creces con ideas nuevas y trabajando por causas comunes. Tu suerte está en los amigos y los grupos.',
      'Creces ayudando y confiando en la vida. Sientes una protección especial cuando sigues tu intuición.'
    ],
    saturno: [
      'Te cuesta confiar en tu propia iniciativa. Tu tarea es aprender a actuar con valor y sin precipitarte.',
      'Temes que te falte lo material. Tu tarea es construir tu seguridad con paciencia y sin aferrarte.',
      'Dudas de tu inteligencia o de cómo te expresas. Tu tarea es ordenar tus ideas y estudiar con disciplina.',
      'Te cuesta mostrar lo que sientes y pedir cuidado. Tu tarea es crear tu propia seguridad emocional.',
      'Temes no ser suficiente o hacer el ridículo. Tu tarea es brillar por mérito propio, sin esperar aplausos.',
      'Te exiges demasiado y temes equivocarte. Tu tarea es trabajar bien sin castigarte por lo imperfecto.',
      'Te tomas muy en serio las relaciones y la justicia. Tu tarea es comprometerte sin perderte en el otro.',
      'Temes perder el control o que te traicionen. Tu tarea es aprender a confiar y a soltar.',
      'Dudas de tus creencias y necesitas pruebas. Tu tarea es construir una fe propia, sin dogmas.',
      'Sientes desde joven el peso del deber. Tu tarea es alcanzar tus metas sin endurecerte.',
      'Te cuesta sentirte parte del grupo. Tu tarea es ser fiel a tus ideas y, a la vez, colaborar con otros.',
      'Cargas con miedos difusos y culpas ajenas. Tu tarea es poner límites y dar forma concreta a tus sueños.'
    ],
    urano: [
      'Tu generación rompe moldes con valentía y abre caminos nuevos.',
      'Tu generación cambia la forma de ganar dinero y de relacionarse con la tierra.',
      'Tu generación revoluciona la comunicación y las ideas.',
      'Tu generación transforma la idea de familia y de hogar.',
      'Tu generación reinventa la creatividad y la forma de expresarse.',
      'Tu generación renueva el trabajo, la salud y la técnica.',
      'Tu generación cambia las reglas de la pareja y de la convivencia.',
      'Tu generación rompe tabúes sobre el sexo, la muerte y el poder.',
      'Tu generación amplía horizontes y cuestiona las creencias heredadas.',
      'Tu generación sacude gobiernos, empresas y estructuras.',
      'Tu generación trae inventos y nuevas formas de comunidad.',
      'Tu generación renueva la espiritualidad y el arte.'
    ],
    neptuno: [
      'Tu generación sueña con empezar de cero y luchar por un ideal.',
      'Tu generación idealiza la naturaleza, la tierra y los valores sencillos.',
      'Tu generación sueña con nuevas formas de pensar y de comunicarse.',
      'Tu generación idealiza la familia, la patria y el pasado.',
      'Tu generación sueña con el romance, el espectáculo y la gloria.',
      'Tu generación busca un ideal de servicio, salud y trabajo bien hecho.',
      'Tu generación sueña con la paz, el amor y la armonía entre las personas.',
      'Tu generación explora lo oculto, la sexualidad y lo que hay tras la muerte.',
      'Tu generación sueña con un mundo sin fronteras y busca nuevas creencias.',
      'Tu generación deja de creer en las viejas estructuras y sueña con otras más honestas.',
      'Tu generación sueña con la tecnología, la igualdad y un futuro compartido.',
      'Tu generación vive un despertar espiritual y una gran sensibilidad colectiva.'
    ],
    pluton: [
      'Tu generación transforma la idea de identidad y de valentía individual.',
      'Tu generación transforma la economía, los recursos y la relación con lo material.',
      'Tu generación transforma la manera de pensar y de transmitir la información.',
      'Tu generación vive cambios profundos en la familia y en la patria.',
      'Tu generación transforma el poder personal y la forma de liderar.',
      'Tu generación transforma el trabajo, la salud y el cuidado del planeta.',
      'Tu generación transforma el matrimonio, la justicia y los acuerdos sociales.',
      'Tu generación enfrenta sin miedo los tabúes: sexo, muerte y poder.',
      'Tu generación transforma las creencias, la educación y la mirada sobre otras culturas.',
      'Tu generación derriba y reconstruye gobiernos, empresas y jerarquías.',
      'Tu generación transforma la tecnología, las redes y la idea de comunidad.',
      'Tu generación transforma la espiritualidad y disuelve viejas fronteras.'
    ]
  }
};
