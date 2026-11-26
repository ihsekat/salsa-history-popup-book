export function asset(name){
  const edition=/^(spread-|motion-|resting-|rueda-)/.test(name)?'?v=9f8989801894':'';
  return './art/'+name+edition;
}
