
  let audioCtx = null;
  function safePlayAudio(callback) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
      if (callback && audioCtx) callback();
    } catch (e) {
      console.warn("Audio error:", e);
    }
  }

  const armorTiers = {
    none: { name: '無', hp: 0, price: 0, color: 'transparent' },
    iron: { name: '鐵質', hp: 5, price: 300, color: '#b0bec5' },
    silver: { name: '白銀', hp: 10, price: 500, color: '#e0e0e0' },
    gold: { name: '黃金', hp: 15, price: 800, color: '#ffd54f' },
    diamond: { name: '鑽石', hp: 20, price: 1000, color: '#4dd0e1' }
  };

  const backgrounds = {
    green: { name: '豐富草地', colorClass: 'bg-grass', price: 0 },
    pink: { name: '夢幻粉', colorClass: 'bg-pink', price: 450 },
    blue: { name: '深海藍', colorClass: 'bg-blue', price: 900 }
  };

  const slimeColors = ['#4caf50', '#2196f3', '#f44336', '#ffeb3b', '#9c27b0'];

  // 玩家預設狀態
  let player = {
    gender: 'boy',
    coins: 0,
    weapon: 'wood_sword',
    unlockedWeapons: ['wood_sword'],
    helmet: 'none',
    unlockedHelmets: ['none'],
    chest: 'none',
    unlockedChests: ['none'],
    gloves: 'none',
    unlockedGloves: ['none'],
    boots: 'none',
    unlockedBoots: ['none'],
    bg: 'green',
    unlockedBgs: ['green'],
    adventure: Adventure.normalize(),
    bossUnlocked: false
  };

  // 讀取存檔
  try {
    player.gender=PlayerStorage.getItem('fruit_gender')==='girl'?'girl':'boy';
    const localCoins = PlayerStorage.getItem('fruit_coins');
    if (localCoins !== null) player.coins = parseInt(localCoins, 10) || 0;
    if (PlayerStorage.getItem('fruit_weapon')) player.weapon = PlayerStorage.getItem('fruit_weapon');
    if (PlayerStorage.getItem('fruit_unlocked_weapons')) player.unlockedWeapons = JSON.parse(PlayerStorage.getItem('fruit_unlocked_weapons'));
    if (PlayerStorage.getItem('fruit_helmet')) player.helmet = PlayerStorage.getItem('fruit_helmet');
    if (PlayerStorage.getItem('fruit_unlocked_helmets')) player.unlockedHelmets = JSON.parse(PlayerStorage.getItem('fruit_unlocked_helmets'));
    if (PlayerStorage.getItem('fruit_chest')) player.chest = PlayerStorage.getItem('fruit_chest');
    if (PlayerStorage.getItem('fruit_unlocked_chests')) player.unlockedChests = JSON.parse(PlayerStorage.getItem('fruit_unlocked_chests'));
    if (PlayerStorage.getItem('fruit_gloves')) player.gloves = PlayerStorage.getItem('fruit_gloves');
    if (PlayerStorage.getItem('fruit_unlocked_gloves')) player.unlockedGloves = JSON.parse(PlayerStorage.getItem('fruit_unlocked_gloves'));
    if (PlayerStorage.getItem('fruit_boots')) player.boots = PlayerStorage.getItem('fruit_boots');
    if (PlayerStorage.getItem('fruit_unlocked_boots')) player.unlockedBoots = JSON.parse(PlayerStorage.getItem('fruit_unlocked_boots'));
    if (PlayerStorage.getItem('fruit_bg')) player.bg = PlayerStorage.getItem('fruit_bg');
    if (PlayerStorage.getItem('fruit_unlocked_bgs')) player.unlockedBgs = JSON.parse(PlayerStorage.getItem('fruit_unlocked_bgs'));
    player.bossUnlocked = PlayerStorage.getItem('fruit_boss') === 'true';
  } catch (e) {}

  try { player.adventure=Adventure.normalize(JSON.parse(PlayerStorage.getItem('fruit_adventure_v1'))); } catch(e) { player.adventure=Adventure.normalize(); }

  MathTopics.init(player);Expedition.switchTopic();

  let mode = 'easy', level = 1, currentAnswer = 0, timerInterval = null, timeLeft = 15;
  let playerMaxHp = 20, playerHp = 20, slimeMaxHp = 100, slimeHp = 100;
  let currentShopTab = 'weapons';
  let openedFromModal = false;
  let pendingReward = 0;
  let isAnswering = false;
  let battleEpoch=0,battleActive=false,ultimateQuestion=false,currentMathQuestion=null;
  let ultimateCharge=0,scorpionOpening=false,scorpionArmor=false,scorpionAwakened=false,questionSettled=false;
  function setScorpionArmor(active){scorpionArmor=active;document.getElementById('slime-container').classList.toggle('scorpion-armored',active);}
  function setScorpionOpening(open){scorpionOpening=open;document.getElementById('slime-container').classList.toggle('scorpion-opening',open);}
  function setUltimateCharge(n){ultimateCharge=n;if(Expedition.active)Expedition.setUltimateCharge(n);}
  function finishQuestion(correct=false){if(questionSettled)return false;questionSettled=true;setScorpionArmor(false);if(!ultimateQuestion&&ultimateCharge<2){const interrupted=!correct&&ultimateCharge>0;setUltimateCharge(correct?ultimateCharge+1:0);if(interrupted)GameUI.toast('蓄力中斷，重新集中精神！');}setScorpionOpening(false);return true;}
  function battleLater(callback,delay){const epoch=battleEpoch;setTimeout(()=>{if(epoch===battleEpoch&&battleActive)callback();},delay);}
  function stopBattle(){setScorpionArmor(false);document.getElementById('battle-stage').classList.remove('forest-mist');setScorpionOpening(false);BossSkillTiming.reset();MonsterRegeneration.stop();document.getElementById("exp-return").hidden=true;ultimateQuestion=false;document.getElementById('ultimate-button').disabled=true;battleActive=false;battleEpoch++;BossMeteors.stop();BossSpecials.stop();if(timerInterval)clearInterval(timerInterval);}
  function defeatHero(){
    if(!battleActive)return;document.getElementById("retry-battle").textContent=Expedition.active?"再戰本波 · 保留進場體力":"不放棄，再戰一回";
    document.getElementById("defeat-return").textContent=Expedition.active?"返回遠征地圖":"返回主選單";
    Expedition.report(false);document.getElementById('expedition-failure-report').innerHTML=Expedition.active?Expedition.reportMarkup():'';document.getElementById('expedition-failure-report').hidden=!Expedition.active;stopBattle();isAnswering=true;
    document.querySelectorAll('.fruit-btn').forEach(b=>b.classList.add('disabled'));
    safePlayAudio(()=>WeaponAudio.hero(audioCtx,'death'));
    const epoch=battleEpoch;setTimeout(()=>{if(epoch===battleEpoch)document.getElementById('game-over-screen').style.display='flex';},500);
  }
  function startBossMeteors(){
    const epoch=battleEpoch;
    BossMeteors.start(()=>battleActive&&epoch===battleEpoch&&Expedition.bossMode(mode)==='boss'&&level===5&&Adventure.state.phase===2&&slimeHp>0&&playerHp>0,()=>{
      const damage=Expedition.damage(6);Expedition.recordDamage('special',Math.min(playerHp,damage));playerHp=Math.max(0,playerHp-damage);updateBars();
      const hero=document.getElementById('player-visual-box');BattleEffects.burst(hero,'smallHit','#ffc77a');BattleEffects.damage(hero,damage);safePlayAudio(()=>WeaponAudio.hero(audioCtx,'hit'));
      if(playerHp<=0)defeatHero();
    },{firstDelay:Expedition.active?1000:3000});
  }

  function startChapterBossSpecial(){
    const epoch=battleEpoch,kind=Expedition.bossMode(mode);
    BossSpecials.start(kind,()=>battleActive&&epoch===battleEpoch&&Expedition.bossMode(mode)===kind&&level===5&&Adventure.state.phase===2&&slimeHp>0&&playerHp>0,(amount,color)=>{
      amount=Expedition.damage(amount);Expedition.recordDamage('special',Math.min(playerHp,amount));playerHp=Math.max(0,playerHp-amount);updateBars();
      const hero=document.getElementById('player-visual-box');BattleEffects.burst(hero,kind==='easy'?'smallHit':'magicHit',color);BattleEffects.damage(hero,amount);safePlayAudio(()=>WeaponAudio.hero(audioCtx,'hit'));
      if(playerHp<=0)defeatHero();
    },cue=>safePlayAudio(()=>WeaponAudio.bossSkill(audioCtx,kind,cue)),{firstDelay:Expedition.active?1000:undefined});
  }
  function calculateMaxHp() {
    let extraHp = (armorTiers[player.helmet]?.hp || 0) +
                 (armorTiers[player.chest]?.hp || 0) +
                 (armorTiers[player.gloves]?.hp || 0) +
                 (armorTiers[player.boots]?.hp || 0);
    return 20 + extraHp;
  }

  function saveGame() {
    try {
      player.adventure=Adventure.normalize(player.adventure);
      MathTopics.persist(player);
      PlayerStorage.setItem('fruit_gender',player.gender);
      PlayerStorage.setItem('fruit_coins', player.coins);
      PlayerStorage.setItem('fruit_weapon', player.weapon);
      PlayerStorage.setItem('fruit_unlocked_weapons', JSON.stringify(player.unlockedWeapons));
      PlayerStorage.setItem('fruit_helmet', player.helmet);
      PlayerStorage.setItem('fruit_unlocked_helmets', JSON.stringify(player.unlockedHelmets));
      PlayerStorage.setItem('fruit_chest', player.chest);
      PlayerStorage.setItem('fruit_unlocked_chests', JSON.stringify(player.unlockedChests));
      PlayerStorage.setItem('fruit_gloves', player.gloves);
      PlayerStorage.setItem('fruit_unlocked_gloves', JSON.stringify(player.unlockedGloves));
      PlayerStorage.setItem('fruit_boots', player.boots);
      PlayerStorage.setItem('fruit_unlocked_boots', JSON.stringify(player.unlockedBoots));
      PlayerStorage.setItem('fruit_bg', player.bg);
      PlayerStorage.setItem('fruit_unlocked_bgs', JSON.stringify(player.unlockedBgs));
      if(MathTopics.current==='arithmetic')PlayerStorage.setItem('fruit_boss', player.bossUnlocked);
    } catch(e) {}
    updateUI();
  }

  function updateUI() {
    window.PlayerProfileUI?.paint();
    document.querySelectorAll('button[data-math-topic]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mathTopic===MathTopics.current)));
    document.getElementById('menu-topic-label').textContent=MathTopics.name();
    document.body.dataset.mathTopic=MathTopics.current;
    document.getElementById('card-boy').classList.toggle('selected',player.gender==='boy');document.getElementById('card-girl').classList.toggle('selected',player.gender==='girl');
    document.getElementById('gold-coins').innerText = player.coins;
    document.getElementById('shop-coins').innerText = player.coins;
    
    const container = document.getElementById('battle-stage');
    const fxContainer = document.getElementById('stage-fx-container');
    if (container && fxContainer) {
      container.className = '';
      container.classList.add('bg-grass'); // default fallback
      const bgObj = backgrounds[player.bg] || backgrounds['green'];
      if (bgObj && bgObj.colorClass) {
        container.classList.add(bgObj.colorClass);
      }

      // 生成背景主題特效 (花瓣或海浪)
      fxContainer.innerHTML = '';
      if (player.bg === 'pink') {
        for (let i = 0; i < 12; i++) {
          const petal = document.createElement('div');
          petal.className = 'petal';
          petal.style.left = `${Math.random() * 100}%`;
          petal.style.top = `${Math.random() * 50}%`;
          petal.style.width = `${8 + Math.random() * 8}px`;
          petal.style.height = `${10 + Math.random() * 10}px`;
          petal.style.animationDuration = `${2.5 + Math.random() * 2}s`;
          petal.style.animationDelay = `${Math.random() * 2}s`;
          fxContainer.appendChild(petal);
        }
      } else if (player.bg === 'blue') {
        const wave = document.createElement('div');
        wave.className = 'ocean-wave';
        fxContainer.appendChild(wave);
      }
    }

    if (player.bossUnlocked) {
      const bossBtn = document.getElementById('btn-boss');
      if (bossBtn) bossBtn.style.display = 'block';
    }

    const expeditionButton=document.getElementById('btn-expedition');
    const expeditionUnlocked=(player.adventure?.boss?.[4]||0)>0;
    expeditionButton.disabled=false;
    ExpeditionGate.update(expeditionUnlocked);
    const expeditionNote=document.getElementById('expedition-unlock-note');
    expeditionNote.textContent=expeditionUnlocked?(Expedition.run?'旅途進度已保存 · '+Expedition.stationName():'帶上裝備，開啟下一段旅程'):'故事模式擊敗暮星巨龍後解鎖';
    expeditionButton.title=expeditionUnlocked?'開始冒險遠征':'擊敗傳說挑戰最後一關的巨龍後解鎖';
    WorldArt.apply(level, mode, player.bg);
    Adventure.scene(level,Expedition.bossMode(mode)==='boss'&&level===5);
    playerMaxHp = calculateMaxHp();
    renderArmorVisuals('hero-armor-layer');
    document.querySelectorAll('.rpg-hero').forEach(el => el.classList.toggle('girl', player.gender === 'girl'));
    document.getElementById('player-avatar-icon').innerText = player.gender === 'girl' ? '👧' : '👦';

    const weaponObj = weapons[player.weapon] || weapons['wood_sword'];
    const weaponIconBox = document.getElementById('battle-hero-weapon-icon');
    if (weaponIconBox) {
      if (weaponObj.isSvg) {
        weaponIconBox.innerHTML = weaponObj.icon;
        const v=weaponObj.visual;
        weaponIconBox.style.setProperty('--weapon-width',v.width+'px');
        weaponIconBox.style.setProperty('--weapon-height',v.height+'px');
        weaponIconBox.style.setProperty('--weapon-grip',v.grip/100);
      } else {
        weaponIconBox.innerText = weaponObj.icon;
      }
    }
  }

  function renderArmorVisuals(targetLayerId) {
    const layer=document.getElementById(targetLayerId);
    if(layer)layer.innerHTML=ArmorArt.render(player);
  }

  // 略過劇情，進入角色選擇
  window.skipIntro = function() {
    window.StoryIntro?.stop();
    safePlayAudio();
    const introScreen = document.getElementById('intro-screen');
    const charSelect = document.getElementById('character-select');
    if (introScreen) introScreen.style.display = 'none';
    if (charSelect) charSelect.style.display = 'flex';
  };



  function startLevel() {
    stopBattle();battleActive=true;
    ultimateCharge=Expedition.active?Math.max(0,Math.min(2,Math.floor(Number(Expedition.run.ultimateCharge)||0))):0;scorpionOpening=false;scorpionAwakened=false;setScorpionArmor(false);
    BattleEffects.reset();
    Adventure.begin();
    isAnswering = false;
    playerMaxHp = calculateMaxHp();
    playerHp = Expedition.active?Expedition.run.entryHp:playerMaxHp;
    document.getElementById("exp-return").hidden=!Expedition.active;

    const slimeElem = document.getElementById('slime-svg-elem');
    const bossElem = document.getElementById('boss-svg-elem');
    const enemyTitle = document.getElementById('enemy-title-text');
    const slimeBodyPath = document.getElementById('slime-body-path');
    Adventure.scene(level,Expedition.bossMode(mode)==='boss'&&level===5);

    if (level === 5) {
      const chapterBoss=Adventure.bossFor(mode,level);
      slimeMaxHp = Expedition.active?chapterBoss.expeditionHp:MathTopics.storyHp(mode,level,chapterBoss.hp);
      if (slimeElem) slimeElem.style.display = 'none';
      if (bossElem) bossElem.style.display = 'block';
      if (enemyTitle) enemyTitle.innerText = chapterBoss.name;
    } else {
      const ordinaryHp=Expedition.active&&Expedition.run?.step===6?200:Expedition.active&&Expedition.run?.routeVersion>=3&&Expedition.run.step===5?[100,110,120][Expedition.waveNumber()-1]:100;
      slimeMaxHp = Expedition.active?ordinaryHp:MathTopics.storyHp(mode,level,ordinaryHp);
      if (bossElem) bossElem.style.display = 'none';
      if (slimeElem) slimeElem.style.display = 'block';

      if (player.bg === 'pink') {
        if (enemyTitle) enemyTitle.innerText = '花朵精靈';
        if (slimeBodyPath) {
          // 花朵型態 SVG Path
          slimeBodyPath.setAttribute('d', 'M 50 20 Q 65 30 75 50 Q 85 65 70 80 Q 50 90 30 80 Q 15 65 25 50 Q 35 30 50 20 Z');
          slimeBodyPath.setAttribute('fill', '#ec407a');
        }
      } else if (player.bg === 'blue') {
        if (enemyTitle) enemyTitle.innerText = '深海小魚';
        if (slimeBodyPath) {
          // 魚類型態 SVG Path
          slimeBodyPath.setAttribute('d', 'M 20 50 Q 40 30 70 45 L 85 30 L 80 50 L 85 70 L 70 55 Q 40 70 20 50 Z');
          slimeBodyPath.setAttribute('fill', '#0288d1');
        }
      } else {
        if (enemyTitle) enemyTitle.innerText = '史萊姆';
        if (slimeBodyPath) {
          slimeBodyPath.setAttribute('d', 'M 50 12 C 62 12, 88 42, 88 68 C 88 88, 72 92, 50 92 C 28 92, 12 88, 12 68 C 12 42, 38 12, 50 12 Z');
          const bodyColor = slimeColors[(level - 1) % slimeColors.length];
          slimeBodyPath.setAttribute('fill', bodyColor);
        }
      }
    }
    WorldArt.apply(level, mode, player.bg);
    Adventure.scene(level,Expedition.bossMode(mode)==='boss'&&level===5);
    if(Expedition.active&&Expedition.isElite()&&Expedition.run.step!==6)slimeMaxHp=Math.round(slimeMaxHp*1.5);
    slimeHp = slimeMaxHp;
    if(Expedition.active){document.getElementById("scene-name").textContent=Expedition.stationName();document.getElementById("scene-chapter").textContent="冒險遠征 · "+Expedition.battleLabel();document.getElementById("exp-return").textContent="🧭 "+Expedition.battleLabel()+" · 返回地圖";}

    document.getElementById('current-level').innerText = level;
    updateBars();
    generateQuestion();
  }

  function updateBars() {
    ['hero','slime'].forEach(id => {
      const ghost=document.getElementById(id+'-hp-ghost'),fill=document.getElementById(id+'-hp-fill');
      ghost.style.width=fill.style.width || '100%';
      clearTimeout(ghost._timer);
      ghost._timer=setTimeout(() => {ghost.style.width=fill.style.width;},180);
    });
    document.getElementById('hero-hp-fill').style.width = Math.max(0, (playerHp / playerMaxHp) * 100) + '%';
    document.getElementById('hero-hp-text').innerText = `${Math.max(0, playerHp)}/${playerMaxHp}`;

    document.getElementById('slime-hp-fill').style.width = Math.max(0, (slimeHp / slimeMaxHp) * 100) + '%';
    document.getElementById('slime-hp-text').innerText = `${Math.max(0, slimeHp)}/${slimeMaxHp}`;
    const epoch=battleEpoch;
    MonsterRegeneration.observe(slimeHp,slimeMaxHp,{
      eligible:battleActive&&Expedition.active&&Expedition.run?.routeVersion>=3&&Expedition.run.step===5&&Expedition.waveNumber()===3,
      valid:()=>battleActive&&epoch===battleEpoch&&slimeHp>0&&playerHp>0,
      weaponDamage:(weapons[player.weapon]||weapons.wood_sword).dmg,
      restore:(amount,{awakening=false}={})=>{const restored=Math.min(amount,slimeMaxHp-slimeHp);if(restored<=0)return;slimeHp+=restored;updateBars();BattleEffects.heal(document.getElementById('slime-container'),restored);if(awakening){BattleEffects.regeneration(document.getElementById('slime-container'));document.querySelector('.battle-hint').textContent='烈焰再生！半血立即回血，之後每 5 秒持續回復';}}
    });
  }

  function generateOptions(ans) {
    let opts = [ans];
    let diffs = [-10, 10, -5, 5, -2, 2, -1, 1, -3, 3];
    diffs.sort(() => Math.random() - 0.5);

    for (let d of diffs) {
      let candidate = ans + d;
      if (candidate >= 0 && !opts.includes(candidate)) {
        opts.push(candidate);
      }
      if (opts.length >= 3) break;
    }

    let offset = 1;
    while (opts.length < 3) {
      let candidate = ans + offset;
      if (!opts.includes(candidate)) opts.push(candidate);
      offset++;
    }

    return opts.sort(() => Math.random() - 0.5);
  }

  window.activateUltimate=function(){
    if(!battleActive||isAnswering||ultimateQuestion||ultimateCharge<2||playerHp<=0||slimeHp<=0||timeLeft<=0)return;
    setUltimateCharge(0);safePlayAudio();generateQuestion({ultimate:true,seconds:timeLeft});
  };
  function showCorrectAnswer(){const el=document.getElementById('answer-feedback');el.textContent=currentMathQuestion?'正確答案：'+currentAnswer+'。'+currentMathQuestion.explanation:'正確答案：'+document.getElementById('question-box').innerText.replace('?',String(currentAnswer));el.hidden=false;}
  function generateQuestion({ultimate=false,seconds=null}={}) {
    if(!battleActive||playerHp<=0||slimeHp<=0)return;
    isAnswering = false;ultimateQuestion=ultimate;questionSettled=false;document.getElementById('answer-feedback').hidden=true;
    const ultimateButton=document.getElementById('ultimate-button');
    ultimateButton.disabled=ultimate||ultimateCharge<2;
    ultimateButton.style.setProperty('--ultimate-energy',(ultimateCharge*50)+'%');
    ultimateButton.dataset.charged=String(!ultimate&&ultimateCharge===2);
    ultimateButton.setAttribute('aria-label',ultimate?'必殺題啟動中':ultimateCharge===2?'啟動必殺題，能量已滿':'必殺蓄力 '+ultimateCharge+'／2，連續答對兩題普通題即可使用');
    document.querySelector('.ultimate-button-title').textContent=ultimate?'必殺題啟動中':ultimateCharge<2?'必殺蓄力 · '+ultimateCharge+'／2':'啟動必殺題';
    document.getElementById('ultimate-button-hint').textContent=ultimate?'選出答案，釋放必殺一擊！':ultimateCharge<2?'連續答對兩題普通題 · 答錯或超時歸零':'能量已滿 · 答對必殺題傷害 ×2';
    document.getElementById('question-box').classList.toggle('ultimate-question',ultimate);
    const forestMist=Expedition.active&&Expedition.run.routeVersion>=3&&Expedition.run.step===3&&Expedition.waveNumber()===3;
    document.getElementById('battle-stage').classList.toggle('forest-mist',forestMist);
    document.querySelector('.battle-hint').textContent=forestMist?'林間迷霧！第三波每題縮短 2 秒，穩住再出招。':Expedition.active&&Expedition.run.step===6?(scorpionArmor?'反彈護甲啟動！本題答對會反彈 10 HP，下一題露出破綻':scorpionOpening?'鎧甲破綻！這一題答對即可命中':'鎧甲反彈：剩 5 秒內答對會反彈 10 HP'):Expedition.active&&Expedition.run.routeVersion>=3&&Expedition.run.step===5?'烈焰牛頭 · 第 '+Expedition.waveNumber()+' 波'+(Expedition.waveNumber()===3?'：半血立即回血，之後每 5 秒回復 '+MonsterRegeneration.amount((weapons[player.weapon]||weapons.wood_sword).dmg):'：趁勢前進！'):'選出正確的水果答案，幫勇者出招！';
    if (timerInterval) clearInterval(timerInterval);

    timeLeft = seconds===null?Adventure.answerSeconds(Expedition.active&&Expedition.run.routeVersion>=3&&Expedition.run.step===5?11:Math.max(5,15-(level-1)*2-(forestMist?2:0)),Expedition.bossMode(mode)==='boss'&&level===5):seconds;
    if(seconds===null)timeLeft=MathTopics.seconds(timeLeft,mode);
    if(seconds===null&&Expedition.has("sandglass"))timeLeft++;
    currentMathQuestion=null;
    let num1, num2, isAdd = Math.random() > 0.5;
    if (mode === 'easy') {
      num1 = Math.floor(Math.random()*9)+1; num2 = Math.floor(Math.random()*9)+1;
      if (!isAdd) { const m = Math.max(num1, num2), n = Math.min(num1, num2); num1 = m; num2 = n; }
    } else if (mode === 'medium') {
      num1 = Math.floor(Math.random()*10)+11; num2 = Math.floor(Math.random()*10)+11;
      if (!isAdd) { const m = Math.max(num1, num2), n = Math.min(num1, num2); num1 = m; num2 = n; }
    } else {
      num1 = Math.floor(Math.random()*50)+20; num2 = Math.floor(Math.random()*50)+20;
      if (!isAdd) { const m = Math.max(num1, num2), n = Math.min(num1, num2); num1 = m; num2 = n; }
    }

    if(ultimate){
      const third=Math.floor(Math.random()*9)+1;
      // A single-digit term is guaranteed; rotate its position for variety.
      const terms=[num1,num2,third];
      for(let i=terms.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[terms[i],terms[j]]=[terms[j],terms[i]];}
      currentAnswer=num1+num2+third;
      document.getElementById('question-box').innerText=terms.join(' + ')+' = ?';
    }else{
      currentAnswer = isAdd ? (num1 + num2) : (num1 - num2);
      document.getElementById('question-box').innerText = num1+' '+(isAdd?'+':'−')+' '+num2+' = ?';
    }
    let options = generateOptions(currentAnswer);
    if(ultimate)options=[currentAnswer,options.find(value=>value!==currentAnswer)].sort(()=>Math.random()-.5);
    if(MathTopics.current==='factors'){currentMathQuestion=QuestionRotation.choose(MathTopics.current,mode,()=>ultimate?TopicUltimates.make('factors',mode,level,{short:timeLeft<=7}):MathQuestions.make(mode,level,false,{short:timeLeft<=7}));currentAnswer=currentMathQuestion.answer;options=currentMathQuestion.options;document.getElementById('question-box').innerText=currentMathQuestion.prompt;}
    if(MathTopics.current==='fractions'){currentMathQuestion=QuestionRotation.choose(MathTopics.current,mode,()=>ultimate?TopicUltimates.make('fractions',mode,level,{short:timeLeft<=7}):FractionQuestions.make(mode,level,false,{short:timeLeft<=7}));currentAnswer=currentMathQuestion.answer;options=currentMathQuestion.options;FractionQuestions.render(document.getElementById('question-box'),currentMathQuestion.prompt);}
    if(MathTopics.current==='decimals'){currentMathQuestion=QuestionRotation.choose(MathTopics.current,mode,()=>ultimate?TopicUltimates.make('decimals',mode,level,{short:timeLeft<=7}):DecimalQuestions.make(mode,level,false,{short:timeLeft<=7}));currentAnswer=currentMathQuestion.answer;options=currentMathQuestion.options;document.getElementById('question-box').innerText=currentMathQuestion.prompt;}
    document.getElementById('question-box').classList.toggle('word-question',MathTopics.current!=='arithmetic');
    const topicLabel=document.getElementById('battle-topic');topicLabel.hidden=MathTopics.current==='arithmetic';topicLabel.textContent=MathTopics.lesson(mode)+(ultimate?' · 必殺挑戰':'');
    if(MathTopics.current!=='arithmetic'&&!ultimate&&ultimateCharge===2)document.getElementById('ultimate-button-hint').textContent='能量已滿 · 主題必殺答對傷害 ×2';
    const area = document.getElementById('fruits-area');
    area.innerHTML = '';
    options.forEach(val => {
      const btn = document.createElement('div');
      btn.className = 'fruit-btn';
      const fruitIcon=document.createElement('span');fruitIcon.textContent='🍎';const answerLabel=document.createElement('span');answerLabel.className='answer-value';if(MathTopics.current==='fractions')FractionQuestions.render(answerLabel,val);else answerLabel.textContent=val;btn.append(fruitIcon,answerLabel);btn.classList.toggle('decimal-answer',MathTopics.current==='decimals');btn.classList.toggle('expression-answer',currentMathQuestion?.type==='choose-equation');btn.classList.toggle('text-answer',typeof val==='string'&&!/^\d+(\.\d+)?$/.test(val));
      btn.setAttribute('role','button');btn.tabIndex=0;btn.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();btn.click();}};
      btn.onclick = () => window.checkAnswer(val, btn);
      area.appendChild(btn);
    });

    document.getElementById('timer').innerText = timeLeft;
    Adventure.question(timeLeft,ultimate);
    timerInterval = setInterval(() => {
      timeLeft--;
      document.getElementById('timer').innerText = timeLeft;
      if (timeLeft <= 0) {
        if (timerInterval) clearInterval(timerInterval);
        handleMonsterAttack('timeout');
      }
    }, 1000);
  }

  async function handleMonsterAttack(reason='wrong') {
    if(!battleActive||playerHp<=0||slimeHp<=0)return;
    const epoch=battleEpoch;
    const armoredQuestion=scorpionArmor;
    if(!finishQuestion())return;
    showCorrectAnswer();
    isAnswering = true;
    if (timerInterval) clearInterval(timerInterval);

    document.querySelectorAll('.fruit-btn').forEach(b => b.classList.add('disabled'));
    document.getElementById('ultimate-button').disabled=true;
    Adventure.answer(false,{timeout:reason==='timeout'});Expedition.recordAnswer(false,reason==='timeout');
    if(Adventure.bossFor(mode,level))safePlayAudio(()=>WeaponAudio.bossAttack(audioCtx,Expedition.bossMode(mode)));
    await WeaponAnimationSystem.enemyAttack(() => { if(epoch!==battleEpoch||!battleActive||playerHp<=0)return false;const damage=Expedition.damage(!Expedition.active&&mode==='easy'?10:20);Expedition.recordDamage('normal',Math.min(playerHp,damage));playerHp = Math.max(0,playerHp-damage); updateBars(); safePlayAudio(()=>WeaponAudio.hero(audioCtx,'hit'));return damage; },Adventure.enemyProfile(level,Expedition.bossMode(mode)==='boss'&&level===5));

    if(epoch!==battleEpoch||!battleActive)return;
    if(armoredQuestion&&playerHp>0)setScorpionOpening(true);
    if(playerHp<=0)defeatHero();else battleLater(()=>generateQuestion(),700);
  }

  window.selectMathTopic=function(topic){if(battleActive||Expedition.active)return;Adventure.endJourney();if(MathTopics.select(topic,player)){Expedition.switchTopic();saveGame();}};
  window.openTopicSelection=function(){if(battleActive||Expedition.active)return;document.getElementById('mode-select').style.display='none';document.getElementById('character-select').style.display='flex';};
  window.selectChar = function(g) {
    player.gender = g;
    const cardBoy = document.getElementById('card-boy');
    const cardGirl = document.getElementById('card-girl');
    if (cardBoy) cardBoy.classList.toggle('selected', g === 'boy');
    if (cardGirl) cardGirl.classList.toggle('selected', g === 'girl');
  };

  window.confirmCharacter = function() {
    safePlayAudio();
    const charSelect = document.getElementById('character-select');
    const modeSelect = document.getElementById('mode-select');
    const avatarIcon = document.getElementById('player-avatar-icon');
    if (charSelect) charSelect.style.display = 'none';
    if (modeSelect) modeSelect.style.display = 'flex';
    if (avatarIcon) avatarIcon.innerText = player.gender === 'boy' ? '👦' : '👧';
    saveGame();
  };

  window.openRedeemModal = function() {
    safePlayAudio();
    const codeInput = document.getElementById('code-input');
    const codeMsg = document.getElementById('code-message');
    const redeemScreen = document.getElementById('redeem-modal-screen');
    if (codeInput) codeInput.value = '';
    if (codeMsg) codeMsg.innerText = '';
    if (redeemScreen) redeemScreen.style.display = 'flex';
  };

  window.closeRedeemModal = function() {
    safePlayAudio();
    const redeemScreen = document.getElementById('redeem-modal-screen');
    if (redeemScreen) redeemScreen.style.display = 'none';
  };

  window.submitRedeemCode = function() {
    safePlayAudio();
    const codeInput = document.getElementById('code-input');
    const msgEl = document.getElementById('code-message');
    if (!codeInput || !msgEl) return;
    const rawCode = codeInput.value.trim().toLowerCase();

    if (rawCode === 'goodboy') {
      player.coins += 500;
      saveGame();
      msgEl.style.color = '#2e7d32';
      msgEl.innerText = '🎉 兌換成功！獲得 +500 金幣！';
    } else if (rawCode === 'badboy') {
      player.coins = Math.max(0, player.coins - 100);
      saveGame();
      msgEl.style.color = '#d32f2f';
      msgEl.innerText = '😈 扣除 -100 金幣！';
    } else if (rawCode === 'awesome') {
      player.coins += 1000;
      saveGame();
      msgEl.style.color = '#9c27b0';
      msgEl.innerText = '🌟 太酷啦！獲得 +1000 金幣！';
    } else {
      msgEl.style.color = '#d32f2f';
      msgEl.innerText = '❌ 無效的獎勵碼喔！';
    }
  };

  window.openShop = function() {
    safePlayAudio();
    openedFromModal = false;
    document.getElementById("shop-return").textContent="返回主選單";
    renderShopItems();
    const modeSelect = document.getElementById('mode-select');
    const shopScreen = document.getElementById('shop-screen');
    if (modeSelect) modeSelect.style.display = 'none';
    if (shopScreen) shopScreen.style.display = 'flex';
  };

  window.openShopFromModal = function() {
    safePlayAudio();
    openedFromModal = true;
    document.getElementById("shop-return").textContent="返回通關畫面";
    renderShopItems();
    const levelCleared = document.getElementById('level-cleared-screen');
    const shopScreen = document.getElementById('shop-screen');
    if (levelCleared) levelCleared.style.display = 'none';
    if (shopScreen) shopScreen.style.display = 'flex';
  };

  window.closeShop = function() {
    safePlayAudio();
    const shopScreen = document.getElementById('shop-screen');
    const levelCleared = document.getElementById('level-cleared-screen');
    const modeSelect = document.getElementById('mode-select');
    if (shopScreen) shopScreen.style.display = 'none';
    if (openedFromModal) {
      if (levelCleared) levelCleared.style.display = 'flex';
    } else {
      if (modeSelect) modeSelect.style.display = 'flex';
    }
  };

  window.switchShopTab = function(tabKey) {
    safePlayAudio();
    currentShopTab = tabKey;
    document.querySelectorAll('.shop-tab-btn').forEach(btn => btn.classList.remove('active'));
    const tabBtn = document.getElementById(`tab-${tabKey}`);
    if (tabBtn) tabBtn.classList.add('active');
    renderShopItems();
  };

  function renderShopItems() {
    const container = document.getElementById('shop-items-container');
    if (!container) return;
    container.innerHTML = '';

    if (currentShopTab === 'weapons') {
      Object.keys(weapons).forEach(k => {
        const w = weapons[k];
        const isEquipped = player.weapon === k;
        const isOwned = isEquipped || (Array.isArray(player.unlockedWeapons) && player.unlockedWeapons.includes(k)) || k === 'wood_sword';
        const card = document.createElement('div');
        card.className = 'shop-card';
        card.innerHTML = `
          <div class="shop-card-left">
            <div class="shop-icon-preview">${w.isSvg ? w.icon : w.icon}</div>
            <div>
              <div style="font-weight:bold; font-size:14px;">${w.name}</div>
              <div style="font-size:12px; color:#666;">${GameUI.icon('sword')} 普通攻擊：${w.dmg} HP</div><div class="shop-stat">${GameUI.icon('spark')} 必殺技：${w.dmg*2} HP</div>
            </div>
          </div>
          <button class="btn ${isEquipped ? 'btn-green' : 'btn-orange'}" style="font-size:12px; padding:6px 12px;" onclick="window.buyWeapon('${k}')">
            ${isEquipped ? '裝備中' : (isOwned ? '裝備' : w.price + ' 幣')}
          </button>`;
        container.appendChild(card);
      });
    } else if (['helmet', 'chest', 'gloves', 'boots'].includes(currentShopTab)) {
      Object.keys(armorTiers).forEach(tierKey => {
        const arm = armorTiers[tierKey];
        const currentHp=calculateMaxHp(),previewHp=currentHp-(armorTiers[player[currentShopTab]]?.hp||0)+arm.hp;
        const isEquipped = player[currentShopTab] === tierKey;
        const listKey = `unlocked${currentShopTab.charAt(0).toUpperCase() + currentShopTab.slice(1)}s`;
        const unlockedArr = player[listKey];
        const isOwned = isEquipped || (Array.isArray(unlockedArr) && unlockedArr.includes(tierKey)) || (tierKey === 'none');
        const card = document.createElement('div');
        card.className = 'shop-card';
        card.innerHTML = `
          <div class="shop-card-left">
            <div class="shop-icon-preview armor-shop-preview">${tierKey==='none'?'—':`<img src="assets/art/armor/${currentShopTab}-${tierKey}.webp" alt="${arm.name}" width="48" height="48">`}</div>
            <div>
              <div style="font-weight:bold; font-size:14px;">${arm.name} 裝備</div>
              <div style="font-size:12px; color:#666;">${GameUI.icon('heart')} 血量加成: +${arm.hp} HP</div><div class="shop-stat">目前 HP ${currentHp} → 裝備後 ${previewHp}</div>
            </div>
          </div>
          <button class="btn ${isEquipped ? 'btn-green' : 'btn-orange'}" style="font-size:12px; padding:6px 12px;" onclick="window.buyArmor('${currentShopTab}', '${tierKey}')">
            ${isEquipped ? '裝備中' : (isOwned ? '裝備' : arm.price + ' 幣')}
          </button>`;
        container.appendChild(card);
      });
    } else if (currentShopTab === 'bg') {
      Object.keys(backgrounds).forEach(bgKey => {
        const bg = backgrounds[bgKey];
        const isEquipped = player.bg === bgKey;
        const isOwned = isEquipped || (Array.isArray(player.unlockedBgs) && player.unlockedBgs.includes(bgKey)) || (bgKey === 'green');
        const card = document.createElement('div');
        card.className = 'shop-card';
        card.innerHTML = `
          <div class="shop-card-left">
            <div class="shop-icon-preview">${GameUI.icon('landscape')}</div>
            <div>
              <div style="font-weight:bold; font-size:14px;">${bg.name}</div>
              <div style="font-size:12px; color:#666;">純外觀背景 · 不影響 HP 與金幣</div>
            </div>
          </div>
          <button class="btn ${isEquipped ? 'btn-green' : 'btn-orange'}" style="font-size:12px; padding:6px 12px;" onclick="window.buyBg('${bgKey}')">
            ${isEquipped ? '使用中' : (isOwned ? '使用' : bg.price + ' 幣')}
          </button>`;
        container.appendChild(card);
      });
    }
  }

  window.buyWeapon = function(k) {
    safePlayAudio();
    const w = weapons[k];
    if (!Array.isArray(player.unlockedWeapons)) player.unlockedWeapons = ['wood_sword'];
    const isOwned = player.weapon === k || player.unlockedWeapons.includes(k) || (k === 'wood_sword');

    if (isOwned) {
      player.weapon = k;
      saveGame();
      renderShopItems(); GameUI.toast("裝備已就緒，準備出發！");
    } else if (player.coins >= w.price) {
      player.coins -= w.price;
      player.weapon = k;
      if (!player.unlockedWeapons.includes(k)) player.unlockedWeapons.push(k);
      saveGame();
      renderShopItems(); GameUI.toast("裝備已就緒，準備出發！");
    } else {
      alert('🪙 金幣不足喔！');
    }
  };

  window.buyArmor = function(slot, tierKey) {
    safePlayAudio();
    const arm = armorTiers[tierKey];
    const listKey = `unlocked${slot.charAt(0).toUpperCase() + slot.slice(1)}s`;
    if (!Array.isArray(player[listKey])) player[listKey] = ['none'];
    const isOwned = player[slot] === tierKey || player[listKey].includes(tierKey) || (tierKey === 'none');

    if (isOwned) {
      player[slot] = tierKey;
      saveGame();
      renderShopItems(); GameUI.toast("裝備已就緒，準備出發！");
    } else if (player.coins >= arm.price) {
      player.coins -= arm.price;
      player[slot] = tierKey;
      if (!player[listKey].includes(tierKey)) player[listKey].push(tierKey);
      saveGame();
      renderShopItems(); GameUI.toast("裝備已就緒，準備出發！");
    } else {
      alert('🪙 金幣不足喔！');
    }
  };

  window.buyBg = function(bgKey) {
    safePlayAudio();
    const bg = backgrounds[bgKey];
    if (!Array.isArray(player.unlockedBgs)) player.unlockedBgs = ['green'];
    const isOwned = player.bg === bgKey || player.unlockedBgs.includes(bgKey) || (bgKey === 'green');

    if (isOwned) {
      player.bg = bgKey;
      saveGame();
      renderShopItems(); GameUI.toast("裝備已就緒，準備出發！");
    } else if (player.coins >= bg.price) {
      player.coins -= bg.price;
      player.bg = bgKey;
      if (!player.unlockedBgs.includes(bgKey)) player.unlockedBgs.push(bgKey);
      saveGame();
      renderShopItems(); GameUI.toast("裝備已就緒，準備出發！");
    } else {
      alert('🪙 金幣不足喔！');
    }
  };

  window.openHeroInspector = function() {
    safePlayAudio();
    renderHeroInspectData();
    const inspectScreen = document.getElementById('hero-inspect-screen');
    if (inspectScreen) inspectScreen.style.display = 'flex';
  };

  window.openHeroInspectorFromModal = function() {
    safePlayAudio();
    renderHeroInspectData();
    const inspectScreen = document.getElementById('hero-inspect-screen');
    if (inspectScreen) inspectScreen.style.display = 'flex';
  };

  function renderHeroInspectData() {
    document.getElementById('inspect-max-hp').innerText = calculateMaxHp();
    document.getElementById('inspect-weapon-name').innerText = weapons[player.weapon]?.name || '木劍';
    document.getElementById('inspect-helmet-name').innerText = armorTiers[player.helmet]?.name || '無';
    document.getElementById('inspect-chest-name').innerText = armorTiers[player.chest]?.name || '無';
    document.getElementById('inspect-gloves-name').innerText = armorTiers[player.gloves]?.name || '無';
    document.getElementById('inspect-boots-name').innerText = armorTiers[player.boots]?.name || '無';
    document.getElementById('inspect-bg-name').innerText = backgrounds[player.bg]?.name || '豐富草地';
    renderArmorVisuals('inspect-hero-armor-layer');
  }

  window.closeHeroInspector = function() {
    safePlayAudio();
    const inspectScreen = document.getElementById('hero-inspect-screen');
    if (inspectScreen) inspectScreen.style.display = 'none';
  };

  window.exportSaveFile = function() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({...player,profile:PlayerProfiles.current,mathTopics:MathTopics.exportState(player),expeditions:Expedition.exportTopics(),expedition:Expedition.export()}));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `fruit_game_save_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  window.importSaveFile = function(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(e) {
      try {
        const importedData = JSON.parse(e.target.result);
        if (importedData && typeof importedData.coins === 'number') {
          if(importedData.profile&&PlayerProfiles.validName(importedData.profile.nickname)&&PlayerProfiles.avatars.includes(importedData.profile.avatar))PlayerProfiles.update(PlayerProfiles.id,importedData.profile);
          player = Object.assign({},player,importedData);
          delete player.profile;
          for(const data of [importedData.expedition,...Object.values(importedData.expeditions||{})])if(data?.run)delete data.run.online;
          MathTopics.importState(importedData,player);Expedition.importTopics(importedData);
          delete player.expedition;delete player.expeditions;delete player.mathTopics;
          saveGame();
          alert('🎉 存檔載入成功！');
        } else {
          alert('❌ 無效的存檔檔案！');
        }
      } catch(err) {
        alert('❌ 讀取存檔失敗！');
      }
    };
    if (event.target.files[0]) fileReader.readAsText(event.target.files[0]);
  };

  window.resetAllSaveData = function() {
    if (confirm("⚠️ 確定要清除目前冒險者的遊戲進度嗎？另一位玩家不受影響。")) {
      Adventure.endJourney();
      PlayerStorage.keys().filter(k => k.startsWith('fruit_')).forEach(k => PlayerStorage.removeItem(k));
      Expedition.reset();
      player = {
        gender: 'boy',
        coins: 0,
        weapon: 'wood_sword',
        unlockedWeapons: ['wood_sword'],
        helmet: 'none',
        unlockedHelmets: ['none'],
        chest: 'none',
        unlockedChests: ['none'],
        gloves: 'none',
        unlockedGloves: ['none'],
        boots: 'none',
        unlockedBoots: ['none'],
        bg: 'green',
        unlockedBgs: ['green'],
        bossUnlocked: false
      };
      MathTopics.reset(player);Expedition.switchTopic();saveGame();
      alert("🗑️ 存檔已重置！");
    }
  };

  window.startGame = function(m) {
    safePlayAudio();
    
    mode = m; level = 1;Adventure.startJourney(m);
    const modeSelect = document.getElementById('mode-select');
    if (modeSelect) modeSelect.style.display = 'none';
    startLevel();
  };

  window.checkAnswer = async function(val, btnElem) {
    if (isAnswering||!battleActive||playerHp<=0||slimeHp<=0) return;
    const epoch=battleEpoch;
    const empowered=ultimateQuestion;
    const reflection=Expedition.active&&Expedition.run?.step===6&&!scorpionOpening&&timeLeft>0&&(scorpionArmor||timeLeft<=5);
    const attackValid=()=>epoch===battleEpoch&&battleActive&&playerHp>0;
    document.getElementById('ultimate-button').disabled=true;

    if (val === currentAnswer) {
      if(!finishQuestion(true))return;
      isAnswering = true;
      if (timerInterval) clearInterval(timerInterval);

      document.querySelectorAll('.fruit-btn').forEach(b => b.classList.add('disabled'));

      safePlayAudio();
      const baseWeapon=weapons[player.weapon]||weapons.wood_sword;
      const wObj={...baseWeapon,dmg:empowered?baseWeapon.dmg*2:baseWeapon.dmg+(Expedition.has("hunter")?5:0)};
      Adventure.answer(true);Expedition.recordAnswer(true);
      await WeaponAnimationSystem.attack(wObj, () => {
        if(!attackValid())return false;
        if(reflection){setScorpionOpening(true);Expedition.recordDamage('reflection',Math.min(playerHp,10));playerHp=Math.max(0,playerHp-10);updateBars();if(playerHp<=0)defeatHero();return;}
        slimeHp -= wObj.dmg;if(Expedition.active&&Expedition.run.step===6&&!scorpionAwakened&&slimeHp>0&&slimeHp<=slimeMaxHp/2){scorpionAwakened=true;setScorpionArmor(true);document.querySelector('.battle-hint').textContent='鎧蠍半血覺醒！下一題啟動反彈護甲';}if(empowered&&Expedition.has("focus"))playerHp=Math.min(playerMaxHp,playerHp+3);if(slimeHp<=0){BossMeteors.stop();BossSpecials.stop();} updateBars(); Adventure.phase(slimeHp,slimeMaxHp,Expedition.bossMode(mode)==='boss'&&level===5);
      },{empowered,reflection,valid:attackValid});

      if(epoch!==battleEpoch||!battleActive||playerHp<=0)return false;
      if (slimeHp <= 0) {
        await BattleEffects.death(document.getElementById("slime-container"));
        if(epoch!==battleEpoch||!battleActive||playerHp<=0)return false;
        if(Expedition.active){Expedition.win(playerHp);return;}
        let baseReward = 0;
        if (mode === 'boss') {
          baseReward = (level === 5) ? 100 : 25;
        } else if (mode === 'medium') {
          baseReward = (level === 5) ? 60 : 20;
        } else {
          baseReward = (level === 5) ? 30 : 10;
        }

        const storyReward=Adventure.storyReward(mode,level,baseReward);
        pendingReward = storyReward.coins;
        const journeyText=document.getElementById('boss-journey-reward');journeyText.hidden=mode!=='boss'||level!==5;journeyText.textContent=storyReward.journeyBonus?'完整旅程：巨龍獎勵 80 ＋ 旅程加成 '+storyReward.journeyBonus+' 金幣':'巨龍重戰獎勵：固定 80 金幣';

        document.getElementById('boss-total-reward').textContent=pendingReward;
        Adventure.finish(player,mode,level);
        player.coins += pendingReward;
        if (mode === 'medium' && level === 5) player.bossUnlocked = true;
        saveGame();

        battleLater(() => {
          if (mode === 'boss' && level === 5) {
            triggerBossVictoryStage();
          } else {
            document.getElementById('clear-title').textContent=level===5?'成功擊敗'+Adventure.bossFor(mode,level).name+'！':'順利擊敗怪物！';
            const rewardText = document.getElementById('level-reward-text');
            const nextBtn = document.getElementById('btn-next-level');
            const levelCleared = document.getElementById('level-cleared-screen');
            if (rewardText) rewardText.innerText = `+${pendingReward}`;
            if (nextBtn) nextBtn.innerText = (level >= 5) ? '返回主選單' : '進入下一關 →';
            if (levelCleared) levelCleared.style.display = 'flex';
          }
        }, 500);
      } else {
        battleLater(() => { generateQuestion(); }, 600);
      }
    } else {
      isAnswering = true;
      if (timerInterval) clearInterval(timerInterval);
      document.querySelectorAll('.fruit-btn').forEach(b => b.classList.add('disabled'));
      showCorrectAnswer();
      if (btnElem) btnElem.style.background = '#ffcdd2';
      battleLater(() => { handleMonsterAttack(); }, 400);
    }
  };

  window.startMapLevel=function(selectedMode,selectedLevel){
    const progress=Adventure.normalize(player.adventure);
    if(!['easy','medium','boss'].includes(selectedMode)||!Number.isInteger(selectedLevel)||selectedLevel<1||selectedLevel>5||(selectedMode==='boss'&&!player.bossUnlocked)||(selectedLevel>1&&!progress[selectedMode][selectedLevel-2]))return;
    safePlayAudio();Adventure.startJourney(selectedMode,selectedLevel);mode=selectedMode;level=selectedLevel;document.getElementById('mode-select').style.display='none';document.getElementById('adventure-map').style.display='none';startLevel();
  };
  window.retryCurrentLevel = function() {
    if(Expedition.active){document.getElementById("game-over-screen").style.display="none";Expedition.retry();return;}
    
    safePlayAudio();
    const gameOverScreen = document.getElementById('game-over-screen');
    if (gameOverScreen) gameOverScreen.style.display = 'none';
    startLevel();
  };

  window.endAdventureFromGameOver = function() {
    Adventure.endJourney();
    if(Expedition.active){document.getElementById("game-over-screen").style.display="none";Expedition.open();return;}
    stopBattle();
    safePlayAudio();
    if (timerInterval) clearInterval(timerInterval);
    const gameOverScreen = document.getElementById('game-over-screen');
    const modeSelect = document.getElementById('mode-select');
    if (gameOverScreen) gameOverScreen.style.display = 'none';
    if (modeSelect) modeSelect.style.display = 'flex';
  };

  window.proceedToNextLevel = function() {
    const levelCleared = document.getElementById('level-cleared-screen');
    const modeSelect = document.getElementById('mode-select');
    if (levelCleared) levelCleared.style.display = 'none';
    if (level >= 5) {
      stopBattle();
      Adventure.endJourney();
      if (modeSelect) modeSelect.style.display = 'flex';
    } else {
      level++;
      startLevel();
    }
  };

  window.endAdventure = function() {
    Adventure.endJourney();
    if(Expedition.active){document.getElementById("game-over-screen").style.display="none";Expedition.open();return;}
    stopBattle();
    safePlayAudio();
    if (timerInterval) clearInterval(timerInterval);
    const levelCleared = document.getElementById('level-cleared-screen');
    const modeSelect = document.getElementById('mode-select');
    if (levelCleared) levelCleared.style.display = 'none';
    if (modeSelect) modeSelect.style.display = 'flex';
  };

  window.closeBossStage = function() {
    Adventure.endJourney();
    stopBattle();
    const bossStage = document.getElementById('boss-battle-stage');
    const modeSelect = document.getElementById('mode-select');
    if (bossStage) bossStage.style.display = 'none';
    if (modeSelect) modeSelect.style.display = 'flex';
  };

  function triggerBossVictoryStage() {
    stopBattle();
    const stage = document.getElementById('boss-battle-stage');
    const victoryDragon=stage.querySelector('.victory-dragon-art');
    victoryDragon.src=document.getElementById('boss-svg-elem').src;
    victoryDragon.alt=document.getElementById('boss-svg-elem').alt;
    const heroIcon = player.gender === 'boy' ? '👦' : '👧';

    const bossHeroIcon = document.getElementById('boss-hero-icon');
    if (bossHeroIcon) {
      bossHeroIcon.replaceChildren(document.querySelector('.hero-base-svg').cloneNode(true));
      bossHeroIcon.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
      bossHeroIcon.style.width = '85px';
      bossHeroIcon.style.height = '145px';
    }

    const bossWeaponBox = document.getElementById('boss-weapon-icon');
    const wObj = weapons[player.weapon] || weapons['wood_sword'];
    if (bossWeaponBox) {
      if (wObj.isSvg) {
        bossWeaponBox.innerHTML = wObj.icon;
      } else {
        bossWeaponBox.innerText = wObj.icon;
      }
    }

    const hero = document.getElementById('boss-hero-char');
    const enemy = document.getElementById('boss-enemy-char');
    const card = document.getElementById('boss-victory-card');

    if (stage) stage.style.display = 'flex';
    if (card) card.style.display = 'none';
    if (hero) hero.style.animation = '';
    if (enemy) enemy.style.animation = '';

    setTimeout(() => { if (hero) hero.style.animation = 'heroBossAttack 0.6s ease-in-out'; }, 400);
    setTimeout(() => { if (enemy) enemy.style.animation = 'fierceBossDefeated 1.2s forwards'; }, 900);
    setTimeout(() => { if (card) card.style.display = 'block'; }, 2200);
  }

  // 初始化遊戲 UI
  Expedition.recover();
  saveGame();
