import { DAYS } from '../modules/config.js';
import { state, setState } from '../modules/state.js';
import { localISO, jd2i, dayFromISO, TODAY_ISO, TODAY } from '../modules/utils.js';
import { escapeHtml, escapeAttr } from '../modules/utils.js';
import { updateBoardBadge, boardMarkPostsRead } from '../modules/board.js';

// ── TAB TOUR ─────────────────────────────────────────────────
const TAB_TOURS = {
  today: {
    emoji: '📋',
    title: 'Dein Tag auf einen Blick',
    text: 'Hier siehst du alle Aufgaben für heute – gruppiert nach Morgen, Nachmittag und Abend. Hake Aufgaben direkt mit dem Kreis-Button ab. Mit ⏱ oben wechselst du zur Timeline-Ansicht. Wische links/rechts um den Tag zu wechseln.',
  },
  cal: {
    emoji: '📅',
    title: 'Familienkalender',
    text: 'Wechsle zwischen Monat, Woche und 7-Tage-Ansicht. Im Monat: tippe einen Tag um die Timeline zu öffnen, wische links/rechts um Monate zu wechseln. Mit ＋/− zoomst du für mehr Details. Langer Druck auf einen Tag legt direkt einen Termin an.',
  },
  overview: {
    emoji: '🏠',
    title: 'Familien-Board',
    text: 'Der gemeinsame Treffpunkt eurer Familie. Oben siehst du den nächsten Termin mit Countdown und demnächst anstehende Events. Mit den Schnellzugriff-Chips fügst du direkt Aufgaben, Einkäufe oder Termine hinzu.',
  },
  shop: {
    emoji: '🛒',
    title: 'Einkaufsliste',
    text: 'Tippe + um Artikel hinzuzufügen – die Autovervollständigung schlägt bekannte Artikel vor. Mit "Sofort" fügst du einen Artikel direkt ohne Formular hinzu. Zutaten aus dem Mahlzeitenplan landen hier automatisch.',
  },
  meals: {
    emoji: '🍽️',
    title: 'Mahlzeitenplanung',
    text: 'Plant gemeinsam was ihr die Woche kocht. Tippe auf einen Slot um eine Mahlzeit einzutragen – gespeicherte Rezepte werden beim Tippen vorgeschlagen. Mit "🍽️ Meine Rezepte" verwaltest du deine Rezeptsammlung; mit "✨ KI-Import" importierst du Rezepte per KI aus einem Text oder Link (Plus-Feature). Zutaten überträgst du per Warenkorb-Button direkt auf die Einkaufsliste – bei Rezepten mit Portionsangabe kannst du die Menge vorher skalieren. Wische links/rechts um Wochen zu wechseln.',
  },
};

