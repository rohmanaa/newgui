/* =========================================================================
   LOGIKA — mengikuti README (lobby.html)
   - Peta navigasi ACT
   - Level/XP: level 1 butuh 400 XP, tiap level +100 (maks. 999); XP server menang bila lebih tinggi
   - Saldo tampil "—" sampai server membalas (walletReady)
   - MAIL & "Hadiah gratis": toast "segera hadir"
   Halaman tujuan belum ada di repo GUI ini, maka NAVIGATE=false hanya menampilkan toast.
   Set NAVIGATE=true di proyek utama agar benar-benar berpindah halaman.
   ========================================================================= */
const NAVIGATE=true;
/* Halaman yang sudah ada di folder game/ — tambahkan nama file di sini saat halaman baru selesai dibuat */
const BUILT=['karakter.html','mode.html','settings.html','room.html'];
const ACT={
  profil:'profile.html', karakter:'karakter.html', frame:'frame.html', dadu:'dadu.html', efek:'efek.html', powerup:'powerup.html',
  leaderboard:'leaderboard.html', toko:'shop.html', beliCoin:'shop.html?coin=1', teman:'friendship.html', hadiahMisi:'hadiah-misi.html',
  tambang:'tambang.html?from=lobby.html', settings:'settings.html', mulai:'mode.html'
};
const SOON={mail:'Mail segera hadir',hadiahGratis:'Hadiah gratis segera hadir'};

/* ---- PlayerData tiruan (di proyek utama diganti PlayerData asli) ---- */
const KEY='dragonroll:lobby:demo';
const PD={
  data:Object.assign({name:'Ryuen',xp:683,emerald:120,coin:2500},(()=>{try{return JSON.parse(localStorage.getItem(KEY))||{}}catch(e){return {}}})()),
  ready:false,
  save(){try{localStorage.setItem(KEY,JSON.stringify(this.data))}catch(e){}}
};
function lvInfo(xp){
  let lv=1,need=400;
  while(xp>=need && lv<999){xp-=need;lv++;need=400+100*(lv-1)}
  return {lv,cur:lv>=999?need:xp,need};
}
const fmt=n=>Number(n).toLocaleString('en-US');

function render(){
  const d=PD.data,L=lvInfo(d.xp);
  document.getElementById('nm').textContent=d.name;
  document.getElementById('lvnum').textContent=L.lv;
  document.getElementById('xptxt').textContent=L.cur+' / '+L.need;
  document.getElementById('xpfill').style.width=Math.min(100,L.cur/L.need*100)+'%';
  document.getElementById('xpnote').textContent='Butuh '+(L.need-L.cur)+' XP lagi ke Level '+Math.min(999,L.lv+1);
  document.getElementById('v-em').textContent=PD.ready?fmt(d.emerald):'—';
  document.getElementById('v-co').textContent=PD.ready?fmt(d.coin):'—';
}
render();
document.getElementById('xpfill').style.width='0';
setTimeout(()=>{PD.ready=true;render();
  ['cur-em','cur-co'].forEach(i=>{const e=document.getElementById(i);e.classList.add('bump')});
  /* Multiplayer.Progress.dailyLogin() dipanggil di sini pada proyek utama */
},700);

/* ---- toast & navigasi ---- */
let tt;
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('on'),1900)}
function go(act){
  if(SOON[act]){toast(SOON[act]);return}
  const url=ACT[act]; if(!url)return;
  if(!NAVIGATE){toast('→ '+url);return}
  if(!BUILT.includes(url.split('?')[0])){toast('Segera hadir');return}
  const f=document.getElementById('fade');f.classList.add('on');setTimeout(()=>{location.href=url},330);
}
document.querySelectorAll('[data-act]').forEach(el=>el.addEventListener('click',()=>go(el.dataset.act)));

/* ---- skala kanvas ---- */
function fit(){
  const s=Math.min(innerWidth/1920,innerHeight/1080);
  document.getElementById('stage').style.transform='scale('+s+')';
}
addEventListener('resize',fit);fit();

