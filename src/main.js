// ══════════════════════════════════════════════════════════════
// famiplan – main.js  (Phase 4 Entry Point)
// ══════════════════════════════════════════════════════════════

import { PREMIUM_ENABLED } from './modules/config.js';
import { state, setState } from './modules/state.js';
import { syncPublicFamily, ensureFamilyInIndex } from './modules/firebase.js';
import { clearFamilyCache } from './modules/cache.js';
import { escapeHtml, escapeAttr, localISO } from './modules/utils.js';

// Auth
import { initFirebaseAuth, showAuthScreen, showAuthScreenDirect,
         authSetMode, authSubmit, authGoogle, authForgotPassword,
         proceedAfterAuth, saveUserFamily, authSignOut,
         deleteAccount, showDeleteAccountModal } from './modules/auth.js';

// Members
import { loadMembers, saveMember, renameMember, deleteMember,
         loadPhotos, savePhotoToFirebase, handlePhotoUpload,
         showAddMemberModal, showEditMemberModal,
         bindMemberUid, loadConnectedAccounts, revokeMemberAccess } from './modules/members.js';

// Tasks
import { loadTasks, subscribeToTasks, addTask, saveEdit, assignTask, unassign,
         toggleDone, deleteTask, loadComments, addComment,
         resetFd, isVisible, getA } from './modules/tasks.js';

// Shopping
import { loadShopping, shopAddItem, shopToggleCheck, shopToggleFav,
         shopDeleteItem, shopSaveEdit, shopClearChecked,
         shopAddList, shopDeleteList, shopRecallCategory, shopRememberCategory } from './modules/shopping.js';

// Meals
import { loadMeals, saveMeal, deleteMeal,
         copyMealWeekToNext, copyMealWeekFromPrev, mealIngredientsToShop,
         toggleOptionalIngredient, saveRecipeSteps } from './modules/meals.js';

// Board
import { loadBoard, updateBoardBadge, boardToggleReaction,
         boardDeletePost, boardSubmitPost, boardHandlePhoto,
         boardSubmitReply, boardDeleteReply,
         boardMarkPostsRead, boardShowReaders, boardTimeAgo } from './modules/board.js';

// Premium
import { isPremiumActive, setPlan, loadUserPlan,
         renderTrialBanner, checkRateLimit, openCheckout } from './modules/premium.js';

// UI
import { openModal, closeModal, showSync } from './ui/modal.js';
import { setTab, setDay, updateNav, renderDayPills, startTabTour,
         initSwipe, initBottomNavFix } from './ui/nav.js';

// renderContent kommt aus render.js
import { renderContent, toggleShopCat, showOvTaskMenu, showAssignModal, showCommentsModal } from './ui/render.js';
import { obGoTo, obSelectEmoji, obCreateFamily, obJoinFamily, obCreateProfile,
         obAddTemplates, obShareInvite, obFinish, obShowDemo, exitDemoMode,
         shareInviteLink, showInstallPrompt, showFamilySetup, onFabClick } from './ui/onboarding.js';
import { showPushPage, getPushSetting, setPushSetting, sendPushToFamily,
         savePushSubscriptionToServer, scheduleReminders } from './ui/push.js';
import { showAdminPanel, adminGrantFamily, adminRevokeFamily,
         adminBulkIndexFamilies, adminDeleteFamily, adminSendBroadcast } from './ui/admin.js';
import { showCalendarSyncPage } from './ui/calendarSyncPage.js';
import { isCalendarSyncSupported, initCalendarSyncTriggers } from './modules/calendarSync.js';
import { showAddModal, showEditModal, showMealEditModal, showUserModal, showBoardNewModal,
         showUpgradeModal, exportCal, openMaps, selectUser,
         showConnectedAccountsModal, confirmRevokeMemberAccess,
         setFF, setDate, toggleWD, onEndTimeChange, onDurChange, toggleAttendee, toggleVisibleTo,
         applyMealRecipe, confirmSaveMeal, showDeleteAccountModal as showDelAccModal,
         _mealNameAcUpdate, _mealNameAcSelect, _mealNameAcKey,
         _mealIngrAcUpdate, _mealIngrAcSelect, _mealIngrAcKey,
         showRecipeManager, recipeManagerSearch, recipeManagerSort,
         recipeManagerEdit, recipeManagerDeleteConfirm, recipeManagerDelete, recipeManagerApply,
         showRecipeStepsModal, showRecipeDetailModal, showRecipeEditModal, showRecipeViewModal,
         showRecipeImportModal, _recipeImportStart, _recipeImportSave,
         _recipeImportTab, _recipeImportPhotoSelected } from './ui/modals.js';

import { preloadSchulferien, setBundesland, BUNDESLAENDER } from './modules/holidays.js';

// ── EINLADUNGS-LINK ERKENNEN (?id=...&name=...) ────────────────
// Läuft so früh wie möglich beim Laden, bevor irgend ein anderer Code
// die URL bereinigt. Merkt sich die Absicht einmalig in sessionStorage,
// appInit() konsumiert das danach (siehe unten), egal ob vorher noch
// eine Anmeldung nötig ist.
(function captureInviteLinkIntent() {
  try {
    const params = new URLSearchParams(window.location.search);
    const joinId = (params.get('id') || '').trim().toUpperCase();
    if (joinId && joinId.length >= 6) {
      sessionStorage.setItem('fp_pending_join_id', joinId);
      const joinName = params.get('name') || '';
      if (joinName) sessionStorage.setItem('fp_pending_join_name', joinName);
      const joinToken = (params.get('token') || '').trim();
      if (joinToken) sessionStorage.setItem('fp_pending_join_token', joinToken);
      window.history.replaceState({}, '', window.location.pathname);
    }
  } catch (e) { /* sessionStorage evtl. nicht verfügbar, kein Problem */ }
})();

// ── DARK MODE ─────────────────────────────────────────────────
function applyDarkMode() {
  const pref = localStorage.getItem('fp_dark_mode') || 'system';
  const root = document.documentElement;
  if (pref === 'dark') {
    root.setAttribute('data-theme', 'dark');
  } else if (pref === 'light') {
    root.setAttribute('data-theme', 'light');
  } else {
    root.removeAttribute('data-theme'); // system: CSS media query handles it
  }
}
applyDarkMode();
preloadSchulferien();

// Listen for system theme changes (when mode=system)
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (!localStorage.getItem('fp_dark_mode') || localStorage.getItem('fp_dark_mode') === 'system') {
    applyDarkMode();
  }
});

