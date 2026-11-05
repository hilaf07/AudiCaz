import React,{useState,useEffect} from 'react';
import {Activity,LayoutDashboard,SlidersHorizontal,AudioLines,Bell,Lightbulb,History,ChevronDown,ArrowUpRight,CircleHelp,Radio,Headphones,Menu,MessageCircle} from 'lucide-react';
import Profile from './Profile';
import Assistant from './diagnostics/Assistant';
import {LearningContext} from './LearningMode';
import Ambient from './Ambient';
import LiveAudio from './LiveAudio';
import {AudioProvider,useAudio} from './AudioProvider';
import {AudioStatus,Dashboard,Channels,Analysis,Alerts,HistoryView} from './AudioViews';
import './liveAudio.css';
const modules=[{name:'Escucha ambiental',icon:AudioLines},{name:'Entradas y audio real',icon:SlidersHorizontal},{name:'Asistente AudiCaz',icon:MessageCircle},{name:'Panel principal',icon:LayoutDashboard},{name:'Monitoreo de canales',icon:SlidersHorizontal},{name:'Análisis de audio',icon:AudioLines},{name:'Centro de alertas',icon:Bell},{name:'Recomendaciones',icon:Lightbulb},{name:'Historial',icon:History}];
export default function App(props){return <AudioProvider key={props.user.id} user={props.user}><AppShell {...props}/></AudioProvider>;}
function AppShell({user,onUserUpdate,onSetup,onLogout}){
 const audio=useAudio();
 const [page,setPage]=useState('Escucha ambiental'),[menu,setMenu]=useState(false),[assistantRequest,setAssistantRequest]=useState(null),[beginner,setBeginner]=useState(()=>{try{return JSON.parse(localStorage.getItem('audicaz-preferences-v1'))?.beginner!==false;}catch{return true;}});
 useEffect(()=>{try{const saved=JSON.parse(localStorage.getItem('audicaz-preferences-v1'))||{};localStorage.setItem('audicaz-preferences-v1',JSON.stringify({...saved,beginner}));}catch{}},[beginner]);
 const technical=!beginner;const alerts=[...audio.history,...audio.ambient.records].filter(x=>x.active);
 function navigate(name){setPage(name);setMenu(false);window.scrollTo({top:0,behavior:'instant'});}
 function consult(report,monitoring){setAssistantRequest({id:crypto.randomUUID(),report,monitoring});navigate('Asistente AudiCaz');}
 function openDiagnostic(sessionId){setAssistantRequest({id:crypto.randomUUID(),sessionId});navigate('Asistente AudiCaz');}
 return <LearningContext.Provider value={{beginner,technical}}><div className={`app ${beginner?'beginner-mode':''}`}><aside className={`sidebar ${menu?'open':''}`}><a className="brand" href="#" onClick={e=>{e.preventDefault();navigate('Panel principal');}}><span className="brand-icon"><AudioLines size={26}/></span><span>Audi<span className="brand-accent">Caz</span><small>AUDIO BAJO CONTROL</small></span></a><div className="workspace"><span className="workspace-icon"><Headphones size={18}/></span><div>Mi espacio de audio<small>Entradas y mediciones compartidas</small></div><ChevronDown size={14}/></div><div className="nav-label">ESPACIO DE TRABAJO</div><nav>{modules.map(({name,icon:Icon})=><button aria-label={name} aria-current={page===name?'page':undefined} className={page===name?'active':''} key={name} onClick={()=>navigate(name)}><Icon size={19}/><span>{name}</span>{name==='Centro de alertas' && alerts.length>0 && <b>{alerts.length}</b>}</button>)}<button className={page==='Mi perfil'?'active':''} onClick={()=>navigate('Mi perfil')}><Headphones size={19}/><span>Mi perfil</span></button></nav><div className="sidebar-bottom"><div className="demo-card"><span><Radio size={16}/> AUDIO COMPARTIDO</span><p>Configura tus entradas.<br/>Revisa tus mediciones.</p><small>{audio.fresh?'Captura real activa en todas las pantallas':'Sin captura activa'}</small></div><button className="help-button" onClick={()=>navigate('Entradas y audio real')}><CircleHelp size={18}/>Conectar y configurar audio<ArrowUpRight size={15}/></button><button className="profile profile-button" onClick={()=>navigate('Mi perfil')}><div className="avatar">{user?.name.slice(0,2).toUpperCase()}</div><div>{user?.name}<small>Mi perfil y configuración</small></div><ArrowUpRight size={16}/></button></div></aside>{menu && <button className="sidebar-backdrop" aria-label="Cerrar navegación" onClick={()=>setMenu(false)}/>}
 <div className="main-shell"><header className="topbar"><div className="breadcrumb"><button className="icon-button mobile-menu" aria-label="Abrir navegación" onClick={()=>setMenu(!menu)}><Menu size={22}/></button><span>Espacio de trabajo</span><span>/</span><strong>{page}</strong></div><div className="topbar-right"><span className="demo-pill"><i className="dot"/>{audio.fresh?'Captura real activa':'Sin captura activa'}</span><button className="notification" aria-label="Ver alertas" onClick={()=>navigate('Centro de alertas')}><Bell size={19}/>{alerts.length>0 && <i/>}</button><button className="avatar small" aria-label="Abrir mi perfil" onClick={()=>navigate('Mi perfil')}>{user?.name.slice(0,2).toUpperCase()}</button></div></header>
<main><div className="page-heading"><div><div className="eyebrow">TU MEZCLA EN PERSPECTIVA</div><h1>{page}</h1><p>Configuración compartida y datos del dispositivo capturado.</p></div></div>
 <div className="learning-toolbar"><label className="beginner-toggle"><input type="checkbox" role="switch" checked={beginner} onChange={e=>setBeginner(e.target.checked)}/><span>Modo principiante</span><strong>{beginner?'Activado':'Desactivado'}</strong></label><span>{beginner?'Ayuda sencilla y pasos de revisión':'Detalles técnicos disponibles en las guías'}</span></div>
 <AudioStatus/>
 {audio.error&&page!=='Entradas y audio real'&&<p className="text-red" role="alert">{audio.error}</p>}
 {page==='Escucha ambiental'&&<Ambient/>}
 {page==='Entradas y audio real'&&<LiveAudio onConsult={consult} onNavigate={navigate}/>}
 {page==='Panel principal'&&<Dashboard onNavigate={navigate} onConsult={consult}/>}
 {page==='Monitoreo de canales'&&<Channels onConsult={consult}/>}
 {page==='Análisis de audio'&&<Analysis onConsult={consult}/>}
 {page==='Centro de alertas'&&<Alerts onConsult={consult}/>}
 {page==='Recomendaciones'&&<Alerts onConsult={consult} recommendations/>}
 {page==='Historial'&&<HistoryView user={user} onConsult={consult} onOpenDiagnostic={openDiagnostic}/>}
 <div hidden={page!=='Asistente AudiCaz'}><Assistant user={user} monitoring={audio.snapshot()} request={assistantRequest} onSetup={onSetup}/></div>
 {page==='Mi perfil'&&<Profile user={user} onUpdate={onUserUpdate} onLogout={()=>{audio.stop();onLogout();}} onSetup={()=>{audio.stop();onSetup();}}/>}
 <footer><span><AudioLines size={14}/>AudiCaz — Audio bajo control</span><span>{audio.fresh?'Captura real activa':'Sin captura activa'} · Sin control automático de consola</span></footer>
 </main></div></div></LearningContext.Provider>;
}
