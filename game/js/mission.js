/* mission.html — Hadiah & Misi: tab DAILY (misi harian + bonus), HADIAH (login 7 hari), ACHIEVEMENTS.
   Data mengikuti README (misi: Login Harian 50, Mainkan Permainan 75, Raih Kemenangan 150, bonus 100;
   hadiah login 7 hari). Status disimpan di localStorage (demo); proyek utama menggantinya dengan server. */
const $=s=>document.querySelector(s);
function fit(){$('#stage').style.transform=`scale(${Math.min(innerWidth/1920,innerHeight/1080)})`}addEventListener('resize',fit);fit();
const IC='assets/komponen/';
const WKEY='dragonroll:lobby:demo',SKEY='dragonroll:mission:demo';
const rd=k=>{try{return JSON.parse(localStorage.getItem(k))||{}}catch(e){return{}}};
const wr=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const fmt=n=>Number(n).toLocaleString('en-US');

/* ---- dompet (sama dengan lobby/karakter) ---- */
function wallet(){const w=rd(WKEY);return{emerald:w.emerald??120,coin:w.coin??2500}}
function addWallet(d){const w=rd(WKEY),c=wallet();w.emerald=c.emerald+(d.emerald||0);w.coin=c.coin+(d.coin||0);wr(WKEY,w);showWallet(true)}
function showWallet(bump){const w=wallet();$('#v-em').textContent=fmt(w.emerald);$('#v-co').textContent=fmt(w.coin);
  if(bump)['#cur-em','#cur-co'].forEach(s=>{const e=$(s);e.classList.remove('bump');void e.offsetWidth;e.classList.add('bump')})}

/* ---- data ---- */
const QUESTS=[
 {id:'login',t:'Login Harian',d:'Masuk ke game hari ini',goal:1,coin:50,ic:'ikon-item/kalender.webp'},
 {id:'play',t:'Mainkan Permainan',d:'Selesaikan 1 pertandingan',goal:1,coin:75,ic:'ikon-item/pedang-silang.webp'},
 {id:'win',t:'Raih Kemenangan',d:'Menangkan 3 pertandingan',goal:3,coin:150,ic:'ikon-item/piala.webp'}];
const BONUS=100;
const DAYS=[
 {t:'50 Gem',ic:'ikon-gem-medali/berlian-biru.webp',emerald:50},
 {t:'1.000 Coin',ic:'ikon-gem-medali/kantong-koin.webp',coin:1000},
 {t:'Mystery Box ×1',ic:'paket-chest/peti-kayu.webp'},
 {t:'Dadu Rumput ×1',ic:'glyph-putih/dadu.webp',cls:'dice-g'},
 {t:'Dadu Emas ×1',ic:'glyph-putih/dadu.webp',cls:'dice-y'},
 {t:'2.000 Coin',ic:'ikon-item/koin-tumpuk.webp',coin:2000},
 {t:'Skin Epic Enderman',ic:'ikon-item/helm-sayap.webp'}];
