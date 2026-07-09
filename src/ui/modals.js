// ══════════════════════════════════════════════════════════════
// famiplan – modals.js  (Phase 6)
// Task-Formular, Meal-Modal, User-Modal, Board-New-Modal
// ══════════════════════════════════════════════════════════════

import { TASK_EMOJIS, COLORS, DAYS, WDS, MEAL_EMOJIS, PREMIUM_ENABLED, APP_STORE_URL } from '../modules/config.js';
import { state, setState } from '../modules/state.js';
import { localISO, jd2i, dayFromISO, isoFromDay, escapeHtml, escapeAttr, calcDurMins, endTimeFromDur, calcDur } from '../modules/utils.js';
import { getA } from '../modules/tasks.js';
import { saveMeal, toggleOptionalIngredient, deleteMealRecipe, saveRecipeSteps } from '../modules/meals.js';
import { isPremiumActive, isAdmin } from '../modules/premium.js';
import { openModal, closeModal, showSync } from './modal.js';
import { renderContent } from './render.js';
import { loadConnectedAccounts, revokeMemberAccess } from '../modules/members.js';

// ── Optionale Zutaten Checkboxen ─────────────────────────────
function rebuildOptChecks(val, selectedList) {
  const container = document.getElementById('meal-opt-checks');
  if (!container) return;
  const lines = (val || '').split('\n').map(s => s.trim()).filter(Boolean);
  if (!lines.length) { container.innerHTML = ''; return; }
  const svg = '<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 5l2.5 2.5 4.5-4.5"/></svg>';
  const sel = selectedList || [];
  container.innerHTML = '<div style="font-size:11px;color:var(--text3);margin-bottom:2px">Diese Woche dabei?</div>'
    + lines.map(function(ing) {
        const checked = sel.includes(ing);
        const cbId = 'opt-cb-' + ing.replace(/[^a-z0-9]/gi, '_');
        const boxStyle = checked
          ? 'width:18px;height:18px;border-radius:5px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border:1.5px solid #059669;background:#059669;'
          : 'width:18px;height:18px;border-radius:5px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border:1.5px solid #CBD5E0;background:transparent;';
        const txtStyle = checked ? 'font-size:13px;color:#059669;' : 'font-size:13px;color:var(--text1);';
        return '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:3px 0" onclick="window._togOptCb(\'' + cbId + '\')">'
          + '<input type="checkbox" id="' + cbId + '" name="opt-sel" value="' + ing.replace(/"/g, '&quot;') + '"' + (checked ? ' checked' : '') + ' style="display:none">'
          + '<span id="box-' + cbId + '" style="' + boxStyle + '">' + (checked ? svg : '') + '</span>'
          + '<span id="txt-' + cbId + '" style="' + txtStyle + '">' + ing + '</span>'
          + '</label>';
      }).join('');
}


const A = fn => `window._app.${fn}`;

// ── TASK FORM HELPERS ─────────────────────────────────────────
export function setFF(f, v, mode) {
  if (mode === 'e') setState({ ed: { ...state.ed, [f]: v } });
  else              setState({ fd: { ...state.fd, [f]: v } });
  if (f === 'color') {
    try { localStorage.setItem('fp_last_color', v); } catch {}
    // Update color buttons visually without re-rendering whole modal
    document.querySelectorAll('.color-btn').forEach(btn => {
      btn.classList.toggle('sel', btn.style.background === v || btn.style.backgroundColor === v);
    });
    return; // Don't re-render modal for color changes
  }
  if (f === 'type' && v === 'event') {
    if (mode === 'e') setState({ ed: { ...state.ed, openTodo: false } });
    else              setState({ fd: { ...state.fd, openTodo: false } });
  }
  const RELOAD = new Set(['type','emoji','recurring','openTodo','allDay']); // color handled separately
  if (RELOAD.has(f)) {
    if (f === 'recurring') {
      if (mode === 'e') setState({ ed: { ...state.ed, recurringInterval: 1 } });
      else              setState({ fd: { ...state.fd, recurringInterval: 1 } });
    }
    mode === 'e' ? showEditModal() : showAddModal();
  }
}

export function setDate(v, mode) {
  if (mode === 'e') { setState({ ed: { ...state.ed, date: v, day: dayFromISO(v) } }); showEditModal(); }
  else              { setState({ fd: { ...state.fd, date: v, day: dayFromISO(v) } }); showAddModal(); }
}

export function toggleWD(i, mode) {
  const d   = mode === 'e' ? state.ed : state.fd;
  const wds = d.weekdays.includes(i) ? d.weekdays.filter(x => x !== i) : [...d.weekdays, i];
  if (mode === 'e') setState({ ed: { ...state.ed, weekdays: wds } });
  else              setState({ fd: { ...state.fd, weekdays: wds } });
  document.querySelectorAll('.wd-btn').forEach((btn, idx) => {
    btn.className = 'wd-btn' + (wds.includes(idx) ? ' sel' : '');
  });
}

export function onEndTimeChange(val, mode) {
  if (mode === 'e') setState({ ed: { ...state.ed, endTime: val } });
  else              setState({ fd: { ...state.fd, endTime: val } });
  const d    = mode === 'e' ? state.ed : state.fd;
  const mins = calcDurMins(d.time, val);
  const sel  = document.getElementById('f-dur-select');
  if (sel && mins > 0) {
    const opts    = [...sel.options].map(o => parseInt(o.value));
    const closest = opts.reduce((a, b) => Math.abs(b - mins) < Math.abs(a - mins) ? b : a, opts[0]);
    sel.value = closest;
  }
}

export function onDurChange(mins, mode) {
  const d = mode === 'e' ? state.ed : state.fd;
  if (!d.time || !mins) return;
  const et = endTimeFromDur(d.time, mins);
  if (mode === 'e') setState({ ed: { ...state.ed, endTime: et } });
  else              setState({ fd: { ...state.fd, endTime: et } });
  const el = document.getElementById('f-endtime');
  if (el) el.value = et;
}

export function toggleAttendee(name, mode) {
  const d   = mode === 'e' ? state.ed : state.fd;
  const att = d.attendees || [];
  const nw  = att.includes(name) ? att.filter(x => x !== name) : [...att, name];
  if (mode === 'e') setState({ ed: { ...state.ed, attendees: nw } });
  else              setState({ fd: { ...state.fd, attendees: nw } });
  const grid = document.getElementById('f-attendees-grid');
  if (grid) {
    grid.querySelectorAll('.member-btn').forEach(btn => {
      if (btn.dataset.member === name) btn.classList.toggle('sel', nw.includes(name));
    });
  }
}

export function toggleVisibleTo(name, mode) {
  const d   = mode === 'e' ? state.ed : state.fd;
  // Normalisiere: 'all' oder alte String-Werte → Array
  const cur = Array.isArray(d.visibleTo)
    ? d.visibleTo
    : (!d.visibleTo || d.visibleTo === 'all') ? [] : [d.visibleTo];
  const nw  = cur.includes(name) ? cur.filter(x => x !== name) : [...cur, name];
  if (mode === 'e') setState({ ed: { ...state.ed, visibleTo: nw.length ? nw : 'all' } });
  else              setState({ fd: { ...state.fd, visibleTo: nw.length ? nw : 'all' } });
  // Update buttons without full re-render
  const grid = document.getElementById('f-visibleto-grid');
  if (grid) {
    grid.querySelectorAll('.member-btn').forEach(btn => {
      if (btn.dataset.member === name) btn.classList.toggle('sel', nw.includes(name));
    });
  }
}

// ── ATTENDEE PICKER ───────────────────────────────────────────
function attendeePickerHTML(data, mode) {
  if (!state.members.length) return '';
  const cur  = data.attendees || [];
  const btns = state.members.map(mb => {
    const sel = cur.includes(mb);
    const av  = state.photos?.[mb]
      ? `<img src="${state.photos[mb]}" style="width:32px;height:32px;border-radius:50%;object-fit:cover">`
      : (state.av[mb] || '👤');
    return `<button type="button" class="member-btn${sel ? ' sel' : ''}" data-member="${escapeAttr(mb)}"
      onclick="window._app.toggleAttendee('${escapeAttr(mb)}','${mode}')">
      <div class="member-av">${av}</div>
      <div class="member-nm">${escapeHtml(mb)}</div>
    </button>`;
  }).join('');
  return `<div class="form-group"><label class="form-lbl">Teilnehmer</label><div class="member-grid" id="f-attendees-grid">${btns}</div></div>`;
}


// ── DUR SELECT HELPER ─────────────────────────────────────────
function durSelectHTML(data, m) {
  const opts = [15,30,45,60,90,120,180,240,480].map(mins => {
    const sel = data.endTime && data.time && calcDurMins(data.time, data.endTime) === mins ? ' selected' : '';
    const lbl = mins < 60 ? (mins + ' Min') : mins === 60 ? '1 Std' : (mins/60 + ' Std');
    return '<option value="' + mins + '"' + sel + '>' + lbl + '</option>';
  }).join('');
  return '<div class="form-group"><label class="form-lbl">Dauer</label>' +
    '<select class="form-select" id="f-dur-select" onchange="window._app.onDurChange(this.value,\'' + m + '\')">'+
    '<option value="">–</option>' + opts + '</select></div>';
}

// ── FORM HTML ─────────────────────────────────────────────────
function formHTML(data, isEdit) {
  const m   = isEdit ? 'e' : 'a';
  const dv  = data.date || isoFromDay(data.day || localISO()) || localISO();
  const eb  = TASK_EMOJIS.map(e =>
    `<button class="emoji-btn${data.emoji === e ? ' sel' : ''}" onclick="window._app.setFF('emoji','${e}','${m}')">  ${e}</button>`
  ).join('');
  const wb  = WDS.map((w, i) =>
    `<button class="wd-btn${(data.weekdays || []).includes(i) ? ' sel' : ''}" onclick="window._app.toggleWD(${i},'${m}')">  ${w}</button>`
  ).join('');
  const colorBtns = COLORS.map(c =>
    `<button type="button" class="color-btn${data.color === c ? ' sel' : ''}" style="background:${c}" onclick="window._app.setFF('color','${c}','${m}')"></button>`
  ).join('');

  const openTodoToggle = data.type === 'task' ? `
    <div class="form-group">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:var(--bg3);border-radius:10px;cursor:pointer"
        onclick="window._app.setFF('openTodo',${!data.openTodo},'${m}')">
        <div>
          <div style="font-size:14px;font-weight:600;color:var(--text1)">📋 Offene To-Do</div>
          <div style="font-size:12px;color:var(--text2);margin-top:2px">Kein Datum – bleibt bis zur Erledigung sichtbar</div>
        </div>
        <div style="width:44px;height:26px;border-radius:13px;background:${data.openTodo ? '#5C4EE5' : '#D1D5DB'};position:relative;transition:background 0.2s;flex-shrink:0">
          <div style="position:absolute;top:3px;left:${data.openTodo ? '21' : '3'}px;width:20px;height:20px;border-radius:50%;background:var(--surface);transition:left 0.2s;box-shadow:0 1px 3px rgba(0,0,0,0.2)"></div>
        </div>
      </div>
      ${data.openTodo ? `
        <div style="margin-top:10px">
          <label class="form-lbl">Sichtbar für</label>
          <div class="member-grid" id="f-visibleto-grid" style="margin-top:6px">
            ${state.members.map(mb => {
              const cur = Array.isArray(data.visibleTo) ? data.visibleTo
                : (!data.visibleTo || data.visibleTo === 'all') ? [] : [data.visibleTo];
              const sel = cur.includes(mb);
              const av  = state.photos?.[mb]
                ? `<img src="${state.photos[mb]}" style="width:32px;height:32px;border-radius:50%;object-fit:cover">`
                : (state.av[mb] || '👤');
              return `<button type="button" class="member-btn${sel ? ' sel' : ''}" data-member="${escapeAttr(mb)}"
                onclick="window._app.toggleVisibleTo('${escapeAttr(mb)}','${m}')">
                <div class="member-av">${av}</div>
                <div class="member-nm">${escapeHtml(mb)}</div>
              </button>`;
            }).join('')}
          </div>
          <div style="font-size:11px;color:var(--text3);margin-top:6px">
            ${(() => {
              const cur = Array.isArray(data.visibleTo) ? data.visibleTo
                : (!data.visibleTo || data.visibleTo === 'all') ? [] : [data.visibleTo];
              return cur.length === 0 ? '👥 Alle Familienmitglieder sehen diese Aufgabe'
                : '👁 Nur ' + cur.map(m => escapeHtml(m)).join(', ');
            })()}
          </div>
        </div>` : ''}
    </div>` : '';

  const isEvent   = data.type === 'event';
  const isAllDay  = data.allDay === true;
  const endDateV  = data.endDate || dv;

  const dateTimeFields = data.openTodo ? '' : `
    ${isEvent ? `
    <div class="form-group">
      <div class="allday-toggle-row" onclick="window._app.setFF('allDay',${!isAllDay},'${m}')">
        <div>
          <div style="font-size:14px;font-weight:600;color:var(--text1)">🌅 Ganztägig</div>
          <div style="font-size:12px;color:var(--text2);margin-top:2px">Kein fester Zeitpunkt</div>
        </div>
        <div class="toggle-switch" style="background:${isAllDay ? '#5C4EE5' : '#D1D5DB'}">
          <div class="toggle-knob" style="left:${isAllDay ? '21' : '3'}px"></div>
        </div>
      </div>
    </div>` : ''}
    <div class="row2">
      <div class="form-group">
        <label class="form-lbl">${data.recurring === 'once' ? 'Datum' : 'Startdatum'}</label>
        <input type="date" class="form-input" value="${dv}" onchange="window._app.setDate(this.value,'${m}')"/>
        <div class="day-hint">📅 ${data.day || dayFromISO(dv)}</div>
      </div>
      ${isEvent && isAllDay ? `
      <div class="form-group">
        <label class="form-lbl">Enddatum</label>
        <input type="date" class="form-input" value="${endDateV}" min="${dv}"
          onchange="window._app.setFF('endDate',this.value,'${m}')"/>
      </div>` : `
      <div class="form-group">
        <label class="form-lbl">Uhrzeit</label>
        <input type="time" class="form-input" value="${data.time}" onchange="window._app._fdSet('time',this.value,'${m}')"/>
      </div>`}
    </div>
    ${!isAllDay ? `
    <div class="row2">
      <div class="form-group">
        <label class="form-lbl">Endzeit</label>
        <input type="time" class="form-input" id="f-endtime" value="${data.endTime || ''}" onchange="window._app.onEndTimeChange(this.value,'${m}')"/>
      </div>
      ${isEvent ? `
      <div class="form-group">
        <label class="form-lbl">Enddatum (optional)</label>
        <input type="date" class="form-input" value="${endDateV}" min="${dv}"
          onchange="window._app.setFF('endDate',this.value,'${m}')"/>
      </div>` : durSelectHTML(data, m)}
    </div>` : ''}
    <div class="form-group">
      <label class="form-lbl">Wiederholung</label>
      <select class="form-select" onchange="window._app.setFF('recurring',this.value,'${m}')">
        <option value="once"${data.recurring === 'once' ? ' selected' : ''}>Einmalig</option>
        <option value="daily"${data.recurring === 'daily' ? ' selected' : ''}>Täglich / Wochentage</option>
        <option value="weekly"${data.recurring === 'weekly' ? ' selected' : ''}>Wöchentlich</option>
        <option value="monthly"${data.recurring === 'monthly' ? ' selected' : ''}>Monatlich</option>
        <option value="yearly"${data.recurring === 'yearly' ? ' selected' : ''}>Jährlich</option>
      </select>
      ${(data.recurring === 'weekly' || data.recurring === 'monthly') ? `
        <div style="display:flex;align-items:center;gap:10px;margin-top:10px">
          <span style="font-size:13px;color:var(--text2);white-space:nowrap">Alle</span>
          <input type="number" min="1" max="52" class="form-input" id="f-interval"
            style="width:72px;text-align:center;padding:8px"
            value="${data.recurringInterval || 1}"
            onchange="window._app.setFF('recurringInterval',Math.max(1,parseInt(this.value)||1),'${m}')"
            oninput="window._app.setFF('recurringInterval',Math.max(1,parseInt(this.value)||1),'${m}')"/>
          <span style="font-size:13px;color:var(--text2);white-space:nowrap">${data.recurring === 'weekly' ? (data.recurringInterval || 1) === 1 ? 'Woche' : 'Wochen' : (data.recurringInterval || 1) === 1 ? 'Monat' : 'Monate'}</span>
        </div>` : ''}
    </div>
    ${data.recurring === 'daily' ? `
      <div class="form-group"><label class="form-lbl">Wochentage</label><div class="wd-grid">${wb}</div></div>` : ''}`;

  return `
    <div class="modal-handle"></div>
    <div class="modal-title">${isEdit ? 'Bearbeiten' : 'Neue Aufgabe'}</div>
    <div class="modal-sub">${isEdit ? 'Änderungen für alle speichern' : 'Was soll hinzugefügt werden?'}</div>
    <div class="type-toggle">
      <button class="type-btn${data.type === 'task' ? ' sel' : ''}" onclick="window._app.setFF('type','task','${m}')">✅ Aufgabe</button>
      <button class="type-btn${data.type === 'event' ? ' sel' : ''}" onclick="window._app.setFF('type','event','${m}')">📅 Termin</button>
    </div>
    ${openTodoToggle}
    <div class="form-group">
      <label class="form-lbl">Titel</label>
      <input class="form-input" id="f-title" value="${escapeHtml(data.title)}" maxlength="200"
        oninput="window._app._fdSet?.('title',this.value,'${m}')" placeholder="z.B. Kind abholen…"/>
    </div>
    <div class="form-group">
      <label class="form-lbl">Ort (optional)</label>
      <input class="form-input" value="${escapeHtml(data.location || '')}" maxlength="200"
        oninput="window._app._fdSet?.('location',this.value,'${m}')" placeholder="z.B. Sporthalle, Arzt…"/>
    </div>
    ${data.type === 'event' ? attendeePickerHTML(data, m) : ''}
    <div class="form-group">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
        <label class="form-lbl" style="margin-bottom:0">Emoji</label>
        <button type="button" onclick="window._app.toggleEmojiGrid(this)"
          style="font-size:11px;font-weight:600;color:#5C4EE5;background:var(--accent-bg);border:none;border-radius:6px;padding:4px 10px;cursor:pointer;font-family:inherit">
          ▸ Auswählen
        </button>
      </div>
      <div class="emoji-grid" id="f-emoji-grid" style="display:none">${eb}</div>
    </div>
    <div class="form-group">
      <label class="form-lbl">Farbe</label>
      <div class="color-grid">${colorBtns}</div>
    </div>
    ${dateTimeFields}
    <button class="submit-btn" onclick="${isEdit ? 'window._app.saveEdit()' : 'window._app.addTask()'}" ${!isEdit && state.taskSaving ? 'disabled' : ''}>
      ${state.taskSaving ? 'Wird gespeichert…' : isEdit ? 'Änderungen speichern ✓' : data.type === 'event' ? 'Termin hinzufügen' : 'Aufgabe hinzufügen'}
    </button>
    <button class="modal-close" onclick="window._app.closeModal()">Abbrechen</button>`;
}

// ── SHOW ADD MODAL ────────────────────────────────────────────
export function showAddModal() {
  openModal(formHTML(state.fd, false));
  setTimeout(() => document.getElementById('f-title')?.focus(), 350);
}

// ── SHOW EDIT MODAL ───────────────────────────────────────────
export function showEditModal(id) {
  if (id) setState({ ed: { ...state.tasks.find(t => t.id === id) } });
  if (!state.ed) return;
  // taskSaving zurücksetzen falls addTask noch läuft
  if (state.taskSaving) setState({ taskSaving: false });
  openModal(formHTML(state.ed, true));
  setTimeout(() => document.getElementById('f-title')?.focus(), 350);
}

// ── EXPORT CAL ────────────────────────────────────────────────
export function exportCal(id) {
  const t = state.tasks.find(x => x.id === id); if (!t) return;

  const todayISO = localISO();
  const dateStr  = t.date || todayISO;

  // Lokalen Timestamp YYYYMMDDTHHmmss (kein Z → keine UTC-Konvertierung)
  const fmtLocal = d => {
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  };

  let dtStart, dtEnd;
  if (t.allDay) {
    // Ganztägig: VALUE=DATE Format (kein Timestamp)
    const startDate = dateStr.replace(/-/g, '');
    const endRaw    = t.endDate ? t.endDate : dateStr;
    const endD      = new Date(endRaw + 'T12:00:00');
    endD.setDate(endD.getDate() + 1); // iCal: DTEND ist exklusiv
    const endDate   = `${endD.getFullYear()}${String(endD.getMonth()+1).padStart(2,'0')}${String(endD.getDate()).padStart(2,'0')}`;
    dtStart = `DTSTART;VALUE=DATE:${startDate}`;
    dtEnd   = `DTEND;VALUE=DATE:${endDate}`;
  } else {
    const base = new Date(dateStr + 'T' + (t.time || '12:00') + ':00');
    const end  = t.endTime
      ? new Date(dateStr + 'T' + t.endTime + ':00')
      : new Date(base.getTime() + 3600000);
    dtStart = `DTSTART;TZID=Europe/Berlin:${fmtLocal(base)}`;
    dtEnd   = `DTEND;TZID=Europe/Berlin:${fmtLocal(end)}`;
  }

  let rr = '';
  if (t.recurring === 'weekly')       rr = 'RRULE:FREQ=WEEKLY';
  else if (t.recurring === 'monthly') rr = 'RRULE:FREQ=MONTHLY';
  else if (t.recurring === 'yearly')  rr = 'RRULE:FREQ=YEARLY';
  else if (t.recurring === 'daily') {
    if (t.weekdays?.length) {
      const byday = ['MO','TU','WE','TH','FR','SA','SU'];
      rr = `RRULE:FREQ=WEEKLY;BYDAY=${t.weekdays.map(i => byday[i]).join(',')}`;
    } else rr = 'RRULE:FREQ=DAILY';
  }

  const summary = `${t.emoji || ''} ${t.title}`.trim();
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//famiplan//famiplan.app//DE',
    'BEGIN:VEVENT',
    `UID:${id}@famiplan.app`,
    dtStart,
    dtEnd,
    `SUMMARY:${summary}`,
  ];
  if (t.location) lines.push(`LOCATION:${t.location}`);
  if (rr)        lines.push(rr);
  lines.push('END:VEVENT', 'END:VCALENDAR');

  const ics  = lines.join('\r\n');
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = (t.title || 'termin').replace(/[^\w\säöüÄÖÜß-]/g, '').replace(/\s+/g, '_') + '.ics';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 1000);

  closeModal();
}

