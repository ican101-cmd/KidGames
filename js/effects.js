// Visual-only effects; the caller owns damage, rewards and saving.
const BattleEffects = (() => {
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 function animate(el,frames,options){return el.animate(frames,options).finished.catch(()=>{});}
 function point(el){const r=el.getBoundingClientRect(),s=document.getElementById('battle-stage').getBoundingClientRect();return{x:r.left-s.left+r.width/2,y:r.top-s.top+r.height/2};}
 function node(cls,p,color){const el=document.createElement('div');el.className=cls;Object.assign(el.style,{left:`${p.x}px`,top:`${p.y}px`,color});document.getElementById('effect-layer').appendChild(el);return el;}
 async function ephemeral(el,frames,duration){try{await animate(el,frames,{duration,fill:'forwards',easing:'ease-out'});}finally{el.remove();}}
 const hitPresets={smallHit:[5,35],heavyHit:[9,60],magicHit:[10,65],pierceHit:[6,42],arrowHit:[9,50],ultimateHit:[14,85]};
 function burst(target,type,color){
  const p=point(target),[count,size]=hitPresets[type]||hitPresets.smallHit;
  const ring=node(`impact ${type}`,p,color);ring.style.width=ring.style.height=`${size}px`;
  ephemeral(ring,[{transform:'translate(-50%,-50%) scale(.2)',opacity:1},{transform:'translate(-50%,-50%) scale(1.5)',opacity:0}],360);
  for(let i=0;i<(reduced()?3:count);i++){const a=i/count*Math.PI*2,d=size*.7,spark=node(type==='ultimateHit'?'spark diamond':'spark',p,color);ephemeral(spark,[{transform:'translate(-50%,-50%)',opacity:1},{transform:`translate(${Math.cos(a)*d}px,${Math.sin(a)*d}px) rotate(140deg) scale(.2)`,opacity:0}],450);}
 }
 function damage(target,amount,{strong=false,critical=false}={}){
  const p=point(target);p.y-=25;const el=node(`damage-number${strong?' strong':''}${critical?' critical':''}`,p,'');el.textContent=`${critical?'CRITICAL! ':''}-${amount}`;
  ephemeral(el,[{transform:'translate(-50%,0) scale(.6)',opacity:0},{transform:'translate(-50%,-12px) scale(1.15)',opacity:1,offset:.2},{transform:`translate(-50%,${reduced()?-22:-50}px)`,opacity:0}],850);
 }
 function shake(size){if(!size||reduced())return;const x=size==='medium'?4:2;animate(document.getElementById('character-layer'),[0,-x,x,-x,0].map(n=>({transform:`translateX(${n}px)`})),{duration:220});}
 function hit(target,heavy=false){return animate(target,[{filter:'brightness(2)',transform:'translateX(0)'},{filter:'brightness(1.5)',transform:`translateX(${heavy?12:6}px) scale(.87,1.08)`},{filter:'brightness(1)',transform:'translateX(0)'}],{duration:320});}
 async function death(target){await wait(90);burst(target,'ultimateHit','#fff4b0');await animate(target,[{opacity:1,filter:'brightness(2)',transform:'scale(1)'},{opacity:1,transform:'scale(1.2,.5)',offset:.4},{opacity:0,transform:'scale(.3,.1) translateY(20px)'}],{duration:560,fill:'forwards'});}
 function reset(){['player-visual-box','slime-container'].forEach(id=>document.getElementById(id).getAnimations().forEach(a=>{if(typeof CSSAnimation==='undefined'||!(a instanceof CSSAnimation))a.cancel();}));document.getElementById('effect-layer').replaceChildren();}
 function trail(target,kind,color,flip=false){const el=node(`attack-trail ${kind}`,point(target),color);ephemeral(el,[{transform:`translate(-50%,-50%) rotate(${flip?-50:35}deg) scale(.3)`,opacity:1},{transform:`translate(-50%,-50%) rotate(${flip?30:-35}deg) scale(1.3)`,opacity:0}],260);}
 async function projectile(hero,enemy,c){const from=point(document.getElementById("battle-hero-weapon-icon")),to=point(enemy);from.y-=18;const el=node(`projectile ${c.projectile}`,from,c.color);await ephemeral(el,[{transform:'translate(-50%,-50%)',opacity:1},{transform:`translate(${to.x-from.x}px,${to.y-from.y}px)`,opacity:1}],c.impactDelay-230);}
 return{wait,animate,point,burst,damage,shake,hit,death,reset,trail,projectile,reduced};
})();
const WeaponAnimationSystem={
 async attack(weapon,applyDamage){
  const c=weapon.animation,fx=BattleEffects,hero=document.getElementById('player-visual-box'),enemy=document.getElementById('slime-container'),hand=document.getElementById('battle-hero-weapon-icon');
  let impactSound=()=>{};safePlayAudio(()=>{impactSound=WeaponAudio.start(audioCtx,c);});
  const distance=fx.reduced()?0:Math.max(0,fx.point(enemy).x-fx.point(hero).x-65)*c.reach;
  const poses={slash:[0,-5,distance,distance,0],heavy:[0,-8,distance,distance,0],thrust:[0,-10,distance,0,0],cast:[0,0,0,0,0],bow:[0,0,0,0,0],ultimate:[0,-8,distance,distance,0]};
  const movement=fx.animate(hero,poses[c.type].map((x,i)=>({transform:`translateX(${x}px) scale(${i===1?.97:1})`,offset:[0,.2,c.impactDelay/c.duration,.82,1][i]})),{duration:c.duration,easing:'ease-in-out'});
  hand.dataset.attacking=c.type;
  const posesByType={slash:[[0,-12,0],[.28,-65,-4],[.53,68,8],[.76,80,4],[1,-12,0]],heavy:[[0,-18,0],[.30,-100,-7],[.50,92,10],[.72,100,6],[1,-18,0]],thrust:[[0,55,0],[.28,80,-9],[.52,90,22],[.72,90,10],[1,55,0]],cast:[[0,-12,0],[.25,-28,-8],[.50,12,-10],[.70,22,-7],[1,-12,0]],bow:[[0,0,0],[.28,-8,-4],[.42,-8,-6],[.72,5,0],[1,0,0]],ultimate:[[0,-18,0],[.24,-65,-4],[.34,75,10],[.48,-75,0],[.68,105,14],[.83,100,7],[1,-18,0]]};
  const swing=fx.animate(hand,posesByType[c.type].map(([offset,r,x])=>({offset,transform:'translateX('+(fx.reduced()?0:x)+'px) rotate('+(fx.reduced()?r*.15:r)+'deg)'})),{duration:c.duration,easing:'ease-in-out'});
  const string=hand.querySelector('.bow-string');
  const draw=string?fx.animate(string,[{transform:'translateX(0)'},{transform:'translateX(-8px)',offset:.28},{transform:'translateX(-8px)',offset:230/c.duration},{transform:'translateX(2px)',offset:.42},{transform:'translateX(0)'}],{duration:c.duration}):Promise.resolve();
  if(c.projectile){fx.burst(hand,'magicHit',c.color);await fx.wait(230);await fx.projectile(hero,enemy,c);}
  else{if(c.type==='ultimate'){fx.burst(hand,'magicHit',c.color);await fx.wait(350);fx.trail(enemy,c.effect,c.color);await fx.wait(170);fx.trail(enemy,c.effect,c.color,true);await fx.wait(c.impactDelay-520);}else await fx.wait(c.impactDelay);fx.trail(enemy,c.effect,c.color);}
  applyDamage();impactSound();fx.hit(enemy,c.hitEffect!=='smallHit');fx.shake(c.shake);fx.burst(enemy,c.hitEffect,c.color);fx.damage(enemy,weapon.dmg,{strong:weapon.dmg>=65});await Promise.all([movement,swing,draw]);delete hand.dataset.attacking;
 },
 async enemyAttack(applyDamage){const fx=BattleEffects,enemy=document.getElementById('slime-container'),hero=document.getElementById('player-visual-box'),d=fx.reduced()?0:Math.max(0,fx.point(enemy).x-fx.point(hero).x-50);
  const motion=fx.animate(enemy,[{transform:'translateX(0)'},{transform:'translateX(8px) scale(1.15,.8)',offset:.25},{transform:`translateX(-${d}px)`,offset:.5},{transform:'translateX(0)'}],{duration:650});await fx.wait(325);applyDamage();fx.animate(hero,[{filter:'brightness(2)',transform:'translateX(-7px)'},{filter:'brightness(1)',transform:'translateX(0)'}],{duration:300});fx.burst(hero,'smallHit','#ffb38c');fx.damage(hero,20);fx.shake('small');await motion;
 }
};

