import { state, setState } from './state.js';
import { fbGet, fbSet, fbPush, fbDel, fbFetch } from './firebase.js';
import { DB } from './state.js';
import { saveCache, loadCache } from './cache.js';
import { escapeHtml, escapeAttr } from './utils.js';

export const SHOP_CATS = [
  { id: 'obst',      name: 'Obst & Gemüse',   icon: '🥦' },
  { id: 'milch',     name: 'Milch & Käse',     icon: '🧀' },
  { id: 'fleisch',   name: 'Fleisch & Fisch',  icon: '🥩' },
  { id: 'brot',      name: 'Brot & Backwaren', icon: '🍞' },
  { id: 'tiefkuehl', name: 'Tiefkühl',         icon: '🧊' },
  { id: 'getraenke', name: 'Getränke',          icon: '🥤' },
  { id: 'snacks',    name: 'Snacks & Süßes',   icon: '🍫' },
  { id: 'haushalt',  name: 'Haushalt',         icon: '🧹' },
  { id: 'hygiene',   name: 'Hygiene',          icon: '🧴' },
  { id: 'sonstiges', name: 'Sonstiges',        icon: '📦' },
];

export const QTY_VALUES   = [...Array.from({ length: 99 }, (_, i) => i + 1), '½', '¼', '¾'];
export const UNIT_VALUES  = ['Stück','g','kg','ml','L','EL','TL','Pck','Bund','Zehe','Scheibe','Dose','Fla','Kst','cm',''];

// Category memory
export function shopRememberCategory(name, category) {
  if (!name || !category || category === 'sonstiges') return;
  try {
    const mem = JSON.parse(localStorage.getItem('fp_shop_cat_mem') || '{}');
    mem[name.trim().toLowerCase()] = category;
    localStorage.setItem('fp_shop_cat_mem', JSON.stringify(mem));
  } catch (e) {}
}

const CAT_SEED = {
  'milch':'milch','butter':'milch','käse':'milch','joghurt':'milch','quark':'milch','sahne':'milch','eier':'milch','ei':'milch',
  'hackfleisch':'fleisch','hähnchen':'fleisch','rindfleisch':'fleisch','wurst':'fleisch','lachs':'fleisch','fisch':'fleisch',
  'brot':'brot','brötchen':'brot','toast':'brot','mehl':'brot',
  'wasser':'getraenke','saft':'getraenke','bier':'getraenke','wein':'getraenke','kaffee':'getraenke','tee':'getraenke','cola':'getraenke',
  'chips':'snacks','schokolade':'snacks','kekse':'snacks','nüsse':'snacks',
  'spülmittel':'haushalt','waschmittel':'haushalt','müllbeutel':'haushalt',
  'shampoo':'hygiene','duschgel':'hygiene','zahnpasta':'hygiene','toilettenpapier':'hygiene',
  'nudeln':'sonstiges','reis':'sonstiges','zucker':'sonstiges','salz':'sonstiges','öl':'sonstiges',
  'tomate':'obst','tomaten':'obst','gurke':'obst','paprika':'obst','kartoffel':'obst','kartoffeln':'obst',
  'apfel':'obst','äpfel':'obst','banane':'obst','bananen':'obst','orange':'obst','orangen':'obst',
};

export function shopRecallCategory(name) {
  if (!name) return null;
  const key = name.trim().toLowerCase();
  try {
    const mem = JSON.parse(localStorage.getItem('fp_shop_cat_mem') || '{}');
    return mem[key] || CAT_SEED[key] || null;
  } catch (e) { return CAT_SEED[key] || null; }
}

// ── MULTI-PATH UPDATE HELPER ──────────────────────────────────
// Schickt einen einzigen PATCH-Request für mehrere Pfade gleichzeitig.
// Vorteil: 1 HTTP-Request statt N sequentielle Requests.
// Null-Wert = Löschen in Firebase.
// Geprüft gegen Firebase Rules: .write steht auf $family_id-Ebene →
// alle Pfade unter shopping/items/ sind damit abgedeckt.
async function fbMultiPath(updates) {
  const token = await (await import('./firebase.js')).getAuthToken();
  if (!token) throw new Error('Kein Auth-Token');
  const url = `${DB()}.json?auth=${token}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Multi-Path PATCH fehlgeschlagen (${res.status}): ${txt.slice(0, 100)}`);
  }
  return res.json();
}

