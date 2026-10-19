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
    quiron: { articulo: 'Quirón', que: 'Tu herida más sensible y, a la vez, tu capacidad de sanar y de ayudar a otros.', corto: 'tu herida sanadora',
      mueve: 'las heridas antiguas y las ganas de sanarlas', dura: 'varias semanas', generacion: 'entre 2 y 8 años' },
    nodo: { articulo: 'El Nodo Norte', que: 'Tu camino de crecimiento: hacia dónde te pide avanzar la vida.', corto: 'tu camino de crecimiento',
      mueve: 'los encuentros y decisiones que marcan rumbo', dura: 'unos meses', generacion: 'año y medio' },
    nodosur: { articulo: 'El Nodo Sur', que: 'Lo que ya sabes hacer de sobra y tiendes a repetir: tu zona de confort.', corto: 'tu zona de confort',
      mueve: 'los hábitos viejos y lo que toca soltar', dura: 'unos meses' },
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

  // Retorno solar: la carta del momento en que el Sol vuelve a su grado natal describe el año,
  // de un cumpleaños al siguiente.
  retorno: {
    // Ascendente del retorno, de Aries a Piscis: el tono del año.
    ascendente: [
      'Un año para tomar la iniciativa y empezar cosas por tu cuenta. Vas con más prisa y más valor de lo habitual; cuida los arranques de enojo.',
      'Un año para asentarte: el dinero, el cuerpo y la comodidad piden atención. Avanzas despacio, pero lo que construyas durará.',
      'Un año movido, de conversaciones, estudios, trámites y viajes cortos. Te llegan muchas ideas; elige unas pocas para no dispersarte.',
      'Un año centrado en el hogar, la familia y tus emociones. Puede haber cambios en casa; necesitas sentirte a salvo.',
      'Un año para mostrarte y brillar: creatividad, romance y ganas de reconocimiento. Atrévete a ocupar tu lugar sin depender del aplauso.',
      'Un año de orden y mejoras: trabajo, rutinas y salud. Buen momento para cuidar el cuerpo y pulir detalles, sin exigirte de más.',
      'Un año en el que las relaciones toman el centro: pareja, socios y acuerdos. Buscas equilibrio; cuida no ceder siempre para evitar conflictos.',
      'Un año intenso, de transformaciones y temas profundos. Algo termina para que otra cosa nazca; confía en tu fuerza para soltar.',
      'Un año para ampliar horizontes: viajes, estudios y nuevas ideas sobre la vida. Hay optimismo y ganas de aventura; cuida no prometer de más.',
      'Un año de responsabilidades y metas a largo plazo. Pide esfuerzo y constancia, y da resultados sólidos.',
      'Un año de cambios y libertad: amistades nuevas, grupos y proyectos distintos. Te apetece romper rutinas y probar lo diferente.',
      'Un año sensible e intuitivo, con más necesidad de descanso, arte y espiritualidad. Escucha tus sueños y pon límites para no agotarte.'
    ],
    // Casa en la que cae el Sol del retorno: dónde se concentra el año.
    solCasa: {
      1: 'Este año el foco está en ti: tu imagen, tu cuerpo y tus decisiones personales. Es un año para empezar de nuevo.',
      2: 'Este año el foco está en el dinero, tus recursos y lo que valoras. Buen momento para ordenar tus finanzas y apreciar tus talentos.',
      3: 'Este año el foco está en aprender, comunicarte y moverte por tu entorno: estudios, hermanos, vecinos y viajes cortos.',
      4: 'Este año el foco está en el hogar y la familia. Puede ser un año de mudanza, de arreglar la casa o de mirar tus raíces.',
      5: 'Este año el foco está en disfrutar y crear: romances, hijos, aficiones y todo lo que te da vida.',
      6: 'Este año el foco está en el trabajo diario y la salud. Toca organizar rutinas, cuidar el cuerpo y mejorar tu forma de trabajar.',
      7: 'Este año el foco está en las relaciones: pareja, socios y acuerdos. Lo que vivas con otras personas te enseña mucho de ti.',
      8: 'Este año el foco está en lo profundo: intimidad, dinero compartido, herencias y cierres. Un año de transformación.',
      9: 'Este año el foco está en ampliar horizontes: viajes largos, estudios superiores y tus creencias.',
      10: 'Este año el foco está en tu profesión y tus metas. Es un año de exposición y de logros, si trabajas por ellos.',
      11: 'Este año el foco está en tus amistades, los grupos y tus proyectos a futuro. Las personas afines te abren puertas.',
      12: 'Este año el foco está en tu mundo interior: descanso, retiro y espiritualidad. Un año para cerrar ciclos y prepararte para lo que viene.'
    },
    // Un astro pegado a un ángulo del retorno se nota mucho durante el año. «… se nota mucho {texto}».
    angulos: {
      asc: 'en tu forma de mostrarte y de empezar las cosas',
      dsc: 'en tus relaciones y en las personas que aparecen',
      mc: 'en tu profesión y en tu imagen pública',
      ic: 'en tu hogar, tu familia y tu vida privada'
    }
  },

  // Nodos lunares según el signo del Nodo Norte, de Aries a Piscis. El Nodo Sur está en el signo opuesto.
  // camino: hacia dónde crecer · arrastras: lo que se repite · ocurre: cómo se nota · salir: cómo no quedarse atorado.
  nodos: [
    { camino: 'Aprender a decidir por ti, poner tu voluntad y atreverte a ir primero.',
      arrastras: 'Vivir pendiente de lo que opinan o necesitan los demás, buscando aprobación y evitando el conflicto a toda costa.',
      ocurre: 'Te cuesta decir «yo quiero»: dejas que otros elijan por ti y luego te quedas con resentimiento.',
      salir: 'Practica decisiones pequeñas sin consultar y di que no cuando sea no. Un poco de amor propio te equilibra.' },
    { camino: 'Construir calma, estabilidad y valor propio con cosas sencillas y concretas.',
      arrastras: 'Vivir en la intensidad: crisis, celos, control y dramas que lo vuelven todo cuestión de vida o muerte.',
      ocurre: 'Cuando todo está en paz, sin querer buscas el conflicto o sospechas de los demás; te enganchas a lo que te desgasta.',
      salir: 'Elige la paz aunque parezca aburrida; cuida tu cuerpo, tu dinero y tus placeres sencillos. No todo hay que transformarlo.' },
    { camino: 'Escuchar, preguntar y aprender de lo cercano; abrirte a otras ideas.',
      arrastras: 'Creer que ya tienes la verdad, sermonear y huir hacia lo lejano cuando algo se complica.',
      ocurre: 'Discutes para tener razón, das consejos que nadie pidió o te vas, de viaje o de tema, antes de resolver lo de aquí.',
      salir: 'Haz más preguntas que afirmaciones; interésate por los detalles y por la gente de tu entorno.' },
    { camino: 'Abrir tu mundo emocional: el hogar, la familia, la ternura y pedir ayuda.',
      arrastras: 'Vivir para el deber, el logro y la imagen, controlando lo que sientes.',
      ocurre: 'Trabajas de más, te cuesta mostrarte vulnerable y sientes que si aflojas todo se cae.',
      salir: 'Dale tiempo a tu casa y a los tuyos; permítete sentir y que te cuiden. El éxito no sustituye al afecto.' },
    { camino: 'Brillar con lo tuyo: crear, expresarte, disfrutar y ocupar tu lugar.',
      arrastras: 'Esconderte en el grupo, en la causa o en la distancia emocional para no exponerte.',
      ocurre: 'Te quedas en segundo plano, razonas lo que sientes o te dispersas en proyectos de otros sin poner tu sello.',
      salir: 'Atrévete a mostrar tu talento y tu corazón; date permiso de ser protagonista de vez en cuando.' },
    { camino: 'Aterrizar: rutinas, orden, cuidado del cuerpo y ayuda práctica.',
      arrastras: 'Escapar a la fantasía, la confusión o el sacrificio, esperando que las cosas se resuelvan solas.',
      ocurre: 'Te pierdes en sueños o en los problemas ajenos, dejas cosas sin terminar o te sientes víctima de las circunstancias.',
      salir: 'Pon horarios, listas y límites; convierte tu sensibilidad en ayuda concreta.' },
    { camino: 'Aprender a cooperar, escuchar al otro y construir en pareja o en equipo.',
      arrastras: 'Hacerlo todo por tu cuenta, a tu manera y con prisa, sin tomar en cuenta a los demás.',
      ocurre: 'Chocas, te impones o te cansas pronto de la gente; sientes que nadie va a tu ritmo.',
      salir: 'Antes de actuar, pregunta y negocia; ceder un poco te da más de lo que te quita.' },
    { camino: 'Atreverte a transformarte: soltar, compartir y vivir la intimidad a fondo.',
      arrastras: 'Aferrarte a lo seguro, a lo material y a lo conocido, aunque ya no te haga bien.',
      ocurre: 'Te resistes al cambio, acumulas cosas o relaciones por miedo a perder y te estancas.',
      salir: 'Suelta lo que ya cumplió su ciclo; confía a otros tus recursos y tus emociones.' },
    { camino: 'Buscar sentido: una fe, una filosofía o un propósito, y confiar en tu intuición.',
      arrastras: 'Quedarte en la superficie: mil datos, chismes y opiniones ajenas sin decidir nada.',
      ocurre: 'Dudas de todo, te dispersas y cambias de opinión según con quién hables.',
      salir: 'Elige en qué crees y comprométete con ello; viaja, estudia a fondo y escucha tu voz interior.' },
    { camino: 'Madurar: asumir responsabilidades, ponerte metas y construir tu propio lugar en el mundo.',
      arrastras: 'Refugiarte en la familia, en el pasado o en la necesidad de que te cuiden.',
      ocurre: 'Dependes de otros emocionalmente, te cuesta salir de tu zona segura o reaccionas desde el sentimiento.',
      salir: 'Fíjate un objetivo y trabaja por él con constancia; hazte cargo de ti sin dejar de sentir.' },
    { camino: 'Pensar en grupo: amistades, causas y proyectos que van más allá de ti.',
      arrastras: 'Necesitar ser el centro, que te admiren y que todo gire en torno a tu orgullo.',
      ocurre: 'Te duele no recibir reconocimiento, compites por la atención o te cuesta compartir el escenario.',
      salir: 'Pon tu talento al servicio de algo común; disfruta los logros del grupo como si fueran tuyos.' },
    { camino: 'Confiar, soltar el control y abrirte a lo espiritual, a la compasión y a la creatividad.',
      arrastras: 'Querer controlarlo todo, criticar y vivir pendiente de los detalles y de lo que falla.',
      ocurre: 'Te preocupas de más, te exiges perfección y te angustias si algo se sale del plan.',
      salir: 'Practica la meditación, el arte o el descanso; acepta que no todo depende de ti.' }
  ],

  // Quirón según su signo, de Aries a Piscis: la herida, cómo se nota y cómo sanarla.
  quiron: [
    { herida: 'Sentir que no tienes derecho a ser como eres o a ocupar tu lugar.',
      ocurre: 'Dudas antes de actuar, te cuesta empezar cosas o reaccionas con enojo para que no te pasen por encima.',
      sanar: 'Haz cada día algo pequeño que requiera valor; sanas al animar a otros a ser quienes son.' },
    { herida: 'Inseguridad con el dinero, con el cuerpo o con tu propio valor.',
      ocurre: 'Miedo a que te falte, dificultad para disfrutar o la sensación de no merecer cosas buenas.',
      sanar: 'Cuida tu cuerpo y tus recursos con cariño y sin culpa; valora lo que eres más que lo que tienes.' },
    { herida: 'Sentir que no te entienden o que lo que piensas no vale.',
      ocurre: 'Te callas, hablas de más por nervios o dudas de tu capacidad para aprender.',
      sanar: 'Escribe, estudia a tu ritmo y comparte lo que sabes: puedes enseñar justo lo que te costó.' },
    { herida: 'Sentir que te faltó protección o cariño en la familia o en el hogar.',
      ocurre: 'Te cuesta pedir apoyo, cuidas a todos menos a ti o te apegas de más.',
      sanar: 'Crea tu propio hogar emocional: date la ternura que esperabas y aprende a recibir.' },
    { herida: 'Sentir que no vales si no brillas, o que nadie te ve de verdad.',
      ocurre: 'Buscas aprobación, temes hacer el ridículo o escondes tu creatividad.',
      sanar: 'Crea por el gusto de crear, no por el aplauso; celebra tu luz y la de los demás.' },
    { herida: 'Sentir que nunca haces lo suficiente o que algo en ti está mal.',
      ocurre: 'Te exiges demasiado, te preocupa la salud o te criticas sin parar.',
      sanar: 'Cuida tu cuerpo con rutinas amables y acepta lo imperfecto; tu don es ayudar sin juzgarte.' },
    { herida: 'Miedo al rechazo en las relaciones o a quedarte sin pareja.',
      ocurre: 'Cedes demasiado, te adaptas para agradar o atraes relaciones desiguales.',
      sanar: 'Equilibra lo que das y lo que recibes; una relación sana empieza por respetarte.' },
    { herida: 'Experiencias de traición, de pérdida o de abuso de confianza.',
      ocurre: 'Desconfías, quieres controlar o temes la intimidad.',
      sanar: 'Habla de lo que pasó con alguien de confianza o con ayuda profesional; tu fuerza sale de lo que superaste.' },
    { herida: 'Crisis de fe o la sensación de que la vida no tiene sentido.',
      ocurre: 'Buscas respuestas en otros, cambias de creencias o te cuesta confiar en el futuro.',
      sanar: 'Construye tu propia filosofía con experiencia, viajes y estudio; compártela sin imponerla.' },
    { herida: 'Sentir que debes ganarte el cariño con logros, o que la autoridad te falló.',
      ocurre: 'Te exiges éxito, temes fracasar o te cuesta confiar en quienes mandan.',
      sanar: 'Ponte metas a tu medida y reconoce tus avances; puedes ser la guía que te faltó.' },
    { herida: 'Sentirte diferente, fuera de lugar o sin pertenecer a ningún grupo.',
      ocurre: 'Te aíslas, te rebelas por sistema o te cuesta confiar en los grupos.',
      sanar: 'Tu diferencia es un aporte: busca personas afines y úsala para ayudar a otros a encajar.' },
    { herida: 'Una sensibilidad tan grande que el mundo duele, o una sensación de abandono.',
      ocurre: 'Escapas a la fantasía o a los excesos, absorbes el dolor ajeno o te cuesta poner límites.',
      sanar: 'Cuida tu energía con descanso, arte o espiritualidad, y pon límites: tu compasión sana cuando también te incluye.' }
  ],

  // Retorno lunar: la carta del momento en que la Luna vuelve a su lugar natal. Describe el mes.
  retornoLunar: {
    ascendente: [
      'Un mes para tomar la iniciativa: empiezas cosas con energía. Cuida la impaciencia.',
      'Un mes tranquilo y práctico, bueno para el dinero, el cuerpo y disfrutar. Evita aferrarte.',
      'Un mes de mucho movimiento: mensajes, trámites y encuentros. Organízate para no dispersarte.',
      'Un mes sensible y hogareño: la familia y tus emociones piden tiempo.',
      'Un mes para mostrarte, crear y divertirte. Brilla sin esperar aplausos.',
      'Un mes para ordenar: trabajo, salud y rutinas. Ve paso a paso, sin exigirte de más.',
      'Un mes centrado en los demás: pareja, acuerdos y vida social. Busca el equilibrio.',
      'Un mes intenso y profundo: buen momento para cerrar ciclos y soltar.',
      'Un mes para salir de la rutina: viajes, estudios y nuevas ideas.',
      'Un mes de trabajo y responsabilidades que dan frutos. Descansa también.',
      'Un mes de amistades, grupos y cambios inesperados. Ábrete a lo nuevo.',
      'Un mes para bajar el ritmo, descansar y escuchar tu intuición.'
    ]
  },

  // Compatibilidad por elementos. La clave une los dos elementos en orden alfabético.
  // tipo: fluye (mismo elemento), complementa (fuego-aire, tierra-agua) o reto (el resto).
  compatibilidad: {
    'fuego-fuego': { tipo: 'fluye', como: 'Mucha pasión, entusiasmo y ganas de hacer cosas juntos; se entienden rápido.',
      cambiar: 'Turnarse el protagonismo y celebrar los logros de la otra persona.', evitar: 'Las peleas por orgullo y las decisiones tomadas en caliente.' },
    'tierra-tierra': { tipo: 'fluye', como: 'Estabilidad, lealtad y metas concretas en común: construyen paso a paso.',
      cambiar: 'Meter sorpresa y juego en la rutina.', evitar: 'Que la relación se vuelva solo obligaciones y cuentas.' },
    'aire-aire': { tipo: 'fluye', como: 'Conversación sin fin, ideas compartidas y mucha amistad; se dan libertad.',
      cambiar: 'Bajar de la cabeza al corazón: decir lo que sienten, no solo lo que piensan.', evitar: 'Esquivar los temas difíciles o quedarse en planes que nunca aterrizan.' },
    'agua-agua': { tipo: 'fluye', como: 'Una conexión emocional profunda: se intuyen sin hablar.',
      cambiar: 'Poner palabras y límites claros a lo que sienten.', evitar: 'Los dramas, los silencios largos y ahogarse en las emociones de la otra persona.' },
    'aire-fuego': { tipo: 'complementa', como: 'El aire aviva el fuego: las ideas y la acción se impulsan; es una relación dinámica y divertida.',
      cambiar: 'Que el fuego escuche más y el aire se comprometa con hechos.', evitar: 'La dispersión: muchos planes y poca constancia.' },
    'agua-tierra': { tipo: 'complementa', como: 'La tierra da seguridad y el agua ternura: se cuidan y se nutren.',
      cambiar: 'Que la tierra exprese su cariño con palabras y el agua confíe en lo práctico.', evitar: 'Encerrarse en la rutina o en la casa y dejar de crecer.' },
    'fuego-tierra': { tipo: 'reto', como: 'El fuego quiere ir rápido y la tierra ir con seguridad: se frenan o se impacientan.',
      cambiar: 'Que el fuego planee un poco y la tierra se atreva más; acuerden un ritmo común.', evitar: 'Criticar el ritmo de la otra persona: la prisa y la calma se complementan si se respetan.' },
    'agua-fuego': { tipo: 'reto', como: 'Mucha intensidad: el fuego es directo y el agua sensible, y pueden herirse sin querer.',
      cambiar: 'Que el fuego cuide sus palabras y el agua diga lo que necesita sin esperar que lo adivinen.', evitar: 'Los arranques de enojo y los resentimientos guardados.' },
    'aire-tierra': { tipo: 'reto', como: 'El aire vive en las ideas y la tierra en los hechos: uno siente que el otro no aterriza o no sueña.',
      cambiar: 'Que el aire concrete y la tierra se abra a probar cosas nuevas.', evitar: 'Menospreciar la forma de pensar de la otra persona.' },
    'agua-aire': { tipo: 'reto', como: 'El aire razona y el agua siente: les cuesta entenderse cuando hay emociones de por medio.',
      cambiar: 'Que el aire escuche con empatía y el agua explique lo que siente.', evitar: 'Responder con lógica a una emoción, o con lágrimas a un argumento.' }
  },

  // Aspectos entre dos cartas: «Tu Venus y el Marte de Ana + texto».
  sinastria: {
    conjuncion: 'se funden: sienten esa parte de la relación muy unida, para bien y para mal.',
    sextil: 'se apoyan con facilidad si lo cultivan.',
    cuadratura: 'chocan: es un punto de roce que pide paciencia.',
    trigono: 'fluyen: es un punto de armonía natural entre ustedes.',
    oposicion: 'se atraen y se enfrentan a la vez: necesitan encontrar un punto medio.'
  },
  // Qué hacer con un aspecto de roce entre dos cartas.
  sinastriaConsejo: {
    cuadratura: 'Cuando aparezca el roce, hablen de él con calma y túrnense: a veces gana una forma de hacer las cosas, a veces la otra.',
    oposicion: 'Vean a la otra persona como su complemento, no como su rival: cada quien aporta lo que le falta a quien tiene al lado.'
  },

  // Calendario personal: fechas importantes de los próximos doce meses.
  calendario: {
    // Tránsitos con nombre propio. La clave es «astro-aspecto-punto natal».
    especiales: {
      'jupiter-conjuncion-jupiter': ['Retorno de Júpiter', 'Empieza un ciclo de crecimiento de doce años: buen momento para sembrar planes grandes.'],
      'saturno-conjuncion-saturno': ['Retorno de Saturno', 'Hacia los 29 y los 58 años: toca madurar, revisar tu rumbo y construir sobre bases propias. Pide esfuerzo, pero lo que hagas ahora dura.'],
      'saturno-oposicion-saturno': ['Oposición de Saturno', 'A mitad del ciclo de Saturno, hacia los 14, 44 y 73 años: cosechas lo construido y ves lo que hay que ajustar.'],
      'saturno-cuadratura-saturno': ['Cuadratura de Saturno', 'Un examen de lo que estás construyendo: aparecen obstáculos que te piden más compromiso o un cambio de plan.'],
      'urano-oposicion-urano': ['Oposición de Urano', 'Hacia los 42 años, la llamada crisis de la mitad de la vida: ganas de libertad y de hacer lo que de verdad quieres.'],
      'urano-cuadratura-urano': ['Cuadratura de Urano', 'Hacia los 21 y los 63 años: ganas de romper con lo que te ata y de vivir a tu manera.'],
      'neptuno-cuadratura-neptuno': ['Cuadratura de Neptuno', 'Hacia los 41 años: revisas tus sueños e ilusiones; algunos se disuelven para dejar paso a otros más tuyos.'],
      'pluton-cuadratura-pluton': ['Cuadratura de Plutón', 'Una transformación profunda de mitad de la vida: sueltas lo que ya no te sirve para renacer.'],
      'quiron-conjuncion-quiron': ['Retorno de Quirón', 'Hacia los 50 años: la vieja herida vuelve a doler para que por fin la sanes y la conviertas en sabiduría.']
    },
    eclipse: {
      solar: 'Los eclipses solares abren capítulos: buen momento para empezar algo nuevo en el área que tocan.',
      lunar: 'Los eclipses lunares cierran ciclos y sacan emociones a la luz: algo llega a su fin o se revela.',
      penumbral: 'Es un eclipse suave, apenas visible: su efecto también es más leve.'
    },
    retro: {
      mercurio: 'Revisa antes de firmar, viajar o comprar aparatos, y ten paciencia con los malentendidos. Buen momento para repasar, corregir y retomar contactos.',
      venus: 'Se revisan los afectos y los gastos: mejor no empezar relaciones ni hacer cambios de imagen drásticos.',
      marte: 'La energía va hacia dentro: revisa tus planes antes de lanzarte y evita las peleas.'
    }
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
