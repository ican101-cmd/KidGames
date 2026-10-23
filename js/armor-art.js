// Shared SVG overlay coordinates for the existing 100 x 150 hero canvas.
// Keep slots independent so mixed saved tiers remain visible.
const ArmorArt=(()=>{
 const fits={
  boy:{helmet:[39,8,38,35],chest:[46,49,26,18],gloves:[28,55,14,18],boots:[[19,105,25,42,false],[71,98,25,31,true]]},
  girl:{helmet:[46,9,35,35],chest:[48,49,27,19],gloves:[27,55,14,18],boots:[[16,108,27,40,false],[75,100,24,32,true]]}
 };
 function piece(slot,tier,rect){const [x,y,w,h,mirror=false]=rect;const transform=mirror?` transform="translate(${2*x+w} 0) scale(-1 1)"`:"";return `<image class="armor-art armor-${slot}" data-slot="${slot}" data-tier="${tier}" href="assets/art/armor/${slot}-${tier}.webp" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="none"${transform}/>`;}
 function render(player){const fit=fits[player.gender]||fits.boy;return ['boots','chest','gloves','helmet'].map(slot=>{const tier=player[slot];if(!['iron','silver','gold','diamond'].includes(tier))return '';return slot==='boots'?fit.boots.map(r=>piece(slot,tier,r)).join(''):piece(slot,tier,fit[slot]);}).join('');}
 return{render,fits};
})();

