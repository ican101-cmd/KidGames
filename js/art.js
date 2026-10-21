// Presentation only. Scene selection never changes questions, rewards or save keys.
const WorldArt = (() => {
  const scenes = [
    {id:'meadow',name:'王國草原',chapter:'晨光中的啟程',file:'stage-1-meadow',accent:'#d8be76'},
    {id:'forest',name:'古木森林',chapter:'穿越翠綠祕境',file:'stage-2-forest',accent:'#a4c6a0'},
    {id:'coast',name:'碧海遺跡',chapter:'潮聲中的古老傳說',file:'stage-3-coast',accent:'#91d2db'},
    {id:'canyon',name:'夕照峽谷',chapter:'追尋落日的足跡',file:'stage-4-canyon',accent:'#e5b18a'},
    {id:'castle',name:'星月龍堡',chapter:'星光指引的最終冒險',file:'stage-5-castle',accent:'#b8a8dd'}
  ];
  const path = file => `assets/art/${file}.webp`;
  let nextScene;
  const preloaded = new Set();
  function apply(level, mode, theme) {
    const scene = scenes[Math.max(0,Math.min(scenes.length-1,level-1))];
    const stage=document.getElementById('battle-stage');
    stage.dataset.scene=scene.id;
    stage.style.setProperty('--scene-accent',scene.accent);
    const background=document.getElementById('battle-scene-image');
    if(background.getAttribute('src')!==path(scene.file)) background.src=path(scene.file);
    background.alt=`第 ${level} 關：${scene.name}`;
    document.getElementById('scene-name').textContent=scene.name;
    document.getElementById('scene-chapter').textContent=`第 ${level} 章 · ${scene.chapter}`;
    const monster=document.getElementById('monster-art');
    const monsterFile={pink:'flower-spirit',blue:'reef-fish'}[theme] || 'slime';
    monster.setAttribute('href',path(monsterFile));
    monster.style.filter=monsterFile==='slime'?`hue-rotate(${[0,40,150,300,230][(level-1)%5]}deg)`:'none';
    document.getElementById('slime-container').classList.toggle('is-dragon',mode==='boss'&&level===5);
    // A single next-scene image, not a persistent particle/animation allocation loop.
    if(level<scenes.length&&!preloaded.has(level)){preloaded.add(level);nextScene=new Image();nextScene.src=path(scenes[level].file);}
  }
  return {scenes,apply};
})();
