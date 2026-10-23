
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
    green: { name: '豐富草地', colorClass: 'bg-grass', price: 0, multiplier: 1 },
    pink: { name: '夢幻粉', colorClass: 'bg-pink', price: 450, multiplier: 1.4 },
    blue: { name: '深海藍', colorClass: 'bg-blue', price: 900, multiplier: 1.6 }
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
    const localCoins = localStorage.getItem('fruit_coins');
    if (localCoins !== null) player.coins = parseInt(localCoins, 10) || 0;
    if (localStorage.getItem('fruit_weapon')) player.weapon = localStorage.getItem('fruit_weapon');
    if (localStorage.getItem('fruit_unlocked_weapons')) player.unlockedWeapons = JSON.parse(localStorage.getItem('fruit_unlocked_weapons'));
    if (localStorage.getItem('fruit_helmet')) player.helmet = localStorage.getItem('fruit_helmet');
    if (localStorage.getItem('fruit_unlocked_helmets')) player.unlockedHelmets = JSON.parse(localStorage.getItem('fruit_unlocked_helmets'));
    if (localStorage.getItem('fruit_chest')) player.chest = localStorage.getItem('fruit_chest');
    if (localStorage.getItem('fruit_unlocked_chests')) player.unlockedChests = JSON.parse(localStorage.getItem('fruit_unlocked_chests'));
    if (localStorage.getItem('fruit_gloves')) player.gloves = localStorage.getItem('fruit_gloves');
    if (localStorage.getItem('fruit_unlocked_gloves')) player.unlockedGloves = JSON.parse(localStorage.getItem('fruit_unlocked_gloves'));
    if (localStorage.getItem('fruit_boots')) player.boots = localStorage.getItem('fruit_boots');
    if (localStorage.getItem('fruit_unlocked_boots')) player.unlockedBoots = JSON.parse(localStorage.getItem('fruit_unlocked_boots'));
    if (localStorage.getItem('fruit_bg')) player.bg = localStorage.getItem('fruit_bg');
    if (localStorage.getItem('fruit_unlocked_bgs')) player.unlockedBgs = JSON.parse(localStorage.getItem('fruit_unlocked_bgs'));
    player.bossUnlocked = localStorage.getItem('fruit_boss') === 'true';
  } catch (e) {}

  try { player.adventure=Adventure.normalize(JSON.parse(localStorage.getItem('fruit_adventure_v1'))); } catch(e) { player.adventure=Adventure.normalize(); }

  let mode = 'easy', level = 1, currentAnswer = 0, timerInterval = null, timeLeft = 15;
  let playerMaxHp = 20, playerHp = 20, slimeMaxHp = 100, slimeHp = 100;
  let currentShopTab = 'weapons';
  let openedFromModal = false;
  let pendingReward = 0;
  let isAnswering = false;
  let battleEpoch=0,battleActive=false,ultimateQuestion=false;
  let ultimateRecovery=0,scorpionOpening=false,questionSettled=false;
  function setScorpionOpening(open){scorpionOpening=open;document.getElementById('slime-container').classList.toggle('scorpion-opening',open);}
  function setUltimateRecovery(n){ultimateRecovery=n;if(Expedition.active)Expedition.setUltimateRecovery(n);}
  function finishQuestion(){if(questionSettled)return false;questionSettled=true;if(!ultimateQuestion&&ultimateRecovery>0)setUltimateRecovery(ultimateRecovery-1);setScorpionOpening(false);return true;}
  function battleLater(callback,delay){const epoch=battleEpoch;setTimeout(()=>{if(epoch===battleEpoch&&battleActive)callback();},delay);}
  function stopBattle(){setScorpionOpening(false);BossSkillTiming.reset();MonsterRegeneration.stop();document.getElementById("exp-return").hidden=true;ultimateQuestion=false;document.getElementById('ultimate-button').disabled=true;battleActive=false;battleEpoch++;BossMeteors.stop();BossSpecials.stop();if(timerInterval)clearInterval(timerInterval);}
  function defeatHero(){
    if(!battleActive)return;Expedition.report(false);document.getElementById('expedition-failure-report').innerHTML=Expedition.active?Expedition.reportMarkup():'';document.getElementById('expedition-failure-report').hidden=!Expedition.active;stopBattle();isAnswering=true;
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
    });
  }

  function startChapterBossSpecial(){
    const epoch=battleEpoch,kind=Expedition.bossMode(mode);
    BossSpecials.start(kind,()=>battleActive&&epoch===battleEpoch&&Expedition.bossMode(mode)===kind&&level===5&&Adventure.state.phase===2&&slimeHp>0&&playerHp>0,(amount,color)=>{
      amount=Expedition.damage(amount);Expedition.recordDamage('special',Math.min(playerHp,amount));playerHp=Math.max(0,playerHp-amount);updateBars();
      const hero=document.getElementById('player-visual-box');BattleEffects.burst(hero,kind==='easy'?'smallHit':'magicHit',color);BattleEffects.damage(hero,amount);safePlayAudio(()=>WeaponAudio.hero(audioCtx,'hit'));
      if(playerHp<=0)defeatHero();
    },cue=>safePlayAudio(()=>WeaponAudio.bossSkill(audioCtx,kind,cue)));
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
      localStorage.setItem('fruit_adventure_v1',JSON.stringify(player.adventure));
      localStorage.setItem('fruit_coins', player.coins);
      localStorage.setItem('fruit_weapon', player.weapon);
      localStorage.setItem('fruit_unlocked_weapons', JSON.stringify(player.unlockedWeapons));
      localStorage.setItem('fruit_helmet', player.helmet);
      localStorage.setItem('fruit_unlocked_helmets', JSON.stringify(player.unlockedHelmets));
      localStorage.setItem('fruit_chest', player.chest);
      localStorage.setItem('fruit_unlocked_chests', JSON.stringify(player.unlockedChests));
      localStorage.setItem('fruit_gloves', player.gloves);
      localStorage.setItem('fruit_unlocked_gloves', JSON.stringify(player.unlockedGloves));
      localStorage.setItem('fruit_boots', player.boots);
      localStorage.setItem('fruit_unlocked_boots', JSON.stringify(player.unlockedBoots));
      localStorage.setItem('fruit_bg', player.bg);
      localStorage.setItem('fruit_unlocked_bgs', JSON.stringify(player.unlockedBgs));
      localStorage.setItem('fruit_boss', player.bossUnlocked);
    } catch(e) {}
    updateUI();
  }

  function updateUI() {
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
    expeditionButton.disabled=!expeditionUnlocked;
    expeditionButton.textContent=expeditionUnlocked?'🧭 冒險遠征 · 世界地圖':'冒險遠征 [封印狀態]';
    expeditionButton.title=expeditionUnlocked?'開始冒險遠征':'擊敗魔王難度最後一關的巨龍後解鎖';
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
    ultimateRecovery=Expedition.active?Math.max(0,Math.min(2,Math.floor(Number(Expedition.run.ultimateRecovery)||0))):0;scorpionOpening=false;
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

    if (level === 5) {
      const chapterBoss=Adventure.bossFor(mode,level);
      slimeMaxHp = Expedition.active?chapterBoss.expeditionHp:chapterBoss.hp;
      if (slimeElem) slimeElem.style.display = 'none';
      if (bossElem) bossElem.style.display = 'block';
      if (enemyTitle) enemyTitle.innerText = chapterBoss.name;
    } else {
      const ordinaryHp=Expedition.active&&Expedition.run?.step===6?200:Expedition.active&&Expedition.run?.routeVersion>=3&&Expedition.run.step===5?[100,110,120][Expedition.waveNumber()-1]:100;
      slimeMaxHp = ordinaryHp;
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
      restore:amount=>{const restored=Math.min(amount,slimeMaxHp-slimeHp);if(restored<=0)return;slimeHp+=restored;updateBars();BattleEffects.heal(document.getElementById('slime-container'),restored);}
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
    if(!battleActive||isAnswering||ultimateQuestion||ultimateRecovery>0||playerHp<=0||slimeHp<=0||timeLeft<=0)return;
    setUltimateRecovery(2);safePlayAudio();generateQuestion({ultimate:true,seconds:timeLeft});
  };
  function showCorrectAnswer(){const el=document.getElementById('answer-feedback');el.textContent='正確答案：'+document.getElementById('question-box').innerText.replace('?',String(currentAnswer));el.hidden=false;}
  function generateQuestion({ultimate=false,seconds=null}={}) {
    if(!battleActive||playerHp<=0||slimeHp<=0)return;
    isAnswering = false;ultimateQuestion=ultimate;questionSettled=false;document.getElementById('answer-feedback').hidden=true;
    document.getElementById('ultimate-button').disabled=ultimate||ultimateRecovery>0;
    document.getElementById('ultimate-button-hint').textContent=ultimate?'選出答案，釋放必殺一擊！':ultimateRecovery>0?'再完成 '+ultimateRecovery+' 道普通題':'三數連加 · 答對傷害 ×2';
    document.getElementById('question-box').classList.toggle('ultimate-question',ultimate);
    document.querySelector('.battle-hint').textContent=Expedition.active&&Expedition.run.step===6?(scorpionOpening?'鎧甲破綻！這一題答對即可命中':'鎧甲反彈：剩 5 秒內答對會反彈 10 HP'):Expedition.active&&Expedition.run.routeVersion>=3&&Expedition.run.step===5?'烈焰牛頭 · 第 '+Expedition.waveNumber()+' 波'+(Expedition.waveNumber()===3?'：半血後每 5 秒回血 10':'：趁勢前進！'):'選出正確的水果答案，幫勇者出招！';
    if (timerInterval) clearInterval(timerInterval);

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
      const third=mode==='easy'?Math.floor(Math.random()*9)+1:mode==='medium'?Math.floor(Math.random()*10)+11:Math.floor(Math.random()*50)+20;
      currentAnswer=num1+num2+third;
      document.getElementById('question-box').innerText=num1+' + '+num2+' + '+third+' = ?';
    }else{
      currentAnswer = isAdd ? (num1 + num2) : (num1 - num2);
      document.getElementById('question-box').innerText = num1+' '+(isAdd?'+':'−')+' '+num2+' = ?';
    }
    let options = generateOptions(currentAnswer);
    if(ultimate)options=[currentAnswer,options.find(value=>value!==currentAnswer)].sort(()=>Math.random()-.5);
    const area = document.getElementById('fruits-area');
    area.innerHTML = '';
    options.forEach(val => {
      const btn = document.createElement('div');
      btn.className = 'fruit-btn';
      btn.innerHTML = `<span>🍎</span><span>${val}</span>`;
      btn.onclick = () => window.checkAnswer(val, btn);
      area.appendChild(btn);
    });

    timeLeft = seconds===null?Adventure.answerSeconds(Expedition.active&&Expedition.run.routeVersion>=3&&Expedition.run.step===5?11:Math.max(5,15-(level-1)*2),Expedition.bossMode(mode)==='boss'&&level===5):seconds;
    if(seconds===null&&Expedition.has("sandglass"))timeLeft++;
    document.getElementById('timer').innerText = timeLeft;
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
    if(!finishQuestion())return;
    showCorrectAnswer();
    isAnswering = true;
    if (timerInterval) clearInterval(timerInterval);

    document.querySelectorAll('.fruit-btn').forEach(b => b.classList.add('disabled'));
    document.getElementById('ultimate-button').disabled=true;
    Adventure.answer(false);Expedition.recordAnswer(false,reason==='timeout');
    if(Adventure.bossFor(mode,level))safePlayAudio(()=>WeaponAudio.bossAttack(audioCtx,Expedition.bossMode(mode)));
    await WeaponAnimationSystem.enemyAttack(() => { if(epoch!==battleEpoch||!battleActive||playerHp<=0)return false;const damage=Expedition.damage(20);Expedition.recordDamage('normal',Math.min(playerHp,damage));playerHp = Math.max(0,playerHp-damage); updateBars(); safePlayAudio(()=>WeaponAudio.hero(audioCtx,'hit'));return damage; },Adventure.enemyProfile(level,Expedition.bossMode(mode)==='boss'&&level===5));

    if(epoch!==battleEpoch||!battleActive)return;
    if(playerHp<=0)defeatHero();else battleLater(()=>generateQuestion(),700);
  }

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
    renderShopItems();
    const modeSelect = document.getElementById('mode-select');
    const shopScreen = document.getElementById('shop-screen');
    if (modeSelect) modeSelect.style.display = 'none';
    if (shopScreen) shopScreen.style.display = 'flex';
  };

  window.openShopFromModal = function() {
    safePlayAudio();
    openedFromModal = true;
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
              <div style="font-size:12px; color:#666;">⚔️ 普通攻擊：${w.dmg} HP</div><div class="shop-stat">✨ 必殺技：${w.dmg*2} HP</div>
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
              <div style="font-size:12px; color:#666;">❤️ 血量加成: +${arm.hp} HP</div><div class="shop-stat">目前 HP ${currentHp} → 裝備後 ${previewHp}</div>
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
            <div class="shop-icon-preview">🎨</div>
            <div>
              <div style="font-weight:bold; font-size:14px;">${bg.name}</div>
              <div style="font-size:12px; color:#666;">敵人 HP 不變 · 故事金幣 ×${bg.multiplier}</div>
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
      renderShopItems();
    } else if (player.coins >= w.price) {
      player.coins -= w.price;
      player.weapon = k;
      if (!player.unlockedWeapons.includes(k)) player.unlockedWeapons.push(k);
      saveGame();
      renderShopItems();
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
      renderShopItems();
    } else if (player.coins >= arm.price) {
      player.coins -= arm.price;
      player[slot] = tierKey;
      if (!player[listKey].includes(tierKey)) player[listKey].push(tierKey);
      saveGame();
      renderShopItems();
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
      renderShopItems();
    } else if (player.coins >= bg.price) {
      player.coins -= bg.price;
      player.bg = bgKey;
      if (!player.unlockedBgs.includes(bgKey)) player.unlockedBgs.push(bgKey);
      saveGame();
      renderShopItems();
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
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({...player,expedition:Expedition.export()}));
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
          if(importedData.expedition){Expedition.load(importedData.expedition);localStorage.setItem("fruit_expedition_v1",JSON.stringify(Expedition.export()));}
          player = Object.assign({}, player, importedData);delete player.expedition;
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
    if (confirm("⚠️ 確定要清除所有存檔資料嗎？")) {
      Object.keys(localStorage).filter(k => k.startsWith('fruit_')).forEach(k => localStorage.removeItem(k));
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
      saveGame();
      alert("🗑️ 存檔已重置！");
    }
  };

  window.startGame = function(m) {
    safePlayAudio();
    
    mode = m; level = 1;
    const modeSelect = document.getElementById('mode-select');
    if (modeSelect) modeSelect.style.display = 'none';
    startLevel();
  };

  window.checkAnswer = async function(val, btnElem) {
    if (isAnswering||!battleActive||playerHp<=0||slimeHp<=0) return;
    const epoch=battleEpoch;
    const empowered=ultimateQuestion;
    const reflection=Expedition.active&&Expedition.run?.step===6&&!scorpionOpening&&timeLeft>0&&timeLeft<=5;
    const attackValid=()=>epoch===battleEpoch&&battleActive&&playerHp>0;
    document.getElementById('ultimate-button').disabled=true;

    if (val === currentAnswer) {
      if(!finishQuestion())return;
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
        slimeHp -= wObj.dmg;if(empowered&&Expedition.has("focus"))playerHp=Math.min(playerMaxHp,playerHp+3);if(slimeHp<=0){BossMeteors.stop();BossSpecials.stop();} updateBars(); Adventure.phase(slimeHp,slimeMaxHp,Expedition.bossMode(mode)==='boss'&&level===5);
      },{empowered,reflection,valid:attackValid});

      if(epoch!==battleEpoch||!battleActive||playerHp<=0)return false;
      if (slimeHp <= 0) {
        await BattleEffects.death(document.getElementById("slime-container"));
        if(epoch!==battleEpoch||!battleActive||playerHp<=0)return false;
        if(Expedition.active){Expedition.win(playerHp);return;}
        let baseReward = 0;
        if (mode === 'boss') {
          baseReward = (level === 5) ? 300 : 0;
        } else if (mode === 'medium') {
          baseReward = 20;
        } else {
          baseReward = 10;
        }

        const mult = backgrounds[player.bg]?.multiplier || 1;
        pendingReward = Math.round(baseReward * mult);

        const firstReward=Adventure.chapterReward(player,mode,level);
        pendingReward+=firstReward;
        for(const id of ['chapter-first-reward','boss-first-reward']){const el=document.getElementById(id);el.hidden=!firstReward;el.textContent='章節首次通關獎勵 +'+firstReward+' 金幣！';}
        document.getElementById('boss-total-reward').textContent=pendingReward;
        Adventure.finish(player,mode,level);
        player.coins += pendingReward;
        if (mode === 'medium') player.bossUnlocked = true;
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
            if (nextBtn) nextBtn.innerText = (level >= 5) ? '回主選單 🏠' : '進入下一關 ➔';
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
    safePlayAudio();mode=selectedMode;level=selectedLevel;document.getElementById('mode-select').style.display='none';document.getElementById('adventure-map').style.display='none';startLevel();
  };
  window.retryCurrentLevel = function() {
    if(Expedition.active){document.getElementById("game-over-screen").style.display="none";Expedition.open();return;}
    
    safePlayAudio();
    const gameOverScreen = document.getElementById('game-over-screen');
    if (gameOverScreen) gameOverScreen.style.display = 'none';
    startLevel();
  };

  window.endAdventureFromGameOver = function() {
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
      if (modeSelect) modeSelect.style.display = 'flex';
    } else {
      level++;
      startLevel();
    }
  };

  window.endAdventure = function() {
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
