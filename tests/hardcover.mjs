import assert from 'node:assert/strict';
import {test} from 'node:test';
import * as T from '../dist/three.module.min.js';
import {boardCenter,coverFrame,hingeHeight,replayPose,paperBed,blockDepth,coverPageFrame} from '../dist/hardcover.js';
import {makePageBlock} from '../dist/page-block.js';
import {makeKit} from '../dist/craft.js';
import {prepareFolds} from '../dist/fold.js';

const zAxis=new T.Vector3(0,0,1);

test('after two full rolls and a half roll both boards align with the resting front-cover model',()=>{
  function corner(edge,side,x,z){
    const frame=coverFrame(side,edge,1);
    const p=new T.Vector3(side*boardCenter+x,-.4235,z).applyAxisAngle(zAxis,frame.angle);
    return p.add(new T.Vector3(frame.x+(edge==='front'?-1:1)*boardCenter,frame.y-hingeHeight,0));
  }
  for(const side of [-1,1])for(const x of [-3.10,3.10])for(const z of [-3.445,3.445]){
    const from=corner('back',side,x,z),to=corner('front',side,x,z);
    assert.ok(from.clone().applyAxisAngle(zAxis,replayPose(1).angle).distanceTo(to)<1e-10);
    for(let i=0;i<=100;i++){
      const {angle,lift}=replayPose(i/100);
      const y=from.clone().applyAxisAngle(zAxis,angle).y+hingeHeight+lift;
      assert.ok(y>=-.438,'the hard cover must clear the table throughout replay');
    }
  }
  assert.equal(replayPose(0).angle,0);
  assert.equal(replayPose(1).angle,5*Math.PI);
});

test('moving the book to center its cover keeps the folding art in book coordinates',()=>{
  function figure(x){
    const root=new T.Group(),k=makeKit(root);
    root.position.set(x,-hingeHeight,0);
    k.box(k.anchor(2,1),0,1,0,.8,2,.12,'#854c39');
    return prepareFolds(k.anchors,root)[1].pieces[0].meshes[0].rest;
  }
  assert.deepEqual(figure(0),figure(-boardCenter));
});

test('paper transfers continuously between covers and meets the endpapers',()=>{
  const root=new T.Group();
  const update=[-1,1].map(side=>makePageBlock(root,side,12));
  function edgeHeight(mesh){
    const p=mesh.geometry.attributes.position;let high=paperBed-.0015;
    for(let i=0;i<mesh.geometry.drawRange.count;i++)high=Math.max(high,p.getY(i));
    return high-(paperBed-.0015);
  }
  for(const progress of [0,.01,.25,.5,.74,.99,1,.5,0]){
    update[0](progress,0);update[1](1-progress,0);
    assert.equal(root.children[0].visible,progress>0);
    assert.equal(root.children[1].visible,progress<1);
    const [left,right]=root.children.map(edgeHeight);
    assert.ok(Math.abs(left-progress*blockDepth)<1e-6);
    assert.ok(Math.abs(left+right-blockDepth)<1e-6);
  }
  for(const edge of ['front','back']){
    const side=edge==='front'?-1:1;
    const empty=coverPageFrame(side,edge,1,0),full=coverPageFrame(-side,edge,1,1);
    assert.ok(Math.abs(empty.y-full.y-.003)<1e-6);
    assert.equal(empty.arch+full.arch,0);
  }
});
