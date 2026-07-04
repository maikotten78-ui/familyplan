import { DAYS } from './config.js';
import { localISO } from './utils.js';
// localISO() is dynamic – always use localISO() instead of the constant
import { state, setState } from './state.js';
import { fbGet, fbSet, fbPush, fbDel } from './firebase.js';
import { saveCache, loadCache } from './cache.js';
import { isoFromDay, dayFromISO, escapeHtml, jd2i } from './utils.js';
import { registerListener } from './listener.js';

// ── NORMALIZE ─────────────────────────────────────────────────
export function normalizeTask(id, t) {
  const isOpen = t.openTodo === true;
  return {
    id,
    title:           t.title || '',
    emoji:           t.emoji || '',
    day:             isOpen ? (t.day || null) : (t.day || 'Montag'),
    date:            isOpen ? (t.date || null) : (t.date || isoFromDay(t.day || 'Montag')),
    time:            t.time || '12:00',
    endTime:         t.endTime || '',
    color:           t.color || '#667eea',
    recurring:       t.recurring || 'once',
    recurringInterval: t.recurringInterval || 1,
    weekdays:        t.weekdays || [],
    type:            t.type || 'task',
    assignments:     t.assignments || (t.assignedTo ? { [localISO()]: { assignedTo: t.assignedTo, done: t.done || false } } : {}),
    location:        t.location || '',
    createdBy:       t.createdBy || '',
    excludedDates:   Array.isArray(t.excludedDates) ? t.excludedDates : (t.excludedDates ? Object.values(t.excludedDates) : []),
    attendees:       Array.isArray(t.attendees) ? t.attendees : [],
    openTodo:        isOpen,
    visibleTo:       t.visibleTo || 'all', // can be 'all', string, or array
    allDay:          t.allDay === true,
    endDate:         t.endDate || null,
    // ── Apple Calendar Sync (Premium, optional) ──────────────────
    appleEventId:    t.appleEventId || null,    // EventKit identifier, pro Gerät unterschiedlich möglich
    appleSyncedAt:   t.appleSyncedAt || null,    // ms-Timestamp letzter erfolgreicher Sync
    updatedAt:       t.updatedAt || t.createdAt || null, // für 'newer wins' Konfliktauflösung
  };
}

// ── ASSIGNMENT HELPERS ────────────────────────────────────────
export function getA(t, iso) {
  if (t.assignments && t.assignments[iso]) return t.assignments[iso];
  // Für once-Tasks: done-Status ist datums-unabhängig – irgendeinen done=true Eintrag suchen
  if (t.recurring === 'once' && t.assignments) {
    const anyDone = Object.values(t.assignments).find(a => a.done);
    if (anyDone) return anyDone;
  }
  return { assignedTo: null, done: false };
}

export function setA(t, iso, patch) {
  const cur = getA(t, iso);
  return { ...(t.assignments || {}), [iso]: { ...cur, ...patch } };
}

// ── VISIBILITY ────────────────────────────────────────────────
export function isVisible(t, dayName, viewISO) {
  if (t.openTodo) return true;
  if (t.excludedDates && t.excludedDates.includes(viewISO)) return false;
  if (t.recurring === 'once') {
    // Ganztägiges mehrtägiges Event: an jedem Tag zwischen date und endDate sichtbar
    if (t.type === 'event' && t.endDate && t.endDate > t.date) {
      return viewISO >= t.date && viewISO <= t.endDate;
    }
    return t.date === viewISO;
  }

  const startISO = t.date || isoFromDay(t.day);
  if (viewISO < startISO) return false;

  const interval = t.recurringInterval || 1;

  if (t.recurring === 'weekly') {
    if (t.day !== dayName) return false;
    if (interval <= 1) return true;
    const msPerWeek  = 7 * 24 * 60 * 60 * 1000;
    const startD     = new Date(startISO + 'T12:00:00');
    const viewD      = new Date(viewISO  + 'T12:00:00');
    const weeksDiff  = Math.round((viewD - startD) / msPerWeek);
    return weeksDiff >= 0 && weeksDiff % interval === 0;
  }
  if (t.recurring === 'monthly') {
    if (t.day !== dayName) return false;
    if (interval <= 1) return true;
    const startD     = new Date(startISO + 'T12:00:00');
    const viewD      = new Date(viewISO  + 'T12:00:00');
    const monthsDiff = (viewD.getFullYear() - startD.getFullYear()) * 12 + (viewD.getMonth() - startD.getMonth());
    return monthsDiff >= 0 && monthsDiff % interval === 0;
  }
  if (t.recurring === 'yearly') return t.day === dayName;
  if (t.recurring === 'daily') {
    if (t.weekdays && t.weekdays.length > 0) return t.weekdays.includes(DAYS.indexOf(dayName));
    return true;
  }
  return t.day === dayName;
}

