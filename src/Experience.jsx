import React, { useState } from 'react';
import Access from './Access';
import { Setup } from './Profile';
import App from './App';
import {guestDemo} from './guestDemo.mjs';
import { demoAccount } from './services/demoAccount';

export default function Experience() {
  const [user,setUser] = useState(()=>guestDemo.active()?guestDemo.load():demoAccount.current());
  const [setup,setSetup] = useState(()=>!!user && !user.setupDone && !user.setupSkipped);
  function enter(value) {setUser(value);setSetup(!value.setupDone && !value.setupSkipped);}
  if(!user) return <Access onAccess={value=>{guestDemo.leave();enter(value);}} onDemo={()=>enter(guestDemo.enter())}/>;
  if(setup) return <Setup user={user} onSave={value=>{setUser(value);setSetup(false);}} onSkip={()=>{try{setUser((user.isGuest?guestDemo:demoAccount).update({setupSkipped:true}));setSetup(false);}catch{setSetup(false);}}}/>;
  return <App user={user} onUserUpdate={setUser} onSetup={()=>setSetup(true)} onLogout={()=>{if(user.isGuest)guestDemo.leave();else demoAccount.logout();setUser(null);setSetup(false);}}/>;
}
