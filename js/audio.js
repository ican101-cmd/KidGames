// Original procedural Foley: filtered air, resonant impacts and plucked strings.
// No recordings, external requests or additional AudioContext instances.
const WeaponAudio=(()=>{
 const buffers=new WeakMap();
 function noise(ctx){if(!buffers.has(ctx)){const b=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate),d=b.getChannelData(0);let seed=81421;for(let i=0;i<d.length;i++){seed=(seed*16807)%2147483647;d[i]=seed/1073741824-1;}buffers.set(ctx,b);}return buffers.get(ctx);}
 function voice(ctx,out,t,duration,volume,frequency,endFrequency,kind='noise',q=.7){
  const gain=ctx.createGain(),filter=ctx.createBiquadFilter();let source;
  if(kind==='noise'){source=ctx.createBufferSource();source.buffer=noise(ctx);filter.type='bandpass';filter.Q.value=q;}
  else{source=ctx.createOscillator();source.type=kind;source.frequency.setValueAtTime(frequency,t);source.frequency.exponentialRampToValueAtTime(Math.max(20,endFrequency),t+duration);filter.type='lowpass';}
  filter.frequency.setValueAtTime(kind==='noise'?frequency:7000,t);filter.frequency.exponentialRampToValueAtTime(kind==='noise'?Math.max(40,endFrequency):1800,t+duration);
  gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(volume,t+Math.min(.012,duration*.12));gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
  source.connect(filter);filter.connect(gain);gain.connect(out);source.start(t);source.stop(t+duration+.01);
  source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};
 }
 const profiles={
  slash:{swings:[[-.13,.16,1500,450,.22]],impact:[[.10,.24,170,65,'sine'],[.07,.16,1000,250,'noise']]},
  heavy:{swings:[[-.18,.22,2300,280,.26]],impact:[[.15,.28,140,48,'sine'],[.09,.18,2200,650,'noise'],[.22,.06,1470,1320,'sine']]},
  thrust:{swings:[[-.10,.12,3200,900,.20]],impact:[[.07,.20,1700,500,'noise'],[.10,.18,220,85,'sine']]},
  bow:{swings:[],impact:[[.07,.16,1400,380,'noise'],[.13,.21,180,65,'sine']]},
  cast:{swings:[],impact:[[.22,.18,2200,450,'noise'],[.24,.09,660,330,'sine']]},
  ultimate:{swings:[[.23,.15,2500,700,.20],[.40,.15,3100,850,.20],[.55,.23,3800,300,.27]],impact:[[.19,.28,125,40,'sine'],[.16,.23,2500,400,'noise'],[.32,.07,2100,1700,'sine'],[.28,.05,3150,2600,'sine']]}
 };
 function start(ctx,c){
  if(!ctx||ctx.state==='closed')return()=>{};
  const out=ctx.createGain();out.gain.value=.65;out.connect(ctx.destination);
  const now=ctx.currentTime+.005,p=profiles[c.type]||profiles.slash,impact=c.impactDelay/1000;
  const emit=(offset,d,v,f,to,k='noise',q=.7)=>voice(ctx,out,now+Math.max(0,offset),d,v,f,to,k,q);
  for(const [offset,d,f,to,v] of p.swings)emit(c.type==='ultimate'?offset:impact+offset,d,v,f,to);
  if(c.type==='bow'){
   emit(0,.21,.08,700,180,'noise',3); // leather/bow tension
   for(const [f,v] of [[185,.20],[371,.09],[558,.04]])emit(.23,.16,v,f,f*.78,'triangle'); // string release
   emit(.23,.10,.17,3400,1800);emit(.27,Math.max(.10,impact-.27),.10,5100,1200); // arrow flight
  }
  if(c.type==='cast'){
   emit(0,.23,.07,420,1050,'sine');emit(.10,.23,.05,630,1575,'sine');
   emit(.23,impact-.23,.14,2400,650);emit(.23,.22,.07,1000,470,'triangle');
  }
  // Impact is called by the actual damage event, not an independent timer.
  return()=>{const t=ctx.currentTime;for(const [d,v,f,to,k] of p.impact)voice(ctx,out,t,d,v,f,to,k);setTimeout(()=>out.disconnect(),700);};
 }
 // Soft impact and descending defeat motif, without screams or harsh peaks.
 function hero(ctx,event){
  if(!ctx||ctx.state==='closed')return;
  const out=ctx.createGain();out.gain.value=.6;out.connect(ctx.destination);
  const t=ctx.currentTime;
  const emit=(offset,d,v,f,to,k='noise')=>voice(ctx,out,t+offset,d,v,f,to,k);
  if(event==='hit'){
   emit(0,.10,.22,700,160); // clothing/contact slap
   emit(0,.17,.26,145,52,'sine'); // body impact
   emit(.025,.13,.07,1800,450); // equipment rattle
  }else if(event==='death'){
   emit(0,.22,.15,110,42,'sine'); // soft landing
   emit(0,.18,.09,520,120);
   [[0,392],[.16,330],[.32,262],[.52,196]].forEach(([offset,f])=>{
    emit(offset,.32,.10,f,f*.985,'triangle');
    emit(offset,.34,.035,f/2,f/2*.985,'sine');
   });
  }
  setTimeout(()=>out.disconnect(),event==='death'?1100:400);
 }
 function bossAttack(ctx,kind){
  if(!ctx||ctx.state==='closed')return;const out=ctx.createGain();out.gain.value=.5;out.connect(ctx.destination);const t=ctx.currentTime;
  if(kind==='easy'){voice(ctx,out,t,.24,.16,180,75,'sine');voice(ctx,out,t+.08,.16,.08,360,170,'triangle');}
  else if(kind==='medium'){voice(ctx,out,t,.35,.16,800,160,'noise');voice(ctx,out,t,.28,.18,95,42,'sine');}
  else voice(ctx,out,t,.24,.1,400,95,'noise');setTimeout(()=>out.disconnect(),650);
 }
 function bossSkill(ctx,kind,cue){
  if(!ctx||ctx.state==='closed')return;const out=ctx.createGain();out.gain.value=.45;out.connect(ctx.destination);const t=ctx.currentTime;
  if(kind==='easy'){const f=cue==='charge'?180:420;voice(ctx,out,t,.22,.18,f,cue==='charge'?300:120,'sine');voice(ctx,out,t+.04,.12,.07,f*2,220,'triangle');}
  else{voice(ctx,out,t,cue==='charge'?.4:.3,.19,cue==='charge'?650:1800,180,'noise');voice(ctx,out,t,.18,.14,100,45,'sine');}
  setTimeout(()=>out.disconnect(),650);
 }
 return{start,profiles,hero,bossAttack,bossSkill};
})();
