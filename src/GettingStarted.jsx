import React,{useState,useEffect} from 'react';
import {Panel} from './components';
import {useAudio} from './AudioProvider';
export default function GettingStarted({onNavigate}){
 const a=useAudio(),[confirmed,setConfirmed]=useState(false),[show,setShow]=useState(true);
 useEffect(()=>{if(!a.fresh)setConfirmed(false);},[a.fresh]);
 if(!show)return <button className="text-button" onClick={()=>setShow(true)}>Mostrar guía de primera prueba</button>;
 return <Panel title="Tu primera prueba en tres pasos" subtitle="Puedes usar tu micrófono sin instalar Python ni tener una consola.">
  <ol className="getting-started"><li><strong>Elige cómo recibir el audio</strong><p>Para comenzar, usa el micrófono de esta computadora. El modo navegador entrega una captura mono; una tarjeta no representa una entrada física de consola hasta comprobar su conexión.</p>{a.source!=='browser'&&<button className="secondary-button" onClick={()=>{a.stop();a.setSource('browser');}}>Usar micrófono del navegador</button>}</li>
  <li><strong>Conecta y permite el micrófono</strong><p>En los controles de abajo puedes elegir dispositivo y la entrada donde mostrar la captura. Pulsa Conectar audio y acepta el permiso. No se reproduce ni se guarda una grabación.</p>{a.source==='browser'&&a.state==='idle'&&<button className="primary-button" onClick={a.start}>Conectar mi micrófono</button>}<p role="status">{a.fresh?'Ya estamos recibiendo lecturas.':a.state==='connecting'?'Esperando permiso o apertura del dispositivo…':'Todavía no hay captura activa.'}</p></li>
  <li><strong>Habla normalmente y comprueba la respuesta</strong><p>Busca la entrada capturada. Su barra debe cambiar cuando hablas y al hacer una pausa. No necesitas gritar. Las otras entradas quedan sin lectura si solo recibimos una captura mono.</p><label className="checkbox-label"><input type="checkbox" disabled={!a.fresh} checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/>Comprobé que el medidor responde a mi voz</label><button className="primary-button" disabled={!a.fresh||!confirmed} onClick={()=>onNavigate?.('Panel principal')}>Abrir mi panel</button></li></ol>
  <p className="muted">Si no cambia la barra, revisa que el dispositivo seleccionado sea tu micrófono y que el permiso esté activado. El puente local es opcional y se prepara por separado para equipos compatibles.</p>
  <button className="text-button" onClick={()=>setShow(false)}>Ocultar esta guía</button>
 </Panel>;
}
