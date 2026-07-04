// ── LISTENER MANAGER ─────────────────────────────────────────
const _unsubs = {};

export function registerListener(key, unsub) {
  if (_unsubs[key]) {
    try { _unsubs[key](); } catch (e) { console.warn('listener cleanup error:', e); }
  }
  _unsubs[key] = unsub;
}

export function unsubscribeAll() {
  Object.keys(_unsubs).forEach(key => {
    try { _unsubs[key](); } catch (e) { console.warn('unsubscribeAll error:', key, e); }
    delete _unsubs[key];
  });
}

export function unsubscribe(key) {
  if (_unsubs[key]) {
    try { _unsubs[key](); } catch (e) { console.warn('unsubscribe error:', key, e); }
    delete _unsubs[key];
  }
}

export function hasListener(key) {
  return key in _unsubs;
}
