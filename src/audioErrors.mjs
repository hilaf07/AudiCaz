export function explainAudioError(error,source='browser'){
 const name=error?.name||'',message=String(error?.message||error||'');
 if(name==='NotAllowedError'||/permission denied|permission dismissed/i.test(message))return 'No se permitió usar el micrófono. Abre el permiso de micrófono junto a la dirección del navegador, permite el acceso y vuelve a conectar.';
 if(name==='NotFoundError')return 'No encontramos una entrada de audio. Conecta un micrófono y pulsa Buscar dispositivos.';
 if(name==='NotReadableError')return 'No se pudo abrir el micrófono. Revisa si otra aplicación lo está usando y los permisos de Windows; después vuelve a conectar.';
 if(name==='OverconstrainedError')return 'El dispositivo seleccionado ya no está disponible o no admite la configuración. Busca dispositivos y selecciona una entrada nuevamente.';
 if(name==='TimeoutError'||name==='AbortError')return source==='bridge'?'El puente tardó demasiado en responder. Comprueba su terminal, el dispositivo y los permisos de acceso local del navegador.':'La captura se interrumpió. Revisa el permiso del micrófono y vuelve a conectar.';
 if(source==='bridge'&&(error instanceof TypeError||/failed to fetch|networkerror|fetch failed/i.test(message)))return 'No se pudo contactar al puente de audio. Inicia audio_bridge/server.py en esta misma computadora. Si ya está abierto, comprueba el dominio autorizado y permite el acceso a la red local cuando el navegador lo solicite. También puedes probar con el micrófono del navegador.';
 return message||'No se pudo iniciar el audio. Revisa el dispositivo y vuelve a intentarlo.';
}
