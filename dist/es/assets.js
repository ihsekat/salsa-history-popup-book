import {asset as sharedAsset} from '../assets.js?shared';
export function asset(name){
  if(name==='ambient-taino.avif')return '/es/art/'+name+'?v=832b049ad88f';
  if(/^(front-cover\.webp|spread-|resting-|motion-|ambient-)/.test(name))return '/es/art/'+name;
  return sharedAsset(name).replace(/^\.\//,'/');
}
