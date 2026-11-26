// Distances are in book units, angles in radians and periods in seconds.
const motions={
  wave:   ['position','x',.14,4],
  cloud:  ['position','x',.20,16],
  canoe:  ['position','y',.047,4],
  ship:   ['rotation','z',.029,8],
  palm:   ['rotation','z',.042,8],
  bush:   ['rotation','z',.054,4],
  rattle: ['rotation','z',.075,.5],
  people: ['rotation','z',.018,8],
  music:  ['rotation','z',.035,4],
  step:   ['rotation','z',.050,4],
  son:    ['rotation','z',.046,8],
  twist:  ['rotation','y',.16,4],
  guiro:  ['rotation','y',.14,8],
  circle: ['rotation','y',.14,8],
  sideStep: ['position','x',.16,8],
  cameraPan: ['rotation','y',.20,8],
  audience: ['position','y',.048,2],
  paper:  ['rotation','z',.036,8],
  flag:   ['rotation','y',.32,4],
  fire:   ['scale','y',.14,2],
  drum:   ['scale','y',.018,2],
  disc:   ['position','y',.052,4],
  cheer:  ['position','y',.14,4],
  judge:  ['rotation','z',.052,8]
};

const tau=2*Math.PI;
export function smoothUnit(t){
  const u=Math.max(0,Math.min(1,t));
  return u*u*(3-2*u);
}

export function paperMotion(node,kind,phase=0){
  if(kind==='reel' || kind==='platter'){
    const axis=kind==='reel'?'z':'y', rest=node.rotation[axis];
    return (seconds,strength)=>{node.rotation[axis]=rest-seconds*tau/4*strength;};
  }
  if(kind==='partnerTurn' || kind==='trophyTurn'){
    const yaw=node.rotation.y, x=node.position.x, dancers=kind==='partnerTurn';
    return (seconds,strength)=>{
      const turn=smoothUnit(((seconds%8)-3.2)/2.5);
      node.rotation.y=yaw+strength*tau*turn;
      if(dancers)node.position.x=x+.13*strength*Math.sin(seconds*tau/4);
    };
  }
  const [property,axis,amplitude,period]=motions[kind];
  const transform=node[property],rest=transform[axis];
  return (seconds,strength)=>{
    let offset=Math.sin(seconds*2*Math.PI/period+phase);
    if(kind==='rattle'){
      // A brief pair of shakes, with a quiet interval between them.
      const beat=seconds%4;
      offset*=beat<1?Math.sin(Math.PI*beat)**2:0;
    }
    if(kind==='audience')offset=(1+offset)/2;
    if(kind==='cheer')offset=Math.max(0,offset)**2;
    if(kind==='fire')offset=.7*offset+.3*Math.sin(seconds*tau+phase*.6);
    transform[axis]=rest+amplitude*strength*offset;
  };
}
