import { state, setState } from './state.js';
import { fbGet, fbSet, fbDel } from './firebase.js';
import { escapeHtml } from './utils.js';

// ── LOAD ──────────────────────────────────────────────────────
export async function loadMeals(renderContent) {
  if (!state.familyId || localStorage.getItem('fp_demo_mode') === '1') return;
  try {
    const [meals, mealRecipes] = await Promise.all([
      fbGet('meals'),
      fbGet('mealRecipes'),
    ]);
    setState({
      meals:       meals       || {},
      mealRecipes: mealRecipes || {},
    });
    renderContent();
  } catch (e) {
    // meals/mealRecipes NIEMALS im catch leeren
    console.warn('loadMeals error (meals preserved):', e.message);
  }
}

// ── SAVE RECIPE ───────────────────────────────────────────────
export async function saveMealRecipe(name, ingredients, optionalIngredients) {
  if (!name.trim() || !state.familyId) return;
  const key      = name.trim().toLowerCase().replace(/[^a-z0-9äöüß]/g, '_').slice(0, 40);
  const existing = state.mealRecipes[key];
  // Migration: bestehende Rezepte ohne useCount starten bei 1, dann +1
  const prevCount = existing?.useCount ?? (existing ? 1 : 0);
  const recipe = {
    name: name.trim(),
    ingredients: ingredients || [],
    optionalIngredients: optionalIngredients || [],
    usedAt: Date.now(),
    useCount: prevCount + 1,
    // Zubereitungsschritte + Metadaten beibehalten wenn bereits vorhanden
    ...(existing?.steps     ? { steps:    existing.steps    } : {}),
    ...(existing?.prepTime  ? { prepTime: existing.prepTime } : {}),
    ...(existing?.servings  ? { servings: existing.servings } : {}),
  };
  setState({ mealRecipes: { ...state.mealRecipes, [key]: recipe } });
  try { await fbSet(`mealRecipes/${key}`, recipe); } catch (e) {}
}

// ── SAVE RECIPE STEPS (Zubereitungsschritte) ──────────────────
export async function saveRecipeSteps(key, steps, prepTime, servings) {
  if (!state.familyId || !key) return;
  const existing = state.mealRecipes[key];
  if (!existing) return;
  const updated = { ...existing, steps: steps || [], prepTime: prepTime || 0, servings: servings || 4 };
  setState({ mealRecipes: { ...state.mealRecipes, [key]: updated } });
  try { await fbSet(`mealRecipes/${key}`, updated); } catch (e) {}
}

// ── DELETE RECIPE ─────────────────────────────────────────────
export async function deleteMealRecipe(key, renderContent, showSync) {
  if (!state.familyId) return;
  const recipes = { ...state.mealRecipes };
  delete recipes[key];
  setState({ mealRecipes: recipes });
  try {
    await fbDel(`mealRecipes/${key}`);
    if (showSync) showSync('✓ Rezept gelöscht');
  } catch (e) {
    if (showSync) showSync('Fehler beim Löschen');
  }
  if (renderContent) renderContent();
}

// ── SAVE MEAL ─────────────────────────────────────────────────
export async function saveMeal(iso, type, name, emoji, ingredients, renderContent, showSync, optionalIngredients, selectedOptionals) {
  if (!state.familyId) return;
  // Bestehende Felder beibehalten (z.B. addedToShop)
  const existing = state.meals[iso]?.[type] || {};
  const meal = {
    ...existing,
    name: name.trim(),
    emoji: emoji || existing.emoji || '🍽️',
    ingredients: ingredients || [],
    optionalIngredients: optionalIngredients || [],
    selectedOptionals: selectedOptionals || [],
    savedAt: Date.now(),
  };
  const meals  = { ...state.meals };
  if (!meals[iso]) meals[iso] = {};
  meals[iso][type] = meal;
  setState({ meals });
  renderContent();
  try {
    await fbSet(`meals/${iso}/${type}`, meal);
    if (ingredients && ingredients.length) await saveMealRecipe(name, ingredients, optionalIngredients);
    showSync('✓ Mahlzeit gespeichert');
  } catch (e) {
    console.error('saveMeal Firebase error:', e.message, '| familyId:', state.familyId, '| hasUser:', !!state.currentAuthUser);
    showSync('Fehler beim Speichern: ' + e.message.slice(0, 60));
  }
}