export function isOverdue(t, iso) {
  if (t.openTodo || t.type === 'event') return false;
  const today = localISO();
  if (t.recurring === 'once') {
    return t.date && t.date < today && !getA(t, t.date).done;
  }
  // Wiederkehrende Tasks: max. 7 Tage zurückschauen
  const start = new Date(today + 'T12:00:00');
  for (let i = 1; i <= 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() - i);
    const pastISO  = localISO(d);
    const pastDay  = DAYS[jd2i(d.getDay())];
    if (isVisible(t, pastDay, pastISO) && !getA(t, pastISO).done) return true;
  }
  return false;
}

export function getOverdueDates(t) {
  if (t.openTodo || t.type === 'event') return [];
  const today = localISO();
  if (t.recurring === 'once') {
    if (t.date && t.date < today && !getA(t, t.date).done) return [t.date];
    return [];
  }
  const dates = [];
  const start = new Date(today + 'T12:00:00');
  for (let i = 1; i <= 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() - i);
    const pastISO = localISO(d);
    const pastDay = DAYS[jd2i(d.getDay())];
    if (isVisible(t, pastDay, pastISO) && !getA(t, pastISO).done) dates.push(pastISO);
  }
  return dates;
}

export function recLabel(t) {
  if (t.recurring === 'daily' && t.weekdays && t.weekdays.length > 0) return 'Wochentage';
  const i = t.recurringInterval || 1;
  if (t.recurring === 'weekly')  return i > 1 ? `Alle ${i} Wochen`  : 'Wöchentlich';
  if (t.recurring === 'monthly') return i > 1 ? `Alle ${i} Monate` : 'Monatlich';
  return { daily: 'Täglich', yearly: 'Jährlich', once: 'Einmalig' }[t.recurring] || t.recurring;
}

export function recClass(t) {
  if (t.recurring === 'daily' && t.weekdays && t.weekdays.length > 0) return 'b-daily';
  return { weekly: 'b-weekly', daily: 'b-daily', monthly: 'b-monthly', yearly: 'b-yearly', once: 'b-once' }[t.recurring] || 'b-once';
}

// ── CHANGE DETECTION ──────────────────────────────────────────
// Leichtgewichtiger Fingerprint statt JSON.stringify auf dem ganzen Objekt.
// Erfasst alle Felder die sich nach dem ersten Speichern noch ändern können:
// Assignments (done/assignedTo), Bearbeitungen (Titel, Zeit, Farbe, etc.),
// excludedDates (Occurrence löschen) und visibleTo.
// Sortiert nach ID → reihenfolge-unabhängig.
function taskFingerprint(tasks) {
  return tasks
    .map(t => [
      t.id,
      t.title,
      t.date,
      t.time,
      t.endTime || '',
      t.color,
      t.emoji,
      t.recurring,
      t.location || '',
      Array.isArray(t.visibleTo) ? t.visibleTo.slice().sort().join(',') : (t.visibleTo || ''),
      (t.excludedDates || []).join(','),
      JSON.stringify(t.assignments || {}),
    ].join(':'))
    .sort()
    .join('|');
}

