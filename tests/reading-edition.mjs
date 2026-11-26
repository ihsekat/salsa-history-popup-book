import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {chapters} from '../dist/chapters.js';

const file = name => readFileSync(new URL('../dist/'+name,import.meta.url),'utf8');
const decode = html => html.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'").replaceAll('&lt;','<').replaceAll('&gt;','>');
const home = 'https://www.salsahistory.com/';

test('the served article matches the current book and asset versions', () => {
  execFileSync(process.execPath,['scripts/build-reading-edition.mjs','--check'],{cwd:new URL('..',import.meta.url)});
});

test('one canonical article exposes every chapter and card at native anchors', () => {
  const html = file('index.html');
  const reading = decode(html.split('<main id="reading-edition"')[1].split('</main>')[0]);
  const urls = [...file('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
  assert.deepEqual(urls,[home]);
  assert.equal(existsSync(new URL('../dist/chapters/',import.meta.url)),false);
  assert.match(file('robots.txt'),/Sitemap: https:\/\/www\.salsahistory\.com\/sitemap\.xml/);
  assert.equal((html.match(/<h1\b/g)||[]).length,1);
  assert.equal((html.match(/rel="canonical"/g)||[]).length,1);
  assert.ok(html.includes('rel="canonical" href="'+home+'"'));
  assert.doesNotMatch(reading,/<details\b|href="\/chapters\//);
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)[1]);
  assert.deepEqual(schema.hasPart.map(c=>c.url),chapters.map(c=>home+'#'+c.id));
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
