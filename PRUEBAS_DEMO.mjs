import assert from 'node:assert/strict';
import {snapshotContext,startDiagnostic,answerDiagnostic} from './src/diagnostics/engine.js';
import {explainAudioError} from './src/audioErrors.mjs';
import {equipmentKind} from './src/diagnostics/rules.js';
const user={group:'QA',setup:{equipment:'Micrófono de esta computadora',console:'No utilizo consola',microphones:1}};
assert.equal(equipmentKind(user.setup),'computer');
for(const [peak,rms,expected] of [[-.2,-15,'pico cercano al límite'],[-85,-90,'nivel medio muy bajo'],[-25,-40,'no se observó un pico']]){
 const ctx=snapshotContext(user,{source:'browser',connected:true,running:true,capturedAt:new Date().toISOString(),selectedInput:{number:1,name:'Mi voz',type:'Voz'},channels:[{id:1,level:peak,rms}]});
 let session=startDiagnostic('Revisar entrada',ctx);
 session=answerDiagnostic(session,'No sé cómo describirlo');assert.equal(session.question.id,'symptom');assert(session.question.choices.includes('Continuar sin ese dato'));
 session=answerDiagnostic(session,'Continuar sin ese dato');
 let steps=0;while(session.question&&steps++<20)session=answerDiagnostic(session,'No lo sé');
 assert(session.diagnosis,'No debe quedar atrapada en preguntas');assert(session.diagnosis.review.includes(expected));assert(session.diagnosis.verification.includes('no calidad audible'));assert.equal(session.context.monitoring.channels[0].level,peak);
}
assert(explainAudioError({name:'NotAllowedError'}).includes('permiso'));
assert(explainAudioError(new TypeError('Failed to fetch'),'bridge').includes('esta misma computadora'));
assert(explainAudioError({name:'NotFoundError'}).includes('Conecta un micrófono'));
console.log('Demo: ayuda No sé sin bucles, equipo computadora, orientación conservadora por lectura y errores comprensibles: correctos.');
