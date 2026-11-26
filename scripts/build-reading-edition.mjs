import {createHash} from 'node:crypto';
import {mkdir, readFile, readdir, writeFile} from 'node:fs/promises';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {bookCopy, chapters, plateName} from '../dist/chapters.js';
import {orderedReferences} from '../dist/references.js';
import {asset} from '../dist/assets.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = join(root, 'dist');
const home = bookCopy.back.share.url;
const book = 'Illustrated History of Salsa Dance';
const verify = process.argv.includes('--check');
const esc = text => String(text).replace(/[&<>"']/g, ch => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[ch]));
const absolute = path => new URL(path, home).href;
const paragraphs = copy => copy.map(p => '<p>'+esc(p)+'</p>').join('\n');
const external = (url, label) => '<a href="'+esc(url)+'" target="_blank" rel="noopener">'+esc(label)+'</a>';
const illustration = c => asset(plateName(c.id));
const digest = async file => createHash('sha256').update(await readFile(join(dist, file))).digest('hex').slice(0,12);
const legalLinks = '<nav class="legal-links" aria-label="Site information"><span>© 2026 Salsa Vida</span><span aria-hidden="true">·</span><a href="/about/">About</a><span aria-hidden="true">·</span><a href="/privacy/">Privacy</a><span aria-hidden="true">·</span><a href="/terms/">Terms</a></nav>';

function references(entries) {
  const links = orderedReferences(entries).map(([title, publisher, url]) =>
    '<li>'+external(url, title+' - '+publisher)+'</li>').join('\n');
  return '<div class="citations"><strong>Sources</strong><ul>'+links+'</ul></div>';
}

function chapterBody(chapter) {
  const objects = Object.entries(chapter.objects).map(([key, card]) => {
    const id = chapter.id+'-'+key;
    let media = '';
    if (card.mapAlt) media += '<p>'+esc(card.mapAlt)+'</p>';
    if (card.video) {
      const url = new URL('https://www.youtube.com/watch');
      url.searchParams.set('v', card.video.id);
      if (card.video.start) url.searchParams.set('t', card.video.start+'s');
      media += '<p class="clip-link">'+external(url.href, card.video.title+' · Watch on YouTube')+'</p>';
    }
    return '<section class="printed-card" id="'+id+'"><h3>'+esc(card.title)+'</h3>'+
      paragraphs(card.copy)+media+references(card.sources)+'</section>';
  }).join('\n');
  return paragraphs(chapter.copy)+references(chapter.sources)+objects;
}

function metadata({title, description, path, image, alt, schema, type}) {
  const url = absolute(path);
  return [
    '<title>'+esc(title)+'</title>',
    '<meta name="description" content="'+esc(description)+'">',
    '<link rel="canonical" href="'+esc(url)+'">',
    ...Object.entries({'og:type':type,'og:site_name':book,'og:title':title,'og:description':description,
      'og:url':url,'og:image':absolute(image),'og:image:alt':alt}).map(([key,value]) =>
      '<meta property="'+key+'" content="'+esc(value)+'">'),
    '<meta name="twitter:card" content="summary_large_image">',
    '<script type="application/ld+json">'+JSON.stringify({'@context':'https://schema.org',...schema}).replace(/</g,'\\u003c')+'</script>',
  ].join('\n');
}

const bookEntity = {'@type':'Book','@id':home+'#book',url:home,name:book,inLanguage:'en',
  author:{'@type':'Person',name:'Takeshi Young',url:'https://www.salsavida.com/author/takeshi/'},
  license:'https://creativecommons.org/licenses/by/4.0/',
  publisher:{'@type':'Organization',name:'Salsa Vida',url:bookCopy.front.credit.url}};
const chapterEntity = (c, i) => ({'@type':'Chapter','@id':home+'#'+c.id,
  url:home+'#'+c.id,name:c.title,position:i+1});

function readingChapter(chapter) {
  const id = chapter.id;
  return '<section class="reading-chapter" id="'+id+'" aria-labelledby="'+id+'-title" tabindex="-1">'+
    '<header><p class="print-kicker">'+esc(chapter.pageLabel)+'</p><h2 id="'+id+'-title">'+esc(chapter.title)+'</h2>'+
    '<p class="print-place">'+esc(chapter.place)+'</p><p class="print-deck">'+esc(chapter.line)+'</p>'+
    '<button class="view-scene" type="button" data-scene="'+id+'" hidden>View pop-up scene</button></header>'+
    '<img class="chapter-plate" src="'+esc(illustration(chapter))+'" width="1400" height="788" loading="lazy" decoding="async" alt="'+esc(chapter.alt)+'">'+
    '<div class="chapter-prose">'+chapterBody(chapter)+'</div>'+
    '<a class="back-to-contents" href="#book-contents">Back to contents</a></section>';
}

function homeReading() {
  const links = chapters.map(c => '<li><a href="#'+c.id+'">'+esc(c.title)+'</a></li>').join('\n');
  return '<main id="reading-edition" class="print-edition" tabindex="-1"><article class="print-inner">'+
    '<header class="print-intro"><p class="print-kicker">An illustrated book by '+
    external(bookCopy.front.credit.url,'Salsa Vida')+' · <a href="/about/">About the book</a></p><h1>'+book+'</h1><p class="print-deck">'+
    esc(bookCopy.front.subtitle)+'</p></header>'+
    '<nav id="book-contents" class="article-contents" aria-labelledby="contents-heading" tabindex="-1">'+
    '<h2 id="contents-heading">Contents</h2><ol>'+links+'</ol></nav>'+
    chapters.map(readingChapter).join('\n')+
    '<footer class="print-ending">'+paragraphs(bookCopy.back.copy)+'</footer></article></main>';
}

async function output(name, contents) {
  const file = join(dist,name);
  if (verify) {
    if (await readFile(file,'utf8') !== contents) throw new Error(name+' is stale. Run node scripts/build-reading-edition.mjs');
  } else {
    await mkdir(dirname(file),{recursive:true});
    await writeFile(file,contents);
  }
}

const styleVersion = await digest('style.css');
const imports = {};
for (const name of (await readdir(dist)).filter(s => s.endsWith('.js') && s !== 'reader.js' && s !== 'chapter-paths.js').sort()) {
  imports['./'+name] = './'+name+'?v='+await digest(name);
}
const scripts = '<script type="importmap">\n'+JSON.stringify({imports},null,2)+'\n</script>\n'+
  '<script type="module" src="reader.js?v='+await digest('reader.js')+'"></script>';
const meta = metadata({title:book,description:bookCopy.description,path:'/',image:'/art/resting-front.webp',
  alt:'The closed illustrated salsa history pop-up book',type:'book',schema:{...bookEntity,description:bookCopy.description,hasPart:chapters.map(chapterEntity)}});
const template = await readFile(join(root,'templates/book.html'),'utf8');
const homepage = template.replace('{{META}}',()=>meta).replace('{{STYLE_VERSION}}',styleVersion)
  .replace('{{READING_EDITION}}',homeReading).replaceAll('{{LEGAL_LINKS}}',legalLinks).replace('{{SCRIPTS}}',()=>scripts);
await output('index.html',homepage);
for (const [slug, title] of [['about','About the book'],['privacy','Privacy Policy'],['terms','Terms of Use']]) {
  const body = await readFile(join(root,'templates',slug+'.html'),'utf8');
  const isPolicy = slug !== 'about';
  const pageMeta = isPolicy ? '<meta name="robots" content="noindex,follow">' :
    '<meta name="description" content="Meet the creator of Illustrated History of Salsa Dance, discover the book that inspired it, and get the template to build your own pop-up book.">';
  const date = isPolicy ? '<p class="policy-date">Last updated November 25, 2026</p>' : '';
  await output(slug+'/index.html','<!doctype html>\n<html lang="en"><head><meta charset="utf-8">'+
    '<meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#22392f">'+
    '<title>'+title+' | '+book+'</title>'+pageMeta+
    '<link rel="canonical" href="'+absolute('/'+slug+'/')+'"><link rel="icon" href="/art/book-mark.png">'+
    '<link rel="stylesheet" href="/style.css?v='+styleVersion+'"></head><body class="policy-page"><main>'+
    '<nav aria-label="Book"><a href="/">Illustrated History of Salsa Dance</a></nav><h1>'+title+'</h1>'+
    date+body+'</main></body></html>\n');
}
await output('sitemap.xml','<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+
  '  <url><loc>'+esc(home)+'</loc></url>\n</urlset>\n');
await output('robots.txt','User-agent: *\nAllow: /\n\nSitemap: '+absolute('/sitemap.xml')+'\n');
console.log((verify?'Checked':'Built')+' the single-page book with '+chapters.length+' chapters.');
