import test from 'node:test';
import assert from 'node:assert/strict';
import {validate,summarize,byTopic,filterRecords} from '../public/model.js';
const record = { learner:'Learner 01',topic:'Fractions',date:'2026-01-02',score:7,maximum:10 };
test('accepts zero and decimal scores, trims aliases',()=>{
  assert.deepEqual(validate({...record,learner:' A ',score:0}).errors,[]);
  assert.equal(validate({...record,learner:' A ',score:2.5}).value.learner,'A');
});
test('rejects missing, nonfinite, negative and out-of-range scores',()=>{
  for(const score of ['',null,undefined,NaN,Infinity,-1,11]) assert.ok(validate({...record,score}).errors.length);
  for(const maximum of ['',null,0,-2,Infinity,10001]) assert.ok(validate({...record,maximum}).errors.length);
});
test('rejects blank labels and invalid or future dates',()=>{
  for(const patch of [{learner:' '},{topic:' '},{learner:'a'.repeat(61)},{date:'2026-02-30'},{date:'2026-13-01'},{date:'1999-01-01'},{date:'2026-01-03'}]) assert.ok(validate({...record,...patch},'2026-01-02').errors.length);
  assert.deepEqual(validate({...record,date:'2024-02-29'},'2026-01-02').errors,[]);
});
test('summary uses equal assessment weight and case-insensitive aliases',()=>{
  const result=summarize([record,{...record,learner:'learner 01',score:50,maximum:100}]);
  assert.deepEqual(result,{count:2,learners:1,mean:60,review:1});
  assert.deepEqual(summarize([]),{count:0,learners:0,mean:null,review:0});
});
test('topic grouping is case-insensitive and lowest mean first',()=>{
  const result=byTopic([record,{...record,topic:'fractions',score:5},{...record,topic:'Loops',score:4}]);
  assert.equal(result.length,2); assert.equal(result[0].topic,'Loops'); assert.equal(result[1].mean,60);
});
test('filters match learner or topic, respect topic selection, and sort newest first',()=>{
  const records=[record,{...record,learner:'Learner 02',topic:'Loops',date:'2026-02-02'}];
  assert.equal(filterRecords(records,'learner')[0].topic,'Loops');
  assert.equal(filterRecords(records,'LOOPS').length,1);
  assert.equal(filterRecords(records,'02','Fractions').length,0);
});
