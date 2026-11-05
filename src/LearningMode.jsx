import React, { createContext, useContext } from 'react';
import { CheckCircle2, PauseCircle, TriangleAlert, CircleHelp } from 'lucide-react';

export const LearningContext = createContext({ beginner: true, technical: false });
export const useLearningMode = () => useContext(LearningContext);

export function signalLabel(level, issue) {
  if (level <= -60) return 'Sin señal de ejemplo';
  if (issue) return issue.severity === 'critical' ? 'Necesita atención' : 'Revisar este canal';
  return 'Nivel de ejemplo estable';
}

export function SoundSummary({ running, alerts, onReview }) {
  const urgent = alerts.some(alert => alert.severity === 'critical');
  const Icon = !running ? PauseCircle : alerts.length ? TriangleAlert : CheckCircle2;
  const title = !running ? 'El monitoreo está pausado' : urgent ? 'Hay un problema que necesita atención' : alerts.length ? 'Hay canales que conviene revisar' : 'Todo está funcionando correctamente en la demostración';
  return <section className={`sound-summary ${urgent ? 'urgent' : alerts.length ? 'attention' : 'clear'}`} aria-label="Resumen del estado general"><Icon size={28} aria-hidden="true"/><div><h2>{title}</h2><p>{!running ? 'Los indicadores están detenidos. Puedes seguir leyendo las ayudas o iniciar la simulación.' : alerts.length ? `Hay ${alerts.length} ${alerts.length === 1 ? 'problema de ejemplo pendiente' : 'problemas de ejemplo pendientes'}. Empieza por el primero y sigue sus instrucciones.` : 'No quedan problemas de ejemplo pendientes. Puedes generar otro en el Centro de alertas.'}</p><small>Este resumen usa datos simulados. No comprueba cómo suena tu equipo ni mide el volumen de la sala.</small></div>{alerts.length > 0 && <button className="secondary-button" onClick={onReview}>Revisar problemas</button>}</section>;
}

export function BeginnerIntro({ page }) {
  const { beginner } = useLearningMode();
  const text = {
    'Asistente AudiCaz': 'Describe lo que escuchas y responde una pregunta a la vez. Las reglas proponen posibilidades; no hay una IA conectada ni mediciones reales de tu equipo.',
    'Panel principal': 'Empieza por el resumen. Si hay un problema, pulsa «¿Cómo lo soluciono?» para recibir ayuda paso a paso.',
    'Monitoreo de canales': 'Cada tarjeta representa un micrófono o instrumento. La barra muestra una señal de ejemplo. Pulsa una tarjeta para entender su estado.',
    'Análisis de audio': 'Estos dibujos muestran cambios inventados del sonido. A la izquierda están los sonidos profundos; a la derecha, los más finos. No son mediciones de tu equipo.',
    'Centro de alertas': 'Revisa primero «Necesita atención». Abre «¿Cómo lo soluciono?», sigue los pasos y marca el problema como solucionado solo después de revisarlo.',
    'Recomendaciones': 'Cada guía corresponde al canal indicado. Sigue los pasos en orden y consulta cómo comprobar el resultado. En esta prueba, completar la guía no comprueba el equipo real.',
    'Historial': 'Aquí quedan los problemas de ejemplo y los que marcaste como solucionados. «Exportar CSV» descarga una tabla que puedes abrir en una hoja de cálculo.',
    'Mi perfil': 'Aquí puedes editar tus datos de prueba y describir tu equipo. Elegir una consola no la conecta a AudiCaz.',
  };
  return beginner ? <p className="beginner-intro"><CircleHelp size={19} aria-hidden="true"/><span>{text[page]}</span></p> : null;
}

export function DigitalExplanation() {
  return <div className="technical-explanation"><strong>Cómo leer los datos técnicos de ejemplo</strong><p><b>dBFS</b> indica el nivel de una señal digital. Al acercarse a 0, queda menos espacio antes de distorsionarse. Un pico es el valor más alto de esa señal.</p><p><b>Frecuencia</b> describe si un sonido es grave o agudo; se expresa en Hz. 1 kHz equivale a 1000 Hz.</p><p>Estos números no son el volumen acústico de las bocinas. Para medir el sonido real de la sala se necesita un micrófono de medición y calibración; AudiCaz no los utiliza en esta demostración.</p></div>;
}
