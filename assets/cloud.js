/* Supabase-backed progress. Cache/outbox are partitioned by immutable Auth UUID. */
window.Cloud=(()=>{
 const cfg=window.SQL_CONFIG;
 const client=window.supabase.createClient(cfg.url,cfg.publishableKey,{auth:{storageKey:'lsts-learning-auth',persistSession:true,autoRefreshToken:true}});
 const api={client,user:null,profile:null,role:'student',enrollment:null,lessons:[],states:{},revisions:{},pending:{},conflicts:{},ready:false};
 let flushing=false,generation=0,hydration=null;
 const status=t=>document.querySelector('#sync').textContent=t;
 const emit=()=>window.dispatchEvent(new Event('cloud-change'));
 const storageKey=()=>`lsts:${api.user.id}:${cfg.courseId}:${cfg.runId}`;
 const store=()=>{if(api.user&&api.enrollment)try{localStorage.setItem(storageKey(),JSON.stringify({pending:api.pending,states:api.states,revisions:api.revisions}))}catch{status('Bộ nhớ máy đầy · hãy lưu trước khi đóng trang')}};
 const fail=({data,error})=>{if(error)throw error;return data};
 const snapshot=x=>JSON.parse(JSON.stringify(x));
 function reset(){generation++;api.user=null;api.profile=null;api.role='student';api.enrollment=null;api.states={};api.revisions={};api.pending={};api.conflicts={};api.ready=false;status('Chế độ khám phá · đăng nhập để lưu tiến độ');emit()}
 async function hydrate(user){
  const ticket=++generation;api.ready=false;api.user=user;status('Đang tải tiến độ tài khoản…');
  const profile=fail(await client.from('learning_profiles').select('*').eq('user_id',user.id).single());
  const role=fail(await client.rpc('learning_staff_access',{p_run:cfg.runId}));
  const enrollment=fail(await client.rpc('learning_enroll',{p_run:cfg.runId}));
  const rows=fail(await client.from('learning_progress').select('lesson_id,state,revision').eq('enrollment_id',enrollment.enrollment_id));
  if(ticket!==generation)return;
  api.profile=profile;api.role=role;api.enrollment=enrollment;api.states={};api.revisions={};api.pending={};api.conflicts={};
  for(const r of rows){api.states[r.lesson_id]=r.state;api.revisions[r.lesson_id]=r.revision}
  try{const cache=JSON.parse(localStorage.getItem(storageKey())||'null');
   if(cache?.pending)for(const [id,p]of Object.entries(cache.pending))if(Object.hasOwn(api.revisions,id)&&p&&typeof p.state==='object'){
    api.pending[id]=p;api.states[id]=p.state;
   }
  }catch{}
  api.ready=true;store();status('Đã tải tiến độ từ tài khoản');emit();await api.flush();
 }
 api.init=async()=>{
  api.lessons=fail(await client.from('learning_lessons').select('lesson_id,lesson_key,content_version').eq('course_id',cfg.courseId).eq('content_version',1));
  const session=fail(await client.auth.getSession())?.session;
  if(session)await hydrate(session.user);else{api.ready=true;emit()}
  client.auth.onAuthStateChange((event,session)=>{
   if(event==='SIGNED_OUT'){reset();api.ready=true;return}
   if(session&&session.user.id!==api.user?.id){
    // Never await other Supabase calls inside Auth callback (Auth lock).
    hydration=new Promise((resolve,reject)=>setTimeout(()=>hydrate(session.user).then(resolve,reject),0));
    hydration.catch(()=>{api.ready=false;status('Chưa tải được tài khoản · thử lại khi có mạng');emit()});
   }
  });
 };
 api.lessonId=key=>api.lessons.find(l=>l.lesson_key===key)?.lesson_id;
 api.state=key=>api.states[api.lessonId(key)]||{};
 api.save=(key,state)=>{
  if(!api.user||!api.ready||!api.enrollment)return false;
  const id=api.lessonId(key);if(!id)return false;
  if(api.conflicts[id]){api.pending[id].state=snapshot(state);api.states[id]=snapshot(state);store();status('Có hai bản tiến độ · chọn bản để lưu');return true;}
  const old=api.pending[id];api.pending[id]={state:snapshot(state),revision:old?.revision??api.revisions[id],mutation:crypto.randomUUID()};
  api.states[id]=snapshot(state);store();status('Đang chờ lưu…');api.flush();return true;
 };
 api.flush=async()=>{
  if(flushing||!api.user||!api.ready||!navigator.onLine)return;
  flushing=true;const ticket=generation;
  try{
   for(const id of Object.keys(api.pending)){
    if(ticket!==generation)break;if(api.conflicts[id])continue;
    // Drain a changed draft before moving to another lesson.
    while(api.pending[id]&&!api.conflicts[id]&&ticket===generation){
     const p=api.pending[id];
     const r=fail(await client.rpc('learning_save_progress',{p_enrollment:api.enrollment.enrollment_id,p_lesson:id,p_revision:p.revision,p_state:p.state,p_mutation:p.mutation}));
     if(ticket!==generation)break;
     if(r.conflict){api.conflicts[id]=r;status('Tiến độ đã đổi ở máy khác · cần chọn bản');emit();break;}
     api.revisions[id]=r.revision;
     if(api.pending[id]?.mutation===p.mutation){delete api.pending[id];api.states[id]=r.state;}
     else if(api.pending[id])api.pending[id].revision=r.revision;
     store();
    }
   }
   if(ticket===generation&&!Object.keys(api.pending).length)status('Đã lưu lên tài khoản');
  }catch{if(ticket===generation)status('Chưa lưu lên tài khoản · đang giữ bản nháp trên máy này');}
  finally{flushing=false;emit()}
 };
 api.resolve=(id,keepLocal)=>{
  const conflict=api.conflicts[id];if(!conflict)return;
  api.revisions[id]=conflict.revision;
  if(keepLocal){
   const p=api.pending[id];p.state.passed=Array.from(new Set([...(p.state.passed||[]),...(conflict.state.passed||[])])).sort();
   p.state.completed=Boolean(p.state.completed||conflict.state.completed);p.state.taskDone=Boolean(p.state.taskDone||conflict.state.taskDone);p.state.best=Math.max(p.state.best||0,conflict.state.best||0);
   p.revision=conflict.revision;p.mutation=crypto.randomUUID();api.states[id]=snapshot(p.state);
  }
  else{api.states[id]=conflict.state;delete api.pending[id];}
  delete api.conflicts[id];store();emit();api.flush();
 };
 api.signIn=async(email,password)=>{
  if(!api.lessons.length)api.lessons=fail(await client.from('learning_lessons').select('lesson_id,lesson_key,content_version').eq('course_id',cfg.courseId).eq('content_version',1));
  fail(await client.auth.signInWithPassword({email,password}));
  if(hydration)await hydration;
  if(!api.ready)await hydrate(fail(await client.auth.getUser()).user);
 };
 api.signUp=async(sid,name,cls,family,password)=>{
  if(!/^\d{7}$/.test(sid))throw Error('Mã học sinh phải gồm đúng 7 chữ số.');
  const result=await api.admin({action:'register_student',studentCode:sid,name,classLabel:cls,family,password});
  if(!result?.ok)throw Error('Chưa đăng ký được. Mã có thể đã có tài khoản; hãy đăng nhập hoặc liên hệ giáo viên.');
  await api.signIn(sid+'@lsts.edu.vn',password);
 };
 api.signOut=async()=>{
  await api.flush();fail(await client.auth.signOut({scope:'local'}));reset();api.ready=true;
 };
 api.updateProfile=async(fields)=>{
  const row=fail(await client.from('learning_profiles').update(fields).eq('user_id',api.user.id).select().single());api.profile=row;emit();return row;
 };
 api.password=async(current,password)=>fail(await client.auth.updateUser({password,current_password:current}));
 api.dashboard=async()=>fail(await client.rpc('learning_dashboard',{p_run:cfg.runId}));
 api.admin=async(fields)=>fail(await client.functions.invoke('learning-admin',{body:{...fields,runId:cfg.runId}}));
 window.addEventListener('online',()=>{if(api.user&&!api.ready)hydrate(api.user).catch(()=>status('Chưa tải được tài khoản'));else api.flush()});
 window.addEventListener('offline',()=>status('Mất mạng · bản nháp đang giữ trên máy này'));
 setInterval(()=>api.flush(),20000);
 return api;
})();