// ── GLOBAL BRIDGE ─────────────────────────────────────────────
window._app = {
  renderContent,
  toggleShopCat,
  // Task form modals
  showAddModal, showEditModal, exportCal, openMaps,
  setFF, setDate, toggleWD, onEndTimeChange, onDurChange, toggleAttendee, toggleVisibleTo,
  // Meal modal
  showMealEditModal, applyMealRecipe, confirmSaveMeal,
  _mealNameAcUpdate, _mealNameAcSelect, _mealNameAcKey,
  _mealIngrAcUpdate, _mealIngrAcSelect, _mealIngrAcKey,
  showRecipeManager, recipeManagerSearch, recipeManagerSort,
  recipeManagerEdit, recipeManagerDeleteConfirm, recipeManagerDelete, recipeManagerApply,
  toggleMealExtras: (iso) => { import('./ui/render.js').then(m => m.toggleMealExtras(iso)); },
  // User modal
  showUserModal, selectUser,
  showConnectedAccountsModal, confirmRevokeMemberAccess,
  // Apple Calendar Sync (hinter Feature-Flag, siehe config.js CALENDAR_SYNC_ENABLED)
  showCalendarSyncPage, isCalendarSyncSupported,
  // Board modal
  showBoardNewModal,
  // Premium modal
  showUpgradeModal,
  // Delete account modal override
  showDeleteAccountModal: () => showDelAccModal(),
  // fd/ed live updates from form inputs
  toggleEmojiGrid: (btn) => {
    const g = document.getElementById('f-emoji-grid');
    const show = g.style.display === 'none';
    g.style.display = show ? 'grid' : 'none';
    btn.textContent = show ? '▾ Schließen' : '▸ Auswählen';
  },
  _fdSet: (f, v, mode) => {
    if (mode === 'e') setState({ ed: { ...state.ed, [f]: v } });
    else              setState({ fd: { ...state.fd, [f]: v } });
  },
  // Core UI
  closeModal, showSync,

  // Members
  showAddMemberModal:  (isFirst) => showAddMemberModal(isFirst, openModal, closeModal, showSync, showUserModal),
  showEditMemberModal: (name)    => showEditMemberModal(name, openModal),

  // Onboarding
  obGoTo, obSelectEmoji, obCreateFamily, obJoinFamily, obCreateProfile,
  exitDemoMode,
  obAddTemplates, obShareInvite, obFinish, obShowDemo, exitDemoMode,
  shareInviteLink, showInstallPrompt, onFabClick,
  showShopAddModal: () => {
    setState({ newShopItem: { name: '', emoji: '🛒', category: 'sonstiges', qty: 1, unit: '', fav: false } });

    // ── #5: Kategorie-Reihenfolge nach Nutzungshäufigkeit sortieren ──────
    const ALL_CATS = [
      {id:'obst',name:'Obst & Gemüse',icon:'🥦'},{id:'milch',name:'Milch & Käse',icon:'🧀'},
      {id:'fleisch',name:'Fleisch & Fisch',icon:'🥩'},{id:'brot',name:'Brot',icon:'🍞'},
      {id:'tiefkuehl',name:'Tiefkühl',icon:'🧊'},{id:'getraenke',name:'Getränke',icon:'🥤'},
      {id:'snacks',name:'Snacks',icon:'🍫'},{id:'haushalt',name:'Haushalt',icon:'🧹'},
      {id:'hygiene',name:'Hygiene',icon:'🧴'},{id:'sonstiges',name:'Sonstiges',icon:'📦'},
    ];
    let catFreq = {};
    try { catFreq = JSON.parse(localStorage.getItem('fp_shop_cat_freq') || '{}'); } catch {}
    const sortedCats = [...ALL_CATS].sort((a, b) => (catFreq[b.id] || 0) - (catFreq[a.id] || 0));
    const defaultCat = sortedCats[0]?.id || 'sonstiges';
    window._app._shopAddCat = defaultCat;

    const escHtml = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    const qtyOpts  = [1,2,3,4,5,6,7,8,9,10,12,15,20,25,50,100,200,500].map(v => `<option value="${v}"${v===1?' selected':''}>${v}</option>`).join('');
    const unitOpts = ['','Stück','g','kg','ml','L','EL','TL','Pck','Bund','Zehe','Scheibe','Dose','Fla'].map(v => `<option value="${v}">${v||'–'}</option>`).join('');
    const catBtns  = sortedCats.map(cat => `<button class="cat-btn${cat.id===defaultCat?' sel':''}" data-cat="${cat.id}"
      onclick="document.querySelectorAll('#shop-add-cats .cat-btn').forEach(b=>b.classList.remove('sel'));this.classList.add('sel');window._app._shopAddCat=this.dataset.cat"
      >${cat.icon} ${cat.name}</button>`).join('');

    // ── #6: Spracheingabe verfügbar? ──────────────────────────────────────
    const hasSpeech = ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
    const micBtn = hasSpeech
      ? `<button type="button" id="shop-mic-btn" onclick="window._app._shopMicStart()"
           style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;font-size:20px;cursor:pointer;padding:4px;line-height:1;color:var(--text3);transition:color 0.2s"
           title="Spracheingabe">🎤</button>`
      : '';

    openModal(`
      <div class="modal-handle"></div>
      <div class="modal-title">🛒 Artikel hinzufügen</div>
      <div class="form-group">
        <label class="form-lbl">Artikel</label>
        <div style="position:relative">
          <input class="form-input" id="shop-item-name" maxlength="100" placeholder="z.B. Milch, Brot…" autocomplete="off"
            style="${hasSpeech ? 'padding-right:40px' : ''}"
            oninput="window._app._shopAcUpdate(this.value)"
            onkeydown="window._app._shopAcKey(event)"/>
          ${micBtn}
        </div>
        <div id="shop-ac-list" style="display:none;background:var(--surface);border:1px solid var(--border);border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.10);margin-top:4px;overflow:hidden;max-height:220px;overflow-y:auto"></div>
      </div>
      <div class="form-group">
        <label class="form-lbl">Menge & Einheit</label>
        <div style="display:flex;gap:10px">
          <select class="form-select" id="shop-add-qty">${qtyOpts}</select>
          <select class="form-select" id="shop-add-unit">${unitOpts}</select>
        </div>
      </div>
      <div class="form-group">
        <label class="form-lbl">Kategorie</label>
        <div class="cat-grid" id="shop-add-cats">${catBtns}</div>
      </div>
      <button class="submit-btn" onclick="window._app._shopConfirmAdd()">Hinzufügen ✓</button>
      <button class="modal-close" onclick="window._app.closeModal()">Abbrechen</button>
    `);
    setTimeout(() => document.getElementById('shop-item-name')?.focus(), 350);
  },

  _shopAddCat: 'sonstiges',
  _shopAcIdx: -1,
  _shopAcCandidates: [],

  // ── Hilfsfunktion: Kategorie-Häufigkeit speichern (#5) ────────────────
  _shopCatFreqBump: (catId) => {
    if (!catId || catId === 'sonstiges') return;
    try {
      const freq = JSON.parse(localStorage.getItem('fp_shop_cat_freq') || '{}');
      freq[catId] = (freq[catId] || 0) + 1;
      localStorage.setItem('fp_shop_cat_freq', JSON.stringify(freq));
    } catch {}
  },

  // ── #6: Spracheingabe ─────────────────────────────────────────────────
  _shopMicStart: () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = 'de-DE';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    const btn = document.getElementById('shop-mic-btn');
    if (btn) { btn.textContent = '🔴'; btn.style.color = '#DC2626'; }
    rec.start();
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript.trim();
      const inp = document.getElementById('shop-item-name');
      if (inp) { inp.value = transcript; window._app._shopAcUpdate(transcript); }
      if (btn) { btn.textContent = '🎤'; btn.style.color = ''; }
    };
    rec.onerror = () => { if (btn) { btn.textContent = '🎤'; btn.style.color = ''; } };
    rec.onend   = () => { if (btn) { btn.textContent = '🎤'; btn.style.color = ''; } };
  },

  // ── Autovervollständigung aktualisieren ───────────────────────────────
  _shopAcUpdate: (val) => {
    // Kategorie parallel aktualisieren
    const rc = shopRecallCategory(val);
    if (rc) {
      window._app._shopAddCat = rc;
      document.querySelectorAll('#shop-add-cats .cat-btn').forEach(b => b.classList.toggle('sel', b.dataset.cat === rc));
    }

    const list = document.getElementById('shop-ac-list');
    if (!list) return;
    window._app._shopAcIdx = -1;

    const q = val.trim().toLowerCase();
    if (!q) { list.style.display = 'none'; return; }

    const escHtml = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

    // ── #3: Kandidaten nach addedAt (zuletzt genutzt) sortieren ──────────
    // Deduplizieren: pro Name den neuesten Eintrag behalten
    const byName = {};
    state.shopItems.filter(i => i.name).forEach(i => {
      const k = i.name.trim().toLowerCase();
      if (!byName[k] || (i.addedAt || 0) > (byName[k].addedAt || 0)) byName[k] = i;
    });
    // Favoriten zuerst, dann nach addedAt absteigend
    const allCandidates = Object.values(byName).sort((a, b) => {
      if (a.fav && !b.fav) return -1;
      if (!a.fav && b.fav) return  1;
      return (b.addedAt || 0) - (a.addedAt || 0);
    });

    // Filtern: starts-with zuerst, dann contains
    const starts   = allCandidates.filter(c => c.name.toLowerCase().startsWith(q));
    const contains = allCandidates.filter(c => !c.name.toLowerCase().startsWith(q) && c.name.toLowerCase().includes(q));
    const matches  = [...starts, ...contains].slice(0, 6);

    if (!matches.length) { list.style.display = 'none'; return; }

    const catIcons = {obst:'🥦',milch:'🧀',fleisch:'🥩',brot:'🍞',tiefkuehl:'🧊',getraenke:'🥤',snacks:'🍫',haushalt:'🧹',hygiene:'🧴',sonstiges:'📦'};

    list.innerHTML = matches.map((c, i) => {
      const cat  = c.category || shopRecallCategory(c.name) || 'sonstiges';
      const icon = catIcons[cat] || '📦';
      const qty  = c.qty && c.qty !== 1 ? ` · ${c.qty}${c.unit ? ' ' + c.unit : ''}` : (c.unit ? ` · ${c.unit}` : '');
      // ── #7: Sofort-hinzufügen Button wenn Artikel vollständig bekannt ──
      const canQuick = !!(c.name && cat);
      return `<div class="shop-ac-item" data-idx="${i}"
        style="display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer;border-bottom:1px solid var(--border2);transition:background 0.1s"
        onmousedown="event.preventDefault()">
        <span style="font-size:18px;flex-shrink:0" onclick="window._app._shopAcSelect(${i})">${c.fav ? '⭐' : icon}</span>
        <span style="flex:1;font-size:14px;font-weight:600;color:var(--text1)" onclick="window._app._shopAcSelect(${i})">${escHtml(c.name)}</span>
        <span style="font-size:11px;color:var(--text3);white-space:nowrap;margin-right:6px" onclick="window._app._shopAcSelect(${i})">${escHtml(qty)}</span>
        ${canQuick ? `<button onmousedown="event.preventDefault()" onclick="window._app._shopAcQuickAdd(${i})"
          style="flex-shrink:0;padding:4px 9px;background:#5C4EE5;color:white;border:none;border-radius:7px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;white-space:nowrap">+ Sofort</button>` : ''}
      </div>`;
    }).join('');

    const last = list.querySelector('.shop-ac-item:last-child');
    if (last) last.style.borderBottom = 'none';

    window._app._shopAcCandidates = matches;
    list.style.display = 'block';
  },

  // ── Vorschlag ins Formular übernehmen ─────────────────────────────────
  _shopAcSelect: (idx) => {
    const c = (window._app._shopAcCandidates || [])[idx];
    if (!c) return;

    const inp = document.getElementById('shop-item-name');
    if (inp) inp.value = c.name;

    const cat = c.category || shopRecallCategory(c.name) || 'sonstiges';
    window._app._shopAddCat = cat;
    document.querySelectorAll('#shop-add-cats .cat-btn').forEach(b => b.classList.toggle('sel', b.dataset.cat === cat));

    if (c.qty) {
      const qtyEl = document.getElementById('shop-add-qty');
      if (qtyEl) { const o = [...qtyEl.options].find(o => String(o.value) === String(c.qty)); if (o) qtyEl.value = c.qty; }
    }
    if (c.unit !== undefined) {
      const unitEl = document.getElementById('shop-add-unit');
      if (unitEl) { const o = [...unitEl.options].find(o => o.value === c.unit); if (o) unitEl.value = c.unit; }
    }

    const list = document.getElementById('shop-ac-list');
    if (list) list.style.display = 'none';
    window._app._shopAcIdx = -1;
  },

  // ── #7: Sofort hinzufügen ohne Formular ──────────────────────────────
  _shopAcQuickAdd: async (idx) => {
    const c = (window._app._shopAcCandidates || [])[idx];
    if (!c) return;
    const cat = c.category || shopRecallCategory(c.name) || 'sonstiges';

    // ── #1+2: Duplikat prüfen – ggf. Menge erhöhen ───────────────────────
    const nameLower = c.name.trim().toLowerCase();
    const existing  = state.shopItems.find(i =>
      i.list === state.activeShopList && i.name.trim().toLowerCase() === nameLower && !i.checked
    );
    if (existing) {
      // Menge erhöhen statt doppelt anlegen
      const newQty = (parseFloat(existing.qty) || 1) + (parseFloat(c.qty) || 1);
      const { id: _, ...rest } = existing;
      const { fbSet } = await import('./modules/firebase.js');
      await fbSet(`shopping/items/${existing.id}`, { ...rest, qty: newQty });
      setState({ shopItems: state.shopItems.map(i => i.id === existing.id ? { ...i, qty: newQty } : i) });
      closeModal();
      showSync(`✓ ${c.name} · Menge auf ${newQty} erhöht`);
      renderContent();
      return;
    }

    setState({ newShopItem: { name: c.name, emoji: '🛒', category: cat, qty: c.qty || 1, unit: c.unit || '', fav: false } });
    shopRememberCategory(c.name, cat);
    window._app._shopCatFreqBump(cat);
    const { shopAddItem } = await import('./modules/shopping.js');
    await shopAddItem(closeModal, showSync, renderContent, checkRateLimit);
  },

  // ── Tastaturnavigation ────────────────────────────────────────────────
  _shopAcKey: (e) => {
    const list = document.getElementById('shop-ac-list');
    if (!list || list.style.display === 'none') return;
    const items = list.querySelectorAll('.shop-ac-item');
    if (!items.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      window._app._shopAcIdx = Math.min(window._app._shopAcIdx + 1, items.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      window._app._shopAcIdx = Math.max(window._app._shopAcIdx - 1, 0);
    } else if (e.key === 'Enter' && window._app._shopAcIdx >= 0) {
      e.preventDefault();
      window._app._shopAcSelect(window._app._shopAcIdx);
      return;
    } else if (e.key === 'Escape') {
      list.style.display = 'none';
      window._app._shopAcIdx = -1;
      return;
    } else { return; }

    items.forEach((el, i) => { el.style.background = i === window._app._shopAcIdx ? 'var(--accent-bg)' : ''; });
    items[window._app._shopAcIdx]?.scrollIntoView({ block: 'nearest' });
  },

  // ── #1+2: Duplikat-Prüfung + Menge erhöhen beim normalen Hinzufügen ───
  _shopConfirmAdd: async () => {
    const name = document.getElementById('shop-item-name')?.value?.trim();
    if (!name) { document.getElementById('shop-item-name')?.focus(); return; }
    const qty  = parseFloat(document.getElementById('shop-add-qty')?.value) || 1;
    const unit = document.getElementById('shop-add-unit')?.value || '';
    const cat  = window._app._shopAddCat || 'sonstiges';

    // Duplikat in aktiver Liste suchen
    const nameLower = name.trim().toLowerCase();
    const existing  = state.shopItems.find(i =>
      i.list === state.activeShopList && i.name.trim().toLowerCase() === nameLower && !i.checked
    );
    if (existing) {
      const newQty = (parseFloat(existing.qty) || 1) + qty;
      const { id: _, ...rest } = existing;
      const { fbSet } = await import('./modules/firebase.js');
      await fbSet(`shopping/items/${existing.id}`, { ...rest, qty: newQty });
      setState({ shopItems: state.shopItems.map(i => i.id === existing.id ? { ...i, qty: newQty } : i) });
      closeModal();
      showSync(`✓ ${name} · Menge auf ${newQty} erhöht`);
      renderContent();
      window._app._shopCatFreqBump(cat);
      return;
    }

    setState({ newShopItem: { name, emoji: '🛒', category: cat, qty, unit, fav: false } });
    shopRememberCategory(name, cat);
    window._app._shopCatFreqBump(cat);
    const { shopAddItem } = await import('./modules/shopping.js');
    await shopAddItem(closeModal, showSync, renderContent, checkRateLimit);
  },

  // Invite link (old stub replaced)
  _shareInviteLink_stub: async () => {
    const id   = state.familyId;
    const name = encodeURIComponent(state.familyName || id);
    const url  = `https://famiplan.app/join.html?id=${id}&name=${name}`;
    // Write public entry first
    const { syncPublicFamily } = await import('./modules/firebase.js');
    await syncPublicFamily();
    if (navigator.share) {
      navigator.share({ title: 'famiplan', text: `Tritt unserer Familie auf famiplan bei!`, url }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(url);
      showSync('Link kopiert! ✓');
    }
  },
  showAdminPanel, adminGrantFamily, adminRevokeFamily,

  // ── Splash-Screen Handler ──────────────────────────────────────
  splashRegister: () => {
    localStorage.setItem('fp_visited', '1');
    const splash = document.getElementById('splash-screen');
    if (splash) splash.style.display = 'none';
    showAuthScreenDirect();
    setTimeout(() => window._app.authSetMode?.('register'), 100);
  },
  splashLogin: () => {
    localStorage.setItem('fp_visited', '1');
    showAuthScreenDirect();
    setTimeout(() => window._app.authSetMode?.('login'), 100);
  },
  splashDemo: () => {
    localStorage.setItem('fp_visited', '1');
    const splash = document.getElementById('splash-screen');
    if (splash) splash.style.display = 'none';
    import('./ui/onboarding.js').then(m => m.obShowDemo());
  },
  adminBulkIndexFamilies, adminDeleteFamily, adminSendBroadcast,
  showPushPage, scheduleReminders,
  getPushSetting, setPushSetting, sendPushToFamily,

  showOvTaskMenu: (id,iso) => showOvTaskMenu(id,iso),
  showAssignModal: (id,iso) => showAssignModal(id,iso),
  showCommentsModal: (id) => showCommentsModal(id),
  submitComment: async (taskId) => {
    const inp = document.getElementById('cmt-input');
    if (!inp?.value.trim()) return;
    const text = inp.value.trim();
    inp.disabled = true;
    await addComment(taskId, text, showSync, renderContent, checkRateLimit, isPremiumActive, ()=>{}, ()=>true);
    inp.value = ''; inp.disabled = false; inp.focus();
  },
  addTask:  () => addTask(renderContent, closeModal, showSync, showUpgradeModal, checkRateLimit, isPremiumActive),
  saveEdit: () => saveEdit(renderContent, closeModal, showSync),
  calPrev: () => {
    let {calView,calMonth,calYear,calSelISO}=state;
    if(calView==='month'){calMonth--;if(calMonth<0){calMonth=11;calYear--;}} 
    else if(calView==='week'){const d=new Date(calSelISO+'T12:00:00');d.setDate(d.getDate()-7);setState({calSelISO:localISO(d)});}
    setState({calMonth,calYear}); renderContent();
  },
  calNext: () => {
    let {calView,calMonth,calYear,calSelISO}=state;
    if(calView==='month'){calMonth++;if(calMonth>11){calMonth=0;calYear++;}}
    else if(calView==='week'){const d=new Date(calSelISO+'T12:00:00');d.setDate(d.getDate()+7);setState({calSelISO:localISO(d)});}
    setState({calMonth,calYear}); renderContent();
  },
  calSelectDay: (iso) => { const d=new Date(iso+'T12:00:00'); setState({calSelISO:iso,calYear:d.getFullYear(),calMonth:d.getMonth()}); renderContent(); },
  calGoToday: () => { const d=new Date(); setState({calSelISO:localISO(),calYear:d.getFullYear(),calMonth:d.getMonth()}); renderContent(); },
  shopAddAllFavsToList: async () => {
    const favs = state.shopItems.filter(i=>i.fav);
    if(!favs.length) return;
    for(const fav of favs){
      const exists = state.shopItems.some(i=>i.list===state.activeShopList&&i.name.toLowerCase()===fav.name.toLowerCase()&&!i.checked);
      if(exists) continue;
      const {shopPush} = await import('./modules/firebase.js');
      const payload = {name:fav.name,emoji:fav.emoji,category:fav.category||'sonstiges',qty:fav.qty||1,unit:fav.unit||'',checked:false,addedBy:state.curUser||'Ich',addedAt:Date.now(),list:state.activeShopList,fav:false};
      const {fbPush} = await import('./modules/firebase.js');
      const res = await fbPush('shopping/items', payload);
      setState({shopItems:[...state.shopItems,{id:res.name,...payload}]});
    }
    renderContent();
  },
  shopEditItem: (id) => {
    const item = state.shopItems.find(i => i.id === id);
    if (!item) return;
    setState({ newShopItem: { name: item.name, emoji: item.emoji || '🛒', category: item.category || 'sonstiges', qty: item.qty || 1, unit: item.unit || '', fav: item.fav || false } });
    const { SHOP_CATS, QTY_VALUES, UNIT_VALUES } = require('./modules/shopping.js');
    const escHtml = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    const qtyOpts  = [1,2,3,4,5,6,7,8,9,10,12,15,20,25,50,100,200,500,'½','¼','¾'].map(v => `<option value="${v}"${String(item.qty||1)===String(v)?' selected':''}>${v}</option>`).join('');
    const unitOpts = ['','Stück','g','kg','ml','L','EL','TL','Pck','Bund','Zehe','Scheibe','Dose','Fla'].map(v => `<option value="${v}"${(item.unit||'')===v?' selected':''}>${v||'–'}</option>`).join('');
    const catBtns  = [
      {id:'obst',name:'Obst & Gemüse',icon:'🥦'},{id:'milch',name:'Milch & Käse',icon:'🧀'},
      {id:'fleisch',name:'Fleisch & Fisch',icon:'🥩'},{id:'brot',name:'Brot',icon:'🍞'},
      {id:'tiefkuehl',name:'Tiefkühl',icon:'🧊'},{id:'getraenke',name:'Getränke',icon:'🥤'},
      {id:'snacks',name:'Snacks',icon:'🍫'},{id:'haushalt',name:'Haushalt',icon:'🧹'},
      {id:'hygiene',name:'Hygiene',icon:'🧴'},{id:'sonstiges',name:'Sonstiges',icon:'📦'},
    ].map(cat => `<button class="cat-btn${(item.category||'sonstiges')===cat.id?' sel':''}" 
      onclick="document.querySelectorAll('.cat-btn').forEach(b=>b.classList.remove('sel'));this.classList.add('sel');window._app._shopEditCat='${cat.id}'"
      >${cat.icon} ${cat.name}</button>`).join('');
    window._shopEditCat = item.category || 'sonstiges';
    openModal(`
      <div class="modal-handle"></div>
      <div class="modal-title">✏️ Artikel bearbeiten</div>
      <div class="form-group">
        <label class="form-lbl">Name</label>
        <input class="form-input" id="shop-edit-name" value="${escHtml(item.name)}" maxlength="100"/>
      </div>
      <div class="form-group">
        <label class="form-lbl">Menge & Einheit</label>
        <div style="display:flex;gap:10px">
          <select class="form-select" id="shop-edit-qty">${qtyOpts}</select>
          <select class="form-select" id="shop-edit-unit">${unitOpts}</select>
        </div>
      </div>
      <div class="form-group">
        <label class="form-lbl">Kategorie</label>
        <div class="cat-grid">${catBtns}</div>
      </div>
      <button class="submit-btn" onclick="window._app._shopSaveEdit('${id}')">Speichern ✓</button>
      <button class="modal-close" onclick="window._app.closeModal()">Abbrechen</button>
    `);
  },
  _shopEditCat: 'sonstiges',
  _shopSaveEdit: async (id) => {
    const item = state.shopItems.find(i => i.id === id); if (!item) return;
    const name = document.getElementById('shop-edit-name')?.value?.trim();
    if (!name) { closeModal(); return; }
    const qty  = document.getElementById('shop-edit-qty')?.value;
    const unit = document.getElementById('shop-edit-unit')?.value || '';
    const cat  = window._app._shopEditCat || item.category || 'sonstiges';
    closeModal();
    const parsedQty = isNaN(Number(qty)) ? qty : parseFloat(qty) || 1;
    setState({ newShopItem: { name, emoji: item.emoji || '🛒', category: cat, qty: parsedQty, unit, fav: item.fav || false } });
    const { shopSaveEdit } = await import('./modules/shopping.js');
    await shopSaveEdit(id, closeModal, showSync, renderContent);
  },
  shopAddFavToList: async (favId) => {
    const fav = state.shopItems.find(i=>i.id===favId); if(!fav) return;
    const exists = state.shopItems.some(i=>i.list===state.activeShopList&&i.name.toLowerCase()===fav.name.toLowerCase()&&!i.checked);
    if(exists){showSync('⚠️ Bereits in der Liste');return;}
    const {fbPush} = await import('./modules/firebase.js');
    const payload={name:fav.name,emoji:fav.emoji,category:fav.category||'sonstiges',qty:fav.qty||1,unit:fav.unit||'',checked:false,addedBy:state.curUser||'Ich',addedAt:Date.now(),list:state.activeShopList,fav:false};
    const res=await fbPush('shopping/items',payload);
    setState({shopItems:[...state.shopItems,{id:res.name,...payload}]});
    showSync('✓ Hinzugefügt');renderContent();
  },
  setTab, setDay, openModal, closeModal, showSync,
  startTabTour,
  getTab: () => state.tab,
  authSetMode, authSubmit, authGoogle, authForgotPassword,
  authSignOut: () => authSignOut(),
  deleteAccount: () => deleteAccount(showSync, closeModal, () => {}),
  renameMember:   (o,n,e)  => renameMember(o,n,e,renderContent),
  deleteMember:   (name)   => deleteMember(name, renderContent),
  handlePhotoUpload: (inp,n) => handlePhotoUpload(inp,n,showSync,renderContent),
  toggleDone:  (id,iso) => toggleDone(id,iso,renderContent,showSync),
  overdueMarkDone: async (id, iso) => {
    await toggleDone(id, iso, renderContent, showSync);
    showSync('✓ Als erledigt markiert');
  },
  overdueSnooze: async (id, iso) => {
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;
    if (task.recurring === 'once') {
      // Einmalige Task: auf heute verschieben
      const { id: _, ...rest } = task;
      const today = localISO();
      const { dayFromISO } = await import('./modules/utils.js');
      await import('./modules/firebase.js').then(({ fbSet }) =>
        fbSet('tasks/' + id, { ...rest, date: today, day: dayFromISO(today) })
      );
      setState({ tasks: state.tasks.map(t => t.id === id ? { ...t, date: today, day: dayFromISO(today) } : t) });
    } else {
      // Wiederkehrende Task: heutigen Tag als done markieren damit sie heute erscheint
      // nichts tun – sie erscheint automatisch heute in der normalen Liste
    }
    showSync('→ Für heute vorgemerkt');
    renderContent();
  },
  assignTask:  (id,m,iso) => assignTask(id,m,iso,renderContent,closeModal,showSync,openModal,()=>{},()=>true,()=>{}),
  unassign:    (id,iso) => unassign(id,iso,renderContent,showSync),
  deleteTask:  (id,iso) => deleteTask(id,iso,renderContent,openModal,closeModal,showSync),
  shopToggleCheck: (id) => shopToggleCheck(id, renderContent),
  shopToggleFav:   (id) => shopToggleFav(id,showSync,renderContent),
  shopDeleteItem:  (id) => shopDeleteItem(id,showSync,renderContent),
  shopSaveEdit:    (id) => shopSaveEdit(id,closeModal,showSync,renderContent),
  shopClearChecked: ()  => shopClearChecked(showSync,renderContent),
  shopSetListByIndex: (i) => { if(state.shopLists[i]){setState({activeShopList:state.shopLists[i]});try{localStorage.setItem('fp_active_shop_list',state.shopLists[i]);}catch(e){}renderContent();} },
  shopDeleteListByIndex: (i) => { if(state.shopLists[i]) shopDeleteList(state.shopLists[i],showSync,renderContent); },
  shopPromptAddList: () => { const n=prompt('Name der neuen Liste:'); if(n?.trim()) shopAddList(n.trim(),renderContent); },
  shopSetView: (v) => { setState({shopView:v}); renderContent(); },
  deleteMeal: (iso,type) => deleteMeal(iso,type,showSync,renderContent),
  mealIngredientsToShop: async (iso, type, scaleFactor) => {
    const result = await mealIngredientsToShop(iso, type, showSync, renderContent, setTab, scaleFactor);
    if (result?.needsScaling) {
      // Portionen-Dialog anzeigen
      const def = result.defaultServings;
      openModal(`
        <div class="modal-handle"></div>
        <div class="modal-title">Für wie viele Personen?</div>
        <div class="modal-sub">Rezept ist für ${def} Portionen – Mengen werden angepasst</div>
        <div style="display:flex;align-items:center;justify-content:center;gap:16px;margin:24px 0">
          <button type="button" onclick="
            const el=document.getElementById('scale-servings');
            if(parseInt(el.value)>1){el.value=parseInt(el.value)-1;document.getElementById('scale-label').textContent=el.value+' Personen';}
          " style="width:44px;height:44px;border:none;border-radius:50%;background:var(--bg3);font-size:22px;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center">−</button>
          <div style="text-align:center">
            <input type="number" id="scale-servings" value="${def}" min="1" max="20" style="display:none"/>
            <div id="scale-label" style="font-size:32px;font-weight:700;color:var(--text1)">${def} Personen</div>
          </div>
          <button type="button" onclick="
            const el=document.getElementById('scale-servings');
            if(parseInt(el.value)<20){el.value=parseInt(el.value)+1;document.getElementById('scale-label').textContent=el.value+' Personen';}
          " style="width:44px;height:44px;border:none;border-radius:50%;background:var(--bg3);font-size:22px;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center">+</button>
        </div>
        <button class="submit-btn" onclick="
          const wished=parseInt(document.getElementById('scale-servings').value)||${def};
          const factor=Math.round(wished/${def}*100)/100;
          window._app.closeModal();
          window._app.mealIngredientsToShop('${iso}','${type}',factor);
        ">Zur Einkaufsliste hinzufügen</button>
        <button class="modal-close" onclick="window._app.closeModal()">Abbrechen</button>
      `);
    }
  },
  showRecipeStepsModal: (iso,type,key) => showRecipeStepsModal(iso,type,key),
  showRecipeDetailModal: (iso,type) => showRecipeDetailModal(iso,type),
  showRecipeViewModal: (key) => showRecipeViewModal(key),
  showRecipeImportModal: () => showRecipeImportModal(),
  _recipeImportStart: () => _recipeImportStart(),
  _recipeImportSave: (r) => _recipeImportSave(r),
  _recipeImportTab: (t) => _recipeImportTab(t),
  _recipeImportPhotoSelected: (el) => _recipeImportPhotoSelected(el),
  _recipeEditSave: async (key) => {
    const name = document.getElementById('recipe-edit-name')?.value.trim();
    const prepTime = parseInt(document.getElementById('recipe-prep-time')?.value) || 0;
    const servings = parseInt(document.getElementById('recipe-servings')?.value) || 4;
    const ingredients = Array.from(document.querySelectorAll('.ingr-input'))
      .map(el => el.value.trim()).filter(Boolean);
    const steps = Array.from(document.querySelectorAll('.step-input'))
      .map(ta => ta.value.trim()).filter(Boolean);
    const existing = state.mealRecipes[key] || {};
    const updated = { ...existing, name: name || existing.name, prepTime, servings, ingredients, steps };
    setState({ mealRecipes: { ...state.mealRecipes, [key]: updated } });
    const { fbSet } = await import('./modules/firebase.js');
    await fbSet(`mealRecipes/${key}`, updated);
    showSync('✓ Rezept gespeichert');
    import('./ui/modals.js').then(m => { closeModal(); setTimeout(() => m.showRecipeManager(), 350); });
  },
  _recipeEditAddIngr: () => {
    const list = document.getElementById('recipe-ingr-list');
    if (!list) return;
    const empty = document.getElementById('ingr-empty');
    if (empty) empty.remove();
    const idx = list.querySelectorAll('.recipe-ingr-row').length;
    const row = document.createElement('div');
    row.className = 'recipe-ingr-row';
    row.id = 'ingr-row-' + idx;
    row.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:8px';
    row.innerHTML = '<input class="form-input ingr-input" data-ingr="' + idx + '" placeholder="Zutat ' + (idx+1) + '" style="flex:1;font-size:13px"/>'
      + '<button type="button" onclick="window._app._recipeEditRemoveIngr(' + idx + ')" style="width:30px;height:36px;border:none;border-radius:8px;background:var(--red-bg);color:var(--red-text);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;font-size:16px">×</button>';
    list.appendChild(row);
    row.querySelector('input')?.focus();
  },
  _recipeEditRemoveIngr: (idx) => {
    const row = document.getElementById('ingr-row-' + idx);
    if (row) row.remove();
    document.querySelectorAll('.recipe-ingr-row').forEach((r, i) => {
      const inp = r.querySelector('input');
      if (inp) inp.setAttribute('data-ingr', i);
      inp.placeholder = 'Zutat ' + (i+1);
      const btn = r.querySelector('button');
      if (btn) btn.setAttribute('onclick', 'window._app._recipeEditRemoveIngr(' + i + ')');
      r.id = 'ingr-row-' + i;
    });
  },
  _recipeAddStep: () => {
    const list = document.getElementById('recipe-steps-list');
    if (!list) return;
    const empty = document.getElementById('steps-empty');
    if (empty) empty.remove();
    const idx = list.querySelectorAll('.recipe-step-row').length;
    const row = document.createElement('div');
    row.className = 'recipe-step-row';
    row.id = 'step-row-' + idx;
    row.style.cssText = 'display:flex;align-items:flex-start;gap:10px;margin-bottom:10px';
    row.innerHTML = '<div style="width:24px;height:24px;border-radius:50%;background:#5C4EE5;color:white;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:8px">' + (idx+1) + '</div>'
      + '<textarea class="form-input step-input" data-step="' + idx + '" rows="2" style="flex:1;resize:none;line-height:1.5;font-size:13px" placeholder="Schritt ' + (idx+1) + ' beschreiben…"></textarea>'
      + '<button type="button" onclick="window._app._recipeRemoveStep(' + idx + ')" style="width:28px;height:28px;border:none;border-radius:6px;background:var(--red-bg);color:var(--red-text);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;margin-top:6px;font-size:14px">×</button>';
    list.appendChild(row);
    row.querySelector('textarea')?.focus();
  },
  _recipeRemoveStep: (idx) => {
    const row = document.getElementById('step-row-' + idx);
    if (row) row.remove();
    // Nummern neu vergeben
    document.querySelectorAll('.recipe-step-row').forEach((r, i) => {
      const num = r.querySelector('div');
      if (num) num.textContent = i + 1;
      const ta = r.querySelector('textarea');
      if (ta) ta.setAttribute('data-step', i);
      const btn = r.querySelector('button');
      if (btn) btn.setAttribute('onclick', 'window._app._recipeRemoveStep(' + i + ')');
      r.id = 'step-row-' + i;
    });
  },
  _recipeSaveSteps: async (iso, type, key) => {
    const steps = Array.from(document.querySelectorAll('.step-input'))
      .map(ta => ta.value.trim()).filter(Boolean);
    const prepTime = parseInt(document.getElementById('recipe-prep-time')?.value) || 0;
    const servings = parseInt(document.getElementById('recipe-servings')?.value) || 4;
    await saveRecipeSteps(key, steps, prepTime, servings);
    showSync('✓ Zubereitung gespeichert');
    closeModal();
    setTimeout(() => showMealEditModal(iso, type), 350);
  },
  _recipeStepsBack: (iso, type) => {
    closeModal();
    setTimeout(() => showMealEditModal(iso, type), 350);
  },
  toggleOptionalIngredient: (iso,type,ing) => toggleOptionalIngredient(iso,type,ing,renderContent,showSync),
  copyMealWeekToNext: () => copyMealWeekToNext(showSync,renderContent),

  // #2 Schnellzugriff Termin
  _quickAddEvent: () => {
    import('./modules/utils.js').then(({ localISO, dayFromISO }) => {
      const iso = localISO();
      setState({ fd: { ...state.fd, date: iso, day: dayFromISO(iso), type: 'event', time: '12:00' } });
      import('./ui/modals.js').then(m => m.showAddModal());
    });
  },

  // #5 To-Do Longpress → direkt erledigen
  _todoLpTimer: null,
  _todoLpStart: (e, id) => {
    window._app._todoLpEnd();
    window._app._todoLpTimer = setTimeout(async () => {
      window._app._todoLpTimer = null;
      const t = state.tasks.find(x => x.id === id); if (!t) return;
      const { fbSet } = await import('./modules/firebase.js');
      const assignments = { ...(t.assignments || {}), open: { ...(t.assignments?.open || {}), done: true, doneAt: Date.now() } };
      await fbSet(`tasks/${id}/assignments`, assignments);
      setState({ tasks: state.tasks.map(x => x.id === id ? { ...x, assignments } : x) });
      showSync('✓ Erledigt');
      renderContent();
    }, 600);
  },
  _todoLpEnd: () => {
    if (window._app._todoLpTimer) { clearTimeout(window._app._todoLpTimer); window._app._todoLpTimer = null; }
  },

  // #6 Reaktions-Picker
  _boardReactionPicker: (postId) => {
    import('./ui/modal.js').then(({ openModal, closeModal }) => {
      const btns = ['👍','❤️','😂','😮','🙌'].map(e =>
        `<button onclick="window._app.boardToggleReaction('${postId}','${e}');window._app.closeModal()"
          style="font-size:28px;background:none;border:1px solid var(--border);border-radius:12px;width:52px;height:52px;cursor:pointer;display:flex;align-items:center;justify-content:center">${e}</button>`
      ).join('');
      openModal(`<div class="modal-handle"></div>
        <div class="modal-title">Reaktion wählen</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;padding:8px 0 12px">${btns}</div>
        <button class="modal-close" onclick="window._app.closeModal()">Abbrechen</button>`);
    });
  },

  // #3 Foto-Zoom
  _boardPhotoZoom: (postId) => {
    const post = state.boardPosts[postId]; if (!post?.photo) return;
    import('./ui/modal.js').then(({ openModal }) => {
      openModal(`<div class="modal-handle"></div>
        <img src="${post.photo}" style="width:100%;border-radius:12px;display:block;margin-bottom:8px" onclick="window._app.closeModal()">
        <button class="modal-close" onclick="window._app.closeModal()">Schließen</button>`);
    });
  },
  copyMealWeekFromPrev: () => copyMealWeekFromPrev(showSync,renderContent),

  _mealCopyToNextConfirm: (hasConflict) => {
    if (!hasConflict) { copyMealWeekToNext(showSync, renderContent); return; }
    openModal(`
      <div class="modal-handle"></div>
      <div style="text-align:center;padding:8px 0 4px">
        <div style="font-size:36px;margin-bottom:8px">⚠️</div>
        <div class="modal-title">Nächste Woche überschreiben?</div>
        <div class="modal-sub">Die nächste Woche hat bereits geplante Mahlzeiten. Diese werden durch die aktuelle Woche ersetzt.</div>
      </div>
      <button class="submit-btn" style="background:#DC2626" onclick="window._app.closeModal();window._app.copyMealWeekToNext()">Ja, überschreiben</button>
      <button class="modal-close" onclick="window._app.closeModal()">Abbrechen</button>
    `);
  },

  _mealCopyFromPrevConfirm: (hasConflict) => {
    if (!hasConflict) { copyMealWeekFromPrev(showSync, renderContent); return; }
    openModal(`
      <div class="modal-handle"></div>
      <div style="text-align:center;padding:8px 0 4px">
        <div style="font-size:36px;margin-bottom:8px">⚠️</div>
        <div class="modal-title">Aktuelle Woche überschreiben?</div>
        <div class="modal-sub">Diese Woche hat bereits geplante Mahlzeiten. Wenn du die Vorwoche überträgst, werden sie ersetzt.</div>
      </div>
      <button class="submit-btn" style="background:#DC2626" onclick="window._app.closeModal();window._app.copyMealWeekFromPrev()">Ja, überschreiben</button>
      <button class="modal-close" onclick="window._app.closeModal()">Abbrechen</button>
    `);
  },

  // ── #7: Swipe-Löschen auf Mahlzeit-Slots ─────────────────────────────
  _mealSwipe: {},  // { iso_type: { startX, startY } }
  _mealSwipeStart: (e, iso, type) => {
    const t = e.touches[0];
    window._app._mealSwipe[iso + '_' + type] = { startX: t.clientX, startY: t.clientY };
  },
  _mealSwipeMove: (e, slotId) => {
    const el = document.getElementById(slotId);
    if (!el) return;
    const sw = Object.values(window._app._mealSwipe)[0];
    if (!sw) return;
    const dx = e.touches[0].clientX - sw.startX;
    const dy = Math.abs(e.touches[0].clientY - sw.startY);
    if (dy > 20) return; // vertikales Scrollen nicht blockieren
    if (dx < 0) {
      e.preventDefault();
      const shift = Math.max(dx, -80);
      el.style.transform = `translateX(${shift}px)`;
      el.style.transition = 'none';
      // Rotes Hintergrund-Feedback
      el.style.background = shift < -40 ? '#FEF2F2' : '';
    }
  },
  _mealSwipeEnd: (e, iso, type, slotId) => {
    const el  = document.getElementById(slotId);
    const key = iso + '_' + type;
    const sw  = window._app._mealSwipe[key];
    delete window._app._mealSwipe[key];
    if (!el || !sw) return;
    const dx = e.changedTouches[0].clientX - sw.startX;
    const dy = Math.abs(e.changedTouches[0].clientY - sw.startY);
    el.style.transition = 'transform 0.25s ease';
    if (dx < -60 && dy < 30) {
      // Weit genug gewischt → löschen
      el.style.transform = 'translateX(-100%)';
      el.style.opacity = '0';
      setTimeout(() => window._app.deleteMeal(iso, type), 220);
    } else {
      // Zurückfedern
      el.style.transform = '';
      el.style.background = '';
    }
  },
  setMealWeekOffset:  (n) => { setState({mealWeekOffset:n}); renderContent(); },
  _mealWeekLock:      () => { import('./ui/modals.js').then(m => m.showUpgradeModal('mealWeeks')); },
  boardToggleReaction: (pid,e) => boardToggleReaction(pid,e,renderContent),
  boardShowReaders: (pid, rid) => boardShowReaders(pid, rid, openModal, escapeHtml, boardTimeAgo),
  boardDeletePost:  (pid) => boardDeletePost(pid, renderContent),
  boardSubmitPost:  () => boardSubmitPost(closeModal, renderContent, showSync, checkRateLimit,
    (t,d,o) => sendPushToFamily(t,d,o), (k,def) => getPushSetting(k,def)),
  boardHandlePhoto: (inp) => boardHandlePhoto(inp),
  boardSubmitReply: (pid, text) => boardSubmitReply(pid, text, renderContent, showSync, checkRateLimit,
    (t,d,o) => sendPushToFamily(t,d,o), (k,def) => getPushSetting(k,def)),
  boardDeleteReply: (pid, rid) => boardDeleteReply(pid, rid, renderContent),
  _boardToggleReplies: (postId) => {
    if (!window._boardOpenReplies) window._boardOpenReplies = new Set();
    if (window._boardOpenReplies.has(postId)) window._boardOpenReplies.delete(postId);
    else window._boardOpenReplies.add(postId);
    renderContent();
    if (window._boardOpenReplies.has(postId))
      setTimeout(() => document.getElementById('board-ri-' + postId)?.focus(), 100);
  },
  openCheckout,
  setTodayView:    (v) => { setState({todayView:v}); renderContent(); },
  setTodayTimeline:(v) => { setState({todayTimeline:v}); renderContent(); },
  _toggleTodaySection: (key) => {
    const s = new Set(state._collapsedSections || []);
    s.has(key) ? s.delete(key) : s.add(key);
    setState({ _collapsedSections: s });
    renderContent();
  },
  _dayNoteTimer: null,
  _dayNoteInput: (el, iso) => {
    const val = el.value;
    setState({ dayNotes: { ...(state.dayNotes || {}), [iso]: val } });
    clearTimeout(window._app._dayNoteTimer);
    window._app._dayNoteTimer = setTimeout(async () => {
      if (!state.familyId) return;
      const { fbSet } = await import('./modules/firebase.js');
      await fbSet('dayNotes/' + iso, val || null).catch(() => {});
    }, 800);
  },
  setBundesland: (code) => { setBundesland(code); preloadSchulferien(); renderContent(); },
  setDarkMode: (mode) => {
    localStorage.setItem('fp_dark_mode', mode);
    applyDarkMode();
  },
  setTodayMember: (m) => { setState({todayMember:m}); renderContent(); },
  setDayView:   (v) => { setState({calDayView:v}); renderContent(); },
  setCalView:   (v) => { setState({calView:v}); renderContent(); },

  // ── #3+4: Tap auf leeren Zeitslot → Add-Modal mit Uhrzeit ────────────
  _calTimeSlotTap: (e, iso, minH, hourPx) => {
    if (e.target.closest('.tl3-event, .wk7-event, .tl3-event-title, .tl3-event-meta')) return;
    const rect    = e.currentTarget.getBoundingClientRect();
    const relY    = e.clientY - rect.top;
    const rawH    = minH + relY / hourPx;
    const hour    = Math.max(0, Math.min(23, Math.floor(rawH)));
    const min     = rawH % 1 >= 0.5 ? 30 : 0;
    const timeStr = String(hour).padStart(2,'0') + ':' + String(min).padStart(2,'0');
    import('./modules/utils.js').then(({ dayFromISO }) => {
      setState({ fd: { ...state.fd, date: iso, day: dayFromISO(iso), time: timeStr, type: 'event' } });
      import('./ui/modals.js').then(m => m.showAddModal());
    });
  },

  // ── Kalender Zoom ─────────────────────────────────────────────────────
  setCalZoom: (z) => {
    const zoom = Math.max(0, Math.min(2, z));
    setState({ calZoom: zoom, calShowTimeline: false });
    renderContent();
  },

  // Tap auf Tag: Timeline ein/ausklappen + zur frühesten Aufgabe scrollen
  calDayTap: (iso) => {
    const wasSelected = state.calSelISO === iso;
    const wasOpen     = state.calShowTimeline;
    // Wenn selber Tag nochmal: Timeline togglen
    // Wenn anderer Tag: auswählen + Timeline öffnen
    setState({
      calSelISO:       iso,
      calShowTimeline: wasSelected ? !wasOpen : true,
    });
    renderContent();
  },

  // Kombinierter Swipe (Monatswechsel) + Pinch (Zoom) Handler
  _calGesture: { startX: 0, startY: 0, startDist: 0, lastDist: 0, isPinch: false, tracking: false },

  // Swipe/Pinch wird direkt per addEventListener mit passive:false registriert
  // weil touch-action:none im HTML nötig ist – passiert beim ersten Rendern
  _calInitGesture: () => {
    const grid = document.getElementById('cal-month-grid');
    if (!grid || grid._gestureInit) return;
    grid._gestureInit = true;

    const g = window._app._calGesture;

    // touch-action:pan-y auf dem Grid → Browser übernimmt vertikales Scrollen nativ
    // Wir tracken nur für horizontale Auswertung bei touchend
    grid.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        g.startX    = e.touches[0].clientX;
        g.startY    = e.touches[0].clientY;
        g.endX      = e.touches[0].clientX;
        g.endY      = e.touches[0].clientY;
        g.tracking  = true;
        g.swipeDone = false;
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const d  = Math.hypot(dx, dy);
        g.startDist = d; g.lastDist = d;
        g.isPinch   = true; g.tracking = false;
      }
    }, { passive: true });

    grid.addEventListener('touchmove', (e) => {
      if (g.isPinch && e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        g.lastDist = Math.hypot(dx, dy);
        return;
      }
      if (!g.tracking || e.touches.length !== 1) return;
      // Position laufend aktualisieren (für touchend)
      g.endX = e.touches[0].clientX;
      g.endY = e.touches[0].clientY;
    }, { passive: true }); // passive:true → Browser scrollt nativ vertikal

    grid.addEventListener('touchend', (e) => {
      if (g.isPinch) {
        const ratio = g.lastDist / g.startDist;
        if (ratio > 1.2)      window._app.setCalZoom((state.calZoom || 0) + 1);
        else if (ratio < 0.8) window._app.setCalZoom((state.calZoom || 0) - 1);
        g.isPinch = false; g.tracking = false;
        return;
      }
      if (!g.tracking || g.swipeDone) return;
      g.tracking = false;

      const dx  = g.endX - g.startX;
      const dy  = g.endY - g.startY;
      const adx = Math.abs(dx);
      const ady = Math.abs(dy);
      const zoom = state.calZoom || 0;

      // Horizontaler Swipe: sehr strenge Schwellen damit Scrollen nie auslöst
      if (adx > 100 && adx > ady * 4) {
        if (g.swipePending) return;
        g.swipePending = true;
        g.swipeDone    = true;
        setTimeout(() => { g.swipePending = false; }, 600);

        const dir = dx > 0 ? -1 : 1;
        grid.style.transition = 'transform 0.18s ease, opacity 0.18s';
        grid.style.transform  = `translateX(${dir * -50}px)`;
        grid.style.opacity    = '0';
        setTimeout(() => {
          if (dx > 0) window._app.calPrev(); else window._app.calNext();
          requestAnimationFrame(() => {
            const g2 = document.getElementById('cal-month-grid');
            if (g2) {
              g2.style.transition = 'none';
              g2.style.transform  = `translateX(${dir * 50}px)`;
              g2.style.opacity    = '0';
              requestAnimationFrame(() => {
                g2.style.transition = 'transform 0.18s ease, opacity 0.18s';
                g2.style.transform  = '';
                g2.style.opacity    = '';
                setTimeout(() => { if (g2) g2.style.transition = ''; }, 200);
              });
            }
          });
        }, 140);
        return;
      }

      // Vertikaler Swipe im Zoom-Modus → Woche vor/zurück
      if (zoom > 0 && ady > 100 && ady > adx * 4) {
        const weeks  = dy < 0 ? 1 : -1;
        const cur    = new Date(state.calSelISO + 'T12:00:00');
        cur.setDate(cur.getDate() + weeks * 7);
        const newISO = cur.toISOString().split('T')[0];
        grid.style.transition = 'transform 0.18s ease, opacity 0.18s';
        grid.style.transform  = `translateY(${weeks * -30}px)`;
        grid.style.opacity    = '0';
        setTimeout(() => {
          setState({ calSelISO: newISO, calYear: cur.getFullYear(), calMonth: cur.getMonth() });
          renderContent();
          requestAnimationFrame(() => {
            const g2 = document.getElementById('cal-month-grid');
            if (g2) {
              g2.style.transition = 'none';
              g2.style.transform  = `translateY(${weeks * 30}px)`;
              g2.style.opacity    = '0';
              requestAnimationFrame(() => {
                g2.style.transition = 'transform 0.18s ease, opacity 0.18s';
                g2.style.transform  = '';
                g2.style.opacity    = '';
                setTimeout(() => { if (g2) g2.style.transition = ''; }, 200);
              });
            }
          });
        }, 140);
      }
    }, { passive: true });
  },

  // Dummy-Handler damit ontouchstart/move/end Attribute im HTML gültig bleiben
  _calMonthGestureStart: () => {},
  _calMonthGestureMove: () => {},
  _calMonthGestureEnd:  () => {},

  // ── #6: Longpress auf Tageszelle ──────────────────────────────────────
  _calLpTimer: null,
  _calLpStart: (e, iso) => {
    window._app._calLpEnd();
    window._app._calLpTimer = setTimeout(() => {
      window._app._calLpTimer = null;
      import('./modules/utils.js').then(({ dayFromISO }) => {
        setState({ fd: { ...state.fd, date: iso, day: dayFromISO(iso), time: '12:00', type: 'event' } });
        import('./ui/modals.js').then(m => m.showAddModal());
      });
    }, 500);
  },
  _calLpEnd: () => {
    if (window._app._calLpTimer) { clearTimeout(window._app._calLpTimer); window._app._calLpTimer = null; }
  },
};
// Globale Helfer für Meal-Modal Checkboxen
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
    box.style.cssText = 'width:18px;height:18px;border-radius:5px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border:1.5px solid #CBD5E0;background:transparent;';
    box.innerHTML = '';
    if (txt) txt.style.color = 'var(--text1)';
  }
};

