/* profile.html — kiri: tombol pintasan, tengah: karakter terpasang, kanan: info pemain.
   Data tiruan dari localStorage (di proyek utama: PlayerData + RPC get_my_profile). Tanpa achievement. */
const $=s=>document.querySelector(s);
function fit(){$('#stage').style.transform=`scale(${Math.min(innerWidth/1920,innerHeight/1080)})`}addEventListener('resize',fit);fit();
const wal=(()=>{try{return JSON.parse(localStorage.getItem('dragonroll:lobby:demo'))||{}}catch(e){return{}}})();
const fmt=n=>Number(n).toLocaleString('en-US');
$('#v-em').textContent=fmt(wal.emerald??120);$('#v-co').textContent=fmt(wal.coin??2500);

/* halaman yang sudah ada (sama dengan BUILT di lobby.js) — tambahkan saat halaman baru selesai */
const BUILT=['karakter.html','mode.html','settings.html','room.html','mission.html','shop.html','profile.html'];
const IC='assets/komponen/';
const MENU=[
  ['Karakter','ikon-item/helm-ksatria.webp','karakter.html'],
  ['Frame','new-icon/frame.webp','frame.html'],
  ['Dadu','new-icon/dadu.webp','dadu.html'],
  ['Efek','ikon-gem-medali/kristal-api.webp','efek.html'],
  ['Power-up','ikon-gem-medali/petir-ungu.webp','powerup.html'],
  ['Peringkat','ikon-item/podium.webp','leaderboard.html'],
  ['Teman','new-icon/freinds.webp','friendship.html'],
  ['Tambang','ikon-gem-medali/berlian-hijau.webp','tambang.html?from=profile.html'],
  ['Misi','ikon-item/gulungan-misi.webp','mission.html'],
  ['Pengaturan','ikon-item/gir.webp','settings.html']
];
$('#menu').innerHTML=MENU.map(([n,ic,u],i)=>`<button class="mb" data-i="${i}" aria-label="${n}"><div class="ic"><img src="${IC}${ic}" alt=""></div><div class="lb">${n}</div></button>`).join('');

let tt;function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('on'),1800)}
const nav=u=>{$('#fade').classList.add('on');setTimeout(()=>location.href=u,330)};
function go(u){if(!BUILT.includes(u.split('?')[0])){toast('Segera hadir');return}nav(u)}
$('#menu').onclick=e=>{const b=e.target.closest('.mb');if(b)go(MENU[b.dataset.i][2])};
$('#use').onclick=()=>go('karakter.html');
$('#back').onclick=$('#home').onclick=()=>nav('lobby.html');

/* level: rumus sama dengan lobby (level 1 butuh 400 XP, tiap level +100) */
function lvInfo(xp){let lv=1,need=400;while(xp>=need&&lv<999){xp-=need;lv++;need=400+100*(lv-1)}return{lv,cur:lv>=999?need:xp,need}}
const L=lvInfo(wal.xp??683),pct=Math.min(100,L.cur/L.need*100);
$('#lvn').textContent=L.lv;$('#lvp').textContent=pct.toFixed(1)+'%';
requestAnimationFrame(()=>requestAnimationFrame(()=>$('#lvf').style.width=pct+'%'));

/* karakter terpasang di tengah */
const h=getHero();
const cyl=(cx,cy,rx,ry,hh,top,side)=>`<path d="M${cx-rx},${cy} v${hh} a${rx},${ry} 0 0 0 ${rx*2},0 v${-hh} Z" fill="${side}" stroke="#17122b" stroke-width="3" stroke-linejoin="round"/><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${top}" stroke="#17122b" stroke-width="3"/>`;
const PED=`<svg viewBox="0 0 500 190" aria-hidden="true"><ellipse cx="250" cy="168" rx="236" ry="22" fill="rgba(8,4,20,.35)"/>${cyl(250,104,222,46,30,'#4b4370','#2f2949')}${cyl(250,82,176,36,24,'#5d5486','#3b3459')}${cyl(250,62,128,27,20,'#6f66a0','#463e6b')}<ellipse cx="250" cy="62" rx="100" ry="20" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="3"/></svg>`;
$('#art').innerHTML=PED+`<img src="${h.art||heroIcon(h)}" alt="" style="height:${h.art?440:250}px">`;
$('#hicon').src=heroIcon(h);
$('#hnm').textContent=wal.name||'Ryuen';
$('#hcls').textContent=h.name+' · '+h.cls;

/* statistik (tiruan; di proyek utama dari get_my_profile) */
const S=Object.assign({main:42,menang:24,tangga:96,ular:71,peti:38,naga:150,sejak:'12 Okt 2026',id:'482913'},(()=>{try{return JSON.parse(localStorage.getItem('dragonroll:profile:stats'))||{}}catch(e){return{}}})());
const wr=S.main?Math.round(S.menang/S.main*100):0;
$('#ds').textContent=`ID #${S.id} · Bergabung ${S.sejak}. ${S.main} pertandingan, ${wr}% kemenangan.`;
const stars=wr>=60?3:wr>=40?2:wr>0?1:0;
$('#stars').innerHTML=[0,1,2].map(i=>`<img src="${IC}stage-chapter/bintang-stage-${i<stars?'emas':'kosong'}.webp" alt="">`).join('');
$('#sumv').textContent=fmt(S.menang);
const G=IC+'glyph-putih/';
const ROWS=[['Menang','piala',S.menang,S.main||1,'#3fc6a8'],['Tangga','panah-atas',S.tangga,150,'#e5604e'],['Ular','tongkat-ular',S.ular,150,'#e89a52'],['Peti','peti-harta',S.peti,60,'#4db3e6'],['Serang Naga','tengkorak',S.naga,300,'#d26f9c']];
$('#stats').innerHTML=ROWS.map(([n,ic,v,m,c])=>`<div class="st" style="--c:${c}"><img src="${G}${ic}.webp" alt=""><span>${n}</span><i><b data-w="${Math.min(100,v/m*100)}"></b></i><em>${fmt(v)}</em></div>`).join('');
requestAnimationFrame(()=>requestAnimationFrame(()=>document.querySelectorAll('.st b').forEach(b=>b.style.width=b.dataset.w+'%')));
