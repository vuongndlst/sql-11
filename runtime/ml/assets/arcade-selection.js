import {CATALOG,shuffleBag} from './arcade-rules.js?v=4753a04700cc';
const randomSeed=()=>{const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0];};
// Selection is persisted before Start. A reload cannot re-roll a station.
export async function assignStation(C,stage){const S=window.LocalLearning;if(!C?.profile?.id||!S||!C.packet||!C.allowed())return null;const pid=C.profile.id,lid=C.packet.lesson.lesson_key,key=lid+':'+stage;
 const assign=()=>{if(!C.allowed())return null;
 let book=S.read('arcade:'+pid,{version:1,assignments:{},queue:[],history:[]});book.assignments||={};book.queue||=[];book.history||=[];
 if(book.assignments[key]&&CATALOG[book.assignments[key].type])return book.assignments[key];
 if(!book.queue.length)book.queue=shuffleBag(randomSeed(),book.history);
 // Across a bag boundary avoid the last two games even if an older queue was saved.
 let i=book.queue.findIndex(t=>!book.history.slice(-2).includes(t));if(i<0)i=0;
 const type=book.queue.splice(i,1)[0],entry={type,seed:randomSeed(),seconds:CATALOG[type].seconds,status:'assigned',assignedAt:Date.now(),version:1};
 book.assignments[key]=entry;book.history=[...book.history,type].slice(-36);S.write('arcade:'+pid,book);return entry;};
 return navigator.locks?navigator.locks.request(S.ns+'arcade:'+pid,assign):assign();
}
export async function startStation(C,stage){const S=window.LocalLearning,pid=C?.profile?.id,lid=C?.packet?.lesson.lesson_key;if(!S||!pid||!lid||!C.allowed())return false;const key=lid+':'+stage;
 const claim=()=>{if(!C.allowed())return false;const book=S.read('arcade:'+pid,null),entry=book?.assignments?.[key],state=C.peek();if(!entry||entry.status!=='assigned'||state.stationGames?.[stage])return false;entry.status='started';entry.startedAt=Date.now();S.write('arcade:'+pid,book);state.stationGames={...state.stationGames,[stage]:true};return C.save(lid,state);};
 return navigator.locks?navigator.locks.request(S.ns+'arcade:'+pid,claim):claim();
}
export async function finishStation(C,stage,reason){try{const S=window.LocalLearning,pid=C?.profile?.id,lid=C?.packet?.lesson.lesson_key;if(!S||!pid||!lid)return;const finish=()=>{const book=S.read('arcade:'+pid,null),e=book?.assignments?.[lid+':'+stage];if(e){e.status='ended';e.reason=reason;e.endedAt=Date.now();S.write('arcade:'+pid,book);}};if(navigator.locks)await navigator.locks.request(S.ns+'arcade:'+pid,finish);else finish();}catch{/* The academic save remains independent of optional game telemetry. */}}
