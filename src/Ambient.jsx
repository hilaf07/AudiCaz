import React,{useState} from 'react';
import {Panel} from './components';
import {useAudio} from './AudioProvider';
import {ambientDefinitions} from './ambientCore.mjs';
const level=v=>Number.isFinite(v)?v.toFixed(1)+' dBFS':'Sin lectura';
export function exportAmbient(records){
 const q=v=>'"'+String(typeof v==='string'&&/^[=+\-@\t\r]/.test(v)?"'"+v:v??'').replaceAll('"','""')+'"';
 const rows=[['Fecha','Aviso','Dispositivo','Pico dBFS','RMS dBFS','Frecuencia Hz','Referencia RMS dBFS','Estado','Revisado'],...records.map(x=>[x.date,x.title,x.source,x.peak,x.rms,x.frequency,x.reference?.rms,x.active?'Activa':x.endedReason,x.reviewed?'Sí':'No'])];
 const url=URL.createObjectURL(new Blob(['\uFEFF'+rows.map(r=>r.map(q).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='audicaz-ambiente.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export function AmbientRecords({filter='all',compact=false}){
 const a=useAudio(),items=a.ambient.records.filter(x=>filter==='active'?x.active:filter==='review'?!x.reviewed:true);
 return <section aria-label="Avisos del ambiente"><h3>{compact?'Observaciones automáticas del ambiente':'Registro de escucha ambiental'}</h3>{!compact&&<button className="secondary-button" onClick={()=>exportAmbient(a.ambient.records)}>Descargar registro ambiental</button>}{!items.length?<p>{filter==='active'?'Sin avisos ambientales activos. Esto no confirma que el sonido esté bien.':'Todavía no hay avisos ambientales en esta selección.'}</p>:items.map(x=><article className="ambient-event" key={x.id}><div className="alert-title"><h3>{x.title}</h3><span className={`badge ${x.active?'warning':'solved'}`}>{x.active?'Condición activa':x.endedReason||'Lectura histórica'}</span></div><p>{new Date(x.date).toLocaleString('es-CR')} · {x.source}</p><p>Al detectarse: pico {level(x.peak)} · RMS {level(x.rms)}{Number.isFinite(x.frequency)?` · Tono aproximado ${Math.round(x.frequency)} Hz`:''}</p>{x.reference&&<p>Referencia de esa prueba: {level(x.reference.rms)} · {new Date(x.reference.date).toLocaleString('es-CR')}</p>}<ol>{ambientDefinitions[x.kind].steps.map(text=><li key={text}>{text}</li>)}</ol><button className="secondary-button" disabled={x.reviewed} onClick={()=>a.reviewAmbient(x.id)}>{x.reviewed?'Revisado por ti':'Marcar revisado'}</button><p className="muted">Revisar no elimina una condición medida ni confirma que el sonido se haya corregido.</p></article>)}</section>;
}
export default function Ambient(){
 const a=useAudio(),[all,setAll]=useState(false),m=a.source==='browser'&&a.fresh?a.frame.channels[0]:null,ref=a.ambient.reference;
 return <div className="live-audio ambient-page">
 <Panel title="Escucha el lugar, sin conectar la mixer" subtitle="Usa el micrófono de tu computadora o celular. No necesitas Python ni USB del amplificador.">
 <p>Puedes probar una guitarra con amplificador, una voz o el grupo completo. Coloca el dispositivo en una posición fija, a una distancia cómoda del sonido. AUDICAZ analiza la mezcla que llega a ese micrófono; no separa instrumentos.</p>
 {a.source!=='browser'?<><p>Ahora está seleccionado el puente. Desconéctalo para usar la escucha ambiental.</p><button className="primary-button" onClick={()=>{a.stop();a.setSource('browser');a.setError('');}}>Elegir micrófono del navegador</button></>:<div className="ambient-actions">{a.state==='idle'?<><button className="secondary-button" onClick={a.list}>Buscar micrófonos</button><label>Micrófono<select value={a.device} onChange={e=>a.setDevice(e.target.value)}><option value="">Predeterminado</option>{a.devices.map((d,i)=><option key={d.deviceId} value={d.deviceId}>{d.label||`Micrófono ${i+1}`}</option>)}</select></label><button className="primary-button" onClick={a.start}>Escuchar ambiente</button></>:<button className="secondary-button" onClick={a.stop}>{a.state==='connecting'?'Cancelar conexión':'Detener escucha'}</button>}</div>}
 <p className="muted">No reproducimos el audio por las bocinas ni guardamos grabaciones. Los avisos se generan automáticamente con reglas de señal; el chat es una ayuda adicional.</p>
 </Panel>
 <Panel title="Qué está recibiendo el micrófono" subtitle={m?a.frame.label:'Sin captura ambiental activa'}>
 <div className="ambient-levels"><p>Pico <strong>{level(m?.peak)}</strong></p><p>Nivel medio RMS <strong>{level(m?.rms)}</strong></p><p>Referencia <strong>{level(ref?.rms)}</strong></p></div>
 <div className="meter" aria-label="Nivel digital del ambiente"><div style={{width:m?`${Math.max(0,Math.min(100,(m.rms+80)/80*100))}%`:'0%'}}/></div>
 {m&&ref&&<p>Diferencia actual respecto de la referencia: <strong>{(m.rms-ref.rms).toFixed(1)} dB</strong>. Es una comparación de la captura, no una medición acústica calibrada.</p>}
 <p><strong>Estos valores no son dB SPL ni dBA.</strong> No indican por sí solos si el volumen de la sala es seguro o si la mezcla suena bien.</p>
 </Panel>
 <Panel title="Toma una referencia de cinco segundos" subtitle="Hazlo con el sonido habitual que quieres comparar, a un nivel cómodo.">
 <p>Para tu guitarra, toca un pasaje normal durante la toma. Para un ensayo, utiliza un fragmento representativo. Deja el dispositivo fijo y conserva los ajustes del micrófono para poder comparar después.</p>
 <button className="primary-button" disabled={!m||!!a.ambient.collecting} onClick={a.takeReference}>{a.ambient.collecting?'Tomando referencia…':ref?'Tomar nueva referencia':'Tomar referencia (5 segundos)'}</button>
 {a.ambient.collecting&&<progress aria-label="Progreso de referencia" value={a.ambient.progress} max="100"/>}<p role="status">{a.ambient.message}</p>
 <p className="muted">La referencia se invalida si se pierde la captura, recargas o cambias de dispositivo. Es una referencia relativa, no una calibración de sonómetro. El procesamiento automático del dispositivo puede alterar la comparación.</p>
 </Panel>
 <Panel title="Avisos y recomendaciones automáticas" subtitle="No necesitas responder preguntas para que aparezcan observaciones de esta captura.">
 <AmbientRecords filter={all?'all':'active'}/><button className="text-button" onClick={()=>setAll(!all)}>{all?'Ver solo condiciones activas':'Ver también avisos anteriores'}</button>
 {a.ambientStorageError&&<p role="alert">{a.ambientStorageError}</p>}
 </Panel>
 {m&&<Panel title="Frecuencias del ambiente" subtitle="El espectro muestra lo captado; no identifica qué instrumento produce cada banda."><div className="live-spectrum" aria-label="Espectro ambiental">{(a.frame.bands||[]).map((v,i)=><i key={i} style={{height:`${Math.max(1,Math.min(100,v+100))}%`}}/>)}</div><div className="chart-labels"><span>Graves</span><span>Medios</span><span>Agudos</span></div></Panel>}
 <Panel title="Cómo interpretar los avisos"><ul><li>Captura cerca de saturarse: pico digital de −1 dBFS o más durante al menos medio segundo.</li><li>Subida sostenida: nivel medio al menos 10 dB sobre la referencia durante dos segundos.</li><li>Posible acople: tono concentrado y estable durante unos 2,5 segundos. También puede ser una nota de guitarra, un silbido u otro tono. No confirma feedback.</li></ul><p>No provoques un acople ni subas mucho el amplificador para probar. Si escuchas un silbido molesto, reduce o silencia la fuente sin esperar el aviso. La aplicación no controla tu equipo.</p></Panel>
 </div>;
}
