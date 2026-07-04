// ══════════════════════════════════════════════════════════════
// famiplan – render.js  (Phase 5 UI Rendering)
// Alle Tab-Render-Funktionen + renderContent Orchestrierung
// ══════════════════════════════════════════════════════════════

import { DAYS, COLORS, BOARD_REACTIONS } from '../modules/config.js';
import { state, setState } from '../modules/state.js';
import { localISO, jd2i, dayFromISO, escapeHtml, escapeAttr, calcDur } from '../modules/utils.js';
import { isVisible, isOverdue, getOverdueDates, getA, setA, recLabel, recClass } from '../modules/tasks.js';
import { boardMarkSeen, boardTimeAgo, updateBoardBadge } from '../modules/board.js';
import { renderTrialBanner } from '../modules/premium.js';
import { openModal, closeModal, showSync } from './modal.js';
import { updateNav, renderDayPills, initSwipe } from './nav.js';
import { SHOP_CATS } from '../modules/shopping.js';
import { getHolidayInfo } from '../modules/holidays.js';

// ── HELPERS ───────────────────────────────────────────────────
function getMemberColor(name) {
  return state.memberColorMap[name] || '#9ba3af';
}

function a(fn) { return `window._app.${fn}`; }

// ── CARD V2 HTML ─────────────────────────────────────────────
function cardV2HTML(t, iso) {
  const { assignedTo, done } = getA(t, iso);
  const isMine   = assignedTo === state.curUser;
  const safeTitle = escapeHtml(t.title);
  const [th, tm] = t.time.split(':');
  const dur      = t.endTime ? calcDur(t.time, t.endTime) : '';
  const cmts     = state.taskComments[t.id] || {};
  const cmtCount = Object.keys(cmts).length;

  // #4 Direktes Abhaken: großer Check-Button links wenn zugewiesen
  const isTask   = t.type === 'task';
  const checkBtn = isTask && assignedTo && !done
    ? `<button class="v2-check-btn" onclick="event.stopPropagation();window._app.toggleDone('${t.id}','${iso}')" title="Erledigt">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#5C4EE5" stroke-width="1.5"/><path d="M5 8l2.5 2.5L11 5.5" stroke="#5C4EE5" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
       </button>`
    : isTask && done
    ? `<button class="v2-check-btn done-check" onclick="event.stopPropagation();window._app.toggleDone('${t.id}','${iso}')" title="Rückgängig">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" fill="#5C4EE5"/><path d="M5 8l2.5 2.5L11 5.5" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
       </button>`
    : `<div class="v2-check-btn-placeholder"></div>`;

  let rightHTML = '';
  if (t.type === 'event') {
    rightHTML = assignedTo
      ? `<span class="v2-assigned-chip" style="${isMine ? 'background:var(--accent-bg);color:var(--accent);font-weight:700;border:1px solid #c7d2fe' : ''}">${isMine ? 'Du' : escapeHtml(assignedTo)}</span>`
      : `<button class="v2-assign-btn" onclick="event.stopPropagation();window._app.assignTask('${t.id}','${state.curUser}','${iso}')">Teilnehmen</button>`;
  } else if (!assignedTo) {
    rightHTML = `<button class="v2-assign-btn" onclick="event.stopPropagation();window._app.showAssignModal('${t.id}','${iso}')">Ich mach's!</button>`;
  } else {
    const chipStyle = isMine ? 'background:var(--accent-bg);color:var(--accent);font-weight:700;border:1px solid #c7d2fe' : 'background:#F5F6FA;color:var(--text2)';
    rightHTML = `<div class="v2-assigned-chip" style="${chipStyle}">${isMine ? 'Du' : `${state.av[assignedTo] || '👤'} ${escapeHtml(assignedTo)}`}</div>`;
  }

  // Für wiederkehrende Aufgaben: Kommentar-Key ist taskId_iso
  const cmtKey   = t.recurring !== 'once' ? t.id + '_' + iso : t.id;
  const cmtCount2 = Object.keys(state.taskComments[cmtKey] || {}).length;
  const cmtBtn = `<button class="v2-cmt-btn" onclick="event.stopPropagation();window._app.showCommentsModal('${t.id}','${iso}')">💬${cmtCount2 > 0 ? ' ' + cmtCount2 : ''}</button>`;
  const subParts = [recLabel(t)];
  if (t.location) subParts.push('📍 ' + escapeHtml(t.location));
  if (dur) subParts.push('⏱ ' + dur);

  return `<div class="v2-card${done ? ' done' : ''}" onclick="window._app.showOvTaskMenu('${t.id}','${iso}')">
    <div class="v2-accent" style="background:${t.color}"></div>
    <div class="v2-card-inner">
      ${checkBtn}
      <div class="v2-time-col">
        <span class="v2-time-h">${th}</span>
        <span class="v2-time-m">${tm}</span>
      </div>
      <div class="v2-divider"></div>
      <div class="v2-body">
        <div class="v2-title${done ? ' done-txt' : ''}">${safeTitle}</div>
        <div class="v2-sub">${subParts.join(' · ')}</div>
        <div style="margin-top:3px">${cmtBtn}</div>
      </div>
      <div class="v2-right">
        ${rightHTML}
        <div class="v2-edit-row">
          <button class="v2-icon-btn" onclick="event.stopPropagation();window._app.showEditModal('${t.id}')" title="Bearbeiten">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="#6b7280" stroke-width="1.3" stroke-linejoin="round"/></svg>
          </button>
          <button class="v2-icon-btn" onclick="event.stopPropagation();window._app.deleteTask('${t.id}','${iso}')">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5 4V2.5h4V4M5.5 6.5v4M8.5 6.5v4M3 4l.8 7.5h6.4L11 4" stroke="#6b7280" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </div>
    </div>
  </div>`;
}

function openTodoCardHTML(t, iso) {
  const { assignedTo, done } = getA(t, 'open');
  const safeTitle   = escapeHtml(t.title);
  const accentColor = t.color || '#5C4EE5';
  const cmts        = state.taskComments[t.id] || {};
  const cmtCount    = Object.keys(cmts).length;
  const isMine      = assignedTo === state.curUser;
  const visLabel    = (!t.visibleTo || t.visibleTo === 'all') ? 'Alle'
    : Array.isArray(t.visibleTo) ? t.visibleTo.map(m => (state.av[m] || '👤') + ' ' + escapeHtml(m)).join(', ')
    : (state.av[t.visibleTo] || '👤') + ' ' + escapeHtml(t.visibleTo);

  let rightHTML = assignedTo
    ? `<div class="v2-assigned-chip" style="${isMine ? 'background:var(--accent-bg);color:var(--accent);font-weight:700;border:1px solid #c7d2fe' : 'background:#F5F6FA;color:var(--text2)'}">${isMine ? 'Du' : `${state.av[assignedTo] || '👤'} ${escapeHtml(assignedTo)}`}</div>
       <button class="v2-done-chip" onclick="event.stopPropagation();window._app.toggleDone('${t.id}','open')">✓ Erledigt</button>`
    : `<button class="v2-assign-btn" onclick="event.stopPropagation();window._app.assignTask('${t.id}','${state.curUser}','open')">Ich mach's!</button>`;

  return `<div class="v2-card" style="${isMine ? 'background:var(--accent-bg2);border-color:#c7d2fe;' : ''}" onclick="window._app.showAssignModal('${t.id}','open')">
    <div class="v2-accent" style="background:${accentColor}"></div>
    <div class="v2-card-inner">
      <div class="v2-time-col" style="min-width:28px;align-items:center;justify-content:center"><span style="font-size:16px">📋</span></div>
      <div class="v2-divider"></div>
      <div class="v2-body">
        <div class="v2-title">${safeTitle}</div>
        <div style="font-size:11px;color:var(--text3);margin-top:2px">Sichtbar: ${visLabel}</div>
        <div style="margin-top:3px"><button class="v2-cmt-btn" onclick="event.stopPropagation();window._app.showCommentsModal('${t.id}','${iso}')">💬${cmtCount > 0 ? ' ' + cmtCount : ''}</button></div>
      </div>
      <div class="v2-right">
        ${rightHTML}
        <div class="v2-edit-row">
          <button class="v2-icon-btn" onclick="event.stopPropagation();window._app.showEditModal('${t.id}')">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="#6b7280" stroke-width="1.3" stroke-linejoin="round"/></svg>
          </button>
          <button class="v2-icon-btn" onclick="event.stopPropagation();window._app.deleteTask('${t.id}','${iso}')">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5 4V2.5h4V4M5.5 6.5v4M8.5 6.5v4M3 4l.8 7.5h6.4L11 4" stroke="#6b7280" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </div>
    </div>
  </div>`;
}

