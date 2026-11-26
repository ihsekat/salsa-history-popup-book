import {surfaceHeight} from './craft.js';

const paper = {
  cream:'#f7dfb2', pale:'#e6cfa5', tan:'#c6a677', ochre:'#d89f50',
  yellow:'#eabd67', honey:'#b77d43', coral:'#c77356', rust:'#ab5644',
  rose:'#d79c83', plum:'#714858', wine:'#65433c', navy:'#29494c',
  ink:'#2e3936', slate:'#476368', blue:'#719299', sea:'#659285',
  leaf:'#57816a', mint:'#a2b39a', timber:'#986746', chalk:'#f8e9c9'
};

const casinoFloor={x:3.43,z:1.79,top:.069};
function casinoCouple(file,dx,dz,height,yaw){
  const x=casinoFloor.x+dx;
  const y=casinoFloor.top+surfaceHeight(casinoFloor.x)-surfaceHeight(x);
  return ['rueda',file,x,casinoFloor.z+dz,height,y,1,yaw];
}

export const revisionFigures={
  'cuban-dances':[
    ['rumba','cuban-rumba',-3.64,-1.38,1.92,.10],
    ['charanga','cuban-charanga',1.52,-1.72,1.78,.28],
    ['chacha','cuban-chacha',-2.95,1.65,1.88,.075],
    ['pachanga','cuban-pachanga',-.89,2.00,1.79,.075],
    casinoCouple('rueda-ochre',-.05,.65,1.64,.05),
    casinoCouple('rueda-teal',-1.18,-.51,1.63,.34),
    casinoCouple('rueda-coral',1.16,-.49,1.63,-.34)
  ],
  fania:[
    ['founders','fania-founders',-2.13,.11,2.22],
    ['band','fania-ensemble',2.46,-.69,1.71,.26]
  ],
  cali:[
    ['duo','cali-couple',-1.15,1.12,2.28],
    ['team','cali-team',2.83,-.70,1.68,.32]
  ]
};

function print(k,g,text,x,y,z,w,h,ink=paper.ink,font='Georgia'){
  return k.label(g,text,x,y,z,w,h,{ink,font});
}

function spin(k,g,x,y,z,r,ink,segments=36){
  return k.disc(g,x,y,z,r,ink,segments);
}

function sleeveDisc(k,g,x,y,z,r,labelInk){
  spin(k,g,x,y,z,r,paper.ink,48);
  spin(k,g,x,y,z+.021,r*.85,paper.slate,48);
  spin(k,g,x,y,z+.039,r*.822,paper.ink,48);
  spin(k,g,x,y,z+.058,r*.69,paper.slate,48);
  spin(k,g,x,y,z+.076,r*.676,paper.ink,48);
  spin(k,g,x,y,z+.093,r*.32,labelInk,28);
  spin(k,g,x,y,z+.114,r*.047,paper.cream,12);
}

function fanlight(k,g,x,y,z,r){
  const group=k.group(g,x,y,z);
  const fan=[[0,0]];
  for(let n=0;n<=12;n++){
    const theta=n*Math.PI/12;
    fan.push([r*Math.cos(theta),r*Math.sin(theta)]);
  }
  k.card(group,fan,paper.cream,0,.055);
  const inside=k.group(group,0,.008,.066);inside.scale.set(.87,.87,1);
  k.card(inside,fan,paper.sea,0,.019);
  for(let j=1;j<8;j++){
    const a=j*Math.PI/8;
    k.rod(group,[0,0,.104],[r*.86*Math.cos(a),r*.86*Math.sin(a),.104],.016,j%2?paper.cream:paper.pale,4);
  }
  k.box(group,0,0,.09,2*r+.04,.053,.095,paper.cream);
}

