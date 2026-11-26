import * as T from './three.module.min.js';
import {asset} from './assets.js';
import {makeKit,batchStock} from './craft.js';
import {courtyard} from './cuba.js';
import {palladium} from './ny.js';
import {originsScene} from './origins.js';
import {modernScene} from './modern-scenes.js';
import {makeSceneItem} from './scene-item.js';

import {revisionScene,revisionFigures,rotateCasinoCouple} from './revision-scenes.js';

const figures={
  ...revisionFigures,
  landfall:[['duo','ship',-2.58,.25,3.05]],
  taino:[['people','taino',-1.52,1.04,1.89]],
  spain:[['player','spain',-2.03,.65,2.03],['partners','spanish-partners',1.14,1.30,2.22]],
  africa:[['duo','africa',-1.44,.92,2.19],['prop','singing-chorus',2.06,-.38,1.72]],
  son:[['duo','son',-1.30,1.23,2.54],['player','tresero',3.35,.80,1.67]],
  palladium:[['duo','mambo',-1.07,1.35,2.38],['player','timbalero',2.88,-.96,1.71,.29],['piro','killer-joe-piro',4.44,1.60,2.10,0,-1]],
  stadium:[
    ['pacheco','johnny-pacheco',-3.73,.68,2.39,.21],
    ['duo','hector-lavoe',-2.10,1.35,2.39,.21],
    ['colon','willie-colon',-.81,.72,2.33,.21],
    ['player','ray-barretto',1.21,.96,2.15,.21],
    ['mongo','mongo-santamaria',2.95,1.09,2.01,.21]
  ],
  eddie:[['duo','eddie-paper',-.98,1.18,2.42]],
  'los-angeles':[['duo','johnny-vazquez',-.99,1.23,2.38]],
  'puerto-rico':[
    ['workshops','pr-workshop',-1.59,1.42,1.91],
    ['social','puerto-rico',-4.02,-.65,2.18,.14],
    ['performances','pr-performance',2.68,-.80,2.23,.418]
  ],
  'congress-world':[['duo','congress-world',-1.04,1.17,2.37]],
  championship:[['duo','orlando-finalists',-.93,1.20,2.39,.18]],
  halftime:[['duo','halftime',-.97,1.26,2.33],['player','wedding-musicians',-3.89,-.60,1.54,.15]]
};
const pilot={son:courtyard,palladium};

function pilotScene(k,id){
  pilot[id](k);
  if(id==='palladium')return {};
  const sign=k.anchor(4.35,1.92);
  k.box(sign,0,.37,0,.062,.74,.068,'#866b47');
  k.box(sign,0,.69,0,1.17,.33,.065,'#b58347',.035);
  const tag=k.label(sign,'Oriente',0,.695,.044,1.08,.24,{ink:'#392e20',font:'Georgia'});tag.rotation.z=.035;
  return {prop:sign};
}

export async function loadStock(){
  const loader=new T.TextureLoader();
  const names=Object.values(figures).flat().map(figure=>figure[1]);
  const pairs=await Promise.all(names.map(async name=>{
    const texture=await loader.loadAsync(asset(name+'.webp'));
    texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;
    return [name,texture];
  }));
  return Object.fromEntries(pairs);
}

const tabPositions={'cuban-pachanga':-.12,'pr-performance':-.27};

