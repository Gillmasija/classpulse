import { percentage } from './model.js';
function cell(value) {
  let text=String(value);
  // Neutralize spreadsheet formulas, including whitespace-prefixed payloads.
  if(/^[\s]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text="'"+text;
  return `"${text.replace(/"/g,'""')}"`;
}
export function toCsv(records) {
  const rows=[['Learner alias','Topic','Date','Score','Maximum','Percentage'],...records.map(r=>[r.learner,r.topic,r.date,r.score,r.maximum,percentage(r).toFixed(2)])];
  return '\uFEFF'+rows.map(row=>row.map(cell).join(',')).join('\r\n')+'\r\n';
}
