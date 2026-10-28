// Exam-style concepts and short applications, with bounded pools and one valid option.
const MathQuestions=(()=>{
 const random=(min,max)=>min+Math.floor(Math.random()*(max-min+1)),pick=a=>a[random(0,a.length-1)],range=(a,b)=>Array.from({length:Math.max(0,b-a+1)},(_,i)=>a+i);
 function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=random(0,i);[a[i],a[j]]=[a[j],a[i]];}return a;}
 function gcd(a,b){while(b)[a,b]=[b,a%b];return a;}const lcm=(a,b)=>a/gcd(a,b)*b,divisors=n=>range(1,n).filter(d=>n%d===0),cache=new Map();
 function pairs(kind,stage,small=false){const key=[kind,stage,small].join(':');if(cache.has(key))return cache.get(key);const max=small?(kind==='gcd'?24:10):kind==='gcd'?[24,30,40,50,60][stage-1]:[12,14,16,18,20][stage-1],pool=[];for(let a=2;a<=max;a++)for(let b=a+1;b<=max;b++){const answer=kind==='gcd'?gcd(a,b):lcm(a,b);if(kind==='lcm'&&answer>(small?60:120))continue;if(!small&&stage<=2&&b%a!==0)continue;if(!small&&stage>=3&&stage<=4&&(gcd(a,b)===1||b%a===0))continue;pool.push({numbers:[a,b],answer});}cache.set(key,pool);return pool;}
 function finish(type,prompt,answer,explanation,meta,ultimate,valid=n=>n===answer,wrong=null){const count=ultimate?2:3,candidates=wrong||range(1,Math.max(120,Number(answer)+12));const choices=shuffle([...new Set(candidates)].filter(v=>!valid(v)));if(choices.length<count-1)throw Error('Insufficient factor choices');return{type,prompt,answer,explanation,meta,numbers:meta.numbers||[],options:shuffle([answer,...choices.slice(0,count-1)])};}
 function make(mode,stage=1,ultimate=false,{short=false}={}){stage=Math.max(1,Math.min(5,Math.floor(Number(stage)||1)));const roll=random(1,100),small=short||ultimate;let type;
  if(short)type=mode==='easy'?(roll<=50?'factor':'multiple'):mode==='medium'?'gcd':'lcm';
  else if(ultimate)type=mode==='easy'?pick(['factor','multiple','pack-factor']):mode==='medium'?pick(['gcd','pack-gcd','tile-gcd']):pick(['lcm','sync','group-lcm']);
  else if(mode==='easy')type=roll<=40?'factor':roll<=80?'multiple':roll<=85?'relationship':roll<=90?(random(0,1)?'divisible':'tail-multiple'):roll<=95?'pack-factor':'missing-factor';
  else if(mode==='medium')type=roll<=45?'gcd':roll<=70?(random(0,1)?'common-factor':'common-factor-range'):roll<=95?(stage<=2?'gcd':random(0,1)?'pack-gcd':'tile-gcd'):'factor-concept';
  else type=roll<=40?'lcm':roll<=60?(random(0,1)?'common-multiple':'multiple-sequence'):roll<=85?(stage<=2?'lcm':random(0,1)?'sync':'group-lcm'):'multiple-range';
  if(['factor','pack-factor','missing-factor'].includes(type)){
   const cap=type==='missing-factor'?48:[39,59,79,89,99][stage-1],pool=range(10,cap).filter(n=>!short||[2,3,5,10].some(d=>n%d===0)),target=pick(pool),list=divisors(target),nontrivial=list.filter(n=>n>1&&n<target),quick=list.filter(n=>[2,3,5,10].includes(n));
   const answer=short?pick(quick):pick(nontrivial.length&&random(1,10)<=9?nontrivial:list);
   if(type==='missing-factor'){const i=list.indexOf(answer),shown=list.map((n,j)=>j===i?'□':n).join('、');return finish(type,target+' 的因數：'+shown+'，□是多少？',answer,'依序找出能整除 '+target+' 的數，缺少的是 '+answer+'。',{numbers:[target],list,index:i},ultimate);}
   const prompt=type==='factor'?'哪個是 '+target+' 的因數？':target+' 顆蘋果平均裝袋，每袋幾顆能剛好裝完？';return finish(type,prompt,answer,target+' ÷ '+answer+'＝'+target/answer+'，沒有餘數，所以能剛好分完。',{numbers:[target]},ultimate,n=>Number.isInteger(n)&&n>0&&target%n===0,range(2,target));
  }
  if(type==='multiple'||type==='tail-multiple'){
   const base=type==='tail-multiple'?pick([10,20,25,50]):random(10,[20,30,40,50,50][stage-1]),times=random(1,short?3:[3,3,4,5,5][stage-1]),answer=base*times;
   const near=range(Math.max(1,answer-9),answer+9);return finish(type,'哪個是 '+base+' 的倍數？',answer,base+' × '+times+'＝'+answer+'，所以 '+answer+' 是 '+base+' 的倍數。',{numbers:[base],times},ultimate,n=>n>0&&n%base===0,near);
  }
  if(type==='relationship'){const a=random(2,9),b=random(2,9),product=a*b,isFactor=random(0,1)===0,answer=isFactor?'因數':'倍數';return finish(type,'已知 '+a+'×'+b+'＝'+product+'，'+(isFactor?a+' 是 '+product:product+' 是 '+a)+' 的什麼？',answer,'乘積是每個乘數的倍數；乘數是乘積的因數。',{numbers:[a,b],isFactor},ultimate,n=>n===answer,['因數','倍數','無法判斷']);}
  if(type==='divisible'){const d=random(2,9),q=random(2,9),answer=d*q+'÷'+d,wrong=[];for(let i=0;i<3;i++){const divisor=2+i,quotient=random(2,9);wrong.push((divisor*quotient+1)+'÷'+divisor);}return finish(type,'哪個算式可以整除（沒有餘數）？',answer,d*q+' ÷ '+d+'＝'+q+'，餘數為 0。',{numbers:[d*q,d]},ultimate,n=>n===answer,wrong);}
  if(type==='factor-concept'){const n=random(6,60),kind=random(0,2),answer=kind===0?1:n,prompt=kind===0?n+' 的最小正因數是多少？':kind===1?n+' 的最大因數是多少？':'哪個數同時是 '+n+' 的因數和正倍數？';return finish(type,prompt,answer,kind===0?'每個正整數都能被 1 整除。':'每個正整數都是自己的因數，也是自己的正倍數。',{numbers:[n],kind},ultimate);}
  const operation=mode==='medium'||type==='common-factor'?'gcd':'lcm';let pool=pairs(operation,stage,small);if(['pack-gcd','tile-gcd','common-factor-range'].includes(type))pool=pool.filter(p=>p.answer>1);const {numbers,answer:extreme}=pick(pool),[a,b]=numbers;
  if(type==='gcd'||type==='lcm'){const answer=extreme;return finish(type,numbers.join('、')+' 的'+(type==='gcd'?'最大公因數':'最小公倍數')+'是哪個？',answer,type==='gcd'?'共同因數有 '+divisors(answer).join('、')+'，最大是 '+answer+'。':a+'×'+answer/a+'＝'+answer+'；'+b+'×'+answer/b+'＝'+answer+'，這是最小的正公倍數。',{numbers},ultimate);}
  if(type==='common-factor'||type==='common-factor-range'){const answer=pick(divisors(extreme).filter(n=>type!=='common-factor-range'||n>1)),low=Math.max(0,answer-2),high=answer+2;return finish(type,type==='common-factor'?numbers.join('、')+' 的公因數是哪個？':numbers.join('、')+' 的公因數中，大於 '+low+'、小於 '+high+' 的是哪個？',answer,a+'、'+b+' 都能被 '+answer+' 整除'+(type==='common-factor-range'?'，且符合範圍。':'。'),{numbers,low,high},ultimate,n=>n>0&&a%n===0&&b%n===0&&(type!=='common-factor-range'||n>low&&n<high));}
  if(type==='pack-gcd'||type==='tile-gcd'){const prompt=type==='pack-gcd'?a+' 顆蘋果、'+b+' 顆梨子分成相同禮盒，全分完，最多幾盒？':a+'×'+b+' 公分紙片剪成相同正方形，全剪完，最大整數邊長幾公分？';return finish(type,prompt,extreme,'兩個數都要能整除，問'+(type==='pack-gcd'?'最多盒數':'最大邊長')+'，所以找最大公因數 '+extreme+'。',{numbers},ultimate);}
  if(type==='common-multiple'){const answer=extreme*random(1,3);return finish(type,numbers.join('、')+' 的正公倍數是哪個？',answer,answer+' 能被 '+a+' 和 '+b+' 整除，所以是公倍數。',{numbers},ultimate,n=>n>0&&n%a===0&&n%b===0);}
  if(type==='multiple-sequence'){return finish(type,numbers.join('、')+' 的正公倍數由小到大：'+extreme+'、'+extreme*2+'、□，□是多少？',extreme*3,'正公倍數是最小公倍數 '+extreme+' 的 1、2、3…倍。',{numbers,index:3},ultimate);}
  if(type==='multiple-range'){const answer=extreme*random(1,3),low=Math.max(0,answer-random(1,Math.min(extreme-1,9))),high=answer+random(1,Math.min(extreme-1,9));return finish(type,'大於 '+low+'、小於 '+high+'，且是 '+a+'、'+b+' 的公倍數，數字是多少？',answer,'先找最小公倍數 '+extreme+'，其倍數中只有 '+answer+' 符合這個範圍。',{numbers,low,high},ultimate);}
  const prompt=type==='sync'?'兩燈每 '+a+'、'+b+' 秒閃一次，現在同閃，下次同閃是幾秒後？':'每 '+a+' 人一組或每 '+b+' 人一組都剛好分完，最少有幾人？';return finish(type,prompt,extreme,'兩種週期或分組都要符合，找最小公倍數 '+extreme+'。',{numbers},ultimate);
 }
 return{make,gcd,lcm};
})();
