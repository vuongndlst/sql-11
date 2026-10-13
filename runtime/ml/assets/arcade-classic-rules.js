// Luật thuần của 8 trò cổ điển thêm ngày 13/10/2026 (không cần renderer): Dò mìn, 2048, Tắt đèn, Nhớ màu, Đập chuột,
// Sudoku, Cờ caro, Đua xe. Mọi bàn chơi tạo từ seed nên kiểm thử được và luôn có lời giải.
import {rng,shuffle} from './arcade-rules.js?v=648cbdfc9300';

const around=(i,w,h)=>{const x=i%w,y=Math.floor(i/w),a=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const nx=x+dx,ny=y+dy;if(nx>=0&&ny>=0&&nx<w&&ny<h)a.push(ny*w+nx);}return a;};

// ---------------------------------------------------------------- Dò mìn: mìn rải sau lần mở đầu tiên, vùng 3 × 3 quanh ô đầu luôn an toàn
export function minesState(w,h,n){return {w,h,n,mines:null,open:new Set(),flags:new Set(),lost:false};}
export function minesPlace(s,seed,first){const random=rng(seed),safe=new Set([first,...around(first,s.w,s.h)]),cells=shuffle([...Array(s.w*s.h).keys()].filter(i=>!safe.has(i)),random);s.mines=new Set(cells.slice(0,s.n));}
export function minesCount(s,i){return around(i,s.w,s.h).filter(j=>s.mines.has(j)).length;}
export function minesReveal(s,i,seed=1){if(s.lost||s.open.has(i)||s.flags.has(i))return 'none';if(!s.mines)minesPlace(s,seed,i);if(s.mines.has(i)){s.lost=true;return 'mine';}const stack=[i];while(stack.length){const j=stack.pop();if(s.open.has(j))continue;s.open.add(j);s.flags.delete(j);if(minesCount(s,j)===0)for(const k of around(j,s.w,s.h))if(!s.open.has(k)&&!s.mines.has(k))stack.push(k);}return minesWon(s)?'win':'open';}
export function minesFlag(s,i){if(s.open.has(i))return false;if(s.flags.has(i))s.flags.delete(i);else s.flags.add(i);return true;}
export function minesWon(s){return Boolean(s.mines)&&s.open.size===s.w*s.h-s.n;}
// Gợi ý an toàn kiểu người chơi: ô chắc chắn không có mìn suy ra từ các con số đang hiện (dùng cho nút Gợi ý và máy kiểm thử).
export function minesSafeHint(s){if(!s.mines)return Math.floor(s.h/2)*s.w+Math.floor(s.w/2);for(const i of s.open){const c=minesCount(s,i);if(!c)continue;const hidden=around(i,s.w,s.h).filter(j=>!s.open.has(j)),flagged=hidden.filter(j=>s.flags.has(j));if(flagged.length===c){const free=hidden.find(j=>!s.flags.has(j));if(free!==undefined)return free;}}return null;}
export function minesSureMine(s){for(const i of s.open){const c=minesCount(s,i);if(!c)continue;const hidden=around(i,s.w,s.h).filter(j=>!s.open.has(j));if(hidden.length===c){const m=hidden.find(j=>!s.flags.has(j));if(m!==undefined)return m;}}return null;}

// ---------------------------------------------------------------- 2048
export function g2048State(seed){const s={grid:Array(16).fill(0),random:rng(seed),score:0,best:0};g2048Add(s);g2048Add(s);return s;}
export function g2048Add(s){const free=s.grid.map((v,i)=>v?-1:i).filter(i=>i>=0);if(!free.length)return false;const i=free[Math.floor(s.random()*free.length)];s.grid[i]=s.random()<.9?2:4;s.best=Math.max(s.best,s.grid[i]);return true;}
export function g2048Slide(s,d){const lines=[];for(let k=0;k<4;k++){const idx=[];for(let j=0;j<4;j++){// d: 0 lên, 1 phải, 2 xuống, 3 trái; idx[0] là ô gần cạnh đích
  idx.push(d===0?j*4+k:d===2?(3-j)*4+k:d===3?k*4+j:k*4+3-j);}lines.push(idx);}
 let moved=false;for(const idx of lines){const v=idx.map(i=>s.grid[i]).filter(Boolean),out=[];for(let i=0;i<v.length;i++){if(v[i]===v[i+1]){out.push(v[i]*2);s.score+=v[i]*2;s.best=Math.max(s.best,v[i]*2);i++;}else out.push(v[i]);}while(out.length<4)out.push(0);idx.forEach((g,i)=>{if(s.grid[g]!==out[i])moved=true;s.grid[g]=out[i];});}
 if(moved)g2048Add(s);return moved;}
