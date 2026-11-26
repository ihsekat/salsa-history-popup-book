import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../dist/three.module.min.js';
import {makeKit,batchStock} from '../dist/craft.js';
import {paperMotion} from '../dist/paper-motion.js';
import {rotateCasinoCouple} from '../dist/revision-scenes.js';

test('batching keeps a mechanical part on its axle while its housing stays fixed',()=>{
  const kit=makeKit(new T.Group()),base=kit.anchor(3,1);
  kit.box(base,0,.5,0,1,1,1,'#cccccc');
  const wheel=kit.animateAtRest(kit.group(base,.3,1,.2),'reel');
  kit.box(wheel,.1,0,0,.2,.1,.1,'#445566');
  batchStock(base);
  assert.equal(base.children.filter(n=>n.isMesh).length,1);
  assert.equal(wheel.children.filter(n=>n.isMesh).length,1);
  const axle=wheel.getWorldPosition(new T.Vector3());
  kit.motions[0](1,1);
  assert.ok(wheel.getWorldPosition(new T.Vector3()).equals(axle));
  assert.equal(wheel.rotation.z,-Math.PI/2);
  assert.equal(base.rotation.z,0);
});

test('the courtyard partners complete one turn and return to their original pose on reduced motion',()=>{
  const couple=new T.Group();couple.rotation.y=.17;couple.position.x=2;
  const pose=paperMotion(couple,'partnerTurn');
  pose(4.45,1);assert.ok(Math.abs(couple.rotation.y-.17-Math.PI)<1e-8);
  pose(6,1);assert.ok(Math.abs(couple.rotation.y-.17-2*Math.PI)<1e-8);
  pose(6,0);assert.equal(couple.rotation.y,.17);assert.equal(couple.position.x,2);
  const son=new T.Group(),slow=paperMotion(son,'son');
  for(let i=0;i<=8;i+=.25){slow(i,1);assert.ok(Math.abs(son.rotation.z)<.05);assert.equal(son.rotation.y,0);}
});

test('the rueda couples keep their spacing and stay planted as the whole circle turns',()=>{
  const kit=makeKit(new T.Group()),a=kit.anchor(2.25,1.28),b=kit.anchor(4.59,1.30);
  const original=[a.position.clone(),b.position.clone()],distance=a.position.distanceTo(b.position);
  for(const foot of [a,b])rotateCasinoCouple(kit,foot);
  for(const pose of kit.motions)pose(2,1);
  assert.ok(Math.abs(a.position.distanceTo(b.position)-distance)<1e-8);
  assert.equal(a.position.y,original[0].y);assert.equal(b.position.y,original[1].y);
  for(const pose of kit.motions)pose(2,0);
  assert.ok(a.position.distanceTo(original[0])<1e-8);assert.ok(b.position.distanceTo(original[1])<1e-8);
});