// ── RENDER TODAY ──────────────────────────────────────────────
function renderTodayV2(iso, dayName) {
  const todayISO  = localISO();
  const openTodos = state.tasks.filter(t => t.openTodo && !getA(t, 'open').done).filter(t =>
    !t.visibleTo || t.visibleTo === 'all' || (Array.isArray(t.visibleTo) ? t.visibleTo.includes(state.curUser) : t.visibleTo === state.curUser)
  );
  const dayTasksRaw = state.tasks.filter(t => !t.openTodo && isVisible(t, dayName, iso)).sort((a, b) => a.time.localeCompare(b.time));
  const overdueTasks = iso === todayISO ? state.tasks.filter(t => isOverdue(t, iso)).filter(t =>
    !t.visibleTo || t.visibleTo === 'all' || (Array.isArray(t.visibleTo) ? t.visibleTo.includes(state.curUser) : t.visibleTo === state.curUser)
  ) : [];

  const allTasks  = [...dayTasksRaw];
  const mineTasks = allTasks.filter(t => {
    if (t.type === 'event') return true;
    const { assignedTo } = getA(t, iso);
    return !assignedTo || assignedTo === state.curUser;
  });
  const openTasks = allTasks.filter(t => {
    if (t.type === 'event') return true;
    return !getA(t, iso).done;
  });

  const memberFilter = state.todayMember || null;
  const applyMemberFilter = (tasks) => {
    if (!memberFilter) return tasks;
    return tasks.filter(t => {
      if (t.type === 'event') return t.attendees?.includes(memberFilter) || t.createdBy === memberFilter;
      const { assignedTo } = getA(t, iso);
      return assignedTo === memberFilter;
    });
  };

  const baseView  = state.todayView === 'mine' ? mineTasks : state.todayView === 'open' ? openTasks : allTasks;
  const viewTasks = applyMemberFilter(baseView);

  const myTasks = allTasks.filter(t => t.type === 'task' && getA(t, iso).assignedTo === state.curUser);
  const myDone  = myTasks.filter(t => getA(t, iso).done).length;
  const myTotal = myTasks.length;
  const pct     = myTotal > 0 ? Math.round(myDone / myTotal * 100) : 0;

  const isToday  = iso === todayISO;
  const nowH     = new Date().getHours();
  const greeting = isToday ? (nowH < 12 ? 'Guten Morgen' : nowH < 18 ? 'Guten Tag' : 'Guten Abend') : '';
  const dayLabel = isToday ? 'Heute' : dayName;
  const dateStr  = parseInt(iso.split('-')[2]) + '. ' + ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'][parseInt(iso.split('-')[1]) - 1];
  const avatarContent = state.curUser && state.photos?.[state.curUser]
    ? `<img src="${state.photos[state.curUser]}" style="width:40px;height:40px;border-radius:50%;object-fit:cover">`
    : (state.av[state.curUser] || '👤');

  // #6 Fortschritt pro Mitglied
  const memberProgressHTML = state.todayView === 'all' && state.members.length > 1 ? (() => {
    return `<div class="v2-member-progress">` + state.members.map(m => {
      const mTasks = allTasks.filter(t => t.type === 'task' && getA(t, iso).assignedTo === m);
      const mDone  = mTasks.filter(t => getA(t, iso).done).length;
      const mPct   = mTasks.length > 0 ? Math.round(mDone / mTasks.length * 100) : 0;
      const av     = state.photos?.[m] ? `<img src="${state.photos[m]}" style="width:22px;height:22px;border-radius:50%;object-fit:cover">` : `<span style="font-size:16px">${state.av[m] || '👤'}</span>`;
      return `<div class="v2-member-prog-item">
        <div class="v2-member-prog-av">${av}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:10px;font-weight:600;color:var(--text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escapeHtml(m)}</div>
          <div style="height:4px;background:var(--border);border-radius:2px;margin-top:2px;overflow:hidden">
            <div style="height:100%;background:#5C4EE5;border-radius:2px;width:${mPct}%;transition:width 0.4s"></div>
          </div>
        </div>
        <div style="font-size:10px;font-weight:700;color:var(--text3);flex-shrink:0">${mDone}/${mTasks.length}</div>
      </div>`;
    }).join('') + `</div>`;
  })() : '';

  let html = `<div class="v2-me-bar">
    <div class="v2-avatar">${avatarContent}</div>
    <div style="flex:1;min-width:0">
      <div class="v2-me-name">${greeting ? escapeHtml(greeting) + ', ' : ''}<strong>${escapeHtml(state.curUser || '...')}</strong></div>
      <div class="v2-progress-wrap">
        <div class="v2-progress-track"><div class="v2-progress-fill" style="width:${pct}%"></div></div>
        <span class="v2-progress-label">${myTotal > 0 ? myDone + ' / ' + myTotal + ' erledigt' : 'Keine eigenen Aufgaben'}</span>
      </div>
    </div>
    <div style="text-align:right;flex-shrink:0">
      <div style="font-size:13px;font-weight:700;color:var(--text1)">${dayLabel}</div>
      <div style="font-size:11px;color:var(--text3)">${dateStr}</div>
    </div>
  </div>`;

  // Premium-Nudge: für Free-Nutzer Upgrade anbieten, für Premium-Nutzer Status zeigen
  let premiumNudge = '';
  const isPremium = ['premium', 'granted'].includes(state._verifiedPlan);
  if (isToday) {
    if (!isPremium && state._planLastVerified > 0) {
      // Free-Nutzer: Upgrade-Hinweis (nur 1x pro Tag)
      const nudgeKey   = 'fp_nudge_' + todayISO;
      const nudgeCount = parseInt(localStorage.getItem(nudgeKey) || '0');
      if (nudgeCount < 1) {
        localStorage.setItem(nudgeKey, nudgeCount + 1);
        premiumNudge = `<div onclick="window._app.showUpgradeModal('general')" style="display:flex;align-items:center;gap:10px;background:linear-gradient(135deg,#EEF2FF,#F5F3FF);border:1px solid #c7d2fe;border-radius:12px;padding:10px 14px;margin-bottom:10px;cursor:pointer">
          <span style="font-size:20px">⭐</span>
          <div style="flex:1;min-width:0">
            <div style="font-size:12px;font-weight:700;color:#5C4EE5">famiplan Plus · ab 1,25 €/Monat</div>
            <div style="font-size:11px;color:#6b7280">Unbegrenzte Kommentare & alle Features</div>
          </div>
          <span style="font-size:16px;color:#5C4EE5">›</span>
        </div>`;
      }
    } else if (isPremium && state._planLastVerified > 0) {
      // Premium-Nutzer: Status-Badge
      const planLabel = state._verifiedPlan === 'granted' ? 'Freizugang aktiv'
        : 'famiplan Plus aktiv';
      premiumNudge = `<div style="display:flex;align-items:center;gap:10px;background:linear-gradient(135deg,#ECFDF5,#D1FAE5);border:1px solid #6EE7B7;border-radius:12px;padding:10px 14px;margin-bottom:10px">
        <span style="font-size:18px">✅</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:12px;font-weight:700;color:#059669">${planLabel}</div>
          <div style="font-size:11px;color:#6b7280">Alle Features ohne Einschränkung</div>
        </div>
      </div>`;
    }
  }

  // #7 Tages-Notiz
  const dayNote    = (state.dayNotes || {})[iso] || '';
  const notePlaceholder = isToday ? '✏️ Notiz für heute…' : '✏️ Notiz für diesen Tag…';
  html += premiumNudge;
  html += `<div class="v2-day-note">
    <textarea class="v2-day-note-input" placeholder="${notePlaceholder}" rows="1"
      oninput="window._app._dayNoteInput(this,'${iso}')"
      onfocus="this.rows=3"
      onblur="this.rows=this.value?2:1"
    >${escapeHtml(dayNote)}</textarea>
  </div>`;

  // Filter-Zeile + Timeline-Toggle
  const memberChipsHTML = state.members.length > 1 ? `
    <div class="v2-member-filter">
      <button class="v2-member-chip${!memberFilter ? ' active' : ''}" onclick="window._app.setTodayMember(null)">Alle</button>
      ${state.members.map(m => {
        const av = state.photos?.[m]
          ? `<img src="${state.photos[m]}" style="width:18px;height:18px;border-radius:50%;object-fit:cover;vertical-align:-3px;margin-right:3px">`
          : `<span style="margin-right:2px">${state.av[m] || '👤'}</span>`;
        return `<button class="v2-member-chip${memberFilter === m ? ' active' : ''}"
          onclick="window._app.setTodayMember('${escapeAttr(m)}')">
          ${av}${escapeHtml(m)}
        </button>`;
      }).join('')}
    </div>` : '';

  const tlActive = state.todayTimeline;
  html += `<div class="v2-toggle-row">
    <button class="v2-toggle${state.todayView === 'mine' ? ' active' : ''}" onclick="window._app.setTodayView('mine')">Mein Tag (${mineTasks.length})</button>
    <button class="v2-toggle${state.todayView === 'open' ? ' active' : ''}" onclick="window._app.setTodayView('open')">Offen (${openTasks.filter(t => t.type === 'task').length})</button>
    <button class="v2-toggle${state.todayView === 'all' ? ' active' : ''}" onclick="window._app.setTodayView('all')">Alle (${allTasks.length})</button>
    <button class="v2-toggle v2-toggle-tl${tlActive ? ' active' : ''}" onclick="window._app.setTodayTimeline(${!tlActive})" title="${tlActive ? 'Liste' : 'Timeline'}">
      ${tlActive ? '☰' : '⏱'}
    </button>
  </div>
  ${memberChipsHTML}
  ${memberProgressHTML}`;

  if (!viewTasks.length && !openTodos.length && !overdueTasks.length) {
    html += state.todayView === 'mine'
      ? `<div class="v2-empty"><div class="v2-empty-ico">🎉</div><div class="v2-empty-txt">Freier Tag!</div><div class="v2-empty-sub">Keine Aufgaben für dich heute.</div><button class="empty-cta" onclick="window._app.showAddModal()">＋ Aufgabe hinzufügen</button></div>`
      : `<div class="v2-empty"><div class="v2-empty-ico">🎉</div><div class="v2-empty-txt">Freier Tag!</div><div class="v2-empty-sub">Keine Aufgaben geplant.</div><button class="empty-cta" onclick="window._app.showAddModal()">＋ Aufgabe hinzufügen</button></div>`;
    if (openTodos.length) {
      html += `<div class="v2-section-title">📋 Offen (${openTodos.length})</div>`;
      html += openTodos.map(t => openTodoCardHTML(t, todayISO)).join('');
    }
    return html;
  }

  // #1 Timeline-Ansicht
  if (tlActive && viewTasks.length) {
    html += render1DayTimeline(iso);
    if (openTodos.length) {
      html += `<div class="v2-section-title" style="margin-top:8px">📋 Offen (${openTodos.length})</div>`;
      html += openTodos.map(t => openTodoCardHTML(t, todayISO)).join('');
    }
    return html;
  }

  // #3 Überfällige – eigener Bereich mit rotem Tint
  if (overdueTasks.length) {
    html += `<div class="v2-overdue-section">
      <div class="v2-section-title" style="color:#DC2626">⚠️ Nicht erledigt (${overdueTasks.length})</div>`;
    html += overdueTasks.map(t => {
      const dates      = getOverdueDates(t);
      const oldestISO  = dates.length ? dates[dates.length - 1] : (t.date || iso);
      const oldestDate = parseInt(oldestISO.split('-')[2]) + '.' + parseInt(oldestISO.split('-')[1]) + '.';
      const sinceLabel = dates.length > 1 ? `${dates.length}× offen` : `seit ${oldestDate}`;
      const cardISO    = t.recurring === 'once' ? (t.date || iso) : oldestISO;
      return `<div style="position:relative">${cardV2HTML(t, cardISO)}
        <div style="position:absolute;top:8px;right:8px;display:flex;gap:4px;align-items:center">
          <span style="background:#FEE2E2;color:#DC2626;font-size:10px;font-weight:700;padding:2px 6px;border-radius:6px;pointer-events:none">${sinceLabel}</span>
          <button onclick="event.stopPropagation();window._app.overdueMarkDone('${t.id}','${cardISO}')"
            style="background:#DC2626;color:white;font-size:10px;font-weight:700;padding:2px 8px;border-radius:6px;border:none;cursor:pointer;font-family:inherit">✓</button>
          <button onclick="event.stopPropagation();window._app.overdueSnooze('${t.id}','${cardISO}')"
            style="background:#FEE2E2;color:#DC2626;font-size:10px;font-weight:700;padding:2px 8px;border-radius:6px;border:none;cursor:pointer;font-family:inherit">→ Heute</button>
        </div>
      </div>`;
    }).join('');
    html += `</div>`;
  }

  // #5 Zeitraum-Gruppierung
  if (state.todayGrouped && viewTasks.length) {
    const sections = [
      { label: '🌅 Morgen',      from: 0,  to: 11, icon: '🌅' },
      { label: '☀️ Nachmittag', from: 12, to: 17, icon: '☀️' },
      { label: '🌙 Abend',       from: 18, to: 23, icon: '🌙' },
    ];
    const nowMin = new Date().getHours() * 60 + new Date().getMinutes();

    sections.forEach(sec => {
      const secTasks = viewTasks.filter(t => {
        const h = parseInt(t.time.split(':')[0]);
        return h >= sec.from && h <= sec.to;
      });
      if (!secTasks.length) return;

      // Sektionen bleiben standardmäßig offen; nur manuell (per Klick) zugeklappte Sektionen werden eingeklappt angezeigt
      const secKey    = `v2sec_${iso}_${sec.from}`;
      const collapsed = state._collapsedSections?.has(secKey) ?? false;

      const doneCnt  = secTasks.filter(t => getA(t, iso).done).length;
      const subLabel = doneCnt > 0 ? ` · ${doneCnt}/${secTasks.length} erledigt` : ` · ${secTasks.length}`;

      html += `<div class="v2-section-hdr${collapsed ? ' collapsed' : ''}" onclick="window._app._toggleTodaySection('${secKey}')">
        <span>${sec.label}${subLabel}</span>
        <span class="v2-section-chevron">${collapsed ? '›' : '⌄'}</span>
      </div>`;
      if (!collapsed) {
        html += `<div class="v2-section-body">${secTasks.map(t => cardV2HTML(t, iso)).join('')}</div>`;
      }
    });
  } else if (viewTasks.length) {
    html += viewTasks.map(t => cardV2HTML(t, iso)).join('');
  }

  if (openTodos.length) {
    html += `<div class="v2-section-title" style="margin-top:12px">📋 Offen (${openTodos.length})</div>`;
    html += openTodos.map(t => openTodoCardHTML(t, todayISO)).join('');
  }

  return html;
}

// ── RENDER CALENDAR ───────────────────────────────────────────
function getMonthDays(year, month) {
  const first = new Date(year, month, 1), last = new Date(year, month + 1, 0), days = [];
  let startWd = first.getDay() === 0 ? 6 : first.getDay() - 1;
  for (let i = startWd - 1; i >= 0; i--) { const d = new Date(year, month, 0 - i); days.push({ iso: localISO(d), inMonth: false }); }
  for (let d = 1; d <= last.getDate(); d++) { const dt = new Date(year, month, d); days.push({ iso: localISO(dt), inMonth: true }); }
  while (days.length % 7 !== 0) { const d = new Date(year, month + 1, days.length - last.getDate() - startWd + 1); days.push({ iso: localISO(d), inMonth: false }); }
  return days;
}

function getWeekDays(referenceISO) {
  const ref = new Date(referenceISO + 'T12:00:00'), wd = ref.getDay() === 0 ? 6 : ref.getDay() - 1;
  return Array.from({ length: 7 }, (_, i) => { const d = new Date(ref); d.setDate(ref.getDate() - wd + i); return { iso: localISO(d), name: DAYS[jd2i(d.getDay())] }; });
}

function taskDotsForDay(iso) {
  const name = dayFromISO(iso);
  return state.tasks.filter(t => !t.openTodo && isVisible(t, name, iso)).slice(0, 4).map(t => `<div class="cal-dot" style="background:${t.color}"></div>`).join('');
}

// Zoom 0: nur Farbpunkte
function taskPreviewForDay(iso) {
  const name  = dayFromISO(iso);
  const tasks = state.tasks.filter(t => !t.openTodo && isVisible(t, name, iso)).sort((a,b) => a.time.localeCompare(b.time));
  if (!tasks.length) return '';
  const dots = tasks.slice(0, 5).map(t =>
    `<div class="cal-dot" style="background:${t.color}"></div>`
  ).join('');
  const more = tasks.length > 5 ? `<div class="cal-task-more">+${tasks.length - 5}</div>` : '';
  return `<div class="cal-dots-row">${dots}${more}</div>`;
}

// Zoom 1: erste Aufgabe als Chip + restliche als Punkte
function taskPreviewZoom1(iso) {
  const name  = dayFromISO(iso);
  const tasks = state.tasks.filter(t => !t.openTodo && isVisible(t, name, iso)).sort((a,b) => a.time.localeCompare(b.time));
  if (!tasks.length) return '';
  const first = tasks[0];
  const label = (first.emoji ? first.emoji + ' ' : '') + first.title;
  const chip  = `<div class="cal-task-preview" style="background:${first.color}">${escapeHtml(label)}</div>`;
  const dots  = tasks.slice(1, 4).map(t =>
    `<div class="cal-dot" style="background:${t.color}"></div>`
  ).join('');
  const more  = tasks.length > 4 ? `<div class="cal-task-more">+${tasks.length - 4}</div>` : '';
  return chip + (dots || more ? `<div class="cal-dots-row">${dots}${more}</div>` : '');
}

// Zoom 2: alle Aufgaben als Chips mit Uhrzeit
function taskPreviewZoom2(iso) {
  const name  = dayFromISO(iso);
  const tasks = state.tasks.filter(t => !t.openTodo && isVisible(t, name, iso)).sort((a,b) => a.time.localeCompare(b.time));
  if (!tasks.length) return '';
  return tasks.slice(0, 4).map(t => {
    const time  = t.time && t.time !== '12:00' ? `<span style="opacity:0.75"> ${t.time}</span>` : '';
    const label = (t.emoji ? t.emoji + ' ' : '') + t.title;
    return `<div class="cal-task-preview cal-task-preview-z2" style="background:${t.color}">${escapeHtml(label)}${time}</div>`;
  }).join('') + (tasks.length > 4 ? `<div class="cal-task-more">+${tasks.length - 4}</div>` : '');
}

