import {mainIsland,islaDeLaJuventud,foothills} from './cuba-outline.js';
import {palm} from './cuba.js';
import {PAGE_WIDTH,PAGE_DEPTH} from './fold.js';

import {surfaceHeight} from './craft.js';

const centerX=2.97,southZ=.65,northDepth=1.12;
const islands=[mainIsland,islaDeLaJuventud];

export function paintShoals(ctx,w,h){
  ctx.save();
  ctx.lineJoin='round';
  for(const {sand} of islands){
    ctx.beginPath();
    sand.forEach(([x,north],i)=>{
      const px=(1+(centerX+x)/PAGE_WIDTH)*w/2;
      const py=(1+(southZ-north*northDepth)/PAGE_DEPTH)*h/2;
      if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
    });
    ctx.closePath();
    ctx.strokeStyle='#97c5b6';ctx.lineWidth=22;ctx.stroke();
    ctx.strokeStyle='#b5d3ba';ctx.lineWidth=8;ctx.stroke();
  }
  ctx.restore();
}

export function cubanIsland(k){
  const land=k.anchor(centerX,-.90);
  // The stock follows the bowed paper so the shoreline touches the water at every cape.
  function cutSheet(outline,color,level,thickness){
    const sheet=k.card(land,outline,color,0,thickness);
    const pos=sheet.geometry.attributes.position;
    for(let i=0;i<pos.count;i++){
      const x=pos.getX(i),north=pos.getY(i),depth=pos.getZ(i);
      const y=surfaceHeight(centerX+x)-land.position.y+.014+level+depth;
      pos.setXYZ(i,x,y,southZ-north*northDepth-land.position.z);
    }
    sheet.geometry.computeVertexNormals();
  }
  for(const {sand,green} of islands){
    cutSheet(sand,'#e5c38a',0,.038);
    cutSheet(green,'#96af7a',.038,.021);
  }
  foothills.forEach((ring,i)=>cutSheet(ring,i%2?'#7f9e70':'#85a375',.059,.008));
  function site(lon,lat){
    const x=(lon+79.54)*.508,north=(lat-19.8)*.88;
    return [x,surfaceHeight(centerX+x)-land.position.y+.081,southZ-north*northDepth-land.position.z];
  }
  function upland(lon,lat,width,height,silhouette,light,shade){
    const [x,y,z]=site(lon,lat),g=k.group(land,x,y-.012,z);
    const outline=silhouette.map(([u,v])=>[u*width,v*height]);
    k.card(g,outline,light,0,.033);
    const peak=outline.reduce((a,b)=>a[1]>b[1]?a:b);
    k.card(g,[peak,...outline.slice(outline.indexOf(peak)+1),[width*.03,0],[peak[0]+width*.06,peak[1]*.47]],shade,.033,.006);
  }
  const mogotes=[[-.5,0],[-.38,.16],[-.32,.59],[-.23,.73],[-.12,.67],[-.06,.39],[.02,.46],[.08,.91],[.19,1],[.27,.9],[.33,.40],[.50,0]];
  const sierra=[[-.50,0],[-.37,.24],[-.28,.49],[-.20,.38],[-.09,.69],[.03,1],[.11,.71],[.18,.78],[.26,.46],[.36,.31],[.50,0]];
  upland(-83.68,22.59,.62,.26,mogotes,'#729572','#537e66');
  upland(-80.03,21.93,.78,.32,sierra,'#7b9d77','#56856d');
  upland(-76.63,20.20,1.04,.46,sierra,'#698c72','#436f60');
  upland(-75.27,20.39,.58,.28,mogotes,'#87a380','#668b70');
  // Small clusters of foliage give the paper hills a wooded edge.
  for(const [lon,lat,size] of [
    [-83.36,22.57,.13],[-83.07,22.65,.09],[-82.74,22.79,.10],[-81.47,22.55,.12],
    [-79.85,22.02,.13],[-79.56,21.98,.09],[-78.88,21.76,.11],[-77.68,21.16,.12],
    [-76.95,20.21,.13],[-76.27,20.25,.13],[-75.81,20.33,.10],[-75.08,20.40,.10]
  ]){
    const [x,y,z]=site(lon,lat);
    const bush=k.group(land,x,y-.003,z);bush.scale.setScalar(size);
    k.card(bush,[[-.9,0],[-.82,.35],[-.47,.46],[-.30,.69],[.05,.76],[.29,.52],[.51,.56],[.8,.31],[.9,0]],'#638b66',0,.09);
    k.card(bush,[[-.78,.06],[-.43,.38],[-.31,.33],[.02,.58],[.19,.43],[-.18,.07]],'#8aa171',.095,.015);
  }
  for(const [lon,lat,height,turn] of [
    [-82.47,22.84,.66,.4],[-82.19,22.79,.45,-.3],
    [-78.42,21.31,.87,-.30],[-78.06,21.25,.57,.45],[-75.61,20.65,.72,.12]
  ]){
    const [x,y,z]=site(lon,lat);
    const tree=palm(k,land.position.x+x,land.position.z+z,height,turn);
    tree.position.y=land.position.y+y;
    if(height>=.72)k.animateAtRest(tree,'palm',turn*2);
  }
  land.userData.notePin=new k.THREE.Vector3(...site(-79.85,21.96));
  return land;
}
