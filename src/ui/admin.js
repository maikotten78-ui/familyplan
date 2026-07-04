// ══════════════════════════════════════════════════════════════
// famiplan – admin.js  (Phase 7b)
// Admin-Panel: Familienliste, Freizugang, Löschen
// ══════════════════════════════════════════════════════════════

import { DB_ROOT } from '../modules/config.js';
import { state, setState } from '../modules/state.js';
import { fbFetch, getAuthToken } from '../modules/firebase.js';
import { isAdmin } from '../modules/premium.js';
import { escapeHtml } from '../modules/utils.js';
import { openModal, closeModal, showSync } from './modal.js';

const A = fn => `window._app.${fn}`;

// ── LOAD HELPERS ──────────────────────────────────────────────
async function loadAdminUsers() {
  if (!isAdmin()) return null;
  try {
    const r    = await fbFetch(`${DB_ROOT}/admin/familyIndex.json?t=${Date.now()}`);
    const text = await r.text();
    if (r.status !== 200) return { _error: `HTTP ${r.status}: ${text.slice(0, 100)}` };
    const index = JSON.parse(text);
    if (!index) return {};

    const result = {};
    const withTimeout = (p, ms = 5000) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);

    await Promise.all(Object.entries(index).map(async ([fid, meta]) => {
      try {
        const [mR, aR, laR] = await withTimeout(Promise.all([
          fbFetch(`${DB_ROOT}/families/${fid}/members.json`),
          fbFetch(`${DB_ROOT}/families/${fid}/access.json`),
          fbFetch(`${DB_ROOT}/families/${fid}/lastActiveAt.json`),
        ]));
        const members      = mR.ok  ? await mR.json()  : null;
        const access       = aR.ok  ? await aR.json()  : null;
        const lastActiveAt = laR.ok ? await laR.json() : null;
        result[fid] = {
          familyId:     fid,
          familyName:   meta.name || fid,
          memberCount:  members ? Object.keys(members).length : 0,
          created:      meta.created || 0,
          lastActiveAt: lastActiveAt || 0,
          granted:      access?.granted || false,
          note:         access?.note || '',
        };
      } catch (e) {
        result[fid] = { familyId: fid, familyName: meta.name || fid, memberCount: '?', created: meta.created || 0, lastActiveAt: 0, granted: false, note: '' };
      }
    }));
    return result;
  } catch (e) { return { _error: e.message }; }
}

async function loadAdminSettings() {
  if (!isAdmin()) return {};
  try {
    const r    = await fbFetch(`${DB_ROOT}/admin/settings.json`);
    const data = await r.json();
    return data || {};
  } catch (e) { return {}; }
}

