import * as T from './three.module.min.js';

// Trace the printed front of the piece. Only the light outside its cut edge is visible.
export function makeSceneItem(mesh,pinX,pinY) {
  const geometry=mesh.geometry;
  geometry.computeBoundingBox();
  const {min,max}=geometry.boundingBox;
  const w=max.x-min.x,h=max.y-min.y, density=120;
  const pin=new T.Vector3(min.x+w*pinX,min.y+h*pinY,max.z+.015);
  const image=mesh.material.map?.image;
  if(!image){
    const center=geometry.boundingBox.getCenter(new T.Vector3());
    const shells=[1,1.014,1.028].map(scale=>{
      const light=new T.MeshBasicMaterial({color:'#ffda95',transparent:true,depthWrite:false,
        side:scale===1?T.DoubleSide:T.BackSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
      const shell=new T.Mesh(geometry,light);
      shell.position.copy(center).multiplyScalar(1-scale);
      shell.scale.setScalar(scale);shell.userData.halo=true;mesh.add(shell);
      return shell;
    });
    function setGlow(level){
      shells.forEach((shell,index)=>{
        shell.visible=level>0;
        shell.material.opacity=level*[.14,.25,.10][index];
      });
    }
    setGlow(0);
    return {mesh,pin,setGlow,printedAt:()=>true};
  }
  const mask=document.createElement('canvas');
  mask.width=Math.max(1,Math.ceil(w*density));
  mask.height=Math.max(1,Math.ceil(h*density));
  const ink=mask.getContext('2d');
  ink.drawImage(image,0,0,mask.width,mask.height);

  const pad=24,canvas=document.createElement('canvas');
  canvas.width=mask.width+2*pad;canvas.height=mask.height+2*pad;
  const light=canvas.getContext('2d');
  light.shadowColor='#ffd887';light.shadowBlur=14;
  light.drawImage(mask,pad,pad);
  light.shadowColor='#fff0bc';light.shadowBlur=5;
  light.drawImage(mask,pad,pad);
  light.shadowBlur=0;light.shadowColor='transparent';
  light.globalCompositeOperation='destination-out';
  light.drawImage(mask,pad,pad);
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
  const glow=new T.MeshBasicMaterial({map:texture,transparent:true,opacity:.64,depthWrite:false,side:T.DoubleSide,toneMapped:false});
  const halo=new T.Mesh(new T.PlaneGeometry(w+2*pad/density,h+2*pad/density),glow);
  halo.position.set((min.x+max.x)/2,(min.y+max.y)/2,min.z-.012);
  halo.userData.halo=true;mesh.add(halo);

  const alpha=ink.getImageData(0,0,mask.width,mask.height).data;
  function printedAt(uv){
    const x=Math.min(mask.width-1,Math.max(0,Math.floor(uv.x*mask.width)));
    const y=Math.min(mask.height-1,Math.max(0,Math.floor((1-uv.y)*mask.height)));
    return alpha[4*(y*mask.width+x)+3]>60;
  }
  return {mesh,pin,printedAt,setGlow(level){halo.visible=level>0;glow.opacity=level;}};
}
