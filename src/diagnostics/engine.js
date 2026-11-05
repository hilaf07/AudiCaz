import { sources, inferSource, inferSymptom, equipmentKind, nextQuestion, applyAnswer, normalize } from './rules.js';
import {isUnknownAnswer,questionHelp} from './questionHelp.js';
import { buildPlan } from './plans.js';

export const ENGINE_VERSION = 'rules-v1';
export const welcome = 'Cuéntame qué escuchas. Te haré preguntas antes de sugerir comprobaciones. Trabajo con reglas y tus respuestas; si vienes desde una entrada real, puedo consultar la captura numérica guardada al iniciar. No escucho ni interpreto una grabación y no controlo la consola.';
const stamp = () => new Date().toISOString();
const message = (role,text,extra={}) => ({id:crypto.randomUUID(),role,text,date:stamp(),...extra});

export function snapshotContext(user = {}, monitoring) {
  const setup=user.setup || {};
  const real=monitoring && ['browser','bridge'].includes(monitoring.source);
  const selected=real && monitoring.selectedInput;
  const validSelected=selected && Number.isInteger(selected.number) && selected.number>=1 && selected.number<=18;
  const rawDate=Date.parse(monitoring?.capturedAt);
  const recent=Number.isFinite(rawDate) && Math.abs(Date.now()-rawDate)<2000;
  return {
    group:user.group || 'Sin especificar',
    setup:{equipment:setup.equipment || '',console:setup.console || '',microphones:setup.microphones ?? null,instruments:Array.isArray(setup.instruments)?[...setup.instruments]:[],speakers:setup.speakers || ''},
    selectedInput:validSelected?{number:selected.number,name:String(selected.name||'Sin nombre').slice(0,80),type:String(selected.type||'Por configurar').slice(0,80)}:null,
    monitoring:monitoring ? {
      source:real?monitoring.source:monitoring.source==='simulated'?'simulated':'unavailable',
      connected:!!(real && monitoring.connected && recent),
      capturedAt:Number.isFinite(rawDate)?monitoring.capturedAt:stamp(),
      running:!!monitoring.running,
      label:String(monitoring.label||'').slice(0,200),
      channels:Array.isArray(monitoring.channels)?monitoring.channels.filter(c=>Number.isFinite(c.level)&&(!real||(recent&&monitoring.connected))).map(c=>({id:c.id,name:c.name,level:c.level,rms:Number.isFinite(c.rms)?c.rms:null})):[],
      alerts:!real&&Array.isArray(monitoring.alerts)?monitoring.alerts.map(a=>({channel:a.channel,title:a.title,severity:a.severity})):[],
    } : {source:'unavailable',connected:false,channels:[],alerts:[],capturedAt:stamp(),running:false},
  };
}
export function monitoringEvidence(session) {
  const data=session.context.monitoring;
  const real=['browser','bridge'].includes(data.source);
  const entry=session.context.selectedInput;
  const reading=real?data.channels.find(c=>c.id===entry?.number):data.source==='simulated'?data.channels.find(c=>c.id===session.channel?.id):null;
  return {
    kind:reading?(real?'real':'simulated'):'unavailable',
    reading:reading?{...reading}:null,
    date:data.capturedAt,
    paused:real?true:!data.running,
    relatedAlerts:data.source==='simulated'?data.alerts.filter(a=>a.channel===session.channel?.id):[],
    text:reading && real
      ? `Captura real guardada al iniciar esta consulta para la entrada ${entry.number} — ${entry.name}: pico ${reading.level.toFixed(1)} dBFS${reading.rms!==null?`, RMS ${reading.rms.toFixed(1)} dBFS`:''}. Fuente: ${data.label||data.source}. Es una captura de ese momento, no monitoreo en vivo. No confirma la causa, la distorsión audible ni el volumen de la sala.`
      : reading?`Para «${reading.name}» solo hay un nivel simulado. No confirma lo que estás escuchando.`
      : 'No hay una medición real guardada para esta entrada. La orientación se basa en tus respuestas.',
  };
}

function askOrDiagnose(session) {
  const question=nextQuestion(session);
  if(question) return {...session,question,messages:[...session.messages,message('assistant',question.text,{questionId:question.id,choices:question.choices})]};
  const diagnosis=buildPlan(session);
  const evidence=monitoringEvidence(session);
  return {...session,question:null,diagnosis,evidence,status:'review',messages:[...session.messages,message('assistant','Con lo que me cuentas, estas son posibilidades para revisar. Ninguna causa está confirmada. Sigue las comprobaciones una a una y dime qué resultado obtienes.')]};
}

