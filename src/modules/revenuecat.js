// ══════════════════════════════════════════════════════════════
// famiplan – revenuecat.js
// Apple-IAP-Kaeufe (Premium, iOS-only) via RevenueCat Capacitor-Plugin
//
// Plugin: @revenuecat/purchases-capacitor (offizielles RevenueCat-Plugin)
//
// WICHTIG – Architektur-Grundsatz (Compliance, Guideline 3.1.3(b)):
// Dieses Modul ist die EINZIGE Kaufmoeglichkeit in der iOS-App. Der
// LemonSqueezy-Checkout-Link (config.js LS_CHECKOUT) darf auf iOS
// niemals angezeigt/beworben werden - siehe openCheckout() in
// premium.js, die das plattformabhaengig trennt.
//
// Architektur: RevenueCat ist die "Wahrheitsquelle" fuer den Kaufstatus
// direkt bei Apple. Nach jedem Kauf/Restore wird zusaetzlich
// Purchases.logIn(familyId) genutzt, damit RevenueCats app_user_id exakt
// der familyId aus Firebase entspricht. Der revenuecat-worker.js
// (Cloudflare Worker) empfaengt serverseitig RevenueCat-Webhooks und
// schreibt darauf basierend in familyAccess/{familyId} - denselben
// Pfad, den auch LemonSqueezy (payment-worker.js) und das Admin-Panel
// nutzen. Das Modul hier selbst schreibt NIE direkt nach Firebase -
// nur der Worker tut das, serverseitig verifiziert.
//
// GUARD: Wie calendarSync.js wird das Plugin nie statisch importiert,
// sondern ueber die globale Capacitor-Bridge geholt (dynamischer
// ES-Import haengt in WKWebView still, siehe fp-01 Learnings).
// ══════════════════════════════════════════════════════════════

import { REVENUECAT_API_KEY_IOS, REVENUECAT_ENTITLEMENT_ID, REVENUECAT_PRODUCT_IDS } from './config.js';
import { state } from './state.js';

// ── PLATTFORM-CHECK (identisch zum Muster in calendarSync.js) ──
export function isRevenueCatSupported() {
  try {
    return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform() && window.Capacitor.getPlatform() === 'ios');
  } catch (e) {
    return false;
  }
}

// ── LAZY PLUGIN LOADER ─────────────────────────────────────────
function getPlugin() {
  if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Purchases) {
    return window.Capacitor.Plugins.Purchases;
  }
  return null;
}

// ── KONFIGURATION & LOGIN ───────────────────────────────────────
// Wird einmal beim App-Start aufgerufen (siehe main.js appInit()), UND
// erneut, sobald sich state.familyId aendert (z.B. nach Familienbeitritt),
// damit RevenueCats app_user_id immer mit der aktuellen familyId
// uebereinstimmt. Idempotent - mehrfacher Aufruf mit derselben familyId
// ist unproblematisch.
let _configured = false;

export async function initRevenueCat() {
  if (!isRevenueCatSupported()) return;
  const plugin = getPlugin();
  if (!plugin) {
    console.warn('[revenuecat] Plugin nicht verfuegbar (RevenueCat SDK nicht geladen?)');
    return;
  }
  try {
    if (!_configured) {
      await plugin.configure({ apiKey: REVENUECAT_API_KEY_IOS });
      _configured = true;
    }
    if (state.familyId) {
      await plugin.logIn({ appUserID: state.familyId });
    }
  } catch (e) {
    console.error('[revenuecat] initRevenueCat fehlgeschlagen:', e);
  }
}

// ── OFFERINGS ABRUFEN (Preise/Produkte, wie in App Store Connect hinterlegt) ──
export async function getOfferings() {
  if (!isRevenueCatSupported()) return null;
  const plugin = getPlugin();
  if (!plugin) return null;
  try {
    const result = await plugin.getOfferings();
    return result?.current || null;
  } catch (e) {
    console.error('[revenuecat] getOfferings fehlgeschlagen:', e);
    return null;
  }
}

