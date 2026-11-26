import {cubanIsland} from './island.js';
import {arch,cloud,mountain,palm,shrub} from './cuba.js';

function round(k,g,rt,rb,height,x,y,z,color,n=12){
  return k.mesh(g,new k.THREE.CylinderGeometry(rt,rb,height,n),k.stock(color),x,y,z);
}
function sky(k,x,y,color){
  const sun=k.anchor(x,-2.98);
  k.rod(sun,[0,0,0],[0,y,0],.012,'#bfad82');
  k.disc(sun,0,y,.015,.46,color,36);
}
function ridge(k,x,z,w,h,a,b){
  mountain(k,x,z,w,h,[a,b]);
}
function house(k,x,z,size,taino){
  const g=k.anchor(x,z), body=k.group(g);body.scale.setScalar(size);
  const radius=1.06;
  round(k,body,radius,radius*.96,1.06,0,.53,0,taino?'#bf925d':'#b66946',14);
  for(let i=0;i<28;i++){
    const a=i*Math.PI/14,dx=Math.cos(a),dz=Math.sin(a);
    if(taino)k.rod(body,[dx*radius,0,dz*radius],[dx*radius,1.07,dz*radius],.019,i%3?'#b78b57':'#dbb47d',4);
  }
  for(const h of [.24,.82])round(k,body,radius+.009,radius+.01,.036,0,h,0,taino?'#997647':'#d49968',14);
  k.card(body,[[-.26,0],[-.26,.67],[-.19,.84],[.23,.84],[.26,.64],[.26,0]],'#493d31',radius-.015,.018);
  for(const side of [-1,1])k.rod(body,[side*.28,0,1.04],[side*.28,.87,1.04],.028,'#c5a070',5);
  round(k,body,.12,1.30,1.04,0,1.57,0,'#bb9457',16);
  for(let i=0;i<48;i++){
    const a=i*Math.PI/24,dx=Math.cos(a),dz=Math.sin(a);

    const edge=i%3===0?1.34:1.29;
    k.rod(body,[.13*dx,2.1,.13*dz],[edge*dx,1.02+(i%4)*.016,edge*dz],.021,['#d4b174','#9d784b','#c8a367'][i%3],4);
  }
  round(k,body,.055,.10,.14,0,2.14,0,'#86694c',9);
  return g;
}
function leafTree(k,x,z,h){
  const g=k.anchor(x,z);
  k.rod(g,[0,0,0],[.12,h*.70,0],.11,'#795e43',7);
  for(const [xx,yy,r,col] of [[-.50,.76,.61,'#638062'],[.47,.77,.69,'#6f8c61'],[0,.9,.72,'#819262'],[-.16,.72,.56,'#587b61']]){
    k.rod(g,[.06,h*.46,0],[xx,h*yy,0],.055,'#856347',5);
    k.disc(g,xx,h*yy,-.04,r,col,10);
  }
}
function canoe(k,x,z){
  const g=k.anchor(x,z);g.rotation.y=-.23;
  k.card(g,[[-1.19,.56],[-.78,.34],[.76,.33],[1.17,.56],[.91,.22],[.63,.09],[-.65,.10],[-1,.24]],'#995f37',-.13,.30);
  k.card(g,[[-1.16,.54],[-.79,.30],[.81,.31],[1.14,.54],[.77,.38],[-.73,.40]],'#d09c60',.18,.02);
  for(const xx of [-.4,.3])k.box(g,xx,.33,.01,.095,.055,.38,'#d2a36e');
  k.rod(g,[-.20,.31,.16],[.62,.95,.16],.022,'#825d37',6);
  k.card(g,[[.48,.81],[.57,.81],[.83,1.0],[.83,1.12],[.73,1.10]],'#bc884d',.16,.036);
  return g;
}
function coast(k){
  const shore=cubanIsland(k);
  k.animateAtRest(cloud(k,-3.83,-2.65,2.8,.77),'cloud');
  k.animateAtRest(cloud(k,2.81,-2.72,3.15,.91),'cloud',.85);
  sky(k,-.20,2.9,'#e8b85a');
  for(const [x,z,w] of [[-4.7,.42,1.25],[-2.75,1.45,2.0],[-.77,.86,1.16],[1.01,1.86,1.72],[4.10,1.88,1.18],[-4.6,-1.68,1.23],[-.78,-1.42,1.52]]){
    const wave=k.anchor(x,z);
    k.animateAtRest(wave,'wave',x*.45+z*.2);
    k.card(wave,[[-w/2,0],[-w*.26,.07],[-w*.07,.05],[w*.12,.19],[w*.26,.11],[w*.46,.10],[w/2,.04],[w*.19,.055],[w*.09,.11],[-w*.06,.02]],'#d8dec1',0,.016);
  }
  return {player:shore,prop:k.animateAtRest(canoe(k,2.85,1.53),'canoe',.4)};
}
function gourd(k,g,x,y,z,rx,ry,color){
  const o=k.mesh(g,new k.THREE.SphereGeometry(1,16,12),k.stock(color),x,y,z);
  o.scale.set(rx,ry,rx*.83);return o;
}
function village(k){
  ridge(k,-3.81,-2.92,4,1.58,'#8ba18a','#73957a');ridge(k,1.36,-3.02,5.65,1.52,'#688d78','#537d71');
  k.animateAtRest(palm(k,-4.58,-2.05,2.65),'palm',.2);
  k.animateAtRest(palm(k,4.70,-1.94,2.4),'palm',1.1);
  const dwelling=house(k,2.27,-1.26,1.19,true);house(k,-3.72,-1.36,.77,true);
  for(const [x,z] of [[-5.02,.75],[-4.5,1.35],[-3.95,1.70],[4.72,-.28]]){
    k.animateAtRest(shrub(k,x,z,.74),'bush',x*.6+z);
  }
  const scraper=k.anchor(1.43,1.52), gui=k.group(scraper,0,.63,0);gui.rotation.z=-.65;
  gourd(k,gui,0,0,0,.26,.70,'#c99a4d');
  for(let i=0;i<11;i++){
    const yy=-.37+i*.073, rr=Math.sqrt(1-(yy/.70)**2)*.24;
    k.rod(gui,[-rr*.57,yy,rr*.70],[rr*.65,yy,rr*.70],.019,'#806336',5);
  }
  k.rod(scraper,[-.50,.15,.22],[.61,.93,.22],.025,'#b67e40',6);
  const rattles=k.anchor(4.12,1.72);
  for(const [xx,yy,t] of [[-.29,.72,.27],[.26,.64,-.28]]){
    const g=k.group(rattles,xx,yy,0);g.rotation.z=t;
    k.rod(g,[0,-.67,0],[0,0,0],.052,'#9e7544');
    gourd(k,g,0,.15,0,.22,.295,'#c58a47');
    round(k,g,.091,.086,.064,0,-.12,0,'#dfc58d');
  }
  return {duo:dwelling,player:scraper,prop:k.animateAtRest(rattles,'rattle')};
}
function spanishPrimer(k){
  const primer=k.anchor(-4.33,2.16);
  const book=k.group(primer,0,.028,0);
  book.rotation.set(-.30,-.07,.044);
  const green='#376353',leather='#824b38',gold='#d9ad63',cream='#f8e5ad';
  k.box(book,0,.69,-.12,1.10,1.38,.052,green);
  k.box(book,.012,.69,-.016,1.036,1.305,.17,'#d9bb87');
  for(const z of [-.081,-.040,.003,.042])
    k.box(book,.528,.69,z,.014,1.29,.008,'#ab8b61');
  k.box(book,0,.69,.094,1.10,1.38,.058,green);
  k.box(book,-.494,.69,-.005,.137,1.394,.278,leather);
  for(const y of [.12,.18,1.20,1.26])k.box(book,-.493,y,.139,.128,.025,.018,gold);

  const center=.047;
  for(const y of [.109,1.27])k.box(book,center,y,.131,.859,.024,.012,gold);
  for(const x of [-.379,.472])k.box(book,x,.69,.132,.018,1.175,.012,gold);
  k.label(book,'CARTILLA',center,.929,.156,.841,.217,{ink:cream,font:'Georgia'});
  k.label(book,'A B C',center,.577,.156,.713,.272,{ink:cream,font:'Georgia'});
  for(const side of [-1,1])
    k.box(book,center+side*.137,.310,.138,.17,.016,.012,gold);
  k.box(book,center,.310,.14,.061,.061,.014,gold,Math.PI/4);
  return primer;
}

