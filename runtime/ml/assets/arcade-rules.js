// Pure rules: seeded layouts can be reproduced without a renderer or a learner record.
export const CATALOG = {
 jump:{name:'Nhảy rào',group:'reflex',seconds:90,goal:'Vượt {n} hàng rào.',hint:'Nhấn Space hoặc chạm để nhảy trước hàng rào.'},
 flight:{name:'Lái máy bay',group:'reflex',seconds:90,goal:'Bay qua {n} cổng.',hint:'Nhấn Space hoặc chạm để nâng máy bay; thả để hạ.'},
 maze:{name:'Mê cung',group:'thinking',seconds:120,goal:'Tìm đường đến cổng sáng trong mê cung {n}.',hint:'Dùng các phím mũi tên hoặc nút hướng để di chuyển.'},
 memory:{name:'Lật hình',group:'thinking',seconds:90,goal:'Tìm đủ {n} cặp hình.',hint:'Chạm hai thẻ để tìm hình giống nhau.'},
 slide:{name:'Xếp số',group:'thinking',seconds:90,goal:'Xếp 1–8, ô trống ở cuối.',hint:'Chạm ô cạnh ô trống để trượt; Gợi ý chỉ một bước.'},
 bowling:{name:'Bowling',group:'control',seconds:90,goal:'Làm đổ ít nhất {n}/10 chai trong 2 lần lăn.',hint:'Ngắm bằng ← →; nhấn Lăn khi lực ở vùng sáng.'},
 tetris:{name:'Xếp gạch',group:'control',seconds:90,goal:'Xóa {n} hàng.',hint:'← → di chuyển · ↑ xoay · Space thả nhanh.'},
 breakout:{name:'Phá gạch',group:'control',seconds:90,goal:'Phá {n} viên gạch.',hint:'Di chuột/chạm hoặc giữ ← → để đỡ bóng.'},
 snake:{name:'Rắn săn mồi',group:'control',seconds:90,goal:'Thu thập {n} quả, tránh tường và thân.',hint:'Dùng các phím mũi tên hoặc nút hướng để đổi hướng.'},
 frogger:{name:'Qua đường',group:'reflex',seconds:90,goal:'Qua {n} làn xe đến bờ bên kia.',hint:'Dùng mũi tên; dừng ở dải an toàn rồi quan sát xe.'},
 pong:{name:'Bóng bàn',group:'control',seconds:90,goal:'Ghi {n} điểm trước máy.',hint:'Di chuột/chạm hoặc giữ ↑ ↓ để đỡ bóng.'},
 sokoban:{name:'Đẩy thùng',group:'thinking',seconds:120,goal:'Đẩy {n} vào đích.',hint:'Dùng mũi tên để đẩy; Hoàn tác khi cần.'},
 mines:{name:'Dò mìn',group:'thinking',seconds:120,goal:'Mở hết ô an toàn trên bảng {n}.',hint:'Chạm để mở ô; bật Cắm cờ để đánh dấu mìn. Số trên ô là số mìn quanh nó.'},
 g2048:{name:'2048',group:'thinking',seconds:120,goal:'Ghép được ô {n}.',hint:'Dùng mũi tên hoặc vuốt; hai ô cùng số chạm nhau thì cộng lại.'},
 lights:{name:'Tắt đèn',group:'thinking',seconds:90,goal:'Tắt hết đèn trên bảng {n}.',hint:'Chạm một ô: ô đó và 4 ô cạnh đổi bật / tắt.'},
 simon:{name:'Nhớ màu',group:'thinking',seconds:90,goal:'Nhớ và bấm lại chuỗi {n} màu.',hint:'Xem máy sáng các ô, rồi bấm lại đúng thứ tự. Phím mũi tên ứng với 4 ô.'},
 mole:{name:'Đập chuột',group:'reflex',seconds:90,goal:'Đập trúng {n} con chuột.',hint:'Chạm chuột khi nó nhô lên; phím mũi tên chọn lỗ, Space để đập.'},
 sudoku:{name:'Sudoku',group:'thinking',seconds:120,goal:'Điền kín bảng {n}: mỗi hàng, cột, khối đủ các số.',hint:'Chọn ô rồi bấm số; ô đỏ là số bị trùng.'},
 caro:{name:'Cờ caro',group:'thinking',seconds:120,goal:'Xếp {n} quân X liền hàng trước máy.',hint:'Chạm ô trống để đặt X; chặn khi máy sắp đủ hàng.'},
 racer:{name:'Đua xe',group:'reflex',seconds:90,goal:'Vượt {n} xe, không va chạm.',hint:'Dùng ← → hoặc chạm hai bên để đổi làn.'}
};
// Cấp 1–5 (13/10/2026): bài sau, chặng sau khó hơn. Mỗi mảng là giá trị của cấp 1 → 5.
export const MAX_LEVEL=5;
export const LEVELS={
 jump:{n:[8,9,10,12,14],speed:[4.8,5.1,5.4,5.8,6.2],spawn:[1.95,1.85,1.75,1.62,1.5]},
 flight:{n:[6,7,8,9,11],speed:[3.0,3.1,3.2,3.4,3.6],gap:[1.05,1.0,.93,.87,.82]},
 maze:{rows:[5,6,6,7,8],cols:[6,7,8,9,10],hint:[6,5,4,3,2]},
 memory:{n:[4,5,6,7,8]},
 slide:{steps:[8,14,20,28,36]},
 bowling:{n:[6,7,7,8,8]},
 tetris:{n:[3,4,4,5,6],drop:[.82,.76,.7,.62,.55]},
 breakout:{rows:[2,3,3,4,4],speed:[4.2,4.5,4.8,5.1,5.4]},
 snake:{n:[5,6,7,9,11],tick:[.27,.25,.23,.21,.19]},
 frogger:{lanes:[[2,3,6,8,9],[1,2,4,6,7,9],[1,2,3,5,6,7,9],[1,2,3,5,6,7,8,9],[1,2,3,4,6,7,8,9]],speed:[.85,.95,1,1.15,1.3]},
 pong:{n:[2,3,3,3,4],ai:[2.2,2.5,2.7,3.0,3.3]},
 sokoban:{n:[1,2,2,2,3]},
 mines:{size:[6,7,8,9,9],n:[4,6,9,12,15]},
 g2048:{n:[64,64,128,128,256]},
 lights:{size:[3,3,4,4,5],presses:[3,4,5,6,8]},
 simon:{n:[4,5,6,7,8],show:[.75,.65,.56,.5,.44]},
 mole:{n:[10,12,14,16,18],up:[1.35,1.2,1.05,.92,.8],miss:[8,7,6,6,5],double:[0,0,0,1,1]},
 sudoku:{size:[4,4,6,6,6],blanks:[6,8,12,15,18]},
 caro:{size:[7,7,8,9,9],n:[4,4,4,5,5],skill:[.35,.6,.5,.45,.55]},
 racer:{n:[10,12,15,18,22],speed:[4.2,4.7,5.2,5.7,6.2],lanes:[3,3,4,4,4]}
};
export const lv=level=>Math.max(1,Math.min(MAX_LEVEL,Math.round(Number(level))||3));
export function param(type,key,level){const a=LEVELS[type]?.[key];return a?a[lv(level)-1]:undefined;}
export function goalFor(type,level){const c=CATALOG[type],L=lv(level),p=k=>param(type,k,L);let n=p('n');
 if(type==='maze')n=p('rows')+' × '+p('cols');if(type==='breakout')n=p('rows')*6;if(type==='frogger')n=p('lanes').length;if(type==='sokoban')n=p('n')>1?p('n')+' thùng':'thùng';
 if(type==='mines')n=p('size')+' × '+p('size')+' có '+p('n')+' quả mìn';if(type==='lights'||type==='sudoku')n=p('size')+' × '+p('size');
 return c.goal.replace('{n}',n);}
