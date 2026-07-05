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
import { fbFetch, getAuthToken } from './firebase.js';
import { DB_ROOT, PUSH_WORKER_URL } from './config.js';

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

  // WICHTIG: Der APNs-Gerätetoken wird von Apple asynchron im Hintergrund
  // zugewiesen (UIApplication.registerForRemoteNotifications()-Callback).
  // Ein sofortiger getToken()-Aufruf direkt nach requestPermissions() kann
  // dieser Zuweisung zuvorkommen und mit "No APNS token specified before
  // fetching FCM Token" fehlschlagen. Daher mit kurzen Pausen wiederholen.
  const delays = [0, 500, 1000, 1500, 2000, 3000]; // insgesamt ~8s
  let lastError = null;
  for (const delay of delays) {
    if (delay) await new Promise(r => setTimeout(r, delay));
    try {
      const { token } = await FirebaseMessaging.getToken();
      if (token) {
        // WICHTIG: Erfolg des Firebase-Writes prüfen, nicht nur den
        // FCM-Token-Abruf. Ein Token ohne gespeicherten DB-Eintrag
        // bedeutet: die App zeigt "Aktiv", aber es kommt nie ein Push an.
        const saved = await saveNativeTokenToServer(token);
        if (!saved) {
          return { ok: false, reason: 'save-failed' };
        }
        setPushSetting('enabled', true);
        return { ok: true };
      }
    } catch (e) {
      lastError = e;
    }
  }
  console.warn('enableNativePush: kein Token nach mehreren Versuchen:', lastError?.message);
  return { ok: false, reason: 'no-token' };
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
      // target:'ios' → Worker löscht nur platform/fcmToken, nicht eine
      // evtl. parallele Web-Push-Subscription desselben Accounts.
      const token = await getAuthToken().catch(() => null);
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = 'Bearer ' + token;
      await fetch(`${PUSH_WORKER_URL}/push/unsubscribe`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ familyId, uid: currentAuthUser.uid, target: 'ios' }),
      });
    } catch (e) { console.warn('disableNativePush unsubscribe:', e.message); }
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
  if (!currentAuthUser || !familyId) return false;
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
  // PATCH statt PUT: nur diese Felder setzen, ohne eine evtl. parallel
  // aktive Web-Push-Subscription (gleicher Account im Browser) zu löschen.
  try {
    const res = await fbFetch(`${DB_ROOT}/families/${familyId}/pushSubscriptions/${currentAuthUser.uid}.json`, {
      method: 'PATCH',
      body:   JSON.stringify(data),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.warn('saveNativeTokenToServer: Firebase lehnte Schreibvorgang ab:', res.status, text.slice(0, 200));
      return false;
    }
    return true;
  } catch (e) {
    console.warn('saveNativeTokenToServer error:', e.message);
    return false;
  }
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
