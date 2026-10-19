#!/usr/bin/env python3
"""Arma el archivo .zip de Carta Astral para compartirla.

Uso:
    python3 herramientas/empaquetar.py

Deja distribuir/carta-astral-<versión>.zip con solo lo necesario para usar la app.
Quien lo reciba lo descomprime y abre «Abrir Carta Astral.bat» (Windows),
«abrir-linux.sh» (Linux) o directamente index.html.
"""
import os
import zipfile

VERSION = "0.5"
# En GitHub el archivo de presentación debe llamarse README.md; dentro del zip va como LÉEME.md.
RENOMBRAR = {"README.md": "LÉEME.md"}
INCLUIR = ["index.html", "manifest.webmanifest", "sw.js", "LICENSE", "README.md",
           "abrir-linux.sh", "instalar-linux.sh", "Abrir Carta Astral.bat",
           "css", "js", "letras", "iconos", "imagenes"]


def main():
    raiz = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.makedirs(os.path.join(raiz, "distribuir"), exist_ok=True)
    destino = os.path.join(raiz, "distribuir", "carta-astral-%s.zip" % VERSION)
    rutas = []
    for nombre in INCLUIR:
        completa = os.path.join(raiz, nombre)
        if os.path.isdir(completa):
            for carpeta, _, archivos in os.walk(completa):
                rutas += [os.path.join(carpeta, a) for a in sorted(archivos)]
        elif os.path.exists(completa):
            rutas.append(completa)
        else:
            raise SystemExit("Falta " + nombre)
    with zipfile.ZipFile(destino, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for ruta in rutas:
            relativa = os.path.relpath(ruta, raiz)
            dentro = os.path.join("Carta Astral", RENOMBRAR.get(relativa, relativa))
            info = zipfile.ZipInfo.from_file(ruta, dentro)
            info.compress_type = zipfile.ZIP_DEFLATED
            with open(ruta, "rb") as f:
                z.writestr(info, f.read(), compresslevel=9)
    print("Listo: %s (%d archivos, %.1f MB)" % (os.path.relpath(destino, raiz), len(rutas), os.path.getsize(destino) / 1e6))


if __name__ == "__main__":
    main()