export function startDiagnostic(report, context) {
  const text=report.trim().slice(0,2000);
  if(!text) throw new Error('Describe qué sucede con el sonido para comenzar.');
  const selected=context.selectedInput;
  const semantic=selected?(sources.find(x=>normalize(x.name)===normalize(selected.type)) || inferSource(selected.type) || inferSource(selected.name)):null;
  const channel=selected?{id:semantic?.id??null,name:`Entrada ${selected.number} — ${selected.name}`,inputNumber:selected.number,sourceType:selected.type}:inferSource(text);
  // El reporte inicial de una entrada contiene números y el nombre del dispositivo, no un síntoma.
  const symptom=selected?null:inferSymptom(text);
  const session={id:crypto.randomUUID(),engine:ENGINE_VERSION,date:stamp(),updatedAt:stamp(),report:text,channel,symptom,equipment:equipmentKind(context.setup),context,answers:{},messages:[message('user',text)],question:null,diagnosis:null,evidence:null,status:'asking',outcome:null};
  if(channel) session.messages.push(message('assistant',`Empecemos por «${channel.name}». Haré algunas preguntas para distinguir posibles causas; no voy a cambiar tu equipo.`));
  return askOrDiagnose(session);
}

export function answerDiagnostic(session, text, context) {
  const answer=text.trim().slice(0,2000);
  if(!answer) throw new Error('Escribe una respuesta o elige una opción.');
  if(session.diagnosis) return recordOutcome(session,answer);
  const id=session.question.id;
  const unknown=isUnknownAnswer(answer)||normalize(answer)==='no se como describirlo';
  if(unknown&&!session.helpShown?.[id]) {
    const help=questionHelp(id,session);
    const question={...session.question,choices:[...session.question.choices.filter(x=>!isUnknownAnswer(x)&&normalize(x)!=='no se como describirlo'),'Continuar sin ese dato']};
    return {...session,question,updatedAt:stamp(),helpShown:{...session.helpShown,[id]:true},messages:[...session.messages,message('user',answer,{questionId:id}),message('assistant',help,{questionId:id})]};
  }
  const usable=normalize(answer)==='continuar sin ese dato'?'No lo sé':answer;
  const {session:updated,clarification}=applyAnswer(session,usable);
  const next={...updated,updatedAt:stamp(),context:session.context,messages:[...updated.messages,message('user',answer,{questionId:session.question.id})]};
  if(clarification) return {...next,messages:[...next.messages,message('assistant',clarification,{questionId:session.question.id,choices:session.question.choices})]};
  return askOrDiagnose(next);
}

export function recordOutcome(session, text) {
  const value=normalize(text);
  let code='reported', label='Resultado descrito por el usuario';
  if(/no (?:lo )?he probado|sin probar|no he (?:podido|revisado)/.test(value)){code='untested';label='Sin comprobar';}
  else if(/no .*solucion|no .*mejor|no .*funcion|sigue|persiste|todavia|aun /.test(value)){code='unresolved';label='Sigue el problema';}
  else if(/poco|parcial|algo mejor/.test(value)){code='partial';label='Mejoró un poco';}
  else if(/^(?:si[, .]*)?(?:se soluciono|ya (?:esta|se escucha) bien|funciono|se arreglo|ya no (?:hay|se escucha|suena))/.test(value)){code='resolved';label='Solucionado según el usuario';}
  const reply=code==='resolved'
    ? 'Guardé que indicas que se solucionó. No lo he comprobado con audio ni con mediciones. Conserva el ajuste y vuelve a escuchar al grupo a un nivel cómodo.'
    : code==='untested' ? 'Guardé que todavía no lo has probado. La guía queda disponible para revisarla cuando puedas; no hace falta cambiar nada ahora.'
    : 'Guardé tu observación. No sigas cambiando controles al azar. Puedes iniciar otra consulta describiendo qué cambió y qué comprobaciones hiciste, o pedir ayuda al responsable del sonido.';
  return {...session,updatedAt:stamp(),status:'review',outcome:{code,label,text,date:stamp()},messages:[...session.messages,message('user',text,{questionId:'outcome'}),message('assistant',reply)]};
}
