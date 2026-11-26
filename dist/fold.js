import * as T from './three.module.min.js';
import {surfaceHeight} from './craft.js';

export const PAGE_WIDTH = 6.05, PAGE_DEPTH = 3.33, STRIPS = 24;
const STACK_GAP = .003, FACE_OFFSET = .002;
const MAX_FOLDED_RELIEF = .009;
export const GLOW_FADE_CLOSURE = .035;
const base = surfaceHeight(0);
const arch = [], bow = [];
for (let i=0; i<=STRIPS; i++) {
  arch.push(surfaceHeight(PAGE_WIDTH*i/STRIPS)-base);
  bow.push(.11*Math.sin(Math.PI*i/STRIPS));
}
function clamp(v,lo,hi){return Math.max(lo,Math.min(hi,v));}

// Vertices in the art and in the sheet sample the same piecewise-linear paper.
function sample(table,x) {
  const u=Math.min(STRIPS,Math.abs(x)*STRIPS/PAGE_WIDTH);
  const i=Math.min(STRIPS-1,Math.floor(u));
  return table[i]+(table[i+1]-table[i])*(u-i);
}
export function pagePose(side, moving, f) {
  const angle=moving ? Math.PI*(side===1 ? f : f-1) : 0;
  const cosine=Math.cos(angle);
  return {
    angle, moving, arch:cosine, bow:moving ? side*Math.sin(Math.PI*f) : 0,
    y:moving ? base-FACE_OFFSET*Math.abs(cosine) : base-STACK_GAP*(side===1 ? 1-f : f),
    offset:moving ? FACE_OFFSET : 0,
    edgeShift:moving ? .015*(Math.cos(Math.PI*f)-side) : 0
  };
}
export function sheetHeight(x,pose) {
  return sample(arch,x)*pose.arch+sample(bow,x)*pose.bow+pose.offset;
}
export function setFrame(object,pose){
  object.rotation.z=pose.angle;
  object.position.x=pose.x??0;
  object.position.y=pose.y;
}

// Clip long triangles at the paper's creases. A wide skyline or character can
// then lie flush with the curved leaf, including the curved strip at the spine.
function cut(polygon,x,keepRight) {
  const out=[];
  let a=polygon[polygon.length-1], aIn=keepRight ? a[0]>=x : a[0]<=x;
  for (const b of polygon) {
    const bIn=keepRight ? b[0]>=x : b[0]<=x;
    if(aIn!==bIn) {
      const t=(x-a[0])/(b[0]-a[0]);
      out.push(a.map((value,i)=>value+t*(b[i]-value)));
    }
    if(bIn)out.push(b);
    a=b;aIn=bIn;
  }
  return out;
}
function splitGeometry(mesh,relativeToRoot,bySide,anchorSide,emit) {
  const geo=mesh.geometry, pos=geo.attributes.position, uv=geo.attributes.uv, col=geo.attributes.color;
  const p=new T.Vector3();
  const vertices=Array.from({length:pos.count},(_,i)=>{
    p.fromBufferAttribute(pos,i).applyMatrix4(relativeToRoot);
    return [p.x,p.y,p.z,uv?.getX(i)??0,uv?.getY(i)??0,col?.getX(i)??1,col?.getY(i)??1,col?.getZ(i)??1];
  });
  const indices=geo.index?.array, count=indices?.length??pos.count, step=PAGE_WIDTH/STRIPS;
  const order=relativeToRoot.determinant()<0 ? [0,2,1] : [0,1,2];
  for(let i=0;i<count;i+=3){
    let poly=order.map(j=>vertices[indices?indices[i+j]:i+j]);
    const min=Math.min(...poly.map(v=>v[0])),max=Math.max(...poly.map(v=>v[0]));
    for(let j=Math.floor(min/step)+1; j*step<max-1e-7; j++){
      const x=j*step;
      const left=cut(poly,x,false);
      emitPolygon(left);
      poly=cut(poly,x,true);
    }
    emitPolygon(poly);
  }
  function emitPolygon(poly) {
    if(poly.length<3)return;
    const side=bySide ? (poly.reduce((sum,v)=>sum+v[0],0)<0 ? -1 : 1) : anchorSide;
    for(let j=1;j<poly.length-1;j++)emit(side,poly[0],poly[j],poly[j+1]);
  }
}
function prepareMesh(original,points,faceGroup){
  const geom=new T.BufferGeometry(), positions=[],uv=[],colors=[];
  for(const v of points){
    positions.push(v[0],v[1],v[2]);
    if(original.geometry.attributes.uv)uv.push(v[3],v[4]);
    if(original.geometry.attributes.color)colors.push(v[5],v[6],v[7]);
  }
  const rest=new Float32Array(positions);
  const output=new T.BufferAttribute(rest.slice(),3).setUsage(T.DynamicDrawUsage);
  geom.setAttribute('position',output);
  if(uv.length)geom.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  if(colors.length)geom.setAttribute('color',new T.Float32BufferAttribute(colors,3));
  const mesh=new T.Mesh(geom,original.material);
  mesh.castShadow=original.castShadow;mesh.receiveShadow=original.receiveShadow;
  mesh.customDepthMaterial=original.customDepthMaterial;
  mesh.frustumCulled=false;
  faceGroup.add(mesh);
  return {geom,rest,output};
}

