import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {chapters as english} from '../dist/chapters.js';
import {chapters as spanish} from '../dist/es/edition.js';

const file = name => readFileSync(new URL('../dist/'+name,import.meta.url),'utf8');
const decode = html => html.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'").replaceAll('&lt;','<').replaceAll('&gt;','>');
const home = 'https://www.salsahistory.com/';

test('the served article matches the current book and asset versions', () => {
  execFileSync(process.execPath,['scripts/build-reading-edition.mjs','--check'],{cwd:new URL('..',import.meta.url)});
});

for(const [directory,lang,chapters] of [['','en',english],['es/','es-419',spanish]])test(lang+' exposes every chapter and card in its canonical article', () => {
  const canonical=home+directory;
  const html=file(directory+'index.html');
  assert.ok(html.includes('<html lang="'+lang+'">'));
  const reading = decode(html.split('<main id="reading-edition"')[1].split('</main>')[0]);
  const urls = [...file('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
  assert.deepEqual(urls,[home,home+'es/']);
  assert.equal(existsSync(new URL('../dist/chapters/',import.meta.url)),false);
  assert.match(file('robots.txt'),/Sitemap: https:\/\/www\.salsahistory\.com\/sitemap\.xml/);
  assert.equal((html.match(/<h1\b/g)||[]).length,1);
  assert.equal((html.match(/rel="canonical"/g)||[]).length,1);
  assert.ok(html.includes('rel="canonical" href="'+canonical+'"'));
  assert.doesNotMatch(reading,/<details\b|href="\/chapters\//);
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

test('each English and Spanish page names both language versions and its own canonical URL',()=>{
  for(const suffix of ['', 'about/', 'terms/', 'privacy/']){
    for(const prefix of ['', 'es/']){
      const html=file(prefix+suffix+'index.html');
      for(const [lang,path] of [['en',suffix],['es','es/'+suffix],['x-default',suffix]]){
        assert.ok(html.includes('rel="alternate" hreflang="'+lang+'" href="'+home+path+'"'));
      }
      assert.ok(html.includes('rel="canonical" href="'+home+prefix+suffix+'"'));
    }
  }
  for(const [i,c] of english.entries()){
    const es=spanish[i];
    assert.equal(es.id,c.id);
    assert.deepEqual(Object.keys(es.objects),Object.keys(c.objects));
    for(const key of Object.keys(c.objects)){
      assert.deepEqual(es.objects[key].video?.id,c.objects[key].video?.id);
      assert.deepEqual(es.objects[key].video?.start,c.objects[key].video?.start);
      assert.equal(es.objects[key].copy.length,c.objects[key].copy.length);
    }
  }
});