function pottedPalm(k,parent,x,y,z,s){
  const g=k.group(parent,x,y,z);g.scale.setScalar(s);
  k.card(g,[[-.19,0],[.19,0],[.25,.38],[-.25,.38]],paper.rust,-.07,.22);
  k.box(g,0,.39,.043,.54,.084,.29,paper.coral);
  for(let j=0;j<8;j++){
    const f=k.group(g,0,.42,0);
    f.rotation.y=(j%3-1)*.49;f.rotation.z=(j-3.5)*.285;
    const h=.69+.11*(j%3);
    k.card(f,[[0,0],[-.092,h*.36],[-.113,h*.66],[-.035,h*.92],[.073,h],[.102,h*.71],[.064,h*.35]],j%2?paper.leaf:paper.sea,j*.008,.015);
    k.rod(f,[0,.02,.033],[.035,h*.78,.033],.010,paper.mint,4);
  }
}

function rumbaPatio(k){
  const g=k.anchor(-3.49,-2.47);
  k.card(g,[[-2.24,0],[-2.24,1.69],[-1.98,1.72],[-1.98,2.04],[-.84,2.04],[-.84,2.27],[.71,2.27],[.71,1.96],[2.04,1.96],[2.04,0]],'#d69c76',-.10,.27);
  k.box(g,-.07,1.98,.085,4.28,.095,.31,paper.pale);
  for(const sx of [-1.42,1.32]){
    k.box(g,sx,1.06,.18,.79,1.16,.16,paper.pale);
    k.box(g,sx,1.05,.275,.66,1.04,.067,paper.navy);
    for(let j=0;j<6;j++)k.box(g,sx,.65+j*.157,.323,.59,.067,.038,paper.sea);
    k.box(g,sx,1.05,.343,.035,1.02,.031,paper.cream);
    k.box(g,sx,.45,.25,.95,.088,.26,paper.honey);
  }
  k.box(g,-.06,1.13,.19,.87,1.47,.09,paper.leaf);
  fanlight(k,g,-.06,1.68,.20,.44);
  k.box(g,-.07,2.17,.147,1.42,.36,.085,paper.coral);
  print(k,g,'RUMBA',-.07,2.175,.198,1.25,.295,paper.chalk);
  k.box(g,-.06,.043,.55,4.44,.086,2.27,'#c99870');
  for(let i=0;i<9;i++)k.box(g,-2.04+i*.50,.090,.52,.019,.012,2.14,'#ab805d');
  for(let j=0;j<3;j++)k.box(g,-.06,.093,.02+j*.53,4.34,.013,.016,'#ab805d');
  pottedPalm(k,g,-1.90,.105,.65,.87);
}

function charangaPavilion(k){
  const g=k.anchor(2.06,-2.42);g.scale.x=.84;
  k.card(g,[[-2.22,0],[-2.22,1.83],[-1.76,2.12],[-1.45,2.12],[-1.04,2.43],[-.48,2.55],[0,2.74],[.47,2.55],[1.05,2.43],[1.45,2.12],[1.76,2.12],[2.22,1.83],[2.22,0]],paper.blue,0,.22);
  const ribs=[[-1.79,1.80],[-1.24,2.11],[-.62,2.35],[0,2.48],[.62,2.35],[1.24,2.11],[1.79,1.80]];
  for(const [x,y] of ribs)k.rod(g,[0,.40,.252],[x,y,.252],.024,paper.mint,5);
  for(const s of [-1,1]){
    k.box(g,s*2.04,1.07,.28,.20,2.13,.22,paper.cream);
    k.box(g,s*2.04,.32,.31,.31,.48,.27,paper.pale);
    k.box(g,s*2.04,2.00,.30,.35,.12,.26,paper.pale);
    k.rod(g,[s*2.11,1.99,.265],[s*.46,2.67,.265],.032,paper.pale,5);
  }
  const scroll=k.group(g,0,2.40,.30);
  k.card(scroll,[[-1.08,-.14],[-.98,0],[-1.09,.145],[-.72,.14],[-.72,-.14]],paper.ochre,0,.025);
  k.card(scroll,[[1.08,-.14],[.98,0],[1.09,.145],[.72,.14],[.72,-.14]],paper.ochre,0,.025);
  k.box(scroll,0,.02,.049,1.60,.34,.061,paper.cream);
  print(k,scroll,'DANZÓN',0,.026,.094,1.45,.29,paper.navy);
  k.box(g,0,.125,.35,4.45,.25,1.66,paper.honey);
  k.box(g,0,.255,.35,4.55,.063,1.72,paper.pale);
  k.box(g,0,.116,1.27,2.49,.15,.25,paper.tan);
}

