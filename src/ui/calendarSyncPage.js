// ══════════════════════════════════════════════════════════════
// famiplan – calendarSyncPage.js
// Einstellungs-Seite für Apple Calendar Sync (Premium, iOS-only)
//
// Wird NUR aus showUserModal() erreichbar, und nur wenn
// CALENDAR_SYNC_ENABLED (config.js) true ist UND die Plattform passt
// (siehe isCalendarSyncSupported in calendarSync.js). Solange das
// Flag aus ist, existiert der Einstiegspunkt im UI nicht.
// ══════════════════════════════════════════════════════════════

import { state } from '../modules/state.js';
import { isPremiumActive } from '../modules/premium.js';
import {
  isCalendarSyncSupported, isCalendarSyncEnabledByUser, setCalendarSyncOptIn,
  runCalendarSync, getLastSyncTime, requestCalendarPermission,
} from '../modules/calendarSync.js';

function fmtLastSync(ts) {
  if (!ts) return 'Noch nie synchronisiert';
  const diffMin = Math.round((Date.now() - ts) / 60000);
  if (diffMin < 1)  return 'Gerade eben synchronisiert';
  if (diffMin < 60) return `Vor ${diffMin} Min. synchronisiert`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `Vor ${diffH} Std. synchronisiert`;
  return `Vor ${Math.round(diffH / 24)} Tagen synchronisiert`;
}

export function showCalendarSyncPage() {
  if (!isCalendarSyncSupported()) return; // Sollte UI-seitig nie erreichbar sein, doppelte Absicherung

  const overlay = document.createElement('div');
  overlay.id    = 'calendar-sync-page';
  overlay.style.cssText = 'position:fixed;inset:0;background:#5C4EE5;z-index:999;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:max(env(safe-area-inset-top),48px) 20px max(env(safe-area-inset-bottom,0px),80px);';

  const optedIn  = isCalendarSyncEnabledByUser();
  const premium  = isPremiumActive();
  const lastSync = getLastSyncTime();

  const sw = (active) => `width:44px;height:26px;border-radius:13px;border:none;background:${active ? '#5C4EE5' : '#D1D5DB'};position:relative;cursor:pointer;flex-shrink:0`;
  const swDot = (active) => `<span style="position:absolute;top:3px;${active ? 'right:3px' : 'left:3px'};width:20px;height:20px;border-radius:50%;background:var(--surface);display:block;pointer-events:none"></span>`;

  overlay.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:28px">
      <div style="font-size:22px;font-weight:800;color:white">🗓️ Apple Kalender</div>
      <button id="cal-sync-done-btn" style="background:rgba(255,255,255,0.2);border:none;border-radius:20px;padding:8px 16px;color:white;font-weight:700;font-size:14px;cursor:pointer;font-family:inherit">Fertig</button>
    </div>

    ${!premium ? `
    <div onclick="window._app.showUpgradeModal('calendarSync')" style="display:flex;align-items:center;gap:10px;background:var(--surface);border:1px solid #c7d2fe;border-radius:12px;padding:14px;margin-bottom:16px;cursor:pointer">
      <span style="font-size:18px">🔒</span>
      <div style="flex:1"><div style="font-size:13px;font-weight:700;color:#5C4EE5">Plus-Feature</div><div style="font-size:11px;color:var(--text2)">Apple Kalender Sync ist Teil von famiplan Plus</div></div>
      <span style="color:#5C4EE5;font-size:14px">›</span>
    </div>` : ''}

    <div style="background:var(--surface);border-radius:16px;padding:18px;margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <div>
          <div style="font-size:14px;font-weight:700;color:var(--text1)">Synchronisierung</div>
          <div style="font-size:11px;color:var(--text2)">Termine zwischen famiplan und deinem iPhone-Kalender abgleichen</div>
        </div>
        <button id="cal-sync-toggle" style="${sw(optedIn)}">${swDot(optedIn)}</button>
      </div>
    </div>

    <div style="background:var(--surface);border-radius:16px;padding:18px;margin-bottom:16px">
      <div style="font-size:12px;color:var(--text2);line-height:1.5">
        Famiplan legt einen eigenen Kalender „famiplan" auf deinem iPhone an. Neue Termine
        aus famiplan erscheinen dort automatisch, und Änderungen, die du direkt im
        iOS-Kalender machst, werden zurück übernommen. Die Synchronisierung läuft beim
        Öffnen der App und im Hintergrund, sobald iOS dafür Zeit gewährt – nicht in Echtzeit.
      </div>
    </div>

    <div style="background:var(--surface);border-radius:16px;padding:18px;margin-bottom:16px;text-align:center">
      <div style="font-size:12px;color:var(--text2);margin-bottom:10px">${fmtLastSync(lastSync)}</div>
      <button id="cal-sync-now-btn" ${!optedIn ? 'disabled' : ''} style="width:100%;padding:13px;border:none;border-radius:12px;background:${optedIn ? '#5C4EE5' : '#D1D5DB'};color:white;font-weight:700;font-size:14px;cursor:${optedIn ? 'pointer' : 'not-allowed'};font-family:inherit">
        Jetzt synchronisieren
      </button>
      <div id="cal-sync-status" style="font-size:12px;color:var(--text2);margin-top:8px;min-height:16px"></div>
    </div>`;

  document.body.appendChild(overlay);

  document.getElementById('cal-sync-done-btn').addEventListener('click', () => overlay.remove());

  document.getElementById('cal-sync-toggle').addEventListener('click', async function() {
    if (!premium) { overlay.remove(); window._app.showUpgradeModal('calendarSync'); return; }
    const next = !isCalendarSyncEnabledByUser();
    if (next) {
      const granted = await requestCalendarPermission();
      if (!granted) {
        document.getElementById('cal-sync-status').textContent = '⚠️ Kalenderzugriff wurde nicht erlaubt';
        return;
      }
    }
    setCalendarSyncOptIn(next);
    overlay.remove();
    showCalendarSyncPage();
  });

  document.getElementById('cal-sync-now-btn').addEventListener('click', async function() {
    if (!isCalendarSyncEnabledByUser()) return;
    const btn = this;
    const statusEl = document.getElementById('cal-sync-status');
    btn.disabled = true; btn.textContent = 'Synchronisiere…';
    const result = await runCalendarSync();
    btn.disabled = false; btn.textContent = 'Jetzt synchronisieren';
    if (result.ok) {
      const { exported, imported, updated, errors } = result.stats;
      statusEl.textContent = `✓ ${exported} exportiert, ${imported} importiert, ${updated} aktualisiert${errors ? `, ${errors} Fehler` : ''}`;
    } else {
      statusEl.textContent = '⚠️ Synchronisierung fehlgeschlagen: ' + result.reason;
    }
  });
}