function spanish(k){
  const patio=k.anchor(2.28,-1.76);
  k.box(patio,0,1.45,-.22,4.98,2.9,.43,'#cc9472');
  k.box(patio,0,2.66,.03,5.05,.24,.13,'#e0b485');
  for(let i=-2;i<=2;i++){
    const x=i*.95;
    k.box(patio,x,1.04,.06,.76,1.83,.08,'#855b44');
    k.box(patio,x,1.04,.12,.57,1.65,.05,'#6b7661');
    arch(k,patio,x,.10,.47,1.48,.51,.12);
    k.box(patio,x,2.34,.03,.34,.35,.075,'#647868');
  }
  k.box(patio,0,2.98,0,5.22,.12,.92,'#aa5b43');
  for(let i=0;i<31;i++)k.rod(patio,[-2.52+i*.167,3,-.36],[-2.52+i*.167,2.91,.45],.055,i%3?'#bd7151':'#d28a5e',6);
  const tower=k.anchor(-3.12,-2.3);
  k.box(tower,0,1.25,0,1.20,2.50,.66,'#d8af82');
  k.box(tower,0,2.65,0,.93,.68,.60,'#c89b72');k.box(tower,0,2.68,.32,.38,.44,.02,'#645f50');
  k.card(tower,[[-.72,2.98],[.02,3.55],[.73,2.98]],'#a15b40',-.36,.78);
  for(const x of [-.36,0,.36])k.box(tower,x,1.70,.34,.13,.40,.03,'#776b55');
  const fountain=k.anchor(-3.60,.30);
  round(k,fountain,.71,.61,.23,0,.12,0,'#b58960');round(k,fountain,.62,.67,.08,0,.24,0,'#9fae95');
  round(k,fountain,.12,.18,.56,0,.52,0,'#ceb18c');round(k,fountain,.45,.16,.17,0,.81,0,'#dec19a');gourd(k,fountain,0,.98,0,.09,.12,'#c4a27c');
  leafTree(k,4.73,-.35,2.15);leafTree(k,-4.89,-1.44,2.31);
  const music=k.anchor(3.35,1.56);
  for(const [index,chords] of [['C','F'],['G','C']].entries()){
    const page=k.group(music,(index-.5)*.78,.53,0);
    page.rotation.y=index?.10:-.10;
    page.rotation.x=-.30;
    k.box(page,0,0,0,.81,.95,.042,index?'#f0dca8':'#fae8b9');
    for(const [bar,chord] of chords.entries()){
      const y=.15-bar*.38;
      k.label(page,chord,-.21,y+.138,.035,.27,.175,{ink:'#70432e'});
      for(let i=0;i<5;i++)k.box(page,0,y-i*.034,.035,.66,.008,.01,'#8d7857');
      for(let n=0;n<3;n++){
        const x=-.24+n*.2,noteY=y-.105+(n+index)%3*.033;
        const note=k.disc(page,x,noteY,.045,.041,'#4b4938',10);note.scale.y=.65;
        k.box(page,x+.03,noteY+.066,.048,.012,.133,.01,'#4b4938');
      }
    }
  }
  return {duo:patio,prop:music,primer:spanishPrimer(k)};
}
function gathering(k){
  ridge(k,-3.4,-2.95,4.79,1.23,'#b9946a','#95855d');ridge(k,2.23,-2.96,5.6,1.48,'#a68d66','#8a795b');
  sky(k,1.02,2.84,'#db995d');leafTree(k,-4.88,-1.85,2.70);
  house(k,-3.27,-1.75,.9,false);house(k,3.47,-1.85,1.02,false);
  const fire=k.anchor(.59,.35);
  for(let i=0;i<8;i++){
    const a=i*Math.PI/4;gourd(k,fire,.36*Math.cos(a),.06,.23*Math.sin(a),.12,.09,'#887963');
  }
  for(let i=0;i<5;i++){
    const f=k.group(fire,(i-2)*.075,.04,.05);f.rotation.y=i*.67;
    const h=[.45,.67,.91,.59,.46][i];
    k.card(f,[[-.13,0],[-.19,.27],[-.05,h*.65],[-.04,h],[.10,h*.67],[.08,.31],[.17,.14],[.10,.02]],i%2?'#efb359':'#c96c44',0,.029);
  }
  const drums=k.anchor(3.35,1.62);
  for(const [x,z,h,r] of [[-.29,.04,1.03,.32],[.35,-.18,1.21,.36]]){
    round(k,drums,r*.68,r*.85,h*.23,x,h*.115,z,'#916644');
    round(k,drums,r,r*.67,h*.74,x,h*.60,z,'#ad7951');
    round(k,drums,r*1.03,r*1.07,.09,x,h*.965,z,'#d7ba87');
    round(k,drums,r*.99,r,.024,x,h*1.01,z,'#ebd3a0');
    for(let j=0;j<12;j++){
      const a=j*Math.PI/6,b=(j+.5)*Math.PI/6;
      k.rod(drums,[x+r*Math.cos(a),h*.90,z+r*Math.sin(a)],[x+r*.71*Math.cos(b),h*.30,z+r*.71*Math.sin(b)],.012,'#e0bd89',5);
    }
  }
  return {player:drums};
}
export function originsScene(id,k){
  return {landfall:coast,taino:village,spain:spanish,africa:gathering}[id](k);
}
