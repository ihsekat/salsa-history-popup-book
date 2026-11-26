import {smoothUnit} from './paper-motion.js';
import {t} from './edition.js';
import {orlandoFinals} from './orlando-finals.js';
import {canvasTexture,surfaceHeight} from './craft.js';
import {drawCongressMap,projectRegion,regions} from './congress-map.js';

const p = {
  ivory:'#f5dfae', white:'#ffebc7', ochre:'#da9f4d', gold:'#ebbd67', amber:'#bb8044',
  coral:'#d37554', brick:'#a75e48', wine:'#784237', rose:'#d48678', peach:'#e3b08b',
  sea:'#70958b', jade:'#578275', pine:'#305b51', navy:'#29484b', night:'#293e3d',
  slate:'#536e6e', mint:'#a7baa0', wood:'#b08255', ink:'#463d32', pale:'#ddd3ad'
};

function star(k,g,x,y,z,r,color,points=5) {
  const outline=Array.from({length:points*2},(_,i)=>{
    const a=Math.PI/2+i*Math.PI/points, d=i%2?r*.43:r;
    return [x+Math.cos(a)*d,y+Math.sin(a)*d];
  });
  k.card(g,outline,color,z,.014);
}

function placard(k,g,text,x,y,z,w,h,fg,bg,font='Georgia') {
  if(bg) k.box(g,x,y,z,w,h,.055,bg);
  k.label(g,text,x,y,z+(bg ? .034 : 0),w*.95,h*.87,{ink:fg,font});
}

function oblong(k,g,x,y,z,rx,ry,color,n=16) {
  const o=k.disc(g,x,y,z,1,color,n);
  o.scale.set(rx,ry,1);
  return o;
}

function floodlight(k,x,z,h,dir=1) {
  const g=k.anchor(x,z);
  k.rod(g,[-.19,0,0],[-.08,h,0],.045,p.slate,4);
  k.rod(g,[.19,0,0],[.08,h,0],.045,p.slate,4);
  for(let i=0;i<5;i++){
    const a=h*i/5,b=h*(i+1)/5,s=i%2?1:-1;
    k.rod(g,[s*(.18-.08*i/5),a,0],[-s*(.18-.08*(i+1)/5),b,0],.021,p.slate,4);
  }
  const lamp=k.group(g,0,h,0); lamp.rotation.y=dir*.16;
  k.box(lamp,0,0,0,1.04,.39,.16,p.navy);
  const warm=new k.THREE.Color('#ddb778'),bright=new k.THREE.Color('#fff3c9');
  const banks=[0,1].map(()=>new k.THREE.MeshBasicMaterial({color:p.white,side:k.THREE.DoubleSide}));
  for(let i=0;i<4;i++){
    const lens=k.disc(lamp,-.36+i*.24,0,.099,.093,p.white,10);
    lens.material=banks[i%2];
  }
  const rest=new k.THREE.Color(p.white);
  k.motions.push((seconds,strength)=>{
    for(const [i,bank] of banks.entries()){
      const level=.5+.5*Math.cos(seconds*Math.PI/4+dir*1.1+i*.72);
      bank.color.copy(warm).lerp(bright,level).lerp(rest,1-strength);
    }
  });
  return g;
}

function pennant(k,g,x,y,z,color,dir=1) {
  k.rod(g,[x,y-.67,z],[x,y,z],.024,p.amber,5);
  const cloth=k.animateAtRest(k.group(g,x,y,z),'flag',x);
  k.card(cloth,[[0,-.03],[dir*.49,-.12],[0,-.23]],color,0,.027);
}

function stadium(k) {
  const stands=k.anchor(2.82,-1.81);
  const cheering=[.2,2.3,4.4].map(phase=>k.animateAtRest(k.group(stands),'cheer',phase));
  k.box(stands,0,.78,-.05,4.7,1.55,.37,p.pine);
  for(let row=0;row<4;row++){
    const y=.38+row*.34,z=.74-row*.23;
    k.box(stands,0,y-.11,z,4.77,.22,.42,row%2?p.slate:p.jade);
    k.box(stands,0,y-.005,z+.18,4.84,.042,.10,p.pale);
    for(let col=0;col<13;col++){
      const x=-2.18+col*.36+(row%2)*.05, variant=(col*3+row*7)%9;
      if(variant===2 || variant===7)continue;
      const coat=[p.wine,p.navy,p.ochre,p.pine,p.coral][(row+col)%5];
      const skin=['#ba885e','#a26a47','#dfb68c','#996748'][(row*3+col)%4];
      const section=(row+col)%2===0?cheering[(row+Math.floor(col/2))%cheering.length]:stands;
      const fan=k.group(section,x,y,z);
      k.card(fan,[[-.10,.015],[-.079,.145],[0,.20],[.081,.14],[.106,.015]],coat,.02,.024);
      k.disc(fan,0,.215,.046,.066,skin,8);
    }
  }
  k.box(stands,0,1.92,-.10,4.90,.13,.34,p.ivory);
  const frieze=[[-2.46,1.91],[-2.46,2.48],[2.46,2.48],[2.46,1.91]];
  for(let j=8;j>=0;j--){
    const a=-2.46+j*(4.92/9),w=4.92/9;
    frieze.push([a+w*.90,1.91],[a+w*.90,2.15],[a+w*.72,2.29],[a+w*.28,2.29],[a+w*.10,2.15],[a+w*.10,1.91]);
  }
  k.card(stands,frieze,p.pale,-.09,.15);
  k.box(stands,0,2.5,-.02,5.01,.094,.47,p.ivory);
  k.box(stands,0,2.18,.15,2.73,.58,.13,p.navy);
  placard(k,stands,'YANKEE STADIUM',0,2.19,.226,2.62,.40,p.white,null);
  for(const [x,c] of [[-1.95,p.coral],[.04,p.gold],[1.79,p.sea]])pennant(k,stands,x,3.18,-.18,c);
  const left=k.anchor(-3.47,-2.05); left.rotation.y=.12;
  for(let i=0;i<3;i++){
    const y=.2+i*.29,z=.39-i*.24;
    k.box(left,0,y,z,3.43,.26,.56,[p.jade,p.slate,p.pine][i]);
    k.box(left,0,y+.146,z+.21,3.47,.043,.10,p.ivory);
  }
  k.box(left,0,1.22,-.20,3.46,.41,.20,p.navy);
  placard(k,left,'FANIA ALL-STARS',0,1.22,-.083,2.86,.31,p.gold,null);
  floodlight(k,-4.95,-2.28,2.68);floodlight(k,5.19,-2.54,2.99,-1);
  for(const side of [-1,1]){
    const deck=k.anchor(side*2.61,1.0);
    k.box(deck,0,.086,0,5.16,.17,1.99,'#785e43');
    k.box(deck,0,.185,0,5.18,.035,2.03,'#c29b67');
    for(const x of [-2.25,-.75,.75,2.25])k.box(deck,x,.09,1.0,.075,.17,.045,p.ink);
    const wedge=k.group(deck,side*1.76,.23,.79);wedge.rotation.x=.27;
    k.box(wedge,0,.10,0,.55,.25,.31,p.navy);
  }
  return {prop:stands};
}

