import {asset as sharedAsset} from '../assets.js?shared';
export function asset(name){
  if(/^(front-cover\.webp|spread-|resting-|motion-|ambient-)/.test(name))return '/es/art/'+name;
  return sharedAsset(name).replace(/^\.\//,'/');
}
