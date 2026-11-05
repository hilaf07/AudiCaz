import { test, expect } from '@playwright/test';

async function enter(page, configured=false) {
  await page.goto('/');
  await page.getByRole('button',{name:'Crear cuenta',exact:true}).click();
  await page.getByLabel('Nombre completo').fill('Equipo Prueba');
  await page.getByLabel('Correo electrónico',{exact:true}).fill('asistente@example.com');
  await page.getByLabel('Iglesia o grupo musical',{exact:true}).fill('Grupo Esperanza');
  await page.getByLabel('Contraseña',{exact:true}).fill('PruebaLocal123');
  await page.getByLabel('Confirmar contraseña',{exact:true}).fill('PruebaLocal123');
  await page.getByRole('checkbox').check();
  await page.getByRole('button',{name:'Crear cuenta',exact:true}).click();
  if(configured){
    await page.getByRole('button',{name:'Continuar',exact:true}).click();
    await page.getByLabel('Teclado',{exact:true}).check();
    await page.getByRole('button',{name:'Continuar',exact:true}).click();
    await page.getByLabel('¿Qué consola de sonido utilizas?').selectOption('Behringer XR18');
    await page.getByLabel('Descripción de tus bocinas (opcional)').fill('Dos bocinas al frente');
    await page.getByRole('button',{name:'Guardar y entrar'}).click();
  }else await page.getByRole('button',{name:'Omitir por ahora y entrar al panel'}).click();
}
async function nav(page,name){
  const toggle=page.getByRole('button',{name:'Abrir navegación'});
  if(await toggle.isVisible())await toggle.click();
  await page.getByRole('navigation').getByRole('button',{name,exact:true}).click();
}
async function option(page,name){await page.locator('.assistant-choices').first().getByRole('button',{name,exact:true}).click();}
async function finishQuestions(page, hasEquipment=true){
  if(!hasEquipment)await option(page,'Solo bocinas');
  await option(page,'Solo cuando alguien canta o toca');
  await option(page,'En todas las bocinas');
  await option(page,'No hubo cambios que recuerde');
  await option(page,'No lo sé');
  await expect(page.getByRole('region',{name:'Posibles causas y comprobaciones'})).toBeVisible();
}

test('conversación libre, datos simulados, resultado e historial persistente',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await enter(page,true);
  await page.getByRole('button',{name:'Tengo un problema con el sonido'}).click();
  await expect(page.getByRole('heading',{name:'Asistente AudiCaz',exact:true})).toBeVisible();
  await page.getByLabel('Describe tu problema de sonido').fill('Las voces se escuchan muy bajas.');
  await page.getByRole('button',{name:'Enviar',exact:true}).click();
  await expect(page.locator('.diagnosis-card')).toHaveCount(0);
  await expect(page.locator('.assistant-live-question')).toContainText('¿Cuándo sucede?');
  await page.getByLabel('Escribe tu respuesta',{exact:true}).fill('Solo al cantar el grupo completo');
  await page.getByRole('button',{name:'Enviar',exact:true}).click();
  await option(page,'En todas las bocinas');
  await option(page,'Después de ajustar el sonido');
  await option(page,'Sí, cerca se escucha bien');
  const plan=page.getByRole('region',{name:'Posibles causas y comprobaciones'});
  await expect(plan).toContainText('Voces');
  await expect(plan).toContainText('No hay conexión a la consola');
  await expect(plan).toContainText('solo está disponible un nivel simulado');
  await expect(plan).toContainText('Cómo comprobarlo:');
  await expect(page.getByRole('complementary',{name:'Contexto del equipo'})).toContainText('Behringer XR18');
  await expect(page.getByRole('complementary',{name:'Contexto del equipo'})).toContainText('Dos bocinas al frente');
  await page.getByRole('button',{name:'Mejoró un poco',exact:true}).click();
  await expect(page.locator('.saved-outcome')).toContainText('Mejoró un poco');
  await page.getByRole('button',{name:'Historial de diagnósticos',exact:true}).click();
  await expect(page.locator('.diagnostic-history-row')).toHaveCount(1);
  await page.locator('.diagnostic-history-row').click();
  await expect(page.locator('.diagnosis-card')).toBeVisible();
  await nav(page,'Panel principal');
  await page.reload();
  await nav(page,'Asistente AudiCaz');
  await expect(page.locator('.diagnosis-card')).toContainText('Voces');
  await expect(page.locator('.saved-outcome')).toContainText('Mejoró un poco');
  const stored=await page.evaluate(()=>{const key=Object.keys(localStorage).find(k=>k.startsWith('audicaz-diagnostics-v1:'));return JSON.parse(localStorage.getItem(key));});
  expect(stored).toHaveLength(1);expect(stored[0].answers.timing).toBe('Solo al cantar el grupo completo');
  expect(stored[0].diagnosis.causes.length).toBeGreaterThan(1);expect(stored[0].outcome.code).toBe('partial');
  expect(errors).toEqual([]);
});

