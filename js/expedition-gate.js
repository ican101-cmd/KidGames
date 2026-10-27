/* Presentation-only gate state: progression remains owned by Adventure. */
window.ExpeditionGate=(()=>{
 const button=document.getElementById('btn-expedition'),menu=document.getElementById('mode-select'),dialog=document.getElementById('expedition-seal-dialog');
 const key='fruit_expedition_gate_seen';let unlocked=false,pending=false,celebrating=false,rendered=null;
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 const chain='<svg viewBox="0 0 120 30" preserveAspectRatio="none" aria-hidden="true"><g fill="none" stroke="#98abb7" stroke-width="5">'+Array.from({length:7},(_,i)=>'<ellipse cx="'+(i*18+6)+'" cy="15" rx="12" ry="7" transform="rotate('+(i%2?24:-24)+' '+(i*18+6)+' 15)"/>').join('')+'</g><path d="M0 11H120" stroke="#e2eaf0" opacity=".35"/></svg>';
 const lock='<svg class="gate-lock" viewBox="0 0 60 70" aria-hidden="true"><path class="gate-shackle" d="M16 30V20a14 14 0 0 1 28 0v10" fill="none" stroke="#f6df9c" stroke-width="7"/><rect x="7" y="27" width="46" height="37" rx="8" fill="#c89942" stroke="#ffe7a9" stroke-width="2"/><path d="m13 33 34 0-4 8H17Z" fill="#f1d386"/><path class="gate-keyhole" d="M34 45a5 5 0 1 0-8 4l-2 9h12l-2-9Z" fill="#8feaff"/></svg>';
 function paint(){const label=unlocked?(Expedition.run?'繼續遠征 →':'開始遠征 →'):'遠征之門 · 尚未解封';const stamp=String(unlocked)+label;if(rendered!==stamp){button.innerHTML='<span class="gate-chain gate-chain-left" aria-hidden="true">'+chain+'</span><span class="gate-chain gate-chain-right" aria-hidden="true">'+chain+'</span>'+lock+'<span class="gate-label">'+label+'</span>';rendered=stamp;}button.classList.toggle('gate-sealed',!unlocked);button.classList.toggle('gate-open',unlocked);button.setAttribute('aria-label',unlocked?label:'遠征之門尚未解封，查看解鎖條件');}
 function celebrate(){if(!pending||celebrating||getComputedStyle(menu).display==='none')return;pending=false;celebrating=true;try{localStorage.setItem(MathTopics.key(key),'1');}catch{}button.classList.add('gate-unlocking');setTimeout(()=>{button.classList.remove('gate-unlocking');celebrating=false;},reduced()?80:650);}
 function update(value){unlocked=value;if(!value)pending=false;let seen=false;try{seen=localStorage.getItem(MathTopics.key(key))==='1';}catch{}if(unlocked&&!seen&&!celebrating)pending=true;paint();celebrate();}
 new MutationObserver(celebrate).observe(menu,{attributes:true,attributeFilter:['style']});
 function enter(){if(unlocked){Expedition.open();return;}dialog.showModal();}
 document.getElementById('seal-close').addEventListener('click',()=>dialog.close());
 document.getElementById('seal-go-story').addEventListener('click',()=>{dialog.close();Adventure.map();});
 dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
 return{update,enter};
})();
