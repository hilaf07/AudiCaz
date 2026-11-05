// Reglas locales: no hay llamadas a un modelo de IA ni control de hardware.
export const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

export const sources = [
  { id: 1, name: 'Micrófono principal', words: /microfono principal|voz del encargado|predicador|pastor/ },
  { id: 2, name: 'Voces', words: /\b(?:voces|cantantes|coros|voz|cantando|cantar|canta)\b/ },
  { id: 3, name: 'Teclado', words: /teclado|piano/ },
  { id: 4, name: 'Guitarra', words: /guitarra/ },
  { id: 5, name: 'Batería', words: /bateria|bombo|platillos/ },
  { id: 6, name: 'Salida principal', words: /bocinas?|altavoces|altavoz|parlantes?|salida principal|todo el grupo|toda la mezcla/ },
  { id: 7, name: 'Bajo', words: /\bel bajo\b|\bbajo electrico\b/ },
];
export const symptomOptions = [
  ['low','Se escucha muy bajo'], ['high','Se escucha muy fuerte'],
  ['distortion','Suena roto o distorsionado'], ['feedback','Hay un silbido agudo'],
  ['bass','Retumban mucho los graves'], ['treble','Suena muy chillón'],
  ['echo','Hay mucho eco'], ['intermittent','El sonido se corta'],
  ['silence','No se escucha nada'], ['noise','Hay un ruido extraño'],
  ['unknown','No sé cómo describirlo'],
];
export function inferSource(text) {
  const value = normalize(text);
  const found = sources.filter(source => source.id !== 6 && source.words.test(value)).sort((a,b)=>value.search(a.words)-value.search(b.words))[0];
  if(found) return { id:found.id, name:found.name };
  // «El micrófono» no implica conocer si es el principal o el grupo de voces.
  if (/microfono|\bmicro\b/.test(value)) return null;
  const main = sources.find(source => source.id === 6 && source.words.test(value));
  return main ? { id:main.id, name:main.name } : null;
}
export function inferSymptom(text) {
  let value = normalize(text).replace(/[¿?¡!.,;:]/g,' ').replace(/\s+/g,' ').trim();
  // Quitar únicamente propiedades negadas; no convertir «no está baja» en señal baja.
  value=value.replace(/\bno\s+(?:(?:esta|estan|es|son|suena|suenan|se escucha|se escuchan|se oye|se oyen)\s+)?(?:muy\s+)?(?:fuerte[s]?|alt[oa]s?|baj[oa]s?|distorsionad[oa]s?)\b/g,' ');
  value=value.replace(/\b(?:no hay|no tiene|no tengo|sin)\s+(?:mucho\s+)?(?:eco|ruido|zumbido|silbido|distorsion)\b/g,' ');
  // «Casi no se escucha» significa nivel bajo, no ausencia total.
  if (/casi no (?:se )?(?:escucha|escuchan|oye|oyen|suena)|apenas (?:se )?(?:oye|oyen|escucha|escuchan)|(?:oye|oyen|escucha|escuchan) apenas|no (?:se )?(?:escucha|oye) (?:muy )?bien/.test(value)) return 'low';
  if (/intermit|se corta|cortes|interrup|a ratos|desaparece|va y viene/.test(value)) return 'intermittent';
  if (/no (?:se )?(?:escucha|oye|suena)|sin (?:sonido|senal)|ausencia de senal|no sale (?:sonido|audio)|no hay (?:sonido|senal)/.test(value)) return 'silence';
  if (/distors|satura|clipping|suena roto|sonido roto|raspa|suena quebrado/.test(value)) return 'distortion';
  if (/silbid|pitido|acopl|feedback|sonido agudo|chillido/.test(value)) return 'feedback';
  if (/reverbera|\beco\b|repeticion/.test(value)) return 'echo';
  if (/retumb|graves|embarrado/.test(value)) return 'bass';
  if (/chillon|agudos|estridente|muy brillante/.test(value)) return 'treble';
  if (/tapa|sobresale|demasiado (?:fuerte|alto)|muy (?:fuerte|alto)|mucho volumen|volumen (?:muy )?alto|(?:suena|suenan|escucha|escuchan|oye|oyen|esta|estan) (?:muy |demasiado )?(?:fuerte[s]?|alt[oa]s?)\b/.test(value)) return 'high';
  if (/muy baj[oa]s?|bajit|debil|poco volumen|volumen (?:muy )?bajo|no se entiende|(?:suena|suenan|escucha|escuchan|oye|oyen|esta|estan) (?:muy |demasiado )?baj[oa]s?\b/.test(value)) return 'low';
  if (/ruido|zumb|chasqu|cruj|soplido/.test(value)) return 'noise';
  return null;
}

