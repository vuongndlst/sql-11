(async()=>{'use strict';
 const originBase=new URL('.',location.href),C=PortalCloud;
 const asset=src=>{const u=new URL(src,originBase);u.searchParams.set('v',window.PORTAL_RUNTIME_VERSION);return u.href};
 const script=src=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=asset(src);s.onload=resolve;s.onerror=()=>reject(Error('asset_failed'));document.head.append(s)});
 const css=href=>{const l=document.createElement('link');l.rel='stylesheet';l.href=asset(href);document.head.append(l)};
 const base=href=>{const b=document.createElement('base');b.href=new URL(href,originBase);document.head.prepend(b)};
 const account=()=>({name:C.profile.display_name,className:C.profile.class_label,studentCode:C.profile.student_code,userId:C.user.id});
 try{
 const p=await C.init(),kind=p.payload.kind;if(kind!=='ml'&&kind!=='activity'&&new URLSearchParams(location.search).get('mode')==='quest'){await script('course-world.js');await CourseWorld(p,C,originBase);return}css('focus.css');if(innerWidth<700)document.body.classList.add('focus-hide-nav');parent.postMessage({type:'portal-view',world:new URLSearchParams(location.search).get('mode')==='quest'&&kind!=='activity'},location.origin);document.title=p.lesson.title+' · LSTS Learning';
 document.addEventListener('click',e=>{const b=e.target.closest('[data-action="home"]');if(b){e.preventDefault();e.stopImmediatePropagation();parent.postMessage({type:'portal-back'},location.origin)}},true);
 await script('hope-stars.js');
 if(kind==='sql'){
 base('sql/');css('sql/assets/style.css');window.Cloud=C;window.SQL_CONFIG={...PORTAL_CONFIG,courseId:p.course_id,runId:p.run_id};window.SQL_COURSE={lessons:[p.payload.lesson],seed:p.payload.seed};
 document.body.innerHTML='<header hidden><nav><button id="home">Bài học</button><button id="staff" hidden>Giáo viên</button><button id="account">Hồ sơ</button></nav></header><div class="statusbar" hidden><span id="sync"></span></div><main id="app"></main><dialog id="modal"><div id="modal-body"></div><button id="close-modal" class="close" aria-label="Đóng">×</button></dialog><div id="toast" role="status"></div>';

 const init=C.init;C.init=async()=>{window.dispatchEvent(new Event('cloud-change'));return p};location.hash=p.lesson.lesson_key;
 for(const f of ['visuals.js','sql-tools.js','designer.js','projects.js','media.js','app.js'])await script('sql/assets/'+f);
 C.init=init;
 }else if(kind==='python'||kind==='cpp'){
 base(kind+'/lesson/');const upper=kind==='python'?'PY':'CPP';window[upper+'_LESSON_KEY']=p.lesson.lesson_key;window[upper==='PY'?'PY10_CLOUD_CONFIG':'CPP8_CLOUD_CONFIG']={...PORTAL_CONFIG,runId:p.run_id};window[kind==='python'?'PyCloud':'CppCloud']=C;window[upper+'Account']={student:account,controls:()=>{},profile:()=>parent.postMessage({type:'portal-account'},location.origin)};
 if(kind==='python')css('python/engine/style.css');else{for(const f of ['base.css','game.css','school.css'])css('cpp/engine/'+f);await script('cpp/engine/scratchblocks.min.js');await script('cpp/engine/scratchblocks-vi.js')}
 await script(kind+'/engine/kit.js');const payload=document.createElement('script');payload.textContent=p.payload.source;document.head.append(payload);payload.remove();window.LESSON.media=p.payload.media;document.body.innerHTML='';await script(kind+'/engine/media.js');if(kind==='cpp')await script('cpp/engine/cpp-runner.js');await script(kind+'/engine/engine.js');
 }else if(kind==='ml'){
 base('ml/'+p.lesson.lesson_key+'/');css('ml/assets/style.css');css('ml/assets/chu_de.css');window.BAI=p.payload.data;
 const key=(BAI.tien_to_luu||'ml1_')+BAI.ma,storedGet=Storage.prototype.getItem,storedSet=Storage.prototype.setItem;
 const s={...C.state(p.lesson.lesson_key),ten:C.profile.display_name,lop:C.profile.class_label};C.states[p.lesson.lesson_id]=s;
 Storage.prototype.getItem=function(k){return this===localStorage&&k===key?JSON.stringify({...C.peek(),ten:C.profile.display_name,lop:C.profile.class_label}):this===localStorage&&k===(BAI.tien_to_luu||'ml1_')+'quest'?storedGet.call(this,(C.guest?'lsts-guest-settings:':'lsts-portal-settings:')+C.user.id+':'+p.enrollment_id):storedGet.call(this,k)};
 Storage.prototype.setItem=function(k,v){if(this===localStorage&&k===key){const state=JSON.parse(v);state.completed=Boolean(state.dat);C.save(p.lesson.lesson_key,state);return}if(this===localStorage&&k===(BAI.tien_to_luu||'ml1_')+'quest'){storedSet.call(this,(C.guest?'lsts-guest-settings:':'lsts-portal-settings:')+C.user.id+':'+p.enrollment_id,v);return}storedSet.call(this,k,v)};
 await script('ml/assets/the-gioi.js');
 parent.postMessage({type:'portal-lesson',kind:'ml'},location.origin);
 if(new URLSearchParams(location.search).get('mode')==='quest'){
 css('ml/assets/quest3d.css');const map=document.createElement('script');map.type='importmap';map.textContent=JSON.stringify({imports:{three:'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js'}});document.head.append(map);
 window.QUEST={...(window.THE_GIOI?.[BAI.ma]||{}),theme:'research',dung_sau_chang:false,trang_doc:new URL('lesson.html',originBase).href};document.body.innerHTML='<div id="quest"></div>';
 const fallback=setTimeout(()=>{if(!document.querySelector('#quest canvas')){const u=new URL('lesson.html',originBase);u.search=location.search;u.searchParams.set('mode','read');location.replace(u.href)}},15000);
 const module=document.createElement('script');module.type='module';module.src=asset('ml/assets/quest3d.js');document.head.append(module);
 addEventListener('storage',e=>{if(e.key!==key&&(e.key?.includes(p.enrollment_id)||e.key?.includes(p.lesson.lesson_id)))dispatchEvent(new StorageEvent('storage',{key}))});
 const nested=()=>document.querySelector('.q-khung iframe')?.contentWindow;
 addEventListener('message',e=>{if(e.origin!==location.origin)return;if(e.source===nested()&&e.data?.type==='portal-status'){C.setNestedPending(e.data.pending);parent.postMessage(e.data,location.origin)}if(e.source===nested()&&['lsts-location','lsts-exported','portal-session-end'].includes(e.data?.type))parent.postMessage(e.data,location.origin);if(e.source===parent&&['portal-flush','portal-download'].includes(e.data?.type)&&nested())nested().postMessage(e.data,location.origin)});
 document.addEventListener('click',e=>{const a=e.target.closest('a');if(a?.href?.startsWith(QUEST.trang_doc)){e.preventDefault();const u=new URL(QUEST.trang_doc),q=new URLSearchParams(location.search);u.searchParams.set('class',q.get('class'));u.searchParams.set('lesson',q.get('lesson'));u.searchParams.set('profile',q.get('profile'));u.searchParams.set('mode','read');u.searchParams.set('personal',q.get('personal')||'0');if(C.guest)u.searchParams.set('guest','1');location.href=u.href}});
 return;
 }else{
 document.body.innerHTML='<div id="app"></div>';await script('ml/assets/tuong_tac.js');await script('ml/assets/app.js');
 }
 }else if(kind==='activity'){await script('activity.js');ActivityLesson(C,p);}

 const focus=document.createElement('button');focus.className='focus-nav-toggle';focus.textContent='☷ Mục lục';focus.onclick=()=>document.body.classList.toggle('focus-hide-nav');document.body.append(focus);
 document.querySelectorAll('#studyMode,[data-action="study-mode"]').forEach(b=>b.hidden=true);
 if(p.read_only){const banner=document.createElement('p');banner.textContent='Lớp đã lưu trữ · Em có thể xem lại bài học và tải bản sao.';banner.style='background:#edf2f4;padding:16px';document.body.prepend(banner);const observer=new MutationObserver(()=>document.querySelectorAll('input,textarea,select,form button').forEach(x=>{x.disabled=true}));observer.observe(document.body,{childList:true,subtree:true});document.querySelectorAll('input,textarea,select,form button').forEach(x=>x.disabled=true)}
 if(p.payload.notebook){const box=document.createElement('aside');box.style='padding:14px 24px;background:#eaf5ef;color:#14524b;display:flex;gap:15px;align-items:center;flex-wrap:wrap';const text=document.createElement('span');text.textContent='Notebook học sinh · tải xuống rồi mở trong Google Colab';const b=document.createElement('button');b.textContent='Tải notebook';b.onclick=()=>{const n=p.payload.notebook,u=URL.createObjectURL(new Blob([JSON.stringify(n.data,null,2)],{type:'application/x-ipynb+json'})),a=document.createElement('a');a.href=u;a.download=n.name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)};box.append(text,b);document.body.prepend(box)}
 await script('missing-tasks.js');await script('learning.js');LessonLearning(C);await script('certificate.js');LessonCertificate(C);await C.flush();
 }catch(e){console.error('Lesson startup',e);const msg='Chưa mở được bài học. Thử tải lại hoặc chọn chế độ Bài học.';document.body.innerHTML='<main style="padding:24px;font-family:system-ui"><p role="alert"></p></main>';document.querySelector('p').textContent=msg;parent.postMessage({type:'portal-status',status:msg,pending:false},location.origin)}
})();