// #2 Kalenderwoche berechnen
function getKW(iso) {
  const d   = new Date(iso + 'T12:00:00');
  const thu = new Date(d); thu.setDate(d.getDate() - ((d.getDay() + 6) % 7) + 3);
  const jan4 = new Date(thu.getFullYear(), 0, 4);
  return Math.round(((thu - jan4) / 86400000 + ((jan4.getDay() + 6) % 7 - 3)) / 7) + 1;
}

// #7 Überfällige Aufgaben an einem Tag?
function hasOverdueForDay(iso) {
  const todayISO = localISO();
  if (iso >= todayISO) return false;
  const name = dayFromISO(iso);
  return state.tasks.some(t =>
    !t.openTodo && t.type !== 'event' && isVisible(t, name, iso) && !getA(t, iso).done
  );
}

function calMonthName(year, month) { return new Date(year, month, 1).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' }); }

function weekRangeLabel() {
  const days = getWeekDays(state.calSelISO);
  const [f, l] = [days[0].iso.split('-'), days[6].iso.split('-')];
  return `${parseInt(f[2])}.${parseInt(f[1])} – ${parseInt(l[2])}.${parseInt(l[1])}.${l[0]}`;
}

// ── TIMELINE HELPERS ─────────────────────────────────────────
function isoOffset(iso, days) {
  const d = new Date(iso + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return localISO(d);
}

function dayLabel(iso) {
  const todayISO = localISO();
  const name     = dayFromISO(iso);
  const num      = parseInt(iso.split('-')[2]);
  const mon      = parseInt(iso.split('-')[1]);
  if (iso === todayISO) return 'Heute';
  if (iso === isoOffset(todayISO, 1)) return 'Morgen';
  if (iso === isoOffset(todayISO, -1)) return 'Gestern';
  return name.slice(0,2) + ' ' + num + '.' + mon + '.';
}

function buildTimelineColumn(iso, minH, maxH, hourPx) {
  const dayName  = dayFromISO(iso);
  const dayTasks = state.tasks.filter(t => !t.openTodo && isVisible(t, dayName, iso)).sort((a, b) => a.time.localeCompare(b.time));

  const placed = [];
  dayTasks.forEach(t => {
    const [th, tm] = t.time.split(':').map(Number);
    const startFrac = th + tm / 60;
    const top       = (startFrac - minH) * hourPx;
    let height      = Math.max(24, hourPx * 0.75);
    if (t.endTime) {
      const [eh, em] = t.endTime.split(':').map(Number);
      const dur = (eh + em / 60) - startFrac;
      if (dur > 0) height = Math.max(24, dur * hourPx);
    }
    const overlaps  = placed.filter(p => top < p.top + p.height && top + height > p.top);
    const usedCols  = new Set(overlaps.map(p => p.col));
    let col = 0; while (usedCols.has(col)) col++;
    placed.push({ t, top, height, col, group: null });
  });

  placed.forEach((a, i) => placed.forEach((b, j) => {
    if (i >= j) return;
    if (a.top < b.top + b.height && a.top + a.height > b.top) {
      const gid = Math.min(a.group ?? i, b.group ?? j, i, j);
      a.group = gid; b.group = gid;
    }
  }));

  const groupCols = {};
  placed.forEach((p, i) => { const g = p.group ?? i; groupCols[g] = Math.max(groupCols[g] || 1, p.col + 1); });

  return placed.map(({ t, top, height, col, group }, i) => {
    const { assignedTo, done } = getA(t, iso);
    const colorOwner = t.type === 'event' ? (t.createdBy || assignedTo || null) : assignedTo;
    const color      = colorOwner ? getMemberColor(colorOwner) : '#d1d5db';
    const textColor  = colorOwner ? 'white' : '#6b7280';
    const totalCols  = groupCols[group ?? i] || 1;
    const pct        = 100 / totalCols;
    const leftPct    = pct * col;

    // #1 Typ-Hinweis + Zuweisung
    const isEvent   = t.type === 'event';
    const typeLabel = isEvent ? '📅' : '📋';
    let assignLabel = '';
    if (!isEvent) {
      if (done)           assignLabel = '✓ Erledigt';
      else if (assignedTo) assignLabel = escapeHtml(state.av[assignedTo] || '👤') + ' ' + escapeHtml(assignedTo);
      else                 assignLabel = '○ Offen';
    }

    // Kompakte Info für kleine Blöcke: alles in einer Zeile
    const timeStr  = t.time + (t.endTime ? '–'+t.endTime : '');
    const metaLine = [timeStr, assignLabel].filter(Boolean).join(' · ');

    return `<div class="tl3-event${done ? ' done' : ''}"
      style="top:${top}px;height:${height}px;left:${leftPct}%;width:${pct}%;background:${color};color:${textColor};opacity:${done?0.5:1};display:flex;align-items:center;padding:0 3px;box-sizing:border-box"
      onclick="window._app.showAssignModal('${t.id}','${iso}')">
      <div style="font-size:10px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;width:100%">${typeLabel} ${escapeHtml(t.emoji || '')} ${escapeHtml(t.title)} · ${metaLine}</div>
    </div>`;
  }).join('');
}

// ── 3-TAGE-TIMELINE (in Monatsansicht) ────────────────────────
function render3DayTimeline(centerISO) {
  const todayISO = localISO();
  const days     = [-1, 0, 1].map(offset => ({
    iso:    isoOffset(centerISO, offset),
    offset,
  }));

  // Alle Tasks der 3 Tage für Zeitbereich-Berechnung
  const allTasks = days.flatMap(({ iso }) => {
    const name = dayFromISO(iso);
    return state.tasks.filter(t => !t.openTodo && isVisible(t, name, iso));
  });

  if (!allTasks.length) return '';

  const hourPx = 56;
  const hours  = allTasks.map(t => parseInt(t.time.split(':')[0]));
  const minH   = Math.max(0, Math.min(...hours) - 1);
  const maxH   = Math.min(23, Math.max(...hours) + 2);

  // Stundenspalte links
  let hourRows = '';
  for (let h = minH; h <= maxH; h++) {
    hourRows += `<div class="tl3-hour-row" style="height:${hourPx}px">
      <span class="tl3-hour-label">${String(h).padStart(2,'0')}</span>
    </div>`;
  }

  // Jetzt-Linie
  const now   = new Date();
  const nowH  = now.getHours() + now.getMinutes() / 60;
  const nowPx = nowH >= minH && nowH <= maxH + 1 ? (nowH - minH) * hourPx : -1;

  // Ganztägige Events (allDay oder mehrtägig) – eigene Zeile oben
  const allDayEvents = days.flatMap(({ iso }) => {
    const name = dayFromISO(iso);
    return state.tasks
      .filter(t => !t.openTodo && isVisible(t, name, iso) && (t.allDay || (t.endDate && t.endDate > t.date)))
      .map(t => ({ t, iso }));
  });

  const allDayRow = allDayEvents.length ? `
    <div class="tl3-allday-row">
      <div class="tl3-allday-spacer">Ganztag</div>
      ${days.map(({ iso }) => {
        const name = dayFromISO(iso);
        const dayAllDay = state.tasks.filter(t =>
          !t.openTodo && isVisible(t, name, iso) &&
          (t.allDay || (t.endDate && t.endDate > t.date))
        );
        return `<div class="tl3-allday-col">
          ${dayAllDay.map(t => {
            const color = getMemberColor(t.createdBy || getA(t, iso).assignedTo || '');
            return `<div class="tl3-allday-event" style="background:${color || t.color}"
              onclick="window._app.showAssignModal('${t.id}','${iso}')">
              ${escapeHtml(t.emoji || '')} ${escapeHtml(t.title)}
            </div>`;
          }).join('')}
        </div>`;
      }).join('')}
    </div>` : '';

  // 3 Spalten
  const cols = days.map(({ iso, offset }) => {
    const isToday  = iso === todayISO;
    const isSel    = iso === centerISO;
    const events   = buildTimelineColumn(iso, minH, maxH, hourPx);
    const nowLine  = isToday && nowPx >= 0
      ? `<div class="tl3-now-line" style="top:${nowPx}px"></div>`
      : '';
    return `<div class="tl3-col${isSel ? ' selected' : ''}${isToday ? ' today' : ''}"
      onclick="window._app._calTimeSlotTap(event,'${iso}',${minH},${hourPx})"
      style="height:${(maxH - minH + 1) * hourPx}px">
      ${nowLine}${events}
      ${!events ? `<div class="tl3-empty-col">＋ Eintragen</div>` : ''}
    </div>`;
  }).join('');

  // Tag-Header
  const headers = days.map(({ iso }) => {
    const isToday = iso === todayISO;
    const isSel   = iso === centerISO;
    const hInfo   = getHolidayInfo(iso);
    const hChip   = hInfo
      ? `<div class="tl3-holiday-chip ${hInfo.type}">${hInfo.name}</div>`
      : '';
    return `<div class="tl3-col-hdr${isSel ? ' selected' : ''}${isToday ? ' today' : ''}"
      onclick="window._app.calSelectDay('${iso}')">
      ${dayLabel(iso)}${hChip}
    </div>`;
  }).join('');

  const showHeuteBtn = centerISO !== localISO();
  return `<div class="tl3-wrap">
    <div class="tl3-header">
      <div class="tl3-hour-spacer">${showHeuteBtn ? `<button class="tl3-heute-btn" onclick="window._app.calGoToday()">↩</button>` : ''}</div>
      ${headers}
    </div>
    ${allDayRow}
    <div class="tl3-body">
      <div class="tl3-hours">${hourRows}</div>
      <div class="tl3-cols">${cols}</div>
    </div>
  </div>`;
}

// ── 1-TAGES-TIMELINE (für Monatsansicht) ─────────────────────
function render1DayTimeline(iso) {
  const todayISO = localISO();
  const dayName  = dayFromISO(iso);
  const dayTasks = state.tasks.filter(t => !t.openTodo && isVisible(t, dayName, iso) && !t.allDay);
  const allDayTasks = state.tasks.filter(t => !t.openTodo && isVisible(t, dayName, iso) && (t.allDay || (t.endDate && t.endDate > t.date)));

  if (!dayTasks.length && !allDayTasks.length) return '';

  const hourPx = 56;
  const hours  = dayTasks.map(t => parseInt(t.time.split(':')[0]));
  const minH   = dayTasks.length ? Math.max(0, Math.min(...hours) - 1) : 7;
  const maxH   = dayTasks.length ? Math.min(23, Math.max(...hours) + 2) : 21;

  let hourRows = '';
  for (let h = minH; h <= maxH; h++) {
    hourRows += `<div class="tl3-hour-row" style="height:${hourPx}px">
      <span class="tl3-hour-label">${String(h).padStart(2,'0')}</span>
    </div>`;
  }

  const now   = new Date();
  const nowH  = now.getHours() + now.getMinutes() / 60;
  const nowPx = iso === todayISO && nowH >= minH && nowH <= maxH + 1 ? (nowH - minH) * hourPx : -1;

  const allDayRow = allDayTasks.length ? `
    <div class="tl3-allday-row">
      <div class="tl3-allday-spacer">Ganztag</div>
      <div class="tl3-allday-col" style="flex:1">
        ${allDayTasks.map(t => `<div class="tl3-allday-event" style="background:${t.color}"
          onclick="window._app.showAssignModal('${t.id}','${iso}')">
          ${escapeHtml(t.emoji || '')} ${escapeHtml(t.title)}
        </div>`).join('')}
      </div>
    </div>` : '';

  const events  = buildTimelineColumn(iso, minH, maxH, hourPx);
  const nowLine = nowPx >= 0 ? `<div class="tl3-now-line" style="top:${nowPx}px"></div>` : '';
  const hInfo   = getHolidayInfo(iso);
  const hChip   = hInfo ? `<div class="tl3-holiday-chip ${hInfo.type}">${hInfo.name}</div>` : '';
  const isToday = iso === todayISO;

  const showHeuteBtn = iso !== todayISO;
  return `<div class="tl3-wrap tl3-single">
    <div class="tl3-header">
      <div class="tl3-hour-spacer">${showHeuteBtn ? `<button class="tl3-heute-btn" onclick="window._app.calGoToday()">↩</button>` : ''}</div>
      <div class="tl3-col-hdr selected${isToday ? ' today' : ''}" style="flex:1">
        ${dayLabel(iso)}${hChip}
      </div>
    </div>
    ${allDayRow}
    <div class="tl3-body">
      <div class="tl3-hours">${hourRows}</div>
      <div class="tl3-cols">
        <div class="tl3-col selected${isToday ? ' today' : ''}"
          onclick="window._app._calTimeSlotTap(event,'${iso}',${minH},${hourPx})"
          style="height:${(maxH - minH + 1) * hourPx}px;flex:1">
          ${nowLine}${events}
          ${!events ? `<div class="tl3-empty-col">＋ Eintragen</div>` : ''}
        </div>
      </div>
    </div>
  </div>`;
}

// ── EINZEL-TIMELINE (für 7-Tage-Ansicht, bleibt erhalten) ─────
function renderTimeline(iso) {
  const dayName  = dayFromISO(iso);
  const dayTasks = state.tasks.filter(t => !t.openTodo && isVisible(t, dayName, iso)).sort((a, b) => a.time.localeCompare(b.time));
  if (!dayTasks.length) return '';

  const todayISO = localISO();
  const label    = iso === todayISO ? 'Heute' : dayName + ', ' + parseInt(iso.split('-')[2]) + '.' + parseInt(iso.split('-')[1]) + '.';

  if (state.calDayView === 'list') {
    return `<div class="timeline-wrap"><div class="timeline-header"><div class="timeline-title">${label}</div><button class="timeline-toggle" onclick="window._app.setDayView('timeline')">⏱ Zeitstrahl</button></div>${dayTasks.map(t => cardV2HTML(t, iso)).join('')}</div>`;
  }

  const hours = dayTasks.map(t => parseInt(t.time.split(':')[0]));
  const minH  = Math.max(0, Math.min(...hours) - 1), maxH = Math.min(23, Math.max(...hours) + 2);
  const hourPx = 60;

  const assignees  = [...new Set(dayTasks.map(t => getA(t, iso).assignedTo).filter(Boolean))];
  const legendHTML = assignees.map(m => `<div class="tl-legend-item"><div class="tl-legend-dot" style="background:${getMemberColor(m)}"></div>${state.av[m] || '👤'} ${m}</div>`).join('') +
    (dayTasks.some(t => t.type !== 'event' && !getA(t, iso).assignedTo) ? '<div class="tl-legend-item"><div class="tl-legend-dot" style="background:#d1d5db"></div>Offen</div>' : '');

  let rows = '';
  for (let h = minH; h <= maxH; h++) rows += `<div class="tl-hour-row" style="height:${hourPx}px"><span class="tl-hour-label">${String(h).padStart(2,'0')}:00</span></div>`;

  let nowLine = '';
  if (iso === todayISO) {
    const now = new Date(), nowH = now.getHours() + now.getMinutes() / 60;
    if (nowH >= minH && nowH <= maxH + 1) nowLine = `<div class="tl-now-line" style="top:${(nowH - minH) * hourPx}px"><div class="tl-now-dot"></div></div>`;
  }

  const placed = [];
  dayTasks.forEach(t => {
    const [th, tm] = t.time.split(':').map(Number);
    const startFrac = th + tm / 60, top = (startFrac - minH) * hourPx;
    let height = Math.max(28, hourPx * 0.8);
    if (t.endTime) { const [eh, em] = t.endTime.split(':').map(Number); const dur = (eh + em / 60) - startFrac; if (dur > 0) height = Math.max(28, dur * hourPx); }
    const overlaps = placed.filter(p => top < p.top + p.height && top + height > p.top);
    const usedCols = new Set(overlaps.map(p => p.col));
    let col = 0; while (usedCols.has(col)) col++;
    placed.push({ t, top, height, col, group: null });
  });

  placed.forEach((a, i) => placed.forEach((b, j) => {
    if (i >= j) return;
    if (a.top < b.top + b.height && a.top + a.height > b.top) { const gid = Math.min(a.group ?? i, b.group ?? j, i, j); a.group = gid; b.group = gid; }
  }));

  const groupCols = {};
  placed.forEach((p, i) => { const g = p.group ?? i; groupCols[g] = Math.max(groupCols[g] || 1, p.col + 1); });

  const eventHTML = placed.map(({ t, top, height, col, group }, i) => {
    const { assignedTo, done } = getA(t, iso);
    const colorOwner = t.type === 'event' ? (t.createdBy || assignedTo || null) : assignedTo;
    const color = colorOwner ? getMemberColor(colorOwner) : '#d1d5db';
    const textColor = colorOwner ? 'white' : '#6b7280';
    const totalCols = groupCols[group ?? i] || 1;
    const w    = totalCols === 1 ? 'calc(100% - 68px)' : `calc((100% - 68px - ${(totalCols-1)*4}px) / ${totalCols})`;
    const left = `calc(52px + (100% - 68px - ${(totalCols-1)*4}px) / ${totalCols} * ${col} + ${col*4}px)`;
    return `<div class="tl-event${done ? ' done' : ''}" style="top:${top}px;height:${height}px;width:${w};left:${left};right:auto;background:${color};color:${textColor};opacity:${done?0.5:1}" onclick="window._app.showAssignModal('${t.id}','${iso}')">
      <div class="tl-event-title">${escapeHtml(t.title)}</div>
      <div class="tl-event-meta">${t.time}${assignedTo ? ' · ' + assignedTo : ''}</div>
    </div>`;
  }).join('');

  return `<div class="timeline-wrap">
    <div class="timeline-header"><div class="timeline-title">${label}</div><button class="timeline-toggle" onclick="window._app.setDayView('list')">☰ Liste</button></div>
    ${legendHTML ? `<div class="timeline-legend">${legendHTML}</div>` : ''}
    <div class="timeline-body" style="height:${(maxH-minH+1)*hourPx+16}px">${rows}${nowLine}${eventHTML}</div>
  </div>`;
}

export function renderCalendar() {
  const { calView, calYear, calMonth, calSelISO } = state;
  const todayISO = localISO();
  const WDLBLS   = ['Mo','Di','Mi','Do','Fr','Sa','So'];

  const todayDate = new Date(todayISO + 'T12:00:00');
  const isOnToday_month = calSelISO === todayISO;
  const isOnToday_week  = (() => { const wd = getWeekDays(calSelISO); return wd.some(d => d.iso === todayISO); })();
  const isOnToday_7tage = calSelISO === todayISO;
  const calHeuteBtn = (show) => show ? '' : `<button class="cal-heute-btn" onclick="window._app.calGoToday()">↩ Heute</button>`;

  const navBtns = calView === '7tage'
    ? `<div class="cal-header"><div class="cal-month">7 Tage</div>${calHeuteBtn(isOnToday_7tage)}</div>`
    : `<div class="cal-header"><button class="cal-nav" onclick="window._app.calPrev()">‹</button><div class="cal-month">${calView === 'month' ? calMonthName(calYear, calMonth) : weekRangeLabel()}</div>${calHeuteBtn(calView === 'month' ? isOnToday_month : isOnToday_week)}<button class="cal-nav" onclick="window._app.calNext()">›</button></div>`;

  let out = navBtns + `<div class="cal-view-toggle">
    <button class="cal-view-btn${calView==='month'?' active':''}" onclick="window._app.setCalView('month')">Monat</button>
    <button class="cal-view-btn${calView==='week'?' active':''}" onclick="window._app.setCalView('week')">Woche</button>
    <button class="cal-view-btn${calView==='7tage'?' active':''}" onclick="window._app.setCalView('7tage')">7 Tage</button>
  </div>`;
  // Woche-Ansicht: Nav-Header zeigt Wochenbereich
  // isOnToday_week bereits berechnet oben

  if (calView === 'month') {
    const calZoom = state.calZoom || 0;
    const allDays = getMonthDays(calYear, calMonth);
    const allWeeks = [];
    for (let i = 0; i < allDays.length; i += 7) allWeeks.push(allDays.slice(i, i + 7));

    // Anzahl sichtbarer Wochen je Zoom-Stufe
    let weeks = allWeeks;
    if (calZoom >= 1) {
      const selWeekIdx = allWeeks.findIndex(w => w.some(d => d.iso === calSelISO));
      const idx  = selWeekIdx >= 0 ? selWeekIdx : Math.floor(allWeeks.length / 2);
      const span = calZoom === 1 ? 2 : 1; // Zoom1: 3 Wochen, Zoom2: 2 Wochen (je nach Rand)
      const from = Math.max(0, idx - (calZoom === 2 ? 0 : 1));
      const to   = Math.min(allWeeks.length - 1, from + span);
      weeks = allWeeks.slice(from, to + 1);
    }

    const wdRow = `<div class="weekday-lbl cal-kw-hdr">KW</div>` +
      WDLBLS.map(w => `<div class="weekday-lbl">${w}</div>`).join('');

    const cellH  = calZoom === 0 ? 46 : calZoom === 1 ? 72 : 100;

    const daysCells = weeks.map(week => {
      const firstIn = week.find(d => d.inMonth) || week[0];
      const kw      = getKW(firstIn.iso);
      const kwCell  = `<div class="cal-kw-cell" style="min-height:${cellH}px">${kw}</div>`;
      return kwCell + week.map(({ iso, inMonth }) => {
        const num     = parseInt(iso.split('-')[2]);
        const hInfo   = inMonth ? getHolidayInfo(iso) : null;
        const hDot    = hInfo ? `<span class="cal-holiday-dot ${hInfo.type}" title="${hInfo.name}"></span>` : '';
        const overdue = inMonth ? hasOverdueForDay(iso) : false;
        const preview = !inMonth ? '' :
          calZoom === 0 ? taskPreviewForDay(iso) :
          calZoom === 1 ? taskPreviewZoom1(iso)  :
                          taskPreviewZoom2(iso);
        return `<div class="cal-day${calZoom>=1?' cal-day-zoom':''}${!inMonth?' other-month':''}${iso===todayISO?' today':''}${iso===calSelISO?' selected':''}"
          style="min-height:${cellH}px"
          onclick="window._app.calDayTap('${iso}')"
          ontouchstart="window._app._calLpStart(event,'${iso}')"
          ontouchend="window._app._calLpEnd()"
          ontouchmove="window._app._calLpEnd()">
          <div class="cal-day-num${hInfo?' has-holiday':''}${overdue?' cal-overdue':''}">
            ${num}${overdue ? '<span class="cal-overdue-dot"></span>' : ''}
          </div>
          <div class="cal-preview">${preview}${hDot}</div>
        </div>`;
      }).join('');
    }).join('');

    // Zoom-Buttons (Desktop + Mobile)
    const zoomBtns = `<div class="cal-zoom-btns">
      <button class="cal-zoom-btn${calZoom === 0 ? ' disabled' : ''}" onclick="window._app.setCalZoom(${calZoom - 1})" title="Rauszoomen">−</button>
      <span class="cal-zoom-label">${calZoom === 0 ? 'Monat' : calZoom === 1 ? '3 Wochen' : '2 Wochen'}</span>
      <button class="cal-zoom-btn${calZoom === 2 ? ' disabled' : ''}" onclick="window._app.setCalZoom(${calZoom + 1})" title="Reinzoomen">＋</button>
    </div>`;

    out += zoomBtns;
    out += `<div class="month-grid" id="cal-month-grid">
      <div class="weekday-row" style="grid-template-columns:22px repeat(7,1fr)">${wdRow}</div>
      <div class="days-grid" style="grid-template-columns:22px repeat(7,1fr)">${daysCells}</div>
    </div>`;
    // Gesture-Listener nach dem DOM-Update registrieren
    requestAnimationFrame(() => window._app._calInitGesture && window._app._calInitGesture());
    // Feiertags-Banner
    const selHoliday = getHolidayInfo(calSelISO);
    if (selHoliday) {
      out += `<div class="cal-holiday-bar ${selHoliday.type}">
        ${selHoliday.type === 'feiertag' ? '🟡' : '🟢'} ${selHoliday.name}
      </div>`;
    }
    // Timeline nur wenn explizit geöffnet (state.calShowTimeline)
    if (state.calShowTimeline) {
      out += render1DayTimeline(calSelISO);
      // Scroll zur frühesten Aufgabe
      requestAnimationFrame(() => {
        const tl = document.querySelector('.tl3-wrap');
        if (!tl) return;
        tl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        // Innerhalb der Timeline zur frühesten Aufgabe scrollen
        const body = tl.querySelector('.tl3-body');
        const firstEvent = tl.querySelector('.tl3-event');
        if (body && firstEvent) {
          const offset = firstEvent.offsetTop;
          body.scrollTop = Math.max(0, offset - 40);
        }
      });
    }

  } else if (calView === 'week') {
    // Horizontale 7-Spalten-Zeitachse (Google/Apple Calendar Stil)
    const weekDays = getWeekDays(calSelISO);
    const allWeekTasks = weekDays.flatMap(({ iso, name }) =>
      state.tasks.filter(t => !t.openTodo && isVisible(t, name, iso))
    );

    // #4: Immer Stundenraster zeigen – auch bei leerer Woche
    {
      const hourPx = 52;
      const hours  = allWeekTasks.map(t => parseInt(t.time.split(':')[0]));
      const minH   = allWeekTasks.length ? Math.max(0, Math.min(...hours) - 1) : 7;
      const maxH   = allWeekTasks.length ? Math.min(23, Math.max(...hours) + 2) : 21;
      const totalH = (maxH - minH + 1) * hourPx;

      // Jetzt-Linie Position
      const now    = new Date();
      const nowH   = now.getHours() + now.getMinutes() / 60;
      const nowPx  = nowH >= minH && nowH <= maxH + 1 ? (nowH - minH) * hourPx : -1;

      // Tag-Header
      const hdrCells = weekDays.map(({ iso, name }) => {
        const num     = parseInt(iso.split('-')[2]);
        const isToday = iso === todayISO;
        const isSel   = iso === calSelISO;
        const hInfo = getHolidayInfo(iso);
        const hChip = hInfo
          ? `<div class="tl3-holiday-chip ${hInfo.type}" style="font-size:8px;padding:1px 3px;margin-top:2px">${hInfo.name}</div>`
          : '';
        return `<div class="wk7-col-hdr${isToday ? ' today' : ''}${isSel ? ' selected' : ''}" onclick="window._app.calSelectDay('${iso}')">
          <span class="wk7-hdr-name">${name.slice(0,2)}</span>
          <span class="wk7-hdr-num${isToday ? ' today' : ''}">${num}</span>
          ${hChip}
        </div>`;
      }).join('');

      // 7 Spalten mit Events
      const colsHTML = weekDays.map(({ iso, name }) => {
        const isToday = iso === todayISO;
        const events  = buildTimelineColumn(iso, minH, maxH, hourPx);
        const nowLine = isToday && nowPx >= 0
          ? `<div class="tl3-now-line" style="top:${nowPx}px"></div>` : '';
        return `<div class="wk7-col${isToday ? ' today' : ''}" style="height:${totalH}px"
          onclick="window._app._calTimeSlotTap(event,'${iso}',${minH},${hourPx})">
          ${nowLine}${events}
        </div>`;
      }).join('');

      // Stunden links
      let hoursHTML = '';
      for (let h = minH; h <= maxH; h++) {
        hoursHTML += `<div class="tl3-hour-row" style="height:${hourPx}px">
          <span class="tl3-hour-label">${String(h).padStart(2,'0')}</span>
        </div>`;
      }

      out += `<div class="wk7-wrap">
        <div class="wk7-header">
          <div class="wk7-hour-spacer"></div>
          ${hdrCells}
        </div>
        <div class="wk7-body" id="wk7-body">
          <div class="tl3-hours">${hoursHTML}</div>
          <div class="wk7-cols">${colsHTML}</div>
        </div>
      </div>`;
      // #5: Zur aktuellen Zeit scrollen
      if (nowPx >= 0) {
        requestAnimationFrame(() => {
          const body = document.getElementById('wk7-body');
          if (body) body.scrollTop = Math.max(0, nowPx - 80);
        });
      }
    }

  } else {
    // 7-Tage
    const todayDay = DAYS[jd2i(new Date().getDay())];
    const days7 = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return { iso: localISO(d), name: DAYS[jd2i(d.getDay())] }; });
    const todayTasks = state.tasks.filter(t => isVisible(t, todayDay, todayISO));
    const doneCnt    = todayTasks.filter(t => t.type === 'task' && getA(t, todayISO).done).length;
    const unopen     = todayTasks.filter(t => t.type === 'task' && !getA(t, todayISO).done).length;

    out += `<div style="display:flex;gap:8px;margin-bottom:16px">
      <div style="flex:1;background:var(--surface);border-radius:12px;padding:12px 14px;border:1px solid var(--border);display:flex;flex-direction:column;gap:2px">
        <div style="font-size:22px;font-weight:800;color:#5C4EE5">${unopen}</div>
        <div style="font-size:11px;color:var(--text2);font-weight:500">Heute offen</div>
      </div>
      <div style="flex:1;background:var(--surface);border-radius:12px;padding:12px 14px;border:1px solid var(--border);display:flex;flex-direction:column;gap:2px">
        <div style="font-size:22px;font-weight:800;color:#059669">${doneCnt}</div>
        <div style="font-size:11px;color:var(--text2);font-weight:500">Heute erledigt</div>
      </div>
    </div>`;

    days7.forEach(({ iso, name: dayName }) => {
      const dt = state.tasks.filter(t => isVisible(t, dayName, iso) && (t.type === 'event' || !getA(t, iso).done) && (t.recurring === 'once' || iso >= todayISO)).sort((a, b) => a.time.localeCompare(b.time));
      if (!dt.length) return;
      const rows = dt.map(t => {
        const { assignedTo, done } = getA(t, iso);
        const isMine = assignedTo === state.curUser;
        const st = t.type === 'event' ? `<span class="badge b-event">Termin</span>`
          : done ? `<span class="ov-done">✓ Erledigt</span>`
          : assignedTo ? `<span class="ov-yes" style="${isMine ? 'color:#5C4EE5;font-weight:700;background:#EDE9FE;padding:2px 7px;border-radius:4px;border:1px solid #c7d2fe' : ''}">✓ ${isMine ? 'Du' : escapeHtml(assignedTo)}</span>`
          : `<button class="ov-assign-btn" onclick="event.stopPropagation();window._app.showAssignModal('${t.id}','${iso}')">Ich mach's!</button>`;
        return `<div class="ov-row" onclick="window._app.showOvTaskMenu('${t.id}','${iso}')"><div class="ov-dot" style="background:${t.color}"></div><span class="ov-name${done?' done-txt':''}">${escapeHtml(t.title)}</span>${st}</div>`;
      }).join('');
      const dayNum   = parseInt(iso.split('-')[2]), dayMonth = parseInt(iso.split('-')[1]);
      const dayLabel = dayName === todayDay ? 'Heute' : dayName;
      const dateStr  = dayNum + '. ' + ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'][dayMonth - 1];
      out += `<div class="ov-card"><div class="ov-day${dayName===todayDay?' today':''}">${dayLabel}<span style="font-weight:500;opacity:0.6;margin-left:6px;text-transform:none;letter-spacing:0">${dateStr}</span></div>${rows}</div>`;
    });

    out += `<div style="text-align:center;padding:16px 0 8px;display:flex;gap:16px;justify-content:center">
      <a href="/impressum.html" style="font-size:12px;color:var(--text3);text-decoration:none;font-weight:500">Impressum</a>
      <a href="/datenschutz.html" style="font-size:12px;color:var(--text3);text-decoration:none;font-weight:500">Datenschutz</a>
      <span style="font-size:12px;color:#c4c9d4">v1.0 · famiplan</span>
    </div>`;
  }
  return out;
}