// ── MEAL MODAL ────────────────────────────────────────────────
export function showMealEditModal(iso, type) {
  const existing = state.meals[iso]?.[type];
  const MEAL_TYPES_LOCAL = [
    { id: 'breakfast', label: 'Frühstück' },
    { id: 'lunch',     label: 'Mittagessen' },
    { id: 'dinner',    label: 'Abendessen' },
  ];
  const typeName = MEAL_TYPES_LOCAL.find(t => t.id === type)?.label || type;
  const d        = new Date(iso + 'T12:00:00');
  const dateStr  = d.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
  const ingrVal     = existing?.ingredients?.join('\n') || '';
  const rawOptIngrs = existing?.optionalIngredients;
  const optIngrList = rawOptIngrs
    ? (Array.isArray(rawOptIngrs) ? rawOptIngrs : Object.values(rawOptIngrs))
    : [];
  const optIngrVal  = optIngrList.join('\n');
  const rawSelected = existing?.selectedOptionals;
  const selectedList = rawSelected
    ? (Array.isArray(rawSelected) ? rawSelected : Object.values(rawSelected))
    : [];

  // Checkboxen als statisches HTML – onclick auf label togglet checkbox + visuellen State
  const optChecksHTML = optIngrList.length ? (
    '<div style="margin-top:8px;display:flex;flex-direction:column;gap:4px">'
    + '<div style="font-size:11px;color:var(--text3);margin-bottom:2px">Diese Woche dabei?</div>'
    + optIngrList.map(ing => {
        const checked = selectedList.includes(ing);
        const cbId = 'opt-cb-' + ing.replace(/[^a-z0-9]/gi, '_');
        const boxStyle = checked
          ? 'width:18px;height:18px;border-radius:5px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border:1.5px solid #059669;background:#059669;'
          : 'width:18px;height:18px;border-radius:5px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border:1.5px solid var(--border);background:transparent;';
        const txtStyle = checked ? 'font-size:13px;color:#059669;' : 'font-size:13px;color:var(--text1);';
        const chk = checked ? ' checked' : '';
        return '<label id="lbl-' + cbId + '" style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:3px 0" onclick="window._togOptCb(\'' + cbId + '\')">'
          + '<input type="checkbox" id="' + cbId + '" name="opt-sel" value="' + escapeAttr(ing) + '"' + chk + ' style="display:none">'
          + '<span id="box-' + cbId + '" style="' + boxStyle + '">'
          + (checked ? '<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 5l2.5 2.5 4.5-4.5"/></svg>' : '')
          + '</span>'
          + '<span id="txt-' + cbId + '" style="' + txtStyle + '">' + escapeHtml(ing) + '</span>'
          + '</label>';
      }).join('')
    + '</div>'
  ) : '';

  // ── #2: Rezepte als Chips – Top 8 nach Häufigkeit + Autocomplete-Liste ──
  // Alle Rezepte für Autocomplete (alphabetisch unwichtig, AC filtert selbst)
  const allRecipes = Object.entries(state.mealRecipes).map(([key, r]) => ({ key, ...r }));
  window._mealRecipesList = allRecipes;

  // Chips: Top 8 nach Nutzungshäufigkeit (Migration: fehlendes useCount = 1)
  const topRecipes = [...allRecipes]
    .sort((a, b) => (b.useCount ?? 1) - (a.useCount ?? 1))
    .slice(0, 8);

  const recipesHTML = allRecipes.length ? `
    <div class="form-group">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
        <label class="form-lbl" style="margin-bottom:0">Häufig gekocht</label>
        <button type="button" onclick="window._app.showRecipeManager('${iso}','${type}')"
          style="font-size:11px;font-weight:600;color:#5C4EE5;background:var(--accent-bg);border:none;border-radius:6px;padding:4px 10px;cursor:pointer;font-family:inherit">
          📋 Alle Rezepte
        </button>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:6px" id="meal-recipes-grid">
        ${topRecipes.map((r) => {
          const idx = allRecipes.findIndex(x => x.key === r.key);
          return `<button class="meal-recipe-btn" data-idx="${idx}" onclick="window._app.applyMealRecipe(this)">${escapeHtml(r.name)}</button>`;
        }).join('')}
      </div>
    </div>` : '';

  openModal(`
    <div class="modal-handle"></div>
    <div class="modal-title">🍽️ ${escapeHtml(typeName)}</div>
    <div class="modal-sub">${escapeHtml(dateStr)}</div>
    ${recipesHTML}
    <div class="form-group">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
        <label class="form-lbl" style="margin-bottom:0">Gericht</label>
        <button type="button" onclick="window._app.showRecipeImportModal()"
          style="font-size:11px;font-weight:700;color:white;background:linear-gradient(135deg,#5C4EE5,#7C6EE8);border:none;border-radius:6px;padding:4px 10px;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:4px">
          ✨ KI-Import
        </button>
      </div>
      <div style="position:relative">
        <input class="form-input" id="meal-name-input" placeholder="z.B. Spaghetti Bolognese" maxlength="80"
          value="${escapeHtml(existing?.name || '')}" autocomplete="off"
          oninput="window._app._mealNameAcUpdate(this.value)"
          onkeydown="window._app._mealNameAcKey(event)"/>
      </div>
      <div id="meal-name-ac" style="display:none;background:var(--surface);border:1px solid var(--border);border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.10);margin-top:4px;overflow:hidden;max-height:200px;overflow-y:auto"></div>
    </div>
    <div class="form-group">
      <label class="form-lbl">Zutaten (eine pro Zeile – für Einkaufsliste)</label>
      <textarea class="form-input" id="meal-ingr-input"
        placeholder="z.B.&#10;500g Hackfleisch&#10;Zwiebeln&#10;Dosentomaten"
        rows="4" style="resize:none;line-height:1.6"
        onkeyup="window._app._mealIngrAcUpdate(event)"
        onkeydown="window._app._mealIngrAcKey(event)">${escapeHtml(ingrVal)}</textarea>
      <div id="meal-ingr-ac" style="display:none;background:var(--surface);border:1px solid var(--border);border-radius:10px;box-shadow:0 4px 12px rgba(0,0,0,0.10);margin-top:4px;overflow:hidden;max-height:160px;overflow-y:auto"></div>
    </div>
    <div class="form-group">
      <label class="form-lbl" style="display:flex;align-items:center;gap:6px">
        <span>Optionale Zutaten</span>
        <span style="font-size:11px;font-weight:400;color:var(--text3)">(selten gebraucht)</span>
      </label>
      <textarea class="form-input" id="meal-opt-ingr-input"
        placeholder="z.B.&#10;Parmesan&#10;Basilikum&#10;Chili"
        rows="3" style="resize:none;line-height:1.6"
        oninput="window._rebuildOptChecks(this.value)">${escapeHtml(optIngrVal)}</textarea>
      ${optIngrList.length ? `<div style="margin-top:8px">
        <div style="font-size:11px;color:var(--text3);margin-bottom:4px">Diese Woche dabei?</div>
        ${optIngrList.map(ing => {
          const checked = selectedList.includes(ing);
          const cbId = 'opt-cb-' + ing.replace(/[^a-z0-9]/gi, '_');
          return '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:3px 0" onclick="window._togOptCb(\'' + cbId + '\')">'
            + '<input type="checkbox" id="' + cbId + '" name="opt-sel" value="' + escapeAttr(ing) + '"' + (checked ? ' checked' : '') + ' style="display:none">'
            + '<span id="box-' + cbId + '" style="width:18px;height:18px;border-radius:5px;flex-shrink:0;display:flex;align-items:center;justify-content:center;' + (checked ? 'border:1.5px solid #059669;background:#059669;' : 'border:1.5px solid #CBD5E0;background:transparent;') + '">'
            + (checked ? '<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 5l2.5 2.5 4.5-4.5"/></svg>' : '')
            + '</span>'
            + '<span id="txt-' + cbId + '" style="font-size:13px;' + (checked ? 'color:#059669;' : 'color:var(--text1);') + '">' + escapeHtml(ing) + '</span>'
            + '</label>';
        }).join('')}
        <div id="meal-opt-checks" style="display:none"></div>
      </div>` : '<div id="meal-opt-checks"></div>'}
    </div>
    <div class="form-group">
      <button type="button" id="meal-steps-btn"
        style="width:100%;padding:11px 14px;border:1.5px dashed var(--border);border-radius:10px;background:transparent;font-size:13px;font-weight:600;color:var(--text3);cursor:pointer;font-family:inherit;text-align:left"
        onclick="window._app.showRecipeStepsModal('${escapeAttr(iso)}','${escapeAttr(type)}')">
        Zubereitung hinzufügen
      </button>
    </div>
    <button class="submit-btn" onclick="window._app.confirmSaveMeal('${escapeAttr(iso)}','${escapeAttr(type)}')">Speichern</button>
    <button class="modal-close" onclick="window._app.closeModal()">Abbrechen</button>
  `);
  setTimeout(function() {
    document.getElementById('meal-name-input')?.focus();
    // Steps-Button initialisieren falls Rezept schon geladen
    const key = window._mealCurrentRecipeKey;
    if (key && state.mealRecipes[key]) _updateStepsBtn(state.mealRecipes[key]);
  }, 300);
}