/* 15 achievement x 3 bintang: id, nama, deskripsi, target tiap bintang (sinkron dengan achievement-data.js proyek utama). Ikon: assets/komponen/achievement/ + kit. */
const ACH=[
 {id:'peti',t:'Penakluk Peti',d:'Buka peti',g:[10,50,200],ic:'paket-chest/peti-emas.webp'},
 {id:'naga',t:'Penyerang Naga',d:'Serang naga',g:[3,10,30],ic:'achievement/ach-naga.webp'},
 {id:'aktif',t:'Pemain Aktif',d:'Main sebanyak mungkin',g:[10,50,200],ic:'glyph-putih/gamepad.webp'},
 {id:'menang',t:'Master Kemenangan',d:'Menangkan pertandingan',g:[3,50,200],ic:'achievement/ach-piala.webp'},
 {id:'tangga',t:'Raja Tangga',d:'Naik tangga',g:[10,50,150],ic:'achievement/ach-tangga.webp'},
 {id:'ular',t:'Penakluk Ular',d:'Terkena ular',g:[10,50,150],ic:'achievement/ach-ular.webp'},
 {id:'skill',t:'Pengguna Skill',d:'Gunakan skill',g:[10,50,200],ic:'achievement/ach-pedang.webp'},
 {id:'dadu',t:'Pecinta Dadu',d:'Lempar dadu',g:[50,250,1000],ic:'new-icon/dadu.webp'},
 {id:'papan',t:'Penjelajah Papan',d:'Selesaikan pertandingan',g:[5,50,200],ic:'achievement/ach-bumi.webp'},
 {id:'login',t:'Login Setia',d:'Login berturut-turut',g:[3,7,30],ic:'achievement/ach-kalender.webp'},
 {id:'streak',t:'Win Streak',d:'Menang beruntun',g:[2,5,10],ic:'ikon-gem-medali/petir-emas.webp'},
 {id:'skin',t:'Kolektor Skin',d:'Miliki skin',g:[2,10,25],ic:'achievement/ach-buku.webp'},
 {id:'emerald',t:'Pemburu Emerald',d:'Kumpulkan Emerald',g:[10,100,500],ic:'ikon-gem-medali/berlian-hijau.webp'},
 {id:'strategi',t:'Ahli Strategi',d:'Menang dengan skill berbeda',g:[2,5,10],ic:'achievement/ach-kuda.webp'},
 {id:'legenda',t:'Sang Legenda',d:'Menangkan pertandingan',g:[500,1000,2000],ic:'ikon-item/mahkota.webp'}];
const ACH_COIN=[250,750,2000];

/* ---- status (demo) ---- */
const S=Object.assign({
  tab:'daily',
  qp:{login:1,play:1,win:2},qc:{},bonus:false,
  day:3,dayDone:[1,2],
  ap:{},ac:{}
},rd(SKEY));
S.ap=Object.assign({peti:4,naga:3,aktif:8,menang:2,tangga:12,ular:8,skill:9,dadu:300,papan:3,login:7,streak:1,skin:1,emerald:6,strategi:1,legenda:520},S.ap); /* id baru terisi walau data lama tersimpan */
const save=()=>wr(SKEY,S);
const T0=new URLSearchParams(location.search).get('tab');if(['daily','hadiah','ach'].includes(T0))S.tab=T0;

/* ---- util ---- */
let tt;function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('on'),1900)}
function resetIn(){const n=new Date(),w=new Date(n.getTime()+7*3600e3);   /* hari WIB */
  const left=86400e3-((w.getUTCHours()*60+w.getUTCMinutes())*60+w.getUTCSeconds())*1000;
  return Math.floor(left/3600e3)+'j '+String(Math.floor(left%3600e3/60e3)).padStart(2,'0')+'m'}
const badge=n=>n?`<span class="bd"><img src="${IC}misi/lencana-notifikasi-merah-segi-delapan.webp" alt=""><b>${n}</b></span>`:'';
const rewardBox=(cls,ic,txt)=>`<div class="rbox ${cls||''}"><img src="${IC}${ic}" alt=""><b>${txt}</b></div>`;

/* ---- hitung yang bisa diklaim ---- */
const qReady=q=>S.qp[q.id]>=q.goal&&!S.qc[q.id];
const qAll=()=>QUESTS.every(q=>S.qc[q.id]);
const dayNowOk=()=>S.day<=7&&!S.dayDone.includes(S.day);
const aTier=a=>S.ac[a.id]||0;
const aReady=a=>aTier(a)<3&&S.ap[a.id]>=a.g[aTier(a)];
const cnt={daily:()=>QUESTS.filter(qReady).length+(qAll()&&!S.bonus?1:0),hadiah:()=>dayNowOk()?1:0,ach:()=>ACH.filter(aReady).length};