function danceDisplay(k,x,z,w,title,color,trim){
  const display=k.anchor(x,z), half=w/2;
  k.box(display,0,.030,0,w,.06,1.00,paper.pale);
  k.box(display,0,.063,0,w-.065,.017,.95,color);
  // The open center of each die-cut mount keeps the back row visible.
  const back=k.group(display,0,.07,-.25);
  for(const side of [-1,1]){
    const wing=k.group(back,side*half,0,0);wing.scale.x=-side;
    k.card(wing,[[0,0],[.30,0],[.22,.18],[.089,.31],[.089,.94],[.16,1.04],[.16,1.14],[0,1.10]],paper.pale,0,.042);
    k.card(wing,[[.024,.02],[.25,.02],[.070,.275],[.070,.92],[.024,1.00]],color,.045,.025);
  }
  const plinth=k.group(display,0,.07,.533);plinth.rotation.x=-.63;
  k.card(plinth,[[-half,0],[half,0],[half,.165],[half-.075,.245],[-half+.075,.245],[-half,.165]],color,0,.056);
  k.box(plinth,0,.042,.062,w-.17,.018,.015,trim);
  print(k,plinth,title,0,.149,.072,w-.10,.205,trim);
  return display;
}

function cubanDances(k){
  rumbaPatio(k);charangaPavilion(k);
  const ring=k.anchor(casinoFloor.x,casinoFloor.z);
  for(const [a,b,y,c] of [[2.16,1.18,.019,paper.tan],[2.10,1.13,.043,paper.pale],[1.99,1.04,.056,'#c8ac87']]){
    const o=spin(k,ring,0,y,0,1,c,48);o.rotation.x=-Math.PI/2;o.scale.set(a,b,1);
  }
  const name=k.group(ring,0,.070,1.075);name.rotation.x=-.65;
  k.box(name,0,.111,0,1.45,.233,.056,paper.cream);
  print(k,name,'CASINO',0,.112,.044,1.32,.185,paper.navy);
  const record=k.anchor(-4.97,1.81);
  const item=k.group(record);item.rotation.z=.085;item.rotation.x=-.13;
  sleeveDisc(k,item,.09,.82,-.025,.675,paper.yellow);
  k.card(item,[[-.72,.014],[.67,.014],[.67,.73],[.06,.63],[-.72,.83]],paper.coral,.13,.07);
  k.card(item,[[-.68,.062],[-.36,.062],[-.12,.65],[-.37,.71]],paper.rust,.205);
  k.card(item,[[.32,.045],[.57,.045],[.64,.235],[.44,.27]],paper.ochre,.207);
  print(k,item,'MAMBO',-.06,.389,.245,1.17,.35,paper.chalk);
  const chacha=danceDisplay(k,-2.95,1.65,1.79,'CHA-CHA-CHA',paper.sea,paper.chalk);
  const pachanga=danceDisplay(k,-.89,2.00,1.52,'PACHANGA',paper.ochre,paper.wine);
  return {record,chacha,pachanga,rueda:ring};
}

