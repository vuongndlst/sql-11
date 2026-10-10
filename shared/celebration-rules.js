/* Cosmetic decisions only. No academic state or rewards are changed here. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CelebrationRules=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 'use strict';
 const MODES=[['T01',10],['T02',15],['T03',20],['T04',20],['T05',15],['T06',10],['T07',10]];
 const complete=s=>!!(s?.completed||s?.completedAt||s?.dat);
 function pickPolicy(history,now,coin,modeCoin){
  if(!history.initialBossSeen||history.normalRemaining>0||now-(history.lastPrankAt||0)<72*3600000||coin>=.2)return 'normal';
  let n=modeCoin*100,mode='T07';for(const[id,weight]of MODES){n-=weight;if(n<0){mode=id;break;}}
  if(mode===history.lastMode||mode==='T01'&&now-(history.lastButtonAt||0)<30*86400000)return 'normal';
  return mode;
 }
 function applyPresentation(h,mode,now){h={...h,initialBossSeen:true};if(mode==='normal'){h.normalRemaining=Math.max(0,(h.normalRemaining||0)-1);}else{h.lastPrankAt=now;h.lastMode=mode;h.normalRemaining=2;if(mode==='T01')h.lastButtonAt=now;}return h;}
 function eligible(line,kind,course,score){if(line.kind!==kind||!line.courses.includes(course))return false;const c=line.condition||{};
  if(c.type==='perfect_score')return Number.isInteger(score?.correct)&&Number.isInteger(score?.total)&&score.total>0&&score.correct===score.total;
  if(c.type==='exact_score')return score?.correct===c.correct&&score?.total===c.total;
  return true;
 }
 function stageRows(kind,p,state,L){
  if(kind==='cpp'||kind==='python')return (L?.steps||[]).filter(s=>!['gate','boss','extra'].includes(s.kind)).map((s,i)=>{const required=(s.challenges||[]).filter(c=>!c.advanced&&!c.bonus);return {id:s.id,index:i,title:s.title||s.name||s.label||s.id,done:required.length>0&&required.every(c=>state.passed?.[c.id])};});
  if(kind==='sql')return [...p.lesson.stages.map((s,i)=>({id:'stage-'+i,index:i,title:s.title,done:!!state.passed?.includes(i)})),{id:'practice',index:4,title:'Phòng thực hành SQL',done:!!state.taskDone}];
  if(kind==='ml')return p.data.chang.map((s,i)=>({id:'stage-'+i,index:i,title:s.ten,done:Array.isArray(state.passedStages)?state.passedStages.includes(i):i<(state.qua||0)}));
  return [];
 }
 return {MODES,complete,pickPolicy,applyPresentation,eligible,stageRows};
});
