(()=>{'use strict';
const C=SQL_COURSE,cloud=Cloud,$=s=>document.querySelector(s),app=$('#app'),modal=$('#modal');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
let auxiliary=null,activeView='home',pendingTool=null,historyRows=[];
let current=null,stageIndex=0,pendingLesson=null,worker=null,requestId=0,requests=new Map(),working=false,quiz=null,authMode='login',noticeTimer,draftTimer,pendingDraft=null;
const allowed=()=>Boolean(cloud.user&&cloud.ready&&cloud.contentLoaded);
const state=()=>current&&allowed()?cloud.state(current.key):{};
const selfStudy=()=>false;
const stageOpen=i=>{const s=state();return !!s.completed||i<=4&&Array.from({length:i},(_,n)=>n).every(n=>s.passed?.includes(n))||i===5&&[0,1,2,3].every(n=>s.passed?.includes(n))&&s.taskDone;};
const saved=key=>allowed()?cloud.state(key):{};
function save(s,key=current?.key){if(!key||!allowed())return;s.completed=Boolean(s.completed||s.best>=5&&[0,1,2,3].every(i=>s.passed?.includes(i))&&s.taskDone);if(!cloud.save(key,s))toast('Chưa lưu được; ở lại và thử lưu lại.');updateNav()}
function commitDraft(){clearTimeout(draftTimer);if(!pendingDraft)return;const d=pendingDraft;pendingDraft=null;const s=structuredClone(saved(d.key));s.draft=d.code;save(s,d.key)}
function toast(t){$('#toast').textContent=t;$('#toast').style.display='block';clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>$('#toast').style.display='none',4500)}
function openModal(html){$('#modal-body').innerHTML=html;if(!modal.open)modal.showModal()}
$('#close-modal').onclick=()=>modal.close();modal.addEventListener('click',e=>{if(e.target===modal)modal.close()});
function updateNav(){
 $('#account').textContent=cloud.user?(cloud.profile?.display_name||'Tài khoản'):'Đăng nhập';$('#staff').hidden=!cloud.ready||cloud.role==='student';
 if(current&&allowed()){const s=state();$('.progressbar i')?.style.setProperty('width',((s.passed?.length||0)/4*100)+'%');
 document.querySelectorAll('.stage-list button').forEach((b,i)=>{if(i<4){b.disabled=!stageOpen(i);b.textContent=(s.passed?.includes(i)?'✓ ':'')+(i+1)+'. '+current.stages[i].title}})}
}
function closeAuxiliary(){auxiliary?.dispose?.();auxiliary=null}
function home(){parent.postMessage({type:'portal-back'},location.origin)}
async function lesson(key,index=0){
 closeAuxiliary();activeView='lesson';commitDraft();
 if(!allowed()){pendingLesson=key;home();auth(cloud.user?'login':'register');if(cloud.user)toast('Chưa tải được nội dung. Kiểm tra mạng rồi tải lại trang.');return}
 const l=C.lessons.find(l=>l.key===key);if(!l)return;
 if(cloud.user&&!cloud.ready){toast('Đang mở người học, hãy đợi một chút.');return}
 const changed=current?.key!==key;current=l;quiz=null;stageIndex=index;location.hash=l.key;
 if(changed){stopWorker();await initWorker()}
 const s=state();while(stageIndex>0&&!stageOpen(stageIndex))stageIndex--;
 renderLesson();window.scrollTo({top:0,behavior:'instant'});
}
function renderLesson(){
 while(stageIndex>0&&!stageOpen(stageIndex))stageIndex--;
 if(!allowed()){home();return}
 commitDraft();
 const l=current,s=state();
 app.innerHTML=`<div class="workspace"><aside class="sidebar"><button data-action="home">← Lộ trình khóa học</button><div class="meta">BUỔI ${l.n} · SGK BÀI ${l.sgk}<br>70 phút · ${l.n<7?'Khám phá':'Thực hành'}</div><div class="stage-list">${l.stages.map((x,i)=>`<button data-action="stage" data-index="${i}" class="${stageIndex===i?'active':''}" ${!stageOpen(i)?'disabled':''}>${s.passed?.includes(i)?'✓ ':''}${i+1}. ${esc(x.title)}</button>`).join('')}<button data-action="stage" data-index="4" ${!stageOpen(4)?'disabled':''} class="${stageIndex===4?'active':''}">⌨ Phòng thực hành</button><button data-action="stage" data-index="5" ${!stageOpen(5)?'disabled':''} class="${stageIndex===5?'active':''}">◎ Thử thách cuối</button></div><div class="progressbar"><i style="width:${(s.passed?.length||0)/4*100}%"></i></div><div class="tiny">${s.completed?'✓ Hoàn thành tự học':selfStudy()?'Mọi chặng đều mở; checkpoint ghi nhận riêng.':'Qua checkpoint để mở chặng tiếp theo'}</div><button data-action="study-mode" class="study-mode">${selfStudy()?'↩ Học theo chặng':'☷ Tự học / học bù'}</button><p class="tiny">Hoàn thành chặng trước để mở chặng tiếp theo. Hoàn thành vẫn cần checkpoint, nhiệm vụ SQL và thử thách cuối.</p><div class="actions"><button data-action="designer">▦ Xưởng thiết kế</button><button data-action="projects">◎ Dự án</button></div></aside><section><div class="lesson-head"><div class="eyebrow">${l.n<7?'Hiểu cơ sở dữ liệu':'Tạo lập và khai thác'}</div><h1>${esc(l.title)}</h1><p>${esc(l.question)}</p><div class="tiny">${esc(l.timing)}</div></div><div class="kud"><div><b>Biết (K)</b>${esc(l.kud.K)}</div><div><b>Hiểu (U)</b>${esc(l.kud.U)}</div><div><b>Làm được (D)</b>${esc(l.kud.D)}</div></div><div id="conflict"></div><div id="lesson-body"></div></section></div>`;
 if(stageIndex<4)renderStage();else if(stageIndex===4)renderLab();else renderFinal();
 showConflict();updateNav();
}
function renderStage(){
 const s=current.stages[stageIndex],p=state(),done=p.passed?.includes(stageIndex);
 const opts=shuffle(s.check.options.map((text,i)=>({text,i})));
 $('#lesson-body').innerHTML=`<article class="panel"><div class="eyebrow">Chặng ${stageIndex+1} / 4</div><h2>${esc(s.title)}</h2>${s.html}<form id="checkpoint" class="check"><b>Tự kiểm tra</b><p>${esc(s.check.q)}</p><div class="options">${opts.map(o=>`<label><input type="radio" name="answer" value="${o.i}" required>${esc(o.text)}</label>`).join('')}</div><button class="primary">Kiểm tra câu trả lời</button><div id="check-feedback" class="feedback" aria-live="polite">${done?'✓ Con đã qua chặng này.':''}</div></form><div class="actions" style="margin-top:20px"><button data-action="next" ${done||selfStudy()?'':'disabled'}>${stageIndex<3?'Chặng tiếp theo':'Đến phòng thực hành'} →</button></div></article>`;
 window.SQLVisuals.mount($('#lesson-body'),{run:async sql=>{if(!allowed())throw Error('Cần đăng nhập để thực hành.');return askWorker('run',{sql})}});
 if(stageIndex===0){const media=document.createElement('div');media.dataset.learningMedia='';$('#checkpoint').before(media);SQLMedia.mount(media,current);}
 const hope=HopeStars.mount($('#checkpoint'),()=>state(),'stage-'+stageIndex,'sql-check-'+stageIndex,!!done,save);
 $('#checkpoint').onsubmit=e=>{
  e.preventDefault();const answer=Number(new FormData(e.target).get('answer')),ok=answer===s.check.answer,p=structuredClone(state());
  p.checkTries=p.checkTries||{};p.checkTries[stageIndex]=(p.checkTries[stageIndex]||0)+1;
  if(ok){p.passed=Array.from(new Set([...(p.passed||[]),stageIndex])).sort();$('#check-feedback').className='feedback good';$('#check-feedback').textContent='✓ Đúng. '+s.check.why;$('[data-action="next"]').disabled=false;}
  else{$('#check-feedback').className='feedback bad';$('#check-feedback').textContent=p.checkTries[stageIndex]<2?'Gợi ý: '+s.check.hint:'Cùng xem lại: '+s.check.why;}
  HopeStars.grade(p,'stage-'+stageIndex,'sql-check-'+stageIndex,ok,!!done);save(p);
 };
}
function renderLab(){
 const l=current,p=state();
 $('#lesson-body').innerHTML=`<article class="panel"><div class="eyebrow">Tự thử trên dữ liệu</div><h2>Phòng thực hành SQL</h2><div class="notice">8 người · 10 thiết bị · 18 lượt mượn. <b>Dữ liệu mô phỏng.</b> Mỗi bài có sandbox riêng; khi đổi bài hoặc tải lại trang, dữ liệu trở về mẫu. Lưu tập lệnh hoặc xuất SQL để giữ phần đã sửa.</div><details><summary>Xem cấu trúc và quan hệ</summary><div class="diagram"><span>nguoi_muon<br>idNguoiMuon (PK)<br>tenNguoiMuon · lop</span><i>1 → n</i><span>luot_muon<br>idLuotMuon (PK)<br>idNguoiMuon (FK) · idThietBi (FK)<br>ngayMuon · ngayTra</span><i>n ← 1</i><span>thiet_bi<br>idThietBi (PK)<br>maTaiSan (UNIQUE) · tenThietBi</span></div></details><p><b>Nhiệm vụ:</b> ${esc(l.mission.prompt)}</p><div class="editor-label"><b>SQL của con</b><span class="pill">SQLite · khóa ngoài đang bật</span></div><textarea id="sql" class="editor" aria-label="Trình soạn SQL" spellcheck="false"></textarea><div class="actions"><button class="primary" data-action="run">▶ Chạy SQL</button><button class="secondary" data-action="verify">Kiểm tra nhiệm vụ</button><button data-action="stop">Dừng</button><button data-action="reset">Đặt lại dữ liệu</button></div><div id="result" class="result" aria-live="polite">Sẵn sàng chạy truy vấn.</div><div id="sql-error-help"></div><div id="mission-feedback" class="feedback">${p.taskDone?'✓ Nhiệm vụ đã được kiểm tra trong lần học trước.':''}</div><div class="actions"><button data-action="save-version">Lưu phiên bản SQL</button><button data-action="inspect-schema">Xem cấu trúc thực tế</button><button data-action="save-code">Tải tập lệnh .sql</button><button data-action="export">Xuất SQL cấu trúc + dữ liệu</button><button data-action="restore">Phục hồi vào sandbox riêng</button><input id="restore-file" type="file" accept=".sql" hidden></div><p class="tiny">Khi chạy nhiều lệnh, các lệnh trước lỗi có thể đã thay đổi dữ liệu. Bấm Đặt lại để bắt đầu lại.</p></article>
<article class="panel"><h2>Lịch sử thực hành</h2><p>Giữ tối đa 30 lần chạy/phiên bản, 3 bản sao lưu và khoảng 300 KB cho mỗi học sinh/bài. Khôi phục phiên bản chỉ đưa SQL vào trình soạn; khôi phục bản sao thay dữ liệu trong sandbox của bài đang mở.</p><button data-action="history-refresh">Làm mới lịch sử</button><p id="history-sync" class="tiny"></p><div id="history-list"></div></article>
 <article class="panel"><div class="eyebrow">${l.n>=7?'Thực hành MySQL / HeidiSQL':'Làm việc với bạn'}</div><h2>Đưa hiểu biết vào thực hành</h2><p>Hoàn thành các việc sau và ghi minh chứng để nộp giáo viên trên LMS. Những ô này là con tự ghi nhận, giáo viên sẽ đối chiếu.</p><form id="lab-form"><div class="checklist">${l.lab.map((x,i)=>`<label><input type="checkbox" name="lab-${i}" ${p.labChecks?.includes(i)?'checked':''}>${esc(x)}</label>`).join('')}</div><label class="field">Nhật kí / link minh chứng<textarea name="evidence" maxlength="4000" placeholder="Schema đã dùng, câu lệnh, kết quả, lỗi và cách sửa; hoặc đường dẫn minh chứng LMS.">${esc(p.evidence||'')}</textarea></label><button class="primary">Lưu nhật kí thực hành</button></form><p><a href="assets/mysql-starter.sql" download>Dữ liệu mẫu MySQL (.sql)</a> · <a href="assets/dataset.sql" download>Dữ liệu mẫu SQLite (.sql)</a></p><div class="notice warning">MySQL dùng CREATE DATABASE, USE, AUTO_INCREMENT và kiểu DATE; SQLite web dùng INTEGER PRIMARY KEY AUTOINCREMENT và ngày dạng văn bản ISO. File MySQL mẫu có dữ liệu hoàn chỉnh; buổi 9–10 hãy tự tạo cấu trúc trước khi dùng file để đối chiếu.</div></article>`;
 $('#sql').value=p.draft??l.mission.starter;renderHistory();
 // Before the formal SQL lesson, learners explore with choices; generated SQL
 // is still executed by SQLite, rather than a fabricated result table.
 if(l.n<=4){
  const control=l.n===1?'<label class="field">Tình trạng lượt mượn<select id="explore-choice"><option value="all">Tất cả lượt mượn</option><option value="open">Chưa trả</option></select></label>':l.n===2?'<label class="field">Lớp cần tìm<select id="explore-choice"><option>11A2</option><option>11A1</option><option>11A3</option></select></label>':l.n===4?'<label class="field">Hai trường cùng định danh người<select id="explore-choice"><option value="wrong">l.idThietBi = n.idNguoiMuon</option><option value="right">l.idNguoiMuon = n.idNguoiMuon</option></select></label>':'';
  $('#sql').insertAdjacentHTML('beforebegin',`<div class="notice"><b>Khám phá bằng nút chọn</b><p>Con chưa cần thuộc cú pháp SQL. Chọn yêu cầu để máy sinh truy vấn, chạy và quan sát kết quả. Đối chiếu với nhiệm vụ rồi bấm Kiểm tra.</p>${control}<button data-action="explore">${l.n===3?'Xem danh mục bảng':'Sinh truy vấn và chạy'}</button></div>`);
 }
 $('#sql').oninput=e=>{clearTimeout(draftTimer);pendingDraft={key:current.key,code:e.target.value};commitDraft()};
 $('#sql').onkeydown=e=>{if(e.ctrlKey&&e.key==='Enter'){e.preventDefault();runSql()}};
 $('#lab-form').onsubmit=e=>{e.preventDefault();const fd=new FormData(e.target),p=structuredClone(state());p.labChecks=l.lab.map((_,i)=>i).filter(i=>fd.has('lab-'+i));p.evidence=fd.get('evidence').trim();save(p);toast(cloud.user?'Nhật kí đang được lưu trên trình duyệt.':'Nhật kí giữ trong lần mở này; đăng nhập để lưu lâu dài.')};
 $('#restore-file').onchange=async e=>{
  const file=e.target.files[0],key=current.key,uid=cloud.user.id;if(!file)return;if(file.size>2000000){toast('File tối đa 2 MB.');return}
  try{const r=await askWorker('restore',{sql:await file.text()});if(current?.key!==key||cloud.user?.id!==uid)return;showResults(r);cloud.logPractice(key,'restore','',{ok:true,source:'file'});renderHistory();toast('Đã phục hồi vào sandbox riêng; hãy đối chiếu số dòng và khóa.')}catch(err){showError(err)}finally{e.target.value=''}
 };
}
function stopWorker(){worker?.terminate();worker=null;for(const p of requests.values()){clearTimeout(p.timer);p.reject(Error('Truy vấn đã dừng; đặt lại dữ liệu trước khi chạy tiếp.'))}requests.clear();working=false}
async function initWorker(){if(!allowed())throw Error('Đăng nhập để mở phòng thực hành.');worker=new Worker('assets/sql-worker.js');worker.onmessage=e=>{const p=requests.get(e.data.id);if(!p)return;clearTimeout(p.timer);requests.delete(e.data.id);e.data.ok?p.resolve(e.data):p.reject(Error(e.data.error))};worker.onerror=()=>{for(const p of requests.values()){clearTimeout(p.timer);p.reject(Error('Không tải được engine SQL. Thử tải lại khi có mạng.'))}requests.clear();worker?.terminate();worker=null};return askWorker('reset',{seed:C.seed},30000)}
function askWorker(action,payload={},timeoutMs=5000){return new Promise((resolve,reject)=>{if(!allowed()){reject(Error('Cần đăng nhập để học.'));return}if(!worker){reject(Error('Sandbox đã dừng. Bấm Đặt lại dữ liệu.'));return}const id=++requestId;const timer=setTimeout(()=>{requests.delete(id);stopWorker();reject(Error(timeoutMs===30000?'Chưa tải được bộ máy SQL trong 30 giây. Kiểm tra mạng rồi mở lại bài.':'Truy vấn quá 5 giây. Sandbox đã dừng; bấm Đặt lại dữ liệu.'))},timeoutMs);requests.set(id,{resolve,reject,timer});worker.postMessage({id,action,...payload})})}
function showResults(r){$('#result').innerHTML=(r.results||[]).map(x=>`<p>${x.total} dòng${x.total>500?' · hiển thị 500 dòng đầu':''}</p><table><thead><tr>${x.columns.map(c=>'<th>'+esc(c)+'</th>').join('')}</tr></thead><tbody>${x.values.map(row=>'<tr>'+row.map(v=>'<td>'+(v===null?'<i>NULL</i>':esc(v))+'</td>').join('')+'</tr>').join('')}</tbody></table>`).join('')||`Đã thực thi. ${r.changed??0} dòng bị tác động.`;if(r.ms!==undefined)$('#result').insertAdjacentHTML('beforeend',`<p>${r.ms} ms · SQLite thực thi trên máy con</p>`)}
function showError(err,code=$('#sql')?.value||''){const d=SQLTools.diagnose(err,code);if($('#result')){$('#result').textContent='Lỗi SQL: '+d.technical;$('#result').classList.add('bad');if($('#sql-error-help'))$('#sql-error-help').innerHTML=SQLTools.errorHTML(d)}else toast(d.why);return d}
function recordPractice(key,kind,code,result,error=null){if(!allowed())return;const summary=error?{ok:false,...SQLTools.diagnose(error,code)}:SQLTools.summary(result||{});if(!cloud.logPractice(key,kind,code,summary))toast('Chưa lưu được lịch sử: kiểm tra mạng hoặc độ dài tập lệnh.');const p=structuredClone(saved(key));if(error){p.lastError={kind:summary.kind,at:new Date().toISOString(),message:summary.technical};p.sqlErrors=p.sqlErrors||{};p.sqlErrors[summary.kind]=(Number(p.sqlErrors[summary.kind])||0)+1}else p.lastError=null;save(p,key)}
async function renderHistory(){const key=current?.key;if(!key||!$('#history-list'))return;$('#history-sync').textContent=cloud.practicePending()?'Có lịch sử đang chờ lưu trên trình duyệt.':'Lịch sử đã lưu / đang tải từ trình duyệt.';try{const rows=await cloud.practiceHistory(key);if(current?.key!==key||!$('#history-list'))return;historyRows=rows;const labels={run:'Chạy SQL',verify:'Kiểm tra nhiệm vụ',version:'Phiên bản SQL',backup:'Bản sao lưu',restore:'Phục hồi',design:'Mô hình thiết kế'};$('#history-list').innerHTML=rows.length?rows.map(r=>`<details class="history-item"><summary>${esc(labels[r.kind])} · ${new Date(r.created_at).toLocaleString('vi-VN')} · ${r.pending?'Chờ lưu':r.summary.ok===false?'Có lỗi':r.summary.matched===false?'Nhiệm vụ chưa khớp':r.summary.matched===true?'Nhiệm vụ đã khớp':'Đã ghi nhận'}</summary><pre>${esc(r.code)}</pre>${r.summary.codeTruncated?'<p class="warning">Tập lệnh này đã rút gọn do giới hạn dung lượng; không coi là phiên bản đầy đủ.</p>':''}${r.summary.ok===false?SQLTools.errorHTML(r.summary):SQLTools.resultsHTML(r.summary)}<div class="actions">${r.code?`<button data-action="history-code" data-id="${r.event_id}">Đưa SQL vào trình soạn</button>`:''}${r.snapshot_sql?`<button data-action="history-backup" data-id="${r.event_id}">Khôi phục CSDL từ bản này</button><button data-action="history-download" data-id="${r.event_id}">Tải SQL sao lưu</button>`:''}</div></details>`).join(''):'<p class="empty">Chưa có lịch sử. Chạy SQL hoặc bấm Lưu phiên bản để bắt đầu.</p>'}catch(error){if(current?.key===key&&$('#history-list'))$('#history-list').textContent=error.message}}

async function runSql(){if(working||!allowed())return;working=true;const key=current.key,uid=cloud.user.id,code=$('#sql').value,p=structuredClone(state());p.draft=code;save(p);try{if(code.length>100000)throw Error('Tập lệnh quá dài (tối đa 100.000 kí tự).');const r=await askWorker('run',{sql:code});if(current?.key!==key||cloud.user?.id!==uid)return;showResults(r);$('#result').classList.remove('bad');$('#sql-error-help').innerHTML='';recordPractice(key,'run',code,r)}catch(error){if(current?.key===key&&cloud.user?.id===uid){showError(error,code);recordPractice(key,'run',code,null,error)}}finally{working=false;if(current?.key===key)renderHistory()}}

async function verify(){if(working)return;working=true;try{
 const m=current.mission,code=$('#sql').value,p=structuredClone(state());p.draft=code;save(p);
 const r=await askWorker('run',{sql:m.probe||code});const rows=r.results?.at(-1)?.values;
 let ok=JSON.stringify(rows)===JSON.stringify(m.expected);
 if(ok&&current.n===9){const structure=(await askWorker('run',{sql:'PRAGMA table_info(nguoi_thu);'})).results[0]?.values;ok=structure?.some(r=>r[1]==='id'&&r[5]===1)&&structure?.some(r=>r[1]==='ten'&&r[3]===1);}
 if(ok&&current.n===10){const fk=(await askWorker('run',{sql:'PRAGMA foreign_key_list(muon_thu);'})).results[0]?.values;ok=fk?.some(r=>r[2]==='nguoi_muon'&&r[3]==='idNguoiMuon'&&r[4]==='idNguoiMuon');}
 $('#mission-feedback').textContent=ok?'✓ Kết quả khớp yêu cầu trên dữ liệu mẫu.':'Chưa khớp. Kiểm tra cột cần lấy, điều kiện, thứ tự và ràng buộc của nhiệm vụ.';$('#mission-feedback').className='feedback '+(ok?'good':'bad');
 if(ok){const p=structuredClone(state());if(!p.taskDone&&!p.completed)p.xp=(Number(p.xp)||0)+20;p.taskDone=true;save(p)}showResults(r);$('#sql-error-help').innerHTML='';recordPractice(current.key,'verify',code,{...r,matched:ok});renderHistory();
 }catch(e){showError(e)}finally{working=false}}
function download(name,text,type='text/plain;charset=utf-8'){const u=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),2000)}
function drawQuiz(){const types=['mc','mc','ma','sx','dd','ds'],used=new Set();quiz=types.map(type=>{const candidates=current.quiz.map((q,i)=>({q,i})).filter(x=>x.q.type===type&&!used.has(x.i));const x=shuffle(candidates)[0];used.add(x.i);return{...x.q,order:shuffle(x.q.options.map((_,i)=>i))}})}
function renderFinal(){
 const p=state(),eligible=[0,1,2,3].every(i=>p.passed?.includes(i))&&p.taskDone;
 $('#lesson-body').innerHTML=`<article class="panel"><div class="eyebrow">Áp dụng và tự kiểm tra</div><h2>Thử thách cuối</h2><p>Mỗi đề có 6 câu từ ngân hàng. Đạt ít nhất 5/6, qua 4 chặng và nhiệm vụ SQL để hoàn thành phần tự học của buổi.</p><div class="notice">${eligible?'Con đã sẵn sàng làm thử thách.':'Con có thể thử đề ngay. Hoàn thành 4 chặng, nhiệm vụ SQL và đạt 5/6 để nhận chứng chỉ.'}</div><button class="primary" data-action="new-quiz" ${eligible||selfStudy()?'':'disabled'}>Rút đề mới</button><div id="quiz"></div>${p.completed?`<div class="notice">✓ Đã hoàn thành phần tự học. Điểm cao nhất: ${p.best||0}/6.<br><button data-action="report">Tải phiếu học tập</button></div>`:''}<p class="tiny">Điểm tự học được chấm trong trình duyệt, chưa phải điểm chính thức do giáo viên xác nhận.</p></article>`;
 if(quiz)renderQuiz();
}
function renderQuiz(){
 $('#quiz').innerHTML=`<form id="quiz-form">${quiz.map((q,i)=>`<section class="quiz-item"><b>Câu ${i+1} · ${q.type==='ma'?'Chọn đủ 2 đáp án':q.type==='sx'?'Sắp xếp':q.type==='ds'?'Đúng / Sai':q.type==='dd'?'Chọn từ phù hợp':'Chọn một đáp án'}</b><p>${esc(q.q)}</p>${q.type==='sx'?`<div data-order="${i}">${q.order.map(j=>`<div class="order-row" data-value="${j}"><span>${esc(q.options[j])}</span><button type="button" data-action="up" aria-label="Đưa bước lên">↑</button><button type="button" data-action="down" aria-label="Đưa bước xuống">↓</button></div>`).join('')}</div>`:q.type==='dd'?`<label class="field">Câu trả lời<select name="q${i}" required><option value="">Chọn…</option>${q.order.map(j=>`<option value="${j}">${esc(q.options[j])}</option>`).join('')}</select></label>`:`<div class="options">${q.order.map(j=>`<label><input ${q.type==='ma'?'type="checkbox"':'type="radio" required'} name="q${i}" value="${j}">${esc(q.options[j])}</label>`).join('')}</div>`}<div id="q-feedback-${i}" class="feedback"></div></section>`).join('')}<button class="primary" style="margin-top:20px">Chấm thử thách</button><div id="quiz-feedback" class="feedback" aria-live="polite"></div></form>`;
 quiz.forEach((q,i)=>HopeStars.mount(document.querySelectorAll('.quiz-item')[i],()=>state(),'final',q.id||'sql-final-'+q.q,!!state().completed,save));
 $('#quiz-form').onsubmit=e=>{
  e.preventDefault();let score=0;const wager=structuredClone(state());const fd=new FormData(e.target),answers=[];
  quiz.forEach((q,i)=>{let answer;if(q.type==='ma')answer=fd.getAll('q'+i).map(Number).sort((a,b)=>a-b);else if(q.type==='sx')answer=[...document.querySelectorAll(`[data-order="${i}"] .order-row`)].map(r=>Number(r.dataset.value));else answer=Number(fd.get('q'+i));answers.push(answer);const ok=JSON.stringify(answer)===JSON.stringify(q.answer);if(ok)score++;HopeStars.grade(wager,'final',q.id||'sql-final-'+q.q,ok,!!state().completed);$('#q-feedback-'+i).textContent=(ok?'✓ Đúng. ':'Xem lại: ')+q.why;$('#q-feedback-'+i).className='feedback '+(ok?'good':'bad')});
  const p=wager;p.best=Math.max(p.best||0,score);p.attempts=[...(p.attempts||[]),{at:new Date().toISOString(),score}].slice(-20);p.completed=Boolean(p.completed||score>=5&&[0,1,2,3].every(i=>p.passed?.includes(i))&&p.taskDone);save(p);
  $('#quiz-feedback').textContent=`${score}/6 · ${score>=5?'Đạt phần tự học.':'Học lại phần chưa chắc và rút đề mới để thử tiếp.'}`;
  if(score>=5)$('#quiz-feedback').insertAdjacentHTML('beforeend','<br><button type="button" data-action="report">Tải phiếu học tập</button>');
 };
}
function auth(){parent.postMessage({type:'portal-account'},location.origin)}
function profile(){auth()}
function staff(){}
function addTeacher(){}
function resetPassword(){}
function renderStaff(){}
function openTool(view){if(!allowed()){pendingTool=view;home();auth('register');return}commitDraft();closeAuxiliary();current=null;quiz=null;stopWorker();activeView=view;location.hash=view;
 if(view==='projects'){auxiliary=SQLProjects.mount(app,{onHome:home,download,toast});return}
 app.innerHTML='<div class="eyebrow">Thiết kế và kiểm chứng</div><h1>Xưởng thiết kế cơ sở dữ liệu</h1><button data-action="home">← Lộ trình</button><p>Mô hình được lưu trên trình duyệt ở buổi 8. Kéo nối hoặc dùng bộ chọn để tạo FK; chạy DDL trong sandbox thiết kế riêng rồi đối chiếu cấu trúc thực tế.</p><section class="panel"><div id="designer-root"></div></section>';
 auxiliary=SQLDesigner.mount($('#designer-root'),{graph:cloud.state('buoi-08').design,download,onChange:graph=>{const p=structuredClone(cloud.state('buoi-08'));p.design=graph;cloud.save('buoi-08',p)},onTest:(summary,sql)=>cloud.logPractice('buoi-08','design',sql,summary)});
}
async function studentDetail(userId,key){if(!allowed()||cloud.role==='student')return;try{const d=await cloud.studentDetail(userId,key);if(!allowed()||cloud.role==='student')return;const l=C.lessons.find(l=>l.key===key),p=d.progress[0]?.state||{};p.passed=Array.isArray(p.passed)?p.passed:[];
 openModal(`<div class="eyebrow">${esc(d.profile.student_code)} · ${esc(d.profile.class_label)}</div><h2>${esc(d.profile.display_name)}</h2><label class="field">Bài cần xem<select id="detail-lesson">${C.lessons.map(x=>`<option value="${x.key}" ${x.key===key?'selected':''}>${x.n}. ${esc(x.title)}</option>`).join('')}</select></label><p>${p.passed?.length||0}/4 chặng · Nhiệm vụ SQL: ${p.taskDone?'đã khớp':'chưa khớp'} · Điểm tự học cao nhất: ${Number(p.best)||0}/6</p><p>Cách học: ${p.navigationMode==='self-study'?'Tự học / học bù':'Theo chặng'}.</p><h3>Checkpoint từng chặng</h3><ul>${l.stages.map((s,i)=>`<li>${esc(s.title)}: ${p.passed?.includes(i)?'đã qua':'chưa qua'} · ${Number(p.checkTries?.[i])||0} lượt trả lời</li>`).join('')}</ul><h3>SQL đang lưu</h3><pre>${esc(p.draft||'Chưa có nháp SQL.')}</pre><h3>Nhật kí / minh chứng</h3><p class="preserve-lines">${esc(p.evidence||'Chưa ghi nhật kí.')}</p><h3>Lịch sử thực hành bài này</h3>${d.history.map(r=>`<details><summary>${esc(r.kind)} · ${new Date(r.created_at).toLocaleString('vi-VN')} · ${r.summary.ok===false?'có lỗi':'đã ghi nhận'}</summary><pre>${esc(r.code)}</pre>${r.summary.ok===false?SQLTools.errorHTML(r.summary):SQLTools.resultsHTML(r.summary)}</details>`).join('')||'<p>Chưa có lịch sử.</p>'}<p class="tiny">Tiến độ và lịch sử là dữ liệu quá trình tự học; điểm rubric dự án được giáo viên chấm riêng.</p>`);
 $('#detail-lesson').onchange=e=>studentDetail(userId,e.target.value);
 }catch(error){toast(authError(error))}}
