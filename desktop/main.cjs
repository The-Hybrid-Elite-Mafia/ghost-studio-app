// HEM Ghost Studio — Windows desktop app.
// Starts the local server (127.0.0.1 only, answers only this window) and opens the studio in an app window.
'use strict';
const {app, BrowserWindow, session, shell, safeStorage, dialog, Menu} = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');

const PRODUCT = 'HEM Ghost Studio';
const smokeTest = process.argv.includes('--smoke-test');
const logFile = () => path.join(app.getPath('userData'), 'ghost-studio.log');
function log(message) {
  try { fs.appendFileSync(logFile(), new Date().toISOString() + ' ' + message + '\n'); } catch {}
  if (smokeTest) console.log(message);
}

if (!smokeTest && !app.requestSingleInstanceLock()) app.quit();

// The key that locks your saved OpenAI key in the app's database. Stored with Windows' own
// per-user protection (DPAPI). If Windows can no longer open it, a new one is made and you save your OpenAI key again.
function localSecret() {
  const file = path.join(app.getPath('userData'), 'ghost-secret.bin');
  const plainFile = path.join(app.getPath('userData'), 'ghost-secret.txt');
  const protectedStore = safeStorage.isEncryptionAvailable();
  try {
    if (protectedStore && fs.existsSync(file)) {
      const value = safeStorage.decryptString(fs.readFileSync(file));
      if (/^[a-f0-9]{64}$/.test(value)) return value;
    }
    if (!protectedStore && fs.existsSync(plainFile)) {
      const value = fs.readFileSync(plainFile, 'utf8').trim();
      if (/^[a-f0-9]{64}$/.test(value)) return value;
    }
  } catch (error) {
    log('saved local secret could not be opened, making a new one: ' + error.message);
  }
  const value = crypto.randomBytes(32).toString('hex');
  fs.mkdirSync(app.getPath('userData'), {recursive: true});
  if (protectedStore) fs.writeFileSync(file, safeStorage.encryptString(value));
  else { log('Windows data protection unavailable; storing the local secret as a private file'); fs.writeFileSync(plainFile, value, {mode: 0o600}); }
  return value;
}

let mainWindow = null, server = null, origin = null;
const token = crypto.randomBytes(32).toString('hex');
const sameOrigin = url => { try { return new URL(url).origin === origin; } catch { return false; } };

function windowOptions() {
  return {
    width: 1600, height: 960, minWidth: 1024, minHeight: 640, backgroundColor: '#020507', show: false, autoHideMenuBar: true,
    title: PRODUCT, icon: path.join(__dirname, 'build-resources', 'icon.png'),
    webPreferences: {contextIsolation: true, nodeIntegration: false, sandbox: true, spellcheck: true, backgroundThrottling: false},
  };
}

