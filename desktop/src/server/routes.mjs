// Runs the app's own API route handlers (the same code the website runs) against the local bindings.
import {createHandler} from '../../../lib/cloud-http.mjs';
import {localEnv, OWNER_HEADERS} from './local-env.mjs';
import * as chunks from '../../../app/api/radio/chunks/route';
import * as genres from '../../../app/api/radio/genres/route';
import * as migration from '../../../app/api/radio/migration/route';
import * as setup from '../../../app/api/radio/setup/route';
import * as station from '../../../app/api/radio/station/route';
import * as upload from '../../../app/api/radio/upload/route';
import * as media from '../../../app/api/radio/media/[id]/route';
import * as tracks from '../../../app/api/radio/tracks/[id]/route';

const json = (data, status) => Response.json(data, {status, headers: {'Cache-Control': 'no-store'}});
const fixed = new Map([
  ['/api/radio/chunks', chunks],
  ['/api/radio/genres', genres],
  ['/api/radio/migration', migration],
  ['/api/radio/setup', setup],
  ['/api/radio/station', station],
  ['/api/radio/upload', upload],
]);
const withId = [[/^\/api\/radio\/media\/([^/]+)$/, media], [/^\/api\/radio\/tracks\/([^/]+)$/, tracks]];
const ghostPaths = new Set(['/api/health', '/api/connection', '/api/ghost', '/api/lyrics']);

export function isApiPath(pathname) {
  return pathname.startsWith('/api/');
}

export async function handleApi(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  if (ghostPaths.has(path)) {
    const headers = new Headers(request.headers);
    for (const [key, value] of Object.entries(OWNER_HEADERS)) headers.set(key, value);
    const init = {method: request.method, headers};
    if (!['GET', 'HEAD'].includes(request.method)) { init.body = request.body; init.duplex = 'half'; }
    return createHandler(localEnv())(new Request(request.url, init));
  }
  const method = request.method === 'HEAD' ? 'GET' : request.method;
  let module = fixed.get(path), params = null;
  if (!module) {
    for (const [pattern, candidate] of withId) {
      const match = pattern.exec(path);
      if (match) { module = candidate; params = {id: decodeURIComponent(match[1])}; break; }
    }
  }
  if (!module) return json({error: 'Unknown Ghost endpoint.'}, 404);
  const handler = module[method];
  if (typeof handler !== 'function') return json({error: 'Method not allowed.'}, 405);
  return params ? handler(request, {params: Promise.resolve(params)}) : handler(request);
}
