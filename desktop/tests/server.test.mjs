// Tests for the desktop app's local server (run after `node build.mjs`): node --test tests/*.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const desktop = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const require = createRequire(import.meta.url);
const {startGhostServer, COOKIE_NAME} = require(path.join(desktop, 'out/server.cjs'));
const secret = 'a'.repeat(64), token = 'b'.repeat(64);
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'ghost-desktop-'));
const dirs = {dataDir: path.join(temp, 'data'), stationDir: path.join(temp, 'station')};
const boot = () => startGhostServer({...dirs, webRoot: path.join(desktop, 'out/web'), migrationsDir: path.join(desktop, 'out/migrations'), secret, token, ports: [0]});

// OpenAI is never contacted: requests to api.openai.com are answered by this fake.
const realFetch = globalThis.fetch;
const openAICalls = [];
globalThis.fetch = async (input, init = {}) => {
  const url = typeof input === 'string' ? input : input.url;
  if (!url.startsWith('https://api.openai.com/')) return realFetch(input, init);
  openAICalls.push({url, auth: init.headers?.Authorization, body: JSON.parse(init.body)});
  if (url.endsWith('/responses/input_tokens')) return Response.json({input_tokens: 900});
  const body = JSON.parse(init.body);
  const isSong = !!body.text?.format;
  const song = {songBrief: {title: 'Long Haul Home', audience: 'Drivers', emotion: 'Relief', story: 'A driver rolls in after a long week. The porch light is still on.', reference: 'Original'}, stylePrompt: 'outlaw country, steel guitar, warm male vocal', voice: {type: 'Male', timbre: 'Warm', accent: 'Southern', character: 'Tired but hopeful', delivery: 'Sung'}, structure: {sections: 'Verse, Chorus, Verse, Chorus', targetLength: 'About 2:30', dynamicArc: 'Builds to the last chorus'}, tags: {vocals: '[Male Vocal]', instruments: '[Steel Guitar]', transitions: '[Break]'}, language: 'English', rhymeStyle: 'No deliberate rhyme', negativePrompt: 'no crowd vocals', editing: {keep: 'Story', extend: 'None', fix: 'None'}, mastering: {mix: 'Vocal forward', loudness: 'Measure after audio exists', format: 'WAV planned'}, lyrics: '[Verse]\nMile marker ninety, coffee gone cold\n[Chorus]\nPorch light on', instrumentalPrompt: 'outlaw country instrumental', productionNotes: 'Keep the steel guitar under the vocal.'};
  return Response.json({model: 'gpt-5.6-luna', service_tier: 'default', status: 'completed', usage: {input_tokens: 900, output_tokens: 120}, output: [{type: 'message', role: 'assistant', content: [{type: 'output_text', text: isSong ? JSON.stringify(song) : 'Pull the vocal up 1 dB.'}]}]});
};

let server;
const call = (route, {method = 'GET', body, headers = {}, cookie = true, origin = true} = {}) => realFetch(server.origin + route, {
  method, body,
  headers: {...(cookie ? {cookie: `${COOKIE_NAME}=${token}`} : {}), ...(origin && method !== 'GET' ? {origin: server.origin} : {}), ...(typeof body === 'string' ? {'content-type': 'application/json'} : {}), ...headers},
});

test.before(async () => { server = await boot(); });
test.after(async () => { await server?.close(); globalThis.fetch = realFetch; fs.rmSync(temp, {recursive: true, force: true}); });

test('only the app window (with its cookie) is answered', async () => {
  assert.equal((await call('/workstation', {cookie: false})).status, 403);
  assert.equal((await call('/api/health', {cookie: false})).status, 403);
  const wrongCookie = await realFetch(server.origin + '/workstation', {headers: {cookie: `${COOKIE_NAME}=${'c'.repeat(64)}`}});
  assert.equal(wrongCookie.status, 403);
});

