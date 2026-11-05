# Actualización: escucha ambiental sin Python

Empieza por **ESCUCHA_AMBIENTAL_EMPEZAR.md**. Incluye instalación, actualización del mismo enlace de Netlify y prueba con guitarra y amplificador sin USB.

# Nueva entrega: demo funcional para publicar

Empieza por **PUBLICAR_Y_PROBAR.md**. Incluye instrucciones sencillas para actualizar C:\AudiCaz y para subir la carpeta **demo_web**, ya compilada, a Netlify.

Se añadieron acceso visitante, guía de primera prueba, errores explicados, ayuda al responder «No sé» y pasos propios para el micrófono de la computadora. También se incluyen Access.jsx, Experience.jsx y Profile.jsx actualizados. El puente continúa siendo opcional.

---

# AUDICAZ — Captura compartida y módulos con datos reales

Esta actualización se aplica sobre el proyecto existente en C:\AudiCaz. Conserva la identidad visual, acceso local, perfil y conversaciones guardadas. Los módulos principales dejan de usar las señales inventadas de la demostración.

## Instalar

1. Detén Vite con Ctrl+C.
2. Haz una copia de seguridad de C:\AudiCaz.
3. Extrae este ZIP en una carpeta nueva para evitar confundir descargas anteriores.
4. Copia la carpeta src del ZIP dentro de C:\AudiCaz, combinando las carpetas y aceptando reemplazar los archivos incluidos.
5. NO borres tu src ni crees src\src. Conserva main.jsx, estilos originales, services y los demás archivos del proyecto.
6. Actualiza también audio_bridge con la carpeta incluida. Conserva .venv-audio; no necesitas reinstalar dependencias.
7. Abre la terminal en C:\AudiCaz y ejecuta npm run dev.

### Archivos incluidos en src

| Archivo | Ubicación final |
| --- | --- |
| App.jsx | C:\AudiCaz\src\App.jsx |
| AudioProvider.jsx | C:\AudiCaz\src\AudioProvider.jsx |
| AudioViews.jsx | C:\AudiCaz\src\AudioViews.jsx |
| LiveAudio.jsx | C:\AudiCaz\src\LiveAudio.jsx |
| audioCore.mjs | C:\AudiCaz\src\audioCore.mjs |
| browserAudio.mjs | C:\AudiCaz\src\browserAudio.mjs |
| alertLifecycle.mjs | C:\AudiCaz\src\alertLifecycle.mjs |
| liveAudio.css | C:\AudiCaz\src\liveAudio.css |
| Los archivos de diagnostics | C:\AudiCaz\src\diagnostics\ |

No necesitas instalar nuevas dependencias de npm: usa React y lucide-react, ya presentes en el proyecto original. Este ZIP es una actualización; no incluye package.json para empezar desde cero.

## Qué cambia

- AudioProvider conserva una única captura durante la navegación entre pantallas.
- El panel principal muestra el estado real de conexión, entradas capturadas y avisos activos.
- Monitoreo usa los mismos nombres y lecturas de Entradas y audio real.
- Análisis permite seleccionar una entrada. Para la captura mono del navegador muestra espectro, forma de onda y evolución de picos recibidos. Para el puente muestra los niveles disponibles y evolución de picos; no inventa espectro ni forma de onda donde no existen datos.
- El centro de alertas y recomendaciones utiliza avisos reales de pico cercano al límite digital y señal muy baja durante una prueba indicada por el usuario.
- La condición de un aviso es independiente de su revisión manual. Cuando un pico baja por debajo de -3 dBFS durante dos segundos, se registra que la condición dejó de observarse. Eso no confirma una solución audible. Al perder lecturas se registra medición interrumpida, no recuperación.
- Historial reúne accesos a avisos de mediciones y consultas del asistente; los exporta por separado a CSV. Los avisos de ejemplo anteriores no se mezclan con avisos reales. Las consultas antiguas se conservan con su procedencia.
- El asistente recibe una captura numérica al iniciar y conserva ese contexto. La captura global puede continuar, pero el diagnóstico no reinterpreta continuamente el audio ni actualiza esa referencia histórica.
- Desconectar detiene los recursos de captura y retira los valores actuales de todas las vistas. Recargar, cerrar sesión o abrir el asistente de configuración completa del perfil también detiene la captura; conectar otra vez requiere una acción explícita.

