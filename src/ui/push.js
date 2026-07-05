// ══════════════════════════════════════════════════════════════
// famiplan – push.js  (Phase 7a)
// Push-Einstellungen, Reminder-Scheduler, sendPushToFamily
// ══════════════════════════════════════════════════════════════

import { PUSH_VAPID_PUBLIC_KEY, PUSH_WORKER_URL, DB_ROOT } from '../modules/config.js';
import { state } from '../modules/state.js';
import { DAYS } from '../modules/config.js';
import { localISO, jd2i } from '../modules/utils.js';
import { isVisible, getA } from '../modules/tasks.js';
import { fbFetch, getAuthToken } from '../modules/firebase.js';
import { showSync } from './modal.js';
import { isPremiumActive } from '../modules/premium.js';
import { isNativePlatform, enableNativePush, disableNativePush } from '../modules/nativePush.js';

// ── SETTINGS ──────────────────────────────────────────────────
export function loadPushSettings() {
  try { return JSON.parse(localStorage.getItem('fp_push_settings') || '{}'); } catch { return {}; }
}
function savePushSettings(s) {
  try { localStorage.setItem('fp_push_settings', JSON.stringify(s)); } catch {}
}
export function getPushSetting(key, def) {
  const s = loadPushSettings();
  return s[key] !== undefined ? s[key] : def;
}
export function setPushSetting(key, val) {
  const s = loadPushSettings();
  s[key] = val;
  savePushSettings(s);
}

// ── VAPID HELPER ──────────────────────────────────────────────
function urlBase64ToUint8Array(b64) {
  const clean  = b64.trim().replace(/-/g, '+').replace(/_/g, '/');
  const pad    = '='.repeat((4 - clean.length % 4) % 4);
  const raw    = atob(clean + pad);
  const arr    = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

// ── SAVE SUBSCRIPTION ─────────────────────────────────────────
export async function savePushSubscriptionToServer(subscription) {
  const { currentAuthUser, familyId, curUser } = state;
  if (!currentAuthUser || !familyId) return;
  try {
    const data = {
      subscription:     subscription.toJSON ? subscription.toJSON() : subscription,
      memberName:       curUser || '',
      reminderMinutes:  getPushSetting('reminderMinutes', 30),
      reminderEnabled:  getPushSetting('reminderEnabled', true),
      dailyEnabled:     getPushSetting('dailyEnabled', true),
      dailyHour:        getPushSetting('dailyHour', 7),
      updatedAt:        Date.now(),
    };
    await fbFetch(`${DB_ROOT}/families/${familyId}/pushSubscriptions/${currentAuthUser.uid}.json`, {
      method: 'PUT',
      body:   JSON.stringify(data),
    });
  } catch (e) { console.warn('Save subscription error:', e); }
}

// ── DISABLE PUSH ──────────────────────────────────────────────
export async function disablePush() {
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) await sub.unsubscribe();
    const { currentAuthUser, familyId } = state;
    if (currentAuthUser && familyId) {
      const unsubToken = await getAuthToken().catch(() => null);
      const unsubHeaders = { 'Content-Type': 'application/json' };
      if (unsubToken) unsubHeaders['Authorization'] = 'Bearer ' + unsubToken;
      await fetch(`${PUSH_WORKER_URL}/push/unsubscribe`, {
        method: 'POST',
        headers: unsubHeaders,
        body: JSON.stringify({ familyId, uid: currentAuthUser.uid }),
      });
    }
    setPushSetting('enabled', false);
    showSync('🔕 Push-Benachrichtigungen deaktiviert.');
  } catch (e) { console.error('Disable push error:', e); }
}

// ── SEND PUSH TO FAMILY ───────────────────────────────────────
export async function sendPushToFamily(type, payload, options = {}) {
  const { familyId, currentAuthUser } = state;
  if (!familyId || !currentAuthUser) return;
  try {
    const token = await getAuthToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    await fetch(`${PUSH_WORKER_URL}/push/send`, {
      method:  'POST',
      headers,
      body:    JSON.stringify({
        familyId, type, payload,
        excludeUid: options.excludeSelf ? currentAuthUser.uid : undefined,
        targetUid:  options.targetUid  || undefined,
      }),
    });
  } catch (e) { console.warn('Push send error:', e); }
}

