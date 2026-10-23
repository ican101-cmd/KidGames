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
 function start(valid,impact){stop();const token=generation;async function tick(){if(!await timeline.wait(3000)||token!==generation)return;if(!valid()){stop();return;}void tick();if(!document.hidden)void rain(valid,impact,token);}timer=true;void tick();}
 return{start,stop,get running(){return timer!==null;}};
})();
