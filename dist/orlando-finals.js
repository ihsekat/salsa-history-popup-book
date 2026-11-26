const paper={
  curtain:'#303139',black:'#272831',seam:'#42404a',ivory:'#eadfc4',cream:'#f6e8cc',
  violet:'#a39ac0',lilac:'#c6aeca',rose:'#ca91a4',plum:'#714667',salmon:'#d76f54',
  brass:'#d2a061',wood:'#c79a63',darkWood:'#a97548',oat:'#f1ce91',wine:'#7a4953',
  ink:'#3b3940',sign:'#283735',green:'#7ea292',pearl:'#dfd4be',
};
const crowdCoats=['#6c7c85','#a46460','#76617c','#657968','#b98a61','#6b6268','#4f606c','#98747c'];
const crowdSkin=['#b37e59','#916247','#d7a77d','#a56e4f','#c78b65','#dfb894','#886047'];
const crowdHair=['#41382f','#564336','#634737','#493b39','#765942'];
const printing = {font:'Georgia'};

function printLine(k,g,text,x,y,z,w,h,color) {
  k.label(g,text,x,y,z,w,h,{...printing,ink:color});
}

function flat(k,g,outline,color,z=0) {
  const shape=new k.THREE.Shape(outline.map(([x,y])=>new k.THREE.Vector2(x,y)));
  return k.mesh(g,new k.THREE.ShapeGeometry(shape),k.stock(color),0,0,z);
}

function fourPointSail(k,g,x,y,z,w,h,colors,angle) {
  const cloth=k.group(g,x,y,z);cloth.rotation.z=angle;
  const corners=[[-w/2,h/2],[w/2,h/2],[w/2,-h/2],[-w/2,-h/2]];
  const middles=[[0,h*.17],[w*.21,0],[0,-h*.18],[-w*.21,0]];
  for(let side=0;side<4;side++){
    const a=corners[side], b=corners[(side+1)%4], c=middles[side];
    const vertices=[];
    for(let step=0;step<10;step++){
      for(const j of [step,step+1]){
        const t=j/10,rev=1-t;
        vertices.push(rev*rev*a[0]+2*t*rev*c[0]+t*t*b[0],
          rev*rev*a[1]+2*t*rev*c[1]+t*t*b[1],0);
      }
      vertices.push(-.035*w,.04*h,.095);
    }
    const face=new k.THREE.BufferGeometry();
    face.setAttribute('position',new k.THREE.Float32BufferAttribute(vertices,3));
    face.computeVertexNormals();
    k.mesh(cloth,face,k.stock(colors[side]));
  }
}

function pleatedColumn(k,g,x,z,h,tint) {
  const shades=[tint,paper.ivory,paper.cream,paper.pearl,tint];
  const widths=[.062,.066,.077,.070,.063],offset=-.168;
  let dx=offset;
  for(let strip=0;strip<widths.length;strip++){
    const w=widths[strip],depth=strip%2?.168:.107;
    k.box(g,x+dx+w/2,h*.5,z,w+.008,h,depth,shades[strip]);
    dx+=w;
  }
  k.box(g,x,.079,z-.01,.38,.15,.19,tint);
}

function footerLamp(k,g,x,z,gel) {
  k.box(g,x,.095,z,.178,.14,.14,paper.ink);
  const face=k.disc(g,x,.13,z+.071,.052,gel,9);
  face.rotation.x=-.18;
}

function backdropWing(k,side) {
  const g=k.anchor(side*2.17,-2.42),w=4.28;
  const h=3.35,back=-.08;
  k.box(g,0,h/2,back,w,h,.12,paper.black);
  for(let i=0;i<19;i++){
    const x=-w/2+(i+.5)*w/19;
    const wStrip=w/19*.32;
    k.card(g,[[x-wStrip/2,.015],[x-wStrip*.70,h],
      [x+wStrip*.35,h],[x+wStrip*.65,.015]],i%3?paper.curtain:paper.seam,-.010,.014);
  }
  k.box(g,0,h+.022,-.044,w+.028,.075,.19,paper.curtain);
  return g;
}

function eventSign(k,g,x,y,z) {
  k.box(g,x,y,z,1.90,.90,.074,paper.sign);
  k.box(g,x,y-.44,z+.046,1.91,.030,.025,paper.green);
  const mark=k.group(g,x-.664,y,z+.054);
  k.disc(mark,0,0,0,.21,'#ab554a',18);
  const wave=[[-.211,-.01],[-.081,.01],[.078,.073],[.181,.166],[.147,.071],[.041,-.014],[-.133,-.083],[-.194,-.075]];
  flat(k,mark,wave,'#8eb5a8',.018);
  printLine(k,g,'World',x+.19,y+.238,z+.057,1.08,.183,paper.cream);
  printLine(k,g,'SALSA',x+.24,y+.012,z+.058,1.33,.368,paper.salmon);
  printLine(k,g,'Championships',x+.19,y-.243,z+.057,1.38,.166,paper.cream);
}

function scenicWall(k) {
  const left=backdropWing(k,-1),right=backdropWing(k,1);
  const lilac=['#d0bfd1','#e0d3e2','#c4afcb','#c5b3cc'];
  const amber=['#eacb95','#f2dda1','#dbc28b','#f6dfaa'];
  const pale=['#eae0c0','#e4e8c6','#dfdfba','#f6edcc'];
  fourPointSail(k,left,-1.05,1.91,.12,1.65,1.61,lilac,-.03);
  fourPointSail(k,left,1.01,2.03,.12,1.62,1.49,amber,.048);
  pleatedColumn(k,left,-2.02,.12,3.35,paper.violet);
  pleatedColumn(k,left,.02,.12,3.35,paper.lilac);
  fourPointSail(k,right,-1.0,2.35,.12,1.75,1.63,pale,-.024);
  fourPointSail(k,right,1.02,1.87,.12,1.60,1.52,lilac,.036);
  pleatedColumn(k,right,.02,.12,3.35,paper.rose);
  pleatedColumn(k,right,2.02,.12,3.35,paper.violet);
  eventSign(k,right,-1.02,.98,.125);
  for(const g of [left,right])for(const [i,x] of [-1.78,-.56,.58,1.76].entries()){
    footerLamp(k,g,x,.23,['#c993bb','#d5c77d','#d3a7ba','#a8c598'][i]);
  }
}