function recordShop(k){
  const g=k.anchor(-2.97,-2.19);
  k.box(g,0,1.29,0,4.58,2.56,.36,'#ac7358');
  k.box(g,0,2.65,.02,4.70,.13,.51,paper.wine);
  for(const x of [-1.58,-.54,.53,1.57]){
    k.box(g,x,1.12,.211,.93,1.65,.10,paper.navy);
    k.box(g,x,1.21,.276,.79,1.40,.045,paper.sea);
    k.card(g,[[x-.37,1.31],[x-.37,1.89],[x+.20,1.89]],'#a0b6a2',.309);
    k.box(g,x,.85,.329,.82,.052,.03,paper.navy);
  }
  for(let n=0;n<23;n++){
    const x=-2.10+(n%9)*.52+Math.floor(n/9)%2*.125, y=2.34+Math.floor(n/9)*.104;
    k.box(g,x,y,.19,.32,.024,.024,n%4?paper.rose:paper.wine);
  }
  const fascia=k.group(g,0,2.32,.32);
  k.card(fascia,[[-2.18,-.28],[2.18,-.28],[2.26,-.18],[2.26,.19],[2.14,.30],[-2.15,.30],[-2.26,.19],[-2.26,-.18]],paper.ochre,-.04,.18);
  k.box(fascia,0,0,.154,4.32,.43,.048,paper.cream);
  print(k,fascia,'FANIA RECORDS',0,.017,.191,3.97,.386,paper.navy);
  k.box(g,0,.081,.44,4.68,.14,1.04,'#a5a292');
  const brick=k.group(g,-1.85,2.66,-.12);
  k.card(brick,[[-.41,0],[-.41,.41],[-.31,.41],[-.31,.53],[.25,.53],[.25,.44],[.39,.44],[.39,0]],'#896952',0,.30);
  k.box(brick,-.035,.55,.12,.65,.078,.42,paper.wine);
  const address=k.anchor(-5.05,-.81);address.rotation.y=.09;
  k.rod(address,[0,.018,0],[0,1.70,0],.036,paper.slate,5);
  k.box(address,.11,1.49,0,1.02,.24,.066,paper.navy);
  print(k,address,'NEW YORK',.11,1.49,.045,.94,.175,paper.chalk,'Arial');
}

function studio(k){
  const g=k.anchor(2.61,-1.88);
  k.box(g,0,1.17,-.01,4.44,2.33,.26,paper.timber);
  k.box(g,0,1.27,.14,4.19,1.98,.085,paper.slate);
  for(let j=0;j<10;j++){
    const x=-1.91+j*.422;
    k.box(g,x,1.34,.212,.27,1.74,.094,j%2?'#677c70':'#7d8e7c');
    for(let h=0;h<3;h++)k.box(g,x,.71+h*.56,.275,.21,.035,.020,paper.slate);
  }
  k.box(g,0,2.42,.03,4.62,.155,.65,paper.ink);
  k.box(g,0,2.51,.053,4.69,.062,.62,paper.honey);
  for(const s of [-1,1]){
    k.box(g,s*2.11,1.21,.34,.17,2.35,.30,'#9d7457');
    k.box(g,s*2.11,1.21,.518,.057,2.26,.036,paper.pale);
    const speaker=k.group(g,s*1.78,.26,.31);
    k.box(speaker,0,.45,0,.50,.91,.30,paper.wine);
    k.box(speaker,0,.45,.164,.41,.83,.030,paper.ink);
    for(const [y,r] of [[.33,.155],[.69,.075]]){
      spin(k,speaker,0,y,.192,r,paper.slate,16);spin(k,speaker,0,y,.215,r*.48,paper.ink,12);
    }
  }
  k.box(g,0,.115,.43,4.58,.23,1.92,paper.timber);
  k.box(g,0,.246,.44,4.65,.046,1.96,paper.tan);
  const red=k.group(g,.0,2.41,.409);
  k.box(red,0,0,0,.46,.155,.08,paper.wine);
  k.box(red,0,0,.053,.35,.094,.04,paper.coral);
}

function recordCrate(k){
  const g=k.anchor(-4.15,1.48);
  g.rotation.y=.09;
  for(let i=0;i<4;i++){
    const sleeve=k.group(g,(i-1.4)*.09,.39+i*.055,.09-i*.12);
    sleeve.rotation.x=-.07-i*.064;
    sleeve.rotation.z=(i-1.2)*.076;
    k.box(sleeve,0,.41,0,1.11,.84,.053,[paper.yellow,paper.coral,paper.sea,paper.pale][i]);
    if(i===3)sleeveDisc(k,sleeve,.11,.72,-.09,.44,paper.coral);
    if(i===0){
      spin(k,sleeve,-.13,.50,.042,.275,paper.cream,24);
      spin(k,sleeve,-.13,.50,.063,.144,paper.ochre,20);
    }
  }
  k.box(g,0,.27,.291,1.44,.52,.151,paper.timber);
  for(const x of [-.666,.666]){
    k.box(g,x,.315,.02,.122,.607,.66,paper.honey);
    for(const y of [.14,.40])spin(k,g,x,y,.38,.023,paper.ink,8);
  }
  k.box(g,0,.306,.381,1.15,.27,.040,paper.cream);
  print(k,g,'SALSA',0,.306,.411,1.10,.236,paper.wine);
  return g;
}