// ── LOAD ──────────────────────────────────────────────────────
export async function loadTasks(renderContent, loadComments) {
  if (!state.familyId) { console.warn('loadTasks: no familyId'); return; }

  const deletedIds = JSON.parse(localStorage.getItem('fp_deleted_tasks') || '[]');

  // Show cache first (only if family matches)
  if (!window._taskPoll) {
    const cachedFamilyId = localStorage.getItem('fp_cache_family_id');
    if (cachedFamilyId === state.familyId) {
      const cached = loadCache('tasks');
      if (cached && cached.length) {
        setState({ tasks: cached.filter(t => !deletedIds.includes(t.id)) });
        renderContent();
      }
    } else {
      // Different family → wipe cache
      Object.keys(localStorage).filter(k => k.startsWith('fp_cache_')).forEach(k => localStorage.removeItem(k));
      setState({ tasks: [] });
    }
  }

  // Poll guard: no user → skip Firebase
  if (!state.currentAuthUser) {
    if (!window._taskPoll) {
      window._taskPoll    = true;
      window._taskPollId  = setInterval(() => { loadTasks(renderContent, loadComments); loadComments(); }, 5000);
    }
    return;
  }

  try {
    const data = await fbGet('tasks');
    if (data) {
      let newTasks = Object.entries(data).map(([id, t]) => normalizeTask(id, t))
        .filter(t => !deletedIds.includes(t.id));

      // Clean up deleted IDs that are now gone from Firebase
      const freshIds     = Object.keys(data);
      const stillPresent = deletedIds.filter(id => freshIds.includes(id));
      if (stillPresent.length !== deletedIds.length) {
        localStorage.setItem('fp_deleted_tasks', JSON.stringify(stillPresent));
      }

      // Fingerprint-Vergleich statt JSON.stringify auf dem ganzen Objekt:
      // - Schneller (nur relevante Felder, kein vollständiges Serialisieren)
      // - Reihenfolge-unabhängig (sort() vor join())
      // - Erfasst alle Änderungen: Assignments, Bearbeitungen, excludedDates, visibleTo
      if (taskFingerprint(newTasks) !== taskFingerprint(state.tasks)) {
        setState({ tasks: newTasks });
        saveCache('tasks', newTasks);
        if (state.tab !== 'shop') renderContent();
      }
    } else {
      localStorage.removeItem('fp_deleted_tasks');
      if (!state.tasks.length) { setState({ tasks: [] }); if (state.tab !== 'shop') renderContent(); }
    }
  } catch (e) {
    console.error('Tasks error:', e);
    if (state.tab !== 'shop') renderContent();
  }

  if (!window._taskPoll) {
    window._taskPoll   = true;
    window._taskPollId = setInterval(() => { loadTasks(renderContent, loadComments); loadComments(); }, 5000);
  }
}

