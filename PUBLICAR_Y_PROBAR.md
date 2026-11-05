# AUDICAZ: instalar, probar y publicar

## Qué incluye esta entrega

- `src`: actualización del código para tu proyecto existente en C:\AudiCaz.
- `demo_web`: aplicación ya compilada, lista para cargar como sitio estático. Se construyó con tus componentes compartidos y las mejoras incluidas. No requiere instalar Python para probar el micrófono.
- `netlify.toml`: configuración para publicar el proyecto desde GitHub con npm run build y dist.
- `audio_bridge`: puente opcional para capturar entradas del dispositivo local.

Esta entrega conserva el diseño y añade acceso visitante, guía de micrófono, errores explicados, ayuda ante «No sé» y comprobaciones adaptadas a la computadora. El asistente usa reglas locales; no es una IA conectada y no modifica una consola.

## A. Actualizar tu proyecto en Windows

1. Detén `npm run dev` con Ctrl+C. Si el puente está abierto, detén también su terminal.
2. Haz una copia de seguridad de C:\AudiCaz.
3. Extrae este ZIP en una carpeta nueva.
4. Copia **el contenido de src** a C:\AudiCaz\src, combina carpetas y reemplaza los archivos incluidos. No borres tu src ni lo metas dentro de otra carpeta src.
5. Copia audio_bridge a C:\AudiCaz\audio_bridge y reemplaza server.py. Tu entorno .venv-audio y las dependencias instaladas se conservan.
6. Copia netlify.toml a C:\AudiCaz\netlify.toml si vas a publicar desde GitHub. Si ya tienes uno, conserva tu configuración necesaria y combina las secciones.
7. En C:\AudiCaz ejecuta `npm run dev` y abre la dirección que indique Vite.

El ZIP es una actualización de tu proyecto, no incluye un nuevo package.json. Mantén tus estilos, main.jsx, servicios y dependencias originales. Los archivos incluidos reemplazan las versiones anteriores de estos módulos.

## B. Recorrido para presentar la demo

1. Si ya estás dentro, cierra sesión desde Mi perfil para ver la bienvenida.
2. Pulsa **Probar AUDICAZ sin cuenta**. No necesitas correo ni contraseña. Las cuentas locales anteriores siguen disponibles desde Iniciar sesión.
3. Aparece **Tu primera prueba en tres pasos**. Elige el micrófono del navegador y pulsa Conectar mi micrófono.
4. Acepta el permiso. Habla normalmente: la barra de la única captura mono debe responder. No grites ni golpees el equipo para probar alertas.
5. Marca que comprobaste la respuesta y abre el panel. Visita Monitoreo y Análisis: comparten esa captura.
6. Desde la entrada con lectura, pulsa Consultar al asistente y escribe qué observas. La consulta guarda los valores de ese instante; no los actualiza dentro de la conversación.
7. Pulsa No sé: recibirás una explicación para comprobar ese dato. Puedes elegir Continuar sin ese dato. La guía será más general si faltan observaciones.
8. Revisa los pasos y registra el resultado real: si no los probaste, elige No lo he probado. En Historial puedes recuperar la consulta.
9. Desconecta audio al terminar: desaparecen las lecturas actuales. Al recargar, el micrófono no se activa solo; tienes que conectar otra vez.

En modo visitante se guardan preferencias y consultas con un identificador local propio. No hay sincronización de cuentas entre personas, dispositivos o dominios. El sitio de Netlify tiene almacenamiento distinto de localhost; tus consultas locales anteriores no aparecerán allí automáticamente.

## C. Subir hoy sin compilar: demo_web

1. Entra a tu cuenta de Netlify.
2. Abre la opción para agregar un sitio con despliegue manual (arrastrar una carpeta).
3. Arrastra **la carpeta demo_web** que viene en este ZIP. Contiene index.html, assets, _redirects y _headers. No arrastres la carpeta src ni el ZIP completo.
4. Espera a que termine el despliegue y abre la dirección HTTPS que Netlify asigne.
5. Haz el recorrido B en el enlace publicado. Comprueba en otra computadora que pueda entrar como visitante y pedir permiso para su propio micrófono.