export function applyMealRecipe(btn) {
  const idx    = parseInt(btn.getAttribute('data-idx'));
  const recipe = window._mealRecipesList?.[idx];
  if (!recipe) return;
  const nameEl = document.getElementById('meal-name-input');
  const ingrEl = document.getElementById('meal-ingr-input');
  if (nameEl) nameEl.value = recipe.name;
  if (ingrEl) ingrEl.value = (recipe.ingredients || []).join('\n');
  const optIngrEl = document.getElementById('meal-opt-ingr-input');
  if (optIngrEl) {
    optIngrEl.value = (recipe.optionalIngredients || []).join('\n');
    if (window._rebuildOptChecks) window._rebuildOptChecks(optIngrEl.value);
  }
  // Steps-Key merken für späteren Zugriff
  window._mealCurrentRecipeKey = recipe.key;
  document.querySelectorAll('.meal-recipe-btn').forEach(b => b.classList.remove('sel'));
  btn.classList.add('sel');
  // Steps-Button einblenden wenn vorhanden
  _updateStepsBtn(recipe);
  // AC schließen
  const ac = document.getElementById('meal-name-ac');
  if (ac) ac.style.display = 'none';
}

function _updateStepsBtn(recipe) {
  const btn = document.getElementById('meal-steps-btn');
  if (!btn) return;
  const hasSteps = recipe?.steps?.length > 0;
  btn.textContent = hasSteps ? `Zubereitung (${recipe.steps.length} Schritte)` : `+ Zubereitung`;
  btn.style.color = hasSteps ? '#5C4EE5' : 'var(--text3)';
}

// ── REZEPT-VERWALTUNG ──────────────────────────────────────────
// Sortierstatus persistiert nur innerhalb der Session
window._recipeManagerSort = window._recipeManagerSort || 'alpha'; // 'alpha' | 'freq'
window._recipeManagerQuery = window._recipeManagerQuery || '';

function timeAgoLabel(ts) {
  if (!ts) return '';
  const diff = Date.now() - ts;
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return 'heute';
  if (days === 1) return 'vor 1 Tag';
  if (days < 7) return `vor ${days} Tagen`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return 'vor 1 Woche';
  if (weeks < 5) return `vor ${weeks} Wochen`;
  const months = Math.floor(days / 30);
  if (months <= 1) return 'vor 1 Monat';
  return `vor ${months} Monaten`;
}

function recipeManagerListHTML() {
  const query = window._recipeManagerQuery.trim().toLowerCase();
  const sort  = window._recipeManagerSort;

  let recipes = Object.entries(state.mealRecipes).map(([key, r]) => ({ key, ...r }));
  if (query) recipes = recipes.filter(r => r.name.toLowerCase().includes(query));

  if (sort === 'freq') {
    recipes.sort((a, b) => (b.useCount ?? 1) - (a.useCount ?? 1) || a.name.localeCompare(b.name, 'de'));
  } else {
    recipes.sort((a, b) => a.name.localeCompare(b.name, 'de'));
  }

  if (!recipes.length) {
    return `<div style="text-align:center;padding:32px 12px;color:var(--text3)">
      <div style="font-size:36px;margin-bottom:8px">🍽️</div>
      <div style="font-size:14px;font-weight:600">${query ? 'Keine Treffer' : 'Noch keine Rezepte gespeichert'}</div>
      ${query ? '' : '<div style="font-size:13px;margin-top:4px">Rezepte werden automatisch gespeichert, wenn du Zutaten zu einer Mahlzeit hinzufügst.</div>'}
    </div>`;
  }

  return recipes.map(r => {
    const ingrCount = r.ingredients?.length || 0;
    const useCount  = r.useCount ?? 1;
    const ago       = timeAgoLabel(r.usedAt);
    return `<div style="display:flex;align-items:center;gap:10px;padding:11px 12px;border-bottom:1px solid var(--border2)">
      <button onclick="window._app.recipeManagerApply('${escapeAttr(r.key)}')"
        style="background:var(--green-bg);color:var(--green-text);font-size:10px;font-weight:600;padding:4px 8px;border-radius:6px;white-space:nowrap;border:none;cursor:pointer;font-family:inherit;flex-shrink:0">
        ＋ Einfügen
      </button>
      <div style="flex:1;min-width:0">
        <div style="font-size:14px;font-weight:600;color:var(--text1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
          ${r.steps?.length ? '<span style="font-size:11px;margin-right:4px">&#x1F4D6;</span>' : ''}${escapeHtml(r.name)}
        </div>
        <div style="font-size:11px;color:var(--text3);margin-top:2px">
          ${ingrCount} Zutat${ingrCount !== 1 ? 'en' : ''}${r.steps?.length ? ' · ' + r.steps.length + ' Schritte' : ''} · ${useCount}× gekocht${ago ? ' · zuletzt ' + ago : ''}
        </div>
      </div>
      <button onclick="window._app.showRecipeViewModal('${escapeAttr(r.key)}')"
        style="width:32px;height:32px;border:none;border-radius:8px;background:var(--bg3);color:var(--text2);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0" title="Anzeigen">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
      </button>
      <button onclick="window._app.recipeManagerEdit('${escapeAttr(r.key)}')"
        style="width:32px;height:32px;border:none;border-radius:8px;background:var(--bg3);color:var(--text2);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z"/></svg>
      </button>
      <button onclick="window._app.recipeManagerDeleteConfirm('${escapeAttr(r.key)}','${escapeAttr(r.name)}')"
        style="width:32px;height:32px;border:none;border-radius:8px;background:var(--red-bg);color:var(--red-text);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4h10M5 4V2.5h4V4M5.5 6.5v4M8.5 6.5v4M3 4l.8 7.5h6.4L11 4"/></svg>
      </button>
    </div>`;
  }).join('');
}

export function showRecipeManager(iso, type) {
  window._recipeManagerQuery = '';
  window._recipeManagerIso  = iso || localISO();
  window._recipeManagerType = type || 'dinner';
  openModal(`
    <div class="modal-handle"></div>
    <div class="modal-title">🍽️ Meine Rezepte</div>
    <div class="modal-sub">Gespeicherte Gerichte verwalten</div>
    <button type="button" onclick="window._app.showRecipeImportModal()"
      style="width:100%;padding:11px 14px;border:none;border-radius:10px;background:linear-gradient(135deg,#5C4EE5,#7C6EE8);color:white;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;margin-bottom:12px;display:flex;align-items:center;justify-content:center;gap:8px">
      ✨ Rezept importieren (KI)
    </button>
    <div class="form-group">
      <input class="form-input" id="recipe-mgr-search" placeholder="Suchen…" autocomplete="off"
        oninput="window._app.recipeManagerSearch(this.value)"/>
    </div>
    <div style="display:flex;gap:8px;margin-bottom:12px">
      <button id="recipe-mgr-sort-alpha" class="cat-btn${window._recipeManagerSort === 'alpha' ? ' sel' : ''}" style="flex:1" onclick="window._app.recipeManagerSort('alpha')">A–Z</button>
      <button id="recipe-mgr-sort-freq" class="cat-btn${window._recipeManagerSort === 'freq' ? ' sel' : ''}" style="flex:1" onclick="window._app.recipeManagerSort('freq')">Häufigkeit</button>
    </div>
    <div id="recipe-mgr-list" style="border:1px solid var(--border);border-radius:12px;overflow:hidden;max-height:45vh;overflow-y:auto;margin-bottom:12px">
      ${recipeManagerListHTML()}
    </div>
    <button class="modal-close" onclick="window._app.closeModal()">Schließen</button>
  `);
  setTimeout(() => document.getElementById('recipe-mgr-search')?.focus(), 350);
}

