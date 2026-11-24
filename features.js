'use strict';
// Location checks run on the player's device. They deter accidental remote play,
// but browser location can be spoofed; they are not a proof of physical presence.
window.AKIBUJT_FEATURES=(()=>{
 const radius=200;
 let map=null,userMarker=null;
 const formatDistance=n=>Math.round(n)+' m';
 function distance(a,b,c,d){
  const rad=Math.PI/180,dl=(c-a)*rad,do_=(d-b)*rad;
  const x=Math.sin(dl/2)**2+Math.cos(a*rad)*Math.cos(c*rad)*Math.sin(do_/2)**2;
  return 6371000*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));
 }
 function locationPanel(p,esc){
  if(!p.location)return '';
  const l=p.location;
  return '<section class="location-gate"><h3>Helyszíni feladat</h3><p>A választ csak a helyszín 200 méteres körzetében adhatod meg. Engedélyezd a helymeghatározást; a pozíciód nem kerül a szerverünkre.</p><strong>'+esc(l.name)+'</strong><div id="location-map" role="region" aria-label="A feladat helyszíne térképen"></div><button class="btn secondary small" type="button" id="check-location">Itt vagyok – helyzet ellenőrzése</button><p id="location-feedback" class="feedback" role="status" aria-live="polite">A válaszmező még zárolva van.</p></section>';
 }
 function answerFields(p,esc){
  const type=p.answerType||'text';
  let control='';
  if(type==='choice')control='<div class="choices">'+(p.options||[]).map((o,i)=>'<label><input type="radio" name="choice" value="'+esc(o)+'" required><span>'+esc(o)+'</span></label>').join('')+'</div>';
  else if(type==='number')control='<input id="answer" type="number" step="any" inputmode="decimal" required placeholder="Írd be a számot">';
  else if(type==='photo')control='<div class="photo-answer"><input id="answer-photo" type="file" accept="image/*" capture="environment" required><p class="quiet">Legfeljebb 10 MB-os fényképet válassz. A kép csak ezen az eszközön jelenik meg, nem töltődik fel a szerverre és nem ellenőrizzük automatikusan a tartalmát.</p><img id="photo-preview" alt="A kiválasztott kép előnézete" hidden></div>';
  else control='<input id="answer" autocomplete="off" required maxlength="120" placeholder="Írd be a megfejtést">';
  return '<form class="answer-form" id="answer-form"><label class="question"'+(type==='choice'?'':' for="'+(type==='photo'?'answer-photo':'answer')+'"')+'>'+esc(p.question)+'</label><fieldset id="answer-lock" '+(p.location?'disabled':'')+'><div class="answer-row">'+control+'<button class="btn" type="submit">Ellenőrzés</button></div></fieldset><div id="feedback" class="feedback" role="status" aria-live="polite"></div></form>';
 }
 function clearMap(){if(map){map.remove();map=null}userMarker=null}
 function mountMap(p){
  clearMap();
  if(!p.location)return;
  const el=document.getElementById('location-map'),l=p.location;
  if(!window.L){el.innerHTML='<p>A térkép nem töltődött be. A helyzetellenőrzés ettől még működik.</p>';return}
  map=L.map(el,{scrollWheelZoom:false}).setView([l.lat,lng(l)],16);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> közreműködők',maxZoom:19}).addTo(map);
  L.circle([l.lat,lng(l)],{radius,color:'#591b28',fillColor:'#8d3549',fillOpacity:.13}).addTo(map);
  L.marker([l.lat,lng(l)]).addTo(map).bindPopup(l.name);
  setTimeout(()=>map&&map.invalidateSize(),100);
 }
 const lng=l=>l.lng;
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
   if(map){if(userMarker)userMarker.setLatLng([coords.latitude,coords.longitude]);else userMarker=L.circleMarker([coords.latitude,coords.longitude],{radius:7,color:'#135f67',fillOpacity:1}).addTo(map).bindPopup('A te helyzeted');}
   // Accuracy is a radius of uncertainty. Require that it fits inside the zone.
   const allowed=Number.isFinite(accuracy)&&d+accuracy<=radius;
   feedback.textContent=allowed?'A helyzet rendben. Távolság: '+formatDistance(d)+'. Válaszolhatsz.':'A válasz még zárolva van. Távolság: '+formatDistance(d)+', helyadat pontossága: ±'+formatDistance(accuracy)+'. A teljes bizonytalansági körnek 200 méteren belül kell lennie.';
   return allowed;
  }catch(e){feedback.textContent=e.message;return false}
 }
 function bind(p,norm,onCorrect){
  mountMap(p);
  const form=document.getElementById('answer-form'),lock=document.getElementById('answer-lock'),feedback=document.getElementById('feedback');
  if(p.location)document.getElementById('check-location').addEventListener('click',async e=>{
   e.currentTarget.disabled=true;
   lock.disabled=!(await check(p,document.getElementById('location-feedback')));
   e.currentTarget.disabled=false;
  });
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
   }else if(type==='number'){
    const raw=form.querySelector('#answer').value.replace(',','.');
    correct=raw.trim()!==''&&Number.isFinite(Number(raw))&&(p.answers||[]).some(a=>Number(a.replace(',','.'))===Number(raw));
   }else correct=(p.answers||[]).some(a=>norm(a)===norm(form.querySelector('#answer').value));
   if(correct)onCorrect();
   else{if(type!=='photo')feedback.textContent='Ez a nyom még nem vezet tovább. Nézd át újra a bizonyítékokat!';button.disabled=false}
  });
 }
 return {locationPanel,answerFields,bind,clearMap};
})();
