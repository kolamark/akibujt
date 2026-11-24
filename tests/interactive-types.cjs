const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const context={window:{},document:null,navigator:{},setTimeout};
vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../features.js'),'utf8'),context);
const features=context.window.AKIBUJT_FEATURES;
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;');
assert.match(features.answerFields({answerType:'order',items:['Első','Második'],title:'Próba',question:'Sorrend?'},esc),/order-list/);
assert.match(features.answerFields({answerType:'matching',pairs:[{left:'A',right:'1'},{left:'B',right:'2'}],title:'Próba',question:'Pár?'},esc),/match-list/);

async function run(p,rows,expected){
 const elements={};
 for(const id of ['answer-form','answer-lock','feedback']){
  elements[id]={listeners:{},addEventListener(name,fn){this.listeners[name]=fn},disabled:false,textContent:''};
 }
 const button={disabled:false};
 elements['answer-form'].querySelector=()=>button;
 elements['answer-form'].querySelectorAll=()=>rows;
 if(p.answerType==='order'){
  elements['order-list']={children:rows,listeners:{},addEventListener(name,fn){this.listeners[name]=fn}};
 }
 context.document={getElementById:id=>elements[id]||null};
 let completed=0;
 features.bind(p,x=>x,()=>completed++);
 await elements['answer-form'].listeners.submit({preventDefault(){}});
 assert.equal(completed,expected);
 return {elements,completed};
}
(async()=>{
 const order={answerType:'order',items:['A','B','C']};
 await run(order,[{dataset:{value:'B'}},{dataset:{value:'A'}},{dataset:{value:'C'}}],0);
 await run(order,[{dataset:{value:'A'}},{dataset:{value:'B'}},{dataset:{value:'C'}}],1);
 const pairs={answerType:'matching',pairs:[{left:'Kereső',right:'Híd'},{left:'Bújó',right:'Park'}]};
 await run(pairs,[{value:'Park'},{value:'Híd'}],0);
 await run(pairs,[{value:'Híd'},{value:'Park'}],1);
 console.log('Rendezés és párosítás: helyes és hibás megoldások ellenőrizve.');
})().catch(e=>{console.error(e);process.exitCode=1});