// ── REALTIME SUBSCRIBE ────────────────────────────────────────
// Ersetzt den setInterval-Poll durch einen Firebase onValue-Listener.
// loadTasks() bleibt als Fallback erhalten (wird genutzt wenn das
// Database SDK noch nicht bereit ist oder ein Fehler auftritt).
export function subscribeToTasks(renderContent, loadComments) {
  if (!state.familyId) { console.warn('subscribeToTasks: no familyId'); return; }

  // Cache sofort anzeigen – identisch zu loadTasks()
  const deletedIds = JSON.parse(localStorage.getItem('fp_deleted_tasks') || '[]');
  const cachedFamilyId = localStorage.getItem('fp_cache_family_id');
  if (cachedFamilyId === state.familyId) {
    const cached = loadCache('tasks');
    if (cached && cached.length) {
      setState({ tasks: cached.filter(t => !deletedIds.includes(t.id)) });
      renderContent();
    }
  } else {
    Object.keys(localStorage).filter(k => k.startsWith('fp_cache_')).forEach(k => localStorage.removeItem(k));
    setState({ tasks: [] });
  }

  // Fallback auf Poll wenn Auth oder Database SDK noch nicht bereit
  if (!state.currentAuthUser || !window.firebase?.database) {
    console.warn('subscribeToTasks: Database SDK nicht bereit, Fallback auf loadTasks');
    loadTasks(renderContent, loadComments);
    return;
  }

  // Token proaktiv erneuern bevor Listener geöffnet wird
  state.currentAuthUser.getIdToken(true).catch(() => {});

  const ref = window.firebase.database().ref(`families/${state.familyId}/tasks`);

  // Sicherheitsnetz: wenn der Listener binnen 8 Sekunden keinen Initialwert
  // liefert (z.B. wegen CSP/Netzwerkproblem), auf Poll-Fallback wechseln.
  let initialValueReceived = false;
  const fallbackTimer = setTimeout(() => {
    if (!initialValueReceived) {
      console.warn('subscribeToTasks: Listener timeout, Fallback auf loadTasks');
      ref.off('value', callback);
      loadTasks(renderContent, loadComments);
    }
  }, 8000);

  // onValue feuert sofort einmal mit dem Initialwert und danach bei jeder Änderung.
  const callback = ref.on('value', snapshot => {
    if (!initialValueReceived) {
      initialValueReceived = true;
      clearTimeout(fallbackTimer);
    }
    const data = snapshot.val();
    const deletedIds = JSON.parse(localStorage.getItem('fp_deleted_tasks') || '[]');

    if (data) {
      const newTasks = Object.entries(data)
        .map(([id, t]) => normalizeTask(id, t))
        .filter(t => !deletedIds.includes(t.id));

      // Aufräumen: gelöschte IDs die Firebase nicht mehr kennt entfernen
      const freshIds = Object.keys(data);
      const stillPresent = deletedIds.filter(id => freshIds.includes(id));
      if (stillPresent.length !== deletedIds.length) {
        localStorage.setItem('fp_deleted_tasks', JSON.stringify(stillPresent));
      }

      // Firebase ist die Single Source of Truth.
      // Demo-Tasks im State behalten, Rest von Firebase übernehmen.
      const demoTasks  = state.tasks.filter(t => t.id.startsWith('demo_'));
      const finalTasks = demoTasks.length
        ? [...newTasks, ...demoTasks.filter(d => !newTasks.find(n => n.id === d.id))]
        : newTasks;

      // Fingerprint-Vergleich verhindert unnötige Re-Renders
      if (taskFingerprint(finalTasks) !== taskFingerprint(state.tasks)) {
        setState({ tasks: finalTasks });
        saveCache('tasks', finalTasks);
        if (state.tab !== 'shop') renderContent();
      }
    } else {
      localStorage.removeItem('fp_deleted_tasks');
      if (!state.tasks.length) {
        setState({ tasks: [] });
        if (state.tab !== 'shop') renderContent();
      }
    }

    // Kommentare nachladen (wie bisher nach jedem Poll-Tick)
    loadComments();

  }, async error => {
    console.error('Tasks listener error:', error);
    ref.off('value', callback);
    // Token erneuern und Listener neu starten
    if (state.currentAuthUser) {
      try {
        await state.currentAuthUser.getIdToken(true);
        // Tasks listener: Token erneuert, starte neu
        await new Promise(r => setTimeout(r, 1500));
        subscribeToTasks(renderContent, loadComments);
      } catch (e) {
        console.warn('Tasks listener: Token-Refresh fehlgeschlagen, Fallback auf Poll');
        loadTasks(renderContent, loadComments);
      }
    } else {
      loadTasks(renderContent, loadComments);
    }
  });

  // KRITISCH: Listener im zentralen Manager registrieren.
  // registerListener() trennt automatisch einen alten Listener
  // (z.B. nach Familienwechsel) bevor der neue registriert wird.
  registerListener('tasks', () => ref.off('value', callback));
}