// ── LOAD ──────────────────────────────────────────────────────
export async function loadShopping(renderContent) {
  if (window._shopPollPaused) return;

  if (!window._shopPoll) {
    const cachedItems = loadCache('shopItems');
    const cachedLists = loadCache('shopLists');
    if (cachedItems?.length) setState({ shopItems: cachedItems });
    if (cachedLists?.length) setState({ shopLists: cachedLists });
    if ((cachedItems || cachedLists) && state.tab === 'shop') renderContent();
  }

  if (!state.currentAuthUser) {
    if (!window._shopPoll) { window._shopPoll = true; setInterval(() => loadShopping(renderContent), 5000); }
    return;
  }

  try {
    const data = await fbGet('shopping');
    if (data) {
      if (data.lists) {
        const lists = [...new Set(['Wocheneinkauf', ...data.lists])];
        setState({ shopLists: lists });
        saveCache('shopLists', lists);
        if (!lists.includes(state.activeShopList)) {
          setState({ activeShopList: lists[0] });
          try { localStorage.setItem('fp_active_shop_list', lists[0]); } catch(e) {}
        }
      }
      if (data.items) {
        const newItems = Object.entries(data.items).map(([id, i]) => ({ id, ...i }));
        const stableStr = items => items.map(i => [i.id, i.name, i.category, i.qty, i.unit, i.checked, i.list, i.mealRef || '', i.mealQty || ''].join('|')).sort().join('||');
        if (stableStr(newItems) !== stableStr(state.shopItems)) {
          setState({ shopItems: newItems });
          saveCache('shopItems', newItems);
          if (state.tab === 'shop') renderContent();
        }
      } else if (state.tab === 'shop') renderContent();
    } else {
      await fbSet('shopping/lists', state.shopLists);
      if (state.tab === 'shop') renderContent();
    }
  } catch (e) { console.error('Shopping error:', e); if (state.tab === 'shop') renderContent(); }

  if (!window._shopPoll) { window._shopPoll = true; setInterval(() => loadShopping(renderContent), 5000); }
}

// ── ADD ───────────────────────────────────────────────────────
export async function shopAddItem(closeModal, showSync, renderContent, checkRateLimit) {
  const item = state.newShopItem || { name: '', emoji: '🛒', category: 'sonstiges', qty: 1, unit: '', fav: false };
  if (!item.name.trim()) return;
  if (!await checkRateLimit('shop')) return;

  shopRememberCategory(item.name, item.category);
  const payload = { ...item, checked: false, addedBy: state.curUser || 'Ich', addedAt: Date.now(), list: state.activeShopList };
  const res = await fbPush('shopping/items', payload);
  setState({ shopItems: [...state.shopItems, { id: res.name, ...payload }], newShopItem: { name: '', emoji: '🛒', category: 'sonstiges', qty: 1, unit: '', fav: false } });
  closeModal(); showSync('✓ Gespeichert'); renderContent();
}

// ── TOGGLE CHECK ─────────────────────────────────────────────
export async function shopToggleCheck(id, renderContent) {
  const item = state.shopItems.find(i => i.id === id); if (!item) return;
  // #4 Optimistic UI: State sofort setzen, Firebase im Hintergrund
  const newChecked = !item.checked;
  setState({ shopItems: state.shopItems.map(i => i.id === id ? { ...i, checked: newChecked } : i) });
  renderContent();
  const { id: _, ...rest } = item;
  fbSet(`shopping/items/${id}`, { ...rest, checked: newChecked }).catch(() => {
    // Rollback bei Fehler
    setState({ shopItems: state.shopItems.map(i => i.id === id ? { ...i, checked: item.checked } : i) });
    renderContent();
  });
}

// ── TOGGLE FAV ────────────────────────────────────────────────
export async function shopToggleFav(id, showSync, renderContent) {
  const item = state.shopItems.find(i => i.id === id); if (!item) return;
  if (!item.fav) {
    const dup = state.shopItems.find(i => i.id !== id && i.fav && i.name.toLowerCase() === item.name.toLowerCase());
    if (dup) { showSync('⚠️ Bereits in Favoriten'); return; }
  }
  const { id: _, ...rest } = item;
  const category = rest.category || shopRecallCategory(item.name) || 'sonstiges';
  await fbSet(`shopping/items/${id}`, { ...rest, category, fav: !item.fav });
  setState({ shopItems: state.shopItems.map(i => i.id === id ? { ...i, category, fav: !i.fav } : i) });
  showSync('✓ Gespeichert'); renderContent();
}

// ── DELETE ────────────────────────────────────────────────────
export async function shopDeleteItem(id, showSync, renderContent) {
  const item = state.shopItems.find(i => i.id === id);
  if (item) {
    if (item.name && item.category) shopRememberCategory(item.name, item.category);
    if (item.fav) {
      const { id: _, ...rest } = item;
      const updated = { ...rest, list: null, checked: false };
      await fbSet(`shopping/items/${id}`, updated);
      setState({ shopItems: state.shopItems.map(i => i.id === id ? { id, ...updated } : i) });
    } else {
      await fbDel(`shopping/items/${id}`);
      setState({ shopItems: state.shopItems.filter(i => i.id !== id) });
    }
  }
  showSync('✓ Gespeichert'); renderContent();
}

