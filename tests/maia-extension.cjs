// Set PLAYWRIGHT_PATH to an installed Playwright or Playwright Core module.
const {chromium} = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');

(async () => {
  const extension = path.resolve(__dirname, '../extension');
  const profile = await fs.mkdtemp(path.join(os.tmpdir(), 'compagnon-maia-'));
  let context;
  try {
    context = await chromium.launchPersistentContext(profile, {
      channel:process.env.CHROMIUM_CHANNEL || 'chromium', headless:true,
      args:[`--disable-extensions-except=${extension}`,`--load-extension=${extension}`]
    });
    const initial = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const blackPromotion = '7k/8/8/8/8/8/p7/7K b - - 0 1';
    await context.route('https://www.chess.com/**', route => route.fulfill({
      contentType:'text/html; charset=utf-8',
      body:`<!doctype html><wc-chess-board style="display:block;width:420px;height:420px" fen="${initial}"></wc-chess-board>`
    }));
    const page = await context.newPage();
    await page.goto('https://www.chess.com/play/computer');
    const panel = page.locator('#chess-compagnon');
    await panel.locator('.start:not([disabled])').waitFor();
    await panel.locator('#engine').selectOption('maia');
    await panel.locator('.start:not([disabled])').click();
    const profiles = [];
    for (const elo of [1500,2000,2300]) {
      await panel.locator('#maia-elo').selectOption(String(elo));
      await panel.locator('.meta').filter({hasText:`Maia 3 · ${elo} Elo`}).waitFor();
      assert.equal(await panel.locator('.candidate').count(),3);
      assert.equal(await panel.locator('polygon').count(),1);
      const scores = await panel.locator('.score').allTextContents();
      assert.ok(scores.every(score => score.includes('%')));
      profiles.push(scores.join('|'));
    }
    assert.equal(new Set(profiles).size,3);
    await page.locator('wc-chess-board').evaluate((board,fen) => board.setAttribute('fen',fen),blackPromotion);
    await panel.locator('.move').filter({hasText:'=Q'}).first().waitFor();
    await page.reload();
    await panel.locator('.start:not([disabled])').waitFor();
    assert.equal(await panel.locator('#engine').inputValue(),'maia');
    assert.equal(await panel.locator('#maia-elo').inputValue(),'2300');
    await panel.locator('#engine').selectOption('stockfish');
    await panel.locator('#mode').selectOption('full');
    await panel.locator('.start').click();
    await panel.locator('.meta').filter({hasText:'Profondeur'}).waitFor();
    assert.equal(await panel.locator('.candidate').count(),3);
    await panel.locator('#engine').selectOption('maia');
    await panel.locator('.meta').filter({hasText:'Maia 3 · 2300 Elo'}).waitFor();
    await page.goto('https://www.chess.com/play/online');
    await panel.locator('.start:not([disabled])').click();
    await panel.locator('.meta').filter({hasText:'Maia 3 · 2300 Elo'}).waitFor();
    assert.equal(await panel.locator('.candidate').count(),3);
    assert.equal(await panel.locator('polygon').count(),1);
    console.log('OK : extension MV3, Maia 1500/2000/2300, promotion noire, flèches, sauvegarde, retour Stockfish, disponibilité sur la page en ligne.');
  } catch (error) {
    for (const page of context?.pages() || []) {
      const status = await page.locator('#chess-compagnon .status').textContent({timeout:500}).catch(()=>null);
      const results = await page.locator('#chess-compagnon .results').textContent({timeout:500}).catch(()=>null);
      if(status) console.error({status,results});
    }
    throw error;
  } finally {
    await context?.close();
    await fs.rm(profile,{recursive:true,force:true});
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
