// Local stand-in for the Cloudflare R2 bucket binding: objects are plain files in a folder on the PC.
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {Readable} from 'node:stream';

const META = '.r2meta.json';

function safeKey(key) {
  if (typeof key !== 'string' || !key || key.length > 1024) throw new Error('Invalid storage key');
  const parts = key.split('/');
  if (parts.some(p => !p || p === '.' || p === '..' || /[\\:*?"<>|\x00-\x1f]/.test(p) || p.endsWith(META))) throw new Error('Invalid storage key');
  return parts;
}

async function toBuffer(value) {
  if (value == null) return Buffer.alloc(0);
  if (typeof value === 'string') return Buffer.from(value);
  if (Buffer.isBuffer(value)) return value;
  if (value instanceof ArrayBuffer) return Buffer.from(value);
  if (ArrayBuffer.isView(value)) return Buffer.from(value.buffer, value.byteOffset, value.byteLength);
  if (typeof Blob !== 'undefined' && value instanceof Blob) return Buffer.from(await value.arrayBuffer());
  if (typeof value.getReader === 'function') return Buffer.from(await new Response(value).arrayBuffer());
  throw new Error('Unsupported object body');
}

export function createBucket(root) {
  fs.mkdirSync(root, {recursive: true});
  const objectPath = key => path.join(root, 'objects', ...safeKey(key));
  const metaPath = key => objectPath(key) + META;
  const uploadsDir = path.join(root, 'multipart');

  async function readMeta(key) {
    try { return JSON.parse(await fsp.readFile(metaPath(key), 'utf8')); } catch { return {}; }
  }
  async function head(key) {
    let stat;
    try { stat = await fsp.stat(objectPath(key)); } catch { return null; }
    if (!stat.isFile()) return null;
    const meta = await readMeta(key);
    return {key, size: stat.size, uploaded: stat.mtime, httpMetadata: meta.httpMetadata || {}, customMetadata: meta.customMetadata || {}, etag: String(stat.mtimeMs)};
  }
  async function writeAtomic(file, data) {
    await fsp.mkdir(path.dirname(file), {recursive: true});
    const temp = file + '.' + crypto.randomUUID() + '.tmp';
    await fsp.writeFile(temp, data);
    await fsp.rename(temp, file);
  }
  async function put(key, value, options = {}) {
    const data = await toBuffer(value);
    await writeAtomic(objectPath(key), data);
    await writeAtomic(metaPath(key), JSON.stringify({httpMetadata: options.httpMetadata || {}, customMetadata: options.customMetadata || {}}));
    return head(key);
  }
  async function get(key, options = {}) {
    const meta = await head(key);
    if (!meta) return null;
    let start = 0, end = meta.size - 1;
    const range = options.range;
    if (range) {
      if (range.suffix !== undefined) start = Math.max(0, meta.size - range.suffix);
      else {
        start = Math.max(0, range.offset ?? 0);
        if (range.length !== undefined) end = Math.min(meta.size - 1, start + range.length - 1);
      }
    }
    const length = Math.max(0, end - start + 1);
    const file = objectPath(key);
    const stream = () => length === 0 ? Readable.toWeb(Readable.from([])) : Readable.toWeb(fs.createReadStream(file, {start, end}));
    let used = false;
    const take = () => { if (used) throw new TypeError('Body already used'); used = true; };
    return {
      ...meta,
      range: {offset: start, length},
      get body() { take(); return stream(); },
      async arrayBuffer() { take(); const handle = await fsp.open(file, 'r'); try { const buf = Buffer.alloc(length); if (length) await handle.read(buf, 0, length, start); return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength); } finally { await handle.close(); } },
      async text() { return Buffer.from(await this.arrayBuffer()).toString('utf8'); },
    };
  }
  async function remove(keys) {
    for (const key of Array.isArray(keys) ? keys : [keys]) {
      await fsp.rm(objectPath(key), {force: true});
      await fsp.rm(metaPath(key), {force: true});
    }
  }
  function multipart(key, uploadId) {
    safeKey(key);
    if (!/^[a-f0-9-]{36}$/.test(String(uploadId))) throw new Error('Invalid upload id');
    const dir = path.join(uploadsDir, uploadId);
    return {
      key, uploadId,
      async uploadPart(partNumber, value) {
        if (!Number.isInteger(partNumber) || partNumber < 1 || partNumber > 10000) throw new Error('Invalid part number');
        const data = await toBuffer(value);
        await writeAtomic(path.join(dir, String(partNumber).padStart(5, '0') + '.part'), data);
        return {partNumber, etag: crypto.createHash('md5').update(data).digest('hex')};
      },
      async complete(parts) {
        const ordered = [...parts].sort((a, b) => a.partNumber - b.partNumber);
        const buffers = [];
        for (const part of ordered) buffers.push(await fsp.readFile(path.join(dir, String(part.partNumber).padStart(5, '0') + '.part')));
        const info = JSON.parse(await fsp.readFile(path.join(dir, 'upload.json'), 'utf8'));
        await put(key, Buffer.concat(buffers), {httpMetadata: info.httpMetadata});
        await fsp.rm(dir, {recursive: true, force: true});
        return head(key);
      },
      async abort() { await fsp.rm(dir, {recursive: true, force: true}); },
    };
  }
  async function createMultipartUpload(key, options = {}) {
    safeKey(key);
    const uploadId = crypto.randomUUID();
    await writeAtomic(path.join(uploadsDir, uploadId, 'upload.json'), JSON.stringify({key, httpMetadata: options.httpMetadata || {}}));
    return multipart(key, uploadId);
  }
  return {head, put, get, delete: remove, createMultipartUpload, resumeMultipartUpload: multipart, root};
}
