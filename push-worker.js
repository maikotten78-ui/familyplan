var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// push-worker.js
var __defProp2 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
var push_worker_default = {
  // ── HTTP Requests (subscribe/unsubscribe/send) ─────────────
  async fetch(request, env) {
    // Erlaubte Ursprünge: Web-App (famiplan.app) UND native iOS-App
    // (Capacitor-WKWebView läuft unter "capacitor://localhost", kein
    // echtes Web-Origin — muss explizit erlaubt werden, sonst blockiert
    // der Browser/WKWebView jeden fetch() aus der App an diesen Worker).
    const allowedOrigins = ["https://famiplan.app", "capacitor://localhost"];
    const requestOrigin = request.headers.get("Origin") || "";
    const corsHeaders = {
      "Access-Control-Allow-Origin": allowedOrigins.includes(requestOrigin) ? requestOrigin : "https://famiplan.app",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
    const url = new URL(request.url);
    try {
      if (url.pathname === "/push/cron") {
        const secret = request.headers.get("x-cron-secret");
        if (env.CRON_SECRET && secret !== env.CRON_SECRET) {
          return new Response("Unauthorized", { status: 401 });
        }
        const debugLogs = [];
        await runReminderCheck(env, debugLogs);
        return jsonResponse({ ok: true, ran: (/* @__PURE__ */ new Date()).toISOString(), logs: debugLogs }, 200, corsHeaders);
      }
      if (request.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });
      if (url.pathname === "/push/send") return await handleSendPush(request, env, corsHeaders);
      if (url.pathname === "/push/subscribe") return await handleSubscribe(request, env, corsHeaders);
      if (url.pathname === "/push/unsubscribe") return await handleUnsubscribe(request, env, corsHeaders);
      return new Response("Not found", { status: 404, headers: corsHeaders });
    } catch (e) {
      return jsonResponse({ error: e.message }, 500, corsHeaders);
    }
  },
  // ── Cron Trigger: läuft alle 5 Minuten ────────────────────
  // Einrichten: Worker Dashboard → Triggers → Cron → */5 * * * *
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runReminderCheck(env));
  }
};
async function runReminderCheck(env, logs = []) {
  const log = /* @__PURE__ */ __name2((msg) => {
    console.log(msg);
    logs.push(msg);
  }, "log");
  try {
    const now = Date.now();
    const nowDate = new Date(now);
    log(`started at ${nowDate.toISOString()}`);
    const subsUrl = `${env.FIREBASE_DB_URL}/families.json?auth=${env.FIREBASE_SECRET}&shallow=true`;
    const subsRes = await fetch(subsUrl);
    log(`families fetch: ${subsRes.status}`);
    if (!subsRes.ok) {
      console.error("Firebase fetch failed:", subsRes.status, await subsRes.text());
      return;
    }
    const familyIndex = await subsRes.json();
    log(`familyIndex keys: ${familyIndex ? Object.keys(familyIndex).join(",") : "null"}`);
    if (!familyIndex) {
      log("No families found");
      return;
    }
    for (const familyId of Object.keys(familyIndex)) {
      try {
        log(`Checking: ${familyId}`);
        await checkFamilyReminders(familyId, now, nowDate, env, log);
      } catch (e) {
        console.error(`Reminder check failed for ${familyId}:`, e.message);
      }
    }
    log("done");
  } catch (e) {
    console.error("runReminderCheck error:", e.message);
  }
}
__name(runReminderCheck, "runReminderCheck");
__name2(runReminderCheck, "runReminderCheck");
function getCETOffset(d) {
  const year = d.getUTCFullYear();
  const lastSunMar = new Date(Date.UTC(year, 2, 31));
  lastSunMar.setUTCDate(31 - lastSunMar.getUTCDay());
  lastSunMar.setUTCHours(1, 0, 0, 0);
  const lastSunOct = new Date(Date.UTC(year, 9, 31));
  lastSunOct.setUTCDate(31 - lastSunOct.getUTCDay());
  lastSunOct.setUTCHours(1, 0, 0, 0);
  return d >= lastSunMar && d < lastSunOct ? 2 : 1;
}
__name(getCETOffset, "getCETOffset");
__name2(getCETOffset, "getCETOffset");
async function checkFamilyReminders(familyId, now, nowDate, env, log = console.log) {
  const [tasksRes, subsRes] = await Promise.all([
    fetch(`${env.FIREBASE_DB_URL}/families/${familyId}/tasks.json?auth=${env.FIREBASE_SECRET}`),
    fetch(`${env.FIREBASE_DB_URL}/families/${familyId}/pushSubscriptions.json?auth=${env.FIREBASE_SECRET}`)
  ]);
  const tasks = await tasksRes.json();
  const subs = await subsRes.json();
  if (!tasks || !subs || Object.keys(subs).length === 0) return;
  const todayISO = localISO(nowDate);
  const currentHour = nowDate.getHours();
  const currentMin = nowDate.getMinutes();
  log(`[${familyId}] tasks=${Object.keys(tasks).length} subs=${Object.keys(subs).length} today=${todayISO}`);
  for (const [taskId, task] of Object.entries(tasks)) {
    if (!task || !task.time) continue;
    const visible = isTaskVisibleToday(task, todayISO, nowDate);
    log(`task:${task.title} time=${task.time} rec=${task.recurring} interval=${task.recurringInterval || 1} visible=${visible}`);
    if (!visible) continue;
    const assignment = getAssignment(task, todayISO);
    if (assignment.done) {
      log(`skip:${task.title} done`);
      continue;
    }
    const assignedTo = assignment.assignedTo || null;
    const [taskHour, taskMin] = task.time.split(":").map(Number);
    const utcMidnight = Date.UTC(nowDate.getUTCFullYear(), nowDate.getUTCMonth(), nowDate.getUTCDate());
    const tzOffset = getCETOffset(nowDate);
    const taskTime = utcMidnight + (taskHour - tzOffset) * 36e5 + taskMin * 6e4;
    for (const [uid, subData] of Object.entries(subs)) {
      if (!hasValidTarget(subData)) continue;
      const reminderMins = subData.reminderMinutes ?? 30;
      const reminderEnabled = subData.reminderEnabled !== false;
      if (!reminderEnabled) {
        log(`sub:reminderDisabled`);
        continue;
      }
      const reminderTs = taskTime - reminderMins * 60 * 1e3;
      const windowMs = 4 * 60 * 1e3;
      const diff = reminderTs - now;
      log(`reminder:${task.title} reminderMins=${reminderMins} taskTimeUTC=${new Date(taskTime).toISOString()} reminderUTC=${new Date(reminderTs).toISOString()} nowUTC=${new Date(now).toISOString()} diff=${Math.round(diff / 1e3)}s window=${-windowMs / 1e3}s..${60}s`);
      if (reminderTs < now - windowMs || reminderTs > now + windowMs) {
        log(`skip:outside window diff=${Math.round(diff / 1e3)}s`);
        continue;
      }
      log(`SENDING reminder for ${task.title}!`);
      if (assignedTo && subData.memberName && assignedTo !== subData.memberName) continue;
      const sentMember = (subData.memberName || uid).replace(/[^a-zA-Z0-9_-]/g, "_");
      const sentPath = `${env.FIREBASE_DB_URL}/families/${familyId}/reminderSent/${todayISO}/${taskId}/${sentMember}.json?auth=${env.FIREBASE_SECRET}`;
      try {
        const sentCheck = await fetch(sentPath);
        const sentVal = await sentCheck.json();
        if (sentVal) {
          log(`skip:alreadySent ${taskId} ${uid}`);
          continue;
        }
      } catch (e) {
        log(`sentCheck error: ${e.message}`);
      }
      const notification = {
        title: `\u23F0 Erinnerung in ${reminderMins} Min.`,
        body: `${task.emoji || "\u{1F4C5}"} ${task.title}${task.location ? " \xB7 " + task.location : ""}`,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: `reminder-${taskId}`,
        data: { url: "/", taskId, type: "reminder" }
      };
      try {
        const pushResult = await sendPushToSubscriber(subData, notification, env);
        log(`pushResult for ${uid}: ok=${pushResult.ok} status=${pushResult.status} text=${pushResult.text || ""} jwt=${pushResult.jwt || ""}`);
        if (!pushResult.ok) {
          log(`PUSH FAILED status=${pushResult.status}`);
          if (isGoneStatus(pushResult.status)) await deleteSubscription(familyId, uid, env);
        } else {
          log(`PUSH SENT OK!`);
          await fetch(sentPath, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(now)
          });
        }
      } catch (pe) {
        log(`pushError for ${uid}: ${pe.message}`);
      }
    }
  }
  for (const [uid, subData] of Object.entries(subs)) {
    if (!hasValidTarget(subData)) continue;
    if (subData.dailyEnabled === false) continue;
    const dailyHour = subData.dailyHour ?? 7;
    if (currentHour !== dailyHour || currentMin >= 5) continue;
    const sentPath = `${env.FIREBASE_DB_URL}/families/${familyId}/dailySent/${todayISO}/${uid}.json?auth=${env.FIREBASE_SECRET}`;
    let alreadySent = false;
    try {
      const sentCheck = await fetch(sentPath);
      alreadySent = !!await sentCheck.json();
    } catch (e) {
      log(`dailySentCheck error: ${e.message}`);
      alreadySent = true;
    }
    if (alreadySent) {
      log(`skip:dailyAlreadySent ${uid}`);
      continue;
    }
    const myTasks = Object.values(tasks).filter((t) => t && isTaskVisibleToday(t, todayISO, nowDate)).filter((t) => {
      const a = getAssignment(t, todayISO);
      return !a.done && (!a.assignedTo || a.assignedTo === subData.memberName);
    });
    if (!myTasks.length) {
      log(`skip:dailyNoTasks ${uid}`);
      continue;
    }
    const summary = myTasks.length === 1 ? `${myTasks[0].emoji || ""} ${myTasks[0].title}` : `${myTasks.length} Aufgaben \u2013 z.B. ${myTasks[0].emoji || ""} ${myTasks[0].title}`;
    const dl = nowDate.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" });
    const notification = {
      title: `\u{1F305} Dein Tag \u2013 ${dl}`,
      body: summary,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: `daily-${todayISO}`,
      data: { url: "/", type: "daily" }
    };
    try {
      const pushResult = await sendPushToSubscriber(subData, notification, env);
      if (pushResult.ok) {
        log(`DAILY SENT for ${uid}`);
        await fetch(sentPath, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(now)
        });
      } else {
        log(`DAILY FAILED for ${uid} status=${pushResult.status}`);
        if (isGoneStatus(pushResult.status)) await deleteSubscription(familyId, uid, env);
      }
    } catch (e) {
      log(`dailyPushError for ${uid}: ${e.message}`);
    }
  }
}
__name(checkFamilyReminders, "checkFamilyReminders");
__name2(checkFamilyReminders, "checkFamilyReminders");
function localISO(d) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}
__name(localISO, "localISO");
__name2(localISO, "localISO");
function isTaskVisibleToday(task, todayISO, nowDate) {
  if (task.openTodo) return false;
  if (task.excludedDates && task.excludedDates.includes(todayISO)) return false;
  const dayNames = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
  const jsDay = nowDate.getUTCDay();
  const todayName = dayNames[jsDay === 0 ? 6 : jsDay - 1];
  if (!task.recurring || task.recurring === "once") {
    if (task.type === "event" && task.endDate && task.endDate > task.date) {
      return todayISO >= task.date && todayISO <= task.endDate;
    }
    return task.date === todayISO;
  }
  const startISO = task.date || null;
  if (startISO && todayISO < startISO) return false;
  const interval = task.recurringInterval || 1;
  if (task.recurring === "weekly") {
    if (task.day !== todayName) return false;
    if (interval <= 1 || !startISO) return true;
    const msPerWeek = 7 * 24 * 60 * 60 * 1e3;
    const startD = /* @__PURE__ */ new Date(startISO + "T12:00:00Z");
    const viewD = /* @__PURE__ */ new Date(todayISO + "T12:00:00Z");
    const weeksDiff = Math.round((viewD - startD) / msPerWeek);
    return weeksDiff >= 0 && weeksDiff % interval === 0;
  }
  if (task.recurring === "monthly") {
    if (task.day !== todayName) return false;
    if (interval <= 1 || !startISO) return true;
    const startD = /* @__PURE__ */ new Date(startISO + "T12:00:00Z");
    const viewD = /* @__PURE__ */ new Date(todayISO + "T12:00:00Z");
    const monthsDiff = (viewD.getUTCFullYear() - startD.getUTCFullYear()) * 12 + (viewD.getUTCMonth() - startD.getUTCMonth());
    return monthsDiff >= 0 && monthsDiff % interval === 0;
  }
  if (task.recurring === "yearly") return task.day === todayName;
  if (task.recurring === "daily") {
    if (task.weekdays && task.weekdays.length > 0) {
      const dayIdx = jsDay === 0 ? 6 : jsDay - 1;
      return task.weekdays.includes(dayIdx);
    }
    return true;
  }
  return task.day === todayName;
}
__name(isTaskVisibleToday, "isTaskVisibleToday");
__name2(isTaskVisibleToday, "isTaskVisibleToday");
function getAssignment(task, iso) {
  return task.assignments && task.assignments[iso] || { assignedTo: null, done: false };
}
__name(getAssignment, "getAssignment");
__name2(getAssignment, "getAssignment");
async function handleSendPush(request, env, corsHeaders) {
  const body = await request.json();
  const { familyId, type, payload, excludeUid, targetUid } = body;
  if (!familyId || !type || !payload) return jsonResponse({ error: "Missing fields" }, 400, corsHeaders);
  const subs = await getSubscriptions(familyId, env);
  if (!subs || Object.keys(subs).length === 0) return jsonResponse({ sent: 0, message: "No subscribers" }, 200, corsHeaders);
  const notification = buildNotification(type, payload);
  let sent = 0, failed = 0;
  for (const [uid, subData] of Object.entries(subs)) {
    if (excludeUid && uid === excludeUid) continue;
    if (targetUid && uid !== targetUid) continue;
    if (!hasValidTarget(subData)) continue;
    try {
      const result = await sendPushToSubscriber(subData, notification, env);
      if (result.ok) {
        sent++;
      } else {
        failed++;
        if (isGoneStatus(result.status)) await deleteSubscription(familyId, uid, env);
      }
    } catch (e) {
      failed++;
    }
  }
  return jsonResponse({ sent, failed }, 200, corsHeaders);
}
__name(handleSendPush, "handleSendPush");
__name2(handleSendPush, "handleSendPush");
async function handleSubscribe(request, env, corsHeaders) {
  const body = await request.json();
  const { familyId, uid, memberName, subscription } = body;
  if (!familyId || !uid || !subscription) return jsonResponse({ error: "Missing fields" }, 400, corsHeaders);
  const reminderMinutes = body.reminderMinutes ?? 30;
  const reminderEnabled = body.reminderEnabled !== false;
  const dailyEnabled = body.dailyEnabled !== false;
  const dailyHour = body.dailyHour ?? 7;
  await saveSubscription(familyId, uid, {
    subscription,
    memberName,
    reminderMinutes,
    reminderEnabled,
    dailyEnabled,
    dailyHour,
    updatedAt: Date.now()
  }, env);
  return jsonResponse({ ok: true }, 200, corsHeaders);
}
__name(handleSubscribe, "handleSubscribe");
__name2(handleSubscribe, "handleSubscribe");
async function handleUnsubscribe(request, env, corsHeaders) {
  const body = await request.json();
  const { familyId, uid, target } = body;
  if (!familyId || !uid) return jsonResponse({ error: "Missing fields" }, 400, corsHeaders);
  // "target" unterscheidet, welche Push-Variante deaktiviert wird, da Web-Push
  // und natives FCM/iOS im selben Knoten (pushSubscriptions/{uid}) nebeneinander
  // existieren koennen (gleicher Account in Browser UND App). Ohne "target"
  // (alte Aufrufe) wird wie bisher der komplette Knoten geloescht.
  if (target === "web") {
    await patchSubscriptionFields(familyId, uid, { subscription: null }, env);
  } else if (target === "ios") {
    await patchSubscriptionFields(familyId, uid, { platform: null, fcmToken: null }, env);
  } else {
    await deleteSubscription(familyId, uid, env);
  }
  return jsonResponse({ ok: true }, 200, corsHeaders);
}
__name(handleUnsubscribe, "handleUnsubscribe");
__name2(handleUnsubscribe, "handleUnsubscribe");
async function getSubscriptions(familyId, env) {
  const r = await fetch(`${env.FIREBASE_DB_URL}/families/${familyId}/pushSubscriptions.json?auth=${env.FIREBASE_SECRET}`);
  if (!r.ok) return {};
  return await r.json() || {};
}
__name(getSubscriptions, "getSubscriptions");
__name2(getSubscriptions, "getSubscriptions");
async function saveSubscription(familyId, uid, data, env) {
  await fetch(`${env.FIREBASE_DB_URL}/families/${familyId}/pushSubscriptions/${uid}.json?auth=${env.FIREBASE_SECRET}`, {
    method: "PUT",
    body: JSON.stringify(data)
  });
}
__name(saveSubscription, "saveSubscription");
__name2(saveSubscription, "saveSubscription");
async function deleteSubscription(familyId, uid, env) {
  await fetch(`${env.FIREBASE_DB_URL}/families/${familyId}/pushSubscriptions/${uid}.json?auth=${env.FIREBASE_SECRET}`, {
    method: "DELETE"
  });
}
__name(deleteSubscription, "deleteSubscription");
__name2(deleteSubscription, "deleteSubscription");
async function patchSubscriptionFields(familyId, uid, fields, env) {
  // PATCH statt PUT/DELETE: setzt/entfernt nur die angegebenen Felder,
  // laesst Geschwister-Felder (z.B. das jeweils andere Push-Ziel) unberuehrt.
  // In Firebase RTDB entfernt ein PATCH-Wert von null gezielt nur dieses Feld.
  await fetch(`${env.FIREBASE_DB_URL}/families/${familyId}/pushSubscriptions/${uid}.json?auth=${env.FIREBASE_SECRET}`, {
    method: "PATCH",
    body: JSON.stringify(fields)
  });
}
__name(patchSubscriptionFields, "patchSubscriptionFields");
__name2(patchSubscriptionFields, "patchSubscriptionFields");
function buildNotification(type, payload) {
  switch (type) {
    case "assigned":
      return {
        title: `\u{1F4CB} Aufgabe zugewiesen`,
        body: `${payload.assignedBy} hat dir \u201E${payload.taskTitle}" zugewiesen`,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: `assigned-${payload.taskId}`,
        data: { url: "/", type, taskId: payload.taskId }
      };
    case "comment":
      return {
        title: `\u{1F4AC} Neuer Kommentar`,
        body: `${payload.author}: \u201E${payload.text}"`,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: `comment-${payload.taskId}`,
        data: { url: "/", type, taskId: payload.taskId }
      };
    case "reminder":
      return {
        title: `\u23F0 Erinnerung in ${payload.minutesBefore} Min.`,
        body: `${payload.taskEmoji} ${payload.taskTitle}${payload.location ? " \xB7 " + payload.location : ""}`,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: `reminder-${payload.taskId}`,
        data: { url: "/", type, taskId: payload.taskId }
      };
    case "board":
      return {
        title: `\u{1F4CC} ${payload.author}`,
        body: payload.text || "Neuer Beitrag",
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: "board-post",
        data: { url: "/", type, tab: "overview" }
      };
    case "reply":
      return {
        title: `\u21A9\uFE0F ${payload.author}`,
        body: payload.text || "Neue Antwort",
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: "board-reply",
        data: { url: "/", type, tab: "overview" }
      };
    case "daily":
      return {
        title: `\u{1F305} Dein Tag \u2013 ${payload.dateLabel}`,
        body: payload.summary,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: "daily-summary",
        data: { url: "/", type }
      };
    default:
      return {
        title: "famiplan",
        body: payload.text || "Neue Benachrichtigung",
        icon: "/icon-192.png",
        data: { url: "/" }
      };
  }
}
__name(buildNotification, "buildNotification");
__name2(buildNotification, "buildNotification");

