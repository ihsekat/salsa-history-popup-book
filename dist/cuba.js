const cream='#ffe7ba', mustard='#e5ac54', pine='#28574d', jade='#4d8574', rose='#c96947';

function mountain(k,x,z,w,h,colors) {
  const g=k.anchor(x,z);
  g.userData.hingedAtSpine=true;
  k.card(g,[[-w/2,0],[-w*.28,h*.39],[-w*.12,h*.8],[w*.018,h],[w*.16,h*.64],[w*.29,h*.58],[w/2,0]],colors[0],0,.045);
  k.card(g,[[w*.018,h],[-w*.11,h*.21],[-w*.03,h*.34],[w*.08,0],[w/2,0],[w*.29,h*.58],[w*.16,h*.64]],colors[1],.046,.008);
}
function cloud(k,x,z,y,s) {
  const g=k.anchor(x,z);
  k.rod(g,[0,0,0],[0,y,0],.014,'#c3b798');
  const p=k.group(g,0,y,.02);p.scale.setScalar(s);
  k.card(p,[[-.66,0],[-.58,.14],[-.40,.16],[-.29,.34],[-.03,.34],[.09,.53],[.37,.50],[.48,.29],[.51,.18],[.68,.14],[.77,0]],cream,0,.03);
  return g;
}
function palm(k,x,z,h,rotation=0) {
  const g=k.anchor(x,z);g.rotation.y=rotation;
  const bend=.17*h;
  for(let i=0;i<9;i++){
    const t=i/9, u=(i+1)/9;
    k.rod(g,[bend*t*t,h*t,0],[bend*u*u,h*u,0],h*(.035-.014*t),i%3===0?'#9e7147':'#ad8753');
  }
  const top=k.group(g,bend,h,0);
  for(let i=0;i<8;i++){
    const leaf=k.group(top); leaf.rotation.y=i*Math.PI/4+.12;
    leaf.rotation.z=(i%3-1)*.16; leaf.scale.setScalar(h*.39);
    k.card(leaf,[[0,0],[.23,.33],[.57,.45],[.91,.34],[1.27,.05],[1.51,-.4],[1.2,-.2],[1.16,-.03],[1.10,-.15],[.92,-.03],[.85,.13],[.80,.03],[.56,.17],[.26,.16]],i%2?'#41755c':'#659268',0,.016);
    k.card(leaf,[[0,0],[.40,.25],[.75,.30],[1.12,.15],[1.51,-.4],[1.27,.05],[.91,.34],[.57,.45],[.23,.33]],i%2?'#83a66b':'#719962',.02,.003);
  }
  return g;
}
function arch(k,g,cx,y,z,rise,r,trim) {
  const outside=[],inside=[];
  for(let j=0;j<=12;j++){
    const a=j*Math.PI/12;outside.push([cx+Math.cos(a)*r,y+rise+Math.sin(a)*r]);
    inside.push([cx+Math.cos(a)*(r-trim),y+rise+Math.sin(a)*(r-trim)]);
  }
  k.card(g,outside.concat(inside.reverse()),cream,z,.045);
  for(const sign of [-1,1]) {
    const px=cx+sign*(r-trim*.5);
    k.box(g,px,y+rise/2,z+.035,trim,rise,.15,cream);
    k.box(g,px,y+.10,z+.06,trim*1.75,.20,.20,'#e8c693');
    k.box(g,px,y+rise,z+.075,trim*1.75,.11,.22,'#ffe7b9');
  }
}
function shutters(k,g,x,y,z,w,h){
  k.box(g,x,y,z,w+.10,h+.12,.048,'#e4bf8e');
  k.box(g,x,y,z+.032,w,h,.05,'#245b52');
  for(let i=0;i<7;i++) k.box(g,x,y-h*.38+i*h*.128,z+.065,w*.83,.028,.024,'#669484');
  k.box(g,x,y,z+.072,.03,h,.025,'#c5af7e');
}
function veranda(k) {
  const g=k.anchor(2.2,-1.10); g.rotation.y=-.065;
  k.box(g,0,.13,.0,4.08,.26,1.56,'#ce9c6b');
  k.box(g,0,.235,.02,4.20,.09,1.67,'#f7d5a2');
  k.box(g,0,1.51,-.26,3.80,2.53,.76,'#d58c5c');
  k.box(g,0,1.62,.14,3.69,2.41,.055,'#e2a16b');
  shutters(k,g,-1.16,1.51,.19,.65,1.17); shutters(k,g,1.16,1.51,.19,.65,1.17);
  k.box(g,0,1.27,.20,.78,2.02,.08,'#28564e');
  k.box(g,0,1.24,.256,.58,1.74,.02,'#396d60');
  for(const x of [-.16,.16]) for(const y of [.82,1.61]) k.box(g,x,y,.282,.20,.59,.02,'#2c594f');
  for(const x of [-1.19,0,1.19]) arch(k,g,x,.28,.76,1.30,.62,.135);
  k.box(g,0,2.35,.75,3.80,.29,.12,'#f3cd96');
  for(let j=0;j<16;j++) k.disc(g,-1.76+j*.235,2.37,.833,.05,j%2?'#a85c40':'#ca8052',4);
  const roof=k.group(g,0,2.42,0);
  for(const side of [-1,1]) {
    const slope=k.group(roof,0,.30,.03+side*.52);
    slope.rotation.x=side*.49;
    k.box(slope,0,0,0,4.20,.11,1.19,rose);
    for(let i=0;i<21;i++) k.box(slope,-1.97+i*.197,.067,0,.038,.047,1.19,i%3?'#e28a58':'#b55a42');
    for(const zz of [-.28,.10,.46]) k.box(slope,0,.089,zz,4.16,.015,.016,'#bd6546');
  }
  k.box(g,0,3.01,.03,4.28,.105,.13,'#ebad74');
  k.box(g,0,2.42,.99,4.25,.11,.105,cream);
  for(const x of [-2.06,2.06]){
    const side=k.group(roof,x,0,0);side.rotation.y=Math.PI/2;
    k.card(side,[[-1.01,0],[0,.58],[1.01,0]],'#e8b17e');
  }
  for(const x of [-1.62,1.62]){
    k.rod(g,[x,2.24,.76],[x,1.9,.77],.015,'#87764f');
    k.disc(g,x,1.83,.77,.095,'#f1bb67',8);
  }
  const portico=k.group(g,0,2.44,1.00);
  k.card(portico,[[-.99,0],[0,.67],[.99,0]],'#eab682',-.10,.20);
  k.card(portico,[[-.73,.07],[0,.56],[.73,.07]],'#be784f',.108,.02);
  k.card(portico,[[-.48,.105],[0,.43],[.48,.105]],'#e9ab70',.13,.014);
  k.disc(portico,0,.22,.153,.067,cream,8);
  for(const side of [-1,1]){
    k.rod(portico,[side*1.04,.00,.155],[0,.70,.155],.056,cream,4);
    k.rod(portico,[side*1.05,.065,.12],[0,.746,.12],.060,'#b66346',4);
  }
  for(let n=0;n<2;n++){
    const side=n===0?-1:1, pot=k.group(g,side*1.76,.278,.79);
    k.card(pot,[[-.12,0],[-.165,.28],[.165,.28],[.12,0]],'#b25c40',.0,.20);
    k.box(pot,0,.284,.10,.36,.06,.23,'#d18759');
    for(let j=0;j<10;j++){
      const a=.4+j*2.39, xx=Math.sin(a)*.13, yy=.35+.10*(j%4);
      k.rod(pot,[.004,.28,.08],[xx,yy,.1],.012,'#477551',4);
      k.disc(pot,xx,yy,.13,j%3===0?.056:.045,j%3===0?'#a84f50':'#537d52',5);
    }
  }
  return g;
}
function hut(k,x,z,size,color) {
  const g=k.anchor(x,z);g.rotation.y=.12;
  const h=k.group(g);h.scale.setScalar(size);
  k.box(h,0,.61,0,1.44,1.22,.64,color);
  k.card(h,[[-.82,1.19],[.04,1.73],[.84,1.19]],'#cb7653',-.34,.71);
  k.rod(h,[-.84,1.19,.39],[.04,1.75,.39],.052,cream,4);k.rod(h,[.04,1.75,.39],[.87,1.18,.39],.052,cream,4);
  k.box(h,-.36,.46,.35,.34,.92,.05,pine);shutters(k,h,.29,.71,.35,.38,.52);
}
function shrub(k,x,z,s,flower=false) {
  const g=k.anchor(x,z);g.scale.setScalar(s);
  for(let i=0;i<7;i++){
    const leaf=k.group(g);leaf.rotation.y=i*.94; leaf.rotation.z=(i-3)*.23;
    k.card(leaf,[[-.04,0],[-.13,.32],[-.07,.57],[.03,.76],[.11,.40],[.10,.15]],i%2?jade:pine,0,.016);
    if(flower && i%2===0) k.disc(leaf,0,.69,.022,.08,i%4?mustard:rose,5);
  }
  return g;
}
export function courtyard(k){
  mountain(k,-4.45,-2.96,3.0,1.68,['#75978a','#607f77']);
  mountain(k,-2.14,-3.06,4.60,2.65,['#87a694','#6b8e83']);
  mountain(k,.10,-2.92,4.22,1.95,['#608a7f','#4f786f']);
  mountain(k,3.92,-2.97,3.45,1.78,['#759589','#547e70']);
  const sun=k.anchor(-1.18,-2.99);sun.position.y-=.41;
  k.rod(sun,[0,0,0],[0,3,0],.013,'#c1af81');k.disc(sun,0,3.30,0,.49,'#f0bb57',42);
  for(let i=0;i<11;i++){
    const a=i/11*Math.PI*2;
    k.rod(sun,[.56*Math.cos(a),3.30+.56*Math.sin(a),.015],[.68*Math.cos(a),3.30+.68*Math.sin(a),.015],.013,'#edc26d',4);
  }
  cloud(k,-3.30,-2.96,2.06,.70); cloud(k,3.95,-2.96,3.46,.79);
  hut(k,-3.40,-1.85,.95,'#daac70');hut(k,-4.54,-1.99,.79,'#70a292');
  veranda(k);palm(k,4.80,-1.92,3.06,.9);palm(k,-4.45,-.81,2.42,.31);
  for(const [x,z,s,f] of [[-5.20,.12,.80,false],[-4.43,1.36,.56,true],[-2.52,-1.67,.70,false],[4.89,.65,.80,true],[3.94,1.85,.53,false],[.62,-1.39,.45,true]]) shrub(k,x,z,s,f);
}


export {arch,cloud,mountain,palm,shrub};
