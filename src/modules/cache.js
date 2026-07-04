import { state } from './state.js';

export function saveCache(key, data) {
  try {
    localStorage.setItem('fp_cache_' + key, JSON.stringify(data));
    localStorage.setItem('fp_cache_family_id', state.familyId);
  } catch (e) {}
}

export function loadCache(key) {
  try {
    const d = localStorage.getItem('fp_cache_' + key);
    return d ? JSON.parse(d) : null;
  } catch (e) { return null; }
}

export function clearFamilyCache() {
  Object.keys(localStorage)
    .filter(k => k.startsWith('fp_cache_'))
    .forEach(k => localStorage.removeItem(k));
}

export function isCacheForCurrentFamily() {
  return localStorage.getItem('fp_cache_family_id') === state.familyId;
}
