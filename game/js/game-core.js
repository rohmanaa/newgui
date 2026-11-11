/* DRAGON ROLL — game-core: aturan papan murni (tanpa DOM), sesuai README bagian 7. */
(function(root){
  const LADDERS={8:26,20:41,36:55,51:72,71:91};
  const SNAKES={17:4,32:12,47:27,62:44,98:77};
  const END={world:100,nether:120};
  const CHESTS=[6,11,22,60,64,82,89];
  const MOBS={2:{n:'Zombie',back:1},30:{n:'Creeper',back:2},38:{n:'Skeleton',back:1},53:{n:'Enderman',back:2},66:{n:'Blaze',back:3,nether:true}};
  const CHEST_TABLE=[ // bobot sesuai README
    ['kosong',15],['maju',19],['mundur',5],['pasti6',9],['roll+',15],['bonus2',19],['tangga',9],['ular',9]];
  function rollDie(rng){return 1+Math.floor((rng||Math.random)()*6)}
  /** Hitung satu langkah: pos awal, angka dadu -> posisi akhir (memantul bila melewati akhir). */
  function move(pos,dice,end){
    let to=pos+dice;
    if(to>end)to=end-(to-end);
    return to;
  }
  function applyTile(pos,theme){
    if(LADDERS[pos])return {pos:LADDERS[pos],type:'tangga',from:pos};
    if(SNAKES[pos])return {pos:SNAKES[pos],type:'ular',from:pos};
    const m=MOBS[pos];
    if(m&&(!m.nether||theme==='nether'))return {pos:Math.max(1,pos-m.back),type:'mob',mob:m.n,from:pos};
    if(CHESTS.includes(pos))return {pos,type:'peti',from:pos};
    return {pos,type:'biasa',from:pos};
  }
  function nearest(pos,table,up){
    const ks=Object.keys(table).map(Number).filter(k=>up?k>pos:k>pos).sort((a,b)=>a-b);
    return ks.length?ks[0]:null;
  }
  function chestReward(rng){
    const tot=CHEST_TABLE.reduce((a,b)=>a+b[1],0);let r=(rng||Math.random)()*tot;
    for(const [k,w] of CHEST_TABLE){if((r-=w)<0)return k}
    return 'kosong';
  }
  /** Satu giliran. state: {pos,sixes}. Mengembalikan hasil lengkap. */
  function turn(state,dice,theme,opts){
    opts=opts||{};const end=END[theme]||100;
    const res={dice:dice,from:state.pos,steps:[],extra:false,burnt:false,events:[]};
    let sixes=dice===6?state.sixes+1:0;
    if(sixes>=3){res.burnt=true;res.to=state.pos;res.sixes=0;res.events.push('Tiga 6 berturut-turut! Giliran hangus');return res}
    const total=dice+(opts.bonus||0);let pos=state.pos;res.path=[];
    let dir=1;for(let i=0;i<total;i++){if(pos>=end)dir=-1;pos+=dir;res.path.push(pos)}
    res.moved=pos;
    const t=applyTile(pos,theme);
    res.tile=t;
    if(t.type==='tangga'||t.type==='ular'||t.type==='mob'){pos=t.pos;res.events.push(t.type==='tangga'?'Tangga naik!':t.type==='ular'?'Digigit ular!':'Diserang '+t.mob+'!')}
    if(t.type==='peti'){
      const r=chestReward(opts.rng);res.chest=r;
      if(r==='maju'){pos=Math.min(end,pos+1+Math.floor((opts.rng||Math.random)()*3));res.events.push('Peti: maju!')}
      else if(r==='mundur'){pos=Math.max(1,pos-1-Math.floor((opts.rng||Math.random)()*3));res.events.push('Peti: mundur!')}
      else if(r==='pasti6'){res.nextSix=true;res.events.push('Peti: dadu berikutnya pasti 6')}
      else if(r==='roll+'){res.extra=true;res.events.push('Peti: giliran tambahan')}
      else if(r==='bonus2'){res.nextBonus=2;res.events.push('Peti: +2 dadu berikutnya')}
      else if(r==='tangga'){const n=nearest(pos,LADDERS);if(n){pos=LADDERS[n];res.events.push('Peti: meluncur ke tangga!')}}
      else if(r==='ular'){const n=nearest(pos,SNAKES);if(n){pos=SNAKES[n];res.events.push('Peti: meluncur ke ular!')}}
      else res.events.push('Peti kosong');
    }
    if(dice===6){res.extra=true;res.events.push('Angka 6: giliran tambahan')}
    res.to=pos;res.sixes=sixes;res.win=pos>=end;
    return res;
  }
  const api={LADDERS,SNAKES,END,CHESTS,MOBS,rollDie,move,applyTile,turn,chestReward};
  if(typeof module!=='undefined')module.exports=api; else root.GameCore=api;
})(typeof window!=='undefined'?window:globalThis);
