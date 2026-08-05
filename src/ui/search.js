// ══════════════════════════════════════════════════════════════
// famiplan – search.js
// Globale Suche über Termine/Aufgaben, Mahlzeiten, Rezepte,
// Einkaufsliste und Board-Beiträge
// ══════════════════════════════════════════════════════════════

import { state, setState } from '../modules/state.js';
import { isVisible, recLabel } from '../modules/tasks.js';
import { localISO, dayFromISO, escapeHtml, escapeAttr } from '../modules/utils.js';
import { openModal, closeModal } from './modal.js';
import { setTab } from './nav.js';
import { renderContent } from './render.js';

const MAX_PER_SECTION = 8;

// ── Nächstes Vorkommen einer (ggf. wiederkehrenden) Aufgabe/eines Termins ──
function nextOccurrenceISO(t) {
  if (t.openTodo) return null;
  if (t.recurring === 'once') return t.date;
  const todayISO = localISO();
  for (let i = 0; i <= 400; i++) {
    const d = new Date(todayISO + 'T12:00:00');
    d.setDate(d.getDate() + i);
    const iso = localISO(d);
    if (isVisible(t, dayFromISO(iso), iso)) return iso;
  }
  return t.date;
}

function fmtDateShort(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
}

function mealWeekOffsetForISO(iso) {
  const today     = new Date();
  const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1;
  const monday    = new Date(today);
  monday.setDate(today.getDate() - dayOfWeek);
  monday.setHours(0, 0, 0, 0);
  const target = new Date(iso + 'T12:00:00');
  const diffDays = Math.round((target - monday) / 86400000);
  return Math.floor(diffDays / 7);
}

// ── MODAL ÖFFNEN ─────────────────────────────────────────────
export function showSearchModal() {
  openModal(`
    <div class="modal-handle"></div>
    <div class="modal-title">🔍 Suche</div>
    <div class="modal-sub">Termine, Aufgaben, Mahlzeiten, Rezepte, Einkaufsliste, Board</div>
    <div class="form-group">
      <input class="form-input" id="global-search-input" placeholder="Suchbegriff eingeben…" autocomplete="off"
        oninput="window._app.runGlobalSearch(this.value)"/>
    </div>
    <div id="global-search-results">
      <div style="text-align:center;color:var(--text3);font-size:13px;padding:28px 0">Mindestens 2 Zeichen eingeben…</div>
    </div>
    <button class="modal-close" onclick="window._app.closeModal()">Schließen</button>
  `);
  setTimeout(() => document.getElementById('global-search-input')?.focus(), 350);
}

// ── LIVE-SUCHE ────────────────────────────────────────────────
export function runGlobalSearch(rawQuery) {
  const container = document.getElementById('global-search-results');
  if (!container) return;
  const q = (rawQuery || '').trim().toLowerCase();
  if (q.length < 2) {
    container.innerHTML = `<div style="text-align:center;color:var(--text3);font-size:13px;padding:28px 0">Mindestens 2 Zeichen eingeben…</div>`;
    return;
  }
  container.innerHTML = buildResultsHTML(q);
}

function sectionHTML(title, emoji, rowsHTML, count) {
  if (!rowsHTML) return '';
  return `<div style="margin-bottom:14px">
    <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px">${emoji} ${title}${count > MAX_PER_SECTION ? ` (${MAX_PER_SECTION} von ${count})` : ''}</div>
    <div style="border:1px solid var(--border);border-radius:12px;overflow:hidden">${rowsHTML}</div>
  </div>`;
}

function resultRow(onclick, title, sub, badge) {
  return `<div onclick="${onclick}" style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-bottom:1px solid var(--border2);cursor:pointer">
    <div style="flex:1;min-width:0">
      <div style="font-size:14px;font-weight:600;color:var(--text1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${title}</div>
      ${sub ? `<div style="font-size:11px;color:var(--text3);margin-top:2px">${sub}</div>` : ''}
    </div>
    ${badge ? `<div style="font-size:10px;font-weight:600;color:var(--text2);background:var(--bg3);padding:3px 7px;border-radius:6px;white-space:nowrap;flex-shrink:0">${badge}</div>` : ''}
  </div>`;
}