No abras index.html con doble clic como prueba de publicación. La prueba debe realizarse desde el enlace HTTPS o desde el servidor local de Vite.

La carpeta demo_web es una compilación fija de esta entrega. Si luego cambias src, vuelve a compilar tu proyecto y publica su carpeta dist; los cambios de código no modifican automáticamente esta demo ya compilada.

## D. Publicar desde tu repositorio

1. En tu proyecto actualizado ejecuta `npm run build`. Si falla, revisa el error antes de publicar; conserva package.json y lockfile del proyecto.
2. Sube al repositorio el código y netlify.toml. No subas .venv-audio, node_modules ni archivos privados.
3. Conecta el repositorio en Netlify: comando `npm run build`, directorio de publicación `dist`, carpeta base la raíz donde está package.json.
4. Publica y realiza el recorrido B desde el enlace HTTPS. netlify.toml contiene la redirección a index.html.

## E. Python: opcional para probar una interfaz multicanal

El modo web con micrófono funciona sin el puente. El puente se ejecuta en la computadora donde esté conectada la interfaz; publicarlo en un servidor remoto no le da acceso a los USB de esa computadora. No abras el puerto del puente al exterior.

Si ya instalaste las dependencias, para localhost usa en una segunda terminal CMD:

```bat
cd /d C:\AudiCaz
.\.venv-audio\Scripts\python.exe audio_bridge\server.py
```

Deja esa terminal abierta. Puedes comprobar el servicio en http://127.0.0.1:8765/health. Debe indicar status ok. Si se cierra la terminal, el modo puente deja de funcionar.

Para intentar conectar desde tu dominio publicado, detén el puente y autoriza **tu dominio HTTPS exacto** en la misma terminal CMD. Sustituye el ejemplo por tu enlace real:

```bat
cd /d C:\AudiCaz
set "AUDICAZ_ALLOWED_ORIGINS=https://tu-sitio.netlify.app"
.\.venv-audio\Scripts\python.exe audio_bridge\server.py
```

En PowerShell, la variable se establece con `$env:AUDICAZ_ALLOWED_ORIGINS="https://tu-sitio.netlify.app"`. No incluyas rutas de páginas ni una barra final. Si utilizas varios dominios explícitos, sepáralos con coma.

Después abre la web, selecciona Interfaz multicanal mediante puente local y busca dispositivos. El navegador puede pedir permiso de acceso a la red local. La compatibilidad de esta conexión desde HTTPS depende del navegador y debe probarse en el enlace publicado. Si no funciona, usa la demo con micrófono y prueba el puente desde localhost; no desactives protecciones del navegador.

Si preparas una computadora nueva, una sola vez:

```bat
cd /d C:\AudiCaz
py -m venv .venv-audio
.\.venv-audio\Scripts\python.exe -m pip install -r audio_bridge\requirements.txt
```

## Lo que todavía requiere trabajo y pruebas

- Confirmar en la XR18 real qué controlador permite capturar sus canales y verificar el enrutamiento USB entrada por entrada. Abrir dos canales del micrófono de la laptop no demuestra dos instrumentos separados.
- El puente actual entrega pico y RMS por canal, y evolución de picos en la web. El espectro y la forma de onda están disponibles para la captura del navegador; el puente aún no los envía.
- La salida principal necesita un retorno de mezcla real confirmado. No se obtiene sumando lecturas de entradas.
- Señal muy baja es un aviso condicionado: hay que indicar «Debe sonar ahora» y mantener RMS inferior a -65 dBFS durante cinco segundos. El ruido de fondo puede impedir activarlo. Eso no justifica cambiar el umbral sin una prueba de referencia.
- No hay control automático de consola ni diagnóstico automático de acoples, balance de instrumentos o calidad audible. Las recomendaciones son comprobaciones basadas en respuestas y una referencia numérica guardada.
- Las cuentas reales, recuperación por correo y sincronización en la nube quedan para otra etapa.

## Referencias técnicas de publicación

- Netlify, Vite: https://docs.netlify.com/build/frameworks/framework-setup-guides/vite/
- Chrome, permisos de acceso a la red local: https://developer.chrome.com/blog/local-network-access
- MDN, acceso al micrófono: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
