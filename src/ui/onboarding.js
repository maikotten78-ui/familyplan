// ══════════════════════════════════════════════════════════════
// famiplan – onboarding.js  (Phase 7c)
// Onboarding-Flow, Family-Setup, Install-Prompt, FAB, shareInviteLink
// ══════════════════════════════════════════════════════════════

import { DB_ROOT, DEFAULT_EMOJIS, PUSH_WORKER_URL, ADMIN_FAMILY_ID, ADMIN_UIDS } from '../modules/config.js';
import { state, setState } from '../modules/state.js';
import { localISO, jd2i, dayFromISO, genFamilyId, genInviteToken } from '../modules/utils.js';
import { fbFetch, fbSet, syncPublicFamily } from '../modules/firebase.js';
import { saveMember, bindMemberUid } from '../modules/members.js';
import { saveUserFamily, hideAuthScreen } from '../modules/auth.js';
import { checkRateLimit } from '../modules/premium.js';
import { openModal, closeModal, showSync } from './modal.js';
// renderContent via window._app to avoid circular import

// ── ONBOARDING NAVIGATION ─────────────────────────────────────
export function obGoTo(idx) {
  setState({ obCurrentSlide: idx });
  const slides = document.getElementById('ob-slides');
  if (slides) slides.style.transform = `translateX(-${idx * 100}%)`;
  // Progress bar: slides 0=welcome,1=choice,2=create,3=profile,4=join,5=done
  const fill = document.getElementById('ob-progress-fill');
  if (fill) {
    const pct = idx === 0 ? 0 : idx === 1 ? 20 : idx === 2 ? 40 : idx === 3 ? 70 : idx === 4 ? 40 : 100;
    fill.style.width = pct + '%';
  }
  if (idx === 2) setTimeout(() => document.getElementById('ob-family-name')?.focus(), 400);
  if (idx === 3) { obRenderEmojiGrid(); setTimeout(() => document.getElementById('ob-profile-name')?.focus(), 400); }
  if (idx === 4) setTimeout(() => document.getElementById('ob-join-id')?.focus(), 400);
}

function obRenderEmojiGrid() {
  const grid = document.getElementById('ob-emoji-grid');
  if (!grid) return;
  grid.innerHTML = DEFAULT_EMOJIS.map(e =>
    `<button class="ob-emoji-btn${state.obSelectedEmoji === e ? ' sel' : ''}"
      onclick="window._app.obSelectEmoji('${e}')">${e}</button>`
  ).join('');
}

export function obSelectEmoji(e) {
  setState({ obSelectedEmoji: e });
  document.querySelectorAll('#ob-emoji-grid .ob-emoji-btn').forEach(b => {
    b.classList.toggle('sel', b.textContent === e);
  });
}

// ── SHOW FAMILY SETUP SCREEN ──────────────────────────────────
export function showFamilySetup() {
  const ns = document.getElementById('name-screen');
  if (ns) ns.remove();
  // Hide auth screen
  const authEl = document.getElementById('auth-screen');
  if (authEl) authEl.style.display = 'none';
  // Show family/onboarding screen
  const screen = document.getElementById('family-screen');
  if (screen) screen.style.display = 'flex';
  obGoTo(0);
}

