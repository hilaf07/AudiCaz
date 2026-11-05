import { normalize } from './rules.js';

function cause(title, why, check) { return {title,why,check}; }
const plans = {
  low: {
    summary:'El canal podría estar llegando con poco nivel o quedar cubierto por los demás.',
    causes:[cause('Nivel bajo en la fuente o en su canal','El instrumento, micrófono o canal puede entregar poco sonido.','Escucha la fuente por sí sola y compara con lo que llega a la bocina.'),cause('Otros instrumentos lo cubren','Una voz puede parecer baja aunque su señal sea suficiente.','Compara ese canal solo y luego con todo el grupo, a un nivel cómodo.'),cause('Conexión o fuente con poca señal','Un contacto deficiente puede debilitar o interrumpir el sonido.','Con el sistema silenciado, revisa la conexión de ese canal; no cambies otros canales.')],
    review:'Revisa primero que la fuente esté activa y que su propio control de volumen no esté al mínimo.',
    action:'Escucha primero este canal por separado. Si se oye claro, compáralo con el grupo antes de subir nada.',
    verify:'Repite la misma frase o fragmento musical. Comprueba que se entienda solo y con el grupo, sin distorsión ni silbidos.',
  },
  high: {
    summary:'Ese instrumento podría sobresalir en la mezcla o estar entrando demasiado fuerte.',
    causes:[cause('Balance demasiado alto para ese canal','El canal puede tapar las voces al sumarse al grupo.','Escúchalo con el grupo y comprueba si oculta las palabras de las voces.'),cause('La fuente entrega demasiado nivel','El instrumento puede tener su propio volumen demasiado alto.','Revisa su control de volumen y si hay distorsión incluso cuando toca solo.')],
    review:'Identifica el canal antes de tocar un control. Anota su posición actual para poder volver atrás.',
    action:'Haz un ajuste pequeño hacia abajo solo en el canal afectado y vuelve a escuchar al grupo.',
    verify:'Toca el mismo fragmento con el grupo. Comprueba que se distingan las voces y los demás instrumentos sin perder claridad.',
  },
  distortion: {
    summary:'El sonido roto podría venir de una señal demasiado alta o de un problema en la fuente, la conexión o la bocina.',
    causes:[cause('Señal demasiado alta','Cuando una señal supera su límite puede sonar recortada. Esto se llama clipping.','Comprueba si un indicador rojo coincide con la distorsión; no basta con un valor simulado de AudiCaz.'),cause('Problema en una bocina o su conexión','Si solo ocurre en una bocina, el origen puede estar después de la consola.','Compara las bocinas a un nivel cómodo, sin intercambiar cables con el sistema sonando.'),cause('Distorsión en la propia fuente','Un instrumento puede distorsionar antes de llegar al sistema.','Escucha la fuente por sí misma y revisa si tiene algún efecto de distorsión activado intencionalmente.')],
    review:'Observa dónde aparece el problema: en la fuente, en un canal o solo en una bocina.',
    action:'Reduce un poco el nivel de la fuente afectada. Si la distorsión persiste a nivel bajo, detén la prueba y pide ayuda técnica.',
    verify:'Repite una frase o fragmento suave. Comprueba si el sonido vuelve a ser claro. Si una bocina sigue raspando, no la fuerces.',
  },
  feedback: {
    summary:'Podría haber un acople: el micrófono vuelve a captar el sonido de una bocina y se forma un silbido.',
    causes:[cause('Micrófono cerca de una bocina','El sonido puede entrar de nuevo al micrófono una y otra vez.','Comprueba si el silbido coincide con abrir ese micrófono o con su cercanía a la bocina.'),cause('Sonido muy agudo de otra fuente','Un tono agudo no siempre es un acople.','Si sucede también sin micrófonos abiertos, identifica qué instrumento o reproducción lo produce.')],
    review:'Si hay un silbido fuerte, baja el nivel del canal afectado y detén esa prueba antes de seguir.',
    action:'Con el nivel ya reducido, evita apuntar el micrófono a las bocinas y aumenta su distancia de ellas.',
    verify:'Habla a un nivel cómodo y comprueba si reaparece el silbido. Si vuelve, baja el canal y solicita ayuda; no sigas subiéndolo.',
  },
  bass: {
    summary:'El retumbo podría venir del sonido grave del canal o de cómo rebota el sonido en la sala.',
    causes:[cause('Demasiado sonido grave en la fuente','Los graves son los sonidos profundos, como el bombo.','Comprueba si el retumbo se escucha también con ese instrumento solo.'),cause('Acumulación de graves en la sala','En esquinas o paredes puede sentirse más retumbo.','Escucha a un nivel cómodo desde dos lugares distintos sin mover equipos pesados.')],
    review:'Compara primero el canal solo y después dos lugares de la sala.',
    action:'Prueba un pequeño descenso del nivel del canal que retumba. No cambies la salida de todo el grupo ni ajustes bandas que no conoces.',
    verify:'Repite el fragmento y comprueba si las notas se distinguen mejor sin quitar el cuerpo natural del instrumento.',
  },
  treble: {
    summary:'El sonido chillón podría venir de la fuente, de un ajuste del canal o de una bocina.',
    causes:[cause('Exceso de sonidos agudos en ese canal','Los agudos son los sonidos finos o brillantes, como los platillos.','Comprueba si solo ese canal suena chillón.'),cause('Bocina o ubicación de escucha','La sensación puede cambiar frente a una bocina.','Compara desde un lugar cómodo y con otra fuente, sin aumentar el volumen para probar.')],
    review:'Confirma si es un sonido chillón continuo o un silbido que crece al abrir un micrófono; el segundo puede ser un acople.',
    action:'Reduce ligeramente el nivel de la fuente afectada. Antes de cambiar controles de tono que no conoces, consulta a quien opera el equipo.',
    verify:'Repite el mismo fragmento a un nivel cómodo y compara si sigue siendo molesto. Si aparece un silbido, detén la prueba.',
  },
  echo: {
    summary:'El eco podría venir de un efecto añadido a las voces o de los rebotes naturales de la sala.',
    causes:[cause('Efecto añadido al canal','Un efecto puede repetir o alargar la voz. A esto se le llama eco o reverberación.','Compara si la repetición aparece solo con el micrófono encendido.'),cause('Rebotes de la sala','Paredes y superficies duras pueden devolver el sonido.','Habla sin amplificación y comprueba si también oyes una repetición o una cola larga.')],
    review:'Primero distingue si el eco está en la sala sin amplificación o aparece al usar el sistema.',
    action:'Si el equipo tiene un efecto identificado para este canal, anota su posición y reduce solo ese efecto un poco. Si no sabes cuál es, no cambies efectos compartidos.',
    verify:'Di la misma frase lentamente. Comprueba que las palabras se entiendan mejor y que no se haya alterado el sonido de otros canales.',
  },
  intermittent: {
    summary:'Los cortes podrían venir de una conexión, de la fuente o de un ajuste que interrumpe la señal.',
    causes:[cause('Conexión inestable','Un cable o conector con mal contacto puede provocar cortes.','Observa si los cortes coinciden con movimiento; revisa las conexiones solo con el sistema silenciado.'),cause('La fuente deja de emitir sonido','El instrumento o la reproducción puede interrumpirse antes del canal.','Comprueba si el sonido también se corta en la propia fuente.'),cause('Un ajuste cierra el canal','Algunos equipos tienen controles que cortan sonidos suaves.','Si los cortes aparecen solo en partes suaves y no con movimiento, pide revisar los ajustes de ese canal.')],
    review:'Anota cuándo se corta y si coincide con movimiento o partes suaves.',
    action:'Con el sistema silenciado y la fuente apagada cuando corresponda, pide revisar el cable y la conexión de ese canal. No abras equipos ni manipules conexiones eléctricas.',
    verify:'Repite el mismo fragmento después de la revisión y comprueba si se mantiene continuo. Si sigue cortándose, conserva el canal a un nivel bajo y pide ayuda.',
  },
  silence: {
    summary:'La ausencia de sonido podría venir de una fuente apagada, un canal silenciado o una conexión incompleta.',
    causes:[cause('Fuente apagada o sin volumen','El instrumento o la reproducción puede no estar emitiendo sonido.','Comprueba su encendido y volumen sin subir de golpe.'),cause('Canal silenciado o mal seleccionado','El sonido puede estar detenido en un control o entrar por otro canal.','Verifica el nombre de la entrada y si tiene un botón de silencio activado.'),cause('Conexión sin señal','Un cable suelto puede impedir que llegue sonido.','Revisa los conectores con el sistema silenciado antes de cambiar conexiones.')],
    review:'Empieza por la fuente y sigue su cable hasta la entrada que realmente utiliza.',
    action:'Comprueba que la fuente emita sonido y que la entrada correcta no esté silenciada. Mantén bajo el nivel al reactivarla.',
    verify:'Habla o toca suavemente y comprueba si vuelve el sonido del canal sin golpes fuertes, distorsión ni silbidos.',
  },
  noise: {
    summary:'El ruido podría venir de una conexión, de la fuente o del propio sistema. Su tipo ayuda a distinguirlo.',
    causes:[cause('Conector o cable con mal contacto','Puede producir crujidos o chasquidos.','Observa si coincide con movimiento y pide revisar el cable con el sistema silenciado.'),cause('Ruido en la fuente','Un instrumento o una reproducción puede aportar el ruido.','Comprueba si el ruido está presente antes de sumarse al grupo.'),cause('Zumbido o interferencia','Un zumbido continuo puede tener varias causas de conexión o alimentación.','Anota qué equipos están implicados y pide una revisión técnica; no retires la conexión a tierra ni abras equipos.')],
    review:'Distingue si es un zumbido continuo, un soplido o chasquidos, y en qué canal aparece.',
    action:'Reduce el nivel del canal afectado antes de inspeccionarlo. Revisa visualmente su conexión; no desconectes protecciones eléctricas.',
    verify:'Compara el mismo pasaje después de revisar ese canal. Si el ruido sigue, conserva tus observaciones y consulta a una persona técnica.',
  },
  unknown: {
    summary:'Todavía no hay información suficiente para proponer un ajuste concreto.',
    causes:[cause('Fuente o conexión','El cambio puede empezar en un instrumento o su cable.','Identifica una sola fuente y anota si sucede también cuando suena sola.'),cause('Balance o respuesta de la sala','Varios sonidos juntos pueden dificultar entender qué cambió.','Compara un fragmento sencillo y describe si el problema es nivel, ruido, repetición o cortes.')],
    review:'Elige un solo canal y describe una diferencia que puedas reconocer.',
    action:'No cambies controles al azar. Anota el momento del problema y pide ayuda al responsable del sonido.',
    verify:'Abre una nueva consulta con esa observación para intentar diferenciar las posibles causas.',
  },
};