test('pages are served with bundled Bootstrap and fonts (no internet needed)', async () => {
  for (const page of ['/workstation', '/rack', '/manual', '/radio', '/plugin-prompts.html']) {
    const response = await call(page);
    assert.equal(response.status, 200, page);
    const html = await response.text();
    assert.ok(!html.includes('cdn.jsdelivr.net/npm/bootstrap'), page + ' still loads Bootstrap from the internet');
    assert.ok(!html.includes('fonts.googleapis.com/css2'), page + ' still loads fonts from the internet');
  }
  const studio = await (await call('/workstation')).text();
  assert.ok(studio.includes('/vendor/bootstrap.min.css'));
  assert.ok(studio.includes('protected by your Windows account'), 'desktop wording is applied');
  assert.ok(!studio.includes('Reopen Ghost’s website'), 'website wording is replaced');
  assert.ok(studio.includes('GhostImportedPages'), 'HEM ATM and encyclopedia pages are embedded');
  for (const file of ['/vendor/bootstrap.min.css', '/vendor/fonts/space-grotesk.css', '/radio/radio.js', '/radio/globals.css', '/radio/radio.css', '/branding/hem-creative-studio-logo.webp', '/ghost-worklet-bundle.js']) {
    const response = await call(file);
    assert.equal(response.status, 200, file);
    assert.ok((await response.arrayBuffer()).byteLength > 100, file);
  }
  for (const sheet of ['space-grotesk.css', 'hem-atm-fonts.css']) {
    const fontCss = await (await call('/vendor/fonts/' + sheet)).text();
    const files = [...fontCss.matchAll(/url\(\.\/files\/([^)]+\.woff2?)\)/g)].map(m => m[1]);
    assert.ok(files.length >= 4, sheet);
    for (const file of files) assert.equal((await call('/vendor/fonts/files/' + file)).status, 200, file);
  }
  assert.ok(studio.includes('/vendor/fonts/hem-atm-fonts.css'), 'HEM ATM fonts are bundled');
});

test('files outside the app folder cannot be read', async () => {
  for (const route of ['/..%2f..%2fpackage.json', '/%2e%2e/%2e%2e/package.json', '/radio/..%2f..%2f..%2fmain.cjs']) assert.equal((await call(route)).status, 404, route);
});

test('Ghost connection: key is saved locked, chat and lyrics work, usage is counted', async () => {
  const health = await (await call('/api/health')).json();
  assert.equal(health.service, 'ghost-daw');
  assert.equal(health.canUseApi, true);
  assert.equal(health.aiConfigured, false);
  assert.equal(health.setupAvailable, true);

  const blocked = await call('/api/connection', {method: 'POST', body: JSON.stringify({apiKey: 'sk-test'}), origin: false});
  assert.equal(blocked.status, 403, 'writes need the app origin');

  const key = 'sk-proj-' + 'Z'.repeat(40);
  const saved = await call('/api/connection', {method: 'POST', body: JSON.stringify({apiKey: key})});
  assert.equal(saved.status, 200);
  assert.equal((await saved.json()).status.aiConfigured, true);
  const dbFile = path.join(dirs.dataDir, 'ghost-studio.sqlite');
  assert.ok(fs.existsSync(dbFile));
  assert.ok(!fs.readFileSync(dbFile).includes(Buffer.from(key)), 'the OpenAI key is not stored in readable form');

  const chat = await call('/api/ghost', {method: 'POST', body: JSON.stringify({message: 'How is my vocal sitting?', context: {bpm: 92}})});
  const reply = await chat.json();
  assert.equal(chat.status, 200, JSON.stringify(reply));
  assert.equal(reply.reply, 'Pull the vocal up 1 dB.');
  assert.equal(reply.budget.requestsToday, 1);
  assert.equal(openAICalls.at(-1).auth, 'Bearer ' + key);

  const lyrics = await call('/api/lyrics', {method: 'POST', body: JSON.stringify({mode: 'create', brief: 'A trucker coming home after a long week', genre: 'Outlaw country'})});
  const song = await lyrics.json();
  assert.equal(lyrics.status, 200, JSON.stringify(song));
  assert.equal(song.task, 'lyrics');
  assert.equal(song.song.songBrief.title, 'Long Haul Home');
  assert.ok(song.reply.includes('SUNO v5.5 MASTER FRAMEWORK'));
  assert.equal(song.budget.requestsToday, 2);
});

