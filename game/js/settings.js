/* settings.html (README bagian 6): disimpan ke localStorage 'dragonroll:pref:*' (di proyek utama: PlayerData + PrefsSync). */
const $=s=>document.querySelector(s);
function fit(){$('#stage').style.transform=`scale(${Math.min(innerWidth/1920,innerHeight/1080)})`}addEventListener('resize',fit);fit();
const DEF={graphics:'high',musicVol:'30',sfxVol:'100',musicOn:'1',sfxOn:'1',vibrate:'1',theme:'system'};
const get=k=>{try{return localStorage.getItem('dragonroll:pref:'+k)??DEF[k]}catch(e){return DEF[k]}};
const set=(k,v)=>{try{localStorage.setItem('dragonroll:pref:'+k,v)}catch(e){}};
document.querySelectorAll('.seg').forEach(s=>{
  const k=s.dataset.k,draw=()=>s.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.v===get(k)));
  s.onclick=e=>{const b=e.target.closest('button');if(b){set(k,b.dataset.v);draw()}};draw();
});
['musicVol','sfxVol'].forEach(k=>{const r=$('#'+k),v=$('#'+k+'V');r.value=get(k);v.textContent=r.value;r.oninput=()=>{v.textContent=r.value;set(k,r.value)}});
document.querySelectorAll('.tg').forEach(t=>{const k=t.dataset.k,draw=()=>t.classList.toggle('on',get(k)==='1');t.onclick=()=>{set(k,get(k)==='1'?'0':'1');draw()};draw()});
let tt;function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('on'),1800)}
const nav=u=>{$('#fade').classList.add('on');setTimeout(()=>location.href=u,330)};
$('#back').onclick=()=>nav('lobby.html');
$('#logout').onclick=()=>{localStorage.removeItem('dragonroll:auth');nav('splash.html')};
