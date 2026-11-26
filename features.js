'use strict';
// Location checks run on the player's device. They deter accidental remote play,
// but browser location can be spoofed; they are not a proof of physical presence.
window.AKIBUJT_FEATURES=(()=>{
 const radius=200;
 let map=null,userMarker=null,accuracyCircle=null,watchId=null,watchGeneration=0;
 const formatDistance=n=>Math.round(n)+' m';
 function distance(a,b,c,d){
  const rad=Math.PI/180,dl=(c-a)*rad,do_=(d-b)*rad;
  const x=Math.sin(dl/2)**2+Math.cos(a*rad)*Math.cos(c*rad)*Math.sin(do_/2)**2;
  return 6371000*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));
 }
 function locationPanel(p,esc){
  if(!p.location)return '';
  const l=p.location;
  return '<section class="location-gate"><h3>Helyszíni feladat</h3><p>A feladatot csak a helyszín 200 méteres körzetében teljesítheted. Engedélyezd a helymeghatározást; a pozíciód nem kerül a szerverünkre.</p><strong>'+esc(l.name)+'</strong><div id="location-map" role="region" aria-label="A feladat helyszíne térképen"></div><button class="btn secondary small" type="button" id="check-location">Helymeghatározás indítása</button><p id="location-feedback" class="feedback" role="status" aria-live="polite">A válaszmező még zárolva van. Indítás után a távolság és a pontosság folyamatosan frissül.</p></section>';
 }
 function shuffled(values,seed){
  const out=[...values];let n=2166136261;
  for(const ch of seed)n=Math.imul(n^ch.charCodeAt(0),16777619)>>>0;
  for(let i=out.length-1;i>0;i--){n=(Math.imul(n,1664525)+1013904223)>>>0;const j=n%(i+1);[out[i],out[j]]=[out[j],out[i]]}
  if(out.length>1&&out.every((x,i)=>x===values[i]))out.reverse();
  return out;
 }
 function answerFields(p,esc){
  const type=p.answerType||'text';
  let control='';
  if(type==='choice')control='<div class="choices">'+(p.options||[]).map((o,i)=>'<label><input type="radio" name="choice" value="'+esc(o)+'" required><span>'+esc(o)+'</span></label>').join('')+'</div>';
  else if(type==='number'||type==='count')control=type==='count'?'<input id="answer" type="number" step="1" min="0" inputmode="numeric" required placeholder="Hányat számoltál?">':'<input id="answer" type="number" step="any" inputmode="decimal" required placeholder="Írd be a számot">';
  else if(type==='self_report')control='<label class="self-report"><input id="self-report-check" type="checkbox" required><span>A feladatot valóban teljesítettük.</span></label><p class="quiet">Önbevallásos feladat: a teljesítést a játék nem ellenőrzi automatikusan.</p>';
  else if(type==='photo')control='<div class="photo-answer"><input id="answer-photo" type="file" accept="image/*" capture="environment" required><p class="quiet">Legfeljebb 10 MB-os fényképet válassz. A kép csak ezen az eszközön jelenik meg, nem töltődik fel a szerverre és nem ellenőrizzük automatikusan a tartalmát.</p><img id="photo-preview" alt="A kiválasztott kép előnézete" hidden></div>';
  else if(type==='order')control='<div class="ordering"><p class="quiet">Rendezd az elemeket a helyes sorrendbe. Húzhatod őket, vagy használhatod a Fel és Le gombokat.</p><ol id="order-list" class="sort-list">'+shuffled(p.items||[],p.title+p.question).map(item=>'<li draggable="true" data-value="'+esc(item)+'"><span class="sort-handle" aria-hidden="true">⠿</span><span class="sort-text">'+esc(item)+'</span><div class="sort-actions"><button type="button" data-move="up" aria-label="'+esc(item)+' feljebb">Fel</button><button type="button" data-move="down" aria-label="'+esc(item)+' lejjebb">Le</button></div></li>').join('')+'</ol></div>';
  else if(type==='matching')control='<div class="matching"><p class="quiet">Mindegyik bal oldali elemhez válaszd ki a hozzá tartozó párt. Egy jobb oldali választ csak egyszer használhatsz.</p><div id="match-list" class="match-list">'+(p.pairs||[]).map((pair,i)=>'<label><span>'+esc(pair.left)+'</span><select data-match="'+i+'" required><option value="">Válassz párt…</option>'+shuffled(p.pairs.map(x=>x.right),p.title+p.question).map(right=>'<option value="'+esc(right)+'">'+esc(right)+'</option>').join('')+'</select></label>').join('')+'</div></div>';
  else control='<input id="answer" autocomplete="off" required maxlength="120" placeholder="'+(type==='find'?'Mit találtál?':'Írd be a megfejtést')+'">';
  const question=['choice','order','matching','self_report'].includes(type)?'<p class="question">'+esc(p.question)+'</p>':'<label class="question" for="'+(type==='photo'?'answer-photo':'answer')+'">'+esc(p.question)+'</label>';
  return '<form class="answer-form" id="answer-form">'+question+'<fieldset id="answer-lock" '+(p.location?'disabled':'')+'><div class="answer-row">'+control+'<button class="btn" type="submit">'+(type==='self_report'?'Teljesítettük':'Ellenőrzés')+'</button></div></fieldset><div id="feedback" class="feedback" role="status" aria-live="polite"></div></form>';
 }
 function clearMap(){watchGeneration++;if(watchId!==null&&navigator.geolocation?.clearWatch)navigator.geolocation.clearWatch(watchId);watchId=null;if(map){map.remove();map=null}userMarker=null;accuracyCircle=null}
 function mountMap(p){
  if(map){map.remove();map=null}userMarker=null;accuracyCircle=null;
  if(!p.location)return;
  const el=document.getElementById('location-map'),l=p.location;
  if(!window.L){el.innerHTML='<p>A térkép nem töltődött be. A helyzetellenőrzés ettől még működik.</p>';return}
  map=L.map(el,{scrollWheelZoom:false}).setView([l.lat,lng(l)],16);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> közreműködők',maxZoom:19}).addTo(map);
  L.circle([l.lat,lng(l)],{radius,color:'#367df0',fillColor:'#4ba3ff',fillOpacity:.13}).addTo(map);
  L.marker([l.lat,lng(l)]).addTo(map).bindPopup(l.name);
  setTimeout(()=>map&&map.invalidateSize(),100);
 }
 const lng=l=>l.lng;
 function routePanel(g,esc){
  const stops=g.puzzles.map((p,i)=>({p,i})).filter(x=>x.p.location);
  if(!stops.length)return '';
  const shape=window.AKIBUJT_MAP;
  const point=l=>{const [west,south,east,north]=shape.bounds;return [80+(l.lng-west)/(east-west)*840,50+(north-l.lat)/(north-south)*460].map(v=>v.toFixed(1))};
  const markers=shape?stops.map(({p,i})=>{const [x,y]=point(p.location);return '<g class="route-pin"><circle class="route-point" cx="'+x+'" cy="'+y+'" r="6"/><title>'+(i+1)+'. '+esc(p.location.name)+'</title></g>'}).join(''):'';
  const path=shape?stops.map(({p})=>point(p.location).join(',')).join(' '):'';
  const graphic=shape?'<svg id="route-map" viewBox="0 0 1000 560" role="img" aria-label="Budapest kontúrja, a Duna és a teljesített állomások"><rect width="1000" height="560" fill="#20385b"/><path class="city-outline" d="'+shape.outline+'"/><path class="danube" d="'+shape.river+'"/><polyline class="route-line" points="'+path+'"/>'+markers+'<text x="790" y="535" class="map-label">BUDAPEST · DUNA</text></svg>':'<p>A térkép nem tölthető be; az állomások listája lent olvasható.</p>';
  return '<section class="route-panel"><h2>Teljesített útvonal</h2><p class="quiet">Budapest kontúrja és az állomások sorrendje. Az összekötő vonal nem gyalogos navigáció.</p>'+graphic+'<ol class="route-stops">'+stops.map(({p,i})=>'<li><strong>'+String(i+1).padStart(2,'0')+'. '+esc(p.location.name)+'</strong><span>'+esc(p.title)+'</span></li>').join('')+'</ol><p class="map-credit">Budapest közigazgatási kontúrja: geoHungary; a Duna vonala stilizált.</p></section>';
 }
 function position(){
  return new Promise((resolve,reject)=>{
   if(!navigator.geolocation){reject(Error('A készülék nem támogatja a helymeghatározást.'));return}
   navigator.geolocation.getCurrentPosition(resolve,e=>reject(Error(e.code===1?'A helymeghatározás nincs engedélyezve. Engedélyezd a böngészőben.':'Nem sikerült pontos helyzetet kérni. Próbáld újra szabad ég alatt.')),{enableHighAccuracy:true,maximumAge:0,timeout:15000});
  });
 }
 async function check(p,feedback){
  feedback.textContent='Helyzet ellenőrzése…';
  try{
   const result=await position(),l=p.location,coords=result.coords;
   const d=distance(coords.latitude,coords.longitude,l.lat,l.lng),accuracy=coords.accuracy;
   showPosition(coords);
   // Accuracy is a radius of uncertainty. Require that it fits inside the zone.
   const allowed=Number.isFinite(accuracy)&&d+accuracy<=radius;
   feedback.textContent=allowed?'A helyzet rendben. Távolság: '+formatDistance(d)+'. Válaszolhatsz.':'A válasz még zárolva van. Távolság: '+formatDistance(d)+', helyadat pontossága: ±'+formatDistance(accuracy)+'. A teljes bizonytalansági körnek 200 méteren belül kell lennie.';
   return allowed;
  }catch(e){feedback.textContent=e.message;return false}
 }
 function showPosition(coords){if(!map)return;const point=[coords.latitude,coords.longitude];if(userMarker)userMarker.setLatLng(point);else userMarker=L.circleMarker(point,{radius:7,color:'#4ba3ff',fillOpacity:1}).addTo(map).bindPopup('A te helyzeted');if(accuracyCircle)accuracyCircle.setLatLng(point).setRadius(coords.accuracy);else accuracyCircle=L.circle(point,{radius:coords.accuracy,color:'#4ba3ff',fillOpacity:.08,weight:1}).addTo(map)}
 function startTracking(p,lock,feedback,button){
  if(!navigator.geolocation?.watchPosition){feedback.textContent='A készülék nem támogatja a folyamatos helymeghatározást.';return}
  if(watchId!==null)return;
  const generation=++watchGeneration;feedback.textContent='Helyzet keresése…';button.disabled=true;
  watchId=navigator.geolocation.watchPosition(result=>{
   if(generation!==watchGeneration)return;
   button.disabled=false;button.textContent='Helyzet frissítése';
   const l=p.location,c=result.coords,d=distance(c.latitude,c.longitude,l.lat,l.lng),accuracy=c.accuracy;
   const allowed=Number.isFinite(accuracy)&&d+accuracy<=radius;
   showPosition(c);lock.disabled=!allowed;
   feedback.textContent='Távolság: '+formatDistance(d)+' · GPS-pontosság: ±'+formatDistance(accuracy)+' · '+(allowed?'A válaszmező nyitva.':'A válaszmező zárolva. A teljes bizonytalansági körnek 200 méteren belül kell lennie.');
  },e=>{if(generation!==watchGeneration)return;if(watchId!==null)navigator.geolocation.clearWatch(watchId);watchId=null;button.disabled=false;lock.disabled=true;feedback.textContent=e.code===1?'A helymeghatározás nincs engedélyezve. Engedélyezd a böngészőben.':'Nem sikerült pontos helyzetet kérni. Próbáld újra szabad ég alatt.'},{enableHighAccuracy:true,maximumAge:0,timeout:15000});
 }
 function bind(p,norm,onCorrect){
  mountMap(p);
  const form=document.getElementById('answer-form'),lock=document.getElementById('answer-lock'),feedback=document.getElementById('feedback');
  const orderList=document.getElementById('order-list');
  if(orderList){
   orderList.addEventListener('click',e=>{
    const button=e.target.closest('button[data-move]');if(!button)return;
    const item=button.closest('li'),other=button.dataset.move==='up'?item.previousElementSibling:item.nextElementSibling;
    if(!other)return;
    if(button.dataset.move==='up')orderList.insertBefore(item,other);
    else orderList.insertBefore(other,item);
    button.focus();feedback.textContent='';
   });
   let dragged=null;
   orderList.addEventListener('dragstart',e=>{dragged=e.target.closest('li');if(dragged)e.dataTransfer.effectAllowed='move'});
   orderList.addEventListener('dragover',e=>{if(dragged&&e.target.closest('li'))e.preventDefault()});
   orderList.addEventListener('drop',e=>{
    e.preventDefault();const target=e.target.closest('li');
    if(dragged&&target&&dragged!==target){const nodes=[...orderList.children],from=nodes.indexOf(dragged),to=nodes.indexOf(target);orderList.insertBefore(dragged,from<to?target.nextSibling:target)}
    dragged=null;feedback.textContent='';
   });
   orderList.addEventListener('dragend',()=>{dragged=null});
  }
  if(p.location)document.getElementById('check-location').addEventListener('click',e=>startTracking(p,lock,document.getElementById('location-feedback'),e.currentTarget));
  const photo=document.getElementById('answer-photo');
  if(photo)photo.addEventListener('change',()=>{
   const preview=document.getElementById('photo-preview');
   if(preview.dataset.url)URL.revokeObjectURL(preview.dataset.url);
   preview.hidden=!photo.files.length;
   if(photo.files.length){preview.dataset.url=URL.createObjectURL(photo.files[0]);preview.src=preview.dataset.url}
  });
  form.addEventListener('submit',async e=>{
   e.preventDefault();
   const button=form.querySelector('button[type=submit]');button.disabled=true;
   if(p.location && !(await check(p,document.getElementById('location-feedback')))){lock.disabled=true;button.disabled=false;return}
   const type=p.answerType||'text';
   let correct=false;
   if(type==='photo'){
    const file=photo.files[0];
    correct=!!file&&file.type.startsWith('image/')&&file.size<=10*1024*1024;
    if(!correct)feedback.textContent='Válassz legfeljebb 10 MB-os képfájlt.';
   }else if(type==='choice'){
    const value=new FormData(form).get('choice');
    correct=!!value&&(p.answers||[]).some(a=>norm(a)===norm(value));
   }else if(type==='self_report'){
    correct=!!form.querySelector('#self-report-check')?.checked;
   }else if(type==='number'||type==='count'){
    const raw=form.querySelector('#answer').value.replace(',','.');
    correct=raw.trim()!==''&&Number.isFinite(Number(raw))&&(p.answers||[]).some(a=>Number(a.replace(',','.'))===Number(raw));
   }else if(type==='order'){
    correct=[...orderList.children].every((row,i)=>row.dataset.value===p.items[i]);
   }else if(type==='matching'){
    const selected=[...form.querySelectorAll('select[data-match]')].map(x=>x.value);
    correct=selected.length===p.pairs.length&&selected.every((value,i)=>value===p.pairs[i].right)&&new Set(selected).size===selected.length;
   }else correct=(p.answers||[]).some(a=>norm(a)===norm(form.querySelector('#answer').value));
   if(correct)onCorrect();
   else{if(type!=='photo')feedback.textContent=type==='self_report'?'Jelöld be, hogy teljesítettétek a feladatot.':'Ez még nem a várt válasz. Nézd át újra a feladatot!';button.disabled=false}
  });
 }
 return {locationPanel,routePanel,answerFields,bind,clearMap};
})();
