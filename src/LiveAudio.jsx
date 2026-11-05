import React from 'react';
import GettingStarted from './GettingStarted';
import {Mic2,Play,Square,Download,MessageCircle} from 'lucide-react';
import {Panel} from './components';
import {useAudio} from './AudioProvider';
import {assess} from './audioCore.mjs';
import './liveAudio.css';
export default function LiveAudio({onConsult,onNavigate}){
 const {channels,history,setHistory,source,setSource,devices,device,setDevice,target,setTarget,count,setCount,frame,state,error,setError,selected,setSelected,storageError,start,stop,list,fresh,measurements,update,snapshot}=useAudio();
 function csv(){const quote=x=>'"'+String(x??'').replaceAll('"','""')+'"';const rows=[['Fecha','Entrada','Nombre al ocurrir','Fuente','Aviso','Pico dBFS','RMS dBFS','Estado'],...history.map(h=>[h.date,h.channel,h.channelName,h.source,h.title,h.peak,h.rms,h.resolved?'Revisado':'Pendiente'])];const url=URL.createObjectURL(new Blob(['\uFEFF'+rows.map(r=>r.map(quote).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='audicaz-audio-real.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 function viewInput(id){
  setSelected(id);
  requestAnimationFrame(()=>{const node=document.getElementById('audicaz-input-detail');if(node){node.scrollIntoView({behavior:'smooth',block:'start'});node.focus({preventScroll:true});}});
 }
 const active=channels.find(c=>c.id===selected),m=measurements[selected];
 const issue=history.find(h=>h.channel===selected&&h.active&&!h.recoveredAt);
 return <div className="live-audio">
  <GettingStarted onNavigate={onNavigate}/>
  <Panel title="Entradas y audio real" subtitle="Configura las entradas y mide una fuente real sin cambiar el diseño de tu espacio.">
   <div className="live-controls">
    <label>Origen de audio<select value={source} disabled={state!=='idle'} onChange={e=>{stop();setSource(e.target.value);setError('');}}><option value="browser">Micrófono o entrada del navegador</option><option value="bridge">Interfaz multicanal mediante puente local</option></select></label>
    <button className="secondary-button" disabled={state!=='idle'} onClick={list}>Buscar dispositivos</button>
    <label>Dispositivo<select value={device} disabled={state!=='idle'} onChange={e=>setDevice(e.target.value)}><option value="">Predeterminado / seleccionar</option>{devices.map((d,i)=><option key={d.deviceId??d.id} value={d.deviceId??d.id}>{d.label||d.name||`Entrada ${i+1}`}{d.maxChannels?` (${d.maxChannels} canales disponibles)`:''}</option>)}</select></label>
    {source==='browser'?<label>Asociar captura mono a<select value={target} disabled={state!=='idle'} onChange={e=>setTarget(Number(e.target.value))}>{channels.map(c=><option key={c.id} value={c.id}>Entrada {c.id} — {c.name}</option>)}</select></label>:<label>Canales que abrirá el controlador<input type="number" min="1" max="18" value={count} disabled={state!=='idle'} onChange={e=>setCount(Math.max(1,Math.min(18,Number(e.target.value)||1)))}/></label>}
    <button className="primary-button" disabled={state==='connecting'} onClick={state==='idle'?start:()=>stop()}>{state==='idle'?<Play size={16}/>:<Square size={16}/>} {state==='idle'?'Conectar audio':state==='connecting'?'Conectando…':'Desconectar'}</button>
   </div>
   <p className="beginner-intro">{fresh?`Captura real: ${frame.label||'interfaz'} · ${source==='browser'?'mono':frame.channels.length+' canales'} · ${frame.sampleRate||''} Hz`:state==='connecting'?'Esperando permiso o apertura del dispositivo…':'Sin captura activa. Las barras no muestran valores inventados.'}</p>
   {error&&<p className="text-red" role="alert">{error}</p>}{storageError&&<p className="text-amber" role="alert">{storageError}</p>}
   <p className="muted">{source==='browser'?'La captura del navegador se mezcla a mono y se asocia a una sola entrada como referencia. Cambiar la asociación no cambia conexiones físicas ni separa instrumentos.':'El canal USB 1 se muestra como entrada 1 y así sucesivamente. Confirma ese enrutamiento en la consola: puede ser diferente de las entradas físicas.'} No se reproduce ni se graba audio.</p>
  </Panel>
  <Panel title="Configurar entradas" subtitle="El número identifica la entrada; el nombre y el instrumento pueden cambiar.">
   <div className="table-scroll"><table className="live-table"><thead><tr><th>Entrada</th><th>Nombre</th><th>Fuente</th><th>En uso</th><th>Debe sonar ahora</th><th>Seleccionar</th></tr></thead><tbody>{channels.map(c=><tr key={c.id}><td>{c.id}</td><td><input aria-label={`Nombre entrada ${c.id}`} maxLength={80} value={c.name} onChange={e=>update(c.id,{name:e.target.value})}/></td><td><select aria-label={`Instrumento entrada ${c.id}`} value={c.type} onChange={e=>update(c.id,{type:e.target.value})}>{['Por configurar','Voz','Guitarra','Bajo','Teclado L','Teclado R','Bombo','Caja','Platillos','Otra fuente'].map(v=><option key={v}>{v}</option>)}</select></td><td><input type="checkbox" aria-label={`Entrada ${c.id} en uso`} checked={c.enabled} onChange={e=>update(c.id,{enabled:e.target.checked,expected:false})}/></td><td><input type="checkbox" disabled={!c.enabled} aria-label={`Entrada ${c.id} debe sonar ahora`} checked={c.expected} onChange={e=>update(c.id,{expected:e.target.checked})}/></td><td><button className="secondary-button" aria-pressed={selected===c.id} onClick={()=>viewInput(c.id)}>Ver entrada</button></td></tr>)}</tbody></table></div>
   <p className="muted">Activa «Debe sonar ahora» solo durante una comprobación. Un instrumento en pausa puede tener señal muy baja sin presentar una falla. Para estéreo, asigna dos entradas. Los cambios se guardan en este navegador.</p>
  </Panel>
  <Panel title="Monitoreo de entradas" subtitle="Cada medidor corresponde únicamente al canal capturado indicado.">
   <div className="channel-grid">{channels.filter(c=>c.enabled).map(c=>{const v=measurements[c.id];return <button key={c.id} className="channel-card" aria-pressed={selected===c.id} onClick={()=>viewInput(c.id)}><div className="channel-top"><span className="channel-icon"><Mic2 size={19}/></span><span className="channel-number">Entrada {c.id}</span></div><h3>{c.name||`Entrada ${c.id}`}</h3><p>{c.type}</p><div className="meter"><div style={{width:v?`${Math.max(0,Math.min(100,(v.peak+60)/60*100))}%`:'0%',background:v?.peak>=-1?'#fa6470':undefined}}/></div><div className="channel-bottom"><span>{v?'Capturada':'Sin lectura'}</span><strong>{v?`${v.peak.toFixed(1)} dBFS`:'—'}</strong></div></button>;})}</div>
  </Panel>
  <div id="audicaz-input-detail" tabIndex={-1} role="region" aria-label={`Detalle de entrada ${selected}`} style={{scrollMarginTop:100}}>
  <Panel title={`Entrada ${selected} — ${active.name||'Sin nombre'}`} subtitle="Pico digital y nivel medio RMS de la señal recibida.">
   <p>{m?`Pico: ${m.peak.toFixed(1)} dBFS · RMS: ${m.rms.toFixed(1)} dBFS`:'No hay una lectura disponible para esta entrada.'}</p>
   {issue?<><h3 className="text-amber">{issue.title}</h3><ol>{issue.steps.map(s=><li key={s}>{s}</li>)}</ol></>:<p>Selecciona una entrada y describe qué escuchas para recibir orientación. La ausencia de avisos no confirma que toda la mezcla esté bien.</p>}
   <button className="primary-button" onClick={()=>onConsult(`Revisar entrada ${selected}: ${active.name||'sin nombre'}. Fuente: ${active.type}. Describe el problema para comenzar.`,snapshot())}><MessageCircle size={16}/>Consultar al asistente</button>
   <p className="muted">El asistente conserva su lógica por reglas. Estas lecturas son nivel digital: no miden volumen acústico, no identifican un acople ni permiten concluir qué instrumento tapa a otro.</p>
  </Panel>
  </div>
  {source==='browser'&&fresh&&<Panel title="Espectro de la captura mono" subtitle="Energía por bandas de frecuencia de la fuente seleccionada; no es la salida de la consola."><div className="live-spectrum" aria-label="Espectro medido">{(frame.bands||[]).map((v,i)=><i key={i} style={{height:`${Math.max(1,Math.min(100,(v+100)/100*100))}%`}}/>)}</div><div className="chart-labels"><span>Graves</span><span>Medios</span><span>Agudos</span></div></Panel>}
  <Panel title="Salida principal" subtitle="Separada de las entradas de instrumentos"><p>Sin lectura de la salida principal. Este módulo no calcula una mezcla ficticia. Para medirla hay que configurar y confirmar un retorno de la mezcla en la interfaz.</p></Panel>
  <Panel title="Historial de lecturas y avisos" subtitle="Guarda el nombre de la entrada al momento del aviso. Los avisos y su evolución también están en el Historial del menú." action={<button className="secondary-button" onClick={csv}><Download size={16}/>Exportar CSV</button>}>
   {!history.length?<p>Todavía no hay avisos de mediciones reales.</p>:history.map(h=><article className="alert-item" key={h.id}><div className="alert-content"><h3>{h.title}</h3><p>Entrada {h.channel} — {h.channelName} · {new Date(h.date).toLocaleString('es-CR')}</p><p>{h.source} · Pico {h.peak.toFixed(1)} dBFS · RMS {h.rms.toFixed(1)} dBFS</p><ol>{h.steps.map(s=><li key={s}>{s}</li>)}</ol><button className="secondary-button" disabled={h.resolved} onClick={()=>setHistory(items=>items.map(x=>x.id===h.id?{...x,resolved:true}:x))}>{h.resolved?'Revisado':'Marcar revisado'}</button></div></article>)}
  </Panel>
 </div>;
}
