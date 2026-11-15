export function today() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

export function validate(input, currentDate = today()) {
  const errors = [];
  const learner = String(input.learner ?? '').trim();
  const topic = String(input.topic ?? '').trim();
  const date = String(input.date ?? '');
  const score = Number(input.score);
  const maximum = Number(input.maximum);
  if (!learner || learner.length > 60) errors.push('Enter a learner alias between 1 and 60 characters.');
  if (!topic || topic.length > 60) errors.push('Enter a topic between 1 and 60 characters.');
  const parsed = new Date(`${date}T12:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0,10) !== date || date > currentDate || date < '2000-01-01') errors.push('Choose a valid date from 2000 through today.');
  if (input.maximum === '' || input.maximum == null || !Number.isFinite(maximum) || maximum <= 0 || maximum > 10000) errors.push('Maximum score must be greater than 0 and at most 10,000.');
  if (input.score === '' || input.score == null || !Number.isFinite(score) || score < 0 || score > maximum) errors.push('Score must be a number from 0 to the maximum score.');
  return { errors, value: { learner, topic, date, score, maximum } };
}

export const percentage = record => record.score / record.maximum * 100;
export function summarize(records) {
  const count = records.length;
  return { count, learners: new Set(records.map(r=>r.learner.toLocaleLowerCase())).size,
    mean: count ? records.reduce((sum,r)=>sum+percentage(r),0)/count : null,
    review: records.filter(r=>percentage(r)<60).length };
}
export function byTopic(records) {
  const groups = new Map();
  for (const record of records) {
    const key = record.topic.toLocaleLowerCase();
    if (!groups.has(key)) groups.set(key, { topic: record.topic, records: [] });
    groups.get(key).records.push(record);
  }
  return [...groups.values()].map(({topic,records})=>({topic,...summarize(records)})).sort((a,b)=>a.mean-b.mean || a.topic.localeCompare(b.topic));
}
export function filterRecords(records, query='', topic='') {
  const term = query.trim().toLocaleLowerCase();
  return records.filter(r=>(!topic || r.topic.toLocaleLowerCase()===topic.toLocaleLowerCase()) && `${r.learner} ${r.topic}`.toLocaleLowerCase().includes(term)).sort((a,b)=>b.date.localeCompare(a.date));
}
