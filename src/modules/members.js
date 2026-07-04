import { DB_ROOT, MEMBER_COLORS, DEFAULT_EMOJIS } from './config.js';
import { state, setState } from './state.js';
import { fbGet, fbSet, fbDel, fbFetch, syncPublicFamily, ensureFamilyInIndex } from './firebase.js';
import { saveCache, loadCache } from './cache.js';
import { escapeHtml, escapeAttr } from './utils.js';

// ── COLOR HELPERS ─────────────────────────────────────────────
export function getMemberColor(name) {
  return state.memberColorMap[name] || '#9ba3af';
}

export function assignMemberColor(name) {
  if (state.memberColorMap[name]) return state.memberColorMap[name];
  const used = new Set(Object.values(state.memberColorMap));
  const free = MEMBER_COLORS.find(c => !used.has(c)) || MEMBER_COLORS[state.members.length % MEMBER_COLORS.length];
  setState({ memberColorMap: { ...state.memberColorMap, [name]: free } });
  return free;
}

// ── LOAD ──────────────────────────────────────────────────────
export async function loadMembers(renderContent, showAddMemberModal) {
  const applyData = (data) => {
    const members = Object.keys(data);
    const av      = {};
    const colorMap = {};
    members.forEach(m => {
      av[m] = data[m].emoji || '🧑';
      if (data[m].color) colorMap[m] = data[m].color;
    });
    // Back-fill missing colors
    members.forEach(m => {
      if (!colorMap[m]) colorMap[m] = assignMemberColor(m);
    });
    setState({ members, av, memberColorMap: colorMap });
  };

  try {
    const data = await fbGet('members');
    if (data && Object.keys(data).length > 0) {
      applyData(data);
      saveCache('members', data);
    } else {
      const cached = loadCache('members');
      if (cached && Object.keys(cached).length > 0) {
        applyData(cached);
      }
      if (state.members.length === 0) setTimeout(() => showAddMemberModal(true), 600);
    }
  } catch (e) {
    const cached = loadCache('members');
    if (cached) applyData(cached);
  }

  renderContent();
  if (state.familyId) setTimeout(() => ensureFamilyInIndex(), 1500);
}

// ── SAVE ──────────────────────────────────────────────────────
export async function saveMember(name, emoji, skipRateLimit = false, checkRateLimit) {
  if (!name || state.members.includes(name)) return;
  if (!skipRateLimit && !await checkRateLimit('member')) return;
  // Free-Limit: max. 3 Mitglieder
  const { checkFreeLimit } = await import('./premium.js');
  if (checkFreeLimit('members', state.members.length)) return;

  const color = assignMemberColor(name);
  await fbSet(`members/${name}`, { emoji, color, createdAt: Date.now() });

  setState({
    members:       [...state.members, name],
    av:            { ...state.av, [name]: emoji },
    memberColorMap: { ...state.memberColorMap, [name]: color },
  });

  const cached = loadCache('members') || {};
  cached[name] = { emoji, color };
  saveCache('members', cached);
  syncPublicFamily();
}

// ── RENAME ────────────────────────────────────────────────────
export async function renameMember(oldName, newName, emoji, renderContent) {
  const color = state.memberColorMap[oldName] || assignMemberColor(oldName);

  if (!newName || newName === oldName) {
    // Only emoji update
    await fbSet(`members/${oldName}`, { emoji: emoji || state.av[oldName], color, createdAt: Date.now() });
    setState({ av: { ...state.av, [oldName]: emoji || state.av[oldName] } });
    const cached = loadCache('members') || {};
    cached[oldName] = { emoji: state.av[oldName], color };
    saveCache('members', cached);
    renderContent();
    return;
  }

  await fbSet(`members/${newName}`, { emoji: emoji || state.av[oldName], color, createdAt: Date.now() });
  await fbDel(`members/${oldName}`);

  const av       = { ...state.av,       [newName]: emoji || state.av[oldName] };
  const colorMap = { ...state.memberColorMap, [newName]: color };
  delete av[oldName];
  delete colorMap[oldName];

  let curUser = state.curUser;
  if (curUser === oldName) {
    curUser = newName;
    try { localStorage.setItem('fp_user', newName); } catch {}
  }

  setState({
    members:        state.members.map(m => m === oldName ? newName : m),
    av,
    memberColorMap: colorMap,
    curUser,
  });

  const cached = loadCache('members') || {};
  cached[newName] = { emoji: av[newName], color };
  delete cached[oldName];
  saveCache('members', cached);
  renderContent();
  syncPublicFamily();
}

