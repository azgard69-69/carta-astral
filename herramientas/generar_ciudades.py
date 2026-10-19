#!/usr/bin/env python3
"""Convierte la base de ciudades de GeoNames en js/ciudades-mundo.js.

Uso:
    python3 herramientas/generar_ciudades.py cities1000.zip admin1CodesASCII.txt js/ciudades-mundo.js

Los dos primeros archivos se descargan de https://download.geonames.org/export/dump/
(cities1000 = lugares de más de 1.000 habitantes; hay también cities500, cities5000 y cities15000).
GeoNames se distribuye con licencia Creative Commons Atribución 4.0: hay que citar la fuente.

Cada ciudad queda en una línea:  nombre|estado o provincia|país (código)|latitud|longitud|zona
La zona es un número que apunta a la lista de zonas horarias. Van de la más poblada a la menos.
"""
import io
import json
import sys
import zipfile


def main():
    if len(sys.argv) != 4:
        raise SystemExit(__doc__)
    ruta_zip, ruta_admin, ruta_salida = sys.argv[1:]

    regiones = {}
    with open(ruta_admin, encoding="utf-8") as f:
        for linea in f:
            partes = linea.rstrip("\n").split("\t")
            if len(partes) >= 2:
                regiones[partes[0]] = partes[1]

    ciudades = []
    with zipfile.ZipFile(ruta_zip) as z:
        nombre = [n for n in z.namelist() if n.endswith(".txt")][0]
        with io.TextIOWrapper(z.open(nombre), encoding="utf-8") as f:
            for linea in f:
                c = linea.rstrip("\n").split("\t")
                if len(c) < 18 or not c[17]:
                    continue
                region = regiones.get(c[8] + "." + c[10], "")
                ciudades.append((int(c[14] or 0), c[1], region, c[8], float(c[4]), float(c[5]), c[17]))

    ciudades.sort(key=lambda x: -x[0])
    zonas = sorted({c[6] for c in ciudades})
    indice = {z: i for i, z in enumerate(zonas)}
    limpio = lambda t: t.replace("|", " ").replace("\n", " ").strip()
    lineas = ["%s|%s|%s|%.4f|%.4f|%d" % (limpio(c[1]), limpio(c[2]) if c[2] != c[1] else "", c[3], c[4], c[5], indice[c[6]])
              for c in ciudades]

    with open(ruta_salida, "w", encoding="utf-8") as f:
        f.write("/* Generado por herramientas/generar_ciudades.py. No lo edites a mano.\n")
        f.write(" * Datos de ciudades: GeoNames (https://www.geonames.org), licencia CC BY 4.0. */\n")
        f.write("window.CIUDADES_MUNDO = {\n zonas: " + json.dumps(zonas) + ",\n datos: ")
        f.write(json.dumps("\n".join(lineas), ensure_ascii=False) + "\n};\n")
    print("Listo: %d ciudades, %d zonas horarias, en %s" % (len(lineas), len(zonas), ruta_salida))


if __name__ == "__main__":
    main()