function clock(k,g,x,y,z,r) {
  k.disc(g,x,y,z,r,p.navy,24); k.disc(g,x,y,z+.027,r*.83,p.white,24);
  for(let i=0;i<12;i++){
    const a=i*Math.PI/6;
    k.rod(g,[x+Math.sin(a)*r*.64,y+Math.cos(a)*r*.64,z+.050],
      [x+Math.sin(a)*r*.75,y+Math.cos(a)*r*.75,z+.050],r*.023,p.ink,4);
  }
  k.rod(g,[x,y,z+.063],[x-r*.32,y+r*.20,z+.063],r*.044,p.ink,4);
  k.rod(g,[x,y,z+.064],[x+r*.14,y+r*.56,z+.064],r*.035,p.ink,4);
}

function countCards(k,x,z,breakBeat) {
  const g=k.anchor(x,z), w=1.68;
  k.rod(g,[0,.03,0],[0,.85,0],.043,p.ink);
  k.rod(g,[0,.22,0],[-.38,.01,.18],.026,p.ink,4);
  k.rod(g,[0,.22,0],[.38,.01,.18],.026,p.ink,4);
  const easel=k.group(g,0,.70,0); easel.rotation.x=-.135;
  k.box(easel,0,.44,0,w,1.0,.095,p.wood);
  k.box(easel,0,.42,.059,w-.10,.88,.045,p.ivory);
  placard(k,easel,'ON '+breakBeat,0,.71,.10,1.18,.29,p.night,null);
  for(let i=0;i<8;i++){
    const beat=i+1,ix=i%4,row=Math.floor(i/4),a=beat===breakBeat||beat===breakBeat+4;
    const xx=-.54+ix*.36,yy=.408-row*.257;
    k.box(easel,xx,yy,.102,.29,.220,.033,a?p.coral:p.pale);
    k.label(easel,String(beat),xx,yy,.132,.23,.175,{ink:a?p.white:(beat%4===0?p.wood:p.navy),font:'Georgia'});
  }
  for(const px of [-.54,.54])k.box(easel,px,.916,.085,.07,.12,.085,p.navy);
  return g;
}

function danceSlot(k){
  const lane=k.anchor(-3.77,1.39),length=2.02,spacing=.41;
  lane.rotation.z=-Math.atan2(surfaceHeight(1)-surfaceHeight(0),1);
  const tracks=k.group(lane,0,.009,0);
  tracks.rotation.y=Math.PI/4;
  for(const z of [-spacing/2,spacing/2]){
    k.box(tracks,0,0,z,length,.008,.072,'#a15345');
  }
  const material=new k.THREE.MeshBasicMaterial({visible:false,side:k.THREE.DoubleSide});
  const area=new k.THREE.Mesh(new k.THREE.PlaneGeometry(length,spacing+.072),material);
  area.rotation.x=-Math.PI/2;area.userData.hitOnly=true;
  tracks.add(area);lane.userData.hitAreas=[area];
  lane.userData.notePin=new k.THREE.Vector3(0,.02,0);
  return lane;
}

