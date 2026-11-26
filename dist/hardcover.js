import * as T from './three.module.min.js';

export const boardCenter=3.052;
export const paperBed=-.2545;
export const blockDepth=.39;
// Center the hinge between the two endpapers with a little clearance at closure.
export const hingeHeight=paperBed+(blockDepth+.003)/2;
const spineRadius=hingeHeight+.398;

export function coverFrame(side,edge,closed,height=0){
  const moving=side===(edge==='front'?-1:1);
  const angle=moving?side*Math.PI*closed:0;
  return {angle,x:(hingeHeight-height)*Math.sin(angle),
    y:hingeHeight+(height-hingeHeight)*Math.cos(angle),arch:1-closed,bow:0,offset:0,edgeShift:0};
}

export function coverPageFrame(side,edge,closed,share){
  const pose=coverFrame(side,edge,closed,paperBed+share*blockDepth*closed);
  pose.arch=2*share*(1-closed);
  return pose;
}

export function makeSpine(root){
  const steps=20,positions=[],indices=[];
  for(let i=0;i<=steps;i++)positions.push(0,0,-3.439,0,0,3.439);
  positions.push(0,hingeHeight,-3.439,0,hingeHeight,3.439);
  const cap=2*(steps+1);
  for(let i=0;i<steps;i++){
    const a=2*i;
    indices.push(a,a+1,a+2,a+1,a+3,a+2,cap,a,a+2,cap+1,a+3,a+1);
  }
  const geometry=new T.BufferGeometry(),points=new T.Float32BufferAttribute(positions,3);
  geometry.setAttribute('position',points);geometry.setIndex(indices);
  const mesh=new T.Mesh(geometry,new T.MeshLambertMaterial({color:'#701e25',side:T.DoubleSide}));
  mesh.receiveShadow=true;mesh.castShadow=true;mesh.frustumCulled=false;root.add(mesh);
  let previous;
  return function bend(angle){
    if(angle===previous)return;
    previous=angle;mesh.visible=!!angle;
    if(!angle)return;
    for(let i=0;i<=steps;i++){
      const a=angle*i/steps,x=spineRadius*Math.sin(a),y=hingeHeight-spineRadius*Math.cos(a);
      points.setXYZ(2*i,x,y,-3.439);points.setXYZ(2*i+1,x,y,3.439);
    }
    points.needsUpdate=true;geometry.computeVertexNormals();geometry.computeBoundingSphere();
  };
}

export function replayPose(t){
  // Two full rolls and one half roll exchange the front and back of the closed volume.
  const ease=t*t*(3-2*t),angle=5*Math.PI*ease;
  const ramp=Math.min(1,t/.19,(1-t)/.19);
  const rise=ramp*ramp*(3-2*ramp);
  return {angle,lift:3.5*rise+.30*Math.sin(Math.PI*t)**2};
}