// ── GUIDED TOUR SYSTEM ───────────────────────────────────────
const TOUR_STEPS = {
  today: [
    { target: 'day-scroll',  title: 'Tage wechseln',         text: 'Tippe auf einen Tag-Chip um zu springen, oder wische auf der Seite links/rechts um zum nächsten oder vorherigen Tag zu wechseln.', pos: 'bottom' },
    { target: 'scroll-area', title: 'Aufgaben abhaken',       text: 'Tippe den Kreis-Button links an einer Aufgabe um sie direkt als erledigt zu markieren – kein Modal nötig. Aufgaben sind nach Tageszeit gruppiert: Morgen, Nachmittag und Abend.', pos: 'bottom' },
    { target: 'fab',         title: 'Hinzufügen',             text: 'Tippe hier um eine neue Aufgabe, einen Termin oder ein To-Do anzulegen. Mit dem ⏱-Button oben wechselst du zur Timeline-Ansicht für den Tag.', pos: 'top' },
    { target: 'user-btn',    title: 'Dein Profil',            text: 'Hier siehst du wer du bist. Tippe zum Wechseln – jedes Familienmitglied nutzt die App mit eigenem Profil.', pos: 'bottom' },
  ],
  cal: [
    { target: 'nav-cal',     title: 'Kalender',               text: 'Wechsle zwischen Monat, Woche und 7-Tage-Ansicht. Im Monat wische links/rechts für den nächsten Monat. Mit ＋/− zoomst du für mehr Details – bis zu 3 Zoomstufen.', pos: 'top' },
    { target: 'scroll-area', title: 'Termine & Aufgaben',     text: 'Tippe auf einen Tag um die Timeline zu öffnen und direkt zum Termin zu scrollen. Langer Druck auf einen freien Tag öffnet sofort das "Neuer Termin"-Formular mit vorausgefülltem Datum.', pos: 'bottom' },
    { target: 'fab',         title: 'Termin erstellen',       text: 'Tippe hier um einen neuen Termin für den ausgewählten Tag anzulegen. In der Timeline kannst du auch direkt auf eine Uhrzeit tippen.', pos: 'top' },
  ],
  overview: [
    { target: 'scroll-area', title: 'Dein Familientag',       text: 'Der Banner zeigt den nächsten Termin mit Countdown. Darunter siehst du kommende Termine der nächsten Tage. Mit den vier Schnellzugriff-Chips oben fügst du direkt Aufgaben, Einkäufe, Termine oder Mahlzeiten hinzu.', pos: 'bottom' },
    { target: 'nav-overview', title: 'Board & Beiträge',      text: 'Weiter unten teilt eure Familie Fotos und Nachrichten. Reagiert mit Emojis auf Beiträge. Bilder werden vollbreit angezeigt – antippen zum Vergrößern.', pos: 'top' },
    { target: 'fab',          title: 'Beitrag teilen',        text: 'Tippe hier um einen Text oder ein Foto mit deiner Familie zu teilen.', pos: 'top' },
  ],
  shop: [
    { target: 'nav-shop',    title: 'Einkaufsliste',          text: 'Legt gemeinsam Artikel an und hakt sie beim Einkaufen ab. Mehrere Listen sind möglich – z.B. Rewe und DM getrennt. Zutaten aus dem Mahlzeitenplan landen hier automatisch.', pos: 'top' },
    { target: 'fab',         title: 'Artikel hinzufügen',     text: 'Die Eingabe schlägt automatisch bekannte Artikel vor – Favoriten erscheinen zuerst. Mit "Sofort" fügst du einen bekannten Artikel direkt hinzu ohne das Formular auszufüllen.', pos: 'top' },
  ],
  meals: [
    { target: 'nav-meals',   title: 'Mahlzeitenplanung',      text: 'Plant was ihr die Woche kocht. Tippe auf einen Slot um eine Mahlzeit einzutragen. Beim Tippen im Namensfeld schlägt die App gespeicherte Rezepte vor. Wische links/rechts um Wochen zu wechseln.', pos: 'top' },
    { target: 'scroll-area', title: 'Rezepte & KI-Import',    text: 'Mit "🍽️ Meine Rezepte" öffnest du deine Rezeptsammlung – inklusive Zutaten, Zubereitungsschritten und Vorbereitungszeit. Häufig gekochte Rezepte erscheinen als Schnell-Chips ganz oben. Mit "✨ KI-Import" importierst du Rezepte automatisch per KI (Plus-Feature).', pos: 'bottom' },
    { target: 'scroll-area', title: 'Woche übertragen',       text: 'Über dem Wochenplan siehst du den Planungsfortschritt und Buttons zum Übertragen: aktuelle Woche in die nächste Woche kopieren, oder die Vorwoche übernehmen. Bei bestehenden Plänen erscheint eine Warnmeldung.', pos: 'bottom' },
    { target: 'fab',         title: 'Einkaufsliste befüllen', text: 'Tippe den Warenkorb-Button an einer geplanten Mahlzeit um die Zutaten direkt auf die Einkaufsliste zu übertragen. Hat das Rezept eine Portionsangabe, kannst du die Menge vorher anpassen.', pos: 'top' },
  ],
};

let _tourActive = false;

function showTabTour(tab, force = false) {
  const key = 'fp_tour_' + tab;
  if (!force && localStorage.getItem(key)) return;
  if (localStorage.getItem('fp_demo_mode')) return;
  localStorage.setItem(key, '1');
  const steps = TOUR_STEPS[tab];
  if (!steps) return;
  setTimeout(() => startTour(steps, tab), 600);
}

