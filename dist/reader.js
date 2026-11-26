import {drawCongressMap} from './congress-map.js';
import {chapters,plateName,bookCopy} from './chapters.js';
import {orderedReferences} from './references.js';
import {asset} from './assets.js';
import {plateBounds} from './plate-bounds.js';
const $=id=>document.getElementById(id);
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
  const id=location.hash.slice(1);
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
  if(!illustrated)return;
  const width=Math.min($('stage').clientWidth,$('stage').clientHeight*16/9),height=width*9/16;
  $('scene-notes').style.width=width+'px';
  for(const [key,story] of Object.entries(chapters[current].objects)){
    const [x,y,w,h]=plateBounds[chapters[current].id]?.[key] || story.flat || [.5,.5,.10,.12];
    placeItem(key,x*width,y*height);
    markers[key].style.zIndex=String(1000-Math.round(w*h*1000));
    markers[key].style.width=Math.max(36,w*width)+'px';markers[key].style.height=Math.max(36,h*height)+'px';
  }
}
function render(p){
  pos=bounded(p);const index=Math.round(pos),c=chapters[index];
  $('scrub').value=pos;$('scrub').setAttribute('aria-valuetext','Page '+(index+1)+' of '+total+', '+c.title);
  $('prev').setAttribute('aria-label',pos===0?'Close to front cover':'Previous page');
  $('next').setAttribute('aria-label',pos===last?'Close book':'Next page');
  $('next').classList.toggle('finish',pos===last);
  $('prev').disabled=false;$('next').disabled=false;
  $('prev').title=$('prev').getAttribute('aria-label');$('next').title=$('next').getAttribute('aria-label');
  if(current!==index){
    clearTimeout(tipTimer);current=index;
    $('folio').textContent='CHAPTER '+number(index)+' / '+total+' · '+c.style.toUpperCase();
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
    $('world').setAttribute('aria-label',c.alt+' Select a glowing object to read its story. Drag the paper to turn. Drag the table to rotate. Arrow keys turn pages. A and D rotate. W and S tilt. Pinch or use the plus and minus keys to zoom. R resets the view.');
    $('edition').style.backgroundImage='url("'+asset(plateName(c.id))+'")';
    document.title=c.title+' · Illustrated History of Salsa Dance';
  }
  $('scene-notes').hidden=!!cover || transition || (!world && !illustrated) || !Number.isInteger(pos);
  if($('scene-notes').hidden)world?.highlightItem(null);
  drawBook();
}
function audio(){
  try{ctx ||= new (window.AudioContext||window.webkitAudioContext)();if(ctx.state==='suspended')ctx.resume().catch(()=>{});return ctx;}catch{return null;}
}
// Adapted from “Page turned” by Beussa (CC0).
// https://freesound.org/people/Beussa/sounds/749880/
let pageTurnAudio;
function rustle(){
  if(!paperSounds)return;
  pageTurnAudio ||= new Audio(asset('page-turn.wav?v=8c3bcd540185'));
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
    $('announce').textContent=c.heard+'. Synthesized instrument illustration.';
  }else $('announce').textContent='Sound playback is unavailable.';
  tipTimer=setTimeout(()=>{$('listen').lastElementChild.textContent=chapters[current].sound;},1800);
}
function openItem(key){
  if(cover || transition || !Number.isInteger(pos) || $('dialog').open)return;
  popup('object',markers[key],chapters[current].objects[key]);
}
for(const [key,button] of Object.entries(markers)){
  button.onclick=e=>{if(illustrated || e.detail===0)openItem(key);};
  button.onfocus=()=>world?.highlightItem(key);
  button.onblur=()=>world?.highlightItem(null);
}
function stop(){if(anim)cancelAnimationFrame(anim);anim=0;}
function scrub(p){if(cover || transition)return;stop();render(p);}
function placeCover(left,top,right,bottom){
  const stage=$('stage'),button=$('cover-button');
  $('gate').style.setProperty('--book-bottom',stage.offsetTop+bottom+'px');
  button.style.left=stage.offsetLeft+left+'px';button.style.top=stage.offsetTop+top+'px';
  button.style.width=(right-left)+'px';button.style.height=(bottom-top)+'px';
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
  if(transition){
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
function drawBook(){
  if(!world){drawCoverFilm();return;}
  $('cover-film').hidden=true;$('edition').hidden=true;
  world.show(pos,closed,coverEdge);
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
shareButton.onclick=async()=>{
  const payload={title:'Illustrated History of Salsa Dance',url:back.share.url};
  if(navigator.share){
    try{await navigator.share(payload);return;}
    catch(error){if(error.name==='AbortError')return;}
  }
  if(cover!=='back' || transition)return;
  try{
    await navigator.clipboard.writeText(payload.url);
    if(cover!=='back' || transition)return;
    shareText.textContent='Link copied';
    $('announce').textContent='Book link copied.';
    clearTimeout(shareReset);shareReset=setTimeout(resetShare,3200);
  }catch{
    if(cover!=='back' || transition)return;
    $('manual-share').hidden=false;shareInput.focus();shareInput.select();
  }
};
shareInput.onclick=()=>shareInput.select();
function gateState(side){
  cover=side;
  const covered=!!side;
  $('reader').classList.toggle('covered',covered);
  for(const element of [$('stage'),document.querySelector('.tools'),document.querySelector('.chapter'),document.querySelector('.bottom')])element.inert=covered;
  $('gate').hidden=!covered;$('cover-button').hidden=transition;
  $('gate').dataset.side=side||'front';
  $('gate').classList.toggle('moving',transition);
  $('cover-action').textContent=side==='back'?back.button:front.button;
  $('cover-subtitle').hidden=side==='back';
  shareButton.hidden=side!=='back';resetShare();
  $('back-transcript').hidden=side!=='back';
  $('cover-colophon').hidden=transition;
  $('cover-button').tabIndex=-1;
  $('cover-button').setAttribute('aria-hidden','true');
  $('cover-prompt').setAttribute('aria-label',side==='back'?back.button:'Open Illustrated History of Salsa Dance');
  showCoverPrompt();
  $('cover-button').setAttribute('aria-label',side==='back'?'Start again':'Open Illustrated History of Salsa Dance');
  if(covered)document.title=(side==='back'?'Back cover · ':'')+'Illustrated History of Salsa Dance';
  else if(current>=0)document.title=chapters[current].title+' · Illustrated History of Salsa Dance';
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
    if(!world && film && !film.complete && !reduced.matches){coverAnim=requestAnimationFrame(tick);return;}
    start??=now;
    const t=reduced.matches?1:Math.min(1,(now-start)/duration);
    if(t===1){finish();return;}
    update(t);
    coverAnim=requestAnimationFrame(tick);
  }
  coverAnim=requestAnimationFrame(tick);
}
function boundary(side,opening){
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
    remember(opening?index:side==='front'?-1:last+1);
    (opening?$('world').hidden?$('read'):$('world'):$('cover-prompt')).focus({preventScroll:true});
    $('announce').textContent=opening?chapters[index].title:side==='front'?'Front cover.':'Back cover. Start again.';
  });
}
function startAgain(){
  if(transition || cover!=='back')return;
  stop();transition=true;replayTime=0;
  pageTurnAudio?.pause();
  gateState('back');drawBook();
  animateCover(2700,t=>{
    replayTime=t;
    if(world)world.replay(t);else drawCoverFilm();
  },()=>{
    cancelBoundary();closed=1;coverEdge='front';world?.reset();
    gateState('front');render(0);remember(-1);
    document.title='Illustrated History of Salsa Dance';
    $('cover-prompt').focus({preventScroll:true});$('announce').textContent='Front cover. Open the book.';
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
  if(side)document.title=(side==='back'?'Back cover · ':'')+'Illustrated History of Salsa Dance';
}
function turn(index,update=true){
  if(transition || cover)return;
  if(index<0 || index>last){boundary(index<0?'front':'back',false);return;}
  stop();index=bounded(index);const start=pos;const distance=Math.abs(index-start);
  function finish(){render(index);if(update)remember(index);$('announce').textContent='Page '+(index+1)+' of '+total+'. '+chapters[index].title+'.';}
  if(distance<.004||distance>1.01){finish();return;}
  rustle();
  if(reduced.matches||!world){finish();return;}
  const begin=performance.now(),time=Math.min(1560,420+640*distance);
  function tick(now){const t=Math.min(1,(now-begin)/time),s=t*t*(3-2*t);render(start+(index-start)*s);if(t<1)anim=requestAnimationFrame(tick);else{anim=0;finish();}}
  anim=requestAnimationFrame(tick);
}
$('prev').onclick=()=>turn(current-1);$('next').onclick=()=>turn(current+1);
$('scrub').oninput=e=>scrub(Number(e.target.value));
$('scrub').onchange=e=>turn(Math.round(Number(e.target.value)));
$('scrub').onkeydown=e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();e.stopPropagation();turn(current+(e.key==='ArrowLeft'?-1:1));}};
$('reset').onclick=()=>{world?.reset();$('announce').textContent='View reset.';};
$('listen').onclick=playInstrument;
$('sound').onclick=()=>{
  paperSounds=!paperSounds;$('sound').setAttribute('aria-pressed',String(paperSounds));
  const label='Turn paper sounds '+(paperSounds?'off':'on');$('sound').title=label;$('sound').setAttribute('aria-label',label);
  $('sound').firstElementChild.innerHTML=icon(paperSounds?'volume':'mute');
  if(paperSounds)rustle();else pageTurnAudio?.pause();
};
function popup(kind,button,story){
  stop();render(current);source=button;
  const c=chapters[current];
  remember(current,false);world?.pause(true);
  if(kind==='chapters'){
    $('sheet-body').innerHTML='<span class="overline">FOLD-OUT CONTENTS</span><h2 id="dialog-title">Inside the book</h2><div class="chart">'+chapters.map((p,i)=>'<button data-page="'+i+'" '+(i===current?'aria-current="page"':'')+'><img loading="lazy" src="'+asset(plateName(p.id))+'" alt=""><span><small>CHAPTER '+number(i)+' · '+p.style.toUpperCase()+'</small><strong>'+p.title+'</strong><em>'+p.place+'</em></span></button>').join('')+'</div>';
    $('sheet-body').querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>{$('dialog').close();turn(Number(b.dataset.page));});
  }else{
    const entry=story || c;
    const printedLabel=story?'FROM THE SPREAD · '+c.title:'CHAPTER '+number(current)+' / '+total+' · '+c.style.toUpperCase();
    const paragraphs=entry.copy.map(p=>'<p class="body-copy">'+p+'</p>').join('');
    $('sheet-body').innerHTML='<span class="overline">'+printedLabel+'</span><h2 id="dialog-title">'+entry.title+'</h2><p class="location">'+c.place+'</p>'+paragraphs+'<div class="source-list"><small>SOURCES</small></div>';
    const list=$('sheet-body').querySelector('.source-list');
    if(!story){
      const reading=document.createElement('a');
      reading.className='read-chapter-text';
      reading.href='#'+c.id;
      reading.textContent='Read this chapter as text';
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
        link.textContent='Watch on YouTube';
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
        link.textContent=title+' · Watch on YouTube';
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
  $('dialog').showModal();$('close').focus({preventScroll:true});$('dialog').scrollTop=0;
}
$('contents').onclick=()=>popup('chapters',$('contents'));$('read').onclick=()=>popup('read',$('read'));
$('close').onclick=()=>$('dialog').close();$('dialog').onclose=()=>{$('sheet-body').querySelector('.listening-clip')?.remove();world?.pause(false);source?.focus({preventScroll:true});};
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
function flatEdition(){
  $('world').hidden=true;$('edition').hidden=false;$('reset').hidden=true;$('help').textContent='TURN THE PAGES';
  $('edition').removeAttribute('aria-hidden');$('edition').setAttribute('role','img');$('edition').setAttribute('aria-label',chapters[current].alt);
  world?.disposeInput();world=null;illustrated=true;
  $('stage').classList.add('flat-stage');
  $('scene-notes').classList.add('illustrated');
  $('scene-notes').hidden=!!cover;hoverItem(null);placeIllustratedItems();
  drawBook();
  new ResizeObserver(()=>{placeIllustratedItems();if(cover)drawCoverFilm();}).observe($('stage'));
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
restore();
(async()=>{
  try{
    const {createWorld}=await import('./world.js');
    world=await createWorld($('world'),{scrub,turn,tap:openItem,placeItem,hoverItem,placeCover});render(pos);world.pause($('dialog').open);
    $('world').addEventListener('webglcontextlost',event=>{event.preventDefault();flatEdition();});
    $('edition').hidden=true;
  }catch(error){console.warn('Showing the illustrated edition.',error);flatEdition();}
})();

