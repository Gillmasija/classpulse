import test from 'node:test';
import assert from 'node:assert/strict';
import {load,save,demoRecords,KEY} from '../public/storage.js';
const mock=()=>{const data=new Map();return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};};
test('empty storage and demo persistence round trip',()=>{
  const storage=mock(); assert.deepEqual(load(storage),{records:[],error:null});
  const records=demoRecords(); assert.equal(save(storage,records).error,null); assert.deepEqual(load(storage).records,records);
});
test('corrupt storage is reported and never overwritten',()=>{
  for(const raw of ['{','null','{}',JSON.stringify({version:2,records:[]}),JSON.stringify({version:1,records:[...demoRecords(),demoRecords()[0]]})]){
    const storage=mock(); storage.setItem(KEY,raw); assert.ok(load(storage).error); assert.equal(storage.getItem(KEY),raw);
  }
});
test('blocked or full storage reports failure',()=>{
  const storage={getItem(){throw new Error('Denied');},setItem(){throw new Error('Quota');}};
  assert.ok(load(storage).error); assert.ok(save(storage,demoRecords()).error);
});