// ── SAVE EDIT ────────────────────────────────────────────────
export async function shopSaveEdit(id, closeModal, showSync, renderContent) {
  const item    = state.shopItems.find(i => i.id === id); if (!item) return;
  const newItem = state.newShopItem;
  if (!newItem?.name?.trim()) { closeModal(); return; }

  const updated = {
    name: newItem.name.trim(), emoji: newItem.emoji || item.emoji || '🛒',
    qty: newItem.qty, unit: newItem.unit, category: newItem.category,
    checked: item.checked || false, fav: item.fav || false,
    addedBy: item.addedBy || state.curUser || '', addedAt: item.addedAt || Date.now(),
    list: item.list || state.activeShopList,
    ...(item.mealRef  ? { mealRef:  item.mealRef  } : {}),
    ...(item.mealQty  != null ? { mealQty:  item.mealQty  } : {}),
    ...(item.mealUnit != null ? { mealUnit: item.mealUnit } : {}),
  };

  if (updated.name && updated.category) shopRememberCategory(updated.name, updated.category);

  closeModal();
  try {
    window._shopPollPaused = true;
    await fbSet(`shopping/items/${id}`, updated);
    setState({ shopItems: state.shopItems.map(i => i.id === id ? { id, ...updated } : i) });
    saveCache('shopItems', state.shopItems);
    renderContent(); showSync('✓ Gespeichert');
    setTimeout(() => { window._shopPollPaused = false; }, 4000);
    setState({ newShopItem: { name: '', emoji: '🛒', category: 'sonstiges', qty: 1, unit: '', fav: false } });
  } catch (e) {
    window._shopPollPaused = false;
    showSync('⚠️ Fehler beim Speichern');
  }
}

// ── CLEAR CHECKED ─────────────────────────────────────────────
// Optimiert: statt N sequentieller Firebase-Requests ein einziger
// Multi-Path PATCH. Favoriten werden auf list:null gesetzt, normale
// Artikel werden mit null (= löschen) übergeben.
export async function shopClearChecked(showSync, renderContent) {
  const checked = state.shopItems.filter(i => i.checked && i.list === state.activeShopList);
  if (!checked.length) { showSync('Keine erledigten Artikel'); return; }

  // Kategorie-Memory vorab speichern (kein Firebase-Zugriff)
  checked.forEach(item => {
    if (item.name && item.category) shopRememberCategory(item.name, item.category);
  });

  // Multi-Path Update aufbauen:
  // Favoriten → list:null, checked:false (behalten aber aus Liste entfernen)
  // Normale   → null (löschen)
  const updates = {};
  checked.forEach(item => {
    const { id: _, ...rest } = item;
    if (item.fav) {
      updates[`shopping/items/${item.id}`] = { ...rest, list: null, checked: false };
    } else {
      updates[`shopping/items/${item.id}`] = null;
    }
  });

  try {
    await fbMultiPath(updates);

    // State lokal anpassen
    let newItems = state.shopItems;
    checked.forEach(item => {
      if (item.fav) {
        const { id: _, ...rest } = item;
        newItems = newItems.map(x => x.id === item.id ? { id: item.id, ...rest, list: null, checked: false } : x);
      } else {
        newItems = newItems.filter(x => x.id !== item.id);
      }
    });
    setState({ shopItems: newItems });
    saveCache('shopItems', newItems);
    showSync('✓ Gespeichert'); renderContent();
  } catch (e) {
    showSync('⚠️ Fehler beim Löschen'); console.error(e);
  }
}

// ── LIST MANAGEMENT ───────────────────────────────────────────
export async function shopAddList(name, renderContent) {
  const safeName = name?.trim().slice(0, 50);
  if (!safeName || state.shopLists.includes(safeName)) return;
  // Free-Limit: max. 1 Einkaufsliste
  const { checkFreeLimit } = await import('./premium.js');
  if (checkFreeLimit('shopLists', state.shopLists.length)) return;
  const lists = [...state.shopLists, safeName];
  setState({ shopLists: lists, activeShopList: safeName });
  await fbSet('shopping/lists', lists);
  renderContent();
}

// Optimiert: statt N sequentieller fbDel-Calls ein einziger Multi-Path PATCH.
export async function shopDeleteList(name, showSync, renderContent) {
  if (state.shopLists.length <= 1) { showSync('⚠️ Letzte Liste kann nicht gelöscht werden'); return; }
  if (!confirm(`Liste "${name}" und alle Artikel darin löschen?`)) return;

  const toDelete = state.shopItems.filter(i => i.list === name);

  // Alle Artikel der Liste in einem einzigen Request löschen
  if (toDelete.length > 0) {
    const updates = {};
    toDelete.forEach(i => { updates[`shopping/items/${i.id}`] = null; });
    try {
      await fbMultiPath(updates);
    } catch (e) {
      showSync('⚠️ Fehler beim Löschen'); console.error(e); return;
    }
  }

  const lists = state.shopLists.filter(l => l !== name);
  setState({
    shopItems: state.shopItems.filter(i => i.list !== name),
    shopLists: lists,
    activeShopList: state.activeShopList === name ? lists[0] : state.activeShopList,
  });
  await fbSet('shopping/lists', lists);
  showSync('✓ Liste gelöscht'); renderContent();
}


