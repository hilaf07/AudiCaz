@echo off
cd /d "%~dp0.."
if not exist ".venv-audio\Scripts\python.exe" (
  echo Falta el entorno de Python. Consulta PUBLICAR_Y_PROBAR.md.
  pause
  exit /b 1
)
echo Para autorizar tu sitio, configura AUDICAZ_ALLOWED_ORIGINS antes de iniciar.
".venv-audio\Scripts\python.exe" "audio_bridge\server.py"
pause
