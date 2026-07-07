// ══════════════════════════════════════════════════════════════
// famiplan – calendarSync.js
// Apple Calendar Sync (Premium, iOS-only) – Zwei-Wege-Sync via EventKit
//
// Plugin: @ebarooni/capacitor-calendar (community, aktiv gepflegt,
// MIT-Lizenz). KEIN offizielles @capacitor/calendar existiert.
// API-Referenz: https://ebarooni.github.io/capacitor-calendar/
//
// WICHTIG – Architektur-Grundsatz:
// EventKit ist eine lokale On-Device-API. Es gibt KEINEN Server-zu-Server-
// Kanal zu iCloud. Sync passiert daher NICHT permanent im Hintergrund,
// sondern wird getriggert:
//   1. App-Start (appInit)
//   2. Foreground-Wechsel (visibilitychange / Capacitor App.addListener('resume'))
//   3. Manuell ueber "Jetzt synchronisieren"-Button in den Einstellungen
//
// Sync-Richtung: Firebase (Familien-Wahrheitsquelle fuer alle Termine) <->
// EventKit (persoenlicher iOS-Kalender NUR dieses einen Geraets/Nutzers).
// Jedes Familienmitglied synct seinen eigenen sichtbaren Ausschnitt.
//
// Konfliktstrategie: 'newer wins' ueber updatedAt (Firebase, ms) vs.
// lastModifiedDate (EventKit, ms) - siehe CALENDAR_SYNC_CONFLICT_STRATEGY.
//
// GUARD: Dieses gesamte Modul ist inert, solange CALENDAR_SYNC_ENABLED
// (config.js) false ist. Alle exportierten Funktionen pruefen das Flag
// als erstes und brechen no-op ab. Das Plugin wird NIE statisch
// importiert, nur dynamisch bei Bedarf.
// ══════════════════════════════════════════════════════════════

import { CALENDAR_SYNC_ENABLED, CALENDAR_SYNC_CONFLICT_STRATEGY, CALENDAR_SYNC_RESPECT_VISIBILITY } from './config.js';
import { state, setState } from './state.js';
import { fbSet, fbPush } from './firebase.js';
import { isPremiumActive } from './premium.js';

const SYNC_CALENDAR_NAME = 'famiplan';
const LS_LAST_SYNC_KEY   = 'fp_calendar_sync_last';

// ── PLATTFORM-CHECK ───────────────────────────────────────────
export function isCalendarSyncSupported() {
  if (!CALENDAR_SYNC_ENABLED) return false;
  try {
    return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform() && window.Capacitor.getPlatform() === 'ios');
  } catch (e) {
    return false;
  }
}

// ── USER-SETTING (Opt-in, pro Geraet in localStorage) ──────────
export function isCalendarSyncEnabledByUser() {
  return localStorage.getItem('fp_calendar_sync_optin') === '1';
}

export function setCalendarSyncOptIn(on) {
  if (on) localStorage.setItem('fp_calendar_sync_optin', '1');
  else    localStorage.removeItem('fp_calendar_sync_optin');
}

// ── LAZY PLUGIN LOADER ─────────────────────────────────────────
let _pluginPromise = null;
function loadCalendarPlugin() {
  // Bevorzugt: bereits nativ registriertes Plugin direkt über die
  // globale Capacitor-Bridge holen (funktioniert zuverlässig in der
  // installierten App). Der dynamische ES-Import via import() blieb in
  // der Praxis unaufgelöst haengen und blockierte damit dauerhaft jeden
  // Aufruf, da das Ergebnis in _pluginPromise gecacht wird.
  if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.CapacitorCalendar) {
    _pluginPromise = Promise.resolve(window.Capacitor.Plugins.CapacitorCalendar);
    return _pluginPromise;
  }
  if (!_pluginPromise) {
    _pluginPromise = import('@ebarooni/capacitor-calendar').then(m => m.CapacitorCalendar);
  }
  return _pluginPromise;
}

// ── PERMISSION ───────────────────────────────────────────────
export async function requestCalendarPermission() {
  if (!isCalendarSyncSupported()) return false;
  try {
    const plugin = await loadCalendarPlugin();
    const { result } = await plugin.requestFullCalendarAccess();
    return result === 'granted';
  } catch (e) {
    console.warn('Calendar permission request failed:', e.message);
    return false;
  }
}