// ── RENDER BOARD (HOME) ───────────────────────────────────────
export function renderBoard() {
  boardMarkSeen();
  const todayISO  = localISO();
  const todayDay  = DAYS[jd2i(new Date().getDay())];
  const todayAll  = state.tasks.filter(t => !t.openTodo && isVisible(t, todayDay, todayISO)).sort((a, b) => a.time.localeCompare(b.time));
  const todayOpen = todayAll.filter(t => t.type === 'task' ? !getA(t, todayISO).done : true);
  const todayDone = todayAll.filter(t => t.type === 'task' && getA(t, todayISO).done).length;
  const todayTotal = todayAll.filter(t => t.type === 'task').length;
  const pct        = todayTotal > 0 ? Math.round(todayDone / todayTotal * 100) : 0;
  const allDone    = todayTotal > 0 && todayDone === todayTotal;
  const now        = new Date();
  const nowH       = now.getHours();
  const greeting   = nowH < 12 ? 'Guten Morgen' : nowH < 18 ? 'Guten Tag' : 'Guten Abend';
  const dateLabel  = now.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });

  // #1 Nächster Termin mit Countdown
  const nowMin   = nowH * 60 + now.getMinutes();
  const nextTask = todayOpen.find(t => {
    const [h, m] = t.time.split(':').map(Number);
    return h * 60 + m >= nowMin;
  });
  const nextCountdown = nextTask ? (() => {
    const [h, m] = nextTask.time.split(':').map(Number);
    const diff   = h * 60 + m - nowMin;
    if (diff === 0) return 'Jetzt';
    if (diff < 60)  return `in ${diff} Min.`;
    const hrs = Math.floor(diff / 60), mins = diff % 60;
    return `in ${hrs} Std.${mins ? ' ' + mins + ' Min.' : ''}`;
  })() : null;

  // #4 Erfolgs-Karte wenn alle erledigt
  let html = '';
  if (allDone) {
    html += `<div class="board-success-card">
      <div class="board-success-confetti">🎉</div>
      <div style="font-size:15px;font-weight:800;color:#059669">Alle erledigt!</div>
      <div style="font-size:12px;color:#6b7280;margin-top:2px">Gut gemacht, ${escapeHtml(state.curUser || 'du')}! ${todayTotal} von ${todayTotal} Aufgaben geschafft.</div>
    </div>`;
  }

  html += `<div class="board-banner">
    <div style="display:flex;align-items:flex-start;justify-content:space-between">
      <div>
        <div class="board-banner-greeting">${greeting}</div>
        <div class="board-banner-date">${dateLabel}</div>
      </div>
      ${nextTask ? `<div class="board-next-badge" onclick="window._app.setTab('today')">
        <div class="board-next-time">${nextTask.time}</div>
        <div class="board-next-countdown">${nextCountdown}</div>
      </div>` : ''}
    </div>`;

  if (todayTotal > 0) {
    html += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:${todayOpen.length ? '10px' : '0'}">
      <div style="flex:1;height:5px;background:rgba(255,255,255,0.2);border-radius:3px;overflow:hidden">
        <div style="height:100%;background:white;border-radius:3px;width:${pct}%;transition:width 0.5s"></div>
      </div>
      <span style="font-size:11px;color:rgba(255,255,255,0.75);white-space:nowrap">${todayDone} / ${todayTotal} erledigt</span>
    </div>`;
  }

  const next3 = todayOpen.slice(0, 3);
  if (next3.length) {
    html += `<div style="display:flex;flex-direction:column;gap:5px">`;
    next3.forEach(t => {
      const { assignedTo } = getA(t, todayISO);
      const [h, m]  = t.time.split(':').map(Number);
      const diffMin = h * 60 + m - nowMin;
      const isNow   = diffMin >= 0 && diffMin <= 15;
      const av = assignedTo ? (state.av[assignedTo] || '👤') : null;
      html += `<div onclick="window._app.setTab('today')" style="display:flex;align-items:center;gap:8px;background:rgba(255,255,255,${isNow?'0.2':'0.12'});border-radius:10px;padding:8px 10px;cursor:pointer;${isNow?'box-shadow:0 0 0 1.5px rgba(255,255,255,0.4)':''}">
        <div style="width:4px;height:28px;border-radius:2px;background:${t.color};flex-shrink:0"></div>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:600;color:white;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escapeHtml(t.title)}</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.6)">${t.time}</div>
        </div>
        ${t.type !== 'event' ? (assignedTo ? `<div style="font-size:11px;font-weight:600;color:rgba(255,255,255,0.85);text-align:right;flex-shrink:0">${av} ${escapeHtml(assignedTo)}</div>` : '<div style="font-size:10px;color:rgba(255,255,255,0.45);flex-shrink:0">○ Offen</div>') : ''}
        ${isNow ? '<div style="font-size:10px;font-weight:700;color:white;background:rgba(255,255,255,0.2);border-radius:5px;padding:2px 6px;flex-shrink:0">Jetzt</div>' : ''}
      </div>`;
    });
    html += '</div>';
    if (todayOpen.length > 3) html += `<div onclick="window._app.setTab('today')" style="margin-top:8px;text-align:center;font-size:12px;font-weight:600;color:rgba(255,255,255,0.65);cursor:pointer">+ ${todayOpen.length - 3} weitere → Tag-Ansicht</div>`;
  } else if (todayTotal === 0) {
    html += `<div style="font-size:13px;color:rgba(255,255,255,0.65)">Heute nichts geplant 🎉</div>`;
  } else if (!allDone) {
    html += `<div style="font-size:13px;color:rgba(255,255,255,0.65)">Alle Aufgaben erledigt 🎉</div>`;
  }
  html += '</div>';

  // #2 Schnellzugriff-Chips
  html += `<div class="board-quick-actions">
    <button class="board-qa-btn" onclick="window._app.showAddModal && window._app.showAddModal()">＋ Aufgabe</button>
    <button class="board-qa-btn" onclick="window._app.showShopAddModal()">🛒 Einkauf</button>
    <button class="board-qa-btn" onclick="window._app._quickAddEvent()">📅 Termin</button>
    <button class="board-qa-btn" onclick="window._app.setTab('meals')">🍽 Mahlzeit</button>
  </div>`;

  // #7 Kommende Termine Widget – zeitlich sortiert, erledigte überspringen
  const upcomingAll = [];
  for (let d = 1; d <= 14; d++) {
    const dd  = new Date(); dd.setDate(dd.getDate() + d);
    const iso = dd.toISOString().split('T')[0];
    const day = DAYS[jd2i(dd.getDay())];
    state.tasks
      .filter(t => !t.openTodo && isVisible(t, day, iso))
      .filter(t => t.type === 'task' ? !getA(t, iso).done : true) // erledigte überspringen
      .sort((a, b) => a.time.localeCompare(b.time))
      .forEach(t => upcomingAll.push({ t, iso, dd }));
  }
  // Zeitlich sortieren: Datum + Uhrzeit
  upcomingAll.sort((a, b) => {
    const aKey = a.iso + 'T' + a.t.time;
    const bKey = b.iso + 'T' + b.t.time;
    return aKey.localeCompare(bKey);
  });
  // Deduplizieren: gleiche taskId+iso nur einmal
  const seen = new Set();
  const upcomingTasks = upcomingAll.filter(({ t, iso }) => {
    const k = t.id + '_' + iso;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  }).slice(0, 4);

  if (upcomingTasks.length) {
    html += `<div class="board-upcoming">
      <div class="board-section-title">📅 Demnächst</div>
      <div style="display:flex;flex-direction:column;gap:6px">`;
    upcomingTasks.forEach(({ t, iso, dd }) => {
      const dayLabel   = dd.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' });
      const { assignedTo } = getA(t, iso);
      const av = assignedTo ? (state.av[assignedTo] || '👤') : null;
      const upcDayName = DAYS[jd2i(dd.getDay())];
      html += `<div class="board-upcoming-row" onclick="window._app.setDay('${upcDayName}','${iso}')">
        <div style="width:3px;height:100%;min-height:28px;border-radius:2px;background:${t.color};flex-shrink:0"></div>
        <div style="flex:1;min-width:0">
          <div style="font-size:12px;font-weight:600;color:var(--text1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escapeHtml(t.emoji || '')} ${escapeHtml(t.title)}</div>
          <div style="font-size:11px;color:var(--text3)">${dayLabel} · ${t.time}</div>
        </div>
        ${t.type !== 'event' ? (assignedTo ? `<div style="font-size:11px;font-weight:600;color:var(--text2);text-align:right;flex-shrink:0">${av} ${escapeHtml(assignedTo)}</div>` : `<div style="font-size:10px;color:var(--text4);flex-shrink:0">○ Offen</div>`) : ''}
      </div>`;
    });
    html += `</div></div>`;
  }

  // Offene To-Dos
  const boardOpenTodos = state.tasks.filter(t => t.openTodo && !getA(t, 'open').done).filter(t =>
    !t.visibleTo || t.visibleTo === 'all' || (Array.isArray(t.visibleTo) ? t.visibleTo.includes(state.curUser) : t.visibleTo === state.curUser)
  );
  if (boardOpenTodos.length) {
    html += `<div class="board-section-title" style="margin-top:4px">📋 Offen (${boardOpenTodos.length})</div>`;
    boardOpenTodos.forEach(t => {
      // #5 Inline-Erledigen per Longpress auf To-Do
      const id = t.id;
      html += `<div ontouchstart="window._app._todoLpStart(event,'${id}')" ontouchend="window._app._todoLpEnd()" ontouchmove="window._app._todoLpEnd()">
        ${openTodoCardHTML(t, todayISO)}
      </div>`;
    });
  }

  // Board-Posts
  html += `<button class="board-new-btn" onclick="window._app.showBoardNewModal()">📌 Etwas teilen…</button>`;
  const posts = Object.entries(state.boardPosts).sort((a, b) => b[1].ts - a[1].ts);
  if (!posts.length) {
    html += `<div style="text-align:center;padding:32px 20px;color:var(--text3)"><div style="font-size:36px;margin-bottom:8px">📌</div><div style="font-size:14px;font-weight:600">Noch keine Beiträge</div><div style="font-size:13px;margin-top:4px">Teile News, Fotos oder Infos mit deiner Familie</div></div>`;
  } else {
    posts.forEach(([postId, post]) => {
      const uid        = state.currentAuthUser?.uid;
      const reacs      = post.reactions || {};
      const myReac     = uid ? reacs[uid] : null;
      const reacCounts = {};
      Object.values(reacs).forEach(e => { reacCounts[e] = (reacCounts[e] || 0) + 1; });

      // #6 Nur genutzte Reaktionen + Picker-Button
      const usedReacs = BOARD_REACTIONS.filter(e => (reacCounts[e] || 0) > 0 || myReac === e);
      const reacBtns  = usedReacs.map(e => {
        const cnt  = reacCounts[e] || 0;
        const mine = myReac === e;
        return `<button class="board-reaction-btn${mine ? ' mine' : ''}" onclick="window._app.boardToggleReaction('${postId}','${e}')">
          ${e}${cnt > 0 ? `<span class="board-reaction-count">${cnt}</span>` : ''}
        </button>`;
      }).join('');
      const pickerBtn = `<button class="board-reaction-add" onclick="window._app._boardReactionPicker('${postId}')">＋ 😊</button>`;

      const canDel = post.author === state.curUser || state.currentAuthUser?.uid;

      // Replies
      const replies = Object.entries(post.replies || {}).sort((a, b) => a[1].ts - b[1].ts);
      const replyCnt = replies.length;
      const repliesOpen = window._boardOpenReplies?.has(postId);

      const replyLabel = replyCnt > 0
        ? `💬 ${replyCnt} Antwort${replyCnt === 1 ? '' : 'en'}`
        : '💬 Antworten';

      let repliesSection = '';
      if (repliesOpen) {
        const replyItems = replies.map(([rid, r]) => {
          const canDelR = r.author === state.curUser || state.currentAuthUser?.uid;
          return `<div class="board-reply">
            <div class="board-reply-av">${state.photos?.[r.author] ? `<img src="${state.photos[r.author]}">` : (state.av[r.author] || '👤')}</div>
            <div class="board-reply-bubble">
              <span class="board-reply-author">${escapeHtml(r.author)}</span>
              <span class="board-reply-text">${escapeHtml(r.text)}</span>
              <span class="board-reply-time">${boardTimeAgo(r.ts)}</span>
            </div>
            ${canDelR ? `<button class="board-reply-del" onclick="window._app.boardDeleteReply('${postId}','${rid}')">×</button>` : ''}
          </div>`;
        }).join('');
        const myAv = state.photos?.[state.curUser]
          ? `<img src="${state.photos[state.curUser]}">`
          : (state.av[state.curUser] || '👤');
        repliesSection = `<div class="board-replies">
          ${replyItems}
          <div class="board-reply-input-row">
            <div class="board-reply-av">${myAv}</div>
            <input class="board-reply-input" id="board-ri-${postId}" type="text" placeholder="Antworten…" maxlength="500"
              onkeydown="if(event.key==='Enter'&&this.value.trim()){window._app.boardSubmitReply('${postId}',this.value);this.value=''}">
            <button class="board-reply-send" onclick="const i=document.getElementById('board-ri-${postId}');if(i.value.trim()){window._app.boardSubmitReply('${postId}',i.value);i.value=''}">➤</button>
          </div>
        </div>`;
      }

      // Gelesen-von (WhatsApp-Style Lesebestätigung)
      const readers = Object.values(post.reads || {}).filter(r => r.name && r.name !== post.author);
      let readReceiptHTML = '';
      if (state.members.length > 1) {
        if (readers.length) {
          const names = readers.map(r => escapeHtml(r.name)).join(', ');
          readReceiptHTML = `<div class="board-read-receipt" onclick="window._app.boardShowReaders('${postId}')" style="font-size:11px;color:var(--accent,#5C4EE5);cursor:pointer;padding:2px 2px 0">✓✓ Gelesen von ${names}</div>`;
        } else if (post.author === state.curUser) {
          readReceiptHTML = `<div class="board-read-receipt" style="font-size:11px;color:var(--text3);padding:2px 2px 0">✓ Gesendet</div>`;
        }
      }

      // #3 Vollbreites Bild
      html += `<div class="board-post">
        <div class="board-post-header">
          <div class="board-post-av">${state.photos?.[post.author] ? `<img src="${state.photos[post.author]}" style="width:36px;height:36px;border-radius:50%;object-fit:cover">` : (state.av[post.author] || '👤')}</div>
          <div>
            <div class="board-post-author">${escapeHtml(post.author)}</div>
            <div class="board-post-time">${boardTimeAgo(post.ts)}</div>
          </div>
          ${canDel ? `<button class="board-post-del" onclick="window._app.boardDeletePost('${postId}')">×</button>` : ''}
        </div>
        ${post.photo ? `<img class="board-post-photo board-post-photo-full" src="${post.photo}" alt="" onclick="window._app._boardPhotoZoom('${postId}')">` : ''}
        ${post.text ? `<div class="board-post-text">${escapeHtml(post.text)}</div>` : ''}
        <div class="board-reactions">${reacBtns}${pickerBtn}</div>
        <div class="board-reply-bar"><button class="board-reply-toggle" onclick="window._app._boardToggleReplies('${postId}')">${replyLabel}</button></div>
        ${repliesSection}
        ${readReceiptHTML}
      </div>`;
    });
  }
  html += `<div style="text-align:center;padding:16px 0 8px;display:flex;gap:16px;justify-content:center">
    <a href="/impressum.html" style="font-size:12px;color:var(--text3);text-decoration:none;font-weight:500">Impressum</a>
    <a href="/datenschutz.html" style="font-size:12px;color:var(--text3);text-decoration:none;font-weight:500">Datenschutz</a>
    <span style="font-size:12px;color:#c4c9d4">v1.0 · famiplan</span>
  </div>`;
  return html;
}

// ── RENDER SHOPPING ───────────────────────────────────────────
export function renderShoppingContent() {
  const { shopItems, activeShopList, shopView, collapsedCats } = state;
  const listItems = shopItems.filter(i => i.list === activeShopList);
  const total = listItems.length, done = listItems.filter(i => i.checked).length;
  const sub = document.getElementById('header-subtitle');
  if (sub) sub.textContent = `${done} von ${total} erledigt`;

  const innerNav = `<div class="shop-inner-nav">
    <button class="shop-inner-btn${shopView==='list'?' active':''}" onclick="window._app.shopSetView('list')">Liste</button>
    <button class="shop-inner-btn${shopView==='fav'?' active':''}" onclick="window._app.shopSetView('fav')">Favoriten</button>
  </div>`;

  if (shopView === 'fav') {
    const favs = shopItems.filter(i => i.fav);
    if (!favs.length) return innerNav + `<div class="empty"><div class="empty-ico">⭐</div><div class="empty-txt">Keine Favoriten</div><div class="empty-sub">Markiere Artikel mit ⭐ um sie hier zu speichern</div></div>`;
    return innerNav + `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
      <div class="stat-pill"><span>${favs.length}</span> Favoriten</div>
      <button onclick="window._app.shopAddAllFavsToList()" style="padding:8px 14px;background:#5C4EE5;color:white;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit">+ Alle zur Liste</button>
    </div><div class="shop-group">${favs.map(shopFavItemHTML).join('')}</div>`;
  }

  if (!total) {
    const favs = shopItems.filter(i => i.fav);
    let html = innerNav + `<div class="empty"><div class="empty-ico" style="font-size:40px;opacity:0.3">🛒</div><div class="empty-txt">Liste ist leer</div><div class="empty-sub">Tippe + um Artikel hinzuzufügen</div></div>`;
    if (favs.length) html += `<div style="margin-top:16px;display:flex;align-items:center;justify-content:space-between;margin-bottom:12px"><div class="stat-pill"><span>${favs.length}</span> Favoriten</div><button onclick="window._app.shopAddAllFavsToList()" style="padding:8px 14px;background:#5C4EE5;color:white;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit">+ Alle zur Liste</button></div><div class="shop-group">${favs.map(shopFavItemHTML).join('')}</div>`;
    return html;
  }

  const sorted = [...listItems].sort((a, b) => (a.checked ? 1 : 0) - (b.checked ? 1 : 0));
  const groups = {};
  sorted.forEach(item => { const cat = item.category || 'sonstiges'; if (!groups[cat]) groups[cat] = []; groups[cat].push(item); });

  let html = `<div class="stats-bar"><div class="stat-pill"><span>${total-done}</span> offen</div><div class="stat-pill"><span>${done}</span> erledigt</div></div>` + innerNav;

  SHOP_CATS.forEach(cat => {
    const items = groups[cat.id];
    if (!items?.length) return;
    const catDone  = items.filter(i => i.checked).length;
    const catCount = catDone ? (catDone + '/' + items.length) : items.length;
    const collapsed = collapsedCats.has(cat.id);
    html += `<div class="cat-section">
      <div class="cat-header" onclick="window._app.toggleShopCat('${cat.id}')">
        <span class="cat-name">${escapeHtml(cat.name)}</span>
        <div class="cat-divider"></div>
        <span class="cat-count">${catCount}</span>
      </div>
      ${!collapsed ? `<div class="shop-group">${items.map(shopItemHTML).join('')}</div>` : ''}
    </div>`;
  });
  return html;
}

function shopItemHTML(item) {
  const qtyStr   = item.qty && item.unit ? `${escapeHtml(String(item.qty))} ${escapeHtml(item.unit)}` : item.qty ? `${escapeHtml(String(item.qty))}` : item.unit ? escapeHtml(item.unit) : '';
  const mealBadge = item.mealRef && !item.checked ? `<span style="font-size:10px;font-weight:600;color:#059669;background:#ECFDF5;border:1px solid #A7F3D0;border-radius:5px;padding:1px 5px;margin-left:4px;white-space:nowrap">🍽 Mahlzeit</span>` : '';
  return `<div class="shop-item${item.checked ? ' checked' : ''}">
    <div class="item-check${item.checked?' done':''}" onclick="window._app.shopToggleCheck('${item.id}')"></div>
    <div class="item-info">
      <span class="item-name${item.checked?' done':''}">${escapeHtml(item.name)}</span>
      ${qtyStr ? `<span class="item-qty-chip">${qtyStr}</span>` : ''}
      ${mealBadge}
    </div>
    <div class="item-actions">
      <button class="item-edit" onclick="window._app.shopEditItem('${item.id}')"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z"/></svg></button>
      <button class="item-fav${item.fav?' active':''}" onclick="window._app.shopToggleFav('${item.id}')"><svg width="15" height="15" viewBox="0 0 16 16" fill="${item.fav?'#F59E0B':'none'}" stroke="${item.fav?'#F59E0B':'currentColor'}" stroke-width="1.3" stroke-linejoin="round"><path d="M8 2l1.8 3.6L14 6.3l-3 2.9.7 4.1L8 11.3l-3.7 2 .7-4.1-3-2.9 4.2-.7z"/></svg></button>
      <button class="item-del" onclick="window._app.shopDeleteItem('${item.id}')"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M2 2l10 10M12 2L2 12"/></svg></button>
    </div>
  </div>`;
}

function shopFavItemHTML(item) {
  const qtyStr = item.qty && item.unit ? `${escapeHtml(String(item.qty))} ${escapeHtml(item.unit)}` : item.qty ? `${escapeHtml(String(item.qty))}` : '';
  return `<div class="shop-item">
    <div class="item-info">
      <span class="item-name">${escapeHtml(item.name)}</span>
      ${qtyStr ? `<span class="item-qty-chip">${qtyStr}</span>` : ''}
    </div>
    <div class="item-actions">
      <button class="meal-icon-btn meal-icon-btn-edit" onclick="window._app.shopAddFavToList('${escapeAttr(item.id)}')" style="width:auto;padding:5px 10px;font-size:12px;font-weight:600;color:#5C4EE5;background:#EEF2FF;border-radius:7px">+ Liste</button>
      <button class="item-del" onclick="window._app.shopToggleFav('${item.id}')"><svg width="15" height="15" viewBox="0 0 16 16" fill="#F59E0B" stroke="#F59E0B" stroke-width="1.3" stroke-linejoin="round"><path d="M8 2l1.8 3.6L14 6.3l-3 2.9.7 4.1L8 11.3l-3.7 2 .7-4.1-3-2.9 4.2-.7z"/></svg></button>
    </div>
  </div>`;
}

// ── RENDER MEALS ──────────────────────────────────────────────
export function renderMeals() {
  const { meals, mealWeekOffset } = state;
  const todayISO  = localISO();
  const today     = new Date();
  const monday    = new Date(today);
  const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1;
  monday.setDate(today.getDate() - dayOfWeek + mealWeekOffset * 7);
  const weekDays  = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday); d.setDate(monday.getDate() + i);
    const iso  = d.toISOString().split('T')[0];
    const name = DAYS[jd2i(d.getDay())];
    return { iso, name };
  });
  const weekLabel = mealWeekOffset === 0 ? 'Diese Woche'
    : mealWeekOffset === 1 ? 'Nächste Woche'
    : (() => { const [f, l] = [weekDays[0].iso.split('-'), weekDays[6].iso.split('-')]; return `${parseInt(f[2])}.${parseInt(f[1])} – ${parseInt(l[2])}.${parseInt(l[1])}`; })();

  const hasAnything = weekDays.some(({ iso }) => meals[iso] && Object.values(meals[iso]).some(m => m?.name));

  const MEAL_TYPES_L = [
    { id: 'breakfast', label: 'Frühstück',   short: 'Früh'   },
    { id: 'lunch',     label: 'Mittagessen',  short: 'Mittag' },
    { id: 'dinner',    label: 'Abendessen',   short: 'Abend'  },
  ];

  const mealNavFree = !state.isPremium && !state.premiumPlan && !['premium','granted'].includes(state._verifiedPlan);
  let html = `<div class="meal-week-header">
    <button class="meal-week-nav" onclick="window._app.${mealNavFree?'_mealWeekLock':'setMealWeekOffset'}(${mealWeekOffset - 1})" style="${mealNavFree?'opacity:0.35':''}">‹</button>
    <div class="meal-week-label">${weekLabel}${mealNavFree?' 🔒':''}</div>
    <button class="meal-week-nav" onclick="window._app.${mealNavFree?'_mealWeekLock':'setMealWeekOffset'}(${mealWeekOffset + 1})" style="${mealNavFree?'opacity:0.35':''}">›</button>
  </div>
  <div style="display:flex;gap:8px;padding:0 12px 12px">
    <button onclick="window._app.showRecipeManager()"
      style="flex:1;padding:9px 12px;border:none;border-radius:10px;background:linear-gradient(135deg,#5C4EE5,#7C6EE8);color:white;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:6px">
      🍽️ Meine Rezepte
    </button>
    <button onclick="window._app.showRecipeImportModal()"
      style="flex:1;padding:9px 12px;border:none;border-radius:10px;background:linear-gradient(135deg,#5C4EE5,#7C6EE8);color:white;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:6px">
      ✨ KI-Import
    </button>
  </div>`;

  // #4 Planungsfortschritt – Tage mit mindestens einer Mahlzeit
  const totalDays  = 7;
  const plannedDays = weekDays.filter(({ iso }) => {
    const day = meals[iso] || {};
    return ['breakfast','lunch','dinner'].some(t => day[t]?.name);
  }).length;
  const pct = Math.round(plannedDays / totalDays * 100);
  const pctLabel = plannedDays === 0       ? 'Diese Woche noch nichts geplant'
    : plannedDays === totalDays            ? 'Alle Tage geplant 🎉'
    : plannedDays === 1                    ? '1 Tag geplant'
    : `${plannedDays} von 7 Tagen geplant`;

  // Vorwoche prüfen
  const prevDays = weekDays.map(({ iso }) => {
    const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const hasPrevWeek = prevDays.some(iso => meals[iso] && Object.values(meals[iso]).some(m => m?.name));

  // Nächste Woche: hat sie schon Mahlzeiten?
  const nextDays = weekDays.map(({ iso }) => {
    const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const hasNextWeek = nextDays.some(iso => meals[iso] && Object.values(meals[iso]).some(m => m?.name));

  // Label für nächste und vorherige Woche
  const nextWeekLabel = (() => {
    const d = new Date(nextDays[0] + 'T12:00:00');
    return d.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' }) + ' Woche';
  })();
  const prevWeekLabel = (() => {
    const d = new Date(prevDays[0] + 'T12:00:00');
    return d.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' }) + ' Woche';
  })();

  html += `<div style="background:var(--surface);border-radius:12px;padding:12px 14px;margin-bottom:10px;border:1px solid var(--border)">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
      <span style="font-size:12px;font-weight:600;color:var(--text2)">${pctLabel}</span>
      <span style="font-size:12px;font-weight:700;color:${pct===100?'#059669':'#5C4EE5'}">${pct}%</span>
    </div>
    <div style="background:var(--border);border-radius:4px;height:6px;overflow:hidden;margin-bottom:10px">
      <div style="height:100%;border-radius:4px;background:${pct===100?'#059669':'#5C4EE5'};width:${pct}%;transition:width 0.4s ease"></div>
    </div>
    ${hasAnything || hasPrevWeek ? `<div style="display:flex;gap:8px;margin-bottom:8px">
      ${hasPrevWeek ? `<button class="meal-transfer-btn" onclick="window._app._mealCopyFromPrevConfirm(${hasAnything})">
        ← Von ${escapeHtml(prevWeekLabel)} übernehmen${hasAnything ? ' ⚠️' : ''}
      </button>` : ''}
      ${hasAnything ? `<button class="meal-transfer-btn meal-transfer-btn-next" onclick="window._app._mealCopyToNextConfirm(${hasNextWeek})">
        In ${escapeHtml(nextWeekLabel)} kopieren${hasNextWeek ? ' ⚠️' : ''} →
      </button>` : ''}
    </div>` : ''}

  </div>`;

  weekDays.forEach(({ iso, name }) => {
    const isToday   = iso === todayISO;
    const d         = new Date(iso + 'T12:00:00');
    const dateStr   = d.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
    const dayMeals  = meals[iso] || {};
    const hasMeals  = Object.values(dayMeals).some(m => m?.name);

    if (!hasMeals) {
      html += `<div class="meal-day-empty${isToday ? ' today' : ''}" onclick="window._app.showMealEditModal('${escapeAttr(iso)}','dinner')">
        <span class="meal-day-empty-label${isToday ? ' today' : ''}">${isToday ? 'Heute · ' + name : name}</span>
        <span class="meal-day-empty-date">${dateStr}</span>
        <button class="meal-day-empty-add" onclick="event.stopPropagation();window._app.showMealEditModal('${escapeAttr(iso)}','dinner')">＋ Eintragen</button>
      </div>`;
      return;
    }

    // Abendessen als Hauptslot, Frühstück+Mittagessen ausklappbar
    const mainType   = MEAL_TYPES_L.find(t => t.id === 'dinner');
    const extraTypes = MEAL_TYPES_L.filter(t => t.id !== 'dinner');
    const expandId   = `meal-extra-${iso}`;
    const toggleId   = `meal-toggle-${iso}`;
    const extraHasMeals = extraTypes.some(t => dayMeals[t.id]?.name);

    const mealSlotHTML = (typeObj, iso) => {
      const { id, short } = typeObj;
      const meal     = dayMeals[id];
      const hasIngr  = meal?.ingredients?.length > 0;
      // 📖 Rezept-Button: nur wenn Zubereitungsschritte vorhanden
      const recipeKey = meal?.name ? meal.name.toLowerCase().replace(/[^a-z0-9äöüß]/g, '_').slice(0, 40) : null;
      const hasSteps  = recipeKey && state.mealRecipes[recipeKey]?.steps?.length > 0;
      const stepsCount = hasSteps ? state.mealRecipes[recipeKey].steps.length : 0;
      const recipeBtn = hasSteps
        ? `<button class="meal-icon-btn" onclick="window._app.showRecipeDetailModal('${escapeAttr(iso)}','${id}')"
            title="${stepsCount} Zubereitungsschritte"
            style="color:#5C4EE5;font-size:13px;padding:0 4px">📖</button>` : '';
      const shopBtn  = meal?.name && hasIngr
        ? `<button class="meal-icon-btn meal-icon-btn-shop${meal.addedToShop ? ' added' : ''}" id="meal-shop-btn-first"
            onclick="window._app.mealIngredientsToShop('${escapeAttr(iso)}','${id}') "
            title="${meal.addedToShop ? 'Bereits hinzugefügt' : 'Zutaten zur Einkaufsliste'}">
            <svg width='14' height='14' viewBox='0 0 16 16' fill='none' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><path d='M2 2h2.5l2 8h7l2-6H6'/><circle cx='8' cy='13' r='1'/><circle cx='12' cy='13' r='1'/></svg>
          </button>` : '';
      const editIcon = meal?.name
        ? `<path d='M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z'/>`
        : `<path d='M7 2v10M2 7h10'/>`;
      const delBtn = meal?.name
        ? `<button class="meal-icon-btn meal-icon-btn-del" onclick="window._app.deleteMeal('${escapeAttr(iso)}','${id}')">
            <svg width='12' height='12' viewBox='0 0 12 12' fill='none' stroke='currentColor' stroke-width='1.5' stroke-linecap='round'><path d='M1 1l10 10M11 1L1 11'/></svg>
          </button>` : '';
      // #6 Zutaten-Hinweis + optionale Zutaten als Checkboxen
      const ingrHint = meal?.name && hasIngr
        ? `<span style="font-size:10px;color:${meal.addedToShop?'#059669':'var(--text3)'};margin-top:1px;display:block">
            ${meal.ingredients.length} Zutat${meal.ingredients.length !== 1 ? 'en' : ''}${meal.addedToShop ? ' · ✓ auf Liste' : ''}</span>`
        : '';
      const optIngrs = meal?.optionalIngredients
        ? (Array.isArray(meal.optionalIngredients) ? meal.optionalIngredients : Object.values(meal.optionalIngredients))
        : [];
      const selectedOptionals = meal?.selectedOptionals
        ? (Array.isArray(meal.selectedOptionals) ? meal.selectedOptionals : Object.values(meal.selectedOptionals))
        : [];
      const optIngrHTML = meal?.name && optIngrs.length
        ? ('<span style="font-size:10px;color:var(--text3);margin-top:1px;display:block">'
          + optIngrs.length + ' optional'
          + (selectedOptionals.length ? ' · ' + selectedOptionals.length + ' ausgewählt' : '')
          + '</span>')
        : ''

      // #7 Swipe-Löschen: touch-Events auf dem Slot
      const slotId = `meal-slot-${iso}-${id}`;
      const swipeJs = meal?.name
        ? `ontouchstart="window._app._mealSwipeStart(event,'${escapeAttr(iso)}','${id}')"
           ontouchmove="window._app._mealSwipeMove(event,'${slotId}')"
           ontouchend="window._app._mealSwipeEnd(event,'${escapeAttr(iso)}','${id}','${slotId}')"`
        : '';

      return `<div class="meal-slot" id="${slotId}" ${swipeJs} style="overflow:hidden;position:relative">
        <span class="meal-slot-type">${short}</span>
        <div class="meal-slot-content">
          ${meal?.name
            ? `<span class="meal-slot-name">${escapeHtml(meal.name)}</span>${ingrHint}${optIngrHTML}`
            : `<span class="meal-slot-empty">Nicht geplant</span>`}
        </div>
        <div class="meal-slot-actions">
          ${recipeBtn}
          ${shopBtn}
          <button class="meal-icon-btn meal-icon-btn-edit" onclick="window._app.showMealEditModal('${escapeAttr(iso)}','${id}')">
            <svg width='14' height='14' viewBox='0 0 14 14' fill='none' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'>${editIcon}</svg>
          </button>
          ${delBtn}
        </div>
      </div>`;
    };

    html += `<div class="meal-day-card${isToday ? ' today' : ''}">
      <div class="meal-day-header" onclick="window._app.toggleMealExtras('${escapeAttr(iso)}')" >
        <span class="meal-day-name${isToday ? ' today' : ''}">${isToday ? 'Heute · ' + name : name}</span>
        <span class="meal-day-date">${dateStr}</span>
        <span class="meal-day-toggle" id="${toggleId}" style="margin-left:6px">›</span>
      </div>`;

    html += mealSlotHTML(mainType, iso);

    html += `<div class="meal-extra-slots" id="${expandId}">`;
    extraTypes.forEach(typeObj => { html += mealSlotHTML(typeObj, iso); });
    html += '</div>';

    const extraLabel = extraHasMeals
      ? extraTypes.filter(t => dayMeals[t.id]?.name).map(t => dayMeals[t.id].name).join(', ')
      : '+ Frühstück & Mittagessen';
    html += `<button class="meal-more-btn" id="meal-morebtn-${iso}" onclick="window._app.toggleMealExtras('${escapeAttr(iso)}')">${extraLabel}</button>`;
    html += '</div>';
  });

  if (!hasAnything) {
    html += `<div class="empty" style="padding:30px 20px 10px"><div class="empty-ico">🍽️</div><div class="empty-txt">Noch nichts geplant</div><div class="empty-sub">Tippe auf einen Tag oder ＋ um loszulegen.<br>Zutaten landen direkt auf der Einkaufsliste.</div></div>`;
  }
  return html;
}

export function toggleMealExtras(iso) {
  const el      = document.getElementById(`meal-extra-${iso}`);
  const toggle  = document.getElementById(`meal-toggle-${iso}`);
  const moreBtn = document.getElementById(`meal-morebtn-${iso}`);
  if (!el) return;
  const isOpen = el.classList.contains('open');
  el.classList.toggle('open', !isOpen);
  if (toggle)  toggle.classList.toggle('open', !isOpen);
  if (moreBtn && isOpen) {
    const MEAL_TYPES_L = [{ id: 'breakfast' }, { id: 'lunch' }, { id: 'dinner' }];
    const dayMeals     = state.meals[iso] || {};
    const extraTypes   = MEAL_TYPES_L.filter(t => t.id !== 'dinner');
    const extraHasMeals = extraTypes.some(t => dayMeals[t.id]?.name);
    moreBtn.textContent = extraHasMeals
      ? extraTypes.filter(t => dayMeals[t.id]?.name).map(t => dayMeals[t.id].name).join(', ')
      : '+ Frühstück & Mittagessen';
  }
}


// ── MAIN renderContent ────────────────────────────────────────
export function renderContent() {
  updateNav();

  const ub = document.getElementById('user-btn');
  if (ub && state.curUser) ub.textContent = (state.av[state.curUser] || '👤') + ' ' + state.curUser;

  const area = document.getElementById('scroll-area');
  if (!area) return;

  let html = '';
  if      (state.tab === 'shop')     html = renderShoppingContent();
  else if (state.tab === 'meals')    html = renderMeals();
  else if (state.tab === 'cal')      html = renderCalendar();
  else if (state.tab === 'today')    html = renderTodayV2(state.selISO, state.selDay);
  else if (state.tab === 'overview') html = renderBoard();

  area.innerHTML = html;
  renderTrialBanner();
  if (!window._swipeInit) { window._swipeInit = true; initSwipe(); }
  if (!state.curUser) setTimeout(() => window._app?.showUserModal?.(), 400);
}

// Re-export for main.js
export function toggleShopCat(id) {
  const cats = new Set(state.collapsedCats);
  cats.has(id) ? cats.delete(id) : cats.add(id);
  setState({ collapsedCats: cats });
  renderContent();
}

export function showOvTaskMenu(id, iso) {
  // Für Tasks: direkt showAssignModal (hat alle Aktionen)
  // Für Events: showAssignModal (zeigt Event-Details)
  showAssignModal(id, iso);
}


export function showAssignModal(id, iso) {
  const t = state.tasks.find(x => x.id === id); if (!t) return;
  const viewISO = iso || state.selISO;
  const { assignedTo, done } = getA(t, viewISO);
  const isEvent = t.type === 'event';

  // Datum-Formatierung
  const fmtDate = iso => {
    const [y, mo, d] = iso.split('-');
    const months = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];
    return parseInt(d) + '. ' + months[parseInt(mo) - 1] + ' ' + y;
  };

  let timeHTML = '';
  if (t.allDay) {
    // Ganztägig: nur Datum(e) anzeigen
    const dateStr = t.endDate && t.endDate !== t.date
      ? fmtDate(t.date) + ' – ' + fmtDate(t.endDate)
      : fmtDate(t.date || viewISO);
    timeHTML = `<div style="font-size:13px;color:var(--text2);margin:4px 0 8px">
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style="vertical-align:-1px;margin-right:3px"><rect x="1" y="2" width="10" height="9" rx="1.5" stroke="#9ba3af" stroke-width="1.3"/><path d="M1 5h10M4 1v2M8 1v2" stroke="#9ba3af" stroke-width="1.3" stroke-linecap="round"/></svg>
      Ganztägig · ${dateStr}
    </div>`;
  } else {
    // Mit Uhrzeit: Start-Datum + Uhrzeit, Enddatum wenn abweichend
    const startDateStr = fmtDate(t.date || viewISO);
    const endDateStr   = t.endDate && t.endDate !== t.date ? fmtDate(t.endDate) : null;
    const timeStr      = t.time + (t.endTime ? ' – ' + t.endTime : '');
    const durStr       = t.endTime ? ' (' + calcDur(t.time, t.endTime) + ')' : '';
    const dateTimeStr  = endDateStr
      ? startDateStr + ' ' + t.time + ' – ' + endDateStr + ' ' + t.endTime
      : startDateStr + ' · ' + timeStr + durStr;
    timeHTML = `<div style="font-size:13px;color:var(--text2);margin:4px 0 8px">
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style="vertical-align:-1px;margin-right:3px"><circle cx="6" cy="6" r="5" stroke="#9ba3af" stroke-width="1.3"/><path d="M6 3.5V6l1.5 1.5" stroke="#9ba3af" stroke-width="1.3" stroke-linecap="round"/></svg>
      ${dateTimeStr}
    </div>`;
  }

  const locHTML = t.location ? `<div style="margin:0 0 8px;font-size:13px;color:var(--text2)">
    <span style="cursor:pointer;text-decoration:underline;text-decoration-style:dotted" onclick="window._app.openMaps('${escapeAttr(t.location)}')">
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style="vertical-align:-1px;margin-right:3px"><path d="M6 1C4.34 1 3 2.34 3 4c0 2.5 3 7 3 7s3-4.5 3-7c0-1.66-1.34-3-3-3z" stroke="#9ba3af" stroke-width="1.3"/><circle cx="6" cy="4" r="1" stroke="#9ba3af" stroke-width="1.3"/></svg>${escapeHtml(t.location)}
    </span></div>` : '';

  if (isEvent) {
    const attendeesHTML = t.attendees?.length > 0 ? `
      <div style="margin:10px 0 4px">
        <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px">Teilnehmer</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${t.attendees.map(m => `<div style="display:flex;align-items:center;gap:5px;background:#F5F3FF;border:1px solid #EDE9FE;border-radius:20px;padding:4px 10px 4px 5px">
            <span style="font-size:18px">${state.photos?.[m] ? `<img src="${state.photos[m]}" style="width:22px;height:22px;border-radius:50%;object-fit:cover;vertical-align:middle">` : (state.av[m] || '👤')}</span>
            <span style="font-size:13px;font-weight:600;color:var(--text1)">${escapeHtml(m)}</span>
          </div>`).join('')}
        </div>
      </div>` : '';
    openModal(`
      <div class="modal-handle"></div>
      <div class="modal-title">${t.emoji ? t.emoji + ' ' : ''}${escapeHtml(t.title)}</div>
      <div class="modal-sub">Termin</div>
      ${timeHTML}${locHTML}${attendeesHTML}
      <button style="width:100%;margin-top:8px;padding:13px;border:none;border-radius:10px;background:#F0FDF4;color:#059669;font-weight:600;font-size:14px;cursor:pointer;font-family:inherit" onclick="window._app.closeModal();window._app.exportCal('${id}')">📅 Zum Apple Kalender hinzufügen</button>
      <button style="width:100%;margin-top:8px;padding:13px;border:none;border-radius:10px;background:var(--accent-bg);color:var(--accent);font-weight:600;font-size:14px;cursor:pointer;font-family:inherit" onclick="window._app.closeModal();window._app.showEditModal('${id}')"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:6px"><path d="M11 2l3 3-8 8H3v-3l8-8z"/></svg>Bearbeiten</button>
      <button style="width:100%;margin-top:8px;padding:13px;border:none;border-radius:10px;background:#FEF2F2;color:#DC2626;font-weight:600;font-size:14px;cursor:pointer;font-family:inherit" onclick="window._app.closeModal();window._app.deleteTask('${id}','${viewISO}')"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:6px"><path d="M2 4h12M5 4V3h6v1M5.5 7v5M8 7v5M10.5 7v5M3 4l1 9h8l1-9"/></svg>Löschen</button>
      <button class="modal-close" onclick="window._app.closeModal()">Schließen</button>`);
    return;
  }

  // Task: Status-Zeile + Member-Grid
  const statusHTML = !isEvent ? `
    <div style="display:flex;gap:8px;margin-bottom:12px">
      <button style="flex:1;padding:10px;border:none;border-radius:10px;background:${done?'#F0FDF4':'#FEF9C3'};color:${done?'#16a34a':'#ca8a04'};font-weight:600;font-size:13px;cursor:pointer;font-family:inherit" onclick="window._app.toggleDone('${id}','${viewISO}');window._app.closeModal()">
        ${done ? '↩ Als offen markieren' : '✓ Als erledigt markieren'}
      </button>
      ${assignedTo ? `<button style="padding:10px 14px;border:none;border-radius:10px;background:#FEF2F2;color:#DC2626;font-weight:600;font-size:13px;cursor:pointer;font-family:inherit" onclick="window._app.unassign('${id}','${viewISO}');window._app.closeModal()">× Freigeben</button>` : ''}
    </div>` : '';

  // Chips-Reihe wie bei Teilnehmer-Auswahl in Terminen
  const memberChips = state.members.map(m => {
    const isSel = assignedTo === m;
    const ph    = state.photos?.[m]
      ? `<img src="${state.photos[m]}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;flex-shrink:0">`
      : `<span style="font-size:20px;line-height:1">${state.av[m] || '👤'}</span>`;
    return `<button onclick="window._app.assignTask('${id}','${escapeAttr(m)}','${viewISO}')"
      style="display:flex;align-items:center;gap:8px;padding:8px 14px 8px 8px;border:2px solid ${isSel?'#5C4EE5':'#ECEEF2'};border-radius:20px;background:${isSel?'var(--accent-bg)':'var(--surface)'};cursor:pointer;font-family:inherit;font-size:13px;font-weight:${isSel?'700':'600'};color:${isSel?'#5C4EE5':'#374151'};transition:all 0.15s;flex-shrink:0">
      ${ph}
      <span>${escapeHtml(m)}</span>
      ${isSel ? '<span style="font-size:14px;margin-left:2px">✓</span>' : ''}
    </button>`;
  }).join('');

  openModal(`
    <div class="modal-handle"></div>
    <div class="modal-title">${t.emoji ? t.emoji + ' ' : ''}${escapeHtml(t.title)}</div>
    ${timeHTML}${locHTML}${statusHTML}
    <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px">Wer übernimmt?</div>
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:4px">${memberChips}</div>
    <button style="width:100%;margin-top:12px;padding:13px;border:none;border-radius:10px;background:var(--accent-bg);color:var(--accent);font-weight:600;font-size:14px;cursor:pointer;font-family:inherit" onclick="window._app.closeModal();window._app.showEditModal('${id}')"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:6px"><path d="M11 2l3 3-8 8H3v-3l8-8z"/></svg>Bearbeiten</button>
    <button style="width:100%;margin-top:8px;padding:13px;border:none;border-radius:10px;background:#FEF2F2;color:#DC2626;font-weight:600;font-size:14px;cursor:pointer;font-family:inherit" onclick="window._app.closeModal();window._app.deleteTask('${id}','${viewISO}')"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:6px"><path d="M2 4h12M5 4V3h6v1M5.5 7v5M8 7v5M10.5 7v5M3 4l1 9h8l1-9"/></svg>Löschen</button>
    <button class="modal-close" onclick="window._app.closeModal()">Schließen</button>`);
}