function startTour(steps, tab) {
  if (_tourActive) return;
  _tourActive = true;
  let idx = 0;

  function getRect(targetId) {
    const el = document.getElementById(targetId);
    if (!el) return null;
    return el.getBoundingClientRect();
  }

  // Build container once, update in place
  const container = document.createElement('div');
  container.id = 'tour-container';
  container.style.cssText = 'position:fixed;inset:0;z-index:1000;pointer-events:none;will-change:transform';

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;pointer-events:all;';
  canvas.onclick = e => { if (e.target === canvas) window._app._tourSkip(); };
  container.appendChild(canvas);

  const tooltip = document.createElement('div');
  tooltip.style.cssText = 'position:absolute;left:50%;width:min(320px,calc(100vw - 32px));pointer-events:all;transition:top 0.35s cubic-bezier(0.32,0.72,0,1),bottom 0.35s cubic-bezier(0.32,0.72,0,1),opacity 0.25s ease;will-change:transform,opacity';
  container.appendChild(tooltip);
  document.body.appendChild(container);

  let _animId = null;
  let _cx = 0, _cy = 0, _rw = 0, _rh = 0;
  let _tcx = 0, _tcy = 0, _trw = 0, _trh = 0;

  function lerp(a, b, t) { return a + (b - a) * t; }

  function drawSpotlight() {
    const vw = window.innerWidth, vh = window.innerHeight;
    canvas.width = vw; canvas.height = vh;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, vw, vh);
    ctx.fillStyle = 'rgba(10,8,30,0.78)';
    ctx.fillRect(0, 0, vw, vh);
    const r = Math.min(_rw, _rh) * 0.18;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.moveTo(_cx - _rw + r, _cy - _rh);
    ctx.arcTo(_cx + _rw, _cy - _rh, _cx + _rw, _cy + _rh, r);
    ctx.arcTo(_cx + _rw, _cy + _rh, _cx - _rw, _cy + _rh, r);
    ctx.arcTo(_cx - _rw, _cy + _rh, _cx - _rw, _cy - _rh, r);
    ctx.arcTo(_cx - _rw, _cy - _rh, _cx + _rw, _cy - _rh, r);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    // White border
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 3]);
    ctx.lineDashOffset = -(Date.now() / 40 % 18);
    ctx.beginPath();
    ctx.moveTo(_cx - _rw + r, _cy - _rh);
    ctx.arcTo(_cx + _rw, _cy - _rh, _cx + _rw, _cy + _rh, r);
    ctx.arcTo(_cx + _rw, _cy + _rh, _cx - _rw, _cy + _rh, r);
    ctx.arcTo(_cx - _rw, _cy + _rh, _cx - _rw, _cy - _rh, r);
    ctx.arcTo(_cx - _rw, _cy - _rh, _cx + _rw, _cy - _rh, r);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  function animateToTarget() {
    if (_animId) cancelAnimationFrame(_animId);
    const speed = 0.12;
    function frame() {
      _cx = lerp(_cx, _tcx, speed);
      _cy = lerp(_cy, _tcy, speed);
      _rw = lerp(_rw, _trw, speed);
      _rh = lerp(_rh, _trh, speed);
      drawSpotlight();
      const dx = Math.abs(_cx - _tcx), dy = Math.abs(_cy - _tcy);
      if (dx > 0.5 || dy > 0.5 || Math.abs(_rw - _trw) > 0.5) {
        _animId = requestAnimationFrame(frame);
      } else {
        _cx = _tcx; _cy = _tcy; _rw = _trw; _rh = _trh;
        drawSpotlight();
        // Keep dashed border animating
        function dashLoop() {
          drawSpotlight();
          _animId = requestAnimationFrame(dashLoop);
        }
        _animId = requestAnimationFrame(dashLoop);
      }
    }
    _animId = requestAnimationFrame(frame);
  }

  function render() {
    if (idx >= steps.length) { cleanup(); return; }

    const step = steps[idx];
    const rect = getRect(step.target);
    const vw = window.innerWidth, vh = window.innerHeight;
    const pad = 12;

    if (rect) {
      _tcx = rect.left + rect.width / 2;
      _tcy = rect.top + rect.height / 2;
      _trw = rect.width / 2 + pad;
      _trh = rect.height / 2 + pad;
    } else {
      _tcx = vw / 2; _tcy = vh / 2; _trw = 70; _trh = 40;
    }

    // Init position on first render
    if (idx === 0) { _cx = _tcx; _cy = _tcy; _rw = _trw; _rh = _trh; }

    animateToTarget();

    // Tooltip
    const isAbove = _tcy > vh * 0.55;
    tooltip.style.transform = 'translateX(-50%)';
    tooltip.style.opacity = '0';
    if (isAbove) {
      tooltip.style.bottom = (vh - (_tcy - _trh - 14)) + 'px';
      tooltip.style.top = 'auto';
    } else {
      tooltip.style.top = (_tcy + _trh + 14) + 'px';
      tooltip.style.bottom = 'auto';
    }
    tooltip.innerHTML = `
      <div style="background:var(--surface);border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.4);transform:translateY(8px);transition:transform 0.35s cubic-bezier(0.32,0.72,0,1)">
        <div style="background:linear-gradient(135deg,#5C4EE5,#764ba2);padding:14px 18px 12px;position:relative;overflow:hidden">
          <div style="position:absolute;top:-15px;right:-15px;width:70px;height:70px;background:rgba(255,255,255,0.08);border-radius:50%"></div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px">
            <div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.55);text-transform:uppercase;letter-spacing:0.8px">Schritt ${idx+1} von ${steps.length}</div>
            <button onclick="window._app._tourSkip()" style="background:rgba(255,255,255,0.15);border:none;color:rgba(255,255,255,0.7);font-size:11px;font-weight:600;padding:3px 8px;border-radius:6px;cursor:pointer;font-family:inherit">Überspringen</button>
          </div>
          <div style="font-size:15px;font-weight:800;color:white;letter-spacing:-0.3px">${step.title}</div>
        </div>
        <div style="padding:13px 18px 15px">
          <div style="font-size:13px;color:#4b5563;line-height:1.65;margin-bottom:13px">${step.text}</div>
          <div style="display:flex;gap:8px;align-items:center">
            ${idx > 0 ? `<button onclick="window._app._tourPrev()" style="padding:10px 16px;background:#F5F3FF;color:#5C4EE5;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">‹</button>` : ''}
            <button onclick="window._app._tourNext()" style="flex:1;padding:10px;background:#5C4EE5;color:white;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">${idx < steps.length-1 ? 'Weiter →' : 'Fertig ✓'}</button>
          </div>
          <div style="display:flex;justify-content:center;gap:6px;margin-top:11px">
            ${steps.map((_,i) => `<div style="width:${i===idx?'18px':'6px'};height:6px;border-radius:3px;background:${i===idx?'#5C4EE5':'#e5e7eb'};transition:all 0.3s"></div>`).join('')}
          </div>
        </div>
      </div>`;

    // Fade + slide in tooltip
    requestAnimationFrame(() => {
      tooltip.style.opacity = '1';
      const inner = tooltip.querySelector('div');
      if (inner) requestAnimationFrame(() => { inner.style.transform = 'translateY(0)'; });
    });
  }

  function cleanup() {
    _tourActive = false;
    if (_animId) cancelAnimationFrame(_animId);
    document.getElementById('tour-container')?.remove();
    delete window._app._tourNext;
    delete window._app._tourPrev;
    delete window._app._tourSkip;
  }

  window._app._tourNext = () => { idx++; render(); };
  window._app._tourPrev = () => { idx = Math.max(0, idx-1); render(); };
  window._app._tourSkip = () => { cleanup(); };

  render();
}

