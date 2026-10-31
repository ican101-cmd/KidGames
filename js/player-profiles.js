// Player one retains all legacy keys. Player two has its own namespace and anonymous session.
const PlayerProfiles=(()=>{
 const metadataKey='kidgames_players_v1',ids=['p1','p2'],avatars=['boy','girl','slime','dragon'],prefix='kidgames_player_p2::',validName=n=>typeof n==='string'&&/^[A-Za-z0-9一-龥 _-]{2,12}$/u.test(n.trim());
 const defaultProfile=id=>({nickname:id==='p1'?'玩家一':'玩家二',avatar:'boy'});
 function read(){let data;try{data=JSON.parse(localStorage.getItem(metadataKey));}catch{}return{version:1,active:ids.includes(data?.active)?data.active:'p1',profiles:Object.fromEntries(ids.map(id=>{const p=data?.profiles?.[id]||{};return[id,{nickname:validName(p.nickname)?p.nickname.trim():defaultProfile(id).nickname,avatar:avatars.includes(p.avatar)?p.avatar:'boy'}];}))};}
 if(!localStorage.getItem(metadataKey)){const initial=read();try{const name=JSON.parse(localStorage.getItem('kidgames_nickname_v1'));if(validName(name))initial.profiles.p1.nickname=name.trim();}catch{}localStorage.setItem(metadataKey,JSON.stringify(initial));}
 const id=read().active;
 function update(slot,profile){if(!ids.includes(slot)||!validName(profile.nickname)||!avatars.includes(profile.avatar))throw Error('請使用 2～12 個中文字、字母或數字作為暱稱。');const data=read();data.profiles[slot]={nickname:profile.nickname.trim(),avatar:profile.avatar};localStorage.setItem(metadataKey,JSON.stringify(data));return data.profiles[slot];}
 function activate(slot){if(!ids.includes(slot))return;const data=read();data.active=slot;localStorage.setItem(metadataKey,JSON.stringify(data));}
 const image=avatar=>'assets/art/'+({boy:'hero-boy',girl:'hero-girl',slime:'slime',dragon:'dragon'}[avatar]||'hero-boy')+'.webp';
 return{id,ids,avatars,read,update,activate,image,validName,get current(){return read().profiles[id];},prefix};
})();
const PlayerStorage=(()=>{
 const prefix=PlayerProfiles.id==='p2'?PlayerProfiles.prefix:'',key=name=>prefix+name;
 return{getItem:name=>localStorage.getItem(key(name)),setItem:(name,value)=>localStorage.setItem(key(name),value),removeItem:name=>localStorage.removeItem(key(name)),keys:()=>Object.keys(localStorage).filter(k=>prefix?k.startsWith(prefix):!k.startsWith(PlayerProfiles.prefix)).map(k=>prefix?k.slice(prefix.length):k)};
})();