export function g2048CanMove(s){if(s.grid.includes(0))return true;for(let i=0;i<16;i++){if(i%4<3&&s.grid[i]===s.grid[i+1])return true;if(i<12&&s.grid[i]===s.grid[i+4])return true;}return false;}

// ---------------------------------------------------------------- Tắt đèn: tạo bằng cách bấm ngẫu nhiên từ bảng tắt hết nên luôn giải được
export function lightsState(seed,size,presses){const random=rng(seed),s={size,on:new Set(),solution:new Set()};const cells=shuffle([...Array(size*size).keys()],random).slice(0,presses);for(const i of cells)lightsPress(s,i);s.solution=new Set(cells);if(!s.on.size)return lightsState(seed+1,size,presses);return s;}
export function lightsPress(s,i){const n=s.size,x=i%n,y=Math.floor(i/n);for(const[dx,dy]of[[0,0],[1,0],[-1,0],[0,1],[0,-1]]){const a=x+dx,b=y+dy;if(a<0||b<0||a>=n||b>=n)continue;const j=b*n+a;if(s.on.has(j))s.on.delete(j);else s.on.add(j);}if(s.solution.has(i))s.solution.delete(i);else s.solution.add(i);return s.on.size===0;}

// ---------------------------------------------------------------- Nhớ màu (Simon)
export function simonSequence(seed,length){const random=rng(seed);return Array.from({length},()=>Math.floor(random()*4));}

// ---------------------------------------------------------------- Đập chuột: lịch hiện chuột theo seed
export function moleNext(random,holes,busy){const free=[...Array(holes).keys()].filter(i=>!busy.includes(i));return free[Math.floor(random()*free.length)];}

// ---------------------------------------------------------------- Sudoku 4 × 4 (ô 2 × 2) và 6 × 6 (ô 2 × 3), lời giải duy nhất
export function sudokuBox(size){return size===4?[2,2]:[2,3];}
export function sudokuSolve(grid,size,limit=2){const[bh,bw]=sudokuBox(size),g=[...grid];let count=0,first=null;
 const ok=(i,v)=>{const r=Math.floor(i/size),c=i%size;for(let k=0;k<size;k++){if(g[r*size+k]===v||g[k*size+c]===v)return false;}const r0=r-r%bh,c0=c-c%bw;for(let y=r0;y<r0+bh;y++)for(let x=c0;x<c0+bw;x++)if(g[y*size+x]===v)return false;return true;};
 (function go(){if(count>=limit)return;const i=g.indexOf(0);if(i<0){count++;if(!first)first=[...g];return;}for(let v=1;v<=size;v++)if(ok(i,v)){g[i]=v;go();g[i]=0;if(count>=limit)return;}})();
 return {count,solution:first};}
export function sudokuMake(seed,size,blanks){const random=rng(seed),[bh,bw]=sudokuBox(size),base=[];for(let r=0;r<size;r++)for(let c=0;c<size;c++)base.push(((r%bh)*bw+Math.floor(r/bh)+c)%size+1);
 // xáo số, hàng trong dải, cột trong khối: vẫn là lời giải hợp lệ
 const digits=shuffle([...Array(size).keys()].map(v=>v+1),random),rows=[],cols=[];for(const b of shuffle([...Array(size/bh).keys()],random))for(const r of shuffle([...Array(bh).keys()],random))rows.push(b*bh+r);for(const b of shuffle([...Array(size/bw).keys()],random))for(const c of shuffle([...Array(bw).keys()],random))cols.push(b*bw+c);
 const solution=[];for(const r of rows)for(const c of cols)solution.push(digits[base[r*size+c]-1]);
 const puzzle=[...solution];let removed=0;for(const i of shuffle([...Array(size*size).keys()],random)){if(removed>=blanks)break;const keep=puzzle[i];puzzle[i]=0;if(sudokuSolve(puzzle,size).count!==1)puzzle[i]=keep;else removed++;}
 return {size,solution,puzzle,given:puzzle.map(Boolean),grid:[...puzzle]};}
