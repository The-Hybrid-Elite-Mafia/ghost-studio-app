// Builds everything the desktop app ships into desktop/out:
//   out/web/        the studio pages, manual, rack, station page and their files (no internet needed)
//   out/server.cjs  the local server (the website's own API code running on local storage)
//   out/migrations/ database setup files
import fs from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import * as esbuild from 'esbuild';
import postcss from 'postcss';
import tailwind from '@tailwindcss/postcss';

const desktop = path.dirname(fileURLToPath(import.meta.url));
const root = path.dirname(desktop);
const out = path.join(desktop, 'out');
const web = path.join(out, 'web');
const require = createRequire(path.join(desktop, 'package.json'));
const skipStudioBuild = process.argv.includes('--skip-studio-build');

async function copyDir(from, to) {
  await fs.mkdir(to, {recursive: true});
  for (const entry of await fs.readdir(from, {withFileTypes: true})) {
    const a = path.join(from, entry.name), b = path.join(to, entry.name);
    if (entry.isDirectory()) await copyDir(a, b);
    else if (entry.isFile()) await fs.copyFile(a, b);
  }
}

// Internet-only stylesheets the pages use, and the copies bundled with the app that replace them.
// Replaced as plain URLs so links inside the embedded HEM ATM / encyclopedia pages are covered too.
export const LOCAL_STYLESHEETS = [
  ['https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css', '/vendor/bootstrap.min.css'],
  ['https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap', '/vendor/fonts/space-grotesk.css'],
  ['https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Syne:wght@500;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap', '/vendor/fonts/hem-atm-fonts.css'],
];
const FONTS = {
  'space-grotesk.css': [['space-grotesk', [400, 500, 600, 700]]],
  'hem-atm-fonts.css': [['plus-jakarta-sans', [300, 400, 500, 600, 700, 800]], ['syne', [500, 700, 800]], ['jetbrains-mono', [400, 500, 700]]],
};
// Website wording that would be wrong in the desktop app.
export const DESKTOP_WORDING = [
  ['Your key is encrypted on Ghost’s server for your signed-in account.', 'Your key is encrypted on this PC; the lock for it is protected by your Windows account.'],
  ['The key was removed from online Ghost.', 'The key was removed from Ghost Studio on this PC.'],
  ['This is the online app’s estimate, not an account-wide billing limit.', 'This is Ghost Studio’s estimate, not an account-wide billing limit.'],
  ['Lyrics Creator could not reach the online service. Reopen Ghost’s website.', 'Lyrics Creator could not reach Ghost Studio’s local service. Close and reopen the app.'],
  ['Open Ghost from its signed-in website to connect.', 'Open Ghost from the HEM Ghost Studio app to connect.'],
];
export function localizeHead(html) {
  for (const [web, desktop] of DESKTOP_WORDING) html = html.replaceAll(web, desktop);
  for (const [remote, local] of LOCAL_STYLESHEETS) html = html.replaceAll(remote, local).replaceAll(remote.replaceAll('&', '&amp;'), local);
  return html;
}

const shims = {
  name: 'desktop-shims',
  setup(build) {
    build.onResolve({filter: /^cloudflare:workers$/}, () => ({path: path.join(desktop, 'src/server/shims/cloudflare-workers.mjs')}));
    build.onResolve({filter: /^next\/headers$/}, () => ({path: path.join(desktop, 'src/server/shims/next-headers.mjs')}));
    build.onResolve({filter: /^@\//}, async args => {
      const base = path.join(root, args.path.slice(2));
      for (const ext of ['', '.ts', '.tsx', '.mjs', '.js', '/index.ts', '/index.tsx']) if (existsSync(base + ext) && !(await fs.stat(base + ext)).isDirectory()) return {path: base + ext};
      return {errors: [{text: 'Cannot resolve ' + args.path}]};
    });
  },
};

