#!/usr/bin/env python3
"""Convierte la guía (.odt) en js/guia.js para que la app pueda leerla.

Uso:
    python3 herramientas/generar_guia.py "fuentes/El zodiaco completi.odt" js/guia.js

Vuelve a ejecutarlo cada vez que cambies el documento de la guía.
"""
import html
import json
import os
import re
import sys
import zipfile

ELEMENTOS = ["Fuego", "Tierra", "Aire", "Agua"]
IDS = ["aries", "tauro", "geminis", "cancer", "leo", "virgo", "libra",
       "escorpio", "sagitario", "capricornio", "acuario", "piscis"]
NOMBRES = ["Aries", "Tauro", "Géminis", "Cáncer", "Leo", "Virgo", "Libra",
           "Escorpio", "Sagitario", "Capricornio", "Acuario", "Piscis"]


def leer_parrafos(ruta_odt):
    with zipfile.ZipFile(ruta_odt) as z:
        x = z.read("content.xml").decode("utf-8")
    x = x[x.find("<office:body"):]
    x = re.sub(r"<text:(tab|s)[^>]*/>", " ", x)
    x = re.sub(r"<text:line-break[^>]*/>", "\n", x)
    x = re.sub(r"</text:(p|h)>", "\n", x)
    x = re.sub(r"<[^>]+>", "", x)
    x = html.unescape(x).replace("​", "")
    lineas = [re.sub(r"\s+", " ", l).strip() for l in x.split("\n")]
    return [l for l in lineas if l and not l.startswith("<a id=")]


def limpiar(t):
    return t.strip().replace("'", "′")


def corregir(lineas):
    """Aplica herramientas/correcciones.json y avisa de las que ya no hacen falta."""
    ruta = os.path.join(os.path.dirname(os.path.abspath(__file__)), "correcciones.json")
    if not os.path.exists(ruta):
        return lineas
    with open(ruta, encoding="utf-8") as f:
        correcciones = json.load(f)
    texto = "\n".join(lineas)
    for c in correcciones:
        if c["antes"] in texto:
            texto = texto.replace(c["antes"], c["despues"])
        else:
            print("Aviso: ya no encuentro «%s» (¿lo corregiste en el documento?)" % c["antes"])
    return texto.split("\n")


def interpretar(lineas):
    signos, s, seccion, dec = [], None, None, None
    campo = {"Sol": "sol", "Luna": "luna", "Ascendente": "asc"}
    sombra = {"Sombra Solar": "sol", "Sombra Lunar": "luna", "Sombra del Ascendente": "asc"}
    for l in lineas:
        m = re.match(r"^(\d+)\.\s*([♈-♓])\s+([A-ZÁÉÍÓÚÑ]+)$", l)
        if m:
            i = len(signos)
            s = {"id": IDS[i], "nombre": NOMBRES[i], "simbolo": m.group(2),
                 "elemento": ELEMENTOS[i % 4], "triada": {}, "decanatos": [],
                 "sombra": {}, "lilith": ""}
            signos.append(s)
            seccion = None
            continue
        if s is None:
            continue
        if l.startswith("Planeta Regente:"):
            t = l.split(":", 1)[1].strip()
            m = re.match(r"^(.*?)\s*\((.*)\)\.?$", t)
            s["regente"] = {"nombre": limpiar(m.group(1)) if m else limpiar(t),
                            "descripcion": limpiar(m.group(2)) + "." if m else ""}
        elif l.startswith("Anatomía / Salud:"):
            s["anatomia"] = limpiar(l.split(":", 1)[1])
        elif l.startswith("Compatibilidad:"):
            s["compatibilidad"] = limpiar(l.split(":", 1)[1])
        elif l.startswith("La Tríada en"):
            seccion = "triada"
        elif l.startswith("Los 3 Decanatos"):
            seccion = "dec"
        elif l.startswith("La Sombra y el Lado Negativo"):
            seccion = "sombra"
        elif l.startswith("Lilith en"):
            seccion = "lilith"
        elif re.match(r"^\d\.\S*\s+Decanato", l):
            m = re.match(r"^(\d)\.\S*\s+Decanato\s+\((.+?)\s*/\s*~?(.+?)\)\s*—\s*(?:Sub-)?[Rr]egentes?:\s*(.+)$", l)
            if not m:
                raise SystemExit("No entiendo este decanato: " + l)
            reg = m.group(4).strip()
            mm = re.match(r"^(.*?)\s*\(Matiz\s+(.+?)\)$", reg)
            dec = {"grados": limpiar(m.group(2)), "fechas": limpiar(m.group(3)),
                   "regente": mm.group(1) if mm else reg,
                   "matiz": mm.group(2) if mm else s["nombre"]}
            s["decanatos"].append(dec)
            seccion = "dec"
        elif seccion == "lilith":
            s["lilith"] = (s["lilith"] + " " + limpiar(l)).strip()
        else:
            clave, _, resto = l.partition(":")
            if seccion == "triada" and clave in campo:
                s["triada"][campo[clave]] = limpiar(resto)
            elif seccion == "dec" and clave in campo and dec is not None:
                dec[campo[clave]] = limpiar(resto)
            elif seccion == "sombra" and clave in sombra:
                s["sombra"][sombra[clave]] = limpiar(resto)
    return signos


def comprobar(signos):
    if len(signos) != 12:
        raise SystemExit("Esperaba 12 signos y encontré %d" % len(signos))
    for s in signos:
        faltan = [k for k in ("regente", "anatomia", "compatibilidad", "lilith") if not s.get(k)]
        for grupo in ("triada", "sombra"):
            faltan += [grupo + "." + k for k in ("sol", "luna", "asc") if not s[grupo].get(k)]
        if len(s["decanatos"]) != 3:
            faltan.append("decanatos (hay %d)" % len(s["decanatos"]))
        for n, d in enumerate(s["decanatos"]):
            faltan += ["decanato %d.%s" % (n + 1, k) for k in ("sol", "luna", "asc") if not d.get(k)]
        if faltan:
            raise SystemExit("%s: falta %s" % (s["nombre"], ", ".join(faltan)))


def main():
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)
    signos = interpretar(corregir(leer_parrafos(sys.argv[1])))
    comprobar(signos)
    datos = {"fuente": "Guía Magna de Astrología: Tríada, decanatos, Lilith y la sombra",
             "signos": signos}
    with open(sys.argv[2], "w", encoding="utf-8") as f:
        f.write("/* Generado por herramientas/generar_guia.py a partir de la guía. No lo edites a mano. */\n")
        f.write("window.GUIA = " + json.dumps(datos, ensure_ascii=False, indent=1) + ";\n")
    print("Listo: %d signos escritos en %s" % (len(signos), sys.argv[2]))


if __name__ == "__main__":
    main()
