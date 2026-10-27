// Topics share equipment/currency but own their chapter and expedition progress.
const MathTopics=(()=>{
 const storage='fruit_math_topics_v1';
 const definitions={
  arithmetic:{name:'加減法',lessons:{easy:'個位數加減',medium:'11～20 加減',boss:'雙位數加減'}},
  factors:{name:'因數與倍數',lessons:{easy:'因數與倍數',medium:'最大公因數',boss:'最小公倍數'}},
  fractions:{name:'擴分、約分與通分',lessons:{easy:'等值分數',medium:'約分與基本通分',boss:'通分比較與應用'}},
  decimals:{name:'多位小數與加減',lessons:{easy:'小數觀念',medium:'小數心算',boss:'小數考題應用'}}
 };
 const ids=Object.freeze(Object.keys(definitions));let current='arithmetic',profiles={};
 function key(base,topic=current){return topic==='arithmetic'?base:base+'_'+topic;}
 function normalized(raw){return{adventure:Adventure.normalize(raw?.adventure),bossUnlocked:raw?.bossUnlocked===true};}
 function snapshot(player){return normalized(player);}
 function apply(player){const p=normalized(profiles[current]);player.adventure=p.adventure;player.bossUnlocked=p.bossUnlocked;}
 function init(player){profiles.arithmetic=snapshot(player);let stored;try{stored=JSON.parse(localStorage.getItem(storage));}catch{}for(const topic of ids.filter(t=>t!=='arithmetic'))profiles[topic]=normalized(stored?.[topic]);current=ids.includes(stored?.selected)?stored.selected:'arithmetic';apply(player);}
 function persist(player){profiles[current]=snapshot(player);const record={version:1,selected:current};for(const topic of ids.filter(t=>t!=='arithmetic'))record[topic]=profiles[topic];localStorage.setItem(storage,JSON.stringify(record));if(current==='arithmetic'){localStorage.setItem('fruit_adventure_v1',JSON.stringify(player.adventure));localStorage.setItem('fruit_boss',player.bossUnlocked);}}
 function select(topic,player){if(!ids.includes(topic)||topic===current)return false;persist(player);current=topic;apply(player);persist(player);return true;}
 function exportState(player){profiles[current]=snapshot(player);return{version:1,selected:current,...Object.fromEntries(ids.map(t=>[t,normalized(profiles[t])]))};}
 function importState(raw,player){if(raw?.mathTopics?.version===1){const state=raw.mathTopics;profiles=Object.fromEntries(ids.map(t=>[t,normalized(state[t])]));current=ids.includes(state.selected)?state.selected:'arithmetic';}else{profiles=Object.fromEntries(ids.map(t=>[t,normalized(t==='arithmetic'?{adventure:raw?.adventure,bossUnlocked:raw?.bossUnlocked}:null)]));current='arithmetic';}apply(player);localStorage.setItem('fruit_adventure_v1',JSON.stringify(profiles.arithmetic.adventure));localStorage.setItem('fruit_boss',profiles.arithmetic.bossUnlocked);persist(player);}
 function reset(player){current='arithmetic';profiles=Object.fromEntries(ids.map(t=>[t,normalized()]));apply(player);persist(player);}
 function name(topic=current){return(definitions[topic]||definitions.arithmetic).name;}
 function lesson(mode,topic=current){return(definitions[topic]||definitions.arithmetic).lessons[mode];}
 function seconds(base,mode){return current==='arithmetic'?base:Math.floor(base*({easy:1.2,medium:1.4,boss:1.5}[mode]||1));}
 return{ids,init,persist,select,exportState,importState,reset,key,name,lesson,seconds,get current(){return current;}};
})();
