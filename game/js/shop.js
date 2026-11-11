/* shop.html — Toko (README): hanya jual Coin. Tukar Emerald -> Coin: 10->500, 40->2.500, 120->10.000 (paket ke-3 "BEST").
   Tab EMERALD: "Tonton Iklan" (simulasi hitung mundur, +5 Emerald). Dompet demo di localStorage (sama dengan lobby/mission);
   proyek utama memakai WalletService.exchange(i) dan klaim iklan lewat server. ?coin=1 membuka tab Coin dan menyorot kartu. ?from=<halaman> untuk tombol Back. */
const $=s=>document.querySelector(s);
function fit(){$('#stage').style.transform=`scale(${Math.min(innerWidth/1920,innerHeight/1080)})`}addEventListener('resize',fit);fit();
const IC='assets/komponen/';
const WKEY='dragonroll:lobby:demo';
const rd=k=>{try{return JSON.parse(localStorage.getItem(k))||{}}catch(e){return{}}};
const wr=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const fmt=n=>Number(n).toLocaleString('en-US');
function wallet(){const w=rd(WKEY);return{emerald:w.emerald??120,coin:w.coin??2500}}
function addWallet(d){const w=rd(WKEY),c=wallet();w.emerald=c.emerald+(d.emerald||0);w.coin=c.coin+(d.coin||0);wr(WKEY,w);showWallet(true)}
function showWallet(bump){const w=wallet();$('#v-em').textContent=fmt(w.emerald);$('#v-co').textContent=fmt(w.coin);
  if(bump)['#cur-em','#cur-co'].forEach(s=>{const e=$(s);e.classList.remove('bump');void e.offsetWidth;e.classList.add('bump')})}
let tt;function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('on'),2000)}
const nav=u=>{$('#fade').classList.add('on');setTimeout(()=>location.href=u,330)};

/* ---- data ---- */
const COINS=[
  {t:'Koin Kecil',coin:500,em:10,img:'paket-gold/gold-koin-sedikit.webp'},
  {t:'Tumpukan Koin',coin:2500,em:40,img:'paket-gold/gold-tumpukan.webp'},
  {t:'Kantong Koin',coin:10000,em:120,img:'paket-gold/gold-kantong.webp',best:true}];
const AD_REWARD=5,AD_SECONDS=3;
const Q=new URLSearchParams(location.search);
let tab=(Q.get('coin')==='1'||Q.get('tab')!=='emerald')?'coin':'emerald';

/* ---- render ---- */
function render(hl){
  document.querySelectorAll('.tabb').forEach(b=>b.classList.toggle('on',b.dataset.k===tab));
  if(tab==='coin'){
    $('#cards').innerHTML=COINS.map((p,i)=>`<div class="card${hl?' hl':''}">
      ${p.best?`<img class="rib" src="${IC}banner-label/pita-badge-biru.webp" alt=""><span class="rt">BEST</span>`:''}
      <div class="nm">${p.t}</div><div class="pic"><img src="${IC}${p.img}" alt=""></div>
      <div class="amt">${fmt(p.coin)} Coin</div>
      <button class="btn buy" data-i="${i}"><img src="${IC}tombol-dan-kontrol/tombol-hijau-polos.webp" alt=""><span><img src="${IC}ikon-gem-medali/berlian-hijau.webp" alt="">${p.em}</span></button></div>`).join('');
  }else{
    $('#cards').innerHTML=`<div class="card">
      <div class="nm">Tonton Iklan</div><div class="pic"><img src="${IC}ikon-gem-medali/televisi.webp" alt="" style="max-height:230px"></div>
      <div class="amt">+${AD_REWARD} Emerald<small>Iklan simulasi (${AD_SECONDS} detik)</small></div>
      <button class="btn buy" id="watch"><img src="${IC}tombol-dan-kontrol/tombol-hijau-polos.webp" alt=""><span>TONTON</span></button></div>`;
  }
}
function setTab(k,hl){tab=k;render(hl)}
$('#tabs').onclick=e=>{const b=e.target.closest('.tabb');if(b)setTab(b.dataset.k)};
$('#cur-em').onclick=()=>setTab('emerald');
$('#cur-co').onclick=()=>setTab('coin',true);

/* ---- dialog ---- */
const dlg=$('#dlg');let onOk=null;
function ask({title,text,ok='OK',okImg='tombol-hijau-polos',cancel=true,fn}){
  $('#dlg-t').textContent=title;$('#dlg-s').textContent=text;$('#dlg-oktx').textContent=ok;
  $('#dlg-okimg').src=`${IC}tombol-dan-kontrol/${okImg}.webp`;$('#dlg-no').style.display=cancel?'':'none';
  onOk=fn;dlg.classList.add('on');
}
const closeDlg=()=>{dlg.classList.remove('on');onOk=null};
$('#dlg-no').onclick=closeDlg;
$('#dlg-ok').onclick=()=>{const f=onOk;closeDlg();if(f)f()};
dlg.addEventListener('click',e=>{if(e.target===dlg)closeDlg()});
addEventListener('keydown',e=>{if(e.key==='Escape')closeDlg()});

/* ---- tukar Emerald -> Coin ---- */
function buy(i){
  const p=COINS[i],w=wallet();
  if(w.emerald<p.em){
    ask({title:'EMERALD TIDAK CUKUP',text:`Kamu butuh ${fmt(p.em-w.emerald)} Emerald lagi untuk paket ini.`,ok:'DAPATKAN EMERALD',okImg:'tombol-kuning-polos',fn:()=>setTab('emerald')});return;
  }
  ask({title:'TUKAR EMERALD?',text:`${fmt(p.em)} Emerald → ${fmt(p.coin)} Coin`,ok:'TUKAR',fn:()=>{addWallet({emerald:-p.em,coin:p.coin});toast(`+${fmt(p.coin)} Coin`)}});
}
/* ---- tonton iklan (simulasi) ---- */
let adBusy=false;
function watch(){
  if(adBusy)return;adBusy=true;let n=AD_SECONDS;
  $('#ad-n').textContent=n;$('#ad').classList.add('on');
  const iv=setInterval(()=>{n--;if(n>0){$('#ad-n').textContent=n;return}
    clearInterval(iv);$('#ad').classList.remove('on');adBusy=false;
    addWallet({emerald:AD_REWARD});toast(`+${AD_REWARD} Emerald`)},1000);
}
$('#cards').addEventListener('click',e=>{
  const b=e.target.closest('.buy');if(!b)return;
  if(b.id==='watch')watch();else buy(+b.dataset.i);
});

/* ---- navigasi ---- */
const from=(Q.get('from')||'').match(/^[\w-]+\.html$/)?Q.get('from'):'lobby.html';
$('#back').onclick=()=>nav(from);$('#home').onclick=()=>nav('lobby.html');
showWallet();render(Q.get('coin')==='1');
