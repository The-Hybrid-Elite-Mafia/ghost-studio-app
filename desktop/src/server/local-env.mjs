// Holds the local bindings (database, media folder, secret) that replace Cloudflare's.
import {API_OWNER_EMAIL} from '../../../lib/api-owner.mjs';
export const LOCAL_OWNER_ID = 'hem-desktop-owner';
export const OWNER_HEADERS = Object.freeze({'oai-authenticated-user-id': LOCAL_OWNER_ID, 'oai-authenticated-user-email': API_OWNER_EMAIL});
let current = null;
export function setLocalEnv(value) { current = value; }
export function localEnv() {
  if (!current) throw new Error('Ghost Studio storage is not ready yet.');
  return current;
}
