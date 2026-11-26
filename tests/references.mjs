import assert from 'node:assert/strict';
import {test} from 'node:test';
import {chapters} from '../dist/chapters.js';
import {orderedReferences} from '../dist/references.js';

test('chapter and object sources have titles, publishers and unique URLs',()=>{
  for(const chapter of chapters){
    for(const note of [chapter,...Object.values(chapter.objects)]){
      const urls=new Set();
      for(const [title,publisher,url] of note.sources){
        assert.ok(title && publisher,note.title);
        assert.equal(new URL(url).protocol,'https:',note.title);
        assert.ok(!urls.has(url),note.title);
        urls.add(url);
      }
      assert.ok(urls.size,note.title);
    }
    assert.equal(orderedReferences(chapter.sources)[0][1],'Salsa Vida',chapter.title);
  }
});

test('Salsa Vida comes first and each publisher group keeps its editorial order',()=>{
  const a=['Original program','Archive','https://example.org/program'];
  const b=['Profile','Salsa Vida','https://www.salsavida.com/profile/'];
  const c=['Concert footage','Archive','https://example.org/concert'];
  const d=['Dance style','Salsa Vida','https://www.salsavida.com/style/'];
  const sources=Object.freeze([a,b,c,d]);
  assert.deepEqual(orderedReferences(sources),[b,d,a,c]);
});

test('featured people lead with their own profiles and the halftime recap leads every halftime note',()=>{
  const first=note=>orderedReferences(note.sources)[0];
  const chapter=id=>chapters.find(entry=>entry.id===id);
  const people=[
    [chapter('eddie').objects.duo,'instructors/eddie-torres'],
    [chapter('los-angeles').objects.duo,'instructors/johnny-vazquez'],
    [chapter('stadium').objects.pacheco,'artists/johnny-pacheco'],
    [chapter('stadium').objects.duo,'artists/hector-lavoe'],
    [chapter('stadium').objects.colon,'artists/willie-colon'],
    [chapter('stadium').objects.player,'artists/ray-barretto'],
    [chapter('stadium').objects.mongo,'artists/mongo-santamaria'],
  ];
  for(const [note,path] of people){
    assert.equal(first(note)[2],'https://www.salsavida.com/'+path+'/');
  }
  const halftime=chapter('halftime');
  for(const note of [halftime,...Object.values(halftime.objects)]){
    assert.deepEqual(first(note).slice(0,2),['The salsa dancers at Super Bowl LX','Salsa Vida']);
  }
});