export function sudokuConflicts(s){const n=s.size,[bh,bw]=sudokuBox(n),bad=new Set();for(let i=0;i<n*n;i++){const v=s.grid[i];if(!v)continue;const r=Math.floor(i/n),c=i%n;for(let j=0;j<n*n;j++){if(j===i||s.grid[j]!==v)continue;const r2=Math.floor(j/n),c2=j%n;if(r2===r||c2===c||(Math.floor(r2/bh)===Math.floor(r/bh)&&Math.floor(c2/bw)===Math.floor(c/bw)))bad.add(i);}}return bad;}
export function sudokuDone(s){return s.grid.every((v,i)=>v===s.solution[i]);}

// ---------------------------------------------------------------- Cờ caro: người (1) đi trước, máy (2); máy chấm điểm tấn công + phòng thủ
export function caroWinner(b,n,k){const dirs=[[1,0],[0,1],[1,1],[1,-1]];for(let i=0;i<n*n;i++){const p=b[i];if(!p)continue;const x=i%n,y=Math.floor(i/n);for(const[dx,dy]of dirs){let c=1;while(c<k){const a=x+dx*c,bb=y+dy*c;if(a<0||bb<0||a>=n||bb>=n||b[bb*n+a]!==p)break;c++;}if(c>=k)return p;}}return b.includes(0)?0:3;}
function lineScore(b,n,k,i,p){let total=0;const x=i%n,y=Math.floor(i/n);for(const[dx,dy]of[[1,0],[0,1],[1,1],[1,-1]]){let run=1,open=0;for(const sgn of[1,-1]){let c=1;while(true){const a=x+dx*c*sgn,bb=y+dy*c*sgn;if(a<0||bb<0||a>=n||bb>=n)break;const v=b[bb*n+a];if(v===p){run++;c++;continue;}if(v===0)open++;break;}}
  if(run>=k)total+=1e6;else total+=Math.pow(10,run)*(open===2?2:open===1?1:.1);}return total;}
export function caroMoves(b,n){const c=[];for(let i=0;i<n*n;i++){if(b[i])continue;const x=i%n,y=Math.floor(i/n);let near=false;for(let dy=-2;dy<=2&&!near;dy++)for(let dx=-2;dx<=2;dx++){const a=x+dx,bb=y+dy;if(a>=0&&bb>=0&&a<n&&bb<n&&b[bb*n+a]){near=true;break;}}if(near)c.push(i);}if(!c.length)c.push(Math.floor(n/2)*n+Math.floor(n/2));return c;}
export function caroBest(b,n,k,me,skill=1,random=Math.random){const other=me===1?2:1,scored=caroMoves(b,n).map(i=>({i,s:lineScore(b,n,k,i,me)*1.1+lineScore(b,n,k,i,other)})).sort((p,q)=>q.s-p.s);
 // thắng ngay hoặc chặn nước thắng ngay luôn làm; ngoài ra, máy yếu chọn ngẫu nhiên trong các nước khá
 if(scored[0].s>=9e5||random()<skill)return scored[0].i;const top=scored.slice(0,Math.min(6,scored.length));return top[Math.floor(random()*top.length)].i;}

// ---------------------------------------------------------------- Đua xe: mỗi hàng xe chừa ít nhất một làn trống
export function racerRow(random,lanes,last){const n=random()<.35&&lanes>3?2:1,free=shuffle([...Array(lanes).keys()],random),blocked=free.slice(0,n);if(last&&blocked.length===1&&last.length===lanes-1)return blocked;return blocked;}
