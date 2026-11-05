import React, { useState, useId, useEffect } from 'react';
import { CircleHelp } from 'lucide-react';
import { useLearningMode } from './LearningMode';
export function HelpHint({ text, label = '¿Qué significa este indicador?' }) {const [open,setOpen]=useState(false);const id=useId();return <span className="help-hint"><button className="icon-button" aria-label={label} aria-expanded={open} aria-controls={id} onClick={()=>setOpen(!open)}><CircleHelp size={17}/></button>{open && <span id={id} className="help-popover" role="status">{text}</span>}</span>;}
export function ProblemGuide({ problem }) {
  const [technical,setTechnical] = useState(false);
  const {beginner} = useLearningMode();
  useEffect(()=>{if(beginner)setTechnical(false);},[beginner]);
  const id=useId();
  return <div className="problem-guide"><dl><dt>¿Qué está pasando?</dt><dd>{problem.description}</dd><dt>¿En qué canal ocurre?</dt><dd>{problem.channelName}</dd><dt>¿Por qué puede ocurrir?</dt><dd>{problem.cause}</dd></dl><h3>¿Qué debo hacer?</h3><p>{problem.recommendation}</p><h3>Pasos para solucionarlo</h3><ol>{problem.steps.map(step=><li key={step}>{step}</li>)}</ol><h3>¿Cómo verificar el resultado?</h3><p>{problem.verification}</p><div className="inline-help">En esta demostración no escuchamos el resultado ni cambiamos la consola. Marcar como solucionado solo actualiza este ejemplo; no confirma que el equipo real esté corregido.</div><button className="text-button" aria-expanded={technical} aria-controls={id} onClick={()=>setTechnical(!technical)}>{technical?'Ocultar detalles técnicos':'Ver detalles técnicos'}</button>{technical && <div className="technical-explanation" id={id}>{problem.technical}<p>dBFS es el nivel digital; no mide el volumen acústico de la sala. Todos los datos de AudiCaz son simulados.</p></div>}</div>;
}
