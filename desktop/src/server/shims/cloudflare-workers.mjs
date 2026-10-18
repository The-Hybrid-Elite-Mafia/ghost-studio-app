// Replaces `import {env} from 'cloudflare:workers'` in the desktop build.
import {localEnv} from '../local-env.mjs';
export const env = new Proxy({}, {get: (_, key) => localEnv()[key], has: (_, key) => key in localEnv()});