function eddie(k) {
  const room=k.anchor(2.77,-1.79);
  k.box(room,0,1.32,0,4.64,2.65,.27,'#b98468');
  k.box(room,0,.18,.24,4.74,.34,.23,p.wood);
  k.box(room,0,2.72,0,4.84,.17,.43,p.ink);
  for(let i=0;i<20;i++){
    const x=-2.14+(i%10)*.469+(i<10?.06:0),y=i<10?2.55:.41;
    k.box(room,x,y,.15,.30,.025,.025,i%3?p.peach:p.brick);
  }
  for(let i=0;i<3;i++){
    const pane=k.group(room,-1.42+i*1.42,1.48,.17);
    pane.rotation.y=[.045,-.04,.07][i];
    k.box(pane,0,0,0,1.39,1.73,.125,p.ivory);
    k.box(pane,0,0,.071,1.28,1.61,.045,i%2?p.sea:'#94afa1');
    k.card(pane,[[-.64,-.47],[-.64,.18],[.00,.80],[.52,.80]],i%2?'#a1b6a3':'#b2c5ae',.098);
    k.card(pane,[[-.43,-.80],[-.27,-.80],[.64,.11],[.64,.30]],'#c4cdb4',.10);
  }
  k.box(room,0,1.08,.39,4.44,.072,.11,p.amber);
  [-1.86,0,1.86].forEach(x=>k.rod(room,[x,.96,.19],[x,1.07,.43],.024,p.ink));
  clock(k,room,1.93,2.71,.20,.30);
  const windows=k.anchor(-3.71,-2.25);
  k.box(windows,0,1.08,0,2.75,2.16,.18,p.brick);
  for(const x of [-.67,.67]){
    k.box(windows,x,1.27,.122,1.19,1.48,.075,p.ivory);
    k.box(windows,x,1.27,.169,1.03,1.32,.035,p.slate);
    k.box(windows,x,1.27,.199,.047,1.33,.024,p.ivory);
    k.box(windows,x,1.24,.201,1.05,.043,.023,p.ivory);
    k.box(windows,x,.49,.171,1.28,.08,.19,p.wood);
  }
  const sound=k.anchor(-4.20,-.76);
  k.box(sound,0,.52,0,1.13,1.0,.39,p.wood);
  k.box(sound,0,.55,.213,.99,.83,.045,p.night);
  for(const [y,r] of [[.42,.29],[.84,.105]]){
    k.disc(sound,0,y,.25,r,p.slate,20);k.disc(sound,0,y,.273,r*.5,p.ink,20);
  }
  const player=countCards(k,3.82,1.11,2);
  const prop=danceSlot(k);
  const vhs=k.anchor(1.49,1.74);
  const tape=k.group(vhs,0,.06,0);tape.rotation.x=-.32;tape.rotation.z=-.06;
  k.box(tape,0,.45,0,1.62,.9,.135,'#313937');
  k.box(tape,0,.71,.077,1.36,.21,.012,'#e8d5a9');
  k.label(tape,'MAMBO / ON2 LESSONS',0,.71,.092,1.24,.134,{ink:'#663d36'});
  k.box(tape,0,.39,.075,1.18,.33,.021,'#677c75');
  for(const x of [-.38,.38]){
    const spool=k.animateAtRest(k.group(tape,x,.39,.099),'reel');
    k.disc(spool,0,0,0,.143,'#dfd8bb',20);
    k.disc(spool,0,0,.024,.056,'#3a4541',8);
    for(let i=0;i<3;i++){
      const a=2*Math.PI*i/3;
      k.disc(spool,.093*Math.cos(a),.093*Math.sin(a),.026,.026,'#677c75',6);
    }
  }
  k.box(tape,0,.12,.077,1.40,.065,.019,'#535954');
  return {duo:null,player,prop,vhs};
}

function palm(k,x,z,h,lean) {
  const g=k.animateAtRest(k.anchor(x,z),'palm',x*.67), end=lean*h;
  for(let j=0;j<5;j++){
    const a=j/5,b=(j+1)/5;
    k.rod(g,[end*a*a,h*a,0],[end*b*b,h*b,0],h*(.032-a*.012),j%2?p.wood:p.amber,6);
  }
  const top=k.group(g,end,h,0);
  for(let j=0;j<8;j++){
    const f=k.group(top);f.rotation.y=j*Math.PI/4+.2;f.rotation.z=(j%3-1)*.13;
    const s=h*.31;f.scale.setScalar(s);
    k.card(f,[[0,0],[.35,.31],[.64,.33],[1.01,.20],[1.34,-.04],[1.66,-.51],[1.38,-.31],
      [1.32,-.16],[1.23,-.23],[1.01,-.01],[.92,-.09],[.76,.06],[.68,.01],[.41,.12]],j%2?p.jade:p.pine,0,.021);
    k.card(f,[[0,0],[.43,.18],[.78,.22],[1.21,.04],[1.66,-.51],[1.34,-.04],[1.01,.20],[.64,.33],[.35,.31]],j%2?'#89a978':'#76a282',.026,.013);
  }
}

function stageLight(k,g,x,y,z,tilt=0) {
  const lamp=k.group(g,x,y,z);lamp.rotation.z=tilt;
  k.card(lamp,[[-.24,.12],[-.21,-.15],[.18,-.15],[.26,.13]],p.navy,-.12,.25);
  k.box(lamp,0,0,.149,.35,.24,.03,p.ink);
  const lens=oblong(k,lamp,0,.008,.18,.135,.09,p.gold,12);
  const dim=new k.THREE.Color('#695b42'),bright=new k.THREE.Color('#ffebac');
  lens.material=new k.THREE.MeshBasicMaterial({color:bright,side:k.THREE.DoubleSide});
  k.motions.push((seconds,strength)=>{
    const pulse=smoothUnit(.5+.7*Math.cos(seconds*Math.PI/2+tilt*7));
    lens.material.color.copy(dim).lerp(bright,1-strength*(1-pulse));
  });
  k.card(lamp,[[-.19,.13],[-.26,.29],[.22,.27],[.20,.13]],p.slate,.14);
  k.card(lamp,[[-.19,-.13],[-.22,-.21],[.21,-.20],[.18,-.13]],p.slate,.14);
}

