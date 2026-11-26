import assert from 'node:assert/strict';
import {test} from 'node:test';
import {bookCopy, chapters} from '../dist/chapters.js';

const chapterIds = [
  'landfall', 'taino', 'spain', 'africa', 'son', 'cuban-dances', 'palladium', 'fania',
  'stadium', 'eddie', 'los-angeles', 'cali', 'puerto-rico', 'congress-world', 'championship', 'halftime',
];
const chapter = id => chapters.find(entry => entry.id === id);

test('the sixteen chapters retain their link targets and their printed folios', () => {
  assert.deepEqual(chapters.map(entry => entry.id), chapterIds);
  for (const [index, entry] of chapters.entries()) {
    const folio = String(index + 1).padStart(2, '0');
    assert.equal(entry.pageLabel, `CHAPTER ${folio} / 16 · ${entry.style}`);
    assert.equal(entry.footer[1], `${entry.style} · ${folio}`);
    assert.equal(entry.objectsLabel, `FROM THE SPREAD · ${entry.title}`);
  }
  assert.equal(chapter('championship').footer[0], 'Disney’s Coronado Springs Resort, Florida');
});

test('the new scenes and revised objects retain their artwork keys', () => {
  assert.deepEqual(Object.keys(chapter('cuban-dances').objects), ['rumba', 'charanga', 'record', 'chacha', 'pachanga', 'rueda']);
  assert.deepEqual(Object.keys(chapter('fania').objects), ['founders', 'records', 'band', 'reel']);
  assert.deepEqual(Object.keys(chapter('cali').objects), ['turntable', 'duo', 'team', 'competitions']);
  assert.equal(chapter('spain').objects.primer.title, 'The Spanish reading primer');
  assert.equal(chapter('spain').objects.prop.title, 'The sheet music');
  assert.deepEqual(Object.keys(chapter('africa').objects), ['duo', 'player', 'prop']);
  const drumCopy = chapter('africa').objects.player.copy.join(' ');
  assert.match(drumCopy, /Kongo/);
  assert.match(drumCopy, /Yoruba/);
  assert.match(drumCopy, /bàtá/i);
  assert.deepEqual(Object.keys(chapter('palladium').objects), ['duo', 'player', 'piro']);
  assert.equal(chapter('palladium').objects.player.title, 'Live music');
  assert.equal(chapter('palladium').objects.piro.title, 'Frank “Killer Joe” Piro');
  const congress = chapter('puerto-rico').objects;
  assert.deepEqual(Object.keys(congress), ['workshops', 'social', 'performances', 'competitions']);
  assert.match(congress.competitions.copy.join(' '), /1997.*2002.*World Salsa Open/s);
  assert.equal(chapter('eddie').objects.vhs.title, 'The instructional VHS tape');
  assert.equal(chapter('halftime').objects.duo.title, 'Bad Bunny and Lady Gaga');
});

test('the sound, map, and cover links are available with their approved reader text', () => {
  const sounds = chapters.filter(entry => entry.sound);
  assert.deepEqual(sounds.map(entry => entry.id), ['son', 'palladium', 'stadium']);
  for (const entry of sounds) {
    assert.equal(entry.soundAnnouncement, `${entry.heard}. Synthesized instrument illustration.`);
  }
  const map = chapter('congress-world').objects.prop;
  assert.deepEqual(map.mapLabels, ['US', 'EUROPE', 'ASIA', 'SOUTH AMERICA', 'AFRICA', 'AUSTRALIA']);
  assert.equal(map.mapAlt, 'Six map pins mark the US, Europe, Asia, South America, Africa and Australia.');
  assert.deepEqual(bookCopy.front.credit, bookCopy.back.credit);
  assert.deepEqual(bookCopy.back.share, {label: 'Share this book', url: 'https://www.salsahistory.com/'});
});

test('each video appears on its intended chapter card', () => {
  const clips = chapters.flatMap(c => Object.values(c.objects)
    .filter(card => card.video)
    .map(card => [c.id, card.title, card.video.id]));
  assert.deepEqual(clips, [
    ['son', 'The Cuban tres', 'MPZC9F8G-Fw'],
    ['cuban-dances', 'The cha-cha-cha couple', 'OW_Fv3qfqsE'],
    ['fania', 'The Cheetah film reel', 'W5LAEYGuERo'],
    ['eddie', 'Eddie Torres', 'AQFVCR2v6-w'],
    ['los-angeles', 'Johnny Vázquez', 'VjiQC9v0HZc'],
    ['cali', 'Performances and shows', 'xhkOQioBJIg'],
    ['championship', 'The competing couple', 'lLKwpBAg6WQ'],
    ['halftime', 'Bad Bunny and Lady Gaga', 'G6FuWd4wNd8'],
  ]);
  const watchOnYouTube = chapters.flatMap(c => Object.values(c.objects)
    .filter(card => card.video?.linkOnly).map(card => [card.video.id, card.video.start]));
  assert.deepEqual(watchOnYouTube, [['G6FuWd4wNd8', 320]]);
});