function buildResultsHTML(q) {
  // ── Termine & Aufgaben ──
  const taskMatches = state.tasks.filter(t =>
    (t.title || '').toLowerCase().includes(q) ||
    (t.location || '').toLowerCase().includes(q)
  );
  const taskRows = taskMatches.slice(0, MAX_PER_SECTION).map(t => {
    const iso   = nextOccurrenceISO(t);
    const badge = t.openTodo ? 'To-Do' : (t.type === 'event' ? 'Termin' : 'Aufgabe');
    const parts = [];
    if (!t.openTodo && t.recurring !== 'once') parts.push(recLabel(t));
    if (t.location) parts.push('📍 ' + escapeHtml(t.location));
    if (!t.openTodo && iso) parts.push(fmtDateShort(iso));
    return resultRow(
      `window._app.searchGoToTask('${escapeAttr(t.id)}','${iso || ''}')`,
      (t.emoji ? escapeHtml(t.emoji) + ' ' : '') + escapeHtml(t.title),
      parts.join(' · '), badge
    );
  }).join('');

  // ── Mahlzeiten ──
  const mealMatches = [];
  Object.entries(state.meals || {}).forEach(([iso, day]) => {
    ['breakfast', 'lunch', 'dinner'].forEach(type => {
      const meal = day?.[type];
      if (meal?.name && meal.name.toLowerCase().includes(q)) mealMatches.push({ iso, type, name: meal.name, emoji: meal.emoji });
    });
  });
  mealMatches.sort((a, b) => a.iso.localeCompare(b.iso));
  const MEAL_LABEL = { breakfast: 'Frühstück', lunch: 'Mittag', dinner: 'Abend' };
  const mealRows = mealMatches.slice(0, MAX_PER_SECTION).map(m => resultRow(
    `window._app.searchGoToMeal('${m.iso}')`,
    (m.emoji ? escapeHtml(m.emoji) + ' ' : '') + escapeHtml(m.name),
    fmtDateShort(m.iso) + ' · ' + MEAL_LABEL[m.type]
  )).join('');

  // ── Rezepte ──
  const recipeMatches = Object.entries(state.mealRecipes || {})
    .map(([key, r]) => ({ key, ...r }))
    .filter(r => r.name.toLowerCase().includes(q) || (r.ingredients || []).some(i => i.toLowerCase().includes(q)));
  const recipeRows = recipeMatches.slice(0, MAX_PER_SECTION).map(r => {
    const ingrCount = r.ingredients?.length || 0;
    return resultRow(
      `window._app.searchGoToRecipe('${escapeAttr(r.key)}')`,
      escapeHtml(r.name),
      `${ingrCount} Zutat${ingrCount !== 1 ? 'en' : ''}${r.steps?.length ? ' · ' + r.steps.length + ' Schritte' : ''}`
    );
  }).join('');

  // ── Einkaufsliste ──
  const shopMatches = (state.shopItems || []).filter(i => (i.name || '').toLowerCase().includes(q));
  const shopRows = shopMatches.slice(0, MAX_PER_SECTION).map(i => resultRow(
    `window._app.searchGoToShop('${escapeAttr(i.list || '')}')`,
    (i.emoji ? escapeHtml(i.emoji) + ' ' : '') + escapeHtml(i.name),
    i.list ? escapeHtml(i.list) : 'Favorit',
    i.checked ? '✓ Erledigt' : ''
  )).join('');

  // ── Board ──
  const boardMatches = Object.entries(state.boardPosts || {})
    .map(([id, p]) => ({ id, ...p }))
    .filter(p => (p.text || '').toLowerCase().includes(q))
    .sort((a, b) => (b.ts || 0) - (a.ts || 0));
  const boardRows = boardMatches.slice(0, MAX_PER_SECTION).map(p => resultRow(
    `window._app.searchGoToBoard()`,
    escapeHtml((p.text || '').slice(0, 60)) + ((p.text || '').length > 60 ? '…' : ''),
    p.author ? 'von ' + escapeHtml(p.author) : ''
  )).join('');

  const html = [
    sectionHTML('Termine & Aufgaben', '📅', taskRows, taskMatches.length),
    sectionHTML('Mahlzeiten', '🍽️', mealRows, mealMatches.length),
    sectionHTML('Rezepte', '📖', recipeRows, recipeMatches.length),
    sectionHTML('Einkaufsliste', '🛒', shopRows, shopMatches.length),
    sectionHTML('Board', '💬', boardRows, boardMatches.length),
  ].join('');

  if (!html) {
    return `<div style="text-align:center;padding:32px 12px;color:var(--text3)">
      <div style="font-size:36px;margin-bottom:8px">🔍</div>
      <div style="font-size:14px;font-weight:600">Keine Treffer</div>
    </div>`;
  }
  return html;
}

// ── NAVIGATION ZU ERGEBNISSEN ───────────────────────────────────
export function searchGoToTask(id, iso) {
  closeModal();
  const t = state.tasks.find(x => x.id === id);
  if (!t) return;
  if (t.openTodo) {
    setTab('today');
    return;
  }
  setTab('cal');
  if (iso) {
    const d = new Date(iso + 'T12:00:00');
    setState({ calSelISO: iso, calYear: d.getFullYear(), calMonth: d.getMonth() });
    renderContent();
  }
}

export function searchGoToMeal(iso) {
  closeModal();
  setState({ mealWeekOffset: mealWeekOffsetForISO(iso) });
  setTab('meals');
}

export function searchGoToRecipe(key) {
  closeModal();
  setTimeout(() => window._app.showRecipeViewModal(key), 320);
}

export function searchGoToShop(list) {
  closeModal();
  if (list && state.shopLists.includes(list)) setState({ activeShopList: list });
  setTab('shop');
}

export function searchGoToBoard() {
  closeModal();
  setTab('overview');
}