function losAngeles(k) {
  const hills=k.anchor(-2.77,-2.70);
  k.card(hills,[[-2.67,0],[-2.67,.91],[-2.31,1.46],[-1.86,1.68],[-1.43,2.09],[-.97,2.25],[-.50,2.86],[.03,3.04],[.47,2.97],[.90,2.58],[1.34,2.43],[1.76,1.93],[2.28,2.07],[2.65,1.57],[2.65,0]],'#708975',0,.04);
  k.card(hills,[[-2.64,0],[-2.64,.63],[-2.01,1.16],[-1.48,1.03],[-.91,1.33],[-.35,1.18],[.17,1.51],[.70,1.33],[1.19,1.69],[1.71,1.50],[2.64,1.41],[2.64,0]],p.jade,.07);
  const letters='HOLLYWOOD';
  for(let i=0;i<letters.length;i++){
    const x=-1.23+i*.32,y=2.45+.14*Math.sin(i*.42);
    k.rod(hills,[x,y-.27,.076],[x,y+.07,.076],.013,'#526858',4);
    k.label(hills,letters[i],x,y,.108,.37,.43,{ink:'#fff4d7',font:'Arial'});
  }
  const sun=k.group(hills,1.79,0,-.10);
  k.rod(sun,[0,0,-.018],[0,3.11,-.018],.012,'#bfad82');
  k.disc(sun,0,3.11,0,.43,p.gold,32);
  palm(k,-5.04,-1.42,2.37,.08);palm(k,-2.72,-2.20,1.72,.075);
  const theatre=k.anchor(2.79,-1.68);
  k.card(theatre,[[-2.38,0],[-2.38,2.37],[-1.97,2.37],[-1.97,2.61],[-1.62,2.61],[-1.62,2.84],[-.72,2.84],[-.72,3.06],[-.38,3.06],[0,3.36],[.38,3.06],[.72,3.06],[.72,2.84],[1.62,2.84],[1.62,2.61],[1.97,2.61],[1.97,2.37],[2.38,2.37],[2.38,0]],p.coral,-.16,.31);
  k.box(theatre,0,1.02,.031,3.58,1.98,.19,p.wine);
  k.box(theatre,0,1.00,.144,3.14,1.70,.06,p.navy);
  for(const s of [-1,1]){
    k.card(theatre,[[s*.99,.21],[s*1.46,.21],[s*.39,1.80],[s*.22,1.8]],p.slate,.195);
    k.box(theatre,s*1.96,1.14,.18,.55,2.23,.25,p.ochre);
    k.box(theatre,s*1.96,1.19,.33,.29,1.98,.05,p.ivory);
    for(let j=0;j<7;j++){
      const y=.40+j*.245;
      k.card(theatre,[[s*1.96-.13,y+.10],[s*1.96,y+.02],[s*1.96+.13,y+.10],[s*1.96,y+.145]],p.brick,.364);
    }
    k.rod(theatre,[s*1.54,2.40,.23],[s*.23,2.86,.23],.045,p.gold,4);
  }
  k.box(theatre,0,2.08,.24,3.55,.44,.23,p.ivory);
  placard(k,theatre,'LOS ANGELES',0,2.09,.378,3.24,.35,p.wine,null);
  k.box(theatre,0,.115,.36,4.72,.23,1.23,p.wood);
  k.box(theatre,0,.238,.37,4.80,.038,1.29,p.gold);
  star(k,theatre,0,2.75,.195,.234,p.gold,6);
  const prop=k.anchor(-4.29,.80);
  k.rod(prop,[0,.04,0],[0,1.70,0],.054,p.navy,6);
  for(const [x,z] of [[-.41,.20],[.40,.16],[.03,-.34]])k.rod(prop,[0,.43,0],[x,.01,z],.035,p.navy);
  k.box(prop,0,1.66,0,1.15,.07,.09,p.ink);
  stageLight(k,prop,-.36,1.57,.01,-.23);stageLight(k,prop,.34,1.57,.01,.18);
  return {duo:null,player:countCards(k,3.88,1.10,1),prop};
}

function islandFlag(k,g,x,y,z,s) {
  const flag=k.group(g,x,y,z); flag.scale.setScalar(s);
  k.rod(flag,[0,-.78,0],[0,.41,0],.019,p.amber,6);
  const cloth=k.animateAtRest(k.group(flag),'flag',.6);
  const xFields=[0,.42,.82,1.20],heights=[0,-.045,.018,-.024];
  for(let j=0;j<3;j++) {
    for(let i=0;i<5;i++){
      const t=.37-.15*i;
      k.card(cloth,[[xFields[j],t+heights[j]],[xFields[j+1],t+heights[j+1]],[xFields[j+1],t-.15+heights[j+1]],[xFields[j],t-.15+heights[j]]],
        i%2?p.white:(j===1?p.brick:p.coral),.016*j,.018);
    }
  }
  k.card(cloth,[[0,.37],[.64,-.014],[0,-.38]],'#497b86',.066,.014);
  star(k,cloth,.193,-.012,.089,.105,p.white);
}

function garland(k,g,from,to,drop,count){
  let last=from;
  for(let i=1;i<=count;i++){
    const t=i/count, x=from[0]+(to[0]-from[0])*t, z=from[2]+(to[2]-from[2])*t;
    const y=from[1]+(to[1]-from[1])*t-4*t*(1-t)*drop;
    k.rod(g,last,[x,y,z],.012,p.ink,4);
    if(i<count) {
      k.rod(g,[x,y,z],[x,y-.08,z],.013,p.navy,4);
      oblong(k,g,x,y-.10,z+.019,.042,.054,i%3?p.gold:p.white,8);
    }
    last=[x,y,z];
  }
}

