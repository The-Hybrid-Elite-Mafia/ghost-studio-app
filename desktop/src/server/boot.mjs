// Entry point of the bundled local server (desktop/out/server.cjs).
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import initSqlJs from 'sql.js';
import {openD1} from './d1.mjs';
import {createBucket} from './r2.mjs';
import {setLocalEnv} from './local-env.mjs';
import {createAppServer, COOKIE_NAME} from './app-server.mjs';

export {COOKIE_NAME};
const load = typeof require === 'function' ? require : createRequire(import.meta.url);

export async function startGhostServer({dataDir, stationDir, webRoot, migrationsDir, secret, token, ports = [47821, 47822, 47823, 47824, 0], log = () => {}}) {
  if (!/^[a-f0-9]{64}$/i.test(secret || '')) throw new Error('Ghost Studio needs a 64-character local secret.');
  fs.mkdirSync(dataDir, {recursive: true});
  const wasmBinary = fs.readFileSync(load.resolve('sql.js/dist/sql-wasm.wasm'));
  const DB = await openD1({initSqlJs, wasmBinary, file: path.join(dataDir, 'ghost-studio.sqlite'), migrationsDir});
  const BUCKET = createBucket(stationDir);
  setLocalEnv({DB, BUCKET, GHOST_SECRET_KEY: secret});
  const app = createAppServer({webRoot, token, log});
  const origin = await app.listen(ports);
  log('Ghost Studio local server at ' + origin);
  return {origin, close: async () => { await app.close(); DB.close(); }};
}
