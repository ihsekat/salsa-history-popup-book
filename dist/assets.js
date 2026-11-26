import {artRevisions} from './art-revisions.js';
export function asset(name){
  const version=artRevisions.en[name] || (/^(motion-|resting-|rueda-)/.test(name)?'9f8989801894':'');
  return './art/'+name+(version?'?v='+version:'');
}