function islandHills(k) {
  const island=k.anchor(-3.05,-2.62);
  k.card(island,[[-2.47,0],[-2.47,.93],[-2.01,1.19],[-1.86,1.10],[-1.24,1.45],[-.97,1.43],[-.36,1.85],[.03,1.71],[.50,1.45],[.78,1.49],[1.37,1.18],[1.71,1.27],[2.40,.95],[2.40,0]],'#769887',0,.048);
  k.card(island,[[-2.47,0],[-2.47,.65],[-1.73,.95],[-1.18,.81],[-.61,1.12],[-.10,.99],[.55,1.22],[1.31,.97],[1.68,1.06],[2.40,.73],[2.40,0]],'#549082',.06,.04);
}

function congressDanceFloor(k){
  const floor=k.anchor(-4.02,-.65);
  k.box(floor,0,.052,0,2.99,.104,1.59,p.wood);
  k.box(floor,0,.103,0,2.91,.046,1.53,p.gold);
  const woods=['#bc8c5c','#c79965','#a97852','#d4a873'];
  for(let row=0;row<3;row++)for(let column=0;column<6;column++){
    const x=-1.151+column*.46,z=-.461+row*.46;
    const vertical=(row+column)%2===0;
    for(let strip=0;strip<3;strip++){
      const off=(strip-1)*.149;
      k.box(floor,x+(vertical?off:0),.129,z+(vertical?0:off),
        vertical?.141:.437,.024,vertical?.437:.141,woods[(row+2*column+strip)%woods.length]);
    }
  }
  return floor;
}

export function trophyStand(k,x,z,place,event){
  const g=k.anchor(x,z);
  k.box(g,0,.074,0,2.00,.148,.81,p.navy);
  k.box(g,0,.289,0,1.88,.37,.724,p.pine);
  k.box(g,0,.502,0,2.03,.075,.80,p.amber);
  k.box(g,0,.293,.372,1.76,.315,.042,p.ivory);
  placard(k,g,place,0,.365,.398,1.62,.136,p.navy,null,'Arial');
  placard(k,g,event,0,.236,.399,1.64,.196,p.wine,null);
  for(const sx of [-.82,.82])for(const y of [.18,.40])k.disc(g,sx,y,.402,.014,p.amber,8);
  const cup=k.animateAtRest(k.group(g,0,.542,-.025),'trophyTurn');
  k.box(cup,0,.077,0,.68,.154,.47,p.wine);
  k.box(cup,0,.16,0,.59,.062,.42,p.gold);
  const profile=[[.22,.19],[.21,.23],[.105,.28],[.071,.33],[.071,.40],[.13,.45],
    [.23,.50],[.34,.63],[.41,.82],[.43,.945],[.39,.945],[.36,.81],[.27,.66],[.20,.59],[.04,.55],[0,.55]];
  const facets=new k.THREE.LatheGeometry(profile.map(([x,y])=>new k.THREE.Vector2(x,y)),14);
  k.mesh(cup,facets,k.stock(p.gold));
  const lip=k.mesh(cup,new k.THREE.TorusGeometry(.411,.026,5,21),k.stock(p.ochre),0,.941,0);
  lip.rotation.x=Math.PI/2;
  for(const side of [-1,1]){
    const handle=[[.382,.811],[.48,.92],[.60,.91],[.64,.83],[.625,.71],[.57,.62],[.38,.54],[.29,.57]];
    for(let n=1;n<handle.length;n++)
      k.rod(cup,[side*handle[n-1][0],handle[n-1][1],0],[side*handle[n][0],handle[n][1],0],.041,p.ochre,7);
  }
  star(k,cup,0,.72,.327,.107,p.ivory);
  g.userData.notePin=new k.THREE.Vector3(0,1.22,.34);
  return g;
}

function puertoRico(k) {
  islandHills(k);
  palm(k,-4.46,-1.69,2.83,.13);palm(k,-2.53,-2.10,1.79,-.08);
  const hall=k.anchor(2.87,-1.94);
  k.box(hall,0,1.27,0,4.31,2.55,.31,'#d09970');
  k.box(hall,0,.20,.70,4.68,.40,1.58,p.wood);
  k.box(hall,0,.38,.70,4.76,.075,1.62,p.ivory);
  k.box(hall,0,.223,1.50,4.70,.285,.066,p.coral);
  for(const x of [-2.12,-1.72,-1.32,-.92,-.52,0,.52,.92,1.32,1.72,2.12]){
    k.disc(hall,x,.235,1.549,.042,p.gold,10);
  }
  k.box(hall,0,.101,1.635,1.98,.202,.27,p.wood);
  k.box(hall,0,.205,1.631,2.02,.045,.29,p.pale);
  k.box(hall,0,1.49,.18,3.92,1.91,.07,p.pine);
  for(const s of [-1,1]){
    for(let j=0;j<2;j++){
      const shutter=k.group(hall,s*(1.28+j*.45),1.49,.239);shutter.rotation.y=s*(j?.06:-.16);
      k.box(shutter,0,0,0,.42,1.70,.10,p.sea);
      for(let i=0;i<8;i++)k.box(shutter,0,-.69+i*.192,.073,.33,.072,.031,p.jade);
    }
    k.box(hall,s*2.10,1.49,.60,.16,2.20,.17,p.ivory);
    k.box(hall,s*2.10,.56,.60,.27,.23,.24,p.pale);
    k.box(hall,s*2.10,2.47,.60,.30,.17,.25,p.pale);
    k.card(hall,[[s*2.08,2.37],[s*2.08,2.13],[s*1.96,2.26],[s*1.81,2.27],[s*1.68,2.42]],p.ivory,.54,.11);
  }
  k.box(hall,0,2.57,.19,4.61,.13,1.04,p.ivory);
  const roof=k.group(hall,0,2.70,-.08);roof.rotation.x=.18;
  k.box(roof,0,0,0,4.74,.12,1.61,p.jade);
  for(let i=0;i<18;i++)k.box(roof,-2.20+i*.26,.074,0,.031,.027,1.60,p.sea);
  for(let i=0;i<12;i++){
    const x=-2.15+i*.39;
    k.card(hall,[[x-.18,2.53],[x+.18,2.53],[x+.18,2.44],[x+.07,2.35],[x-.07,2.35],[x-.18,2.45]],i%2?p.sea:p.ivory,.686);
  }
  islandFlag(k,hall,.72,3.13,-.18,.80);
  garland(k,hall,[-2.06,2.36,.65],[2.06,2.36,.65],.38,12);
  return {social:congressDanceFloor(k),performances:hall,competitions:trophyStand(k,3.47,1.76,'PUERTO RICO','WORLD SALSA OPEN')};
}