// ── FAMILY LIST ───────────────────────────────────────────────
function familyRow(fid, f) {
  const isGranted  = f.granted === true;
  const statusBadge = isGranted
    ? `<span style="background:#ECFDF5;color:#059669;font-size:10px;font-weight:700;padding:2px 7px;border-radius:4px">✓ Freizugang</span>`
    : `<span style="background:var(--bg3);color:var(--text3);font-size:10px;font-weight:700;padding:2px 7px;border-radius:4px">Standard</span>`;
  const actionBtn = isGranted
    ? `<button onclick="window._app.adminRevokeFamily('${fid}')" style="font-size:11px;padding:5px 10px;border:1px solid var(--border);border-radius:6px;background:var(--surface);color:#DC2626;cursor:pointer;font-family:inherit;font-weight:600">Entziehen</button>`
    : `<button onclick="window._app.adminGrantFamily('${fid}')" style="font-size:11px;padding:5px 10px;border:none;border-radius:6px;background:#5C4EE5;color:white;cursor:pointer;font-family:inherit;font-weight:600">Freizugang</button>`;
  const deleteBtn = `<button data-fid="${escapeHtml(fid)}" data-fname="${escapeHtml(f.familyName || '')}"
    class="admin-delete-btn"
    style="font-size:11px;padding:5px 8px;border:1px solid #FECACA;border-radius:6px;background:var(--surface);color:#DC2626;cursor:pointer;font-family:inherit;font-weight:600">
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5 4V2.5h4V4M5.5 6.5v4M8.5 6.5v4M3 4l.8 7.5h6.4L11 4" stroke="#6b7280" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </button>`;
  const date       = f.created      ? new Date(f.created).toLocaleDateString('de', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '–';
  const lastActive = f.lastActiveAt ? new Date(f.lastActiveAt).toLocaleDateString('de', { day: '2-digit', month: '2-digit', year: '2-digit' }) : null;
  return `<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #F5F6FA">
    <div style="flex:1;min-width:0">
      <div style="font-size:13px;font-weight:600;color:var(--text1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">🏠 ${escapeHtml(f.familyName)}</div>
      <div style="font-size:11px;color:var(--text3);margin-top:2px">${f.memberCount} Mitglied${f.memberCount === 1 ? '' : 'er'} · seit ${date}${lastActive ? ' · zuletzt ' + lastActive : ''}</div>
      ${f.note ? `<div style="font-size:11px;color:var(--text2);margin-top:2px">📝 ${escapeHtml(f.note)}</div>` : ''}
    </div>
    ${statusBadge}${actionBtn}${deleteBtn}
  </div>`;
}

async function refreshAdminList() {
  const list = document.getElementById('admin-list');
  if (!list) return;
  list.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text3);font-size:13px">Lade…</div>';
  const families = await loadAdminUsers();
  if (!list.isConnected) return;
  if (!families || families._error) {
    list.innerHTML = `<div style="color:#DC2626;font-size:12px;padding:8px 0">${families?._error || 'Fehler beim Laden'}</div>`;
    return;
  }
  const entries = Object.entries(families).sort((a, b) => b[1].created - a[1].created);
  if (!entries.length) { list.innerHTML = '<div style="color:var(--text3);font-size:13px;text-align:center;padding:16px 0">Noch keine Familien.</div>'; return; }
  list.innerHTML = entries.map(([fid, f]) => familyRow(fid, f)).join('');

  // Delete button via event delegation
  list.addEventListener('click', e => {
    const btn = e.target.closest('.admin-delete-btn');
    if (btn) adminDeleteFamily(btn.dataset.fid, btn.dataset.fname);
  }, { once: true });
}

// ── GRANT / REVOKE ────────────────────────────────────────────
export async function adminGrantFamily(familyId) {
  if (!isAdmin()) return;
  const note = prompt('Notiz (optional, z.B. "Beta Tester"):', '') ?? '';
  if (note === null) return;
  await fbFetch(`${DB_ROOT}/families/${familyId}/access.json`, {
    method: 'PUT',
    body: JSON.stringify({ granted: true, grantedBy: state.currentAuthUser.uid, note, grantedAt: Date.now() }),
  });
  showSync('✓ Freizugang gewährt');
  refreshAdminList();
}

export async function adminRevokeFamily(familyId) {
  if (!isAdmin()) return;
  await fbFetch(`${DB_ROOT}/families/${familyId}/access.json`, { method: 'DELETE' });
  showSync('✓ Freizugang entzogen');
  refreshAdminList();
}

// ── BULK INDEX ────────────────────────────────────────────────
export async function adminBulkIndexFamilies() {
  if (!isAdmin()) return;
  // Liest IDs aus admin/familyIndex (statt families.json?shallow=true,
  // das durch Firebase Rules geblockt werden kann)
  const r    = await fbFetch(`${DB_ROOT}/admin/familyIndex.json`);
  const index = await r.json();
  if (!index) { showSync('Keine Familien im Index gefunden.'); return; }
  const allIds = Object.keys(index);
  showSync('Indexiere ' + allIds.length + ' Familien…');

  let count = 0;
  await Promise.all(allIds.map(async fid => {
    try {
      const mr   = await fbFetch(`${DB_ROOT}/families/${fid}/meta.json`);
      const meta = await mr.json();
      if (!meta?.name) return; // Familie hat keinen Namen in meta → überspringen
      const wr   = await fbFetch(`${DB_ROOT}/admin/familyIndex/${fid}.json`, {
        method: 'PUT',
        body:   JSON.stringify({ name: meta.name, created: meta.created || index[fid]?.created || Date.now() }),
      });
      if (wr.ok) count++;
    } catch (e) { console.warn(fid, 'Fehler:', e.message); }
  }));

  showSync(`✅ ${count} von ${allIds.length} Familien aktualisiert`);
  refreshAdminList();
}

