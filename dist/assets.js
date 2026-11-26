export function asset(name){
  if(name==='ambient-taino.avif')return './art/'+name+'?v=2b9e2c529a48';
  const edition=/^(spread-|motion-|resting-|rueda-)/.test(name)?'?v=9f8989801894':'';
  return './art/'+name+edition;
}