function reel(k,g,x,y,z,r){
  const outer=new k.THREE.Shape();
  outer.absarc(0,0,r,0,Math.PI*2,false);
  for(let i=0;i<5;i++){
    const a=i*Math.PI*2/5,cut=new k.THREE.Path();
    cut.absarc(Math.sin(a)*r*.58,Math.cos(a)*r*.58,r*.23,0,2*Math.PI,true);
    outer.holes.push(cut);
  }
  const body=new k.THREE.ExtrudeGeometry(outer,{depth:.047,bevelEnabled:false,curveSegments:6});
  k.mesh(g,body,k.stock(paper.pale),x,y,z);
  spin(k,g,x,y,z+.056,r*.15,paper.slate,12);
}

function filmReel(k){
  const g=k.anchor(3.90,1.40);g.rotation.y=-.06;
  const box=k.group(g,-.15,.055,0);
  k.box(box,0,.34,0,1.32,.69,.49,paper.navy);
  k.box(box,0,.365,.262,1.21,.54,.045,paper.sea);
  k.box(box,0,.36,.298,1.14,.39,.021,paper.cream);
  print(k,box,'OUR LATIN THING',0,.375,.319,1.09,.198,paper.wine);
  k.rod(box,[-.45,.61,.11],[-.52,1.10,.11],.056,paper.slate);
  k.rod(box,[.18,.60,.12],[.419,1.21,.12],.062,paper.slate);
  for(const [x,y,r] of [[-.50,1.00,.35],[.37,1.18,.42]]){
    spin(k,box,x,y,.12,r*.86,paper.ink,32);
    reel(k,box,x,y,.22,r);
  }
  k.rod(box,[-.55,.70,.16],[.31,.816,.16],.016,paper.ink,4);
  k.rod(box,[.65,.46,-.004],[.93,.46,-.004],.123,paper.ink,12);
  k.rod(box,[.89,.46,-.004],[.96,.46,-.004],.145,paper.slate,12);
  for(const x of [-.49,.49])k.box(box,x,.023,0,.19,.11,.49,paper.wine);
  g.userData.notePin=new k.THREE.Vector3(.20,1.16,.289);
  return g;
}

function fania(k){
  recordShop(k);studio(k);
  return {records:recordCrate(k),reel:filmReel(k)};
}

function hillside(k,x,width,heights,color,z){
  const g=k.anchor(x,z);
  const outline=[[-width/2,0]];
  heights.forEach((h,i)=>outline.push([width*(i/(heights.length-1)-.5),h]));
  outline.push([width/2,0]);
  k.card(g,outline,color,0,.055);
}

function barrioHouse(k,x,z,w,h,wall,trim,balcony){
  const g=k.anchor(x,z);
  const half=w/2;
  k.box(g,0,h/2,0,w,h,.44,wall);
  k.box(g,0,.12,.246,w+.014,.23,.067,trim);
  const roof=k.group(g,0,h+.098,-.01);roof.rotation.x=.22;
  k.box(roof,0,0,0,w+.20,.099,.79,paper.rust);
  for(let j=0;j<Math.round(w/.13);j++)k.box(roof,-half+j*.138,.066,.007,.061,.050,.76,paper.coral);
  k.box(g,0,h-.015,.392,w+.22,.081,.092,paper.pale);
  const windowHeight=h*.48,wy=h*.56;
  for(const sx of [-w*.255,w*.26]){
    k.box(g,sx,wy,.251,w*.35,windowHeight+.08,.074,trim);
    k.box(g,sx,wy,.300,w*.287,windowHeight,.035,paper.navy);
    k.card(g,[[sx-w*.142,wy-.06],[sx-w*.142,wy+windowHeight*.49],[sx+w*.125,wy+windowHeight*.49]],paper.slate,.326);
    k.box(g,sx,wy,.350,.042,windowHeight,.034,trim);
    k.box(g,sx,wy+windowHeight*.12,.35,w*.284,.031,.034,trim);
  }
  if(balcony){
    const floor=h*.35;
    k.box(g,0,floor,.43,w*.88,.075,.42,paper.sea);
    k.rod(g,[-w*.43,floor+.29,.624],[w*.43,floor+.29,.624],.031,paper.navy,5);
    for(let j=0;j<7;j++){
      const sx=-w*.405+j*w*.135;
      k.rod(g,[sx,floor+.04,.61],[sx,floor+.28,.61],.016,paper.navy,5);
    }
  }else{
    for(const sx of [-w*.255,w*.26])k.box(g,sx,wy-windowHeight*.50-.064,.317,w*.39,.065,.20,trim);
  }
}

