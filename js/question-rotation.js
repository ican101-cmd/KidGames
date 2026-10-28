// Session-only recent questions: no changes to player saves or question difficulty.
const QuestionRotation=(()=>{
 const histories=new Map(),windowSize=12,maxAttempts=32;
 function choose(topic,mode,make){const key=topic+':'+mode,history=histories.get(key)||[];let best=null,bestPenalty=Infinity;
  for(let attempt=0;attempt<maxAttempts;attempt++){
   const q=make(),prompt=q.prompt.replace(/\s+/g,''),last=history.slice(-windowSize),duplicate=last.some(h=>h.prompt===prompt),concept=q.type==='concept'||q.type==='error',recentConcept=concept&&history.slice(-8).some(h=>h.type===q.type),streak=history.length>=2&&history.slice(-2).every(h=>h.type===q.type);
   const lastIndex=history.findLastIndex(h=>h.prompt===prompt),penalty=(duplicate?100+lastIndex:0)+(recentConcept?30:0)+(streak?10:0);
   if(penalty<bestPenalty){best={q,prompt};bestPenalty=penalty;}
   if(penalty===0)break;
  }
  // A tiny or deterministic source may exhaust its pool. Bounded fallback must never stall battle.
  history.push({prompt:best.prompt,type:best.q.type});if(history.length>32)history.shift();histories.set(key,history);return best.q;
 }
 return{choose};
})();