// ── KAUF DURCHFUEHREN ────────────────────────────────────────────
// plan: 'monthly' | 'yearly'
// Gibt { success: true } oder { success: false, cancelled: true } bzw.
// { success: false, error: '...' } zurueck - premium.js/modals.js werten
// das fuer die UI aus (Ladeindikator, Fehlermeldung, Modal schliessen).
export async function purchasePlan(plan) {
  if (!isRevenueCatSupported()) return { success: false, error: 'iOS-only' };
  const plugin = getPlugin();
  if (!plugin) return { success: false, error: 'Plugin nicht verfuegbar' };

  try {
    const offerings = await getOfferings();
    const pkg = offerings?.availablePackages?.find(
      p => p.storeProduct?.identifier === REVENUECAT_PRODUCT_IDS[plan]
    );
    if (!pkg) {
      console.error('[revenuecat] Kein Package gefunden fuer Plan:', plan);
      return { success: false, error: 'Produkt nicht gefunden' };
    }

    const result = await plugin.purchasePackage({ aPackage: pkg });
    const active = result?.customerInfo?.entitlements?.active || {};
    if (active[REVENUECAT_ENTITLEMENT_ID]) {
      return { success: true };
    }
    return { success: false, error: 'Kauf abgeschlossen, aber Entitlement nicht aktiv' };
  } catch (e) {
    // RevenueCat/StoreKit liefert bei Nutzer-Abbruch einen erkennbaren
    // Fehlercode (userCancelled) - das ist kein echter Fehler, sondern
    // ein normaler Abbruch (z.B. Face-ID-Dialog verworfen).
    if (e?.userCancelled || e?.code === 'PURCHASE_CANCELLED' || e?.message?.toLowerCase().includes('cancel')) {
      return { success: false, cancelled: true };
    }
    console.error('[revenuecat] purchasePlan fehlgeschlagen:', e);
    return { success: false, error: e?.message || 'Unbekannter Fehler' };
  }
}

// ── RESTORE PURCHASES (Pflicht fuer App-Review) ──────────────────
export async function restorePurchases() {
  if (!isRevenueCatSupported()) return { success: false, error: 'iOS-only' };
  const plugin = getPlugin();
  if (!plugin) return { success: false, error: 'Plugin nicht verfuegbar' };

  try {
    const result = await plugin.restorePurchases();
    const active = result?.customerInfo?.entitlements?.active || {};
    if (active[REVENUECAT_ENTITLEMENT_ID]) {
      return { success: true, restored: true };
    }
    return { success: true, restored: false }; // kein Fehler, nur nichts zum Wiederherstellen gefunden
  } catch (e) {
    console.error('[revenuecat] restorePurchases fehlgeschlagen:', e);
    return { success: false, error: e?.message || 'Unbekannter Fehler' };
  }
}

// ── AKTUELLEN ENTITLEMENT-STATUS PRUEFEN ─────────────────────────
// Nuetzlich fuer einen sofortigen Client-seitigen Check (z.B. direkt nach
// initRevenueCat()), ERSETZT aber NICHT loadUserPlan() in premium.js -
// die Firebase-Werte (gesetzt vom serverseitig verifizierten
// revenuecat-worker.js) bleiben die eigentliche Wahrheitsquelle fuer die
// App-weite Premium-Anzeige.
export async function getRevenueCatEntitlementActive() {
  if (!isRevenueCatSupported()) return false;
  const plugin = getPlugin();
  if (!plugin) return false;
  try {
    const result = await plugin.getCustomerInfo();
    const active = result?.customerInfo?.entitlements?.active || {};
    return !!active[REVENUECAT_ENTITLEMENT_ID];
  } catch (e) {
    console.error('[revenuecat] getRevenueCatEntitlementActive fehlgeschlagen:', e);
    return false;
  }
}
