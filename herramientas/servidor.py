#!/usr/bin/env python3
"""Sirve la app en http://localhost:8765 sin que el navegador guarde copias viejas.

Uso:
    python3 herramientas/servidor.py

Solo hace falta mientras se desarrolla: así cada cambio se ve al recargar.
Para usar la app basta con abrir index.html con doble clic.
"""
import functools
import http.server
import os
import sys


class SinCopiasViejas(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, formato, *args):
        pass


if __name__ == "__main__":
    puerto = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    raiz = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    manejador = functools.partial(SinCopiasViejas, directory=raiz)
    servidor = http.server.ThreadingHTTPServer(("127.0.0.1", puerto), manejador)
    print("Carta Astral en http://localhost:%d" % puerto, flush=True)
    servidor.serve_forever()