// ── LOCAL NOTIFICATION ────────────────────────────────────────
export function showLocalNotification(title, body, options = {}) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  navigator.serviceWorker.ready.then(reg => {
    reg.showNotification(title, {
      body,
      icon:    '/icon-192.png',
      badge:   '/icon-192.png',
      vibrate: [200, 100, 200],
      tag:     options.tag  || 'famiplan',
      data:    options.data || { url: '/' },
    });
  });
}

// ── REMINDER SCHEDULER ────────────────────────────────────────
export function scheduleReminders() {
  state._reminderTimers.forEach(t => clearTimeout(t));
  state._reminderTimers = [];

  if (!getPushSetting('enabled', false))    return;
  if (!getPushSetting('reminderEnabled', true)) return;
  if (!state.curUser || !state.tasks.length) return;

  const mins       = getPushSetting('reminderMinutes', 30);
  const now        = Date.now();
  const todayISO   = localISO();
  const todayName  = DAYS[jd2i(new Date().getDay())];

  state.tasks.filter(t => !t.openTodo && isVisible(t, todayName, todayISO)).forEach(task => {
    if (!task.time) return;
    const [h, m]   = task.time.split(':').map(Number);
    const taskTs   = new Date(); taskTs.setHours(h, m, 0, 0);
    const reminderTs = taskTs.getTime() - mins * 60000;
    if (reminderTs <= now || reminderTs - now > 86400000) return;

    const timer = setTimeout(() => {
      const a = getA(task, todayISO);
      if (a.done) return;
      if (a.assignedTo && a.assignedTo !== state.curUser) return;
      showLocalNotification(
        task.type === 'event' ? `⏰ Termin in ${mins} Min.` : `⏰ Erinnerung in ${mins} Min.`,
        `${task.emoji} ${task.title}${task.location ? ' · ' + task.location : ''}`,
        { tag: `reminder-${task.id}`, data: { url: '/', taskId: task.id } }
      );
    }, reminderTs - now);

    state._reminderTimers.push(timer);
  });

  scheduleDailySummary();
}

