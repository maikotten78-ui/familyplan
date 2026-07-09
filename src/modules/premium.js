import { DB_ROOT, PREMIUM_ENABLED, ADMIN_UIDS, LS_CHECKOUT } from './config.js';
import { state, setState } from './state.js';
import { fbFetch } from './firebase.js';

// ── ADMIN CHECK ───────────────────────────────────────────────
export function isAdmin() {
  return state.currentAuthUser && ADMIN_UIDS.includes(state.currentAuthUser.uid);
}

// ── SET PLAN ──────────────────────────────────────────────────
export function setPlan(plan, data = {}) {
  setState({
    _verifiedPlan:     plan,
    userPlan:          plan,
    userPlanData:      data,
    _planLastVerified: Date.now(),
  });
}

// ── FREEMIUM LIMITS ──────────────────────────────────────────
export const FREE_LIMITS = {
  members:     3,    // max. 3 Familienmitglieder
  tasks:       15,   // max. 15 aktive Aufgaben/Termine
  comments:    5,    // max. 5 Kommentare pro Tag
  shopLists:   1,    // max. 1 Einkaufsliste
  boardPosts:  3,    // max. 3 Board-Posts pro Tag
  mealWeeks:   1,    // nur aktuelle Woche bei Mahlzeiten
};

// ── IS PREMIUM ACTIVE ─────────────────────────────────────────
export function isPremiumActive() {
  if (!PREMIUM_ENABLED)              return true;
  if (isAdmin())                     return true;
  if (state._planLastVerified === 0) return true; // App-Start: im Zweifel erlauben
  return ['premium', 'granted'].includes(state._verifiedPlan);
}

// ── FREE LIMIT CHECK ──────────────────────────────────────────
// Gibt true zurück wenn Limit erreicht und Upgrade-Modal gezeigt werden soll
export function checkFreeLimit(type, currentCount) {
  if (isPremiumActive()) return false; // kein Limit für Premium
  const limit = FREE_LIMITS[type];
  if (!limit) return false;
  if (currentCount >= limit) {
    import('../ui/modals.js').then(m => m.showUpgradeModal(type));
    return true; // geblockt
  }
  return false;
}

// ── LOAD USER PLAN ────────────────────────────────────────────
export async function loadUserPlan() {
  if (!PREMIUM_ENABLED) { setPlan('free'); return; }
  if (!state.currentAuthUser) return;
  try {
    const uid = state.currentAuthUser.uid;

    // 1. Familien-Freizugang
    // WICHTIG (Sicherheits-Review 08.07.2026): liegt seit heute unter dem
    // eigenstaendigen Top-Level-Pfad familyAccess/{familyId}, NICHT mehr
    // unter families/{familyId}/access. Grund: families/{familyId} hat ein
    // breites .write fuer alle Familienmitglieder, das per Firebase-Regel-
    // Kaskadierung nicht nachtraeglich eingeschraenkt werden kann - jedes
    // Familienmitglied haette sich sonst selbst granted:true setzen koennen.
    // familyAccess/{familyId} hat eine eigene .write-Regel (nur Admin).
    if (state.familyId) {
      const ra     = await fbFetch(`${DB_ROOT}/familyAccess/${state.familyId}.json`);
      const access = await ra.json();
      if (access && access.granted) { setPlan('granted', access); return; }
    }

    // 2. Persönlicher Plan
    // WICHTIG (Sicherheits-Review 08.07.2026): liegt seit heute unter
    // userPlans/{uid} statt users/{uid}/plan - aus demselben Grund wie oben
    // (users/{uid} hat .write fuer den Nutzer selbst, das haette sonst eine
    // Selbstfreischaltung von Premium ohne Bezahlung erlaubt).
    const r    = await fbFetch(`${DB_ROOT}/userPlans/${uid}.json`);
    const data = await r.json();
    if (data) {
      if (data.granted)                        { setPlan('granted', data); return; }
      if (data.premium && data.premium.active) { setPlan('premium', data); return; }
      // Trial-Plan wird nicht mehr unterstützt → Free
    }
    // Kein Plan → Free (kein Trial mehr)
    setPlan('free');
  } catch (e) { setPlan('free'); }
}

// ── RENDER PLAN BANNER ───────────────────────────────────────
export function renderTrialBanner() {
  // Trial-Modus abgeschafft – Banner immer ausblenden
  const el = document.getElementById('trial-banner');
  if (el) el.style.display = 'none';
}

// ── RATE LIMIT ────────────────────────────────────────────────
import { RL_LIMITS, DB_ROOT as _DB_ROOT } from './config.js';
import { DB } from './state.js';

export async function checkRateLimit(action) {
  if (!state.currentAuthUser) return true;
  const limit = RL_LIMITS[action] || 50;
  const uid   = state.currentAuthUser.uid;
  const win   = Math.floor(Date.now() / 3600000); // 1h window
  try {
    const r     = await fbFetch(`${_DB_ROOT}/ratelimit/${uid}/${action}/${win}.json`);
    const count = (await r.json()) || 0;
    if (count >= limit) {
      alert(`Zu viele Aktionen. Bitte warte kurz.`);
      return false;
    }
    await fbFetch(`${_DB_ROOT}/ratelimit/${uid}/${action}/${win}.json`, {
      method: 'PUT',
      body:   JSON.stringify(count + 1),
    });
    return true;
  } catch (e) { return true; }
}

// ── CHECKOUT ─────────────────────────────────────────────────
// WICHTIG (Fix 09.07.2026): family_id muss als LemonSqueezy Custom-Data
// im Checkout-Link mitgegeben werden - sonst weiss der Payment-Webhook
// nach erfolgreicher Zahlung nicht, welche Familie freigeschaltet werden
// soll (siehe payment-worker.js, handleWebhook()). uid/email werden
// zusaetzlich mitgegeben, um Zahlungen im Zweifel einem Account statt nur
// einer Familie zuordnen zu koennen (Support/Audit), aktuell nicht von
// der App ausgewertet.
export function openCheckout(plan) {
  const { familyId, currentAuthUser } = state;
  const base = LS_CHECKOUT[plan];
  if (!base) return;
  const url = new URL(base);
  if (familyId) url.searchParams.set('checkout[custom][family_id]', familyId);
  if (currentAuthUser?.uid)   url.searchParams.set('checkout[custom][uid]', currentAuthUser.uid);
  if (currentAuthUser?.email) url.searchParams.set('checkout[email]', currentAuthUser.email);
  // Deutschland als Standard-Rechnungsland vorbelegen (famiplan ist eine
  // deutschsprachige App) - Kunde kann es im Checkout weiterhin aendern,
  // z.B. fuer Oesterreich/Schweiz.
  url.searchParams.set('checkout[billing_address][country]', 'DE');
  window.open(url.toString(), '_blank');
}


