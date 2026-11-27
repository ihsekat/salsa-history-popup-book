import {asset as sharedAsset} from './assets.js?shared';
import {artRevisions} from './art-revisions.js';

export function localizedAsset(code,name) {
  const version=artRevisions[code]?.[name];
  if(version)return '/'+code+'/art/'+name+'?v='+version;
  if(name==='front-cover.webp')return '/'+code+'/art/'+name;
  return sharedAsset(name).replace(/^\.\//,'/');
}
