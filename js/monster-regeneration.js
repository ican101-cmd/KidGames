// A single cancellable, half-HP-latched timer per monster encounter.
const MonsterRegeneration=(()=>{
 let timer=null,generation=0;
 function stop(){generation++;clearTimeout(timer);timer=null;}
 function observe(hp,max,{eligible,valid,restore}){
  if(!eligible||hp<=0){stop();return;}
  if(timer!==null||hp>max/2)return;
  const token=++generation;
  function tick(){if(token!==generation)return;if(!valid()){stop();return;}timer=setTimeout(tick,5000);if(!document.hidden)restore(10);}
  timer=setTimeout(tick,5000);
 }
 return{observe,stop,get running(){return timer!==null;}};
})();
