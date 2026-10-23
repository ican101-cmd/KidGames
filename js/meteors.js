// One cancellable hazard timer. Five visual meteors constitute ONE 5 HP wave.
const BossMeteors=(()=>{
 let timer=null,generation=0;const nodes=new Set();
 function stop(){generation++;clearTimeout(timer);timer=null;for(const node of nodes){node.getAnimations().forEach(a=>a.cancel());node.remove();}nodes.clear();}
 async function rain(valid,impact,token){
  const stage=document.getElementById('battle-stage'),layer=document.getElementById('effect-layer'),hero=BattleEffects.point(document.getElementById('player-visual-box')),r=stage.getBoundingClientRect();
  const reduced=BattleEffects.reduced(),duration=420,flights=[];
  for(let i=0;i<(reduced?2:5);i++){
   const meteor=document.createElement('div');meteor.className='boss-meteor';meteor.setAttribute('aria-hidden','true');
   const x=r.width-22-i*18,y=18+i*8,endX=hero.x+(i-2)*12,endY=hero.y+15+(i%2)*6;
   meteor.style.left=x+'px';meteor.style.top=y+'px';layer.appendChild(meteor);nodes.add(meteor);
   const animation=meteor.animate(reduced?[{opacity:0},{opacity:.7,offset:.6},{opacity:0}]:[{transform:'translate(0,0) scale(.6)',opacity:0},{transform:'translate('+((endX-x)*.12)+'px,'+((endY-y)*.12)+'px) scale(1)',opacity:1,offset:.15},{transform:'translate('+(endX-x)+'px,'+(endY-y)+'px) scale(.8)',opacity:1}],{duration,delay:i*18,easing:'ease-in'});
   flights.push(animation.finished.catch(()=>{}).finally(()=>{meteor.remove();nodes.delete(meteor);}));
  }
  // Contact occurs at the lead meteor's arrival, once per wave.
  await new Promise(resolve=>setTimeout(resolve,duration));
  if(token===generation&&valid())impact();
  await Promise.all(flights);
 }
 function start(valid,impact){stop();const token=generation;function tick(){if(token!==generation)return;if(!valid()){stop();return;}timer=setTimeout(tick,2000);if(!document.hidden)rain(valid,impact,token);}timer=setTimeout(tick,2000);}
 return{start,stop,get running(){return timer!==null;}};
})();