function routeMap(k) {
  const g=k.anchor(2.91,-1.40);
  const board=k.group(g,0,.28,0);board.rotation.x=-.055;
  k.box(g,-1.55,.22,0,.14,.44,.20,p.wood);
  k.box(g,1.55,.22,0,.14,.44,.20,p.wood);
  k.box(board,0,1.23,-.040,4.80,2.69,.17,p.wood);
  k.box(board,0,1.23,.065,4.69,2.59,.063,p.ivory);
  k.box(board,0,1.19,.113,4.45,2.13,.057,'#7c9f99');
  let drawRoutes;
  const chart=drawCongressMap(update=>{drawRoutes=update;});
  const width=4.45,height=2.13;
  const print=new k.THREE.MeshLambertMaterial({map:canvasTexture(chart),side:k.THREE.DoubleSide});
  k.mesh(board,new k.THREE.PlaneGeometry(width,height),print,0,1.19,.151);
  let lastStep=64,lastOpacity=16;
  k.motions.push((seconds,strength)=>{
    const t=seconds%8;
    const step=strength?Math.round(64*smoothUnit(t/4.4)):64;
    const opacity=strength?Math.round(16*(1-smoothUnit((t-7)/1))):16;
    if(step===lastStep && opacity===lastOpacity)return;
    lastStep=step;lastOpacity=opacity;
    drawRoutes(step/64,opacity/16);print.map.needsUpdate=true;
  });
  for(const {lon,lat} of regions){
    const [px,py]=projectRegion(lon,lat);
    const x=(px/chart.width-.5)*width,y=1.19+(.5-py/chart.height)*height;
    k.disc(board,x,y,.176,.061,p.wine,18);
    k.disc(board,x,y,.193,.032,p.gold,18);
  }
  placard(k,board,t('THE CONGRESS CIRCUIT'),0,2.40,.115,3.78,.27,p.navy,null);
  return g;
}

function travelCase(k,x,z) {
  const g=k.animateAtRest(k.anchor(x,z),'rattle'),bag=k.group(g);bag.rotation.y=-.12;bag.rotation.z=-.045;
  k.box(bag,0,.52,0,1.44,.94,.53,'#936950');
  k.box(bag,0,.53,.281,1.37,.83,.055,'#b88451');
  k.box(bag,0,.53,-.278,1.37,.83,.047,'#ae7b50');
  for(const s of [-1,1]){
    k.box(bag,s*.45,.53,.321,.113,.88,.033,p.ink);
    k.box(bag,s*.45,.99,0,.117,.030,.56,p.ink);
    k.box(bag,s*.45,.73,.344,.156,.123,.034,p.gold);
    k.box(bag,s*.45,.73,.366,.093,.064,.014,p.ink);
    k.rod(bag,[s*.23,.99,0],[s*.22,1.17,0],.046,p.pine);
    k.box(bag,s*.63,.16,.318,.122,.12,.044,p.navy);
  }
  k.rod(bag,[-.22,1.17,0],[.22,1.17,0],.051,p.navy);
  k.disc(bag,-.07,.61,.324,.165,p.ivory,12);
  k.disc(bag,-.07,.61,.345,.112,p.coral,12);
  k.card(bag,[[.043,.27],[.29,.29],[.26,.46]],p.sea,.33,.024);
  const tag=k.group(bag,.44,.92,.33);tag.rotation.z=-.34;
  k.rod(tag,[0,.11,0],[0,-.06,0],.013,p.ink);
  k.card(tag,[[-.11,-.07],[-.07,-.02],[.11,-.02],[.11,-.33],[-.11,-.33]],p.ivory,.01);
  return g;
}