export function equipmentKind(setup = {}, answer = '') {
  const value = normalize(answer);
  if(value) {
    if(/computadora|laptop|pc|navegador/.test(value)) return 'computer';
    if(/solo bocinas|sin consola|no (?:utilizo|uso|tengo) consola/.test(value)) return 'speakers';
    if(/portatil/.test(value)) return 'portable';
    if(/no (?:lo )?se/.test(value)) return 'unknown';
    if(/consola|mezcladora/.test(value)) return 'mixer';
  }
  if(/computadora|laptop|navegador/.test(normalize(setup.equipment))) return 'computer';
  if(setup.console === 'No utilizo consola' || setup.equipment === 'Solo bocinas') return 'speakers';
  if(setup.equipment === 'Equipo portátil') return 'portable';
  if(setup.equipment === 'Bocinas y consola' || (setup.console && !['No lo sé todavía','No utilizo consola'].includes(setup.console))) return 'mixer';
  return null;
}

export const targetedQuestions = {
  distortion: ['¿Has visto algún indicador rojo cuando aparece el sonido distorsionado?', ['Sí, se enciende en el canal','Sí, en la salida principal','No he visto indicadores rojos','No lo sé']],
  feedback: ['¿El silbido aparece al abrir el micrófono o acercarlo a una bocina?', ['Sí, coincide con el micrófono','No, también ocurre sin micrófonos','No lo sé']],
  low: ['¿El instrumento o la voz se escucha bien cerca de su origen, pero bajo por las bocinas?', ['Sí, cerca se escucha bien','También suena débil en su origen','No lo sé']],
  high: ['¿Ese instrumento tapa las voces o a los demás cuando tocan juntos?', ['Sí, tapa a los demás','Todo el grupo se escucha fuerte','No lo sé']],
  bass: ['¿El retumbo se nota más en algunos lugares de la sala?', ['Sí, cambia según el lugar','Se nota igual en toda la sala','No lo sé']],
  treble: ['¿El sonido chillón está solo en ese canal o en todo el grupo?', ['Solo en ese canal','En todo el grupo','No lo sé']],
  echo: ['¿También oyes eco al hablar en la sala con los micrófonos apagados?', ['Sí, también sin micrófonos','No, solo con el micrófono encendido','No lo sé']],
  intermittent: ['¿Has notado si los cortes coinciden con algún cable que se mueve?', ['Sí, coinciden con movimiento','No parece depender del cable','No lo sé']],
  silence: ['¿El instrumento está encendido o la persona está hablando cuando falta el sonido?', ['Sí, pero no sale por las bocinas','Todavía no lo he comprobado','No lo sé']],
  noise: ['¿Cómo describirías mejor el ruido?', ['Es un zumbido continuo','Son chasquidos o crujidos','Es un soplido','No lo sé']],
  unknown: ['¿Qué cambio notas respecto a cuando se escuchaba bien?', ['Se entiende menos','El sonido aparece y desaparece','No sé todavía']],
};