export function recipeManagerSearch(val) {
  window._recipeManagerQuery = val;
  const list = document.getElementById('recipe-mgr-list');
  if (list) list.innerHTML = recipeManagerListHTML();
}

export function recipeManagerSort(mode) {
  window._recipeManagerSort = mode;
  document.getElementById('recipe-mgr-sort-alpha')?.classList.toggle('sel', mode === 'alpha');
  document.getElementById('recipe-mgr-sort-freq')?.classList.toggle('sel', mode === 'freq');
  const list = document.getElementById('recipe-mgr-list');
  if (list) list.innerHTML = recipeManagerListHTML();
}

// ＋ Einfügen: Rezept ins Meal-Edit-Modal übernehmen (inkl. optionaler Zutaten
// als Checkboxen, analog zum Klick auf einen Top-Rezept-Chip). Nutzer kann die
// Auswahl anpassen und speichert final über das normale Formular.
export async function recipeManagerApply(key) {
  const recipe = state.mealRecipes[key];
  if (!recipe) return;
  const iso  = window._recipeManagerIso  || localISO();
  const type = window._recipeManagerType || 'dinner';
  closeModal();
  setTimeout(() => {
    showMealEditModal(iso, type);
    setTimeout(() => {
      const nameEl = document.getElementById('meal-name-input');
      const ingrEl = document.getElementById('meal-ingr-input');
      if (nameEl) nameEl.value = recipe.name;
      if (ingrEl) ingrEl.value = (recipe.ingredients || []).join('\n');
      const optIngrEl = document.getElementById('meal-opt-ingr-input');
      if (optIngrEl) {
        optIngrEl.value = (recipe.optionalIngredients || []).join('\n');
        if (window._rebuildOptChecks) window._rebuildOptChecks(optIngrEl.value);
      }
      window._mealCurrentRecipeKey = key;
      _updateStepsBtn(recipe);
    }, 50);
  }, 350);
}

// Read-only Ansicht eines Rezepts direkt aus der Rezeptübersicht (ohne Meal-Plan-Kontext)
export function showRecipeViewModal(key) {
  const recipe = state.mealRecipes[key];
  if (!recipe) return;

  const ingrCount = recipe.ingredients?.length || 0;
  const metaHTML = [
    recipe.prepTime ? `⏱ ${recipe.prepTime} Min.` : '',
    recipe.servings ? `👥 ${recipe.servings} Portionen` : '',
  ].filter(Boolean).join(' · ');

  const ingrHTML = ingrCount ? `
    <div style="margin-bottom:16px">
      <div style="font-size:12px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">Zutaten</div>
      ${recipe.ingredients.map(ing => `
        <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border2);font-size:14px;color:var(--text1)">
          <span style="color:var(--text3)">·</span> ${escapeHtml(ing)}
        </div>`).join('')}
    </div>` : '';

  const optIngrHTML = recipe.optionalIngredients?.length ? `
    <div style="margin-bottom:16px">
      <div style="font-size:12px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">Optionale Zutaten</div>
      ${recipe.optionalIngredients.map(ing => `
        <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border2);font-size:14px;color:var(--text2)">
          <span style="color:var(--text3)">·</span> ${escapeHtml(ing)}
        </div>`).join('')}
    </div>` : '';

  const stepsHTML = recipe.steps?.length ? `
    <div style="margin-bottom:16px">
      <div style="font-size:12px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">Zubereitung</div>
      ${recipe.steps.map((s, i) => `
        <div style="display:flex;gap:12px;margin-bottom:12px;align-items:flex-start">
          <div style="width:26px;height:26px;border-radius:50%;background:#5C4EE5;color:white;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0">${i+1}</div>
          <div style="flex:1;font-size:14px;color:var(--text1);line-height:1.5;padding-top:3px">${escapeHtml(s)}</div>
        </div>`).join('')}
    </div>` : `<div style="text-align:center;padding:12px;color:var(--text3);font-size:13px;margin-bottom:16px">Keine Zubereitungsschritte hinterlegt.</div>`;

  openModal(`
    <div class="modal-handle"></div>
    <div style="text-align:center;font-size:40px;margin-bottom:6px">&#x1F37D;&#xFE0F;</div>
    <div class="modal-title">${escapeHtml(recipe.name)}</div>
    ${metaHTML ? `<div style="text-align:center;font-size:13px;color:var(--text3);margin-bottom:16px">${metaHTML}</div>` : '<div style="margin-bottom:16px"></div>'}
    ${ingrHTML}
    ${optIngrHTML}
    ${stepsHTML}
    <button class="submit-btn" style="margin-bottom:8px" onclick="window._app.closeModal();setTimeout(()=>import('./ui/modals.js').then(m=>m.showRecipeEditModal('${escapeAttr(key)}')),350)">✏️ Rezept bearbeiten</button>
    <button class="modal-close" onclick="window._app.closeModal();setTimeout(()=>import('./ui/modals.js').then(m=>m.showRecipeManager(window._recipeManagerIso,window._recipeManagerType)),350)">‹ Zurück zur Übersicht</button>
  `);
}

// Rezept bearbeiten: öffnet Steps-Modal direkt
export function recipeManagerEdit(key) {
  closeModal();
  setTimeout(() => showRecipeEditModal(key), 350);
}

export function showRecipeEditModal(key) {
  const recipe = state.mealRecipes[key] || {};
  const steps = recipe.steps || [];
  const ingredients = recipe.ingredients || [];

  const ingrHTML = ingredients.map((ing, i) => `
    <div class="recipe-ingr-row" id="ingr-row-${i}" style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
      <input class="form-input ingr-input" data-ingr="${i}" value="${escapeHtml(ing)}"
        placeholder="Zutat ${i+1}" style="flex:1;font-size:13px"/>
      <button type="button" onclick="window._app._recipeEditRemoveIngr(${i})"
        style="width:30px;height:36px;border:none;border-radius:8px;background:var(--red-bg);color:var(--red-text);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;font-size:16px">×</button>
    </div>`).join('');

  const stepsHTML = steps.map((s, i) => `
    <div class="recipe-step-row" id="step-row-${i}" style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px">
      <div style="width:24px;height:24px;border-radius:50%;background:#5C4EE5;color:white;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:8px">${i+1}</div>
      <textarea class="form-input step-input" data-step="${i}" rows="2"
        style="flex:1;resize:none;line-height:1.5;font-size:13px"
        placeholder="Schritt ${i+1} beschreiben…">${escapeHtml(s)}</textarea>
      <button type="button" onclick="window._app._recipeRemoveStep(${i})"
        style="width:28px;height:28px;border:none;border-radius:6px;background:var(--red-bg);color:var(--red-text);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;margin-top:6px;font-size:14px">×</button>
    </div>`).join('');

  openModal(`
    <div class="modal-handle"></div>
    <div class="modal-title">✏️ Rezept bearbeiten</div>
    <div class="modal-sub" style="margin-bottom:14px">${escapeHtml(recipe.name || '')}</div>

    <div class="form-group">
      <label class="form-lbl">Name</label>
      <input class="form-input" id="recipe-edit-name" value="${escapeHtml(recipe.name || '')}" maxlength="80" placeholder="Rezeptname"/>
    </div>

    <div style="display:flex;gap:10px;margin-bottom:14px">
      <div style="flex:1">
        <label class="form-lbl">Vorbereitungszeit</label>
        <div style="display:flex;align-items:center;gap:6px">
          <input class="form-input" id="recipe-prep-time" type="number" min="0" max="300" value="${recipe.prepTime || ''}"
            placeholder="0" style="width:70px;text-align:center"/>
          <span style="font-size:13px;color:var(--text2)">Min.</span>
        </div>
      </div>
      <div style="flex:1">
        <label class="form-lbl">Portionen</label>
        <div style="display:flex;align-items:center;gap:6px">
          <input class="form-input" id="recipe-servings" type="number" min="1" max="20" value="${recipe.servings || 4}"
            placeholder="4" style="width:70px;text-align:center"/>
          <span style="font-size:13px;color:var(--text2)">Pers.</span>
        </div>
      </div>
    </div>

    <div class="form-group">
      <label class="form-lbl">Zutaten</label>
      <div id="recipe-ingr-list" style="margin-bottom:8px">
        ${ingrHTML || '<div id="ingr-empty" style="text-align:center;padding:12px;color:var(--text3);font-size:13px">Noch keine Zutaten</div>'}
      </div>
      <button type="button" onclick="window._app._recipeEditAddIngr()"
        style="width:100%;padding:9px;border:1.5px dashed var(--border);border-radius:10px;background:transparent;font-size:13px;font-weight:600;color:#5C4EE5;cursor:pointer;font-family:inherit;margin-bottom:4px">
        + Zutat hinzufügen
      </button>
    </div>

    <div class="form-group">
      <label class="form-lbl">Zubereitung</label>
      <div id="recipe-steps-list" style="margin-bottom:10px">
        ${stepsHTML || '<div id="steps-empty" style="text-align:center;padding:12px;color:var(--text3);font-size:13px">Noch keine Schritte</div>'}
      </div>
      <button type="button" onclick="window._app._recipeAddStep()"
        style="width:100%;padding:9px;border:1.5px dashed var(--border);border-radius:10px;background:transparent;font-size:13px;font-weight:600;color:#5C4EE5;cursor:pointer;font-family:inherit;margin-bottom:4px">
        + Schritt hinzufügen
      </button>
    </div>

    <button class="submit-btn" onclick="window._app._recipeEditSave('${escapeAttr(key)}')">Speichern</button>
    <button class="modal-close" onclick="window._app.showRecipeManager()">Zurück</button>
  `);
}

// Löschen mit Bestätigungs-Modal
export function recipeManagerDeleteConfirm(key, name) {
  openModal(`
    <div class="modal-handle"></div>
    <div style="text-align:center;font-size:36px;margin-bottom:12px">🗑️</div>
    <div class="modal-title" style="text-align:center">Rezept löschen?</div>
    <div class="modal-sub" style="text-align:center;margin-bottom:20px">„${escapeHtml(name)}" wird endgültig entfernt. Diese Aktion kann nicht rückgängig gemacht werden.</div>
    <button style="width:100%;padding:13px;border:none;border-radius:10px;background:#DC2626;color:white;font-weight:700;font-size:15px;cursor:pointer;font-family:inherit"
      onclick="window._app.recipeManagerDelete('${escapeAttr(key)}')">Ja, löschen</button>
    <button class="modal-close" onclick="window._app.showRecipeManager('${window._recipeManagerIso}','${window._recipeManagerType}')">Abbrechen</button>
  `);
}

export async function recipeManagerDelete(key) {
  await deleteMealRecipe(key, null, showSync);
  showRecipeManager(window._recipeManagerIso, window._recipeManagerType);
}

// ── #2: Rezept-Autocomplete beim Gericht-Input ────────────────────────
export function _mealNameAcUpdate(val) {
  const ac = document.getElementById('meal-name-ac');
  if (!ac) return;
  window._mealNameAcIdx = -1;

  const q = val.trim().toLowerCase();
  if (!q || q.length < 1) { ac.style.display = 'none'; return; }

  const recipes = window._mealRecipesList || [];
  const starts   = recipes.filter(r => r.name.toLowerCase().startsWith(q));
  const contains = recipes.filter(r => !r.name.toLowerCase().startsWith(q) && r.name.toLowerCase().includes(q));
  const matches  = [...starts, ...contains].slice(0, 6);

  if (!matches.length) { ac.style.display = 'none'; return; }

  ac.innerHTML = matches.map((r, i) => {
    const ingrCount = r.ingredients?.length || 0;
    return `<div class="meal-ac-item" data-idx="${i}"
      style="display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer;border-bottom:1px solid var(--border2);transition:background 0.1s"
      onmousedown="event.preventDefault()"
      onclick="window._app._mealNameAcSelect(${i})">
      <span style="font-size:18px;flex-shrink:0">🍽️</span>
      <span style="flex:1;font-size:14px;font-weight:600;color:var(--text1)">${escapeHtml(r.name)}</span>
      ${ingrCount ? `<span style="font-size:11px;color:var(--text3)">${ingrCount} Zutat${ingrCount !== 1 ? 'en' : ''}</span>` : ''}
    </div>`;
  }).join('');
  const last = ac.querySelector('.meal-ac-item:last-child');
  if (last) last.style.borderBottom = 'none';
  window._mealNameAcMatches = matches;
  ac.style.display = 'block';
}

