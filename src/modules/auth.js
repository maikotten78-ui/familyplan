import { FIREBASE_CONFIG, DB_ROOT } from './config.js';
import { unsubscribeAll } from './listener.js';
import { state, setState } from './state.js';
import { fbFetch } from './firebase.js';
import { clearFamilyCache } from './cache.js';

// ── SCRIPT LOADER ─────────────────────────────────────────────
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src; s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
}

// ── INIT ──────────────────────────────────────────────────────
export async function initFirebaseAuth(onSuccess, onFailure) {
  try {
    await Promise.race([
      (async () => {
        await loadScript('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
        await loadScript('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js');
        // Database SDK für Realtime Listener
        await loadScript('https://www.gstatic.com/firebasejs/10.7.1/firebase-database-compat.js');
      })(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000)),
    ]);

    if (!window.firebase.apps.length) window.firebase.initializeApp(FIREBASE_CONFIG);
    const auth = window.firebase.auth();
    setState({ firebaseAuth: auth });

    auth.setPersistence(window.firebase.auth.Auth.Persistence.LOCAL);
    auth.getRedirectResult().catch(() => {});

    const authTimeout = setTimeout(() => {
      console.warn('Auth timeout – showing auth screen');
      onFailure();
    }, 6000);

    // WICHTIG: onAuthStateChanged kann fuer denselben Nutzer MEHRFACH
    // feuern (typischerweise kurz nach einer Registrierung durch einen
    // internen Firebase-Token-Refresh) - auch waehrend der Nutzer noch
    // mitten im Onboarding sitzt (z.B. auf der "Alles bereit!"-Seite).
    // Ein erneuter onSuccess()/proceedAfterAuth()-Lauf wuerde dann den
    // Family-Screen faelschlich ausblenden und direkt in die App springen,
    // obwohl der Nutzer den Ablauf noch gar nicht abgeschlossen hat (z.B.
    // "Los geht's" noch nicht angetippt). Deshalb nur bei echtem
    // UID-Wechsel (oder dem allerersten Aufruf) den vollen Ablauf ausloesen.
    let lastProcessedUid = null;

    auth.onAuthStateChanged(user => {
      clearTimeout(authTimeout);
      setState({ currentAuthUser: user });
      if (user) {
        hideAuthScreen();
        if (user.uid !== lastProcessedUid) {
          lastProcessedUid = user.uid;
          onSuccess();
        }
        // Token proaktiv alle 50 Minuten erneuern (läuft alle 60 Min ab)
        if (window._tokenRefreshInterval) clearInterval(window._tokenRefreshInterval);
        window._tokenRefreshInterval = setInterval(async () => {
          try {
            if (state.currentAuthUser) {
              await state.currentAuthUser.getIdToken(true);
              // Token proaktiv erneuert
            }
          } catch (e) { console.warn('Token refresh failed:', e.message); }
        }, 50 * 60 * 1000); // alle 50 Minuten
      } else {
        lastProcessedUid = null;
        if (window._tokenRefreshInterval) {
          clearInterval(window._tokenRefreshInterval);
          window._tokenRefreshInterval = null;
        }
        onFailure();
      }
    });

  } catch (e) {
    console.error('Firebase Auth init failed:', e);
    if (state.familyId) onSuccess(); else onFailure();
  }
}

// ── SCREEN HELPERS ────────────────────────────────────────────
export function showAuthScreen() {
  const fs = document.getElementById('family-screen');
  if (fs) fs.style.display = 'none';
  const ns = document.getElementById('name-screen');
  if (ns) ns.style.display = 'none';

  // Neue Besucher → Splash-Screen; bekannte → direkt Login
  const hasVisited = localStorage.getItem('fp_visited');
  if (!hasVisited) {
    // Erster Besuch: Splash zeigen
    const splash = document.getElementById('splash-screen');
    if (splash) { splash.style.display = 'flex'; return; }
  }
  // Bekannte Besucher: direkt Auth
  const s = document.getElementById('auth-screen');
  if (s) { s.style.display = 'flex'; s.style.opacity = '1'; }
}