## Primera prueba en tu computadora

1. Abre Entradas y audio real.
2. Usa Micrófono o entrada del navegador y el dispositivo predeterminado.
3. Asocia la captura mono a la entrada 2; configura su fuente como Voz.
4. Pulsa Conectar audio y permite usar el micrófono.
5. Habla a volumen normal. Solo la entrada asociada debe tener lectura.
6. Abre Panel principal: debe indicar Captura real activa y una entrada capturada.
7. Abre Monitoreo de canales: debe aparecer el mismo nombre y la lectura de esa entrada.
8. Selecciona esa entrada en Análisis de audio: el espectro y la forma de onda deben responder.
9. Consulta al asistente. Comprueba que la captura global continúa activa y que el lateral del asistente identifica la referencia guardada.
10. Abre Historial, Consultas del asistente y una consulta: debe recuperar la conversación.
11. Pulsa Desconectar audio en la franja superior. En Monitoreo, todas las tarjetas deben quedar Sin lectura.

La etiqueta de la tarjeta no cambia los cables físicos. La captura del navegador es mono: no separa varios instrumentos que el micrófono escucha juntos.

## Avisos y seguimiento

Los avisos de pico se generan desde -1 dBFS. No subas bocinas ni grites para provocarlos. Puedes comprobar la lógica sin hardware ejecutando PRUEBAS_ALERTAS.mjs.

El aviso de señal muy baja exige marcar Debe sonar ahora en una entrada que esté capturada. Si permanece por debajo de -65 dBFS durante cinco segundos, se registra. El ruido de fondo de un micrófono puede superar ese umbral aunque no hables, así que guardar silencio no garantiza ese aviso.

En Centro de alertas puedes filtrar condiciones activas, avisos sin revisión manual o todos. Una condición puede seguir activa aunque marques el registro como revisado. El registro conserva el nombre que tenía la entrada cuando ocurrió.

## Puente multicanal opcional

Requiere Python 3.10 o posterior y una consola o interfaz con entradas expuestas por su controlador. Desde una segunda terminal:

```powershell
cd C:\AudiCaz
py -m venv .venv-audio
.\.venv-audio\Scripts\python.exe -m pip install -r audio_bridge\requirements.txt
.\.venv-audio\Scripts\python.exe audio_bridge\server.py
```

En la aplicación elige Interfaz multicanal mediante puente local, busca dispositivos y prueba inicialmente con dos canales. El canal USB 1 se presenta como entrada 1: confirma su correspondencia física y enrutamiento en la consola.

Si el controlador solo ofrece dos canales, el código no puede inventar los restantes. Se debe verificar el controlador oficial, el sistema de audio y el enrutamiento. No se ha validado una XR18 física ni ASIO. La conexión Wi-Fi de control no equivale a capturar audio multicanal.

El puente escucha solo en 127.0.0.1:8765 y permite frontend local en puertos 5173, 5174, 5175 y 4173. No lo publiques en Internet. Detener el puente interrumpe las lecturas de audio; el frontend debe indicarlo.

## Alcance actual

No detecta automáticamente acoples ni confirma fallas de cables. No determina por nivel digital qué instrumento tapa a otro, no mide volumen acústico de sala y no controla la consola. La salida principal sigue sin lectura hasta disponer de un retorno de mezcla correctamente configurado y comprobado.

Las cuentas y los historiales son locales de prueba. No se añadieron autenticación segura, servidor de cuentas ni sincronización entre dispositivos.

## Pruebas incluidas

Desde la carpeta extraída que contiene estos archivos:

```powershell
node PRUEBAS.mjs
node PRUEBAS_DIAGNOSTICO.mjs
node PRUEBAS_ALERTAS.mjs
```

Se verificaron compilación e integración con un dispositivo de prueba simulado. Repite las comprobaciones manuales con tu micrófono y con el equipo real antes de presentar compatibilidad con la consola.

Fuentes técnicas del mecanismo de captura:
https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/createMediaStreamSource
https://python-sounddevice.readthedocs.io/en/0.5.5/api/index.html
