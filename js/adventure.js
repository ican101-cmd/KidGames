// Adventure progression and Boss phases; original save keys remain compatible.
const Adventure=(()=>{
 const modes=['easy','medium','boss'];
 const awakenedDragon=new Image();
 const bosses={easy:{name:'蘋果布丁王',file:'boss-apple-king',hp:200,expeditionHp:250,type:'hop',duration:700,color:'#e1f28c',trait:'果凍蓄力 · 皇家彈跳'},medium:{name:'蒼潮甲龜',file:'boss-tide-tortoise',hp:250,expeditionHp:300,type:'stone',duration:900,color:'#9ce5ff',trait:'甲殼蓄力 · 潮汐重踏'},boss:{name:'暮星巨龍',file:'dragon',hp:300,expeditionHp:350,type:'star',duration:650,color:'#d7c2ff'}};
 function bossFor(mode,level){mode=typeof Expedition!=="undefined"?Expedition.bossMode(mode):mode;return level===5?bosses[mode]||null:null;}
 let bossImageVersion=0;
 function setBossArt(file,name){const image=document.getElementById('boss-svg-elem'),path='assets/art/'+file+'.webp',version=++bossImageVersion;image.alt=name;
  const reveal=()=>{if(version===bossImageVersion&&image.getAttribute('src')===path&&image.complete&&image.naturalWidth>0&&image.currentSrc===image.src)image.style.visibility='visible';};
  image.style.visibility='hidden';if(image.getAttribute('src')!==path||(image.complete&&image.naturalWidth===0))image.src=path;
  if(image.complete&&image.naturalWidth>0&&image.currentSrc===image.src)reveal();
  else if(typeof image.decode==='function')image.decode().then(reveal).catch(()=>{});else image.addEventListener('load',reveal,{once:true});
 }
 function dragonForm(awake){setBossArt(awake?'dragon-awakened':'dragon',awake?'龍焰覺醒巨龍':'暮星巨龍');}
 const traits=[['草原蹦跳','輕快跳躍後撞擊','hop'],['花葉蓄力','花葉聚集後突進','leaf'],['潮汐衝刺','隨水波滑行撞擊','wave'],['岩光重踏','蓄力重踏後撞擊','stone'],['星光突襲','星光聚集後突進','star']];
 let journey=null;
 function startJourney(mode,level=1){journey=mode==='boss'&&level===1?{next:1}:null;}
 function endJourney(){journey=null;}
 function storyReward(mode,level,base){
  if(mode!=='boss')return{coins:Math.round(base),journeyBonus:0};
  if(level<5){if(journey?.next===level)journey.next++;else journey=null;return{coins:Math.round(base),journeyBonus:0};}
  const complete=journey?.next===5;journey=null;const coins=complete?Math.round(base):80;return{coins,journeyBonus:complete?coins-80:0};
 }
 let state={correct:0,attempts:0,phase:1};
 const speedLimits={easy:.5,medium:.6,boss:.65};
 const badgeNames={clear:'✦ 通關',wisdom:'◆ 智慧',speed:'➤ 疾風'};
 function normalize(raw){const result={version:1,badges:{}};for(const mode of modes){result[mode]=Array.from({length:5},(_,i)=>Math.max(0,Math.min(3,Number.isFinite(raw?.[mode]?.[i])?Math.floor(raw[mode][i]):0)));result.badges[mode]=Array.from({length:5},(_,i)=>Object.fromEntries(Object.keys(badgeNames).map(k=>[k,raw?.badges?.[mode]?.[i]?.[k]===true])));}for(const mode of modes)result[mode]=result[mode].map((n,i)=>Math.max(n>0?1:0,Object.values(result.badges[mode][i]).filter(Boolean).length));result.firstClearClaimed={};for(const mode of modes)result.firstClearClaimed[mode]=typeof raw?.firstClearClaimed?.[mode]==='boolean'?raw.firstClearClaimed[mode]:result[mode][4]>0;return result;}
 // Retained as a compatibility no-op; story clears no longer grant a first-clear bonus.
 function chapterReward(){return 0;}
 let questionClock=null;
 function begin(){state={correct:0,attempts:0,phase:1,normalAttempts:0,normalCorrect:0,ratios:[]};questionClock=null;bossImageVersion++;document.getElementById('boss-svg-elem').style.visibility='hidden';document.getElementById('battle-stage').dataset.bossPhase='1';document.getElementById('boss-special-status').textContent='';}
 function question(seconds,ultimate=false){questionClock={start:performance.now(),limit:Math.max(1,seconds*1000),ultimate};}
 function answer(correct,{timeout=false}={}){state.attempts++;if(correct)state.correct++;if(questionClock&&!questionClock.ultimate){state.normalAttempts++;if(correct)state.normalCorrect++;state.ratios.push(timeout?1:Math.min(1,Math.max(0,(performance.now()-questionClock.start)/questionClock.limit)));}questionClock=null;}
 function assessment(mode){const count=state.normalAttempts||0,average=count?state.ratios.reduce((a,b)=>a+b,0)/count:1,accuracy=count?(state.normalCorrect||0)/count:0;return{clear:true,wisdom:state.attempts>0&&state.correct===state.attempts,speed:count>=3&&accuracy>=.8&&average<=speedLimits[mode]+1e-9,count,average,accuracy};}
 function badgeMarkup(badges){return Object.entries(badgeNames).map(([k,label])=>'<span class="chapter-badge '+(badges[k]?'earned':'pending')+'" aria-label="'+label.slice(2)+'之星，'+(badges[k]?'已取得':'尚未取得')+'"><span aria-hidden="true">'+label+'</span><span class="badge-status" aria-hidden="true">'+(badges[k]?'✓':'✕')+'</span></span>').join('');}

 function finish(player,mode,level){player.adventure=normalize(player.adventure);const result=assessment(mode),saved=player.adventure.badges[mode][level-1];for(const k of Object.keys(badgeNames))saved[k]||=result[k];const stars=Object.keys(badgeNames).filter(k=>saved[k]).length;player.adventure[mode][level-1]=Math.max(stars,player.adventure[mode][level-1]);const summary='<span class="chapter-badges">'+badgeMarkup(result)+'</span><span class="chapter-score-note">本次：答對 '+state.correct+'/'+state.attempts+' 題；普通題 '+result.count+' 題，正確率 '+(result.accuracy*100).toFixed(1)+'%<br>平均耗時 '+(result.average*100).toFixed(1)+'% · 疾風目標 ≤ '+speedLimits[mode]*100+'%'+(result.count<3?'<br>疾風挑戰需完成至少 3 道普通題':'')+'<br>各星章分別保留最佳紀錄</span>';document.getElementById('clear-stars').innerHTML=summary;document.getElementById('boss-clear-stars').innerHTML=summary;return stars;}
 function answerSeconds(base,isBoss){return isBoss&&state.phase===2?Math.max(5,base-2):base;}
 function phase(hp,max,isBoss){const chapterBoss=bossFor(mode,level);if(!chapterBoss||state.phase===2||hp<=0||hp>max/2)return;state.phase=2;if(isBoss){dragonForm(true);startBossMeteors();}else startChapterBossSpecial();document.getElementById('battle-stage').dataset.bossPhase='2';scene(level,isBoss);BattleEffects.burst(document.getElementById('slime-container'),'ultimateHit','#ffbc72');}
 function enemyProfile(level,isBoss){const chapterBoss=bossFor(mode,level);if(chapterBoss&&!isBoss)return chapterBoss;if(isBoss&&state.phase===2)return{type:'dragon',duration:760,color:'#ffb06a',name:'龍焰覺醒'};const row=traits[level-1]||traits[0];return{type:row[2],duration:[650,760,580,800,650][level-1]||650,color:['#d6ec9d','#ffc7dd','#9ce5ff','#ffda99','#d7c2ff'][level-1],name:row[0]};}
 function scene(level,isBoss){const chapterBoss=bossFor(mode,level);if(chapterBoss){if(isBoss)dragonForm(state.phase===2);else setBossArt(chapterBoss.file,chapterBoss.name);}if(isBoss&&!awakenedDragon.getAttribute('src'))awakenedDragon.src='assets/art/dragon-awakened.webp';const profile=enemyProfile(level,isBoss);document.getElementById('battle-stage').dataset.enemyStyle=profile.type;}
 function map(mode='easy'){if(!modes.includes(mode))mode='easy';if(mode==='boss'&&!player.bossUnlocked)mode='easy';document.getElementById('adventure-map').dataset.mode=mode;document.querySelector('#adventure-map .map-description').textContent=MathTopics.name()+' · '+MathTopics.lesson(mode)+'；通關點亮下一站！';const progress=normalize(player.adventure);document.querySelectorAll('[data-map-mode]').forEach(el=>{el.disabled=el.dataset.mapMode==='boss'&&!player.bossUnlocked;el.setAttribute('aria-pressed',String(el.dataset.mapMode===mode));});document.getElementById('map-nodes').innerHTML=WorldArt.scenes.map((scene,i)=>{const unlocked=i===0||progress[mode][i-1]>0,stars=progress[mode][i];return `<button class="map-node" ${unlocked?'':'disabled'} data-map-level="${i+1}"><img src="assets/art/${scene.file}.webp" alt=""><span><small>第 ${i+1} 站${i===4?' · '+bosses[mode].name:''} ${stars?'· 已通關':unlocked?'· 可挑戰':'· 尚未開啟'}</small><strong>${scene.name}</strong><span class="chapter-badges">${badgeMarkup(progress.badges[mode][i])}</span></span></button>`;}).join('');document.getElementById('adventure-map').style.display='flex';}
 document.getElementById('map-nodes').addEventListener('click',event=>{const button=event.target.closest('[data-map-level]');if(button&&!button.disabled)startMapLevel(document.getElementById('adventure-map').dataset.mode,Number(button.dataset.mapLevel));});
 document.querySelectorAll('[data-map-mode]').forEach(button=>button.addEventListener('click',()=>map(button.dataset.mapMode)));
 return{startJourney,endJourney,storyReward,normalize,chapterReward,bossFor,begin,question,answer,assessment,finish,phase,answerSeconds,enemyProfile,scene,map,get state(){return{...state};}};
})();