// ── DELETE MEAL ───────────────────────────────────────────────
export async function deleteMeal(iso, type, showSync, renderContent) {
  if (!state.familyId) return;
  const meals = { ...state.meals };
  if (!meals[iso]) return;

  // Remove associated shopping items
  const mealRef  = `${iso}_${type}`;
  const affected = state.shopItems.filter(i => i.mealRef === mealRef && !i.checked);

  for (const item of affected) {
    if (item.mealQty != null) {
      const a      = parseFloat(String(item.qty)) || 0;
      const b      = parseFloat(String(item.mealQty)) || 0;
      const newQty = Math.round((a - b) * 10) / 10;
      if (newQty <= 0) {
        try { await fbDel(`shopping/items/${item.id}`); } catch (e) {}
        setState({ shopItems: state.shopItems.filter(i => i.id !== item.id) });
      } else {
        const { id: _, ...rest } = item;
        const updated = { ...rest, qty: newQty, mealRef: undefined, mealQty: undefined, mealUnit: undefined };
        try { await fbSet(`shopping/items/${item.id}`, updated); } catch (e) {}
        setState({ shopItems: state.shopItems.map(i => i.id === item.id ? { id: item.id, ...updated } : i) });
      }
    } else {
      try { await fbDel(`shopping/items/${item.id}`); } catch (e) {}
      setState({ shopItems: state.shopItems.filter(i => i.id !== item.id) });
    }
  }

  delete meals[iso][type];
  if (Object.keys(meals[iso]).length === 0) delete meals[iso];
  setState({ meals });
  renderContent();
  try { await fbDel(`meals/${iso}/${type}`); } catch (e) {}
}

// ── WEEK HELPERS ──────────────────────────────────────────────
export function getMealWeekDays() {
  const today  = new Date();
  const monday = new Date(today);
  const day    = today.getDay() === 0 ? 6 : today.getDay() - 1;
  monday.setDate(today.getDate() - day + state.mealWeekOffset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split('T')[0];
  });
}

export function getMealWeekLabel() {
  const days  = getMealWeekDays();
  const first = days[0].split('-');
  const last  = days[6].split('-');
  if (state.mealWeekOffset === 0) return 'Diese Woche';
  if (state.mealWeekOffset === 1) return 'Nächste Woche';
  return `${parseInt(first[2])}.${parseInt(first[1])} – ${parseInt(last[2])}.${parseInt(last[1])}`;
}

// ── COPY WEEK ─────────────────────────────────────────────────
export async function copyMealWeekToNext(showSync, renderContent) {
  const currentDays = getMealWeekDays();
  const nextDays    = currentDays.map(iso => {
    const d = new Date(iso + 'T12:00:00');
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });

  let copied = 0;
  const meals = { ...state.meals };

  for (let i = 0; i < 7; i++) {
    const srcDay = state.meals[currentDays[i]];
    if (!srcDay) continue;
    for (const [type, meal] of Object.entries(srcDay)) {
      try {
        await fbSet(`meals/${nextDays[i]}/${type}`, { ...meal, savedAt: Date.now() });
        if (!meals[nextDays[i]]) meals[nextDays[i]] = {};
        meals[nextDays[i]][type] = meal;
        copied++;
      } catch (e) {}
    }
  }

  setState({ meals });
  showSync(`✓ ${copied} Mahlzeiten kopiert`);
  renderContent();
}

// ── #5: VORWOCHE ÜBERNEHMEN ───────────────────────────────────
export async function copyMealWeekFromPrev(showSync, renderContent) {
  const currentDays = getMealWeekDays();
  const prevDays    = currentDays.map(iso => {
    const d = new Date(iso + 'T12:00:00');
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });

  const hasPrev = prevDays.some(iso => {
    const day = state.meals[iso];
    return day && Object.values(day).some(m => m?.name);
  });
  if (!hasPrev) { showSync('⚠️ Vorwoche hat keine Mahlzeiten'); return; }

  let copied = 0;
  const meals = { ...state.meals };

  for (let i = 0; i < 7; i++) {
    const srcDay = state.meals[prevDays[i]];
    if (!srcDay) continue;
    for (const [type, meal] of Object.entries(srcDay)) {
      const { addedToShop, ...mealClean } = meal;
      try {
        await fbSet(`meals/${currentDays[i]}/${type}`, { ...mealClean, savedAt: Date.now() });
        if (!meals[currentDays[i]]) meals[currentDays[i]] = {};
        meals[currentDays[i]][type] = mealClean;
        copied++;
      } catch (e) {}
    }
  }

  setState({ meals });
  showSync(`✓ ${copied} Mahlzeiten aus Vorwoche übernommen`);
  renderContent();
}