// ══════════════════════════════════════════════════════════════
// ── DISPATCHER: Web-Push (Browser/PWA) vs. FCM/APNs (native iOS) ──
// ══════════════════════════════════════════════════════════════
function hasValidTarget(subData) {
  if (!subData) return false;
  if (subData.subscription) return true;
  if (subData.platform === "ios" && subData.fcmToken) return true;
  return false;
}
__name(hasValidTarget, "hasValidTarget");
__name2(hasValidTarget, "hasValidTarget");

function isGoneStatus(status) {
  return status === 410 || status === 404;
}
__name(isGoneStatus, "isGoneStatus");
__name2(isGoneStatus, "isGoneStatus");

async function sendPushToSubscriber(subData, notification, env) {
  if (subData.platform === "ios" && subData.fcmToken) {
    return await sendFcmPush(subData.fcmToken, notification, env);
  }
  return await sendWebPush(subData.subscription, notification, env);
}
__name(sendPushToSubscriber, "sendPushToSubscriber");
__name2(sendPushToSubscriber, "sendPushToSubscriber");

// ══════════════════════════════════════════════════════════════
// ── FCM (Firebase Cloud Messaging) für native iOS-App ──────────
// Nutzt einen Firebase-Service-Account (env.FIREBASE_SERVICE_ACCOUNT,
// als JSON-String-Secret hinterlegt) für OAuth2 + FCM HTTP v1 API.
// FCM kümmert sich intern um die Zustellung via APNs.
// ══════════════════════════════════════════════════════════════
let _fcmTokenCache = null;
async function getGoogleAccessToken(env) {
  const now = Math.floor(Date.now() / 1e3);
  if (_fcmTokenCache && _fcmTokenCache.exp > now + 60) {
    return _fcmTokenCache.token;
  }
  const sa = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT);
  const iat = now;
  const exp = now + 3600;
  const header = base64UrlEncode(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64UrlEncode(JSON.stringify({
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat,
    exp
  }));
  const signInput = `${header}.${claims}`;
  const privateKey = await importPkcs8PrivateKey(sa.private_key);
  const sigBuf = await crypto.subtle.sign(
    { name: "RSASSA-PKCS1-v1_5" },
    privateKey,
    new TextEncoder().encode(signInput)
  );
  const jwt = `${signInput}.${base64UrlEncode(new Uint8Array(sigBuf))}`;
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt
    })
  });
  const tokenData = await tokenRes.json();
  if (!tokenRes.ok || !tokenData.access_token) {
    throw new Error(`Google OAuth2 token error: ${JSON.stringify(tokenData)}`);
  }
  _fcmTokenCache = { token: tokenData.access_token, exp: now + (tokenData.expires_in || 3600) };
  return tokenData.access_token;
}
__name(getGoogleAccessToken, "getGoogleAccessToken");
__name2(getGoogleAccessToken, "getGoogleAccessToken");