// ── ZIEL-KALENDER SICHERSTELLEN ────────────────────────────────
let _famiplanCalendarId = null;
async function ensureFamiplanCalendar(plugin) {
  if (_famiplanCalendarId) return _famiplanCalendarId;
  const { result: calendars } = await plugin.listCalendars();
  const existing = (calendars || []).find(c => c.title === SYNC_CALENDAR_NAME);
  if (existing) { _famiplanCalendarId = existing.id; return existing.id; }
  const { id } = await plugin.createCalendar({ title: SYNC_CALENDAR_NAME, color: '#5C4EE5' });
  _famiplanCalendarId = id;
  return id;
}

// ── SICHTBARKEITSFILTER ─────────────────────────────────────────
// Grundgeruest-Entscheidung: nur type:'event' wird gesynct (keine Aufgaben/To-Dos).
function isSyncable(t) {
  if (t.type !== 'event') return false;
  if (!CALENDAR_SYNC_RESPECT_VISIBILITY) return true;
  const v = t.visibleTo;
  if (!v || v === 'all') return true;
  if (Array.isArray(v)) return v.includes(state.curUser);
  return v === state.curUser;
}

// ── EXPORT: famiplan-Event -> EventKit-Felder mappen ────────────
// Das Plugin erwartet Unix-Timestamps in Millisekunden, keine ISO-Strings.
function taskToEventKitFields(t) {
  const dateStr = t.date;
  let startMs, endMs, isAllDay;
  if (t.allDay) {
    isAllDay = true;
    startMs  = new Date(dateStr + 'T00:00:00').getTime();
    const endRaw = t.endDate || dateStr;
    endMs    = new Date(endRaw + 'T23:59:59').getTime();
  } else {
    isAllDay = false;
    startMs  = new Date(dateStr + 'T' + (t.time || '12:00') + ':00').getTime();
    endMs    = t.endTime
      ? new Date(dateStr + 'T' + t.endTime + ':00').getTime()
      : startMs + 3600000;
  }
  return {
    title:     `${t.emoji || ''} ${t.title}`.trim(),
    startDate: startMs,
    endDate:   endMs,
    isAllDay,
    location:  t.location || '',
    description: 'Synchronisiert von famiplan',
  };
}

// ── EXPORT-RICHTUNG: Firebase -> EventKit ───────────────────────
async function pushTaskToEventKit(t, calendarId, plugin) {
  const fields = taskToEventKitFields(t);
  if (t.appleEventId) {
    try {
      await plugin.modifyEvent({ id: t.appleEventId, ...fields, calendarId });
      return t.appleEventId;
    } catch (e) {
      // EventKit-Eintrag existiert evtl. nicht mehr -> neu anlegen
    }
  }
  const { id } = await plugin.createEvent({ ...fields, calendarId });
  return id;
}

// ── IMPORT-RICHTUNG: EventKit -> Firebase ────────────────────────
function importEventFromEventKit(ev) {
  const existing = state.tasks.find(t => t.appleEventId === ev.id);
  if (existing) return null;

  const start = new Date(ev.startDate);
  const dateISO = `${start.getFullYear()}-${String(start.getMonth()+1).padStart(2,'0')}-${String(start.getDate()).padStart(2,'0')}`;
  return {
    title:        (ev.title || 'Termin').trim(),
    emoji:        '',
    type:         'event',
    date:         dateISO,
    day:          null,
    time:         ev.isAllDay ? '00:00' : `${String(start.getHours()).padStart(2,'0')}:${String(start.getMinutes()).padStart(2,'0')}`,
    endTime:      '',
    color:        '#5C4EE5',
    recurring:    'once',
    recurringInterval: 1,
    weekdays:     [],
    location:     ev.location || '',
    attendees:    [],
    openTodo:     false,
    visibleTo:    state.curUser,
    allDay:       !!ev.isAllDay,
    appleEventId: ev.id,
    appleSyncedAt: Date.now(),
    updatedAt:    Date.now(),
    createdBy:    state.curUser,
    assignments:  { [dateISO]: { assignedTo: state.curUser, done: false } },
  };
}

// ── KONFLIKTAUFLOESUNG ────────────────────────────────────────────
function resolveConflict(firebaseUpdatedAt, eventKitLastModifiedMs) {
  if (CALENDAR_SYNC_CONFLICT_STRATEGY !== 'newer') return 'firebase';
  if (!eventKitLastModifiedMs) return 'firebase';
  if (!firebaseUpdatedAt) return 'eventkit';
  return eventKitLastModifiedMs > firebaseUpdatedAt ? 'eventkit' : 'firebase';
}

function stripId(t) {
  const { id, ...rest } = t;
  return rest;
}

