/* First-completion celebrations. Persist academics before invoking this service. */
window.LessonCelebration=(()=>{'use strict';
 let C,P,base,bank=[],memes=[],active=null,pendingBoss=false,opener=null,queued=[],processing=false,disposed=false;
 const R=CelebrationRules,S=LocalLearning,course={ 'cpp-8-v2':'cpp','python-10':'python','sql-11':'sql','ml-level1':'ml'}[STANDALONE.course];
 const uid=()=>C?.user?.id,key=()=> 'celebrations:'+C.profile.id,read=()=>S.read(key(),{events:{},normalRemaining:0});
 const asset=path=>{const u=new URL(path,base);u.searchParams.set('v',PORTAL_RUNTIME_VERSION);return u.href};
 const draw=arr=>arr[Math.floor(Math.random()*arr.length)];
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 const valid=()=>!disposed&&C?.allowed()&&uid()===C.profile.id;
 async function jsonAsset(name){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),3000);try{const response=await fetch(asset(name),{signal:controller.signal});if(!response.ok)throw Error('celebration_asset');return await response.json();}finally{clearTimeout(timer);}}
 const captions={"T01": ["Cái nút đang làm giá. Bấm nữa đi, nó sắp chịu thua!", "Nó chạy nữa kìa! Chắc tưởng con không đủ kiên nhẫn.", "Rồi rồi, nó chịu rồi. Chứng chỉ của con đây!"], "T02": ["Robot đóng dấu mạnh tay quá, cái bàn cũng giật mình.", "Dấu to cỡ này thì ai giả mạo nổi.", "Robot vui quá đóng luôn ba cái. Kệ, càng chắc!", "Đóng nhẹ thôi robot ơi, chứng chỉ chứ đâu phải giấy gói xôi!"], "T03": ["Ủa, con bọ nào chen vô ảnh vậy?", "Con bọ thua rồi mà vẫn muốn chụp chung cho nổi.", "Tránh ra bọ ơi, hôm nay nhân vật chính là con!", "Con bọ xin đứng ké một tấm. Cho nó vui chút cũng được."], "T04": ["Pháo giấy tiết kiệm quá, rơi đúng một miếng!", "Miếng giấy rơi chậm cỡ này chắc muốn lên hình.", "Hết ngân sách pháo giấy rồi, thầy vỗ tay bù nha!", "Bắn thêm đi! Người ta vừa xong cả bài mà!"], "T05": ["Cúp gì bé xíu vậy? Từ từ, nó đang lớn.", "Cúp này bỏ vô hộp bút cũng vừa.", "Ơ kìa, nó lớn rồi! Xứng với con hơn hẳn.", "Cúp to rồi đó, cầm cẩn thận kẻo rớt trúng chân."], "T06": ["Mở phong bì mà hồi hộp như mở kết quả thi.", "Ai dán kín dữ vậy trời? Chắc sợ chứng chỉ bay mất.", "Bấm vào để mở nha, phong bì hơi làm giá.", "Mở ra coi! Chứng chỉ chờ con nãy giờ rồi."], "T07": ["Kéo rèm lên! Người chiến thắng sắp xuất hiện.", "Rèm mở chậm chậm cho con hồi hộp thêm chút.", "Bấm vào để kéo rèm nha, sân khấu là của con.", "Rèm ơi nhanh lên, đừng giành ánh đèn của con!"]};
 function scoreOf(before,after){
  let score=null;
  if(P.payload.kind==='ml'&&!before.finalPassed&&after.finalPassed)score={correct:after.diem,total:P.payload.data.cuoi.so_cau};
  if(P.payload.kind==='sql'&&Number(after.best)>Number(before.best||0))score={correct:after.best,total:6};
  if(P.payload.kind==='activity')score={correct:after.practiceReview?.correct,total:P.payload.learning.assessment.questions.length};
  return Number.isInteger(score?.correct)&&Number.isInteger(score?.total)&&score.total>0&&score.correct>=0&&score.correct<=score.total?score:null;
 }
 function choose(event,h){const options=bank.filter(l=>R.eligible(l,event.kind,course,event.score));const line=draw(options.filter(l=>l.id!==h.lastLine))||draw(options);
  const textHint=line?.text||'';const reaction=/quê|mất mạng|ngồi nghĩ|giữ.*phong|boss.*im/i.test(textHint)?['awkward','silly']:/phào|thở|căng/i.test(textHint)?['relief']:/ngầu|tự hào|flex|phong thái/i.test(textHint)?['proud']:/dữ|ồ|ủa|wow/i.test(textHint)?['wow']:event.kind==='boss'?['celebrate','cheer']:['clap','cheer'];
  const pool=memes.filter(m=>m.approved&&reaction.includes(m.reaction)&&m.id!==h.lastGif);
  const meme=draw(pool)||draw(memes.filter(m=>m.approved));
  let text=line?.text||(event.kind==='boss'?'Con qua rồi! Được ghê!':'Hay nha! Qua chặng rồi!');
  if(course!=='cpp')text=text.replace(/Boss(?: (?:Python|SQL|ML|C\+\+))?/g,'Thử thách cuối'); // 12/10/2026: chỉ C++ còn gọi Boss
  text=text.replaceAll('{correct}',event.score?.correct??'').replaceAll('{total}',event.score?.total??'');
  return {text,line:line?.id,meme:meme?.id};
 }
 async function claim(event){const work=()=>{if(!valid())return null;const h=read();h.events=h.events||{};if(h.events[event.id])return null;
   const pick=choose(event,h),mode=event.kind==='boss'?R.pickPolicy(h,Date.now(),Math.random(),Math.random()):'normal';
   const saved={...event,...pick,mode,at:Date.now(),presented:false};h.events[event.id]=saved;
   try{S.write(key(),h);return saved;}catch{return null;}};
  return navigator.locks?navigator.locks.request(S.ns+uid()+':celebration',work):work();
 }
 async function presentMark(event){const work=()=>{if(!valid())return false;const h=read(),item=h.events?.[event.id];if(!item||item.presented)return false;
   let updated=event.kind==='boss'?R.applyPresentation(h,event.mode,Date.now()):h;
   updated.events[event.id].presented=true;updated.lastLine=event.line;updated.lastGif=event.meme;
   try{S.write(key(),updated);return true;}catch{return false;}};
  return navigator.locks?navigator.locks.request(S.ns+uid()+':celebration',work):work();
 }
 function close(){if(!active)return;const a=active;active=null;a.timers.forEach(clearTimeout);a.dialog.querySelectorAll('iframe').forEach(x=>x.remove());a.dialog.close();a.dialog.remove();a.focus?.isConnected&&a.focus.focus();}
 function certificate(){close();pendingBoss=false;if(valid())opener?.();}
 function back(event){if(C.confirmLeave&&!C.confirmLeave())return;close();if(new URLSearchParams(location.search).get('nhung')==='1')parent.postMessage({ma:P.lesson.lesson_key,loai:'dong',tiep:false,vua_xong:event.index+1},location.origin);}
 function show(event){if(!valid())return;close();const dialog=document.createElement('dialog');dialog.className='celebration-dialog celebration-enter '+event.kind;
  dialog.innerHTML='<div class="celebration-card"><div class="celebration-top"><span>'+ (event.kind==='boss'?'BOSS ĐÃ QUA!':'CHẶNG ĐÃ XONG!')+'</span><button class="celebration-close" aria-label="Đóng lời chúc">×</button></div><h2 id="celebration-title">'+(event.kind==='boss'?'Con làm được rồi!':esc(event.title))+'</h2><div class="celebration-media"><div class="celebration-mascot">'+(event.kind==='boss'?'🏆':'🎉')+'</div></div><div class="celebration-source"></div><p class="celebration-quote"></p><p class="celebration-facts"></p><div class="celebration-arena" hidden><button>Nhận chứng chỉ</button></div><p class="celebration-hint" hidden>Chứng chỉ đã là của con. Có thể nhận ngay bên dưới.</p><div class="celebration-actions"><button class="celebration-primary"></button><button class="celebration-secondary"></button></div></div>';
  dialog.setAttribute('aria-labelledby','celebration-title');const q=s=>dialog.querySelector(s);q('.celebration-quote').textContent=event.text;
  q('.celebration-facts').textContent=event.score?`${event.score.correct}/${event.score.total} câu đúng` : event.gain>0?`Đã lưu kết quả · +${event.gain} XP`:'Đã lưu kết quả trên trình duyệt này';
  const a=active={dialog,event,timers:[],focus:document.activeElement};const later=(fn,ms)=>a.timers.push(setTimeout(()=>{if(active===a&&valid())fn();},ms));
  const primary=q('.celebration-primary'),secondary=q('.celebration-secondary'),media=q('.celebration-media');
  primary.textContent=event.kind==='boss'?'Nhận chứng chỉ':new URLSearchParams(location.search).get('nhung')==='1'?'Về đảo 3D':'Tiếp tục bài học';primary.onclick=()=>event.kind==='boss'?certificate():back(event);
  secondary.textContent=event.kind==='boss'?'Xem lại bài':'Xem lại chặng';secondary.onclick=()=>{pendingBoss=false;close();};
  q('.celebration-close').onclick=()=>{pendingBoss=false;close();};dialog.addEventListener('cancel',e=>{e.preventDefault();pendingBoss=false;close();});
  if(event.mode!=='normal'){
   const image=new Image();image.alt='Hoạt cảnh vui: '+event.mode;image.src=asset('ml/assets/celebrations/'+event.mode+(reduced()?'.png':'.webp'));image.onerror=()=>{media.innerHTML='<div class="celebration-mascot">🤖</div>';};media.replaceChildren(image);q('.celebration-quote').textContent=draw(captions[event.mode]);
   
   if(event.mode==='T01'){
    primary.textContent='Nhận ngay';q('.celebration-arena').hidden=false;q('.celebration-hint').hidden=false;const chase=q('.celebration-arena button');let count=0;
    chase.onclick=e=>{count++;if(count>=3){certificate();return;}q('.celebration-quote').textContent=captions.T01[count];if(!reduced()&&e.detail!==0){chase.style.left=count===1?'36%':'9%';chase.style.top=count===1?'58%':'12%';}chase.textContent=count===2?'Nhận chứng chỉ':'Ở đây nè!';chase.focus();};
    later(()=>{chase.style.left='12%';chase.style.top='30%';chase.textContent='Nhận chứng chỉ';chase.onclick=certificate;},8000);
   }
   if(['T06','T07'].includes(event.mode))media.onclick=()=>{image.src=asset('ml/assets/celebrations/'+event.mode+'.png');media.onclick=null;};
  }else if(!reduced()){
   const gif=memes.find(m=>m.id===event.meme);if(gif){const frame=document.createElement('iframe');frame.title=gif.title;frame.src=gif.embed;frame.tabIndex=-1;frame.referrerPolicy='strict-origin-when-cross-origin';frame.allow='';frame.loading='eager';media.append(frame);q('.celebration-source').innerHTML='<a href="'+esc(gif.source)+'" target="_blank" rel="noopener noreferrer">via GIPHY · '+esc(gif.creator||'GIPHY')+'</a>';}
  }
  document.body.append(dialog);try{dialog.showModal();primary.focus();}catch{dialog.remove();active=null;pendingBoss=false;}
 }
 async function drain(){if(processing)return;processing=true;let shown=false;try{while(queued.length&&valid()){const next=queued.shift(),event=await claim(next);if(event&&await presentMark(event)){show(event);shown=true;break;}}}finally{processing=false;if(!shown&&!queued.length&&!active)pendingBoss=false;}}
 function attach(cloud,packet,originBase){C=cloud;P=packet;base=originBase;const l=document.createElement('link');l.rel='stylesheet';l.href=asset('celebration.css');document.head.append(l);
  const ready=Promise.allSettled([jsonAsset('celebration-lines.json'),jsonAsset('giphy-memes.json')]).then(([b,m])=>{bank=(b.status==='fulfilled'&&Array.isArray(b.value.lines)?b.value.lines:[]).filter(l=>typeof l.id==='string'&&typeof l.text==='string'&&Array.isArray(l.courses)&&['stage','boss'].includes(l.kind)&&['completed','perfect_score','exact_score'].includes(l.condition?.type));memes=(m.status==='fulfilled'&&Array.isArray(m.value.items)?m.value.items:[]).filter(g=>g.approved&&g.rating==='g'&&/^[a-zA-Z0-9]+$/.test(g.id)&&g.embed==='https://giphy.com/embed/'+g.id&&/^https:\/\/giphy\.com\/gifs\//.test(g.source));});
  const save=C.save;C.save=(lesson,value)=>{const before=S.state(C.profile.id,lesson)||{},ok=save(lesson,value);if(!ok||lesson!==P.lesson.lesson_key||!valid())return ok;
   let events=[];if(!R.complete(before)&&R.complete(value)){events=[{id:lesson+':boss',kind:'boss',title:P.lesson.title,score:scoreOf(before,value),gain:Math.max(0,(value.xp||0)-(before.xp||0))}];pendingBoss=true;}
   else{const old=R.stageRows(P.payload.kind,P.payload,before,window.LESSON),rows=R.stageRows(P.payload.kind,P.payload,value,window.LESSON);events=rows.filter((s,i)=>s.done&&!old[i]?.done).map(s=>({...s,id:lesson+':'+s.id,kind:'stage',gain:Math.max(0,(value.xp||0)-(before.xp||0))}));}
   if(events.length){if(events[0].kind==='boss')queued=queued.filter(e=>e.kind!=='stage');queued.push(events[events.length-1]);ready.then(()=>setTimeout(drain,100));}return ok;};
  addEventListener('storage',e=>{if(e.key===S.ns+'ended-session'){let d;try{d=JSON.parse(e.newValue);}catch{}if(d?.profile===C.profile.id){disposed=true;queued=[];close();}}});
 }
 return {attach,holdCertificate(fn){if(pendingBoss||active?.event.kind==='boss'){opener=fn;return true;}return false;},setCertificateOpener(fn,fallback=false){if(!fallback||!opener)opener=fn;},close};
})();
