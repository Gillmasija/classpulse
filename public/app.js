import { today, validate, percentage, summarize, byTopic, filterRecords } from './model.js';
import { load, save, demoRecords } from './storage.js';

const app=document.querySelector('#app');
const banner=document.querySelector('#storage-message');
let storage;
try { storage=window.localStorage; } catch { /* load handles denied storage */ }
let {records,error}=load(storage);
let blocked=Boolean(error);
const page=location.pathname.split('/').pop() || 'index.html';
const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const pct=value=>value===null?'—':`${Math.round(value)}%`;
function message(text) {
  banner.hidden=!text; banner.className='error'; banner.textContent=text || '';
}
message(error);
function persist(next) {
  if(blocked) {message('Storage needs attention. No changes were saved. Resolve the storage error or explicitly reset the data.');return false;}
  const result=save(storage,next);
  message(result.error);
  if(result.error) return false;
  records=next; return true;
}
function empty(title,detail) {return `<div class="empty"><h3>${title}</h3><p>${detail}</p></div>`;}
function render() {
  if(page==='assessments.html') renderAssessments();
  else app.innerHTML=`<section class="panel"><h2>Your workspace is ready</h2><p>Start with a classroom checkpoint. Your records stay in this browser.</p><a class="button" href="assessments.html">Add an assessment</a></section>`;
}
function renderAssessments() {
  app.innerHTML=`<div class="two-col"><section class="panel"><p class="eyebrow">New checkpoint</p><h2>Add an assessment</h2><p class="muted">Use a learner alias, not a full name. Every checkpoint is weighted equally.</p>
  <form id="assessment-form" class="stack" novalidate><div id="form-message" tabindex="-1" role="alert" hidden></div><div class="form-grid">
  <div><label for="learner">Learner alias</label><input id="learner" name="learner" placeholder="e.g. Learner 05" maxlength="60" required autocomplete="off"></div>
  <div><label for="topic">Topic</label><input id="topic" name="topic" placeholder="e.g. Fractions" maxlength="60" required list="topic-suggestions"><datalist id="topic-suggestions">${byTopic(records).map(t=>`<option value="${escape(t.topic)}"></option>`).join('')}</datalist></div>
  <div><label for="score">Score earned</label><input id="score" name="score" type="number" step="any" min="0" required placeholder="7"></div><div><label for="maximum">Maximum score</label><input id="maximum" name="maximum" type="number" step="any" min="0.01" max="10000" value="10" required></div>
  <div class="full"><label for="date">Assessment date</label><input id="date" name="date" type="date" min="2000-01-01" max="${today()}" value="${today()}" required></div></div>
  <button type="submit">Save assessment</button><p class="hint">Saved only after this browser confirms the write.</p></form></section>
  <aside class="panel"><span class="tag">A teaching companion</span><h2 style="margin-top:20px">Small checkpoints.<br>Useful conversations.</h2><p class="muted">A score is one piece of evidence. Pair it with your observations before deciding what a learner needs.</p><hr><h3>Just exploring?</h3><p class="muted">Try 12 synthetic assessments across three topics. Demo data can be loaded only into an empty workspace.</p><button class="secondary" id="load-demo" ${records.length?'disabled':''}>Load demo data</button><p class="privacy">Browser data can be cleared by your browser. Do not use this prototype as your only record of student progress.</p></aside></div>
  <section class="panel" style="margin-top:24px" id="records-panel"><h2>Assessment records</h2><div id="records-list"></div></section><p id="status" class="success" role="status" hidden></p>`;
  document.querySelector('#assessment-form').addEventListener('submit',event=>{
    event.preventDefault();
    const form=event.currentTarget;
    const checked=validate(Object.fromEntries(new FormData(form)));
    const notice=document.querySelector('#form-message');
    if(checked.errors.length) {notice.hidden=false;notice.className='error';notice.textContent=checked.errors.join(' ');notice.focus();return;}
    if(!persist([...records,{id:crypto.randomUUID(),...checked.value}])) return;
    form.reset();form.elements.date.value=today();notice.hidden=true;
    renderRecordList();
    document.querySelector('#load-demo').disabled=true;
    const status=document.querySelector('#status');status.hidden=false;status.textContent=`Assessment saved for ${checked.value.learner}.`;
    form.elements.learner.focus();
  });
  document.querySelector('#load-demo').addEventListener('click',()=>{
    if(!records.length && persist(demoRecords())) render();
  });
  renderRecordList();
}
function renderRecordList() {
  document.querySelector('#records-list').innerHTML=records.length?`<p>${records.length} assessments saved in this browser.</p>`:empty('No assessments yet','Add your first checkpoint above, or explore with synthetic demo data.');
}
try { render(); } catch { app.textContent='The workspace could not load. Reload this page to try again. Existing browser data has not been cleared.'; }