test('sin equipo configurado pregunta primero; no recomienda consola a quien solo tiene bocinas',async({page})=>{
  await enter(page);
  await page.getByRole('button',{name:'Tengo un problema con el sonido'}).click();
  await page.getByLabel('Describe tu problema de sonido').fill('La guitarra se escucha muy débil.');
  await page.getByRole('button',{name:'Enviar',exact:true}).click();
  await expect(page.locator('.assistant-live-question')).toContainText('¿Con qué equipo');
  await finishQuestions(page,false);
  await expect(page.locator('.diagnosis-card')).not.toContainText('de tu consola');
  await page.getByRole('button',{name:'No lo he probado',exact:true}).click();
  await expect(page.locator('.saved-outcome')).toContainText('Sin comprobar');
});

test('acceso desde alertas y recomendaciones, consultas nuevas sin borrar anteriores',async({page})=>{
  await enter(page,true);
  await nav(page,'Centro de alertas');
  await page.locator('.alert-item').first().getByRole('button',{name:'Consultar al asistente',exact:true}).click();
  await expect(page.locator('.assistant-live-question')).toContainText('¿Cuándo sucede?');
  await expect(page.locator('.diagnosis-card')).toHaveCount(0);
  await finishQuestions(page);
  await page.getByRole('button',{name:'Sí, se solucionó',exact:true}).click();
  await expect(page.locator('.saved-outcome')).toContainText('según el usuario');
  await nav(page,'Centro de alertas');
  await expect(page.locator('.alert-item')).toHaveCount(2); // La observación no resuelve alertas simuladas.
  await nav(page,'Recomendaciones');
  await page.locator('.recommendation-card').first().getByRole('button',{name:'Consultar al asistente',exact:true}).click();
  await expect(page.locator('.diagnosis-card')).toHaveCount(0);
  await page.getByRole('button',{name:'Historial de diagnósticos',exact:true}).click();
  await expect(page.locator('.diagnostic-history-row')).toHaveCount(2);
  await nav(page,'Panel principal');
  await page.getByRole('button',{name:'Tengo un problema con el sonido'}).click();
  await expect(page.getByLabel('Describe tu problema de sonido')).toBeVisible();
  await page.getByRole('button',{name:'Historial de diagnósticos',exact:true}).click();
  await expect(page.locator('.diagnostic-history-row')).toHaveCount(2);
});

for(const width of [390,820,1440])test(`asistente adaptable a ${width}px`,async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width,height:950});
  await enter(page,true);
  await page.getByRole('button',{name:'Tengo un problema con el sonido'}).click();
  await page.screenshot({path:`test-results/asistente-${width}.png`,fullPage:true});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.getByRole('button',{name:'El teclado suena demasiado fuerte.',exact:true}).click();
  await finishQuestions(page);
  await page.screenshot({path:`test-results/diagnostico-${width}.png`,fullPage:true});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});
