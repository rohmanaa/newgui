const $=s=>document.querySelector(s);
function fit(){$('#stage').style.transform=`scale(${Math.min(innerWidth/1920,innerHeight/1080)})`}addEventListener('resize',fit);fit();
let sel=getHero().id;
function draw(){
  const eq=getHero().id,h=HEROES.find(x=>x.id===sel);
  $('#grid').innerHTML=HEROES.map(x=>`<button class="card ${x.id===sel?'sel':''} ${x.id===eq?'eq':''}" data-id="${x.id}"><img src="${heroIcon(x)}" alt=""><span class="n">${x.name}</span></button>`).join('');
  $('#art').innerHTML=`<img src="${h.art||heroIcon(h)}" alt="" ${h.art?'':'style="width:380px"'}>`;
  $('#nm').textContent=h.name;$('#cls').textContent=h.cls;$('#ds').textContent=h.desc;
  $('#stats').innerHTML=['Kekuatan','Kelincahan','Pertahanan'].map((n,i)=>`<div class="st"><span>${n}</span><i><b style="width:${h.stat[i]*20}%"></b></i></div>`).join('');
  const used=h.id===eq;$('#use').textContent=used?'DIGUNAKAN':'GUNAKAN';$('#use').disabled=used;
}
$('#grid').onclick=e=>{const c=e.target.closest('.card');if(c){sel=c.dataset.id;draw()}};
let tt;function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('on'),1800)}
$('#use').onclick=()=>{setHero(sel);draw();toast('Karakter diganti: '+HEROES.find(h=>h.id===sel).name)};
$('#back').onclick=()=>{$('#fade').classList.add('on');setTimeout(()=>location.href='lobby.html',330)};
draw();