window.addEventListener('practice-change',()=>{if($('#history-sync'))$('#history-sync').textContent=cloud.practicePending()?'Có lịch sử đang chờ lưu trên trình duyệt.':'Lịch sử đã lưu. Bấm Làm mới để xem bản mới nhất.'});

function showConflict(){if(!current||!$('#conflict'))return;const id=cloud.lessonId(current.key),r=cloud.conflicts[id];$('#conflict').innerHTML=r?`<div class="notice warning"><b>Hai bản tiến độ khác nhau</b><p>Máy khác đã lưu thay đổi. Bản nháp trên máy này đang được giữ. Chọn bản để tiếp tục; tải nháp trước khi bỏ nếu cần.</p><div class="actions"><button data-action="draft-conflict">Tải bản nháp máy này</button><button data-action="keep-local">Giữ bản máy này</button><button data-action="keep-cloud">Dùng bản trên tài khoản</button></div></div>`:''}
document.addEventListener('click',async e=>{
 const b=e.target.closest('[data-action]');if(!b||b.disabled)return;
 const a=b.dataset.action;
 const learning=['study-mode','stage','next','run','verify','stop','explore','reset','save-code','export','restore','new-quiz','up','down','keep-local','keep-cloud','draft-conflict','report','history-refresh','save-version','save-backup','inspect-schema','history-code','history-backup','history-download'];
 if(learning.includes(a)&&!allowed()){home();auth('register');return}
 try{
 if(a==='home')home();if(a==='lesson')await lesson(b.dataset.key);if(a==='auth')auth(cloud.user?'login':'register');
 if(a==='designer'||a==='projects')openTool(a);
 if(a==='study-mode'){const p=structuredClone(state());p.navigationMode=selfStudy()?'guided':'self-study';save(p);renderLesson();toast(p.navigationMode==='self-study'?'Đã mở các chặng để tự học. Kết quả checkpoint giữ nguyên.':'Đã trở lại học theo chặng.');}
 if(a==='history-refresh')await renderHistory();
 if(a==='save-version'){if(!cloud.logPractice(current.key,'version',$('#sql').value,{ok:true,label:'Phiên bản lưu chủ động'}))toast('Chưa lưu được phiên bản.');await renderHistory()}
 if(a==='save-backup'){const r=await askWorker('export');if(cloud.logPractice(current.key,'backup','',{ok:true},r.sql)){toast('Bản sao đang được lưu trên trình duyệt.');await renderHistory()}else toast('Bản sao quá lớn hoặc hàng đợi đầy. Hãy xuất file .sql để giữ.')}
 if(a==='inspect-schema'){const r=await askWorker('schema');$('#result').innerHTML=r.schema.map(t=>'<h3>'+esc(t.name)+'</h3>'+SQLTools.resultsHTML({results:[{columns:['cid','Trường','Kiểu','NOT NULL','Mặc định','PK'],values:t.fields,total:t.fields.length}]})).join('')}
 if(a==='history-code'){const r=historyRows.find(r=>r.event_id===b.dataset.id);if(r){$('#sql').value=r.code;const p=structuredClone(state());p.draft=r.code;save(p);toast('Đã đưa phiên bản vào trình soạn. Bấm Chạy khi muốn thực thi.')}}
 if(a==='history-backup'){const r=historyRows.find(r=>r.event_id===b.dataset.id);if(r?.snapshot_sql){showResults(await askWorker('restore',{sql:r.snapshot_sql}));cloud.logPractice(current.key,'restore','',{ok:true,source:r.event_id});toast('Đã phục hồi từ bản sao trên trình duyệt.');await renderHistory()}}
 if(a==='history-download'){const r=historyRows.find(r=>r.event_id===b.dataset.id);if(r?.snapshot_sql)download(current.key+'-backup.sql',r.snapshot_sql)}
 if(a==='stage'){stageIndex=Number(b.dataset.index);quiz=null;renderLesson()}
 if(a==='next'){stageIndex++;renderLesson()}
 if(a==='run')await runSql();if(a==='verify')await verify();if(a==='stop'){stopWorker();toast('Đã dừng sandbox. Bấm Đặt lại trước khi chạy tiếp.')}
 if(a==='explore'){
  let sql=current.mission.target;
  if(current.n===1&&$('#explore-choice').value==='all')sql='SELECT idLuotMuon,idNguoiMuon,idThietBi FROM luot_muon ORDER BY idLuotMuon;';
  if(current.n===2)sql="SELECT tenNguoiMuon,lop FROM nguoi_muon WHERE lop='"+$('#explore-choice').value+"' ORDER BY idNguoiMuon;";
  if(current.n===4&&$('#explore-choice').value==='wrong')sql=sql.replace('l.idNguoiMuon=n.idNguoiMuon','l.idThietBi=n.idNguoiMuon');
  $('#sql').value=sql;await runSql();
 }
 if(a==='reset'){stopWorker();await initWorker();toast('Đã đặt lại dữ liệu mẫu.');if($('#result'))$('#result').textContent='Dữ liệu mẫu đã được khôi phục.'}
 if(a==='save-code')download(current.key+'.sql',$('#sql').value);
 if(a==='export'){const r=await askWorker('export');download(current.key+'-backup-sqlite.sql',r.sql)}
 if(a==='restore')$('#restore-file').click();
 if(a==='new-quiz'){drawQuiz();renderQuiz()}
 if(a==='up'||a==='down'){const row=b.closest('.order-row');if(a==='up'&&row.previousElementSibling)row.parentNode.insertBefore(row,row.previousElementSibling);if(a==='down'&&row.nextElementSibling)row.parentNode.insertBefore(row.nextElementSibling,row)}
 if(a==='login-tab')auth('login');if(a==='register-tab')auth('register');
 if(a==='logout'){commitDraft();pendingLesson=null;await cloud.signOut();modal.close();home()}
 if(a==='staff')await staff();if(a==='add-teacher')addTeacher();if(a==='reset-password')resetPassword(b.dataset.id);
 if(a==='csv'){const cell=s=>'"'+String(s??'').replaceAll('"','""').replace(/^[=+@-]/,"'$&")+'"';download('sql11-tien-do.csv','\ufeff'+[['MSHS','Họ tên','Lớp','Family','Tự học hoàn thành'],...dashboardData.students.map(s=>[s.student_code,s.display_name,s.class_label,s.family,s.completed])].map(r=>r.map(cell).join(',')).join('\r\n'),'text/csv;charset=utf-8')}
 if(a==='keep-local'||a==='keep-cloud'){cloud.resolve(cloud.lessonId(current.key),a==='keep-local');renderLesson()}
 if(a==='draft-conflict')download(current.key+'-ban-nhap.json',JSON.stringify(state(),null,2),'application/json');
 if(a==='report'){const p=state();download(current.key+'-phieu-hoc-tap.md',`# Phiếu tự học · ${current.title}\n\nHọ tên: ${cloud.profile?.display_name||''}\nMã: ${cloud.profile?.student_code||''}\nLớp: ${cloud.profile?.class_label||''}\nBuổi ${current.n} · SGK ${current.sgk}\nChặng: ${p.passed?.length||0}/4\nNhiệm vụ SQL: ${p.taskDone?'Đã khớp':'Chưa'}\nĐiểm tự học cao nhất: ${p.best||0}/6\n\n## Nhật kí thực hành\n${p.evidence||'Chưa nhập'}\n\nĐây là phiếu kết quả tự học, chưa phải chứng nhận do giáo viên xác minh.\n`)}
 }catch(err){toast(authError(err))}
});
$('#home').onclick=home;$('#account').onclick=()=>auth();$('#staff').onclick=staff;
window.addEventListener('cloud-change',()=>{if(!cloud.user&&(current||activeView!=='home')){pendingDraft=null;clearTimeout(draftTimer);stopWorker();current=null;quiz=null;modal.close();home()}updateNav();showConflict()});
window.addEventListener('hashchange',()=>{const key=location.hash.slice(1);if(['designer','projects'].includes(key)&&activeView!==key){openTool(key);return}if(C.lessons.some(l=>l.key===key)&&current?.key!==key)lesson(key).catch(e=>toast(authError(e)))});
window.addEventListener('beforeunload',e=>{if(cloud.user&&(Object.keys(cloud.pending).length||cloud.practicePending()||auxiliary?.dirty?.())){e.preventDefault();e.returnValue=''}});
(async()=>{try{await cloud.init();const key=location.hash.slice(1);if(C.lessons.some(l=>l.key===key))await lesson(key,new URLSearchParams(location.search).has('cuoi')?5:Number(new URLSearchParams(location.search).get('chang')||0));else if(['designer','projects'].includes(key))openTool(key);else home()}catch{app.innerHTML='<section class="panel"><h2>Chưa mở được bài</h2><p>Thử tải lại trang hoặc trở về khóa học.</p><button data-action="home">Mở lộ trình</button></section>';$('#sync').textContent='Chưa kết nối được · chưa có tiến độ tài khoản'}})();
})();
