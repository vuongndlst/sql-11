window.LessonLearning=(C)=>{
 'use strict';const p=C.packet,M=p.payload.learning;if(!M)return;const S=LocalLearning,key=p.lesson.lesson_key,kind=p.payload.kind,q=new URLSearchParams(location.search),embedded=q.get('nhung')==='1';
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),labels={core:'Cốt lõi',practice:'Luyện tập',challenge:'Thử sức'};
 const css=document.createElement('link');css.rel='stylesheet';css.href=new URL('learning.css?v='+PORTAL_RUNTIME_VERSION,document.currentScript?.src||location.href);document.head.append(css);
 document.body.classList.add('learning-focus');if(embedded)document.body.classList.add('station-focus','focus-hide-nav');
 const panel=document.createElement('details');panel.className='learning-panel';panel.id='learning-overview';
 panel.innerHTML=`<summary>Mục tiêu · sản phẩm · cách hoàn thành</summary><p class="learning-eyebrow">${esc(M.topic)} · ${esc(M.minutes)} (tham khảo)</p><div class="learning-grid"><div><h3>Con sẽ làm được</h3><ul>${M.objectives.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div><div><h3>Sản phẩm cần làm</h3><p>${esc(M.product)}</p><h3>Điều kiện hoàn thành</h3><p>${esc(M.completion)}</p></div></div><h3>Ôn nhanh nếu cần</h3><ul>${M.prerequisites.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><div class="learning-flow" aria-label="Cách học"><span>Dự đoán</span><b>→</b><span>Tự thử</span><b>→</b><span>Giải thích bằng kết quả</span></div><p>Kiến thức trước là gợi ý ôn tập; mọi bài và chặng vẫn mở.</p>`;
 let previous='';
 function currentStage(){
  if(kind==='cpp'||kind==='python'){const active=document.querySelector('#stepContainer article')?.dataset.stage||C.peek().active;const index=M.stages.findIndex(s=>s.id===active);return {index:Math.max(0,index),id:active||M.stages[0]?.id,final:M.stages[index]?.id?.includes('boss')||false};}
  if(kind==='sql'){const e=document.querySelector('.stage-list [data-index].active'),index=Number(e?.dataset.index||0);return {index,id:String(index),final:index===5};}
  if(kind==='ml'){const e=document.querySelector('.cac-chang button.dang'),buttons=[...document.querySelectorAll('.cac-chang button')],index=Math.max(0,buttons.indexOf(e));return {index,id:index>=M.stages.length-1?'final':String(index),final:index>=M.stages.length-1};}
  return {index:0,id:'activity',final:false};
 }
 function returnToWorld(){if(C.confirmLeave&&!C.confirmLeave())return;const st=currentStage();parent.postMessage({ma:key,loai:'dong',tiep:false,vua_xong:st.index+1},location.origin);}
 const rootForPanel=()=>kind==='cpp'||kind==='python'?document.querySelector('#stepContainer article'):kind==='ml'?document.querySelector('main'):kind==='sql'?document.querySelector('.lesson-head'):document.querySelector('.activity-page');
 function annotate(){
  const root=rootForPanel();if(!root)return;if(!document.contains(panel)){root.prepend(panel);}
  const st=currentStage();const stage=M.stages[st.index];
  const reflectionRoot=kind==='sql'?document.querySelector('#lesson-body'):root;
  if(stage&&reflectionRoot&&!reflectionRoot.querySelector('#learning-reflection')){
   const box=document.createElement('details');box.className='learning-panel learning-reflection';box.id='learning-reflection';box.innerHTML=`<summary>Dự đoán · thử · giải thích</summary><p>${esc(stage.reflection||'Ghi nhận kết quả đã thử và giải thích bằng minh chứng.')}</p><textarea rows="3" maxlength="1800" aria-label="Nhận xét của con" placeholder="Con dự đoán… Khi thử… Kết quả cho thấy…"></textarea><p class="hint">Lưu trong bài làm trên trình duyệt. Không dùng nhận xét này để khóa chặng.</p>`;
   const input=box.querySelector('textarea');input.value=C.peek().learningNotes?.[st.id]||'';input.oninput=()=>C.save(key,{...C.peek(),learningNotes:{...C.peek().learningNotes,[st.id]:input.value}});reflectionRoot.append(box);
  }
  for(const el of document.querySelectorAll('.challenge-card,.task')){
   const id=el.dataset.id||el.dataset.card||el.dataset.task||el.dataset.challenge||el.id.replace(/^challenge-|^task-/,'');let level=M.task_levels[id]||(el.classList.contains('advanced')||el.classList.contains('bonus')?'challenge':'core');
   if(!el.querySelector('.level-label')){const label=document.createElement('span');label.className='learning-pill level-label';label.dataset.level=level;label.textContent=labels[level];el.prepend(label);}
  }
  for(const bank of document.querySelectorAll('.waiting-bank'))if(!bank.querySelector('.learning-pill')){const label=document.createElement('p');label.className='learning-pill';label.dataset.level='challenge';label.textContent='Thử sức · chọn mức phù hợp';bank.prepend(label);}
  if(kind==='ml')for(const el of document.querySelectorAll('.the'))if(el.querySelector('h2')?.textContent===stage?.title&&!el.querySelector('.level-label')){const label=document.createElement('span');label.className='learning-pill level-label';label.dataset.level=stage.level;label.textContent=labels[stage.level];el.prepend(label);}
  if(embedded){
   for(const btn of document.querySelectorAll('#nextBtn,[data-go-step]'))if(btn.textContent!=='Về đảo · chọn trạm tiếp theo')btn.textContent='Về đảo · chọn trạm tiếp theo';
   if(!document.querySelector('#station-return')){const bar=document.createElement('div');bar.className='stage-return';bar.id='station-return';bar.innerHTML='<span>Học tập trung trong trạm · tiến độ được giữ</span><button>Về đảo 3D</button>';bar.querySelector('button').onclick=returnToWorld;document.body.append(bar);}
  }
  const now=JSON.stringify(st);if(now!==previous){previous=now;parent.postMessage({type:'lsts-location',lesson:key,index:st.index,stage:st.id,final:st.final,title:stage?.title||p.lesson.title,mode:'read'},location.origin);}
 }
 document.addEventListener('click',e=>{
  if(embedded&&e.target.closest('#nextBtn,[data-go-step]')){e.preventDefault();e.stopImmediatePropagation();returnToWorld();}
  if(e.target.closest('#novaFace,#bitFace'))sessionStorage.setItem('lsts-hints-open:'+C.user.id,'1');
  if(e.target.closest('.nova-close,.bit-close,#bitClose'))sessionStorage.removeItem('lsts-hints-open:'+C.user.id);
 },true);
 function summarySection(title,body,id){const box=document.createElement('details');box.className='learning-panel';box.id=id;box.innerHTML=`<summary>${esc(title)}</summary>${body}`;return box;}
 const video=summarySection('Tóm tắt tiếng Việt · gợi ý xem video',`<ol>${M.video_summary.map(x=>`<li>${esc(x)}</li>`).join('')}</ol><p>Không cần xem hết video để được ghi nhận nhiệm vụ; ưu tiên tự thử và giải thích.</p>`,'learning-video');
 const submit=summarySection('Cuối buổi · sản phẩm và bản sao',`<ol>${M.submission.map(x=>`<li>${esc(x)}</li>`).join('')}</ol><button id="learning-backup">Tải bản sao toàn khóa</button><p class="backup-note">Bản sao giúp chuyển bài làm sang máy khác. Kiểm tra tệp trong thư mục Tải xuống.</p><label>Phản hồi về bài (lưu trong bản sao, thầy xem khi con nộp)</label><textarea id="learning-feedback" maxlength="1000" rows="2" placeholder="Điều con làm được / điều còn khó / thời gian đã dùng"></textarea>`,'learning-submit');
 const support=document.createElement('section');support.id='learning-support';support.append(video,submit);document.body.append(support);
 support.querySelector('#learning-backup').onclick=()=>C.download();const feedback=support.querySelector('#learning-feedback');feedback.value=C.peek().lessonFeedback||'';feedback.oninput=()=>C.save(key,{...C.peek(),lessonFeedback:feedback.value});
 if(M.catchup){const help=summarySection('Tự học bù · web và HeidiSQL',M.catchup.html,'learning-catchup');support.prepend(help);}
 if(M.differentiation){const d=M.differentiation;support.prepend(summarySection('Cốt lõi và mở rộng của buổi học',`<h3>Cốt lõi</h3><ul>${d.core.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><h3>Thử sức khi có thời gian</h3><ul>${d.extension.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><p>Checkpoint hiện hành được giữ để ôn kiến thức; không bắt chạy toàn bộ phần mở rộng trong một buổi.</p>`,'learning-differentiation'));}
 if(M.projects?.length){const projects=document.createElement('section');projects.id='learning-projects';projects.className='learning-panel';projects.innerHTML='<h2>Dự án nhỏ · luyện tập tùy chọn</h2><p>Dùng kiến thức đã học, giữ ca kiểm thử và giải thích sản phẩm. Không ảnh hưởng điều kiện chứng chỉ bài.</p>';for(const project of M.projects)mountProject(project,projects);support.append(projects);}
 function mountProject(project,root){
  const box=document.createElement('details');box.className='learning-project';box.dataset.project=project.id;const old=C.peek().miniProjects?.[project.id]||{};
  box.innerHTML=`<summary>${esc(project.title)}</summary><p>${esc(project.prompt)}</p><p><b>Đầu vào/kết quả cần đạt:</b> ${esc(project.contract)}</p><div class="learning-flow"><span>Lập kế hoạch</span><b>→</b><span>Chạy và kiểm thử</span><b>→</b><span>Giải thích</span></div><label>Mã của con<textarea class="project-code" rows="9" maxlength="15000" spellcheck="false"></textarea></label><label>Dữ liệu nhập (mỗi dòng một lần nhập)<textarea class="project-input" rows="2" maxlength="1000"></textarea></label><div class="learning-actions"><button class="project-run">Chạy mã</button><button class="project-test">Chạy ca kiểm thử</button><button class="project-download">Tải sản phẩm</button></div><pre class="project-output" role="status">Kết quả sẽ hiện ở đây.</pre><label>Giải thích và hạn chế<textarea class="project-reflection" rows="3" maxlength="2000"></textarea></label><table><thead><tr><th>Tiêu chí</th><th>Minh chứng để đạt</th></tr></thead><tbody>${project.rubric.map(r=>`<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join('')}</tbody></table><p>Lưu cục bộ; nộp sản phẩm qua Canvas theo hướng dẫn giáo viên.</p>`;
  const code=box.querySelector('.project-code'),input=box.querySelector('.project-input'),reflection=box.querySelector('.project-reflection'),out=box.querySelector('.project-output');code.value=old.code||project.starter;input.value=old.input||'';reflection.value=old.reflection||'';
  const collect=()=>({code:code.value,input:input.value,reflection:reflection.value,updated_at:new Date().toISOString()});const save=extra=>C.save(key,{...C.peek(),miniProjects:{...C.peek().miniProjects,[project.id]:{...collect(),...extra}}});[code,input,reflection].forEach(e=>e.oninput=()=>save());
  const run=async(stdin)=>kind==='cpp'?CppRun.run(code.value,stdin,{echo:false}):PyRun.run(code.value,stdin.split(/\r?\n/),null,{echo:false});
  const errorText=r=>typeof r.error==='string'?r.error:r.err?.msg||r.err?.type||'Chưa chạy được';
  const norm=s=>String(s||'').replace(/\r/g,'').trim();
  box.querySelector('.project-run').onclick=async e=>{e.target.disabled=true;try{const r=await run(input.value);out.textContent=r.ok?(r.output??r.out):errorText(r);save({lastOutput:out.textContent});}catch(x){out.textContent=x.message;}finally{e.target.disabled=false;}};
  box.querySelector('.project-test').onclick=async e=>{e.target.disabled=true;try{const rows=[];for(const t of project.tests){const r=await run(t.input);rows.push({input:t.input,expected:t.expected,actual:r.output??r.out,ok:r.ok&&norm(r.output??r.out)===norm(t.expected)});}out.textContent=rows.map((r,i)=>`Ca ${i+1}: ${r.ok?'✓ Đạt':'Cần sửa'}\nNhập: ${r.input||'(không)'}\nCần: ${r.expected}\nCó: ${r.actual||'(trống)'}`).join('\n\n');save({tests:rows});}catch(x){out.textContent=x.message;}finally{e.target.disabled=false;}};
  box.querySelector('.project-download').onclick=()=>S.download(key+'-'+project.id+'.json',{format:'lsts-mini-project',lesson:key,project:project.id,student:{name:C.profile.display_name,class_label:C.profile.class_label},...collect(),tests:C.peek().miniProjects?.[project.id]?.tests||[],rubric:project.rubric});root.append(box);
 }
 let timer;const observer=new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(annotate,40)});observer.observe(document.body,{childList:true,subtree:true});annotate();
 window.LearningSupport={currentStage,returnToWorld};
};