export function _mealNameAcSelect(idx) {
  const matches = window._mealNameAcMatches || [];
  const r = matches[idx];
  if (!r) return;
  const nameEl = document.getElementById('meal-name-input');
  const ingrEl = document.getElementById('meal-ingr-input');
  if (nameEl) nameEl.value = r.name;
  if (ingrEl) ingrEl.value = (r.ingredients || []).join('\n');
  // Chip-Selektion synchronisieren (Vergleich über data-idx, da nur Top-8 angezeigt werden)
  const recipes = window._mealRecipesList || [];
  const chipIdx = recipes.findIndex(x => x.name === r.name);
  document.querySelectorAll('.meal-recipe-btn').forEach((b) => b.classList.toggle('sel', parseInt(b.dataset.idx) === chipIdx));
  const ac = document.getElementById('meal-name-ac');
  if (ac) ac.style.display = 'none';
  window._mealNameAcIdx = -1;
}

export function _mealNameAcKey(e) {
  const ac = document.getElementById('meal-name-ac');
  if (!ac || ac.style.display === 'none') return;
  const items = ac.querySelectorAll('.meal-ac-item');
  if (!items.length) return;
  if (e.key === 'ArrowDown') { e.preventDefault(); window._mealNameAcIdx = Math.min((window._mealNameAcIdx || -1) + 1, items.length - 1); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); window._mealNameAcIdx = Math.max((window._mealNameAcIdx || 0) - 1, 0); }
  else if (e.key === 'Enter' && (window._mealNameAcIdx || -1) >= 0) { e.preventDefault(); window._app._mealNameAcSelect(window._mealNameAcIdx); return; }
  else if (e.key === 'Escape') { ac.style.display = 'none'; window._mealNameAcIdx = -1; return; }
  else return;
  items.forEach((el, i) => { el.style.background = i === window._mealNameAcIdx ? 'var(--accent-bg)' : ''; });
  items[window._mealNameAcIdx]?.scrollIntoView({ block: 'nearest' });
}

// ── #3: Zutaten-Autocomplete (zeilenbasiert) ──────────────────────────
export function _mealIngrAcUpdate(e) {
  const ac      = document.getElementById('meal-ingr-ac');
  const textarea = document.getElementById('meal-ingr-input');
  if (!ac || !textarea) return;
  window._mealIngrAcIdx = -1;

  // Aktuelle Zeile ermitteln
  const val   = textarea.value;
  const pos   = textarea.selectionStart;
  const start = val.lastIndexOf('\n', pos - 1) + 1;
  const end   = val.indexOf('\n', pos);
  const line  = val.slice(start, end === -1 ? undefined : end).trim();

  // Nur den Namensteil (ohne Mengenangabe vorne)
  const nameMatch = line.match(/^[0-9.,/½¼¾]+\s*(?:g|kg|ml|l|L|cl|Stück|Stk|Pck|EL|TL|Dose|Fla|Bund|Zehe|cm)?\s*(.+)$/i);
  const q = (nameMatch ? nameMatch[1] : line).trim().toLowerCase();

  if (!q || q.length < 2) { ac.style.display = 'none'; return; }

  // Kandidaten: shopItems + CAT_SEED-Keys + frühere Rezept-Zutaten
  const seen = new Set();
  const candidates = [];
  // Aus shopItems
  state.shopItems.filter(i => i.name).forEach(i => {
    const k = i.name.trim().toLowerCase();
    if (!seen.has(k)) { seen.add(k); candidates.push(i.name); }
  });
  // Aus Rezept-Zutaten
  Object.values(state.mealRecipes).forEach(r => {
    (r.ingredients || []).forEach(ing => {
      const parsed = ing.trim().replace(/^[0-9.,/½¼¾]+\s*(?:g|kg|ml|l|L|cl|Stück|Stk|Pck|EL|TL|Dose|Fla|Bund|Zehe|cm)?\s*/i, '').trim();
      if (parsed) { const k = parsed.toLowerCase(); if (!seen.has(k)) { seen.add(k); candidates.push(parsed); } }
    });
  });

  const starts   = candidates.filter(c => c.toLowerCase().startsWith(q));
  const contains = candidates.filter(c => !c.toLowerCase().startsWith(q) && c.toLowerCase().includes(q));
  const matches  = [...starts, ...contains].slice(0, 5);

  if (!matches.length) { ac.style.display = 'none'; return; }

  ac.innerHTML = matches.map((name, i) => `<div class="meal-ac-item" data-idx="${i}"
    style="padding:8px 14px;cursor:pointer;font-size:13px;font-weight:500;color:var(--text1);border-bottom:1px solid var(--border2);transition:background 0.1s"
    onmousedown="event.preventDefault()"
    onclick="window._app._mealIngrAcSelect(${i})">${escapeHtml(name)}</div>`).join('');
  const last = ac.querySelector('.meal-ac-item:last-child');
  if (last) last.style.borderBottom = 'none';
  window._mealIngrAcMatches = matches;
  ac.style.display = 'block';
}

export function _mealIngrAcSelect(idx) {
  const name    = (window._mealIngrAcMatches || [])[idx];
  const textarea = document.getElementById('meal-ingr-input');
  const ac       = document.getElementById('meal-ingr-ac');
  if (!name || !textarea) return;

  // Aktuelle Zeile durch ausgewählten Namen ersetzen (Mengenangabe behalten)
  const val   = textarea.value;
  const pos   = textarea.selectionStart;
  const start = val.lastIndexOf('\n', pos - 1) + 1;
  const end   = val.indexOf('\n', pos);
  const line  = val.slice(start, end === -1 ? undefined : end);
  const qtyPrefix = line.match(/^([0-9.,/½¼¾]+\s*(?:g|kg|ml|l|L|cl|Stück|Stk|Pck|EL|TL|Dose|Fla|Bund|Zehe|cm)?\s*)/i);
  const newLine = (qtyPrefix ? qtyPrefix[1] : '') + name;
  const endPos  = end === -1 ? val.length : end;
  textarea.value = val.slice(0, start) + newLine + val.slice(endPos);
  textarea.selectionStart = textarea.selectionEnd = start + newLine.length;

  if (ac) ac.style.display = 'none';
  window._mealIngrAcIdx = -1;
}

export function _mealIngrAcKey(e) {
  const ac = document.getElementById('meal-ingr-ac');
  if (!ac || ac.style.display === 'none') return;
  const items = ac.querySelectorAll('.meal-ac-item');
  if (!items.length) return;
  if (e.key === 'ArrowDown') { e.preventDefault(); window._mealIngrAcIdx = Math.min((window._mealIngrAcIdx || -1) + 1, items.length - 1); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); window._mealIngrAcIdx = Math.max((window._mealIngrAcIdx || 0) - 1, 0); }
  else if (e.key === 'Tab' && (window._mealIngrAcIdx || -1) >= 0) { e.preventDefault(); window._app._mealIngrAcSelect(window._mealIngrAcIdx); return; }
  else if (e.key === 'Escape') { ac.style.display = 'none'; window._mealIngrAcIdx = -1; return; }
  else return;
  items.forEach((el, i) => { el.style.background = i === window._mealIngrAcIdx ? 'var(--accent-bg)' : ''; });
  items[window._mealIngrAcIdx]?.scrollIntoView({ block: 'nearest' });
}

export async function confirmSaveMeal(iso, type) {
  const name = document.getElementById('meal-name-input')?.value || '';
  if (!name.trim()) { const el = document.getElementById('meal-name-input'); if (el) el.style.borderColor = '#DC2626'; return; }
  const ingrRaw    = document.getElementById('meal-ingr-input')?.value || '';
  const optIngrRaw = document.getElementById('meal-opt-ingr-input')?.value || '';
  const ingredients = ingrRaw.split('\n').map(s => s.trim()).filter(Boolean);
  const optionalIngredients = optIngrRaw.split('\n').map(s => s.trim()).filter(Boolean);
  // Vorausgewählte optionale Zutaten aus Checkboxen lesen
  const selectedOptionals = Array.from(
    document.querySelectorAll('input[name="opt-sel"]:checked')
  ).map(cb => cb.value);
  closeModal();
  await saveMeal(iso, type, name, '🍽️', ingredients, renderContent, showSync, optionalIngredients, selectedOptionals);
}