export function startTabTour(tab) {
  const steps = TOUR_STEPS[tab];
  if (!steps) return;
  startTour(steps, tab);
}

// ── TAB ───────────────────────────────────────────────────────
export function setTab(t) {
  setState({ tab: t });
  // Kalender-Tab: scroll-area bekommt tab-cal Klasse für volle Breite
  const sa = document.getElementById('scroll-area');
  if (sa) sa.className = t === 'cal' ? 'tab-cal' : '';
  renderContent();
  showTabTour(t);
  if (t === 'overview') boardMarkPostsRead();
}

export function setDay(name, iso) {
  setState({ selDay: name, selISO: iso, todayView: 'mine', tab: 'today' });
  renderContent();
}

// ── NAV UPDATE ────────────────────────────────────────────────
export function updateNav() {
  ['today','cal','overview','shop','meals'].forEach(t => {
    const btn = document.getElementById('nav-' + t);
    if (btn) btn.className = 'nav-btn' + (state.tab === t ? ' active' : '');
  });
  updateBoardBadge();

  const titleEl    = document.getElementById('header-title');
  const subEl      = document.getElementById('header-subtitle');
  const dayScrollEl = document.getElementById('day-scroll');
  const shopTabsEl  = document.getElementById('shop-list-tabs');
  const shopClearBtn = document.getElementById('shop-clear-btn');

  if (state.tab === 'shop') {
    if (titleEl)    titleEl.innerHTML = _logoSVG();
    if (shopClearBtn) shopClearBtn.style.display = 'block';
    if (dayScrollEl)  dayScrollEl.style.display  = 'none';
    if (shopTabsEl) {
      shopTabsEl.style.display = 'flex';
      shopTabsEl.innerHTML = state.shopLists.map((l, i) => `
        <div style="display:flex;align-items:center;flex-shrink:0">
          <button class="list-tab${state.activeShopList === l ? ' active' : ''}" onclick="window._app.shopSetListByIndex(${i})">${escapeHtml(l)}</button>
          ${state.shopLists.length > 1 ? `<button onclick="window._app.shopDeleteListByIndex(${i})" style="background:none;border:none;color:rgba(255,255,255,0.35);font-size:13px;cursor:pointer;padding:0 6px 0 0;line-height:1;flex-shrink:0" title="Liste löschen">✕</button>` : ''}
        </div>`).join('') + `<button class="list-tab-add" onclick="window._app.shopPromptAddList()">＋</button>`;
    }
  } else if (state.tab === 'meals') {
    if (titleEl)    titleEl.innerHTML = _logoSVG();
    if (shopClearBtn)  shopClearBtn.style.display  = 'none';
    if (dayScrollEl)   dayScrollEl.style.display   = 'none';
    if (shopTabsEl)    shopTabsEl.style.display     = 'none';
  } else if (state.tab === 'overview') {
    if (titleEl)    titleEl.innerHTML = _logoSVG();
    if (shopClearBtn)  shopClearBtn.style.display  = 'none';
    if (dayScrollEl)   dayScrollEl.style.display   = 'none';
    if (shopTabsEl)    shopTabsEl.style.display     = 'none';
  } else {
    // today / cal: famiplan logo
    if (titleEl) titleEl.innerHTML = _logoSVG();
    if (subEl)   subEl.textContent = 'Live-Sync aktiv 🟢';
    if (shopClearBtn)  shopClearBtn.style.display  = 'none';
    if (dayScrollEl)   dayScrollEl.style.display   = state.tab === 'cal' ? 'none' : 'flex';
    if (shopTabsEl)    shopTabsEl.style.display     = 'none';
    renderDayPills();
  }
}

