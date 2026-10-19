# Carta Astral

Aplicación que calcula tu carta natal y la explica en lenguaje claro: tríada (Sol, Luna y
Ascendente), decanatos, lado oscuro de cada signo, Lilith, planetas, casas, aspectos,
significado del nombre y numerología. Dibuja la rueda al estilo del reloj astronómico de Praga,
imprime un informe completo y tiene música de fondo.

Funciona sin internet y guarda todo en tu propio equipo. Sirve en Windows, en Linux y en el teléfono.

## Cómo descargarla y usarla

Es gratis, no pide crear cuentas y tus datos se quedan en tu computadora o en tu teléfono.

### En la computadora (Windows o Linux)

1. **Descárgala.** Arriba en esta página, pulsa el botón verde **Code** y luego **Download ZIP**.
2. **Descomprímela.**
   - Windows: clic derecho sobre el archivo descargado → **Extraer todo…** → **Extraer**.
   - Linux: clic derecho sobre el archivo → **Extraer aquí**.
3. **Ábrela.** Entra en la carpeta `carta-astral-main` que se acaba de crear:
   - **Windows:** doble clic en `index.html` (puede aparecer solo como `index`) y se abre en tu
     navegador. Para abrirla en su propia ventana, sin barras, usa `Abrir Carta Astral.bat`.
   - **Linux:** doble clic en `index.html`. Para abrirla en su propia ventana, abre una terminal
     en esa carpeta y escribe:

     ```bash
     ./abrir-linux.sh
     ```

     Para que aparezca en el menú de aplicaciones, `./instalar-linux.sh` (y para quitarla,
     `./instalar-linux.sh --quitar`).

Funciona sin internet. Usa un navegador actual: Chrome, Edge, Brave o Firefox.

**Sin descargar nada:** abre https://azgard69-69.github.io/carta-astral/ en Chrome, Edge o Brave
y pulsa el botón **Instalar** que aparece en la barra de direcciones. Queda como una aplicación más
de tu computadora.

### En el teléfono (Android o iPhone)

En el teléfono no se usa el ZIP: la app se abre desde su dirección web y se instala desde ahí.

1. Abre **https://azgard69-69.github.io/carta-astral/** en el navegador del teléfono.
2. Instálala:
   - **Android (Chrome):** menú **⋮** → **Instalar aplicación** o **Agregar a la pantalla principal**.
   - **iPhone (Safari):** botón **Compartir** (el cuadrado con la flecha hacia arriba) →
     **Agregar a inicio**.
3. Aparece el icono de Carta Astral junto a tus otras apps. La primera vez necesita internet;
   después funciona sin conexión.

### Primeros pasos

1. En **Mis datos**, escribe tu nombre y apellidos, tu fecha y hora de nacimiento, y empieza a
   escribir tu lugar de nacimiento hasta que aparezca en la lista; elígelo ahí. Si hay varios
   lugares con el mismo nombre, añade el estado o el país: «San José Chiapas».
2. Pulsa **Calcular mi carta**.
3. Recorre **Carta natal** (tu signo solar, lunar y Ascendente, la rueda, los planetas, las casas y
   los aspectos; toca cualquier astro para leer más), **Cielo de hoy** y **Cómo se lee**.
4. Con **Imprimir o guardar PDF** obtienes el informe completo.
5. La música empieza sola; se pausa desde el menú.

Si no sabes tu hora de nacimiento, marca **No conozco mi hora exacta**: verás todo menos el
Ascendente y las casas.

### Actualizarla

- **En la computadora:** descárgala de nuevo y sustituye la carpeta anterior.
- **En el teléfono:** se actualiza sola cuando la abres con internet.

Tus datos se guardan en el navegador, no en la carpeta. Si al cambiar de versión no aparecen,
vuelve a escribirlos: la carta se calcula en un momento.

## Compartirla

```bash
python3 herramientas/empaquetar.py
```

Deja en `distribuir/` un archivo `.zip` de unos 4 MB con solo lo necesario para usarla (sin las
herramientas ni las pruebas). Quien lo reciba lo descomprime y la abre como se explica arriba.
La copia que se instala desde el navegador funciona sin conexión gracias a `manifest.webmanifest`
y `sw.js`.

## Imprimir o guardar en PDF

En la carta natal, pulsa **Imprimir o guardar PDF** (también vale Ctrl+P). Se abre el diálogo de
impresión del navegador con un informe completo en papel blanco, de unas diez páginas: la rueda,
la tríada con su lado oscuro, Lilith, cada planeta, las doce casas, todos los aspectos con cómo
usarlos, el nombre con sus números y la tabla de posiciones. Para obtener un PDF, elige
«Guardar como PDF» en el destino.

## Música de fondo

El reproductor está en el menú, debajo de «Mis datos». La música empieza encendida; **Pausar música** la detiene
y la app recuerda esa elección. El botón de al lado abre la melodía y el volumen. Los navegadores no
dejan sonar nada hasta el primer clic, así que a veces arranca al tocar la página.

