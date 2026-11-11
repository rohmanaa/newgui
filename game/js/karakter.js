const $=s=>document.querySelector(s);
function fit(){$('#stage').style.transform=`scale(${Math.min(innerWidth/1920,innerHeight/1080)})`}addEventListener('resize',fit);fit();
const wal=(()=>{try{return JSON.parse(localStorage.getItem('dragonroll:lobby:demo'))||{}}catch(e){return{}}})();
$('#v-em').textContent=(wal.emerald??120).toLocaleString('en-US');$('#v-co').textContent=(wal.coin??2500).toLocaleString('en-US');
let sel=getHero().id;
function draw(){
  const eq=getHero().id,h=HEROES.find(x=>x.id===sel);
  $('#grid').innerHTML=HEROES.map(x=>`<button class="kcard ${x.id===sel?'sel':''} ${x.id===eq?'eq':''}" data-id="${x.id}">${x.id===eq?'<span class="tag">DIPAKAI</span>':''}<img src="${heroIcon(x)}" alt=""><span class="n">${x.name}</span></button>`).join('');
  $('#art').innerHTML=`<img src="${h.art||heroIcon(h)}" alt="" ${h.art?'':'style="width:380px"'}>`;
  $('#nm').textContent=h.name;$('#cls').textContent=h.cls;$('#ds').textContent=h.desc;
  $('#stats').innerHTML=['Kekuatan','Kelincahan','Pertahanan'].map((n,i)=>`<div class="st"><span>${n}</span><i><b style="width:${h.stat[i]*20}%"></b></i></div>`).join('');
  const used=h.id===eq;$('#use span').textContent=used?'DIGUNAKAN':'GUNAKAN';$('#use').classList.toggle('off',used);
}
$('#grid').onclick=e=>{const c=e.target.closest('.kcard');if(c){sel=c.dataset.id;draw()}};
let tt;function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('on'),1800)}
$('#use').onclick=()=>{setHero(sel);draw();toast('Karakter diganti: '+HEROES.find(h=>h.id===sel).name)};
$('#back').onclick=()=>{$('#fade').classList.add('on');setTimeout(()=>location.href='lobby.html',330)};
draw();
