#!/bin/bash
# Abre Carta Astral en su propia ventana, sin las barras del navegador.
# Usa el primer navegador de la familia Chromium que encuentre; si no hay, el navegador de siempre.
AQUI="$(cd "$(dirname "$0")" && pwd)"
PAGINA="file://${AQUI// /%20}/index.html"
for navegador in brave-browser chromium chromium-browser google-chrome google-chrome-stable microsoft-edge vivaldi; do
  if command -v "$navegador" >/dev/null 2>&1; then
    if [ "$1" = "--probar" ]; then echo "$navegador --app=$PAGINA"; exit 0; fi
    exec "$navegador" --app="$PAGINA"
  fi
done
if [ "$1" = "--probar" ]; then echo "xdg-open $AQUI/index.html"; exit 0; fi
exec xdg-open "$AQUI/index.html"
