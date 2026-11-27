import {drawCongressMap} from './congress-map.js';
import {chapters,plateName,bookCopy,bookTitle,t,lang} from './edition.js';
import {orderedReferences} from './references.js';
import {asset} from './assets.js';
import {plateBounds} from './plate-bounds.js';
import {artRevisions} from './art-revisions.js';
const $=id=>document.getElementById(id);
const otherPath=lang==='en'?'/es/':'/';
const otherEdition=location.protocol==='file:'?new URL(otherPath,bookCopy.back.share.url).href:otherPath;
const pageCount=index=>t('Page')+' '+(index+1)+' '+t('of')+' '+total;
const icons={
 share:'<path d="M12 14V3m-4 4 4-4 4 4M6 10H4v10h16V10h-2"/>',
 book:'<path d="M3 4.5q4-1.4 8.8 1.2v13Q7.4 16 3 17.5zM21 4.5q-4-1.4-8.8 1.2v13q4.4-2.7 8.8-1.2z"/>',
 reset:'<path d="M3.5 4.5v5h5"/><path d="M3.8 9a8.4 8.4 0 1 1 .7 7.4"/>',
 list:'<g fill="currentColor" stroke="none"><circle cx="4" cy="5.5" r="1.4"/><circle cx="4" cy="12" r="1.4"/><circle cx="4" cy="18.5" r="1.4"/></g><path d="M9 5.5h12M9 12h12M9 18.5h12"/>',
 mute:'<path d="M3 9h4l5-4v14l-5-4H3zM16 9l5 6m0-6-5 6"/>',
 volume:'<path d="M3 9h4l5-4v14l-5-4H3zM15 8q4 4 0 8m3-11q7 7 0 14"/>',
 feather:'<path d="M3 21 16 8M5.5 16.5C3 9 9 4 18 3c2-.2 3.1.7 2.5 3.5C19 14 13 19 5.5 16.5zm5-5 .2 4m2.8-7 .1 3"/>',
 left:'<path d="M19 12H5m6-6-6 6 6 6"/>',right:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
 close:'<path d="m6 6 12 12M18 6 6 18"/>',note:'<path d="M9 16V5l10-2v11M9 8l10-2"/><ellipse cx="6.5" cy="17.5" rx="2.5" ry="1.8"/><ellipse cx="16.5" cy="15.5" rx="2.5" ry="1.8"/>'
};
function icon(name){return '<svg viewBox="0 0 24 24" aria-hidden="true">'+icons[name]+'</svg>';}
document.querySelectorAll('[data-icon]').forEach(el=>{el.innerHTML=icon(el.dataset.icon);});
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let illustrated=false;
let world=null, pos=0, current=-1, anim=0, paperSounds=false, ctx, tipTimer, source=null;
const bounded=v=>Math.max(0,Math.min(chapters.length-1,v));
const number=i=>String(i+1).padStart(2,'0');
const last=chapters.length-1,total=String(chapters.length).padStart(2,'0');
let cover=null,coverAnim=0,transition=false;
let closed=1,coverEdge='front',replayTime=null;
function route(){
  const id=location.hash.slice(1).replace(/^scene\//,'');
  if(id==='back-cover')return last+1;
  return chapters.findIndex(c=>c.id===id);
}
function remember(index,push=true){
  if(route()===index)return;
  const id=index<0?'cover':index>last?'back-cover':chapters[index].id;
  history[push?'pushState':'replaceState'](null,'','#'+id);
}
const markers={};
for(const key of new Set(chapters.flatMap(chapter=>Object.keys(chapter.objects)))){
  const button=$('note-button').content.firstElementChild.cloneNode(true);
  button.dataset.item=key;button.hidden=true;
  $('scene-notes').append(button);markers[key]=button;
}
function placeItem(key,x,y){
  markers[key].style.left=x+'px';markers[key].style.top=y+'px';
}
function hoverItem(key){
  for(const [item,button] of Object.entries(markers))button.classList.toggle('highlight',item===key);
}
function placeIllustratedItems(){
  if(world)return;
  const width=Math.min($('stage').clientWidth,$('stage').clientHeight*16/9),height=width*9/16;
  $('scene-notes').style.width=width+'px';
  for(const [key,story] of Object.entries(chapters[current].objects)){
    const [x,y,w,h]=plateBounds[chapters[current].id]?.[key] || story.flat || [.5,.5,.10,.12];
    placeItem(key,x*width,y*height);
    markers[key].style.zIndex=String(1000-Math.round(w*h*1000));
    markers[key].style.width=Math.max(36,w*width)+'px';markers[key].style.height=Math.max(36,h*height)+'px';
  }
}
let requestedPosition=0,waitingForArt=null,upcomingTimer,upcoming=-1;
function warmNextPage(index){
  const next=!cover && !transition && !anim && Number.isInteger(pos) && index<last?index+1:-1;
  if(next===upcoming)return;
  upcoming=next;clearTimeout(upcomingTimer);
  if(world && next>=0 && !navigator.connection?.saveData){
    upcomingTimer=setTimeout(()=>world?.prepare(next).catch(()=>{}),900);
  }
}
function render(p){
  requestedPosition=bounded(p);
  if(world){
    const indices=[...new Set([Math.floor(requestedPosition),Math.ceil(requestedPosition)])];
    if(indices.some(index=>!world.isReady(index))){
      $('scene-notes').hidden=true;
      const key=indices.join('-');
      if(waitingForArt!==key){
        waitingForArt=key;
        Promise.all(indices.map(index=>world.prepare(index))).then(()=>{
          if(waitingForArt===key)render(requestedPosition);
        }).catch(useFlatEdition);
      }
      return;
    }
  }
  waitingForArt=null;
  pos=requestedPosition;const index=Math.round(pos),c=chapters[index];
  $('scrub').value=pos;$('scrub').setAttribute('aria-valuetext',pageCount(index)+', '+c.title);
  $('prev').setAttribute('aria-label',t(pos===0?'Close to front cover':'Previous page'));
  $('next').setAttribute('aria-label',t(pos===last?'Close book':'Next page'));
  $('next').classList.toggle('finish',pos===last);
  $('prev').disabled=false;$('next').disabled=false;
  $('prev').title=$('prev').getAttribute('aria-label');$('next').title=$('next').getAttribute('aria-label');
  if(current!==index){
    clearTimeout(tipTimer);current=index;
    $('chapter-language').href=otherEdition+'#scene/'+c.id;
    $('folio').textContent=t('CHAPTER')+' '+number(index)+' / '+total+' · '+c.style.toUpperCase();
    $('title').textContent=c.title;$('place').textContent=c.place;$('line').textContent=c.line;
    $('counter').textContent=number(index)+' / '+total;$('listen').innerHTML='<i data-icon="note">'+icon('note')+'</i><span>'+(c.sound||'')+'</span>';
    $('listen').hidden=!c.sound;
    for(const [key,button] of Object.entries(markers)){
      button.hidden=!c.objects[key];
      if(button.hidden)continue;
      button.setAttribute('aria-label',c.objects[key].title);
      button.firstElementChild.textContent=c.objects[key].title;
    }
    placeIllustratedItems();
    $('edition').setAttribute('aria-label',c.alt);
    $('world').setAttribute('aria-label',c.alt+' '+t('Select a glowing object to read its story. Drag the paper to turn. Drag the table to rotate. Arrow keys turn pages. A and D rotate. W and S tilt. Pinch or use the plus and minus keys to zoom. R resets the view.'));
    if(!world)setIllustration(plateName(c.id));
    if(!cover)document.title=c.title+' · '+bookTitle;
  }
  $('scene-notes').hidden=!!cover || transition || !!anim || !Number.isInteger(pos);
  if($('scene-notes').hidden)world?.highlightItem(null);
  drawBook();warmNextPage(index);
}
function audio(){
  try{ctx ||= new (window.AudioContext||window.webkitAudioContext)();if(ctx.state==='suspended')ctx.resume().catch(()=>{});return ctx;}catch{return null;}
}
// Adapted from “Page turned” by Beussa (CC0).
// https://freesound.org/people/Beussa/sounds/749880/
let pageTurnAudio;
function rustle(){
  if(!paperSounds)return;
  pageTurnAudio ||= new Audio(asset('page-turn.wav'));
  pageTurnAudio.currentTime=0;
  pageTurnAudio.play().catch(()=>{});
}
function phrase(i){
  const a=audio();if(!a)return false;
  const phrases=[
    [[0,392],[.13,494],[.27,587],[.49,494],[.64,440],[.82,392]],
    [[0,172],[.17,236],[.34,172],[.56,315],[.67,236],[.86,172]],
    [[0,151],[.23,220],[.40,122],[.58,194],[.78,150],[.91,117]]
  ];
  for(const [delay,freq] of phrases[i]){
    const start=a.currentTime+delay+.015;
    if(i===0){
      const rate=a.sampleRate, length=Math.ceil(rate*.58),buffer=a.createBuffer(1,length,rate);
      const data=buffer.getChannelData(0),period=Math.round(rate/freq);
      for(let n=0;n<period;n++)data[n]=(Math.random()*2-1)*.47;
      for(let n=period;n<length;n++)data[n]=.497*(data[n-period]+data[n-period+1]);
      const pluck=a.createBufferSource(),volume=a.createGain();pluck.buffer=buffer;volume.gain.value=.66;
      pluck.connect(volume).connect(a.destination);pluck.start(start);
      const doubled=a.createBufferSource(),pair=a.createGain();doubled.buffer=buffer;doubled.playbackRate.value=1.006;pair.gain.value=.32;
      doubled.connect(pair).connect(a.destination);doubled.start(start+.007);continue;
    }
    const osc=a.createOscillator(),gain=a.createGain();osc.type='sine';osc.frequency.setValueAtTime(freq*1.35,start);
    osc.frequency.exponentialRampToValueAtTime(freq*.83,start+.10);
    gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(.17,start+.006);
    gain.gain.exponentialRampToValueAtTime(.0001,start+.23);
    osc.connect(gain).connect(a.destination);osc.start(start);osc.stop(start+.45);
    if(i===1){
      const ring=a.createOscillator(),v=a.createGain();ring.type='triangle';ring.frequency.value=freq*2.39;
      v.gain.setValueAtTime(.04,start);v.gain.exponentialRampToValueAtTime(.0001,start+.11);ring.connect(v).connect(a.destination);ring.start(start);ring.stop(start+.12);
    }
  }return true;
}
function playInstrument(){
  if(Math.abs(pos-current)>.04 || !chapters[current].sound)return;
  const c=chapters[current];clearTimeout(tipTimer);world?.play('player');
  if(phrase(['son','palladium','stadium'].indexOf(c.id))){
    $('listen').lastElementChild.textContent=c.heard;
    $('announce').textContent=c.heard+'. '+t('Synthesized instrument illustration.');
  }else $('announce').textContent=t('Sound playback is unavailable.');
  tipTimer=setTimeout(()=>{$('listen').lastElementChild.textContent=chapters[current].sound;},1800);
}
function openItem(key){
  if(cover || transition || anim || !Number.isInteger(pos) || $('dialog').open)return;
  popup('object',markers[key],chapters[current].objects[key]);
}
for(const [key,button] of Object.entries(markers)){
  button.onclick=e=>{if(!world || e.detail===0)openItem(key);};
  button.onfocus=()=>world?.highlightItem(key);
  button.onblur=()=>world?.highlightItem(null);
}
function stop(){if(anim)cancelAnimationFrame(anim);anim=0;}
function scrub(p){if(cover || transition)return;stop();render(p);}
function placeCover(left,top,right,bottom){
  const stage=$('stage'),button=$('cover-button');
  button.style.left=stage.offsetLeft+left+'px';button.style.top=stage.offsetTop+top+'px';
  button.style.width=(right-left)+'px';button.style.height=(bottom-top)+'px';
}
function placeOpeningPrompt(){
  const stage=$('stage'),h=stage.clientHeight;
  const posterHeight=Math.min(stage.clientWidth*2.04*9/16,h);
  // Use the resting illustration for layout even after the live camera takes over.
  $('gate').style.setProperty('--book-bottom',stage.offsetTop+h/2+.358*posterHeight+'px');
}
let nextFilm=null,nextFilmName='';
function preloadFilm(name){
  if(nextFilmName!==name){
    nextFilmName=name;nextFilm=new Image();nextFilm.src=asset('motion-'+name+'.webp');
  }
  return nextFilm;
}
function drawCoverFilm(){
  const visible=!!cover || transition;
  const film=$('cover-film');
  film.hidden=!visible;$('edition').hidden=visible;
  if(!visible){
    if(illustrated && (current===0 || current===last))preloadFilm(current===0?'front':'back');
    return;
  }
  const stage=$('stage'),w=stage.clientWidth,h=stage.clientHeight;
  const spreadWidth=Math.min(w,h*16/9),coverWidth=Math.min(w*2.04,h*16/9);
  const width=spreadWidth+(coverWidth-spreadWidth)*closed,height=width*9/16;
  let picture;
  film.style.width=width+'px';
  const buffering=transition && replayTime===null && nextFilm && (!nextFilm.complete || !nextFilm.naturalWidth);
  film.classList.toggle('paper-opening',!!buffering);
  if(buffering){
    picture='resting-'+coverEdge;
    film.style.backgroundSize='100% 100%';film.style.backgroundPosition='center';
    film.style.setProperty('--opening-angle',((1-closed)*(coverEdge==='front'?-86:86))+'deg');
    $('edition').hidden=false;
  }else if(transition){
    const replay=replayTime!==null;
    const frames=replay?40:24,columns=replay?8:6,rows=frames/columns;
    const n=Math.round((frames-1)*(replay?replayTime:closed));
    picture='motion-'+(replay?'replay':coverEdge);
    film.style.backgroundSize=columns*100+'% '+rows*100+'%';
    film.style.backgroundPosition=(n%columns)*100/(columns-1)+'% '+Math.floor(n/columns)*100/(rows-1)+'%';
  }else{
    picture='resting-'+coverEdge;
    if(illustrated)preloadFilm(coverEdge==='back'?'replay':'front');
    film.style.backgroundSize='100% 100%';film.style.backgroundPosition='center';
  }
  if(film.dataset.picture!==picture){
    film.style.backgroundImage='url("'+asset(picture+'.webp')+'")';film.dataset.picture=picture;
  }
  if(!transition)placeCover((w-width)/2+.301*width,(h-height)/2+.145*height,(w-width)/2+.743*width,(h-height)/2+.858*height);
}
let ambientPlate=null;
let flatOnScreen=true;
function setIllustration(name){
  const page=$('edition');
  if(page.dataset.plate===name)return;
  page.dataset.plate=name;
  page.style.backgroundImage='url("'+asset(name)+'")';
}
function showRestingIllustration(){
  if(!illustrated || current<0)return;
  const id=chapters[current].id;
  let name=plateName(id);
  const moving='ambient-'+id+'.avif';
  const available=artRevisions[lang==='en'?'en':'es'][moving];
  if(available && !cover && !transition && !anim && Number.isInteger(pos) &&
    flatOnScreen && !document.hidden && !$('dialog').open && !reduced.matches && !navigator.connection?.saveData){
    if(ambientPlate?.id!==id){
      if(ambientPlate)ambientPlate.image.onload=null;
      const image=new Image();
      ambientPlate={id,image};
      image.onload=showRestingIllustration;
      image.src=asset(moving);
    }
    const {image}=ambientPlate;
    if(image.complete && image.naturalWidth)name=moving;
  }
  setIllustration(name);
}
function drawIllustratedTurn(){
  showRestingIllustration();
  const flip=$('paper-flip'),lower=Math.floor(pos),fraction=pos-lower;
  const turning=!cover && !transition && fraction>0;
  flip.hidden=!turning;
  $('edition').classList.toggle('turning',turning);
  if(!turning)return;
  if(flip.dataset.lower!==String(lower)){
    flip.dataset.lower=String(lower);
    flip.style.setProperty('--lower-plate','url("'+asset(plateName(chapters[lower].id))+'")');
    flip.style.setProperty('--upper-plate','url("'+asset(plateName(chapters[lower+1].id))+'")');
  }
  const left=fraction>.5;
  flip.dataset.face=left?'left':'right';
  flip.firstElementChild.style.transform='rotateY('+((left?180:0)-180*fraction)+'deg)';
}
function drawBook(){
  if(!world){drawCoverFilm();drawIllustratedTurn();return;}
  $('cover-film').hidden=true;$('edition').hidden=true;
  world.show(pos,closed,coverEdge,!anim && !transition);
  if(replayTime!==null)world.replay(replayTime);
}
let coverIdleTimer;
function showCoverPrompt(){
  clearTimeout(coverIdleTimer);
  if(!cover || transition)return;
  $('gate').classList.remove('idle');
  coverIdleTimer=setTimeout(()=>$('gate').classList.add('idle'),1850);
}
for(const event of ['pointermove','pointerdown','keydown']){
  document.addEventListener(event,showCoverPrompt,{passive:true});
}
const {front,back}=bookCopy;
$('cover-subtitle').textContent=front.subtitle;
$('back-transcript').textContent=back.copy.join(' ');
$('cover-credit').textContent=front.credit.label;
$('cover-credit').href=front.credit.url;
const shareButton=$('share-book');
const shareText=shareButton.querySelector('span');
const shareInput=$('manual-share').querySelector('input');
shareInput.value=back.share.url;
let shareReset;
function resetShare(){
  clearTimeout(shareReset);
  shareText.textContent=back.share.label;
  $('manual-share').hidden=true;
}
async function shareLink(payload){
  if(navigator.share){
    try{await navigator.share(payload);return 'shared';}
    catch(error){if(error.name==='AbortError')return 'cancelled';}
  }
  try{await navigator.clipboard.writeText(payload.url);return 'copied';}
  catch{return 'manual';}
}
shareButton.onclick=async()=>{
  const result=await shareLink({title:bookTitle,url:back.share.url});
  if(cover!=='back' || transition)return;
  if(result==='copied'){
    shareText.textContent=t('Link copied');
    $('announce').textContent=t('Book link copied.');
    clearTimeout(shareReset);shareReset=setTimeout(resetShare,3200);
  }else if(result==='manual'){
    $('manual-share').hidden=false;shareInput.focus();shareInput.select();
  }
};
shareInput.onclick=()=>shareInput.select();
function chapterShare(chapter){
  const controls=$('chapter-share-controls').content.firstElementChild.cloneNode(true);
  const button=controls.querySelector('button'),manual=controls.querySelector('label');
  button.prepend(shareButton.querySelector('[data-icon="share"]').cloneNode(true));
  const input=manual.querySelector('input'),status=controls.querySelector('[role=status]');
  const url=new URL('#scene/'+chapter.id,back.share.url).href;
  input.value=url;input.onclick=()=>input.select();
  button.onclick=async()=>{
    const result=await shareLink({title:chapter.title+' · '+bookTitle,url});
    if(!controls.isConnected || !$('dialog').open)return;
    if(result==='copied')status.textContent=t('Link copied');
    if(result==='manual'){manual.hidden=false;input.focus();input.select();}
  };
  return controls;
}
function gateState(side){
  cover=side;
  const covered=!!side;
  $('reader').classList.toggle('covered',covered);
  for(const element of [$('stage'),document.querySelector('.tools'),document.querySelector('.chapter'),document.querySelector('.bottom')])element.inert=covered;
  $('gate').hidden=!covered;$('cover-button').hidden=transition;
  $('gate').dataset.side=side||'front';
  $('cover-language').href=otherEdition+(side==='back'?'#back-cover':'');
  $('gate').classList.toggle('moving',transition);
  $('cover-action').textContent=side==='back'?back.button:front.button;
  $('cover-subtitle').hidden=side==='back';
  shareButton.hidden=side!=='back';resetShare();
  $('back-transcript').hidden=side!=='back';
  $('cover-colophon').hidden=transition;
  $('cover-button').tabIndex=-1;
  $('cover-button').setAttribute('aria-hidden','true');
  $('cover-prompt').setAttribute('aria-label',side==='back'?back.button:t('Open Illustrated History of Salsa Dance'));
  showCoverPrompt();
  $('cover-button').setAttribute('aria-label',side==='back'?t('Start again'):t('Open Illustrated History of Salsa Dance'));
  if(covered)document.title=(side==='back'?t('Back cover')+' · ':'')+bookTitle;
  else if(current>=0)document.title=chapters[current].title+' · '+bookTitle;
  world?.pause($('dialog').open);
}
function cancelBoundary(){
  cancelAnimationFrame(coverAnim);coverAnim=0;transition=false;replayTime=null;
}
function animateCover(duration,update,finish){
  if(reduced.matches){finish();return;}
  const film=world?null:preloadFilm(replayTime!==null?'replay':coverEdge);
  let start;
  function tick(now){
    if(replayTime!==null && !world && film && !film.complete && !reduced.matches){coverAnim=requestAnimationFrame(tick);return;}
    start??=now;
    const t=reduced.matches?1:Math.min(1,(now-start)/duration);
    if(t===1){finish();return;}
    update(t);
    coverAnim=requestAnimationFrame(tick);
  }
  coverAnim=requestAnimationFrame(tick);
}
function boundary(side,opening,homeUrl){
  if(transition)return;
  stop();transition=true;coverEdge=side;closed=opening?1:0;
  const index=side==='front'?0:last;
  gateState(side);render(index);rustle();
  animateCover(1650,t=>{
    const eased=t*t*(3-2*t);
    closed=opening?1-eased:eased;drawBook();
  },()=>{
    cancelBoundary();closed=opening?0:1;
    gateState(opening?null:side);render(index);
    if(homeUrl){
      history.pushState(null,'',homeUrl);
      world?.reset();
      window.scrollTo(0,0);
    }else remember(opening?index:side==='front'?-1:last+1);
    (opening?$('world').hidden?$('read'):$('world'):$('cover-prompt')).focus({preventScroll:true});
    $('announce').textContent=opening?chapters[index].title:side==='front'?t('Front cover.'):t('Back cover. Start again.');
  });
}
function startAgain(){
  if(transition || cover!=='back')return;
  stop();transition=true;replayTime=0;
  world?.prepare(0).catch(useFlatEdition);
  pageTurnAudio?.pause();
  gateState('back');drawBook();
  animateCover(2700,t=>{
    replayTime=t;
    if(world)world.replay(t);else drawCoverFilm();
  },()=>{
    cancelBoundary();closed=1;coverEdge='front';world?.reset();
    gateState('front');render(0);remember(-1);
    document.title=bookTitle;
    $('cover-prompt').focus({preventScroll:true});$('announce').textContent=t('Front cover. Open the book.');
  });
}
$('cover-button').onclick=()=>cover==='back'?startAgain():boundary('front',true);
$('cover-prompt').onclick=()=>$('cover-button').click();
function restore(){
  if(location.hash==='#cheetah')history.replaceState(null,'','#stadium');
  if($('dialog').open)$('dialog').close();
  stop();cancelBoundary();
  const n=route(),side=n<0?'front':n>last?'back':null;
  closed=side?1:0;coverEdge=side||'front';gateState(side);render(bounded(n));
  if(side)document.title=(side==='back'?t('Back cover')+' · ':'')+bookTitle;
}
function turn(index,update=true){
  if(transition || cover)return;
  if(index<0 || index>last){boundary(index<0?'front':'back',false);return;}
  stop();index=bounded(index);const start=pos;const distance=Math.abs(index-start);
  function finish(){render(index);if(update)remember(index);$('announce').textContent=pageCount(index)+'. '+chapters[index].title+'.';}
  if(distance<.004||distance>1.01){finish();return;}
  rustle();
  if(reduced.matches||!world){finish();return;}
  let begin;const time=Math.min(1560,420+640*distance);
  function tick(now){
    if(world && !world.isReady(index)){
      world.prepare(index).catch(useFlatEdition);
      anim=requestAnimationFrame(tick);return;
    }
    begin??=now;const t=Math.min(1,(now-begin)/time),s=t*t*(3-2*t);render(start+(index-start)*s);if(t<1)anim=requestAnimationFrame(tick);else{anim=0;finish();}}
  anim=requestAnimationFrame(tick);
}
function selectChapter(target){
  $('dialog').close();
  if(Math.abs(target-current)<=1 || reduced.matches){turn(target);return;}
  flipToChapter(target,()=>turn(target));
}

function flipToChapter(target,arrive){
  stop();
  const startPage=pos;
  const count=Math.ceil(Math.abs(target-startPage));
  if(!count || reduced.matches){arrive();return;}
  const direction=Math.sign(target-startPage);
  const edgeDuration=Math.max(155,320-count*11);
  const maxReduction=Math.max(0,Math.min(.48,.16*(count-2)));
  function pageDuration(page){
    const fraction=Math.min(1,Math.abs(page-startPage)/Math.max(1,count-1));
    const ramp=Math.sin(Math.PI*fraction);
    return edgeDuration*(1-maxReduction*ramp*ramp);
  }
  const plates=new Map();
  if(!world){
    for(let page=Math.floor(Math.min(startPage,target));page<=Math.ceil(Math.max(startPage,target));page++){
      const image=new Image();
      image.src=asset(plateName(chapters[page].id));
      plates.set(page,image);
    }
  }
  let from=startPage,progress=0,previous;
  let milliseconds=edgeDuration;
  rustle();
  function tick(now){
    const next=direction>0?Math.floor(from)+1:Math.ceil(from)-1;
    const elapsed=previous===undefined?0:now-previous;
    previous=now;
    if(reduced.matches){stop();arrive();return;}
    if(world && !world.isReady(next)){
      world.prepare(next).catch(useFlatEdition);anim=requestAnimationFrame(tick);return;
    }
    if(!world && plates.has(next) && !plates.get(next).complete){
      anim=requestAnimationFrame(tick);return;
    }
    // Show the bend of each leaf even when building a new 3D scene costs a frame.
    progress=Math.min(1,progress+Math.min(.34,elapsed/milliseconds));
    const eased=progress*progress*(3-2*progress);
    render(from+(next-from)*eased);
    if(progress===1){
      if(next===target){stop();arrive();return;}
      from=next;progress=0;
      milliseconds=pageDuration(from);
    }
    anim=requestAnimationFrame(tick);
  }
  anim=requestAnimationFrame(tick);
}
document.querySelector('.imprint').onclick=event=>{
  if(event.defaultPrevented || event.button!==0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)return;
  event.preventDefault();
  if(cover || transition)return;
  const homeUrl=event.currentTarget.href;
  flipToChapter(0,()=>boundary('front',false,homeUrl));
};
$('prev').onclick=()=>turn(current-1);$('next').onclick=()=>turn(current+1);
$('scrub').oninput=e=>scrub(Number(e.target.value));
$('scrub').onchange=e=>turn(Math.round(Number(e.target.value)));
$('scrub').onkeydown=e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();e.stopPropagation();turn(current+(e.key==='ArrowLeft'?-1:1));}};
$('reset').onclick=()=>{world?.reset();$('announce').textContent=t('View reset.');};
$('listen').onclick=playInstrument;
$('sound').onclick=()=>{
  paperSounds=!paperSounds;$('sound').setAttribute('aria-pressed',String(paperSounds));
  const label=t(paperSounds?'Turn paper sounds off':'Turn paper sounds on');$('sound').title=label;$('sound').setAttribute('aria-label',label);
  $('sound').firstElementChild.innerHTML=icon(paperSounds?'volume':'mute');
  if(paperSounds)rustle();else pageTurnAudio?.pause();
};
let menuThumbnails;
function popup(kind,button,story){
  stop();render(current);source=button;
  const c=chapters[current];
  remember(current,false);world?.pause(true);
  if(kind==='chapters'){
    $('sheet-body').innerHTML='<span class="overline">'+bookCopy.contents.label+'</span><h2 id="dialog-title">'+bookCopy.contents.title+'</h2><div class="chart">'+chapters.map((p,i)=>'<button data-page="'+i+'" '+(i===current?'aria-current="page"':'')+'><img width="64" height="56" decoding="async" data-src="'+asset(plateName(p.id))+'" alt=""><span><small>'+t('CHAPTER')+' '+number(i)+' · '+p.style.toUpperCase()+'</small><strong>'+p.title+'</strong><em>'+p.place+'</em></span></button>').join('')+'</div>';
    $('sheet-body').querySelector('.chart').before(chapterShare(c));
    $('sheet-body').querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>selectChapter(Number(b.dataset.page)));
  }else{
    const entry=story || c;
    const printedLabel=story?t('FROM THE SPREAD')+' · '+c.title:t('CHAPTER')+' '+number(current)+' / '+total+' · '+c.style.toUpperCase();
    const paragraphs=entry.copy.map(p=>'<p class="body-copy">'+p+'</p>').join('');
    $('sheet-body').innerHTML='<span class="overline">'+printedLabel+'</span><h2 id="dialog-title">'+entry.title+'</h2><p class="location">'+c.place+'</p>'+paragraphs+'<div class="source-list"><small>'+t('SOURCES')+'</small></div>';
    const list=$('sheet-body').querySelector('.source-list');
    if(!story){
      const reading=document.createElement('a');
      reading.className='read-chapter-text';
      reading.href='#'+c.id;
      reading.textContent=t('Read this chapter as text');
      reading.onclick=e=>{
        if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
        source=$(c.id);
        $('dialog').close();
      };
      list.before(reading);
    }
    if(entry.video){
      const {id,title,linkOnly,start}=entry.video;
      const link=document.createElement('a');
      link.href='https://www.youtube.com/watch?v='+id+(start?'&t='+start+'s':'');
      link.target='_blank';link.rel='noopener';
      if(linkOnly){
        link.className='watch-video';
        link.textContent=t('Watch on YouTube');
        link.setAttribute('aria-label',title+' · '+link.textContent);
        list.before(link);
      }else{
        const figure=document.createElement('figure');
        figure.className='listening-clip';
        const player=document.createElement('iframe');
        player.title=title;
        player.referrerPolicy='strict-origin-when-cross-origin';
        player.allow='encrypted-media; fullscreen; picture-in-picture';
        player.allowFullscreen=true;
        player.src='https://www.youtube-nocookie.com/embed/'+id;
        const caption=document.createElement('figcaption');
        link.textContent=title+' · '+t('Watch on YouTube');
        caption.append(link);figure.append(player,caption);list.before(figure);
      }
    }
    for(const [title,publisher,url] of orderedReferences(entry.sources)){
      const link=document.createElement('a');
      link.href=url;
      link.target='_blank';
      link.rel='noopener';
      link.textContent=title+' - '+publisher;
      list.append(link);
    }
    if(entry.illustration==='congress-map'){
      const map=drawCongressMap();
      map.className='congress-map';map.setAttribute('role','img');
      map.setAttribute('aria-label',entry.mapAlt);
      $('sheet-body').querySelector('.location').after(map);
    }
  }
  $('dialog').showModal();
  if(kind==='chapters'){
    menuThumbnails=new IntersectionObserver(entries=>{
      for(const {target,isIntersecting} of entries){
        if(!isIntersecting)continue;
        target.src=target.dataset.src;menuThumbnails.unobserve(target);
      }
    },{root:$('dialog'),rootMargin:'100px'});
    for(const image of $('sheet-body').querySelectorAll('.chart img'))menuThumbnails.observe(image);
  }
  showRestingIllustration();$('close').focus({preventScroll:true});$('dialog').scrollTop=0;
}
$('contents').onclick=()=>popup('chapters',$('contents'));$('read').onclick=()=>popup('read',$('read'));
$('close').onclick=()=>$('dialog').close();$('dialog').onclose=()=>{menuThumbnails?.disconnect();$('sheet-body').querySelector('.listening-clip')?.remove();world?.pause(false);showRestingIllustration();source?.focus({preventScroll:true});};
$('dialog').onclick=e=>{if(e.target===$('dialog'))$('dialog').close();};
document.addEventListener('keydown',e=>{
  if(e.target.closest?.('#reading-edition'))return;
  if(e.altKey||e.metaKey||e.ctrlKey||$('dialog').open||e.target===$('scrub')||e.target===shareInput)return;
  const key=e.key.toLowerCase();
  if(transition)return;
  if(cover){
    if(key==='arrowright'){e.preventDefault();$('cover-button').click();}
    else if(key==='arrowleft' && cover==='back'){e.preventDefault();boundary('back',true);}
    return;
  }
  if(key==='arrowleft'||key==='arrowright'){e.preventDefault();turn(current+(key==='arrowleft'?-1:1));}
  else if(e.target===$('world')){
    if(key==='a'||key==='d')world?.nudge(key==='a'?-.15:.15,0);
    if(key==='w'||key==='s')world?.nudge(0,key==='w'?.10:-.10);
    if(key==='+'||key==='=')world?.zoomBy(1.1);
    if(key==='-')world?.zoomBy(1/1.1);
    if(key==='r')world?.reset();
  }
});
window.addEventListener('popstate',restore);
window.addEventListener('hashchange',restore);
function useFlatEdition(error){
  if(illustrated)return;
  console.warn('Showing the illustrated edition.',error);
  flatEdition();render(requestedPosition);
}
function flatEdition(){
  $('world').hidden=true;$('edition').hidden=false;$('reset').hidden=true;$('help').textContent=t('TURN THE PAGES');
  $('edition').removeAttribute('aria-hidden');$('edition').setAttribute('role','img');$('edition').setAttribute('aria-label',chapters[current].alt);
  world?.disposeInput();world=null;illustrated=true;
  $('stage').classList.add('flat-stage');
  $('scene-notes').classList.add('illustrated');
  $('scene-notes').hidden=!!cover;hoverItem(null);placeIllustratedItems();
  new IntersectionObserver(([entry])=>{
    flatOnScreen=entry.isIntersecting;showRestingIllustration();
  }).observe($('stage'));
  document.addEventListener('visibilitychange',showRestingIllustration);
  reduced.addEventListener('change',showRestingIllustration);
  drawBook();

}
$('scrub').max=last;
document.querySelector('.ticks').replaceChildren(...chapters.map(()=>document.createElement('i')));
$('reader').hidden=false;
for(const button of document.querySelectorAll('.view-scene')){
  button.hidden=false;
  button.onclick=()=>{
    remember(chapters.findIndex(c=>c.id===button.dataset.scene));
    restore();
    $('reader').scrollIntoView({block:'start'});
    ($('world').hidden?$('read'):$('world')).focus({preventScroll:true});
  };
}
$('scene-notes').classList.add('illustrated');
restore();
// A language switch opens the scene at the top. Ordinary chapter anchors open the article.
if(location.hash.startsWith('#scene/') && route()>=0 && route()<=last){
  const incoming=location.hash,chapter=chapters[route()].id;
  const settle=()=>{
    if(location.hash===incoming)history.replaceState(null,'','#'+chapter);
  };
  if(document.readyState==='complete')settle();
  else window.addEventListener('pageshow',settle,{once:true});
}
placeOpeningPrompt();
new ResizeObserver(()=>{
  placeOpeningPrompt();
  if(!world){placeIllustratedItems();if(cover)drawCoverFilm();}
}).observe($('stage'));
(async()=>{
  try{
    const {createWorld}=await import('./world.js');
    const built=await createWorld($('world'),{scrub,turn,tap:openItem,placeItem,hoverItem,placeCover},current);
    while(!built.isReady(Math.floor(pos)) || !built.isReady(Math.ceil(pos))){
      await Promise.all([built.prepare(Math.floor(pos)),built.prepare(Math.ceil(pos))]);
    }
    world=built;upcoming=-1;
    $('scene-notes').classList.remove('illustrated');$('scene-notes').style.removeProperty('width');
    for(const button of Object.values(markers))button.removeAttribute('style');
    render(pos);world.pause($('dialog').open);
    $('world').addEventListener('webglcontextlost',event=>{event.preventDefault();useFlatEdition('WebGL context lost');});
  }catch(error){useFlatEdition(error);}
})();

