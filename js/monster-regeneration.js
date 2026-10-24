// A single cancellable, half-HP-latched timer per monster encounter.
const MonsterRegeneration=(()=>{
 let timer=null,generation=0;
 function stop(){generation++;clearTimeout(timer);timer=null;}
 function amount(damage){return Math.max(10,Math.min(20,Math.round((Number(damage)||0)*.3)));}
 function observe(hp,max,{eligible,valid,restore,weaponDamage=25}){
  if(!eligible||hp<=0){stop();return;}
  if(timer!==null||hp>max/2)return;
  if(!valid())return;
  const token=++generation;
  function tick(){if(token!==generation)return;if(!valid()){stop();return;}timer=setTimeout(tick,5000);if(!document.hidden)restore(amount(weaponDamage));}
  // Arm the timer before restore(), whose HP-bar update re-enters observe().
  timer=setTimeout(tick,5000);
  restore(amount(weaponDamage),{awakening:true});
 }
 return{amount,observe,stop,get running(){return timer!==null;}};
})();
