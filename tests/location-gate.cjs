const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const data={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../games.js'),'utf8'),data);
const stages=data.window.AKIBUJT.games.find(g=>g.id==='helymeghatarozas-teszt').puzzles;
let coords,listener,cleared=0;
const ctx={window:{},setTimeout,navigator:{geolocation:{getCurrentPosition(ok){ok({coords})},watchPosition(ok){listener=ok;return 7},clearWatch(){cleared++}}}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../features.js'),'utf8'),ctx);

async function check(stage,position){
 ctx.window.AKIBUJT_FEATURES.clearMap();coords=position;
 const elements={};
 for(const id of ['location-map','location-feedback','check-location','answer-form','answer-lock','feedback'])elements[id]={listeners:{},addEventListener(event,fn){this.listeners[event]=fn},disabled:false,textContent:'',innerHTML:''};
 elements['answer-form'].querySelector=()=>({disabled:false});
 ctx.document={getElementById:id=>elements[id]||null};
 ctx.window.AKIBUJT_FEATURES.bind(stage,x=>x,()=>{});
 assert.match(ctx.window.AKIBUJT_FEATURES.answerFields(stage,s=>s),/fieldset id="answer-lock" disabled/);
 await elements['check-location'].listeners.click({currentTarget:elements['check-location']});
 listener({coords});
 return {unlocked:!elements['answer-lock'].disabled,message:elements['location-feedback'].textContent};
}
(async()=>{
 const a=stages[0].location,b=stages[1].location;
 let r=await check(stages[0],{latitude:a.lat,longitude:a.lng,accuracy:10});assert.equal(r.unlocked,true,r.message);
 r=await check(stages[0],{latitude:a.lat+0.0018,longitude:a.lng,accuracy:20});assert.equal(r.unlocked,false,r.message);
 r=await check(stages[0],{latitude:a.lat+0.0017,longitude:a.lng,accuracy:30});assert.equal(r.unlocked,false,r.message);
 r=await check(stages[1],{latitude:a.lat,longitude:a.lng,accuracy:10});assert.equal(r.unlocked,false,r.message);
 r=await check(stages[1],{latitude:b.lat,longitude:b.lng,accuracy:10});assert.equal(r.unlocked,true,r.message);
 ctx.window.AKIBUJT_FEATURES.clearMap();assert.ok(cleared>=5);
 console.log('A két GPS-kapu, az élő követés, a 200 m-es határ és a pontosság ellenőrizve.');
})().catch(e=>{console.error(e);process.exitCode=1});
