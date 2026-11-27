import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {chapters as english} from '../dist/chapters.js';
import {languages} from '../dist/languages.js';

const editions=await Promise.all(languages.map(async locale=>({...locale,...await import('../dist'+locale.path+'edition.js')})));

const file = name => readFileSync(new URL('../dist/'+name,import.meta.url),'utf8');
const decode = html => html.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'").replaceAll('&lt;','<').replaceAll('&gt;','>');
const home = 'https://www.salsahistory.com/';

test('the served article matches the current book and asset versions', () => {
  execFileSync(process.execPath,['scripts/build-reading-edition.mjs','--check'],{cwd:new URL('..',import.meta.url)});
});

for(const {path,lang,chapters} of editions)test(lang+' exposes every chapter and card in its canonical article', () => {
  const directory=path.slice(1);
  const canonical=home+directory;
  const html=file(directory+'index.html');
  assert.ok(html.includes('<html lang="'+lang+'">'));
  const reading = decode(html.split('<main id="reading-edition"')[1].split('</main>')[0]);
  const urls = [...file('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
  assert.deepEqual(urls,['','about/'].flatMap(suffix=>languages.map(locale=>home+locale.path.slice(1)+suffix)));
  assert.equal(existsSync(new URL('../dist/chapters/',import.meta.url)),false);
  assert.match(file('robots.txt'),/Sitemap: https:\/\/www\.salsahistory\.com\/sitemap\.xml/);
  assert.equal((html.match(/<h1\b/g)||[]).length,1);
  assert.equal((html.match(/rel="canonical"/g)||[]).length,1);
  assert.ok(html.includes('rel="canonical" href="'+canonical+'"'));
  assert.doesNotMatch(reading,/<details(?! class="language-picker")|href="\/chapters\//);
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)[1]);
  assert.deepEqual(schema.hasPart.map(c=>c.url),chapters.map(c=>canonical+'#'+c.id));
  for (const c of chapters) {
    assert.ok(reading.includes('href="#'+c.id+'"'),c.title);
    const section = reading.split('<section class="reading-chapter" id="'+c.id+'"')[1]?.split('<section class="reading-chapter"')[0];
    assert.ok(section,c.title);
    for (const entry of [c,...Object.values(c.objects)]) {
      for (const part of [entry.title,...entry.copy,...entry.sources.map(([, ,href])=>href)]) {
        assert.ok(section.includes(part),c.title+' / '+part);
      }
      if (entry.video) assert.ok(section.includes('watch?v='+entry.video.id+(entry.video.start?'&t='+entry.video.start+'s':'')));
    }
    assert.ok(section.includes(c.line));
  }
});

test('all six editions name each equivalent page and offer native language links',()=>{
  for(const suffix of ['', 'about/', 'terms/', 'privacy/']){
    for(const locale of editions){
      const prefix=locale.path.slice(1),html=file(prefix+suffix+'index.html');
      for(const {tag,path,name} of languages){
        assert.ok(html.includes('rel="alternate" hreflang="'+tag+'" href="'+home+path.slice(1)+suffix+'"'));
        assert.ok(html.includes('<a href="'+path+suffix+'" hreflang="'+tag+'" lang="'+tag+'"'));
        assert.ok(html.includes('>'+name+'</a>'));
      }
      assert.ok(html.includes('rel="alternate" hreflang="x-default" href="'+home+suffix+'"'));
      assert.ok(html.includes('rel="canonical" href="'+home+prefix+suffix+'"'));
      for(const [,picker] of html.matchAll(/<details class="language-picker"[^>]*>([\s\S]*?)<\/details>/g)){
        assert.equal((picker.match(/hreflang=/g)||[]).length,6);
        assert.equal((picker.match(/aria-current="page"/g)||[]).length,1);
      }
    }
  }
});

test('translations retain every scene, object, video and paragraph',()=>{
  for(const {chapters} of editions){
    for(const [i,c] of english.entries()){
      const local=chapters[i];
      assert.equal(local.id,c.id);
      assert.equal(local.copy.length,c.copy.length);
      assert.deepEqual(Object.keys(local.objects),Object.keys(c.objects));
      for(const [key,card] of Object.entries(c.objects)){
        assert.deepEqual(local.objects[key].video?.id,card.video?.id);
        assert.deepEqual(local.objects[key].video?.start,card.video?.start);
        assert.equal(local.objects[key].copy.length,card.copy.length);
      }
    }
  }
});
test('each edition uses its own illustrations, share links and book covers',async()=>{
  for(const {path,chapters,plateName,bookCopy} of editions){
    const {asset}=await import('../dist'+path+'assets.js');
    assert.equal(bookCopy.back.share.url,home+path.slice(1));
    for(const name of ['front-cover.webp','resting-front.webp','resting-back.webp','motion-front.webp','motion-back.webp','motion-replay.webp',...chapters.flatMap(c=>[plateName(c.id),'ambient-'+c.id+'.avif'])]){
      const url=new URL(asset(name),bookCopy.back.share.url);
      assert.equal(url.pathname,path+'art/'+name);
      assert.match(url.search,/^\?v=[0-9a-f]{12}$/);
      assert.ok(existsSync(new URL('../dist'+url.pathname,import.meta.url)),url.pathname);
    }
  }
});
