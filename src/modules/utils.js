import { DAYS } from './config.js';

// ── DATE HELPERS ──────────────────────────────────────────────
export function localISO(d) {
  const x = d || new Date();
  return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`;
}

export function jd2i(n) { return n === 0 ? 6 : n - 1; }
export function todayIdx() { return jd2i(new Date().getDay()); }

export const TODAY_ISO = localISO();
export const TODAY     = DAYS[todayIdx()];

export function dayFromISO(iso) {
  if (!iso) return TODAY;
  return DAYS[jd2i(new Date(iso + "T12:00:00").getDay())];
}

export function isoFromDay(dayName) {
  const idx  = DAYS.indexOf(dayName);
  const diff = (idx - todayIdx() + 7) % 7;
  const d    = new Date();
  d.setDate(d.getDate() + diff);
  return localISO(d);
}

export function get7Days(centerISO) {
  const center = new Date(centerISO + "T12:00:00");
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(center);
    d.setDate(center.getDate() - 3 + i);
    return { iso: localISO(d), name: DAYS[jd2i(d.getDay())] };
  });
}

// ── STRING HELPERS ────────────────────────────────────────────
export function escapeHtml(str) {
  if (!str && str !== 0) return '';
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#39;');
}

export function escapeAttr(str) {
  if (!str && str !== 0) return '';
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/'/g,  "\\'");
}

// ── CRYPTO ───────────────────────────────────────────────────
export function genFamilyId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const arr   = new Uint8Array(8);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => chars[b % chars.length]).join('');
}

// Einladungs-Token: deutlich laenger als die Familien-ID, einmalig nutzbar
// und zeitlich begrenzt (siehe shareInviteLink / obJoinFamily).
export function genInviteToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const arr   = new Uint8Array(24);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => chars[b % chars.length]).join('');
}

// ── DURATION HELPERS ─────────────────────────────────────────
export function calcDurMins(start, end) {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return (eh * 60 + em) - (sh * 60 + sm);
}

export function endTimeFromDur(start, mins) {
  if (!start || !mins) return '';
  const [sh, sm] = start.split(':').map(Number);
  const total = sh * 60 + sm + parseInt(mins);
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
}

export function calcDur(start, end) {
  if (!start || !end) return '–';
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const diff = (eh * 60 + em) - (sh * 60 + sm);
  if (diff <= 0) return '–';
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return h > 0 ? (m > 0 ? `${h}h ${m}min` : `${h}h`) : `${m}min`;
}

// ── URL HELPERS ───────────────────────────────────────────────
export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw     = atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}