function _logoSVG() {
  return `<svg width="105" height="32" viewBox="0 0 105 32" role="img" style="display:inline-block;vertical-align:middle">
    <title>famiplan</title>
    <g transform="translate(14,14)">
      <line x1="-42" y1="-30" x2="10" y2="-44" stroke="#fff" stroke-width="1.8" stroke-linecap="round" transform="scale(0.29)"/>
      <line x1="10" y1="-44" x2="44" y2="8" stroke="#fff" stroke-width="1.8" stroke-linecap="round" transform="scale(0.29)"/>
      <line x1="44" y1="8" x2="-8" y2="38" stroke="rgba(255,255,255,0.7)" stroke-width="1.8" stroke-linecap="round" transform="scale(0.29)"/>
      <line x1="-8" y1="38" x2="-38" y2="12" stroke="rgba(255,255,255,0.7)" stroke-width="1.8" stroke-linecap="round" transform="scale(0.29)"/>
      <line x1="-42" y1="-30" x2="-8" y2="38" stroke="rgba(255,255,255,0.7)" stroke-width="1.8" stroke-linecap="round" transform="scale(0.29)"/>
      <line x1="10" y1="-44" x2="-38" y2="12" stroke="#fff" stroke-width="1.8" stroke-linecap="round" transform="scale(0.29)"/>
      <circle cx="-42" cy="-30" r="7" fill="rgba(255,255,255,0.85)" transform="scale(0.29)"/>
      <circle cx="10" cy="-44" r="10" fill="white" transform="scale(0.29)"/>
      <circle cx="44" cy="8" r="7" fill="rgba(255,255,255,0.85)" transform="scale(0.29)"/>
      <circle cx="-8" cy="38" r="6" fill="rgba(255,255,255,0.8)" transform="scale(0.29)"/>
      <circle cx="-38" cy="12" r="9" fill="white" transform="scale(0.29)"/>
    </g>
    <text x="34" y="22" font-family="-apple-system,BlinkMacSystemFont,SF Pro Rounded,Segoe UI,sans-serif" font-size="17" font-weight="700" fill="white" letter-spacing="-0.3">fami</text>
    <text x="70" y="22" font-family="-apple-system,BlinkMacSystemFont,SF Pro Rounded,Segoe UI,sans-serif" font-size="17" font-weight="700" fill="rgba(255,255,255,0.7)" letter-spacing="-0.3">plan</text>
  </svg>`;
}

