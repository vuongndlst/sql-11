/* One optional academic wager per stage; points are awarded once per question. */
window.HopeStars=(()=>{
 const LOSS=10;
 function prepare(s){for(const k of ['hopeStars','hopeAttempts','hopeRewards'])if(!s[k]||typeof s[k]!=='object')s[k]={};return s}
 function choose(s,stage,id,passed=false){prepare(s);if(passed||s.hopeAttempts[id]||s.hopeStars[stage]?.status==='won'||s.hopeStars[stage]?.status==='lost')return false;const old=s.hopeStars[stage];if(old?.question===id){delete s.hopeStars[stage];return true}s.hopeStars[stage]={question:id,status:'armed'};return true}
 function grade(s,stage,id,correct,alreadyPassed=false){prepare(s);const attempts=s.hopeAttempts[id]||0,star=s.hopeStars[stage],bet=!attempts&&star?.status==='armed'&&star.question===id&&!alreadyPassed;let delta=0;
  s.hopeAttempts[id]=attempts+1;
  if(correct&&!alreadyPassed&&!s.hopeRewards[id]){const base=attempts?10:15;delta=base*(bet?2:1);s.hopeRewards[id]=delta;}
  if(bet){star.status=correct?'won':'lost';star.delta=correct?delta:-LOSS;if(!correct)delta=-LOSS;}
  s.xp=Math.max(0,(Number(s.xp)||0)+delta);return {bet,delta,correct};
 }
 const RULE='Tối đa một sao mỗi chặng, chọn trước lần trả lời đầu. Đúng ×2, sai −10 XP.';
 function mount(root,state,stage,id,passed=false,onChange=()=>{}){const get=()=>prepare(typeof state==='function'?state():state);const box=document.createElement('div');box.className='hope-choice';const b=document.createElement('button');b.type='button';b.className='hope-toggle';b.title=RULE;const xp=document.createElement('span');xp.className='hope-xp';const feedback=document.createElement('span');feedback.className='hope-result';feedback.setAttribute('role','status');box.append(b,xp,feedback);const action=root.querySelector('button.primary');if(action)action.before(box);else root.append(box);
  const update=()=>{if(!box.isConnected)return;const s=get(),star=s.hopeStars[stage],used=star?.status==='won'||star?.status==='lost',armed=star?.status==='armed'&&star.question===id;const disabled=passed||!!s.hopeAttempts[id]||used;b.disabled=disabled;b.setAttribute('aria-pressed',String(armed));const text=used?'★ Đã dùng sao chặng này':armed?'★ Đã chọn · đúng ×2, sai −10 XP':'☆ Ngôi sao hi vọng · đúng ×2, sai −10 XP';if(b.textContent!==text)b.textContent=text;const points='⚡ '+(Number(s.xp)||0)+' XP';if(xp.textContent!==points)xp.textContent=points;const result=used&&star.question===id?(star.status==='won'?'+'+star.delta+' XP · Ngôi sao thành công':'−10 XP · Ngôi sao chưa thành công'):'';if(feedback.textContent!==result)feedback.textContent=result;};
  b.onclick=()=>{const s=get();if(choose(s,stage,id,passed)){onChange(s);dispatchEvent(new Event('hope-choice-change'));}};addEventListener('hope-choice-change',update);addEventListener('cloud-change',update);update();return {update,button:b,settle:ok=>{const s=get(),r=grade(s,stage,id,ok,passed);onChange(s);dispatchEvent(new Event('hope-choice-change'));return r}};
 }
 function nativeMount(card,s,stage,id,onChange){const box=card.querySelector('[data-star]');if(!box)return null;s.starSelections ||= {};box.classList.add('hope-choice');box.replaceChildren();const b=document.createElement('button'),xp=document.createElement('span');b.type='button';b.className='star-toggle hope-toggle';b.title=RULE;xp.className='hope-xp';box.append(b,xp);
  const update=()=>{if(!box.isConnected)return;const used=!!s.stars?.[stage],armed=s.starSelections[stage]===id&&!used;b.disabled=used||!!s.attempts?.[id]||!!s.passed?.[id];b.setAttribute('aria-pressed',String(armed));b.classList.toggle('on',armed);const label=used?'★ Đã dùng sao chặng này':armed?'★ Đã chọn · đúng ×2, sai −10 XP':'☆ Ngôi sao hi vọng · đúng ×2, sai −10 XP';if(b.textContent!==label)b.textContent=label;const points='⚡ '+(Number(s.xp)||0)+' XP';if(xp.textContent!==points)xp.textContent=points;};
  b.onclick=()=>{if(b.disabled)return;if(s.starSelections[stage]===id)delete s.starSelections[stage];else s.starSelections[stage]=id;onChange();dispatchEvent(new Event('hope-choice-change'));};addEventListener('hope-choice-change',update);addEventListener('cloud-change',update);update();return {selected:()=>s.starSelections[stage]===id&&!s.stars?.[stage]};
 }
 return {LOSS,prepare,choose,grade,mount,nativeMount};
})();
