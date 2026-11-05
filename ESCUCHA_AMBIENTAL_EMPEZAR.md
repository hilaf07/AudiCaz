# AUDICAZ — Escucha ambiental

Esta entrega prioriza lo solicitado: escuchar el lugar con el micrófono y mostrar observaciones automáticas. Puede probarse con una guitarra y un amplificador sin USB, con voces o con el sonido de bocinas. No requiere conectar una mixer ni ejecutar Python. La captura es una mezcla mono del ambiente; las 18 entradas de la otra sección no se convierten en 18 instrumentos identificados.

## 1. Actualizar C:\AudiCaz

1. Detén Vite con Ctrl+C. Haz una copia de seguridad del proyecto.
2. Extrae este ZIP en una carpeta nueva.
3. Copia el contenido de **src** sobre C:\AudiCaz\src, combinando carpetas y reemplazando los archivos incluidos. No borres los demás archivos del proyecto ni crees src\src.
4. Conserva tu package.json, main.jsx, servicios y estilos originales. No se añadieron dependencias npm nuevas.
5. Abre una terminal en C:\AudiCaz y ejecuta `npm run dev`.
6. Abre la dirección de Vite. Al entrar a AUDICAZ aparece la nueva sección **Escucha ambiental**. Si ya estabas en una pestaña abierta, recarga.

## 2. Actualizar el enlace que ya compartiste

La carpeta **demo_web** del ZIP está compilada con esta actualización. En tu proyecto existente de Netlify (audicazprueba), abre la sección de despliegues y carga esta nueva carpeta demo_web mediante despliegue manual. No crees otro sitio y no subas el ZIP completo ni la carpeta src. Al terminar, abre https://audicazprueba.netlify.app y recarga. Si conserva una versión anterior, prueba Ctrl+F5.

Esta entrega no se publica automáticamente en tu cuenta. El sitio solo cambia después de que cargues la carpeta nueva. La web compilada no necesita tener Vite ni Python ejecutándose.

Si publicas desde GitHub, copia también netlify.toml a la raíz de tu proyecto, compila con `npm run build` y publica dist. La carpeta demo_web es una compilación fija; no cambia cuando editas src.

## 3. Probar con tu guitarra y amplificador

1. Conecta tu guitarra al amplificador como lo haces habitualmente. No conectes una salida de bocina a la computadora ni a su entrada de micrófono. Esta prueba no necesita cables entre el amplificador y AUDICAZ.
2. Coloca el celular o la computadora en una posición fija donde se escuche el amplificador, sin pegar el micrófono a la bocina. Empieza con volumen cómodo.
3. En AUDICAZ abre **Escucha ambiental** y pulsa **Escuchar ambiente**. Acepta el permiso del micrófono. Puedes buscar y seleccionar otro micrófono antes de conectar.
4. Comprueba que pico y RMS cambien al tocar y al hacer una pausa. No necesitas entrar al chat para obtener avisos.
5. Pulsa **Tomar referencia (5 segundos)** y toca un pasaje representativo, a un nivel normal, durante los cinco segundos. Al terminar debe indicar referencia guardada. Si el nivel es prácticamente nulo o demasiado cercano al límite, te pedirá repetirla.
6. Sigue tocando y conserva la posición del micrófono y sus ajustes. La aplicación compara el nivel medio capturado con esa referencia.
7. Los avisos aparecen en esa pantalla, en Centro de alertas, Recomendaciones e Historial > Escucha ambiental. Se muestran recomendaciones concretas relacionadas con cada observación, sin cuestionario previo.
8. Puedes marcar un aviso revisado; eso registra tu revisión, no borra una condición medida ni confirma que se haya arreglado el sonido.
9. Descarga el registro ambiental CSV si quieres conservar los eventos y sus mediciones.
10. Al terminar pulsa Detener escucha. Para volver a comparar tras una reconexión hay que tomar una referencia nueva.

## Qué detecta esta primera implementación

| Aviso | Regla de señal | Cómo interpretarlo |
| --- | --- | --- |
| Captura cerca de saturarse | Pico >= −1 dBFS durante al menos 0,5 s | La captura digital está cerca del límite. No mide volumen acústico ni confirma distorsión audible. |
| Nivel sobre la referencia | RMS >= referencia +10 dB y mayor de −60 dBFS durante al menos 2 s | Hay una subida sostenida relativa. Puede ser una fuente más fuerte, música que comenzó, distancia o procesamiento del micrófono. |
| Tono persistente: posible acople | Concentración espectral en 200–8000 Hz, prominencia y frecuencia aproximadamente estable durante al menos 2,5 s | Es un candidato tonal. Una nota sostenida, un silbido u otra fuente también puede activarlo. No confirma feedback. |