export function showAuthScreenDirect() {
  // Direkt Auth ohne Splash (nach "Anmelden" klick)
  localStorage.setItem('fp_visited', '1');
  const splash = document.getElementById('splash-screen');
  if (splash) splash.style.display = 'none';
  const s = document.getElementById('auth-screen');
  if (s) { s.style.display = 'flex'; s.style.opacity = '1'; }
}

export function hideAuthScreen() {
  const s = document.getElementById('auth-screen');
  if (!s) return;
  s.style.transition = 'opacity 0.3s';
  s.style.opacity    = '0';
  setTimeout(() => s.style.display = 'none', 300);
}

// ── MODE TOGGLE ───────────────────────────────────────────────
export function authSetMode(mode) {
  setState({ authMode: mode });
  document.getElementById('auth-tab-login')?.classList.toggle('active', mode === 'login');
  document.getElementById('auth-tab-register')?.classList.toggle('active', mode === 'register');
  const btn = document.getElementById('auth-submit-btn');
  if (btn) btn.textContent = mode === 'login' ? 'Anmelden' : 'Registrieren';
  const err = document.getElementById('auth-err');
  if (err) err.textContent = '';
  const sub = document.getElementById('auth-sub');
  if (sub) sub.textContent = mode === 'login' ? 'Melde dich an um fortzufahren' : 'Erstelle deinen Account';
  const pw = document.getElementById('auth-password');
  if (pw && mode === 'register') pw.autocomplete = 'new-password';
  const confirmGroup = document.getElementById('auth-email-confirm-group');
  const confirmInput = document.getElementById('auth-email-confirm');
  if (confirmGroup) confirmGroup.style.display = mode === 'register' ? '' : 'none';
  if (confirmInput && mode !== 'register') confirmInput.value = ''; // beim Zurueckwechseln zu "Anmelden" zuruecksetzen
}

// ── PASSWORT SICHTBARKEIT UMSCHALTEN ────────────────────────────
const EYE_OPEN   = '<path d="M1 10s3-6 9-6 9 6 9 6-3 6-9 6-9-6-9-6z"/><circle cx="10" cy="10" r="2.5"/>';
const EYE_CLOSED = '<path d="M1 10s3-6 9-6 9 6 9 6-3 6-9 6-9-6-9-6z"/><circle cx="10" cy="10" r="2.5"/><line x1="2.5" y1="17.5" x2="17.5" y2="2.5"/>';
export function authTogglePasswordVisibility() {
  const pw  = document.getElementById('auth-password');
  const eye = document.getElementById('auth-pw-eye');
  const btn = document.getElementById('auth-pw-toggle');
  if (!pw || !eye) return;
  const showing = pw.type === 'text';
  pw.type = showing ? 'password' : 'text';
  eye.innerHTML = showing ? EYE_OPEN : EYE_CLOSED;
  if (btn) btn.setAttribute('aria-label', showing ? 'Passwort anzeigen' : 'Passwort verbergen');
}

// ── SUBMIT ────────────────────────────────────────────────────
export async function authSubmit() {
  const email    = document.getElementById('auth-email')?.value.trim();
  const password = document.getElementById('auth-password')?.value;
  const btn      = document.getElementById('auth-submit-btn');
  const err      = document.getElementById('auth-err');

  if (!email || !password) { if (err) err.textContent = 'Bitte E-Mail und Passwort eingeben'; return; }

  if (state.authMode === 'register') {
    const emailConfirm = document.getElementById('auth-email-confirm')?.value.trim();
    if (!emailConfirm) { if (err) err.textContent = 'Bitte E-Mail zur Bestätigung erneut eingeben'; return; }
    if (email.toLowerCase() !== emailConfirm.toLowerCase()) { if (err) err.textContent = 'E-Mail-Adressen stimmen nicht überein'; return; }
  }

  if (btn) { btn.disabled = true; btn.textContent = 'Bitte warten…'; }
  if (err) err.textContent = '';

  const resetBtn = () => {
    if (btn) { btn.disabled = false; btn.textContent = state.authMode === 'login' ? 'Anmelden' : 'Registrieren'; }
  };

  try {
    const auth = state.firebaseAuth;
    if (!auth) {
      if (err) err.textContent = 'Verbindung wird aufgebaut – bitte kurz warten und nochmal versuchen';
      resetBtn(); return;
    }
    // Timeout nach 10 Sekunden
    const result = await Promise.race([
      state.authMode === 'login'
        ? auth.signInWithEmailAndPassword(email, password)
        : auth.createUserWithEmailAndPassword(email, password),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000))
    ]);
  } catch (e) {
    if (e.message === 'timeout') {
      if (err) err.textContent = 'Zeitüberschreitung – bitte Verbindung prüfen und nochmal versuchen';
    } else {
      if (err) err.textContent = authErrorMessage(e.code);
    }
    resetBtn();
  }
}

