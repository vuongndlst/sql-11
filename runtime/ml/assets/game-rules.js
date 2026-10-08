export function makeMaze(seed, rows=4, cols=6) {
 const cells=Array.from({length:rows*cols},()=>[1,1,1,1]), seen=new Set([0]), stack=[0];
 let rs=(seed*7919+31)>>>0;
 const random=()=>{rs=(Math.imul(rs,1664525)+1013904223)>>>0;return rs/4294967296;};
 while(stack.length){const p=stack.at(-1),r=Math.floor(p/cols),c=p%cols,options=[];
  [[-1,0],[0,1],[1,0],[0,-1]].forEach(([dr,dc],d)=>{const nr=r+dr,nc=c+dc,n=nr*cols+nc;if(nr>=0&&nr<rows&&nc>=0&&nc<cols&&!seen.has(n))options.push([d,n]);});
  if(!options.length){stack.pop();continue;}const[d,n]=options[Math.floor(random()*options.length)];cells[p][d]=0;cells[n][(d+2)%4]=0;seen.add(n);stack.push(n);
 }
 return {rows,cols,cells,p:0};
}
export function moveMaze(s,d){if(d<0||d>3||s.cells[s.p][d])return false;s.p += [-s.cols,1,s.cols,-1][d];return true;}
export function mazeRoute(s){const q=[s.p],prev=new Map([[s.p,null]]);for(const p of q){if(p===s.cells.length-1)break;s.cells[p].forEach((wall,d)=>{const n=p+[-s.cols,1,s.cols,-1][d];if(!wall&&!prev.has(n)){prev.set(n,p);q.push(n);}});}const route=[];let p=s.cells.length-1;while(p!==null){route.unshift(p);p=prev.get(p);}return route;}
export function advanceFlight(s,dt,seed){s.vy-=10*dt;s.y+=s.vy*dt;s.spawn-=dt;if(s.spawn<=0){s.gates.push({id:++s.seq,x:9,gap:2+((seed*7+s.seq*11)%23)/10,counted:false});s.spawn=2.8;}
 for(const a of s.gates){a.x-=2.8*dt;if(Math.abs(a.x+3)<.48&&(s.y<a.gap-1.08||s.y>a.gap+1.08))return 'lose';if(a.x< -3.5&&!a.counted){a.counted=true;s.passed++;}}
 s.gates=s.gates.filter(a=>a.x> -10);if(s.y<.3||s.y>6.7)return 'lose';return s.passed>=4?'win':null;
}
export function advanceJump(s,dt,seed=1){s.vy-=12*dt;s.y+=s.vy*dt;if(s.y<=0){s.y=0;s.vy=0;}s.spawn-=dt;if(s.spawn<=0){s.gates.push({id:++s.seq,x:9,counted:false});s.spawn=2.2+((seed*3+s.seq*5)%5)*.1;}
 for(const a of s.gates){a.x-=4*dt;if(Math.abs(a.x+3)<.65&&s.y<.95)return 'lose';if(a.x< -3.7&&!a.counted){a.counted=true;s.passed++;}}
 s.gates=s.gates.filter(a=>a.x> -10);return s.passed>=3?'win':null;
}
