// ══════════════════════════════════════════════════════════════
// famiplan – revenuecat-worker.js
// Empfaengt RevenueCat-Webhooks (Apple-IAP-Kaeufe aus der iOS-App)
// und schaltet Premium fuer die zahlende Familie frei/ab.
//
// Analog zu payment-worker.js (LemonSqueezy/Web), schreibt aber auf
// Basis von RevenueCat-Events statt LemonSqueezy-Events in denselben
// Firebase-Pfad familyAccess/{familyId}. Beide Worker sind bewusst
// unabhaengig voneinander, damit ein Ausfall/Bug in einem System
// (z. B. der LemonSqueezy-USD-Bug) den anderen Zahlungsweg nicht
// beeintraechtigt.
//
// WICHTIG: Die App muss beim Login Purchases.logIn(familyId) aufrufen
// (siehe revenuecat.js), damit RevenueCats app_user_id exakt der
// familyId aus Firebase entspricht - dieser Worker verlaesst sich
// darauf, event.app_user_id direkt als familyId zu verwenden.
//
// AUTH: RevenueCat sendet KEINE HMAC-Signatur wie LemonSqueezy,
// sondern einen exakten Authorization-Header-String, den man selbst
// im RevenueCat-Dashboard festlegt (Project Settings -> Integrations
// -> Webhooks -> Authorization header). Dieser Wert muss 1:1 mit
// env.REVENUECAT_WEBHOOK_SECRET uebereinstimmen, z. B.
// "Bearer <ein-langer-zufaelliger-string>".
// ══════════════════════════════════════════════════════════════

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://famiplan.app",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

function log(msg) {
  console.log(`[famiplan-revenuecat] ${msg}`);
}

// ── AUTH-PRUEFUNG (RevenueCat: exakter Authorization-Header, kein HMAC) ──
function verifyAuthHeader(env, request) {
  const received = request.headers.get("authorization") || "";
  const expected = env.REVENUECAT_WEBHOOK_SECRET || "";
  if (!expected) {
    log("FEHLER: REVENUECAT_WEBHOOK_SECRET ist nicht gesetzt");
    return false;
  }
  // Konstante Zeit-Vergleich ist bei Cloudflare Workers nicht trivial ohne
  // Node-crypto; fuer dieses Bedrohungsmodell (Webhook-Secret, kein
  // Passwort-Login) reicht ein direkter Vergleich aus.
  return received === expected;
}

// ── FIREBASE HELPERS (identisch zu payment-worker.js) ───────────
async function fbSet(env, path, data) {
  const url = `${env.FIREBASE_DB_URL}/${path}.json?auth=${env.FIREBASE_SECRET}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Firebase PUT failed: ${res.status} ${await res.text()}`);
  return res.json();
}

// ── IDEMPOTENZ ───────────────────────────────────────────────────
// RevenueCat kann dasselbe Event bei Netzwerkproblemen bis zu 5x erneut
// senden (gleiche event.id). Wir speichern verarbeitete Event-IDs kurz-
// zeitig in Firebase, um Doppelverarbeitung zu vermeiden (z. B. doppelte
// Aktivierung ist unschaedlich, aber sauberer vermieden).
async function alreadyProcessed(env, eventId) {
  const url = `${env.FIREBASE_DB_URL}/revenuecatProcessedEvents/${eventId}.json?auth=${env.FIREBASE_SECRET}`;
  const res = await fetch(url);
  if (!res.ok) return false;
  const data = await res.json();
  return data !== null;
}

async function markProcessed(env, eventId) {
  await fbSet(env, `revenuecatProcessedEvents/${eventId}`, { processedAt: Date.now() });
}

// ── PLAN AUS PRODUCT_ID ABLEITEN ─────────────────────────────────
function planFromProductId(productId = "") {
  return productId.includes("yearly") ? "yearly" : "monthly";
}