function congressWorld(k){
  const terminal=k.anchor(-3.44,-2.18);
  k.box(terminal,0,1.14,0,3.55,2.27,.26,p.slate);
  k.box(terminal,0,2.27,.025,3.67,.13,.43,p.ivory);
  for(let j=0;j<3;j++){
    const x=-1.09+j*1.09;
    k.box(terminal,x,1.26,.164,1.03,1.40,.075,p.sea);
    k.card(terminal,[[x-.50,1.29],[x-.50,1.94],[x+.23,1.94]],'#9ab3a7',.215);
    k.box(terminal,x,.54,.19,1.07,.066,.13,p.navy);
  }
  const jet=k.group(terminal,-.49,1.33,.24);jet.rotation.z=.21;
  k.card(jet,[[-.74,-.03],[-.06,.055],[-.26,.42],[-.13,.42],[.30,.11],[.66,.14],[.84,.07],[.77,.022],[.20,-.044],[-.11,-.45],[-.25,-.46],[-.09,-.09],[-.56,-.11],[-.75,-.25],[-.82,-.23]],p.white,0,.016);
  placard(k,terminal,t('DEPARTURES'),.70,2.00,.241,1.63,.27,p.white,p.navy);
  const bench=k.anchor(-4.25,-.72);
  k.box(bench,0,.35,0,1.76,.103,.48,p.jade);
  const back=k.box(bench,0,.57,-.20,1.76,.35,.09,p.sea);back.rotation.x=-.08;
  for(const x of [-.67,.67])k.rod(bench,[x,.32,0],[x,.01,0],.054,p.navy,4);
  return {duo:null,player:travelCase(k,3.84,1.23),prop:routeMap(k)};
}

function tvCamera(k) {
  const g=k.anchor(-4.11,.92);
  const yoke=k.group(g,0,1.33,0);yoke.rotation.y=-.82;
  k.animateAtRest(yoke,'cameraPan');
  for(const [x,z] of [[-.49,.32],[.48,.29],[.02,-.45]]){
    k.rod(g,[x*.27,1.16,z*.27],[x*.75,.44,z*.75],.061,p.slate,5);
    k.rod(g,[x*.75,.47,z*.75],[x,0,z],.041,p.ink,5);
  }
  k.box(g,0,1.18,0,.36,.18,.31,p.ink);
  k.box(yoke,0,.23,0,.64,.43,.79,p.navy);
  k.box(yoke,-.338,.22,-.01,.057,.34,.53,p.slate);
  k.box(yoke,0,.21,.46,.44,.28,.20,p.ink);
  k.rod(yoke,[0,.21,.53],[0,.21,.83],.17,p.navy,10);
  k.rod(yoke,[0,.21,.82],[0,.21,.90],.19,p.slate,10);
  k.disc(yoke,0,.21,.91,.145,p.ink,16);
  k.disc(yoke,0,.21,.934,.096,p.sea,16);
  k.box(yoke,0,.52,-.13,.30,.13,.27,p.ivory);
  k.box(yoke,0,.60,-.13,.13,.058,.12,p.coral);
  k.box(yoke,.23,.41,-.396,.21,.20,.23,p.slate);
  k.rod(yoke,[.22,.41,-.48],[.22,.41,-.67],.061,p.ink,8);
  k.rod(yoke,[.21,.018,-.22],[.30,-.14,-.67],.029,p.ink);
  for(const s of [-1,1])k.box(yoke,s*.333,.21,-.11,.025,.25,.19,p.pale);
  return g;
}

function judge(k,g,x,y,skin,coat,hair) {
  const seated=k.group(g,x,y,0);
  k.card(seated,[[-.28,0],[-.25,.39],[-.16,.48],[.12,.48],[.25,.36],[.29,0]],coat,0,.07);
  k.card(seated,[[-.135,.46],[0,.26],[.13,.46],[.055,.49],[-.07,.49]],p.ivory,.076,.02);
  k.card(seated,[[-.09,.49],[-.145,.64],[-.12,.80],[-.03,.857],[.102,.826],[.145,.734],[.117,.56],[.051,.48]],skin,.010,.08);
  k.card(seated,[[-.142,.66],[-.169,.79],[-.087,.899],[.07,.905],[.150,.822],[.156,.755],[.028,.811],[-.097,.777]],hair,.103,.02);
  k.rod(seated,[-.23,.31,.105],[-.36,.14,.19],.059,coat,5);
  k.rod(seated,[.23,.31,.105],[.31,.15,.19],.059,coat,5);
}

function championship(k){
  return orlandoFinals(k,judge,tvCamera);
}

function cane(k,x,z,h,flip=1) {
  const g=k.animateAtRest(k.anchor(x,z),'bush',x*.61);
  const green=['#547953','#79945b','#688559'];
  for(let j=0;j<5;j++){
    const a=-.46+j*.23,ht=h*(.72+.17*((j*3)%4)/2),bend=(j-2)*.11*flip;
    const stalk=k.group(g,a,0,(j%2-.5)*.21);
    k.rod(stalk,[0,0,0],[bend,ht,0],.032,j%2?'#a09662':'#95a16b',5);
    for(let n=1;n<5;n++){
      const t=n*.18,xx=bend*t;
      k.rod(stalk,[xx-.034,ht*t,0],[xx+.034,ht*t,0],.017,p.wood,4);
      const leaf=k.group(stalk,xx,ht*t,0);leaf.rotation.y=(j%3-1)*.38;
      const side=(j+n)%2?1:-1,span=(.24+.08*n)*side,size=ht*(.20+.02*(n%3));
      k.card(leaf,[[0,0],[span*.20,size*.38],[span*.65,size*.77],[span*1.22,size*.97],[span*1.56,size*.81],[span*1.16,size*1.08],[span*.56,size*.94],[span*.07,size*.44]],green[(j+n)%3],.005*j,.019);
    }
    k.card(stalk,[[bend,ht*.86],[bend-.07,ht*1.11],[bend+.035,ht*1.23],[bend+.095,ht*1.09]],'#c1ad74',.017,.023);
  }
}

