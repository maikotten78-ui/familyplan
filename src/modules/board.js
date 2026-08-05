import { state, setState } from './state.js';
import { fbGet, fbSet, fbDel } from './firebase.js';
import { escapeHtml } from './utils.js';
import { checkFreeLimit, isPremiumActive } from './premium.js';
import { registerListener } from './listener.js';

// ── NEUE BEITRÄGE/ANTWORTEN ERKENNEN ────────────────────────────
// Flache Liste aus Posts + verschachtelten Antworten, jeweils mit
// Zeitstempel/Autor/Text – Basis für sowohl die Live-Erkennung (Diff
// zweier Snapshots) als auch die "seit dem letzten Öffnen verpasst"-
// Erkennung beim App-Start.
function collectBoardItems(posts) {
  const items = [];
  Object.entries(posts || {}).forEach(([postId, post]) => {
    items.push({ kind: 'post', postId, author: post.author, text: post.text, photo: post.photo, ts: post.ts || 0 });
    Object.entries(post.replies || {}).forEach(([replyId, reply]) => {
      items.push({ kind: 'reply', postId, replyId, author: reply.author, text: reply.text, ts: reply.ts || 0 });
    });
  });
  return items;
}

// Alles seit einem Zeitpunkt (z.B. state.boardLastSeen), das nicht von
// mir selbst stammt – für den "App gerade geöffnet"-Fall.
function findUnseenBoardItems(posts, sinceTs, curUser) {
  return collectBoardItems(posts)
    .filter(it => it.ts > sinceTs && it.author !== curUser)
    .sort((a, b) => b.ts - a.ts);
}

// Was ist zwischen zwei Snapshots neu hinzugekommen – für die Live-
// Erkennung während die App bereits offen ist.
function findNewBoardItems(oldPosts, newPosts, curUser) {
  const seen = new Set();
  collectBoardItems(oldPosts).forEach(it => seen.add(`${it.kind}:${it.postId}:${it.replyId || ''}`));
  return collectBoardItems(newPosts)
    .filter(it => it.author !== curUser && !seen.has(`${it.kind}:${it.postId}:${it.replyId || ''}`))
    .sort((a, b) => b.ts - a.ts);
}

// ── REALTIME SUBSCRIBE ────────────────────────────────────────
// Ersetzt den 5-Sekunden-Poll durch einen Firebase onValue-Listener
// (gleiches Muster wie subscribeToTasks/subscribeToShopping). loadBoard()
// bleibt als Fallback erhalten, falls das Database-SDK noch nicht bereit
// ist oder der Listener nicht rechtzeitig antwortet.
export function subscribeToBoard(renderContent, updateBoardBadge) {
  if (!state.familyId || localStorage.getItem('fp_demo_mode') === '1') return;
  state._boardLastVisible = Date.now();

  if (!state.currentAuthUser || !window.firebase?.database) {
    console.warn('subscribeToBoard: Database SDK nicht bereit, Fallback auf loadBoard');
    loadBoard(renderContent, updateBoardBadge);
    return;
  }

  let isFirstLoad = true; // beim allerersten Laden nichts als "neu" toasten
  const ref = window.firebase.database().ref(`families/${state.familyId}/board`);

  let initialValueReceived = false;
  const fallbackTimer = setTimeout(() => {
    if (!initialValueReceived) {
      console.warn('subscribeToBoard: Listener timeout, Fallback auf loadBoard');
      ref.off('value', callback);
      loadBoard(renderContent, updateBoardBadge);
    }
  }, 8000);

  const callback = ref.on('value', snapshot => {
    if (!initialValueReceived) {
      initialValueReceived = true;
      clearTimeout(fallbackTimer);
    }
    const oldPosts = state.boardPosts || {};
    const data = snapshot.val();
    const newStr = JSON.stringify(data || {});
    if (newStr !== JSON.stringify(oldPosts)) {
      if (isFirstLoad) {
        // App wurde gerade (neu) geöffnet: verpasste Beiträge/Antworten seit
        // dem letzten Besuch zeigen – Ersatz für den Fall, dass Push-
        // Benachrichtigungen deaktiviert sind. Nur wenn schon mal ein
        // "zuletzt gesehen"-Zeitpunkt existiert, sonst würde bei der
        // allerersten Nutzung die komplette Board-Historie als "neu" gelten.
        if (state.boardLastSeen > 0) {
          const missed = findUnseenBoardItems(data || {}, state.boardLastSeen, state.curUser);
          if (missed.length) showBoardToast(missed[0], missed.length);
        }
      } else {
        // App ist bereits offen (auf beliebigem Tab): sofort auf neue
        // Beiträge/Antworten hinweisen, damit nichts untergeht
        const fresh = findNewBoardItems(oldPosts, data || {}, state.curUser);
        if (fresh.length) showBoardToast(fresh[0], fresh.length);
      }
      setState({ boardPosts: data || {} });
      updateBoardBadge();
      if (state.tab === 'overview') renderContent();
    }
    if (state.tab === 'overview') boardMarkPostsRead();
    isFirstLoad = false;
  }, err => {
    console.warn('subscribeToBoard listener error:', err.message);
    clearTimeout(fallbackTimer);
    loadBoard(renderContent, updateBoardBadge);
  });

  registerListener('board', () => ref.off('value', callback));
}