// ── CREATE FAMILY ─────────────────────────────────────────────
export async function obCreateFamily() {
  const name = (document.getElementById('ob-family-name')?.value || '').trim();
  const errEl = document.getElementById('ob-create-err');
  if (!name) { if (errEl) errEl.textContent = 'Bitte einen Familiennamen eingeben'; return; }
  if (errEl) errEl.textContent = '';

  const id = genFamilyId();

  // 1. Erst meta schreiben – wenn das fehlschlägt, nichts im State/localStorage speichern
  try {
    await fbFetch(`${DB_ROOT}/families/${id}/meta.json`, {
      method: 'PUT',
      body:   JSON.stringify({ name, created: Date.now() }),
    });
  } catch (e) {
    if (errEl) errEl.textContent = 'Verbindungsfehler. Bitte erneut versuchen.';
    return;
  }

  // 2. Meta erfolgreich → State + localStorage + User setzen
  setState({ familyId: id, familyName: name });
  localStorage.setItem('fp_family_id',   id);
  localStorage.setItem('fp_family_name', name);
  localStorage.setItem('fp_family_role', 'creator');
  window.history.replaceState({}, '', window.location.pathname);

  await saveUserFamily();

  // 3. Index + Public (unkritisch, kein Rollback nötig)
  try {
    await fbFetch(`${DB_ROOT}/admin/familyIndex/${id}.json`, {
      method: 'PUT',
      body:   JSON.stringify({ name, created: Date.now() }),
    });
  } catch { /* familyIndex write skipped */ }

  await syncPublicFamily();

  // ── Admin-Benachrichtigung (fire-and-forget) ──
  // WICHTIG: gezielt per targetUid an jede einzelne Admin-User-ID senden,
  // NICHT familyId:ADMIN_FAMILY_ID verwenden — das würde an ALLE
  // Push-Abonnenten dieser Familie gehen (z.B. auch normale Mitglieder),
  // nicht nur an den/die Admin(s).
  (ADMIN_UIDS || []).forEach(adminUid => {
    fetch(`${PUSH_WORKER_URL}/push/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        familyId: ADMIN_FAMILY_ID,
        targetUid: adminUid,
        type: 'default',
        payload: { text: `🎉 Neue Familie: „${name}“ (${id})` }
      })
    }).catch(() => {});
  });

  obGoTo(5);
}

// ── JOIN FAMILY ───────────────────────────────────────────────
export async function obJoinFamily() {
  const id    = (document.getElementById('ob-join-id')?.value || '').trim().toUpperCase();
  const errEl = document.getElementById('ob-join-err');
  if (!id || id.length < 6) { if (errEl) errEl.textContent = 'Bitte eine gültige Familien-ID eingeben'; return; }
  if (errEl) errEl.textContent = 'Wird gesucht…';

  // Rate-Limiting gegen automatisiertes Durchprobieren von Familien-IDs
  if (!await checkRateLimit('familyJoin')) { if (errEl) errEl.textContent = ''; return; }

  const token = sessionStorage.getItem('fp_pending_join_token') || '';

  try {
    if (token) {
      // ── EINLADUNGS-TOKEN-WEG (empfohlen) ─────────────────────
      // Token pruefen, dann ZUERST atomar als verbraucht markieren
      // (verhindert Mehrfachnutzung bei gleichzeitigen Versuchen),
      // erst NACH erfolgreicher Markierung wird Zugriff gewaehrt.
      const tr = await fbFetch(`${DB_ROOT}/families/${id}/invites/${token}.json`);
      if (!tr.ok) { if (errEl) errEl.textContent = 'Einladung ungültig oder abgelaufen.'; return; }
      const invite = await tr.json();
      if (!invite || invite.usedBy || !invite.expiresAt || invite.expiresAt < Date.now()) {
        if (errEl) errEl.textContent = 'Einladung ungültig, bereits verwendet oder abgelaufen.'; return;
      }

      const consumeRes = await fbFetch(`${DB_ROOT}/families/${id}/invites/${token}.json`, {
        method: 'PATCH',
        body: JSON.stringify({ usedBy: state.currentAuthUser?.uid || 'pending', usedAt: Date.now() }),
      });
      if (!consumeRes.ok) {
        if (errEl) errEl.textContent = 'Einladung wurde inzwischen bereits verwendet.'; return;
      }
      sessionStorage.removeItem('fp_pending_join_token');

      const mr   = await fbFetch(`${DB_ROOT}/families/${id}/meta.json`);
      const meta = mr.ok ? await mr.json() : null;
      const name = (meta && meta.name) || id;

      setState({ familyId: id, familyName: name });
      localStorage.setItem('fp_family_id',   id);
      localStorage.setItem('fp_family_name', name);
      localStorage.setItem('fp_family_role', 'member');
      window.history.replaceState({}, '', window.location.pathname);
      await saveUserFamily();
      if (errEl) errEl.textContent = '';
      obGoTo(5);
      return;
    }

    // ── FALLBACK: manuelle Familien-ID ohne Einladungs-Token ────
    // Familie erst prüfen, DANN State setzen und speichern.
    // WICHTIG: response.ok wird geprüft — eine von den Firebase-Regeln
    // abgelehnte Anfrage (z.B. Status 401) darf NICHT als "Familie
    // gefunden" durchgehen, auch wenn ein JSON-Body zurückkommt.
    const r = await fbFetch(`${DB_ROOT}/families/${id}/meta.json`);
    if (!r.ok) {
      if (errEl) errEl.textContent = 'Familie nicht gefunden. ID prüfen.'; return;
    }
    const meta = await r.json();
    if (!meta) {
      if (errEl) errEl.textContent = 'Familie nicht gefunden. ID prüfen.'; return;
    }
    const name = meta.name || id;
    setState({ familyId: id, familyName: name });
    localStorage.setItem('fp_family_id',   id);
    localStorage.setItem('fp_family_name', name);
    localStorage.setItem('fp_family_role', 'member');
    window.history.replaceState({}, '', window.location.pathname);
    await saveUserFamily();  // erst NACH erfolgreicher Prüfung speichern
    if (errEl) errEl.textContent = '';
    obGoTo(5);
  } catch (e) { if (errEl) errEl.textContent = 'Fehler beim Verbinden.'; }
}

// ── CREATE PROFILE ────────────────────────────────────────────
export async function obCreateProfile() {
  const name  = (document.getElementById('ob-profile-name')?.value || '').trim();
  const errEl = document.getElementById('ob-profile-err');
  if (!name) { if (errEl) errEl.textContent = 'Bitte einen Namen eingeben'; return; }
  if (errEl) errEl.textContent = '';
  if (!await checkRateLimit('member')) return;

  await saveMember(name, state.obSelectedEmoji || '🧑', true, checkRateLimit);
  setState({ curUser: name });
  try { localStorage.setItem('fp_user', name); } catch {}
  bindMemberUid(name).catch(() => {});

  const sub = document.getElementById('ob-done-sub');
  if (sub) sub.textContent = `Hallo ${state.obSelectedEmoji} ${name}! Willkommen bei famiplan.`;
  obGoTo(5);
}

// ── ADD TEMPLATES ─────────────────────────────────────────────
export async function obAddTemplates() {
  const { familyId, curUser } = state;
  if (!familyId || familyId === 'DEMO01') return;
  const todayISO = localISO();
  const todayDay = ['Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag','Sonntag'][jd2i(new Date().getDay())];
  const templates = [
    { title: 'Hausaufgaben kontrollieren', emoji: '📚', time: '16:00', endTime: '16:30', recurring: 'daily',  weekdays: [0,1,2,3,4], type: 'task' },
    { title: 'Wäsche waschen',             emoji: '🧺', time: '09:00', endTime: '',      recurring: 'weekly', weekdays: [], type: 'task' },
    { title: 'Wocheneinkauf',              emoji: '🛒', time: '10:00', endTime: '11:00', recurring: 'weekly', weekdays: [], type: 'task' },
    { title: 'Mülleimer rausstellen',      emoji: '🗑', time: '19:00', endTime: '',      recurring: 'weekly', weekdays: [], type: 'task' },
  ];
  for (const t of templates) {
    const arr = new Uint8Array(4); crypto.getRandomValues(arr);
    const id  = 't_' + Array.from(arr).map(b => b.toString(16).padStart(2,'0')).join('');
    await fbSet(`tasks/${id}`, { ...t, date: todayISO, day: todayDay, color: '#667eea', recurringInterval: 1, assignments: {}, location: '', createdBy: curUser });
  }
  showSync('4 Vorlagen-Aufgaben angelegt ✨');
}

// ── SHARE INVITE FROM ONBOARDING ──────────────────────────────
// ── GEMEINSAME HILFSFUNKTION: Einladungs-Token erzeugen ────────
// Wird von obShareInvite() (Onboarding "Fertig"-Screen) UND
// shareInviteLink() (Profil-Menü) genutzt, damit beide Einstiegspunkte
// konsistent das einmalig nutzbare, 7 Tage gültige Token verwenden statt
// der alten dauerhaften Familien-ID.
async function createInviteLink() {
  const { familyId, familyName, curUser } = state;
  if (!familyId || familyId === 'DEMO01') return null;
  const token = genInviteToken();
  const now = Date.now();
  const EXPIRES_MS = 7 * 24 * 60 * 60 * 1000; // 7 Tage
  // WICHTIG: createdBy braucht einen nicht-leeren Fallback — an dieser
  // Stelle (z.B. Onboarding-"Fertig"-Screen) ist evtl. noch kein eigenes
  // Profil gewählt (state.curUser leer), die Firebase-Regel verlangt aber
  // mindestens 1 Zeichen.
  const createdBy = curUser || familyName || 'Familie';
  await fbFetch(`${DB_ROOT}/families/${familyId}/invites/${token}.json`, {
    method: 'PUT',
    body: JSON.stringify({ createdBy, createdAt: now, expiresAt: now + EXPIRES_MS }),
  });
  return `${location.origin}/join.html?id=${familyId}&token=${token}&name=${encodeURIComponent(familyName)}`;
}

export async function obShareInvite() {
  const { familyId } = state;
  if (!familyId || familyId === 'DEMO01') return;

  let url;
  try {
    url = await createInviteLink();
    if (!url) return;
  } catch (e) {
    showSync('Fehler beim Erstellen der Einladung. Bitte erneut versuchen.');
    return;
  }
  const text = `Hey! Ich nutze famiplan für unsere Familienplanung. Tritt hier bei (Link ist 7 Tage gültig): ${url}`;

  const fallback = () => {
    if (/android|iphone|ipad/i.test(navigator.userAgent)) { window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank'); }
    else { navigator.clipboard?.writeText(url).then(() => showSync('Link kopiert! 📋')).catch(() => showSync('Link: ' + url)); }
  };

  if (navigator.share) {
    // WICHTIG: NUR text übergeben, kein separates url-Feld zusätzlich.
    // Der Link steckt bereits im Text. Übergibt man url zusätzlich,
    // hängt die Web-Share-API (v.a. iOS + WhatsApp) den Link oft ohne
    // Leerzeichen direkt an den Text an - der Link wird dann nicht mehr
    // als anklickbarer Link erkannt (verschmilzt mit dem Text davor).
    navigator.share({ title: 'famiplan – Einladung', text }).catch((e) => {
      if (e && e.name === 'AbortError') return; // Nutzer hat selbst abgebrochen, kein Fehler
      fallback();
    });
  } else {
    fallback();
  }
}

// ── FINISH ONBOARDING ─────────────────────────────────────────
export function obFinish() {
  const screen = document.getElementById('family-screen');
  if (screen) { screen.style.transition = 'opacity 0.4s'; screen.style.opacity = '0'; setTimeout(() => screen.style.display = 'none', 400); }
  const { familyId, familyName } = state;
  const fib = document.getElementById('family-info-bar');
  const fnd = document.getElementById('family-name-display');
  const fid = document.getElementById('family-id-display');
  if (fib) fib.style.display = 'none';
  if (fnd) fnd.textContent  = familyName;
  if (fid) fid.textContent  = familyId;

  // WICHTIG: appInit() erneut aufrufen (state.familyId ist jetzt gesetzt).
  // Das übernimmt zuverlässig alles Nötige – Mitglieder laden, Aufgaben/
  // Einkaufsliste/etc. laden, UND die Profil-Auswahl (showNameScreen)
  // anzeigen, falls noch niemand ausgewählt wurde. Vorher fehlte genau
  // dieser letzte Schritt: nach frischer Registrierung landete man ohne
  // Profil-Auswahl direkt in der App.
  import('../main.js').then(m => m.appInit());

  showInstallPrompt();
  // Trigger first-tab tour after short delay
  setTimeout(() => window._app?.setTab?.('today'), 1200);
}

// ── SHARE INVITE LINK (from user modal) ──────────────────────
export async function shareInviteLink() {
  closeModal();
  const { familyId } = state;
  if (!familyId) return;

  let url;
  try {
    url = await createInviteLink();
    if (!url) return;
  } catch (e) {
    showSync('Fehler beim Erstellen der Einladung. Bitte erneut versuchen.');
    return;
  }
  const text = `Hey! 👋 Ich nutze famiplan für unsere Familienplanung – Aufgaben, Termine & Einkauf auf einen Blick.\n\nTritt hier bei (Link ist 7 Tage gültig): ${url}`;

  if (navigator.share) {
    // Siehe Kommentar in obShareInvite(): NUR text, kein zusaetzliches
    // url-Feld, sonst haengt WhatsApp/iOS den Link ohne Leerzeichen an.
    navigator.share({ title: 'famiplan – Familieneinladung', text }).catch(() => {});
    return;
  }

  openModal(`
    <div class="modal-handle"></div>
    <div class="modal-title">🔗 Familie einladen</div>
    <div class="modal-sub">Teile diesen Link mit deiner Familie – gültig für 7 Tage, einmalig nutzbar</div>
    <div style="background:#F5F3FF;border-radius:12px;padding:12px 14px;margin-bottom:16px;word-break:break-all;font-size:12px;color:#5C4EE5;font-weight:600;border:1px solid #EDE9FE">${url}</div>
    <a href="https://wa.me/?text=${encodeURIComponent(text)}" target="_blank"
      style="display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:14px;background:#25D366;color:white;border:none;border-radius:14px;font-size:15px;font-weight:800;cursor:pointer;font-family:inherit;text-decoration:none;margin-bottom:10px">
      <span style="font-size:20px">💬</span> Per WhatsApp teilen
    </a>
    <button onclick="navigator.clipboard?.writeText('${url}').then(()=>window._app.showSync('Link kopiert! 📋'))"
      style="width:100%;padding:13px;background:#EEF2FF;color:#5C4EE5;border:none;border-radius:14px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;margin-bottom:10px">
      📋 Link kopieren
    </button>
    <button class="modal-close" onclick="window._app.closeModal()">Schließen</button>
  `);
}

// ── INSTALL PROMPT ────────────────────────────────────────────
export function showInstallPrompt(_retryCount = 0) {
  if (localStorage.getItem('fp_install_shown')) return;
  if (localStorage.getItem('fp_demo_mode'))     return;
  if (window.matchMedia('(display-mode: standalone)').matches) return;
  // In der nativen iOS-App (Capacitor) ist "Zum Home-Bildschirm hinzufügen"
  // irrelevant - die App ist ja schon installiert. Nur in der Web-Version zeigen.
  try {
    if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) return;
  } catch (e) { /* kein Capacitor verfuegbar -> normale Web-Version, weiter */ }

  const isIOS     = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isAndroid = /android/i.test(navigator.userAgent);
  const platform  = isIOS ? 'iPhone/iPad' : isAndroid ? 'Android' : 'Desktop';

  let steps = '';
  if (isIOS) {
    steps = `
      <div class="install-step"><div class="install-ico">1</div><div class="install-txt">Tippe auf das <strong>Teilen-Symbol</strong> <span style="font-size:16px">⬆️</span> unten in Safari</div></div>
      <div class="install-step"><div class="install-ico">2</div><div class="install-txt">Wähle <strong>„Zum Home-Bildschirm"</strong> <span style="font-size:16px">➕</span></div></div>
      <div class="install-step"><div class="install-ico">3</div><div class="install-txt">Tippe oben rechts auf <strong>„Hinzufügen"</strong></div></div>`;
  } else if (isAndroid) {
    steps = `
      <div class="install-step"><div class="install-ico">1</div><div class="install-txt">Tippe oben rechts auf das <strong>Menü ⋮</strong> in Chrome</div></div>
      <div class="install-step"><div class="install-ico">2</div><div class="install-txt">Wähle <strong>„App installieren"</strong></div></div>
      <div class="install-step"><div class="install-ico">3</div><div class="install-txt">Tippe auf <strong>„Installieren"</strong> – fertig!</div></div>`;
  } else {
    steps = `
      <div class="install-step"><div class="install-ico">1</div><div class="install-txt">Klicke in der Adressleiste auf das <strong>Install-Symbol</strong> ⊕</div></div>
      <div class="install-step"><div class="install-ico">2</div><div class="install-txt">Klicke auf <strong>„Installieren"</strong></div></div>`;
  }

  setTimeout(() => {
    // Nicht anzeigen, wenn gerade ein anderes Modal offen ist (z.B. das
    // automatische "Erstes Profil"-Modal nach obFinish()) - sonst würde
    // openModal() dieses Modal sofort schließen (openModal() ruft intern
    // immer erst closeModal() auf). Stattdessen später erneut versuchen
    // (max. 5x, danach aufgeben statt endlos zu verzögern).
    if (state.modalEl) {
      if (_retryCount < 5) setTimeout(() => showInstallPrompt(_retryCount + 1), 1500);
      return;
    }
    localStorage.setItem('fp_install_shown', '1');
    openModal(`
    <div class="modal-handle"></div>
    <div style="text-align:center;margin-bottom:16px">
      <div style="font-size:48px;margin-bottom:8px">📲</div>
      <div class="modal-title">App installieren</div>
      <div class="modal-sub">Füge famiplan zum Homescreen hinzu.</div>
    </div>
    <div style="background:#F5F3FF;border-radius:14px;padding:16px;margin-bottom:16px">
      <div style="font-size:11px;font-weight:700;color:#8b5cf6;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:12px">${platform}</div>
      <div style="display:flex;flex-direction:column;gap:10px">${steps}</div>
    </div>
    <button class="submit-btn" onclick="window._app.closeModal()">Verstanden ✓</button>
    <button class="modal-close" onclick="window._app.closeModal()">Später</button>
  `);
  }, 1000);
}

// ── FAB ───────────────────────────────────────────────────────
export function onFabClick() {
  const { tab, selISO, calSelISO } = state;
  if (tab === 'shop') { window._app.showShopAddModal(); return; }
  if (tab === 'meals') {
    import('./modals.js').then(m => m.showMealEditModal(localISO(), 'dinner'));
    return;
  }
  const iso = tab === 'cal' ? calSelISO : selISO;
  setState({ fd: { ...state.fd, date: iso, day: dayFromISO(iso) } });
  import('./modals.js').then(m => m.showAddModal());
}

// ── DEMO MODE ─────────────────────────────────────────────────
export function obShowDemo() {
  const todayISO = localISO();
  const todayDay = ['Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag','Sonntag'][jd2i(new Date().getDay())];

  // Hilfsfunktion für ISO-Offsets
  const isoPlus = (days) => {
    const d = new Date(todayISO + 'T12:00:00');
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };
  const tomorrowISO = isoPlus(1);
  const in2ISO      = isoPlus(2);
  const in3ISO      = isoPlus(3);

  setState({
    familyId:       'DEMO01',
    familyName:     'Familie Demo',
    members:        ['Mama','Papa','Lea'],
    av:             { 'Mama': '👩', 'Papa': '👨', 'Lea': '👧' },
    memberColorMap: { 'Mama': '#5C4EE5', 'Papa': '#E53E3E', 'Lea': '#38A169' },
    curUser:        'Mama',
    dayNotes:       { [todayISO]: 'Heute: Lea hat Schulausflug! 🚌' },

    // ── Aufgaben & Termine ────────────────────────────────────────
    tasks: [
      // Heute – Morgen
      { id: 'demo1', title: 'Lea zur Schule bringen',    emoji: '🎒', date: todayISO, day: todayDay, time: '07:30', endTime: '08:00', recurring: 'daily',  recurringInterval: 1, weekdays: [0,1,2,3,4], type: 'event', color: '#5C4EE5', assignments: { [todayISO]: { assignedTo: 'Papa', done: true  } }, location: 'Grundschule', createdBy: 'Mama' },
      { id: 'demo2', title: 'Einkauf Rewe',               emoji: '🛒', date: todayISO, day: todayDay, time: '10:00', endTime: '',       recurring: 'once',   recurringInterval: 1, weekdays: [],         type: 'task',  color: '#E53E3E', assignments: { [todayISO]: { assignedTo: 'Mama', done: false } }, location: 'Rewe', createdBy: 'Mama' },
      // Heute – Nachmittag
      { id: 'demo3', title: 'Hausaufgaben kontrollieren', emoji: '📚', date: todayISO, day: todayDay, time: '15:00', endTime: '15:30', recurring: 'daily',  recurringInterval: 1, weekdays: [0,1,2,3,4], type: 'task',  color: '#667eea', assignments: { [todayISO]: { assignedTo: 'Papa', done: false } }, location: '', createdBy: 'Mama' },
      { id: 'demo4', title: 'Fußballtraining Lea',        emoji: '⚽', date: todayISO, day: todayDay, time: '16:30', endTime: '18:00', recurring: 'weekly', recurringInterval: 1, weekdays: [],         type: 'event', color: '#38A169', assignments: { [todayISO]: { assignedTo: 'Papa', done: false } }, location: 'Sportplatz Nord', createdBy: 'Papa' },
      // Heute – Abend
      { id: 'demo5', title: 'Abendessen kochen',          emoji: '🍝', date: todayISO, day: todayDay, time: '18:30', endTime: '19:00', recurring: 'once',   recurringInterval: 1, weekdays: [],         type: 'task',  color: '#F59E0B', assignments: { [todayISO]: { assignedTo: 'Mama', done: false } }, location: '', createdBy: 'Mama' },
      // Morgen
      { id: 'demo6', title: 'Zahnarzt Lea',               emoji: '🦷', date: tomorrowISO, day: dayFromISO(tomorrowISO), time: '09:00', endTime: '09:30', recurring: 'once', recurringInterval: 1, weekdays: [], type: 'event', color: '#EC4899', assignments: {}, location: 'Dr. Müller Praxis', createdBy: 'Mama' },
      { id: 'demo7', title: 'Müll rausbringen',           emoji: '🗑️', date: tomorrowISO, day: dayFromISO(tomorrowISO), time: '07:00', endTime: '', recurring: 'weekly', recurringInterval: 1, weekdays: [], type: 'task',  color: '#6B7280', assignments: {}, location: '', createdBy: 'Papa' },
      // Übermorgen
      { id: 'demo8', title: 'Elternabend',                emoji: '🏫', date: in2ISO, day: dayFromISO(in2ISO), time: '19:30', endTime: '21:00', recurring: 'once', recurringInterval: 1, weekdays: [], type: 'event', color: '#5C4EE5', assignments: {}, location: 'Grundschule Aula', createdBy: 'Mama' },
      // In 3 Tagen
      { id: 'demo9', title: 'Geburtstag Oma',             emoji: '🎂', date: in3ISO, day: dayFromISO(in3ISO), time: '14:00', endTime: '17:00', recurring: 'yearly', recurringInterval: 1, weekdays: [], type: 'event', color: '#EC4899', assignments: {}, location: '', createdBy: 'Mama' },
      // Open To-Do
      { id: 'demotodo1', title: 'Urlaub buchen',          emoji: '✈️', openTodo: true, time: '12:00', color: '#F59E0B', assignments: {}, recurring: 'once', recurringInterval: 1, weekdays: [], type: 'task', createdBy: 'Mama', visibleTo: 'all' },
    ],

    // ── Einkaufsliste ─────────────────────────────────────────────
    shopItems: [
      { id: 'si1', name: 'Milch',         qty: 2,  unit: 'L',    category: 'milch',    list: 'Wocheneinkauf', checked: false, fav: true,  addedAt: Date.now()-3600000 },
      { id: 'si2', name: 'Äpfel',         qty: 6,  unit: '',     category: 'obst',     list: 'Wocheneinkauf', checked: false, fav: false, addedAt: Date.now()-3200000 },
      { id: 'si3', name: 'Hackfleisch',   qty: 500,unit: 'g',    category: 'fleisch',  list: 'Wocheneinkauf', checked: false, fav: false, addedAt: Date.now()-2800000 },
      { id: 'si4', name: 'Pasta',         qty: 2,  unit: 'Pck',  category: 'sonstiges',list: 'Wocheneinkauf', checked: true,  fav: true,  addedAt: Date.now()-2400000 },
      { id: 'si5', name: 'Dosentomaten',  qty: 3,  unit: 'Dose', category: 'sonstiges',list: 'Wocheneinkauf', checked: false, fav: false, addedAt: Date.now()-2000000 },
      { id: 'si6', name: 'Brot',          qty: 1,  unit: '',     category: 'brot',     list: 'Wocheneinkauf', checked: true,  fav: true,  addedAt: Date.now()-1600000 },
      { id: 'si7', name: 'Spülmittel',    qty: 1,  unit: '',     category: 'haushalt', list: 'Wocheneinkauf', checked: false, fav: false, addedAt: Date.now()-1200000 },
    ],
    shopLists:      ['Wocheneinkauf'],
    activeShopList: 'Wocheneinkauf',

    // ── Mahlzeiten ────────────────────────────────────────────────
    meals: {
      [todayISO]:    { breakfast: { name: 'Müsli mit Früchten', ingredients: ['Haferflocken','Milch','Banane'], savedAt: Date.now() }, lunch: null, dinner: { name: 'Spaghetti Bolognese', ingredients: ['Hackfleisch 500g','Pasta 400g','Dosentomaten 1 Dose','Zwiebeln 2','Knoblauch 3 Zehen','Olivenöl 2 EL'], recipeId: 'r1', savedAt: Date.now() } },
      [tomorrowISO]: { breakfast: { name: 'Pfannkuchen', ingredients: ['Mehl 200g','Eier 2','Milch 300ml','Butter 1 EL'], recipeId: 'r2', savedAt: Date.now() }, lunch: { name: 'Reste vom Vortag', ingredients: [], savedAt: Date.now() }, dinner: null },
      [in2ISO]:      { breakfast: null, lunch: null, dinner: { name: 'Pizzaabend 🍕', ingredients: ['Pizzateig','Tomatensoße','Mozzarella','Salami'], savedAt: Date.now() } },
    },
    mealRecipes: {
      'r1': {
        name: 'Spaghetti Bolognese',
        ingredients: ['Hackfleisch 500g','Pasta 400g','Dosentomaten 1 Dose','Zwiebeln 2','Knoblauch 3 Zehen','Olivenöl 2 EL'],
        prepTime: 35,
        servings: 4,
        useCount: 5,
        usedAt: Date.now()-86400000,
        steps: [
          'Zwiebeln und Knoblauch fein hacken und in Olivenöl glasig dünsten.',
          'Hackfleisch dazugeben und krümelig anbraten bis es gebräunt ist.',
          'Dosentomaten hinzufügen, salzen und pfeffern. 20 Minuten köcheln lassen.',
          'Pasta nach Packungsanleitung al dente kochen. Mit der Soße servieren.',
        ],
      },
      'r2': {
        name: 'Pfannkuchen',
        ingredients: ['Mehl 200g','Eier 2','Milch 300ml','Butter 1 EL','Zucker 1 TL','Prise Salz'],
        prepTime: 20,
        servings: 4,
        useCount: 3,
        usedAt: Date.now()-172800000,
        steps: [
          'Mehl, Eier, Milch, Zucker und Salz zu einem glatten Teig verrühren. 10 Minuten quellen lassen.',
          'Butter in einer Pfanne erhitzen und den Teig portionsweise ausbacken.',
          'Jeden Pfannkuchen goldbraun von beiden Seiten backen und warm halten.',
        ],
      },
      'r3': {
        name: 'Hühnchen-Curry',
        ingredients: ['Hähnchenbrustfilet 600g','Kokosmilch 400ml','Currypaste 2 EL','Paprika 2','Zwiebel 1','Reis 300g'],
        prepTime: 30,
        servings: 4,
        useCount: 2,
        usedAt: Date.now()-259200000,
        steps: [
          'Hähnchen in Würfel schneiden, Paprika und Zwiebel klein schneiden.',
          'Zwiebel anbraten, Currypaste kurz mitrösten, dann Hähnchen dazugeben.',
          'Kokosmilch und Paprika hinzufügen, 15 Minuten köcheln lassen.',
          'Reis nach Packungsanleitung kochen und zusammen servieren.',
        ],
      },
      'r4': {
        name: 'Gemüse-Frittata',
        ingredients: ['Eier 6','Zucchini 1','Paprika 1','Zwiebel 1','Parmesan 50g','Olivenöl 2 EL','Salz','Pfeffer'],
        prepTime: 25,
        servings: 3,
        useCount: 1,
        usedAt: Date.now()-432000000,
        steps: [
          'Gemüse in kleine Würfel schneiden und in Olivenöl 5 Minuten anbraten.',
          'Eier mit Parmesan, Salz und Pfeffer verquirlen und über das Gemüse gießen.',
          'Bei mittlerer Hitze stocken lassen, dann unter dem Grill 3–4 Minuten überbacken.',
        ],
      },
    },

    // ── Board-Posts ───────────────────────────────────────────────
    boardPosts: {
      'bp1': { author: 'Papa',  text: 'Lea hat heute ihr erstes Tor beim Training geschossen! 🥳⚽', ts: Date.now()-3600000*2,  reactions: { 'uid_mama': '❤️', 'uid_lea': '🙌' } },
      'bp2': { author: 'Mama',  text: 'Bett wird am 15. geliefert – bitte jemand zuhause sein! 🛏️', ts: Date.now()-3600000*14, reactions: { 'uid_papa': '👍' } },
      'bp3': { author: 'Lea',   text: 'Kann ich heute Abend noch eine Stunde länger aufbleiben? 🙏😇', ts: Date.now()-3600000*20, reactions: {} },
    },
  });
  localStorage.setItem('fp_family_id',   'DEMO01');
  localStorage.setItem('fp_family_name', 'Familie Demo');
  localStorage.setItem('fp_demo_mode',   '1');
  try { localStorage.setItem('fp_user', 'Mama'); } catch {}

  hideAuthScreen();
  const screen = document.getElementById('family-screen');
  if (screen) { screen.style.transition = 'opacity 0.4s'; screen.style.opacity = '0'; setTimeout(() => screen.style.display = 'none', 400); }
  const fib = document.getElementById('family-info-bar');
  const fnd = document.getElementById('family-name-display');
  const fid = document.getElementById('family-id-display');
  if (fib) fib.style.display = 'none';
  if (fnd) fnd.textContent = 'Familie Demo';
  if (fid) fid.textContent = 'DEMO01';
  const ub = document.getElementById('user-btn');
  if (ub) ub.textContent = '👩 Mama';
  window._app?.renderContent();

  const banner = document.createElement('div');
  banner.id = 'demo-banner';
  banner.style.cssText = 'position:fixed;top:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;background:#F59E0B;color:white;text-align:center;padding:max(env(safe-area-inset-top),10px) 16px 10px;font-size:13px;font-weight:700;z-index:500;display:flex;align-items:center;justify-content:space-between;gap:8px;box-shadow:0 2px 8px rgba(0,0,0,0.15)';
  banner.innerHTML = '<span>👀 Demo-Modus</span><button onclick="window._app.exitDemoMode()" style="background:var(--surface);color:#F59E0B;border:none;border-radius:8px;padding:5px 12px;font-size:12px;font-weight:800;cursor:pointer;font-family:inherit;flex-shrink:0">Registrieren →</button>';
  document.body.appendChild(banner);
  const area = document.getElementById('scroll-area');
  if (area) area.style.paddingTop = 'calc(max(env(safe-area-inset-top),10px) + 42px)';
}

export function exitDemoMode() {
  ['fp_family_id','fp_family_name','fp_user','fp_demo_mode'].forEach(k => localStorage.removeItem(k));
  location.reload();
}