export function nextQuestion(session) {
  if(!session.channel) return { id:'channel', text:'¿En qué instrumento o canal ocurre? Si hay varios, elige uno para empezar.', choices:[...sources.map(source=>source.name),'Otro o no lo sé'] };
  if(!session.symptom) return { id:'symptom', text:`¿Cómo describirías el problema en ${session.channel.name}?`, choices:symptomOptions.map(([,label])=>label) };
  const setup=session.context.setup;
  const missingMic=[1,2].includes(session.channel.id) && setup.microphones===0;
  const instruments=Array.isArray(setup.instruments)?setup.instruments:[];
  const missingInstrument=[3,4,5,7].includes(session.channel.id) && instruments.length>0 && !instruments.some(item=>normalize(item)===normalize(session.channel.name) || normalize(item)==='otros');
  if(!session.context.selectedInput && (missingMic || missingInstrument) && !session.answers.sourceSetup) return {id:'sourceSetup',text:missingMic?`Tu configuración indica que no utilizas micrófonos. ¿Estás usando «${session.channel.name}» en esta consulta?`:`«${session.channel.name}» no aparece entre tus instrumentos guardados. ¿Lo estás utilizando ahora?`,choices:['Sí, estoy usando este canal','No, es otro canal','No lo sé']};
  if(!session.equipment) return { id:'equipment', text:'¿Con qué equipo estás trabajando? Esto me ayuda a no sugerir controles que no tienes.', choices:['Micrófono de esta computadora','Consola y bocinas','Solo bocinas','Equipo portátil','No lo sé'] };
  if(!session.answers.timing) return { id:'timing', text:'¿Cuándo sucede?', choices:['Todo el tiempo','Solo cuando alguien canta o toca','A ratos, el sonido va y viene','No lo sé'] };
  if(!session.answers.scope && session.equipment==='computer') return {id:'scope',text:'¿Estás comprobando solo la captura o también un problema que escuchas?',choices:['Solo estoy probando la captura del micrófono','También lo escucho en otra aplicación','No lo sé']};
  if(!session.answers.scope) return { id:'scope', text:setup.speakers?`Guardaste estas bocinas: «${setup.speakers}». ¿Dónde se escucha el problema?`:'¿Dónde se escucha el problema?', choices:['En todas las bocinas','Solo en una bocina','Solo en las bocinas del escenario','No lo sé'] };
  if(!session.answers.change) return { id:'change', text:'¿Comenzó después de algún cambio o ajuste?', choices:['Después de ajustar el sonido','Después de conectar o mover un cable','No hubo cambios que recuerde','No lo sé'] };
  if(!session.answers.check) {
    if(session.equipment==='computer') return {id:'check',text:'Al hablar normalmente y hacer una pausa, ¿el medidor cambia con tu voz?',choices:['Sí, sube al hablar y baja al hacer pausa','No cambia al hablar','No lo sé']};
    const [text,choices] = targetedQuestions[session.symptom] || targetedQuestions.unknown;
    return {id:'check',text,choices};
  }
  return null;
}

export function applyAnswer(session, text) {
  const question=session.question;
  const value=normalize(text);
  const next={...session,answers:{...session.answers}};
  if(question.id==='channel') {
    const exact=sources.find(source=>normalize(source.name)===value);
    next.channel=exact ? {id:exact.id,name:exact.name} : inferSource(text);
    if(!next.channel && /^(el )?(microfono )?principal$/.test(value)) next.channel={id:1,name:'Micrófono principal'};
    if(!next.channel && /otro|no (?:lo )?se|no estoy segur|desconozco/.test(value)) next.channel={id:null,name:'Canal sin identificar'};
    if(!next.channel) return {session:next,clarification:'No pude identificar el canal. Elige uno de la lista o «Otro o no lo sé»; no quiero suponerlo.'};
  } else if(question.id==='symptom') {
    const exact=symptomOptions.find(([,label])=>normalize(label)===value);
    next.symptom=exact?.[0] || inferSymptom(text);
    if(!next.symptom) next.symptom=({bajo:'low',baja:'low',debil:'low',fuerte:'high',alto:'high',distorsionado:'distortion',agudo:'feedback',grave:'bass',intermitente:'intermittent'})[value] || null;
    if(!next.symptom && /no (?:lo )?se|no estoy segur|no sabria/.test(value)) next.symptom='unknown';
    if(!next.symptom) return {session:next,clarification:'Todavía no puedo relacionar esa descripción con una regla. Elige la opción más cercana o «No sé cómo describirlo».'};
  } else if(question.id==='equipment') {
    next.equipment=equipmentKind({},text);
    if(!next.equipment) return {session:next,clarification:'Para adaptar los pasos, dime si usas consola y bocinas, solo bocinas, equipo portátil o si aún no lo sabes.'};
    next.answers.equipment=text;
  } else if(question.id==='sourceSetup') {
    if(/no,? es otro/.test(value)){next.channel=null;next.sourceUncertain=false;delete next.answers.sourceSetup;}
    else {next.answers.sourceSetup=text;next.sourceUncertain=!/^si\b/.test(value);}
  } else next.answers[question.id]=text;
  return {session:next};
}