// ── OPTIONALE ZUTATEN CHECKBOXEN IM MODAL ────────────────────
export function _mealOptIngrUpdate() {
  const textarea = document.getElementById('meal-opt-ingr-input');
  const container = document.getElementById('meal-opt-checks');
  if (!textarea || !container) return;
  const lines = textarea.value.split('\n').map(s => s.trim()).filter(Boolean);
  if (!lines.length) { container.innerHTML = ''; return; }
  // Bestehende Checkboxen beibehalten (checked-State erhalten)
  const existing = {};
  container.querySelectorAll('input[type=checkbox]').forEach(cb => {
    existing[cb.value] = cb.checked;
  });
  const checkSVG = '<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 5l2.5 2.5 4.5-4.5"/></svg>';
  container.innerHTML = '<div style="font-size:11px;color:var(--text3);margin-bottom:4px">Diese Woche dabei?</div>'
    + lines.map(ing => {
      const checked = existing[ing] !== undefined ? existing[ing] : false;
      const id = 'opt-cb-' + ing.replace(/[^a-z0-9]/gi, '_');
      return '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:3px 0" onclick="event.stopPropagation()">'
        + '<input type="checkbox" id="' + id + '" value="' + ing.replace(/"/g, '&quot;') + '"'
        + (checked ? ' checked' : '')
        + ' style="display:none" onchange="window._mealOptCbChange && window._mealOptCbChange(this)">'
        + '<span id="box-' + id + '" style="width:18px;height:18px;border-radius:5px;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all 0.15s;'
        + (checked ? 'border:1.5px solid #059669;background:#059669;' : 'border:1.5px solid var(--border);background:transparent;') + '">'
        + (checked ? checkSVG : '') + '</span>'
        + '<span style="font-size:13px;' + (checked ? 'color:#059669;' : 'color:var(--text1);') + '">' + ing + '</span>'
        + '</label>';
    }).join('');
}

export function _mealOptCbChange(input) {
  const box = document.getElementById('box-' + input.id);
  const label = input.nextElementSibling?.nextElementSibling;
  const checkSVG = '<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 5l2.5 2.5 4.5-4.5"/></svg>';
  if (input.checked) {
    if (box) { box.style.cssText = 'width:18px;height:18px;border-radius:5px;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all 0.15s;border:1.5px solid #059669;background:#059669;'; box.innerHTML = checkSVG; }
    if (label) label.style.color = '#059669';
  } else {
    if (box) { box.style.cssText = 'width:18px;height:18px;border-radius:5px;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all 0.15s;border:1.5px solid var(--border);background:transparent;'; box.innerHTML = ''; }
    if (label) label.style.color = 'var(--text1)';
  }
}

// ── USER MODAL ────────────────────────────────────────────────
function buildPlanSection() {
  const plan = state._verifiedPlan;
  if (plan === 'premium' || plan === 'granted') {
    const label  = plan === 'granted' ? 'Freizugang' : 'Premium';
    const expiry = state.userPlanData?.premium?.currentPeriodEnd
      ? new Date(state.userPlanData.premium.currentPeriodEnd).toLocaleDateString('de', { day: '2-digit', month: '2-digit', year: 'numeric' }) : null;
    return `<div style="width:100%;margin-top:10px;background:linear-gradient(135deg,#5C4EE5,#764ba2);border-radius:12px;padding:14px 16px;display:flex;align-items:center;gap:12px">
      <div style="font-size:28px;flex-shrink:0">⭐</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:700;color:white">famiplan Plus · ${label}</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.7);margin-top:2px">${expiry ? 'Aktiv bis ' + expiry : 'Aktiv'}</div>
      </div>
      <a href="https://app.lemonsqueezy.com/my-orders" target="_blank" style="font-size:11px;color:rgba(255,255,255,0.7);text-decoration:none;white-space:nowrap">Abo verwalten ›</a>
    </div>`;
  }


  return `<button style="width:100%;margin-top:6px;padding:11px;border:none;border-radius:10px;background:#5C4EE5;color:white;font-weight:700;font-size:14px;cursor:pointer;font-family:inherit" onclick="window._app.closeModal();window._app.showUpgradeModal()">⭐ famiplan Plus</button>`;
}

export function showUserModal() {
  // App-Store-Hinweis: nur iOS-Web (nicht die native App selbst), nur
  // sobald die App im Store gelistet ist (APP_STORE_URL gesetzt, siehe
  // config.js). Dauerhaft im Menue verfuegbar, falls der einmalige
  // Hinweis nach der Registrierung (showInstallPrompt) weggewischt wurde.
  let isNativeApp = false;
  try { isNativeApp = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()); } catch (e) {}
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const showAppStoreLink = isIOS && !isNativeApp && !!APP_STORE_URL;

  const btns = state.members.map(m => {
    const av = state.photos?.[m]
      ? `<img src="${state.photos[m]}" style="width:32px;height:32px;border-radius:50%;object-fit:cover">`
      : (state.av[m] || '👤');
    return `<div style="position:relative">
      <button class="member-btn${state.curUser === m ? ' sel' : ''}" onclick="window._app.selectUser('${escapeAttr(m)}')">
        <div class="member-av" style="position:relative;display:inline-flex;width:32px;height:32px;align-items:center;justify-content:center">
          ${av}
          <span onclick="event.stopPropagation();window._app.showEditMemberModal('${escapeAttr(m)}')"
            style="position:absolute;bottom:-5px;right:-5px;background:var(--surface);border:1px solid var(--border);border-radius:50%;width:18px;height:18px;font-size:9px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 3px rgba(0,0,0,0.2);line-height:1">✏️</span>
        </div>
        <div class="member-nm">${escapeHtml(m)}</div>
      </button>
    </div>`;
  }).join('');

  const familyInfo = state.familyName ? `
    <div style="margin-bottom:14px">
      ${state.familyName !== state.familyId ? `<div style="font-size:13px;font-weight:600;color:var(--text1);text-align:center;margin-bottom:2px">${escapeHtml(state.familyName)}</div>` : ''}
      <div style="font-size:10px;color:#c4c9d4;text-align:center;margin-bottom:10px;letter-spacing:0.5px">ID: ${state.familyId}</div>
      <button onclick="window._app.shareInviteLink()" style="width:100%;padding:12px;border:none;border-radius:12px;background:linear-gradient(135deg,#5C4EE5,#764ba2);color:white;font-weight:700;font-size:14px;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:8px">
        🔗 Familienmitglied einladen
      </button>
      <div style="font-size:10px;color:#c4c9d4;text-align:center;margin-top:6px;letter-spacing:0.5px">Teile den Link per WhatsApp, SMS oder E-Mail</div>
    </div>` : '';

  openModal(`
    <div class="modal-handle"></div>
    <div class="modal-title">👋 Wer bist du?</div>
    <div class="modal-sub">Wähle dein Familienprofil</div>
    ${familyInfo}
    <div class="member-grid">${btns}</div>
    ${state.members.length === 0 ? '<div style="text-align:center;padding:20px;color:var(--text3);font-size:13px">Noch keine Profile.<br>Füge das erste hinzu!</div>' : ''}
    <button style="width:100%;margin-top:14px;padding:11px;border:1px dashed #5C4EE5;border-radius:10px;background:var(--accent-bg);color:#5C4EE5;font-weight:600;font-size:14px;cursor:pointer;font-family:inherit" onclick="window._app.showAddMemberModal(false)">➕ Profil hinzufügen</button>
    ${state.curUser ? `<button class="modal-close" onclick="window._app.closeModal()">Abbrechen</button>` : ''}
    <button style="width:100%;margin-top:8px;padding:11px;border:none;border-radius:10px;background:#F5F3FF;color:#5C4EE5;font-weight:600;font-size:13px;cursor:pointer;font-family:inherit" onclick="window._app.closeModal();setTimeout(()=>window._app.showPushPage(),400)">🔔 Benachrichtigungen</button>
    ${window._app.isCalendarSyncSupported && window._app.isCalendarSyncSupported() ? `<button style="width:100%;margin-top:6px;padding:11px;border:none;border-radius:10px;background:#F5F3FF;color:#5C4EE5;font-weight:600;font-size:13px;cursor:pointer;font-family:inherit" onclick="window._app.closeModal();setTimeout(()=>window._app.showCalendarSyncPage(),400)">🗓️ Apple Kalender</button>` : ''}
    <button style="width:100%;margin-top:6px;padding:11px;border:none;border-radius:10px;background:#F5F3FF;color:#5C4EE5;font-weight:600;font-size:13px;cursor:pointer;font-family:inherit" onclick="window._app.closeModal();setTimeout(()=>window._app.showConnectedAccountsModal(),400)">👥 Verbundene Accounts</button>
    ${showAppStoreLink ? `<button style="width:100%;margin-top:6px;padding:11px;border:none;border-radius:10px;background:#F5F3FF;color:#5C4EE5;font-weight:600;font-size:13px;cursor:pointer;font-family:inherit" onclick="window.location.href='${APP_STORE_URL}'">📲 App aus dem App Store laden</button>` : ''}
    <button style="width:100%;margin-top:6px;padding:11px;border:none;border-radius:10px;background:#FEF2F2;color:#DC2626;font-weight:600;font-size:13px;cursor:pointer;font-family:inherit" onclick="window._app.authSignOut()">🚪 Abmelden</button>
    <button style="width:100%;margin-top:6px;padding:9px;border:none;border-radius:10px;background:none;color:var(--text3);font-weight:500;font-size:12px;cursor:pointer;font-family:inherit" onclick="window._app.showDeleteAccountModal()">Account löschen</button>
    ${isAdmin() ? `<button style="width:100%;margin-top:6px;padding:9px;border:1px solid var(--border);border-radius:10px;background:var(--bg3);color:#5C4EE5;font-weight:600;font-size:12px;cursor:pointer;font-family:inherit" onclick="window._app.closeModal();window._app.showAdminPanel()">🛡 Admin-Panel</button>` : ''}
    ${PREMIUM_ENABLED ? buildPlanSection() : ''}
  `);
}

// ── VERBUNDENE ACCOUNTS ──────────────────────────────────────
export async function showConnectedAccountsModal() {
  openModal(`
    <div class="modal-handle"></div>
    <div class="modal-title">👥 Verbundene Accounts</div>
    <div class="modal-sub">Lädt…</div>
  `);

  const myUid = state.currentAuthUser?.uid;
  const accounts = await loadConnectedAccounts();
  const entries = Object.entries(accounts || {});

  const rows = entries.length ? entries.map(([uid, info]) => {
    const isMe = uid === myUid;
    const joined = info.joinedAt ? new Date(info.joinedAt).toLocaleDateString('de-DE') : '';
    return `<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 4px;border-bottom:1px solid var(--border)">
      <div>
        <div style="font-weight:700;font-size:14px;color:var(--text1)">${escapeHtml(info.name || '?')}${isMe ? ' <span style="color:var(--text3);font-weight:500">(du)</span>' : ''}</div>
        <div style="font-size:11px;color:var(--text3)">${joined ? `Verbunden seit ${joined}` : ''}</div>
      </div>
      ${!isMe ? `<button onclick="window._app.confirmRevokeMemberAccess('${uid.replace(/'/g, "\\'")}','${escapeAttr(info.name || '')}')"
        style="padding:8px 14px;border:none;border-radius:10px;background:#FEF2F2;color:#DC2626;font-weight:600;font-size:12px;cursor:pointer;font-family:inherit">Entfernen</button>` : ''}
    </div>`;
  }).join('') : `<div style="text-align:center;padding:20px;color:var(--text3);font-size:13px">Keine verbundenen Accounts gefunden.<br>(Ältere Profile werden beim nächsten Öffnen der App automatisch nachgetragen.)</div>`;

  openModal(`
    <div class="modal-handle"></div>
    <div class="modal-title">👥 Verbundene Accounts</div>
    <div class="modal-sub">Diese Accounts haben Zugriff auf eure Familie</div>
    <div>${rows}</div>
    <button class="modal-close" onclick="window._app.closeModal();window._app.showUserModal()" style="margin-top:14px">Zurück</button>
  `);
}

export function confirmRevokeMemberAccess(uid, name) {
  if (!confirm(`Zugriff für „${name}" wirklich entziehen? Der Account verliert damit sofort den Zugang zu allen Familiendaten und müsste erneut eingeladen werden.`)) return;
  showSync('Wird entfernt…');
  revokeMemberAccess(uid).then(ok => {
    if (ok) { showSync('✓ Zugriff entzogen'); showConnectedAccountsModal(); }
    else showSync('Fehler beim Entfernen. Bitte erneut versuchen.');
  });
}

export function selectUser(name) {
  setState({ curUser: name });
  try { localStorage.setItem('fp_user', name); } catch {}
  const ub = document.getElementById('user-btn');
  if (ub) ub.textContent = (state.av[name] || '👤') + ' ' + name;
  closeModal();
}

// ── BOARD NEW MODAL ───────────────────────────────────────────
export function showBoardNewModal() {
  openModal(`
    <div class="modal-handle"></div>
    <div class="modal-title">📌 Neuer Beitrag</div>
    <div class="form-group">
      <textarea class="form-input" id="board-text" placeholder="Was möchtest du teilen?" rows="4" style="resize:none;font-size:16px;line-height:1.5"></textarea>
    </div>
    <div class="form-group">
      <div style="display:flex;align-items:center;gap:10px">
        <div id="board-photo-preview" style="display:none;width:64px;height:64px;border-radius:10px;overflow:hidden;flex-shrink:0">
          <img id="board-photo-img" style="width:100%;height:100%;object-fit:cover">
        </div>
        <button type="button" onclick="document.getElementById('board-photo-input').click()"
          style="flex:1;padding:10px;border:1.5px dashed #5C4EE5;border-radius:10px;background:var(--accent-bg);color:#5C4EE5;font-weight:600;font-size:13px;cursor:pointer;font-family:inherit">
          📷 Foto hinzufügen
        </button>
        <input type="file" id="board-photo-input" accept="image/*" style="display:none" onchange="window._app.boardHandlePhoto(this)">
      </div>
    </div>
    <button class="submit-btn" onclick="window._app.boardSubmitPost()">Veröffentlichen</button>
    <button class="modal-close" onclick="window._app.closeModal()">Abbrechen</button>
  `);
  setTimeout(() => document.getElementById('board-text')?.focus(), 350);
}

// ── UPGRADE MODAL ─────────────────────────────────────────────
export function showUpgradeModal(context = 'general') {
  // Kontext-spezifische Nachrichten
  const ctx = {
    comments: {
      icon: '💬',
      title: 'Kommentar-Limit erreicht',
      sub: 'Du hast heute 5 von 5 kostenlosen Kommentaren genutzt.',
      highlight: 'Mit famiplan Plus kommentierst du unbegrenzt – und nutzt alle weiteren Features.',
    },
    tasks: {
      icon: '📋',
      title: 'Aufgaben-Limit erreicht',
      sub: 'Du hast das kostenlose Limit von 15 aktiven Aufgaben erreicht.',
      highlight: 'Mit famiplan Plus legst du unbegrenzt Aufgaben und Termine an.',
    },
    members: {
      icon: '👨‍👩‍👧‍👦',
      title: 'Mitglieder-Limit erreicht',
      sub: 'Im kostenlosen Plan sind bis zu 3 Familienmitglieder möglich.',
      highlight: 'Mit famiplan Plus lädt ihr unbegrenzt Familienmitglieder ein.',
    },
    shopLists: {
      icon: '🛒',
      title: 'Einkaufslisten-Limit erreicht',
      sub: 'Im kostenlosen Plan ist 1 Einkaufsliste möglich.',
      highlight: 'Mit famiplan Plus erstellt ihr beliebig viele Listen – z.B. für verschiedene Märkte.',
    },
    mealWeeks: {
      icon: '🍽️',
      title: 'Mahlzeiten vergangener Wochen',
      sub: 'Im kostenlosen Plan ist nur die aktuelle Woche verfügbar.',
      highlight: 'Mit famiplan Plus planst du beliebige Wochen – auch rückwirkend.',
    },
    pushFull: {
      icon: '🔔',
      title: 'Mehr Push-Benachrichtigungen',
      sub: 'Im kostenlosen Plan sind nur Erinnerungen vor Terminen verfügbar.',
      highlight: 'Mit famiplan Plus erhältst du alle Benachrichtigungen – neue Aufgaben, Kommentare, Board-Posts und Morgens-Übersicht.',
    },
    calendarSync: {
      icon: '🗓️',
      title: 'Apple Kalender Sync',
      sub: 'Automatischer Termin-Abgleich ist ein Plus-Feature.',
      highlight: 'Mit famiplan Plus erscheinen famiplan-Termine automatisch in deinem iPhone-Kalender – und umgekehrt.',
    },
    general: {
      icon: '⭐',
      title: 'famiplan Plus',
      sub: 'Unbegrenzter Zugang für deine Familie.',
      highlight: 'Alles was famiplan bietet – ohne Einschränkungen.',
    },
  };
  const c = ctx[context] || ctx.general;

  openModal(`
    <div class="modal-handle"></div>
    <div style="text-align:center;padding:8px 0 4px">
      <div style="font-size:48px;margin-bottom:10px">${c.icon}</div>
      <div class="modal-title">${c.title}</div>
      <div class="modal-sub" style="margin-bottom:16px">${c.sub}</div>
    </div>

    <div style="background:linear-gradient(135deg,#EEF2FF,#F5F3FF);border-radius:14px;padding:14px 16px;margin-bottom:16px;border:1px solid #c7d2fe">
      <div style="font-size:12px;font-weight:600;color:#4338ca;margin-bottom:8px">${c.highlight}</div>
      <div style="font-size:12px;color:#4338ca;line-height:1.9">
        ✓ Unbegrenzte Aufgaben, Kommentare & Board-Posts<br>
        ✓ Unbegrenzte Familienmitglieder & Einkaufslisten<br>
        ✓ Mahlzeiten für alle Wochen planbar<br>
        ✓ ✨ KI-Rezept-Import per URL, Text oder Foto<br>
        ✓ Alle Push-Benachrichtigungen<br>
        ✓ Apple Kalender Sync (iOS)
      </div>
    </div>

    <div style="background:#5C4EE5;border-radius:14px;padding:16px;margin-bottom:8px;cursor:pointer;position:relative;overflow:hidden" onclick="window._app.openCheckout('yearly')">
      <div style="position:absolute;top:8px;right:10px;background:#F59E0B;color:white;font-size:9px;font-weight:800;padding:2px 7px;border-radius:20px;letter-spacing:0.5px">BELIEBT</div>
      <div style="font-size:16px;font-weight:800;color:white">14,99 € / Jahr</div>
      <div style="font-size:12px;color:rgba(255,255,255,0.75);margin-top:2px">= 1,25 € pro Monat · 2 Monate gratis</div>
    </div>

    <button style="width:100%;padding:13px;background:var(--accent-bg);color:#5C4EE5;border:1.5px solid #c7d2fe;border-radius:12px;font-weight:700;font-size:14px;cursor:pointer;font-family:inherit;margin-bottom:4px" onclick="window._app.openCheckout('monthly')">
      1,99 € / Monat
    </button>

    <div style="font-size:11px;color:var(--text3);text-align:center;margin-bottom:12px">Jederzeit kündbar · Sichere Zahlung via LemonSqueezy</div>
    <button class="modal-close" onclick="window._app.closeModal()">Vielleicht später</button>
  `);
}

