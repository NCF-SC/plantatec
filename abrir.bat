@echo off
cd /d "%~dp0"
start "" "http://127.0.0.1:8765/"
py -3 -m http.server 8765
pause
