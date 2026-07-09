// ══════════════════════════════════════════════════════════════
// famiplan – payment-worker.js
// Empfaengt LemonSqueezy-Webhooks und schaltet Premium fuer die
// zahlende Familie frei/ab.
//
// WICHTIG (Fix 09.07.2026): Die Vorversion dieses Workers schrieb den
// Premium-Status nach families/{familyId}/meta/premium. Seit dem
// Sicherheits-Review vom 08.07.2026 liest die App den Premium-Status
// aber ausschliesslich aus familyAccess/{familyId} (und optional
// userPlans/{uid}) - der alte Pfad wird von der App nirgends mehr
// gelesen. Ohne diesen Fix haette eine erfolgreiche Zahlung technisch
// funktioniert (Webhook verifiziert, Firebase-Schreibvorgang erfolgreich),
// aber NICHTS in der App freigeschaltet.
//
// Ausserdem erwartet dieser Worker jetzt zwingend family_id als
// LemonSqueezy Custom-Data (meta.custom_data.family_id). Diese wird beim
// Checkout-Aufruf uebergeben (siehe openCheckout() in premium.js) -
// vorher fehlte das im Checkout-Link komplett, wodurch der Webhook nie
// wusste, welche Familie er freischalten sollte.
// ══════════════════════════════════════════════════════════════

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://famiplan.app",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

function log(msg) {
  console.log(`[famiplan-payment] ${msg}`);
}

// ── SIGNATUR-PRUEFUNG (LemonSqueezy: HMAC-SHA256, Header x-signature) ──
async function verifySignature(secret, body, signature) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const sigBytes = hexToBytes(signature);
  return crypto.subtle.verify("HMAC", key, sigBytes, encoder.encode(body));
}

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

// ── FIREBASE HELPERS ────────────────────────────────────────────
// env.FIREBASE_SECRET ist das klassische Firebase-Datenbank-Secret -
// dieses umgeht alle Security Rules vollstaendig (Admin-Zugriff), daher
// ist familyAccess/{id} trotz seiner Admin-only .write-Regel fuer diesen
// Worker beschreibbar, obwohl er keinen echten Admin-Auth-Token hat.
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

// ── PREMIUM AKTIVIEREN / DEAKTIVIEREN ───────────────────────────
// Schreibt in familyAccess/{familyId} - denselben Pfad, den auch das
// Admin-Panel (adminGrantFamily) nutzt und den loadUserPlan() in
// premium.js tatsaechlich liest. Detailinfos zur Zahlung (Plan,
// Bestell-ID, naechste Verlaengerung) landen lesbar im "note"-Feld,
// damit sie im Admin-Panel sichtbar sind, ohne das von den Firebase-
// Regeln vorgegebene familyAccess-Schema zu verlassen.
async function activatePremium(env, familyId, data) {
  const renewInfo = data.expiresAt
    ? `bis ${new Date(data.expiresAt).toLocaleDateString("de-DE")}`
    : "laeuft bis Kuendigung";
  await fbSet(env, `familyAccess/${familyId}`, {
    granted: true,
    grantedBy: "lemonsqueezy-webhook",
    note: `LemonSqueezy ${data.plan} · Order ${data.orderId} · ${renewInfo}`,
    grantedAt: Date.now(),
  });
  log(`Premium aktiviert fuer Familie ${familyId} (${data.plan})`);
}

async function deactivatePremium(env, familyId, reason) {
  await fbSet(env, `familyAccess/${familyId}`, {
    granted: false,
    grantedBy: "lemonsqueezy-webhook",
    note: `Deaktiviert: ${reason}`,
    grantedAt: Date.now(),
  });
  log(`Premium deaktiviert fuer Familie ${familyId} (${reason})`);
}

function calcExpiresAt(plan, renewsAt) {
  if (renewsAt) return new Date(renewsAt).getTime();
  const now = Date.now();
  return plan === "yearly" ? now + 365 * 24 * 60 * 60 * 1000 : now + 31 * 24 * 60 * 60 * 1000;
}

// ── WEBHOOK-EVENT VERARBEITEN ───────────────────────────────────
async function handleWebhook(env, event, payload) {
  const meta = payload.meta || {};
  const data = payload.data || {};
  const attrs = data.attributes || {};
  const customData = meta.custom_data || {};
  const familyId = customData.family_id || customData.familyId;

  if (!familyId) {
    log(`WARN: Kein family_id in custom_data – Event: ${event} (Checkout-Link ohne custom_data ausgeloest?)`);
    return;
  }

  log(`Event: ${event} | Familie: ${familyId}`);

  const orderId = data.id;
  const variantName = (attrs.variant_name || attrs.product_name || "").toLowerCase();
  const plan = variantName.includes("year") ? "yearly" : "monthly";
  const renewsAt = attrs.renews_at;

  switch (event) {
    case "order_created":
    case "subscription_created":
    case "subscription_payment_success":
      await activatePremium(env, familyId, { plan, orderId, expiresAt: calcExpiresAt(plan, renewsAt) });
      break;
    case "subscription_updated":
      if (attrs.status === "active") {
        await activatePremium(env, familyId, { plan, orderId, expiresAt: calcExpiresAt(plan, renewsAt) });
      }
      break;
    case "subscription_cancelled":
      await deactivatePremium(env, familyId, "Abo gekuendigt");
      break;
    case "subscription_expired":
      await deactivatePremium(env, familyId, "Abo abgelaufen");
      break;
    case "subscription_payment_failed":
      await deactivatePremium(env, familyId, "Zahlung fehlgeschlagen");
      break;
    default:
      log(`Unbekanntes Event: ${event} – wird ignoriert`);
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
      return jsonResponse({ status: "ok", service: "famiplan-payment" });
    }

    if (url.pathname === "/webhook" && request.method === "POST") {
      const rawBody = await request.text();
      const signature = request.headers.get("x-signature") || "";

      if (!signature) {
        log("FEHLER: Keine Signatur im Request");
        return jsonResponse({ error: "Missing signature" }, 401);
      }

      let valid = false;
      try {
        // Sowohl Test- als auch Live-Modus-Webhook pruefen (unterschiedliche
        // Signing Secrets), damit beide parallel funktionieren, ohne bei
        // jedem Wechsel das Cloudflare-Secret manuell umstellen zu muessen.
        if (env.LEMONSQUEEZY_SIGNING_SECRET) {
          valid = await verifySignature(env.LEMONSQUEEZY_SIGNING_SECRET, rawBody, signature);
        }
        if (!valid && env.LEMONSQUEEZY_SIGNING_SECRET_LIVE) {
          valid = await verifySignature(env.LEMONSQUEEZY_SIGNING_SECRET_LIVE, rawBody, signature);
        }
      } catch (e) {
        log(`Signaturpruefung fehlgeschlagen: ${e.message}`);
        return jsonResponse({ error: "Signature verification failed" }, 401);
      }
      if (!valid) {
        log("FEHLER: Ungueltige Signatur – Request abgelehnt");
        return jsonResponse({ error: "Invalid signature" }, 401);
      }

      let payload;
      try {
        payload = JSON.parse(rawBody);
      } catch (e) {
        return jsonResponse({ error: "Invalid JSON" }, 400);
      }

      const event = payload.meta?.event_name || "";
      log(`Webhook empfangen: ${event}`);

      try {
        await handleWebhook(env, event, payload);
        return jsonResponse({ ok: true, event });
      } catch (e) {
        log(`FEHLER bei handleWebhook: ${e.message}`);
        return jsonResponse({ error: e.message }, 500);
      }
    }

    return jsonResponse({ error: "Not found" }, 404);
  },
};
