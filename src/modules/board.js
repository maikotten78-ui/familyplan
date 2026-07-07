import { state, setState } from './state.js';
import { fbGet, fbSet, fbDel } from './firebase.js';
import { escapeHtml } from './utils.js';
import { checkFreeLimit, isPremiumActive } from './premium.js';

// ── LOAD ──────────────────────────────────────────────────────
export async function loadBoard(renderContent, updateBoardBadge) {
  if (!state.familyId || localStorage.getItem('fp_demo_mode') === '1') return;
  state._boardLastVisible = Date.now();

  // Einmalig laden + dann alle 5 Sekunden pollen
  const doLoad = async () => {
    if (!state.currentAuthUser) return;
    try {
      const data = await fbGet('board');
      const newStr = JSON.stringify(data || {});
      if (newStr !== JSON.stringify(state.boardPosts)) {
        setState({ boardPosts: data || {} });
        updateBoardBadge();
        if (state.tab === 'overview') renderContent();
      }
      if (state.tab === 'overview') boardMarkPostsRead();
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

// ── BADGE ─────────────────────────────────────────────────────
export function updateBoardBadge() {
  const badge  = document.getElementById('board-badge');
  if (!badge) return;
  const unseen = Object.values(state.boardPosts).filter(p => p.ts > state.boardLastSeen).length;
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