// ── ADD ───────────────────────────────────────────────────────
export async function addTask(renderContent, closeModal, showSync, showUpgradeModal, checkRateLimit, isPremiumActive) {
  // Guard gegen Doppelklick: wenn bereits ein Save läuft sofort abbrechen
  if (state.taskSaving) return;
  const fd = state.fd;
  if (!fd.title.trim()) return;

  const isDemo = localStorage.getItem('fp_demo_mode') === '1';
  if (!isDemo && isPremiumActive && !isPremiumActive()) {
    const { checkFreeLimit } = await import('./premium.js');
    const activeTasks = state.tasks.filter(t => !t.openTodo).length;
    if (checkFreeLimit('tasks', activeTasks)) { closeModal(); return; }
  }
  if (!isDemo && !await checkRateLimit('task')) return;

  const payload = { ...fd };
  if (payload.openTodo) {
    delete payload.date; delete payload.day; delete payload.endTime;
    payload.recurring = 'once'; payload.time = '00:00';
  }
  if (payload.allDay) {
    payload.time = '00:00'; delete payload.endTime;
  }
  if (!payload.allDay) delete payload.allDay;
  if (!payload.endDate || payload.endDate === payload.date) delete payload.endDate;
  if (!payload.visibleTo || payload.visibleTo === 'all' || (Array.isArray(payload.visibleTo) && !payload.visibleTo.length)) delete payload.visibleTo;

  if (isDemo) {
    setState({ tasks: [...state.tasks, { id: 'demo_' + Date.now(), ...payload, assignments: {}, createdBy: state.curUser }] });
    resetFd();
    closeModal(); renderContent(); return;
  }

  setState({ taskSaving: true }); renderContent();

  const taskPayload = { ...payload, assignments: {}, createdBy: state.curUser, updatedAt: Date.now() };
  delete taskPayload.assignedTo; delete taskPayload.done;

  let result;
  try {
    result = await fbPush('tasks', taskPayload);
  } catch (e) {
    setState({ taskSaving: false });
    // Bei 401: Token erneuern und nochmal versuchen
    if (e.message.includes('401') || e.message.includes('Permission')) {
      try {
        await state.currentAuthUser?.getIdToken(true);
        result = await fbPush('tasks', taskPayload);
      } catch (e2) {
        showSync('⚠️ Speichern fehlgeschlagen – kurz warten und nochmal tippen');
        closeModal(); renderContent(); return;
      }
    } else {
      showSync('Fehler beim Speichern');
      closeModal(); renderContent(); return;
    }
  }

  setState({ taskSaving: false });
  const newTask = { id: result.name, ...taskPayload };
  const alreadyExists = state.tasks.some(t => t.id === result.name);
  if (!alreadyExists) {
    const newTasks = [...state.tasks, newTask];
    setState({ tasks: newTasks });
    saveCache('tasks', newTasks);
  }
  resetFd();
  closeModal(); showSync(); renderContent();
}

// ── EDIT ──────────────────────────────────────────────────────
export async function saveEdit(renderContent, closeModal, showSync) {
  const ed = state.ed;
  if (!ed || !ed.title.trim()) return;
  if (ed.color) try { localStorage.setItem('fp_last_color', ed.color); } catch {}

  if (ed.openTodo) {
    delete ed.date; delete ed.day; delete ed.endTime;
    ed.recurring = 'once'; ed.time = '00:00';
  }
  if (ed.allDay) {
    ed.time = '00:00'; delete ed.endTime;
  }
  if (!ed.allDay) delete ed.allDay;
  if (!ed.endDate || ed.endDate === ed.date) delete ed.endDate;
  if (!ed.visibleTo || ed.visibleTo === 'all' || (Array.isArray(ed.visibleTo) && !ed.visibleTo.length)) delete ed.visibleTo;
  ed.updatedAt = Date.now();

  const { id, ...rest } = ed;
  try {
    await fbSet(`tasks/${id}`, rest);
  } catch (e) {
    if (e.message.includes('401') || e.message.includes('Permission')) {
      // Token erneuern und nochmal versuchen
      try {
        await state.currentAuthUser?.getIdToken(true);
        await fbSet(`tasks/${id}`, rest);
      } catch (e2) {
        showSync('⚠️ Speichern fehlgeschlagen – bitte kurz warten und nochmal tippen');
        return;
      }
    } else {
      showSync('Fehler beim Speichern');
      return;
    }
  }
  setState({ tasks: state.tasks.map(x => x.id === id ? { ...ed } : x) });
  closeModal(); showSync(); renderContent();
}

