// Análisis exploratorio de una captura ambiente. No identifica instrumentos ni mide dB SPL.
export function spectrumFeatures(bins,sampleRate,fftSize){
 const lo=Math.max(1,Math.ceil(200*fftSize/sampleRate)),hi=Math.min(bins.length-1,Math.floor(8000*fftSize/sampleRate));
 let index=lo,maximum=-120,total=0,narrow=0;
 for(let i=lo;i<=hi;i++){const v=Number.isFinite(bins[i])?bins[i]:-120;if(v>maximum){maximum=v;index=i;}total+=10**(v/10);}
 for(let i=Math.max(lo,index-1);i<=Math.min(hi,index+1);i++)narrow+=10**((Number.isFinite(bins[i])?bins[i]:-120)/10);
 const near=[];for(let i=Math.max(lo,index-25);i<=Math.min(hi,index+25);i++)if(Math.abs(i-index)>5)near.push(Number.isFinite(bins[i])?bins[i]:-120);
 near.sort((a,b)=>a-b);const background=near.length?near[Math.floor(near.length/2)]:maximum;
 return {frequency:index*sampleRate/fftSize,concentration:total>0?narrow/total:0,prominence:maximum-background};
}
export const ambientDefinitions={
 peak:{title:'Captura cerca de saturarse',steps:['Si el sonido resulta molesto, reduce su nivel sin aumentarlo para probar.','Mantén el micrófono en una posición fija; si la captura sigue muy alta, revisa el nivel de entrada del dispositivo.','Repite el mismo pasaje. Esto no mide el volumen acústico de la sala ni confirma distorsión audible.']},
 rise:{title:'Nivel sostenido por encima de la referencia',steps:['Compara lo que está sonando con el pasaje usado como referencia.','Si ahora resulta demasiado fuerte al escuchar, reduce gradualmente la fuente que identifiques.','No cambies controles al azar: una subida puede deberse a música que comenzó, distancia o procesamiento del micrófono.']},
 tone:{title:'Tono persistente: posible acople',steps:['Si escuchas un silbido molesto, reduce o silencia la fuente afectada antes de continuar.','Con un micrófono amplificado, revisa su orientación y cercanía a las bocinas sin provocar un acople para probar.','Una nota sostenida de guitarra, un silbido u otro tono también puede producir este aviso. Confirma escuchando; AUDICAZ no identifica la causa ni el canal físico.']}
};
export function createAmbient(records=[]){return {reference:null,collecting:null,progress:0,candidates:{},clearSince:{},active:{},records,lastTime:null,toneFrequency:null,message:'Conecta el micrófono para escuchar el ambiente.'};}
export function resetAmbient(state,reason,now=Date.now()){
 const records=state.records.map(x=>x.active?{...x,active:false,endedAt:new Date(now).toISOString(),endedReason:'Medición interrumpida'}:x);
 return {...createAmbient(records),message:reason};
}
export function beginReference(state,now){
 const reset=resetAmbient(state,'Escuchando cinco segundos para tomar la referencia.',now);
 return {...reset,collecting:{started:now,values:[]}};
}
export function advanceAmbient(previous,frame,now){
 const m=frame?.channels?.[0];if(!m||!Number.isFinite(m.peak)||!Number.isFinite(m.rms))return resetAmbient(previous,'Sin muestras válidas. Vuelve a conectar.',now);
 let s={...previous,candidates:{...previous.candidates},clearSince:{...previous.clearSince},active:{...previous.active}};
 if(s.lastTime!==null&&(now-s.lastTime>600||now<=s.lastTime))s=resetAmbient(s,'Se interrumpió la continuidad. Toma una nueva referencia.',now);
 if(s.lastTime===null&&!s.collecting)s.message='Escuchando. Puedes tomar una referencia para comparar niveles.';
 s.lastTime=now;
 if(s.collecting){
  const values=[...s.collecting.values,m.rms].slice(-100),elapsed=now-s.collecting.started;
  s.collecting={...s.collecting,values};s.progress=Math.min(100,elapsed/50);
  if(elapsed>=5000){
   if(values.length<30){s.collecting=null;s.progress=0;s.message='No llegaron suficientes muestras. Toma la referencia otra vez.';}
   else{
    const rms=10*Math.log10(values.reduce((sum,v)=>sum+10**(v/10),0)/values.length);
    s.collecting=null;s.progress=100;
    if(rms< -80||rms> -6){s.reference=null;s.message='Referencia demasiado baja o cercana al límite. Revisa el micrófono y repite a un nivel normal.';}
    else {s.reference={rms,date:new Date(now).toISOString(),label:frame.label};s.message='Referencia guardada para esta conexión. Ya puedes comparar el mismo sonido.';}
   }
  }
  return s;
 }
 const f=frame.spectral;
 const tonal=!!f&&m.rms> -60&&f.concentration>=.55&&f.prominence>=18&&f.frequency>=200&&f.frequency<=8000;
 const stable=tonal&&(s.toneFrequency===null||Math.abs(f.frequency-s.toneFrequency)<=Math.max(45,f.frequency*.02));
 if(!stable)delete s.candidates.tone;
 s.toneFrequency=tonal?(stable?(s.toneFrequency??f.frequency):f.frequency):null;
 const conditions={peak:m.peak>=-1,rise:!!s.reference&&m.rms>=s.reference.rms+10&&m.rms> -60,tone:tonal};
 const delays={peak:500,rise:2000,tone:2500};
 for(const kind of Object.keys(conditions)){
  if(conditions[kind]){
   delete s.clearSince[kind];s.candidates[kind]??=now;
   if(!s.active[kind]&&now-s.candidates[kind]>=delays[kind]){
    const record={id:crypto.randomUUID(),kind,title:ambientDefinitions[kind].title,date:new Date(now).toISOString(),active:true,reviewed:false,peak:m.peak,rms:m.rms,frequency:kind==='tone'?f.frequency:null,reference:s.reference?{...s.reference}:null,source:frame.label||'Micrófono del navegador'};
    s.active[kind]=record.id;s.records=[record,...s.records].slice(0,300);
   }
  }else{
   delete s.candidates[kind];
   if(s.active[kind]){
    s.clearSince[kind]??=now;
    if(now-s.clearSince[kind]>=2000){const id=s.active[kind];s.records=s.records.map(x=>x.id===id?{...x,active:false,endedAt:new Date(now).toISOString(),endedReason:'Condición dejó de observarse'}:x);delete s.active[kind];delete s.clearSince[kind];}
   }
  }
 }
 return s;
}