async function uploadTrack(name, bytes, title) {
  const info = {title, artist: 'Hybrid Elite Mafia', genre: 'Country', name, audioSize: bytes.length, coverSize: 0, rights: true};
  const session = await (await call('/api/radio/chunks', {method: 'POST', body: JSON.stringify({size: bytes.length, contentType: 'application/octet-stream', uploadInfo: info})})).json();
  assert.ok(session.id, JSON.stringify(session));
  for (let start = 0, part = 0; start < bytes.length; start += session.chunkSize, part++) {
    const response = await call(`/api/radio/chunks?id=${session.id}&part=${part}`, {method: 'PUT', body: bytes.subarray(start, start + session.chunkSize), headers: {'content-type': 'application/octet-stream'}});
    assert.equal(response.status, 200, await response.clone().text());
  }
  for (let step = 0; step < 50; step++) {
    const result = await (await call(`/api/radio/chunks?id=${session.id}`, {method: 'PATCH'})).json();
    if (!result.pending) return result;
  }
  throw new Error('upload never finished');
}

function wav(seconds) {
  const rate = 8000, samples = rate * seconds, data = Buffer.alloc(44 + samples * 2);
  data.write('RIFF', 0); data.writeUInt32LE(36 + samples * 2, 4); data.write('WAVE', 8); data.write('fmt ', 12);
  data.writeUInt32LE(16, 16); data.writeUInt16LE(1, 20); data.writeUInt16LE(1, 22); data.writeUInt32LE(rate, 24); data.writeUInt32LE(rate * 2, 28);
  data.writeUInt16LE(2, 32); data.writeUInt16LE(16, 34); data.write('data', 36); data.writeUInt32LE(samples * 2, 40);
  for (let i = 0; i < samples; i++) data.writeInt16LE(Math.round(Math.sin(i / 8) * 8000), 44 + i * 2);
  return data;
}

test('Radio station: set up, upload, play with seeking, change status, delete, and it survives a restart', async () => {
  let station = await (await call('/api/radio/station')).json();
  assert.equal(station.isOwner, true);
  assert.equal(station.setup, false);
  assert.equal((await call('/api/radio/setup', {method: 'POST'})).status, 200);
  station = await (await call('/api/radio/station')).json();
  assert.equal(station.setup, true);

  const audio = wav(70); // bigger than one 256 KB chunk and spans more than one storage part
  const result = await uploadTrack('long-haul.wav', audio, 'Long Haul');
  assert.equal(result.status, 'approved', JSON.stringify(result));
  station = await (await call('/api/radio/station')).json();
  const track = station.tracks.find(t => t.title === 'Long Haul');
  assert.ok(track);
  assert.equal(track.mime, 'audio/wav');

  const whole = await call('/api/radio/media/' + track.id);
  assert.equal(whole.status, 200);
  assert.ok(Buffer.from(await whole.arrayBuffer()).equals(audio), 'stored audio is byte-identical');
  const part = await call('/api/radio/media/' + track.id, {headers: {range: 'bytes=1000-1999'}});
  assert.equal(part.status, 206);
  assert.ok(Buffer.from(await part.arrayBuffer()).equals(audio.subarray(1000, 2000)));

  assert.equal((await call('/api/radio/genres', {method: 'POST', body: JSON.stringify({name: 'Outlaw Country'})})).status, 200);
  assert.ok((await (await call('/api/radio/station')).json()).genres.includes('Outlaw Country'));
  assert.equal((await call('/api/radio/tracks/' + track.id, {method: 'PATCH', body: JSON.stringify({status: 'pending'})})).status, 200);
  assert.equal((await (await call('/api/radio/station')).json()).tracks.find(t => t.id === track.id).status, 'pending');
  assert.equal((await call('/api/radio/tracks/' + track.id, {method: 'PATCH', body: JSON.stringify({status: 'approved'})})).status, 200);

  const keep = await uploadTrack('keep.wav', wav(2), 'Keeper');
  assert.equal(keep.status, 'approved');
  assert.equal((await call('/api/radio/tracks/' + track.id, {method: 'DELETE'})).status, 200);
  assert.equal((await call('/api/radio/media/' + track.id)).status, 404);
  assert.ok(!fs.existsSync(path.join(dirs.stationDir, 'objects', 'audio', track.id)), 'deleted audio file is gone');

  await server.close();
  server = await boot();
  station = await (await call('/api/radio/station')).json();
  assert.equal(station.setup, true);
  assert.deepEqual(station.tracks.map(t => t.title), ['Keeper']);
  assert.ok(station.genres.includes('Outlaw Country'));
  assert.equal((await (await call('/api/health')).json()).aiConfigured, true, 'saved Ghost connection survives a restart');
  const media = await call('/api/radio/media/' + station.tracks[0].id);
  assert.equal(media.status, 200);
});
