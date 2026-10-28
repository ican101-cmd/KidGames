// Fraction values remain integer numerator/denominator pairs; display preserves requested form.
const FractionQuestions=(()=>{
 const gcd=(a,b)=>b?gcd(b,a%b):a,lcm=(a,b)=>a/gcd(a,b)*b;
 const r=(a,b)=>a+Math.floor(Math.random()*(b-a+1)),pick=a=>a[r(0,a.length-1)],f=(a,b)=>`${a}/${b}`;
 const shuffle=a=>{a=[...a];for(let i=a.length-1;i;i--){const j=r(0,i);[a[i],a[j]]=[a[j],a[i]];}return a;};
 function finish(type,prompt,answer,wrong,explanation,meta,ultimate){answer=String(answer);const choices=[...new Set(wrong.map(String))].filter(v=>v!==answer);if(choices.length<2)throw Error('Insufficient fraction choices');return{type,prompt,answer,options:shuffle([answer,...shuffle(choices).slice(0,ultimate?1:2)]),explanation,meta};}
 function make(mode,stage=1,ultimate=false,{short=false}={}){
  const roll=r(1,100),kind=short?'expand':mode==='easy'?(roll<=35?'expand':roll<=65?'reduce-fill':roll<=90?'equivalent':'concept'):mode==='medium'?(roll<=30?'simplify':roll<=55?'expand':roll<=80?'common':'compare'):(roll<=35?'compare':roll<=60?'convert':roll<=85?'story':roll<=93?'error':'mixed');
  let a,b,k,n,d,answer,wrong,prompt,explanation,meta;
  if(kind==='expand'||kind==='reduce-fill'){
   b=r(2,Math.min(12,stage+5));a=r(1,b-1);k=r(2,short?3:5);const denominator=kind==='reduce-fill'||r(0,1)===1;
   if(kind==='reduce-fill'){prompt=`${f(a*k,b*k)}＝${a}/□，□是多少？`;answer=b;explanation=`分子、分母同除以 ${k}，得到 ${f(a,b)}。`;}
   else{prompt=denominator?`${f(a,b)}＝${a*k}/□，□是多少？`:`${f(a,b)}＝□/${b*k}，□是多少？`;answer=denominator?b*k:a*k;explanation=`分子、分母同乘 ${k}，得到 ${f(a*k,b*k)}。`;}
   wrong=[answer+1,answer+2,answer+k];meta={a,b,k,denominator,answer:Number(answer)};
  }else if(kind==='equivalent'||kind==='simplify'){
   b=r(2,12);a=r(1,b-1);const g=gcd(a,b);a/=g;b/=g;k=r(2,5);
   if(kind==='equivalent'){answer=f(a*k,b*k);prompt=`哪個分數與 ${f(a,b)} 相等？`;explanation=`分子、分母同乘 ${k}，大小不變。`;}
   else{answer=f(a,b);prompt=`${f(a*k,b*k)} 約成最簡分數是哪個？`;explanation=`分子、分母同除以 ${k}，得到 ${answer}，不能再約分。`;}
   n=kind==='equivalent'?a*k:a;d=kind==='equivalent'?b*k:b;wrong=[f(n+1,d),f(n,d+1),f(n+2,d)];meta={a,b,k};
  }else if(kind==='concept'){
   k=r(2,5);const variant=r(0,3);b=r(2,8);a=r(1,b-1);
   if(variant===0){prompt='分子、分母同乘 '+k+'，分數的大小會如何？';answer='不變';wrong=['變大','變小'];}
   else if(variant===1){prompt='分子、分母同除以公因數 '+k+'，分數的大小會如何？';answer='不變';wrong=['變大','變小'];}
   else if(variant===2){prompt=f(a,b)+' 擴分成 '+f(a*k,b*k)+'，大小如何改變？';answer='不變';wrong=['變大','變小'];}
   else{prompt=f(a*k,b*k)+' 約分成 '+f(a,b)+'，大小如何改變？';answer='不變';wrong=['變大','變小'];}
   explanation='分子、分母同乘或同除以相同的非零數，分數大小不變。';meta={a,b,k,variant};
  }else if(kind==='common'){
   [b,d]=pick(stage<=2?[[2,4],[3,6],[4,8],[3,4],[2,6],[2,8],[3,9],[4,12],[5,10]]:[[4,6],[6,9],[4,9],[3,8],[6,8],[5,6],[4,10],[6,12],[8,12]]);a=r(1,b-1);n=r(1,d-1);answer=lcm(b,d);prompt=`${f(a,b)} 與 ${f(n,d)} 的最小共同分母是多少？`;wrong=[answer+b,answer+d,answer*2];explanation=`${b} 和 ${d} 的最小公倍數是 ${answer}。`;meta={a,b,n,d};
  }else if(kind==='convert'){
   const base=pick([3,4,5,6]);n=r(1,base-1);const common=gcd(n,base);n/=common;b=base/common;k=r(2,3);d=b*(k+1);a=n*k;b*=k;answer=a*d/b;prompt=`${f(a,b)}＝□/${d}，□是多少？`;wrong=[answer+1,answer+2,answer+3];const g=gcd(a,b);explanation=`先約成 ${f(a/g,b/g)}，再擴分成 ${f(answer,d)}。`;meta={a,b,d};
  }else if(kind==='error'){
   b=r(3,10);a=r(1,b-1);k=r(2,4);prompt='哪個不是 '+f(a,b)+' 的正確擴分？';answer=f(a,b)+'＝'+f(a,b*k);wrong=[f(a,b)+'＝'+f(a*k,b*k),f(a,b)+'＝'+f(a*(k+1),b*(k+1))];explanation='分母乘 '+k+'，分子也必須乘 '+k+'，不能只改分母。';meta={a,b,k};
  }else{
   [b,d]=pick(mode==='medium'?[[2,4],[3,6],[4,8],[4,6]]:[[4,6],[6,9],[8,12],[5,10],[3,8]]);a=r(1,b-1);n=r(1,d-1);const delta=a*d-n*b;answer=delta>0?'＞':delta<0?'＜':'＝';meta={a,b,n,d};
   if(kind==='story'){prompt=`同樣大的果汁瓶，甲喝 ${f(a,b)} 瓶，乙喝 ${f(n,d)} 瓶，誰喝得較多？`;answer=delta>0?'甲':delta<0?'乙':'一樣多';wrong=['甲','乙','一樣多'].filter(v=>v!==answer);}
   else{prompt=kind==='mixed'?`1又${f(a,b)} □ 1又${f(n,d)}，□填什麼？`:`${f(a,b)} □ ${f(n,d)}，□填什麼？`;wrong=['＞','＜','＝'].filter(v=>v!==answer);}
   const c=lcm(b,d);explanation=`通分後是 ${f(a*c/b,c)} 與 ${f(n*c/d,c)}，比較分子即可。`;
  }
  return finish(kind,prompt,answer,wrong,explanation,meta,ultimate);
 }
 function render(el,text){el.replaceChildren();const parts=String(text).split(/([0-9□]+\/[0-9□]+)/g);for(const part of parts){if(/^[0-9□]+\/[0-9□]+$/.test(part)){const [n,d]=part.split('/'),span=document.createElement('span');span.className='fraction';span.setAttribute('aria-label',`${d}分之${n}`);for(const v of [n,d]){const child=document.createElement('span');child.textContent=v;span.append(child);}el.append(span);}else el.append(document.createTextNode(part));}}
 return{make,render,gcd,lcm};
})();