// ── HAUPT-SYNC-LAUF ──────────────────────────────────────────────
export async function runCalendarSync({ silent = false } = {}) {
  if (!isCalendarSyncSupported())        return { ok: false, reason: 'unsupported' };
  if (!isCalendarSyncEnabledByUser())    return { ok: false, reason: 'opted-out' };
  if (!isPremiumActive())                return { ok: false, reason: 'not-premium' };
  if (!state.familyId || !state.curUser) return { ok: false, reason: 'no-family' };

  const granted = await requestCalendarPermission();
  if (!granted) return { ok: false, reason: 'permission-denied' };

  let plugin, calendarId;
  try {
    plugin = await loadCalendarPlugin();
    calendarId = await ensureFamiplanCalendar(plugin);
  } catch (e) {
    console.warn('Calendar sync setup failed:', e.message);
    return { ok: false, reason: 'setup-failed', error: e.message };
  }

  const stats = { exported: 0, imported: 0, updated: 0, skipped: 0, errors: 0 };

  const rangeStart = Date.now() - 31 * 24 * 60 * 60 * 1000;
  const rangeEnd   = Date.now() + 183 * 24 * 60 * 60 * 1000;
  let eventKitEvents = [];
  try {
    const { result } = await plugin.listEventsInRange({ from: rangeStart, to: rangeEnd });
    eventKitEvents = (result || []).filter(ev => ev.calendarId === calendarId);
  } catch (e) {
    console.warn('Sync: listEventsInRange failed:', e.message);
  }
  const eventKitById = new Map(eventKitEvents.map(ev => [ev.id, ev]));

  const syncableTasks = state.tasks.filter(isSyncable);
  for (const t of syncableTasks) {
    try {
      const eventKitEvent = t.appleEventId ? eventKitById.get(t.appleEventId) : null;
      const winner = resolveConflict(t.updatedAt, eventKitEvent?.lastModifiedDate);

      if (winner === 'eventkit' && eventKitEvent) {
        const patch = {
          title:    (eventKitEvent.title || t.title).trim() || t.title,
          location: eventKitEvent.location || t.location,
          updatedAt: Date.now(),
          appleSyncedAt: Date.now(),
        };
        await fbSet(`tasks/${t.id}`, { ...stripId(t), ...patch });
        setState({ tasks: state.tasks.map(x => x.id === t.id ? { ...x, ...patch } : x) });
        stats.updated++;
        continue;
      }

      const appleEventId = await pushTaskToEventKit(t, calendarId, plugin);
      if (appleEventId && appleEventId !== t.appleEventId) {
        await fbSet(`tasks/${t.id}/appleEventId`, appleEventId);
        await fbSet(`tasks/${t.id}/appleSyncedAt`, Date.now());
        setState({ tasks: state.tasks.map(x => x.id === t.id ? { ...x, appleEventId, appleSyncedAt: Date.now() } : x) });
      }
      stats.exported++;
    } catch (e) {
      console.warn('Sync export error for task', t.id, e.message);
      stats.errors++;
    }
  }

  for (const ev of eventKitEvents) {
    try {
      const payload = importEventFromEventKit(ev);
      if (!payload) { stats.skipped++; continue; }
      const result = await fbPush('tasks', payload);
      const newTask = { id: result.name, ...payload };
      setState({ tasks: [...state.tasks, newTask] });
      stats.imported++;
    } catch (e) {
      console.warn('Sync import error for event', ev.id, e.message);
      stats.errors++;
    }
  }

  localStorage.setItem(LS_LAST_SYNC_KEY, String(Date.now()));
  if (!silent) console.log('Calendar sync finished:', stats);
  return { ok: true, stats };
}

export function getLastSyncTime() {
  const ts = localStorage.getItem(LS_LAST_SYNC_KEY);
  return ts ? parseInt(ts) : null;
}

// ── SYNC-TRIGGER REGISTRIEREN ────────────────────────────────────
export function initCalendarSyncTriggers() {
  if (!CALENDAR_SYNC_ENABLED) return;

  setTimeout(() => { runCalendarSync({ silent: true }); }, 4000);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      runCalendarSync({ silent: true });
    }
  });

  // TODO: @capacitor/app vorübergehend deinstalliert (Versions-Konflikt mit
  // capacitor-swift-pm 8.x, siehe Session-Notizen). Sobald ein kompatibler
  // Patch-Release verfügbar ist, hier wieder aktivieren (Paket erneut via
  // `npm install @capacitor/app@latest` installieren) UND diesen Block
  // wiederherstellen, damit Resume-Events wieder einen Sync auslösen:
  //
  // if (window.Capacitor?.isNativePlatform?.()) {
  //   import('@capacitor/app').then(({ App }) => {
  //     App.addListener('resume', () => runCalendarSync({ silent: true }));
  //   }).catch(() => {});
  // }
}