function guard(contents) {
  contents.setWindowOpenHandler(({url}) => {
    if (sameOrigin(url)) return {action: 'allow', overrideBrowserWindowOptions: {...windowOptions(), show: true}};
    if (/^https?:\/\//i.test(url) || /^mailto:/i.test(url)) shell.openExternal(url);
    return {action: 'deny'};
  });
  contents.on('will-navigate', (event, url) => {
    if (sameOrigin(url)) return;
    event.preventDefault();
    if (/^https?:\/\//i.test(url)) shell.openExternal(url);
  });
}

async function start() {
  const userData = app.getPath('userData');
  const stationDir = path.join(app.getPath('documents'), 'Hybrid Elite Mafia', 'Ghost Studio', 'Station');
  const {startGhostServer, COOKIE_NAME} = require('./out/server.cjs');
  server = await startGhostServer({
    dataDir: userData, stationDir, webRoot: path.join(__dirname, 'out', 'web'), migrationsDir: path.join(__dirname, 'out', 'migrations'),
    secret: localSecret(), token, log,
  });
  origin = server.origin;
  await session.defaultSession.cookies.set({url: origin, name: COOKIE_NAME, value: token, httpOnly: true, sameSite: 'strict', secure: false});

  const allowed = new Set(['media', 'clipboard-read', 'clipboard-sanitized-write', 'fullscreen', 'midi', 'midiSysex', 'notifications', 'speaker-selection']);
  session.defaultSession.setPermissionRequestHandler((contents, permission, callback, details) => callback(sameOrigin(details.requestingUrl || contents.getURL()) && allowed.has(permission)));
  session.defaultSession.setPermissionCheckHandler((contents, permission, requestingOrigin) => requestingOrigin === origin && allowed.has(permission));
  app.on('web-contents-created', (_, contents) => guard(contents));
  // Save windows get a plain title instead of the internal blob:/127.0.0.1 address.
  session.defaultSession.on('will-download', (_, item) => {
    const name = item.getFilename() || 'file';
    item.setSaveDialogOptions({title: 'Save ' + name + ' - ' + PRODUCT, defaultPath: path.join(app.getPath('downloads'), name)});
  });

  Menu.setApplicationMenu(Menu.buildFromTemplate([
    {label: 'File', submenu: [{role: 'quit', label: 'Exit'}]},
    {label: 'View', submenu: [{role: 'reload'}, {role: 'forceReload'}, {type: 'separator'}, {role: 'resetZoom'}, {role: 'zoomIn'}, {role: 'zoomOut'}, {type: 'separator'}, {role: 'togglefullscreen'}, {role: 'toggleDevTools'}]},
    {label: 'Window', submenu: [{label: 'Open Full DAW', click: () => open('/workstation#studio')}, {label: 'Open 3D Rack', click: () => open('/rack')}, {label: 'Open Illustrated Manual', click: () => open('/manual')}, {label: 'Open Radio', click: () => open('/radio')}, {type: 'separator'}, {label: 'Show saved files folder', click: () => shell.openPath(userData)}, {label: 'Show station music folder', click: () => { fs.mkdirSync(stationDir, {recursive: true}); shell.openPath(stationDir); }}]},
  ]));

  mainWindow = new BrowserWindow(windowOptions());
  mainWindow.once('ready-to-show', () => { mainWindow.maximize(); mainWindow.show(); });
  mainWindow.on('closed', () => { mainWindow = null; });
  if (smokeTest) return runSmokeTest();
  await mainWindow.loadURL(origin + '/workstation');
}

function open(route) {
  const win = new BrowserWindow({...windowOptions(), show: true});
  win.loadURL(origin + route);
}

// Used by the Windows build check: loads every page, records errors, then quits.
async function runSmokeTest() {
  const report = {ok: true, origin, pages: []};
  const pages = ['/workstation', '/workstation#studio', '/workstation#forge', '/workstation#lyrics', '/workstation#hem-atm', '/workstation#encyclopedia', '/rack', '/manual', '/radio', '/plugin-prompts.html'];
  const contents = mainWindow.webContents;
  for (const page of pages) {
    const errors = [];
    const onConsole = (event, level, message) => { const lvl = typeof event === 'object' && event.level ? event.level : level; if (lvl === 3 || lvl === 'error') errors.push(String(event.message || message)); };
    contents.on('console-message', onConsole);
    try {
      await mainWindow.loadURL(origin + page);
      await new Promise(r => setTimeout(r, 2500));
      const info = await contents.executeJavaScript('({title: document.title, text: document.body ? document.body.innerText.length : 0, href: location.href})');
      report.pages.push({page, ...info, errors});
      if (!info.text) report.ok = false;
    } catch (error) {
      report.ok = false; report.pages.push({page, failed: String(error)});
    } finally { contents.off('console-message', onConsole); }
  }
  const health = await contents.executeJavaScript('fetch("/api/health").then(r => r.json())').catch(e => ({error: String(e)}));
  const station = await contents.executeJavaScript('fetch("/api/radio/station").then(r => r.json())').catch(e => ({error: String(e)}));
  report.health = health; report.station = {setup: station.setup, isOwner: station.isOwner, genres: station.genres?.length, error: station.error};
  if (health.service !== 'ghost-daw' || station.isOwner !== true) report.ok = false;
  const outFile = process.env.GHOST_SMOKE_REPORT || path.join(app.getPath('userData'), 'smoke-report.json');
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  app.exit(report.ok ? 0 : 1);
}

app.on('second-instance', () => { if (mainWindow) { if (mainWindow.isMinimized()) mainWindow.restore(); mainWindow.focus(); } });
app.on('window-all-closed', () => app.quit());
app.on('will-quit', () => { server?.close().catch(() => {}); });
app.whenReady().then(start).catch(error => {
  log('startup failed: ' + (error?.stack || error));
  if (!smokeTest) dialog.showErrorBox(PRODUCT + ' could not start', String(error?.message || error) + '\n\nDetails were saved to ' + logFile());
  app.exit(1);
});