// ── DELETE FAMILY ─────────────────────────────────────────────
export function adminDeleteFamily(familyId, familyName) {
  if (!isAdmin()) { showSync('Kein Zugriff.'); return; }
  closeModal();

  const ov = document.createElement('div');
  ov.className = 'modal-overlay';
  ov.innerHTML = `<div class="modal">
    <div class="modal-handle"></div>
    <div style="text-align:center;font-size:36px;margin-bottom:12px">🗑️</div>
    <div class="modal-title" style="color:#DC2626">Familie löschen</div>
    <div class="modal-sub" style="margin-bottom:16px">Diese Aktion kann nicht rückgängig gemacht werden.</div>
    <div style="background:#FEF2F2;border-radius:10px;padding:12px 14px;margin-bottom:20px;font-size:13px;color:#991b1b;line-height:1.6">
      <strong>${escapeHtml(familyName)}</strong><br>Löscht ALLE Daten dieser Familie unwiderruflich.
    </div>
    <div id="admin-del-status" style="display:none;text-align:center;padding:8px;font-size:13px;color:#DC2626;font-weight:600"></div>
    <button id="admin-del-confirm" style="width:100%;padding:14px;border:none;border-radius:12px;background:#DC2626;color:white;font-size:15px;font-weight:800;cursor:pointer;font-family:inherit;margin-bottom:8px">Ja, unwiderruflich löschen</button>
    <button id="admin-del-cancel" style="width:100%;padding:12px;border:1px solid var(--border);border-radius:12px;background:var(--surface);font-size:14px;cursor:pointer;font-family:inherit">Abbrechen</button>
  </div>`;
  document.body.appendChild(ov);
  setState({ modalEl: ov });
  requestAnimationFrame(() => requestAnimationFrame(() => {
    ov.classList.add('show');
    const confirmBtn = ov.querySelector('#admin-del-confirm');
    const cancelBtn  = ov.querySelector('#admin-del-cancel');
    const statusEl   = ov.querySelector('#admin-del-status');
    let _confirmed   = false;

    confirmBtn.addEventListener('click', async function() {
      if (!_confirmed) {
        _confirmed = true;
        confirmBtn.textContent = 'Wirklich? Nochmal klicken!';
        confirmBtn.style.background = '#991b1b';
        statusEl.style.display = 'block';
        statusEl.textContent = '⚠️ Diese Aktion kann nicht rückgängig gemacht werden!';
        setTimeout(() => {
          if (_confirmed) { _confirmed = false; confirmBtn.textContent = 'Ja, unwiderruflich löschen'; confirmBtn.style.background = '#DC2626'; statusEl.style.display = 'none'; }
        }, 4000);
        return;
      }
      confirmBtn.disabled = true; confirmBtn.textContent = 'Lösche…'; statusEl.style.display = 'none';
      try {
        const r1 = await fbFetch(`${DB_ROOT}/families/${familyId}.json`, { method: 'DELETE' });
        if (!r1.ok) throw new Error('families ' + r1.status);
        await fbFetch(`${DB_ROOT}/admin/familyIndex/${familyId}.json`, { method: 'DELETE' });
        await fbFetch(`${DB_ROOT}/public/${familyId}.json`, { method: 'DELETE' }).catch(() => {});
        ov.classList.remove('show');
        setTimeout(() => { ov.remove(); setState({ modalEl: null }); showSync('✓ Familie gelöscht'); showAdminPanel(); }, 300);
      } catch (e) {
        _confirmed = false;
        confirmBtn.disabled = false; confirmBtn.textContent = 'Ja, unwiderruflich löschen'; confirmBtn.style.background = '#DC2626';
        statusEl.style.display = 'block'; statusEl.textContent = 'Fehler: ' + e.message;
      }
    });

    cancelBtn.addEventListener('click', () => { closeModal(); showAdminPanel(); });
  }));
}

