// ══════════════════════════════════════════════════════════════
// famiplan – nativePush.js
// Native Push-Benachrichtigungen für die iOS-App (App Store/TestFlight)
// via APNs (direkt, ohne Firebase/FCM).
//
// WARUM EIN EIGENES MODUL: Die reguläre Web-Push-API
// (Notification.requestPermission / PushManager, siehe ui/push.js)
// funktioniert NICHT innerhalb der Capacitor-WKWebView einer nativen
// App — das ist eine Plattform-Einschränkung von Apple, kein Bug.
// Native Apps brauchen einen echten APNs-Device-Token statt einer
// Web-Push-Subscription.
//
// @capacitor/push-notifications wird dynamisch importiert, damit die
// Web-/PWA-Version (Cloudflare Pages) keine native Mehrlast bekommt,
// wenn sie nie im nativen Kontext läuft.
// ══════════════════════════════════════════════════════════════

import { state } from './state.js';
import { fbFetch, getAuthToken } from './firebase.js';
import { DB_ROOT, PUSH_WORKER_URL } from './config.js';

// ── SETTINGS HELPER ─────────────────────────────────────────────
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
// Der APNs-Device-Token kommt asynchron über das 'registration'-Event,
// nicht als Rückgabewert von register(). Daher Listener-basiert mit
// Timeout als Absicherung.
export async function enableNativePush() {
  const { PushNotifications } = await import('@capacitor/push-notifications');
  const perm = await PushNotifications.requestPermissions();
  if (perm.receive !== 'granted') {
    return { ok: false, reason: 'denied' };
  }

  return new Promise((resolve) => {
    let settled = false;

    const finish = async (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      await PushNotifications.removeAllListeners();
      resolve(result);
    };

    const timeout = setTimeout(() => finish({ ok: false, reason: 'no-token' }), 8000);

    PushNotifications.addListener('registration', async (token) => {
      if (!token?.value) return;
      const saved = await saveNativeTokenToServer(token.value);
      if (!saved) {
        finish({ ok: false, reason: 'save-failed' });
        return;
      }
      setPushSetting('enabled', true);
      finish({ ok: true });
    });

    PushNotifications.addListener('registrationError', (err) => {
      console.warn('enableNativePush registrationError:', err?.error || err);
      finish({ ok: false, reason: 'no-token' });
    });

    PushNotifications.register();
  });
}

// ── DEAKTIVIEREN ──────────────────────────────────────────────────
export async function disableNativePush() {
  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');
    await PushNotifications.removeAllListeners();
    // Anders als FCM kennt APNs kein serverseitiges "deleteToken" –
    // Deaktivierung bedeutet hier: Server-Eintrag löschen.
  } catch (e) { console.warn('disableNativePush:', e.message); }

  const { currentAuthUser, familyId } = state;
  if (currentAuthUser && familyId) {
    try {
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
// pushSubscriptions/{uid}), aber mit platform:'ios' + apnsToken statt
// einer Web-Push-"subscription". push-worker.js unterscheidet danach,
// ob per Web-Push oder direkt per APNs gesendet wird.
async function saveNativeTokenToServer(token) {
  const { currentAuthUser, familyId, curUser } = state;
  if (!currentAuthUser || !familyId) return false;
  const data = {
    platform:        'ios',
    apnsToken:       token,
    memberName:      curUser || '',
    reminderMinutes: getPushSetting('reminderMinutes', 30),
    reminderEnabled: getPushSetting('reminderEnabled', true),
    dailyEnabled:    getPushSetting('dailyEnabled', true),
    dailyHour:       getPushSetting('dailyHour', 7),
    updatedAt:       Date.now(),
  };
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
// Bei bereits aktivem Push erneut registrieren, um einen evtl.
// rotierten APNs-Token automatisch zu aktualisieren.
export async function initNativePushListeners() {
  if (!isNativePlatform()) return;
  if (!getPushSetting('enabled', false)) return;
  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');
    PushNotifications.addListener('registration', (token) => {
      if (token?.value) saveNativeTokenToServer(token.value).catch(() => {});
    });
    const perm = await PushNotifications.checkPermissions();
    if (perm.receive === 'granted') {
      PushNotifications.register();
    }
  } catch (e) { console.warn('initNativePushListeners:', e.message); }
}