async function importPkcs8PrivateKey(pem) {
  const clean = pem.replace(/-----BEGIN PRIVATE KEY-----/, "").replace(/-----END PRIVATE KEY-----/, "").replace(/\s/g, "");
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return await crypto.subtle.importKey(
    "pkcs8",
    bytes.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
}
__name(importPkcs8PrivateKey, "importPkcs8PrivateKey");
__name2(importPkcs8PrivateKey, "importPkcs8PrivateKey");

async function sendFcmPush(fcmToken, notification, env) {
  let accessToken, projectId;
  try {
    accessToken = await getGoogleAccessToken(env);
    projectId = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT).project_id;
  } catch (e) {
    return { ok: false, status: 500, text: `OAuth error: ${e.message}` };
  }
  const data = {};
  if (notification.data) {
    for (const [k, v] of Object.entries(notification.data)) {
      data[k] = String(v ?? "");
    }
  }
  const message = {
    message: {
      token: fcmToken,
      notification: {
        title: notification.title,
        body: notification.body
      },
      data,
      apns: {
        payload: {
          aps: { sound: "default" }
        }
      }
    }
  };
  const res = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(message)
  });
  let text = "";
  let errStatus = null;
  if (!res.ok) {
    try {
      const errJson = await res.json();
      text = JSON.stringify(errJson).slice(0, 200);
      errStatus = errJson?.error?.status || null;
    } catch {
      try { text = (await res.text()).slice(0, 200); } catch {}
    }
  }
  // FCM meldet ungültige/abgelaufene Tokens als NOT_FOUND oder UNREGISTERED
  const treatAsGone = errStatus === "NOT_FOUND" || errStatus === "UNREGISTERED" || res.status === 404;
  return { ok: res.ok, status: treatAsGone ? 404 : res.status, text };
}
__name(sendFcmPush, "sendFcmPush");
__name2(sendFcmPush, "sendFcmPush");

