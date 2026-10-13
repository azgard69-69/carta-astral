#!/usr/bin/env python3
"""Genera css/brillantina.png: el mosaico de puntitos dorados del fondo.

Uso:
    python3 herramientas/generar_brillantina.py css/brillantina.png

Es una sola imagen pequeña que el navegador repite. Dibujarla así es muchísimo más
rápido que hacer la brillantina con degradados. Cambia PUNTOS para más o menos brillo.
"""
import math
import random
import struct
import sys
import zlib

LADO = 512          # tamaño del mosaico en píxeles
PUNTOS = 60         # cuántos puntitos caben en un mosaico
SEMILLA = 7         # misma semilla = mismo dibujo cada vez
COLORES = [(245, 196, 81), (255, 226, 150)]


def dibujar():
    azar = random.Random(SEMILLA)
    # Cada píxel guarda [rojo, verde, azul, opacidad]; empieza transparente.
    px = [[0, 0, 0, 0.0] for _ in range(LADO * LADO)]
    for _ in range(PUNTOS):
        cx, cy = azar.uniform(0, LADO), azar.uniform(0, LADO)
        radio = azar.choice([0.7, 0.8, 0.8, 1.0, 1.0, 1.2, 1.5])
        fuerza = azar.uniform(0.5, 0.95)
        color = azar.choice(COLORES)
        alcance = int(radio) + 2
        for dy in range(-alcance, alcance + 1):
            for dx in range(-alcance, alcance + 1):
                x, y = int(cx) + dx, int(cy) + dy
                distancia = math.hypot(x + 0.5 - cx, y + 0.5 - cy)
                cobertura = max(0.0, min(1.0, radio + 0.5 - distancia)) * fuerza
                if cobertura <= 0:
                    continue
                # El módulo hace que el dibujo continúe por el borde contrario: no se nota la unión.
                p = px[(y % LADO) * LADO + (x % LADO)]
                if cobertura > p[3]:
                    p[0], p[1], p[2], p[3] = color[0], color[1], color[2], cobertura
    return px


def guardar_png(px, ruta):
    filas = bytearray()
    for y in range(LADO):
        filas.append(0)
        for x in range(LADO):
            r, g, b, a = px[y * LADO + x]
            filas += bytes((r, g, b, round(a * 255)))

    def trozo(tipo, datos):
        cuerpo = tipo + datos
        return struct.pack(">I", len(datos)) + cuerpo + struct.pack(">I", zlib.crc32(cuerpo) & 0xFFFFFFFF)

    with open(ruta, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n")
        f.write(trozo(b"IHDR", struct.pack(">IIBBBBB", LADO, LADO, 8, 6, 0, 0, 0)))
        f.write(trozo(b"IDAT", zlib.compress(bytes(filas), 9)))
        f.write(trozo(b"IEND", b""))


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    guardar_png(dibujar(), sys.argv[1])
    print("Listo: %s (%d x %d, %d puntos)" % (sys.argv[1], LADO, LADO, PUNTOS))
