const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
const {grade,stats}=require('./dist/logic.js');
const data=JSON.parse(fs.readFileSync('dist/chapters.json','utf8'));
assert.equal(data.edition,'《初级会计学》第9版');
const baseline=JSON.parse(fs.readFileSync('baseline-questions.json','utf8'));
assert.equal(baseline.length,138);
assert.deepEqual(data.chapters.map(c=>c.questions.filter(q=>!q.id.startsWith('UP')).length),[20,30,14,18,12,12,32]);
const ids=new Set();
for(const c of data.chapters){for(const s of c.sources)assert.ok(fs.existsSync('dist/'+s.url));for(const q of c.questions){assert.ok(!ids.has(q.id));ids.add(q.id);assert.ok(q.stem&&q.explanation&&q.origin);if(q.correct){assert.ok(q.correct.every(i=>i>=0&&i<q.options.length));assert.equal(grade(q,q.correct),true);}}}
const questions=new Map(data.chapters.flatMap(c=>c.questions).map(q=>[q.id,q]));
for(const old of baseline){const q=questions.get(old.id);assert.ok(q,old.id);assert.deepEqual(q.correct,old.correct,old.id+' answer changed');const serialized=`[${JSON.stringify(q.stem)}, [${q.options.map(v=>JSON.stringify(v)).join(', ')}]]`;assert.equal(crypto.createHash('sha256').update(serialized).digest('hex'),old.contentHash,old.id+' question changed');}
let lessonCount=0,pageCount=0;
for(const c of data.chapters){
 assert.ok(c.lessons.length>=7);const lessonIds=new Set(c.lessons.map(u=>u.id));assert.equal(lessonIds.size,c.lessons.length);
 for(const u of c.lessons){lessonCount++;assert.ok(u.explanation&&u.rules.length&&u.pitfalls.length&&u.examples.length&&u.practiceIds.length,u.id);for(const id of u.practiceIds)assert.ok(questions.has(id),c.id+'/'+u.id+' missing '+id);for(const e of u.examples){assert.ok(e.stem&&e.solution);assert.ok(!ids.has(e.id));}for(const r of u.sourceRefs){assert.ok(c.sources[r.source]);assert.ok(r.start>=1&&r.end>=r.start&&r.end<=c.sources[r.source].pageCount);}}
 const expected=c.sources.reduce((n,s)=>n+s.pageCount,0);assert.equal(c.sourceAudit.length,expected);
 for(const r of c.sourceAudit){pageCount++;assert.notEqual(r.status,'待补充对应',c.id+' page '+r.page);if(r.kind==='教学内容')assert.ok(r.lessonIds.length,c.id+' content page '+r.page);r.lessonIds.forEach(id=>assert.ok(lessonIds.has(id)));r.practiceIds.forEach(id=>assert.ok(questions.has(id)));}
 for(const q of c.questions.filter(q=>q.id.startsWith('UP'))){assert.ok(c.lessons.some(u=>u.practiceIds.includes(q.id)),q.id+' has no lesson');if(!q.correct)assert.ok(q.selfCheck.length>=2);}
}
assert.equal(pageCount,347);
// Independent numeric checks of representative authored answers and one complete business chain.
const approx=(a,b)=>assert.ok(Math.abs(a-b)<0.011,`${a} != ${b}`);
approx(12100/1.1**2,10000);approx(1210/1.1+1210/1.1**2,2100);approx(1210+1210/1.1,2310);
approx(1000/.05,20000);assert.equal(20000-3000-1000,16000);
assert.equal(10000/500*300+5000+3000,14000);
const bank=30000-11300-4000-1000+22600-1000-1750,goods=(100-80)*150,net=(20000-12000-1000)*.75;
assert.equal(bank,33550);assert.equal(net,5250);assert.equal(bank+goods,(2600-1300)+500+30000+net-500);
assert.ok(questions.get('UP4-20').explanation.includes('33 550'));
assert.ok(questions.get('ZB4-03').errata.includes('在途物资'));
assert.ok(data.chapters[6].gaps[0].includes('下半'));
const multi={id:'q',correct:[0,2]};assert.equal(grade(multi,[2,0]),true);assert.equal(grade(multi,[0]),false);assert.equal(grade(multi,[0,1,2]),false);
const qs=[{id:'a'},{id:'b'},{id:'c'}];
const r={a:{firstAttempt:{method:'auto',correct:true,seenBeforeSubmit:false}},b:{seen:true,firstAttempt:{method:'auto',correct:true,seenBeforeSubmit:true}},c:{firstAttempt:{method:'self',correct:true,seenBeforeSubmit:false}}};
assert.deepEqual(stats(qs,r),{total:3,attempted:3,independent:1,seen:1,wrong:0,self:1});
assert.equal(/<details[^>]*\bopen\b/.test(fs.readFileSync('dist/index.html','utf8')),false);
console.log(JSON.stringify({chapters:data.chapters.length,lessons:lessonCount,pages:pageCount,questions:ids.size,oldQuestionsPreserved:138,checks:'passed'}));