// ── DELETE ────────────────────────────────────────────────────
export async function deleteMember(name, renderContent) {
  await fbDel(`members/${name}`);

  const av       = { ...state.av };
  const colorMap = { ...state.memberColorMap };
  delete av[name];
  delete colorMap[name];

  let curUser = state.curUser;
  if (curUser === name) {
    curUser = '';
    try { localStorage.removeItem('fp_user'); } catch {}
  }

  setState({
    members:        state.members.filter(m => m !== name),
    av,
    memberColorMap: colorMap,
    curUser,
  });

  const cached = loadCache('members') || {};
  delete cached[name];
  saveCache('members', cached);
  renderContent();
  syncPublicFamily();
}

// ── PHOTOS ────────────────────────────────────────────────────
export async function loadPhotos() {
  try {
    const r    = await fbFetch(`${DB_ROOT}/families/${state.familyId}/memberPhotos.json`);
    const data = await r.json();
    if (data) setState({ photos: data });
  } catch (e) {}
}

export async function savePhotoToFirebase(memberName, dataUrl) {
  try {
    await fbFetch(`${DB_ROOT}/families/${state.familyId}/memberPhotos/${memberName}.json`, {
      method: 'PUT',
      body:   JSON.stringify(dataUrl),
    });
  } catch (e) { console.error('savePhoto', e); }
}

export async function handlePhotoUpload(input, memberName, showSync, renderContent) {
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    const img    = new Image();
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      const max    = 200;
      let w = img.width, h = img.height;
      if (w > h) { if (w > max) { h = Math.round(h * max / w); w = max; } }
      else       { if (h > max) { w = Math.round(w * max / h); h = max; } }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.7);

      const preview = document.getElementById('photo-preview');
      if (preview) preview.innerHTML = `<img src="${dataUrl}" style="width:100%;height:100%;object-fit:cover">`;

      await savePhotoToFirebase(memberName, dataUrl);
      setState({ photos: { ...state.photos, [memberName]: dataUrl } });
      renderContent();
      showSync('📷 Foto gespeichert');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// ── MODAL: ADD MEMBER ─────────────────────────────────────────
export function showAddMemberModal(isFirst, openModal, closeModal, showSync, showUserModal, confirmAddMemberFn) {
  const newEmoji  = DEFAULT_EMOJIS[state.members.length % DEFAULT_EMOJIS.length] || '👤';
  state._newMemberEmoji = newEmoji; // temp storage via state

  const emojiGrid = DEFAULT_EMOJIS.map(e =>
    `<button class="emoji-btn${newEmoji === e ? ' sel' : ''}"
      onclick="window._app.setNewMemberEmoji('${e}');
               document.querySelectorAll('#member-emoji-grid .emoji-btn').forEach(b=>b.classList.remove('sel'));
               this.classList.add('sel')">${e}</button>`
  ).join('');

  openModal(`
    <div class="modal-handle"></div>
    <div class="modal-title">${isFirst ? '👋 Erstes Profil' : '➕ Profil hinzufügen'}</div>
    <div class="modal-sub">${isFirst ? 'Lege das erste Familienprofil an' : 'Wer soll noch hinzugefügt werden?'}</div>
    <div class="form-group"><label class="form-lbl">Name</label>
    <input class="form-input" id="new-member-name" placeholder="z.B. Mama, Papa, Lena…" maxlength="20"/></div>
    <div class="form-group"><label class="form-lbl">Emoji</label>
    <div class="emoji-grid" id="member-emoji-grid">${emojiGrid}</div></div>
    <button class="submit-btn" onclick="window._app.confirmAddMember(${isFirst})">Profil erstellen ✓</button>
    ${isFirst ? '' : `<button class="modal-close" onclick="window._app.closeModal();window._app.showUserModal()">Abbrechen</button>`}
  `);
  setTimeout(() => document.getElementById('new-member-name')?.focus(), 350);
}