function casita(k) {
  const g=k.anchor(2.89,-1.58);
  k.box(g,0,.14,.04,4.40,.28,1.82,'#bd8365');
  k.box(g,0,.274,.04,4.52,.065,1.92,p.peach);
  k.box(g,0,1.23,-.23,4.05,1.95,1.14,'#d9918c');
  k.box(g,0,1.31,.354,3.98,1.76,.04,'#de9d95');
  k.box(g,0,2.25,-.20,4.24,.16,1.28,p.ivory);
  k.box(g,0,2.36,-.21,4.32,.10,1.33,p.rose);
  k.box(g,0,2.428,-.20,4.16,.041,1.18,'#d8a19a');
  const bay=k.group(g,-1.28,0,.16);
  k.box(bay,0,1.34,.25,.88,.89,.075,p.ivory);
  k.box(bay,0,1.34,.295,.74,.77,.046,p.jade);
  for(let j=0;j<6;j++)k.box(bay,0,1.04+j*.126,.332,.69,.064,.033,p.mint);
  k.box(bay,0,.855,.28,.98,.095,.17,p.peach);
  k.box(g,-.23,1.10,.405,.76,1.69,.06,p.ivory);
  k.box(g,-.23,1.10,.446,.63,1.56,.031,p.pine);
  for(let j=0;j<4;j++)k.box(g,-.23,.59+j*.31,.469,.48,.20,.02,p.jade);
  k.disc(g,.00,1.05,.496,.035,p.gold,8);
  k.box(g,.98,1.34,.39,1.14,.97,.078,p.ivory);
  k.box(g,.98,1.34,.439,.97,.83,.046,p.slate);
  for(let j=0;j<7;j++)k.box(g,.98,1.00+j*.106,.481,.89,.049,.030,p.mint);
  for(const x of [.67,1.29])k.box(g,x,1.34,.516,.032,.86,.029,p.ivory);
  const awning=k.group(g,.58,1.99,.55);awning.rotation.x=.20;
  k.box(awning,0,0,0,2.83,.10,.85,p.coral);
  for(let j=0;j<11;j++)k.box(awning,-1.30+j*.26,.060,0,.065,.022,.85,'#e9ae94');
  for(const x of [-.78,1.94]){
    k.box(g,x,1.11,.88,.105,1.65,.105,p.ivory);
    k.box(g,x,.40,.88,.183,.21,.18,p.peach);
  }
  k.box(g,.55,.80,.885,2.71,.061,.064,p.ivory);
  for(let j=0;j<9;j++){
    if(j===1||j===2)continue;
    const x=-.69+j*.313;
    k.box(g,x,.559,.885,.043,.46,.042,p.ivory);
  }
  k.box(g,-.29,.13,1.04,.89,.18,.34,p.peach);
  k.box(g,-.29,.055,1.23,1.02,.085,.25,p.ivory);
  for(const [x,z] of [[-1.88,.70],[1.59,.76]]){
    k.card(g,[[x-.15,.29],[x+.15,.29],[x+.21,.61],[x-.21,.61]],p.brick,z,.18);
    const leaves=k.animateAtRest(k.group(g,x,.58,z+.10),'bush',x);
    for(let i=0;i<5;i++){
      const d=(i-2)*.096,high=.80+(i%3)*.09;
      k.rod(leaves,[0,0,0],[d,high-.58,0],.014,p.pine,5);
      k.card(leaves,[[d*.55,.12],[d+.075,high-.50],[d,high-.45],[d-.05,high-.58]],i%2?p.sea:p.jade,.02,.015);
    }
  }
  return g;
}

function weddingBandstand(k) {
  const g=k.anchor(-3.85,-.76);
  k.box(g,0,.063,0,2.68,.126,1.48,'#b8876b');
  k.box(g,0,.128,0,2.73,.033,1.52,p.peach);
  k.box(g,0,.25,-.56,2.66,.30,.28,p.ivory);
  for(const x of [-1.17,1.17]){
    k.box(g,x,.48,-.57,.34,.60,.37,p.peach);
    k.box(g,x,.79,-.57,.43,.085,.44,p.ivory);
  }
  garland(k,g,[-1.20,.84,-.56],[1.20,.84,-.56],.19,7);
  const mic=k.group(g,1.00,.14,.47);
  k.rod(mic,[0,.02,0],[0,1.23,0],.029,p.navy,5);
  k.rod(mic,[0,1.21,0],[-.28,1.34,0],.027,p.slate);
  oblong(k,mic,-.32,1.34,.01,.084,.047,p.ink,10);
  for(const s of [-1,1])k.rod(mic,[0,.17,0],[s*.17,0,.10],.021,p.navy,4);
  return g;
}

function halftime(k){
  cane(k,-4.46,-2.29,1.90);cane(k,-2.73,-2.45,1.66,-1);
  cane(k,4.61,-2.54,2.03,1);cane(k,4.89,.16,1.05,-1);
  const plaza=k.anchor(-2.23,-2.53);
  k.box(plaza,0,.35,0,3.03,.66,.33,p.peach);
  k.box(plaza,0,.72,0,3.13,.10,.40,p.ivory);
  for(let j=0;j<8;j++){
    k.box(plaza,-1.32+j*.37,.83,0,.21,.20,.34,p.peach);
  }
  weddingBandstand(k);
  return {duo:null,player:null,prop:casita(k)};
}

const builds={
  stadium, eddie, 'los-angeles':losAngeles, 'puerto-rico':puertoRico,
  'congress-world':congressWorld, championship, halftime
};

export function modernScene(id,k){
  return builds[id](k);
}
