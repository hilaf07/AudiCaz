# AudiCaz

Prototipo interactivo de monitoreo de sonido creado con React, JavaScript, CSS y Vite.

## Asistente AudiCaz

El nuevo módulo permite describir un problema con palabras propias, responder preguntas y recibir una guía de posibles causas. Se abre desde el menú, desde **Tengo un problema con el sonido** en el panel, o desde **Consultar al asistente** en las alertas y recomendaciones. Estos accesos inician una consulta nueva sin borrar las anteriores.

El motor actual funciona con **reglas locales; no hay una IA conectada**. Reconoce descripciones sencillas de niveles bajos/altos, distorsión, silbidos o acoples, graves, agudos, eco, ruido, cortes y falta de señal. Si no reconoce el canal o el síntoma, pregunta en lugar de inventarlo. Es posible elegir opciones o escribir las respuestas, incluso «No lo sé».

Antes de ofrecer una guía pregunta cuándo ocurre, en qué bocinas, qué cambió y una comprobación específica. También confirma el equipo si no está configurado y pregunta por los canales que no coinciden con los instrumentos o micrófonos guardados. Las posibles causas incluyen comprobaciones para distinguirlas; las recomendaciones no confirman una avería ni modifican automáticamente la consola.

El contexto incluye consola, micrófonos, instrumentos y descripción opcional de bocinas guardados en la configuración. Si el usuario utiliza solo bocinas, el asistente no le indica ajustar una consola inexistente. Si el equipo o el canal siguen sin identificarse, recomienda identificarlos antes de cambiar controles.

Los datos de monitoreo se copian al consultar: canal, nivel simulado disponible, alertas simuladas, fecha y estado de pausa. Se muestran separados de las observaciones del usuario y **no se usan como confirmación de un problema real**. Un canal sin datos no recibe una lectura inventada. No hay conexión real a la consola ni medición acústica.

**Historial de diagnósticos** guarda por usuario local el reporte, fecha, canal, preguntas/respuestas, contexto consultado, causas posibles, pasos recomendados y resultado indicado por el usuario. Se puede reabrir una consulta incompleta y continuarla. La opción «Sí, se solucionó» registra una declaración del usuario, no una verificación automática, y no resuelve las alertas simuladas del sistema. La persistencia es local al navegador y mantiene las limitaciones del acceso de demostración.

### Arquitectura del asistente

- `src/diagnostics/rules.js`: reconocimiento inicial y selección de preguntas.
- `src/diagnostics/plans.js`: hipótesis, comprobaciones y pasos según síntomas y equipo.
- `src/diagnostics/engine.js`: conversación, contexto, procedencia de datos y resultados. No depende de React.
- `src/services/diagnosticRepository.js`: persistencia local de diagnósticos, separada de la lógica.
- `src/diagnostics/Assistant.jsx` y `DiagnosisCard.jsx`: chat, historial y presentación de las guías.
- `src/assistant.css`: estilos del módulo, conservando la identidad visual.

Para integrar IA en una etapa posterior, sustituir o complementar el motor mediante un servicio de backend autenticado, con claves mantenidas exclusivamente en el servidor, y reemplazar el repositorio local por endpoints autorizados. La futura integración de audio necesitará un adaptador de mediciones con su procedencia y disponibilidad; actualmente solo se admite el contexto simulado. Esta etapa no incorpora ninguno de esos servicios ni credenciales en el cliente.

## Ejecutar

Requiere Node.js 20.19+ o 22.12+ y npm.

```sh
npm install
npm run dev
```

Abre la dirección que muestra Vite, normalmente http://127.0.0.1:5173.

```sh
npm run build
npm run preview
```

## Uso

- La bienvenida permite crear una cuenta de demostración o iniciar sesión. Se admite una cuenta de prueba por navegador; utiliza una contraseña exclusiva para el prototipo.
- Al entrar por primera vez, completa el asistente de tres pasos o elige omitirlo. Puedes volver a él desde Mi perfil.
- Navega entre los seis módulos desde el menú lateral.
- Inicia o pausa los medidores con el botón superior.
- En Centro de alertas, elige uno de los cinco escenarios y pulsa Simular problema.
- Filtra por gravedad y marca las incidencias como resueltas.
- Consulta las recomendaciones o selecciona un canal para ver sus detalles.
- El historial se conserva en localStorage y puede exportarse a CSV.
- Consulta las ayudas junto a los indicadores. Las alertas importantes aparecen primero; despliega sus instrucciones para ver causas, pasos y comprobación.
- En Mi perfil puedes editar tus datos, cambiar la contraseña de prueba y cerrar sesión.

## Modo principiante

La opción **Modo principiante** aparece sobre el contenido de todos los módulos y está activada por defecto. Se guarda junto con la preferencia de pausa, sin borrar el historial ni los datos de cuenta anteriores.

