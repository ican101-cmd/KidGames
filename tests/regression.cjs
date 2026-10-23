const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),http=require('http'),path=require('path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
 const urlPath=req.url.split('?')[0].replace(/^\/KidGames(?=\/)/,'');
 const file=path.resolve(root,'.'+decodeURI(urlPath==='/'?'/index.html':urlPath));
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(file,(e,data)=>{if(e){res.writeHead(404).end();return;}
 res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.webp')?'image/webp':'text/html');res.end(data);});
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,channel:process.env.TEST_BROWSER || 'msedge'});
 const page=await browser.newPage({viewport:{width:390,height:844},acceptDownloads:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 const results=[];const record=name=>{results.push(name);console.log('PASS '+name);};
 try{
 await page.goto(`http://127.0.0.1:${server.address().port}/KidGames/`);
 await page.evaluate(()=>{window.heroAudioEvents=[];const original=WeaponAudio.hero;WeaponAudio.hero=(ctx,event)=>{heroAudioEvents.push({event,hp:playerHp});return original(ctx,event);};skipIntro();selectChar('girl');confirmCharacter();});
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
 assert.equal(keys.length,15);
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
 await page.evaluate(()=>{window.heroAudioEvents=[];const original=WeaponAudio.hero;WeaponAudio.hero=(ctx,event)=>{heroAudioEvents.push({event,hp:playerHp});return original(ctx,event);};startGame('medium');window.testAttack=checkAnswer(currentAnswer+100);});
 await page.waitForTimeout(500);assert.equal(await page.evaluate(()=>playerHp),100);await page.evaluate(()=>window.testAttack);await page.waitForTimeout(800);assert.equal(await page.evaluate(()=>playerHp),80);record('wrong answer counterattack timing');assert.deepEqual(await page.evaluate(()=>heroAudioEvents),[{event:'hit',hp:80}]);record('hero hit sound coincides with HP decrease');
 await page.evaluate(()=>{startGame('medium');player.weapon='diamond_sword';window.testAttack=checkAnswer(currentAnswer);});await page.evaluate(()=>window.testAttack);await page.waitForTimeout(600);assert(await page.locator('#level-cleared-screen').isVisible());assert(await page.evaluate(()=>player.bossUnlocked));record('monster death, rewards and boss unlock');
 await page.evaluate(()=>{document.getElementById('level-cleared-screen').style.display='none';startGame('boss');level=5;startLevel();});assert(await page.locator('#boss-svg-elem').isVisible());
 await page.evaluate(()=>{window.testAttack=checkAnswer(currentAnswer);});await page.evaluate(()=>window.testAttack);assert.equal(await page.evaluate(()=>slimeHp),100);
 await page.waitForTimeout(700);await page.evaluate(()=>{window.testAttack=checkAnswer(currentAnswer);});await page.evaluate(()=>window.testAttack);await page.waitForTimeout(2900);assert(await page.locator('#boss-victory-card').isVisible());record('boss hit, damage and victory');
 await page.evaluate(()=>{closeBossStage();startGame('easy');playerHp=20;window.testAttack=handleMonsterAttack();});await page.evaluate(()=>window.testAttack);await page.waitForTimeout(550);assert(await page.locator('#game-over-screen').isVisible());await page.evaluate(()=>retryCurrentLevel());assert.equal(await page.evaluate(()=>playerHp),100);record('game over and retry');assert.deepEqual(await page.evaluate(()=>heroAudioEvents.slice(-2)),[{event:'hit',hp:0},{event:'death',hp:0}]);record('lethal hit plays one impact followed by one defeat sound');
 await page.evaluate(()=>{selectChar('boy');confirmCharacter();startGame('easy');timeLeft=1;});
 assert.equal(await page.locator('.rpg-hero').first().evaluate(el=>el.classList.contains('girl')),false);
 await page.waitForTimeout(1900);assert.equal(await page.evaluate(()=>playerHp),80);record('boy selection and timeout counterattack');
 await page.waitForTimeout(900);
 await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(()=>{player.weapon='golden_bow';window.testAttack=checkAnswer(currentAnswer);});await page.evaluate(()=>window.testAttack);record('reduced motion combat');
 await page.emulateMedia({reducedMotion:'no-preference'});
 const artAssets=JSON.parse(fs.readFileSync(path.join(root,'docs/art-assets.json')));
 for(const asset of artAssets){const response=await page.request.get(`http://127.0.0.1:${server.address().port}/KidGames/${asset.file}`);assert.equal(response.status(),200);assert.equal(response.headers()['content-type'],'image/webp');}
 record('all 11 illustrated assets load under GitHub Pages /KidGames/ path');
 await page.setViewportSize({width:390,height:844});
 for(const theme of ['green','pink','blue'])for(let sceneLevel=1;sceneLevel<=5;sceneLevel++){
  await page.evaluate(({theme,sceneLevel})=>{player.bg=theme;player.gender='boy';player.weapon='wood_sword';for(const slot of ['helmet','chest','gloves','boots'])player[slot]='none';mode='easy';level=sceneLevel;startLevel();updateUI();clearInterval(timerInterval);},{theme,sceneLevel});
  await page.locator('#battle-scene-image').evaluate(img=>img.decode());
  assert.equal(await page.locator('#battle-stage').getAttribute('data-scene'),['meadow','forest','coast','canyon','castle'][sceneLevel-1]);
  assert.equal(await page.evaluate(()=>slimeMaxHp),{green:100,pink:140,blue:160}[theme]*(sceneLevel===5?1.5:1));
  assert.equal(await page.locator('#monster-art').getAttribute('href'),`assets/art/${{green:'slime',pink:'flower-spirit',blue:'reef-fish'}[theme]}.webp`);
  await page.screenshot({path:`tests/illustrated-${theme}-${sceneLevel}.png`});record(`${theme} scene ${sceneLevel}: illustrated background, monster and theme HP multiplier with chapter Boss`);
 }
 for(const width of [375,390,430,768,1280])for(const id of await page.evaluate(()=>Object.keys(weapons))){
 await page.setViewportSize({width,height:width===375?667:844});
 await page.evaluate(id=>{player.weapon=id;mode='easy';level=1;startLevel();updateUI();clearInterval(timerInterval);},id);
 const ok=await page.locator('#battle-hero-weapon-icon').evaluate(el=>{const r=el.getBoundingClientRect(),s=document.getElementById('battle-stage').getBoundingClientRect();return r.left>=s.left&&r.right<=s.right&&r.top>=s.top&&r.bottom<=s.bottom&&!!el.querySelector('svg path');});assert(ok,id+' fits '+width);
 if(width===390)await page.screenshot({path:'tests/weapon-'+id+'.png'});
 }
 record('six detailed weapons fit five viewport sizes');
 assert(await page.evaluate(()=>document.getElementById('slime-container').getAnimations().some(a=>a instanceof CSSAnimation&&a.playState==='running')));record('monster idle continues across level resets');
 for(const width of [375,390,430,768,1280]){
  await page.setViewportSize({width,height:width===375?667:844});
  await page.evaluate(()=>{mode='boss';level=5;player.bg='green';startLevel();clearInterval(timerInterval);});
  await page.locator('#battle-scene-image').evaluate(img=>img.decode());
  const geometry=await page.evaluate(()=>{const h=document.getElementById('player-visual-box').getBoundingClientRect(),e=document.getElementById('slime-container').getBoundingClientRect(),s=document.getElementById('battle-stage').getBoundingClientRect();return{overlap:h.right>=e.left,outside:h.left<s.left||e.right>s.right||h.top<s.top||e.top<s.top,overflow:document.documentElement.scrollWidth>innerWidth};});
  assert(!geometry.overlap&&!geometry.outside&&!geometry.overflow);
  await page.screenshot({path:`tests/illustrated-boss-${width}.png`});record(`illustrated boss layout ${width}px`);
 }
 assert.deepEqual(errors,[]);record('no browser runtime errors');
 fs.writeFileSync(path.join(root,'tests/results.json'),JSON.stringify({passed:results,errors},null,2));
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
