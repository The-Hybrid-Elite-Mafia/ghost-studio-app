// HEM rule: Style and Lyrics both start with [START_ON:TRUE][START_ON:"<first sung line>"] and always match.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import server from '../lib/lyrics.mjs';
const client = createRequire(import.meta.url)('../studio/lyrics-core.js');

const pkg = lyrics => ({songBrief: {title: 'T', audience: 'A', emotion: 'E', story: 'S.', reference: 'R'}, stylePrompt: 'outlaw country, steel guitar, warm male vocal', voice: {type: 'a', timbre: 'b', accent: 'c', character: 'd', delivery: 'e'}, structure: {sections: 'a', targetLength: 'b', dynamicArc: 'c'}, tags: {vocals: 'a', instruments: 'b', transitions: 'c'}, language: 'English', rhymeStyle: 'none', negativePrompt: 'no crowd', editing: {keep: 'a', extend: 'b', fix: 'c'}, mastering: {mix: 'a', loudness: 'b', format: 'c'}, lyrics, instrumentalPrompt: 'instrumental', productionNotes: 'notes'});

for (const [name, L] of [['server', server], ['studio', client]]) {
  test(name + ': new song gets the tag with its first sung line in Style and Lyrics', () => {
    const song = L.validateSong(pkg('[Intro]\n[Verse 1]\nMile marker ninety, coffee gone cold\nHeadlights on the gravel'));
    const tag = '[START_ON:TRUE][START_ON:"Mile marker ninety, coffee gone cold"]';
    assert.ok(song.lyrics.startsWith(tag + '\n[Intro]\n[Verse 1]\nMile marker ninety'), song.lyrics);
    assert.equal(song.stylePrompt, tag + ' outlaw country, steel guitar, warm male vocal');
  });

  test(name + ': a tag the model wrote, or an old tag, is replaced, never doubled', () => {
    const song = L.validateSong({...pkg('[START_ON:TRUE][START_ON:"wrong line"]\n[Verse]\nPorch light still on'), stylePrompt: '[START_ON:TRUE][START_ON:"wrong line"] country'});
    assert.equal(song.lyrics, '[START_ON:TRUE][START_ON:"Porch light still on"]\n[Verse]\nPorch light still on');
    assert.equal(song.stylePrompt, '[START_ON:TRUE][START_ON:"Porch light still on"] country');
    assert.equal(song.lyrics.match(/START_ON:TRUE/g).length, 1);
  });

  test(name + ': editing the first line updates both tags; quotes and inline tags are cleaned', () => {
    const song = L.validateSong(pkg('[Verse]\nOld first line'));
    song.lyrics = song.lyrics.replace('\nOld first line', '\n[Soft] She said "stay" by the door');
    L.applyStartOn(song);
    assert.ok(song.lyrics.startsWith('[START_ON:TRUE][START_ON:"She said \'stay\' by the door"]\n'));
    assert.ok(song.stylePrompt.startsWith('[START_ON:TRUE][START_ON:"She said \'stay\' by the door"] '));
    L.applyStartOn(song);
    assert.equal(song.stylePrompt.match(/START_ON:TRUE/g).length, 1, 'applying twice changes nothing');
  });

  test(name + ': a damaged tag line is replaced, not doubled', () => {
    const song = L.validateSong({...pkg('[START_ON:TRUE][START_ON:"broken "quote" here"]\n[Verse]\nReal line'), stylePrompt: '[START_ON:TRUE][START_ON:"broken"] rock'});
    assert.equal(song.lyrics, '[START_ON:TRUE][START_ON:"Real line"]\n[Verse]\nReal line');
    assert.equal(song.stylePrompt, '[START_ON:TRUE][START_ON:"Real line"] rock');
  });

  test(name + ': an instrumental with no sung line gets no tag', () => {
    const song = L.validateSong(pkg('[Intro]\n[Instrumental build]\n[Outro]'));
    assert.ok(!song.lyrics.includes('START_ON'));
    assert.ok(!song.stylePrompt.includes('START_ON'));
  });

  test(name + ': the framework copy box carries the same tag', () => {
    const song = L.validateSong(pkg('[Verse]\nMile marker home'));
    const text = L.format(song);
    assert.ok(text.includes('[START_ON:TRUE][START_ON:"Mile marker home"] outlaw country'));
    assert.ok(text.includes('[START_ON:TRUE][START_ON:"Mile marker home"]\n[Verse]'));
  });
}
