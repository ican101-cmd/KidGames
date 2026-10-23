// Four short chapters; timers stop on skip, and never reopen character selection later.
window.StoryIntro = (() => {
 const screen=document.getElementById('intro-screen'),scenes=[...screen.querySelectorAll('[data-story-scene]')],pages=[...screen.querySelectorAll('[data-story-page]')];
 const previous=document.getElementById('story-previous'),next=document.getElementById('story-next'),pause=document.getElementById('story-pause'),help=document.getElementById('story-help');
 let index=0,timer=null,stopped=false,paused=matchMedia('(prefers-reduced-motion: reduce)').matches;
 function stop(){stopped=true;clearTimeout(timer);}
 function schedule(){clearTimeout(timer);if(!paused&&!stopped&&index<scenes.length-1&&!document.hidden)timer=setTimeout(()=>show(index+1),8000);}
 function show(value){if(stopped)return;index=Math.max(0,Math.min(scenes.length-1,value));scenes.forEach((el,i)=>el.hidden=i!==index);pages.forEach((el,i)=>{if(i===index)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});previous.disabled=index===0;next.textContent=index===scenes.length-1?'選擇你的勇者 · 出發 →':'翻開下一頁 →';pause.textContent=paused?'繼續播放':'暫停播放';pause.setAttribute('aria-pressed',String(paused));help.textContent=index===scenes.length-1?'你的故事，即將開始':paused?'已暫停，可按下一頁慢慢閱讀':'每段停留 8 秒，也可以按下一頁';schedule();}
 next.onclick=()=>index===scenes.length-1?skipIntro():show(index+1);
 previous.onclick=()=>show(index-1);pause.onclick=()=>{paused=!paused;show(index);};pages.forEach((el,i)=>el.onclick=()=>show(i));
 document.addEventListener('visibilitychange',()=>{if(document.hidden)clearTimeout(timer);else schedule();});
 screen.addEventListener('keydown',e=>{if(stopped)return;if(e.key==='Escape'){e.preventDefault();skipIntro();}else if(e.key==='ArrowRight'){e.preventDefault();next.click();}else if(e.key==='ArrowLeft'){e.preventDefault();previous.click();}});
 show(0);return{stop};
})();
