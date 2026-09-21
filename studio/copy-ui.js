(function () {
 'use strict';
 const roots = new WeakSet(), controls = new WeakMap();
 const targets = 'p,pre,blockquote,li,tbody tr,.daw-panel,.bc,.vc,.gs,.code,.pt,.prompt-box,textarea,input[type="text"],input:not([type])';
 const excluded = 'button,a,nav,header,footer,[role="status"],[role="alert"],.ghost-copy-ui,.ghost-chain-ui,.hem-directory,.command-dashboard,.lyrics-privacy-note,.genre-genie,[hidden],script,style';
 const css = '.ghost-copy-ui{display:inline-flex;align-items:center;gap:6px;margin:6px 0;vertical-align:middle}.ghost-copy-ui button{font:600 12px/1.3 system-ui,sans-serif;min-height:34px;padding:6px 11px;border:1px solid #83a69b;border-radius:7px;background:#17382f;color:#e9fff5;cursor:pointer;white-space:nowrap}.ghost-copy-ui button:hover{background:#245647}.ghost-copy-ui button:focus-visible{outline:3px solid #bef264;outline-offset:2px}.ghost-copy-ui button:disabled{opacity:.5;cursor:default}.ghost-copy-ui [role="status"]{font:12px system-ui;color:inherit}.ghost-copy-page{display:flex;justify-content:flex-end;padding:0 16px}';
 function textOf(node) {
  if (node.nodeType === 3) return node.textContent;
  if (node.nodeType !== 1 && node.nodeType !== 11 && node.nodeType !== 9) return '';
  if (node.nodeType === 1) {
   if (node.matches(excluded + ',input[type="password"],input[type="hidden"],select,svg')) return '';
   if (getComputedStyle(node).display === 'none' || getComputedStyle(node).visibility === 'hidden') return '';
   if (node.matches('textarea,input')) return node.value;
   if (node.tagName === 'BR') return '\n';
  }
  const value = Array.from((node.shadowRoot || node).childNodes, textOf).join('');
  return value + (node.nodeType === 1 && /^(P|DIV|SECTION|ARTICLE|LI|TR|H[1-6]|PRE|BLOCKQUOTE)$/.test(node.tagName) ? '\n' : node.nodeName === 'TD' ? '\t' : '');
 }
 async function copy(text) {
  try { if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); return true; } } catch {}
  const focused = document.activeElement, area = document.createElement('textarea');
  area.value = text; area.className = 'ghost-copy-ui'; area.style.cssText = 'position:fixed;left:-10000px;top:0';
  document.body.append(area); area.focus(); area.select();
  let ok = false; try { ok = document.execCommand('copy'); } catch {}
  area.remove(); focused?.focus({preventScroll:true}); return ok;
 }
 function add(target, page = false) {
  if (controls.get(target)?.isConnected) return;
  if (!page && (target.closest(excluded) || target.closest('label')?.querySelector('input[type="password"]'))) return;
  if (!page && !target.matches('input,textarea') && !textOf(target).trim()) return;
  // Keep existing dedicated copy actions, and avoid repeating controls inside cards.
  if (!page && (target.querySelector('button[aria-label^="Copy"],.copy-btn,.cpa') || Array.from(target.querySelectorAll('button')).some(b => /^copy\b/i.test(b.textContent.trim())))) return;
  const ui = document.createElement('span'); ui.className = 'ghost-copy-ui' + (page ? ' ghost-copy-page' : '');
  const button = document.createElement('button'); button.type = 'button'; button.textContent = page ? 'Copy page' : 'Copy';
  const name = target.getAttribute?.('aria-label') || target.labels?.[0]?.childNodes[0]?.textContent?.trim() || target.querySelector?.('h1,h2,h3,h4')?.textContent || '';
  button.setAttribute('aria-label', page ? 'Copy page text' : 'Copy ' + (name || 'text'));
  const status = document.createElement('span'); status.setAttribute('role', 'status');
  let timer;
  button.onclick = async event => {
   event.preventDefault(); event.stopPropagation(); clearTimeout(timer);
   const text = textOf(target).trim();
   if (!text) { status.textContent = 'Nothing to copy.'; return; }
   const ok = await copy(text); button.textContent = ok ? 'Copied!' : 'Try again';
   status.textContent = ok ? '' : 'Select the text and copy manually.';
   button.setAttribute('aria-label', ok ? 'Copied to clipboard' : 'Copy failed. Try again');
   timer = setTimeout(() => {button.textContent = page ? 'Copy page' : 'Copy'; button.setAttribute('aria-label', page ? 'Copy page text' : 'Copy ' + (name || 'text')); status.textContent = '';}, 2000);
  };
  ui.append(button,status); controls.set(target,ui);
  if (page) (target.body || target).prepend(ui);
  else if (target.matches('textarea,input,pre')) target.after(ui);
  else if (target.matches('tr')) target.lastElementChild?.append(ui);
  else target.append(ui);
 }
 function scan(root) {
  root.querySelectorAll('*').forEach(el => {if(el.shadowRoot) observe(el.shadowRoot);});
  const candidates = Array.from(root.querySelectorAll(targets));
  for (const el of candidates) {
   if (el.matches('.daw-panel,.bc,.vc,.gs') && el.querySelector('.daw-panel,.bc,.vc,.gs')) continue;
   const card = el.parentElement?.closest('.daw-panel,.bc,.vc,.gs');
   if (card && !el.matches('textarea,input') && !card.querySelector('.daw-panel,.bc,.vc,.gs')) continue;
   add(el);
  }
 }
 function observe(root) {
  if (roots.has(root)) return; roots.add(root);
  const style = document.createElement('style'); style.textContent = css; (root.head || root).append(style);
  let queued = false;
  new MutationObserver(records => {
   // Meter/time/status text changes do not introduce new copy targets.
   // Scanning on those updates traversed the entire DAW every animation frame.
   if (!records.some(r => !r.target.closest?.('.ghost-copy-ui,.ghost-chain-ui') && Array.from(r.addedNodes).some(n => n.nodeType === 1 && !n.matches('.ghost-copy-ui,.ghost-chain-ui')))) return;
   if (!queued) { queued = true; requestAnimationFrame(() => {queued = false; scan(root);}); }
  }).observe(root, {childList:true,subtree:true});
  scan(root);
 }
 function start() {observe(document);}
 if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