// ── DAY PILLS ─────────────────────────────────────────────────
export function renderDayPills() {
  const el = document.getElementById('day-scroll');
  if (!el) return;
  const today = localISO();
  const pills = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(state.selISO + 'T12:00:00');
    d.setDate(d.getDate() - 3 + i);
    const iso  = localISO(d);
    const name = DAYS[jd2i(d.getDay())];
    const num  = d.getDate();
    const sel  = iso === state.selISO;
    const isToday = iso === today;
    return `<button class="day-pill${sel ? ' active' : ''}${isToday ? ' today' : ''}"
      onclick="window._app.setDay('${name}','${iso}')">
      <span class="dp-name">${name.slice(0,2)}</span>
      <span class="dp-num">${num}</span>
    </button>`;
  });
  const isOnToday = state.selISO === today;
  const heuteBtn = isOnToday ? '' : `<button class="heute-btn" onclick="window._app.setDay('${DAYS[jd2i(new Date().getDay())]}','${today}')">↩ Heute</button>`;
  el.innerHTML = pills.join('') + heuteBtn;
  // Scroll aktive Pill in die Mitte
  requestAnimationFrame(() => {
    const active = el.querySelector('.day-pill.active');
    if (active) active.scrollIntoView({ inline: 'center', behavior: 'smooth' });
  });
}

// ── SWIPE ─────────────────────────────────────────────────────
export function initSwipe() {
  const shell = document.getElementById('shell');
  if (!shell || shell._swipeReady) return;
  shell._swipeReady = true;
  let sx = 0, sy = 0;
  shell.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  shell.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - sx;
    const dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
    if (state.tab === 'today') {
      const d = new Date(state.selISO + 'T12:00:00');
      d.setDate(d.getDate() + (dx < 0 ? 1 : -1));
      setState({ selDay: DAYS[jd2i(d.getDay())], selISO: localISO(d), todayView: 'mine' });
      renderContent();
    } else if (state.tab === 'cal') {
      if (state.calSelISO) {
        const d = new Date(state.calSelISO + 'T12:00:00');
        d.setDate(d.getDate() + (dx < 0 ? 1 : -1));
        setState({ calSelISO: localISO(d), calMonth: d.getMonth(), calYear: d.getFullYear() });
      } else {
        let { calMonth, calYear } = state;
        calMonth += dx < 0 ? 1 : -1;
        if (calMonth > 11) { calMonth = 0; calYear++; }
        if (calMonth < 0)  { calMonth = 11; calYear--; }
        setState({ calMonth, calYear });
      }
      renderContent();
    } else if (state.tab === 'meals') {
      setState({ mealWeekOffset: state.mealWeekOffset + (dx < 0 ? 1 : -1) });
      renderContent();
    }
  }, { passive: true });
}

// ── BOTTOM NAV KEYBOARD FIX ───────────────────────────────────
export function initBottomNavFix() {
  if (!window.visualViewport) return;
  let _raf = null;

  function fix() {
    if (_raf) cancelAnimationFrame(_raf);
    _raf = requestAnimationFrame(() => {
      const nav = document.getElementById('bottom-nav');
      if (!nav) return;
      const fab = document.getElementById('fab');
      const vv  = window.visualViewport;
      // iOS: visualViewport.offsetTop gibt die Verschiebung durch die Tastatur an
      const offsetTop = vv.offsetTop || 0;
      const keyboardH = Math.max(0, window.innerHeight - vv.height - offsetTop);
      nav.style.bottom = keyboardH > 50 ? keyboardH + 'px' : '';
      if (fab) fab.style.bottom = keyboardH > 50 ? (keyboardH + 80) + 'px' : '';
    });
  }

  window.visualViewport.addEventListener('resize', fix);
  window.visualViewport.addEventListener('scroll', fix);

  // Reset beim Schließen der Tastatur
  document.addEventListener('focusout', () => {
    setTimeout(() => {
      if (_raf) cancelAnimationFrame(_raf);
      _raf = requestAnimationFrame(() => {
        const nav = document.getElementById('bottom-nav');
        if (nav) nav.style.bottom = '';
        const fab = document.getElementById('fab');
        if (fab) fab.style.bottom = '';
      });
    }, 100);
  });
}

// renderContent wird in main.js definiert und hier nur als Referenz genutzt
// → wird via window._app.renderContent aufgerufen
function renderContent() {
  window._app?.renderContent();
}