function caliStage(k){
  const g=k.anchor(2.88,-1.44);
  k.card(g,[[-2.08,0],[-2.08,2.52],[-1.89,2.52],[-1.79,2.72],[-.71,2.72],[-.42,2.91],[.42,2.91],[.71,2.72],[1.79,2.72],[1.89,2.52],[2.08,2.52],[2.08,0]],paper.plum,-.21,.28);
  k.box(g,0,1.39,.10,3.51,2.33,.09,paper.navy);
  for(const s of [-1,1]){
    k.card(g,[[s*1.59,.41],[s*1.02,.41],[s*.33,2.36],[s*.56,2.36]],'#547378',.158);
    const f=k.group(g,s*1.76,.32,.22);
    f.scale.x=-s;
    k.card(f,[[-.16,0],[.27,0],[.21,.64],[.32,.95],[.69,1.58],[.87,2.03],[-.16,2.03]],paper.wine,0,.075);
    k.card(f,[[-.08,.03],[.038,.02],[.08,.72],[.53,1.97],[.26,1.98],[-.021,.72]],paper.rose,.083,.023);
    k.card(f,[[.15,.034],[.23,.036],[.16,.71],[.69,1.99],[.57,1.99],[.105,.72]],paper.coral,.085,.023);
    k.box(f,.08,.70,.12,.29,.055,.047,paper.yellow,-.12);
    k.box(g,s*2.01,1.28,.23,.16,2.49,.25,paper.ochre);
    k.box(g,s*2.01,.30,.24,.27,.46,.27,paper.pale);
    for(const y of [.68,1.05,1.42,1.79,2.16])spin(k,g,s*2.01,y,.372,.036,paper.chalk,8);
  }
  k.box(g,0,2.46,.240,3.95,.36,.25,paper.cream);
  k.box(g,0,2.65,.225,3.93,.043,.27,paper.yellow);
  print(k,g,'SALSA CALEÑA',0,2.465,.387,3.40,.313,paper.plum);
  k.box(g,0,.145,.33,4.37,.29,1.61,paper.plum);
  k.box(g,0,.290,.37,4.43,.059,1.67,paper.pale);
  k.box(g,0,.115,1.25,2.10,.16,.28,paper.ochre);
  for(const x of [-1.55,-1.05,-.55,0,.55,1.05,1.55])
    spin(k,g,x,.157,1.15,.059,paper.yellow,10);
}

function streetBunting(k){
  const g=k.anchor(-2.49,-1.55);
  k.rod(g,[-2.79,.01,.06],[-2.79,2.35,.06],.035,paper.timber,5);
  k.rod(g,[1.77,.01,0],[1.77,2.39,0],.035,paper.timber,5);
  const count=13,point=t=>[-2.79+4.56*t,2.31+.06*t-.37*Math.sin(Math.PI*t),.06*(1-t)];
  for(let i=0;i<count;i++){
    const a=point(i/count),b=point((i+1)/count);
    k.rod(g,a,b,.012,paper.ink,4);
    if(i===0||i===count-1)continue;
    const cloth=i%4===0?paper.coral:i%4===1?paper.yellow:i%4===2?paper.mint:paper.blue;
    k.card(g,[[a[0]+.07,a[1]-.012],[b[0]-.03,b[1]-.012],[(a[0]+b[0])/2+.020,(a[1]+b[1])/2-.25]],cloth,a[2],.017);
  }
}

