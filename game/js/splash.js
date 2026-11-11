/* splash.html (README bagian 3): loading -> cek login -> lobby. Akun disimulasikan di localStorage (tanpa Supabase). */
const $=s=>document.querySelector(s);
const AKEY='dragonroll:auth', UKEY='dragonroll:users';
function fit(){$('#stage').style.transform=`scale(${Math.min(innerWidth/1920,innerHeight/1080)})`}addEventListener('resize',fit);fit();
const params=new URLSearchParams(location.search);
const next=/^[\w-]+\.html$/.test(params.get('next')||'')?params.get('next'):'lobby.html';
const ASSETS=['assets/komponen/logo/logo-fantasy-rpg.webp'];
const LABELS=['Memuat game','Memuat gambar','Memuat musik & suara','Menyiapkan dunia'];
function users(){try{return JSON.parse(localStorage.getItem(UKEY))||{}}catch(e){return{}}}
function session(){try{return JSON.parse(localStorage.getItem(AKEY))}catch(e){return null}}
let pct=0;
function setPct(p){pct=p;$('#fill').style.width=p+'%';$('#lbl').textContent=LABELS[Math.min(3,Math.floor(p/26))]+'… '+Math.round(p)+'%'}
function go(){sessionStorage.setItem('dragonroll:booted','1');$('#fade').classList.add('on');setTimeout(()=>location.replace(next),400)}
function loaded(){
  const s=session();
  if(s){$('#lbl').textContent='Halo, '+s.username;setTimeout(go,700)}
  else{$('#loadbox').style.display='none';$('#loginbtn').hidden=false}
}
(function load(){
  let n=0;const total=ASSETS.length;
  ASSETS.forEach(a=>{const i=new Image();i.onload=i.onerror=()=>{n++};i.src=a});
  const iv=setInterval(()=>{setPct(Math.min(100,pct+3+Math.random()*5));if(pct>=100&&n>=total){clearInterval(iv);setTimeout(loaded,300)}},90);
})();
let mode='up';
function tab(m){mode=m;$('#tabup').classList.toggle('on',m==='up');$('#tabin').classList.toggle('on',m==='in');$('#err').textContent=''}
$('#tabup').onclick=()=>tab('up');$('#tabin').onclick=()=>tab('in');
$('#loginbtn').onclick=()=>$('#authmodal').classList.add('on');
$('#cancel').onclick=()=>$('#authmodal').classList.remove('on');
$('#ok').onclick=()=>{
  const u=$('#user').value.trim(),p=$('#pass').value,us=users();
  if(!/^[A-Za-z0-9_]{3,16}$/.test(u))return $('#err').textContent='Username 3–16 karakter (huruf, angka, _)';
  if(p.length<6)return $('#err').textContent='Password minimal 6 karakter';
  if(mode==='up'){if(us[u])return $('#err').textContent='Username sudah dipakai';us[u]=btoa(unescape(encodeURIComponent(p)));localStorage.setItem(UKEY,JSON.stringify(us))}
  else if(us[u]!==btoa(unescape(encodeURIComponent(p))))return $('#err').textContent='Username atau password salah';
  localStorage.setItem(AKEY,JSON.stringify({username:u}));
  try{const d=JSON.parse(localStorage.getItem('dragonroll:lobby:demo'))||{};d.name=u;localStorage.setItem('dragonroll:lobby:demo',JSON.stringify(d))}catch(e){}
  $('#authmodal').classList.remove('on');$('#loginbtn').hidden=true;$('#loadbox').style.display='';$('#lbl').textContent='Halo, '+u;setTimeout(go,700);
};
