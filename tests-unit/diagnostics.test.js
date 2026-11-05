import test from 'node:test';
import assert from 'node:assert/strict';
import { startDiagnostic, answerDiagnostic, snapshotContext, monitoringEvidence } from '../src/diagnostics/engine.js';
import { inferSource, inferSymptom } from '../src/diagnostics/rules.js';

const user={group:'Prueba',setup:{equipment:'Bocinas y consola',console:'Behringer XR18',instruments:['Teclado','Guitarra','Batería'],microphones:3,speakers:'Dos bocinas al frente'}};
const context=snapshotContext(user,{source:'simulated',connected:false,running:true,channels:[{id:2,name:'Voces',level:-12}],alerts:[],capturedAt:'2026-11-03T20:00:00Z'});
function finish(session,answers={}){
  let count=0;
  while(session.question && count++<12) session=answerDiagnostic(session,answers[session.question.id] || 'No lo sé',context);
  assert.ok(session.diagnosis,'Debe ofrecer una guía tras las preguntas');
  return session;
}
for(const [report,symptom,channel] of [
  ['Las voces se escuchan muy bajas.','low',2],
  ['El teclado suena demasiado fuerte.','high',3],
  ['Las bocinas se escuchan distorsionadas.','distortion',6],
  ['El micrófono principal hace un sonido agudo.','feedback',1],
  ['La guitarra se escucha muy débil.','low',4],
  ['Hay mucho eco en las voces.','echo',2],
  ['La batería tapa los demás instrumentos.','high',5],
  ['El teclado retumba mucho en graves.','bass',3],
  ['La guitarra suena muy chillona.','treble',4],
  ['La guitarra se corta a ratos.','intermittent',4],
  ['No se escucha el teclado.','silence',3],
  ['Escucho un ruido extraño en las voces.','noise',2],
]) test(`regla y diagnóstico guiado: ${report}`,()=>{
  const initial=startDiagnostic(report,context);
  assert.equal(initial.symptom,symptom);assert.equal(initial.channel.id,channel);
  assert.equal(initial.diagnosis,null);assert.equal(initial.question.id,'timing');
  const completed=finish(initial);
  assert.equal(completed.messages.filter(m=>m.role==='user').length,5);
  assert.ok(completed.diagnosis.causes.length>=2);
  assert.equal(completed.diagnosis.steps.length,3);
  assert.ok(completed.diagnosis.causes.every(c=>c.why && c.check));
});
test('pregunta por canal y síntoma ambiguos sin adivinarlos',()=>{
  let s=startDiagnostic('Escucho un ruido extraño.',context);
  assert.equal(s.question.id,'channel');
  s=answerDiagnostic(s,'no tiene nada que ver',context);
  assert.equal(s.question.id,'channel');assert.equal(s.diagnosis,null);
  s=answerDiagnostic(s,'el principal',context);assert.equal(s.channel.id,1);
  assert.equal(inferSource('El altavoz se escucha mal').id,6);
  assert.equal(inferSource('La batería tapa las voces').id,5);
  assert.equal(inferSymptom('No está fuerte, la guitarra se escucha muy débil'),'low');
});
test('contexto y equipos: no manda ajustar una consola inexistente',()=>{
  const onlySpeakers=snapshotContext({setup:{equipment:'Solo bocinas',console:'No utilizo consola'}},null);
  let s=startDiagnostic('El teclado está muy fuerte',onlySpeakers);
  assert.equal(s.equipment,'speakers');
  // Mantiene el contexto real de esta sesión en cada respuesta.
  while(s.question) s=answerDiagnostic(s,'No lo sé',onlySpeakers);
  assert.ok(!s.diagnosis.steps.some(step=>/de tu consola/.test(step)));
  assert.match(s.diagnosis.steps.join(' '),/si existe/);
});
test('falta de configuración: pregunta por equipo y acepta no saberlo',()=>{
  const ctx=snapshotContext({},null);
  let s=startDiagnostic('Mi guitarra se escucha muy débil',ctx);
  assert.equal(s.question.id,'equipment');
  while(s.question) s=answerDiagnostic(s,'No lo sé',ctx);
  assert.equal(s.equipment,'unknown');assert.match(s.diagnosis.steps.join(' '),/no cambies controles/);
});
test('no inventa niveles ni confunde simulación y medición real',()=>{
  const s=startDiagnostic('Las voces se escuchan muy bajas',context);
  const evidence=monitoringEvidence(s);
  assert.equal(evidence.kind,'simulated');assert.equal(evidence.reading.level,-12);
  assert.match(evidence.text,/No hay conexión/);
  const missing=startDiagnostic('El bajo eléctrico se escucha muy débil',context);
  assert.equal(monitoringEvidence(missing).reading,null);
  const unconnected=startDiagnostic('Las voces se escuchan muy bajas',snapshotContext(user,null));
  assert.equal(monitoringEvidence(unconnected).kind,'unavailable');
  assert.equal(snapshotContext(user,{source:'real',connected:true,channels:[]}).monitoring.connected,false);
});
test('las respuestas diferencian causas sin confirmarlas',()=>{
  const oneSpeaker=finish(startDiagnostic('Las bocinas se escuchan distorsionadas',context),{scope:'Solo en una bocina'});
  assert.match(oneSpeaker.diagnosis.causes[0].title,/bocina/);
  const room=finish(startDiagnostic('Hay eco en las voces',context),{check:'Sí, también sin micrófonos'});
  assert.equal(room.diagnosis.causes[0].title,'Rebotes de la sala');
  const noMic=finish(startDiagnostic('El micrófono principal hace un sonido agudo',context),{check:'No, también ocurre sin micrófonos'});
  assert.match(noMic.diagnosis.summary,/no permite suponer/);
});
test('confirma instrumentos o micrófonos que no coinciden con el perfil',()=>{
  const ctx=snapshotContext({setup:{equipment:'Solo bocinas',console:'No utilizo consola',microphones:0,instruments:['Teclado']}},null);
  let s=startDiagnostic('La guitarra se escucha muy débil',ctx);
  assert.equal(s.question.id,'sourceSetup');
  s=answerDiagnostic(s,'No, es otro canal',ctx);assert.equal(s.question.id,'channel');
  s=answerDiagnostic(s,'Teclado',ctx);assert.equal(s.channel.id,3);
  let mic=startDiagnostic('El micrófono principal produce un silbido',ctx);
  assert.equal(mic.question.id,'sourceSetup');
  mic=answerDiagnostic(mic,'No lo sé',ctx);
  while(mic.question) mic=answerDiagnostic(mic,'No lo sé',ctx);
  assert.match(mic.diagnosis.steps.join(' '),/todavía no coinciden/);
});
test('guarda resultado como reporte del usuario sin alterar alertas',()=>{
  const s=finish(startDiagnostic('Las voces se escuchan muy bajas',context));
  assert.equal(answerDiagnostic(s,'No se solucionó',context).outcome.code,'unresolved');
  assert.equal(answerDiagnostic(s,'No he logrado solucionarlo',context).outcome.code,'unresolved');
  assert.equal(answerDiagnostic(s,'Todavía no se ha solucionado',context).outcome.code,'unresolved');
  assert.equal(answerDiagnostic(s,'Mejoró un poco',context).outcome.code,'partial');
  assert.equal(answerDiagnostic(s,'Sí, se solucionó',context).outcome.code,'resolved');
  assert.equal(answerDiagnostic(s,'No lo he probado',context).outcome.code,'untested');
  assert.equal(answerDiagnostic(s,'Ya no hay ruido',context).outcome.code,'resolved');
  assert.equal(s.outcome,null);
});
