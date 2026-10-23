// Shared pause gate; each skill owns cancellable waits and animations.
const BossSkillTiming=(()=>{
 const scopes=new Set();let depth=0,epoch=0;
 function create(){
  const waits=new Set(),animations=new Set();
  function schedule(task){task.started=performance.now();task.id=setTimeout(()=>{waits.delete(task);task.resolve(true);},task.remaining);}
  const scope={
   wait(ms){return new Promise(resolve=>{const task={remaining:ms,resolve,id:null,started:0};waits.add(task);if(!depth)schedule(task);});},
   async animate(el,frames,options){const a=el.animate(frames,options);animations.add(a);if(depth)a.pause();try{await a.finished;return true;}catch{return false;}finally{animations.delete(a);}},
   pause(){for(const task of waits){if(task.id!==null){clearTimeout(task.id);task.remaining=Math.max(0,task.remaining-(performance.now()-task.started));task.id=null;}}for(const a of animations)a.pause();},
   resume(){for(const task of waits)if(task.id===null)schedule(task);for(const a of animations)a.play();},
   cancel(){for(const task of waits){clearTimeout(task.id);task.resolve(false);}waits.clear();for(const a of animations)a.cancel();animations.clear();}
  };scopes.add(scope);return scope;
 }
 function pause(){const token=epoch;if(depth++===0)for(const scope of scopes)scope.pause();let released=false;return()=>{if(released||token!==epoch)return;released=true;if(--depth===0)for(const scope of scopes)scope.resume();};}
 function reset(){epoch++;depth=0;for(const scope of scopes)scope.cancel();}
 return{create,pause,reset,get paused(){return depth>0;}};
})();
