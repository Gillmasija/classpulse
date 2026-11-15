import { today, validate, percentage, summarize, byTopic, filterRecords } from './model.js';
import { load, save, demoRecords } from './storage.js';
import { toCsv } from './export.js';

const app=document.querySelector('#app');
const banner=document.querySelector('#storage-message');
let storage;
try { storage=window.localStorage; } catch { /* load handles denied storage */ }
let {records,error}=load(storage);
let blocked=Boolean(error);
let query='';
let selectedTopic='';
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
  else if(page==='insights.html') renderInsights();
  else renderOverview();
  app.insertAdjacentHTML('beforeend',`<section id="data-controls" class="panel" style="margin-top:24px"><div class="panel-head"><div><h2>Your data, your browser</h2><p class="muted">Export a copy before clearing storage. CSV import is not supported in this version.</p></div><div class="actions"><button class="secondary" id="export-data">Export ${page==='assessments.html'?'filtered records':'all records'}</button>${page==='insights.html'?'<button class="secondary" id="print-report">Print report</button>':''}<button class="danger" id="reset-data">Reset data</button></div></div><p id="export-status" class="hint" role="status"></p></section>`);
  document.querySelector('#export-data').onclick=()=>{
    const exported=page==='assessments.html'?filterRecords(records,query,selectedTopic):records;
    if(!exported.length){document.querySelector('#export-status').textContent='No matching records to export. Add data or adjust your filters.';return;}
    const url=URL.createObjectURL(new Blob([toCsv(exported)],{type:'text/csv;charset=utf-8;'}));
    const link=document.createElement('a');link.href=url;link.download=`classpulse-${today()}.csv`;link.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    document.querySelector('#export-status').textContent=`Export prepared: ${exported.length} assessments. Check your browser downloads.`;
  };
  document.querySelector('#print-report')?.addEventListener('click',()=>window.print());
  document.querySelector('#reset-data').onclick=()=>confirmAction('Clear all ClassPulse data?','This clears only ClassPulse records in this browser, including unreadable data. Export first if needed. This cannot be undone.',()=>{
    const result=save(storage,[]);message(result.error);
    if(!result.error){records=[];blocked=false;query='';selectedTopic='';render();document.querySelector('#reset-data').focus();}
  });
}
function metrics() {
  const stats=summarize(records);
  return `<div class="cards"><section class="card"><p class="muted">Assessments recorded</p><strong class="metric">${stats.count}</strong><p class="hint">Individual learning checkpoints</p></section><section class="card"><p class="muted">Mean assessment score</p><strong class="metric">${pct(stats.mean)}</strong><p class="hint">Equal weight for every assessment</p></section><section class="card"><p class="muted">Learners represented</p><strong class="metric">${stats.learners}</strong><p class="hint">Distinct aliases in this workspace</p></section></div>`;
}
function topicsMarkup() {
  return byTopic(records).map(t=>`<div class="topic"><div class="topic-head"><strong>${escape(t.topic)}</strong><strong>${pct(t.mean)}</strong></div><div class="bar" role="img" aria-label="${escape(t.topic)}: mean score ${pct(t.mean)}"><span style="width:${t.mean}%"></span></div><p class="hint">${t.count} assessments · ${t.learners} learners · ${t.review} below 60%</p></div>`).join('') || empty('Topic patterns will appear here','Add assessments to compare topics.');
}
function renderOverview() {
  const stats=summarize(records);
  app.innerHTML=`<div class="actions" style="margin-bottom:24px"><a class="button" href="assessments.html">+ Add assessment</a><a class="button secondary" href="insights.html">Explore insights →</a></div>${metrics()}
  ${!records.length?'<div class="notice">Welcome to your empty workspace. Add a checkpoint or load synthetic demo data from Assessments to explore.</div>':''}
  <div class="two-col"><section class="panel"><div class="panel-head"><h2>How are topics landing?</h2><span class="tag">Lowest mean first</span></div>${topicsMarkup()}</section>
  <section class="panel"><p class="eyebrow">Your next teaching move</p><h2>${stats.review?'Make room for a check-in.':records.length?'Keep the conversation going.':'Start with one checkpoint.'}</h2><p class="muted">${stats.review?`${stats.review} of ${stats.count} assessments scored below 60%. Review these alongside your classroom observations.`:records.length?'No recorded assessments are below 60%. Scores alone do not show the full picture; invite learners to explain their thinking.':'A quick quiz, an exit ticket, or a practice task can help you choose what to revisit.'}</p><a href="insights.html">Review learning signals →</a><p class="privacy">The 60% threshold is a fixed demo heuristic, not a diagnosis or a grading policy.</p></section></div>
  <section class="panel" style="margin-top:24px"><div class="panel-head"><h2>Recent checkpoints</h2><a href="assessments.html">View all records →</a></div>${records.length?`<div class="table-wrap"><table><thead><tr><th scope="col">Learner</th><th scope="col">Topic</th><th scope="col">Date</th><th scope="col">Score</th></tr></thead><tbody>${filterRecords(records).slice(0,5).map(r=>`<tr><td>${escape(r.learner)}</td><td>${escape(r.topic)}</td><td>${r.date}</td><td>${pct(percentage(r))}</td></tr>`).join('')}</tbody></table></div>`:empty('No checkpoints yet','Your five most recent assessments will appear here.')}</section>`;
}
function renderInsights() {
  const review=filterRecords(records).filter(r=>percentage(r)<60);
  app.innerHTML=`${metrics()}<div class="two-col"><section class="panel"><div class="panel-head"><h2>Topic snapshot</h2><span class="tag">All recorded dates</span></div>${topicsMarkup()}</section><section class="panel"><p class="eyebrow">How to read this</p><h2>Evidence, with context.</h2><p class="muted">Each assessment is converted to a percentage. Topic means average those percentages with equal weight; a 10-point quiz counts as much as a 20-point quiz.</p><p class="muted">Repeat assessments are included. Different task difficulty and small samples can affect comparisons. Check the assessment count before drawing conclusions.</p><p class="privacy">Aliases are matched without case sensitivity. Spelling variations count as separate learners or topics.</p></section></div>
  <section class="panel" style="margin-top:24px"><div class="panel-head"><div><h2>Check-in queue</h2><p class="muted">Individual assessments below 60%, newest first. A prompt for conversation.</p></div><span class="tag support">${review.length} checkpoints</span></div>${review.length?`<div class="table-wrap"><table><thead><tr><th scope="col">Learner</th><th scope="col">Topic</th><th scope="col">Date</th><th scope="col">Score</th><th scope="col">Suggested next step</th></tr></thead><tbody>${review.map(r=>`<tr><td>${escape(r.learner)}</td><td>${escape(r.topic)}</td><td>${r.date}</td><td>${pct(percentage(r))}</td><td>Review one example together</td></tr>`).join('')}</tbody></table></div>`:empty(records.length?'No checkpoints below 60%':'No evidence to review yet',records.length?'Keep checking understanding through conversation and practice.':'Add assessments to build your first topic snapshot.')}</section>`;
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
  <section class="panel" style="margin-top:24px" id="records-panel"><h2>Assessment records</h2><div class="filters"><div><label for="search">Search learner or topic</label><input id="search" type="search" placeholder="Find a checkpoint…" value="${escape(query)}"></div><div><label for="topic-filter">Filter by topic</label><select id="topic-filter"><option value="">All topics</option>${byTopic(records).map(t=>`<option ${t.topic===selectedTopic?'selected':''} value="${escape(t.topic)}">${escape(t.topic)}</option>`).join('')}</select></div></div><p id="result-count" class="muted" role="status"></p><div id="records-list"></div></section><p id="status" class="success" role="status" hidden></p>`;
  document.querySelector('#search').addEventListener('input',event=>{query=event.target.value;renderRecordList();});
  document.querySelector('#topic-filter').addEventListener('change',event=>{selectedTopic=event.target.value;renderRecordList();});
  document.querySelector('#assessment-form').addEventListener('submit',event=>{
    event.preventDefault();
    const form=event.currentTarget;
    const checked=validate(Object.fromEntries(new FormData(form)));
    const notice=document.querySelector('#form-message');
    if(checked.errors.length) {notice.hidden=false;notice.className='error';notice.textContent=checked.errors.join(' ');notice.focus();return;}
    if(!persist([...records,{id:crypto.randomUUID(),...checked.value}])) return;
    form.reset();form.elements.date.value=today();notice.hidden=true;
    refreshTopics();
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
  const filtered=filterRecords(records,query,selectedTopic);
  document.querySelector('#result-count').textContent=`Showing ${filtered.length} of ${records.length} assessments`;
  document.querySelector('#records-list').innerHTML=!records.length?empty('No assessments yet','Add your first checkpoint above, or explore with synthetic demo data.'):!filtered.length?empty('No matching checkpoints','Try a different search or select All topics.'):
  `<div class="table-wrap"><table><caption class="hint">Newest assessments first. Below 60% is a prompt for teacher review.</caption><thead><tr><th scope="col">Learner</th><th scope="col">Topic</th><th scope="col">Date</th><th scope="col">Score</th><th scope="col">Review signal</th><th scope="col">Action</th></tr></thead><tbody>${filtered.map(r=>`<tr><td>${escape(r.learner)}</td><td>${escape(r.topic)}</td><td>${escape(r.date)}</td><td>${r.score} / ${r.maximum} <span class="muted">(${pct(percentage(r))})</span></td><td><span class="tag ${percentage(r)<60?'support':''}">${percentage(r)<60?'Review together':'On track'}</span></td><td><button class="secondary small-button" data-delete="${escape(r.id)}" aria-label="Delete ${escape(r.learner)} assessment for ${escape(r.topic)}">Delete</button></td></tr>`).join('')}</tbody></table></div>`;
  document.querySelectorAll('[data-delete]').forEach(button=>button.addEventListener('click',()=>{
    const record=records.find(r=>r.id===button.dataset.delete);
    confirmAction(`Delete ${record.learner}'s ${record.topic} assessment?`,'This removes one checkpoint from this browser. This cannot be undone.',()=>{
      if(persist(records.filter(r=>r.id!==record.id))) {
        refreshTopics();renderRecordList();document.querySelector('#load-demo').disabled=Boolean(records.length);
        document.querySelector('#search').focus();
      }
    });
  }));
}
function refreshTopics() {
  const topics=byTopic(records);
  if(!topics.some(t=>t.topic===selectedTopic)) selectedTopic='';
  document.querySelector('#topic-filter').innerHTML='<option value="">All topics</option>'+topics.map(t=>`<option ${t.topic===selectedTopic?'selected':''} value="${escape(t.topic)}">${escape(t.topic)}</option>`).join('');
  document.querySelector('#topic-suggestions').innerHTML=topics.map(t=>`<option value="${escape(t.topic)}"></option>`).join('');
}
function confirmAction(title,detail,action) {
  const dialog=document.createElement('dialog');
  dialog.setAttribute('aria-labelledby','confirm-title');
  dialog.innerHTML=`<h2 id="confirm-title">${escape(title)}</h2><p>${escape(detail)}</p><div class="actions"><button class="secondary" id="cancel-action" autofocus>Cancel</button><button class="danger" id="confirm-action">Confirm</button></div>`;
  document.body.append(dialog);
  dialog.querySelector('#cancel-action').onclick=()=>dialog.close();
  dialog.querySelector('#confirm-action').onclick=()=>{dialog.close();action();};
  dialog.addEventListener('close',()=>dialog.remove());dialog.showModal();
}
try { render(); } catch { app.textContent='The workspace could not load. Reload this page to try again. Existing browser data has not been cleared.'; }