// ── BROADCAST PUSH ───────────────────────────────────────────
export async function adminSendBroadcast() {
  if (!isAdmin()) return;
  const title = document.getElementById('bc-title')?.value?.trim();
  const body  = document.getElementById('bc-body')?.value?.trim();
  if (!title || !body) { showSync('⚠️ Titel und Text ausfüllen'); return; }

  const btn = document.getElementById('bc-send-btn');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Sende…'; }

  try {
    const authToken = await getAuthToken();
    const r = await fetch(`${PUSH_WORKER_URL}/push/broadcast`, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + authToken,
      },
      body: JSON.stringify({ title, body, tag: 'famiplan-update', url: '/' }),
    });
    const result = await r.json().catch(() => ({}));
    const sent   = result.sent || 0;
    showSync(`✅ Update-Push gesendet an ${sent} Geräte`);
    if (btn) { btn.disabled = false; btn.textContent = '📢 Jetzt senden'; }
    // Felder leeren
    if (document.getElementById('bc-title')) document.getElementById('bc-title').value = '';
    if (document.getElementById('bc-body'))  document.getElementById('bc-body').value  = '';
  } catch (e) {
    showSync('Fehler: ' + e.message);
    if (btn) { btn.disabled = false; btn.textContent = '📢 Jetzt senden'; }
  }
}

// ── MAIN PANEL ────────────────────────────────────────────────
export async function showAdminPanel() {
  if (!isAdmin()) { showSync('Kein Zugriff.'); return; }
  openModal(`
    <div class="modal-handle"></div>
    <div class="modal-title">🛡 Admin-Panel</div>

    <div id="admin-settings" style="margin-bottom:14px">
      <div style="text-align:center;padding:10px;color:var(--text3);font-size:12px">Lade…</div>
    </div>

    <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">📢 Update-Benachrichtigung</div>
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:14px">
      <input id="bc-title" class="form-input" placeholder="Titel (z.B. famiplan Update 🚀)"
        style="margin-bottom:8px"
        value="famiplan Update 🚀"/>
      <textarea id="bc-body" class="form-input" rows="4"
        style="resize:none;line-height:1.5;margin-bottom:10px"
        placeholder="Was ist neu?"
      >✨ Kalender: Wischgesten & Zoom-Stufen&#10;📋 Tagesansicht: Zeitraum-Gruppen & direktes Abhaken&#10;🏠 Home: Schnellzugriff & Demnächst-Widget&#10;🛒 Einkauf: Autovervollständigung & Sofort-Hinzufügen&#10;🍽️ Mahlzeiten: Rezept-Vorschläge & Wochentransfer</textarea>
      <button id="bc-send-btn" onclick="${A('adminSendBroadcast()')}"
        style="width:100%;padding:12px;background:#5C4EE5;color:white;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit">
        📢 Jetzt senden
      </button>
      <div style="font-size:11px;color:var(--text3);text-align:center;margin-top:6px">Sendet an alle aktiven Push-Subscriptions aller Nutzer</div>
    </div>

    <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between">
      <span>Familien</span>
      <button onclick="${A('adminBulkIndexFamilies()')}" style="font-size:11px;padding:4px 10px;border:1px solid var(--border);border-radius:6px;background:var(--surface);color:#5C4EE5;cursor:pointer;font-family:inherit;font-weight:600">Alle indexieren</button>
    </div>
    <div id="admin-list"><div style="text-align:center;padding:20px;color:var(--text3);font-size:13px">Lade Familien…</div></div>
    <button class="modal-close" onclick="${A('closeModal()')}">Schließen</button>
  `);

  const [settings] = await Promise.all([loadAdminSettings(), refreshAdminList()]);
  const settingsEl = document.getElementById('admin-settings');
  if (settingsEl) {
    settingsEl.innerHTML = `
      <div style="background:#ECFDF5;border-radius:12px;padding:12px 14px;border:1px solid #D1FAE5">
        <div style="font-size:13px;font-weight:600;color:#059669">✓ famiplan Plus ist aktiv</div>
        <div style="font-size:11px;color:var(--text2);margin-top:2px">Zahlungen laufen über LemonSqueezy</div>
      </div>`;
  }
}