export async function build() {
  if (!skipStudioBuild) execFileSync(process.execPath, ['studio/build.mjs'], {cwd: root, stdio: 'inherit'});
  await fs.rm(out, {recursive: true, force: true});
  await fs.mkdir(web, {recursive: true});

  // Public files first (branding, manual pictures, plugin prompt guide, worklet), then the pages.
  await copyDir(path.join(root, 'public'), web);
  const pages = {'workstation.html': 'studio/index.html', 'rack.html': 'studio/rack-reference.html', 'manual.html': 'studio/manual.html'};
  for (const [name, source] of Object.entries(pages)) await fs.copyFile(path.join(root, source), path.join(web, name));
  for (const name of await fs.readdir(web)) {
    if (!name.endsWith('.html')) continue;
    const file = path.join(web, name), html = await fs.readFile(file, 'utf8'), local = localizeHead(html);
    if (local !== html) await fs.writeFile(file, local);
  }

  // Bootstrap and the fonts, so the pages look the same with no internet. Only the Latin files are shipped.
  await fs.mkdir(path.join(web, 'vendor/fonts/files'), {recursive: true});
  await fs.copyFile(require.resolve('bootstrap/dist/css/bootstrap.min.css'), path.join(web, 'vendor/bootstrap.min.css'));
  await fs.copyFile(require.resolve('bootstrap/LICENSE'), path.join(web, 'vendor/BOOTSTRAP-LICENSE.txt'));
  for (const [cssName, families] of Object.entries(FONTS)) {
    let css = '';
    for (const [family, weights] of families) {
      const dir = path.dirname(require.resolve(`@fontsource/${family}/package.json`));
      for (const weight of weights) {
        const source = await fs.readFile(path.join(dir, weight + '.css'), 'utf8');
        // Keep only the latin and latin-ext blocks; other scripts are not used by the pages.
        const blocks = source.split('/*').filter(b => /^\s*[a-z-]+-(latin|latin-ext)-\d+-normal\s*\*\//.test(b));
        for (const block of blocks) {
          css += '/*' + block;
          for (const match of block.matchAll(/url\(\.\/files\/([^)]+)\)/g)) await fs.copyFile(path.join(dir, 'files', match[1]), path.join(web, 'vendor/fonts/files', match[1]));
        }
      }
      await fs.copyFile(path.join(dir, 'LICENSE'), path.join(web, 'vendor/fonts', family.toUpperCase() + '-LICENSE.txt'));
    }
    if (!css.includes('@font-face')) throw new Error('No font faces found for ' + cssName);
    await fs.writeFile(path.join(web, 'vendor/fonts', cssName), css);
  }

  // Station page: the same React component the website uses, bundled for the desktop.
  await fs.mkdir(path.join(web, 'radio'), {recursive: true});
  await fs.copyFile(path.join(desktop, 'src/radio/index.html'), path.join(web, 'radio/index.html'));
  await esbuild.build({
    entryPoints: [path.join(desktop, 'src/radio/main.tsx')], outfile: path.join(web, 'radio/radio.js'), bundle: true, minify: true,
    format: 'iife', platform: 'browser', target: 'chrome120', jsx: 'automatic', loader: {'.css': 'empty'},
    define: {'process.env.NODE_ENV': '"production"'}, plugins: [shims], logLevel: 'warning', legalComments: 'linked',
  });
  for (const [name, source] of [['globals.css', 'app/globals.css'], ['radio.css', 'app/radio/radio.css']]) {
    const from = path.join(root, source);
    const result = await postcss([tailwind({base: root})]).process(await fs.readFile(from, 'utf8'), {from, to: path.join(web, 'radio', name)});
    await fs.writeFile(path.join(web, 'radio', name), result.css);
  }

  // Local server.
  await esbuild.build({
    entryPoints: [path.join(desktop, 'src/server/boot.mjs')], outfile: path.join(out, 'server.cjs'), bundle: true,
    format: 'cjs', platform: 'node', target: 'node20', external: ['sql.js'], plugins: [shims], logLevel: 'warning', logOverride: {'empty-import-meta': 'silent'}, legalComments: 'none',
  });
  await copyDir(path.join(root, 'drizzle'), path.join(out, 'migrations'));
  await fs.rm(path.join(out, 'migrations/meta'), {recursive: true, force: true});
  console.log('Desktop build ready in ' + out);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await build();
