// Replaces `next/headers` in the desktop build: the desktop app has exactly one user, the studio owner.
import {OWNER_HEADERS} from '../local-env.mjs';
export async function headers() { return new Headers(OWNER_HEADERS); }
export async function cookies() { return {get: () => undefined, getAll: () => [], has: () => false}; }