El aviso de tono utiliza los datos espectrales originales de la captura del navegador; no intenta deducirlo de las barras visuales. Los detectores son heurísticas exploratorias, no un clasificador acústico validado. Los umbrales son decisiones de esta implementación y necesitan ajuste con pruebas representativas.

La condición deja de estar activa después de dos segundos sin observarse. Si se interrumpe la captura, se registra medición interrumpida, no solución. Los avisos guardan la referencia vigente al detectarse; una referencia nueva no reescribe eventos anteriores. Se conserva un máximo de 300 eventos ambientales por perfil en este navegador.

## Lo que no debes asumir

- dBFS describe la señal digital. No equivale a dB SPL o dBA. No se muestran umbrales de seguridad auditiva ni se presenta esta app como sonómetro calibrado.
- Un micrófono sin calibración y los ajustes automáticos del sistema pueden cambiar la lectura. Se solicita desactivar reducción de ruido, cancelación de eco y ganancia automática; el dispositivo o navegador puede no respetarlo completamente.
- No separa guitarra, voz y batería ni identifica qué canal físico origina un tono. Tampoco modifica la mixer ni el amplificador.
- No determina automáticamente que una mezcla suena bien ni que una guitarra está demasiado alta respecto de una voz.
- Si aparece un silbido molesto, reduce o silencia su fuente sin esperar a AUDICAZ. No provoques feedback ni eleves el amplificador para probar alertas. Se puede comprobar un aviso de subida comparando primero una referencia suave con una frase normal, manteniendo ambos a niveles cómodos.
- Sin avisos no significa ausencia de problemas. La música tonal puede producir falsos positivos y algunos acoples pueden no cumplir los criterios.
- No reproduce el audio, guarda grabaciones ni envía audio a una IA. Se conservan eventos numéricos y textos localmente. El asistente de conversación anterior sigue funcionando por reglas y no interpreta una grabación.

## Mixers digital y analógica

El modo ambiental escucha lo que sale al lugar independientemente de la mixer utilizada. No depende de USB de la consola ni del amplificador. Las funciones anteriores para entradas siguen disponibles como una opción aparte en Entradas y audio real; el puente sigue siendo necesario en esa implementación multicanal. No se verificó la XR18 física.

## Celular y segundo dispositivo

Comparte el mismo enlace actualizado. La otra persona entra sin cuenta, elige Escucha ambiental y permite su propio micrófono. No requiere tu computadora ni el puente. Falta verificar el navegador y hardware de cada dispositivo. Mantén la página visible durante la prueba; bloquear pantalla o cambiar de aplicación puede interrumpir la captura. Cuando sucede, vuelve a conectar y toma otra referencia.

Sus avisos se guardan en su propio navegador, no en el tuyo. Recargar conserva los eventos, pero no reactiva el micrófono ni reutiliza la referencia.

## Verificación realizada y pendiente

Se probaron señales numéricas/espectrales sintéticas para referencia, variaciones, tono estable, ruido ancho, armónicos, frecuencia cambiante, recuperación y pérdida de muestras. Se comprobó el recorrido en React con DOM de prueba y APIs de audio sustituidas. La compilación de producción se verificó con los componentes originales disponibles.

No se probó audio físico de guitarra, acoples reales, un celular físico ni una consola en este entorno. Antes de presentar el detector como fiable, probar grabaciones representativas a niveles cómodos, registrar falsos positivos y casos no detectados. Las pruebas sintéticas no validan su precisión acústica.

## Archivos nuevos principales

- src/Ambient.jsx: pantalla, eventos, recomendaciones y exportación.
- src/ambientCore.mjs: características espectrales, referencia y detectores.
- src/useAmbient.js: conexión con la captura compartida y persistencia.
- App.jsx, AudioProvider.jsx, browserAudio.mjs, AudioViews.jsx y liveAudio.css: integración.
- PRUEBAS_AMBIENTE.mjs: pruebas puras, ejecutables con `node PRUEBAS_AMBIENTE.mjs` desde la carpeta extraída.

Referencias de capacidades y límites: https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode y https://www.cdc.gov/niosh/noise/about/app.html . Las reglas de detección de esta entrega son propias del prototipo, no una certificación de esas fuentes.
