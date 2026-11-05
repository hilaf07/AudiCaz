import {normalize} from './rules.js';
export function isUnknownAnswer(text){return /^(?:no (?:lo )?se(?: todavia)?|no estoy segur[oa]|no sabria|desconozco|otro o no lo se)$/.test(normalize(text).replace(/[.!?¿]/g,'').trim());}
export function questionHelp(id,session){
 const browser=session?.context.monitoring?.source==='browser';
 const help={
 channel:'Busca el número junto al conector donde entra el cable del micrófono o instrumento. Si solo pruebas la laptop, indica Voz o Micrófono. Elegir un nombre en AUDICAZ no mueve cables ni cambia la consola.',
 symptom:'Describe una sola diferencia: poco volumen, demasiado fuerte, sonido roto, ruido, silbido, eco o cortes. Puedes escribir «mi voz se escucha baja». No hace falta conocer el nombre técnico.',
 equipment:browser?'Si solo pruebas el micrófono de la computadora, elige «Micrófono de esta computadora». Si además escuchas una consola y bocinas, elige ese equipo. La fuente capturada y el equipo donde escuchas el problema pueden ser distintos.':'Una consola es la caja con controles por canal. Si no hay una, elige solo bocinas o equipo portátil. No cambies controles para averiguarlo; puedes preguntar al responsable.',
 timing:'Observa si ocurre siempre, solo mientras alguien toca o habla, o en intervalos. Si todavía no has probado, puedes continuar sin ese dato.',
 scope:browser?'Si solo estás probando la laptop, elige «Solo estoy probando la captura del micrófono». No necesitas tener bocinas conectadas.':'Escucha a volumen cómodo si ocurre en todas las bocinas o en una sola. No muevas equipos ni cambies cables mientras suenan. Si no puedes compararlas, continúa sin ese dato.',
 change:'Piensa si empezó al mover un cable, cambiar un control o conectar algo. Si no recuerdas cambios, puedes elegir esa opción. No tienes que inventar una respuesta.',
 check:'Haz únicamente la comprobación descrita si tienes ese equipo y sabes identificarlo. Si no corresponde a tu prueba o no puedes comprobarlo, elige «Continuar sin ese dato». La guía será más general.',
 sourceSetup:'La configuración guardada puede ser de otra actividad. Confirma solo si esa fuente está en uso ahora; puedes editar el perfil después.',
 };
 return help[id]||'Puedes responder con tus palabras o continuar sin ese dato. Sin información suficiente solo se propondrán comprobaciones generales.';
}
