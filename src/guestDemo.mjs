const KEY='audicaz-guest-profile-v1',ACTIVE='audicaz-guest-active';
const initial=()=>({id:'audicaz-guest-local',isGuest:true,name:'Visitante',email:'',group:'Mi prueba de audio',setupDone:true,setupSkipped:true,setup:{equipment:'Micrófono de esta computadora',console:'No utilizo consola',microphones:1,instruments:[],speakers:''}});
export const guestDemo={
 load(){try{const x=JSON.parse(localStorage.getItem(KEY));return x&&x.id==='audicaz-guest-local'&&x.setup&&typeof x.name==='string'?{...initial(),...x,isGuest:true}:initial();}catch{return initial();}},
 active(){try{return sessionStorage.getItem(ACTIVE)==='yes';}catch{return false;}},
 enter(){try{sessionStorage.setItem(ACTIVE,'yes');}catch{}return this.load();},
 update(fields){const next={...this.load(),...fields,id:'audicaz-guest-local',isGuest:true};try{localStorage.setItem(KEY,JSON.stringify(next));}catch{throw Error('No se pudieron guardar las preferencias en este navegador.');}return next;},
 leave(){try{sessionStorage.removeItem(ACTIVE);}catch{}}
};
