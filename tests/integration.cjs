const {chromium}=require(process.env.PLAYWRIGHT_PATH);
const path=require('node:path');const fs=require('node:fs');const os=require('node:os');const assert=require('node:assert/strict');
(async()=>{
 const extension=path.resolve(__dirname,'../extension');
 const context=await chromium.launchPersistentContext(fs.mkdtempSync(path.join(os.tmpdir(),'compagnon-test-')),{channel:'msedge',headless:true,args:[`--load-extension=${extension}`],viewport:{width:1440,height:1000}});
 try {
  const worker=context.serviceWorkers()[0]||await context.waitForEvent('serviceworker',{timeout:20000});
  console.log('Extension chargée :',worker.url());
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.log('PAGE ERROR',e.message)});
  page.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text())});
  await page.goto('https://www.chess.com/analysis',{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>document.querySelector('wc-chess-board')?.game?.getFEN?.());
  const panel=page.locator('#chess-compagnon');
  console.log('Panneau :',await panel.innerText());
  await panel.locator('.start:not([disabled])').waitFor({timeout:30000});
  console.log('Dialogs :',await page.locator('dialog[open]').allTextContents());
  await page.keyboard.press('Escape');
  await panel.locator('#mode').selectOption('full');
  await panel.locator('.start').click();
  try{await panel.locator('.candidate').first().waitFor({timeout:10000});}catch(e){console.log('DIAGNOSTIC',await panel.locator('.panel').innerText(),await page.evaluate(()=>({hidden:document.hidden,fen:document.querySelector('wc-chess-board')?.getAttribute('data-compagnon-fen')})));console.log('FRAMES',page.frames().map(f=>f.url()));throw e;}
  assert.equal(await panel.locator('.candidate').count(),3);
  assert.equal(await panel.locator('polygon').count(),1);
  console.log('Position initiale, moteur réel :',await panel.locator('.results').innerText());
  await page.screenshot({path:path.join(__dirname,'chess-com-analysis.png')});
  await panel.locator('.candidate').nth(1).click();assert.ok((await panel.locator('.candidate').nth(1).getAttribute('class')).includes('selected'));
  await page.evaluate(()=>document.querySelector('wc-chess-board').game.move('e4'));
  await page.waitForTimeout(1500);await panel.locator('.candidate').first().waitFor({timeout:15000});
  assert.match(await panel.locator('.fen').inputValue(),/ b /);
  console.log('Après e4 :',await panel.locator('.status').innerText());
  await panel.locator('#side').selectOption('w');await page.waitForTimeout(500);
  assert.equal(await panel.locator('polygon').count(),0);assert.match(await panel.locator('.status').innerText(),/attente/);
  await panel.locator('#side').selectOption('both');await panel.locator('.candidate').first().waitFor();
  await panel.locator('.start').click();assert.equal(await panel.locator('polygon').count(),0);
  assert.match(await panel.locator('.results').innerText(),/pause/);
  await panel.locator('.start').click();await panel.locator('.candidate').first().waitFor();
  await panel.locator('.close').click();assert.equal(await panel.count(),0);
  console.log('OK : lecture Chess.com, 3 variantes, flèche, changement de position, camp, pause, reprise, fermeture.');
  console.log('Erreurs de page :',errors);
 } finally {await context.close();}
})().catch(e=>{console.error(e);process.exit(1)});