/* ---- render ---- */
function tabs(){
  const L=[['daily','DAILY','misi/ikon-tab-harian-centang.webp'],['hadiah','HADIAH','ikon-item/kado-merah.webp'],['ach','ACHIEVEMENTS','misi/ikon-tab-pencapaian-medali.webp']];
  $('#tabs').innerHTML=L.map(([k,n,i])=>`<button class="tab ${S.tab===k?'on':''}" data-k="${k}"><img class="ul" src="${IC}ikon-navigasi/garis-bawah-tab-emas.webp" alt=""><img class="ic" src="${IC}${i}" alt=""><span class="lb">${n}</span>${badge(cnt[k]())}</button>`).join('');
}
function vDaily(){
  const all=qAll(),rdy=all&&!S.bonus;
  let h=`<div class="hdr"><div class="alas"><img src="${IC}ikon-item/gulungan-pena.webp" alt=""></div>
    <h2>MISI HARIAN</h2><p>Selesaikan semua misi harian</p>
    <div class="rs"><img src="${IC}misi/ikon-jam-weker.webp" alt="">Reset dalam : <b id="rs">${resetIn()}</b></div>
    ${rdy?`<button class="btn cl sm gbtn2" data-bonus="1"><img src="${IC}tombol-dan-kontrol/tombol-hijau-polos.webp" alt=""><span>KLAIM</span></button>`:''}
    <div class="rw g" style="right:46px;${S.bonus?'opacity:.5':''}"><img src="${IC}hud/ikon-koin-emas.webp" alt=""><b>${BONUS}</b></div></div>`;
  QUESTS.forEach((q,i)=>{
    const p=Math.min(S.qp[q.id],q.goal),claimed=S.qc[q.id],ready=qReady(q),top=243+i*140;
    h+=`<div class="row ${ready?'ready':''} ${claimed?'fin':''}" style="top:${top}px">
      ${ready?`<div class="rbadge"><img src="${IC}misi/lencana-notifikasi-merah-segi-delapan.webp" alt=""><b>!</b></div>`:''}
      <img class="ri" src="${IC}${q.ic}" alt=""><h3>${q.t}</h3><div class="ds">${q.d}</div>
      <div class="pb"><i style="width:${Math.max(p?8:0,p/q.goal*100)}%"></i></div>${ready?'':`<div class="pt">${p} / ${q.goal}</div>`}
      ${ready?`<div class="rinl"><img src="${IC}hud/ikon-koin-emas.webp" alt=""><b>${q.coin}</b></div><button class="btn cl" data-q="${q.id}"><img src="${IC}tombol-dan-kontrol/tombol-hijau-polos.webp" alt=""><span>KLAIM</span></button>`
        :rewardBox(claimed?'done':'',claimed?'glyph-putih/centang.webp':'hud/ikon-koin-emas.webp',claimed?'SELESAI':q.coin)}
    </div>`;
  });
  const any=QUESTS.filter(qReady).length;
  h+=`<div class="foot"><div class="note">${any?`${any} misi siap diklaim`:(all?(S.bonus?'Semua hadiah hari ini sudah diklaim':'Bonus siap diklaim!'):'Selesaikan semua misi untuk bonus '+BONUS+' Coin')}</div>
    ${any?`<button class="btn cl wide" data-qall="1"><img src="${IC}tombol-dan-kontrol/tombol-hijau-polos.webp" alt=""><span>KLAIM SEMUA</span></button>`:''}</div>`;
  return h;
}
function vHadiah(){
  const pos=[[0,0],[360,0],[720,0],[0,330],[360,330],[720,330]];
  let h='';
  DAYS.forEach((d,i)=>{
    const n=i+1,st=S.dayDone.includes(n)?'done':(n===S.day?'now':'wait'),big=n===7;
    const [x,y]=big?[1080,0]:pos[i];
    h+=`<div class="dc ${st} ${big?'big':''}" style="left:${x}px;top:${y+10}px"><div class="dn">Hari ${n}</div>
      <img class="di ${d.cls||''}" src="${IC}${d.ic}" alt=""><div class="dt">${d.t}</div>${st==='done'?`<img class="ck" src="${IC}glyph-putih/centang.webp" alt="">`:''}</div>`;
  });
  h+=`<div class="foot" style="bottom:20px"><div class="note">Reset dalam : <span style="color:#ff6f8d" id="rs">${resetIn()}</span></div>
    ${dayNowOk()?`<button class="btn cl" data-day="1"><img src="${IC}tombol-dan-kontrol/tombol-hijau-polos.webp" alt=""><span>KLAIM</span></button>`:''}</div>`;
  return h;
}
function vAch(){
  let h='';
  ACH.forEach((a,i)=>{
    const t=aTier(a),fin=t>=3,ready=aReady(a),g=a.g[Math.min(t,2)],p=Math.min(S.ap[a.id],g),top=i*150;
    h+=`<div class="row ach ${ready?'ready':''} ${fin?'fin':''}" style="top:${top}px">
      ${ready?`<div class="rbadge"><img src="${IC}misi/lencana-notifikasi-merah-segi-delapan.webp" alt=""><b>!</b></div>`:''}
      <img class="ri" src="${IC}${a.ic}" alt="" style="${a.ic.startsWith('glyph')?'filter:drop-shadow(0 4px 3px rgba(0,0,0,.5)) opacity(.9)':''}"><h3>${a.t}</h3><div class="ds">${a.d} ${fmt(g)}×</div>
      <div class="stars">${[0,1,2].map(k=>`<img src="${IC}stage-chapter/bintang-stage-${k<t?'emas':'kosong'}.webp" alt="">`).join('')}</div>
      <div class="pb"><i style="width:${Math.max(p?8:0,p/g*100)}%"></i></div>${ready?'':`<div class="pt">${fin?fmt(a.g[2]):fmt(p)} / ${fmt(g)}</div>`}
      ${ready?`<div class="rinl"><img src="${IC}hud/ikon-koin-emas.webp" alt=""><b>${ACH_COIN[t]}</b></div><button class="btn cl" data-a="${a.id}"><img src="${IC}tombol-dan-kontrol/tombol-hijau-polos.webp" alt=""><span>KLAIM</span></button>`
        :rewardBox(fin?'done':'',fin?'glyph-putih/centang.webp':'hud/ikon-koin-emas.webp',fin?'SELESAI':ACH_COIN[t])}
    </div>`;
  });
  h+=`<div class="endsp" style="top:${ACH.length*150}px"></div>`;
  return h;
}
function render(){
  tabs();
  const bd=$('#body'),st=(render.last===S.tab)?bd.scrollTop:0;
  bd.innerHTML=S.tab==='daily'?vDaily():S.tab==='hadiah'?vHadiah():vAch();
  bd.scrollTop=st;render.last=S.tab;
  $('#title').textContent={daily:'Misi Harian',hadiah:'Hadiah Harian',ach:'Achievements'}[S.tab];
}

