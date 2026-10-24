// One cancellable hazard timer. Five visual meteors constitute ONE 6 HP wave.
const BossMeteors=(()=>{
 const timeline=BossSkillTiming.create();let timer=null,generation=0;const nodes=new Set();
 function stop(){generation++;timeline.cancel();timer=null;for(const node of nodes){node.getAnimations().forEach(a=>a.cancel());node.remove();}nodes.clear();}
 async function rain(valid,impact,token){
  const stage=document.getElementById('battle-stage'),layer=document.getElementById('effect-layer'),hero=BattleEffects.point(document.getElementById('player-visual-box')),r=stage.getBoundingClientRect();
  const reduced=BattleEffects.reduced(),duration=420,flights=[];
  for(let i=0;i<(reduced?2:5);i++){
   const meteor=document.createElement('div');meteor.className='boss-meteor';meteor.setAttribute('aria-hidden','true');
   const x=r.width-22-i*18,y=18+i*8,endX=hero.x+(i-2)*12,endY=hero.y+15+(i%2)*6;
   meteor.style.left=x+'px';meteor.style.top=y+'px';layer.appendChild(meteor);nodes.add(meteor);
   const flight=timeline.animate(meteor,reduced?[{opacity:0},{opacity:.7,offset:.6},{opacity:0}]:[{transform:'translate(0,0) scale(.6)',opacity:0},{transform:'translate('+((endX-x)*.12)+'px,'+((endY-y)*.12)+'px) scale(1)',opacity:1,offset:.15},{transform:'translate('+(endX-x)+'px,'+(endY-y)+'px) scale(.8)',opacity:1}],{duration,delay:i*18,easing:'ease-in'});
   flights.push(flight.finally(()=>{meteor.remove();nodes.delete(meteor);}));
  }
  // Contact occurs at the lead meteor's arrival, once per wave.
  await timeline.wait(duration);
  if(token===generation&&valid())impact();
  await Promise.all(flights);
 }
 function start(valid,impact,{firstDelay=3000}={}){stop();const token=generation;let warning=null;if(firstDelay<3000){warning=document.createElement('div');warning.className='boss-skill-warning';warning.textContent='龍焰覺醒！流星將至';document.getElementById('effect-layer').appendChild(warning);nodes.add(warning);document.getElementById('boss-special-status').textContent=warning.textContent;}async function tick(delay=3000){if(!await timeline.wait(delay)||token!==generation)return;if(!valid()){stop();return;}if(warning){warning.remove();nodes.delete(warning);warning=null;}void tick();if(!document.hidden)void rain(valid,impact,token);}timer=true;void tick(firstDelay);}
 return{start,stop,get running(){return timer!==null;}};
})();
