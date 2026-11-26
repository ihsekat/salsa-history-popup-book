import * as THREE from './three.module.min.js';
import {blockDepth} from './hardcover.js';
import {paperMotion} from './paper-motion.js';

const paper = new Map();
function stock(color) {
  if (!paper.has(color)) paper.set(color, new THREE.MeshLambertMaterial({color, side:THREE.DoubleSide, flatShading:true}));
  return paper.get(color);
}
function mesh(parent, geometry, material, x=0, y=0, z=0) {
  const object = new THREE.Mesh(geometry, material);
  object.position.set(x,y,z);
  object.castShadow = true;
  object.receiveShadow = true;
  parent.add(object);
  return object;
}
function group(parent,x=0,y=0,z=0) {
  const node=new THREE.Group();
  node.position.set(x,y,z);
  parent.add(node);
  return node;
}
function box(parent,x,y,z,width,height,depth,color,rotationZ=0) {
  const object=mesh(parent,new THREE.BoxGeometry(width,height,depth),stock(color),x,y,z);
  object.rotation.z=rotationZ;
  return object;
}
function card(parent,points,color,z=0,thickness=.025) {
  const path=new THREE.Shape(points.map(([x,y])=>new THREE.Vector2(x,y)));
  return mesh(parent,new THREE.ExtrudeGeometry(path,{depth:thickness,bevelEnabled:false,curveSegments:1}),stock(color),0,0,z);
}
function disc(parent,x,y,z,radius,color,segments=32) {
  const geo=new THREE.CylinderGeometry(radius,radius,.026,segments);
  geo.rotateX(Math.PI/2);
  return mesh(parent,geo,stock(color),x,y,z);
}
function rod(parent,from,to,radius,color,sides=6) {
  const a=new THREE.Vector3(...from), b=new THREE.Vector3(...to);
  const length=b.clone().sub(a);
  const object=mesh(parent,new THREE.CylinderGeometry(radius,radius,length.length(),sides),stock(color));
  object.position.copy(a).add(b).multiplyScalar(.5);
  object.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),length.normalize());
  return object;
}
export function canvasTexture(canvas) {
  const tx=new THREE.CanvasTexture(canvas);
  tx.colorSpace=THREE.SRGBColorSpace;
  tx.anisotropy=4;
  return tx;
}
function label(parent,text,x,y,z,w,h,options={}) {
  const can=document.createElement('canvas');
  can.width=Math.min(1400,Math.max(180,Math.round(w/h*180))); can.height=180;
  const c=can.getContext('2d');
  if(options.bg) {c.fillStyle=options.bg;c.fillRect(0,0,can.width,can.height);}
  if(options.border){c.strokeStyle=typeof options.border==='string'?options.border:'#ebd4a3';c.lineWidth=4;c.strokeRect(8,8,can.width-16,can.height-16);}
  c.textAlign='center';c.textBaseline='middle';c.fillStyle=options.ink||'#302b23';
  const textScale=options.textScale??1;
  c.font='bold '+(129*textScale)+'px '+(options.font||'Georgia');
  if(options.tracking && 'letterSpacing' in c) c.letterSpacing=String(parseFloat(options.tracking)||0)+'px';
  c.fillText(text,can.width/2,can.height*.52,can.width*.94*textScale);
  return mesh(parent,new THREE.PlaneGeometry(w,h),new THREE.MeshLambertMaterial({map:canvasTexture(can),alphaTest:.35,side:THREE.DoubleSide}),x,y,z);
}
export function surfaceHeight(x) {
  const u=Math.min(1,Math.abs(x)/6.05);
  return .03+.5*blockDepth*u;
}
export function makeKit(root) {
  const anchors=[];
  const motions=[];
  function animateAtRest(node,kind,phase=0){
    node.userData.movingStock=true;
    motions.push(paperMotion(node,kind,phase));
    return node;
  }
  function anchor(x,z,baseY=0) {
    const piece=group(root,x,baseY+surfaceHeight(x),z);
    anchors.push(piece);
    return piece;
  }
  return {THREE,root,anchors,anchor,group,mesh,stock,box,card,disc,rod,label,motions,animateAtRest};
}

// Fold each assembly around its own foot. Batch the printed stock within each
// assembly so dozens of slats and windowpanes cost a single draw call.
const pooled=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide,flatShading:true});
export function batchStock(anchor) {
  anchor.updateWorldMatrix(true,true);
  const batches=new Map();
  anchor.traverse(m=>{
    if(!m.isMesh || !m.material.isMeshLambertMaterial || m.material.map)return;
    let pivot=m.parent;
    while(pivot!==anchor && !pivot.userData.movingStock)pivot=pivot.parent;
    if(!batches.has(pivot))batches.set(pivot,[]);
    batches.get(pivot).push(m);
  });
  for(const [pivot,stock] of batches)mergeStock(pivot,stock);
}

function mergeStock(pivot,stock){
  const inv=pivot.matrixWorld.clone().invert();
  const positions=[],normals=[],colors=[];
  const v=new THREE.Vector3(),n=new THREE.Vector3();
  for(const m of stock){
    const world=new THREE.Matrix4().multiplyMatrices(inv,m.matrixWorld);
    const normal=new THREE.Matrix3().getNormalMatrix(world);
    const g=m.geometry, pos=g.getAttribute('position'), norm=g.getAttribute('normal');
    // Reverse mirrored triangles when baking their transform into the stock.
    const indices=g.index,mirrored=world.determinant()<0;
    for(let j=0;j<(indices?indices.count:pos.count);j++){
      const corner=j%3;
      const index=mirrored && corner ? j+3-2*corner : j;
      const i=indices?indices.getX(index):index;
      v.fromBufferAttribute(pos,i).applyMatrix4(world); positions.push(v.x,v.y,v.z);
      n.fromBufferAttribute(norm,i).applyMatrix3(normal).normalize(); normals.push(n.x,n.y,n.z);
      colors.push(m.material.color.r,m.material.color.g,m.material.color.b);
    }
  }
  stock.forEach(m=>{m.removeFromParent(); m.geometry.dispose();});
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));
  geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  mesh(pivot,geometry,pooled);
}

