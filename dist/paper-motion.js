// Distances are in book units, angles in radians and periods in seconds.
const motions={
  wave:   ['position','x',.14,4],
  cloud:  ['position','x',.20,16],
  canoe:  ['position','y',.047,4],
  ship:   ['rotation','z',.029,8],
  palm:   ['rotation','z',.042,8],
  bush:   ['rotation','z',.054,4],
  rattle: ['rotation','z',.075,.5],
  people: ['rotation','z',.018,8]
};

export function paperMotion(node,kind,phase=0){
  const [property,axis,amplitude,period]=motions[kind];
  const transform=node[property],rest=transform[axis];
  return (seconds,strength)=>{
    let offset=Math.sin(seconds*2*Math.PI/period+phase);
    if(kind==='rattle'){
      // A brief pair of shakes, with a quiet interval between them.
      const beat=seconds%4;
      offset*=beat<1?Math.sin(Math.PI*beat)**2:0;
    }
    transform[axis]=rest+amplitude*strength*offset;
  };
}