window._rebuildOptChecks = function(val) {
  const container = document.getElementById('meal-opt-checks');
  if (!container) return;
  const lines = (val || '').split('\n').map(s => s.trim()).filter(Boolean);
  if (!lines.length) { container.innerHTML = ''; return; }
  const wasChecked = {};
  container.querySelectorAll('input[name="opt-sel"]').forEach(cb => { wasChecked[cb.value] = cb.checked; });
  const svg = '<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 5l2.5 2.5 4.5-4.5"/></svg>';
  container.innerHTML = '<div style="font-size:11px;color:var(--text3);margin-bottom:2px">Diese Woche dabei?</div>'
    + lines.map(function(ing) {
        const checked = wasChecked[ing] || false;
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
};



// ── APP INIT ──────────────────────────────────────────────────
export function appInit() {
  if (!state.familyId) {
    setState({
      familyId:   localStorage.getItem('fp_family_id')   || '',
      familyName: localStorage.getItem('fp_family_name') || '',
    });
  }
  const savedUser = localStorage.getItem('fp_user');
  if (!state.familyId) {
    showFamilySetup();
    const pendingJoinId = sessionStorage.getItem('fp_pending_join_id');
    if (pendingJoinId) {
      sessionStorage.removeItem('fp_pending_join_id');
      const pendingJoinName = sessionStorage.getItem('fp_pending_join_name') || '';
      sessionStorage.removeItem('fp_pending_join_name');
      setTimeout(() => {
        obGoTo(4);
        const idInput = document.getElementById('ob-join-id');
        if (idInput) idInput.value = pendingJoinId;
        const errEl = document.getElementById('ob-join-err');
        if (errEl && pendingJoinName) {
          errEl.style.color = 'var(--text3)';
          errEl.textContent = `Einladung von: ${pendingJoinName}`;
        }
      }, 300);
    }
  } else {
    const fib = document.getElementById('family-info-bar');
    const fnd = document.getElementById('family-name-display');
    const fid = document.getElementById('family-id-display');
    if (fib) fib.style.display = 'none';
    if (fnd) fnd.textContent = state.familyName;
    if (fid) fid.textContent = state.familyId;

    const _showAddMember = (isFirst) => showAddMemberModal(isFirst, openModal, closeModal, showSync, showUserModal);

    // Aktualisiert zeitabhaengige Anzeigen (z.B. "naechste Aufgabe in X Min."
    // im Home-Tab), die sonst nur bei echten Datenaenderungen neu gerendert
    // wuerden und bis zum naechsten App-Neustart eingefroren blieben.
    if (!window._clockTickId) {
      window._clockTickId = setInterval(() => {
        if (state.tab === 'overview') renderContent();
      }, 30000);
    }

    const loadAll = () => {
      subscribeToTasks(renderContent, loadComments);
      loadShopping(renderContent);
      loadComments();
      loadPhotos();
      loadMeals(renderContent);
      loadBoard(renderContent, updateBoardBadge);
      initCalendarSyncTriggers(); // no-op solange CALENDAR_SYNC_ENABLED=false (config.js)
    };

    if (savedUser) {
      const ns = document.getElementById('name-screen');
      if (ns) ns.remove();
      setState({ curUser: savedUser, boardLastSeen: parseInt(localStorage.getItem('fp_board_seen') || '0') });
      loadMembers(renderContent, _showAddMember).then(loadAll);
      bindMemberUid(savedUser).catch(() => {}); // Selbstheilung fuer Alt-Accounts ohne Verknuepfung

      if ('Notification' in window && Notification.permission === 'default' && !localStorage.getItem('fp_push_prompted')) {
        localStorage.setItem('fp_push_prompted', '1');
        // Push-Seite – wird in Phase 5 implementiert
      }
    } else {
      loadMembers(renderContent, _showAddMember).then(() => {
        loadAll();
        if (state.members.length > 0) showNameScreen();
      });
    }
  }
}

function showNameScreen() {
  const ns = document.getElementById('name-screen');
  if (ns) { ns.style.display = 'flex'; ns.style.opacity = '1'; ns.classList.add('visible'); }
  const grid = document.getElementById('name-grid');
  if (!grid) return;
  if (state.members.length === 0) { showAddMemberModal(true, openModal, closeModal, showSync, () => {}); return; }
  grid.innerHTML = state.members.map(m =>
    `<button class="name-btn" onclick="window._app.selectName('${escapeAttr(m)}')">
       <div class="name-av">${state.av[m] || '👤'}</div>
       <div class="name-nm">${escapeHtml(m)}</div>
     </button>`
  ).join('');
}


window._app.selectName = (name) => {
  try { localStorage.setItem('fp_user', name); } catch {}
  setState({ curUser: name });
  bindMemberUid(name).catch(() => {});
  const ns = document.getElementById('name-screen');
  if (ns) { ns.classList.remove('visible'); ns.style.transition='opacity 0.4s'; ns.style.opacity='0'; setTimeout(()=>ns.remove(),400); }
  const ub = document.getElementById('user-btn');
  if (ub) ub.textContent = (state.av[name]||'👤') + ' ' + name;
  subscribeToTasks(renderContent, loadComments);
  loadShopping(renderContent);
  loadComments(); loadPhotos(); loadMeals(renderContent);
};

window._app.confirmAddMember = (isFirst) => {
  const name = (document.getElementById('new-member-name')?.value || '').trim();
  if (!name) { document.getElementById('new-member-name')?.focus(); return; }
  if (state.members.includes(name)) { alert('Diesen Namen gibt es bereits.'); return; }
  saveMember(name, state._newMemberEmoji || '🧑', true, checkRateLimit).then(() => {
    closeModal(); showSync('✓ Profil erstellt!');
    if (isFirst) {
      setState({ curUser: name });
      try { localStorage.setItem('fp_user', name); } catch {}
      bindMemberUid(name).catch(() => {});
      loadTasks(renderContent, loadComments); loadShopping(renderContent);
    } else { showUserModal(); }
  });
};

// ── SERVICE WORKER ────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(e => console.warn('SW error:', e));
  });
  // Nachrichten vom SW empfangen (z.B. Tab öffnen nach Push-Klick)
  navigator.serviceWorker.addEventListener('message', e => {
    if (e.data?.type === 'OPEN_TAB' && e.data.tab) {
      window._app?.setTab(e.data.tab);
    }
  });
}

// ── BOOT ─────────────────────────────────────────────────────
initBottomNavFix();
initFirebaseAuth(
  () => proceedAfterAuth(appInit, loadUserPlan, setPlan),
  showAuthScreen
);


