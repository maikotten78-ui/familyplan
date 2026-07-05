// ══════════════════════════════════════════════════════════════
// famiplan – nativePush.js
// Native Push-Benachrichtigungen für die iOS-App (App Store/TestFlight)
// via Firebase Cloud Messaging (FCM) + APNs.
//
// WARUM EIN EIGENES MODUL: Die reguläre Web-Push-API
// (Notification.requestPermission / PushManager, siehe ui/push.js)
// funktioniert NICHT innerhalb der Capacitor-WKWebView einer nativen
// App — das ist eine Plattform-Einschränkung von Apple, kein Bug.
// Native Apps brauchen einen echten APNs/FCM-Token statt einer
// Web-Push-Subscription.
//
// @capacitor-firebase/messaging wird dynamisch importiert, damit die
// Web-/PWA-Version (Cloudflare Pages) keine Firebase-SDK-Mehrlast
// bekommt, wenn sie nie im nativen Kontext läuft.
// ══════════════════════════════════════════════════════════════

import { state } from './state.js';
import { fbFetch } from './firebase.js';
import { DB_ROOT } from './config.js';

// ── SETTINGS HELPER ─────────────────────────────────────────────
// Bewusst dupliziert (statt aus ui/push.js importiert), um einen
// zirkulären Modul-Import zwischen ui/push.js <-> modules/nativePush.js
// zu vermeiden. Nutzt denselben localStorage-Key wie ui/push.js.
function getPushSetting(key, def) {
  try {
    const s = JSON.parse(localStorage.getItem('fp_push_settings') || '{}');
    return s[key] !== undefined ? s[key] : def;
  } catch { return def; }
}
function setPushSetting(key, val) {
  try {
    const s = JSON.parse(localStorage.getItem('fp_push_settings') || '{}');
    s[key] = val;
    localStorage.setItem('fp_push_settings', JSON.stringify(s));
  } catch {}
}

// ── PLATTFORM-CHECK ─────────────────────────────────────────────
export function isNativePlatform() {
  return !!window.Capacitor?.isNativePlatform?.();
}

// ── AKTIVIEREN: Berechtigung anfragen + Token registrieren ───────
export async function enableNativePush() {
  const { FirebaseMessaging } = await import('@capacitor-firebase/messaging');
  const perm = await FirebaseMessaging.requestPermissions();
  if (perm.receive !== 'granted') {
    return { ok: false, reason: 'denied' };
  }
  const { token } = await FirebaseMessaging.getToken();
  if (!token) return { ok: false, reason: 'no-token' };
  await saveNativeTokenToServer(token);
  setPushSetting('enabled', true);
  return { ok: true };
}

// ── DEAKTIVIEREN ──────────────────────────────────────────────────
export async function disableNativePush() {
  try {
    const { FirebaseMessaging } = await import('@capacitor-firebase/messaging');
    await FirebaseMessaging.deleteToken();
  } catch (e) { console.warn('disableNativePush deleteToken:', e.message); }

  const { currentAuthUser, familyId } = state;
  if (currentAuthUser && familyId) {
    try {
      await fbFetch(`${DB_ROOT}/families/${familyId}/pushSubscriptions/${currentAuthUser.uid}.json`, { method: 'DELETE' });
    } catch (e) { console.warn('disableNativePush delete subscription:', e.message); }
  }
  setPushSetting('enabled', false);
}

// ── TOKEN AN FIREBASE SENDEN ────────────────────────────────────
// Gleicher Pfad wie die Web-Push-Subscription (families/{familyId}/
// pushSubscriptions/{uid}), aber mit platform:'ios' + fcmToken statt
// einer Web-Push-"subscription". push-worker.js unterscheidet danach,
// ob per Web-Push oder per FCM/APNs gesendet wird.
async function saveNativeTokenToServer(token) {
  const { currentAuthUser, familyId, curUser } = state;
  if (!currentAuthUser || !familyId) return;
  const data = {
    platform:        'ios',
    fcmToken:        token,
    memberName:      curUser || '',
    reminderMinutes: getPushSetting('reminderMinutes', 30),
    reminderEnabled: getPushSetting('reminderEnabled', true),
    dailyEnabled:    getPushSetting('dailyEnabled', true),
    dailyHour:       getPushSetting('dailyHour', 7),
    updatedAt:       Date.now(),
  };
  await fbFetch(`${DB_ROOT}/families/${familyId}/pushSubscriptions/${currentAuthUser.uid}.json`, {
    method: 'PUT',
    body:   JSON.stringify(data),
  });
}

// ── TOKEN-REFRESH ─────────────────────────────────────────────────
// FCM-Tokens können sich gelegentlich ändern (Neuinstallation,
// Keychain-Reset etc.). Bei bereits aktivem Push automatisch
// aktualisieren, damit der gespeicherte Token nicht veraltet.
export async function initNativePushListeners() {
  if (!isNativePlatform()) return;
  if (!getPushSetting('enabled', false)) return;
  try {
    const { FirebaseMessaging } = await import('@capacitor-firebase/messaging');
    FirebaseMessaging.addListener('tokenReceived', (event) => {
      if (event?.token) saveNativeTokenToServer(event.token).catch(() => {});
    });
  } catch (e) { console.warn('initNativePushListeners:', e.message); }
}