// ── GOOGLE ────────────────────────────────────────────────────
export async function authGoogle() {
  const err = document.getElementById('auth-err');
  if (err) err.textContent = '';
  try {
    const provider  = new window.firebase.auth.GoogleAuthProvider();
    const isAndroid = /android/i.test(navigator.userAgent);
    if (isAndroid) {
      await state.firebaseAuth.signInWithRedirect(provider);
    } else {
      await state.firebaseAuth.signInWithPopup(provider);
    }
  } catch (e) {
    if (err) err.textContent = authErrorMessage(e.code);
  }
}

// ── FORGOT PASSWORD ───────────────────────────────────────────
export async function authForgotPassword() {
  const email = document.getElementById('auth-email')?.value.trim();
  const err   = document.getElementById('auth-err');
  const btn   = document.getElementById('forgot-pw-btn');

  if (!email) {
    if (err) { err.textContent = 'Bitte zuerst deine E-Mail eintragen.'; err.style.color = '#DC2626'; }
    return;
  }
  if (btn) { btn.disabled = true; btn.textContent = 'Wird gesendet…'; }

  try {
    await state.firebaseAuth.sendPasswordResetEmail(email);
    if (err) { err.textContent = '✅ Reset-E-Mail gesendet! Bitte prüfe dein Postfach (auch Spam).'; err.style.color = '#059669'; }
    if (btn) btn.textContent = 'E-Mail gesendet ✓';
  } catch (e) {
    if (err) {
      err.style.color = '#DC2626';
      err.textContent = e.code === 'auth/user-not-found'
        ? 'Keine Account mit dieser E-Mail gefunden.'
        : e.code === 'auth/invalid-email'
          ? 'Ungültige E-Mail-Adresse.'
          : 'Fehler: ' + e.message;
    }
    if (btn) { btn.disabled = false; btn.textContent = 'Passwort vergessen?'; }
  }
}

// ── ERROR MESSAGES ────────────────────────────────────────────
export function authErrorMessage(code) {
  const msgs = {
    'auth/user-not-found':       'Kein Account mit dieser E-Mail gefunden.',
    'auth/wrong-password':       'Falsches Passwort.',
    'auth/email-already-in-use': 'Diese E-Mail wird bereits verwendet.',
    'auth/weak-password':        'Passwort muss mindestens 6 Zeichen haben.',
    'auth/invalid-email':        'Ungültige E-Mail-Adresse.',
    'auth/too-many-requests':    'Zu viele Versuche. Bitte warte kurz.',
    'auth/popup-closed-by-user': 'Anmeldung abgebrochen.',
    'auth/invalid-credential':   'E-Mail oder Passwort falsch.',
  };
  return msgs[code] || 'Fehler: ' + code;
}