export function buildPlan(session) {
  const template=plans[session.symptom] || plans.unknown;
  const data=session.context.monitoring,entry=session.context.selectedInput;
  const reading=['browser','bridge'].includes(data?.source)&&data.connected?data.channels.find(x=>x.id===entry?.number):null;
  const readingHelp=!reading?'No hay una lectura real guardada para orientar esta comprobación.':reading.level>=-1
    ? 'La captura guardada tuvo un pico cercano al límite digital. Repite la prueba hablando normalmente y comprueba el medidor; si sigue alto, revisa gradualmente el nivel de entrada del dispositivo. Ese pico no confirma distorsión audible.'
    : Number.isFinite(reading.rms)&&reading.rms< -65
    ? 'La captura guardada tenía un nivel medio muy bajo. Puede haberse tomado durante una pausa. Repite hablando normalmente; comprueba dispositivo, silencio y distancia antes de aumentar niveles.'
    : 'En esa captura no se observó un pico cercano al límite. Compara una nueva lectura al repetir el mismo sonido: una captura aislada no descarta cortes, ruido ni distorsión en otros momentos.';
  if(session.equipment==='computer')return {
    summary:session.symptom==='unknown'?'Primero comprobemos si el micrófono elegido responde a tu voz. Todavía no tenemos un problema identificado.':'Para esta prueba revisaremos la captura del micrófono de tu computadora y tus observaciones.',
    causes:[cause('Dispositivo o permiso de entrada','La aplicación puede estar usando otro micrófono o haber perdido permiso.','Confirma el dispositivo y observa si su medidor responde al hablar.'),cause('Distancia, nivel de entrada o interrupción','Una voz lejana, un micrófono silenciado o cambios de nivel pueden alterar la captura.','Prueba la misma frase a distancia normal y observa si la barra cambia también al hacer pausa.')],
    review:readingHelp,
    steps:['Revisa el micrófono seleccionado en Entradas y audio real. Conéctalo y permite el acceso si todavía no hay captura.',readingHelp,'Di una frase a volumen normal y luego haz una pausa. Si no responde, revisa el silencio y los permisos de micrófono de Windows; si el dispositivo se desconectó, búscalo y vuelve a conectar.','Si el problema se escucha en otra aplicación, compáralo allí por separado. AUDICAZ muestra la captura; no reproduce el audio ni confirma cómo suena.'],
    verification:'Repite la misma frase y confirma si el medidor sube al hablar y baja en las pausas. Registra lo que observaste. Esto comprueba respuesta de la captura, no calidad audible ni funcionamiento de una consola.',
    caution:'No necesitas gritar ni usar controles de consola para esta prueba. Las causas siguen sin confirmar y la referencia guardada no se actualiza dentro de esta consulta.'
  };
  let causes=template.causes.map(item=>({...item}));
  const scope=normalize(session.answers.scope), change=normalize(session.answers.change), check=normalize(session.answers.check), timing=normalize(session.answers.timing);
  // Las respuestas cambian el orden de las hipótesis, nunca las confirman.
  if(/solo en una/.test(scope) && session.symptom==='distortion') causes.sort((a,b)=>Number(b.title.includes('bocina'))-Number(a.title.includes('bocina')));
  if(/cable|movimiento/.test(change+' '+check) && !/no parece/.test(check)) causes.sort((a,b)=>Number(/conexion|conector/.test(normalize(b.title)))-Number(/conexion|conector/.test(normalize(a.title))));
  if(session.symptom==='echo' && check.startsWith('si')) causes.reverse();
  if(session.symptom==='feedback' && check.startsWith('no, tambien')) causes.reverse();
  if(session.symptom==='noise' && /zumbido continuo/.test(check)) causes.sort((a,b)=>Number(b.title.includes('Zumbido'))-Number(a.title.includes('Zumbido')));
  if(/va y viene/.test(timing) && causes.some(item=>/conexion|conector/.test(normalize(item.title)))) causes.sort((a,b)=>Number(/conexion|conector/.test(normalize(b.title)))-Number(/conexion|conector/.test(normalize(a.title))));
  const mixer=session.equipment==='mixer';
  const place=mixer ? `el canal «${session.channel.name}» de tu consola` : session.equipment==='portable' ? 'el control identificado de esa fuente en tu equipo portátil' : 'el control propio de la fuente afectada, si existe';
  const safety=session.channel.id===6 || session.channel.id===null
    ? 'Como no hay un único canal de entrada identificado, no cambies la salida general ni controles compartidos. Pide identificar la fuente antes de hacer un ajuste.'
    : `Para «${session.channel.name}», trabaja solo sobre ${place}. Si no puedes identificarlo con certeza, detente y pide ayuda.`;
  let action=template.action;
  if(!mixer && ['echo','silence','high','bass','treble'].includes(session.symptom)) {
    action=session.symptom==='echo'
      ? 'Si tu fuente o equipo tiene un efecto de eco claramente identificado y propio de esa fuente, anota su posición y bájalo un poco. Si no existe o no lo reconoces, no cambies controles: compara primero la sala sin amplificación.'
      : `Revisa únicamente ${place}. Anota su posición y haz cambios pequeños, uno a la vez; si no existe ese control o no lo reconoces, pide ayuda.`;
  }
  if(session.equipment==='unknown') action='Aún no conocemos tu equipo: no cambies controles. Identifica la fuente y pide al responsable del sonido revisar contigo las comprobaciones indicadas.';
  if(session.channel.id===null) action='Aún no identificamos un canal concreto. Antes de ajustar nada, pide al responsable del sonido localizar la fuente con las comprobaciones indicadas.';
  if(session.channel.id===6) action='Antes de ajustar la mezcla completa, identifica con el responsable si el problema empieza en una fuente o en una sola bocina. No cambies la salida general ni efectos compartidos para probar.';
  if(/todo el grupo/.test(check)) action='Tu respuesta indica que el problema no está limitado a un canal. Antes de cambiar niveles, identifica con el responsable qué fuente o parte del sistema lo origina; no ajustes la salida general al azar.';
  if(session.symptom==='feedback' && check.startsWith('no, tambien')) action='Como indicas que ocurre también sin micrófonos, no lo des por un acople. Identifica primero la fuente que produce el tono, a un nivel cómodo, y pide ayuda antes de cambiar controles.';
  if(session.sourceUncertain) action='El equipo guardado y el canal descrito todavía no coinciden. No cambies controles: identifica con el responsable qué fuente se está usando antes de ajustar nada.';
  return {
    summary:session.symptom==='feedback' && check.startsWith('no, tambien')?'El tono agudo podría venir de otra fuente. Tu respuesta no permite suponer que sea un acople de micrófono.':template.summary,
    causes,
    review:readingHelp,
    steps:[safety,readingHelp,template.review,action],
    verification:template.verify,
    caution:'Son posibles causas, no un diagnóstico confirmado. No cambies varios canales, no subas niveles de golpe y no modifiques conexiones mientras el sistema esté sonando. AudiCaz no cambia la consola.',
  };
}
