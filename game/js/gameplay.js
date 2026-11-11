/* DRAGON ROLL — gameplay.js (README bagian 7). Aturan papan dari GameCore (game-core.js).
   Belum ada: Layar Siap kartu, power-up, fase Boss, multiplayer online (butuh Supabase). */
const G=GameCore, $=s=>document.querySelector(s);
const q=new URLSearchParams(location.search);
const MODE=['cpu','2','3','4'].includes(q.get('mode'))?q.get('mode'):'cpu';
const THEME=q.get('theme')==='nether'?'nether':'world';
const END=G.END[THEME], COLS=10, ROWS=END/COLS, CELL=Math.floor(1000/ROWS);
const COLORS=['#e8334a','#3f8cff','#3fbf4a','#ffcf33'];
const KEY='dragonroll:lobby:demo';
const N=MODE==='cpu'?2:+MODE;
const players=Array.from({length:N},(_,i)=>({name:i===0?'Kamu':(MODE==='cpu'?'Computer':'Pemain '+(i+1)),cpu:MODE==='cpu'&&i>0,pos:0,sixes:0,nextSix:false,bonus:0,col:COLORS[i]}));
let cur=0,busy=false,over=false,auto=false,paused=false,timers=[];

/* ---- skala kanvas ---- */
function fit(){const s=Math.min(innerWidth/1920,innerHeight/1080);$('#stage').style.transform=`scale(${s})`}
addEventListener('resize',fit);fit();
if(THEME==='nether')$('#stage').classList.add('nether');

/* ---- papan ---- */
function xy(n){ // pusat sel n (n=0 -> di luar papan, kiri bawah)
  if(n<1)n=1;const r=Math.floor((n-1)/COLS),c=r%2===0?(n-1)%COLS:COLS-1-(n-1)%COLS;
  return {x:(c+.5)*CELL,y:(ROWS-1-r+.5)*CELL};
}
function build(){
  const b=$('#board');b.style.gridTemplateColumns=`repeat(${COLS},${CELL}px)`;b.style.gridTemplateRows=`repeat(${ROWS},${CELL}px)`;
  for(let r=ROWS-1;r>=0;r--)for(let c=0;c<COLS;c++){
    const n=r%2===0?r*COLS+c+1:r*COLS+(COLS-c);
    const d=document.createElement('div');d.className='cell '+((r+c)%2?'a':'b');d.textContent=n;
    if(G.CHESTS.includes(n))d.classList.add('chest');
    const m=G.MOBS[n];if(m&&(!m.nether||THEME==='nether'))d.classList.add('mob');
    if(n===END)d.classList.add('end');
    b.appendChild(d);
  }
  const svg=$('#links');const W=COLS*CELL,H=ROWS*CELL;svg.setAttribute('width',W);svg.setAttribute('height',H);svg.setAttribute('viewBox',`0 0 ${W} ${H}`);
  let h='';
  const line=(a,b,col)=>{const p=xy(a),t=xy(b);h+=`<line x1="${p.x}" y1="${p.y}" x2="${t.x}" y2="${t.y}" stroke="#2b1a0a" stroke-width="14" stroke-linecap="round" opacity=".5"/><line x1="${p.x}" y1="${p.y}" x2="${t.x}" y2="${t.y}" stroke="${col}" stroke-width="8" stroke-linecap="round" ${col==='#e8334a'?'stroke-dasharray="4 14"':''}/><circle cx="${t.x}" cy="${t.y}" r="10" fill="${col}"/>`};
  for(const k in G.LADDERS)line(+k,G.LADDERS[k],'#c98a3c');
  for(const k in G.SNAKES)line(+k,G.SNAKES[k],'#e8334a');
  svg.innerHTML=h;
  const tk=$('#tokens');tk.style.width=W+'px';tk.style.height=H+'px';
  players.forEach((p,i)=>{const e=document.createElement('div');e.className='tok';e.style.background=p.col;e.style.width=e.style.height=CELL*.38+'px';e.textContent=i+1;p.el=e;tk.appendChild(e);place(p,0)});
}
function place(p,n,slide){
  const i=players.indexOf(p),o=[[-.2,-.2],[.2,-.2],[-.2,.2],[.2,.2]][i];
  const c=xy(n),s=CELL*.38;
  p.el.classList.toggle('slide',!!slide);
  p.el.style.left=(c.x+o[0]*CELL-s/2+(n<1?-CELL*.6:0))+'px';p.el.style.top=(c.y+o[1]*CELL-s/2+(n<1?CELL*.5:0))+'px';
}
function hud(){
  $('#players').innerHTML=players.map((p,i)=>`<div class="pc ${i===cur&&!over?'on':''}"><i style="background:${p.col}"></i>${p.name}<span class="pos">Petak ${p.pos||'—'}</span></div>`).join('');
  players.forEach((p,i)=>p.el.classList.toggle('active',i===cur&&!over));
  const me=!players[cur].cpu;$('#roll').disabled=busy||over||!me||paused;
  $('#turnname').textContent=over?'SELESAI':'Giliran: '+players[cur].name;
}
function log(t){const l=$('#log');const d=document.createElement('div');d.textContent=t;l.appendChild(d);while(l.children.length>6)l.firstChild.remove()}
function later(fn,ms){const t=setTimeout(()=>{timers=timers.filter(x=>x!==t);if(!paused)fn();else timers.push(setTimeout(()=>later(fn,200),200))},ms);timers.push(t)}
function banner(t,ms){const b=$('#banner');b.textContent=t;b.classList.add('on');setTimeout(()=>b.classList.remove('on'),ms||1100)}