Las cinco melodías no son archivos: la app las genera nota por nota, así que no pesan ni tienen
derechos de autor. Todas están afinadas con el la en 432 Hz.

1. **Gayatri mantra (flauta):** su entonación védica tradicional de tres notas, con flauta y tanpura.
2. **Om:** una voz grave que canta A-U-M en 108 Hz (dos octavas por debajo de 432).
3. **Cuencos:** cuencos que suenan de vez en cuando y se apagan despacio.
4. **Claro de luna (Beethoven):** los primeros compases de la sonata.
5. **Noche serena:** acordes lentos con algún destello agudo.

Con **Mi propia música…** puedes elegir canciones de tu equipo; no se copian ni se guardan dentro
de la app.

## Qué hay en cada carpeta

| Carpeta o archivo | Para qué sirve |
|---|---|
| `index.html` | La página de la aplicación. |
| `css/estilos.css` | Colores y diseño (índigo con brillantina dorada). |
| `js/astro.js` | El motor: calcula Sol, Luna, planetas, Lilith, casas, aspectos y hora solar. |
| `js/rueda.js` | Dibuja la rueda al estilo del reloj astronómico de Praga. |
| `js/musica.js` | La música de fondo. |
| `js/numerologia.js` | Camino de vida, expresión y alma. |
| `js/guia.js` | Los textos de la guía, convertidos para la app. **No se edita a mano.** |
| `js/textos.js` | Textos en lenguaje llano de planetas, casas y aspectos. Borrador; se edita a mano. |
| `js/nombres.js` | Significado de unos 1.240 nombres (español, inglés, náhuatl, maya y otros) y sus variantes de escritura. Borrador; se edita a mano. |
| `js/ciudades.js` | Lista propia de 119 ciudades, con sus nombres en español. |
| `js/ciudades-mundo.js` | Unas 170.000 ciudades y pueblos del mundo de más de 1.000 habitantes (GeoNames). **No se edita a mano.** |
| `js/app.js` | Une el formulario, los cálculos y los textos. |
| `letras/` | La letra cursiva de los títulos (Courgette) y su licencia. |
| `iconos/` | El icono de la app. |
| `fuentes/` | El documento original de la guía (`.odt`). |
| `herramientas/` | Programas de apoyo: convertir la guía, las ciudades, dibujar el icono, empaquetar. |
| `pruebas/` | Comprobaciones de los cálculos y de la rueda. |
| `LICENSE` | El texto de la licencia GPL versión 3. |

## Si cambias la guía

Edita el documento de `fuentes/` y después ejecuta:

```bash
python3 herramientas/generar_guia.py "fuentes/El zodiaco completi.odt" js/guia.js
```

Las erratas que se corrigen al convertirla están en `herramientas/correcciones.json`.

## Comprobar los cálculos

```bash
node pruebas/prueba-motor.js
```

## Precisión y límites

- Fechas admitidas: de 1800 a 2050.
- Sol: unos 0,01°. Luna: unos 0,05°. Planetas: hasta 0,2° (Júpiter y Saturno son los menos exactos).
  Es suficiente para signo, decanato, casa y aspectos; un programa profesional afina más.
- Casas: sistema Placidus. Más allá de 66° de latitud se usan casas iguales.
- Lilith: Luna Negra media.
- Numerología pitagórica con la tabla en español (la Ñ vale 5). Los números 11, 22 y 33 no se
  reducen. Expresión y alma se calculan con nombre y apellidos.
- Las ciudades de la lista mundial llevan su nombre en GeoNames, que a veces está en inglés.

## Licencia

Carta Astral es software libre bajo la **Licencia Pública General de GNU, versión 3** (GPL v3).
Puedes usarla, copiarla, estudiarla, modificarla y compartirla; si repartes una versión
modificada, debe seguir siendo libre y con esta misma licencia. El texto completo está en `LICENSE`.

Copyright © 2026 Siddhartha Ajax

Partes que conservan su propia licencia:

- **Ciudades:** GeoNames (https://www.geonames.org), Creative Commons Atribución 4.0.
- **Letra Courgette:** Sorkin Type Co, SIL Open Font License 1.1 (`letras/OFL.txt`).
- **Texto de la licencia GPL:** Free Software Foundation.

## Donaciones

La app es gratuita y lo seguirá siendo. Todavía no hay un enlace para donar; cuando exista, aparecerá aquí.

## Pendiente

- Que alguien que sepa de astrología revise los borradores de `js/textos.js` y `js/nombres.js`.
- Programas instaladores de verdad (`.exe` para Windows, `.AppImage` para Linux): se pueden
  generar gratis desde GitHub una vez que el proyecto esté allí.
- Hacer público el repositorio de GitHub y publicar la app en GitHub Pages (por ahora es privado).