// ── OPEN MAPS ─────────────────────────────────────────────────
export function openMaps(location) {
  if (!location) return;
  const q  = encodeURIComponent(location);
  const a  = document.createElement('a');
  a.href   = `maps://maps.apple.com/?q=${q}`;
  a.click();
  setTimeout(() => {
    const a2 = document.createElement('a');
    a2.href   = `https://maps.apple.com/?q=${q}`;
    a2.target = '_blank';
    a2.click();
  }, 300);
}

export function showDeleteAccountModal() {
  const isGoogle = state.currentAuthUser?.providerData?.[0]?.providerId === 'google.com';
  const pwField  = isGoogle ? '' : `
    <div style="margin-bottom:14px">
      <label style="display:block;font-size:11px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px">Passwort bestätigen</label>
      <input type="password" id="del-password" class="form-input" placeholder="Dein Passwort" autocomplete="current-password"/>
    </div>`;
  openModal(`
    <div class="modal-handle"></div>
    <div style="text-align:center;font-size:40px;margin-bottom:12px">⚠️</div>
    <div class="modal-title" style="color:#DC2626">Account löschen</div>
    <div class="modal-sub" style="margin-bottom:16px">Diese Aktion kann nicht rückgängig gemacht werden.</div>
    ${pwField}
    <div id="del-err" style="font-size:12px;color:#DC2626;min-height:18px;margin-bottom:8px;font-weight:500"></div>
    <button id="del-confirm-btn" style="width:100%;padding:13px;border:none;border-radius:10px;background:#DC2626;color:white;font-weight:700;font-size:15px;cursor:pointer;font-family:inherit"
      onclick="window._app.deleteAccount()">Ja, Account unwiderruflich löschen</button>
    <button class="modal-close" onclick="window._app.closeModal()">Abbrechen</button>
  `);
}

// Expose functions for inline HTML handlers
if (typeof window !== 'undefined') {
  window._rebuildOptChecks = rebuildOptChecks;
  window._rebuildOptChecks = function(val) {
    const container = document.getElementById('meal-opt-checks');
    if (!container) return;
    const lines = val.split('\n').map(s => s.trim()).filter(Boolean);
    if (!lines.length) { container.innerHTML = ''; return; }
    // Bestehenden checked-State merken
    const wasChecked = {};
    container.querySelectorAll('input[name="opt-sel"]').forEach(cb => { wasChecked[cb.value] = cb.checked; });
    const svg = '<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 5l2.5 2.5 4.5-4.5"/></svg>';
    container.innerHTML = '<div style="font-size:11px;color:var(--text3);margin-bottom:2px">Diese Woche dabei?</div>'
      + lines.map(function(ing) {
          var checked = wasChecked[ing] || false;
          var cbId = 'opt-cb-' + ing.replace(/[^a-z0-9]/gi, '_');
          var boxStyle = checked
            ? 'width:18px;height:18px;border-radius:5px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border:1.5px solid #059669;background:#059669;'
            : 'width:18px;height:18px;border-radius:5px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border:1.5px solid var(--border);background:transparent;';
          var txtStyle = checked ? 'font-size:13px;color:#059669;' : 'font-size:13px;color:var(--text1);';
          return '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:3px 0" onclick="window._togOptCb(\'' + cbId + '\')">'
            + '<input type="checkbox" id="' + cbId + '" name="opt-sel" value="' + ing.replace(/"/g, '&quot;') + '"' + (checked ? ' checked' : '') + ' style="display:none">'
            + '<span id="box-' + cbId + '" style="' + boxStyle + '">' + (checked ? svg : '') + '</span>'
            + '<span id="txt-' + cbId + '" style="' + txtStyle + '">' + ing + '</span>'
            + '</label>';
        }).join('');
  };

  window._togOptCb = function(cbId) {
    const cb  = document.getElementById(cbId);
    const box = document.getElementById('box-' + cbId);
    const txt = document.getElementById('txt-' + cbId);
    if (!cb || !box) return;
    cb.checked = !cb.checked;
    const svg = '<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 5l2.5 2.5 4.5-4.5"/></svg>';
    if (cb.checked) {
      box.style.cssText = 'width:18px;height:18px;border-radius:5px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border:1.5px solid #059669;background:#059669;';
      box.innerHTML = svg;
      if (txt) txt.style.color = '#059669';
    } else {
      box.style.cssText = 'width:18px;height:18px;border-radius:5px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border:1.5px solid var(--border);background:transparent;';
      box.innerHTML = '';
      if (txt) txt.style.color = 'var(--text1)';
    }
  };
}



// ── REZEPT-ZUBEREITUNG MODAL ──────────────────────────────────
// Öffnet den Steps-Editor für ein Rezept
export function showRecipeStepsModal(iso, type, recipeKeyOverride) {
  const key = recipeKeyOverride || window._mealCurrentRecipeKey;
  // Key aus aktuellem Namen ableiten wenn noch kein Rezept gespeichert
  const nameEl = document.getElementById('meal-name-input');
  const nameVal = nameEl?.value?.trim() || '';
  const derivedKey = nameVal.toLowerCase().replace(/[^a-z0-9äöüß]/g, '_').slice(0, 40);
  const useKey = key || derivedKey;
  const recipe = state.mealRecipes[useKey] || { name: nameVal, steps: [], prepTime: 0, servings: 4 };

  const steps = recipe.steps || [];
  const stepsHTML = steps.map((s, i) => `
    <div class="recipe-step-row" id="step-row-${i}" style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px">
      <div style="width:24px;height:24px;border-radius:50%;background:#5C4EE5;color:white;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:8px">${i+1}</div>
      <textarea class="form-input step-input" data-step="${i}" rows="2"
        style="flex:1;resize:none;line-height:1.5;font-size:13px"
        placeholder="Schritt ${i+1} beschreiben…">${escapeHtml(s)}</textarea>
      <button type="button" onclick="window._app._recipeRemoveStep(${i})"
        style="width:28px;height:28px;border:none;border-radius:6px;background:var(--red-bg);color:var(--red-text);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;margin-top:6px;font-size:14px">×</button>
    </div>`).join('');

  openModal(`
    <div class="modal-handle"></div>
    <div class="modal-title">📖 Zubereitung</div>
    <div class="modal-sub" style="margin-bottom:14px">${escapeHtml(recipe.name || nameVal || 'Rezept')}</div>
    <div style="display:flex;gap:10px;margin-bottom:14px">
      <div style="flex:1">
        <label class="form-lbl">Vorbereitungszeit</label>
        <div style="display:flex;align-items:center;gap:6px">
          <input class="form-input" id="recipe-prep-time" type="number" min="0" max="300" value="${recipe.prepTime || ''}"
            placeholder="0" style="width:70px;text-align:center"/>
          <span style="font-size:13px;color:var(--text2)">Min.</span>
        </div>
      </div>
      <div style="flex:1">
        <label class="form-lbl">Portionen</label>
        <div style="display:flex;align-items:center;gap:6px">
          <input class="form-input" id="recipe-servings" type="number" min="1" max="20" value="${recipe.servings || 4}"
            placeholder="4" style="width:70px;text-align:center"/>
          <span style="font-size:13px;color:var(--text2)">Pers.</span>
        </div>
      </div>
    </div>
    <div id="recipe-steps-list" style="margin-bottom:10px">
      ${stepsHTML || '<div id="steps-empty" style="text-align:center;padding:20px;color:var(--text3);font-size:13px">Noch keine Schritte – füge den ersten hinzu</div>'}
    </div>
    <button type="button" onclick="window._app._recipeAddStep()"
      style="width:100%;padding:10px;border:1.5px dashed var(--border);border-radius:10px;background:transparent;font-size:13px;font-weight:600;color:#5C4EE5;cursor:pointer;font-family:inherit;margin-bottom:14px">
      + Schritt hinzufügen
    </button>
    <button class="submit-btn" onclick="window._app._recipeSaveSteps('${escapeAttr(iso)}','${escapeAttr(type)}','${escapeAttr(useKey)}')">Speichern</button>
    <button class="modal-close" onclick="window._app._recipeStepsBack('${escapeAttr(iso)}','${escapeAttr(type)}')">Zurück zur Mahlzeit</button>
  `);
}

// ── REZEPT-DETAILANSICHT (Lese-Modus aus Wochenübersicht) ─────
export function showRecipeDetailModal(iso, type) {
  const meal   = state.meals[iso]?.[type];
  if (!meal?.name) return;
  const key    = meal.name.toLowerCase().replace(/[^a-z0-9äöüß]/g, '_').slice(0, 40);
  const recipe = state.mealRecipes[key];
  if (!recipe?.steps?.length) {
    // Kein Rezept mit Schritten – direkt Edit öffnen
    showMealEditModal(iso, type); return;
  }

  const d       = new Date(iso + 'T12:00:00');
  const dateStr = d.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
  const ingrCount = recipe.ingredients?.length || 0;

  const metaHTML = [
    recipe.prepTime ? `⏱ ${recipe.prepTime} Min.` : '',
    recipe.servings ? `👥 ${recipe.servings} Portionen` : '',
  ].filter(Boolean).join(' · ');

  const ingrHTML = ingrCount ? `
    <div style="margin-bottom:16px">
      <div style="font-size:12px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">Zutaten</div>
      ${recipe.ingredients.map(ing => `
        <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border2);font-size:14px;color:var(--text1)">
          <span style="color:var(--text3)">·</span> ${escapeHtml(ing)}
        </div>`).join('')}
    </div>` : '';

  const stepsHTML = `
    <div style="margin-bottom:16px">
      <div style="font-size:12px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">Zubereitung</div>
      ${recipe.steps.map((s, i) => `
        <div style="display:flex;gap:12px;margin-bottom:12px;align-items:flex-start">
          <div style="width:26px;height:26px;border-radius:50%;background:#5C4EE5;color:white;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0">${i+1}</div>
          <div style="flex:1;font-size:14px;color:var(--text1);line-height:1.5;padding-top:3px">${escapeHtml(s)}</div>
        </div>`).join('')}
    </div>`;

  const shopBtn = ingrCount && !meal.addedToShop
    ? `<button class="submit-btn" style="margin-bottom:8px" onclick="window._app.mealIngredientsToShop('${escapeAttr(iso)}','${escapeAttr(type)}');window._app.closeModal()">
        🛒 Zutaten zur Einkaufsliste
      </button>` : '';

  openModal(`
    <div class="modal-handle"></div>
    <div style="text-align:center;font-size:40px;margin-bottom:6px">&#x1F37D;&#xFE0F;</div>
    <div class="modal-title">${escapeHtml(meal.name)}</div>
    ${metaHTML ? `<div style="text-align:center;font-size:13px;color:var(--text3);margin-bottom:16px">${metaHTML}</div>` : '<div style="margin-bottom:16px"></div>'}
    ${ingrHTML}
    ${stepsHTML}
    ${shopBtn}
    <button class="submit-btn" style="margin-bottom:8px" onclick="window._app.closeModal();setTimeout(()=>import('./ui/modals.js').then(m=>m.showRecipeEditModal('${escapeAttr(key)}')),350)">✏️ Rezept bearbeiten</button>
    <button class="modal-close" onclick="window._app.closeModal()">Schließen</button>
  `);
}

