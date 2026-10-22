const assert=require('node:assert/strict');
const fs=require('node:fs');
const {grade,stats}=require('./dist/logic.js');
const data=JSON.parse(fs.readFileSync('dist/chapters.json','utf8'));
assert.equal(data.edition,'《初级会计学》第9版');
assert.deepEqual(data.chapters.map(c=>c.questions.length),[20,30,14,18,12,12,32]);
const ids=new Set();
for(const c of data.chapters){for(const s of c.sources)assert.ok(fs.existsSync('dist/'+s.url));for(const q of c.questions){assert.ok(!ids.has(q.id));ids.add(q.id);assert.ok(q.stem&&q.explanation&&q.origin);if(q.correct){assert.ok(q.correct.every(i=>i>=0&&i<q.options.length));assert.equal(grade(q,q.correct),true);}}}
const multi={id:'q',correct:[0,2]};assert.equal(grade(multi,[2,0]),true);assert.equal(grade(multi,[0]),false);assert.equal(grade(multi,[0,1,2]),false);
const qs=[{id:'a'},{id:'b'},{id:'c'}];
const r={a:{firstAttempt:{method:'auto',correct:true,seenBeforeSubmit:false}},b:{seen:true,firstAttempt:{method:'auto',correct:true,seenBeforeSubmit:true}},c:{firstAttempt:{method:'self',correct:true,seenBeforeSubmit:false}}};
assert.deepEqual(stats(qs,r),{total:3,attempted:3,independent:1,seen:1,wrong:0,self:1});
assert.equal(/<details[^>]*\bopen\b/.test(fs.readFileSync('dist/index.html','utf8')),false);
console.log(JSON.stringify({chapters:data.chapters.length,questions:ids.size,checks:'passed'}));
