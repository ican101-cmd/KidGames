// Stable IDs and original balance are part of the save compatibility contract.
const weaponSvg = body => `<svg class="weapon-svg-icon" viewBox="0 0 64 64" stroke="#35475b" stroke-width="2" stroke-linejoin="round">${body}</svg>`;
const weapons = {};
[
 ['wood_sword','木劍',25,0,'slash',600,320,null,'smallHit','#fff8dc',.65,'<path d="M28 45V13L32 5 36 13V45Z" fill="#cf9860"/><path d="M22 44H42V49H22Z" fill="#996734"/>'],
 ['iron_sword','鐵劍',40,300,'heavy',700,350,null,'heavyHit','#e1f6ff',.8,'<path d="M26 43V14L32 3 38 14V43Z" fill="#e8f5ff"/><path d="M32 8V42" stroke="#95adc1"/><path d="M20 42L32 46 44 42V49H20Z" fill="#809db7"/>'],
 ['magic_wand','魔杖',50,900,'cast',800,560,'orb','magicHit','#cc91ff',0,'<path d="M30 24H35L33 61H29Z" fill="#9b70bd"/><path d="M32 3L43 16 32 30 21 16Z" fill="#d5a1ff"/><circle cx="32" cy="16" r="4" fill="white"/>'],
 ['silver_spear','銀槍',65,1500,'thrust',500,260,null,'pierceHit','#c3f5ff',.85,'<path d="M30 23H34V63H30Z" fill="#778da5"/><path d="M32 1L41 22 32 29 23 22Z" fill="#e1f8ff"/>'],
 ['golden_bow','黃金弓',80,2000,'bow',800,570,'arrow','arrowHit','#ffd76e',0,'<path d="M22 4Q59 32 22 60L26 48Q43 32 26 16Z" fill="#ffcf59"/><path d="M22 4L16 32 22 60M6 32H58M51 26L59 32 51 38" fill="none" stroke="#cc8b25"/>'],
 ['diamond_sword','星晶鑽石劍',100,3000,'ultimate',1050,720,null,'ultimateHit','#72eaff',.8,'<path d="M32 2L42 18 37 41 32 46 27 41 22 18Z" fill="#66e2f4"/><path d="M32 2V46L22 18Z" fill="#c4faff"/><path d="M18 41L32 46 46 41 42 51H22Z" fill="#688bc5"/><path d="M32 42L37 47 32 52 27 47Z" fill="#edfaff"/>']
].forEach(([id,name,dmg,price,type,duration,impactDelay,projectile,hitEffect,color,reach,body]) => {
 weapons[id]={name,dmg,price,isSvg:true,icon:weaponSvg(body+(projectile||type==='thrust'?'':'<path d="M29 49H35V61H29Z" fill="#78614c"/>')),animation:{type,duration,impactDelay,projectile,hitEffect,color,reach,effect:{slash:'slash_arc',heavy:'silver_trail',cast:'charge',thrust:'pierce_line',bow:'golden_trail',ultimate:'energy_arc'}[type],shake:type==='ultimate'?'medium':(dmg>=40&&type!=='cast'?'small':null)}};
});
