// Bounded question pools guarantee one valid choice, including factor/multiple predicates.
const MathQuestions=(()=>{
 const random=(min,max)=>min+Math.floor(Math.random()*(max-min+1));
 const pick=items=>items[random(0,items.length-1)];
 function shuffle(items){const a=[...items];for(let i=a.length-1;i>0;i--){const j=random(0,i);[a[i],a[j]]=[a[j],a[i]];}return a;}
 function gcd(a,b){while(b){[a,b]=[b,a%b];}return a;}
 const lcm=(a,b)=>a/gcd(a,b)*b;
 const common=(numbers,operation)=>numbers.reduce(operation);
 const range=(a,b)=>Array.from({length:b-a+1},(_,i)=>i+a);
 const cache=new Map();
 function pairs(kind,stage,ultimate){const slot=[kind,stage,ultimate].join(':');if(cache.has(slot))return cache.get(slot);const max=ultimate?(kind==='gcd'?24:10):kind==='gcd'?[24,30,40,50,60][stage-1]:[12,14,16,18,20][stage-1],min=kind==='gcd'&&!ultimate?6:2,items=[];for(let a=min;a<=max;a++)for(let b=a+1;b<=max;b++){const numbers=[a,b],g=gcd(a,b);if(!ultimate&&stage<=2&&b%a!==0)continue;if(!ultimate&&stage>=3&&stage<=4&&(g===1||b%a===0))continue;const candidates=ultimate?range(2,kind==='gcd'?18:10):[null];for(const c of candidates){const nums=c?[...numbers,c]:numbers;const answer=common(nums,kind==='gcd'?gcd:lcm);if(kind==='lcm'&&answer>(ultimate?60:120))continue;if(ultimate&&kind==='gcd'&&answer===1)continue;items.push({numbers:nums,answer});}}cache.set(slot,items);return items;}
 function choices(answer,valid,count,cap,preferred=[]){const plausible=shuffle([...new Set(preferred)].filter(n=>Number.isInteger(n)&&n>0&&n<=cap&&!valid(n))),chosen=plausible.slice(0,1);const rest=shuffle(range(1,cap).filter(n=>!valid(n)&&!chosen.includes(n)));return shuffle([answer,...chosen,...rest.slice(0,count-1-chosen.length)]);}

 function make(mode,stage=1,ultimate=false){stage=Math.max(1,Math.min(5,stage));const count=ultimate?2:3;let type,numbers,answer,prompt,explanation,valid,cap=120,preferred=[];
  if(mode==='easy'){
   if(ultimate){type='common-factor';const pool=pairs('gcd',1,false).filter(p=>p.numbers[1]<=24&&p.answer>1);numbers=pick(pool).numbers;const g=common(numbers,gcd);answer=pick(range(1,g).filter(n=>g%n===0));valid=n=>numbers.every(a=>a%n===0);prompt='哪個是 '+numbers.join('、')+' 的公因數？';explanation=numbers.map(n=>n+' ÷ '+answer+' = '+n/answer).join('；')+'，都沒有餘數，所以 '+answer+' 是公因數。';cap=50;}
   else if(random(0,1)===0){type='factor';const target=random(6,[20,25,36,42,50][stage-1]);numbers=[target];answer=pick(range(1,target).filter(n=>target%n===0));valid=n=>target%n===0;prompt='哪個是 '+target+' 的因數？';explanation=target+' ÷ '+answer+' = '+target/answer+'，沒有餘數，所以 '+answer+' 是 '+target+' 的因數。';cap=50;}
   else{type='multiple';const base=random(2,[5,6,8,10,12][stage-1]);numbers=[base];answer=base*random(1,Math.floor(100/base));valid=n=>n%base===0;prompt='哪個是 '+base+' 的倍數？';explanation=base+' × '+answer/base+' = '+answer+'，所以 '+answer+' 是 '+base+' 的倍數。';cap=100;}
  }else{type=mode==='medium'?'gcd':'lcm';let pool=pairs(type,stage,ultimate);if(stage===5&&!ultimate){const mutualPrime=random(0,2)===0;pool=pool.filter(p=>mutualPrime?gcd(...p.numbers)===1:gcd(...p.numbers)>1&&p.numbers[1]%p.numbers[0]!==0);}({numbers,answer}=pick(pool));valid=n=>n===answer;const label=type==='gcd'?'最大公因數':'最小公倍數';prompt=numbers.join('、')+' 的'+label+'是哪個？';if(type==='gcd'){const factors=range(1,Math.min(...numbers)).filter(n=>numbers.every(a=>a%n===0));explanation='共同因數有 '+factors.join('、')+'；最大的是 '+answer+'。';preferred=[1,Math.min(...numbers),...numbers];}else{explanation=numbers.map(n=>n+' × '+answer/n+' = '+answer).join('；')+'，'+answer+' 是最小的共同倍數。';preferred=[common(numbers,gcd),Math.max(...numbers),numbers.reduce((a,b)=>a*b,1)];}}
  return{type,numbers,answer,prompt,explanation,options:choices(answer,valid,count,cap,preferred)};
 }
 return{make,gcd,lcm};
})();
