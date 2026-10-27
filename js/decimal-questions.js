// Exact decimal arithmetic: all quantities use integer hundred-thousandths.
const DecimalQuestions=(()=>{
 const SCALE=100000,places=['十分位','百分位','千分位','萬分位','十萬分位'],digits='零一二三四五六七八九';
 const rand=(a,b)=>a+Math.floor(Math.random()*(b-a+1)),pick=a=>a[rand(0,a.length-1)];
 function shuffle(items){const a=[...items];for(let i=a.length-1;i>0;i--){const j=rand(0,i);[a[i],a[j]]=[a[j],a[i]];}return a;}
 function format(ticks,precision=null){const whole=Math.floor(ticks/SCALE),fraction=String(ticks%SCALE).padStart(5,'0');if(precision===0)return String(whole);const tail=precision===null?fraction.replace(/0+$/,''):fraction.slice(0,precision);return String(whole)+(tail?'.'+tail:'');}
 function parse(text){if(!/^\d+(\.\d{1,5})?$/.test(String(text)))return null;const [a,b='']=String(text).split('.');return Number(a)*SCALE+Number(b.padEnd(5,'0'));}
 function canonical(text){const value=parse(text);return value===null?'text:'+text:'number:'+value;}
 const rounded=(ticks,p)=>{const unit=10**(5-p);return Math.floor((ticks+unit/2)/unit)*unit;};
 function numericWrong(ticks,unit=1000){return[ticks+unit,ticks-unit,ticks+unit*10,ticks-unit*10,ticks*10,...(ticks%10===0?[ticks/10]:[])].filter(n=>Number.isSafeInteger(n)&&n>=0).map(n=>format(n));}
 function finish(type,prompt,ticks,explanation,meta={},wrong=[],{answer=null,precision=null,count=3}={}){
  const correct=answer===null?format(ticks,precision):String(answer),seen=new Set([canonical(correct)]),candidates=[];
  const fallback=ticks===null?[]:[...numericWrong(ticks),...Array.from({length:40},(_,i)=>format(i*5000))];
  for(const value of [...wrong]){const text=String(value),key=canonical(text);if(!seen.has(key)){seen.add(key);candidates.push(text);}}
  if(candidates.length<count-1)for(const value of fallback){const text=String(value),key=canonical(text);if(!seen.has(key)){seen.add(key);candidates.push(text);}if(candidates.length>=count-1)break;}
  if(candidates.length<count-1)throw new Error('Not enough unique decimal choices');
  return{type,prompt,answer:correct,answerTicks:ticks,scale:SCALE,explanation,meta,options:shuffle([correct,...shuffle(candidates.slice(0,Math.max(4,count-1))).slice(0,count-1)])};
 }
 function place(stage,count){const precision=Math.min(5,stage<=2?3:stage+1),sequence=shuffle([0,1,2,3,4,5,6,7,8,9]),whole=sequence[0],fraction=sequence.slice(1,precision+1),text=whole+'.'+fraction.join(''),ticks=parse(text),index=rand(0,precision-1),digit=fraction[index],unit=10**(4-index),kind=rand(0,3);
  if(kind===0)return finish('place-name',text+'中的'+digit+'在哪一位？',null,'小數點後第'+(index+1)+'位是'+places[index]+'。',{text,index,digit},places.filter(p=>p!==places[index]),{answer:places[index],count});
  if(kind===1)return finish('place-value',text+'中的'+digit+'代表多少？',digit*unit,digit+'在'+places[index]+'，代表'+format(digit*unit)+'。',{text,index,digit},numericWrong(digit*unit,unit),{count});
  if(kind===2)return finish('place-digit',text+'的'+places[index]+'數字是哪個？',digit*SCALE,'從小數點往右數第'+(index+1)+'位，數字是'+digit+'。',{text,index,digit},sequence.filter(n=>n!==digit).map(String),{count});
  const spoken=digits[whole]+'點'+fraction.map(n=>digits[n]).join('');return finish('decimal-reading','「'+spoken+'」記作哪個數？',ticks,'小數點後逐位讀出，數字0也要保留。',{text,spoken},numericWrong(ticks,unit),{answer:text,count});
 }
 function compose(count){const a=rand(1,8),b=rand(1,9),unitA=pick([10000,1000]),unitB=unitA/10,ticks=a*unitA+b*unitB;return finish('compose',a+'個'+format(unitA)+'和'+b+'個'+format(unitB)+'合起來是多少？',ticks,a+'個'+format(unitA)+'是'+format(a*unitA)+'，再加'+format(b*unitB)+'。',{counts:[a,b],units:[unitA,unitB]},numericWrong(ticks,unitA),{count});}
 function comparison(count){if(rand(0,2)===0){const ticks=rand(1,99)*1000,text=format(ticks);return finish('equivalent','哪個和'+text+'一樣大？',ticks,'小數末尾補0，數值不變。',{ticks},numericWrong(ticks,1000),{answer:format(ticks,4),count});}const whole=rand(0,5),a=rand(1,8),b=rand(1,9),values=[whole*SCALE+a*10000+b*1000,whole*SCALE+a*10000+b*100,whole*SCALE+a*1000+b*100];
  if(rand(0,1)===0){const largest=rand(0,1)===0,answer=largest?Math.max(...values):Math.min(...values);return finish('compare-choice','下面哪個小數'+(largest?'最大':'最小')+'？',answer,'先比較整數，再從十分位依序向右比較。',{values,largest},values.filter(n=>n!==answer).map(n=>format(n)),{count});}
  const equal=rand(0,2)===0,left=pick(values),right=equal?left:pick(values.filter(n=>n!==left)),symbol=left===right?'＝':left>right?'＞':'＜',leftText=format(left),rightText=equal?format(right,4):format(right);return finish('compare-symbol',leftText+' □ '+rightText+'，□應填哪個符號？',null,equal?'小數末尾補0，數值不變。':'把小數點對齊，從左向右比較。',{left,right},['＞','＜','＝'].filter(s=>s!==symbol),{answer:symbol,count});
 }
 function digitFill(count){const base=rand(0,4)*SCALE+rand(1,8)*10000,cutoff=rand(3,7),digit=rand(cutoff+1,9);return finish('digit-fill',format(base,1)+'□＞'+format(base+cutoff*1000,2)+'，□可以填哪個數字？',digit*SCALE,'前面的位數相同，比較百分位；填入的數字要大於'+cutoff+'。',{base,cutoff},Array.from({length:cutoff+1},(_,i)=>String(i)),{count});}
 function conversion(count,stage=3){const kind=rand(0,stage===1?1:2);if(kind===0)return compose(count);if(kind===1){const unit=pick([1000,100,10]),amount=rand(2,80),ticks=amount*unit;return finish('unit-count',format(ticks)+'是幾個'+format(unit)+'？',amount*SCALE,amount+'個'+format(unit)+'合起來就是'+format(ticks)+'。',{ticks,unit,amount},[String(amount*10),String(amount+1),String(Math.max(1,Math.floor(amount/10)))],{count});}
  const digit=rand(1,9),gap=rand(1,stage<=2?1:2),index=rand(0,2),unitLeft=10**(4-index),unitRight=unitLeft/10**gap,ticks=digit*(unitLeft+unitRight),ratio=10**gap;return finish('place-ratio',format(ticks)+'中，左邊'+digit+'的值是右邊的幾倍？',ratio*SCALE,'左邊代表'+format(digit*unitLeft)+'，右邊代表'+format(digit*unitRight)+'，相差'+gap+'個位值。',{digit,unitLeft,unitRight},['1','10','100','1000'].filter(n=>Number(n)!==ratio),{count});
 }
 function calculation(mode,stage,count,short=false){let a,b,op,kind;
  if(mode==='easy'){a=rand(1,9)*10000;b=rand(1,9)*10000;op=stage<=2||rand(0,1)===0?'+':'-';if(op==='-'&&a<b)[a,b]=[b,a];kind='tenths';}
  else{const variant=short?pick([1,4]):rand(0,Math.min(4,stage));if(variant===0){a=rand(1,4)*SCALE+rand(1,8)*10000+rand(1,4)*1000;b=rand(1,4)*10000;op=pick(['+','-']);kind='alignment';}
   else if(variant===1){a=pick([25000,50000,75000]);b=SCALE-a;op='+';kind='make-whole';}
   else if(variant===2){a=rand(6,9)*10000;b=pick([25000,35000,45000]);op='+';kind='single-carry';}
   else if(variant===3){a=rand(1,3)*SCALE+rand(1,9)*10000;b=rand(1,9)*1000;op='-';kind='single-borrow';}
   else{a=rand(1,5)*SCALE;b=rand(1,9)*10000;op='-';kind='integer-minus-tenths';}}
  const ticks=op==='+'?a+b:a-b,prompt=format(a)+(op==='+'?'＋':'－')+format(b)+'＝？',explanation=kind==='make-whole'?format(a)+'和'+format(b)+'剛好湊成1。':'先對齊小數點，再計算相同位值。';return finish('calculation',prompt,ticks,explanation,{a,b,op,kind},numericWrong(ticks,1000),{count});
 }
 function rounding(count){const ticks=rand(100,9999)*100,precision=rand(1,2),answer=rounded(ticks,precision),unit=10**(5-precision);return finish('rounding',format(ticks)+'四捨五入到小數第'+precision+'位是多少？',answer,'看小數第'+(precision+1)+'位：0～4捨去，5～9進1。',{ticks,precision},[format(Math.floor(ticks/unit)*unit,precision),format(answer+unit,precision),format(Math.max(0,answer-unit),precision)],{precision,count});}
 function complement(count,short=false){const variant=short?rand(0,1):rand(0,2);if(variant===0){const target=short?SCALE:rand(1,3)*SCALE,a=rand(1,target/5000-1)*5000;return finish('complement',format(a)+'＋□＝'+format(target)+'，□是多少？',target-a,'想想'+format(a)+'還差多少，才能湊成'+format(target)+'。',{a,target},numericWrong(target-a,5000),{count});}
  if(variant===1){const base=short?0:rand(0,2)*SCALE,[a,b]=pick([[12500,87500],[25000,75000],[37500,62500],[50000,50000]]),ticks=base+a+b;return finish('familiar-sum',format(base+a)+'＋'+format(b)+'＝？',ticks,format(a)+'和'+format(b)+'可以先湊成1。',{a:base+a,b},numericWrong(ticks,10000),{count});}
  const precision=rand(0,2),unit=10**(4-precision),fraction=rand(1,7)*10000+rand(1,7)*1000+rand(1,7)*100,whole=rand(0,2)*SCALE,a=whole+fraction,op=pick(['+','-']);return finish('single-place-change',format(a)+(op==='+'?'＋':'－')+format(unit)+'＝？',op==='+'?a+unit:a-unit,'只改變'+places[precision]+'，其他位數不變。',{a,unit,op},numericWrong(op==='+'?a+unit:a-unit,unit/10),{count});
 }
 function twoStep(count,mode='boss'){const fractions=pick([[25000,75000],[20000,80000],[40000,60000]]),last=rand(1,9)*10000,terms=shuffle([...fractions,last]);if(mode==='medium'||rand(0,1)===0){const total=terms.reduce((a,b)=>a+b,0);return finish('friendly-three-sum',terms.map(n=>format(n)).join('＋')+'＝？',total,'先找出能湊成1的兩個數，再加剩下的數。',{terms,ops:['+','+']},numericWrong(total,10000),{count});}
  const base=rand(1,4)*SCALE+50000,b=25000,c=75000;return finish('friendly-two-step',format(base)+'－'+format(b)+'＋'+format(c)+'＝？',base-b+c,'減去0.25再加0.75，合起來就是增加0.5。',{terms:[base,b,c],ops:['-','+']},numericWrong(base-b+c,10000),{count});
 }
 function application(count){if(rand(0,4)===0)return twoStep(count);const a=rand(1,4)*SCALE+pick([25000,50000,75000]),b=pick([10000,25000,50000]),kind=rand(0,3);if(kind===0)return finish('remaining','有'+format(a)+'公升果汁，喝掉'+format(b)+'公升，剩多少公升？',a-b,'原有的量減去喝掉的量，就是剩下的量。',{a,b,op:'-'},numericWrong(a-b,10000),{count});if(kind===1)return finish('inverse','喝掉'+format(b)+'公升後剩'+format(a)+'公升，原本有多少公升？',a+b,'剩下的量加上喝掉的量，就是原本的量。',{a,b,op:'+'},numericWrong(a+b,10000),{count});if(kind===2)return finish('difference','甲有'+format(a)+'公升，乙有'+format(b)+'公升，相差多少公升？',a-b,'求相差多少，用較大的量減去較小的量。',{a,b,op:'-'},numericWrong(a-b,10000),{count});
  const correct=format(a)+'－'+format(b),wrong=[format(a)+'＋'+format(b),format(a)+'－'+format(b/10)];return finish('choose-equation','原有'+format(a)+'公升，喝掉'+format(b)+'公升，求剩量應選哪個算式？',null,'求剩下的量，應列「原有量－喝掉量」。',{a,b,op:'-'},wrong,{answer:correct,count});
 }
 function estimate(count){if(rand(0,1)===0)return rounding(count);const a=rand(100,499)*1000,b=rand(100,499)*1000,precision=1,ticks=rounded(a,precision)+rounded(b,precision);return finish('estimate','先將'+format(a)+'、'+format(b)+'各四捨五入到小數第1位，再相加是多少？',ticks,'先算'+format(a)+'≈'+format(rounded(a,1),1)+'、'+format(b)+'≈'+format(rounded(b,1),1)+'，再相加。',{a,b,precision},[format(rounded(a+b,1),1),format(a+b),...numericWrong(ticks,10000)],{precision:1,count});}
 function make(mode,stage=1,ultimate=false,{short=false}={}){stage=Math.max(1,Math.min(5,stage));const count=ultimate?2:3;if(ultimate){if(mode==='easy')return calculation('easy',1,count,true);if(short)return complement(count,true);return twoStep(count,mode);}
  if(short)return mode==='easy'?(rand(0,1)?comparison(count):calculation('easy',5,count,true)):complement(count,true);
  const roll=rand(1,100);if(mode==='easy'){if(roll<=40)return place(stage,count);if(roll<=70)return comparison(count);if(roll<=90)return compose(count);return calculation(mode,stage,count);}
  if(mode==='medium'){if(roll<=40)return calculation(mode,stage,count);if(roll<=65)return conversion(count,stage);if(roll<=85)return rand(0,1)?comparison(count):digitFill(count);return rounding(count);}
  if(roll<=35)return application(count);if(roll<=60)return complement(count);if(roll<=80)return estimate(count);return pick([()=>place(stage,count),()=>comparison(count),()=>conversion(count,stage),()=>digitFill(count)])();
 }
 return{SCALE,format,parse,canonical,rounded,make};
})();
