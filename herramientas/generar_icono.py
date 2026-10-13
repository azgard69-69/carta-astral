#!/usr/bin/env python3
"""Dibuja el icono de la app (iconos/icono-512.png e iconos/icono-192.png).

Uso:
    python3 herramientas/generar_icono.py iconos

Es una versión mínima de la rueda: fondo índigo, borde negro con filo dorado, cielo azul,
suelo terracota y un Sol dorado.
"""
import math
import os
import struct
import sys
import zlib

INDIGO, NEGRO, ORO = (29, 24, 87), (20, 16, 12), (245, 196, 81)
CIELO, SUELO, ANILLO = (45, 90, 158), (200, 104, 58), (30, 63, 124)


def color(x, y):
    """Color del punto (x, y), con el icono ocupando el cuadrado de -1 a 1. None = transparente."""
    # Esquinas redondeadas del fondo.
    ex, ey = max(abs(x) - 0.78, 0), max(abs(y) - 0.78, 0)
    if math.hypot(ex, ey) > 0.22:
        return None
    r = math.hypot(x, y)
    if r > 0.86:
        return INDIGO
    if r > 0.83:
        return ORO
    if r > 0.70:
        return NEGRO
    if r > 0.675:
        return ORO
    if r > 0.56:
        return ANILLO
    if r > 0.54:
        return ORO
    # El Sol, arriba a la derecha, con su mano hacia el borde.
    sx, sy = 0.24, -0.26
    if math.hypot(x - sx, y - sy) < 0.105:
        return ORO
    largo = (x * sx + y * sy) / math.hypot(sx, sy)
    if 0.08 < largo < 0.54 and abs(x * sy - y * sx) / math.hypot(sx, sy) < 0.022:
        return ORO
    if r < 0.085:
        return ANILLO
    if r < 0.105:
        return ORO
    if abs(y) < 0.014:
        return ORO
    if y < 0:
        return CIELO
    return NEGRO if math.hypot(x, y - 0.27) < 0.25 else SUELO


def dibujar(lado, muestras=3):
    filas = bytearray()
    for py in range(lado):
        filas.append(0)
        for px in range(lado):
            suma, opaco = [0, 0, 0], 0
            for sy in range(muestras):
                for sx in range(muestras):
                    c = color((px + (sx + 0.5) / muestras) / lado * 2 - 1, (py + (sy + 0.5) / muestras) / lado * 2 - 1)
                    if c:
                        opaco += 1
                        suma = [suma[i] + c[i] for i in range(3)]
            total = muestras * muestras
            filas += bytes([suma[i] // opaco if opaco else 0 for i in range(3)] + [255 * opaco // total])
    return bytes(filas)


def guardar_png(datos, lado, ruta):
    def trozo(tipo, cuerpo):
        todo = tipo + cuerpo
        return struct.pack(">I", len(cuerpo)) + todo + struct.pack(">I", zlib.crc32(todo) & 0xFFFFFFFF)

    with open(ruta, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n")
        f.write(trozo(b"IHDR", struct.pack(">IIBBBBB", lado, lado, 8, 6, 0, 0, 0)))
        f.write(trozo(b"IDAT", zlib.compress(datos, 9)))
        f.write(trozo(b"IEND", b""))


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    os.makedirs(sys.argv[1], exist_ok=True)
    for lado in (512, 192):
        ruta = os.path.join(sys.argv[1], "icono-%d.png" % lado)
        guardar_png(dibujar(lado), lado, ruta)
        print("Listo:", ruta)