// ── MODAL: EDIT MEMBER ────────────────────────────────────────
export function showEditMemberModal(name, openModal) {
  const curEmoji  = state.av[name] || '🧑';
  const curPhoto  = state.photos[name] || '';
  const safeName  = escapeHtml(name);
  const safeAttr  = escapeAttr(name);

  const emojiGrid = DEFAULT_EMOJIS.map(e =>
    `<button class="emoji-btn${curEmoji === e ? ' sel' : ''}"
      onclick="document.getElementById('edit-emoji-val').value='${e}';
               document.querySelectorAll('#edit-emoji-grid .emoji-btn').forEach(b=>b.classList.remove('sel'));
               this.classList.add('sel')">${e}</button>`
  ).join('');

  openModal(`
    <div class="modal-handle"></div>
    <div class="modal-title">Profil bearbeiten</div>
    <div class="modal-sub">${curEmoji} ${safeName}</div>
    <input type="hidden" id="edit-emoji-val" value="${curEmoji}"/>
    <div class="form-group"><label class="form-lbl">Name</label>
    <input class="form-input" id="edit-member-name" value="${safeName}" maxlength="20"/></div>
    <div class="form-group">
      <label class="form-lbl">Profilfoto</label>
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
        <div id="photo-preview" style="width:52px;height:52px;border-radius:50%;background:#F5F6FA;border:2px solid #ECEEF2;overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:24px">
          ${curPhoto ? `<img src="${curPhoto}" style="width:100%;height:100%;object-fit:cover">` : curEmoji}
        </div>
        <div style="flex:1">
          <button type="button" onclick="document.getElementById('photo-input').click()"
            style="width:100%;padding:10px;border:1.5px dashed #5C4EE5;border-radius:10px;background:#EEF2FF;color:#5C4EE5;font-weight:600;font-size:13px;cursor:pointer;font-family:inherit">
            📷 Foto auswählen
          </button>
          ${curPhoto ? `<button type="button"
            onclick="window._app.removePhoto('${safeAttr}')"
            style="width:100%;margin-top:4px;padding:6px;border:none;border-radius:8px;background:#FEF2F2;color:#DC2626;font-size:12px;cursor:pointer;font-family:inherit">
            × Foto entfernen
          </button>` : ''}
        </div>
      </div>
      <input type="file" id="photo-input" accept="image/*" style="display:none"
        onchange="window._app.handlePhotoUpload(this,'${safeAttr}')">
    </div>
    <div class="form-group"><label class="form-lbl">Emoji (wird ohne Foto gezeigt)</label>
    <div class="emoji-grid" id="edit-emoji-grid">${emojiGrid}</div></div>
    <button class="submit-btn" onclick="
      const nn=document.getElementById('edit-member-name').value.trim();
      const ne=document.getElementById('edit-emoji-val').value;
      if(nn)window._app.renameMember('${safeAttr}',nn,ne)
        .then(()=>{window._app.closeModal();window._app.showSync('✓ Gespeichert');window._app.showUserModal();});
    ">Speichern ✓</button>
    <button style="width:100%;margin-top:8px;padding:13px;border:none;border-radius:10px;background:#FEF2F2;color:#DC2626;font-weight:600;font-size:14px;cursor:pointer;font-family:inherit"
      onclick="if(confirm('Profil ${safeAttr} wirklich löschen?')){window._app.deleteMember('${safeAttr}');window._app.closeModal();window._app.showSync('✓ Gelöscht');}">
      🗑 Profil löschen
    </button>
    <button class="modal-close" onclick="window._app.closeModal();window._app.showUserModal()">Abbrechen</button>
  `);
}