// ── LOAD (Fallback für subscribeToBoard) ────────────────────────
export async function loadBoard(renderContent, updateBoardBadge) {
  if (!state.familyId || localStorage.getItem('fp_demo_mode') === '1') return;
  state._boardLastVisible = Date.now();

  let isFirstLoad = true; // beim allerersten Laden nichts als "neu" toasten

  // Einmalig laden + dann alle 5 Sekunden pollen
  const doLoad = async () => {
    if (!state.currentAuthUser) return;
    try {
      const oldPosts = state.boardPosts || {};
      const data = await fbGet('board');
      const newStr = JSON.stringify(data || {});
      if (newStr !== JSON.stringify(oldPosts)) {
        if (isFirstLoad) {
          if (state.boardLastSeen > 0) {
            const missed = findUnseenBoardItems(data || {}, state.boardLastSeen, state.curUser);
            if (missed.length) showBoardToast(missed[0], missed.length);
          }
        } else {
          const fresh = findNewBoardItems(oldPosts, data || {}, state.curUser);
          if (fresh.length) showBoardToast(fresh[0], fresh.length);
        }
        setState({ boardPosts: data || {} });
        updateBoardBadge();
        if (state.tab === 'overview') renderContent();
      }
      if (state.tab === 'overview') boardMarkPostsRead();
      isFirstLoad = false;
    } catch (e) {
      console.warn('loadBoard error (boardPosts preserved):', e.message);
    }
  };

  await doLoad();

  if (!window._boardPoll) {
    window._boardPoll = true;
    window._boardPollId = setInterval(doLoad, 5000);
  }
}

