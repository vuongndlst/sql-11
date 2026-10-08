/* Optional short games. They never change lesson answers, XP or certificates. */
export function stationGame({theme,seed,title,onEnter,onCancel}){
 const names={workshop:'Robot tìm đường',space:'Chuyến bay tránh thiên thạch',archive:'Nối đường dữ liệu',research:'Đưa mẫu vào đúng nhóm'};
 const help={workshop:'Dùng phím mũi tên hoặc nút để đưa robot tới cờ. Có thể xem đường gợi ý.',space:'Bấm hoặc nhấn Space để nâng tàu. Đi qua 4 khoảng trống; chạm thiên thạch thì thử lại.',archive:'Chọn MaHS ở bảng MƯỢN, rồi chọn đúng ID ở bảng HỌC SINH. Nối đủ 3 cặp.',research:'Theo quy tắc của trò chơi: số chẵn vào nhóm A, số lẻ vào nhóm B. Chọn nhóm rồi điều chỉnh lực và phóng mẫu.'};
 const previousFocus=document.activeElement;const dialog=document.createElement('section');dialog.className='q-mini';dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-label',names[theme]);
 dialog.innerHTML='<div class="q-mini-card"><div class="q-nho">CHƠI NHANH · TÙY CHỌN · KHÔNG TÍNH ĐIỂM BÀI</div><h2></h2><p class="q-mini-help"></p><canvas width="440" height="300" tabindex="0"></canvas><div class="q-mini-controls"></div><p class="q-mini-status" role="status"></p><div class="q-mini-actions"><button class="q-vao q-mini-enter">Vào bài ngay</button><button class="q-nut q-mini-retry">Chơi / thử lại</button><button class="q-nut q-mini-back">Về đảo</button></div><p class="q-mini-note">Khoảng 30–45 giây. Con có thể bỏ qua bất kỳ lúc nào; các trạm luôn mở.</p></div>';
 dialog.querySelector('h2').textContent=names[theme]+' · '+title;dialog.querySelector('.q-mini-help').textContent=help[theme];document.body.append(dialog);
 const canvas=dialog.querySelector('canvas'),g=canvas.getContext('2d'),controls=dialog.querySelector('.q-mini-controls'),status=dialog.querySelector('.q-mini-status');
 let closed=false,raf=0,active=false,won=false,t0=0,last=0,state,selected=null,round=0;
 let rs=(seed*7919+31)>>>0;const rand=()=>{rs=(Math.imul(rs,1664525)+1013904223)>>>0;return rs/4294967296};
 const finish=fn=>{if(closed)return;closed=true;cancelAnimationFrame(raf);document.removeEventListener('keydown',key);dialog.remove();previousFocus?.focus();fn()};
 const say=s=>status.textContent=s;
 const button=(label,fn)=>{const b=document.createElement('button');b.type='button';b.className='q-nut';b.textContent=label;b.onclick=fn;controls.append(b);return b;};
 const win=()=>{active=false;won=true;say('✓ Xong thử thách! Con có thể vào bài hoặc chơi lại.');dialog.querySelector('.q-mini-enter').textContent='Vào bài học';draw();};
 const lose=()=>{active=false;say('Thử lại nếu con muốn, hoặc bấm Vào bài ngay.');draw();};
 function maze(){
  const rows=5,cols=8,cells=Array.from({length:rows*cols},()=>[1,1,1,1]),visited=new Set([0]),stack=[0],dirs=[[-1,0],[0,1],[1,0],[0,-1]];
  while(stack.length){const pos=stack[stack.length-1],r=Math.floor(pos/cols),c=pos%cols,options=[];dirs.forEach(([dr,dc],i)=>{const nr=r+dr,nc=c+dc,n=nr*cols+nc;if(nr>=0&&nr<rows&&nc>=0&&nc<cols&&!visited.has(n))options.push([i,n]);});if(!options.length){stack.pop();continue;}const [d,n]=options[Math.floor(rand()*options.length)];cells[pos][d]=0;cells[n][(d+2)%4]=0;visited.add(n);stack.push(n);}
  state={cells,pos:0,rows,cols,trail:[],hint:false};
 }
 function move(d){if(!active||theme!=='workshop'||d<0||d>3)return;const s=state;if(!s.cells[s.pos][d])s.pos+=[-s.cols,1,s.cols,-1][d];if(s.pos===s.cells.length-1)win();else draw();}
 function init(){cancelAnimationFrame(raf);active=true;won=false;last=0;t0=performance.now();selected=null;round=0;controls.replaceChildren();dialog.querySelector('.q-mini-enter').textContent='Vào bài ngay';say('Chơi theo hướng dẫn; có thể vào bài bất kỳ lúc nào.');
  if(theme==='workshop'){maze();['↑','→','↓','←'].forEach((x,i)=>button(x,()=>move(i)));button('Gợi ý đường',()=>{const path=[],walk=(p,from)=>{path.push(p);if(p===39)return true;for(let d=0;d<4;d++){const n=p+[-8,1,8,-1][d];if(!state.cells[p][d]&&n!==from&&walk(n,p))return true;}path.pop();return false;};walk(0,-1);state.trail=path;state.hint=true;draw();});}
  if(theme==='space'){state={y:150,vy:0,gates:[],spawn:.5,passed:0};button('Nâng tàu ↑',boost);}
  if(theme==='archive'){state={links:{},order:[101,102,103].sort(()=>rand()-.5)};}
  if(theme==='research'){state={target:0,power:60,ball:null,numbers:[seed%2?7:8,seed%2?10:11],hits:0};button('Nhóm A (chẵn)',()=>{if(state.ball)return;state.target=0;draw()});button('Nhóm B (lẻ)',()=>{if(state.ball)return;state.target=1;draw()});const label=document.createElement('label');label.textContent='Lực ';const slider=document.createElement('input');slider.type='range';slider.min='40';slider.max='100';slider.value='60';slider.setAttribute('aria-label','Lực phóng');slider.oninput=()=>state.power=Number(slider.value);label.append(slider);controls.append(label);button('Phóng mẫu',shoot);}
  draw();canvas.focus();if(theme==='space'||theme==='research')raf=requestAnimationFrame(tick);
 }
 function boost(){if(active&&theme==='space')state.vy=-175;}
 function shoot(){if(!active||theme!=='research'||state.ball)return;const tx=state.target?345:245,flight=.65+state.power/200;state.ball={x:48,y:238,vx:(tx-48)/flight,vy:-150-(state.power-65)*2};}
 function key(e){if(closed)return;const k=e.key;if(k==='Escape'){e.preventDefault();finish(onCancel);return;}if(k==='Tab'){const nodes=[...dialog.querySelectorAll('button,input,canvas')].filter(n=>!n.disabled),i=nodes.indexOf(document.activeElement);e.preventDefault();nodes[(i+(e.shiftKey?-1:1)+nodes.length)%nodes.length]?.focus();return;}if(e.target?.tagName==='INPUT')return;if(k.startsWith('Arrow')||k===' '){e.preventDefault();if(theme==='workshop')move(['ArrowUp','ArrowRight','ArrowDown','ArrowLeft'].indexOf(k));if(k===' '&&theme==='space')boost();if(k===' '&&theme==='research')shoot();}}
 document.addEventListener('keydown',key);
 canvas.onclick=e=>{if(!active)return;const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*440/r.width,y=(e.clientY-r.top)*300/r.height;
  if(theme==='space')boost();
  if(theme==='archive'){const row=Math.floor((y-65)/70);if(row<0||row>2)return;if(x<210){selected=101+row;say('Chọn ID = '+selected+' ở bảng HỌC SINH.');}else if(selected!==null){if(state.order[row]===selected){state.links[selected]=row;selected=null;say('✓ Đúng khóa tham chiếu.');if(Object.keys(state.links).length===3)win();}else say('ID chưa khớp MaHS. Con thử lại nhé.');}draw();}
 };
 function tick(now){if(closed||!active)return;const dt=Math.min(.033,last?(now-last)/1000:0);last=now;
  if(now-t0>45000){active=false;say('Đã chơi 45 giây. Con có thể vào bài hoặc chơi lại.');draw();return;}
  if(theme==='space'){const s=state;s.vy+=330*dt;s.y+=s.vy*dt;s.spawn-=dt;if(s.spawn<=0){s.gates.push({x:450,gap:80+rand()*120,counted:false});s.spawn=2.1;}
   for(const a of s.gates){a.x-=112*dt;if(a.x<75&&!a.counted){a.counted=true;s.passed++;if(s.passed===4){win();return;}}if(Math.abs(a.x-90)<28&&(s.y<a.gap-62||s.y>a.gap+62)){lose();return;}}
   s.gates=s.gates.filter(a=>a.x>-35);if(s.y<12||s.y>288){lose();return;}
  }
  if(theme==='research'&&state.ball){const b=state.ball;b.x+=b.vx*dt;b.vy+=270*dt;b.y+=b.vy*dt;if(b.y>=238&&b.vy>0){const correct=state.numbers[round]%2?1:0,tx=state.target?345:245,hit=Math.abs(b.x-tx)<35;
    if(hit&&state.target===correct){state.hits++;round++;state.ball=null;if(round===2){win();return;}say('✓ Đúng nhóm. Thử mẫu thứ hai.');}else{state.ball=null;say(hit?'Mẫu chưa đúng nhóm theo quy tắc chẵn/lẻ.':'Chưa vào vùng đích. Điều chỉnh lực rồi thử lại.');}}
  }
  draw();raf=requestAnimationFrame(tick);
 }
 function text(s,x,y,size=16,color='#EAF3FF'){g.fillStyle=color;g.font=`600 ${size}px system-ui`;g.fillText(s,x,y);}
 function draw(){g.fillStyle='#13253D';g.fillRect(0,0,440,300);if(!state){text('Bấm Chơi để bắt đầu',125,150);return;}
  if(theme==='workshop'){const s=state,size=48,ox=28,oy=28;g.lineWidth=3;g.strokeStyle='#FFB56B';for(let p=0;p<40;p++){const x=ox+(p%8)*size,y=oy+Math.floor(p/8)*size,w=s.cells[p];g.beginPath();if(w[0]){g.moveTo(x,y);g.lineTo(x+size,y);}if(w[1]){g.moveTo(x+size,y);g.lineTo(x+size,y+size);}if(w[2]){g.moveTo(x,y+size);g.lineTo(x+size,y+size);}if(w[3]){g.moveTo(x,y);g.lineTo(x,y+size);}g.stroke();}
   if(s.hint){g.strokeStyle='#84E1C7';g.lineWidth=2;g.beginPath();s.trail.forEach((p,i)=>{const x=ox+(p%8+.5)*size,y=oy+(Math.floor(p/8)+.5)*size;i?g.lineTo(x,y):g.moveTo(x,y)});g.stroke();}
   text('⚑',ox+7*size+14,oy+4*size+32,27,'#84E1C7');const x=ox+(s.pos%8)*size,y=oy+Math.floor(s.pos/8)*size;g.fillStyle='#A9D7FF';g.fillRect(x+13,y+13,22,22);g.fillStyle='#13253D';g.fillRect(x+17,y+19,4,4);g.fillRect(x+27,y+19,4,4);
  }
  if(theme==='space'){for(const a of state.gates){g.fillStyle='#8A79B8';g.fillRect(a.x-15,0,30,a.gap-75);g.fillRect(a.x-15,a.gap+75,30,300-a.gap-75);}g.fillStyle='#8BC7FF';g.beginPath();g.moveTo(108,state.y);g.lineTo(76,state.y-11);g.lineTo(76,state.y+11);g.closePath();g.fill();text('Khoảng trống: '+state.passed+'/4',15,25);}
  if(theme==='archive'){text('MƯỢN · MaHS',20,35);text('HỌC SINH · ID',250,35);for(let i=0;i<3;i++){const y=65+i*70;g.fillStyle=selected===101+i?'#DCA44C':'#235E6B';g.fillRect(20,y,155,45);g.fillStyle='#235E6B';g.fillRect(250,y,170,45);text('MaHS: '+(101+i),35,y+28);text('ID: '+state.order[i],270,y+28);}g.strokeStyle='#84E1C7';g.lineWidth=3;for(const [id,row] of Object.entries(state.links)){g.beginPath();g.moveTo(175,87+(Number(id)-101)*70);g.lineTo(250,87+row*70);g.stroke();}}
  if(theme==='research'){text('Mẫu cần đưa vào nhóm: '+(state.numbers[round]??'✓'),15,28);text('A · chẵn',207,285);text('B · lẻ',317,285);for(const [i,x] of [[0,245],[1,345]]){g.fillStyle=state.target===i?'#84E1C7':'#47746B';g.fillRect(x-32,239,64,18);}g.fillStyle='#FFD07A';g.beginPath();g.arc(state.ball?.x||48,state.ball?.y||238,9,0,Math.PI*2);g.fill();text('Lực: '+state.power,15,52);}
  if(won){g.fillStyle='#13253DBB';g.fillRect(0,105,440,80);text('✓ Hoàn thành thử thách',92,155,21,'#84E1C7');}
 }
 dialog.querySelector('.q-mini-enter').onclick=()=>finish(onEnter);dialog.querySelector('.q-mini-back').onclick=()=>finish(onCancel);dialog.querySelector('.q-mini-retry').onclick=init;
 draw();dialog.querySelector('.q-mini-enter').focus();
 return {close:()=>finish(onCancel)};
}
