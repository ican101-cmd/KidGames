// Original weapon-specific ultimate visuals. All nodes/animations are temporary.
const UltimateVFX=(()=>{
 const sessions=new Set();
 const boltPath='M3 42 30 30 45 48 67 19 81 38 104 17 119 33 142 8 157 28 186 12 211 26 237 10';
 function start(profile,c,hero,enemy,distance,motionXs=null){
  const fx=BattleEffects,layer=document.getElementById('effect-layer'),origin=fx.point(hero),reduced=fx.reduced(),nodes=new Set(),timers=new Map();let cancelled=false;
  function node(cls,p){const el=document.createElement('div');el.className='weapon-ultimate-vfx '+cls;el.dataset.ultimateStyle=profile.style;Object.assign(el.style,{left:p.x+'px',top:p.y+'px'});el.style.setProperty('--skill-color',profile.color);el.style.setProperty('--skill-accent',profile.accent);layer.appendChild(el);nodes.add(el);return el;}
  function remove(el){el.remove();nodes.delete(el);}
  function play(el,frames,duration,delay=0){const animation=el.animate(frames,{duration,delay,fill:'forwards',easing:'ease-out'});animation.finished.catch(()=>{}).finally(()=>remove(el));return animation;}
  function later(callback,ms){const id=setTimeout(()=>{timers.delete(id);if(!cancelled)callback();},ms);timers.set(id,true);}
  function cancel(){cancelled=true;for(const id of timers.keys())clearTimeout(id);timers.clear();for(const el of nodes){el.getAnimations().forEach(a=>a.cancel());el.remove();}nodes.clear();sessions.delete(api);}
  const api={impact,cancel};sessions.add(api);
  const aura=node('ultimate-aura aura-'+profile.style,origin);
  const offsets=[0,.2,c.impactDelay/c.duration,.82,1],xs=motionXs||[0,-7,distance,distance,0];
  play(aura,offsets.map((offset,i)=>({offset,transform:'translate(calc(-50% + '+(reduced?0:xs[i])+'px),-50%) scale('+(i===1?.85:1.1)+')',opacity:i===0||i===4?0:reduced?.3:.75})),c.duration);
  if(reduced){later(cancel,c.duration+550);return api;}
  if(profile.style==='flame'||profile.style==='lightning'||profile.style==='thunder'||profile.style==='crystal'){
   const width=Math.min(Math.max(80,distance+55),layer.clientWidth-origin.x-5),trace=node('ultimate-dash-trace trace-'+profile.style,{x:origin.x-15,y:origin.y+8});trace.style.width=width+'px';
   if(profile.style!=='flame')trace.innerHTML='<svg viewBox="0 0 240 64" preserveAspectRatio="none" aria-hidden="true"><path d="'+boltPath+'" fill="none" stroke="var(--skill-color)" stroke-width="7"/><path d="'+boltPath+'" fill="none" stroke="#fff9e9" stroke-width="2"/></svg>';
   play(trace,[{transform:'translateY(-50%) scaleX(.1)',opacity:0},{transform:'translateY(-50%) scaleX(.25)',opacity:.8,offset:.22},{transform:'translateY(-50%) scaleX(1)',opacity:1,offset:c.impactDelay/c.duration},{transform:'translateY(-50%) scaleX(1.08)',opacity:0}],c.duration);
   for(let i=0;i<7;i++){const spark=node('ultimate-dash-particle particle-'+profile.style,{x:origin.x+distance*(i/7),y:origin.y+22-(i%3)*13});play(spark,[{transform:'translate(0,0) scale(.2)',opacity:0},{transform:'translate(-5px,-4px) scale(1)',opacity:1,offset:.3},{transform:'translate(-23px,-28px) scale(.2)',opacity:0}],320,Math.round(c.impactDelay*.25+i*c.impactDelay*.07));}
  }else{
   const rune=node('ultimate-rune rune-'+profile.style,{x:origin.x,y:origin.y+44});play(rune,[{transform:'translate(-50%,-50%) rotate(0) scale(.3)',opacity:0},{transform:'translate(-50%,-50%) rotate(55deg) scale(1)',opacity:.9,offset:.3},{transform:'translate(-50%,-50%) rotate(110deg) scale(1.2)',opacity:0}],c.duration);
  }
  if(profile.style==='crystal')for(let i=0;i<2;i++){const ghost=node('ultimate-afterimage',origin),clone=hero.querySelector('.hero-base-svg').cloneNode(true);clone.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));ghost.appendChild(clone);const rect=hero.getBoundingClientRect();ghost.style.width=rect.width+'px';ghost.style.height=rect.height+'px';play(ghost,[{transform:'translate(-50%,-50%)',opacity:0},{transform:'translate(calc(-50% + '+Math.max(0,distance-24-i*16)+'px),-50%)',opacity:.26,offset:c.impactDelay/c.duration},{transform:'translate(calc(-50% + '+distance+'px),-50%)',opacity:0}],c.duration);}
  later(cancel,c.duration+650);
  function impact(){if(cancelled)return;const p=fx.point(enemy),ring=node('ultimate-element-impact impact-'+profile.style,p);play(ring,[{transform:'translate(-50%,-50%) scale(.2) rotate(-20deg)',opacity:reduced?.3:1},{transform:'translate(-50%,-50%) scale(1.4) rotate(20deg)',opacity:0}],420);
   if(!reduced)for(let i=0;i<8;i++){const a=i*Math.PI/4,shard=node('ultimate-impact-shard shard-'+profile.style,p);play(shard,[{transform:'translate(-50%,-50%) scale(1)',opacity:1},{transform:'translate('+Math.cos(a)*60+'px,'+Math.sin(a)*48+'px) rotate(120deg) scale(.15)',opacity:0}],430);}
  }
  return api;
 }
 function cancelAll(){for(const session of [...sessions])session.cancel();}
 return{start,cancelAll};
})();
