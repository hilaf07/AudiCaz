import { test, expect } from '@playwright/test';

async function enter(page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Crear cuenta', exact: true }).click();
  await page.getByLabel('Nombre completo').fill('Usuario Principiante');
  await page.getByLabel('Correo electrónico', { exact: true }).fill('principiante@example.com');
  await page.getByLabel('Iglesia o grupo musical', { exact: true }).fill('Grupo de prueba');
  await page.getByLabel('Contraseña', { exact: true }).fill('SoloPrueba123');
  await page.getByLabel('Confirmar contraseña', { exact: true }).fill('SoloPrueba123');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Crear cuenta', exact: true }).click();
  await page.getByRole('button', { name: 'Omitir por ahora y entrar al panel' }).click();
}
async function nav(page, name) {
  const toggle = page.getByRole('button', { name: 'Abrir navegación' });
  if (await toggle.isVisible()) await toggle.click();
  await page.getByRole('navigation').getByRole('button', { name, exact: true }).click();
}

test('modo principiante persistente, detalles opcionales y todos los módulos en ambas vistas', async ({ page }) => {
  const errors=[]; page.on('pageerror',error=>errors.push(error.message));
  await enter(page);
  const mode = page.getByRole('switch', { name: /Modo principiante/ });
  await expect(mode).toBeChecked();
  await expect(page.getByRole('region', { name: 'Resumen del estado general' })).toContainText('datos simulados');
  await expect(page.locator('.channel-card')).not.toContainText(['dBFS','dBFS','dBFS','dBFS','dBFS','dBFS']);
  await page.locator('.learning-toolbar').getByRole('button', { name: 'Ver detalles técnicos', exact: true }).click();
  await expect(page.locator('.channel-card').first()).toContainText('dBFS');
  await expect(page.locator('main>.technical-explanation')).toContainText('no son el volumen acústico');
  await page.locator('.learning-toolbar').getByRole('button', { name: 'Ocultar detalles técnicos', exact: true }).click();
  for (const beginner of [true,false]) {
    await mode.setChecked(beginner);
    for (const name of ['Panel principal','Monitoreo de canales','Análisis de audio','Centro de alertas','Recomendaciones','Historial','Mi perfil']) {
      await nav(page,name);
      await expect(mode).toBeChecked({checked:beginner});
      if(beginner) await expect(page.locator('.beginner-intro')).toBeVisible();
      else await expect(page.locator('.beginner-intro')).toHaveCount(0);
      if(name==='Monitoreo de canales') expect(await page.locator('.channel-card').first().innerText()).toContain(beginner?'Estable':'dBFS');
    }
  }
  await page.reload();
  await expect(mode).not.toBeChecked();
  await mode.check();
  await page.reload();
  await expect(mode).toBeChecked();
  await page.getByRole('button',{name:'Pausar simulación'}).click();
  await expect(page.getByRole('region',{name:'Resumen del estado general'})).toContainText('monitoreo está pausado');
  expect(errors).toEqual([]);
});

test('los cinco problemas tienen guía específica, ayuda técnica y controles accesibles', async ({ page }) => {
  const errors=[]; page.on('pageerror',error=>errors.push(error.message));
  await enter(page);
  await nav(page,'Centro de alertas');
  const scenarios = [
    ['clipping','La salida principal podría sonar distorsionada','Salida principal','Clipping'],
    ['feedback','El micrófono podría producir un silbido','Micrófono principal','Feedback'],
    ['silence','No llega sonido del teclado','Teclado','Ausencia de señal'],
    ['vocal','Las voces llegan demasiado fuertes','Voces','Saturación vocal'],
    ['loud','La batería tapa a los demás','Batería','balance'],
  ];
  for (const [key,title,channel,term] of scenarios) {
    await page.getByLabel('Tipo de problema').selectOption(key);
    await page.getByRole('button',{name:'Simular problema',exact:true}).click();
    const article = page.locator('.alert-item').filter({has:page.getByRole('heading',{name:title,exact:true})}).first();
    const trigger = article.getByRole('button',{name:'¿Cómo lo soluciono?',exact:true});
    await trigger.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText(channel);
    for(const label of ['¿Qué está pasando?','¿Por qué puede ocurrir?','¿Qué debo hacer?','Pasos para solucionarlo','¿Cómo verificar el resultado?']) await expect(dialog).toContainText(label);
    await expect(dialog.locator('ol>li')).toHaveCount(3);
    await expect(dialog).toContainText('no confirma que el equipo real esté corregido');
    await expect(page.locator('.app')).toHaveAttribute('inert','');
    await expect(dialog.getByRole('button',{name:'Cerrar explicación'})).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(dialog.getByRole('button',{name:'Volver sin cambiar el estado'})).toBeFocused();
    await dialog.getByRole('button',{name:'Ver detalles técnicos',exact:true}).click();
    await expect(dialog.locator('.technical-explanation')).toContainText(term);
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
  }
  await page.getByRole('button',{name:'¿Cómo lo soluciono?',exact:true}).first().click();
  await page.getByRole('button',{name:'Ya revisé los pasos: marcar como solucionado'}).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByLabel('Filtrar por gravedad').selectOption('resolved');
  await expect(page.locator('.alert-item')).toHaveCount(1);
  await page.getByRole('button',{name:'¿Cómo lo soluciono?',exact:true}).click();
  await expect(page.getByRole('dialog')).toContainText('Solucionado en la demostración');
  await expect(page.getByRole('button',{name:'Ya revisé los pasos: marcar como solucionado'})).toHaveCount(0);
  expect(errors).toEqual([]);
});

for(const width of [390,820,1440]) test(`guía y modo principiante adaptables a ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:900});
  await enter(page);
  await page.screenshot({path:`test-results/principiante-${width}.png`,fullPage:true});
  await page.getByRole('button',{name:'¿Cómo lo soluciono?',exact:true}).first().click();
  const dialog=page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:`test-results/guia-${width}.png`});
  await page.getByRole('button',{name:'Volver sin cambiar el estado'}).click();
  await page.locator('.learning-toolbar').getByRole('button',{name:'Ver detalles técnicos',exact:true}).click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('resumen claro para problema importante y sesión sin pendientes',async({page})=>{
  await enter(page);
  await nav(page,'Centro de alertas');
  await page.getByLabel('Tipo de problema').selectOption('clipping');
  await page.getByRole('button',{name:'Simular problema',exact:true}).click();
  await nav(page,'Panel principal');
  await expect(page.getByRole('region',{name:'Resumen del estado general'})).toContainText('Hay un problema que necesita atención');
  await expect(page.locator('.alert-item').first()).toContainText('La salida principal podría sonar distorsionada');
  await nav(page,'Centro de alertas');
  for(let i=0;i<3;i++) await page.locator('.resolve').first().click();
  await nav(page,'Panel principal');
  await expect(page.getByRole('region',{name:'Resumen del estado general'})).toContainText('Todo está funcionando correctamente en la demostración');
  await nav(page,'Historial');
  await expect(page.locator('tbody tr')).toHaveCount(3);
  await page.getByRole('button',{name:'¿Cómo lo soluciono?',exact:true}).first().click();
  await expect(page.getByRole('dialog')).toContainText('Solucionado en la demostración');
});