// ── PROCEED AFTER AUTH ────────────────────────────────────────
// Wird nach erfolgreichem Login aufgerufen.
// Lädt Familie aus Firebase-Profil, verhindert Familie-Vererbung zwischen Accounts.
export async function proceedAfterAuth(appInit, loadUserPlan, setPlan) {
  // KRITISCH: alte Listener trennen bevor neue Familie geladen wird
  // Verhindert dass Daten der alten Familie nach Familienwechsel sichtbar bleiben
  unsubscribeAll();

  // Falls zuvor der Demo-Modus aktiv war (z.B. "Demo ansehen" angetippt, dann
  // ohne "Registrieren"-Button die App verlassen/neu gestartet und sich danach
  // regulär eingeloggt): Flag entfernen, sonst bleiben loadBoard()/loadMeals()
  // dauerhaft stumm inaktiv, obwohl familyId korrekt gesetzt ist.
  if (localStorage.getItem('fp_demo_mode') === '1') {
    localStorage.removeItem('fp_demo_mode');
    document.getElementById('demo-banner')?.remove();
  }

  setState({ tasks: [], boardPosts: {}, meals: {}, mealRecipes: {} });

  const joinedViaLink = localStorage.getItem('fp_joined_via_link') === '1';
  const user          = state.currentAuthUser;

  if (!joinedViaLink && user) {
    try {
      const uid = user.uid;
      const r   = await fbFetch(`${DB_ROOT}/users/${uid}/family.json`);
      const data = await r.json();

      if (data && data.familyId) {
        const oldFamilyId = state.familyId;
        setState({ familyId: data.familyId, familyName: data.familyName || '' });
        localStorage.setItem('fp_family_id',   data.familyId);
        localStorage.setItem('fp_family_name', data.familyName || '');

        if (oldFamilyId && oldFamilyId !== data.familyId) {
          clearFamilyCache();
          setState({ tasks: [], boardPosts: {}, meals: {}, mealRecipes: {} });
        }
      } else {
        // Firebase hat keine familyId. Zwei moegliche Gruende:
        // (a) echter Registrierungs-Bug/Race Condition -> aus dem lokalen
        //     Cache reparieren (urspruengliches Verhalten, weiterhin noetig).
        // (b) EXPLIZITER Zugriffsentzug durch ein anderes Familienmitglied
        //     ("Verbundene Accounts" -> revokeMemberAccess()) -> darf NICHT
        //     aus dem Cache repariert werden, sonst waere der Entzug
        //     wirkungslos (Sicherheits-Review 08.07.2026).
        // Unterscheidung ueber das familyRevokedAt-Flag, das
        // revokeMemberAccess() gezielt vor dem Loeschen setzt.
        let wasRevoked = false;
        try {
          const rr = await fbFetch(`${DB_ROOT}/users/${uid}/familyRevokedAt.json`);
          const revokedAt = rr.ok ? await rr.json() : null;
          if (revokedAt) {
            wasRevoked = true;
            // Flag verbrauchen, damit ein spaeterer regulaerer Neu-Beitritt
            // (z.B. ueber einen neuen Einladungslink) nicht blockiert wird.
            fbFetch(`${DB_ROOT}/users/${uid}/familyRevokedAt.json`, { method: 'DELETE' }).catch(() => {});
          }
        } catch (flagErr) {
          console.warn('proceedAfterAuth: familyRevokedAt-Check fehlgeschlagen:', flagErr.message);
        }

        const cachedFamilyId   = localStorage.getItem('fp_family_id')   || '';
        const cachedFamilyName = localStorage.getItem('fp_family_name') || '';

        if (cachedFamilyId && !wasRevoked) {
          // localStorage hat noch eine gültige familyId → behalten und Firebase reparieren
          console.warn('proceedAfterAuth: Firebase familyId leer, repariere aus localStorage:', cachedFamilyId);
          setState({ familyId: cachedFamilyId, familyName: cachedFamilyName });
          // Firebase-Eintrag im Hintergrund reparieren
          try {
            await fbFetch(`${DB_ROOT}/users/${uid}/family.json`, {
              method: 'PUT',
              body: JSON.stringify({ familyId: cachedFamilyId, familyName: cachedFamilyName, updatedAt: Date.now() }),
            });
          } catch (repairErr) {
            console.warn('proceedAfterAuth: Firebase-Reparatur fehlgeschlagen:', repairErr.message);
          }
        } else {
          // Wirklich neuer Account ohne Familie ODER Zugriff wurde
          // entzogen → alles leeren, kein automatisches Wiederherstellen.
          if (wasRevoked) console.warn('proceedAfterAuth: Zugriff wurde entzogen, Cache wird NICHT repariert.');
          setState({ familyId: '', familyName: '' });
          localStorage.removeItem('fp_family_id');
          localStorage.removeItem('fp_family_name');
          clearFamilyCache();
          setState({ tasks: [], boardPosts: {}, meals: {}, mealRecipes: {} });
        }
      }
    } catch (e) {
      console.warn('Could not load family from profile, using cache:', e);
      setState({
        familyId:   localStorage.getItem('fp_family_id')   || '',
        familyName: localStorage.getItem('fp_family_name') || '',
      });
    }
  } else if (!joinedViaLink) {
    setState({
      familyId:   localStorage.getItem('fp_family_id')   || '',
      familyName: localStorage.getItem('fp_family_name') || '',
    });
  }

  if (joinedViaLink && state.familyId && user) {
    localStorage.removeItem('fp_joined_via_link');
    await saveUserFamily();
  }

  try {
    await Promise.race([loadUserPlan(), new Promise(r => setTimeout(r, 3000))]);
  } catch (e) { setPlan('free'); }

  // Hide auth + family screens before appInit
  const authEl   = document.getElementById('auth-screen');
  const familyEl = document.getElementById('family-screen');
  if (authEl)   { authEl.style.transition = 'opacity 0.3s'; authEl.style.opacity = '0'; setTimeout(() => authEl.style.display = 'none', 300); }
  if (familyEl) familyEl.style.display = 'none';

  if (state.familyId) setTimeout(() => import('./firebase.js').then(m => { m.ensureFamilyInIndex(); m.syncPublicFamily(); }), 2000);
  appInit();
}

