// Local web server for the desktop app. Listens on 127.0.0.1 only and answers only the app's own window
// (it must present the per-launch cookie the desktop app sets, and the exact Host it was started on).
import http from 'node:http';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import {Readable} from 'node:stream';
import {handleApi, isApiPath} from './routes.mjs';

export const COOKIE_NAME = 'hem_ghost_desktop';
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff',
  '.pdf': 'application/pdf', '.txt': 'text/plain; charset=utf-8', '.wasm': 'application/wasm', '.mp3': 'audio/mpeg', '.wav': 'audio/wav',
};
const PAGES = new Map([
  ['/', 'rack.html'], ['/rack', 'rack.html'], ['/workstation', 'workstation.html'], ['/manual', 'manual.html'],
  ['/radio', 'radio/index.html'],
]);

function cookieValue(header, name) {
  for (const part of String(header || '').split(';')) {
    const index = part.indexOf('=');
    if (index > 0 && part.slice(0, index).trim() === name) return part.slice(index + 1).trim();
  }
  return null;
}

function staticFile(webRoot, pathname) {
  const page = PAGES.get(pathname);
  const relative = page || decodeURIComponent(pathname).replace(/^\/+/, '');
  if (!relative || relative.includes('\0')) return null;
  const file = path.resolve(webRoot, relative);
  if (file !== webRoot && !file.startsWith(webRoot + path.sep)) return null;
  return file;
}

async function sendStatic(req, res, file) {
  let stat;
  try { stat = await fsp.stat(file); } catch { return false; }
  if (!stat.isFile()) return false;
  const type = TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
  const headers = {'Content-Type': type, 'X-Content-Type-Options': 'nosniff', 'Cache-Control': type.startsWith('text/html') ? 'no-cache' : 'private, max-age=3600', 'Accept-Ranges': 'bytes'};
  let start = 0, end = stat.size - 1, status = 200;
  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
  if (range && (range[1] || range[2])) {
    if (range[1]) { start = Number(range[1]); if (range[2]) end = Math.min(end, Number(range[2])); }
    else start = Math.max(0, stat.size - Number(range[2]));
    if (start > end || start >= stat.size) { res.writeHead(416, {'Content-Range': `bytes */${stat.size}`}); res.end(); return true; }
    status = 206; headers['Content-Range'] = `bytes ${start}-${end}/${stat.size}`;
  }
  headers['Content-Length'] = String(stat.size ? end - start + 1 : 0);
  res.writeHead(status, headers);
  if (req.method === 'HEAD' || !stat.size) { res.end(); return true; }
  fs.createReadStream(file, {start, end}).pipe(res);
  return true;
}

function toRequest(req, origin) {
  const headers = new Headers();
  for (let i = 0; i < req.rawHeaders.length; i += 2) headers.append(req.rawHeaders[i], req.rawHeaders[i + 1]);
  const init = {method: req.method, headers};
  if (!['GET', 'HEAD'].includes(req.method)) { init.body = Readable.toWeb(req); init.duplex = 'half'; }
  return new Request(origin + req.url, init);
}

async function sendResponse(res, response, head) {
  const headers = {};
  response.headers.forEach((value, key) => { headers[key] = value; });
  res.writeHead(response.status, headers);
  if (!response.body || head) { await response.body?.cancel().catch(() => {}); res.end(); return; }
  await new Promise((resolve, reject) => {
    const stream = Readable.fromWeb(response.body);
    stream.on('error', reject); res.on('close', resolve); res.on('finish', resolve);
    stream.pipe(res);
  });
}

export function createAppServer({webRoot, token, log = () => {}}) {
  const root = path.resolve(webRoot);
  let origin = null, host = null;
  const server = http.createServer(async (req, res) => {
    try {
      if (req.headers.host !== host) { res.writeHead(421, {'Content-Type': 'text/plain'}); res.end('Wrong host.'); return; }
      if (!token || cookieValue(req.headers.cookie, COOKIE_NAME) !== token) {
        res.writeHead(403, {'Content-Type': 'text/plain; charset=utf-8'});
        res.end('HEM Ghost Studio only answers its own window. Open the app from its desktop icon.');
        return;
      }
      const url = new URL(req.url, origin);
      if (isApiPath(url.pathname)) {
        const response = await handleApi(toRequest(req, origin));
        await sendResponse(res, response, req.method === 'HEAD');
        return;
      }
      if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return; }
      const file = staticFile(root, url.pathname);
      if (file && await sendStatic(req, res, file)) return;
      res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'});
      res.end('Not found.');
    } catch (error) {
      log('request failed: ' + (error?.stack || error));
      if (!res.headersSent) res.writeHead(500, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({error: 'Ghost Studio hit an unexpected local error. Your files are safe.'}));
    }
  });
  return {
    server,
    async listen(ports) {
      for (const port of ports) {
        try {
          await new Promise((resolve, reject) => {
            const fail = error => { server.off('listening', ok); reject(error); };
            const ok = () => { server.off('error', fail); resolve(); };
            server.once('error', fail); server.once('listening', ok);
            server.listen(port, '127.0.0.1');
          });
          const actual = server.address().port;
          host = `127.0.0.1:${actual}`; origin = `http://${host}`;
          return origin;
        } catch (error) {
          if (error.code !== 'EADDRINUSE') throw error;
          log(`port ${port} is in use, trying the next one`);
        }
      }
      throw new Error('No free local port for Ghost Studio.');
    },
    get origin() { return origin; },
    close: () => new Promise(resolve => server.close(() => resolve())),
  };
}
