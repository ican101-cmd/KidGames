const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),http=require('http'),path=require('path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+decodeURI(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(e,data)=>{if(e){res.writeHead(404).end();return;}res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(data);});});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,channel:process.env.TEST_BROWSER || 'msedge'});
 const page=await browser.newPage({viewport:{width:390,height:844},acceptDownloads:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 const results=[];const record=name=>{results.push(name);console.log('PASS '+name);};
 try{
 await page.goto(`http://127.0.0.1:${server.address().port}/`);
 await page.evaluate(()=>{skipIntro();selectChar('girl');confirmCharacter();});
 assert(await page.locator('.rpg-hero').first().evaluate(el=>el.classList.contains('girl')));record('new game and girl selection');
 for(const width of [375,390,430,768,1280]){
  await page.setViewportSize({width,height:width===768?1024:844});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert(await page.locator('#mode-select').evaluate(el=>el.scrollHeight<=el.clientHeight+1));
  await page.screenshot({path:`tests/menu-${width}.png`});
  record(`menu layout ${width}px`);
 }
 await page.evaluate(()=>{player.coins=20000;saveGame();openShop();});
 for(const id of ['wood_sword','iron_sword','magic_wand','silver_spear','golden_bow','diamond_sword']){
  await page.evaluate(id=>buyWeapon(id),id);assert.equal(await page.evaluate(()=>player.weapon),id);
 }
 await page.evaluate(()=>{for(const slot of ['helmet','chest','gloves','boots'])buyArmor(slot,'diamond');buyBg('pink');buyBg('blue');buyBg('green');closeShop();});
 assert.equal(await page.evaluate(()=>calculateMaxHp()),100);record('shop buy/equip all weapons, armor, backgrounds');
 const keys=await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('fruit_')).sort());
 assert.equal(keys.length,14);
 await page.reload();assert.equal(await page.evaluate(()=>player.weapon),'diamond_sword');assert.equal(await page.evaluate(()=>player.helmet),'diamond');record('legacy fruit_* save reload');
 await page.evaluate(()=>{skipIntro();confirmCharacter();});
 const downloadPromise=page.waitForEvent('download');await page.evaluate(()=>exportSaveFile());const download=await downloadPromise;await download.saveAs(path.join(root,'tests/export.json'));
 const exported=JSON.parse(fs.readFileSync(path.join(root,'tests/export.json')));assert.equal(exported.weapon,'diamond_sword');
 await page.setInputFiles('#import-file-input',{name:'legacy.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({...exported,coins:1234,gender:'girl'}))});
 await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>player.coins),1234);record('export and import legacy JSON');
 await page.evaluate(()=>{openRedeemModal();document.getElementById('code-input').value='goodboy';submitRedeemCode();closeRedeemModal();});assert.equal(await page.evaluate(()=>player.coins),1734);record('reward code');
 for(const id of ['wood_sword','iron_sword','magic_wand','silver_spear','golden_bow','diamond_sword']){
  await page.evaluate(id=>{player.weapon=id;saveGame();startGame('easy');slimeMaxHp=slimeHp=500;updateBars();window.testAttack=checkAnswer(currentAnswer);},id);
  await page.waitForTimeout(90);assert.equal(await page.evaluate(()=>slimeHp),500);
  if(['magic_wand','golden_bow'].includes(id)){await page.waitForTimeout(220);assert.equal(await page.locator('.projectile').count(),1);}
  await page.evaluate(()=>window.testAttack);
  assert.equal(await page.evaluate(()=>slimeHp),500-await page.evaluate(id=>weapons[id].dmg,id));
  await page.waitForTimeout(900);assert.equal(await page.locator('#effect-layer > *').count(),0);record(`${id}: impact timing, damage and cleanup`);
 }
 for(const width of [375,390,430,768,1280]){
  await page.setViewportSize({width,height:844});
  const layout=await page.evaluate(()=>{const h=document.getElementById('player-visual-box').getBoundingClientRect(),e=document.getElementById('slime-container').getBoundingClientRect();return{overlap:h.right>=e.left,overflow:document.documentElement.scrollWidth>innerWidth};});assert(!layout.overlap&&!layout.overflow);await page.screenshot({path:`tests/battle-${width}.png`});record(`battle layout ${width}px`);
 }
 await page.evaluate(()=>{startGame('medium');window.testAttack=checkAnswer(currentAnswer+100);});
 await page.waitForTimeout(500);assert.equal(await page.evaluate(()=>playerHp),100);await page.evaluate(()=>window.testAttack);await page.waitForTimeout(800);assert.equal(await page.evaluate(()=>playerHp),80);record('wrong answer counterattack timing');
 await page.evaluate(()=>{startGame('medium');player.weapon='diamond_sword';window.testAttack=checkAnswer(currentAnswer);});await page.evaluate(()=>window.testAttack);await page.waitForTimeout(600);assert(await page.locator('#level-cleared-screen').isVisible());assert(await page.evaluate(()=>player.bossUnlocked));record('monster death, rewards and boss unlock');
 await page.evaluate(()=>{document.getElementById('level-cleared-screen').style.display='none';startGame('boss');level=5;startLevel();});assert(await page.locator('#boss-svg-elem').isVisible());
 await page.evaluate(()=>{window.testAttack=checkAnswer(currentAnswer);});await page.evaluate(()=>window.testAttack);assert.equal(await page.evaluate(()=>slimeHp),100);
 await page.waitForTimeout(700);await page.evaluate(()=>{window.testAttack=checkAnswer(currentAnswer);});await page.evaluate(()=>window.testAttack);await page.waitForTimeout(2900);assert(await page.locator('#boss-victory-card').isVisible());record('boss hit, damage and victory');
 await page.evaluate(()=>{closeBossStage();startGame('easy');playerHp=20;window.testAttack=handleMonsterAttack();});await page.evaluate(()=>window.testAttack);await page.waitForTimeout(550);assert(await page.locator('#game-over-screen').isVisible());await page.evaluate(()=>retryCurrentLevel());assert.equal(await page.evaluate(()=>playerHp),100);record('game over and retry');
 await page.evaluate(()=>{selectChar('boy');confirmCharacter();startGame('easy');timeLeft=1;});
 assert.equal(await page.locator('.rpg-hero').first().evaluate(el=>el.classList.contains('girl')),false);
 await page.waitForTimeout(1900);assert.equal(await page.evaluate(()=>playerHp),80);record('boy selection and timeout counterattack');
 await page.waitForTimeout(900);
 await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(()=>{player.weapon='golden_bow';window.testAttack=checkAnswer(currentAnswer);});await page.evaluate(()=>window.testAttack);record('reduced motion combat');
 assert.deepEqual(errors,[]);record('no browser runtime errors');
 fs.writeFileSync(path.join(root,'tests/results.json'),JSON.stringify({passed:results,errors},null,2));
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