// ── ASSIGN ────────────────────────────────────────────────────
export async function assignTask(id, member, iso, renderContent, closeModal, showSync, openModal, sendPushToFamily, getPushSetting, exportCal) {
  const viewISO = iso || state.selISO;
  const t = state.tasks.find(x => x.id === id); if (!t) return;
  const { id: _, ...rest } = t;
  const assignments = setA(t, viewISO, { assignedTo: member, done: false });
  await fbSet(`tasks/${id}`, { ...rest, assignments });
  setState({ tasks: state.tasks.map(x => x.id === id ? { ...x, assignments } : x) });
  closeModal(); showSync(); renderContent();

  if (getPushSetting('assignEnabled', true) && member !== state.curUser) {
    sendPushToFamily('assigned', { taskId: id, taskTitle: t.title, taskEmoji: t.emoji, assignedTo: member, assignedBy: state.curUser || 'Jemand' }, { excludeSelf: true });
  }
  if (t.type === 'event') {
    openModal(`<div class="modal-handle"></div>
      <div class="modal-title">In Kalender exportieren?</div>
      <div class="modal-sub">Du hast „${t.emoji} ${escapeHtml(t.title)}" übernommen.</div>
      <button class="cal-btn" onclick="window._app.exportCal('${id}')">📅 In Apple Kalender exportieren</button>
      <button class="modal-close" onclick="window._app.closeModal()">Nein danke</button>`);
  }
}

export async function unassign(id, iso, renderContent, showSync) {
  const viewISO = iso || state.selISO;
  const t = state.tasks.find(x => x.id === id); if (!t) return;
  const { id: _, ...rest } = t;
  const assignments = setA(t, viewISO, { assignedTo: null, done: false });
  await fbSet(`tasks/${id}`, { ...rest, assignments });
  setState({ tasks: state.tasks.map(x => x.id === id ? { ...x, assignments } : x) });
  showSync(); renderContent();
}

export async function toggleDone(id, iso, renderContent, showSync) {
  const viewISO = iso || state.selISO;
  const t = state.tasks.find(x => x.id === id); if (!t) return;
  const cur = getA(t, viewISO);
  const { id: _, ...rest } = t;
  const assignments = setA(t, viewISO, { done: !cur.done });
  await fbSet(`tasks/${id}`, { ...rest, assignments });
  setState({ tasks: state.tasks.map(x => x.id === id ? { ...x, assignments } : x) });
  showSync(); renderContent();
}

// ── DELETE ────────────────────────────────────────────────────
export async function deleteTask(id, iso, renderContent, openModal, closeModal, showSync) {
  const task      = state.tasks.find(t => t.id === id); if (!task) return;
  const targetISO = iso || state.selISO;
  const isRecurring = task.recurring && task.recurring !== 'once';

  if (isRecurring) {
    openModal(`
      <div class="modal-handle"></div>
      <div class="modal-title">Termin löschen</div>
      <div class="modal-sub" style="margin-bottom:20px">Es handelt sich um eine wiederkehrende Aufgabe. Was soll gelöscht werden?</div>
      <button class="submit-btn" style="margin-bottom:10px" id="del-occurrence-btn">
        Nur dieser Termin
        <div style="font-size:12px;font-weight:400;opacity:0.8;margin-top:2px">Nur am ${targetISO}</div>
      </button>
      <button style="width:100%;padding:13px;border:none;border-radius:10px;background:#FEF2F2;color:#DC2626;font-weight:600;font-size:14px;cursor:pointer;font-family:inherit" id="del-series-btn">
        Gesamte Serie löschen
        <div style="font-size:12px;font-weight:400;opacity:0.7;margin-top:2px">Alle wiederkehrenden Termine</div>
      </button>
      <button class="modal-close" style="margin-top:8px" onclick="window._app.closeModal()">Abbrechen</button>
    `);
    setTimeout(() => {
      document.getElementById('del-occurrence-btn')?.addEventListener('click', () => {
        closeModal(); deleteTaskOccurrence(id, targetISO, renderContent, showSync);
      });
      document.getElementById('del-series-btn')?.addEventListener('click', () => {
        closeModal(); deleteTaskSeries(id, renderContent, showSync);
      });
    }, 50);
  } else {
    if (!confirm('Aufgabe löschen?')) return;
    await deleteTaskSeries(id, renderContent, showSync);
  }
}

