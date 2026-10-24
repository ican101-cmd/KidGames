/* Presentation helpers never delay combat input or its question timer. */
window.GameUI=(()=>{
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 let toastTimer;
 function toast(message){let el=document.getElementById('equipment-toast');if(!el){el=document.createElement('p');el.id='equipment-toast';el.setAttribute('role','status');document.getElementById('game-container').append(el);}el.textContent=message;el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.hidden=true,1800);}
 function expedition(){const screen=document.getElementById('expedition-screen'),footer=document.getElementById('exp-actions'),box=document.getElementById('expedition-content');if(!screen||screen.hidden)return;footer.replaceChildren();box.querySelectorAll('[data-action="begin"],[data-action="battle"],[data-action="settle"],[data-action="chest-next"],[data-perk],[data-event]').forEach(b=>footer.append(b));footer.hidden=!footer.childElementCount;const run=Expedition.run;screen.dataset.phase=run?.status||'ready';if(run?.status==='reward'){const title=document.createElement('p');title.className='exp-action-heading';title.textContent='本站已完成 · 選擇旅途祝福後前進';footer.prepend(title);}const difficulty=box.querySelector('label:has(#exp-difficulty)');if(difficulty)footer.prepend(difficulty);screen.querySelector('.exp-scroll').scrollTop=0;}
 const screens=[...document.querySelectorAll('.overlay-screen,#expedition-screen,#leaderboard-screen')];const visible=new WeakMap();
 const observer=new MutationObserver(()=>{for(const el of screens){const shown=!el.hidden&&getComputedStyle(el).display!=='none';if(shown&&!visible.get(el)&&!reduced())el.animate([{opacity:.65,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:170,easing:'ease-out'});visible.set(el,shown);}});
 screens.forEach(el=>{visible.set(el,!el.hidden&&getComputedStyle(el).display!=='none');observer.observe(el,{attributes:true,attributeFilter:['style','hidden']});});

 document.querySelectorAll('.avatar-card').forEach(card=>{card.tabIndex=0;card.setAttribute('role','button');card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();card.click();}});});
 function icon(name){const paths={sword:'m5 19 13-15 3-1-1 4L7 21Zm0-8 8 8m-9 3 3-3',heart:'M12 21 3 12C-3 3 7-1 12 6c5-7 15-3 9 6Z',spark:'m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z',landscape:'M3 3h18v18H3Zm0 14 6-7 5 6 3-3 4 5M16 7h1',trophy:'M7 3h10v9a5 5 0 0 1-10 0Zm0 3H3v4q0 4 5 4m9-8h4v4q0 4-5 4m-4 3v4m-5 0h10'};return '<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="'+(paths[name]||paths.spark)+'"/></svg>';}
 return{toast,expedition,icon};
})();