// ── PARSE INGREDIENT ─────────────────────────────────────────
export function parseIngredient(raw) {
  const s = raw.trim();
  const m = s.match(/^([0-9]+[.,]?[0-9]*)\s*(g|kg|ml|l|L|cl|Stück|Stk|Pck|Pckg|EL|TL|Tasse|Becher|Dose|Fla|Kst|Bund|Zehe|Scheibe|Scheiben|cm)?\s*(.+)$/i);
  if (m) {
    const qty  = parseFloat(m[1].replace(',', '.'));
    const unit = (m[2] || '').trim();
    const name = (m[3] || '').trim();
    return { qty: isNaN(qty) ? 1 : qty, unit, name: name || s };
  }
  return { qty: 1, unit: '', name: s };
}

function addQty(existingQty, existingUnit, newQty, newUnit) {
  const eu = (existingUnit || '').toLowerCase();
  const nu = (newUnit || '').toLowerCase();
  if (eu === nu || eu === '' || nu === '') {
    const sum = (parseFloat(String(existingQty)) || 0) + (parseFloat(String(newQty)) || 0);
    return { qty: Number.isInteger(sum) ? sum : Math.round(sum * 10) / 10, unit: eu || nu };
  }
  return { qty: newQty, unit: newUnit };
}


// ── TOGGLE OPTIONAL INGREDIENT ON/OFF SHOPPING LIST ──────────
export async function toggleOptionalIngredient(iso, type, ingName, renderContent, showSync) {
  const meal = state.meals[iso]?.[type];
  if (!meal) return;

  const { shopItems, activeShopList, curUser } = state;
  const { shopRecallCategory } = await import('./shopping.js');
  const nameLower = ingName.toLowerCase().trim();
  const list = activeShopList || 'Wocheneinkauf';
  const mealRef = `${iso}_${type}`;

  // Bereits auf der Liste? → entfernen
  const existing = shopItems.find(i =>
    i.name.toLowerCase().trim() === nameLower && i.list === list && !i.checked && i.mealRef === mealRef + '_opt'
  );

  if (existing) {
    // Entfernen
    try { await fbDel(`shopping/items/${existing.id}`); } catch (e) {}
    setState({ shopItems: state.shopItems.filter(i => i.id !== existing.id) });
    // addedOptionals aktualisieren
    const _existingOpts = meal.addedOptionals
    ? (Array.isArray(meal.addedOptionals) ? meal.addedOptionals : Object.values(meal.addedOptionals))
    : [];
  const addedOptionals = _existingOpts.filter(n => n !== ingName);
    const meals = { ...state.meals };
    meals[iso][type] = { ...meal, addedOptionals };
    setState({ meals });
    try { await fbSet(`meals/${iso}/${type}/addedOptionals`, addedOptionals); } catch (e) {}
    showSync('✓ Aus Einkaufsliste entfernt');
  } else {
    // Hinzufügen
    const parsed = parseIngredient(ingName);
    const arr = new Uint8Array(4); crypto.getRandomValues(arr);
    const id  = 'shop_' + Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
    const item = {
      name: parsed.name, emoji: '🛒',
      qty: parsed.qty, unit: parsed.unit,
      category: shopRecallCategory(parsed.name) || 'sonstiges',
      checked: false, fav: false,
      addedBy: curUser || '', addedAt: Date.now(),
      list, mealRef: mealRef + '_opt',
    };
    setState({ shopItems: [...state.shopItems, { id, ...item }] });
    try { await fbSet(`shopping/items/${id}`, item); } catch (e) {}
    // addedOptionals aktualisieren
    const _existingOpts2 = meal.addedOptionals
      ? (Array.isArray(meal.addedOptionals) ? meal.addedOptionals : Object.values(meal.addedOptionals))
      : [];
    const addedOptionals = [..._existingOpts2, ingName];
    const meals = { ...state.meals };
    meals[iso][type] = { ...meal, addedOptionals };
    setState({ meals });
    try { await fbSet(`meals/${iso}/${type}/addedOptionals`, addedOptionals); } catch (e) {}
    showSync('✓ Zur Einkaufsliste hinzugefügt');
  }
  renderContent();
}