function turntable(k){
  const g=k.anchor(-4.06,1.31);g.rotation.y=.11;
  for(const sx of [-.75,.75])for(const zz of [-.25,.29])
    k.rod(g,[sx,.35,zz],[sx*1.10,.012,zz*1.19],.047,paper.timber,5);
  k.box(g,0,.43,0,2.03,.34,1.12,paper.honey);
  k.box(g,0,.58,0,2.10,.103,1.16,paper.tan);
  const deck=k.group(g,0,.65,0);
  k.box(deck,0,0,0,2.01,.073,1.09,paper.sea);
  for(const [r,y,c] of [[.497,.053,paper.pale],[.467,.082,paper.ink],[.40,.103,paper.slate],[.38,.119,paper.ink],[.145,.135,paper.coral],[.020,.154,paper.pale]]){
    const disc=spin(k,deck,-.34,y,0,r,c,40);disc.rotation.x=-Math.PI/2;
  }
  const tone=k.group(deck,.65,.10,-.27);
  const swivel=spin(k,tone,0,.012,0,.127,paper.navy,16);swivel.rotation.x=-Math.PI/2;
  k.rod(tone,[0,.11,-.03],[-.14,.148,.14],.041,paper.pale,6);
  k.rod(tone,[-.14,.148,.14],[-.48,.112,.35],.032,paper.pale,6);
  k.box(tone,-.48,.096,.362,.133,.092,.13,paper.navy,.08);
  const lid=k.group(g,0,.69,-.48);
  lid.rotation.x=-.29;
  k.box(lid,0,.426,0,2.06,.855,.093,paper.honey);
  k.box(lid,0,.425,.064,1.93,.724,.045,paper.pale);
  k.box(lid,0,.426,.094,1.74,.546,.024,paper.sea);
  for(const sign of [-1,1]){
    const q=k.group(lid,sign*.54,.43,.125);
    k.card(q,[[-.19,-.095],[-.12,.081],[.015,.13],[.12,.075],[.19,-.095],[.098,-.095],[.062,.016],[-.01,.064],[-.071,.018],[-.11,-.095]],paper.cream);
  }
  const controls=k.group(g,.425,.454,.575);
  k.box(controls,0,0,0,.94,.246,.06,paper.cream);
  print(k,controls,'33',-.29,.036,.041,.237,.157,paper.navy,'Arial');
  print(k,controls,'45',.29,.036,.041,.237,.157,paper.navy,'Arial');
  k.box(controls,0,-.049,.045,.28,.044,.022,paper.slate);
  k.box(controls,.098,-.036,.077,.075,.093,.051,paper.coral);
  for(const sx of [-.76,-.63,-.50,-.37])k.box(g,sx,.425,.574,.062,.16,.030,paper.wine);
  g.userData.notePin=new k.THREE.Vector3(-.20,.65,.538);
  return g;
}

function awardStar(k,g,x,y,z,r,ink){
  const points=Array.from({length:10},(_,i)=>{
    const angle=Math.PI/2+i*Math.PI/5,radius=i%2?r*.45:r;
    return [radius*Math.cos(angle),radius*Math.sin(angle)];
  });
  k.card(k.group(g,x,y,z),points,ink,0,.028);
}

function smallCup(k,g,x,scale,metal,shade){
  const cup=k.group(g,x,.62,-.045);cup.scale.setScalar(scale);
  k.box(cup,0,.057,0,.39,.114,.27,paper.wine);
  k.box(cup,0,.15,0,.28,.07,.21,shade);
  k.box(cup,0,.224,0,.105,.12,.13,metal);
  for(const side of [-1,1]){
    const loop=[[.174,.535],[.32,.556],[.334,.47],[.28,.375],[.143,.359]];
    for(let i=1;i<loop.length;i++){
      k.rod(cup,[side*loop[i-1][0],loop[i-1][1],-.013],[side*loop[i][0],loop[i][1],-.013],.026,shade,5);
    }
  }
  k.card(cup,[[-.246,.594],[.246,.594],[.212,.436],[.133,.337],[.048,.298],[-.048,.298],[-.133,.337],[-.212,.436]],metal,-.05,.105);
  k.card(cup,[[.01,.584],[.235,.584],[.202,.44],[.126,.348],[.065,.321]],shade,.056,.012);
  k.box(cup,0,.595,.003,.508,.043,.13,metal);
}

