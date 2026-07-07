import { DB_ROOT } from './config.js';
import { state, DB } from './state.js';

// ── AUTH TOKEN ────────────────────────────────────────────────
export async function getAuthToken(forceRefresh = false) {
  try {
    if (state.currentAuthUser) return await state.currentAuthUser.getIdToken(forceRefresh);
  } catch (e) {
    console.warn('getAuthToken error:', e.message);
  }
  return null;
}

// ── REALTIME SDK HELPER ───────────────────────────────────────
// Gibt eine Firebase Database Ref zurück – wartet bis SDK bereit ist
function dbRef(path) {
  if (!window.firebase?.database) throw new Error('Firebase Database SDK nicht bereit');
  return window.firebase.database().ref(path);
}

// ── CRUD HELPERS (Realtime SDK) ───────────────────────────────
export async function fbGet(path) {
  const snap = await dbRef(`families/${state.familyId}/${path}`).get();
  return snap.val();
}

export async function fbSet(path, data) {
  await dbRef(`families/${state.familyId}/${path}`).set(data);
}

export async function fbPush(path, data) {
  const ref = await dbRef(`families/${state.familyId}/${path}`).push(data);
  return { name: ref.key };
}

export async function fbDel(path) {
  await dbRef(`families/${state.familyId}/${path}`).remove();
}

// ── CENTRAL FETCH (nur für Auth/Admin/Public-Endpoints) ───────
export async function fbFetch(url, options = {}) {
  let token = await getAuthToken(false);
  if (!token) throw new Error('Kein Auth-Token – Nutzer nicht eingeloggt oder offline');

  const doFetch = async (t) => {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + t,
      ...(options.headers || {}),
    };
    const separator = url.includes('?') ? '&' : '?';
    return fetch(url + separator + 'auth=' + t, { ...options, headers });
  };

  let res = await doFetch(token);

  if (res.status === 401) {
    await new Promise(r => setTimeout(r, 1000));
    const freshToken = await getAuthToken(true);
    if (freshToken) res = await doFetch(freshToken);
    if (res.status === 401) console.warn('Auth token invalid after refresh');
  }

  return res;
}

// ── SCRIPT LOADER ─────────────────────────────────────────────
export function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src     = src;
    s.onload  = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

// ── PUBLIC FAMILY SYNC ────────────────────────────────────────
// Schreibt bewusst NUR den Familiennamen — dieser Pfad ist unauthentifiziert
// lesbar (dient der Vorschau auf dem Einladungs-Link, bevor sich jemand
// anmeldet). Mitgliedernamen gehören NICHT hierher, da sie sonst für
// jeden mit Kenntnis der Familien-ID ohne Anmeldung einsehbar wären.
export async function syncPublicFamily() {
  const { familyId, familyName } = state;
  if (!familyId || familyId === 'DEMO01') return;
  try {
    const pub = { name: familyName || familyId };
    await fbFetch(`${DB_ROOT}/public/${familyId}.json`, {
      method: 'PUT',
      body: JSON.stringify(pub),
    });
  } catch (e) { /* non-kritisch */ }
}

// ── FAMILY INDEX ──────────────────────────────────────────────
export async function ensureFamilyInIndex() {
  const { familyId } = state;
  if (!familyId || familyId === 'DEMO01') return;
  try {
    // Nur lastActiveAt schreiben – kein Name (verhindert Überschreiben mit falschem State)
    // Namen werden ausschließlich via "Alle indexieren" (adminBulkIndexFamilies) gesetzt
    // Top-Level-Feld statt meta/lastActiveAt (vermeidet $other:false Regel-Konflikte)
    if (window.firebase?.database) {
      await window.firebase.database().ref(`families/${familyId}/lastActiveAt`).set(Date.now());
    }
  } catch (e) { /* non-kritisch */ }
}
