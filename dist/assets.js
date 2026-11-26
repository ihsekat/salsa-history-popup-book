import {artRevisions} from './art-revisions.js';
export function asset(name){
  const version=artRevisions.en[name];
  return './art/'+name+(version?'?v='+version:'');
}
