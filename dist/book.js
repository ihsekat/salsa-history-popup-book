import {paintShoals} from './island.js';
import {makePageBlock} from './page-block.js';
import * as T from './three.module.min.js';
import {coverFrame,coverPageFrame,boardCenter,makeSpine,paperBed,blockDepth} from './hardcover.js';
import {canvasTexture, makeKit, surfaceHeight} from './craft.js';
import {PAGE_WIDTH as W, PAGE_DEPTH as D, STRIPS, pagePose, sheetHeight, setFrame} from './fold.js';

function inkPath(c,coords,fill,stroke,width=1) {
  c.beginPath(); coords.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y)); c.closePath();
  if(fill){c.fillStyle=fill;c.fill();} if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}
}
function sceneGround(c,id,w,h){
  if(id==='landfall'){
    c.fillStyle='#82b7ae';c.fillRect(0,0,w,h);
    for(let j=0;j<16;j++)for(let i=0;i<8;i++){
      const x=i*278+(j%3)*74-130,y=74+j*51+Math.sin(i+j)*16;
      c.strokeStyle=j%3?'#b2c9b4':'#639e99';c.lineWidth=j%3?2:4;
      c.beginPath();c.moveTo(x,y);c.bezierCurveTo(x+44,y-11,x+70,y+12,x+138,y-2);c.stroke();
    }
    paintShoals(c,w,h);
    return;
  }
  if(['taino','africa'].includes(id)){
    const red=id==='africa';
    c.fillStyle=red?'#c39a72':'#a5b789';c.fillRect(0,0,w,h);
    inkPath(c,[[25,674],[356,408],[734,343],[1189,263],[1671,353],[1900,611],[1735,871],[932,896],[323,857]],red?'#d4ab7e':'#d4bd8b');
    for(let i=0;i<195;i++){
      const x=42+(i*197)%1840,y=140+(i*71)%710;
      c.fillStyle=i%2?'#af986a':'#ead3a2';c.fillRect(x,y,3+i%5,2);
    }
    return;
  }
  if(['stadium','halftime'].includes(id)){
    for(let i=0;i<12;i++){c.fillStyle=i%2?'#91a783':'#9aaf8b';c.fillRect(0,i*85,w,85);}
    if(id==='stadium'){
      inkPath(c,[[425,538],[875,221],[1361,540],[902,843]],'#c8996c');
      inkPath(c,[[493,537],[878,272],[1290,540],[898,797]],'#9db18b');
      for(const [x,y] of [[425,538],[875,221],[1361,540],[902,843]])inkPath(c,[[x-14,y],[x,y-10],[x+14,y],[x,y+10]],'#f2e6bf');
    }else{c.strokeStyle='#d8d9b9';c.lineWidth=4;for(let i=1;i<11;i++){c.beginPath();c.moveTo(i*177,50);c.lineTo(i*177,900);c.stroke();}}
    return;
  }
  if(id==='championship'){
    c.fillStyle='#806f71';c.fillRect(0,0,w,h);
    c.strokeStyle='#a18b88';c.lineWidth=3;
    for(let i=-1;i<11;i++){
      c.beginPath();c.moveTo(i*170,0);c.lineTo(i*170+290,h);c.stroke();
    }
    return;
  }
  const tile=id==='spain',stage=id==='los-angeles';
  for(let j=0;j<16;j++)for(let i=-1;i<19;i++){
    const x=i*124+(tile?0:(j%2)*62),y=j*63;
    const palette=tile?['#c98967','#cb9472','#dbab86']:stage?['#a07a64','#ab876e','#b59178']:['#c8a87e','#d0b18c','#bd9a76'];
    c.fillStyle=palette[(i+25+j*5)%3];c.fillRect(x+1,y+1,122,61);
    if(tile && (i+j)%2===0)inkPath(c,[[x+57,y+25],[x+61,y+20],[x+65,y+25],[x+61,y+30]],'#9e6b51');
  }
  c.lineWidth=5;c.strokeStyle='#ddd0a0';c.strokeRect(85,80,w-170,h-222);
}
function paintedPage(entry,number) {
  const ch=['son','palladium'].indexOf(entry.id);
  const canvas=document.createElement('canvas');canvas.width=1520;canvas.height=800;
  const c=canvas.getContext('2d'),w=1900,h=1000;c.scale(.8,.8);
  c.fillStyle=['#f0e0b1','#f1dcae'][ch]||'#eddbb0';c.fillRect(0,0,w,h);
  c.strokeStyle='#aa976d';c.lineWidth=1.7;c.strokeRect(25,23,w-50,h-46);c.strokeRect(34,32,w-68,h-64);
  const outline=[[66,66],[455,54],[674,78],[938,57],[1255,65],[1510,53],[1830,73],[1861,239],[1844,474],[1862,704],[1811,850],[1600,880],[1380,865],[1150,901],[865,874],[692,892],[454,890],[206,861],[49,830],[56,584],[42,336]];
  inkPath(c,outline,['#b5bd83','#bfad83'][ch]||'#c4ae87');
  c.save();c.clip();
  if(ch<0)sceneGround(c,entry.id,w,h);
  else if(ch===0){
    inkPath(c,[[30,230],[400,202],[640,250],[883,207],[1250,262],[1712,221],[1910,251],[1910,0],[30,0]],'#a0b598');
    for(let i=0;i<6;i++){
      c.strokeStyle='rgba(104,125,95,.25)'; c.lineWidth=2;
      c.beginPath();c.moveTo(0,180+i*20);c.bezierCurveTo(320,240+i*9,580,150+i*20,820,200+i*16);c.stroke();
    }
    inkPath(c,[[1212,257],[1490,247],[1500,408],[1242,576],[953,825],[694,820],[976,542],[1151,418]],'#d3b482');
    inkPath(c,[[357,461],[849,390],[1301,510],[1374,728],[1073,832],[519,790],[330,650]],'#dabc8d');
    c.save();c.clip();
    for(let i=-8;i<32;i++){
      c.strokeStyle='rgba(145,118,78,.25)';c.lineWidth=2;c.beginPath();c.moveTo(i*76,-10);c.lineTo(i*76+650,h);c.stroke();
      c.beginPath();c.moveTo(i*90,0);c.lineTo(i*90-760,h);c.stroke();
    }
    c.restore();
  }else{
    for(let j=0;j<16;j++)for(let i=-1;i<19;i++){
      const x=i*125+(j%2)*62,y=j*60;
      c.fillStyle=['#c69c6c','#bf966c','#cea77a','#c5a079'][(i+49+j*7)%4];
      c.fillRect(x+1,y+1,123,58);
      c.strokeStyle='rgba(117,86,63,.15)'; c.beginPath();c.moveTo(x+12,y+16);c.lineTo(x+106,y+17);c.stroke();
    }
    c.strokeStyle='#e0cba1';c.lineWidth=7;c.strokeRect(86,76,w-172,h-190);

  }
  c.restore();
  const binding=c.createLinearGradient(w*.465,0,w*.535,0);
  for(const [t,alpha] of [[0,0],[.38,.04],[.49,.20],[.50,.37],[.52,.10],[.70,.035],[1,0]])binding.addColorStop(t,'rgba(97,73,40,'+alpha+')');
  c.fillStyle=binding;c.fillRect(w*.465,24,w*.07,h-50);
  c.fillStyle='#605e49';c.textBaseline='middle';
  c.font='italic 24px Georgia';c.fillText(entry.footer[0],75,935,w*.44);
  c.textAlign='right';c.font='19px monospace';c.fillText(entry.footer[1],w-75,936,w*.44);
  // Vary individual paper fibers deterministically so revisiting a page is stable.
  let seed=932+number;
  function random(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
  for(let i=0;i<22000;i++){c.fillStyle=random()>.5?'rgba(65,53,30,.065)':'rgba(255,253,216,.17)';c.fillRect(random()*w,random()*h,1+random()*2,1);}
  return canvasTexture(canvas);
}
function profile(u){return surfaceHeight(u*W)-.03;}
function leaf(side,y,scale,texture,color='#efe0b8') {
  const p=[],uv=[],idx=[],nx=STRIPS;
  for(let j=0;j<=1;j++)for(let i=0;i<=nx;i++){
    const u=i/nx;
    p.push(side*W*u*scale,y+profile(u),((j*2-1)*D*scale)+.044*Math.sin(u*Math.PI)+.015*u*side);
    uv.push((1+side*u)/2,1-j);
  }
  // The printed surface faces up on both halves, including in the shadow pass.
  for(let i=0;i<nx;i++){
    const a=i,b=i+1,c=i+nx+1,d=c+1;
    if(side===1)idx.push(a,c,b,b,c,d);else idx.push(a,b,c,b,d,c);
  }
  const g=new T.BufferGeometry();
  g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
  const m=new T.MeshLambertMaterial({color:texture?'#ffffff':color,map:texture||null,side:T.DoubleSide});
  const o=new T.Mesh(g,m);o.receiveShadow=true;return o;
}
function flattenWhenClosed(mesh,scale){
  const flat=mesh.geometry.attributes.position.clone();
  for(let i=0;i<flat.count;i++){
    const u=Math.min(1,Math.abs(flat.getX(i))/(W*scale));
    flat.setY(i,flat.getY(i)-profile(u));
  }
  mesh.geometry.morphAttributes.position=[flat];mesh.updateMorphTargets();
  return mesh;
}
export function makeBook(root,entries,jackets) {
  const k=makeKit(root),maps=new Map(),stacks=[],blocks=[],boards=[];
  const pages=k.group(root);pages.matrixAutoUpdate=false;
  const last=Math.max(1,entries.length-1);
  function paper(index){
    if(!maps.has(index))maps.set(index,paintedPage(entries[index],index));
    return maps.get(index);
  }
  for(const s of [-1,1]){
    const stack=k.group(root);stacks.push(stack);
    // Recess the board core on all four edges so its faces clear the lighter trim.
    k.box(stack,s*boardCenter,-.342,0,6.16,.135,6.84,'#584736');
    k.box(stack,s*boardCenter,-.395,0,6.20,.055,6.89,'#73252a');
    const print=new T.PlaneGeometry(6.20,6.89);
    print.rotateX(-Math.PI/2);print.rotateZ(Math.PI);
    const board=new T.Mesh(print,new T.MeshBasicMaterial({map:jackets[s<0?0:1]}));
    board.position.set(s*boardCenter,-.4235,0);
    stack.add(board);boards.push(board);
    k.box(stack,s*3.052,-.276,0,6.18,.035,6.86,'#b68655');
    blocks.push(makePageBlock(stack,s,Math.min(12,last)));
  }
  const bendSpine=makeSpine(root);
  k.box(root,0,-.34,0,.17,.17,6.83,'#66513a');
  const ribbon=k.box(root,.31,-.402,3.50,.24,.03,.90,'#963f32');ribbon.rotation.y=-.13;
  const base=[-1,1].map(side=>flattenWhenClosed(leaf(side,0,1,paper(0)),1));
  pages.add(...base);
  const turning=[leaf(1,0,1,paper(0)),leaf(-1,0,1,paper(1))];
  for(const m of turning){
    m.material.side=T.FrontSide;
    m.castShadow=true;
  }
  pages.add(...turning);
  function display(position,closure=0,edge='front') {
    for(let i=0;i<2;i++)setFrame(stacks[i],coverFrame(i===0?-1:1,edge,closure));
    bendSpine((edge==='front'?-1:1)*Math.PI*closure);
    const progress=T.MathUtils.clamp(position/last,0,1);
    // A single shear tips the spread and every pop-up together. The board
    // stays on the table while paper transfers through the gutter.
    pages.matrix.identity();
    if(!closure){
      pages.matrix.elements[1]=(.5-progress)*blockDepth/W;
      pages.matrix.elements[13]=paperBed-.03;
    }
    pages.matrixWorldNeedsUpdate=true;
    ribbon.scale.z=1-closure;ribbon.position.z=3.50-.38*closure;
    ribbon.visible=closure<.98;seam.visible=closure<.03;
    const lo=Math.floor(position), f=position-lo;
    const moving=f>0;
    base.forEach((m,i)=>{
      const side=i===0?-1:1;
      m.material.map=paper(moving && side===1?lo+1:lo);
      const share=side===-1?progress:1-progress;
      blocks[i](share,closure);
      const pose=closure ? coverPageFrame(side,edge,closure,share)
                         : pagePose(side,false,moving?f:side===1?1:0);
      setFrame(m,pose);m.morphTargetInfluences[0]=1-pose.arch;
    });
    turning.forEach((m,i)=>{
      m.visible=moving;if(!moving)return;
      const side=i===0?1:-1, pose=pagePose(side,true,f);
      m.material.map=paper(lo+i);
      setFrame(m,pose);
      const pos=m.geometry.attributes.position;
      for(let j=0;j<=1;j++)for(let k=0;k<=STRIPS;k++){
        const u=k/STRIPS,x=side*W*u;
        const z=(j*2-1)*D+.044*Math.sin(u*Math.PI)+(.015*side+pose.edgeShift)*u;
        pos.setXYZ(j*(STRIPS+1)+k,x,sheetHeight(x,pose),z);
      }
      pos.needsUpdate=true;m.geometry.computeVertexNormals();m.geometry.computeBoundingSphere();
    });
    for(const [index,map] of maps)if(Math.abs(index-lo)>2){map.dispose();maps.delete(index);}
  }
  // A stitched binding stays visible even between the tiny printed props.
  const seam=k.group(root,0,paperBed-.03,0);
  for(let z=-3.20;z<3.2;z+=.36) {
    k.rod(seam,[-.051,.084,z],[.051,.088,z+.038],.012,'#a58d64',5);
  }
  return {display,boards,pages};
}

