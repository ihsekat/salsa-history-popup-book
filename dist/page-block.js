import * as T from './three.module.min.js';
import {PAGE_WIDTH,PAGE_DEPTH,STRIPS} from './fold.js';
import {paperBed,blockDepth} from './hardcover.js';

// The exposed cut edges fan out from the binding when open and become
// parallel sheets as the cover closes. A fractional last layer grows continuously.
export function makePageBlock(parent,side,layers){
  const vertices=[],levels=[],colors=[];
  const paper=['#d8c69c','#dfcea7','#d4c098'];
  function vertex(u,z,level,color){
    vertices.push(side*PAGE_WIDTH*u,paperBed+blockDepth*level/layers,
      z*PAGE_DEPTH+.044*Math.sin(Math.PI*u)+.015*u*side);
    levels.push(level);colors.push(color.r,color.g,color.b);
  }
  function edge(a,b,low,high,color){
    for(const [point,height] of [[a,low],[b,low],[b,high],[a,low],[b,high],[a,high]])
      vertex(point[0],point[1],height,color);
  }
  const outline=[];
  for(let i=0;i<=STRIPS;i++)outline.push([i/STRIPS,-1]);
  for(let i=STRIPS;i>=0;i--)outline.push([i/STRIPS,1]);
  if(side>0)outline.reverse();
  for(let layer=0;layer<layers;layer++){
    const fill=new T.Color(paper[layer%paper.length]),line=new T.Color('#bfa97f');
    for(let k=0;k<outline.length;k++){
      const a=outline[k],b=outline[(k+1)%outline.length];
      edge(a,b,layer,layer+.86,fill);edge(a,b,layer+.86,layer+1,line);
    }
  }
  const geometry=new T.BufferGeometry();
  const points=new T.Float32BufferAttribute(vertices,3);
  geometry.setAttribute('position',points);
  geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));
  geometry.computeVertexNormals();geometry.computeBoundingSphere();
  const mesh=new T.Mesh(geometry,new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide}));
  parent.add(mesh);mesh.receiveShadow=true;
  const perLayer=points.count/layers;
  let previousAmount,previousClosure;
  return function setBlock(share,closure){
    const amount=share*layers;
    if(amount===previousAmount && closure===previousClosure)return;
    previousAmount=amount;previousClosure=closure;mesh.visible=amount>0;
    const count=Math.ceil(amount)*perLayer;
    geometry.setDrawRange(0,count);
    for(let i=0;i<count;i++){
      const u=Math.abs(points.getX(i))/PAGE_WIDTH;
      const depth=Math.min(levels[i],amount)*blockDepth/layers;
      points.setY(i,paperBed+depth*(u+(1-u)*closure)-.0015);
    }
    points.needsUpdate=true;
  };
}