// ── REZEPT-IMPORT (KI) ────────────────────────────────────────
export function showRecipeImportModal() {
  if (!isPremiumActive() && !isAdmin()) {
    openModal(`
      <div class="modal-handle"></div>
      <div style="text-align:center;font-size:48px;margin-bottom:8px">✨</div>
      <div class="modal-title">KI-Rezept-Import</div>
      <div class="modal-sub" style="margin-bottom:20px">Importiere Rezepte per URL, Text oder Foto – nur mit famiplan Plus.</div>
      <button onclick="window._app.closeModal();setTimeout(()=>import('./modules/premium.js').then(m=>m.showPremiumModal()),100)"
        style="width:100%;padding:14px;background:linear-gradient(135deg,#5C4EE5,#7C6EE8);color:white;border:none;border-radius:12px;font-weight:700;font-size:15px;cursor:pointer;font-family:inherit;margin-bottom:10px">
        ⭐ Jetzt Plus holen
      </button>
      <button onclick="window._app.closeModal()"
        style="width:100%;padding:12px;background:transparent;color:var(--text3);border:none;border-radius:12px;font-size:14px;cursor:pointer;font-family:inherit">
        Abbrechen
      </button>
    `);
    return;
  }
  openModal(`
    <div class="modal-handle"></div>
    <div class="modal-title">✨ Rezept importieren</div>
    <div class="modal-sub" style="margin-bottom:14px">URL, Text oder Foto – die KI erkennt alles</div>

    <div style="display:flex;gap:8px;margin-bottom:14px">
      <button type="button" id="import-tab-text" onclick="window._app._recipeImportTab('text')"
        style="flex:1;padding:9px;border:1.5px solid #5C4EE5;border-radius:10px;background:#5C4EE5;color:white;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">
        🔗 URL / Text
      </button>
      <button type="button" id="import-tab-photo" onclick="window._app._recipeImportTab('photo')"
        style="flex:1;padding:9px;border:1.5px solid var(--border);border-radius:10px;background:transparent;color:var(--text2);font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">
        📷 Foto
      </button>
    </div>

    <div id="import-panel-text">
      <div class="form-group">
        <label class="form-lbl">URL (optional)</label>
        <input class="form-input" id="recipe-import-url" type="url"
          placeholder="z.B. https://www.chefkoch.de/rezepte/..."
          autocomplete="off" autocorrect="off" autocapitalize="off"/>
        <div style="font-size:11px;color:var(--text3);margin-top:4px">Klappt nicht bei allen Seiten – dann Text einfügen</div>
      </div>
      <div class="form-group">
        <label class="form-lbl">Rezepttext</label>
        <textarea class="form-input" id="recipe-import-text" rows="5"
          style="resize:none;line-height:1.5;font-size:13px"
          placeholder="Rezept hier einfügen – Name, Zutaten, Zubereitung…&#10;&#10;Die KI erkennt das Format automatisch."></textarea>
      </div>
    </div>

    <div id="import-panel-photo" style="display:none">
      <div style="margin-bottom:12px">
        <input type="file" id="recipe-import-photo" accept="image/*" capture="environment" style="display:none"
          onchange="window._app._recipeImportPhotoSelected(this)"/>
        <div id="recipe-photo-preview" style="width:100%;min-height:160px;border:2px dashed var(--border);border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;cursor:pointer;background:var(--bg2)"
          onclick="document.getElementById('recipe-import-photo').click()">
          <div style="font-size:36px">📷</div>
          <div style="font-size:13px;font-weight:600;color:var(--text2)">Foto aufnehmen oder aus Galerie wählen</div>
          <div style="font-size:11px;color:var(--text3)">Kochbuch, Zeitschrift, handgeschriebenes Rezept</div>
        </div>
      </div>
    </div>

    <div id="recipe-import-err" style="font-size:12px;color:#DC2626;min-height:16px;margin-bottom:8px"></div>
    <button class="submit-btn" id="recipe-import-btn" onclick="window._app._recipeImportStart()">
      ✨ Analysieren
    </button>
    <button class="modal-close" onclick="window._app.showRecipeManager()">Zurück</button>
  `);
}

export async function _recipeImportStart() {
  const urlEl  = document.getElementById('recipe-import-url');
  const textEl = document.getElementById('recipe-import-text');
  const errEl  = document.getElementById('recipe-import-err');
  const btn    = document.getElementById('recipe-import-btn');

  const url       = urlEl?.value.trim() || '';
  let   text      = textEl?.value.trim() || '';
  const photoData = window._recipeImportPhotoData || null;

  // Foto-Modus: Panel sichtbar und Foto vorhanden?
  const photoPanel = document.getElementById('import-panel-photo');
  const isPhotoMode = photoPanel && photoPanel.style.display !== 'none';

  if (isPhotoMode && !photoData) {
    if (errEl) errEl.textContent = 'Bitte zuerst ein Foto auswählen';
    return;
  }
  if (!isPhotoMode && !url && !text) {
    if (errEl) errEl.textContent = 'Bitte URL oder Text eingeben';
    return;
  }

  if (btn) { btn.disabled = true; btn.textContent = '✨ Wird analysiert…'; }
  if (errEl) errEl.textContent = '';

  // KI-Analyse via Cloudflare Worker (Gemini)
  try {
    const WORKER_URL = 'https://famiplan-recipe-import.maikotten78.workers.dev';
    const body = isPhotoMode
      ? { photo: photoData }
      : { url: url || undefined, text: text || undefined };
    const response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(25000),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      // URL-Fehler: Hinweis zeigen, Textarea fokussieren
      if (response.status === 422) {
        if (errEl) errEl.textContent = data.hint || data.error || 'URL konnte nicht geladen werden';
        if (textEl) { textEl.focus(); textEl.placeholder = 'Bitte Rezepttext hier manuell einfügen…'; }
        if (btn) { btn.disabled = false; btn.textContent = '✨ Analysieren'; }
        return;
      }
      throw new Error(data.error || 'Unbekannter Fehler');
    }

    const recipe = data.recipe;
    if (!recipe?.name) throw new Error('Kein Rezept erkannt');

    // Foto-Daten zurücksetzen
    window._recipeImportPhotoData = null;
    // Vorschau anzeigen
    _recipeImportShowPreview(recipe);

  } catch (e) {
    if (errEl) errEl.textContent = 'Fehler: ' + (e.message || 'Unbekannter Fehler');
    if (btn) { btn.disabled = false; btn.textContent = '✨ Analysieren'; }
  }
}

function _recipeImportShowPreview(recipe) {
  const ingrHTML = (recipe.ingredients || []).map((ing, i) =>
    `<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid var(--border2)">
      <input type="text" class="recipe-preview-ingr" data-idx="${i}" value="${escapeHtml(ing)}"
        style="flex:1;border:none;background:transparent;font-size:13px;color:var(--text1);outline:none;font-family:inherit"/>
    </div>`
  ).join('');

  const stepsHTML = (recipe.steps || []).map((s, i) =>
    `<div style="display:flex;gap:10px;margin-bottom:8px;align-items:flex-start">
      <div style="width:22px;height:22px;border-radius:50%;background:#5C4EE5;color:white;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px">${i+1}</div>
      <textarea class="recipe-preview-step form-input" data-idx="${i}" rows="2"
        style="flex:1;resize:none;font-size:13px;line-height:1.5">${escapeHtml(s)}</textarea>
    </div>`
  ).join('');

  const meta = [
    recipe.prepTime ? `${recipe.prepTime} Min.` : '',
    recipe.servings ? `${recipe.servings} Portionen` : '',
  ].filter(Boolean).join(' · ');

  openModal(`
    <div class="modal-handle"></div>
    <div class="modal-title">✅ Rezept erkannt</div>
    <div style="margin-bottom:14px">
      <label class="form-lbl">Name</label>
      <input class="form-input" id="recipe-preview-name" value="${escapeHtml(recipe.name || '')}" maxlength="80"/>
      ${meta ? `<div style="font-size:11px;color:var(--text3);margin-top:4px">${escapeHtml(meta)}</div>` : ''}
    </div>
    ${ingrHTML ? `<div style="margin-bottom:14px">
      <label class="form-lbl">${(recipe.ingredients||[]).length} Zutaten (bearbeitbar)</label>
      <div style="border:1px solid var(--border);border-radius:10px;padding:4px 10px;max-height:160px;overflow-y:auto">
        ${ingrHTML}
      </div>
    </div>` : ''}
    ${stepsHTML ? `<div style="margin-bottom:14px">
      <label class="form-lbl">${(recipe.steps||[]).length} Zubereitungsschritte (bearbeitbar)</label>
      <div style="max-height:200px;overflow-y:auto">
        ${stepsHTML}
      </div>
    </div>` : ''}
    <button class="submit-btn" onclick="window._app._recipeImportSave(${JSON.stringify(recipe).replace(/"/g, '&quot;')})">
      ✓ Rezept speichern
    </button>
    <button class="modal-close" onclick="window._app.showRecipeImportModal()">Nochmal versuchen</button>
  `);
}

export async function _recipeImportSave(originalRecipe) {
  // Bearbeitete Werte aus dem Formular lesen
  const name = document.getElementById('recipe-preview-name')?.value.trim() || originalRecipe.name;
  if (!name) return;

  const ingredients = Array.from(document.querySelectorAll('.recipe-preview-ingr'))
    .map(el => el.value.trim()).filter(Boolean);

  const steps = Array.from(document.querySelectorAll('.recipe-preview-step'))
    .map(el => el.value.trim()).filter(Boolean);

  const key = name.toLowerCase().replace(/[^a-z0-9äöüß]/g, '_').slice(0, 40);
  const recipe = {
    name,
    ingredients,
    steps,
    ...(originalRecipe.prepTime  ? { prepTime:  originalRecipe.prepTime  } : {}),
    ...(originalRecipe.servings  ? { servings:  originalRecipe.servings  } : {}),
    usedAt:   Date.now(),
    useCount: 1,
  };

  const { saveRecipeSteps } = await import('../modules/meals.js');
  const { fbSet } = await import('../modules/firebase.js');
  const { state } = await import('../modules/state.js');

  if (!state.familyId) return;

  // Direkt speichern
  const { setState } = await import('../modules/state.js');
  setState({ mealRecipes: { ...state.mealRecipes, [key]: recipe } });
  try {
    await fbSet(`mealRecipes/${key}`, recipe);
    const { showSync } = await import('./modal.js');
    showSync('✓ Rezept importiert!');
  } catch (e) {}

  // Zurück zum Manager
  const iso  = window._recipeManagerIso  || null;
  const type = window._recipeManagerType || 'dinner';
  showRecipeManager(iso, type);
}

// ── FOTO-IMPORT HELPERS ───────────────────────────────────────
export function _recipeImportTab(tab) {
  const textPanel  = document.getElementById('import-panel-text');
  const photoPanel = document.getElementById('import-panel-photo');
  const textBtn    = document.getElementById('import-tab-text');
  const photoBtn   = document.getElementById('import-tab-photo');
  if (!textPanel || !photoPanel) return;

  const isText = tab === 'text';
  textPanel.style.display  = isText ? '' : 'none';
  photoPanel.style.display = isText ? 'none' : '';

  const activeStyle   = 'flex:1;padding:9px;border:1.5px solid #5C4EE5;border-radius:10px;background:#5C4EE5;color:white;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit';
  const inactiveStyle = 'flex:1;padding:9px;border:1.5px solid var(--border);border-radius:10px;background:transparent;color:var(--text2);font-size:12px;font-weight:700;cursor:pointer;font-family:inherit';
  if (textBtn)  textBtn.style.cssText  = isText ? activeStyle : inactiveStyle;
  if (photoBtn) photoBtn.style.cssText = isText ? inactiveStyle : activeStyle;
}

export function _recipeImportPhotoSelected(input) {
  const file = input.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    window._recipeImportPhotoData = dataUrl;

    // Vorschau anzeigen
    const preview = document.getElementById('recipe-photo-preview');
    if (preview) {
      preview.innerHTML = `
        <img src="${dataUrl}" style="width:100%;max-height:220px;object-fit:contain;border-radius:10px"/>
        <div style="font-size:12px;color:var(--text3);margin-top:6px">Foto ausgewählt – jetzt Analysieren tippen</div>
      `;
      preview.style.border = '2px solid #5C4EE5';
      preview.style.cursor = 'default';
      preview.onclick = null;
    }
  };
  reader.readAsDataURL(file);
}
