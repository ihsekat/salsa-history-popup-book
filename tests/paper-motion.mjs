import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../dist/three.module.min.js';
import {makeKit,batchStock} from '../dist/craft.js';
import {originsScene} from '../dist/origins.js';
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
});

test('the son couple steps horizontally and stays upright for the full eight-second cycle',()=>{
  const couple=new T.Group();couple.position.set(-1,.2,.8);
  const dance=paperMotion(couple,'sideStep');
  for(const [seconds,x] of [[0,-1],[2,-.84],[4,-1],[6,-1.16],[8,-1]]){
    dance(seconds,1);
    assert.ok(Math.abs(couple.position.x-x)<1e-8);
    assert.equal(couple.position.y,.2);assert.equal(couple.position.z,.8);
    assert.ok(couple.quaternion.equals(new T.Quaternion()));
  }
  dance(2,0);assert.equal(couple.position.x,-1);
});

test('the two spectator groups alternate small rises and the TV camera pans on its yoke',()=>{
  const groups=[new T.Group(),new T.Group()];
  const poses=groups.map((group,i)=>paperMotion(group,'audience',i*Math.PI));
  for(let seconds=0;seconds<=2;seconds+=.125){
    poses.forEach(pose=>pose(seconds,1));
    const [a,b]=groups.map(g=>g.position.y);
    assert.ok(a>=0 && a<=.048 && b>=0 && b<=.048);
    assert.ok(Math.abs(a+b-.048)<1e-8);
  }
  poses.forEach(pose=>pose(.5,0));assert.ok(groups.every(g=>g.position.y===0));
  const yoke=new T.Group();yoke.position.set(0,1.1,0);
  const pan=paperMotion(yoke,'cameraPan');
  pan(2,1);assert.equal(yoke.rotation.y,.20);
  pan(6,1);assert.equal(yoke.rotation.y,-.20);
  assert.deepEqual(yoke.position.toArray(),[0,1.1,0]);
  pan(2,0);assert.equal(yoke.rotation.y,0);
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

test('the güiro and scraper turn together on a planted pivot and return to rest',()=>{
  const kit=makeKit(new T.Group()),{player}=originsScene('taino',kit);
  const foot=player.position.clone();
  batchStock(player);
  assert.equal(player.children.filter(node=>node.isMesh).length,1);
  for(const [time,yaw] of [[2,.14],[6,-.14],[8,0]]){
    for(const pose of kit.motions)pose(time,1);
    assert.ok(Math.abs(player.rotation.y-yaw)<1e-8);
    assert.ok(player.position.equals(foot));
  }
  for(const pose of kit.motions)pose(2,0);
  assert.equal(player.rotation.y,0);
});