/* ---- pulau voxel melayang (SVG isometrik) ---- */
const NS='http://www.w3.org/2000/svg';
const isl=document.getElementById('island');
function poly(pts,fill,extra){const p=document.createElementNS(NS,'polygon');p.setAttribute('points',pts.map(q=>q.join(',')).join(' '));p.setAttribute('fill',fill);
  p.setAttribute('stroke','rgba(20,30,10,.35)');p.setAttribute('stroke-width','2');p.setAttribute('stroke-linejoin','round');if(extra)for(const k in extra)p.setAttribute(k,extra[k]);isl.appendChild(p)}
function slab(cx,cy,w,d,c){ // cy = pusat diamond atas
  const h=w/2,N=[cx,cy-h/2],E=[cx+w/2,cy],S=[cx,cy+h/2],W=[cx-w/2,cy];
  poly([W,S,[S[0],S[1]+d],[W[0],W[1]+d]],c.l);
  poly([S,E,[E[0],E[1]+d],[S[0],S[1]+d]],c.r);
  poly([N,E,S,W],c.t);
}
const DIRT={t:'#8d6038',l:'#9b6a40',r:'#7b5230'}, STONE={t:'#7d808c',l:'#8a8d99',r:'#666975'}, DEEP={t:'#5d606c',l:'#6a6d79',r:'#4e515c'};
const GRASS={t:'#78cc4e',l:'#58a33a',r:'#478a2e'};
slab(960,872,150,70,DEEP);
slab(960,800,290,76,DEEP);
slab(960,728,430,76,STONE);
slab(960,654,560,80,DIRT);
// sisi tanah + pita rumput di atas
{const cx=960,cy=580,w=640,h=w/2,d=84,g=28;
  const W=[cx-w/2,cy],S=[cx,cy+h/2],E=[cx+w/2,cy],N=[cx,cy-h/2];
  poly([W,S,[S[0],S[1]+d],[W[0],W[1]+d]],DIRT.l);
  poly([S,E,[E[0],E[1]+d],[S[0],S[1]+d]],DIRT.r);
  poly([W,S,[S[0],S[1]+g],[W[0],W[1]+g]],GRASS.l);
  poly([S,E,[E[0],E[1]+g],[S[0],S[1]+g]],GRASS.r);
  poly([N,E,S,W],GRASS.t);
  // petak kotak-kotak di permukaan
  for(let i=1;i<8;i++){const a=i/8;
    const l=document.createElementNS(NS,'line');l.setAttribute('x1',W[0]+(N[0]-W[0])*a);l.setAttribute('y1',W[1]+(N[1]-W[1])*a);
    l.setAttribute('x2',S[0]+(E[0]-S[0])*a);l.setAttribute('y2',S[1]+(E[1]-S[1])*a);l.setAttribute('stroke','rgba(40,100,20,.22)');isl.appendChild(l);
    const m=document.createElementNS(NS,'line');m.setAttribute('x1',W[0]+(S[0]-W[0])*a);m.setAttribute('y1',W[1]+(S[1]-W[1])*a);
    m.setAttribute('x2',N[0]+(E[0]-N[0])*a);m.setAttribute('y2',N[1]+(E[1]-N[1])*a);m.setAttribute('stroke','rgba(40,100,20,.22)');isl.appendChild(m);}
}
// pohon & semak voxel (urut dari belakang ke depan)
const LEAF={t:'#4caf3a',l:'#368a2a',r:'#2b7222'}, LEAF2={t:'#5cc443',l:'#3f9a30',r:'#318028'}, WOOD={t:'#a8794a',l:'#7e5530',r:'#684526'};
function tree(x,y,s){slab(x,y,34*s,64*s,WOOD);slab(x,y-58*s,120*s,46*s,LEAF);slab(x,y-100*s,80*s,40*s,LEAF2)}
tree(830,545,1);
tree(1090,525,.85);
slab(1180,600,70,30,LEAF);
slab(760,622,56,24,LEAF2);
// batu kecil
slab(1115,650,56,26,STONE);

