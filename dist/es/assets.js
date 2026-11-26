import {asset as sharedAsset} from '../assets.js?shared';
import {artRevisions} from '../art-revisions.js';
export function asset(name){
  const version=artRevisions.es[name];
  if(version)return '/es/art/'+name+'?v='+version;
  if(/^(front-cover\.webp|resting-|motion-)/.test(name))return '/es/art/'+name;
  return sharedAsset(name).replace(/^\.\//,'/');
}