// ── TOAST FÜR NEUE BOARD-NACHRICHTEN/ANTWORTEN ──────────────────
// item: { kind:'post'|'reply', author, text, photo, postId }
// totalCount: Gesamtzahl neuer/verpasster Einträge – bei mehreren wird
// eine Sammel-Meldung statt der einzelnen Vorschau gezeigt.
export function showBoardToast(item, totalCount = 1) {
  document.getElementById('board-toast')?.remove();
  const toast = document.createElement('div');
  toast.id = 'board-toast';
  toast.className = 'board-toast';

  if (totalCount > 1) {
    toast.innerHTML = `
      <div class="board-toast-av">💬</div>
      <div style="flex:1;min-width:0">
        <div class="board-toast-author">Familien-Board</div>
        <div class="board-toast-text">${totalCount} neue Beiträge – zuletzt von ${escapeHtml(item.author)}</div>
      </div>`;
  } else {
    const av     = state.av?.[item.author] || '👤';
    const prefix = item.kind === 'reply' ? '↩️ ' : '';
    const text   = item.photo && !item.text ? '📷 Foto geteilt' : (item.text || '').slice(0, 60);
    toast.innerHTML = `
      <div class="board-toast-av">${state.photos?.[item.author] ? `<img src="${state.photos[item.author]}" style="width:100%;height:100%;border-radius:50%;object-fit:cover">` : av}</div>
      <div style="flex:1;min-width:0">
        <div class="board-toast-author">${prefix}${escapeHtml(item.author)}</div>
        <div class="board-toast-text">${escapeHtml(text)}</div>
      </div>`;
  }

  toast.onclick = () => {
    toast.remove();
    if (state.tab !== 'overview') {
      window._app.setTab('overview');
      setTimeout(() => document.getElementById('board-posts-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
    } else {
      document.getElementById('board-posts-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}

// ── BADGE ─────────────────────────────────────────────────────
export function updateBoardBadge() {
  const badge  = document.getElementById('board-badge');
  if (!badge) return;
  const unseen = findUnseenBoardItems(state.boardPosts, state.boardLastSeen, state.curUser).length;
  if (unseen > 0 && state.tab !== 'overview') {
    badge.textContent    = unseen > 9 ? '9+' : String(unseen);
    badge.style.display  = 'flex';
  } else {
    badge.style.display  = 'none';
  }
}

export function boardMarkSeen() {
  const latest = Math.max(0, ...Object.values(state.boardPosts).map(p => p.ts || 0));
  if (latest > state.boardLastSeen) {
    setState({ boardLastSeen: latest });
    try { localStorage.setItem('fp_board_seen', String(latest)); } catch {}
  }
  updateBoardBadge();
}

// ── GELESEN-MARKIERUNG (WhatsApp-Style) ────────────────────────
// Markiert alle aktuell geladenen Posts (außer eigenen) als von mir gelesen.
export async function boardMarkPostsRead() {
  const { currentAuthUser, familyId, curUser } = state;
  if (!currentAuthUser || !familyId || !curUser) return;
  const uid = currentAuthUser.uid;
  const now = Date.now();

  // Haupt-Posts
  const postsToWrite = Object.entries(state.boardPosts).filter(([, post]) => {
    if (post.author === curUser) return false;           // eigene Posts nicht markieren
    return !post.reads || !post.reads[uid];               // schon gelesen? überspringen
  });

  // Antworten (analog zu Posts, aber pro einzelner Antwort)
  const repliesToWrite = [];
  Object.entries(state.boardPosts).forEach(([postId, post]) => {
    Object.entries(post.replies || {}).forEach(([replyId, reply]) => {
      if (reply.author === curUser) return;               // eigene Antworten nicht markieren
      if (reply.reads && reply.reads[uid]) return;         // schon gelesen? überspringen
      repliesToWrite.push([postId, replyId, reply]);
    });
  });

  if (!postsToWrite.length && !repliesToWrite.length) return;

  const updatedPosts = { ...state.boardPosts };
  postsToWrite.forEach(([postId, post]) => {
    updatedPosts[postId] = { ...post, reads: { ...(post.reads || {}), [uid]: { name: curUser, ts: now } } };
  });
  repliesToWrite.forEach(([postId, replyId, reply]) => {
    const post = updatedPosts[postId] || state.boardPosts[postId];
    const updatedReplies = { ...(post.replies || {}) };
    updatedReplies[replyId] = { ...reply, reads: { ...(reply.reads || {}), [uid]: { name: curUser, ts: now } } };
    updatedPosts[postId] = { ...post, replies: updatedReplies };
  });
  setState({ boardPosts: updatedPosts });

  await Promise.all([
    ...postsToWrite.map(([postId]) =>
      fbSet(`board/${postId}/reads/${uid}`, { name: curUser, ts: now }).catch(() => {})
    ),
    ...repliesToWrite.map(([postId, replyId]) =>
      fbSet(`board/${postId}/replies/${replyId}/reads/${uid}`, { name: curUser, ts: now }).catch(() => {})
    ),
  ]);
}

export function boardShowReaders(postId, replyId, openModal, escapeHtml, boardTimeAgo) {
  const post = state.boardPosts[postId]; if (!post) return;
  const entity = replyId ? (post.replies || {})[replyId] : post;
  if (!entity) return;
  const readers = Object.values(entity.reads || {}).filter(r => r.name && r.name !== entity.author);
  const itemsHTML = readers.length
    ? readers.sort((a, b) => a.ts - b.ts).map(r => `
      <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border2)">
        <div style="width:32px;height:32px;border-radius:50%;background:var(--bg3);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">${state.av[r.name] || '👤'}</div>
        <div style="flex:1;font-size:14px;font-weight:600;color:var(--text1)">${escapeHtml(r.name)}</div>
        <div style="font-size:12px;color:var(--text3)">${boardTimeAgo(r.ts)}</div>
      </div>`).join('')
    : `<div style="text-align:center;padding:20px;color:var(--text3);font-size:13px">Noch von niemandem gelesen.</div>`;

  openModal(`
    <div class="modal-handle"></div>
    <div class="modal-title">✓✓ Gelesen von</div>
    <div style="margin-bottom:12px">${itemsHTML}</div>
    <button class="modal-close" onclick="window._app.closeModal()">Schließen</button>
  `);
}

// ── TIME HELPER ───────────────────────────────────────────────
export function boardTimeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'Gerade eben';
  if (mins < 60) return mins + ' Min.';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return hrs + ' Std.';
  const days = Math.floor(hrs / 24);
  if (days < 7)  return days + ' Tag' + (days === 1 ? '' : 'e');
  return new Date(ts).toLocaleDateString('de', { day: '2-digit', month: '2-digit' });
}

// ── TOGGLE REACTION ───────────────────────────────────────────
export async function boardToggleReaction(postId, emoji, renderContent) {
  if (!state.currentAuthUser || !state.familyId) return;
  const uid      = state.currentAuthUser.uid;
  const post     = state.boardPosts[postId]; if (!post) return;
  const reactions = { ...(post.reactions || {}) };
  if (reactions[uid] === emoji) delete reactions[uid];
  else reactions[uid] = emoji;

  setState({ boardPosts: { ...state.boardPosts, [postId]: { ...post, reactions } } });
  renderContent();

  try {
    await fbSet(`board/${postId}/reactions`, reactions);
  } catch (e) {
    setState({ boardPosts: { ...state.boardPosts, [postId]: post } });
    renderContent();
  }
}

// ── DELETE POST ───────────────────────────────────────────────
export async function boardDeletePost(postId, renderContent) {
  if (!confirm('Beitrag löschen?')) return;
  const backup   = state.boardPosts[postId];
  const newPosts = { ...state.boardPosts };
  delete newPosts[postId];
  setState({ boardPosts: newPosts });
  renderContent();
  try { await fbDel(`board/${postId}`); }
  catch (e) { setState({ boardPosts: { ...state.boardPosts, [postId]: backup } }); renderContent(); }
}

// ── SUBMIT POST ───────────────────────────────────────────────
export async function boardSubmitPost(closeModal, renderContent, showSync, checkRateLimit, sendPushToFamily, getPushSetting) {
  const text  = (document.getElementById('board-text')?.value || '').trim();
  const photo = document.getElementById('board-photo-input')?._dataUrl || null;

  if (!text && !photo) { showSync('Bitte Text oder Foto hinzufügen.'); return; }
  if (!state.curUser)  { showSync('Bitte erst ein Profil wählen.'); return; }
  if (!await checkRateLimit('board')) return;
  // Free-Limit: max. 3 Board-Posts pro Tag
  if (!isPremiumActive()) {
    const today = new Date().toISOString().split('T')[0];
    const key   = 'fp_boardpost_' + today;
    const count = parseInt(localStorage.getItem(key) || '0');
    if (checkFreeLimit('boardPosts', count)) return;
    localStorage.setItem(key, count + 1);
  }

  const btn = document.querySelector('.submit-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Wird gepostet…'; }

  const postId = 'bp_' + Date.now();
  const post   = { author: state.curUser, text, photo, ts: Date.now(), reactions: {} };
  if (!post.photo) delete post.photo;

  setState({ boardPosts: { ...state.boardPosts, [postId]: post } });
  closeModal(); renderContent();

  try {
    await fbSet(`board/${postId}`, post);
    showSync('✓ Gepostet!');
    if (getPushSetting('boardEnabled', true)) {
      sendPushToFamily('board', { author: state.curUser, text: (text || '📷 Foto').slice(0, 80) }, { excludeSelf: true });
    }
  } catch (e) {
    const posts = { ...state.boardPosts };
    delete posts[postId];
    setState({ boardPosts: posts });
    renderContent(); showSync('❌ Fehler beim Posten.');
  }
}

// ── SUBMIT REPLY ──────────────────────────────────────────────
export async function boardSubmitReply(postId, text, renderContent, showSync, checkRateLimit, sendPushToFamily, getPushSetting) {
  text = (text || '').trim();
  if (!text) return;
  if (!state.curUser) { showSync('Bitte erst ein Profil wählen.'); return; }
  if (!await checkRateLimit('comment')) return;

  // Free-Limit: max. 5 Kommentare pro Tag (teilt sich mit Task-Kommentaren)
  if (!isPremiumActive()) {
    const today = new Date().toISOString().split('T')[0];
    const key   = 'fp_comment_' + today;
    const count = parseInt(localStorage.getItem(key) || '0');
    if (checkFreeLimit('comments', count)) return;
    localStorage.setItem(key, count + 1);
  }

  const post = state.boardPosts[postId]; if (!post) return;
  const replyId = 'br_' + Date.now();
  const reply   = { author: state.curUser, text, ts: Date.now() };

  const updatedPost = { ...post, replies: { ...(post.replies || {}), [replyId]: reply } };
  setState({ boardPosts: { ...state.boardPosts, [postId]: updatedPost } });
  renderContent();

  try {
    await fbSet(`board/${postId}/replies/${replyId}`, reply);
    if (getPushSetting('boardEnabled', true)) {
      sendPushToFamily('reply', {
        author: state.curUser,
        text: text.slice(0, 80)
      }, { excludeSelf: true });
    }
  } catch (e) {
    setState({ boardPosts: { ...state.boardPosts, [postId]: post } });
    renderContent();
    showSync('❌ Fehler beim Senden.');
  }
}

// ── DELETE REPLY ──────────────────────────────────────────────
export async function boardDeleteReply(postId, replyId, renderContent) {
  if (!confirm('Antwort löschen?')) return;
  const post = state.boardPosts[postId]; if (!post) return;
  const backup = { ...post };
  const newReplies = { ...(post.replies || {}) };
  delete newReplies[replyId];
  setState({ boardPosts: { ...state.boardPosts, [postId]: { ...post, replies: newReplies } } });
  renderContent();
  try { await fbDel(`board/${postId}/replies/${replyId}`); }
  catch (e) { setState({ boardPosts: { ...state.boardPosts, [postId]: backup } }); renderContent(); }
}

// ── PHOTO HANDLER ─────────────────────────────────────────────
export function boardHandlePhoto(input) {
  const file = input.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const max    = 800;
      let w = img.width, h = img.height;
      if (w > h) { if (w > max) { h = Math.round(h * max / w); w = max; } }
      else       { if (h > max) { w = Math.round(w * max / h); h = max; } }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      const prev    = document.getElementById('board-photo-preview');
      const prevImg = document.getElementById('board-photo-img');
      if (prev && prevImg) { prev.style.display = 'block'; prevImg.src = dataUrl; }
      input._dataUrl = dataUrl;
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}


