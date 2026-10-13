// 8 trò cổ điển (13/10/2026): Dò mìn, 2048, Tắt đèn, Nhớ màu, Đập chuột, Sudoku, Cờ caro, Đua xe.
// Cùng khung với arcade-board-games.js: nhìn từ trên xuống, chạm/nhấp, phím mũi tên + Space/Enter, nút điều khiển.
// Độ khó theo cấp 1–5 lấy từ LEVELS trong arcade-rules.js. Điểm game không ghi vào điểm học.
import * as THREE from 'three';
import {rng,param} from './arcade-rules.js?v=648cbdfc9300';
import {minesState,minesReveal,minesFlag,minesCount,minesSafeHint,minesSureMine,g2048State,g2048Slide,g2048CanMove,lightsState,lightsPress,
 simonSequence,moleNext,sudokuMake,sudokuConflicts,sudokuDone,sudokuBox,caroWinner,caroBest,racerRow} from './arcade-classic-rules.js?v=648cbdfc9300';

export const CLASSIC_TYPES=['mines','g2048','lights','simon','mole','sudoku','caro','racer'];
const ARROWS=['ArrowUp','ArrowRight','ArrowDown','ArrowLeft'],STEP=[[0,-1],[1,0],[0,1],[-1,0]];

export function setupClassic({type,seed,level=3,art,scene,camera,canvas,control,status,active,win,lose,tone,held}){
 const P=k=>param(type,k,level),group=new THREE.Group();scene.add(group);
 const ray=new THREE.Raycaster(),point=new THREE.Vector2(),pickable=[],cleanup=[];let attempt=0,clock=0;
 const say=t=>{status.textContent=t;};
 function ground(w,h,color=0x193847){art.box(w+.5,.18,h+.5,0x2f4f62,0,-.14,0,group);art.box(w,.03,h,color,0,-.03,0,group);}
 function cell(x,z,size,color,parent=group){const g=new THREE.Group();parent.add(g);g.position.set(x,0,z);g.userData.base=art.box(size,.16,size,color,0,.08,0,g);g.userData.size=size;pickable.push(g);return g;}
 function paint(g,color){g.userData.base.material=art.mat(color);}
 function write(g,text,color=0xffffff,size){const key=text+':'+color;if(g.userData.key===key)return;if(g.userData.label)g.remove(g.userData.label);g.userData.label=null;g.userData.key=key;if(!text)return;const l=art.label(text,color,size||g.userData.size*.62,g);l.rotation.x=-Math.PI/2;l.position.y=.175;g.userData.label=l;}
 function grid(n,size,gap,make){const cs=size+gap,out=[];for(let i=0;i<n*n;i++){const x=(i%n-(n-1)/2)*cs,z=(Math.floor(i/n)-(n-1)/2)*cs;const g=make(x,z,i);g.userData.i=i;out.push(g);}return out;}
 function hitObject(e){const r=canvas.getBoundingClientRect();point.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(point,camera);for(const hit of ray.intersectObjects(pickable,true)){let o=hit.object;while(o&&!pickable.includes(o))o=o.parent;if(o)return o;}return null;}
 function groundPoint(e){const r=canvas.getBoundingClientRect();point.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(point,camera);const v=new THREE.Vector3();return ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),0),v)?v:null;}
 const cursor=art.box(1,.05,1,0xf4c258,0,.02,0,group);cursor.visible=false;
 function focusOn(g){if(!g){cursor.visible=false;return;}const s=g.userData.size*1.16;cursor.scale.set(s,1,s);cursor.position.set(g.position.x,.012,g.position.z);cursor.visible=true;}
 function moveFocus(i,n,k,count=n*n){const d=ARROWS.indexOf(k);if(d<0)return i;const x=i%n+STEP[d][0],y=Math.floor(i/n)+STEP[d][1];if(x<0||y<0||x>=n||y>=n)return i;return Math.min(count-1,y*n+x);}
 function dispose(){cleanup.forEach(fn=>fn());scene.remove(group);}
 const seedFor=()=>(seed+attempt*7919)>>>0;

 // ------------------------------------------------------------ Dò mìn
 if(type==='mines'){
  const n=P('size'),N=P('n'),size=Math.min(.95,8.1/n)-.06;ground(n*(size+.06),n*(size+.06));
  const NUM=[0,0x2563eb,0x15803d,0xdc2626,0x6d28d9,0xb45309,0x0f766e,0x334155,0x111827];let s,focus=0,flagMode=false;
  const cells=grid(n,size,.06,(x,z,i)=>{const g=cell(x,z,size,0x497990);g.userData.choose=()=>act(i);return g;});
  const modeBtn=control('Cắm cờ: tắt',()=>{flagMode=!flagMode;modeBtn.textContent='Cắm cờ: '+(flagMode?'bật':'tắt');modeBtn.setAttribute('aria-pressed',String(flagMode));});
  control('Gợi ý',()=>{if(!active())return;const safe=minesSafeHint(s);if(safe!==null){focus=safe;focusOn(cells[focus]);say('Ô đang chọn chắc chắn an toàn: bấm Space hoặc chạm để mở.');return;}const m=minesSureMine(s);if(m!==null){focus=m;focusOn(cells[focus]);say('Ô đang chọn chắc chắn có mìn: cắm cờ cho nó.');}else say('Chưa suy ra được ô chắc chắn. Thử ô ở xa các số lớn.');});
  function show(){cells.forEach((g,i)=>{if(s.open.has(i)){paint(g,0xdfe7dd);const c=minesCount(s,i);write(g,c?String(c):'',NUM[c]||0x111827);}else if(s.lost&&s.mines?.has(i)){paint(g,0xf1b7a8);write(g,'✹',0xb91c1c);}else{paint(g,0x497990);write(g,s.flags.has(i)?'⚑':'',0xf87171);}});const left=n*n-N-s.open.size;say(`${s.flags.size}/${N} cờ · còn ${left} ô an toàn`);focusOn(cells[focus]);}
  function act(i,flag=flagMode){if(!active())return;focus=i;if(flag){if(minesFlag(s,i))tone('flip');show();return;}const r=minesReveal(s,i,seedFor());if(r==='mine'){show();lose('Trúng mìn rồi. Mở ô cạnh các số nhỏ trước, cắm cờ ô chắc chắn có mìn.');return;}if(r!=='none')tone('slide');show();if(r==='win')win();}
  for(const[k,l]of[['ArrowLeft','←'],['ArrowUp','↑'],['ArrowDown','↓'],['ArrowRight','→'],['Space','Mở ô']])control(l,()=>key(k));
  function key(k){if(k==='Space')return act(focus,flagMode);if(k==='Enter')return act(focus,true);focus=moveFocus(focus,n,k);focusOn(cells[focus]);}
  return {start(){attempt++;s=minesState(n,n,N);focus=Math.floor(n/2)*n+Math.floor(n/2);show();say(`Mở một ô bất kỳ để bắt đầu · ${N} quả mìn`);},key,pointer(e){const g=hitObject(e);if(g)g.userData.choose?.();},frame(){},
   inspect:()=>({w:n,h:n,n:N,mines:s.mines?[...s.mines]:null,open:[...s.open],flags:[...s.flags],positions:cells.map(g=>({x:g.position.x,z:g.position.z}))}),dispose};
 }

 // ------------------------------------------------------------ 2048
 if(type==='g2048'){
  const T=P('n'),size=1.42;ground(4*1.55,4*1.55);let s,start=null;
  const COL={0:0x35596a,2:0xeee4da,4:0xede0c8,8:0xf2b179,16:0xf59563,32:0xf67c5f,64:0xf65e3b,128:0xedcf72,256:0xedcc61,512:0xedc850};
  const cells=grid(4,size,.13,(x,z)=>cell(x,z,size,0x35596a));
  function show(){s.grid.forEach((v,i)=>{paint(cells[i],COL[v]||0xedc22e);write(cells[i],v?String(v):'',v<=4?0x5b4636:0xffffff,v>=128?.5:.62);});say(`Ô lớn nhất ${s.best} · mục tiêu ${T}`);}
  function slide(d){if(!active())return;if(g2048Slide(s,d)){tone('slide');show();if(s.best>=T){win();return;}}if(!g2048CanMove(s))lose('Bảng đã kín, hết nước đi. Giữ ô lớn ở một góc nhé.');}
  [[0,'↑'],[3,'←'],[2,'↓'],[1,'→']].forEach(([d,t])=>control(t,()=>slide(d)));
  const down=e=>{start={x:e.clientX,y:e.clientY};},up=e=>{if(!start||!active())return;const dx=e.clientX-start.x,dy=e.clientY-start.y;start=null;if(Math.max(Math.abs(dx),Math.abs(dy))<24)return;slide(Math.abs(dx)>Math.abs(dy)?(dx>0?1:3):(dy>0?2:0));};
  canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointerup',up);cleanup.push(()=>{canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointerup',up);});
  return {start(){attempt++;s=g2048State(seedFor());show();},key(k){const d=ARROWS.indexOf(k);if(d>=0)slide(d);},frame(){},inspect:()=>({grid:[...s.grid],best:s.best,target:T}),dispose};
 }

 // ------------------------------------------------------------ Tắt đèn
 if(type==='lights'){
  const n=P('size'),size=Math.min(1.3,6.4/n)-.1;ground(n*(size+.1),n*(size+.1));let s,focus=0,moves=0;
  const cells=grid(n,size,.1,(x,z,i)=>{const g=cell(x,z,size,0x2c4a5a);g.userData.choose=()=>press(i);return g;});
  function show(){cells.forEach((g,i)=>{const on=s.on.has(i);paint(g,on?0xf4c258:0x2c4a5a);g.userData.base.position.y=on?.12:.08;write(g,on?'☀':'',0xa16207,size*.5);});say(`Còn ${s.on.size} đèn sáng · ${moves} lần bấm`);focusOn(cells[focus]);}
  function press(i){if(!active())return;focus=i;moves++;const done=lightsPress(s,i);tone('flip');show();if(done)win();}
  for(const[k,l]of[['ArrowLeft','←'],['ArrowUp','↑'],['ArrowDown','↓'],['ArrowRight','→'],['Space','Bấm ô']])control(l,()=>key(k));
  control('Gợi ý',()=>{if(!active())return;const i=[...s.solution][0];if(i!==undefined){focus=i;focusOn(cells[i]);say('Thử bấm ô đang được khoanh vàng.');}});
  function key(k){if(k==='Space'||k==='Enter')return press(focus);focus=moveFocus(focus,n,k);focusOn(cells[focus]);}
  return {start(){attempt++;moves=0;s=lightsState(seedFor(),n,P('presses'));focus=0;show();},key,pointer(e){const g=hitObject(e);if(g)g.userData.choose?.();},frame(){},
   inspect:()=>({on:[...s.on],solution:[...s.solution],positions:cells.map(g=>({x:g.position.x,z:g.position.z}))}),dispose};
 }

 // ------------------------------------------------------------ Nhớ màu
 if(type==='simon'){
  const N=P('n'),SHOW=P('show'),pads=[],BASE=[0x2f8f5b,0xc0453a,0xd49b23,0x2f6fb0],LIT=[0x6ee7a0,0xff8a7a,0xffd56b,0x7cc0ff],NAME=['xanh lá','đỏ','vàng','xanh dương'];
  ground(6.2,6.2,0x22313b);[[0,-1.75],[1.75,0],[0,1.75],[-1.75,0]].forEach(([x,z],d)=>{const g=cell(x,z,1.9,BASE[d]);g.userData.choose=()=>press(d);write(g,['↑','→','↓','←'][d],0xffffff,.7);pads.push(g);});
  let seq,round,shown,timer,phase,pos,lit=-1,litT=0;
  function light(d,t=.32){lit=d;litT=t;pads.forEach((g,i)=>{paint(g,i===d?LIT[i]:BASE[i]);g.userData.base.position.y=i===d?.16:.08;});if(d>=0)tone('point');}
  function play(){phase='show';shown=0;timer=.55;say(`Chuỗi ${round}/${N} · Nhìn máy sáng các ô`);}
  function press(d){if(!active()||phase!=='input')return;light(d,.2);if(d!==seq[pos]){lose(`Ô thứ ${pos+1} phải là ô ${NAME[seq[pos]]}. Nhìn kỹ rồi thử lại nhé.`);return;}pos++;if(pos>=round){if(round>=N){win();return;}round++;play();}else say(`Đến lượt con: ${pos}/${round}`);}
  return {start(){attempt++;seq=simonSequence(seedFor(),N);round=Math.min(2,N);light(-1,0);play();},key(k){const d=ARROWS.indexOf(k);if(d>=0)press(d);},pointer(e){const g=hitObject(e);if(g)g.userData.choose?.();},
   frame(dt){if(litT>0){litT-=dt;if(litT<=0)light(-1,0);}if(phase!=='show')return;timer-=dt;if(timer<=0){if(shown<round){light(seq[shown],SHOW*.62);shown++;timer=SHOW;}else{phase='input';pos=0;say(`Đến lượt con: 0/${round}`);}}},
   inspect:()=>({seq,round,phase,pos,target:N}),dispose};
 }

 // ------------------------------------------------------------ Đập chuột
 if(type==='mole'){
  const N=P('n'),UP=P('up'),MISS=P('miss'),TWO=P('double'),holes=[];ground(6.6,6.6,0x5d8a4c);let random,hits,miss,wait,focus=4;
  for(let i=0;i<9;i++){const x=(i%3-1)*2.1,z=(Math.floor(i/3)-1)*2.1,g=new THREE.Group();group.add(g);g.position.set(x,0,z);g.userData.size=1.5;const hole=art.cylinder(.62,.06,0x2b1d14,g);hole.position.y=.04;const mole=new THREE.Group();g.add(mole);art.sphere(.42,0x8b5e3c,0,0,0,mole);for(const ex of[-.15,.15])art.sphere(.07,0x111827,ex,.18,.32,mole);art.sphere(.09,0xf9a8a8,0,.04,.4,mole);mole.position.y=-.7;g.userData.mole=mole;g.userData.up=0;g.userData.t=0;g.userData.choose=()=>whack(i);pickable.push(g);holes.push(g);}
  function whack(i){if(!active())return;focus=i;focusOn(holes[i]);const h=holes[i].userData;if(h.up>0&&h.t>0){h.t=0;h.up=0;hits++;tone('hit');if(hits>=N){win();return;}}else tone('step');show();}
  function show(){say(`${hits}/${N} chuột · lỡ ${miss}/${MISS}`);}
  return {start(){attempt++;random=rng(seedFor());hits=0;miss=0;wait=.6;holes.forEach(g=>{g.userData.up=0;g.userData.t=0;g.userData.mole.position.y=-.7;});focusOn(holes[focus]);show();},
   key(k){if(k==='Space'||k==='Enter')return whack(focus);focus=moveFocus(focus,3,k,9);focusOn(holes[focus]);},pointer(e){const g=hitObject(e);if(g)g.userData.choose?.();},
   frame(dt){clock+=dt;const up=holes.filter(g=>g.userData.up>0);wait-=dt;if(wait<=0&&up.length<(TWO?2:1)){const i=moleNext(random,9,up.map(g=>holes.indexOf(g)));const h=holes[i].userData;h.up=1;h.t=UP*(.85+random()*.3);wait=.35+random()*.45;}
    for(const g of holes){const h=g.userData;if(h.up>0){h.t-=dt;if(h.t<=0&&h.up>0){h.up=0;miss++;show();if(miss>=MISS){lose('Chuột chạy mất nhiều quá. Nhìn cả 9 lỗ và đập nhanh hơn nhé.');return;}}}const target=h.up>0?.25:-.7;h.mole.position.y+=(target-h.mole.position.y)*Math.min(1,dt*16);}},
   inspect:()=>({hits,miss,target:N,up:holes.map(g=>g.userData.up>0&&g.userData.t>0),positions:holes.map(g=>({x:g.position.x,z:g.position.z}))}),dispose};
 }

 // ------------------------------------------------------------ Sudoku
 if(type==='sudoku'){
  const n=P('size'),[bh,bw]=sudokuBox(n),size=Math.min(1.08,6.6/n)-.06;let s,focus=0;ground(n*(size+.06)+.2,n*(size+.06)+.2,0x0f2633);
  const cells=grid(n,size,.06,(x,z,i)=>{const g=cell(x,z,size,0xfdf8ec);g.userData.choose=()=>{if(!active())return;focus=i;show();};return g;});
  const step=size+.06;for(let b=1;b<n/bw;b++)art.box(.05,.2,n*step,0x0f2633,(b*bw-n/2)*step,.1,0,group);for(let b=1;b<n/bh;b++)art.box(n*step,.2,.05,0x0f2633,0,.1,(b*bh-n/2)*step,group);
  function show(){const bad=sudokuConflicts(s);cells.forEach((g,i)=>{const v=s.grid[i];paint(g,s.given[i]?0xd9e4e8:i===focus?0xfde68a:0xfdf8ec);write(g,v?String(v):'',s.given[i]?0x1e293b:bad.has(i)?0xdc2626:0x1d4ed8);});const empty=s.grid.filter(v=>!v).length;say(empty?`Còn ${empty} ô trống`:'Bảng đã kín nhưng còn số trùng (chữ đỏ).');focusOn(cells[focus]);}
  function put(v){if(!active()||s.given[focus])return;s.grid[focus]=v;tone(v?'flip':'slide');show();if(sudokuDone(s))win();}
  for(let v=1;v<=n;v++)control(String(v),()=>put(v),'Điền số '+v);control('Xoá',()=>put(0),'Xoá số');
  function key(k){if(k==='Space'||k==='Enter'){if(!s.given[focus])put((s.grid[focus]+1)%(n+1));return;}focus=moveFocus(focus,n,k);show();}
  return {start(){attempt++;s=sudokuMake(seedFor(),n,P('blanks'));focus=s.given.indexOf(false);show();},key,pointer(e){const g=hitObject(e);if(g)g.userData.choose?.();},frame(){},
   inspect:()=>({size:n,grid:[...s.grid],given:[...s.given],solution:[...s.solution],focus,positions:cells.map(g=>({x:g.position.x,z:g.position.z}))}),dispose};
 }

 // ------------------------------------------------------------ Cờ caro
 if(type==='caro'){
  const n=P('size'),K=P('n'),size=Math.min(.95,8/n)-.06;ground(n*(size+.06),n*(size+.06),0x8a6f4d);let b,focus=0,busy=0,random;
  const cells=grid(n,size,.06,(x,z,i)=>{const g=cell(x,z,size,0xf3e3c3);g.userData.choose=()=>place(i);return g;});
  function show(){cells.forEach((g,i)=>write(g,b[i]===1?'✕':b[i]===2?'◯':'',b[i]===1?0x1d4ed8:0xdc2626,size*.75));focusOn(cells[focus]);}
  function end(){const w=caroWinner(b,n,K);if(w===1){win();return true;}if(w===2){show();lose(`Máy xếp đủ ${K} quân liền hàng trước rồi. Nhớ chặn khi máy có ${K-1} quân liền nhau.`);return true;}if(w===3){lose('Hoà vì bảng đã kín. Thử tấn công sớm hơn nhé.');return true;}return false;}
  function place(i){if(!active()||busy>0||b[i])return;focus=i;b[i]=1;tone('flip');show();if(end())return;busy=.35;say('Máy đang nghĩ…');}
  function key(k){if(k==='Space'||k==='Enter')return place(focus);focus=moveFocus(focus,n,k);focusOn(cells[focus]);}
  for(const[k,l]of[['ArrowLeft','←'],['ArrowUp','↑'],['ArrowDown','↓'],['ArrowRight','→'],['Space','Đặt quân']])control(l,()=>key(k));
  return {start(){attempt++;random=rng(seedFor());b=Array(n*n).fill(0);busy=0;focus=Math.floor(n/2)*n+Math.floor(n/2);show();say(`Con: ✕ · Máy: ◯ · Cần ${K} quân liền hàng`);},key,pointer(e){const g=hitObject(e);if(g)g.userData.choose?.();},
   frame(dt){if(busy>0){busy-=dt;if(busy<=0){const m=caroBest(b,n,K,2,P('skill'),random);b[m]=2;tone('slide');show();if(!end())say(`Đến lượt con · Cần ${K} quân liền hàng`);}}},
   inspect:()=>({board:[...b],n,k:K,busy,positions:cells.map(g=>({x:g.position.x,z:g.position.z}))}),dispose};
 }

 // ------------------------------------------------------------ Đua xe
 if(type==='racer'){
  const N=P('n'),SPEED=P('speed'),L=P('lanes'),W=1.7,laneX=i=>(i-(L-1)/2)*W,PZ=3.4;let random,s;
  art.box(L*W+.6,.1,13,0x4b5563,0,-.03,0,group);for(const x of[-(L*W)/2-.15,(L*W)/2+.15])art.box(.12,.14,13,0xf3f4f6,x,.03,0,group);
  const stripes=[];for(let l=1;l<L;l++)for(let k=0;k<7;k++)stripes.push(art.box(.08,.02,.9,0xfef3c7,laneX(l)-W/2,.03,-6+k*2,group));
  function car(color){const g=new THREE.Group();group.add(g);art.box(.95,.32,1.5,color,0,.24,0,g);art.box(.75,.28,.75,0xdbeafe,0,.5,.05,g);for(const x of[-.48,.48])for(const z of[-.48,.48]){const w=art.cylinder(.17,.12,0x1f2937,g);w.rotation.z=Math.PI/2;w.position.set(x,.17,z);}return g;}
  const player=car(art.palette.accent),pool=[];for(let i=0;i<14;i++){const o=car([0xdc7460,0x599cc1,0xf5c566,0x7c3aed][i%4]);o.visible=false;pool.push(o);}
  function lane(d){if(!active())return;s.lane=Math.max(0,Math.min(L-1,s.lane+d));tone('step');}
  control('←',()=>lane(-1));control('→',()=>lane(1));
  return {start(){attempt++;random=rng(seedFor());s={lane:Math.floor(L/2),x:laneX(Math.floor(L/2)),rows:[],gap:1.2,passed:0};pool.forEach(o=>o.visible=false);say(`0/${N} xe`);},
   key(k){if(k==='ArrowLeft')lane(-1);if(k==='ArrowRight')lane(1);},pointer(e){const v=groundPoint(e);if(v)lane(v.x<s.x?-1:1);},
   frame(dt){clock+=dt;const v=SPEED+Math.min(1.2,s.passed*.04);s.x+=(laneX(s.lane)-s.x)*Math.min(1,dt*14);player.position.set(s.x,0,PZ);player.rotation.y=(laneX(s.lane)-s.x)*-.12;
    for(const o of stripes){o.position.z+=v*dt;if(o.position.z>7)o.position.z-=14;}
    s.gap-=dt;if(s.gap<=0){const blocked=racerRow(random,L);const cars=blocked.map(l=>{const o=pool.find(o=>!o.visible);if(!o)return null;o.visible=true;o.position.set(laneX(l),0,-7);return {o,lane:l};}).filter(Boolean);s.rows.push({z:-7,cars,counted:false});s.gap=(4.6+v*.35+random()*1.5)/v;/* hàng sau cách đủ xa để kịp đổi hai làn */}
    for(const r of s.rows){r.z+=v*dt;for(const c of r.cars){c.o.position.z=r.z;if(c.lane===s.lane&&Math.abs(r.z-PZ)<1.25&&Math.abs(s.x-laneX(s.lane))<.9){lose('Va chạm rồi. Đổi làn sớm hơn một chút nhé.');return;}}if(!r.counted&&r.z>PZ+1.3){r.counted=true;s.passed+=r.cars.length;tone('point');say(`${Math.min(N,s.passed)}/${N} xe`);if(s.passed>=N){win();return;}}if(r.z>8)r.cars.forEach(c=>c.o.visible=false);}
    s.rows=s.rows.filter(r=>r.z<=8);},
   inspect:()=>({lane:s.lane,lanes:L,passed:s.passed,target:N,rows:s.rows.map(r=>({z:r.z,lanes:r.cars.map(c=>c.lane)}))}),dispose};
 }
 throw Error('Unsupported classic game: '+type);
}
