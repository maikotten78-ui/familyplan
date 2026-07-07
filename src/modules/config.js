// ── FIREBASE ─────────────────────────────────────────────────
export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAlk2Jch9DFdKs2PcS-CaiBUW56UC92Wic",
  authDomain: "family-task-2cacf.firebaseapp.com",
  projectId: "family-task-2cacf",
  appId: "1:985416473145:web:aec6bcae628816fcff4be8",
  databaseURL: "https://family-task-2cacf-default-rtdb.europe-west1.firebasedatabase.app",
};

export const DB_ROOT = "https://family-task-2cacf-default-rtdb.europe-west1.firebasedatabase.app";

// ── PUSH / PAYMENT ───────────────────────────────────────────
export const PUSH_VAPID_PUBLIC_KEY = 'BPmVwEVbsLwW5QU1CnmjB3XmNSzW0EhKiYP10WQYIRnMNJ4B20Sqc-bO4X1Na7_vGuo-xY6rqjJpX5lHk784K8A';
export const PUSH_WORKER_URL       = 'https://famiplan-push.maikotten78.workers.dev';
export const PAYMENT_WORKER_URL    = 'https://famiplan-payment.maikotten78.workers.dev';

// ── ADMIN ────────────────────────────────────────────────────
export const ADMIN_FAMILY_ID = '7YJ3Z9DW';

// ── PREMIUM ──────────────────────────────────────────────────
export const PREMIUM_ENABLED = true;
export const ADMIN_UIDS = [
  'mgvpHcR0jobEWj235h9Fz67tSw92',
  'TiO1QqsIibPKvvqkHlFUNTaHgpJ3',
];

// ── APPLE CALENDAR SYNC (Premium, iOS-only) ───────────────────
// GLOBALER SCHALTER: bleibt false bis Maik das Feature aktiv freigibt.
// Solange false: kein UI-Einstiegspunkt sichtbar, kein Capacitor-Calendar-
// Code wird ausgeführt (nur dynamisch importiert, siehe calendarSync.js).
export const CALENDAR_SYNC_ENABLED = true;
// Konfliktauflösung bei gleichzeitiger Änderung auf beiden Seiten.
// 'newer' = der Eintrag mit dem späteren updatedAt/lastModified gewinnt.
export const CALENDAR_SYNC_CONFLICT_STRATEGY = 'newer';
// Nur Termine syncen, die für den aktuellen Nutzer sichtbar sind
// (visibleTo === 'all' || curUser enthalten) – keine fremden privaten Termine.
export const CALENDAR_SYNC_RESPECT_VISIBILITY = true;

// ── APP URL (fuer teilbare Links) ───────────────────────────
// WICHTIG: location.origin darf NICHT fuer Einladungs-/Freigabelinks
// verwendet werden - in der nativen iOS-App (Capacitor) liefert
// location.origin "capacitor://localhost" statt der echten Domain, was
// z.B. WhatsApp nicht als klickbaren Link erkennt. Diese feste Konstante
// wird stattdessen fuer alle Links verwendet, die den Nutzer verlassen
// (Einladungslinks etc.), egal ob aus Web-App oder nativer App geteilt.
export const APP_URL = 'https://famiplan.app';

// ── APP STORE (iOS) ─────────────────────────────────────────
// Sobald famiplan im App Store gelistet ist: hier die App-Store-URL
// eintragen (z.B. 'https://apps.apple.com/app/idXXXXXXXXXX'). Solange
// null: Einladungslinks fuehren auf allen Geraeten weiterhin zur Web-App
// (siehe captureInviteLinkIntent() in main.js).
export const APP_STORE_URL = null;

// ── LEMON SQUEEZY ────────────────────────────────────────────
export const LS_CHECKOUT = {
  monthly: 'https://famiplan.lemonsqueezy.com/checkout/buy/fdce8540-8258-45c1-9305-d6bbd5cb6c23',
  yearly:  'https://famiplan.lemonsqueezy.com/checkout/buy/c7cb0518-dff0-407a-b299-f1ff6df19655',
};

// ── DATE / TIME ──────────────────────────────────────────────
export const DAYS = ["Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag","Sonntag"];
export const WDS  = ["Mo","Di","Mi","Do","Fr","Sa","So"];

// ── VISUAL CONSTANTS ─────────────────────────────────────────
export const COLORS = [
  "#FF3B30","#FF9500","#FFCC00","#34C759","#00C7BE",
  "#30B0C7","#007AFF","#5856D6","#AF52DE","#FF2D55",
  "#A2845E","#8E8E93"
];
export const MEMBER_COLORS = [
  "#5C4EE5","#E53E3E","#38A169","#D69E2E","#3182CE",
  "#805AD5","#DD6B20","#319795","#E53E8A","#718096"
];
export const TASK_EMOJIS = [
  "🎹","🛒","⚽","🏥","🗑️","📚","🎒","👕","🚗","🍳",
  "💊","🐕","🌿","🧹","📦","🎯","📅","🏋️","🎂","✈️","🎓","💼"
];
export const DEFAULT_EMOJIS = [
  "👩","👩🏻","👩🏼","👩🏽","👩🏾","👩🏿",
  "👨","👨🏻","👨🏼","👨🏽","👨🏾","👨🏿",
  "👧","👧🏻","👧🏼","👧🏽","👧🏾","👧🏿",
  "👦","👦🏻","👦🏼","👦🏽","👦🏾","👦🏿",
  "🧒","🧒🏻","🧒🏼","🧒🏽","🧒🏾","🧒🏿",
  "👵","👵🏻","👵🏼","👵🏽","👵🏾","👵🏿",
  "👴","👴🏻","👴🏼","👴🏽","👴🏾","👴🏿",
  "🧑","🧑🏻","🧑🏼","🧑🏽","🧑🏾","🧑🏿",
  "👱","👱🏻","👱🏼","👱🏽","👱🏾","👱🏿",
  "🧔","🧔🏻","🧔🏼","🧔🏽","🧔🏾","🧔🏿",
  "👩‍🦰","👩🏻‍🦰","👩🏽‍🦰","👩🏾‍🦰","👩🏿‍🦰",
  "👩‍🦱","👩🏻‍🦱","👩🏽‍🦱","👩🏾‍🦱","👩🏿‍🦱",
  "👩‍🦳","👩🏻‍🦳","👩🏽‍🦳","👩🏾‍🦳","👩🏿‍🦳",
  "👩‍🦲","👩🏻‍🦲","👩🏽‍🦲","👩🏾‍🦲","👩🏿‍🦲",
  "👶","👶🏻","👶🏼","👶🏽","👶🏾","👶🏿",
];

export const MEAL_TYPES = [
  { id: 'breakfast', label: 'Frühstück',  short: 'Früh'   },
  { id: 'lunch',     label: 'Mittagessen',short: 'Mittag' },
  { id: 'dinner',    label: 'Abendessen', short: 'Abend'  },
];
export const MEAL_EMOJIS = [
  '🍳','🥗','🍝','🍲','🥩','🍕','🌮','🍜','🥘','🍛','🥙','🍱','🫕','🥞','🍞','🧆'
];
export const BOARD_REACTIONS = ['👍','❤️','😂','😮','🙌'];

// ── RATE LIMITS ──────────────────────────────────────────────
export const RL_LIMITS = { task: 20, comment: 30, shop: 50, member: 10, board: 20, familyJoin: 8 };
