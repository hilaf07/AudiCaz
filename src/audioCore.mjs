// Funciones puras: la asignación NO cambia el enrutamiento de la consola.
export const db = value => Math.max(-120, Math.min(12,20*Math.log10(Math.max(1e-6,value))));
export function measure(samples) {
 let peak=0,sum=0;for(const x of samples){peak=Math.max(peak,Math.abs(x));sum+=x*x;}
 return {peak:db(peak),rms:db(Math.sqrt(sum/Math.max(1,samples.length)))};
}
export function defaultChannels(){return Array.from({length:18},(_,i)=>({id:i+1,name:`Entrada ${i+1}`,type:'Por configurar',enabled:true,expected:false}));}
export function validConfig(value){return Array.isArray(value)&&value.length===18&&value.every((c,i)=>c&&c.id===i+1&&typeof c.name==='string'&&c.name.length<=80&&typeof c.type==='string'&&typeof c.enabled==='boolean'&&typeof c.expected==='boolean');}
export function assess(channel,measurement,elapsedSilent=0){
 if(!channel.enabled||!measurement)return null;
 if(measurement.peak>=-1)return {kind:'peak',title:'Pico cercano al límite digital',severity:'critical',steps:['Identifica esta entrada en la consola o interfaz.','Revisa el medidor del equipo y reduce gradualmente la ganancia de entrada si también está demasiado alta.','Vuelve a tocar o hablar y comprueba el nivel. Un pico alto no confirma por sí solo distorsión audible.']};
 if(channel.expected&&measurement.rms< -65&&elapsedSilent>=5000)return {kind:'silence',title:'Señal muy baja durante la prueba',severity:'warning',steps:['Confirma que la persona esté hablando o tocando ahora.','Revisa alimentación, volumen y conexiones de la fuente con el sistema silenciado cuando corresponda.','Comprueba el enrutamiento USB y el medidor de la consola. Una señal USB baja no demuestra que las bocinas estén en silencio.']};
 return null;
}
export function mappedMeasurements(frame,kind,browserTarget){
 if(!frame||!Array.isArray(frame.channels))return {};
 if(kind==='browser')return frame.channels[0]?{[browserTarget]:frame.channels[0]}:{};
 return Object.fromEntries(frame.channels.map((m,i)=>[i+1,m]));
}
export function isFresh(frame,now=Date.now()){return !!frame&&Number.isFinite(frame.receivedAt)&&now-frame.receivedAt<1500;}
