import {createHash} from 'node:crypto';
import {mkdir,readFile,readdir,writeFile} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import * as english from '../dist/edition.js';
import * as spanish from '../dist/es/edition.js';
import {orderedReferences} from '../dist/references.js';

const root=fileURLToPath(new URL('../',import.meta.url));
const dist=join(root,'dist');
const home=english.bookCopy.back.share.url;
const verify=process.argv.includes('--check');
const esc=text=>String(text).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const absolute=path=>new URL(path,home).href;
const paragraphs=copy=>copy.map(p=>'<p>'+esc(p)+'</p>').join('\n');
const external=(url,label)=>'<a href="'+esc(url)+'" target="_blank" rel="noopener">'+esc(label)+'</a>';
const digest=async path=>createHash('sha256').update(await readFile(join(dist,path))).digest('hex').slice(0,12);
const styleVersion=await digest('style.css'),readerVersion=await digest('reader.js');
const template=await readFile(join(root,'templates/book.html'),'utf8');
const infoPages=[['about','About the book'],['privacy','Privacy Policy'],['terms','Terms of Use']];
const alternates=path=>[['en','/'+path],['es','/es/'+path],['x-default','/'+path]];
const headAlternates=path=>alternates(path).map(([lang,url])=>'<link rel="alternate" hreflang="'+lang+'" href="'+absolute(url)+'">').join('\n');

async function output(name,contents){
  const file=join(dist,name);
  if(verify){
    if(await readFile(file,'utf8')!==contents)throw Error(name+' is stale. Run npm run build.');
  }else{
    await mkdir(dirname(file),{recursive:true});
    await writeFile(file,contents);
  }
}

const revisions={};
for(const [language,folder] of [['en','art'],['es','es/art']]){
  const files=(await readdir(join(dist,folder))).filter(name=>name.startsWith('ambient-') || name.startsWith('spread-')).sort();
  revisions[language]=Object.fromEntries(await Promise.all(files.map(async name=>[name,await digest(folder+'/'+name)])));
}
await output('art-revisions.js','export const artRevisions='+JSON.stringify(revisions,null,2)+';\n');
const {asset:englishAsset}=await import('../dist/assets.js');
const {asset:spanishAsset}=await import('../dist/es/assets.js');

async function moduleImports(){
  const imports={};
  for(const folder of ['','es/']){
    for(const name of (await readdir(join(dist,folder))).sort()){
      if(!name.endsWith('.js')||name==='reader.js'||name==='chapter-paths.js')continue;
      const path='/'+folder+name;
      imports[path]=path+'?v='+await digest(folder+name);
    }
  }
  return imports;
}
const allModules=await moduleImports();