function stageFloor(k,side) {
  const w=3.64,d=3.96;
  const floor=k.anchor(side*(w/2+.045),-.18);
  k.box(floor,0,.092,0,w,.184,d,paper.darkWood);
  k.box(floor,0,.177,0,w,.022,d,paper.wood);
  const board=d/12;
  for(let row=0;row<12;row++){
    const z=-d*.5+board*(row+.5);
    const cut=w*(row%2?.66:.35);
    const shades=['#d2a56d','#c99a63','#d0a26b','#cba06a'];
    k.box(floor,-w/2+cut/2,.193,z,cut-.012,.010,board-.009,shades[(row+side+1)%4]);
    k.box(floor,cut/2,.193,z,w-cut-.012,.010,board-.009,shades[(row+2)%4]);
  }
  for(let i=0;i<26;i++){
    const x=-w/2+(i+.5)*w/26;
    k.card(floor,[[x-.059,.018],[x-.042,.171],[x+.039,.171],[x+.055,.018]],i%2?'#a97754':'#b2825e',d*.5+.001,.017);
  }
  k.box(floor,0,.188,d/2+.014,w,.023,.055,paper.oat);
}

function spectator(k,g,x,y,z,seed) {
  const r=(seed%11-5)*.012, shoulder=.11+(seed%4)*.016;
  const coat=crowdCoats[(seed*13)%crowdCoats.length], skin=crowdSkin[(seed*5)%crowdSkin.length];
  const hair=crowdHair[seed%crowdHair.length];
  const s=k.group(g,x,y,z);s.rotation.z=r;
  flat(k,s,[[-shoulder,-.048],[-shoulder*.9,.082],[-.062,.147],[.062,.147],[shoulder*.92,.083],[shoulder,-.048]],coat);
  flat(k,s,[[-.065,.161],[-.075,.218],[-.048,.278],[.009,.30],[.062,.277],[.079,.225],[.054,.160],[.018,.133],[-.028,.136]],skin,.008);
  if(seed%5===0){
    flat(k,s,[[-.068,.193],[-.082,.238],[-.061,.282],[-.008,.312],[.057,.289],[.082,.239],[.068,.188],[.051,.246],[-.017,.266],[-.052,.236]],hair,.015);
  }else{
    flat(k,s,[[-.074,.214],[-.074,.254],[-.050,.290],[.002,.31],[.057,.284],[.073,.253],[.039,.258],[-.001,.277],[-.047,.254]],hair,.015);
  }
}

function audienceBank(k,side) {
  const bank=k.anchor(side*4.06,.00);
  bank.rotation.y=-side*1.07;
  const groups=[0,Math.PI].map(phase=>k.animateAtRest(k.group(bank),'audience',phase));
  const width=3.60;
  for(let row=0;row<4;row++){
    const z=.37-row*.285,y=.09+row*.198;
    k.box(bank,0,y-.038,z,width,.085,.286,['#715e63','#7d6868','#615863','#645960'][row]);
    k.box(bank,0,y+.018,z+.126,width,.029,.032,'#ae927b');
    for(let i=0;i<13;i++){
      const index=(side===1?170:30)+row*13+i;
      const x=-width/2+.135+i*.276+(row%2)*.035;
      if(i===10&&row===1)continue;
      spectator(k,groups[(i+row)%2],x,y+.13+(index%3)*.014,z,index);
    }
  }
  return bank;
}

function judgingDesk(k,drawJudge) {
  const panel=k.anchor(3.19,1.96);
  panel.rotation.y=-.20;
  k.box(panel,0,.357,0,2.12,.69,.47,'#49434c');
  k.box(panel,0,.702,.006,2.20,.063,.56,paper.pearl);
  for(let i=0;i<11;i++){
    const x=-.97+i*.195;
    k.card(panel,[[x-.048,.039],[x-.027,.669],[x+.035,.669],[x+.055,.039]],i%2?'#56505b':'#62535e',.237,.017);
  }
  for(const [i,skin,coat,hair] of [[0,'#ad7958','#5e606c','#463c37'],[1,'#c89c79','#76525c','#644d41'],[2,'#946747','#556162','#3f3a36']]){
    const chair=k.group(panel,-.693+i*.696,.574,-.02);
    chair.scale.setScalar(.86);k.animateAtRest(chair,'judge',i*2.4);
    drawJudge(k,chair,0,0,skin,coat,hair);
    const scorecard=k.group(panel,-.693+i*.696,.744,.092);
    scorecard.rotation.x=-.72;
    k.box(scorecard,0,.055,0,.23,.142,.012,paper.cream);
    for(let j=0;j<2;j++)k.box(scorecard,-.011,.042+j*.037,.010,.149,.010,.007,'#997e69');
  }
  return panel;
}

export function orlandoFinals(k,drawJudge,buildCamera) {
  scenicWall(k);
  stageFloor(k,-1);stageFloor(k,1);
  audienceBank(k,-1);audienceBank(k,1);
  const camera=buildCamera(k);
  camera.position.x=-3.52;camera.position.z=2.03;camera.rotation.y=2.48;
  const panel=judgingDesk(k,drawJudge);
  return {duo:null,player:panel,prop:camera};
}