- El panel ofrece un resumen en palabras sencillas y explica cada tarjeta.
- Los medidores conservan sus barras y muestran estados con texto e iconos. Los números digitales y las escalas avanzadas permanecen ocultos hasta pulsar **Ver detalles técnicos**. Al cambiar de módulo se vuelven a ocultar; desactivar el modo principiante permite verlos directamente.
- Cada módulo incluye una orientación breve. Los problemas importantes aparecen primero en el panel, las alertas y las recomendaciones.
- **¿Cómo lo soluciono?** abre una guía con el canal afectado, la explicación, la posible causa, los pasos numerados y la comprobación. Está disponible en el panel, el centro de alertas, los canales con problemas y el historial.
- Las guías explican los términos técnicos cuando se solicitan. Pueden cerrarse con Escape, mantienen el foco de teclado dentro del diálogo y lo devuelven al botón de origen al cerrar.
- Marcar como solucionado solo actualiza el ejemplo. No confirma que se haya corregido el equipo real.

**dBFS no es volumen acústico.** Describe un nivel digital, con 0 como límite de referencia. AudiCaz no mide el volumen de la sala ni de las bocinas. Esa medición requiere un micrófono de medición y calibración, ausentes en este prototipo. Los valores, gráficos y alertas son siempre simulados.

## Acceso de demostración

El registro, las preferencias, la configuración y el historial se guardan únicamente en este navegador. El historial anterior conserva su clave y se actualizan sus explicaciones sin borrar las incidencias. La contraseña se guarda como una huella con un valor aleatorio, no como texto visible; esto **no convierte el acceso local en autenticación segura**. No hay cuentas reales, permisos de servidor ni sincronización entre dispositivos. No uses información sensible.

Sin «Recordar sesión», la sesión se conserva en sessionStorage para la pestaña actual. Con esa opción se conserva en localStorage; cerrar sesión elimina ambas referencias, pero mantiene los datos de demostración. Borrar el almacenamiento del sitio en el navegador elimina la cuenta y los datos locales.

La recuperación muestra una confirmación de prueba: **no envía correos ni restablece contraseñas**. No hay un servicio de correo conectado. El adaptador `src/services/demoAccount.js` concentra las operaciones de cuenta para sustituirlas más adelante por un backend y autenticación real; esa integración no forma parte de esta etapa.

Todos los datos y gráficos son sintéticos. No se captura ni procesa audio, no se solicitan permisos de micrófono y no existe conexión con hardware ni con la Behringer XR18. Los escenarios se generan explícitamente con el botón de simulación; el temporizador solo actualiza las visualizaciones. Los dBFS son valores digitales de demostración, no medidas de presión sonora.

## Estructura

`src/App.jsx`: navegación y estado de los seis módulos originales. `src/components.jsx`: componentes visuales reutilizables. `src/data.js`: canales, escenarios e historial. `src/Experience.jsx`: flujo de acceso y configuración. `src/Access.jsx`: bienvenida y formularios de acceso. `src/Profile.jsx`: perfil y asistente. `src/Guidance.jsx`: ayudas e instrucciones. `src/services/demoAccount.js`: adaptador local de cuentas. `src/styles.css` y `src/experience.css`: identidad visual y adaptación a computadora, tablet y teléfono. No requiere backend ni claves de acceso. La tipografía usa Google Fonts con alternativas locales.

`src/LearningMode.jsx`: contexto de la vista, resumen del sonido y explicaciones. `src/SolutionDialog.jsx`: diálogo accesible de solución. `src/beginner.css`: presentación y contraste de las ayudas.

## Verificación

```sh
npm run build
npm test
npm run test:engine
```

Las pruebas de Playwright usan Microsoft Edge instalado y arrancan un servidor local en el puerto 4173. Cubren registro, validaciones, recuperación de prueba, inicio/cierre de sesión, configuración, edición del perfil y contraseña, los seis módulos originales, los cinco escenarios, filtros, resolución, persistencia, exportación y tamaños de 390, 820 y 1440 píxeles. Las capturas se guardan en `test-results/` (ignorado en Git). Para usar otro navegador, cambia `channel` en `playwright.config.js`.

`tests/beginner.spec.js` añade la comprobación de ambas vistas en todos los módulos, la preferencia persistente, los detalles técnicos opcionales, las cinco guías, su navegación con teclado y sus tamaños adaptables.

`tests/assistant.spec.js` cubre conversación libre, preguntas antes de proponer una guía, contexto del equipo, separación de datos simulados, resultados, acceso desde otros módulos, persistencia y diseño adaptable. `tests-unit/diagnostics.test.js` comprueba las reglas y los escenarios de diagnóstico con el ejecutor de pruebas de Node, sin navegador.
