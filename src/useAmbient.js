import {useEffect,useState} from 'react';
import {createAmbient,resetAmbient,beginReference,advanceAmbient} from './ambientCore.mjs';
export function useAmbient({frame,fresh,source,user}){
 const key='audicaz-ambient-v1-'+(user?.id||'local');
 const [storageError,setStorageError]=useState('');
 const [ambient,setAmbient]=useState(()=>{
  let records=[];try{const data=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(data))records=data.filter(x=>x?.id&&['peak','rise','tone'].includes(x.kind)&&Number.isFinite(x.rms)&&Number.isFinite(x.peak)).slice(0,300).map(x=>({...x,active:false,endedReason:x.active?'Medición interrumpida al cerrar o recargar':x.endedReason}));}catch{}
  return createAmbient(records);
 });
 useEffect(()=>{try{localStorage.setItem(key,JSON.stringify(ambient.records));}catch{setStorageError('No se pudieron guardar los avisos ambientales. Descarga el registro antes de cerrar.');}},[ambient.records,key]);
 useEffect(()=>{
  if(source!=='browser'||!fresh){setAmbient(s=>s.lastTime!==null||s.collecting||s.reference?resetAmbient(s,source!=='browser'?'El modo ambiental usa el micrófono del navegador.':'Captura detenida. Reconecta y toma una nueva referencia.'):s);return;}
  if(frame)setAmbient(s=>advanceAmbient(s,frame,frame.receivedAt));
 },[frame,fresh,source]);
 function takeReference(){if(source==='browser'&&fresh)setAmbient(s=>beginReference(s,Date.now()));}
 function review(id){setAmbient(s=>({...s,records:s.records.map(x=>x.id===id?{...x,reviewed:true}:x)}));}
 return {ambient,takeReference,reviewAmbient:review,ambientStorageError:storageError};
}
