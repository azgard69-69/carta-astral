@echo off
rem Abre Carta Astral en su propia ventana, sin las barras del navegador.
rem Usa Microsoft Edge, que viene con Windows; si no esta, abre el navegador de siempre.
set "PAGINA=%~dp0index.html"
set "PAGINA=%PAGINA:\=/%"
start "" msedge --app="file:///%PAGINA%" 2>nul || start "" "%~dp0index.html"
