const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'games.js'),'utf8'),ctx);
const {games,supportUrl}=ctx.window.AKIBUJT;
assert.equal(supportUrl,'');assert.equal(new Set(games.map(g=>g.id)).size,games.length);
for(const g of games){
 assert.match(g.id,/^[a-z0-9-]+$/);assert.ok(fs.existsSync(path.join(root,'assets',g.image)),`Hiányzó kép: ${g.image}`);
 if(g.status!=='playable')continue;
 assert.ok(g.puzzles.length>=15,`${g.id}: túl rövid első tartalom`);
 for(const [i,p] of g.puzzles.entries()){
   for(const field of ['chapter','title','story','label','doc','question'])assert.ok(p[field]?.trim(),`${i+1}: ${field} hiányzik`);
   assert.ok(Array.isArray(p.answers)&&p.answers.length>0&&p.answers.every(Boolean),`${i+1}: válasz hiányzik`);
   assert.equal(p.hints.length,3,`${i+1}: nem három segítség`);
 }
}
assert.ok(!fs.existsSync(path.join(root,'dist/docs')),'Spoileres dokumentáció került a publikus buildbe');
console.log(`Rendben: ${games.length} adatlap, ${games.filter(g=>g.status==='playable').reduce((n,g)=>n+g.puzzles.length,0)} játszható feladvány, 3 segítség/feladvány.`);
