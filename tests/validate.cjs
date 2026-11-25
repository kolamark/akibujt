const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'games.js'),'utf8'),ctx);
const {games,supportUrl}=ctx.window.AKIBUJT;
assert.equal(supportUrl,'');assert.equal(new Set(games.map(g=>g.id)).size,games.length);
for(const g of games){
 assert.match(g.id,/^[a-z0-9-]+$/);assert.ok(g.image.startsWith('theme-')?fs.existsSync(path.join(root,'assets','cover-themes.webp')):fs.existsSync(path.join(root,'assets',g.image)),`Hiányzó kép: ${g.image}`);
 if(g.status!=='playable')continue;
 assert.ok(g.puzzles.length>=1,`${g.id}: üres játszható játék`);
 for(const [i,p] of g.puzzles.entries()){
   for(const field of ['title','question'])assert.ok(p[field]?.trim(),`${g.id} ${i+1}: ${field} hiányzik`);
   assert.ok(Array.isArray(p.answers),`${g.id} ${i+1}: válaszlista hiányzik`);
   if(!['photo','order','matching','self_report'].includes(p.answerType))assert.ok(p.answers.length>0&&p.answers.every(Boolean),`${g.id} ${i+1}: válasz hiányzik`);
   assert.ok(Array.isArray(p.hints),`${g.id} ${i+1}: segítséglista hiányzik`);
   if(g.kind==='investigation'||g.id==='az-elveszett-orokseg')assert.equal(p.hints.length,3,`${g.id} ${i+1}: nem három segítség`);
   if(g.locationRequired){assert.ok(p.location?.name,`${g.id} ${i+1}: helyszín hiányzik`);assert.ok(Number.isFinite(p.location.lat)&&Number.isFinite(p.location.lng),`${g.id} ${i+1}: koordináta hiányzik`)}
 }
}
const route=games.find(g=>g.id==='bpbujocska'),test=games.find(g=>g.id==='helymeghatarozas-teszt');
assert.equal(route.kind,'adventure');assert.equal(route.puzzles.length,8);assert.equal(route.status,'playable');
assert.equal(test.puzzles.length,2);assert.equal(test.puzzles[0].location.name.includes('Palotás utca 2.'),true);
assert.equal(test.puzzles[1].location.name.includes('Halászbástya'),true);
assert.ok(!fs.existsSync(path.join(root,'dist/docs')),'Spoileres dokumentáció került a publikus buildbe');
console.log(`Rendben: ${games.length} adatlap, ${games.filter(g=>g.status==='playable').reduce((n,g)=>n+g.puzzles.length,0)} játszható feladvány.`);
