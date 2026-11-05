import {spectrumFeatures} from './ambientCore.mjs';
import {measure} from './audioCore.mjs';
export async function browserInputs(){
 if(!navigator.mediaDevices?.enumerateDevices)throw Error('Abre AUDICAZ en localhost o HTTPS y permite acceso al micrófono.');
 return (await navigator.mediaDevices.enumerateDevices()).filter(d=>d.kind==='audioinput');
}
export async function captureBrowser(deviceId,onFrame,onError){
 if(!navigator.mediaDevices?.getUserMedia)throw Error('Este navegador no ofrece acceso al micrófono en esta página. Abre AUDICAZ con HTTPS o en localhost y usa un navegador compatible.');
 let stream,context,timer;let stopped=false;
 const stop=()=>{stopped=true;clearInterval(timer);stream?.getTracks().forEach(t=>t.stop());context?.close().catch(()=>{});};
 try{
  stream=await navigator.mediaDevices.getUserMedia({audio:{...(deviceId?{deviceId:{exact:deviceId}}:{}),channelCount:{ideal:1},echoCancellation:false,noiseSuppression:false,autoGainControl:false},video:false});
  if(stopped){stop();throw Error('Captura cancelada');}
  context=new AudioContext();await context.resume();
  const source=context.createMediaStreamSource(stream),analyser=context.createAnalyser();analyser.fftSize=2048;analyser.smoothingTimeConstant=0;
  source.connect(analyser); // Nunca conectar a destination: no reproducir en las bocinas.
  const samples=new Float32Array(analyser.fftSize),bins=new Float32Array(analyser.frequencyBinCount);
  const track=stream.getAudioTracks()[0];
  const fail=()=>{if(!stopped){stop();onError('La entrada se desconectó o el navegador retiró el permiso.');}};
  track.addEventListener('ended',fail);track.addEventListener('mute',fail);
  context.onstatechange=()=>{if(!stopped&&context.state!=='running')fail();};
  timer=setInterval(()=>{
   if(stopped)return;analyser.getFloatTimeDomainData(samples);analyser.getFloatFrequencyData(bins);
   const maxHz=context.sampleRate/2;const bands=Array.from({length:48},(_,i)=>{
    const start=Math.max(1,Math.floor(20*Math.pow(maxHz/20,i/48)/maxHz*bins.length));
    const end=Math.max(start+1,Math.floor(20*Math.pow(maxHz/20,(i+1)/48)/maxHz*bins.length));
    let v=-120;for(let k=start;k<Math.min(end,bins.length);k++)v=Math.max(v,bins[k]);return Number.isFinite(v)?v:-120;
   });
   onFrame({channels:[measure(samples)],spectral:spectrumFeatures(bins,context.sampleRate,analyser.fftSize),bands,waveform:Array.from({length:128},(_,i)=>samples[i*16]),receivedAt:Date.now(),label:track.label||'Entrada del navegador',sampleRate:context.sampleRate});
  },100);
  return stop;
 }catch(e){stop();throw e;}
}
