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
 function mount(root,state,stage,id,passed=false,onChange=()=>{}){const get=()=>prepare(typeof state==='function'?state():state);const box=document.createElement('div');box.className='hope-choice';const b=document.createElement('button');b.type='button';b.className='hope-toggle';b.title='Một sao mỗi chặng, chọn trước lần trả lời đầu. Đúng: điểm câu ×2. Sai: −10 XP.';const xp=document.createElement('span');xp.className='hope-xp';box.append(b,xp);root.append(box);
  const update=()=>{if(!box.isConnected)return;const s=get(),star=s.hopeStars[stage],used=star?.status==='won'||star?.status==='lost',armed=star?.status==='armed'&&star.question===id;const disabled=passed||!!s.hopeAttempts[id]||used;b.disabled=disabled;b.setAttribute('aria-pressed',String(armed));const text=used?'★ Đã dùng sao chặng này':armed?'★ Đã chọn · đúng ×2, sai −10 XP':'☆ Ngôi sao hi vọng · đúng ×2, sai −10 XP';if(b.textContent!==text)b.textContent=text;xp.textContent='⚡ '+(Number(s.xp)||0)+' XP';};
  b.onclick=()=>{const s=get();if(choose(s,stage,id,passed)){onChange(s);dispatchEvent(new Event('hope-choice-change'));}};addEventListener('hope-choice-change',update);addEventListener('cloud-change',update);update();return {update,button:b,settle:ok=>{const s=get(),r=grade(s,stage,id,ok,passed);onChange(s);dispatchEvent(new Event('hope-choice-change'));return r}};
 }
 return {LOSS,prepare,choose,grade,mount};
})();