// At rest the authored model handles musician taps and dance animation. During
// a turn its paper pieces use the same face transform as their printed leaf.
export function prepareFolds(anchors,root) {
  const sides=[-1,1].map(side=>({side,group:new T.Group(),pieces:[],glows:[]}));
  sides.forEach(s=>{s.group.visible=false;root.add(s.group);});
  root.updateWorldMatrix(true,false);
  const inverseRoot=root.matrixWorld.clone().invert();
  for(const anchor of anchors){
    anchor.updateWorldMatrix(true,true);
    const pieces=sides.map(()=>({meshes:[],minX:Infinity,maxX:-Infinity,minZ:Infinity,maxZ:-Infinity,maxHeight:0}));
    anchor.traverse(m=>{
      if(!m.isMesh || m.userData.hitOnly)return;
      const relativeToRoot=new T.Matrix4().multiplyMatrices(inverseRoot,m.matrixWorld);
      if(m.userData.halo){
        const face=sides[anchor.position.x<0?0:1];
        const glow=new T.Mesh(m.geometry,m.material);
        glow.matrixAutoUpdate=false;glow.matrix.copy(relativeToRoot);
        glow.matrix.elements[13]-=base;
        glow.visible=false;face.group.add(glow);face.glows.push(glow);
        return;
      }
      const lists=[[],[]];
      splitGeometry(m,relativeToRoot,anchor.userData.hingedAtSpine,Math.sign(anchor.position.x)||1,(side,a,b,c)=>{
        lists[side===1?1:0].push(a,b,c);
      });
      lists.forEach((list,i)=>{
        if(!list.length)return;
        const part=pieces[i];
        for(const [x,y,z] of list){
          part.minX=Math.min(part.minX,x);part.maxX=Math.max(part.maxX,x);
          part.minZ=Math.min(part.minZ,z);part.maxZ=Math.max(part.maxZ,z);
          part.maxHeight=Math.max(part.maxHeight,y-base-sample(arch,x));
        }
        part.meshes.push(prepareMesh(m,list,sides[i].group));
      });
    });
    pieces.forEach((piece,i)=>{
      if(!piece.meshes.length)return;
      const side=sides[i].side;
      const hingeZ=anchor.position.z;
      // Fold the illustrated front face upward wherever the page has room.
      // Scenery at the back edge hinges forward into the available depth.
      const forward=PAGE_DEPTH+hingeZ>=piece.maxHeight*.44 ? -1 : 1;
      const near=side===1?.014:-PAGE_WIDTH+.014, far=side===1?PAGE_WIDTH-.014:-.014;
      const pin=clamp(anchor.position.x,near,far);
      // Outermost tabs sit just inside the trimmed edge of the book. Keep
      // each assembly on one clock so its details stay attached as it folds.
      const radius=Math.min(1,Math.abs(pin)/(PAGE_WIDTH*.85));
      const edgeWeight=radius*radius*(3-2*radius);
      piece.foldStart=.035+.345*edgeWeight;
      piece.foldEnd=.58+.38*edgeWeight;
      const scaleLeft=piece.minX<pin ? Math.min(1,(pin-near)/(pin-piece.minX)) : 1;
      const scaleRight=piece.maxX>pin ? Math.min(1,(far-pin)/(piece.maxX-pin)) : 1;
      const landingEdge=forward===1 && hingeZ<-2.1 ? -1.52 : forward*(PAGE_DEPTH-.035);
      const reach=Math.min(1,(landingEdge-hingeZ)*forward/Math.max(.01,piece.maxHeight));
      const depthRange=Math.max(.01,piece.maxZ-piece.minZ);
      for(const mesh of piece.meshes){
        const count=mesh.rest.length/3;
        mesh.flatX=new Float32Array(count);mesh.relief=new Float32Array(count);mesh.layer=new Float32Array(count);
        for(let j=0;j<count;j++){
          const x=mesh.rest[3*j],y=mesh.rest[3*j+1],z=mesh.rest[3*j+2];
          mesh.flatX[j]=pin+(x-pin)*(x<pin?scaleLeft:scaleRight);
          mesh.relief[j]=y-base-sample(arch,x);
          // Give front print and back print distinct positions in the folded stack.
          const depth=(z-piece.minZ)/depthRange;
          mesh.layer[j]=.002+.002*(hingeZ+PAGE_DEPTH)/(2*PAGE_DEPTH)+.005*(forward===1?1-depth:depth);
        }
      }
      Object.assign(piece,{hingeZ,forward,reach});
      sides[i].pieces.push(piece);
    });
  }
  return sides;
}
export function foldSide(face,pose,closure) {
  setFrame(face.group,pose);
  // Keep near-gutter overhangs inside the narrowing space between the leaves.
  const opening=(1-closure)*Math.PI;
  face.group.visible=opening*PAGE_WIDTH>STACK_GAP*.5;
  for(const glow of face.glows)glow.visible=closure<GLOW_FADE_CLOSURE;
  const wedge=opening<Math.PI/2 ? Math.tan(opening) : Infinity;
  for(const part of face.pieces){
    const {hingeZ,forward,reach}=part;
    const t=clamp((closure-part.foldStart)/(part.foldEnd-part.foldStart),0,1);
    const angle=t*t*(3-2*t)*Math.PI/2;
    const down=Math.sin(angle),up=Math.cos(angle);
    for(const m of part.meshes){
      const out=m.output.array, rest=m.rest;
      for(let i=0,j=0;i<rest.length;i+=3,j++){
        const x=rest[i]+(m.flatX[j]-rest[i])*down;
        const dz=rest[i+2]-hingeZ,h=m.relief[j];
        const z=hingeZ+dz*up+forward*Math.max(0,h)*down*reach;
        // Preserve a mounting tab already sunk into the paper at rest. Bring
        // it flush as it closes, without letting the raised illustration sink.
        const tabDepth=Math.min(0,h)*up*(1-down);
        const openHeight=Math.max(tabDepth,h*up-forward*dz*down*up*up);
        const clearance=Number.isFinite(wedge) ? Math.abs(x)*wedge : Infinity;
        // Compress the printed layers into the remaining gap as the opposite
        // leaf lands. Keep their relative order even in the narrowest part.
        const raised=Math.min(openHeight,clearance);
        const printRoom=STACK_GAP*.45+Math.max(0,clearance*.75-raised);
        const lift=raised+m.layer[j]*down*Math.min(1,printRoom/MAX_FOLDED_RELIEF);
        out[i]=x;
        out[i+1]=sheetHeight(x,pose)+lift;
        out[i+2]=z+pose.edgeShift*Math.min(1,Math.abs(x)/PAGE_WIDTH);
      }
      m.output.needsUpdate=true;m.geom.computeVertexNormals();
    }
  }
}