/* ---- karakter blocky ---- */
const hero=document.createElementNS(NS,'g');hero.id='hero';
hero.innerHTML=`
 <g transform="translate(960,612)">
  <ellipse cx="0" cy="6" rx="52" ry="14" fill="rgba(0,0,0,.28)"/>
  <g class="bob">
   <rect x="-30" y="-74" width="29" height="76" fill="#3e4aa6" stroke="#1e2455" stroke-width="3"/>
   <rect x="1" y="-74" width="29" height="76" fill="#35419a" stroke="#1e2455" stroke-width="3"/>
   <rect x="-33" y="-6" width="32" height="12" fill="#5a5a66" stroke="#2b2b34" stroke-width="3"/>
   <rect x="1" y="-6" width="32" height="12" fill="#5a5a66" stroke="#2b2b34" stroke-width="3"/>
   <rect x="-34" y="-152" width="68" height="82" fill="#1fb3ac" stroke="#0e5a57" stroke-width="3"/>
   <rect x="-34" y="-96" width="68" height="14" fill="#1a9791"/>
   <rect x="-60" y="-150" width="26" height="80" fill="#e8b08a" stroke="#8a5a3a" stroke-width="3"/>
   <rect x="34" y="-150" width="26" height="80" fill="#d99f78" stroke="#8a5a3a" stroke-width="3"/>
   <rect x="-60" y="-150" width="26" height="30" fill="#1fb3ac" stroke="#0e5a57" stroke-width="3"/>
   <rect x="34" y="-150" width="26" height="30" fill="#1aa09a" stroke="#0e5a57" stroke-width="3"/>
   <rect x="-36" y="-224" width="72" height="72" fill="#eab894" stroke="#8a5a3a" stroke-width="3"/>
   <rect x="-36" y="-224" width="72" height="24" fill="#4a2f1b" stroke="#2a1a0e" stroke-width="3"/>
   <rect x="-36" y="-204" width="12" height="22" fill="#4a2f1b"/><rect x="24" y="-204" width="12" height="22" fill="#4a2f1b"/>
   <rect x="-24" y="-184" width="16" height="11" fill="#fff"/><rect x="8" y="-184" width="16" height="11" fill="#fff"/>
   <rect x="-16" y="-184" width="9" height="11" fill="#4b3fc4"/><rect x="8" y="-184" width="9" height="11" fill="#4b3fc4"/>
   <rect x="-12" y="-166" width="24" height="5" fill="#a5604a"/>
   <rect x="-8" y="-176" width="16" height="6" fill="#d9a07a"/>
  </g>
 </g>`;
isl.appendChild(hero);
let busy=false;
hero.addEventListener('click',()=>{
  if(busy)return;busy=true;
  const a=Math.random()<.5?'jump':'spin';
  hero.classList.add(a);
  setTimeout(()=>{hero.classList.remove(a);busy=false},a==='jump'?560:720);
  document.getElementById('hint').style.display='none';
});

/* ---- kilau + hitung mundur hadiah gratis ---- */
{const st=document.getElementById('stage');
 for(let i=0;i<14;i++){const e=document.createElement('i');e.className='spark';
  e.style.left=(560+Math.random()*800)+'px';e.style.top=(300+Math.random()*520)+'px';e.style.animationDelay=(Math.random()*4)+'s';
  e.style.scale=.5+Math.random();st.insertBefore(e,document.getElementById('hint'))}
 let sec=2*3600+59*60;setInterval(()=>{sec=Math.max(0,sec-1);document.getElementById('fgT').textContent=Math.floor(sec/3600)+'j '+String(Math.floor(sec%3600/60)).padStart(2,'0')+'m'},1000)}
