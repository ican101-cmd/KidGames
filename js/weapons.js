// Original inked fantasy equipment. Stable item IDs and balance remain unchanged.
const WeaponArt = {
 wood_sword: `<path d="M29 76 25 22 32 8 39 22 35 76Z" fill="#bb8046"/><path d="M32 14 31 70 35 69 35 24Z" fill="#f5d294"/><path d="m28 27 3 9-2 13 3 11M35 31l-2 16" fill="none" stroke="#825530" stroke-width="1.3"/><path d="m19 73 13-4 13 4-2 7-11-3-11 3Z" fill="#ad7842"/>`,
 iron_sword: `<path d="m32 5 9 20-4 46-5 7-5-7-4-46Z" fill="#9babbc"/><path d="m32 8 1 62-5 3-3-47Z" fill="#f3f5e9"/><path d="m32 12 6 15-3 39-3 7Z" fill="#c1d6dc"/><path d="m17 70 15 3 15-3-3 10-12-3-12 3Z" fill="#647b8e"/><path d="m21 73 11 3 11-3" fill="none" stroke="#d9e5e3"/>`,
 magic_wand: `<path d="m29 38 6 0-2 67-5 0Z" fill="#79503f"/><path d="m31 41-1 57" stroke="#d2aa6e"/><path d="M32 6C13 12 13 35 32 42 51 35 51 12 32 6Z" fill="#bc964f"/><path d="M32 10 42 24 32 37 22 24Z" fill="#9458ad"/><path d="m32 12 0 21-8-9Z" fill="#e6b2e8"/><path d="m32 13 8 11-8 9Z" fill="#b57bd4"/><path d="m19 29-5-9 7 3m24 6 5-9-7 3" fill="#d7bb79"/><circle cx="32" cy="24" r="3" fill="#fff9df"/>`,
 silver_spear: `<path d="M30 42h4v65h-4Z" fill="#7f5945"/><path d="M31 49v52" stroke="#dbbc86"/><path d="m32 2 11 28-6 12H27l-6-12Z" fill="#adc1cc"/><path d="m32 5 0 34-8-9Z" fill="#f2f9ef"/><path d="m32 8 8 22-6 9Z" fill="#8faaba"/><path d="M25 39h14v7H25Z" fill="#c5a65e"/><path d="m27 46-8 16 10-4 6 5 1-17Z" fill="#6d839d"/>`,
 golden_bow: `<path d="M22 8C51 11 53 40 35 55 53 72 51 98 22 102L26 94C44 84 43 68 29 60V50C43 40 44 25 26 17Z" fill="#b78936"/><path d="M25 12C45 19 48 39 32 52M32 59C48 75 45 91 25 98" fill="none" stroke="#f7df91" stroke-width="3"/><path class="bow-string" d="m22 9-7 46 7 46" fill="none" stroke="#eee3c5" stroke-width="1.2"/><path d="M27 47h9v16h-9Z" fill="#75513b"/><path d="m29 49 6 3-6 4 6 4" fill="none" stroke="#cfa46b"/><path d="m22 8 5 4-4 9-5-5Zm0 94 5-4-4-9-5 5Z" fill="#e6bf60"/>`,
 diamond_sword: `<path d="m32 2 13 23-8 43-5 9-5-9-8-43Z" fill="#4aa4bb"/><path d="m32 5 0 64-10-39Z" fill="#c9f6ed"/><path d="m32 5 10 21-10 38Z" fill="#79d8e7"/><path d="m22 29 10 35 10-38-10 11Z" fill="#97e7eb"/><path d="m32 39 0 29 5-20Z" fill="#d9fff4"/><path d="m13 69 10-4 9 7 9-7 10 4-8 12-11-4-11 4Z" fill="#8c79aa"/><path d="m17 70 6-1 9 7 9-7 6 1" fill="none" stroke="#e2c99a"/><path d="m32 68 6 7-6 8-6-8Z" fill="#98f5ed"/>`
};
let weaponArtSerial=0;
function weaponSvg(body,id){
 const uid=`equipment-${++weaponArtSerial}`;
 return `<svg class="weapon-svg-icon equipment-${id}" viewBox="0 0 64 112" aria-hidden="true" stroke="#493f42" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><defs><linearGradient id="${uid}" x2="1" y2="1"><stop stop-color="#fff6dc" stop-opacity=".2"/><stop offset=".5" stop-color="#fff6dc" stop-opacity="0"/><stop offset="1" stop-color="#392e47" stop-opacity=".18"/></linearGradient></defs>${body}${['wood_sword','iron_sword','diamond_sword'].includes(id)?'<path d="M28 79h8v23h-8Z" fill="#73503f"/><path d="m29 83 6 3-6 3 6 3-6 3" fill="none" stroke="#d4ac79"/><path d="m27 102 5-3 5 3-2 6h-6Z" fill="#c2a56b"/>':''}<path d="M21 23 24 20" stroke="#fff8df" stroke-width="1" opacity=".65"/></svg>`;
}
const weapons={};
[
 ['wood_sword','木劍',25,0,'slash',600,320,null,'smallHit','#fff8dc',.65,46,91],
 ['iron_sword','鐵劍',40,300,'heavy',700,350,null,'heavyHit','#e1f6ff',.8,49,99],
 ['magic_wand','魔杖',50,900,'cast',800,560,'orb','magicHit','#cc91ff',0,47,92],
 ['silver_spear','銀槍',65,1500,'thrust',500,260,null,'pierceHit','#c3f5ff',.85,46,124],
 ['golden_bow','黃金弓',80,2000,'bow',800,570,'arrow','arrowHit','#ffd76e',0,54,101],
 ['diamond_sword','星晶鑽石劍',100,3000,'ultimate',1050,720,null,'ultimateHit','#72eaff',.8,56,109]
].forEach(([id,name,dmg,price,type,duration,impactDelay,projectile,hitEffect,color,reach,width,height])=>{
 weapons[id]={name,dmg,price,isSvg:true,icon:weaponSvg(WeaponArt[id],id),visual:{width,height,grip:type==='bow'?50:85},animation:{type,duration,impactDelay,projectile,hitEffect,color,reach,effect:{slash:'slash_arc',heavy:'silver_trail',cast:'charge',thrust:'pierce_line',bow:'golden_trail',ultimate:'energy_arc'}[type],shake:type==='ultimate'?'medium':(dmg>=40&&type!=='cast'?'small':null)}};
});
