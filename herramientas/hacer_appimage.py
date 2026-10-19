#!/usr/bin/env python3
"""Arma el AppImage de Carta Astral para Linux: un solo archivo que se abre con doble clic.

Uso:
    python3 herramientas/hacer_appimage.py runtime-x86_64

«runtime-x86_64» es la pieza oficial que va al principio de todo AppImage; se descarga de
https://github.com/AppImage/type2-runtime/releases (continuous). Hace falta también mksquashfs
(paquete squashfs-tools).

Deja distribuir/Carta_Astral-<versión>-x86_64.AppImage. El AppImage no lleva navegador: al abrirlo
copia la app a ~/.local/share/carta-astral/<versión> y la abre con el navegador del equipo, igual
que abrir-linux.sh. Se copia porque, si el navegador ya estaba abierto, el AppImage termina enseguida
y su carpeta interna desaparece; la copia sigue ahí mientras se usa.
"""
import os
import shutil
import subprocess
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from empaquetar import INCLUIR, VERSION  # noqa: E402  (la misma lista de archivos que el .zip)

APP_RUN = """#!/bin/sh
# Carta Astral (AppImage): copia la app a la carpeta del usuario y la abre en el navegador.
VERSION="%s"
AQUI="$(dirname "$(readlink -f "$0")")"
BASE="${XDG_DATA_HOME:-$HOME/.local/share}/carta-astral"
DESTINO="$BASE/$VERSION"
if [ ! -f "$DESTINO/index.html" ]; then
  # Las copias de versiones anteriores ya no sirven (los datos de cada persona están en el navegador).
  for vieja in "$BASE"/*/; do
    [ -f "${vieja}index.html" ] && rm -rf "$vieja"
  done
  mkdir -p "$DESTINO" && cp -R "$AQUI/app/." "$DESTINO/" || exit 1
fi
exec bash "$DESTINO/abrir-linux.sh" "$@"
"""

ESCRITORIO = """[Desktop Entry]
Type=Application
Name=Carta Astral
Comment=Calcula y explica tu carta natal
Exec=carta-astral
Icon=carta-astral
Terminal=false
Categories=Education;
"""


def main():
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    runtime = os.path.abspath(sys.argv[1])
    raiz = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    destino = os.path.join(raiz, "distribuir", "Carta_Astral-%s-x86_64.AppImage" % VERSION)
    os.makedirs(os.path.dirname(destino), exist_ok=True)

    with tempfile.TemporaryDirectory() as trabajo:
        appdir = os.path.join(trabajo, "AppDir")
        app = os.path.join(appdir, "app")
        os.makedirs(app)
        for nombre in INCLUIR:
            if nombre in ("Abrir Carta Astral.bat", "instalar-linux.sh"):
                continue  # dentro del AppImage no hacen falta
            origen = os.path.join(raiz, nombre)
            if os.path.isdir(origen):
                shutil.copytree(origen, os.path.join(app, nombre))
            else:
                shutil.copy2(origen, app)
        with open(os.path.join(appdir, "AppRun"), "w") as f:
            f.write(APP_RUN % VERSION)
        os.chmod(os.path.join(appdir, "AppRun"), 0o755)
        with open(os.path.join(appdir, "carta-astral.desktop"), "w") as f:
            f.write(ESCRITORIO)
        shutil.copy2(os.path.join(raiz, "iconos", "icono-512.png"), os.path.join(appdir, "carta-astral.png"))
        os.symlink("carta-astral.png", os.path.join(appdir, ".DirIcon"))
        subprocess.run(["desktop-file-validate", os.path.join(appdir, "carta-astral.desktop")], check=False)

        imagen = os.path.join(trabajo, "app.squashfs")
        subprocess.run(["mksquashfs", appdir, imagen, "-root-owned", "-noappend", "-comp", "zstd", "-quiet"],
                       check=True, stdout=subprocess.DEVNULL)
        with open(destino, "wb") as salida:
            for parte in (runtime, imagen):
                with open(parte, "rb") as f:
                    shutil.copyfileobj(f, salida)
    os.chmod(destino, 0o755)
    print("Listo: %s (%.1f MB)" % (os.path.relpath(destino, raiz), os.path.getsize(destino) / 1e6))


if __name__ == "__main__":
    main()
