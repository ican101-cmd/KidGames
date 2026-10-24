// Shared cancellable scheduler for the two chapter Boss skills.
const BossSpecials=(()=>{
 const profiles={easy:{interval:5000,warning:800,text:'果凍彈來了！',color:'#f3df83'},medium:{interval:4000,warning:1000,text:'雙重潮汐，準備迎擊！',color:'#a4e9ff'}};
 const timeline=BossSkillTiming.create();let timer=null,generation=0;const nodes=new Set();
 function stop(){delete document.getElementById('battle-stage').dataset.skillCharge;generation++;timeline.cancel();timer=null;for(const node of nodes)node.remove();nodes.clear();}
 const wait=ms=>timeline.wait(ms);
 function node(cls){const el=document.createElement('div');el.className=cls;el.setAttribute('aria-hidden','true');document.getElementById('effect-layer').appendChild(el);nodes.add(el);return el;}
 function remove(el){el.remove();nodes.delete(el);}
 const animate=(el,frames,ms)=>timeline.animate(el,frames,{duration:ms,easing:'linear',fill:'forwards'});
 async function ball(valid,impact,sound,token){
  const hero=BattleEffects.point(document.getElementById('player-visual-box')),enemy=BattleEffects.point(document.getElementById('slime-container')),el=node('royal-jelly-ball'),reduced=BattleEffects.reduced();
  Object.assign(el.style,{left:enemy.x+'px',top:(enemy.y-12)+'px'});sound('launch');
  const dx=hero.x-enemy.x,dy=hero.y-enemy.y+24;
  const frames=reduced?[{opacity:0},{opacity:.8,offset:.5},{opacity:0}]:[{transform:'translate(0,0) scale(1)'},{transform:`translate(${dx*.3}px,${dy*.3+17}px) scale(1.2,.75)`,offset:.3},{transform:`translate(${dx*.5}px,${dy*.5-22}px) scale(.9,1.05)`,offset:.5},{transform:`translate(${dx*.75}px,${dy*.75+15}px) scale(1.2,.75)`,offset:.75},{transform:`translate(${dx}px,${dy}px) scale(.9,1.1)`}];
  const bounceSounds=(async()=>{await wait(180);if(token!==generation||!valid())return;sound('bounce');await wait(270);if(token===generation&&valid())sound('bounce');})();const completed=await animate(el,frames,600);await bounceSounds;remove(el);if(completed&&token===generation&&valid())impact(3,'#d9ed8b');
 }
 async function wave(index,valid,impact,sound,token){
  const stage=document.getElementById('battle-stage').getBoundingClientRect(),hero=BattleEffects.point(document.getElementById('player-visual-box')),el=node('tide-wave tide-wave-'+index),reduced=BattleEffects.reduced();
  Object.assign(el.style,{left:(stage.width-46)+'px',top:(stage.height-94-index*12)+'px'});sound('wave');
  const dx=hero.x-(stage.width-46);
  const completed=await animate(el,reduced?[{opacity:0},{opacity:.65,offset:.5},{opacity:0}]:[{transform:'translateX(0)',opacity:.2},{transform:`translateX(${dx*.2}px)`,opacity:1,offset:.2},{transform:`translateX(${dx}px)`,opacity:.9}],450);
  remove(el);if(completed&&token===generation&&valid())impact(3,'#a4e9ff');
 }
 async function skill(kind,valid,impact,sound,token){
  const p=profiles[kind],banner=node('boss-skill-warning');banner.textContent=p.text;
  document.getElementById('boss-special-status').textContent=p.text;
  document.getElementById('battle-stage').dataset.skillCharge=kind;sound('charge');await wait(p.warning);remove(banner);if(token===generation)delete document.getElementById('battle-stage').dataset.skillCharge;if(token!==generation||!valid())return;
  if(kind==='easy')await ball(valid,impact,sound,token);
  else{const first=wave(0,valid,impact,sound,token);await wait(400);if(token===generation&&valid())await Promise.all([first,wave(1,valid,impact,sound,token)]);else await first;}
 }
 function start(kind,valid,impact,sound,{firstDelay=null}={}){stop();if(!profiles[kind])return;const token=generation,p=profiles[kind];async function tick(delay=p.interval){if(!await wait(delay)||token!==generation)return;if(!valid()){stop();return;}void tick();if(!document.hidden)void skill(kind,valid,impact,sound,token);}timer=true;void tick(firstDelay??p.interval);}
 return{start,stop,get running(){return timer!==null;}};
})();
