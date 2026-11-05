import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, TriangleAlert, CircleCheck } from 'lucide-react';
import { ProblemGuide } from './Guidance';

export default function SolutionDialog({ problem, onClose, onResolve, onAssistant }) {
  const dialog = useRef(null);
  useEffect(() => {
    if (!problem) return;
    const previous = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current?.querySelector('button')?.focus();
    function keyboard(event) {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); }
      if (event.key !== 'Tab') return;
      const elements = [...dialog.current.querySelectorAll('button, a[href], input, select, [tabindex="0"]')].filter(element => !element.disabled && element.getClientRects().length);
      const first = elements[0], last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    document.addEventListener('keydown', keyboard);
    return () => { document.removeEventListener('keydown', keyboard); document.body.style.overflow = previousOverflow; previous?.focus(); };
  }, [problem?.id]);
  if (!problem) return null;
  const Icon = problem.resolved ? CircleCheck : TriangleAlert;
  return createPortal(<div className="modal-backdrop" onClick={onClose}><section ref={dialog} className="modal solution-dialog" role="dialog" aria-modal="true" aria-labelledby="solution-title" onClick={event => event.stopPropagation()}><button className="icon-button modal-close" aria-label="Cerrar explicación" onClick={onClose}><X size={22}/></button><span className="eyebrow">GUÍA PASO A PASO · DATOS SIMULADOS</span><h2 id="solution-title">{problem.title}</h2><span className={`solution-status ${problem.severity}`}><Icon size={17} aria-hidden="true"/>{problem.resolved ? 'Solucionado en la demostración' : problem.severity === 'critical' ? 'Necesita atención' : 'Advertencia'}</span><ProblemGuide problem={problem}/>{onAssistant && <button className="secondary-button" onClick={()=>onAssistant(problem)}>Consultar al asistente</button>}{!problem.resolved && <button className="primary-button" onClick={() => { onResolve(problem.id); onClose(); }}><Check size={18}/>Ya revisé los pasos: marcar como solucionado</button>}<button className="secondary-button" onClick={onClose}>Volver sin cambiar el estado</button></section></div>, document.body);
}