async function buildEdition(edition,isSpanish){
  const {bookCopy,bookTitle,chapters,lang,plateName,t}=edition;
  const prefix=isSpanish?'/es/':'/',outDir=isSpanish?'es/':'',other=isSpanish?'/':'/es/';
  const language=isSpanish?'English':'Español',otherLang=isSpanish?'en':'es';
  const asset=isSpanish?spanishAsset:englishAsset;
  const switchLink=(suffix='',id='')=>'<a '+(id?'id="'+id+'" class="language-bubble" ':'')+'href="'+other+suffix+'" hreflang="'+otherLang+'" lang="'+otherLang+'" aria-label="'+language+'" title="'+language+'">'+(id?otherLang.toUpperCase():language)+'</a>';
  const legalLinks='<nav class="legal-links" aria-label="'+t('Site information')+'"><span>© 2026 Salsa Vida</span>'+
    infoPages.map(([slug])=>'<span aria-hidden="true">·</span><a href="'+prefix+slug+'/">'+t({about:'About',privacy:'Privacy',terms:'Terms'}[slug])+'</a>').join('')+'</nav>';
  function references(entries){
    const links=orderedReferences(entries).map(([title,publisher,url])=>'<li>'+external(url,title+' - '+publisher)+'</li>').join('\n');
    return '<div class="citations"><strong>'+t('Sources')+'</strong><ul>'+links+'</ul></div>';
  }
  function chapterBody(c){
    const cards=Object.entries(c.objects).map(([key,card])=>{
      let media=card.mapAlt?'<p>'+esc(card.mapAlt)+'</p>':'';
      if(card.video){
        const url=new URL('https://www.youtube.com/watch');
        url.searchParams.set('v',card.video.id);
        if(card.video.start)url.searchParams.set('t',card.video.start+'s');
        media+='<p class="clip-link">'+external(url.href,card.video.title+' · '+t('Watch on YouTube'))+'</p>';
      }
      return '<section class="printed-card" id="'+c.id+'-'+key+'"><h3>'+esc(card.title)+'</h3>'+paragraphs(card.copy)+media+references(card.sources)+'</section>';
    }).join('\n');
    return paragraphs(c.copy)+references(c.sources)+cards;
  }
  function readingChapter(c){
    return '<section class="reading-chapter" id="'+c.id+'" aria-labelledby="'+c.id+'-title" tabindex="-1">'+
      '<header><p class="print-kicker">'+esc(c.pageLabel)+'</p><h2 id="'+c.id+'-title">'+esc(c.title)+'</h2>'+
      '<p class="print-place">'+esc(c.place)+'</p><p class="print-deck">'+esc(c.line)+'</p>'+
      '<button class="view-scene" type="button" data-scene="'+c.id+'" hidden>'+t('View pop-up scene')+'</button></header>'+
      '<img class="chapter-plate" src="'+esc(asset(plateName(c.id)))+'" width="1400" height="788" loading="lazy" decoding="async" alt="'+esc(c.alt)+'">'+
      '<div class="chapter-prose">'+chapterBody(c)+'</div><a class="back-to-contents" href="#book-contents">'+t('Back to contents')+'</a></section>';
  }
  const links=chapters.map(c=>'<li><a href="#'+c.id+'">'+esc(c.title)+'</a></li>').join('\n');
  const reading='<main id="reading-edition" class="print-edition" tabindex="-1"><article class="print-inner">'+
    '<header class="print-intro"><p class="print-kicker">'+t('An illustrated book by')+' '+external(bookCopy.front.credit.url,'Salsa Vida')+
    ' · <a href="'+prefix+'about/">'+t('About the book')+'</a> · '+switchLink('#reading-edition')+'</p><h1>'+bookTitle+'</h1>'+
    '<p class="print-deck">'+esc(bookCopy.front.subtitle)+'</p></header>'+
    '<nav id="book-contents" class="article-contents" aria-labelledby="contents-heading" tabindex="-1"><h2 id="contents-heading">'+t('Contents')+'</h2><ol>'+
    links+'</ol></nav>'+chapters.map(readingChapter).join('\n')+'<footer class="print-ending">'+paragraphs(bookCopy.back.copy)+legalLinks+'</footer></article></main>';
  const canonical=absolute(prefix);
  const schema={'@context':'https://schema.org','@type':'Book','@id':canonical+'#book',url:canonical,name:bookTitle,inLanguage:lang,
    author:{'@type':'Person',name:'Takeshi Young',url:'https://www.salsavida.com'+prefix+'author/takeshi/'},
    publisher:{'@type':'Organization',name:'Salsa Vida',url:bookCopy.front.credit.url},license:'https://creativecommons.org/licenses/by/4.0/',
    description:bookCopy.description,hasPart:chapters.map((c,i)=>({'@type':'Chapter','@id':canonical+'#'+c.id,url:canonical+'#'+c.id,name:c.title,position:i+1}))};
  const socialImage=absolute('/art/illustrated-history-of-salsa-dance'+(isSpanish?'-es':'')+'.png');
  const socialAlt=t('A couple dances to a guitarist in a paper courtyard inside an open pop-up book.');
  function socialMeta(title,url,type,description){
    const og={'og:type':type,'og:site_name':bookTitle,'og:title':title,'og:url':url,'og:image':socialImage,
      'og:image:type':'image/png','og:image:width':'1731','og:image:height':'909','og:image:alt':socialAlt};
    if(description)og['og:description']=description;
    const twitter={'twitter:card':'summary_large_image','twitter:image':socialImage,'twitter:image:alt':socialAlt};
    return [...Object.entries(og).map(([k,v])=>'<meta property="'+k+'" content="'+esc(v)+'">'),
      ...Object.entries(twitter).map(([k,v])=>'<meta name="'+k+'" content="'+esc(v)+'">')].join('\n');
  }
  const meta=['<title>'+esc(bookTitle)+'</title>','<meta name="description" content="'+esc(bookCopy.description)+'">',
    '<link rel="canonical" href="'+canonical+'">',headAlternates(''),socialMeta(bookTitle,canonical,'book',bookCopy.description),
    '<script type="application/ld+json">'+JSON.stringify(schema).replace(/</g,'\\u003c')+'</script>'].join('\n');
  const imports=Object.fromEntries(Object.entries(allModules).filter(([key])=>isSpanish||!key.startsWith('/es/')));
  if(isSpanish){
    imports['/edition.js']=imports['/es/edition.js'];
    imports['/assets.js']=imports['/es/assets.js'];
  }
  const scripts='<script type="importmap">\n'+JSON.stringify({imports},null,2)+'\n</script>\n'+
    '<script type="module" src="'+(isSpanish?'/':'')+'reader.js?v='+readerVersion+'"></script>';
  const c=chapters[0];
  const fields={LANG:lang,ASSET_ROOT:isSpanish?'/':'',BOOK_TITLE:esc(bookTitle),META:meta,STYLE_VERSION:styleVersion,SUBTITLE:esc(bookCopy.front.subtitle),
    CREDIT:esc(bookCopy.front.credit.label),CREDIT_URL:esc(bookCopy.front.credit.url),FOLIO:esc(c.pageLabel),CHAPTER_TITLE:esc(c.title),
    CHAPTER_PLACE:esc(c.place),CHAPTER_LINE:esc(c.line),PAGE_ONE:t('Page')+' 1 '+t('of')+' '+chapters.length,READING_EDITION:reading,
    CHAPTER_LANGUAGE:switchLink('','chapter-language'),COVER_LANGUAGE:switchLink('','cover-language'),SCRIPTS:scripts};
  await output(outDir+'index.html',template.replace(/\{\{(.*?)\}\}/g,(_,key)=>{
    if(key.startsWith('t|'))return esc(t(key.slice(2)));
    if(!(key in fields))throw Error('Unknown template field '+key);
    return fields[key];
  }));
  for(const [slug,label] of infoPages){
    const title=t(label),body=await readFile(join(root,'templates',outDir,slug+'.html'),'utf8');
    const policy=slug!=='about',description=t('Meet the creator of Illustrated History of Salsa Dance, discover the book that inspired it, and get the template to build your own pop-up book.');
    await output(outDir+slug+'/index.html','<!doctype html>\n<html lang="'+lang+'"><head><meta charset="utf-8">'+
      '<meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#22392f">'+
      '<title>'+esc(title+' | '+bookTitle)+'</title>'+(policy?'<meta name="robots" content="noindex,follow">':'<meta name="description" content="'+esc(description)+'">')+
      '<link rel="canonical" href="'+absolute(prefix+slug+'/')+'">'+headAlternates(slug+'/')+socialMeta(title,absolute(prefix+slug+'/'),'website',policy?'':description)+
      '<link rel="icon" href="/art/book-mark.png"><link rel="stylesheet" href="/style.css?v='+styleVersion+'"></head><body class="policy-page"><main>'+
      '<nav aria-label="'+t('Book')+'"><a href="'+prefix+'">'+bookTitle+'</a>'+switchLink(slug+'/')+'</nav><h1>'+title+'</h1>'+
      (policy?'<p class="policy-date">'+t('Last updated November 25, 2026')+'</p>':'')+body+'</main></body></html>\n');
  }
}
await buildEdition(english,false);
await buildEdition(spanish,true);
const sitemapUrls=['/','/es/'].map(path=>'  <url><loc>'+absolute(path)+'</loc>\n'+alternates('').map(([language,url])=>
  '    <xhtml:link rel="alternate" hreflang="'+language+'" href="'+absolute(url)+'"/>').join('\n')+'\n  </url>');
await output('sitemap.xml','<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'+sitemapUrls.join('\n')+'\n</urlset>\n');
await output('robots.txt','User-agent: *\nAllow: /\n\nSitemap: '+absolute('/sitemap.xml')+'\n');
console.log((verify?'Checked':'Built')+' the English and Spanish editions with '+english.chapters.length+' chapters each.');