/* ---- aksi ---- */
function claimQ(q){if(!qReady(q))return 0;S.qc[q.id]=1;addWallet({coin:q.coin});return q.coin}
$('#tabs').onclick=e=>{const t=e.target.closest('.tab');if(t){S.tab=t.dataset.k;save();render()}};
$('#body').onclick=e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.q){const q=QUESTS.find(x=>x.id===b.dataset.q),c=claimQ(q);if(c)toast('+'+c+' Coin')}
  else if(b.dataset.qall){let s=0;QUESTS.forEach(q=>s+=claimQ(q));if(s)toast('+'+s+' Coin')}
  else if(b.dataset.bonus){if(qAll()&&!S.bonus){S.bonus=true;addWallet({coin:BONUS});toast('Bonus +'+BONUS+' Coin')}}
  else if(b.dataset.day){if(dayNowOk()){const d=DAYS[S.day-1];S.dayDone.push(S.day);addWallet({coin:d.coin,emerald:d.emerald});
    toast('Hari '+S.day+': '+d.t);S.day=Math.min(7,S.day+1);if(S.dayDone.includes(S.day))S.day=8}}
  else if(b.dataset.a){const a=ACH.find(x=>x.id===b.dataset.a);if(aReady(a)){const c=ACH_COIN[aTier(a)];S.ac[a.id]=aTier(a)+1;addWallet({coin:c});toast(a.t+' ★'+S.ac[a.id]+' +'+c+' Coin')}}
  else return;
  save();render();
};
setInterval(()=>{const r=$('#rs');if(r)r.textContent=resetIn()},20000);
const toLobby=()=>{$('#fade').classList.add('on');setTimeout(()=>location.href='lobby.html',330)};
$('#back').onclick=toLobby;$('#home').onclick=toLobby;
showWallet();render();
