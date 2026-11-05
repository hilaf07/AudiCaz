# Verificación de la captura compartida

- Compilación integrada de producción con React y Vite: correcta en entorno aislado. No se dispuso del package.json o lockfile original para comprobar sus versiones exactas.
- Pruebas de niveles, RMS, asociación mono, frescura de datos e historial: correctas.
- Pruebas de reconocimiento de 18 expresiones, recorrido completo del asistente, contexto conservado y datos vencidos: correctas.
- Pruebas del ciclo de avisos: sin duplicados sostenidos, revisión independiente, recuperación con histéresis, medición interrumpida y nombres históricos: correctas.
- Prueba de interfaz con React en DOM de prueba y APIs de audio simuladas: una sola captura siguió activa al navegar por panel, monitoreo, análisis, asistente e historial; se verificaron forma de onda, apertura de consulta desde historial, aviso activo, revisión manual, recuperación y desconexión.
- No hubo prueba visual de navegador real en este entorno. Las pruebas de DOM no verifican compatibilidad del dispositivo físico.
- El puente mantiene la captura anterior e incorpora autorización explícita de dominios HTTPS y una ruta de estado /health. No se probó una XR18 física, ASIO ni enrutamiento USB.

Pruebas manuales necesarias: navegador y micrófono del usuario, pérdida de permisos, desconexión física e interfaz multicanal.

## Verificación adicional de la demo

- Compilación de Experience, Access y Profile con el acceso visitante: correcta.
- Prueba en DOM con permisos y audio simulados: acceso sin cuenta, no pedir micrófono automáticamente, mensaje tras permiso denegado, reintento, confirmación del medidor, navegación conservando captura, ayuda No sé y perfil visitante guardado tras remontar la aplicación: correctos.
- Ayuda progresiva: la primera respuesta No sé explica cómo comprobar el dato; Continuar sin ese dato permite avanzar, sin un ciclo de preguntas obligatorio.
- La guía de computadora comprueba captura y permisos y no prescribe controles de una consola. El nivel guardado modifica la comprobación sugerida; no confirma causas acústicas.
- demo_web es una compilación estática de los componentes originales disponibles y las actualizaciones. No se contó con las versiones exactas del package.json original.
- Publicación en Netlify, permisos en un navegador físico y conexión HTTPS al puente: pendientes de prueba con el enlace del usuario. No se realizó un despliegue externo.

## Actualización ambiental

Se añadieron referencia relativa de cinco segundos, observaciones automáticas de nivel y tono persistente, recuperación, historial y CSV. Pruebas de núcleo con señales sintéticas: correctas. Pruebas de interfaz con micrófono simulado: correctas. No se validó la precisión del detector de posibles acoples con audio real; no identifica instrumentos ni mide dB SPL. Ver ESCUCHA_AMBIENTAL_EMPEZAR.md.
