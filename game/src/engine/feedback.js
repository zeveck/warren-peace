// "Report a bug" (gamegen --feedback on): the <gh-feedback> form in index.html files a GitHub issue from the
// player's own account. The button shows in Pause and Settings for everyone, once publishing has filled in the repo.
// Ctrl+Shift+F opens it from anywhere (index.html; F alone stays the army battle's speed key), calling
// window.reportShortcut first so the game pauses.
const fb = () => document.getElementById('report');

export function reportAvailable() { const f = fb(); return !!f && !!f.getAttribute('repo'); }
// while the form has focus the game ignores every key, pointer and controller input (the player is typing)
export const reportOpen = () => { const f = fb(); return !!f && document.activeElement === f; };
export const fromReport = e => { const f = fb(); return !!f && ((e.composedPath && e.composedPath().includes(f)) || reportOpen()); };

// the picture sent with a report is the game as it was when it paused, not the pause menu drawn over it
let pauseShot = null;
export function snapshot() {
  const c = document.getElementById('screen');
  if (c) pauseShot = new Promise(r => { try { c.toBlob(r, 'image/png'); } catch { r(null); } });
}
export function clearSnapshot() { pauseShot = null; }   // on resume: an old picture is never sent
export function openReport() { const f = fb(); if (f && f.open) f.open(); }

const errors = [];
const keep = m => { errors.push(String(m).replace(/\s+/g, ' ').slice(0, 200)); errors.splice(0, errors.length - 5); };
addEventListener('error', e => keep(e.message));
addEventListener('unhandledrejection', e => keep((e.reason && e.reason.message) || e.reason));
const flat = v => String(v).replace(/\s+/g, ' ');

function brief() {
  // a short summary of where the player is (the full debug state is far too long for a GitHub link)
  try {
    const s = window.__game && window.__game.state ? window.__game.state() : {};
    const lv = s.members && s.members.bramble ? s.members.bramble.lvl : '';
    return { screen: s.screen || '', chapter: s.chapter ?? '', map: s.map || '', tile: s.tile ? `${s.tile.x},${s.tile.y}` : '', level: lv, party: (s.party || []).join(' '), quest: s.quest || '', device: s.device || s.input || '' };
  } catch { return {}; }
}
export function initReport() {
  const f = fb(); if (!f) return;
  if (window.desktop) f.openLink = url => { window.open(url, '_blank'); return true; };
  f.getScreenshot = () => pauseShot || new Promise(r => document.getElementById('screen').toBlob(r, 'image/png'));
  f.getContext = () => {
    const b = brief();
    return {
      game: 'Warren Peace',
      address: location.origin + location.pathname,
      updated: document.lastModified,
      build: window.desktop ? `desktop app (${window.desktop.platform})` : 'web',
      browser: navigator.userAgent,
      screen: `${innerWidth}x${innerHeight} @${devicePixelRatio}x`,
      input: flat(b.device || ''),
      state: flat(`screen ${b.screen}; chapter ${b.chapter}; map ${b.map} at ${b.tile}; Bramble Lv ${b.level}; party ${b.party}; quest: ${b.quest}`).slice(0, 400),
      errors: errors.join(' | ') || 'none',
    };
  };
}