// ── PREMIUM AKTIVIEREN / DEAKTIVIEREN (schreibt in familyAccess/{familyId},
// denselben Pfad wie payment-worker.js und das Admin-Panel) ──────
async function activatePremium(env, familyId, data) {
  const renewInfo = data.expiresAt
    ? `bis ${new Date(data.expiresAt).toLocaleDateString("de-DE")}`
    : "laeuft bis Kuendigung";
  await fbSet(env, `familyAccess/${familyId}`, {
    granted: true,
    grantedBy: "revenuecat-webhook",
    note: `RevenueCat (Apple IAP) ${data.plan} · ${data.productId} · ${renewInfo}`,
    grantedAt: Date.now(),
  });
  log(`Premium aktiviert fuer Familie ${familyId} (${data.plan}, ${data.environment})`);
}

async function deactivatePremium(env, familyId, reason) {
  await fbSet(env, `familyAccess/${familyId}`, {
    granted: false,
    grantedBy: "revenuecat-webhook",
    note: `Deaktiviert: ${reason}`,
    grantedAt: Date.now(),
  });
  log(`Premium deaktiviert fuer Familie ${familyId} (${reason})`);
}

// ── WEBHOOK-EVENT VERARBEITEN ───────────────────────────────────
async function handleEvent(env, event) {
  const familyId = event.app_user_id;

  // RevenueCat liefert bei anonymen Nutzer:innen IDs wie
  // "$RCAnonymousID:xxxx" - diese sind fuer uns nicht verwertbar, da wir
  // ausschliesslich mit Purchases.logIn(familyId) arbeiten.
  if (!familyId || familyId.startsWith("$RCAnonymousID")) {
    log(`WARN: Kein verwertbarer app_user_id (${familyId}) - Event: ${event.type}`);
    return;
  }

  const plan = planFromProductId(event.product_id);
  const expiresAt = event.expiration_at_ms || null;
  const environment = event.environment || "PRODUCTION";

  log(`Event: ${event.type} | Familie: ${familyId} | Env: ${environment}`);

  switch (event.type) {
    case "INITIAL_PURCHASE":
    case "RENEWAL":
    case "UNCANCELLATION":
    case "PRODUCT_CHANGE":
      await activatePremium(env, familyId, { plan, productId: event.product_id, expiresAt, environment });
      break;
    case "CANCELLATION":
      // Bei CANCELLATION laeuft das Abo laut Apple i. d. R. noch bis zum
      // Ende der bezahlten Periode - wir deaktivieren erst bei EXPIRATION.
      // Hier nur loggen, damit der Fall im Admin-Panel nachvollziehbar bleibt.
      log(`Info: Abo gekuendigt fuer Familie ${familyId}, bleibt aktiv bis Ablauf`);
      break;
    case "EXPIRATION":
      await deactivatePremium(env, familyId, "Abo abgelaufen");
      break;
    case "BILLING_ISSUE":
      log(`WARN: Zahlungsproblem fuer Familie ${familyId} - noch keine Deaktivierung (Apple versucht Wiederholung)`);
      break;
    case "TEST":
      log(`Test-Event von RevenueCat empfangen (kein Firebase-Schreibvorgang)`);
      break;
    default:
      log(`Unbehandeltes Event: ${event.type} - wird ignoriert`);
  }
}

// ── HTTP HANDLER ─────────────────────────────────────────────
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname === "/" || url.pathname === "/health") {
      return jsonResponse({ status: "ok", service: "famiplan-revenuecat" });
    }

    if (url.pathname === "/webhook" && request.method === "POST") {
      if (!verifyAuthHeader(env, request)) {
        log("FEHLER: Ungueltiger oder fehlender Authorization-Header - Request abgelehnt");
        return jsonResponse({ error: "Unauthorized" }, 401);
      }

      let payload;
      try {
        payload = await request.json();
      } catch (e) {
        return jsonResponse({ error: "Invalid JSON" }, 400);
      }

      const event = payload.event || {};
      if (!event.id || !event.type) {
        return jsonResponse({ error: "Invalid event payload" }, 400);
      }

      try {
        if (await alreadyProcessed(env, event.id)) {
          log(`Event ${event.id} bereits verarbeitet - ueberspringe`);
          return jsonResponse({ ok: true, duplicate: true });
        }
        await handleEvent(env, event);
        await markProcessed(env, event.id);
        return jsonResponse({ ok: true, event: event.type });
      } catch (e) {
        log(`FEHLER bei handleEvent: ${e.message}`);
        return jsonResponse({ error: e.message }, 500);
      }
    }

    return jsonResponse({ error: "Not found" }, 404);
  },
};