async function sendWebPush(subscription, notification, env) {
  const { endpoint, keys } = subscription;
  const { p256dh, auth } = keys;
  const payload = JSON.stringify(notification);
  const encrypted = await encryptPayload(payload, p256dh, auth);
  let jwt_debug = "";
  const vapidHeaders = await buildVapidHeaders(endpoint, env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY, env.VAPID_SUBJECT || "mailto:kontakt@famiplan.app", (j) => {
    jwt_debug = j.slice(0, 100);
  });
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { ...vapidHeaders, "Content-Type": "application/octet-stream", "Content-Encoding": "aes128gcm", "TTL": "86400" },
    body: encrypted
  });
  let text = "";
  if (!response.ok) {
    try {
      text = await response.text();
    } catch {
    }
  }
  return { ok: response.ok, status: response.status, text: text.slice(0, 200), jwt: jwt_debug };
}
__name(sendWebPush, "sendWebPush");
__name2(sendWebPush, "sendWebPush");
async function encryptPayload(plaintext, p256dhBase64, authBase64) {
  const encoder = new TextEncoder();
  const p256dh = base64UrlDecode(p256dhBase64);
  const authSecret = base64UrlDecode(authBase64);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const serverKeyPair = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
  const subscriberKey = await crypto.subtle.importKey("raw", p256dh, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const sharedSecret = await crypto.subtle.deriveBits({ name: "ECDH", public: subscriberKey }, serverKeyPair.privateKey, 256);
  const serverPublicKey = await crypto.subtle.exportKey("raw", serverKeyPair.publicKey);
  const prk = await hkdf(authSecret, new Uint8Array(sharedSecret), concat(encoder.encode("WebPush: info\0"), new Uint8Array(p256dh), new Uint8Array(serverPublicKey)), 32);
  const cek = await hkdf(salt, prk, encoder.encode("Content-Encoding: aes128gcm\0"), 16);
  const nonce = await hkdf(salt, prk, encoder.encode("Content-Encoding: nonce\0"), 12);
  const key = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  const plaintextBytes = encoder.encode(plaintext);
  const paddedPlaintext = concat(plaintextBytes, new Uint8Array([2]));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, key, paddedPlaintext);
  const serverPubKeyBytes = new Uint8Array(serverPublicKey);
  const header = new Uint8Array(21 + serverPubKeyBytes.length);
  header.set(salt, 0);
  new DataView(header.buffer).setUint32(16, 4096, false);
  header[20] = serverPubKeyBytes.length;
  header.set(serverPubKeyBytes, 21);
  return concat(header, new Uint8Array(ciphertext));
}
__name(encryptPayload, "encryptPayload");
__name2(encryptPayload, "encryptPayload");
async function hkdf(salt, ikm, info, length) {
  const key = await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt, info }, key, length * 8);
  return new Uint8Array(bits);
}
__name(hkdf, "hkdf");
__name2(hkdf, "hkdf");
async function buildVapidHeaders(endpoint, publicKeyBase64, privateKeyBase64, subject, jwtCallback) {
  const origin = new URL(endpoint).origin;
  const now = Math.floor(Date.now() / 1e3);
  const exp = now + 12 * 3600;
  const header = base64UrlEncode(JSON.stringify({ typ: "JWT", alg: "ES256" }));
  const claims = base64UrlEncode(JSON.stringify({ aud: origin, exp, sub: subject }));
  const sigInput = `${header}.${claims}`;
  const publicKeyBytes = base64UrlDecode(publicKeyBase64);
  const x = base64UrlEncode(publicKeyBytes.slice(1, 33));
  const y = base64UrlEncode(publicKeyBytes.slice(33, 65));
  const jwk = { kty: "EC", crv: "P-256", x, y, d: privateKeyBase64 };
  const privateKey = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );
  const sigBuf = await crypto.subtle.sign(
    { name: "ECDSA", hash: { name: "SHA-256" } },
    privateKey,
    new TextEncoder().encode(sigInput)
  );
  const sigBytes = new Uint8Array(sigBuf);
  let rawSig;
  if (sigBytes[0] === 48) {
    let i = 2;
    i++;
    let rLen = sigBytes[i++];
    let r = sigBytes.slice(i, i + rLen);
    if (r[0] === 0) r = r.slice(1);
    i += rLen;
    i++;
    let sLen = sigBytes[i++];
    let s = sigBytes.slice(i, i + sLen);
    if (s[0] === 0) s = s.slice(1);
    rawSig = new Uint8Array(64);
    rawSig.set(r, 32 - r.length);
    rawSig.set(s, 64 - s.length);
  } else {
    rawSig = sigBytes;
  }
  const jwt = `${sigInput}.${base64UrlEncode(rawSig)}`;
  console.log("jwt_header_b64:", header, "rawSig_len:", rawSig.length, "sigBytes0:", sigBytes[0]);
  if (jwtCallback) jwtCallback(jwt);
  return { "Authorization": `vapid t=${jwt},k=${publicKeyBase64}` };
}
__name(buildVapidHeaders, "buildVapidHeaders");
__name2(buildVapidHeaders, "buildVapidHeaders");
function base64UrlDecode(str) {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - padded.length % 4) % 4;
  const b64 = padded + "=".repeat(padLen);
  const binary = atob(b64);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}
__name(base64UrlDecode, "base64UrlDecode");
__name2(base64UrlDecode, "base64UrlDecode");
function base64UrlEncode(input) {
  let bytes = typeof input === "string" ? new TextEncoder().encode(input) : input;
  let binary = "";
  bytes.forEach((b) => binary += String.fromCharCode(b));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
__name(base64UrlEncode, "base64UrlEncode");
__name2(base64UrlEncode, "base64UrlEncode");
function concat(...arrays) {
  const total = arrays.reduce((sum, a) => sum + a.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const a of arrays) {
    result.set(a, offset);
    offset += a.length;
  }
  return result;
}
__name(concat, "concat");
__name2(concat, "concat");
function jsonResponse(data, status, corsHeaders) {
  return new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
__name(jsonResponse, "jsonResponse");
__name2(jsonResponse, "jsonResponse");
export {
  push_worker_default as default
};