export function showCommentsModal(taskId, iso) {
  const t = state.tasks.find(x => x.id === taskId); if (!t) return;
  // Wiederkehrende Aufgaben: eigener Kommentar-Schlüssel pro Datum
  const cmtKey = (iso && t.recurring !== 'once') ? taskId + '_' + iso : taskId;
  const renderCmts = () => {
    const cmts   = state.taskComments[cmtKey] || {};
    const sorted = Object.entries(cmts).sort((a, b) => a[1].ts - b[1].ts);
    if (!sorted.length) return `<div class="cmt-empty">Noch keine Kommentare 💬</div>`;
    return sorted.map(([, c]) => {
      const time = new Date(c.ts).toLocaleTimeString('de', { hour: '2-digit', minute: '2-digit' });
      const date = new Date(c.ts).toLocaleDateString('de', { day: '2-digit', month: '2-digit' });
      return `<div class="cmt-row"><div class="cmt-av">${state.av[c.author] || '👤'}</div><div class="cmt-bubble"><div class="cmt-name">${escapeHtml(c.author)}</div><div class="cmt-text">${escapeHtml(c.text)}</div><div class="cmt-time">${date} · ${time}</div></div></div>`;
    }).join('');
  };
  openModal(`<div class="modal-handle"></div>
    <div class="modal-title">${t.emoji ? t.emoji + ' ' : ''}${escapeHtml(t.title)}</div>
    <div class="modal-sub" style="margin-bottom:14px">Kommentare</div>
    <div class="cmt-list" id="cmt-list">${renderCmts()}</div>
    <div class="cmt-input-row">
      <div class="cmt-av">${state.av[state.curUser] || '👤'}</div>
      <input class="cmt-input" id="cmt-input" maxlength="1000" placeholder="Kommentar schreiben…" onkeydown="if(event.key==='Enter')window._app.submitComment('${cmtKey}')"/>
      <button class="cmt-send" onclick="window._app.submitComment('${cmtKey}')">↑</button>
    </div>
    <button class="modal-close" onclick="window._app.closeModal()" style="margin-top:10px">Schließen</button>`);
  setTimeout(() => document.getElementById('cmt-input')?.focus(), 350);
}


