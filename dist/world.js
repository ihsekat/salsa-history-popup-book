import * as T from './three.module.min.js';
import {chapters as entries,bookCopy} from './edition.js';
import {loadStock,buildChapter} from './sets.js';
import {asset} from './assets.js';
import {coverPageFrame,boardCenter,hingeHeight,replayPose} from './hardcover.js';
import {makeBook} from './book.js';
import {bindBookGestures} from './gestures.js';
import {prepareFolds,foldSide,pagePose,GLOW_FADE_CLOSURE} from './fold.js';

const last=entries.length-1;
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));


function printBackCover(texture){
  const sheet=document.createElement('canvas');
  sheet.width=texture.image.width;sheet.height=texture.image.height;
  const ink=sheet.getContext('2d');ink.drawImage(texture.image,0,0);
  ink.textAlign='center';ink.textBaseline='middle';
  ink.fillStyle='#f4d58c';
  ink.font='46px Georgia, serif';
  const lines=[];let line='';
  for(const word of bookCopy.back.copy[0].split(' ')){
    const next=line?line+' '+word:word;
    if(line && ink.measureText(next).width>768){lines.push(line);line=word;}
    else line=next;
  }
  lines.push(line);
  lines.forEach((value,i)=>ink.fillText(value,500,287+(i-(lines.length-1)/2)*56));
  ink.font='italic 51px Georgia, serif';ink.fillText(bookCopy.back.copy[1],500,865,780);
  texture.image=sheet;texture.needsUpdate=true;
}

