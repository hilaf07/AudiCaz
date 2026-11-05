import React,{createContext,useContext,useState,useEffect,useRef} from 'react';
import {defaultChannels,validConfig,mappedMeasurements,isFresh} from './audioCore.mjs';
import {browserInputs,captureBrowser} from './browserAudio.mjs';
import {explainAudioError} from './audioErrors.mjs';
import {advanceAlerts} from './alertLifecycle.mjs';
import {useAmbient} from './useAmbient';
const AudioContext=createContext(null);
const API='http://127.0.0.1:8765';
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}};
export function AudioProvider({user,children}){
 const suffix=user?.id||user?.email||'local';const key='audicaz-inputs-v2-'+suffix,hkey='audicaz-real-history-v2-'+suffix;
 const [channels,setChannels]=useState(()=>{const c=read(key,null);return validConfig(c)?c.map(x=>({...x,expected:false})):defaultChannels();});
 const [history,setHistory]=useState(()=>read(hkey,[]).filter?.(x=>x?.id&&x.date&&x.channelName&&Number.isFinite(x.peak)&&Number.isFinite(x.rms)&&Array.isArray(x.steps)).slice(0,500)||[]);
 const [source,setSource]=useState('browser'),[devices,setDevices]=useState([]),[device,setDevice]=useState(''),[target,setTarget]=useState(1),[count,setCount]=useState(2);
 const [frame,setFrame]=useState(null),[state,setState]=useState('idle'),[error,setError]=useState(''),[selected,setSelected]=useState(1),[now,setNow]=useState(Date.now());
 const [trace,setTrace]=useState([]);
 const cleanup=useRef(null),generation=useRef(0),config=useRef(channels),silence=useRef({}),detector=useRef({}),lastFrame=useRef(null),[storageError,setStorageError]=useState('');
 config.current=channels;
 useEffect(()=>{try{localStorage.setItem(key,JSON.stringify(channels));}catch{setStorageError('No se pudo guardar la configuración. Se conserva solo mientras esta pantalla esté abierta.');}},[channels,key]);
 useEffect(()=>{try{localStorage.setItem(hkey,JSON.stringify(history));}catch{setStorageError('No se pudo guardar el historial. Exporta CSV antes de cerrar.');}},[history,hkey]);
 useEffect(()=>{const id=setInterval(()=>setNow(Date.now()),500);return()=>clearInterval(id);},[]);
 function stop(){generation.current++;cleanup.current?.();cleanup.current=null;setFrame(null);setState('idle');lastFrame.current=null;silence.current={};detector.current={};setTrace([]);}
 useEffect(()=>()=>{generation.current++;cleanup.current?.();},[]);
 async function list(){setError('');try{const list=source==='browser'?await browserInputs():await request('/devices');setDevices(list);setDevice(list.length?String(list[0].deviceId??list[0].id):'');}catch(e){setError(explainAudioError(e,source));}}
 useEffect(()=>{setDevices([]);setDevice('');},[source]);
 async function request(path,body){const res=await fetch(API+path,{...(body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{}),...('targetAddressSpace' in Request.prototype?{targetAddressSpace:'loopback'}:{}),signal:AbortSignal.timeout(path==='/state'?2500:15000)});const data=await res.json();if(!res.ok)throw Error(data.error||'Error de captura');return data;}
 function accept(value,gen){if(generation.current!==gen)return;setFrame(value);lastFrame.current=value;setState('connected');setTrace(items=>[...items,{time:value.receivedAt,levels:mappedMeasurements(value,source,target)}].slice(-60));}
 async function start(){
  stop();setError('');setState('connecting');const gen=generation.current;
  try{
   if(source==='browser'){
    const dispose=await captureBrowser(device,value=>accept(value,gen),message=>{if(generation.current===gen){setError(message);stop();}});
    if(generation.current!==gen)dispose();else cleanup.current=dispose;
   }else{
    if(device==='')throw Error('Busca y selecciona un dispositivo primero.');
    const session=crypto.randomUUID();
    let cancelled=false;const startedAt=Date.now();
    cleanup.current=()=>{cancelled=true;request('/stop',{session}).catch(()=>{});};
    await request('/start',{device:Number(device),channels:count,session});
    if(generation.current!==gen){await request('/stop',{session});return;}
    const poll=async()=>{if(cancelled||generation.current!==gen)return;try{const data=await request('/state');if(data.session!==session)throw Error('Otra sesión cambió la captura.');if(!data.connected){if(Date.now()-startedAt<2500){setTimeout(poll,150);return;}throw Error(data.error||'La captura no está disponible.');}accept({...data,receivedAt:Date.now()},gen);}catch(e){if(!cancelled&&generation.current===gen){setError(explainAudioError(e,source));stop();}return;}if(!cancelled)setTimeout(poll,150);};poll();
   }
  }catch(e){if(generation.current===gen){stop();setError(explainAudioError(e,source));}}
 }
 const fresh=state==='connected'&&isFresh(frame,now),measurements=fresh?mappedMeasurements(frame,source,target):{};
 useEffect(()=>{
  const result=advanceAlerts({history,channels,measurements:Object.fromEntries(Object.entries(measurements).map(([id,m])=>[id,{...m,sourceLabel:frame?.label||source}])),fresh,now:Date.now(),timers:detector.current});
  detector.current=result.timers;
  if(result.changed)setHistory(result.history);
 },[frame,channels,target,fresh]);
 const ambientController=useAmbient({frame,fresh,source,user});
 function update(id,patch){setChannels(items=>items.map(c=>c.id===id?{...c,...patch}:c));silence.current={};}

 function snapshot(id=selected){const c=channels.find(c=>c.id===id);const m=measurements[id];return {source,connected:!!m,capturedAt:frame?new Date(frame.receivedAt).toISOString():new Date().toISOString(),running:!!m,label:frame?.label||source,selectedInput:{number:id,name:c.name,type:c.type},channels:m?[{id,name:c.name,level:m.peak,rms:m.rms}]:[],alerts:[]};}
 function markReviewed(id){setHistory(items=>items.map(x=>x.id===id?{...x,resolved:true,reviewedAt:new Date().toISOString()}:x));}
 return <AudioContext.Provider value={{...ambientController,channels,history,setHistory,source,setSource,devices,device,setDevice,target,setTarget,count,setCount,frame,state,error,setError,selected,setSelected,storageError,start,stop,list,fresh,measurements,trace,update,snapshot,markReviewed}}>{children}</AudioContext.Provider>;
}
export function useAudio(){const value=useContext(AudioContext);if(!value)throw Error('Falta AudioProvider');return value;}
