const {chromium}=require('C:/Users/maoyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs');
const assert=require('node:assert/strict');
(async()=>{
fs.mkdirSync('qa',{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
try{
const page=await browser.newPage({viewport:{width:1440,height:1080}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:8766/');
await page.locator('.chapter-card').first().waitFor();assert.equal(await page.locator('.chapter-card').count(),7);
await page.screenshot({path:'qa/home-desktop.png',fullPage:true});
// Inspect every chapter and every question, including answers initially hidden.
const data=JSON.parse(fs.readFileSync('dist/chapters.json','utf8'));
for(const c of data.chapters){
 await page.goto('http://127.0.0.1:8766/#chapter/'+c.id+'/practice');
 await page.locator('.question-stem').waitFor();
 assert.equal(await page.locator('.number-grid button').count(),c.questions.length);
 assert.equal(await page.locator('details[open]').count(),0);
 assert.equal(await page.locator('.solution-content').isVisible(),false);
 await page.goto('http://127.0.0.1:8766/#chapter/'+c.id+'/knowledge');
 await page.locator('.lesson-unit').first().waitFor();assert.equal(await page.locator('.lesson-unit').count(),c.lessons.length);
 assert.equal(await page.locator('.tabs .tab').count(),4);
 assert.equal(await page.locator('.teaching-solution[open]').count(),0);
 const beforeExamples=await page.evaluate(()=>localStorage.getItem('accounting-study-room-records-v1'));
 await page.locator('.teaching-solution summary').first().click();
 assert.equal(await page.locator('.example-solution').first().isVisible(),true);
 assert.equal(await page.evaluate(()=>localStorage.getItem('accounting-study-room-records-v1')),beforeExamples);
 await page.goto('http://127.0.0.1:8766/#chapter/'+c.id+'/quick');
 await page.locator('.knowledge-item').first().waitFor();assert.equal(await page.locator('.knowledge-item').count(),c.knowledge.length);
 await page.goto('http://127.0.0.1:8766/#chapter/'+c.id+'/sources');await page.locator('.coverage-table').waitFor();
 await page.locator('.coverage-table>summary').click();assert.equal(await page.locator('.coverage-table tbody tr').count(),c.sourceAudit.length);
 for(const s of c.sources){const res=await page.request.get('http://127.0.0.1:8766/'+s.url);assert.equal(res.status(),200);}
}
await page.goto('http://127.0.0.1:8766/#chapter/2/practice');
await page.locator('.question-stem').waitFor();await page.locator('input[name=choice][value="0"]').check();await page.locator('[data-action=submit]').click();
let a=await page.evaluate(()=>JSON.parse(localStorage.getItem('accounting-study-room-records-v1'))['T2-4']);assert.equal(a.firstAttempt.correct,true);assert.equal(a.firstAttempt.seenBeforeSubmit,false);
await page.locator('[data-action=next]').click();await page.locator('.solution summary').click();await page.waitForFunction(()=>JSON.parse(localStorage.getItem('accounting-study-room-records-v1'))['T2-5']?.seenBeforeSubmit===true);
await page.locator('input[name=choice][value="1"]').check();await page.locator('[data-action=submit]').click();
a=await page.evaluate(()=>JSON.parse(localStorage.getItem('accounting-study-room-records-v1'))['T2-5']);assert.equal(a.firstAttempt.correct,true);assert.equal(a.firstAttempt.seenBeforeSubmit,true);
await page.goto('http://127.0.0.1:8766/#chapter/3/practice/ZB3-04');await page.locator('#written-answer').waitFor();await page.locator('#written-answer').fill('期末借方余额70 000元，50000+80000-60000。');await page.locator('[data-action=submit]').click();await page.locator('.solution summary').click();await page.locator('[data-action=self-correct]').click();
a=await page.evaluate(()=>JSON.parse(localStorage.getItem('accounting-study-room-records-v1'))['ZB3-04']);assert.equal(a.firstAttempt.method,'self');assert.equal(a.currentCorrect,true);
await page.reload();await page.locator('.question-stem').waitFor();assert.ok((await page.locator('#written-answer').inputValue()).includes('70 000'));assert.equal(await page.locator('details[open]').count(),0);
await page.goto('http://127.0.0.1:8766/#chapter/7/practice/S7-18');await page.locator('.question-stem').waitFor();assert.ok((await page.locator('.question-meta').textContent()).includes('S7-18'));
await page.locator('input[name=choice][value="2"]').check();await page.locator('[data-action=submit]').click();assert.ok((await page.locator('.verdict').textContent()).includes('正确'));
await page.locator('.solution summary').click();await page.screenshot({path:'qa/practice-desktop.png',fullPage:true});
await page.locator('[data-action=bookmark]').click();assert.equal(await page.locator('.bookmark').getAttribute('aria-pressed'),'true');
await page.locator('#practice-filter').selectOption('bookmarked');assert.equal(await page.locator('.number-grid button').count(),1);
await page.locator('#search').fill('红字');await page.locator('.search-result').first().waitFor();assert.ok(await page.locator('.search-result').count()>0);
await page.locator('.topbar [data-action=add]').click();await page.locator('#new-title').fill('成本计算');await page.locator('#update-form button[type=submit]').click();assert.ok((await page.locator('#update-request').inputValue()).includes('第9版'));assert.ok((await page.locator('#update-request').inputValue()).includes('不创建新网址'));await page.locator('[data-action=close-dialog]').click();
// A wrong answer persists across visits. Reviewing must clear choices and hide solutions.
await page.goto('http://127.0.0.1:8766/#chapter/2/practice/T2-6');await page.locator('.question-stem').waitFor();await page.locator('input[name=choice][value="0"]').check();await page.locator('[data-action=submit]').click();
a=await page.evaluate(()=>JSON.parse(localStorage.getItem('accounting-study-room-records-v1'))['T2-6']);assert.equal(a.needsReview,true);assert.equal(a.wrongCount,1);
await page.goto('http://127.0.0.1:8766/#wrongs');await page.locator('.wrong-row').waitFor();await page.reload();await page.locator('.wrong-row').waitFor();assert.equal(await page.locator('.wrong-row').count(),1);
await page.locator('[data-action=wrong-review]').click();await page.locator('.question-stem').waitFor();assert.equal(await page.locator('input[name=choice]:checked').count(),0);assert.equal(await page.locator('details[open]').count(),0);
await page.locator('.solution summary').click();await page.locator('input[name=choice][value="1"]').check();await page.locator('[data-action=submit]').click();a=await page.evaluate(()=>JSON.parse(localStorage.getItem('accounting-study-room-records-v1'))['T2-6']);assert.equal(a.needsReview,true);
await page.goto('http://127.0.0.1:8766/#wrongs');await page.locator('.wrong-row').waitFor();await page.locator('[data-action=wrong-review]').click();await page.locator('.question-stem').waitFor();assert.equal(await page.locator('input[name=choice]:checked').count(),0);assert.equal(await page.locator('details[open]').count(),0);await page.locator('input[name=choice][value="1"]').check();await page.locator('[data-action=submit]').click();
a=await page.evaluate(()=>JSON.parse(localStorage.getItem('accounting-study-room-records-v1'))['T2-6']);assert.equal(a.needsReview,false);assert.equal(a.firstAttempt.correct,false);assert.equal(a.wrongCount,1);assert.equal(a.history.length,3);
await page.goto('http://127.0.0.1:8766/#wrongs');await page.locator('.wrong-tabs').waitFor();await page.locator('[data-action=wrong-tab][data-tab=passed]').click();assert.equal(await page.locator('.wrong-row').count(),1);await page.screenshot({path:'qa/wrong-book-desktop.png',fullPage:true});
const downloadPromise=page.waitForEvent('download');await page.locator('.sidebar [data-action=export]').click();const download=await downloadPromise;await download.saveAs('qa/progress-backup.json');assert.equal(JSON.parse(fs.readFileSync('qa/progress-backup.json','utf8')).version,1);
// Restore an exported backup and verify it is accepted without changing question content.
await page.locator('#import-file').setInputFiles('qa/progress-backup.json');await page.waitForFunction(()=>document.querySelector('#toast').textContent.includes('已导入'));
const roundTrip=await page.evaluate(()=>JSON.parse(localStorage.getItem('accounting-study-room-records-v1'))['T2-6']);
const exported=JSON.parse(fs.readFileSync('qa/progress-backup.json','utf8')).records['T2-6'];
for(const key of ['firstAttempt','bookmark','wrongCount','history','outcomeForAttempt','outcomeCorrect'])assert.deepEqual(roundTrip[key],exported[key],'round trip '+key);
await page.setViewportSize({width:390,height:844});await page.goto('http://127.0.0.1:8766/#home');await page.locator('.chapter-card').first().waitFor();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth),false);await page.screenshot({path:'qa/home-mobile.png',fullPage:true});
await page.goto('http://127.0.0.1:8766/#chapter/4/practice/ZB4-11');await page.locator('.question-stem').waitFor();assert.equal(await page.locator('details[open]').count(),0);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth),false);await page.screenshot({path:'qa/practice-mobile.png',fullPage:true});
// Detailed search deep-link, complete long solution and old-record migration on a fresh browser context.
await page.locator('#search').fill('普通年金');await page.locator('.search-result').first().waitFor();
assert.equal(await page.locator('.search-result .solution-content').count(),0);
await page.locator('a[href="#chapter/2/knowledge/annuity"]').click();await page.locator('#lesson-annuity').waitFor();await page.waitForTimeout(100);
assert.ok(Math.abs((await page.locator('#lesson-annuity').boundingBox()).y)<60);
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth),false);
await page.screenshot({path:'qa/learning-mobile.png',fullPage:false});
await page.goto('http://127.0.0.1:8766/#chapter/4/practice/UP4-20');await page.locator('#written-answer').waitFor();
assert.equal(await page.locator('.solution-content').isVisible(),false);
await page.locator('#written-answer').fill('独立过程测试：完工15000，利润5250，银行33550。');await page.locator('[data-action=submit]').click();await page.locator('.solution summary').click();
assert.ok((await page.locator('.solution-content').textContent()).includes('33 550'));
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth),false);
await page.screenshot({path:'qa/comprehensive-mobile.png',fullPage:true});
await page.setViewportSize({width:1440,height:1080});await page.goto('http://127.0.0.1:8766/#chapter/4/knowledge/continuous');await page.locator('#lesson-continuous').waitFor();
await page.locator('#lesson-continuous .teaching-solution summary').click();await page.waitForTimeout(100);await page.screenshot({path:'qa/learning-desktop.png',fullPage:false});
const legacyContext=await browser.newContext();const legacy=await legacyContext.newPage();
const oldRecord={choices:[0],text:'旧作答内容',seen:true,seenBeforeSubmit:false,submitted:true,bookmark:true,attemptSeen:false,firstAttempt:{method:'auto',correct:false,seenBeforeSubmit:false},currentCorrect:false,needsReview:true,wrongCount:2,lastWrongAt:'2026-10-20T09:00:00.000Z',attemptNumber:2,outcomeForAttempt:2,outcomeCorrect:false,history:[{correct:false,seen:false,method:'auto',at:'2026-10-20T09:00:00.000Z'}]};
await legacy.addInitScript(value=>{localStorage.setItem('accounting-study-room-records-v1',JSON.stringify({'T2-6':value}));},oldRecord);
await legacy.goto('http://127.0.0.1:8766/#chapter/2/knowledge');await legacy.locator('.lesson-unit').first().waitFor();
assert.deepEqual(await legacy.evaluate(()=>JSON.parse(localStorage.getItem('accounting-study-room-records-v1'))['T2-6']),oldRecord);
await legacy.goto('http://127.0.0.1:8766/#wrongs');await legacy.locator('.wrong-row').waitFor();
await legacy.locator('[data-action=wrong-review]').click();await legacy.locator('.question-stem').waitFor();
assert.equal(await legacy.locator('input:checked').count(),0);assert.equal(await legacy.locator('.solution[open]').count(),0);
let preserved=await legacy.evaluate(()=>JSON.parse(localStorage.getItem('accounting-study-room-records-v1'))['T2-6']);assert.deepEqual(preserved.firstAttempt,oldRecord.firstAttempt);assert.equal(preserved.bookmark,true);assert.deepEqual(preserved.history,oldRecord.history);assert.equal(preserved.wrongCount,2);
await legacyContext.close();
assert.deepEqual(errors,[]);console.log(JSON.stringify({chapters:7,lessons:data.chapters.reduce((n,c)=>n+c.lessons.length,0),questions:data.chapters.reduce((n,c)=>n+c.questions.length,0),fourTabs:true,pageMapping:true,teachingNotGraded:true,defaultHidden:true,independentVsSeen:true,wrongBookPersistent:true,reviewClearsAnswers:true,seenReviewStaysPending:true,closedBookPassKeepsHistory:true,legacyRecordPreserved:true,subjectiveSelfAssessment:true,deepLinks:true,search:true,bookmark:true,exportImport:true,requestForNewChapter:true,mobileOverflow:false,consoleErrors:errors}));
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});