export async function createWorld(canvas,callbacks){
  const renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));
  renderer.shadowMap.enabled=true;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.type=T.PCFSoftShadowMap;
  renderer.setClearColor(0,0);
  renderer.outputColorSpace=T.SRGBColorSpace;
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(34,1,.15,85);
  const roll=new T.Group(),root=new T.Group();scene.add(roll);roll.add(root);
  const loader=new T.TextureLoader();
  const [jackets,textures]=await Promise.all([
    Promise.all(['front-cover.webp','back-cover.webp'].map(async name=>{
      const map=await loader.loadAsync(asset(name));
      if(name==='back-cover.webp')printBackCover(map);
      map.colorSpace=T.SRGBColorSpace;map.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return map;
    })),loadStock()
  ]);
  const book=makeBook(root,entries,jackets);
  const hemisphere=new T.HemisphereLight('#fffaf1','#d0c4aa',1.85);scene.add(hemisphere);
  const key=new T.DirectionalLight('#fff1da',2.03);key.position.set(-4.8,9,5.2);
  key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.normalBias=.018;key.shadow.bias=-.00022;
  Object.assign(key.shadow.camera,{left:-8,right:8,top:7,bottom:-7,near:.3,far:25});scene.add(key);
  const floor=new T.Mesh(new T.PlaneGeometry(120,120),new T.ShadowMaterial({opacity:.23}));floor.rotation.x=-Math.PI/2;floor.position.y=-.438;floor.receiveShadow=true;scene.add(floor);
  const chapters=new Map();
  function chapterAt(index){
    if(!chapters.has(index)){
      const chapter=buildChapter(entries[index].id,book.pages,textures);
      chapter.hitKeys=new Map();
      for(const [key,item] of Object.entries(chapter.items)){
        chapter.hitKeys.set(item.mesh,key);
        for(const mesh of item.extraTargets || [])chapter.hitKeys.set(mesh,key);
      }
      chapter.hitMeshes=Array.from(chapter.hitKeys.keys());
      chapters.set(index,chapter);
    }
    return chapters.get(index);
  }
  function folds(chapter){
    return chapter.faces ||= prepareFolds(chapter.anchors,book.pages);
  }
  function releaseFolds(chapter){
    for(const face of chapter.faces){
      face.group.removeFromParent();
      for(const piece of face.pieces)for(const mesh of piece.meshes)mesh.geom.dispose();
    }
    chapter.faces=null;
  }
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let resting=false,paused=false,pulseTimer=0,disposed=false;
  let allowAmbient=true,onScreen=true;
  const ray=new T.Raycaster(), pointer=new T.Vector2();
  const seat=.090;
  let width=1,height=1,position=0, yaw=seat,pitch=0,wantYaw=seat,wantPitch=0, frame=0,beatStart=-2000,beatWhich='player';
  let closed=0,coverEdge='front',lift=0;
  const plane=new T.Plane(new T.Vector3(0,1,0),0);
  let lastTime=performance.now(), highlight=null;
  const projected=new T.Vector3();
  function highlightItem(key){
    if(highlight===key)return;
    highlight=key;callbacks.hoverItem?.(key);request();
  }
  function cameraPose(){
    const aspect=width/height;
    const mobile=matchMedia('(max-width: 720px) and (orientation: portrait)').matches;
    const spreadY=mobile?1.0:1.39;
    const spreadDistance=Math.max(13.45,22.95/aspect)*(mobile?1.035:1);
    const coverDistance=Math.max(15.3,12.7/aspect);
    const distance=T.MathUtils.lerp(spreadDistance,coverDistance,closed)+4.5*Math.sin(closed*Math.PI)+.78*lift;
    const targetY=T.MathUtils.lerp(spreadY,-.28,closed)+2.12*Math.sin(closed*Math.PI)+lift;
    const angle=T.MathUtils.lerp((mobile?.43:.435)+pitch,1.02,closed);
    const viewYaw=T.MathUtils.lerp(yaw,-.10,closed);
    const zoom=T.MathUtils.lerp(readerZoom,1,closed);
    if(camera.zoom!==zoom){camera.zoom=zoom;camera.updateProjectionMatrix();}
    camera.position.set(Math.sin(viewYaw)*Math.cos(angle)*distance,targetY+Math.sin(angle)*distance,Math.cos(viewYaw)*Math.cos(angle)*distance);
    camera.lookAt(0,targetY,0);camera.updateMatrixWorld();
  }
  let readerZoom=1;
  const corner=new T.Vector3();
  function placeCover(){
    const board=book.boards[coverEdge==='front'?0:1];
    const vertices=board.geometry.attributes.position;
    let left=width,right=0,top=height,bottom=0;
    for(let i=0;i<vertices.count;i++){
      corner.fromBufferAttribute(vertices,i);board.localToWorld(corner).project(camera);
      const x=(corner.x+1)*width/2,y=(1-corner.y)*height/2;
      left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
    }
    callbacks.placeCover?.(left,top,right,bottom);
  }
  function render(now=performance.now()){
    frame=0;
    const dt=Math.min(60,Math.max(0,now-lastTime));lastTime=now;
    const ease=1-Math.exp(-dt/65);
    yaw+=(wantYaw-yaw)*ease;pitch+=(wantPitch-pitch)*ease;cameraPose();
    const active=chapterAt(Math.round(position)), t=(now-beatStart)/1000;
    const moving=active.motions.length>0 && resting && allowAmbient && onScreen &&
      !reduced.matches && !paused && !document.hidden;
    if(moving || (resting && reduced.matches && active.motionTime>0)){
      active.motionTime=moving?active.motionTime+dt/1000:0;
      const strength=T.MathUtils.smoothstep(active.motionTime,0,.8);
      for(const pose of active.motions)pose(active.motionTime,strength);
      renderer.shadowMap.needsUpdate=true;
    }
    const puppet=active.puppets[beatWhich];
    if(puppet)puppet.rotation.z=(t>=0 && t<1.22)?.085*Math.exp(-2.4*t)*Math.sin(t*16):0;
    const closure=Math.max(closed,Math.abs(position-Math.round(position)));
    if(closure<GLOW_FADE_CLOSURE){
      const visibility=1-T.MathUtils.smoothstep(closure,0,GLOW_FADE_CLOSURE);
      for(const [key,item] of Object.entries(active.items)){
        const wave=(1+Math.cos(now*2*Math.PI/5200))*.5;
        const pulse=reduced.matches?.64:Math.max(0,(wave-.08)/.92);
        item.setGlow(visibility*pulse*(highlight===key?1:.88));
        if(!active.stage.visible)continue;
        item.mesh.localToWorld(projected.copy(item.pin)).project(camera);
        callbacks.placeItem?.(key,(projected.x+1)*width/2,(1-projected.y)*height/2);
      }
    }
    if(puppet && t>=0 && t<1.35)renderer.shadowMap.needsUpdate=true;
    if(closed===1 && roll.rotation.z===0)placeCover();
    renderer.render(scene,camera);
    if(resting && onScreen && !paused && !reduced.matches && !document.hidden){
      clearTimeout(pulseTimer);pulseTimer=setTimeout(request,moving?24:80);
    }
    if(Math.abs(wantYaw-yaw)>.001||Math.abs(wantPitch-pitch)>.001||(t>=0&&t<1.22))request();
  }
  function request(){if(!frame && !disposed && !paused)frame=requestAnimationFrame(render);}
  function pause(value){
    paused=value;clearTimeout(pulseTimer);
    if(value){cancelAnimationFrame(frame);frame=0;}else request();
  }
  function show(p,closure=0,edge='front',ambient=true){
    allowAmbient=ambient;
    closed=closure;coverEdge=edge;lift=0;
    roll.position.set(0,hingeHeight,0);roll.rotation.z=0;
    root.position.set((edge==='front'?-1:1)*boardCenter*closure,-hingeHeight,0);
    position=clamp(p,0,last);
    const outgoing=Math.floor(position),f=position-outgoing;
    renderer.shadowMap.needsUpdate=true;
    book.display(position,closure,edge);
    chapterAt(outgoing);
    if(f>0)chapterAt(outgoing+1);
    resting=!f && !closure;
    chapters.forEach((chapter,i)=>{
      chapter.stage.visible=resting && i===outgoing;
      // A new turn should fold the pose the reader just saw.
      if(chapter.stage.visible && allowAmbient && chapter.motions.length && chapter.faces)releaseFolds(chapter);
      const inTurn=f>0 && (i===outgoing || i===outgoing+1);
      const atCover=closure>0 && closure<1 && i===outgoing;
      if(!inTurn && !atCover){
        if(chapter.faces){
          if(Math.abs(i-outgoing)>1)releaseFolds(chapter);
          else for(const face of chapter.faces)face.group.visible=false;
        }
        return;
      }
      for(const face of folds(chapter)){
        if(atCover){
          const fraction=last?position/last:0;
          foldSide(face,coverPageFrame(face.side,edge,closure,face.side===-1?fraction:1-fraction),closure);
        }else{
          const leaving=i===outgoing,travels=leaving?face.side===1:face.side===-1;
          foldSide(face,pagePose(face.side,travels,f),leaving?f:1-f);
        }
      }
    });
    request();
  }
  // Used by the offline illustration renderer to sample the same pose and shadows.
  function renderPlate(index,seconds,{zoom=.9,strength=1}={}){
    if(!paused)pause(true);
    if(position!==index || !resting)show(index);
    readerZoom=zoom;
    for(const pose of chapterAt(index).motions)pose(seconds,strength);
    renderer.shadowMap.needsUpdate=true;
    render(2600);
  }
  function replay(t){
    const pose=replayPose(t);
    lift=pose.lift;roll.position.y=hingeHeight+lift;roll.rotation.z=pose.angle;
    renderer.shadowMap.needsUpdate=true;request();
  }
  function resize(){
    const r=canvas.getBoundingClientRect();width=Math.max(1,r.width);height=Math.max(1,r.height);
    renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();request();
  }
  const observer=new ResizeObserver(resize);observer.observe(canvas);
  const viewport=new IntersectionObserver(([entry])=>{
    onScreen=entry.isIntersecting;
    if(onScreen)request();else clearTimeout(pulseTimer);
  });
  viewport.observe(canvas);
  function targets(e){
    const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1, -(e.clientY-r.top)/r.height*2+1);
    ray.setFromCamera(pointer,camera);
    const current=chapterAt(Math.round(position));
    const point=new T.Vector3();
    let item=null;
    if(current.stage.visible){
      item=e.target.closest?.('[data-item]')?.dataset.item;
      if(!item){
        for(const hit of ray.intersectObjects(current.hitMeshes,false)){
          const key=current.hitKeys.get(hit.object),entry=current.items[key];
          if(entry.printedAt(hit.uv,hit.object)){item=key;break;}
        }
      }
    }
    const onBook=ray.ray.intersectPlane(plane,point) && Math.abs(point.x)<6.28 && Math.abs(point.z)<3.54;
    return {item,onBook:onBook || !!item};
  }
  let drag=null;
  function startDrag(e){
    drag={x:e.clientX,y:e.clientY,p:position,yaw:wantYaw,pitch:wantPitch,...targets(e),moved:false};
  }
  function moveDrag(e){
    const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.dx=dx;
    if(Math.hypot(dx,dy)>6)drag.moved=true;
    if(!drag.moved)return;
    highlightItem(null);canvas.style.cursor='grabbing';
    if(drag.onBook)callbacks.scrub(clamp(drag.p-dx/(width*.49),0,last));
    else{wantYaw=clamp(drag.yaw-dx/width*2.2,-.72,.72);wantPitch=clamp(drag.pitch+dy/height*.8,-.18,.39);request();}
  }
  function endDrag(){
    const old=drag;drag=null;
    canvas.style.cursor='grab';
    if(old.moved && old.onBook) {
      const diff=position-old.p;
      const target=Math.abs(diff)>.12?Math.round(old.p)+Math.sign(diff):Math.round(position);
      if(old.p===0 && old.dx>width*.11)callbacks.turn(-1);
      else if(old.p===last && old.dx< -width*.11)callbacks.turn(last+1);
      else callbacks.turn(clamp(target,0,last));
    } else if(!old.moved && old.item) callbacks.tap(old.item);
  }
  function cancelDrag(){
    const old=drag;drag=null;canvas.style.cursor='grab';
    if(!old.moved)return;
    if(old.onBook)callbacks.turn(Math.round(old.p));
    else{wantYaw=old.yaw;wantPitch=old.pitch;request();}
  }
  function setZoom(value){
    const zoom=clamp(value,.8,1.6);
    if(zoom===readerZoom)return;
    readerZoom=zoom;request();
  }
  function zoomBy(factor){setZoom(readerZoom*factor);}
  const stage=canvas.parentElement;
  const input=new AbortController();
  stage.addEventListener('pointerleave',()=>highlightItem(null),{signal:input.signal});
  bindBookGestures(stage,{startDrag,moveDrag,endDrag,cancelDrag,zoomBy,
    hover(e){const key=targets(e).item;highlightItem(key);canvas.style.cursor=key?'pointer':'grab';}
  },input.signal);
  function disposeInput(){disposed=true;clearTimeout(pulseTimer);input.abort();observer.disconnect();viewport.disconnect();cancelAnimationFrame(frame);frame=0;}
  function nudge(az,el){wantYaw=clamp(wantYaw+az,-.72,.72);wantPitch=clamp(wantPitch+el,-.18,.39);request();}
  function reset(){wantYaw=seat;wantPitch=0;setZoom(1);request();}
  function play(which){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;beatStart=performance.now();beatWhich=which;request();}
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)request();},{signal:input.signal});
  reduced.addEventListener('change',request,{signal:input.signal});
  resize();show(0);
  return {show,replay,pause,renderPlate,nudge,zoomBy,reset,play,render,highlightItem,disposeInput};
}

