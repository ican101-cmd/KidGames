// Dedicated two-choice finishers: one extra reasoning step, still mental-arithmetic friendly.
const TopicUltimates=(()=>{
 const r=(a,b)=>a+Math.floor(Math.random()*(b-a+1)),pick=a=>a[r(0,a.length-1)];
 function shuffle(a){a=[...a];for(let i=a.length-1;i;i--){const j=r(0,i);[a[i],a[j]]=[a[j],a[i]];}return a;}
 const gcd=(a,b)=>b?gcd(b,a%b):a,lcm=(a,b)=>a/gcd(a,b)*b,range=(a,b)=>Array.from({length:Math.max(0,b-a+1)},(_,i)=>a+i),fraction=(a,b)=>a+'/'+b;
 function finish(type,prompt,answer,wrong,explanation,meta={}){const alternatives=[...new Map(wrong.filter(v=>String(v)!==String(answer)).map(v=>[String(v),v])).values()];if(!alternatives.length)throw Error('No ultimate distractor');return{type,prompt,answer,options:shuffle([answer,pick(alternatives)]),explanation,meta,numbers:meta.numbers||[]};}
 const numericWrong=n=>[n+1,n+2,n-1].filter(v=>v>=0);
 const factorPool=[];for(let n=10;n<=99;n++)for(let a=3;a<n;a++)if(n%a===0){const low=Math.max(1,a-3),high=a+3,wrong=range(low+1,high-1).filter(v=>n%v!==0);if(wrong.length)factorPool.push({n,a,low,high,wrong});}
 const sharePool=[];for(let a=6;a<=48;a++)for(let b=a+1;b<=60;b++){const g=gcd(a,b);if(g>=2&&a/g<=8&&b/g<=10)sharePool.push({a,b,g});}
 const periodPool=[];for(let a=2;a<=12;a++)for(let b=a+1;b<=12;b++){const common=lcm(a,b);if(common<=60)periodPool.push({a,b,common});}
 function factors(mode,stage,{short}){
  if(mode==='easy'){
   if(r(0,1)===0){const {n,a,low,high,wrong}=pick(short?factorPool.filter(p=>p.n<=50&&[3,4,5,10].includes(p.a)):factorPool);return finish('ult-factor-range',n+' 的因數中，大於 '+low+'、小於 '+high+' 的是哪個？',a,wrong,n+' 能被 '+a+' 整除，且 '+a+' 符合範圍。',{numbers:[n],low,high});}
   const base=r(10,short?20:50),limit=r(1,short?2:4)*base,answer=limit+base;return finish('ult-multiple-after','大於 '+limit+' 的 '+base+' 倍數中，最小是多少？',answer,[limit,answer+base,answer-1],base+' 的倍數每次增加 '+base+'；超過 '+limit+' 的第一個是 '+answer+'。',{numbers:[base],limit});
  }
  if(mode==='medium'){const {a,b,g}=pick(short?sharePool.filter(p=>p.a<=24&&p.b<=24&&p.g>=3&&p.a/p.g<=4):sharePool);const answer=a/g;return finish('ult-gcd-share',a+' 蘋果、'+b+' 梨最多分成相同禮盒，每盒蘋果幾顆？',answer,[g,b/g,...numericWrong(answer)],'先求最大公因數 '+g+'，可分 '+g+' 盒；每盒蘋果 '+a+'÷'+g+'＝'+answer+' 顆。',{numbers:[a,b]});}
  const {a,b,common}=pick(short?periodPool.filter(p=>p.common<=24):periodPool),limit=common*r(short?0:1,short?1:2)+r(1,Math.min(5,common-1)),answer=(Math.floor(limit/common)+1)*common;
  return finish('ult-lcm-after','大於 '+limit+' 的 '+a+'、'+b+' 公倍數中，最小是多少？',answer,[common,answer+common,limit+1,...numericWrong(answer)],'先找最小公倍數 '+common+'；它的倍數中，第一個超過 '+limit+' 的是 '+answer+'。',{numbers:[a,b],limit});
 }
 function fractions(mode,stage,{short}){
  let b=r(2,short?4:6),a=r(1,b-1);const g=gcd(a,b);a/=g;b/=g;
  if(mode==='easy'){const k=short?2:r(2,3),j=2,answer=a*k;return finish('ult-fraction-chain',fraction(a,b)+'＝□/'+b*k+'＝'+fraction(a*k*j,b*k*j)+'，□是多少？',String(answer),numericWrong(answer).map(String),'先由 '+fraction(a,b)+' 擴分 '+k+' 倍，空格是 '+answer+'；再擴分 '+j+' 倍仍等值。',{a,b,k,j});}
  if(mode==='medium'){const k=short?2:r(2,3),d=b*(k+1),answer=a*(k+1);return finish('ult-fraction-reverse',fraction(a*k,b*k)+'＝□/'+d+'，□是多少？',String(answer),numericWrong(answer).map(String),'先約成 '+fraction(a,b)+'，再擴分成 '+fraction(answer,d)+'。',{a:a*k,b:b*k,d});}
  if(short||r(0,1)===0){const d=b*(short?2:r(2,4)),filled=a*d/b,other=Math.max(1,filled+pick([-2,-1,0,1,2])),answer=filled>other?'＞':filled<other?'＜':'＝';return finish('ult-fraction-fill-compare',fraction(a,b)+'＝□/'+d+'；□ 與 '+other+' 比較應填？',answer,['＞','＜','＝'].filter(v=>v!==answer),'先算出 □＝'+filled+'，再比較 '+filled+' 與 '+other+'。',{a,b,d,other});}
  const denominator=pick([12,18,24]),divisors=range(2,8).filter(d=>denominator%d===0),candidates=[];for(const d of divisors)for(let n=1;n<d;n++)candidates.push({n,d,value:n*denominator/d});const unique=[...new Map(shuffle(candidates).map(v=>[v.value,v])).values()],items=shuffle(unique).slice(0,3),largest=r(0,1)===0,sorted=[...items].sort((x,y)=>x.value-y.value),correct=largest?sorted[2]:sorted[0],answer=fraction(correct.n,correct.d);
  return finish('ult-fraction-order',items.map(v=>fraction(v.n,v.d)).join('、')+'，哪個'+(largest?'最大':'最小')+'？',answer,items.filter(v=>v!==correct).map(v=>fraction(v.n,v.d)),'通分成分母 '+denominator+' 後比較分子，答案是 '+answer+'。',{items,denominator,largest});
 }
 const SCALE=100000;
 function format(ticks){const whole=Math.floor(ticks/SCALE),tail=String(ticks%SCALE).padStart(5,'0').replace(/0+$/,'');return whole+(tail?'.'+tail:'');}
 function decimals(mode,stage,{short}){let terms,ops;
  if(mode==='boss'){const base=short?r(1,3)*SCALE+pick([25000,50000,75000]):r(1,4)*SCALE+50000,quarter=short?pick([25000,50000]):pick([25000,50000,75000]);terms=[base,quarter,SCALE-quarter];ops=['-','+'];}
  else{const pair=mode==='easy'?pick([[20000,80000],[30000,70000],[40000,60000],[50000,50000]]):pick([[25000,75000],[20000,80000],[40000,60000]]),last=r(1,short?5:9)*10000;terms=shuffle([...pair,last]);ops=['+','+'];}
  const ticks=terms.slice(1).reduce((sum,v,i)=>ops[i]==='+'?sum+v:sum-v,terms[0]),answer=format(ticks),prompt=format(terms[0])+ops.map((op,i)=>(op==='+'?'＋':'－')+format(terms[i+1])).join('')+'＝？';
  return finish(mode==='boss'?'ult-decimal-two-step':'ult-decimal-three-sum',prompt,answer,[ticks+10000,ticks-10000,ticks+50000].filter(v=>v>=0).map(format),mode==='boss'?'先算減去 '+format(terms[1])+' 再加 '+format(terms[2])+' 的合計變化，再與第一個數合併。':'先找出能湊成 1 的兩個數，再加剩下的數。',{terms,ops,scale:SCALE});
 }
 const generators={factors,fractions,decimals};
 function make(topic,mode,stage=1,{short=false}={}){const generator=generators[topic];if(!generator)throw Error('Unsupported ultimate topic');return generator(mode,stage,{short});}
 return{make};
})();