function scheduleDailySummary() {
  if (!getPushSetting('dailyEnabled', true)) return;
  const hour   = getPushSetting('dailyHour', 7);
  const now    = new Date();
  const target = new Date(); target.setHours(hour, 0, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  const delay  = target - now;
  if (delay > 86400000) return;

  const timer = setTimeout(async () => {
    const tISO   = localISO();
    const tName  = DAYS[jd2i(new Date().getDay())];
    const myTasks = state.tasks.filter(t => !t.openTodo && isVisible(t, tName, tISO)).filter(t => {
      const a = getA(t, tISO);
      return !a.done && (!a.assignedTo || a.assignedTo === state.curUser);
    });
    if (!myTasks.length) return;
    const dl      = new Date().toLocaleDateString('de', { weekday: 'long', day: 'numeric', month: 'long' });
    const summary = myTasks.length === 1
      ? `${myTasks[0].emoji} ${myTasks[0].title}`
      : `${myTasks.length} Aufgaben – z.B. ${myTasks[0].emoji} ${myTasks[0].title}`;
    await sendPushToFamily('daily', { dateLabel: dl, summary });
  }, delay);

  state._reminderTimers.push(timer);
}

// ── PUSH SETTINGS PAGE ────────────────────────────────────────
function toggle(key, btn) {
  const nv = !getPushSetting(key, true);
  setPushSetting(key, nv);
  btn.style.background = nv ? '#5C4EE5' : '#D1D5DB';
  const span = btn.querySelector('span');
  if (span) span.style[nv ? 'right' : 'left'] = '3px';
}

function toggleSwitch(key, btn) {
  const nv = !getPushSetting(key, true);
  setPushSetting(key, nv);
  btn.style.background = nv ? '#5C4EE5' : '#D1D5DB';
  const span = btn.querySelector('span');
  if (span) { span.style.left = nv ? '' : '3px'; span.style.right = nv ? '3px' : ''; }
}

export function showPushPage() {
  const overlay = document.createElement('div');
  overlay.id    = 'push-page';
  overlay.style.cssText = 'position:fixed;inset:0;background:#5C4EE5;z-index:999;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:max(env(safe-area-inset-top),48px) 20px max(env(safe-area-inset-bottom,0px),80px);';

  const nativePlatform = isNativePlatform();
  const supported     = nativePlatform || ('Notification' in window && 'PushManager' in window);
  const permission    = nativePlatform ? (getPushSetting('enabled', false) ? 'granted' : 'default')
                       : (supported ? Notification.permission : 'denied');
  const enabled       = getPushSetting('enabled', false);
  const mins          = getPushSetting('reminderMinutes', 30);
  const dailyEnabled  = getPushSetting('dailyEnabled', true);
  const dailyHour     = getPushSetting('dailyHour', 7);
  const assignEnabled = getPushSetting('assignEnabled', true);
  const cmtEnabled    = getPushSetting('commentEnabled', true);
  const boardEnabled  = getPushSetting('boardEnabled', true);
  const remEnabled    = getPushSetting('reminderEnabled', true);

  const sw = (active) => `width:44px;height:26px;border-radius:13px;border:none;background:${active ? '#5C4EE5' : '#D1D5DB'};position:relative;cursor:pointer;flex-shrink:0`;
  const swDot = (active) => `<span style="position:absolute;top:3px;${active ? 'right:3px' : 'left:3px'};width:20px;height:20px;border-radius:50%;background:var(--surface);display:block"></span>`;
  const row = (id, title, sub, key, def) => `
    <div style="padding:14px 16px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border2,#F5F6FA)">
      <div><div style="font-size:13px;font-weight:600;color:var(--text1)">${title}</div><div style="font-size:11px;color:var(--text2)">${sub}</div></div>
      <button id="${id}" style="${sw(getPushSetting(key, def))}">${swDot(getPushSetting(key, def))}</button>
    </div>`;

  const dm = localStorage.getItem('fp_dark_mode') || 'system';
  overlay.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:28px">
      <div style="font-size:22px;font-weight:800;color:white">🔔 Benachrichtigungen</div>
      <button id="push-done-btn" style="background:rgba(255,255,255,0.2);border:none;border-radius:20px;padding:8px 16px;color:white;font-weight:700;font-size:14px;cursor:pointer;font-family:inherit">Fertig</button>
    </div>

    <div style="background:var(--surface);border-radius:16px;padding:18px;margin-bottom:16px">
      <div style="font-size:14px;font-weight:700;color:var(--text1);margin-bottom:10px">📍 Region</div>
      <label style="font-size:12px;color:var(--text2);display:block;margin-bottom:6px">Bundesland für Feiertage & Schulferien</label>
      <select id="bl-select" onchange="window._app.setBundesland(this.value)"
        style="width:100%;padding:10px;border-radius:10px;border:1.5px solid var(--border);background:var(--input-bg);color:var(--text1);font-size:13px;font-family:inherit">
        ${[['BW','Baden-Württemberg'],['BY','Bayern'],['BE','Berlin'],['BB','Brandenburg'],['HB','Bremen'],['HH','Hamburg'],['HE','Hessen'],['MV','Mecklenburg-Vorpommern'],['NI','Niedersachsen'],['NW','Nordrhein-Westfalen'],['RP','Rheinland-Pfalz'],['SL','Saarland'],['SN','Sachsen'],['ST','Sachsen-Anhalt'],['SH','Schleswig-Holstein'],['TH','Thüringen']].map(([code,name]) => `<option value="${code}" ${(localStorage.getItem('fp_bundesland')||'NW')===code?'selected':''}>${name}</option>`).join('')}
      </select>
    </div>

    <div style="background:var(--surface);border-radius:16px;padding:18px;margin-bottom:16px">
      <div style="font-size:14px;font-weight:700;color:var(--text1);margin-bottom:4px">🌙 Darstellung</div>
      <div style="display:flex;gap:6px;margin-top:10px">
        <button id="dm-light" style="flex:1;padding:10px 6px;border:1.5px solid ${dm==='light'?'#5C4EE5':'var(--border)'};border-radius:10px;background:${dm==='light'?'#EEF2FF':'#F5F6FA'};color:${dm==='light'?'#5C4EE5':'#6b7280'};font-weight:600;font-size:12px;cursor:pointer;font-family:inherit">☀️ Hell</button>
        <button id="dm-system" style="flex:1;padding:10px 6px;border:1.5px solid ${dm==='system'?'#5C4EE5':'var(--border)'};border-radius:10px;background:${dm==='system'?'#EEF2FF':'#F5F6FA'};color:${dm==='system'?'#5C4EE5':'#6b7280'};font-weight:600;font-size:12px;cursor:pointer;font-family:inherit">📱 Auto</button>
        <button id="dm-dark" style="flex:1;padding:10px 6px;border:1.5px solid ${dm==='dark'?'#5C4EE5':'var(--border)'};border-radius:10px;background:${dm==='dark'?'#EEF2FF':'#F5F6FA'};color:${dm==='dark'?'#5C4EE5':'#6b7280'};font-weight:600;font-size:12px;cursor:pointer;font-family:inherit">🌙 Dunkel</button>
      </div>
    </div>

    <div style="background:var(--surface);border-radius:16px;padding:18px;margin-bottom:16px">
      <div style="font-size:14px;font-weight:700;color:var(--text1);margin-bottom:4px">Push-Nachrichten</div>
      <div style="font-size:12px;color:var(--text2);margin-bottom:14px">Auch wenn die App geschlossen ist</div>
      <button id="pp-master-btn" style="width:100%;padding:14px;border:2px solid ${enabled ? '#5C4EE5' : 'var(--border)'};border-radius:12px;background:${enabled ? '#5C4EE5' : '#F5F6FA'};color:${enabled ? 'white' : '#5C4EE5'};font-weight:700;font-size:15px;cursor:pointer;font-family:inherit">
        ${enabled ? '✓ Aktiv – deaktivieren' : 'Push aktivieren'}
      </button>
      <div id="pp-status" style="font-size:12px;color:var(--text2);text-align:center;margin-top:8px">
        Status: ${permission === 'granted' ? '✓ Erlaubnis erteilt' : permission === 'denied' ? '✗ Blockiert' : '⚠️ Noch nicht erlaubt'}
      </div>
    </div>

    <div style="background:var(--surface);border-radius:16px;overflow:hidden;margin-bottom:16px">
      ${row('pp-assign',   '📋 Aufgabe zugewiesen', 'Wenn dir jemand eine Aufgabe gibt', 'assignEnabled',  true)}
      ${row('pp-comment',  '💬 Neuer Kommentar',    'Bei neuen Kommentaren',            'commentEnabled', true)}
      ${row('pp-board',    '📌 Home-Feed',           'Bei neuen Beiträgen',              'boardEnabled',   true)}
    </div>
    ${!isPremiumActive() ? `<div onclick="window._app.showUpgradeModal('pushFull')" style="display:flex;align-items:center;gap:10px;background:linear-gradient(135deg,#EEF2FF,#F5F3FF);border:1px solid #c7d2fe;border-radius:12px;padding:10px 14px;margin-bottom:16px;cursor:pointer">
      <span style="font-size:18px">🔒</span>
      <div style="flex:1"><div style="font-size:12px;font-weight:700;color:#5C4EE5">Weitere Benachrichtigungen mit Plus</div><div style="font-size:11px;color:#6b7280">Kommentare, Board-Posts & Morgens-Übersicht</div></div>
      <span style="color:#5C4EE5;font-size:14px">›</span>
    </div>` : ''}

    <div style="background:var(--surface);border-radius:16px;overflow:hidden;margin-bottom:32px">
      <div style="padding:14px 16px;border-bottom:1px solid var(--border2,#F5F6FA)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <div style="font-size:13px;font-weight:600;color:var(--text1)">⏰ Erinnerung vor Termin</div>
          <button id="pp-reminder" style="${sw(remEnabled)}">${swDot(remEnabled)}</button>
        </div>
        <div style="display:flex;gap:8px">
          ${[10,15,30,60].map(n => `<button class="pp-min-btn" data-mins="${n}" style="flex:1;padding:8px 4px;border:1px solid ${mins===n?'#5C4EE5':'var(--border)'};border-radius:8px;background:${mins===n?'#EEF2FF':'#F5F6FA'};color:${mins===n?'#5C4EE5':'#6b7280'};font-size:12px;font-weight:600;cursor:pointer;font-family:inherit">${n < 60 ? n + ' Min.' : '1 Std.'}</button>`).join('')}
        </div>
      </div>
      <div style="padding:14px 16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <div>
            <div style="font-size:13px;font-weight:600;color:var(--text1)">🌅 Morgens-Übersicht</div>
            <div style="font-size:11px;color:var(--text2)">Alle heutigen Aufgaben</div>
          </div>
          <button id="pp-daily" style="${sw(dailyEnabled)}">${swDot(dailyEnabled)}</button>
        </div>
        <div style="display:flex;gap:8px">
          ${[6,7,8,9].map(h => `<button class="pp-hour-btn" data-hour="${h}" style="flex:1;padding:8px 4px;border:1px solid ${dailyHour===h?'#5C4EE5':'var(--border)'};border-radius:8px;background:${dailyHour===h?'#EEF2FF':'#F5F6FA'};color:${dailyHour===h?'#5C4EE5':'#6b7280'};font-size:12px;font-weight:600;cursor:pointer;font-family:inherit">${h}:00</button>`).join('')}
        </div>
      </div>
    </div>`;

  document.body.appendChild(overlay);

  // ── Event Listeners ───────────────────────────────────────
  document.getElementById('push-done-btn').addEventListener('click', () => overlay.remove());

  // Dark mode buttons
  ['light','system','dark'].forEach(mode => {
    document.getElementById('dm-' + mode)?.addEventListener('click', () => {
      window._app.setDarkMode(mode);
      overlay.remove();
      window._app.showPushPage();
    });
  });

  // Toggle switches
  ['pp-assign','pp-comment','pp-board','pp-reminder','pp-daily'].forEach(id => {
    const keyMap = { 'pp-assign': 'assignEnabled', 'pp-comment': 'commentEnabled', 'pp-board': 'boardEnabled', 'pp-reminder': 'reminderEnabled', 'pp-daily': 'dailyEnabled' };
    document.getElementById(id)?.addEventListener('click', function() { toggleSwitch(keyMap[id], this); });
  });

  // Minute buttons
  overlay.querySelectorAll('.pp-min-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const n = parseInt(this.dataset.mins);
      setPushSetting('reminderMinutes', n);
      overlay.querySelectorAll('.pp-min-btn').forEach(b => {
        b.style.background = '#F5F6FA'; b.style.color = '#6b7280'; b.style.borderColor = 'var(--border)';
      });
      this.style.background = '#EEF2FF'; this.style.color = '#5C4EE5'; this.style.borderColor = '#5C4EE5';
      // Sofort nach Firebase speichern
      _syncSubscription();
    });
  });

  // Hour buttons
  overlay.querySelectorAll('.pp-hour-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const h = parseInt(this.dataset.hour);
      setPushSetting('dailyHour', h);
      overlay.querySelectorAll('.pp-hour-btn').forEach(b => {
        b.style.background = '#F5F6FA'; b.style.color = '#6b7280'; b.style.borderColor = 'var(--border)';
      });
      this.style.background = '#EEF2FF'; this.style.color = '#5C4EE5'; this.style.borderColor = '#5C4EE5';
      _syncSubscription();
    });
  });

  // Einstellungen sofort nach Firebase syncen – auch wenn 'enabled' false ist,
  // solange eine aktive Subscription im Browser existiert
  async function _syncSubscription() {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        // Subscription existiert → immer syncen
        setPushSetting('enabled', true); // enabled flag korrigieren
        await savePushSubscriptionToServer(sub);
      }
    } catch(e) { console.warn('sync sub:', e); }
  }

  // Master button – iOS: requestPermission muss DIREKT im click-handler laufen
  document.getElementById('pp-master-btn').addEventListener('click', function() {
    const btn = this;
    const statusEl = document.getElementById('pp-status');

    if (getPushSetting('enabled', false)) {
      btn.disabled = true; btn.textContent = '⏳ Bitte warten…';
      const disableFn = nativePlatform ? disableNativePush : disablePush;
      disableFn().then(() => {
        btn.textContent = 'Push aktivieren';
        btn.style.background = '#F5F6FA'; btn.style.color = '#5C4EE5'; btn.style.borderColor = 'var(--border)';
        if (statusEl) statusEl.textContent = 'Status: deaktiviert';
        btn.disabled = false;
      });
      return;
    }

    // ── NATIVE APP (iOS App Store/TestFlight): FCM/APNs statt Web-Push ──
    if (nativePlatform) {
      btn.textContent = '⏳ Erlaubnis anfragen…';
      enableNativePush().then(result => {
        if (!result.ok) {
          btn.textContent = 'Push aktivieren'; btn.disabled = false;
          if (result.reason === 'denied') {
            showSync('Bitte in Einstellungen → famiplan → Mitteilungen erlauben');
            if (statusEl) statusEl.textContent = 'Status: ✗ Blockiert';
          } else {
            showSync('Fehler beim Aktivieren – bitte erneut versuchen');
            if (statusEl) statusEl.textContent = 'Fehler: kein Token erhalten';
          }
          return;
        }
        btn.textContent = '✓ Aktiv – deaktivieren';
        btn.style.background = '#5C4EE5'; btn.style.color = 'white'; btn.style.borderColor = '#5C4EE5';
        if (statusEl) statusEl.textContent = 'Status: ✓ Aktiv';
        btn.disabled = false;
        scheduleReminders();
        showSync('🔔 Push-Benachrichtigungen aktiviert!');
      }).catch(e => {
        btn.textContent = 'Push aktivieren'; btn.disabled = false;
        if (statusEl) statusEl.textContent = 'Fehler: ' + e.message;
        showSync('Fehler: ' + e.message);
      });
      return;
    }

    // ── WEB/PWA (unverändert) ──────────────────────────────────────
    btn.textContent = '⏳ Erlaubnis anfragen…';
    Notification.requestPermission().then(permission => {
      const statusEl = document.getElementById('pp-status');
      if (permission === 'denied') {
        btn.textContent = 'Push aktivieren';
        showSync('Bitte in Einstellungen → famiplan → Mitteilungen erlauben');
        btn.disabled = false; return;
      }

      btn.textContent = '⏳ SW bereit machen…';
      if (statusEl) statusEl.textContent = 'Warte auf Service Worker…';

      const swTimeout = setTimeout(() => {
        if (statusEl) statusEl.textContent = 'Fehler: SW timeout – bitte App neu starten';
        btn.textContent = 'Push aktivieren'; btn.disabled = false;
      }, 8000);

      navigator.serviceWorker.ready.then(reg => {
        clearTimeout(swTimeout);
        if (statusEl) statusEl.textContent = 'SW bereit, subscribe läuft…';
        btn.textContent = '⏳ Subscribe…';

        let appKey;
        try { appKey = urlBase64ToUint8Array(PUSH_VAPID_PUBLIC_KEY); }
        catch (e) { if (statusEl) statusEl.textContent = 'VAPID Fehler: ' + e.message; btn.textContent = 'Push aktivieren'; btn.disabled = false; return; }

        const subTimeout = setTimeout(() => {
          if (statusEl) statusEl.textContent = 'Subscribe timeout – versuche erneut';
          btn.textContent = 'Push aktivieren'; btn.disabled = false;
        }, 10000);

        // iOS WebKit: erst CryptoKey, dann Uint8Array Fallback
        crypto.subtle.importKey('raw', appKey.buffer, { name: 'ECDSA', namedCurve: 'P-256' }, false, [])
          .then(ck => {
            if (statusEl) statusEl.textContent = 'Subscribe mit CryptoKey…';
            return reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: ck });
          })
          .catch(() => {
            if (statusEl) statusEl.textContent = 'Subscribe mit Uint8Array…';
            return reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: appKey });
          })
          .then(sub => {
            clearTimeout(subTimeout);
            setPushSetting('enabled', true);
            savePushSubscriptionToServer(sub).catch(e => console.warn(e));
            btn.textContent = '✓ Aktiv – deaktivieren';
            btn.style.background = '#5C4EE5'; btn.style.color = 'white'; btn.style.borderColor = '#5C4EE5';
            if (statusEl) statusEl.textContent = 'Status: ✓ Aktiv';
            btn.disabled = false;
            scheduleReminders();
            showSync('🔔 Push-Benachrichtigungen aktiviert!');
          })
          .catch(e => {
            clearTimeout(subTimeout);
            if (statusEl) statusEl.textContent = 'Fehler: ' + e.name + ': ' + e.message;
            showSync('Fehler: ' + e.name + ' – ' + e.message);
            btn.textContent = 'Push aktivieren'; btn.disabled = false;
          });
      }).catch(e => {
        clearTimeout(swTimeout);
        if (statusEl) statusEl.textContent = 'SW Fehler: ' + e.message;
        btn.textContent = 'Push aktivieren'; btn.disabled = false;
      });
    });
  });
}


