import {assess} from './audioCore.mjs';
// Estado físico observado y revisión manual son campos distintos.
export function advanceAlerts({history,channels,measurements,fresh,now,timers={}},uuid=()=>crypto.randomUUID()){
 let items=history;let changed=false;const next={...timers};
 const edit=(id,patch)=>{items=items.map(h=>h.id===id?{...h,...patch}:h);changed=true;};
 for(const c of channels){
  const m=fresh&&c.enabled?measurements[c.id]:null;
  const t={...(next[c.id]||{})};
  const active=items.filter(h=>h.channel===c.id&&h.active);
  if(!m){for(const h of active)edit(h.id,{active:false,endedAt:new Date(now).toISOString(),endReason:'Medición interrumpida; resultado sin confirmar'});delete next[c.id];continue;}
  if(c.expected&&m.rms< -65)t.silentSince??=now;else delete t.silentSince;
  const issue=assess(c,m,now-(t.silentSince??now));
  if(issue&&!active.some(h=>h.kind===issue.kind)){
   items=[{...issue,id:uuid(),date:new Date(now).toISOString(),channel:c.id,channelName:c.name,type:c.type,source:m.sourceLabel||'Captura real',peak:m.peak,rms:m.rms,resolved:false,active:true},...items].slice(0,500);changed=true;
  }
  for(const h of active){
   const still=h.kind==='peak'?m.peak>=-3:c.expected&&m.rms< -65;
   if(still){delete t['clear-'+h.id];continue;}
   t['clear-'+h.id]??=now;
   if(now-t['clear-'+h.id]>=2000){edit(h.id,{active:false,recoveredAt:new Date(now).toISOString(),recoveryNote:'La condición medida dejó de observarse durante 2 segundos; no confirma una solución audible'});delete t['clear-'+h.id];}
  }
  next[c.id]=t;
 }
 return {history:items,changed,timers:next};
}