// Cấp của một trạm: vị trí bài trong khoá (1 … tổng) cộng phần chặng trong bài. Bài đầu chặng đầu là cấp 1, cuối khoá là cấp 5.
export function levelFor(position,maxPosition,stage=0,stages=1){const pos=Math.max(1,Number(position)||1),max=Math.max(pos,Number(maxPosition)||pos),p=max>1?((pos-1)+Math.max(0,stage)/Math.max(1,stages))/max:Math.max(0,stage)/Math.max(1,stages);return Math.max(1,Math.min(MAX_LEVEL,1+Math.floor(p*MAX_LEVEL)));}
export const GAME_TYPES=Object.keys(CATALOG);
export function rng(seed){let s=seed>>>0;return ()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};}
export function shuffle(items,random){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function shuffleBag(seed,history=[]){const random=rng(seed),a=shuffle(GAME_TYPES,random),recent=history.slice(-2);for(let i=0;i<a.length;i++){let choices=a.slice(i).filter(t=>!recent.includes(t));if(!choices.length)choices=a.slice(i).filter(t=>t!==recent.at(-1));if(!choices.length)choices=a.slice(i);const prevGroup=CATALOG[recent.at(-1)]?.group,other=choices.filter(t=>CATALOG[t].group!==prevGroup);if(other.length)choices=other;const pick=choices[Math.floor(random()*choices.length)],j=a.indexOf(pick,i);[a[i],a[j]]=[a[j],a[i]];recent.push(pick);recent.splice(0,Math.max(0,recent.length-2));}return a;}
export const DIRECTIONS=[[0,-1],[1,0],[0,1],[-1,0]];
export function slideBoard(seed,steps=20){const random=rng(seed),b=[1,2,3,4,5,6,7,8,0];let z=8,last=-1;for(let k=0;k<steps;k++){const options=b.map((_,i)=>i).filter(i=>i!==last&&Math.abs(i%3-z%3)+Math.abs(Math.floor(i/3)-Math.floor(z/3))===1),n=options[Math.floor(random()*options.length)];[b[n],b[z]]=[b[z],b[n]];last=z;z=n;}if(b.every((n,i)=>n===(i+1)%9))return slideBoard(seed+1,steps+1);return b;}
export function slideMove(b,n){const p=b.indexOf(n),z=b.indexOf(0);if(n===0||Math.abs(p%3-z%3)+Math.abs(Math.floor(p/3)-Math.floor(z/3))!==1)return false;[b[p],b[z]]=[b[z],b[p]];return true;}
export function solveSlide(b){const start=b.join(''),target='123456780',q=[start],prev=new Map([[start,null]]);for(let at=0;at<q.length;at++){const s=q[at];if(s===target)break;const a=[...s].map(Number),z=a.indexOf(0);for(let i=0;i<9;i++)if(Math.abs(i%3-z%3)+Math.abs(Math.floor(i/3)-Math.floor(z/3))===1){const next=[...a];[next[i],next[z]]=[next[z],next[i]];const key=next.join('');if(!prev.has(key)){prev.set(key,[s,a[i]]);q.push(key);}}}if(!prev.has(target))return [];const path=[];let key=target;while(prev.get(key)){const[s,n]=prev.get(key);path.unshift(n);key=s;}return path;}
const SOKO_MAPS={1:['#######','#.....#','#.$...#','#.....#','#.....#','#..x..#','#######'],2:['#######','#.....#','#.$...#','#...$.#','#.....#','#..xx.#','#######'],4:['#######','#.....#','#.$#..#','#...$.#','#.#...#','#.x.x.#','#######'],5:['#######','#...#.#','#.$...#','#.#$$.#','#.....#','#.xxx.#','#######']};
export function sokobanBoard(seed,level=3){const L=lv(level),rows=SOKO_MAPS[L===1?1:L===4?4:L===5?5:2];let a=rows.map(x=>[...x]);if(seed%2)a=a.map(x=>x.reverse());for(let n=0;n<(seed>>>1)%4;n++)a=a[0].map((_,x)=>a.map(row=>row[x]).reverse());const walls=[],boxes=[],goals=[];for(let y=0;y<7;y++)for(let x=0;x<7;x++){const n=y*7+x,c=a[y][x];if(c==='#')walls.push(n);if(c==='$')boxes.push(n);if(c==='x')goals.push(n);}let p=8;while(walls.includes(p)||boxes.includes(p))p++;return {width:7,walls,boxes,goals,p,moves:0};}
export function pushBox(s,d){const [dx,dy]=DIRECTIONS[d],delta=dy*s.width+dx,n=s.p+delta;if(s.walls.includes(n))return false;const i=s.boxes.indexOf(n);if(i>=0){const dest=n+delta;if(s.walls.includes(dest)||s.boxes.includes(dest))return false;s.boxes[i]=dest;}s.p=n;s.moves++;return true;}
export function solveSokoban(s){const encode=(p,b)=>p+':'+[...b].sort((a,b)=>a-b).join(','),key=encode(s.p,s.boxes),q=[{p:s.p,boxes:[...s.boxes],key}],prev=new Map([[key,null]]);let goal=null;for(let i=0;i<q.length;i++){const node=q[i];if(node.boxes.every(n=>s.goals.includes(n))){goal=node.key;break;}for(let d=0;d<4;d++){const state={...s,p:node.p,boxes:[...node.boxes]};if(!pushBox(state,d))continue;const k=encode(state.p,state.boxes);if(!prev.has(k)){prev.set(k,[node.key,d]);q.push({...state,key:k});}}}if(!goal)return [];const path=[];while(prev.get(goal)){const[k,d]=prev.get(goal);path.unshift(d);goal=k;}return path;}
const SHAPES=[[[1,1,1,1]],[[1,1],[1,1]],[[0,1,0],[1,1,1]],[[1,0,0],[1,1,1]],[[0,0,1],[1,1,1]],[[0,1,1],[1,1,0]],[[1,1,0],[0,1,1]]];
export function rotatePiece(shape){return shape[0].map((_,x)=>shape.map(r=>r[x]).reverse());}
export function tetrisState(seed){const random=rng(seed),grid=Array.from({length:14},()=>Array(8).fill(0)),hole=1+Math.floor(random()*5);for(let y=12;y<14;y++)for(let x=0;x<8;x++)if(x!==hole&&x!==hole+1)grid[y][x]=1+(x%6);return {grid,hole,bag:[1,...shuffle([0,2,3,4,5,6],random)],random,piece:null,next:null,lines:0,drop:0};}
function takePiece(s){if(!s.bag.length)s.bag=shuffle([0,1,2,3,4,5,6],s.random);const id=s.bag.shift();return {id,shape:SHAPES[id].map(r=>[...r]),x:3,y:0};}
export function tetrisSpawn(s){s.piece=s.next||takePiece(s);s.next=takePiece(s);s.drop=0;return fits(s,s.piece);}
export function fits(s,p){return p.shape.every((r,y)=>r.every((v,x)=>!v||(p.x+x>=0&&p.x+x<8&&p.y+y>=0&&p.y+y<14&&!s.grid[p.y+y][p.x+x])));}
export function tetrisMove(s,dx,dy){const p={...s.piece,x:s.piece.x+dx,y:s.piece.y+dy};if(!fits(s,p))return false;s.piece=p;return true;}
export function tetrisRotate(s){const shape=rotatePiece(s.piece.shape);for(const dx of [0,-1,1,-2,2]){const p={...s.piece,shape,x:s.piece.x+dx};if(fits(s,p)){s.piece=p;return true;}}return false;}
export function tetrisLock(s){s.piece.shape.forEach((r,y)=>r.forEach((v,x)=>{if(v)s.grid[s.piece.y+y][s.piece.x+x]=s.piece.id+1;}));const remaining=s.grid.filter(r=>!r.every(Boolean)),count=14-remaining.length;while(remaining.length<14)remaining.unshift(Array(8).fill(0));s.grid=remaining;s.lines+=count;return tetrisSpawn(s);}
export function tetrisDrop(s){while(tetrisMove(s,0,1)){}return tetrisLock(s);}
export function snakeState(seed,target=7){return {body:[{x:5,y:6},{x:4,y:6},{x:3,y:6}],direction:1,queued:1,food:null,random:rng(seed),eaten:0,tick:0,width:12,target};}
export function snakeFood(s){const free=[];for(let y=0;y<s.width;y++)for(let x=0;x<s.width;x++)if(!s.body.some(p=>p.x===x&&p.y===y))free.push({x,y});s.food=free[Math.floor(s.random()*free.length)]||null;return s.food;}
export function snakeTurn(s,d){if((d+2)%4===s.direction)return false;s.queued=d;return true;}
export function snakeStep(s){s.direction=s.queued;const [dx,dy]=DIRECTIONS[s.direction],head={x:s.body[0].x+dx,y:s.body[0].y+dy},eat=head.x===s.food?.x&&head.y===s.food?.y,body=eat?s.body:s.body.slice(0,-1);if(head.x<0||head.y<0||head.x>=s.width||head.y>=s.width||body.some(p=>p.x===head.x&&p.y===head.y))return 'lose';s.body.unshift(head);if(eat){s.eaten++;snakeFood(s);}else s.body.pop();return s.eaten>=(s.target||7)?'win':null;}