export async function deleteTaskSeries(id, renderContent, showSync) {
  const backup = state.tasks.find(x => x.id === id);
  const newTasks = state.tasks.filter(x => x.id !== id);
  setState({ tasks: newTasks });
  saveCache('tasks', newTasks);

  const deleted = JSON.parse(localStorage.getItem('fp_deleted_tasks') || '[]');
  if (!deleted.includes(id)) deleted.push(id);
  localStorage.setItem('fp_deleted_tasks', JSON.stringify(deleted));
  renderContent();

  try {
    await fbDel(`tasks/${id}`);
    showSync('✓ Gelöscht');
  } catch (e) {
    if (backup) { setState({ tasks: [...state.tasks, backup] }); saveCache('tasks', state.tasks); renderContent(); }
    const clean = JSON.parse(localStorage.getItem('fp_deleted_tasks') || '[]').filter(x => x !== id);
    localStorage.setItem('fp_deleted_tasks', JSON.stringify(clean));
    showSync('❌ ' + e.message);
  }
}

export async function deleteTaskOccurrence(id, iso, renderContent, showSync) {
  const task     = state.tasks.find(t => t.id === id); if (!task) return;
  const excluded = [...(task.excludedDates || [])];
  if (!excluded.includes(iso)) excluded.push(iso);
  setState({ tasks: state.tasks.map(t => t.id === id ? { ...t, excludedDates: excluded } : t) });
  saveCache('tasks', state.tasks);
  renderContent();
  try {
    await fbSet(`tasks/${id}/excludedDates`, excluded);
    showSync('✓ Termin entfernt');
  } catch (e) { showSync('Fehler: ' + e.message); }
}

// ── COMMENTS ─────────────────────────────────────────────────
export async function loadComments() {
  if (!state.familyId || !state.currentAuthUser) return;
  try {
    const data = await fbGet('comments');
    setState({ taskComments: data || {} });
  } catch (e) { setState({ taskComments: {} }); }
}

export async function addComment(cmtKey, text, showSync, renderContent, checkRateLimit, isPremiumActive, sendPushToFamily, getPushSetting) {
  if (!text.trim() || !state.curUser) return;
  if (localStorage.getItem('fp_demo_mode') === '1') return;
  // Free: 5 Kommentare pro Tag – Premium: unbegrenzt
  if (!isPremiumActive()) {
    const today = new Date().toISOString().split('T')[0];
    const key   = 'fp_cmt_count_' + today;
    const count = parseInt(localStorage.getItem(key) || '0');
    if (count >= 5) {
      // Modal mit Upgrade-Angebot statt nur Toast
      import('../ui/modals.js').then(m => m.showUpgradeModal('comments'));
      return;
    }
    localStorage.setItem(key, count + 1);
  }
  if (!await checkRateLimit('comment')) return false;

  // cmtKey ist bei wiederkehrenden Aufgaben taskId_iso, sonst taskId
  const taskId = cmtKey.includes('_') ? cmtKey.split('_')[0] : cmtKey;
  const comment = { author: state.curUser, text: text.trim(), ts: Date.now() };
  await fbPush(`comments/${cmtKey}`, comment);

  const taskComments = { ...state.taskComments };
  if (!taskComments[cmtKey]) taskComments[cmtKey] = {};
  taskComments[cmtKey]['c' + Date.now()] = comment;
  setState({ taskComments });
  renderContent();

  if (getPushSetting('commentEnabled', true)) {
    const ct = state.tasks.find(x => x.id === taskId);
    if (ct) sendPushToFamily('comment', { taskId, taskTitle: ct.title, author: state.curUser, text: comment.text.slice(0, 80) }, { excludeSelf: true });
  }
}

// ── FORM STATE HELPERS ────────────────────────────────────────
export function resetFd() {
  setState({ fd: {
    title: '', emoji: '', day: state.selDay, date: state.selISO,
    time: '12:00', endTime: '', color: localStorage.getItem('fp_last_color') || '#007AFF',
    recurring: 'once', recurringInterval: 1, weekdays: [], type: 'task',
    location: '', attendees: [], openTodo: false, visibleTo: 'all', allDay: false, endDate: null,
  }});
}


