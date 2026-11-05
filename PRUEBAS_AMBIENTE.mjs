import assert from 'node:assert/strict';
import {createAmbient,beginReference,advanceAmbient,resetAmbient,spectrumFeatures} from './src/ambientCore.mjs';
const frame=(t,rms=-40,peak=-25,spectral=null)=>({receivedAt:t,label:'Micrófono de prueba',channels:[{peak,rms}],spectral});
function run(s,from,to,rms,peak,spectral){for(let t=from;t<=to;t+=100)s=advanceAmbient(s,frame(t,rms,peak,spectral),t);return s;}
let s=beginReference(createAmbient(),0);s=run(s,0,5000,-40,-25);assert(s.reference);assert(Math.abs(s.reference.rms+40)<1e-8);
s=run(s,5100,6500,-25,-12);assert.equal(s.records.length,0,'No avisar por subida corta');s=run(s,6600,7000,-40,-25);s=run(s,7100,9300,-25,-12);assert.equal(s.records.filter(x=>x.kind==='rise').length,1);s=run(s,9400,12000,-25,-12);assert.equal(s.records.filter(x=>x.kind==='rise').length,1,'No duplicar condición sostenida');s=run(s,12100,14300,-40,-25);assert(!s.records[0].active);assert.equal(s.records[0].endedReason,'Condición dejó de observarse');
let peak=createAmbient();peak=run(peak,0,300,-15,-.5);assert.equal(peak.records.length,0);peak=run(peak,400,800,-15,-.5);assert.equal(peak.records[0].kind,'peak');
const bins=new Float32Array(1024).fill(-100);bins[85]=-20;bins[84]=-25;bins[86]=-25;const f=spectrumFeatures(bins,48000,2048);assert(f.concentration>.55&&f.prominence>=18);assert(Math.abs(f.frequency-1992)<30);
let tone=run(createAmbient(),0,2700,-30,-20,f);assert.equal(tone.records[0].kind,'tone');assert(tone.records[0].title.includes('posible'));assert.equal(tone.records.length,1);
const noise=spectrumFeatures(new Float32Array(1024).fill(-40),48000,2048);assert(noise.concentration<.01);assert.equal(run(createAmbient(),0,4000,-30,-20,noise).records.length,0,'Ruido ancho no es tono');
let changing=createAmbient();for(let t=0;t<=4000;t+=100)changing=advanceAmbient(changing,frame(t,-30,-20,{...f,frequency:1000+(t/100%2)*500}),t);assert.equal(changing.records.length,0,'Frecuencia inestable no acumula persistencia');
let sweep=createAmbient();for(let t=0;t<=4000;t+=100)sweep=advanceAmbient(sweep,frame(t,-30,-20,{...f,frequency:1000+t/10}),t);assert.equal(sweep.records.length,0,'Un barrido lento no se toma por frecuencia fija');
let harmonic=new Float32Array(1024).fill(-100);for(const i of [40,80,120,160,200])harmonic[i]=-20;const hf=spectrumFeatures(harmonic,48000,2048);assert(hf.concentration<.55);assert.equal(run(createAmbient(),0,4000,-30,-20,hf).records.length,0,'Varios armónicos comparables no pasan concentración');
tone=resetAmbient(tone,'Captura detenida',3000);assert(!tone.reference);assert(!tone.records[0].active);assert.equal(tone.records[0].endedReason,'Medición interrumpida');
let interrupted=beginReference(createAmbient(),0);interrupted=run(interrupted,0,2000,-40,-25);interrupted=advanceAmbient(interrupted,frame(5000),5000);assert(!interrupted.reference&&!interrupted.collecting,'No usar referencia con hueco');
let silent=run(beginReference(createAmbient(),0),0,5000,-120,-120);assert(!silent.reference);let overloaded=run(beginReference(createAmbient(),0),0,5000,-3,-.2);assert(!overloaded.reference);
console.log('Ambiente: referencia, subida sostenida/transitoria, pico, persistencia tonal, ruido ancho, armónicos, frecuencia cambiante, recuperación, interrupción y referencias inválidas: correctos. No equivale a validación acústica de feedback.');