function caliAwards(k){
  const g=k.anchor(3.53,1.65);
  g.rotation.z=Math.atan2(surfaceHeight(4.53)-surfaceHeight(3.53),1);
  for(const x of [-1.02,1.02])for(const z of [-.23,.23]){
    k.box(g,x,.275,z,.117,.55,.115,paper.wine);
  }
  k.box(g,0,.566,0,2.48,.108,.77,paper.timber);
  k.box(g,0,.36,.346,2.32,.405,.058,paper.navy);
  k.box(g,0,.534,.381,2.40,.046,.033,paper.ochre);
  smallCup(k,g,-.78,.87,'#c1c5bd','#79918b');
  smallCup(k,g,.77,.76,'#d79670','#a3614c');
  const starCup=k.group(g,0,.62,-.08);
  k.box(starCup,0,.063,0,.46,.126,.32,paper.wine);
  k.box(starCup,0,.15,0,.37,.056,.25,paper.ochre);
  k.card(starCup,[[-.13,.178],[.13,.178],[.16,.24],[.069,.31],[.092,.48],[-.092,.48],[-.069,.31],[-.16,.24]],paper.ochre,-.06,.12);
  awardStar(k,starCup,0,.64,-.009,.286,paper.honey);
  awardStar(k,starCup,0,.64,.023,.265,paper.yellow);
  awardStar(k,starCup,0,.64,.053,.152,paper.cream);
  for(const [x,ribbon,metal] of [[-.70,paper.coral,'#c1c5bd'],[0,paper.blue,paper.yellow],[.70,paper.rust,'#d79670']]){
    const medal=k.group(g,x,0,.392);
    for(const side of [-1,1]){
      const band=k.group(medal);band.scale.x=side;
      k.card(band,[[0,.264],[.055,.28],[.202,.554],[.115,.554]],ribbon,0,.018);
    }
    spin(k,medal,0,.245,.036,.123,metal,16);
    spin(k,medal,0,.245,.052,.092,paper.cream,16);
    awardStar(k,medal,0,.245,.068,.071,metal);
  }
  g.userData.notePin=new k.THREE.Vector3(0,.84,.08);
  return g;
}

function cali(k){
  hillside(k,-3.12,5.26,[.85,1.22,1.15,1.63,1.51,1.78,2.16,1.99,1.68,1.64,1.32,1.47,.96], '#74988a',-2.85);
  hillside(k,2.77,5.24,[1.22,1.54,1.35,1.64,1.79,1.66,1.82,1.49,1.37,.87], '#648b7d',-2.74);
  barrioHouse(k,-4.51,-2.14,1.27,1.46,paper.rose,paper.cream,false);
  barrioHouse(k,-2.95,-2.20,1.67,1.85,paper.ochre,paper.sea,true);
  barrioHouse(k,-1.31,-2.10,1.39,1.41,paper.sea,paper.cream,false);
  streetBunting(k);
  const sign=k.anchor(-3.32,-1.53);
  k.box(sign,0,1.77,.016,1.31,.344,.105,paper.navy);
  print(k,sign,'CALI',0,1.78,.082,1.18,.302,paper.chalk);
  const bench=k.anchor(-4.79,-.38);
  k.box(bench,0,.32,0,1.03,.07,.36,paper.honey);
  k.box(bench,0,.52,-.15,1.02,.18,.05,paper.tan);
  for(const sx of [-.39,.39])k.rod(bench,[sx,.32,0],[sx,.015,0],.036,paper.slate,5);
  const pot=k.anchor(-.57,-1.48);pottedPalm(k,pot,0,0,0,.75);
  caliStage(k);
  return {turntable:turntable(k),competitions:caliAwards(k)};
}

const sceneBuilders={'cuban-dances':cubanDances,fania,cali};

export function revisionScene(id,k){
  return sceneBuilders[id](k);
}
