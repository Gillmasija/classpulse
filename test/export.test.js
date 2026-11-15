import test from 'node:test';
import assert from 'node:assert/strict';
import {toCsv} from '../public/export.js';
test('CSV quotes commas, quotes and newlines and preserves score values',()=>{
  const csv=toCsv([{learner:'A, "B"',topic:'Line\nbreak',date:'2026-01-01',score:1,maximum:3}]);
  assert.ok(csv.includes('"A, ""B"""'));assert.ok(csv.includes('"Line\nbreak"'));assert.ok(csv.includes('"33.33"'));
  assert.ok(csv.startsWith('\uFEFF'));assert.ok(csv.endsWith('\r\n'));
});
test('CSV neutralizes formula-like user labels',()=>{
  for(const learner of ['=1+1',' +1','-1','@SUM(A1)','\t=1']) assert.ok(toCsv([{learner,topic:'Topic',date:'2026-01-01',score:1,maximum:2}]).includes(`"'${learner}"`));
});