// ── INGREDIENTS TO SHOP ───────────────────────────────────────
export async function mealIngredientsToShop(iso, type, showSync, renderContent, setTab, scaleFactor) {
  const meal = state.meals[iso]?.[type];
  if (!meal?.ingredients?.length) { showSync('Keine Zutaten vorhanden'); return; }
  if (meal.addedToShop) { showSync('Bereits zur Einkaufsliste hinzugefügt'); return; }

  // Portionsskalierung: wenn Rezept gespeicherte Portionen hat und kein scaleFactor übergeben
  // wurde, Portionen-Dialog anzeigen (wird von main.js aus aufgerufen)
  if (scaleFactor === undefined) {
    const recipeKey = meal.name?.toLowerCase().replace(/[^a-z0-9äöüß]/g, '_').slice(0, 40);
    const recipe    = recipeKey ? state.mealRecipes?.[recipeKey] : null;
    if (recipe?.servings) {
      // Signal an main.js: Portionen-Dialog zeigen
      return { needsScaling: true, defaultServings: recipe.servings, iso, type };
    }
    scaleFactor = 1;
  }

  const { shopItems, activeShopList, curUser } = state;
  const { fbSet } = await import('./firebase.js');
  const { shopRecallCategory } = await import('./shopping.js');

  // Pflicht-Zutaten + ausgewählte optionale kombinieren
  const selectedOptionals = meal.selectedOptionals
    ? (Array.isArray(meal.selectedOptionals) ? meal.selectedOptionals : Object.values(meal.selectedOptionals))
    : [];
  const allIngredients = [...(meal.ingredients || []), ...selectedOptionals];

  let added = 0, merged = 0;

  for (const ing of allIngredients) {
    if (!ing.trim()) continue;
    const parsed   = parseIngredient(ing);
    // Menge skalieren wenn Faktor != 1
    if (scaleFactor && scaleFactor !== 1 && parsed.qty && parsed.qty > 0) {
      parsed.qty = Math.round(parsed.qty * scaleFactor * 10) / 10;
    }
    const nameLower = parsed.name.toLowerCase().trim();
    const list      = activeShopList || 'Wocheneinkauf';

    const existing = shopItems.find(i =>
      i.name.toLowerCase().trim() === nameLower && i.list === list && !i.checked
    );

    if (existing) {
      const { qty: newQty, unit: newUnit } = addQty(existing.qty, existing.unit, parsed.qty, parsed.unit);
      const mealRef = existing.mealRef || `${iso}_${type}`;
      const updated = {
        name: existing.name, emoji: existing.emoji || '🛒',
        qty: newQty, unit: newUnit,
        category: existing.category || shopRecallCategory(existing.name) || 'sonstiges',
        checked: false, fav: existing.fav || false,
        addedBy: existing.addedBy || curUser || '',
        addedAt: existing.addedAt || Date.now(),
        list: existing.list, mealRef, mealQty: parsed.qty, mealUnit: parsed.unit || newUnit,
      };
      try { await fbSet(`shopping/items/${existing.id}`, updated); } catch (e) {}
      setState({ shopItems: shopItems.map(i => i.id === existing.id ? { id: existing.id, ...updated } : i) });
      merged++;
    } else {
      const arr  = new Uint8Array(4); crypto.getRandomValues(arr);
      const id   = 'shop_' + Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
      const item = {
        name: parsed.name, emoji: '🛒',
        qty: parsed.qty, unit: parsed.unit,
        category: shopRecallCategory(parsed.name) || 'sonstiges',
        checked: false, fav: false,
        addedBy: curUser || '', addedAt: Date.now(),
        list, mealRef: `${iso}_${type}`,
      };
      setState({ shopItems: [...state.shopItems, { id, ...item }] });
      try { await fbSet(`shopping/items/${id}`, item); } catch (e) {}
      added++;
    }
  }

  const ts = Date.now();
  const meals = { ...state.meals };
  if (!meals[iso]) meals[iso] = {};
  if (!meals[iso][type]) meals[iso][type] = {};
  meals[iso][type] = { ...meals[iso][type], addedToShop: ts };
  setState({ meals });
  try { const { fbSet: fs } = await import('./firebase.js'); await fs(`meals/${iso}/${type}/addedToShop`, ts); } catch (e) {}

  const parts = [];
  if (added > 0)  parts.push(`${added} neu hinzugefügt`);
  if (merged > 0) parts.push(`${merged} Menge${merged !== 1 ? 'n' : ''} aktualisiert`);
  showSync(parts.join(', '));
  renderContent();
  setTab('shop');
}


