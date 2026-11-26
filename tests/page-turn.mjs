import assert from 'node:assert/strict';
import {test} from 'node:test';
import * as T from '../dist/three.module.min.js';
import {makeKit} from '../dist/craft.js';
import {foldSide, pagePose, prepareFolds, sheetHeight} from '../dist/fold.js';

function attachedCards() {
  const root=new T.Group(), k=makeKit(root);
  for(const side of [-1,1]){
    const pin=k.anchor(side*2,1,.03);
    k.box(pin,0,1.1,0,1.4,2.2,.45,'#bb806a');
  }
  return prepareFolds(k.anchors,root);
}
function vertices(face,visit){
  for(const part of face.pieces)for(const mesh of part.meshes){
    const positions=mesh.geom.attributes.position;
    for(let i=0;i<positions.count;i++)visit(positions.getX(i),positions.getY(i),positions.getZ(i));
  }
}

test('attached stock stays on its printed face and closes to paper thickness',()=>{
  const faces=attachedCards();
  for(let n=0;n<=100;n++){
    const f=n/100;
    for(const leaving of [true,false])for(const face of faces){
      const moving=leaving ? face.side===1 : face.side===-1;
      const pose=pagePose(face.side,moving,f), closure=leaving?f:1-f;
      foldSide(face,pose,closure);
      let tallest=0;
      vertices(face,(x,y)=>{
        const h=y-sheetHeight(x,pose);
        assert.ok(h>=-1e-6,'scenery crossed through its own face');
        tallest=Math.max(tallest,h);
      });
      if(closure===1)assert.ok(tallest<.011);
      if(closure===0)assert.ok(tallest>2.1);
    }
  }
});

test('front and reverse paper faces meet, rotate across the binding, and retrace on reversal',()=>{
  const faces=attachedCards();
  const radius=2, front=new T.Vector3(), back=new T.Vector3();
  for(let n=0;n<=32;n++){
    const f=n/32;
    for(const face of faces){
      const pose=pagePose(face.side,true,f);
      foldSide(face,pose,face.side===1?f:1-f);
      const v=face.side===1?front:back, x=face.side*radius;
      v.set(x,sheetHeight(x,pose),1+(.015*face.side+pose.edgeShift)*radius/6.05);
      face.group.localToWorld(v);
    }
    assert.ok(Math.abs(front.distanceTo(back)-.004)<1e-6);
    if(f===0)assert.ok(front.x>1.99);
    if(f===.5)assert.ok(front.y>2);
    if(f===1)assert.ok(front.x< -1.99);
  }
  const face=faces[1],pose=pagePose(1,true,.37);
  foldSide(face,pose,.37);
  const before=face.pieces[0].meshes[0].output.array.slice();
  foldSide(face,pagePose(1,true,.83),.83);
  foldSide(face,pose,.37);
  assert.deepEqual(face.pieces[0].meshes[0].output.array,before);
});

test('inner tabs settle first and edge tabs keep their height through mid-turn',()=>{
  const root=new T.Group(), kit=makeKit(root);
  for(const side of [-1,1]){
    for(const radius of [.65,4.9]){
      const pin=kit.anchor(side*radius,1);
      kit.box(pin,0,1,0,.4,2,.05,'#bb806a');
    }
  }
  for(const face of prepareFolds(kit.anchors,root)){
    for(const moving of [false,true]){
      const leaving=moving===(face.side===1);
      function heights(closure){
        const pose=pagePose(face.side,moving,leaving?closure:1-closure);
        foldSide(face,pose,closure);
        return face.pieces.map(piece=>{
          let height=0;
          vertices({pieces:[piece]},(x,y)=>{height=Math.max(height,y-sheetHeight(x,pose));});
          return height;
        });
      }
      const [inner,edge]=heights(.5);
      assert.ok(inner<.6 && edge>1.8,'the stagger must be visible at the halfway point');
      const [innerLate,edgeLate]=heights(.8);
      assert.ok(innerLate<.012 && edgeLate>.2,'the edge must keep folding after the inner tab is flat');
      assert.deepEqual(heights(.5),[inner,edge],'scrubbing backward must retrace the stagger');
    }
  }
});

test('buried cardstock stays behind the visible sheet at both ends of a turn',()=>{
  const faces=attachedCards();
  for(const f of [.000001,.999999]){
    const coveredSide=f<.5?1:-1;
    const chapterClosure=f<.5?1-f:f;
    const face=faces.find(candidate=>candidate.side===coveredSide);
    const under=pagePose(coveredSide,false,f),over=pagePose(coveredSide,true,f);
    foldSide(face,under,chapterClosure);
    vertices(face,(x,y)=>{
      const cap=new T.Vector3(x,sheetHeight(x,over),0)
        .applyAxisAngle(new T.Vector3(0,0,1),over.angle);
      assert.ok(under.y+y<over.y+cap.y,'folded ink must fit between neighboring sheets');
    });
    assert.equal(face.group.visible,false);
  }
});

test('mounting tabs begin at their authored depth and fold flush with the page',()=>{
  const root=new T.Group(),kit=makeKit(root),pin=kit.anchor(2,1,-.04);
  kit.box(pin,0,.5,0,.8,1,.06,'#bb806a');
  const face=prepareFolds(kit.anchors,root)[1];
  for(const closure of [0,1]){
    const pose=pagePose(1,true,closure);
    foldSide(face,pose,closure);
    const mesh=face.pieces[0].meshes[0];
    for(let i=0;i<mesh.relief.length;i++){
      const x=mesh.output.getX(i),h=mesh.output.getY(i)-sheetHeight(x,pose);
      if(closure===0)assert.ok(Math.abs(h-mesh.relief[i])<1e-6);
      else assert.ok(h>=-1e-6 && h<.002);
    }
  }
});