function standee(k,texture,x,z,h,baseY=0,tabPosition=0,yaw=0){
  const foot=k.anchor(x,z,baseY), puppet=k.group(foot);
  foot.rotation.y=yaw;
  const w=h*texture.image.width/texture.image.height;
  const cutout=k.mesh(puppet,new T.PlaneGeometry(w,h),new T.MeshLambertMaterial({map:texture,side:T.DoubleSide,alphaTest:.42,emissive:'#251f15',emissiveIntensity:.14}),0,h/2,.025);
  cutout.customDepthMaterial=new T.MeshDepthMaterial({depthPacking:T.RGBADepthPacking,map:texture,alphaTest:.42});
  k.box(foot,w*tabPosition,.018,-.13,Math.min(w*.57,.76),.033,.40,'#c3a879');
  const support=k.group(foot,w*tabPosition,0,-.005);support.rotation.y=Math.PI/2;
  k.card(support,[[0,0],[.34,0],[0,h*.41]],'#c5b58e',-.025,.05);
  return {foot,puppet,cutout};
}
const figureMotion={
  spain:{player:'music',partners:'partnerTurn'},
  africa:{duo:'twist',prop:'music'},
  son:{duo:'sideStep',player:'music'},
  'cuban-dances':{rumba:'rumba',charanga:'music',chacha:'twist',pachanga:'twist'},
  palladium:{duo:'step',player:'twist',piro:'step'},
  fania:{founders:'twist',band:'music'},
  stadium:{pacheco:'twist',duo:'music',colon:'twist',player:'music',mongo:'music'},
  eddie:{duo:'twist'},'los-angeles':{duo:'twist'},cali:{duo:'step',team:'twist'},
  'puerto-rico':{social:'socialTurn',workshops:'twist',performances:'sideStep'},
  'congress-world':{duo:'twist'},championship:{duo:'twist'},halftime:{duo:'partnerTurn',player:'music'}
};
export function buildChapter(id,root,textures){
  const stage=new T.Group();root.add(stage);stage.visible=false;
  const k=makeKit(stage);
  const pieces=revisionFigures[id]?revisionScene(id,k):pilot[id]?pilotScene(k,id):['landfall','taino','spain','africa'].includes(id)?originsScene(id,k):modernScene(id,k);
  const cutouts={},puppets={};
  for(const [key,file,x,z,h,baseY,facing=1,yaw=0] of figures[id]){
    const {foot,cutout,puppet}=standee(k,textures[file],x,z,h,baseY,tabPositions[file],yaw);
    puppet.scale.x=facing;
    if(file==='ship')k.animateAtRest(puppet,'ship',.4);
    if(file==='taino')k.animateAtRest(puppet,'people');
    if(key==='rueda')rotateCasinoCouple(k,foot);
    const motion=figureMotion[id]?.[key];
    if(motion)k.animateAtRest(foot,motion,key==='chacha'?0:key==='pachanga'?1:x*.8);
    if(key){(cutouts[key]??=[]).push(cutout);puppets[key]??=puppet;}
  }
  k.anchors.forEach(batchStock);
  const items={};
  for(const key of new Set([...Object.keys(pieces),...Object.keys(cutouts)])){
    const anchors=[].concat(pieces[key] || []);
    const props=anchors.flatMap(anchor=>anchor.children.filter(child=>child.isMesh && child.material.vertexColors));
    for(const anchor of anchors)anchor.traverse(m=>{
      if(m.isMesh && m.parent!==anchor && m.material.vertexColors)props.push(m);
    });
    const meshes=cutouts[key] || props;
    if(!meshes.length)throw Error('Missing paper object '+id+' / '+key);
    const parts=meshes.map(mesh=>makeSceneItem(mesh,.50,.52));
    const [lead]=parts;
    const extraTargets=[...meshes.slice(1),...anchors.flatMap(anchor=>anchor.userData.hitAreas || [])];
    if(cutouts[key])extraTargets.push(...props);
    const notePin=anchors[0]?.userData.notePin;
    if(lead.mesh===props[0] && notePin)lead.pin.copy(notePin);
    items[key]={
      mesh:lead.mesh,pin:lead.pin,extraTargets,
      setGlow(level){for(const part of parts)part.setGlow(level);},
      printedAt(uv,target){return parts.find(part=>part.mesh===target)?.printedAt(uv) ?? true;}
    };
  }
  return {stage,anchors:k.anchors,items,puppets,faces:null,motions:k.motions,motionTime:0};
}
