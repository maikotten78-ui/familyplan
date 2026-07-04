// ── FEIERTAGE & SCHULFERIEN ───────────────────────────────────
// Gesetzliche Feiertage nach Bundesland (berechenbar)
// Schulferien via ferien-api.de (gecacht in localStorage, 7 Tage)

// Bundesland-Codes für ferien-api.de
export const BUNDESLAENDER = {
  'BW': 'Baden-Württemberg',
  'BY': 'Bayern',
  'BE': 'Berlin',
  'BB': 'Brandenburg',
  'HB': 'Bremen',
  'HH': 'Hamburg',
  'HE': 'Hessen',
  'MV': 'Mecklenburg-Vorpommern',
  'NI': 'Niedersachsen',
  'NW': 'Nordrhein-Westfalen',
  'RP': 'Rheinland-Pfalz',
  'SL': 'Saarland',
  'SN': 'Sachsen',
  'ST': 'Sachsen-Anhalt',
  'SH': 'Schleswig-Holstein',
  'TH': 'Thüringen',
};

export function getBundesland() {
  return localStorage.getItem('fp_bundesland') || 'NW';
}

export function setBundesland(code) {
  localStorage.setItem('fp_bundesland', code);
  // Cache invalidieren damit neue Ferien geladen werden
  localStorage.removeItem('fp_ferien_cache');
}

// ── FEIERTAGE ─────────────────────────────────────────────────
function easterSunday(year) {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day   = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function iso(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

export function getFeiertage(year, bl) {
  const easter = easterSunday(year);
  const feiertage = {};

  const add = (date, name) => { feiertage[iso(date)] = name; };

  // Bundesweite Feiertage
  add(new Date(year, 0, 1),  'Neujahr');
  add(addDays(easter, -2),   'Karfreitag');
  add(easter,                'Ostersonntag');
  add(addDays(easter, 1),    'Ostermontag');
  add(new Date(year, 4, 1),  'Tag der Arbeit');
  add(addDays(easter, 39),   'Christi Himmelfahrt');
  add(addDays(easter, 49),   'Pfingstsonntag');
  add(addDays(easter, 50),   'Pfingstmontag');
  add(new Date(year, 9, 3),  'Tag der Deutschen Einheit');
  add(new Date(year, 11, 25),'1. Weihnachtstag');
  add(new Date(year, 11, 26),'2. Weihnachtstag');

  // Bundesland-spezifische Feiertage
  const has = (...codes) => codes.includes(bl);

  if (has('BW','BY','ST'))               add(new Date(year, 0, 6),  'Heilige Drei Könige');
  if (has('BW','BY','HE','NW','RP','SL','SN','ST','TH'))
                                          add(addDays(easter, 60),   'Fronleichnam');
  if (has('BY','SL'))                    add(new Date(year, 7, 15), 'Mariä Himmelfahrt');
  if (has('BB','MV','SN','ST','TH'))     add(new Date(year, 9, 31), 'Reformationstag');
  if (has('BW','BY','NW','RP','SL'))     add(new Date(year, 10, 1), 'Allerheiligen');
  if (has('SN'))                         add(new Date(year, 10, 18),'Buß- und Bettag');
  if (has('HH','HB','NI','SH','MV','BB','BE','TH','ST','SN'))
                                          add(new Date(year, 9, 31), 'Reformationstag');
  if (has('BE','HH','MV','SH','TH','SN','ST','NI','HB','BB'))
                                          add(new Date(year, 2, 8),  'Internationaler Frauentag');

  return feiertage;
}

// Gibt Feiertagsname für ein ISO-Datum zurück (oder null)
export function getFeiertagName(iso) {
  const year = parseInt(iso.split('-')[0]);
  const bl   = getBundesland();
  const cache = _feiertagCache[year + bl];
  if (cache) return cache[iso] || null;
  const f = getFeiertage(year, bl);
  _feiertagCache[year + bl] = f;
  return f[iso] || null;
}

const _feiertagCache = {};

// ── SCHULFERIEN ────────────────────────────────────────────────
const FERIEN_CACHE_KEY = 'fp_ferien_cache';
const FERIEN_CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 Tage

// ferien-api.de Bundesland-Codes
const BL_TO_API = {
  'BW':'BW','BY':'BY','BE':'BE','BB':'BB','HB':'HB','HH':'HH',
  'HE':'HE','MV':'MV','NI':'NI','NW':'NW','RP':'RP','SL':'SL',
  'SN':'SN','ST':'ST','SH':'SH','TH':'TH',
};

export async function loadSchulferien(bl, year) {
  const key  = `${bl}_${year}`;
  try {
    const raw = localStorage.getItem(FERIEN_CACHE_KEY);
    const cache = raw ? JSON.parse(raw) : {};
    if (cache[key] && Date.now() - cache[key].ts < FERIEN_CACHE_TTL) {
      return cache[key].data;
    }
  } catch(e) {}

  try {
    const apiCode = BL_TO_API[bl] || 'NW';

    let data = null;
    // Versuche schulferien-api.de zuerst, dann ferien-api.de als Fallback
    for (const url of [
      `https://schulferien-api.de/api/v1/${year}/${apiCode}/`,
      `https://ferien-api.de/api/v1/holidays/${apiCode}/${year}`,
    ]) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          data = await res.json();
          if (Array.isArray(data) && data.length > 0) break;
        }
      } catch(e) {
        console.warn('Schulferien API error:', url, e.message);
      }
    }

    if (!data || !Array.isArray(data)) return [];

    // Normalisieren: Array von {start, end, name}
    const ferien = data.map(f => ({
      start: (f.start || f.startDate || '').split('T')[0],
      end:   (f.end   || f.endDate   || '').split('T')[0],
      name:  f.name || f.title || 'Schulferien',
    })).filter(f => f.start && f.end);

    // In Cache schreiben
    try {
      const raw = localStorage.getItem(FERIEN_CACHE_KEY);
      const cache = raw ? JSON.parse(raw) : {};
      cache[key] = { data: ferien, ts: Date.now() };
      localStorage.setItem(FERIEN_CACHE_KEY, JSON.stringify(cache));
    } catch(e) {}

    return ferien;
  } catch(e) {
    return [];
  }
}

// Schulferienname für ein ISO-Datum (synchron aus Cache)
export function getSchulferienName(isoDate) {
  try {
    const raw = localStorage.getItem(FERIEN_CACHE_KEY);
    if (!raw) return null;
    const cache = JSON.parse(raw);
    const bl    = getBundesland();
    const year  = parseInt(isoDate.split('-')[0]);

    for (const y of [year, year - 1]) {
      const key = `${bl}_${y}`;
      const entry = cache[key];
      if (!entry) continue;
      for (const f of entry.data) {
        if (isoDate >= f.start && isoDate < f.end) return f.name;
      }
    }
  } catch(e) {}
  return null;
}

// Vorladen beim App-Start (Hintergrund)
export async function preloadSchulferien() {
  const bl   = getBundesland();
  const year = new Date().getFullYear();
  await Promise.all([
    loadSchulferien(bl, year),
    loadSchulferien(bl, year + 1),
  ]);
}

// Kombinierte Abfrage: Feiertag hat Vorrang vor Schulferien
// Gibt { name, type: 'feiertag'|'schulferien' } oder null zurück
export function getHolidayInfo(isoDate) {
  const ft = getFeiertagName(isoDate);
  if (ft) return { name: ft, type: 'feiertag' };
  const sf = getSchulferienName(isoDate);
  if (sf) return { name: sf, type: 'schulferien' };
  return null;
}


