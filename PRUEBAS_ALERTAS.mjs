import assert from 'node:assert/strict';
import {advanceAlerts} from './src/alertLifecycle.mjs';
import {defaultChannels} from './src/audioCore.mjs';
let channels=defaultChannels(),history=[],timers={},id=0;
function tick(now,m,fresh=true){const r=advanceAlerts({history,channels,measurements:m,fresh,now,timers},()=>String(++id));history=r.history;timers=r.timers;return r;}
tick(1000,{1:{peak:-.5,rms:-20,sourceLabel:'Prueba'}});assert.equal(history.length,1);assert(history[0].active);
tick(2000,{1:{peak:-.6,rms:-20}});assert.equal(history.length,1);
history[0]={...history[0],resolved:true};tick(2500,{1:{peak:-.5,rms:-20}});assert(history[0].active,'La revisión no resuelve la condición');
tick(3000,{1:{peak:-2,rms:-20}});assert(history[0].active,'Histéresis hasta -3 dBFS');
tick(4000,{1:{peak:-10,rms:-25}});tick(6100,{1:{peak:-10,rms:-25}});assert(!history[0].active);assert(history[0].recoveredAt);assert(history[0].resolved);
tick(7000,{1:{peak:0,rms:-10}});assert.equal(history.length,2);tick(8000,{},false);assert(!history[0].active);assert(history[0].endReason);assert(!history[0].recoveredAt,'Desconectar no demuestra recuperación');
channels[1]={...channels[1],expected:true};tick(10000,{2:{peak:-90,rms:-90}});tick(15001,{2:{peak:-90,rms:-90}});assert.equal(history[0].kind,'silence');
const name=history[0].channelName;channels[1]={...channels[1],name:'Nombre nuevo'};tick(15500,{2:{peak:-90,rms:-90}});assert.equal(history[0].channelName,name);
console.log('Alertas: sin duplicados por condición sostenida, revisión independiente, recuperación con histéresis, interrupción y nombres históricos verificados.');
