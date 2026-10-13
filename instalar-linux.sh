#!/bin/bash
# Añade Carta Astral al menú de aplicaciones de tu usuario (no pide contraseña ni toca el sistema).
# Para quitarla:  ./instalar-linux.sh --quitar
AQUI="$(cd "$(dirname "$0")" && pwd)"
ENTRADA="$HOME/.local/share/applications/carta-astral.desktop"
if [ "$1" = "--quitar" ]; then
  rm -f "$ENTRADA" && echo "Carta Astral ya no está en el menú de aplicaciones."
  exit 0
fi
mkdir -p "$(dirname "$ENTRADA")"
cat > "$ENTRADA" <<FIN
[Desktop Entry]
Type=Application
Name=Carta Astral
Comment=Calcula y explica tu carta natal
Exec="$AQUI/abrir-linux.sh"
Icon=$AQUI/iconos/icono-512.png
Terminal=false
Categories=Education;
FIN
chmod +x "$AQUI/abrir-linux.sh"
echo "Listo: busca «Carta Astral» en tu menú de aplicaciones."
echo "Si mueves esta carpeta a otro sitio, vuelve a ejecutar este instalador."