// ── SAVE USER FAMILY ──────────────────────────────────────────
export async function saveUserFamily() {
  const { currentAuthUser, familyId, familyName } = state;
  if (!currentAuthUser || !familyId) return;
  try {
    await fbFetch(`${DB_ROOT}/users/${currentAuthUser.uid}/family.json`, {
      method: 'PUT',
      body: JSON.stringify({ familyId, familyName, updatedAt: Date.now() }),
    });
  } catch (e) { console.warn('Could not save family to profile:', e); }
}

// ── SIGN OUT ──────────────────────────────────────────────────
export function authSignOut(onSignedOut) {
  // KRITISCH: Realtime Listener sofort trennen bevor signOut()
  // Verhindert Datenlecks nach dem Logout
  unsubscribeAll();

  // Stop all polls and timers
  if (window._taskPollId)  { clearInterval(window._taskPollId);  window._taskPollId  = null; }
  if (window._shopPollId)  { clearInterval(window._shopPollId);  window._shopPollId  = null; }
  if (window._boardPollId) { clearInterval(window._boardPollId); window._boardPollId = null; }
  window._taskPoll  = false;
  window._shopPoll  = false;
  window._boardPoll = false;
  state._reminderTimers.forEach(t => clearTimeout(t));

  // Clear all state
  setState({
    _reminderTimers: [], tasks: [], boardPosts: {}, meals: {}, mealRecipes: {},
    shopItems: [], familyId: '', familyName: '', curUser: null,
    currentAuthUser: null, members: [], av: {}, photos: {},
  });

  // Clear all localStorage keys
  ['fp_user','fp_demo_mode','fp_family_id','fp_family_name','fp_family_role',
   'fp_joined_via_link','fp_board_seen','fp_trial_welcomed','fp_push_prompted'].forEach(k => localStorage.removeItem(k));

  clearFamilyCache();

  // Hide all screens, show auth
  document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
  ['family-screen','name-screen','push-page','demo-banner'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  // Sign out from Firebase then reload – cleanest way to reset all state
  if (state.firebaseAuth) {
    state.firebaseAuth.signOut()
      .then(() => { window.location.href = window.location.pathname; })
      .catch(() => { window.location.href = window.location.pathname; });
  } else {
    window.location.href = window.location.pathname;
  }
  if (onSignedOut) onSignedOut();
}

// ── DELETE ACCOUNT ────────────────────────────────────────────
export async function deleteAccount(showSync, closeModal, showUserModal) {
  const btn   = document.getElementById('del-confirm-btn');
  const errEl = document.getElementById('del-err');
  if (btn)   { btn.disabled = true; btn.textContent = 'Wird gelöscht…'; }
  if (errEl) errEl.textContent = '';

  try {
    const user     = state.currentAuthUser;
    const isGoogle = user?.providerData?.[0]?.providerId === 'google.com';

    if (!isGoogle) {
      const pw = document.getElementById('del-password')?.value;
      if (!pw) {
        if (errEl) errEl.textContent = 'Bitte Passwort eingeben.';
        if (btn)   { btn.disabled = false; btn.textContent = 'Ja, Account unwiderruflich löschen'; }
        return;
      }
      const cred = window.firebase.auth.EmailAuthProvider.credential(user.email, pw);
      await user.reauthenticateWithCredential(cred);
    }

    const uid = user.uid;
    await user.getIdToken(true);

    await fbFetch(`${DB_ROOT}/users/${uid}.json`, { method: 'DELETE' });

    if (state.familyId && state.curUser) {
      await fbFetch(`${DB_ROOT}/families/${state.familyId}/members/${encodeURIComponent(state.curUser)}.json`, { method: 'DELETE' });
      try {
        const r         = await fbFetch(`${DB_ROOT}/families/${state.familyId}/members.json`);
        const remaining = await r.json();
        if (!remaining || Object.keys(remaining).length === 0) {
          await fbFetch(`${DB_ROOT}/families/${state.familyId}.json`, { method: 'DELETE' });
        }
      } catch (e) {}
    }

    showSync('Account erfolgreich gelöscht.');
    await user.delete();

    ['fp_family_id','fp_family_name','fp_user','fp_joined_via_link',
     'fp_demo_mode','fp_install_shown'].forEach(k => localStorage.removeItem(k));
    clearFamilyCache();
    showAuthScreen();

  } catch (e) {
    console.error('Delete account error:', e);
    let msg = 'Fehler beim Löschen.';
    if (e.code === 'auth/wrong-password')       msg = 'Falsches Passwort.';
    if (e.code === 'auth/requires-recent-login') msg = 'Bitte melde dich erneut an und versuche es nochmal.';
    if (errEl) errEl.textContent = msg;
    if (btn)   { btn.disabled = false; btn.textContent = 'Ja, Account unwiderruflich löschen'; }
  }
}

// ── SHOW DELETE ACCOUNT MODAL ─────────────────────────────────
export function showDeleteAccountModal(openModal, closeModal, showSync, showUserModal) {
  const isGoogle = state.currentAuthUser?.providerData?.[0]?.providerId === 'google.com';
  const pwField  = isGoogle ? '' : `
    <div style="margin-bottom:14px">
      <label style="display:block;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px">Passwort bestätigen</label>
      <input type="password" id="del-password" class="form-input" placeholder="Dein Passwort" autocomplete="current-password"/>
    </div>`;
  openModal(`
    <div class="modal-handle"></div>
    <div style="text-align:center;font-size:40px;margin-bottom:12px">⚠️</div>
    <div class="modal-title" style="color:#DC2626">Account löschen</div>
    <div class="modal-sub" style="margin-bottom:16px">Diese Aktion kann nicht rückgängig gemacht werden.</div>
    ${pwField}
    <div id="del-err" style="font-size:12px;color:#DC2626;min-height:18px;margin-bottom:8px;font-weight:500"></div>
    <button id="del-confirm-btn" style="width:100%;padding:13px;border:none;border-radius:10px;background:#DC2626;color:white;font-weight:700;font-size:15px;cursor:pointer;font-family:inherit" onclick="window._app.deleteAccount()">Ja, Account unwiderruflich löschen</button>
    <button class="modal-close" onclick="window._app.closeModal()">Abbrechen</button>
  `);
}