/* ---- giliran ---- */
function roll(){
  if(busy||over||paused)return;busy=true;hud();$('#events').textContent='';
  const p=players[cur],dEl=$('#dice');dEl.classList.add('roll');
  const iv=setInterval(()=>$('#dnum').textContent=G.rollDie(),70);
  setTimeout(()=>{
    clearInterval(iv);dEl.classList.remove('roll');
    const d=p.nextSix?6:G.rollDie();p.nextSix=false;$('#dnum').textContent=d;
    const bonus=p.bonus;p.bonus=0;
    const res=G.turn({pos:p.pos,sixes:p.sixes},d,THEME,{bonus});
    log(`${p.name}: dadu ${d}${bonus?' +'+bonus:''}`);
    p.sixes=res.sixes;
    if(res.burnt){$('#events').textContent=res.events[0];log(res.events[0]);return later(()=>next(false),1200)}
    walk(p,res);
  },750);
}
function walk(p,res){
  const path=res.path;let i=0;
  (function step(){
    if(paused)return setTimeout(step,200);
    if(i<path.length){place(p,path[i]);p.pos=path[i];i++;return setTimeout(step,230)}
    p.pos=res.moved;hud();
    if(res.to!==res.moved){
      setTimeout(()=>{$('#events').textContent=res.events.join(' · ');place(p,res.to,true);p.pos=res.to;res.events.forEach(log);hud();
        setTimeout(()=>finish(p,res),1000)},350);
    }else{if(res.events.length){$('#events').textContent=res.events.join(' · ');res.events.forEach(log)}finish(p,res)}
  })();
}
function finish(p,res){
  if(res.nextSix)p.nextSix=true;
  if(res.nextBonus)p.bonus=res.nextBonus;
  hud();
  if(res.win)return win(p);
  next(res.extra);
}
function next(extra){
  busy=false;if(!extra)cur=(cur+1)%N;hud();
  if(players[cur].cpu||auto)later(roll,auto&&!players[cur].cpu?900:1000);
}
function win(p){
  over=true;busy=false;hud();banner(p.name+' MENANG!',2200);
  if(!p.cpu&&p===players[0]){ /* hadiah demo ke data lobby */
    try{const d=JSON.parse(localStorage.getItem(KEY))||{};d.xp=(d.xp||683)+50;d.coin=(d.coin||2500)+100;localStorage.setItem(KEY,JSON.stringify(d))}catch(e){}
  }
  later(()=>modal(p===players[0]?'MENANG!':'KALAH',p===players[0]?'Kamu mencapai petak '+END+'. Hadiah: +50 XP, +100 Coin':p.name+' mencapai petak '+END,
    [['MAIN LAGI','green',()=>location.reload()],['KELUAR','red',exit]]),2400);
}
function modal(t,txt,btns){
  $('#mtitle').textContent=t;$('#mtext').textContent=txt;const r=$('#mbtns');r.innerHTML='';
  btns.forEach(([l,c,f])=>{const b=document.createElement('button');b.className='gbtn t-title '+c;b.textContent=l;b.onclick=f;r.appendChild(b)});
  $('#modal').classList.add('on');
}
function exit(){$('#fade').classList.add('on');setTimeout(()=>location.href='mode.html',330)}
function pause(){
  paused=true;hud();
  modal('JEDA','Permainan dihentikan sementara.',[['LANJUT','green',()=>{$('#modal').classList.remove('on');paused=false;hud();if(!busy&&!over&&(players[cur].cpu||auto))later(roll,500)}],['KELUAR','red',()=>modal('KELUAR?','Progres pertandingan akan hilang.',[['BATAL','blue',pause],['YA, KELUAR','red',exit]])]]);
}
$('#roll').onclick=roll;
$('#auto').onclick=()=>{auto=!auto;$('#auto').textContent='AUTO: '+(auto?'ON':'OFF');if(auto&&!busy&&!over&&!players[cur].cpu)roll()};
$('#pausebtn').onclick=pause;
build();hud();log('Pertandingan dimulai — '+(THEME==='nether'?'Nether':'World')+' ('+END+' petak)');
if(players[cur].cpu)later(roll,800);
