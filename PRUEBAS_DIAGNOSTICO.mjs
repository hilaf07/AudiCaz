import assert from 'node:assert/strict';
import {inferSymptom,inferSource,applyAnswer} from './src/diagnostics/rules.js';
import {snapshotContext,startDiagnostic,answerDiagnostic,monitoringEvidence,recordOutcome} from './src/diagnostics/engine.js';
const examples=[['Mi voz se escucha baja, ¿qué puedo revisar?','low'],['La voz está baja','low'],['Las voces se oyen bajas','low'],['La guitarra suena bajo','low'],['Mi voz se oye bajito','low'],['Se escucha débil','low'],['Casi no se escucha la voz','low'],['No se escucha bien','low'],['Se oye apenas','low'],['No se escucha nada','silence'],['Se escucha muy fuerte','high'],['La guitarra se oye alta','high'],['El bajo suena bien',null],['No está baja',null],['Mi voz no está fuerte, está baja','low'],['La guitarra no está distorsionada',null],['Hay un silbido agudo','feedback'],['El sonido se corta','intermittent']];
let failures=0;for(const [s,want] of examples){try{assert.equal(inferSymptom(s),want,s);}catch(e){failures++;console.error(e.message);}}
assert.equal(inferSource('Mi voz se escucha baja').id,2);
const user={group:'Prueba',setup:{equipment:'Solo bocinas',microphones:0,instruments:['Guitarra']}};
const raw={source:'browser',connected:true,running:true,label:'Micrófono Intel',capturedAt:new Date().toISOString(),selectedInput:{number:6,name:'Voz de Ana',type:'Voz'},channels:[{id:6,name:'Voz de Ana',level:-22,rms:-35}]};
const context=snapshotContext(user,raw);let session=startDiagnostic('Revisar entrada 6: Voz de Ana. Fuente: Voz. Describe el problema para comenzar.',context);
assert.equal(session.channel.inputNumber,6);assert.equal(session.channel.id,2);assert.equal(session.question.id,'symptom');
session=answerDiagnostic(session,'Mi voz se escucha baja, ¿qué puedo revisar?',snapshotContext(user,{source:'simulated',channels:[]}));assert.equal(session.symptom,'low');assert.equal(session.question.id,'timing');assert.equal(session.context.monitoring.source,'browser');
for(const response of ['Todo el tiempo','En todas las bocinas','No hubo cambios que recuerde','Sí, cerca se escucha bien'])session=answerDiagnostic(session,response,context);
assert(session.diagnosis);assert.equal(session.evidence.kind,'real');assert.equal(session.evidence.reading.level,-22);assert(session.diagnosis.steps[0].includes('Voz de Ana'));assert(!session.diagnosis.steps[0].includes('no hay un único canal'));
const oldName=session.context.selectedInput.name;raw.selectedInput.name='Guitarra nueva';assert.equal(session.context.selectedInput.name,oldName);
assert.equal(recordOutcome(session,'Sigue igual').outcome.code,'unresolved');
const stale=snapshotContext(user,{...raw,capturedAt:new Date(Date.now()-10000).toISOString()});assert.equal(stale.monitoring.channels.length,0);assert.equal(stale.monitoring.connected,false);
const unknown=startDiagnostic('Tengo un problema',{...context,selectedInput:{number:3,name:'Entrada 3',type:'Por configurar'}});assert.equal(unknown.channel.id,null);
const base=snapshotContext(user,{source:'simulated',running:true,channels:[{id:2,name:'Voces',level:-10}]});const demo=startDiagnostic('Mi voz se escucha baja',base);assert.equal(monitoringEvidence(demo).kind,'simulated');
if(failures)process.exit(1);console.log('Diagnóstico: '+examples.length+' expresiones, flujo completo, entrada física 6 distinta de salida principal, captura real, preservación de contexto, datos vencidos y resultados verificados.');
