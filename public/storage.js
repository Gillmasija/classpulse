import { validate, today } from './model.js';
export const KEY = 'classpulse.v1';
export function load(storage) {
  try {
    const raw = storage.getItem(KEY);
    if (raw === null) return {records:[],error:null};
    const data = JSON.parse(raw);
    if(data.version!==1 || !Array.isArray(data.records) || data.records.length>10000) throw new Error('Invalid format');
    const ids = new Set();
    const records = data.records.map(record=>{
      const checked = validate(record);
      if(checked.errors.length || typeof record.id!=='string' || !record.id || ids.has(record.id)) throw new Error('Invalid record');
      ids.add(record.id);
      return {id:record.id,...checked.value};
    });
    return {records,error:null};
  } catch {
    return {records:[],error:'Saved data could not be read. Nothing has been overwritten. Check browser storage permissions or use Reset data to clear an unreadable dataset.'};
  }
}
export function save(storage,records) {
  try {
    if(records.length>10000) throw new Error('Too many records');
    storage.setItem(KEY,JSON.stringify({version:1,records}));
    return {error:null};
  } catch {
    return {error:'Could not save to this browser. Your change was not applied. Check storage permissions or export existing records before freeing space.'};
  }
}
export function demoRecords() {
  const date=today();
  return [
    ['Learner 01','Fractions',8,10],['Learner 02','Fractions',5,10],['Learner 03','Fractions',7,10],
    ['Learner 04','Fractions',4,10],['Learner 01','Loops',16,20],['Learner 02','Loops',12,20],
    ['Learner 03','Loops',18,20],['Learner 04','Loops',10,20],['Learner 01','Data literacy',9,10],
    ['Learner 02','Data literacy',8,10],['Learner 03','Data literacy',7,10],['Learner 04','Data literacy',8,10],
  ].map(([learner,topic,score,maximum],i)=>({id:`demo-${i}`,learner,topic,score,maximum,date}));
}
