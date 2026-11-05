// Persistencia separada del motor: sustituible por endpoints de backend autenticados.
const key = userId => `audicaz-diagnostics-v1:${userId}`;
export const diagnosticRepository = {
  load(userId) {
    try {
      const items=JSON.parse(localStorage.getItem(key(userId)));
      if(!Array.isArray(items)) return [];
      return items.filter(item=>item && item.engine==='rules-v1' && typeof item.id==='string' && typeof item.report==='string' && Array.isArray(item.messages) && item.context?.setup && item.context?.monitoring && item.answers && (item.question || item.diagnosis));
    } catch { return []; }
  },
  save(userId,sessions) {
    try {localStorage.setItem(key(userId),JSON.stringify(sessions));}
    catch {throw new Error('No se pudo guardar el historial de diagnósticos. La conversación sigue disponible durante esta sesión.');}
  },
};
