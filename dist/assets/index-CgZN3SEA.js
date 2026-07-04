const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/firebase-BULWIflD.js","assets/rolldown-runtime-D3qAFmwF.js","assets/utils-DlBB0M1o.js","assets/state-BxTl7OOb.js","assets/premium-CFYIjuZK.js","assets/preload-helper-DP6ITQX2.js","assets/shopping-jp0CsUb_.js","assets/cache-PXeUWmKj.js","assets/tasks-u2ACPD6L.js","assets/listener-DI_nJeYt.js","assets/board-C_7hY_L_.js","assets/esm-SZqLpkQS.js","assets/dist-Do0m8ifp.js","assets/modal-C6B7Vjjr.js"])))=>i.map(i=>d[i]);
import{n as e,r as t,t as n}from"./rolldown-runtime-D3qAFmwF.js";import{A as r,C as i,D as a,E as o,S as s,T as c,_ as l,a as u,b as d,c as f,d as p,f as m,h,i as g,j as _,k as v,l as y,o as b,p as x,r as S,s as C,u as w,x as T,y as ee}from"./utils-DlBB0M1o.js";import{i as E,n as D,r as O}from"./state-BxTl7OOb.js";import{a as te,c as ne,i as k,l as A,n as j,o as M,r as N,t as re,u as ie}from"./firebase-BULWIflD.js";import{i as ae,n as oe,r as P,t as se}from"./cache-PXeUWmKj.js";import{r as ce,t as le}from"./listener-DI_nJeYt.js";import{n as F,t as I}from"./preload-helper-DP6ITQX2.js";import{_ as ue,a as L,c as de,d as fe,f as pe,g as me,i as he,l as R,m as ge,n as _e,o as ve,p as ye,r as be,s as xe,t as Se,u as Ce}from"./tasks-u2ACPD6L.js";import{a as we,c as Te,d as Ee,f as De,i as Oe,l as ke,n as Ae,o as je,p as Me,r as Ne,s as Pe,t as Fe,u as Ie}from"./shopping-jp0CsUb_.js";import{a as Le,i as z,l as Re,n as B,o as ze,r as V,s as Be,u as Ve}from"./premium-CFYIjuZK.js";import{a as He,c as Ue,f as We,i as Ge,l as Ke,m as qe,n as Je,o as Ye,p as Xe,r as Ze,s as Qe,t as $e,u as et}from"./board-C_7hY_L_.js";import{a as H,i as U,n as W,t as G}from"./modal-C6B7Vjjr.js";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})(),w(),_(),le(),D(),A(),oe(),F();function tt(e){return new Promise((t,n)=>{if(document.querySelector(`script[src="${e}"]`)){t();return}let r=document.createElement(`script`);r.src=e,r.onload=t,r.onerror=n,document.head.appendChild(r)})}async function nt(e,t){try{await Promise.race([(async()=>{await tt(`https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js`),await tt(`https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js`),await tt(`https://www.gstatic.com/firebasejs/10.7.1/firebase-database-compat.js`)})(),new Promise((e,t)=>setTimeout(()=>t(Error(`timeout`)),8e3))]),window.firebase.apps.length||window.firebase.initializeApp(i);let n=window.firebase.auth();O({firebaseAuth:n}),n.setPersistence(window.firebase.auth.Auth.Persistence.LOCAL),n.getRedirectResult().catch(()=>{});let r=setTimeout(()=>{console.warn(`Auth timeout – showing auth screen`),t()},6e3);n.onAuthStateChanged(n=>{clearTimeout(r),O({currentAuthUser:n}),n?(at(),e(),window._tokenRefreshInterval&&clearInterval(window._tokenRefreshInterval),window._tokenRefreshInterval=setInterval(async()=>{try{E.currentAuthUser&&await E.currentAuthUser.getIdToken(!0)}catch(e){console.warn(`Token refresh failed:`,e.message)}},3e3*1e3)):(window._tokenRefreshInterval&&(clearInterval(window._tokenRefreshInterval),window._tokenRefreshInterval=null),t())})}catch(n){console.error(`Firebase Auth init failed:`,n),E.familyId?e():t()}}function rt(){let e=document.getElementById(`family-screen`);e&&(e.style.display=`none`);let t=document.getElementById(`name-screen`);if(t&&(t.style.display=`none`),!localStorage.getItem(`fp_visited`)){let e=document.getElementById(`splash-screen`);if(e){e.style.display=`flex`;return}}let n=document.getElementById(`auth-screen`);n&&(n.style.display=`flex`,n.style.opacity=`1`)}function it(){localStorage.setItem(`fp_visited`,`1`);let e=document.getElementById(`splash-screen`);e&&(e.style.display=`none`);let t=document.getElementById(`auth-screen`);t&&(t.style.display=`flex`,t.style.opacity=`1`)}function at(){let e=document.getElementById(`auth-screen`);e&&(e.style.transition=`opacity 0.3s`,e.style.opacity=`0`,setTimeout(()=>e.style.display=`none`,300))}function ot(e){O({authMode:e}),document.getElementById(`auth-tab-login`)?.classList.toggle(`active`,e===`login`),document.getElementById(`auth-tab-register`)?.classList.toggle(`active`,e===`register`);let t=document.getElementById(`auth-submit-btn`);t&&(t.textContent=e===`login`?`Anmelden`:`Registrieren`);let n=document.getElementById(`auth-err`);n&&(n.textContent=``);let r=document.getElementById(`auth-sub`);r&&(r.textContent=e===`login`?`Melde dich an um fortzufahren`:`Erstelle deinen Account`);let i=document.getElementById(`auth-password`);i&&e===`register`&&(i.autocomplete=`new-password`)}async function st(){let e=document.getElementById(`auth-email`)?.value.trim(),t=document.getElementById(`auth-password`)?.value,n=document.getElementById(`auth-submit-btn`),r=document.getElementById(`auth-err`);if(!e||!t){r&&(r.textContent=`Bitte E-Mail und Passwort eingeben`);return}n&&(n.disabled=!0,n.textContent=`Bitte warten…`),r&&(r.textContent=``);let i=()=>{n&&(n.disabled=!1,n.textContent=E.authMode===`login`?`Anmelden`:`Registrieren`)};try{let n=E.firebaseAuth;if(!n){r&&(r.textContent=`Verbindung wird aufgebaut – bitte kurz warten und nochmal versuchen`),i();return}await Promise.race([E.authMode===`login`?n.signInWithEmailAndPassword(e,t):n.createUserWithEmailAndPassword(e,t),new Promise((e,t)=>setTimeout(()=>t(Error(`timeout`)),1e4))])}catch(e){e.message===`timeout`?r&&(r.textContent=`Zeitüberschreitung – bitte Verbindung prüfen und nochmal versuchen`):r&&(r.textContent=ut(e.code)),i()}}async function ct(){let e=document.getElementById(`auth-err`);e&&(e.textContent=``);try{let e=new window.firebase.auth.GoogleAuthProvider;/android/i.test(navigator.userAgent)?await E.firebaseAuth.signInWithRedirect(e):await E.firebaseAuth.signInWithPopup(e)}catch(t){e&&(e.textContent=ut(t.code))}}async function lt(){let e=document.getElementById(`auth-email`)?.value.trim(),t=document.getElementById(`auth-err`),n=document.getElementById(`forgot-pw-btn`);if(!e){t&&(t.textContent=`Bitte zuerst deine E-Mail eintragen.`,t.style.color=`#DC2626`);return}n&&(n.disabled=!0,n.textContent=`Wird gesendet…`);try{await E.firebaseAuth.sendPasswordResetEmail(e),t&&(t.textContent=`✅ Reset-E-Mail gesendet! Bitte prüfe dein Postfach (auch Spam).`,t.style.color=`#059669`),n&&(n.textContent=`E-Mail gesendet ✓`)}catch(e){t&&(t.style.color=`#DC2626`,t.textContent=e.code===`auth/user-not-found`?`Keine Account mit dieser E-Mail gefunden.`:e.code===`auth/invalid-email`?`Ungültige E-Mail-Adresse.`:`Fehler: `+e.message),n&&(n.disabled=!1,n.textContent=`Passwort vergessen?`)}}function ut(e){return{"auth/user-not-found":`Kein Account mit dieser E-Mail gefunden.`,"auth/wrong-password":`Falsches Passwort.`,"auth/email-already-in-use":`Diese E-Mail wird bereits verwendet.`,"auth/weak-password":`Passwort muss mindestens 6 Zeichen haben.`,"auth/invalid-email":`Ungültige E-Mail-Adresse.`,"auth/too-many-requests":`Zu viele Versuche. Bitte warte kurz.`,"auth/popup-closed-by-user":`Anmeldung abgebrochen.`,"auth/invalid-credential":`E-Mail oder Passwort falsch.`}[e]||`Fehler: `+e}async function dt(e,t,n){ce(),O({tasks:[],boardPosts:{},meals:{},mealRecipes:{}});let r=localStorage.getItem(`fp_joined_via_link`)===`1`,i=E.currentAuthUser;if(!r&&i)try{let e=i.uid,t=await(await N(`${T}/users/${e}/family.json`)).json();if(t&&t.familyId){let e=E.familyId;O({familyId:t.familyId,familyName:t.familyName||``}),localStorage.setItem(`fp_family_id`,t.familyId),localStorage.setItem(`fp_family_name`,t.familyName||``),e&&e!==t.familyId&&(se(),O({tasks:[],boardPosts:{},meals:{},mealRecipes:{}}))}else{let t=localStorage.getItem(`fp_family_id`)||``,n=localStorage.getItem(`fp_family_name`)||``;if(t){console.warn(`proceedAfterAuth: Firebase familyId leer, repariere aus localStorage:`,t),O({familyId:t,familyName:n});try{await N(`${T}/users/${e}/family.json`,{method:`PUT`,body:JSON.stringify({familyId:t,familyName:n,updatedAt:Date.now()})})}catch(e){console.warn(`proceedAfterAuth: Firebase-Reparatur fehlgeschlagen:`,e.message)}}else O({familyId:``,familyName:``}),localStorage.removeItem(`fp_family_id`),localStorage.removeItem(`fp_family_name`),se(),O({tasks:[],boardPosts:{},meals:{},mealRecipes:{}})}}catch(e){console.warn(`Could not load family from profile, using cache:`,e),O({familyId:localStorage.getItem(`fp_family_id`)||``,familyName:localStorage.getItem(`fp_family_name`)||``})}else r||O({familyId:localStorage.getItem(`fp_family_id`)||``,familyName:localStorage.getItem(`fp_family_name`)||``});r&&E.familyId&&i&&(localStorage.removeItem(`fp_joined_via_link`),await ft());try{await Promise.race([t(),new Promise(e=>setTimeout(e,3e3))])}catch{n(`free`)}let a=document.getElementById(`auth-screen`),o=document.getElementById(`family-screen`);a&&(a.style.transition=`opacity 0.3s`,a.style.opacity=`0`,setTimeout(()=>a.style.display=`none`,300)),o&&(o.style.display=`none`),E.familyId&&setTimeout(()=>I(()=>import(`./firebase-BULWIflD.js`).then(e=>(e.l(),e.s)).then(e=>e.ensureFamilyInIndex()),__vite__mapDeps([0,1,2,3])),2e3),e()}async function ft(){let{currentAuthUser:e,familyId:t,familyName:n}=E;if(!(!e||!t))try{await N(`${T}/users/${e.uid}/family.json`,{method:`PUT`,body:JSON.stringify({familyId:t,familyName:n,updatedAt:Date.now()})})}catch(e){console.warn(`Could not save family to profile:`,e)}}function pt(e){ce(),window._taskPollId&&(clearInterval(window._taskPollId),window._taskPollId=null),window._shopPollId&&(clearInterval(window._shopPollId),window._shopPollId=null),window._boardPollId&&(clearInterval(window._boardPollId),window._boardPollId=null),window._taskPoll=!1,window._shopPoll=!1,window._boardPoll=!1,E._reminderTimers.forEach(e=>clearTimeout(e)),O({_reminderTimers:[],tasks:[],boardPosts:{},meals:{},mealRecipes:{},shopItems:[],familyId:``,familyName:``,curUser:null,currentAuthUser:null,members:[],av:{},photos:{}}),[`fp_user`,`fp_demo_mode`,`fp_family_id`,`fp_family_name`,`fp_family_role`,`fp_joined_via_link`,`fp_board_seen`,`fp_trial_welcomed`,`fp_push_prompted`].forEach(e=>localStorage.removeItem(e)),se(),document.querySelectorAll(`.modal-overlay`).forEach(e=>e.remove()),[`family-screen`,`name-screen`,`push-page`,`demo-banner`].forEach(e=>{let t=document.getElementById(e);t&&(t.style.display=`none`)}),E.firebaseAuth?E.firebaseAuth.signOut().then(()=>{window.location.href=window.location.pathname}).catch(()=>{window.location.href=window.location.pathname}):window.location.href=window.location.pathname,e&&e()}async function mt(e,t,n){let r=document.getElementById(`del-confirm-btn`),i=document.getElementById(`del-err`);r&&(r.disabled=!0,r.textContent=`Wird gelöscht…`),i&&(i.textContent=``);try{let t=E.currentAuthUser;if(t?.providerData?.[0]?.providerId!==`google.com`){let e=document.getElementById(`del-password`)?.value;if(!e){i&&(i.textContent=`Bitte Passwort eingeben.`),r&&(r.disabled=!1,r.textContent=`Ja, Account unwiderruflich löschen`);return}let n=window.firebase.auth.EmailAuthProvider.credential(t.email,e);await t.reauthenticateWithCredential(n)}let n=t.uid;if(await t.getIdToken(!0),await N(`${T}/users/${n}.json`,{method:`DELETE`}),E.familyId&&E.curUser){await N(`${T}/families/${E.familyId}/members/${encodeURIComponent(E.curUser)}.json`,{method:`DELETE`});try{let e=await(await N(`${T}/families/${E.familyId}/members.json`)).json();(!e||Object.keys(e).length===0)&&await N(`${T}/families/${E.familyId}.json`,{method:`DELETE`})}catch{}}e(`Account erfolgreich gelöscht.`),await t.delete(),[`fp_family_id`,`fp_family_name`,`fp_user`,`fp_joined_via_link`,`fp_demo_mode`,`fp_install_shown`].forEach(e=>localStorage.removeItem(e)),se(),rt()}catch(e){console.error(`Delete account error:`,e);let t=`Fehler beim Löschen.`;e.code===`auth/wrong-password`&&(t=`Falsches Passwort.`),e.code===`auth/requires-recent-login`&&(t=`Bitte melde dich erneut an und versuche es nochmal.`),i&&(i.textContent=t),r&&(r.disabled=!1,r.textContent=`Ja, Account unwiderruflich löschen`)}}_(),D(),A(),oe(),F();function ht(e){if(E.memberColorMap[e])return E.memberColorMap[e];let t=new Set(Object.values(E.memberColorMap)),n=c.find(e=>!t.has(e))||c[E.members.length%c.length];return O({memberColorMap:{...E.memberColorMap,[e]:n}}),n}async function gt(e,t){let n=e=>{let t=Object.keys(e),n={},r={};t.forEach(t=>{n[t]=e[t].emoji||`🧑`,e[t].color&&(r[t]=e[t].color)}),t.forEach(e=>{r[e]||(r[e]=ht(e))}),O({members:t,av:n,memberColorMap:r})};try{let e=await k(`members`);if(e&&Object.keys(e).length>0)n(e),ae(`members`,e);else{let e=P(`members`);e&&Object.keys(e).length>0&&n(e),E.members.length===0&&setTimeout(()=>t(!0),600)}}catch{let e=P(`members`);e&&n(e)}e(),E.familyId&&setTimeout(()=>re(),1500)}async function _t(e,t,n=!1,r){if(!e||E.members.includes(e)||!n&&!await r(`member`))return;let{checkFreeLimit:i}=await I(async()=>{let{checkFreeLimit:e}=await import(`./premium-CFYIjuZK.js`).then(e=>(e.r(),e.c));return{checkFreeLimit:e}},__vite__mapDeps([4,1,2,3,0,5]));if(i(`members`,E.members.length))return;let a=ht(e);await M(`members/${e}`,{emoji:t,color:a,createdAt:Date.now()}),O({members:[...E.members,e],av:{...E.av,[e]:t},memberColorMap:{...E.memberColorMap,[e]:a}});let o=P(`members`)||{};o[e]={emoji:t,color:a},ae(`members`,o),ie()}async function vt(e,t,n,r){let i=E.memberColorMap[e]||ht(e);if(!t||t===e){await M(`members/${e}`,{emoji:n||E.av[e],color:i,createdAt:Date.now()}),O({av:{...E.av,[e]:n||E.av[e]}});let t=P(`members`)||{};t[e]={emoji:E.av[e],color:i},ae(`members`,t),r();return}await M(`members/${t}`,{emoji:n||E.av[e],color:i,createdAt:Date.now()}),await j(`members/${e}`);let a={...E.av,[t]:n||E.av[e]},o={...E.memberColorMap,[t]:i};delete a[e],delete o[e];let s=E.curUser;if(s===e){s=t;try{localStorage.setItem(`fp_user`,t)}catch{}}O({members:E.members.map(n=>n===e?t:n),av:a,memberColorMap:o,curUser:s});let c=P(`members`)||{};c[t]={emoji:a[t],color:i},delete c[e],ae(`members`,c),r(),ie()}async function yt(e,t){await j(`members/${e}`);let n={...E.av},r={...E.memberColorMap};delete n[e],delete r[e];let i=E.curUser;if(i===e){i=``;try{localStorage.removeItem(`fp_user`)}catch{}}O({members:E.members.filter(t=>t!==e),av:n,memberColorMap:r,curUser:i});let a=P(`members`)||{};delete a[e],ae(`members`,a),t(),ie()}async function bt(){try{let e=await(await N(`${T}/families/${E.familyId}/memberPhotos.json`)).json();e&&O({photos:e})}catch{}}async function xt(e,t){try{await N(`${T}/families/${E.familyId}/memberPhotos/${e}.json`,{method:`PUT`,body:JSON.stringify(t)})}catch(e){console.error(`savePhoto`,e)}}async function St(e,t,n,r){let i=e.files[0];if(!i)return;let a=new FileReader;a.onload=async e=>{let i=new Image;i.onload=async()=>{let e=document.createElement(`canvas`),a=i.width,o=i.height;a>o?a>200&&(o=Math.round(o*200/a),a=200):o>200&&(a=Math.round(a*200/o),o=200),e.width=a,e.height=o,e.getContext(`2d`).drawImage(i,0,0,a,o);let s=e.toDataURL(`image/jpeg`,.7),c=document.getElementById(`photo-preview`);c&&(c.innerHTML=`<img src="${s}" style="width:100%;height:100%;object-fit:cover">`),await xt(t,s),O({photos:{...E.photos,[t]:s}}),r(),n(`📷 Foto gespeichert`)},i.src=e.target.result},a.readAsDataURL(i)}function Ct(e,t,n,r,i,a){let o=s[E.members.length%s.length]||`👤`;E._newMemberEmoji=o;let c=s.map(e=>`<button class="emoji-btn${o===e?` sel`:``}"
      onclick="window._app.setNewMemberEmoji('${e}');
               document.querySelectorAll('#member-emoji-grid .emoji-btn').forEach(b=>b.classList.remove('sel'));
               this.classList.add('sel')">${e}</button>`).join(``);t(`
    <div class="modal-handle"></div>
    <div class="modal-title">${e?`👋 Erstes Profil`:`➕ Profil hinzufügen`}</div>
    <div class="modal-sub">${e?`Lege das erste Familienprofil an`:`Wer soll noch hinzugefügt werden?`}</div>
    <div class="form-group"><label class="form-lbl">Name</label>
    <input class="form-input" id="new-member-name" placeholder="z.B. Mama, Papa, Lena…" maxlength="20"/></div>
    <div class="form-group"><label class="form-lbl">Emoji</label>
    <div class="emoji-grid" id="member-emoji-grid">${c}</div></div>
    <button class="submit-btn" onclick="window._app.confirmAddMember(${e})">Profil erstellen ✓</button>
    ${e?``:`<button class="modal-close" onclick="window._app.closeModal();window._app.showUserModal()">Abbrechen</button>`}
  `),setTimeout(()=>document.getElementById(`new-member-name`)?.focus(),350)}function wt(e,t){let n=E.av[e]||`🧑`,r=E.photos[e]||``,i=f(e),a=C(e),o=s.map(e=>`<button class="emoji-btn${n===e?` sel`:``}"
      onclick="document.getElementById('edit-emoji-val').value='${e}';
               document.querySelectorAll('#edit-emoji-grid .emoji-btn').forEach(b=>b.classList.remove('sel'));
               this.classList.add('sel')">${e}</button>`).join(``);t(`
    <div class="modal-handle"></div>
    <div class="modal-title">Profil bearbeiten</div>
    <div class="modal-sub">${n} ${i}</div>
    <input type="hidden" id="edit-emoji-val" value="${n}"/>
    <div class="form-group"><label class="form-lbl">Name</label>
    <input class="form-input" id="edit-member-name" value="${i}" maxlength="20"/></div>
    <div class="form-group">
      <label class="form-lbl">Profilfoto</label>
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
        <div id="photo-preview" style="width:52px;height:52px;border-radius:50%;background:#F5F6FA;border:2px solid #ECEEF2;overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:24px">
          ${r?`<img src="${r}" style="width:100%;height:100%;object-fit:cover">`:n}
        </div>
        <div style="flex:1">
          <button type="button" onclick="document.getElementById('photo-input').click()"
            style="width:100%;padding:10px;border:1.5px dashed #5C4EE5;border-radius:10px;background:#EEF2FF;color:#5C4EE5;font-weight:600;font-size:13px;cursor:pointer;font-family:inherit">
            📷 Foto auswählen
          </button>
          ${r?`<button type="button"
            onclick="window._app.removePhoto('${a}')"
            style="width:100%;margin-top:4px;padding:6px;border:none;border-radius:8px;background:#FEF2F2;color:#DC2626;font-size:12px;cursor:pointer;font-family:inherit">
            × Foto entfernen
          </button>`:``}
        </div>
      </div>
      <input type="file" id="photo-input" accept="image/*" style="display:none"
        onchange="window._app.handlePhotoUpload(this,'${a}')">
    </div>
    <div class="form-group"><label class="form-lbl">Emoji (wird ohne Foto gezeigt)</label>
    <div class="emoji-grid" id="edit-emoji-grid">${o}</div></div>
    <button class="submit-btn" onclick="
      const nn=document.getElementById('edit-member-name').value.trim();
      const ne=document.getElementById('edit-emoji-val').value;
      if(nn)window._app.renameMember('${a}',nn,ne)
        .then(()=>{window._app.closeModal();window._app.showSync('✓ Gespeichert');window._app.showUserModal();});
    ">Speichern ✓</button>
    <button style="width:100%;margin-top:8px;padding:13px;border:none;border-radius:10px;background:#FEF2F2;color:#DC2626;font-weight:600;font-size:14px;cursor:pointer;font-family:inherit"
      onclick="if(confirm('Profil ${a} wirklich löschen?')){window._app.deleteMember('${a}');window._app.closeModal();window._app.showSync('✓ Gelöscht');}">
      🗑 Profil löschen
    </button>
    <button class="modal-close" onclick="window._app.closeModal();window._app.showUserModal()">Abbrechen</button>
  `)}var Tt=e({copyMealWeekFromPrev:()=>Pt,copyMealWeekToNext:()=>Nt,deleteMeal:()=>jt,deleteMealRecipe:()=>kt,getMealWeekDays:()=>Mt,loadMeals:()=>Et,mealIngredientsToShop:()=>Rt,parseIngredient:()=>Ft,saveMeal:()=>At,saveMealRecipe:()=>Dt,saveRecipeSteps:()=>Ot,toggleOptionalIngredient:()=>Lt});async function Et(e){if(!(!E.familyId||localStorage.getItem(`fp_demo_mode`)===`1`))try{let[t,n]=await Promise.all([k(`meals`),k(`mealRecipes`)]);O({meals:t||{},mealRecipes:n||{}}),e()}catch(e){console.warn(`loadMeals error (meals preserved):`,e.message)}}async function Dt(e,t,n){if(!e.trim()||!E.familyId)return;let r=e.trim().toLowerCase().replace(/[^a-z0-9äöüß]/g,`_`).slice(0,40),i=E.mealRecipes[r],a=i?.useCount??+!!i,o={name:e.trim(),ingredients:t||[],optionalIngredients:n||[],usedAt:Date.now(),useCount:a+1,...i?.steps?{steps:i.steps}:{},...i?.prepTime?{prepTime:i.prepTime}:{},...i?.servings?{servings:i.servings}:{}};O({mealRecipes:{...E.mealRecipes,[r]:o}});try{await M(`mealRecipes/${r}`,o)}catch{}}async function Ot(e,t,n,r){if(!E.familyId||!e)return;let i=E.mealRecipes[e];if(!i)return;let a={...i,steps:t||[],prepTime:n||0,servings:r||4};O({mealRecipes:{...E.mealRecipes,[e]:a}});try{await M(`mealRecipes/${e}`,a)}catch{}}async function kt(e,t,n){if(!E.familyId)return;let r={...E.mealRecipes};delete r[e],O({mealRecipes:r});try{await j(`mealRecipes/${e}`),n&&n(`✓ Rezept gelöscht`)}catch{n&&n(`Fehler beim Löschen`)}t&&t()}async function At(e,t,n,r,i,a,o,s,c){if(!E.familyId)return;let l=E.meals[e]?.[t]||{},u={...l,name:n.trim(),emoji:r||l.emoji||`🍽️`,ingredients:i||[],optionalIngredients:s||[],selectedOptionals:c||[],savedAt:Date.now()},d={...E.meals};d[e]||(d[e]={}),d[e][t]=u,O({meals:d}),a();try{await M(`meals/${e}/${t}`,u),i&&i.length&&await Dt(n,i,s),o(`✓ Mahlzeit gespeichert`)}catch(e){console.error(`saveMeal Firebase error:`,e.message,`| familyId:`,E.familyId,`| hasUser:`,!!E.currentAuthUser),o(`Fehler beim Speichern: `+e.message.slice(0,60))}}async function jt(e,t,n,r){if(!E.familyId)return;let i={...E.meals};if(!i[e])return;let a=`${e}_${t}`,o=E.shopItems.filter(e=>e.mealRef===a&&!e.checked);for(let e of o)if(e.mealQty!=null){let t=parseFloat(String(e.qty))||0,n=parseFloat(String(e.mealQty))||0,r=Math.round((t-n)*10)/10;if(r<=0){try{await j(`shopping/items/${e.id}`)}catch{}O({shopItems:E.shopItems.filter(t=>t.id!==e.id)})}else{let{id:t,...n}=e,i={...n,qty:r,mealRef:void 0,mealQty:void 0,mealUnit:void 0};try{await M(`shopping/items/${e.id}`,i)}catch{}O({shopItems:E.shopItems.map(t=>t.id===e.id?{id:e.id,...i}:t)})}}else{try{await j(`shopping/items/${e.id}`)}catch{}O({shopItems:E.shopItems.filter(t=>t.id!==e.id)})}delete i[e][t],Object.keys(i[e]).length===0&&delete i[e],O({meals:i}),r();try{await j(`meals/${e}/${t}`)}catch{}}function Mt(){let e=new Date,t=new Date(e),n=e.getDay()===0?6:e.getDay()-1;return t.setDate(e.getDate()-n+E.mealWeekOffset*7),Array.from({length:7},(e,n)=>{let r=new Date(t);return r.setDate(t.getDate()+n),r.toISOString().split(`T`)[0]})}async function Nt(e,t){let n=Mt(),r=n.map(e=>{let t=new Date(e+`T12:00:00`);return t.setDate(t.getDate()+7),t.toISOString().split(`T`)[0]}),i=0,a={...E.meals};for(let e=0;e<7;e++){let t=E.meals[n[e]];if(t)for(let[n,o]of Object.entries(t))try{await M(`meals/${r[e]}/${n}`,{...o,savedAt:Date.now()}),a[r[e]]||(a[r[e]]={}),a[r[e]][n]=o,i++}catch{}}O({meals:a}),e(`✓ ${i} Mahlzeiten kopiert`),t()}async function Pt(e,t){let n=Mt(),r=n.map(e=>{let t=new Date(e+`T12:00:00`);return t.setDate(t.getDate()-7),t.toISOString().split(`T`)[0]});if(!r.some(e=>{let t=E.meals[e];return t&&Object.values(t).some(e=>e?.name)})){e(`⚠️ Vorwoche hat keine Mahlzeiten`);return}let i=0,a={...E.meals};for(let e=0;e<7;e++){let t=E.meals[r[e]];if(t)for(let[r,o]of Object.entries(t)){let{addedToShop:t,...s}=o;try{await M(`meals/${n[e]}/${r}`,{...s,savedAt:Date.now()}),a[n[e]]||(a[n[e]]={}),a[n[e]][r]=s,i++}catch{}}}O({meals:a}),e(`✓ ${i} Mahlzeiten aus Vorwoche übernommen`),t()}function Ft(e){let t=e.trim(),n=t.match(/^([0-9]+[.,]?[0-9]*)\s*(g|kg|ml|l|L|cl|Stück|Stk|Pck|Pckg|EL|TL|Tasse|Becher|Dose|Fla|Kst|Bund|Zehe|Scheibe|Scheiben|cm)?\s*(.+)$/i);if(n){let e=parseFloat(n[1].replace(`,`,`.`)),r=(n[2]||``).trim(),i=(n[3]||``).trim();return{qty:isNaN(e)?1:e,unit:r,name:i||t}}return{qty:1,unit:``,name:t}}function It(e,t,n,r){let i=(t||``).toLowerCase(),a=(r||``).toLowerCase();if(i===a||i===``||a===``){let t=(parseFloat(String(e))||0)+(parseFloat(String(n))||0);return{qty:Number.isInteger(t)?t:Math.round(t*10)/10,unit:i||a}}return{qty:n,unit:r}}async function Lt(e,t,n,r,i){let a=E.meals[e]?.[t];if(!a)return;let{shopItems:o,activeShopList:s,curUser:c}=E,{shopRecallCategory:l}=await I(async()=>{let{shopRecallCategory:e}=await import(`./shopping-jp0CsUb_.js`).then(e=>(e.n(),e.p));return{shopRecallCategory:e}},__vite__mapDeps([6,1,2,3,0,7,5])),u=n.toLowerCase().trim(),d=s||`Wocheneinkauf`,f=`${e}_${t}`,p=o.find(e=>e.name.toLowerCase().trim()===u&&e.list===d&&!e.checked&&e.mealRef===f+`_opt`);if(p){try{await j(`shopping/items/${p.id}`)}catch{}O({shopItems:E.shopItems.filter(e=>e.id!==p.id)});let r=(a.addedOptionals?Array.isArray(a.addedOptionals)?a.addedOptionals:Object.values(a.addedOptionals):[]).filter(e=>e!==n),o={...E.meals};o[e][t]={...a,addedOptionals:r},O({meals:o});try{await M(`meals/${e}/${t}/addedOptionals`,r)}catch{}i(`✓ Aus Einkaufsliste entfernt`)}else{let r=Ft(n),o=new Uint8Array(4);crypto.getRandomValues(o);let s=`shop_`+Array.from(o).map(e=>e.toString(16).padStart(2,`0`)).join(``),u={name:r.name,emoji:`🛒`,qty:r.qty,unit:r.unit,category:l(r.name)||`sonstiges`,checked:!1,fav:!1,addedBy:c||``,addedAt:Date.now(),list:d,mealRef:f+`_opt`};O({shopItems:[...E.shopItems,{id:s,...u}]});try{await M(`shopping/items/${s}`,u)}catch{}let p=[...a.addedOptionals?Array.isArray(a.addedOptionals)?a.addedOptionals:Object.values(a.addedOptionals):[],n],m={...E.meals};m[e][t]={...a,addedOptionals:p},O({meals:m});try{await M(`meals/${e}/${t}/addedOptionals`,p)}catch{}i(`✓ Zur Einkaufsliste hinzugefügt`)}r()}async function Rt(e,t,n,r,i,a){let o=E.meals[e]?.[t];if(!o?.ingredients?.length){n(`Keine Zutaten vorhanden`);return}if(o.addedToShop){n(`Bereits zur Einkaufsliste hinzugefügt`);return}if(a===void 0){let n=o.name?.toLowerCase().replace(/[^a-z0-9äöüß]/g,`_`).slice(0,40),r=n?E.mealRecipes?.[n]:null;if(r?.servings)return{needsScaling:!0,defaultServings:r.servings,iso:e,type:t};a=1}let{shopItems:s,activeShopList:c,curUser:l}=E,{fbSet:u}=await I(async()=>{let{fbSet:e}=await import(`./firebase-BULWIflD.js`).then(e=>(e.l(),e.s));return{fbSet:e}},__vite__mapDeps([0,1,2,3])),{shopRecallCategory:d}=await I(async()=>{let{shopRecallCategory:e}=await import(`./shopping-jp0CsUb_.js`).then(e=>(e.n(),e.p));return{shopRecallCategory:e}},__vite__mapDeps([6,1,2,3,0,7,5])),f=o.selectedOptionals?Array.isArray(o.selectedOptionals)?o.selectedOptionals:Object.values(o.selectedOptionals):[],p=[...o.ingredients||[],...f],m=0,h=0;for(let n of p){if(!n.trim())continue;let r=Ft(n);a&&a!==1&&r.qty&&r.qty>0&&(r.qty=Math.round(r.qty*a*10)/10);let i=r.name.toLowerCase().trim(),o=c||`Wocheneinkauf`,f=s.find(e=>e.name.toLowerCase().trim()===i&&e.list===o&&!e.checked);if(f){let{qty:n,unit:i}=It(f.qty,f.unit,r.qty,r.unit),a=f.mealRef||`${e}_${t}`,o={name:f.name,emoji:f.emoji||`🛒`,qty:n,unit:i,category:f.category||d(f.name)||`sonstiges`,checked:!1,fav:f.fav||!1,addedBy:f.addedBy||l||``,addedAt:f.addedAt||Date.now(),list:f.list,mealRef:a,mealQty:r.qty,mealUnit:r.unit||i};try{await u(`shopping/items/${f.id}`,o)}catch{}O({shopItems:s.map(e=>e.id===f.id?{id:f.id,...o}:e)}),h++}else{let n=new Uint8Array(4);crypto.getRandomValues(n);let i=`shop_`+Array.from(n).map(e=>e.toString(16).padStart(2,`0`)).join(``),a={name:r.name,emoji:`🛒`,qty:r.qty,unit:r.unit,category:d(r.name)||`sonstiges`,checked:!1,fav:!1,addedBy:l||``,addedAt:Date.now(),list:o,mealRef:`${e}_${t}`};O({shopItems:[...E.shopItems,{id:i,...a}]});try{await u(`shopping/items/${i}`,a)}catch{}m++}}let g=Date.now(),_={...E.meals};_[e]||(_[e]={}),_[e][t]||(_[e][t]={}),_[e][t]={..._[e][t],addedToShop:g},O({meals:_});try{let{fbSet:n}=await I(async()=>{let{fbSet:e}=await import(`./firebase-BULWIflD.js`).then(e=>(e.l(),e.s));return{fbSet:e}},__vite__mapDeps([0,1,2,3]));await n(`meals/${e}/${t}/addedToShop`,g)}catch{}let v=[];m>0&&v.push(`${m} neu hinzugefügt`),h>0&&v.push(`${h} Menge${h===1?``:`n`} aktualisiert`),n(v.join(`, `)),r(),i(`shop`)}var zt=n((()=>{D(),A(),w(),F()}));function Bt(e,t=!1){let n=`fp_tour_`+e;if(!t&&localStorage.getItem(n)||localStorage.getItem(`fp_demo_mode`))return;localStorage.setItem(n,`1`);let r=Zt[e];r&&setTimeout(()=>Vt(r,e),600)}function Vt(e,t){if(Qt)return;Qt=!0;let n=0;function r(e){let t=document.getElementById(e);return t?t.getBoundingClientRect():null}let i=document.createElement(`div`);i.id=`tour-container`,i.style.cssText=`position:fixed;inset:0;z-index:1000;pointer-events:none;will-change:transform`;let a=document.createElement(`canvas`);a.style.cssText=`position:absolute;inset:0;pointer-events:all;`,a.onclick=e=>{e.target===a&&window._app._tourSkip()},i.appendChild(a);let o=document.createElement(`div`);o.style.cssText=`position:absolute;left:50%;width:min(320px,calc(100vw - 32px));pointer-events:all;transition:top 0.35s cubic-bezier(0.32,0.72,0,1),bottom 0.35s cubic-bezier(0.32,0.72,0,1),opacity 0.25s ease;will-change:transform,opacity`,i.appendChild(o),document.body.appendChild(i);let s=null,c=0,l=0,u=0,d=0,f=0,p=0,m=0,h=0;function g(e,t,n){return e+(t-e)*n}function _(){let e=window.innerWidth,t=window.innerHeight;a.width=e,a.height=t;let n=a.getContext(`2d`);n.clearRect(0,0,e,t),n.fillStyle=`rgba(10,8,30,0.78)`,n.fillRect(0,0,e,t);let r=Math.min(u,d)*.18;n.save(),n.globalCompositeOperation=`destination-out`,n.beginPath(),n.moveTo(c-u+r,l-d),n.arcTo(c+u,l-d,c+u,l+d,r),n.arcTo(c+u,l+d,c-u,l+d,r),n.arcTo(c-u,l+d,c-u,l-d,r),n.arcTo(c-u,l-d,c+u,l-d,r),n.closePath(),n.fill(),n.restore(),n.save(),n.strokeStyle=`rgba(255,255,255,0.55)`,n.lineWidth=2,n.setLineDash([6,3]),n.lineDashOffset=-(Date.now()/40%18),n.beginPath(),n.moveTo(c-u+r,l-d),n.arcTo(c+u,l-d,c+u,l+d,r),n.arcTo(c+u,l+d,c-u,l+d,r),n.arcTo(c-u,l+d,c-u,l-d,r),n.arcTo(c-u,l-d,c+u,l-d,r),n.closePath(),n.stroke(),n.restore()}function v(){s&&cancelAnimationFrame(s);let e=.12;function t(){c=g(c,f,e),l=g(l,p,e),u=g(u,m,e),d=g(d,h,e),_();let n=Math.abs(c-f),r=Math.abs(l-p);if(n>.5||r>.5||Math.abs(u-m)>.5)s=requestAnimationFrame(t);else{c=f,l=p,u=m,d=h,_();function e(){_(),s=requestAnimationFrame(e)}s=requestAnimationFrame(e)}}s=requestAnimationFrame(t)}function y(){if(n>=e.length){b();return}let t=e[n],i=r(t.target),a=window.innerWidth,s=window.innerHeight;i?(f=i.left+i.width/2,p=i.top+i.height/2,m=i.width/2+12,h=i.height/2+12):(f=a/2,p=s/2,m=70,h=40),n===0&&(c=f,l=p,u=m,d=h),v();let g=p>s*.55;o.style.transform=`translateX(-50%)`,o.style.opacity=`0`,g?(o.style.bottom=s-(p-h-14)+`px`,o.style.top=`auto`):(o.style.top=p+h+14+`px`,o.style.bottom=`auto`),o.innerHTML=`
      <div style="background:var(--surface);border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.4);transform:translateY(8px);transition:transform 0.35s cubic-bezier(0.32,0.72,0,1)">
        <div style="background:linear-gradient(135deg,#5C4EE5,#764ba2);padding:14px 18px 12px;position:relative;overflow:hidden">
          <div style="position:absolute;top:-15px;right:-15px;width:70px;height:70px;background:rgba(255,255,255,0.08);border-radius:50%"></div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px">
            <div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.55);text-transform:uppercase;letter-spacing:0.8px">Schritt ${n+1} von ${e.length}</div>
            <button onclick="window._app._tourSkip()" style="background:rgba(255,255,255,0.15);border:none;color:rgba(255,255,255,0.7);font-size:11px;font-weight:600;padding:3px 8px;border-radius:6px;cursor:pointer;font-family:inherit">Überspringen</button>
          </div>
          <div style="font-size:15px;font-weight:800;color:white;letter-spacing:-0.3px">${t.title}</div>
        </div>
        <div style="padding:13px 18px 15px">
          <div style="font-size:13px;color:#4b5563;line-height:1.65;margin-bottom:13px">${t.text}</div>
          <div style="display:flex;gap:8px;align-items:center">
            ${n>0?`<button onclick="window._app._tourPrev()" style="padding:10px 16px;background:#F5F3FF;color:#5C4EE5;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">‹</button>`:``}
            <button onclick="window._app._tourNext()" style="flex:1;padding:10px;background:#5C4EE5;color:white;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">${n<e.length-1?`Weiter →`:`Fertig ✓`}</button>
          </div>
          <div style="display:flex;justify-content:center;gap:6px;margin-top:11px">
            ${e.map((e,t)=>`<div style="width:${t===n?`18px`:`6px`};height:6px;border-radius:3px;background:${t===n?`#5C4EE5`:`#e5e7eb`};transition:all 0.3s"></div>`).join(``)}
          </div>
        </div>
      </div>`,requestAnimationFrame(()=>{o.style.opacity=`1`;let e=o.querySelector(`div`);e&&requestAnimationFrame(()=>{e.style.transform=`translateY(0)`})})}function b(){Qt=!1,s&&cancelAnimationFrame(s),document.getElementById(`tour-container`)?.remove(),delete window._app._tourNext,delete window._app._tourPrev,delete window._app._tourSkip}window._app._tourNext=()=>{n++,y()},window._app._tourPrev=()=>{n=Math.max(0,n-1),y()},window._app._tourSkip=()=>{b()},y()}function Ht(e){let t=Zt[e];t&&Vt(t,e)}function Ut(e){O({tab:e});let t=document.getElementById(`scroll-area`);t&&(t.className=e===`cal`?`tab-cal`:``),Xt(),Bt(e),e===`overview`&&Ge()}function Wt(e,t){O({selDay:e,selISO:t,todayView:`mine`,tab:`today`}),Xt()}function Gt(){[`today`,`cal`,`overview`,`shop`,`meals`].forEach(e=>{let t=document.getElementById(`nav-`+e);t&&(t.className=`nav-btn`+(E.tab===e?` active`:``))}),qe();let e=document.getElementById(`header-title`),t=document.getElementById(`header-subtitle`),n=document.getElementById(`day-scroll`),r=document.getElementById(`shop-list-tabs`),i=document.getElementById(`shop-clear-btn`);E.tab===`shop`?(e&&(e.innerHTML=Kt()),i&&(i.style.display=`block`),n&&(n.style.display=`none`),r&&(r.style.display=`flex`,r.innerHTML=E.shopLists.map((e,t)=>`
        <div style="display:flex;align-items:center;flex-shrink:0">
          <button class="list-tab${E.activeShopList===e?` active`:``}" onclick="window._app.shopSetListByIndex(${t})">${f(e)}</button>
          ${E.shopLists.length>1?`<button onclick="window._app.shopDeleteListByIndex(${t})" style="background:none;border:none;color:rgba(255,255,255,0.35);font-size:13px;cursor:pointer;padding:0 6px 0 0;line-height:1;flex-shrink:0" title="Liste löschen">✕</button>`:``}
        </div>`).join(``)+`<button class="list-tab-add" onclick="window._app.shopPromptAddList()">＋</button>`)):E.tab===`meals`||E.tab===`overview`?(e&&(e.innerHTML=Kt()),i&&(i.style.display=`none`),n&&(n.style.display=`none`),r&&(r.style.display=`none`)):(e&&(e.innerHTML=Kt()),t&&(t.textContent=`Live-Sync aktiv 🟢`),i&&(i.style.display=`none`),n&&(n.style.display=E.tab===`cal`?`none`:`flex`),r&&(r.style.display=`none`),qt())}function Kt(){return`<svg width="105" height="32" viewBox="0 0 105 32" role="img" style="display:inline-block;vertical-align:middle">
    <title>famiplan</title>
    <g transform="translate(14,14)">
      <line x1="-42" y1="-30" x2="10" y2="-44" stroke="#fff" stroke-width="1.8" stroke-linecap="round" transform="scale(0.29)"/>
      <line x1="10" y1="-44" x2="44" y2="8" stroke="#fff" stroke-width="1.8" stroke-linecap="round" transform="scale(0.29)"/>
      <line x1="44" y1="8" x2="-8" y2="38" stroke="rgba(255,255,255,0.7)" stroke-width="1.8" stroke-linecap="round" transform="scale(0.29)"/>
      <line x1="-8" y1="38" x2="-38" y2="12" stroke="rgba(255,255,255,0.7)" stroke-width="1.8" stroke-linecap="round" transform="scale(0.29)"/>
      <line x1="-42" y1="-30" x2="-8" y2="38" stroke="rgba(255,255,255,0.7)" stroke-width="1.8" stroke-linecap="round" transform="scale(0.29)"/>
      <line x1="10" y1="-44" x2="-38" y2="12" stroke="#fff" stroke-width="1.8" stroke-linecap="round" transform="scale(0.29)"/>
      <circle cx="-42" cy="-30" r="7" fill="rgba(255,255,255,0.85)" transform="scale(0.29)"/>
      <circle cx="10" cy="-44" r="10" fill="white" transform="scale(0.29)"/>
      <circle cx="44" cy="8" r="7" fill="rgba(255,255,255,0.85)" transform="scale(0.29)"/>
      <circle cx="-8" cy="38" r="6" fill="rgba(255,255,255,0.8)" transform="scale(0.29)"/>
      <circle cx="-38" cy="12" r="9" fill="white" transform="scale(0.29)"/>
    </g>
    <text x="34" y="22" font-family="-apple-system,BlinkMacSystemFont,SF Pro Rounded,Segoe UI,sans-serif" font-size="17" font-weight="700" fill="white" letter-spacing="-0.3">fami</text>
    <text x="70" y="22" font-family="-apple-system,BlinkMacSystemFont,SF Pro Rounded,Segoe UI,sans-serif" font-size="17" font-weight="700" fill="rgba(255,255,255,0.7)" letter-spacing="-0.3">plan</text>
  </svg>`}function qt(){let e=document.getElementById(`day-scroll`);if(!e)return;let t=x(),n=Array.from({length:7},(e,n)=>{let r=new Date(E.selISO+`T12:00:00`);r.setDate(r.getDate()-3+n);let i=x(r),a=d[m(r.getDay())],o=r.getDate();return`<button class="day-pill${i===E.selISO?` active`:``}${i===t?` today`:``}"
      onclick="window._app.setDay('${a}','${i}')">
      <span class="dp-name">${a.slice(0,2)}</span>
      <span class="dp-num">${o}</span>
    </button>`}),r=E.selISO===t?``:`<button class="heute-btn" onclick="window._app.setDay('${d[m(new Date().getDay())]}','${t}')">↩ Heute</button>`;e.innerHTML=n.join(``)+r,requestAnimationFrame(()=>{let t=e.querySelector(`.day-pill.active`);t&&t.scrollIntoView({inline:`center`,behavior:`smooth`})})}function Jt(){let e=document.getElementById(`shell`);if(!e||e._swipeReady)return;e._swipeReady=!0;let t=0,n=0;e.addEventListener(`touchstart`,e=>{t=e.touches[0].clientX,n=e.touches[0].clientY},{passive:!0}),e.addEventListener(`touchend`,e=>{let r=e.changedTouches[0].clientX-t,i=e.changedTouches[0].clientY-n;if(!(Math.abs(r)<60||Math.abs(r)<Math.abs(i)*1.2))if(E.tab===`today`){let e=new Date(E.selISO+`T12:00:00`);e.setDate(e.getDate()+(r<0?1:-1)),O({selDay:d[m(e.getDay())],selISO:x(e),todayView:`mine`}),Xt()}else if(E.tab===`cal`){if(E.calSelISO){let e=new Date(E.calSelISO+`T12:00:00`);e.setDate(e.getDate()+(r<0?1:-1)),O({calSelISO:x(e),calMonth:e.getMonth(),calYear:e.getFullYear()})}else{let{calMonth:e,calYear:t}=E;e+=r<0?1:-1,e>11&&(e=0,t++),e<0&&(e=11,t--),O({calMonth:e,calYear:t})}Xt()}else E.tab===`meals`&&(O({mealWeekOffset:E.mealWeekOffset+(r<0?1:-1)}),Xt())},{passive:!0})}function Yt(){if(!window.visualViewport)return;let e=null;function t(){e&&cancelAnimationFrame(e),e=requestAnimationFrame(()=>{let e=document.getElementById(`bottom-nav`);if(!e)return;let t=document.getElementById(`fab`),n=window.visualViewport,r=n.offsetTop||0,i=Math.max(0,window.innerHeight-n.height-r);e.style.bottom=i>50?i+`px`:``,t&&(t.style.bottom=i>50?i+80+`px`:``)})}window.visualViewport.addEventListener(`resize`,t),window.visualViewport.addEventListener(`scroll`,t),document.addEventListener(`focusout`,()=>{setTimeout(()=>{e&&cancelAnimationFrame(e),e=requestAnimationFrame(()=>{let e=document.getElementById(`bottom-nav`);e&&(e.style.bottom=``);let t=document.getElementById(`fab`);t&&(t.style.bottom=``)})},100)})}function Xt(){window._app?.renderContent()}var Zt,Qt,$t=n((()=>{_(),D(),w(),We(),Zt={today:[{target:`day-scroll`,title:`Tage wechseln`,text:`Tippe auf einen Tag-Chip um zu springen, oder wische auf der Seite links/rechts um zum nächsten oder vorherigen Tag zu wechseln.`,pos:`bottom`},{target:`scroll-area`,title:`Aufgaben abhaken`,text:`Tippe den Kreis-Button links an einer Aufgabe um sie direkt als erledigt zu markieren – kein Modal nötig. Aufgaben sind nach Tageszeit gruppiert: Morgen, Nachmittag und Abend.`,pos:`bottom`},{target:`fab`,title:`Hinzufügen`,text:`Tippe hier um eine neue Aufgabe, einen Termin oder ein To-Do anzulegen. Mit dem ⏱-Button oben wechselst du zur Timeline-Ansicht für den Tag.`,pos:`top`},{target:`user-btn`,title:`Dein Profil`,text:`Hier siehst du wer du bist. Tippe zum Wechseln – jedes Familienmitglied nutzt die App mit eigenem Profil.`,pos:`bottom`}],cal:[{target:`nav-cal`,title:`Kalender`,text:`Wechsle zwischen Monat, Woche und 7-Tage-Ansicht. Im Monat wische links/rechts für den nächsten Monat. Mit ＋/− zoomst du für mehr Details – bis zu 3 Zoomstufen.`,pos:`top`},{target:`scroll-area`,title:`Termine & Aufgaben`,text:`Tippe auf einen Tag um die Timeline zu öffnen und direkt zum Termin zu scrollen. Langer Druck auf einen freien Tag öffnet sofort das "Neuer Termin"-Formular mit vorausgefülltem Datum.`,pos:`bottom`},{target:`fab`,title:`Termin erstellen`,text:`Tippe hier um einen neuen Termin für den ausgewählten Tag anzulegen. In der Timeline kannst du auch direkt auf eine Uhrzeit tippen.`,pos:`top`}],overview:[{target:`scroll-area`,title:`Dein Familientag`,text:`Der Banner zeigt den nächsten Termin mit Countdown. Darunter siehst du kommende Termine der nächsten Tage. Mit den vier Schnellzugriff-Chips oben fügst du direkt Aufgaben, Einkäufe, Termine oder Mahlzeiten hinzu.`,pos:`bottom`},{target:`nav-overview`,title:`Board & Beiträge`,text:`Weiter unten teilt eure Familie Fotos und Nachrichten. Reagiert mit Emojis auf Beiträge. Bilder werden vollbreit angezeigt – antippen zum Vergrößern.`,pos:`top`},{target:`fab`,title:`Beitrag teilen`,text:`Tippe hier um einen Text oder ein Foto mit deiner Familie zu teilen.`,pos:`top`}],shop:[{target:`nav-shop`,title:`Einkaufsliste`,text:`Legt gemeinsam Artikel an und hakt sie beim Einkaufen ab. Mehrere Listen sind möglich – z.B. Rewe und DM getrennt. Zutaten aus dem Mahlzeitenplan landen hier automatisch.`,pos:`top`},{target:`fab`,title:`Artikel hinzufügen`,text:`Die Eingabe schlägt automatisch bekannte Artikel vor – Favoriten erscheinen zuerst. Mit "Sofort" fügst du einen bekannten Artikel direkt hinzu ohne das Formular auszufüllen.`,pos:`top`}],meals:[{target:`nav-meals`,title:`Mahlzeitenplanung`,text:`Plant was ihr die Woche kocht. Tippe auf einen Slot um eine Mahlzeit einzutragen. Beim Tippen im Namensfeld schlägt die App gespeicherte Rezepte vor. Wische links/rechts um Wochen zu wechseln.`,pos:`top`},{target:`scroll-area`,title:`Rezepte & KI-Import`,text:`Mit "🍽️ Meine Rezepte" öffnest du deine Rezeptsammlung – inklusive Zutaten, Zubereitungsschritten und Vorbereitungszeit. Häufig gekochte Rezepte erscheinen als Schnell-Chips ganz oben. Mit "✨ KI-Import" importierst du Rezepte automatisch per KI (Plus-Feature).`,pos:`bottom`},{target:`scroll-area`,title:`Woche übertragen`,text:`Über dem Wochenplan siehst du den Planungsfortschritt und Buttons zum Übertragen: aktuelle Woche in die nächste Woche kopieren, oder die Vorwoche übernehmen. Bei bestehenden Plänen erscheint eine Warnmeldung.`,pos:`bottom`},{target:`fab`,title:`Einkaufsliste befüllen`,text:`Tippe den Warenkorb-Button an einer geplanten Mahlzeit um die Zutaten direkt auf die Einkaufsliste zu übertragen. Hat das Rezept eine Portionsangabe, kannst du die Menge vorher anpassen.`,pos:`top`}]},Qt=!1}));function en(){return localStorage.getItem(`fp_bundesland`)||`NW`}function tn(e){localStorage.setItem(`fp_bundesland`,e),localStorage.removeItem(`fp_ferien_cache`)}function nn(e){let t=e%19,n=Math.floor(e/100),r=e%100,i=Math.floor(n/4),a=n%4,o=Math.floor((n+8)/25),s=Math.floor((n-o+1)/3),c=(19*t+n-i-s+15)%30,l=Math.floor(r/4),u=r%4,d=(32+2*a+2*l-c-u)%7,f=Math.floor((t+11*c+22*d)/451),p=Math.floor((c+d-7*f+114)/31),m=(c+d-7*f+114)%31+1;return new Date(e,p-1,m)}function K(e,t){let n=new Date(e);return n.setDate(n.getDate()+t),n}function rn(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}`}function an(e,t){let n=nn(e),r={},i=(e,t)=>{r[rn(e)]=t};i(new Date(e,0,1),`Neujahr`),i(K(n,-2),`Karfreitag`),i(n,`Ostersonntag`),i(K(n,1),`Ostermontag`),i(new Date(e,4,1),`Tag der Arbeit`),i(K(n,39),`Christi Himmelfahrt`),i(K(n,49),`Pfingstsonntag`),i(K(n,50),`Pfingstmontag`),i(new Date(e,9,3),`Tag der Deutschen Einheit`),i(new Date(e,11,25),`1. Weihnachtstag`),i(new Date(e,11,26),`2. Weihnachtstag`);let a=(...e)=>e.includes(t);return a(`BW`,`BY`,`ST`)&&i(new Date(e,0,6),`Heilige Drei Könige`),a(`BW`,`BY`,`HE`,`NW`,`RP`,`SL`,`SN`,`ST`,`TH`)&&i(K(n,60),`Fronleichnam`),a(`BY`,`SL`)&&i(new Date(e,7,15),`Mariä Himmelfahrt`),a(`BB`,`MV`,`SN`,`ST`,`TH`)&&i(new Date(e,9,31),`Reformationstag`),a(`BW`,`BY`,`NW`,`RP`,`SL`)&&i(new Date(e,10,1),`Allerheiligen`),a(`SN`)&&i(new Date(e,10,18),`Buß- und Bettag`),a(`HH`,`HB`,`NI`,`SH`,`MV`,`BB`,`BE`,`TH`,`ST`,`SN`)&&i(new Date(e,9,31),`Reformationstag`),a(`BE`,`HH`,`MV`,`SH`,`TH`,`SN`,`ST`,`NI`,`HB`,`BB`)&&i(new Date(e,2,8),`Internationaler Frauentag`),r}function on(e){let t=parseInt(e.split(`-`)[0]),n=en(),r=dn[t+n];if(r)return r[e]||null;let i=an(t,n);return dn[t+n]=i,i[e]||null}async function sn(e,t){let n=`${e}_${t}`;try{let e=localStorage.getItem(fn),t=e?JSON.parse(e):{};if(t[n]&&Date.now()-t[n].ts<pn)return t[n].data}catch{}try{let r=mn[e]||`NW`,i=null;for(let e of[`https://schulferien-api.de/api/v1/${t}/${r}/`,`https://ferien-api.de/api/v1/holidays/${r}/${t}`])try{let t=await fetch(e);if(t.ok&&(i=await t.json(),Array.isArray(i)&&i.length>0))break}catch(t){console.warn(`Schulferien API error:`,e,t.message)}if(!i||!Array.isArray(i))return[];let a=i.map(e=>({start:(e.start||e.startDate||``).split(`T`)[0],end:(e.end||e.endDate||``).split(`T`)[0],name:e.name||e.title||`Schulferien`})).filter(e=>e.start&&e.end);try{let e=localStorage.getItem(fn),t=e?JSON.parse(e):{};t[n]={data:a,ts:Date.now()},localStorage.setItem(fn,JSON.stringify(t))}catch{}return a}catch{return[]}}function cn(e){try{let t=localStorage.getItem(fn);if(!t)return null;let n=JSON.parse(t),r=en(),i=parseInt(e.split(`-`)[0]);for(let t of[i,i-1]){let i=n[`${r}_${t}`];if(i){for(let t of i.data)if(e>=t.start&&e<t.end)return t.name}}}catch{}return null}async function ln(){let e=en(),t=new Date().getFullYear();await Promise.all([sn(e,t),sn(e,t+1)])}function un(e){let t=on(e);if(t)return{name:t,type:`feiertag`};let n=cn(e);return n?{name:n,type:`schulferien`}:null}var dn,fn,pn,mn,hn=n((()=>{dn={},fn=`fp_ferien_cache`,pn=10080*60*1e3,mn={BW:`BW`,BY:`BY`,BE:`BE`,BB:`BB`,HB:`HB`,HH:`HH`,HE:`HE`,MV:`MV`,NI:`NI`,NW:`NW`,RP:`RP`,SL:`SL`,SN:`SN`,ST:`ST`,SH:`SH`,TH:`TH`}})),gn=e({renderBoard:()=>Fn,renderCalendar:()=>Pn,renderContent:()=>q,renderMeals:()=>zn,renderShoppingContent:()=>In,showAssignModal:()=>Un,showCommentsModal:()=>Wn,showOvTaskMenu:()=>Hn,toggleMealExtras:()=>Bn,toggleShopCat:()=>Vn});function _n(e){return E.memberColorMap[e]||`#9ba3af`}function vn(e,t){let{assignedTo:n,done:r}=L(e,t),i=n===E.curUser,a=f(e.title),[o,s]=e.time.split(`:`),c=e.endTime?S(e.time,e.endTime):``,l=E.taskComments[e.id]||{};Object.keys(l).length;let u=e.type===`task`,d=u&&n&&!r?`<button class="v2-check-btn" onclick="event.stopPropagation();window._app.toggleDone('${e.id}','${t}')" title="Erledigt">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#5C4EE5" stroke-width="1.5"/><path d="M5 8l2.5 2.5L11 5.5" stroke="#5C4EE5" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
       </button>`:u&&r?`<button class="v2-check-btn done-check" onclick="event.stopPropagation();window._app.toggleDone('${e.id}','${t}')" title="Rückgängig">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" fill="#5C4EE5"/><path d="M5 8l2.5 2.5L11 5.5" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
       </button>`:`<div class="v2-check-btn-placeholder"></div>`,p=``;p=e.type===`event`?n?`<span class="v2-assigned-chip" style="${i?`background:var(--accent-bg);color:var(--accent);font-weight:700;border:1px solid #c7d2fe`:``}">${i?`Du`:f(n)}</span>`:`<button class="v2-assign-btn" onclick="event.stopPropagation();window._app.assignTask('${e.id}','${E.curUser}','${t}')">Teilnehmen</button>`:n?`<div class="v2-assigned-chip" style="${i?`background:var(--accent-bg);color:var(--accent);font-weight:700;border:1px solid #c7d2fe`:`background:#F5F6FA;color:var(--text2)`}">${i?`Du`:`${E.av[n]||`👤`} ${f(n)}`}</div>`:`<button class="v2-assign-btn" onclick="event.stopPropagation();window._app.showAssignModal('${e.id}','${t}')">Ich mach's!</button>`;let m=e.recurring===`once`?e.id:e.id+`_`+t,h=Object.keys(E.taskComments[m]||{}).length,g=`<button class="v2-cmt-btn" onclick="event.stopPropagation();window._app.showCommentsModal('${e.id}','${t}')">💬${h>0?` `+h:``}</button>`,_=[pe(e)];return e.location&&_.push(`📍 `+f(e.location)),c&&_.push(`⏱ `+c),`<div class="v2-card${r?` done`:``}" onclick="window._app.showOvTaskMenu('${e.id}','${t}')">
    <div class="v2-accent" style="background:${e.color}"></div>
    <div class="v2-card-inner">
      ${d}
      <div class="v2-time-col">
        <span class="v2-time-h">${o}</span>
        <span class="v2-time-m">${s}</span>
      </div>
      <div class="v2-divider"></div>
      <div class="v2-body">
        <div class="v2-title${r?` done-txt`:``}">${a}</div>
        <div class="v2-sub">${_.join(` · `)}</div>
        <div style="margin-top:3px">${g}</div>
      </div>
      <div class="v2-right">
        ${p}
        <div class="v2-edit-row">
          <button class="v2-icon-btn" onclick="event.stopPropagation();window._app.showEditModal('${e.id}')" title="Bearbeiten">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="#6b7280" stroke-width="1.3" stroke-linejoin="round"/></svg>
          </button>
          <button class="v2-icon-btn" onclick="event.stopPropagation();window._app.deleteTask('${e.id}','${t}')">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5 4V2.5h4V4M5.5 6.5v4M8.5 6.5v4M3 4l.8 7.5h6.4L11 4" stroke="#6b7280" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </div>
    </div>
  </div>`}function yn(e,t){let{assignedTo:n,done:r}=L(e,`open`),i=f(e.title),a=e.color||`#5C4EE5`,o=E.taskComments[e.id]||{},s=Object.keys(o).length,c=n===E.curUser,l=!e.visibleTo||e.visibleTo===`all`?`Alle`:Array.isArray(e.visibleTo)?e.visibleTo.map(e=>(E.av[e]||`👤`)+` `+f(e)).join(`, `):(E.av[e.visibleTo]||`👤`)+` `+f(e.visibleTo),u=n?`<div class="v2-assigned-chip" style="${c?`background:var(--accent-bg);color:var(--accent);font-weight:700;border:1px solid #c7d2fe`:`background:#F5F6FA;color:var(--text2)`}">${c?`Du`:`${E.av[n]||`👤`} ${f(n)}`}</div>
       <button class="v2-done-chip" onclick="event.stopPropagation();window._app.toggleDone('${e.id}','open')">✓ Erledigt</button>`:`<button class="v2-assign-btn" onclick="event.stopPropagation();window._app.assignTask('${e.id}','${E.curUser}','open')">Ich mach's!</button>`;return`<div class="v2-card" style="${c?`background:var(--accent-bg2);border-color:#c7d2fe;`:``}" onclick="window._app.showAssignModal('${e.id}','open')">
    <div class="v2-accent" style="background:${a}"></div>
    <div class="v2-card-inner">
      <div class="v2-time-col" style="min-width:28px;align-items:center;justify-content:center"><span style="font-size:16px">📋</span></div>
      <div class="v2-divider"></div>
      <div class="v2-body">
        <div class="v2-title">${i}</div>
        <div style="font-size:11px;color:var(--text3);margin-top:2px">Sichtbar: ${l}</div>
        <div style="margin-top:3px"><button class="v2-cmt-btn" onclick="event.stopPropagation();window._app.showCommentsModal('${e.id}','${t}')">💬${s>0?` `+s:``}</button></div>
      </div>
      <div class="v2-right">
        ${u}
        <div class="v2-edit-row">
          <button class="v2-icon-btn" onclick="event.stopPropagation();window._app.showEditModal('${e.id}')">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="#6b7280" stroke-width="1.3" stroke-linejoin="round"/></svg>
          </button>
          <button class="v2-icon-btn" onclick="event.stopPropagation();window._app.deleteTask('${e.id}','${t}')">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5 4V2.5h4V4M5.5 6.5v4M8.5 6.5v4M3 4l.8 7.5h6.4L11 4" stroke="#6b7280" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </div>
    </div>
  </div>`}function bn(e,t){let n=x(),r=E.tasks.filter(e=>e.openTodo&&!L(e,`open`).done).filter(e=>!e.visibleTo||e.visibleTo===`all`||(Array.isArray(e.visibleTo)?e.visibleTo.includes(E.curUser):e.visibleTo===E.curUser)),i=E.tasks.filter(n=>!n.openTodo&&R(n,t,e)).sort((e,t)=>e.time.localeCompare(t.time)),a=e===n?E.tasks.filter(t=>de(t,e)).filter(e=>!e.visibleTo||e.visibleTo===`all`||(Array.isArray(e.visibleTo)?e.visibleTo.includes(E.curUser):e.visibleTo===E.curUser)):[],o=[...i],s=o.filter(t=>{if(t.type===`event`)return!0;let{assignedTo:n}=L(t,e);return!n||n===E.curUser}),c=o.filter(t=>t.type===`event`?!0:!L(t,e).done),l=E.todayMember||null,u=(t=>l?t.filter(t=>{if(t.type===`event`)return t.attendees?.includes(l)||t.createdBy===l;let{assignedTo:n}=L(t,e);return n===l}):t)(E.todayView===`mine`?s:E.todayView===`open`?c:o),d=o.filter(t=>t.type===`task`&&L(t,e).assignedTo===E.curUser),p=d.filter(t=>L(t,e).done).length,m=d.length,h=m>0?Math.round(p/m*100):0,g=e===n,_=new Date().getHours(),v=g?_<12?`Guten Morgen`:_<18?`Guten Tag`:`Guten Abend`:``,y=g?`Heute`:t,b=parseInt(e.split(`-`)[2])+`. `+[`Jan`,`Feb`,`Mär`,`Apr`,`Mai`,`Jun`,`Jul`,`Aug`,`Sep`,`Okt`,`Nov`,`Dez`][parseInt(e.split(`-`)[1])-1],S=E.curUser&&E.photos?.[E.curUser]?`<img src="${E.photos[E.curUser]}" style="width:40px;height:40px;border-radius:50%;object-fit:cover">`:E.av[E.curUser]||`👤`,w=E.todayView===`all`&&E.members.length>1?`<div class="v2-member-progress">`+E.members.map(t=>{let n=o.filter(n=>n.type===`task`&&L(n,e).assignedTo===t),r=n.filter(t=>L(t,e).done).length,i=n.length>0?Math.round(r/n.length*100):0;return`<div class="v2-member-prog-item">
        <div class="v2-member-prog-av">${E.photos?.[t]?`<img src="${E.photos[t]}" style="width:22px;height:22px;border-radius:50%;object-fit:cover">`:`<span style="font-size:16px">${E.av[t]||`👤`}</span>`}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:10px;font-weight:600;color:var(--text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${f(t)}</div>
          <div style="height:4px;background:var(--border);border-radius:2px;margin-top:2px;overflow:hidden">
            <div style="height:100%;background:#5C4EE5;border-radius:2px;width:${i}%;transition:width 0.4s"></div>
          </div>
        </div>
        <div style="font-size:10px;font-weight:700;color:var(--text3);flex-shrink:0">${r}/${n.length}</div>
      </div>`}).join(``)+`</div>`:``,T=`<div class="v2-me-bar">
    <div class="v2-avatar">${S}</div>
    <div style="flex:1;min-width:0">
      <div class="v2-me-name">${v?f(v)+`, `:``}<strong>${f(E.curUser||`...`)}</strong></div>
      <div class="v2-progress-wrap">
        <div class="v2-progress-track"><div class="v2-progress-fill" style="width:${h}%"></div></div>
        <span class="v2-progress-label">${m>0?p+` / `+m+` erledigt`:`Keine eigenen Aufgaben`}</span>
      </div>
    </div>
    <div style="text-align:right;flex-shrink:0">
      <div style="font-size:13px;font-weight:700;color:var(--text1)">${y}</div>
      <div style="font-size:11px;color:var(--text3)">${b}</div>
    </div>
  </div>`,ee=``,D=[`premium`,`granted`].includes(E._verifiedPlan);if(g)if(!D&&E._planLastVerified>0){let e=`fp_nudge_`+n,t=parseInt(localStorage.getItem(e)||`0`);t<1&&(localStorage.setItem(e,t+1),ee=`<div onclick="window._app.showUpgradeModal('general')" style="display:flex;align-items:center;gap:10px;background:linear-gradient(135deg,#EEF2FF,#F5F3FF);border:1px solid #c7d2fe;border-radius:12px;padding:10px 14px;margin-bottom:10px;cursor:pointer">
          <span style="font-size:20px">⭐</span>
          <div style="flex:1;min-width:0">
            <div style="font-size:12px;font-weight:700;color:#5C4EE5">famiplan Plus · ab 1,25 €/Monat</div>
            <div style="font-size:11px;color:#6b7280">Unbegrenzte Kommentare & alle Features</div>
          </div>
          <span style="font-size:16px;color:#5C4EE5">›</span>
        </div>`)}else D&&E._planLastVerified>0&&(ee=`<div style="display:flex;align-items:center;gap:10px;background:linear-gradient(135deg,#ECFDF5,#D1FAE5);border:1px solid #6EE7B7;border-radius:12px;padding:10px 14px;margin-bottom:10px">
        <span style="font-size:18px">✅</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:12px;font-weight:700;color:#059669">${E._verifiedPlan===`granted`?`Freizugang aktiv`:`famiplan Plus aktiv`}</div>
          <div style="font-size:11px;color:#6b7280">Alle Features ohne Einschränkung</div>
        </div>
      </div>`);let O=(E.dayNotes||{})[e]||``,te=g?`✏️ Notiz für heute…`:`✏️ Notiz für diesen Tag…`;T+=ee,T+=`<div class="v2-day-note">
    <textarea class="v2-day-note-input" placeholder="${te}" rows="1"
      oninput="window._app._dayNoteInput(this,'${e}')"
      onfocus="this.rows=3"
      onblur="this.rows=this.value?2:1"
    >${f(O)}</textarea>
  </div>`;let ne=E.members.length>1?`
    <div class="v2-member-filter">
      <button class="v2-member-chip${l?``:` active`}" onclick="window._app.setTodayMember(null)">Alle</button>
      ${E.members.map(e=>{let t=E.photos?.[e]?`<img src="${E.photos[e]}" style="width:18px;height:18px;border-radius:50%;object-fit:cover;vertical-align:-3px;margin-right:3px">`:`<span style="margin-right:2px">${E.av[e]||`👤`}</span>`;return`<button class="v2-member-chip${l===e?` active`:``}"
          onclick="window._app.setTodayMember('${C(e)}')">
          ${t}${f(e)}
        </button>`}).join(``)}
    </div>`:``,k=E.todayTimeline;return T+=`<div class="v2-toggle-row">
    <button class="v2-toggle${E.todayView===`mine`?` active`:``}" onclick="window._app.setTodayView('mine')">Mein Tag (${s.length})</button>
    <button class="v2-toggle${E.todayView===`open`?` active`:``}" onclick="window._app.setTodayView('open')">Offen (${c.filter(e=>e.type===`task`).length})</button>
    <button class="v2-toggle${E.todayView===`all`?` active`:``}" onclick="window._app.setTodayView('all')">Alle (${o.length})</button>
    <button class="v2-toggle v2-toggle-tl${k?` active`:``}" onclick="window._app.setTodayTimeline(${!k})" title="${k?`Liste`:`Timeline`}">
      ${k?`☰`:`⏱`}
    </button>
  </div>
  ${ne}
  ${w}`,!u.length&&!r.length&&!a.length?(T+=E.todayView===`mine`?`<div class="v2-empty"><div class="v2-empty-ico">🎉</div><div class="v2-empty-txt">Freier Tag!</div><div class="v2-empty-sub">Keine Aufgaben für dich heute.</div><button class="empty-cta" onclick="window._app.showAddModal()">＋ Aufgabe hinzufügen</button></div>`:`<div class="v2-empty"><div class="v2-empty-ico">🎉</div><div class="v2-empty-txt">Freier Tag!</div><div class="v2-empty-sub">Keine Aufgaben geplant.</div><button class="empty-cta" onclick="window._app.showAddModal()">＋ Aufgabe hinzufügen</button></div>`,r.length&&(T+=`<div class="v2-section-title">📋 Offen (${r.length})</div>`,T+=r.map(e=>yn(e,n)).join(``)),T):k&&u.length?(T+=Nn(e),r.length&&(T+=`<div class="v2-section-title" style="margin-top:8px">📋 Offen (${r.length})</div>`,T+=r.map(e=>yn(e,n)).join(``)),T):(a.length&&(T+=`<div class="v2-overdue-section">
      <div class="v2-section-title" style="color:#DC2626">⚠️ Nicht erledigt (${a.length})</div>`,T+=a.map(t=>{let n=ve(t),r=n.length?n[n.length-1]:t.date||e,i=parseInt(r.split(`-`)[2])+`.`+parseInt(r.split(`-`)[1])+`.`,a=n.length>1?`${n.length}× offen`:`seit ${i}`,o=t.recurring===`once`?t.date||e:r;return`<div style="position:relative">${vn(t,o)}
        <div style="position:absolute;top:8px;right:8px;display:flex;gap:4px;align-items:center">
          <span style="background:#FEE2E2;color:#DC2626;font-size:10px;font-weight:700;padding:2px 6px;border-radius:6px;pointer-events:none">${a}</span>
          <button onclick="event.stopPropagation();window._app.overdueMarkDone('${t.id}','${o}')"
            style="background:#DC2626;color:white;font-size:10px;font-weight:700;padding:2px 8px;border-radius:6px;border:none;cursor:pointer;font-family:inherit">✓</button>
          <button onclick="event.stopPropagation();window._app.overdueSnooze('${t.id}','${o}')"
            style="background:#FEE2E2;color:#DC2626;font-size:10px;font-weight:700;padding:2px 8px;border-radius:6px;border:none;cursor:pointer;font-family:inherit">→ Heute</button>
        </div>
      </div>`}).join(``),T+=`</div>`),E.todayGrouped&&u.length?(new Date().getHours()*60+new Date().getMinutes(),[{label:`🌅 Morgen`,from:0,to:11,icon:`🌅`},{label:`☀️ Nachmittag`,from:12,to:17,icon:`☀️`},{label:`🌙 Abend`,from:18,to:23,icon:`🌙`}].forEach(t=>{let n=u.filter(e=>{let n=parseInt(e.time.split(`:`)[0]);return n>=t.from&&n<=t.to});if(!n.length)return;let r=`v2sec_${e}_${t.from}`,i=E._collapsedSections?.has(r)??!1,a=n.filter(t=>L(t,e).done).length,o=a>0?` · ${a}/${n.length} erledigt`:` · ${n.length}`;T+=`<div class="v2-section-hdr${i?` collapsed`:``}" onclick="window._app._toggleTodaySection('${r}')">
        <span>${t.label}${o}</span>
        <span class="v2-section-chevron">${i?`›`:`⌄`}</span>
      </div>`,i||(T+=`<div class="v2-section-body">${n.map(t=>vn(t,e)).join(``)}</div>`)})):u.length&&(T+=u.map(t=>vn(t,e)).join(``)),r.length&&(T+=`<div class="v2-section-title" style="margin-top:12px">📋 Offen (${r.length})</div>`,T+=r.map(e=>yn(e,n)).join(``)),T)}function xn(e,t){let n=new Date(e,t,1),r=new Date(e,t+1,0),i=[],a=n.getDay()===0?6:n.getDay()-1;for(let n=a-1;n>=0;n--){let r=new Date(e,t,0-n);i.push({iso:x(r),inMonth:!1})}for(let n=1;n<=r.getDate();n++){let r=new Date(e,t,n);i.push({iso:x(r),inMonth:!0})}for(;i.length%7!=0;){let n=new Date(e,t+1,i.length-r.getDate()-a+1);i.push({iso:x(n),inMonth:!1})}return i}function Sn(e){let t=new Date(e+`T12:00:00`),n=t.getDay()===0?6:t.getDay()-1;return Array.from({length:7},(e,r)=>{let i=new Date(t);return i.setDate(t.getDate()-n+r),{iso:x(i),name:d[m(i.getDay())]}})}function Cn(e){let t=u(e),n=E.tasks.filter(n=>!n.openTodo&&R(n,t,e)).sort((e,t)=>e.time.localeCompare(t.time));return n.length?`<div class="cal-dots-row">${n.slice(0,5).map(e=>`<div class="cal-dot" style="background:${e.color}"></div>`).join(``)}${n.length>5?`<div class="cal-task-more">+${n.length-5}</div>`:``}</div>`:``}function wn(e){let t=u(e),n=E.tasks.filter(n=>!n.openTodo&&R(n,t,e)).sort((e,t)=>e.time.localeCompare(t.time));if(!n.length)return``;let r=n[0],i=(r.emoji?r.emoji+` `:``)+r.title,a=`<div class="cal-task-preview" style="background:${r.color}">${f(i)}</div>`,o=n.slice(1,4).map(e=>`<div class="cal-dot" style="background:${e.color}"></div>`).join(``),s=n.length>4?`<div class="cal-task-more">+${n.length-4}</div>`:``;return a+(o||s?`<div class="cal-dots-row">${o}${s}</div>`:``)}function Tn(e){let t=u(e),n=E.tasks.filter(n=>!n.openTodo&&R(n,t,e)).sort((e,t)=>e.time.localeCompare(t.time));return n.length?n.slice(0,4).map(e=>{let t=e.time&&e.time!==`12:00`?`<span style="opacity:0.75"> ${e.time}</span>`:``,n=(e.emoji?e.emoji+` `:``)+e.title;return`<div class="cal-task-preview cal-task-preview-z2" style="background:${e.color}">${f(n)}${t}</div>`}).join(``)+(n.length>4?`<div class="cal-task-more">+${n.length-4}</div>`:``):``}function En(e){let t=new Date(e+`T12:00:00`),n=new Date(t);n.setDate(t.getDate()-(t.getDay()+6)%7+3);let r=new Date(n.getFullYear(),0,4);return Math.round(((n-r)/864e5+((r.getDay()+6)%7-3))/7)+1}function Dn(e){if(e>=x())return!1;let t=u(e);return E.tasks.some(n=>!n.openTodo&&n.type!==`event`&&R(n,t,e)&&!L(n,e).done)}function On(e,t){return new Date(e,t,1).toLocaleDateString(`de-DE`,{month:`long`,year:`numeric`})}function kn(){let e=Sn(E.calSelISO),[t,n]=[e[0].iso.split(`-`),e[6].iso.split(`-`)];return`${parseInt(t[2])}.${parseInt(t[1])} – ${parseInt(n[2])}.${parseInt(n[1])}.${n[0]}`}function An(e,t){let n=new Date(e+`T12:00:00`);return n.setDate(n.getDate()+t),x(n)}function jn(e){let t=x(),n=u(e),r=parseInt(e.split(`-`)[2]),i=parseInt(e.split(`-`)[1]);return e===t?`Heute`:e===An(t,1)?`Morgen`:e===An(t,-1)?`Gestern`:n.slice(0,2)+` `+r+`.`+i+`.`}function Mn(e,t,n,r){let i=u(e),a=E.tasks.filter(t=>!t.openTodo&&R(t,i,e)).sort((e,t)=>e.time.localeCompare(t.time)),o=[];a.forEach(e=>{let[n,i]=e.time.split(`:`).map(Number),a=n+i/60,s=(a-t)*r,c=Math.max(24,r*.75);if(e.endTime){let[t,n]=e.endTime.split(`:`).map(Number),i=t+n/60-a;i>0&&(c=Math.max(24,i*r))}let l=o.filter(e=>s<e.top+e.height&&s+c>e.top),u=new Set(l.map(e=>e.col)),d=0;for(;u.has(d);)d++;o.push({t:e,top:s,height:c,col:d,group:null})}),o.forEach((e,t)=>o.forEach((n,r)=>{if(!(t>=r)&&e.top<n.top+n.height&&e.top+e.height>n.top){let i=Math.min(e.group??t,n.group??r,t,r);e.group=i,n.group=i}}));let s={};return o.forEach((e,t)=>{let n=e.group??t;s[n]=Math.max(s[n]||1,e.col+1)}),o.map(({t,top:n,height:r,col:i,group:a},o)=>{let{assignedTo:c,done:l}=L(t,e),u=t.type===`event`?t.createdBy||c||null:c,d=u?_n(u):`#d1d5db`,p=u?`white`:`#6b7280`,m=100/(s[a??o]||1),h=m*i,g=t.type===`event`,_=g?`📅`:`📋`,v=``;g||(v=l?`✓ Erledigt`:c?f(E.av[c]||`👤`)+` `+f(c):`○ Offen`);let y=[t.time+(t.endTime?`–`+t.endTime:``),v].filter(Boolean).join(` · `);return`<div class="tl3-event${l?` done`:``}"
      style="top:${n}px;height:${r}px;left:${h}%;width:${m}%;background:${d};color:${p};opacity:${l?.5:1};display:flex;align-items:center;padding:0 3px;box-sizing:border-box"
      onclick="window._app.showAssignModal('${t.id}','${e}')">
      <div style="font-size:10px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;width:100%">${_} ${f(t.emoji||``)} ${f(t.title)} · ${y}</div>
    </div>`}).join(``)}function Nn(e){let t=x(),n=u(e),r=E.tasks.filter(t=>!t.openTodo&&R(t,n,e)&&!t.allDay),i=E.tasks.filter(t=>!t.openTodo&&R(t,n,e)&&(t.allDay||t.endDate&&t.endDate>t.date));if(!r.length&&!i.length)return``;let a=r.map(e=>parseInt(e.time.split(`:`)[0])),o=r.length?Math.max(0,Math.min(...a)-1):7,s=r.length?Math.min(23,Math.max(...a)+2):21,c=``;for(let e=o;e<=s;e++)c+=`<div class="tl3-hour-row" style="height:56px">
      <span class="tl3-hour-label">${String(e).padStart(2,`0`)}</span>
    </div>`;let l=new Date,d=l.getHours()+l.getMinutes()/60,p=e===t&&d>=o&&d<=s+1?(d-o)*56:-1,m=i.length?`
    <div class="tl3-allday-row">
      <div class="tl3-allday-spacer">Ganztag</div>
      <div class="tl3-allday-col" style="flex:1">
        ${i.map(t=>`<div class="tl3-allday-event" style="background:${t.color}"
          onclick="window._app.showAssignModal('${t.id}','${e}')">
          ${f(t.emoji||``)} ${f(t.title)}
        </div>`).join(``)}
      </div>
    </div>`:``,h=Mn(e,o,s,56),g=p>=0?`<div class="tl3-now-line" style="top:${p}px"></div>`:``,_=un(e),v=_?`<div class="tl3-holiday-chip ${_.type}">${_.name}</div>`:``,y=e===t;return`<div class="tl3-wrap tl3-single">
    <div class="tl3-header">
      <div class="tl3-hour-spacer">${e===t?``:`<button class="tl3-heute-btn" onclick="window._app.calGoToday()">↩</button>`}</div>
      <div class="tl3-col-hdr selected${y?` today`:``}" style="flex:1">
        ${jn(e)}${v}
      </div>
    </div>
    ${m}
    <div class="tl3-body">
      <div class="tl3-hours">${c}</div>
      <div class="tl3-cols">
        <div class="tl3-col selected${y?` today`:``}"
          onclick="window._app._calTimeSlotTap(event,'${e}',${o},56)"
          style="height:${(s-o+1)*56}px;flex:1">
          ${g}${h}
          ${h?``:`<div class="tl3-empty-col">＋ Eintragen</div>`}
        </div>
      </div>
    </div>
  </div>`}function Pn(){let{calView:e,calYear:t,calMonth:n,calSelISO:r}=E,i=x(),a=[`Mo`,`Di`,`Mi`,`Do`,`Fr`,`Sa`,`So`];i+``;let o=r===i,s=Sn(r).some(e=>e.iso===i),c=r===i,l=e=>e?``:`<button class="cal-heute-btn" onclick="window._app.calGoToday()">↩ Heute</button>`,u=(e===`7tage`?`<div class="cal-header"><div class="cal-month">7 Tage</div>${l(c)}</div>`:`<div class="cal-header"><button class="cal-nav" onclick="window._app.calPrev()">‹</button><div class="cal-month">${e===`month`?On(t,n):kn()}</div>${l(e===`month`?o:s)}<button class="cal-nav" onclick="window._app.calNext()">›</button></div>`)+`<div class="cal-view-toggle">
    <button class="cal-view-btn${e===`month`?` active`:``}" onclick="window._app.setCalView('month')">Monat</button>
    <button class="cal-view-btn${e===`week`?` active`:``}" onclick="window._app.setCalView('week')">Woche</button>
    <button class="cal-view-btn${e===`7tage`?` active`:``}" onclick="window._app.setCalView('7tage')">7 Tage</button>
  </div>`;if(e===`month`){let e=E.calZoom||0,o=xn(t,n),s=[];for(let e=0;e<o.length;e+=7)s.push(o.slice(e,e+7));let c=s;if(e>=1){let t=s.findIndex(e=>e.some(e=>e.iso===r)),n=t>=0?t:Math.floor(s.length/2),i=e===1?2:1,a=Math.max(0,n-(e===2?0:1)),o=Math.min(s.length-1,a+i);c=s.slice(a,o+1)}let l=`<div class="weekday-lbl cal-kw-hdr">KW</div>`+a.map(e=>`<div class="weekday-lbl">${e}</div>`).join(``),d=e===0?46:e===1?72:100,f=c.map(t=>{let n=En((t.find(e=>e.inMonth)||t[0]).iso);return`<div class="cal-kw-cell" style="min-height:${d}px">${n}</div>`+t.map(({iso:t,inMonth:n})=>{let a=parseInt(t.split(`-`)[2]),o=n?un(t):null,s=o?`<span class="cal-holiday-dot ${o.type}" title="${o.name}"></span>`:``,c=n?Dn(t):!1,l=n?e===0?Cn(t):e===1?wn(t):Tn(t):``;return`<div class="cal-day${e>=1?` cal-day-zoom`:``}${n?``:` other-month`}${t===i?` today`:``}${t===r?` selected`:``}"
          style="min-height:${d}px"
          onclick="window._app.calDayTap('${t}')"
          ontouchstart="window._app._calLpStart(event,'${t}')"
          ontouchend="window._app._calLpEnd()"
          ontouchmove="window._app._calLpEnd()">
          <div class="cal-day-num${o?` has-holiday`:``}${c?` cal-overdue`:``}">
            ${a}${c?`<span class="cal-overdue-dot"></span>`:``}
          </div>
          <div class="cal-preview">${l}${s}</div>
        </div>`}).join(``)}).join(``),p=`<div class="cal-zoom-btns">
      <button class="cal-zoom-btn${e===0?` disabled`:``}" onclick="window._app.setCalZoom(${e-1})" title="Rauszoomen">−</button>
      <span class="cal-zoom-label">${e===0?`Monat`:e===1?`3 Wochen`:`2 Wochen`}</span>
      <button class="cal-zoom-btn${e===2?` disabled`:``}" onclick="window._app.setCalZoom(${e+1})" title="Reinzoomen">＋</button>
    </div>`;u+=p,u+=`<div class="month-grid" id="cal-month-grid">
      <div class="weekday-row" style="grid-template-columns:22px repeat(7,1fr)">${l}</div>
      <div class="days-grid" style="grid-template-columns:22px repeat(7,1fr)">${f}</div>
    </div>`,requestAnimationFrame(()=>window._app._calInitGesture&&window._app._calInitGesture());let m=un(r);m&&(u+=`<div class="cal-holiday-bar ${m.type}">
        ${m.type===`feiertag`?`🟡`:`🟢`} ${m.name}
      </div>`),E.calShowTimeline&&(u+=Nn(r),requestAnimationFrame(()=>{let e=document.querySelector(`.tl3-wrap`);if(!e)return;e.scrollIntoView({behavior:`smooth`,block:`nearest`});let t=e.querySelector(`.tl3-body`),n=e.querySelector(`.tl3-event`);if(t&&n){let e=n.offsetTop;t.scrollTop=Math.max(0,e-40)}}))}else if(e===`week`){let e=Sn(r),t=e.flatMap(({iso:e,name:t})=>E.tasks.filter(n=>!n.openTodo&&R(n,t,e)));{let n=t.map(e=>parseInt(e.time.split(`:`)[0])),a=t.length?Math.max(0,Math.min(...n)-1):7,o=t.length?Math.min(23,Math.max(...n)+2):21,s=(o-a+1)*52,c=new Date,l=c.getHours()+c.getMinutes()/60,d=l>=a&&l<=o+1?(l-a)*52:-1,f=e.map(({iso:e,name:t})=>{let n=parseInt(e.split(`-`)[2]),a=e===i,o=e===r,s=un(e),c=s?`<div class="tl3-holiday-chip ${s.type}" style="font-size:8px;padding:1px 3px;margin-top:2px">${s.name}</div>`:``;return`<div class="wk7-col-hdr${a?` today`:``}${o?` selected`:``}" onclick="window._app.calSelectDay('${e}')">
          <span class="wk7-hdr-name">${t.slice(0,2)}</span>
          <span class="wk7-hdr-num${a?` today`:``}">${n}</span>
          ${c}
        </div>`}).join(``),p=e.map(({iso:e,name:t})=>{let n=e===i,r=Mn(e,a,o,52),c=n&&d>=0?`<div class="tl3-now-line" style="top:${d}px"></div>`:``;return`<div class="wk7-col${n?` today`:``}" style="height:${s}px"
          onclick="window._app._calTimeSlotTap(event,'${e}',${a},52)">
          ${c}${r}
        </div>`}).join(``),m=``;for(let e=a;e<=o;e++)m+=`<div class="tl3-hour-row" style="height:52px">
          <span class="tl3-hour-label">${String(e).padStart(2,`0`)}</span>
        </div>`;u+=`<div class="wk7-wrap">
        <div class="wk7-header">
          <div class="wk7-hour-spacer"></div>
          ${f}
        </div>
        <div class="wk7-body" id="wk7-body">
          <div class="tl3-hours">${m}</div>
          <div class="wk7-cols">${p}</div>
        </div>
      </div>`,d>=0&&requestAnimationFrame(()=>{let e=document.getElementById(`wk7-body`);e&&(e.scrollTop=Math.max(0,d-80))})}}else{let e=d[m(new Date().getDay())],t=Array.from({length:7},(e,t)=>{let n=new Date;return n.setDate(n.getDate()+t),{iso:x(n),name:d[m(n.getDay())]}}),n=E.tasks.filter(t=>R(t,e,i)),r=n.filter(e=>e.type===`task`&&L(e,i).done).length,a=n.filter(e=>e.type===`task`&&!L(e,i).done).length;u+=`<div style="display:flex;gap:8px;margin-bottom:16px">
      <div style="flex:1;background:var(--surface);border-radius:12px;padding:12px 14px;border:1px solid var(--border);display:flex;flex-direction:column;gap:2px">
        <div style="font-size:22px;font-weight:800;color:#5C4EE5">${a}</div>
        <div style="font-size:11px;color:var(--text2);font-weight:500">Heute offen</div>
      </div>
      <div style="flex:1;background:var(--surface);border-radius:12px;padding:12px 14px;border:1px solid var(--border);display:flex;flex-direction:column;gap:2px">
        <div style="font-size:22px;font-weight:800;color:#059669">${r}</div>
        <div style="font-size:11px;color:var(--text2);font-weight:500">Heute erledigt</div>
      </div>
    </div>`,t.forEach(({iso:t,name:n})=>{let r=E.tasks.filter(e=>R(e,n,t)&&(e.type===`event`||!L(e,t).done)&&(e.recurring===`once`||t>=i)).sort((e,t)=>e.time.localeCompare(t.time));if(!r.length)return;let a=r.map(e=>{let{assignedTo:n,done:r}=L(e,t),i=n===E.curUser,a=e.type===`event`?`<span class="badge b-event">Termin</span>`:r?`<span class="ov-done">✓ Erledigt</span>`:n?`<span class="ov-yes" style="${i?`color:#5C4EE5;font-weight:700;background:#EDE9FE;padding:2px 7px;border-radius:4px;border:1px solid #c7d2fe`:``}">✓ ${i?`Du`:f(n)}</span>`:`<button class="ov-assign-btn" onclick="event.stopPropagation();window._app.showAssignModal('${e.id}','${t}')">Ich mach's!</button>`;return`<div class="ov-row" onclick="window._app.showOvTaskMenu('${e.id}','${t}')"><div class="ov-dot" style="background:${e.color}"></div><span class="ov-name${r?` done-txt`:``}">${f(e.title)}</span>${a}</div>`}).join(``),o=parseInt(t.split(`-`)[2]),s=parseInt(t.split(`-`)[1]),c=n===e?`Heute`:n,l=o+`. `+[`Jan`,`Feb`,`Mär`,`Apr`,`Mai`,`Jun`,`Jul`,`Aug`,`Sep`,`Okt`,`Nov`,`Dez`][s-1];u+=`<div class="ov-card"><div class="ov-day${n===e?` today`:``}">${c}<span style="font-weight:500;opacity:0.6;margin-left:6px;text-transform:none;letter-spacing:0">${l}</span></div>${a}</div>`}),u+=`<div style="text-align:center;padding:16px 0 8px;display:flex;gap:16px;justify-content:center">
      <a href="/impressum.html" style="font-size:12px;color:var(--text3);text-decoration:none;font-weight:500">Impressum</a>
      <a href="/datenschutz.html" style="font-size:12px;color:var(--text3);text-decoration:none;font-weight:500">Datenschutz</a>
      <span style="font-size:12px;color:#c4c9d4">v1.0 · famiplan</span>
    </div>`}return u}function Fn(){He();let e=x(),t=d[m(new Date().getDay())],n=E.tasks.filter(n=>!n.openTodo&&R(n,t,e)).sort((e,t)=>e.time.localeCompare(t.time)),r=n.filter(t=>t.type===`task`?!L(t,e).done:!0),i=n.filter(t=>t.type===`task`&&L(t,e).done).length,a=n.filter(e=>e.type===`task`).length,o=a>0?Math.round(i/a*100):0,s=a>0&&i===a,c=new Date,u=c.getHours(),p=u<12?`Guten Morgen`:u<18?`Guten Tag`:`Guten Abend`,h=c.toLocaleDateString(`de-DE`,{weekday:`long`,day:`numeric`,month:`long`}),g=u*60+c.getMinutes(),_=r.find(e=>{let[t,n]=e.time.split(`:`).map(Number);return t*60+n>=g}),v=_?(()=>{let[e,t]=_.time.split(`:`).map(Number),n=e*60+t-g;if(n===0)return`Jetzt`;if(n<60)return`in ${n} Min.`;let r=Math.floor(n/60),i=n%60;return`in ${r} Std.${i?` `+i+` Min.`:``}`})():null,y=``;s&&(y+=`<div class="board-success-card">
      <div class="board-success-confetti">🎉</div>
      <div style="font-size:15px;font-weight:800;color:#059669">Alle erledigt!</div>
      <div style="font-size:12px;color:#6b7280;margin-top:2px">Gut gemacht, ${f(E.curUser||`du`)}! ${a} von ${a} Aufgaben geschafft.</div>
    </div>`),y+=`<div class="board-banner">
    <div style="display:flex;align-items:flex-start;justify-content:space-between">
      <div>
        <div class="board-banner-greeting">${p}</div>
        <div class="board-banner-date">${h}</div>
      </div>
      ${_?`<div class="board-next-badge" onclick="window._app.setTab('today')">
        <div class="board-next-time">${_.time}</div>
        <div class="board-next-countdown">${v}</div>
      </div>`:``}
    </div>`,a>0&&(y+=`<div style="display:flex;align-items:center;gap:8px;margin-bottom:${r.length?`10px`:`0`}">
      <div style="flex:1;height:5px;background:rgba(255,255,255,0.2);border-radius:3px;overflow:hidden">
        <div style="height:100%;background:white;border-radius:3px;width:${o}%;transition:width 0.5s"></div>
      </div>
      <span style="font-size:11px;color:rgba(255,255,255,0.75);white-space:nowrap">${i} / ${a} erledigt</span>
    </div>`);let b=r.slice(0,3);b.length?(y+=`<div style="display:flex;flex-direction:column;gap:5px">`,b.forEach(t=>{let{assignedTo:n}=L(t,e),[r,i]=t.time.split(`:`).map(Number),a=r*60+i-g,o=a>=0&&a<=15,s=n?E.av[n]||`👤`:null;y+=`<div onclick="window._app.setTab('today')" style="display:flex;align-items:center;gap:8px;background:rgba(255,255,255,${o?`0.2`:`0.12`});border-radius:10px;padding:8px 10px;cursor:pointer;${o?`box-shadow:0 0 0 1.5px rgba(255,255,255,0.4)`:``}">
        <div style="width:4px;height:28px;border-radius:2px;background:${t.color};flex-shrink:0"></div>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:600;color:white;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${f(t.title)}</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.6)">${t.time}</div>
        </div>
        ${t.type===`event`?``:n?`<div style="font-size:11px;font-weight:600;color:rgba(255,255,255,0.85);text-align:right;flex-shrink:0">${s} ${f(n)}</div>`:`<div style="font-size:10px;color:rgba(255,255,255,0.45);flex-shrink:0">○ Offen</div>`}
        ${o?`<div style="font-size:10px;font-weight:700;color:white;background:rgba(255,255,255,0.2);border-radius:5px;padding:2px 6px;flex-shrink:0">Jetzt</div>`:``}
      </div>`}),y+=`</div>`,r.length>3&&(y+=`<div onclick="window._app.setTab('today')" style="margin-top:8px;text-align:center;font-size:12px;font-weight:600;color:rgba(255,255,255,0.65);cursor:pointer">+ ${r.length-3} weitere → Tag-Ansicht</div>`)):a===0?y+=`<div style="font-size:13px;color:rgba(255,255,255,0.65)">Heute nichts geplant 🎉</div>`:s||(y+=`<div style="font-size:13px;color:rgba(255,255,255,0.65)">Alle Aufgaben erledigt 🎉</div>`),y+=`</div>`,y+=`<div class="board-quick-actions">
    <button class="board-qa-btn" onclick="window._app.showAddModal && window._app.showAddModal()">＋ Aufgabe</button>
    <button class="board-qa-btn" onclick="window._app.showShopAddModal()">🛒 Einkauf</button>
    <button class="board-qa-btn" onclick="window._app._quickAddEvent()">📅 Termin</button>
    <button class="board-qa-btn" onclick="window._app.setTab('meals')">🍽 Mahlzeit</button>
  </div>`;let S=[];for(let e=1;e<=14;e++){let t=new Date;t.setDate(t.getDate()+e);let n=t.toISOString().split(`T`)[0],r=d[m(t.getDay())];E.tasks.filter(e=>!e.openTodo&&R(e,r,n)).filter(e=>e.type===`task`?!L(e,n).done:!0).sort((e,t)=>e.time.localeCompare(t.time)).forEach(e=>S.push({t:e,iso:n,dd:t}))}S.sort((e,t)=>{let n=e.iso+`T`+e.t.time,r=t.iso+`T`+t.t.time;return n.localeCompare(r)});let C=new Set,w=S.filter(({t:e,iso:t})=>{let n=e.id+`_`+t;return C.has(n)?!1:(C.add(n),!0)}).slice(0,4);w.length&&(y+=`<div class="board-upcoming">
      <div class="board-section-title">📅 Demnächst</div>
      <div style="display:flex;flex-direction:column;gap:6px">`,w.forEach(({t:e,iso:t,dd:n})=>{let r=n.toLocaleDateString(`de-DE`,{weekday:`short`,day:`numeric`,month:`short`}),{assignedTo:i}=L(e,t),a=i?E.av[i]||`👤`:null,o=d[m(n.getDay())];y+=`<div class="board-upcoming-row" onclick="window._app.setDay('${o}','${t}')">
        <div style="width:3px;height:100%;min-height:28px;border-radius:2px;background:${e.color};flex-shrink:0"></div>
        <div style="flex:1;min-width:0">
          <div style="font-size:12px;font-weight:600;color:var(--text1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${f(e.emoji||``)} ${f(e.title)}</div>
          <div style="font-size:11px;color:var(--text3)">${r} · ${e.time}</div>
        </div>
        ${e.type===`event`?``:i?`<div style="font-size:11px;font-weight:600;color:var(--text2);text-align:right;flex-shrink:0">${a} ${f(i)}</div>`:`<div style="font-size:10px;color:var(--text4);flex-shrink:0">○ Offen</div>`}
      </div>`}),y+=`</div></div>`);let T=E.tasks.filter(e=>e.openTodo&&!L(e,`open`).done).filter(e=>!e.visibleTo||e.visibleTo===`all`||(Array.isArray(e.visibleTo)?e.visibleTo.includes(E.curUser):e.visibleTo===E.curUser));T.length&&(y+=`<div class="board-section-title" style="margin-top:4px">📋 Offen (${T.length})</div>`,T.forEach(t=>{let n=t.id;y+=`<div ontouchstart="window._app._todoLpStart(event,'${n}')" ontouchend="window._app._todoLpEnd()" ontouchmove="window._app._todoLpEnd()">
        ${yn(t,e)}
      </div>`})),y+=`<button class="board-new-btn" onclick="window._app.showBoardNewModal()">📌 Etwas teilen…</button>`;let ee=Object.entries(E.boardPosts).sort((e,t)=>t[1].ts-e[1].ts);return ee.length?ee.forEach(([e,t])=>{let n=E.currentAuthUser?.uid,r=t.reactions||{},i=n?r[n]:null,a={};Object.values(r).forEach(e=>{a[e]=(a[e]||0)+1});let o=l.filter(e=>(a[e]||0)>0||i===e).map(t=>{let n=a[t]||0;return`<button class="board-reaction-btn${i===t?` mine`:``}" onclick="window._app.boardToggleReaction('${e}','${t}')">
          ${t}${n>0?`<span class="board-reaction-count">${n}</span>`:``}
        </button>`}).join(``),s=`<button class="board-reaction-add" onclick="window._app._boardReactionPicker('${e}')">＋ 😊</button>`,c=t.author===E.curUser||E.currentAuthUser?.uid,u=Object.entries(t.replies||{}).sort((e,t)=>e[1].ts-t[1].ts),d=u.length,p=window._boardOpenReplies?.has(e),m=d>0?`💬 ${d} Antwort${d===1?``:`en`}`:`💬 Antworten`,h=``;p&&(h=`<div class="board-replies">
          ${u.map(([t,n])=>{let r=n.author===E.curUser||E.currentAuthUser?.uid;return`<div class="board-reply">
            <div class="board-reply-av">${E.photos?.[n.author]?`<img src="${E.photos[n.author]}">`:E.av[n.author]||`👤`}</div>
            <div class="board-reply-bubble">
              <span class="board-reply-author">${f(n.author)}</span>
              <span class="board-reply-text">${f(n.text)}</span>
              <span class="board-reply-time">${Ke(n.ts)}</span>
            </div>
            ${r?`<button class="board-reply-del" onclick="window._app.boardDeleteReply('${e}','${t}')">×</button>`:``}
          </div>`}).join(``)}
          <div class="board-reply-input-row">
            <div class="board-reply-av">${E.photos?.[E.curUser]?`<img src="${E.photos[E.curUser]}">`:E.av[E.curUser]||`👤`}</div>
            <input class="board-reply-input" id="board-ri-${e}" type="text" placeholder="Antworten…" maxlength="500"
              onkeydown="if(event.key==='Enter'&&this.value.trim()){window._app.boardSubmitReply('${e}',this.value);this.value=''}">
            <button class="board-reply-send" onclick="const i=document.getElementById('board-ri-${e}');if(i.value.trim()){window._app.boardSubmitReply('${e}',i.value);i.value=''}">➤</button>
          </div>
        </div>`);let g=Object.values(t.reads||{}).filter(e=>e.name&&e.name!==t.author),_=``;E.members.length>1&&(g.length?_=`<div class="board-read-receipt" onclick="window._app.boardShowReaders('${e}')" style="font-size:11px;color:var(--accent,#5C4EE5);cursor:pointer;padding:2px 2px 0">✓✓ Gelesen von ${g.map(e=>f(e.name)).join(`, `)}</div>`:t.author===E.curUser&&(_=`<div class="board-read-receipt" style="font-size:11px;color:var(--text3);padding:2px 2px 0">✓ Gesendet</div>`)),y+=`<div class="board-post">
        <div class="board-post-header">
          <div class="board-post-av">${E.photos?.[t.author]?`<img src="${E.photos[t.author]}" style="width:36px;height:36px;border-radius:50%;object-fit:cover">`:E.av[t.author]||`👤`}</div>
          <div>
            <div class="board-post-author">${f(t.author)}</div>
            <div class="board-post-time">${Ke(t.ts)}</div>
          </div>
          ${c?`<button class="board-post-del" onclick="window._app.boardDeletePost('${e}')">×</button>`:``}
        </div>
        ${t.photo?`<img class="board-post-photo board-post-photo-full" src="${t.photo}" alt="" onclick="window._app._boardPhotoZoom('${e}')">`:``}
        ${t.text?`<div class="board-post-text">${f(t.text)}</div>`:``}
        <div class="board-reactions">${o}${s}</div>
        <div class="board-reply-bar"><button class="board-reply-toggle" onclick="window._app._boardToggleReplies('${e}')">${m}</button></div>
        ${h}
        ${_}
      </div>`}):y+=`<div style="text-align:center;padding:32px 20px;color:var(--text3)"><div style="font-size:36px;margin-bottom:8px">📌</div><div style="font-size:14px;font-weight:600">Noch keine Beiträge</div><div style="font-size:13px;margin-top:4px">Teile News, Fotos oder Infos mit deiner Familie</div></div>`,y+=`<div style="text-align:center;padding:16px 0 8px;display:flex;gap:16px;justify-content:center">
    <a href="/impressum.html" style="font-size:12px;color:var(--text3);text-decoration:none;font-weight:500">Impressum</a>
    <a href="/datenschutz.html" style="font-size:12px;color:var(--text3);text-decoration:none;font-weight:500">Datenschutz</a>
    <span style="font-size:12px;color:#c4c9d4">v1.0 · famiplan</span>
  </div>`,y}function In(){let{shopItems:e,activeShopList:t,shopView:n,collapsedCats:r}=E,i=e.filter(e=>e.list===t),a=i.length,o=i.filter(e=>e.checked).length,s=document.getElementById(`header-subtitle`);s&&(s.textContent=`${o} von ${a} erledigt`);let c=`<div class="shop-inner-nav">
    <button class="shop-inner-btn${n===`list`?` active`:``}" onclick="window._app.shopSetView('list')">Liste</button>
    <button class="shop-inner-btn${n===`fav`?` active`:``}" onclick="window._app.shopSetView('fav')">Favoriten</button>
  </div>`;if(n===`fav`){let t=e.filter(e=>e.fav);return t.length?c+`<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
      <div class="stat-pill"><span>${t.length}</span> Favoriten</div>
      <button onclick="window._app.shopAddAllFavsToList()" style="padding:8px 14px;background:#5C4EE5;color:white;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit">+ Alle zur Liste</button>
    </div><div class="shop-group">${t.map(Rn).join(``)}</div>`:c+`<div class="empty"><div class="empty-ico">⭐</div><div class="empty-txt">Keine Favoriten</div><div class="empty-sub">Markiere Artikel mit ⭐ um sie hier zu speichern</div></div>`}if(!a){let t=e.filter(e=>e.fav),n=c+`<div class="empty"><div class="empty-ico" style="font-size:40px;opacity:0.3">🛒</div><div class="empty-txt">Liste ist leer</div><div class="empty-sub">Tippe + um Artikel hinzuzufügen</div></div>`;return t.length&&(n+=`<div style="margin-top:16px;display:flex;align-items:center;justify-content:space-between;margin-bottom:12px"><div class="stat-pill"><span>${t.length}</span> Favoriten</div><button onclick="window._app.shopAddAllFavsToList()" style="padding:8px 14px;background:#5C4EE5;color:white;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit">+ Alle zur Liste</button></div><div class="shop-group">${t.map(Rn).join(``)}</div>`),n}let l=[...i].sort((e,t)=>!!e.checked-+!!t.checked),u={};l.forEach(e=>{let t=e.category||`sonstiges`;u[t]||(u[t]=[]),u[t].push(e)});let d=`<div class="stats-bar"><div class="stat-pill"><span>${a-o}</span> offen</div><div class="stat-pill"><span>${o}</span> erledigt</div></div>`+c;return Fe.forEach(e=>{let t=u[e.id];if(!t?.length)return;let n=t.filter(e=>e.checked).length,i=n?n+`/`+t.length:t.length,a=r.has(e.id);d+=`<div class="cat-section">
      <div class="cat-header" onclick="window._app.toggleShopCat('${e.id}')">
        <span class="cat-name">${f(e.name)}</span>
        <div class="cat-divider"></div>
        <span class="cat-count">${i}</span>
      </div>
      ${a?``:`<div class="shop-group">${t.map(Ln).join(``)}</div>`}
    </div>`}),d}function Ln(e){let t=e.qty&&e.unit?`${f(String(e.qty))} ${f(e.unit)}`:e.qty?`${f(String(e.qty))}`:e.unit?f(e.unit):``,n=e.mealRef&&!e.checked?`<span style="font-size:10px;font-weight:600;color:#059669;background:#ECFDF5;border:1px solid #A7F3D0;border-radius:5px;padding:1px 5px;margin-left:4px;white-space:nowrap">🍽 Mahlzeit</span>`:``;return`<div class="shop-item${e.checked?` checked`:``}">
    <div class="item-check${e.checked?` done`:``}" onclick="window._app.shopToggleCheck('${e.id}')"></div>
    <div class="item-info">
      <span class="item-name${e.checked?` done`:``}">${f(e.name)}</span>
      ${t?`<span class="item-qty-chip">${t}</span>`:``}
      ${n}
    </div>
    <div class="item-actions">
      <button class="item-edit" onclick="window._app.shopEditItem('${e.id}')"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z"/></svg></button>
      <button class="item-fav${e.fav?` active`:``}" onclick="window._app.shopToggleFav('${e.id}')"><svg width="15" height="15" viewBox="0 0 16 16" fill="${e.fav?`#F59E0B`:`none`}" stroke="${e.fav?`#F59E0B`:`currentColor`}" stroke-width="1.3" stroke-linejoin="round"><path d="M8 2l1.8 3.6L14 6.3l-3 2.9.7 4.1L8 11.3l-3.7 2 .7-4.1-3-2.9 4.2-.7z"/></svg></button>
      <button class="item-del" onclick="window._app.shopDeleteItem('${e.id}')"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M2 2l10 10M12 2L2 12"/></svg></button>
    </div>
  </div>`}function Rn(e){let t=e.qty&&e.unit?`${f(String(e.qty))} ${f(e.unit)}`:e.qty?`${f(String(e.qty))}`:``;return`<div class="shop-item">
    <div class="item-info">
      <span class="item-name">${f(e.name)}</span>
      ${t?`<span class="item-qty-chip">${t}</span>`:``}
    </div>
    <div class="item-actions">
      <button class="meal-icon-btn meal-icon-btn-edit" onclick="window._app.shopAddFavToList('${C(e.id)}')" style="width:auto;padding:5px 10px;font-size:12px;font-weight:600;color:#5C4EE5;background:#EEF2FF;border-radius:7px">+ Liste</button>
      <button class="item-del" onclick="window._app.shopToggleFav('${e.id}')"><svg width="15" height="15" viewBox="0 0 16 16" fill="#F59E0B" stroke="#F59E0B" stroke-width="1.3" stroke-linejoin="round"><path d="M8 2l1.8 3.6L14 6.3l-3 2.9.7 4.1L8 11.3l-3.7 2 .7-4.1-3-2.9 4.2-.7z"/></svg></button>
    </div>
  </div>`}function zn(){let{meals:e,mealWeekOffset:t}=E,n=x(),r=new Date,i=new Date(r),a=r.getDay()===0?6:r.getDay()-1;i.setDate(r.getDate()-a+t*7);let o=Array.from({length:7},(e,t)=>{let n=new Date(i);return n.setDate(i.getDate()+t),{iso:n.toISOString().split(`T`)[0],name:d[m(n.getDay())]}}),s=t===0?`Diese Woche`:t===1?`Nächste Woche`:(()=>{let[e,t]=[o[0].iso.split(`-`),o[6].iso.split(`-`)];return`${parseInt(e[2])}.${parseInt(e[1])} – ${parseInt(t[2])}.${parseInt(t[1])}`})(),c=o.some(({iso:t})=>e[t]&&Object.values(e[t]).some(e=>e?.name)),l=[{id:`breakfast`,label:`Frühstück`,short:`Früh`},{id:`lunch`,label:`Mittagessen`,short:`Mittag`},{id:`dinner`,label:`Abendessen`,short:`Abend`}],u=!E.isPremium&&!E.premiumPlan&&![`premium`,`granted`].includes(E._verifiedPlan),p=`<div class="meal-week-header">
    <button class="meal-week-nav" onclick="window._app.${u?`_mealWeekLock`:`setMealWeekOffset`}(${t-1})" style="${u?`opacity:0.35`:``}">‹</button>
    <div class="meal-week-label">${s}${u?` 🔒`:``}</div>
    <button class="meal-week-nav" onclick="window._app.${u?`_mealWeekLock`:`setMealWeekOffset`}(${t+1})" style="${u?`opacity:0.35`:``}">›</button>
  </div>
  <div style="display:flex;gap:8px;padding:0 12px 12px">
    <button onclick="window._app.showRecipeManager()"
      style="flex:1;padding:9px 12px;border:none;border-radius:10px;background:linear-gradient(135deg,#5C4EE5,#7C6EE8);color:white;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:6px">
      🍽️ Meine Rezepte
    </button>
    <button onclick="window._app.showRecipeImportModal()"
      style="flex:1;padding:9px 12px;border:none;border-radius:10px;background:linear-gradient(135deg,#5C4EE5,#7C6EE8);color:white;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:6px">
      ✨ KI-Import
    </button>
  </div>`,h=o.filter(({iso:t})=>{let n=e[t]||{};return[`breakfast`,`lunch`,`dinner`].some(e=>n[e]?.name)}).length,g=Math.round(h/7*100),_=h===0?`Diese Woche noch nichts geplant`:h===7?`Alle Tage geplant 🎉`:h===1?`1 Tag geplant`:`${h} von 7 Tagen geplant`,v=o.map(({iso:e})=>{let t=new Date(e+`T12:00:00`);return t.setDate(t.getDate()-7),t.toISOString().split(`T`)[0]}),y=v.some(t=>e[t]&&Object.values(e[t]).some(e=>e?.name)),b=o.map(({iso:e})=>{let t=new Date(e+`T12:00:00`);return t.setDate(t.getDate()+7),t.toISOString().split(`T`)[0]}),S=b.some(t=>e[t]&&Object.values(e[t]).some(e=>e?.name)),w=new Date(b[0]+`T12:00:00`).toLocaleDateString(`de-DE`,{day:`numeric`,month:`short`})+` Woche`,T=new Date(v[0]+`T12:00:00`).toLocaleDateString(`de-DE`,{day:`numeric`,month:`short`})+` Woche`;return p+=`<div style="background:var(--surface);border-radius:12px;padding:12px 14px;margin-bottom:10px;border:1px solid var(--border)">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
      <span style="font-size:12px;font-weight:600;color:var(--text2)">${_}</span>
      <span style="font-size:12px;font-weight:700;color:${g===100?`#059669`:`#5C4EE5`}">${g}%</span>
    </div>
    <div style="background:var(--border);border-radius:4px;height:6px;overflow:hidden;margin-bottom:10px">
      <div style="height:100%;border-radius:4px;background:${g===100?`#059669`:`#5C4EE5`};width:${g}%;transition:width 0.4s ease"></div>
    </div>
    ${c||y?`<div style="display:flex;gap:8px;margin-bottom:8px">
      ${y?`<button class="meal-transfer-btn" onclick="window._app._mealCopyFromPrevConfirm(${c})">
        ← Von ${f(T)} übernehmen${c?` ⚠️`:``}
      </button>`:``}
      ${c?`<button class="meal-transfer-btn meal-transfer-btn-next" onclick="window._app._mealCopyToNextConfirm(${S})">
        In ${f(w)} kopieren${S?` ⚠️`:``} →
      </button>`:``}
    </div>`:``}

  </div>`,o.forEach(({iso:t,name:r})=>{let i=t===n,a=new Date(t+`T12:00:00`).toLocaleDateString(`de-DE`,{day:`numeric`,month:`short`}),o=e[t]||{};if(!Object.values(o).some(e=>e?.name)){p+=`<div class="meal-day-empty${i?` today`:``}" onclick="window._app.showMealEditModal('${C(t)}','dinner')">
        <span class="meal-day-empty-label${i?` today`:``}">${i?`Heute · `+r:r}</span>
        <span class="meal-day-empty-date">${a}</span>
        <button class="meal-day-empty-add" onclick="event.stopPropagation();window._app.showMealEditModal('${C(t)}','dinner')">＋ Eintragen</button>
      </div>`;return}let s=l.find(e=>e.id===`dinner`),c=l.filter(e=>e.id!==`dinner`),u=`meal-extra-${t}`,d=`meal-toggle-${t}`,m=c.some(e=>o[e.id]?.name),h=(e,t)=>{let{id:n,short:r}=e,i=o[n],a=i?.ingredients?.length>0,s=i?.name?i.name.toLowerCase().replace(/[^a-z0-9äöüß]/g,`_`).slice(0,40):null,c=s&&E.mealRecipes[s]?.steps?.length>0,l=c?E.mealRecipes[s].steps.length:0,u=c?`<button class="meal-icon-btn" onclick="window._app.showRecipeDetailModal('${C(t)}','${n}')"
            title="${l} Zubereitungsschritte"
            style="color:#5C4EE5;font-size:13px;padding:0 4px">📖</button>`:``,d=i?.name&&a?`<button class="meal-icon-btn meal-icon-btn-shop${i.addedToShop?` added`:``}" id="meal-shop-btn-first"
            onclick="window._app.mealIngredientsToShop('${C(t)}','${n}') "
            title="${i.addedToShop?`Bereits hinzugefügt`:`Zutaten zur Einkaufsliste`}">
            <svg width='14' height='14' viewBox='0 0 16 16' fill='none' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><path d='M2 2h2.5l2 8h7l2-6H6'/><circle cx='8' cy='13' r='1'/><circle cx='12' cy='13' r='1'/></svg>
          </button>`:``,p=i?.name?`<path d='M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z'/>`:`<path d='M7 2v10M2 7h10'/>`,m=i?.name?`<button class="meal-icon-btn meal-icon-btn-del" onclick="window._app.deleteMeal('${C(t)}','${n}')">
            <svg width='12' height='12' viewBox='0 0 12 12' fill='none' stroke='currentColor' stroke-width='1.5' stroke-linecap='round'><path d='M1 1l10 10M11 1L1 11'/></svg>
          </button>`:``,h=i?.name&&a?`<span style="font-size:10px;color:${i.addedToShop?`#059669`:`var(--text3)`};margin-top:1px;display:block">
            ${i.ingredients.length} Zutat${i.ingredients.length===1?``:`en`}${i.addedToShop?` · ✓ auf Liste`:``}</span>`:``,g=i?.optionalIngredients?Array.isArray(i.optionalIngredients)?i.optionalIngredients:Object.values(i.optionalIngredients):[],_=i?.selectedOptionals?Array.isArray(i.selectedOptionals)?i.selectedOptionals:Object.values(i.selectedOptionals):[],v=i?.name&&g.length?`<span style="font-size:10px;color:var(--text3);margin-top:1px;display:block">`+g.length+` optional`+(_.length?` · `+_.length+` ausgewählt`:``)+`</span>`:``,y=`meal-slot-${t}-${n}`;return`<div class="meal-slot" id="${y}" ${i?.name?`ontouchstart="window._app._mealSwipeStart(event,'${C(t)}','${n}')"
           ontouchmove="window._app._mealSwipeMove(event,'${y}')"
           ontouchend="window._app._mealSwipeEnd(event,'${C(t)}','${n}','${y}')"`:``} style="overflow:hidden;position:relative">
        <span class="meal-slot-type">${r}</span>
        <div class="meal-slot-content">
          ${i?.name?`<span class="meal-slot-name">${f(i.name)}</span>${h}${v}`:`<span class="meal-slot-empty">Nicht geplant</span>`}
        </div>
        <div class="meal-slot-actions">
          ${u}
          ${d}
          <button class="meal-icon-btn meal-icon-btn-edit" onclick="window._app.showMealEditModal('${C(t)}','${n}')">
            <svg width='14' height='14' viewBox='0 0 14 14' fill='none' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'>${p}</svg>
          </button>
          ${m}
        </div>
      </div>`};p+=`<div class="meal-day-card${i?` today`:``}">
      <div class="meal-day-header" onclick="window._app.toggleMealExtras('${C(t)}')" >
        <span class="meal-day-name${i?` today`:``}">${i?`Heute · `+r:r}</span>
        <span class="meal-day-date">${a}</span>
        <span class="meal-day-toggle" id="${d}" style="margin-left:6px">›</span>
      </div>`,p+=h(s,t),p+=`<div class="meal-extra-slots" id="${u}">`,c.forEach(e=>{p+=h(e,t)}),p+=`</div>`;let g=m?c.filter(e=>o[e.id]?.name).map(e=>o[e.id].name).join(`, `):`+ Frühstück & Mittagessen`;p+=`<button class="meal-more-btn" id="meal-morebtn-${t}" onclick="window._app.toggleMealExtras('${C(t)}')">${g}</button>`,p+=`</div>`}),c||(p+=`<div class="empty" style="padding:30px 20px 10px"><div class="empty-ico">🍽️</div><div class="empty-txt">Noch nichts geplant</div><div class="empty-sub">Tippe auf einen Tag oder ＋ um loszulegen.<br>Zutaten landen direkt auf der Einkaufsliste.</div></div>`),p}function Bn(e){let t=document.getElementById(`meal-extra-${e}`),n=document.getElementById(`meal-toggle-${e}`),r=document.getElementById(`meal-morebtn-${e}`);if(!t)return;let i=t.classList.contains(`open`);if(t.classList.toggle(`open`,!i),n&&n.classList.toggle(`open`,!i),r&&i){let t=[{id:`breakfast`},{id:`lunch`},{id:`dinner`}],n=E.meals[e]||{},i=t.filter(e=>e.id!==`dinner`);r.textContent=i.some(e=>n[e.id]?.name)?i.filter(e=>n[e.id]?.name).map(e=>n[e.id].name).join(`, `):`+ Frühstück & Mittagessen`}}function q(){Gt();let e=document.getElementById(`user-btn`);e&&E.curUser&&(e.textContent=(E.av[E.curUser]||`👤`)+` `+E.curUser);let t=document.getElementById(`scroll-area`);if(!t)return;let n=``;E.tab===`shop`?n=In():E.tab===`meals`?n=zn():E.tab===`cal`?n=Pn():E.tab===`today`?n=bn(E.selISO,E.selDay):E.tab===`overview`&&(n=Fn()),t.innerHTML=n,Re(),window._swipeInit||(window._swipeInit=!0,Jt()),E.curUser||setTimeout(()=>window._app?.showUserModal?.(),400)}function Vn(e){let t=new Set(E.collapsedCats);t.has(e)?t.delete(e):t.add(e),O({collapsedCats:t}),q()}function Hn(e,t){Un(e,t)}function Un(e,t){let n=E.tasks.find(t=>t.id===e);if(!n)return;let r=t||E.selISO,{assignedTo:i,done:a}=L(n,r),o=n.type===`event`,s=e=>{let[t,n,r]=e.split(`-`);return parseInt(r)+`. `+[`Jan`,`Feb`,`Mär`,`Apr`,`Mai`,`Jun`,`Jul`,`Aug`,`Sep`,`Okt`,`Nov`,`Dez`][parseInt(n)-1]+` `+t},c=``;if(n.allDay)c=`<div style="font-size:13px;color:var(--text2);margin:4px 0 8px">
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style="vertical-align:-1px;margin-right:3px"><rect x="1" y="2" width="10" height="9" rx="1.5" stroke="#9ba3af" stroke-width="1.3"/><path d="M1 5h10M4 1v2M8 1v2" stroke="#9ba3af" stroke-width="1.3" stroke-linecap="round"/></svg>
      Ganztägig · ${n.endDate&&n.endDate!==n.date?s(n.date)+` – `+s(n.endDate):s(n.date||r)}
    </div>`;else{let e=s(n.date||r),t=n.endDate&&n.endDate!==n.date?s(n.endDate):null,i=n.time+(n.endTime?` – `+n.endTime:``),a=n.endTime?` (`+S(n.time,n.endTime)+`)`:``;c=`<div style="font-size:13px;color:var(--text2);margin:4px 0 8px">
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style="vertical-align:-1px;margin-right:3px"><circle cx="6" cy="6" r="5" stroke="#9ba3af" stroke-width="1.3"/><path d="M6 3.5V6l1.5 1.5" stroke="#9ba3af" stroke-width="1.3" stroke-linecap="round"/></svg>
      ${t?e+` `+n.time+` – `+t+` `+n.endTime:e+` · `+i+a}
    </div>`}let l=n.location?`<div style="margin:0 0 8px;font-size:13px;color:var(--text2)">
    <span style="cursor:pointer;text-decoration:underline;text-decoration-style:dotted" onclick="window._app.openMaps('${C(n.location)}')">
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style="vertical-align:-1px;margin-right:3px"><path d="M6 1C4.34 1 3 2.34 3 4c0 2.5 3 7 3 7s3-4.5 3-7c0-1.66-1.34-3-3-3z" stroke="#9ba3af" stroke-width="1.3"/><circle cx="6" cy="4" r="1" stroke="#9ba3af" stroke-width="1.3"/></svg>${f(n.location)}
    </span></div>`:``;if(o){let t=n.attendees?.length>0?`
      <div style="margin:10px 0 4px">
        <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px">Teilnehmer</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${n.attendees.map(e=>`<div style="display:flex;align-items:center;gap:5px;background:#F5F3FF;border:1px solid #EDE9FE;border-radius:20px;padding:4px 10px 4px 5px">
            <span style="font-size:18px">${E.photos?.[e]?`<img src="${E.photos[e]}" style="width:22px;height:22px;border-radius:50%;object-fit:cover;vertical-align:middle">`:E.av[e]||`👤`}</span>
            <span style="font-size:13px;font-weight:600;color:var(--text1)">${f(e)}</span>
          </div>`).join(``)}
        </div>
      </div>`:``;U(`
      <div class="modal-handle"></div>
      <div class="modal-title">${n.emoji?n.emoji+` `:``}${f(n.title)}</div>
      <div class="modal-sub">Termin</div>
      ${c}${l}${t}
      <button style="width:100%;margin-top:8px;padding:13px;border:none;border-radius:10px;background:#F0FDF4;color:#059669;font-weight:600;font-size:14px;cursor:pointer;font-family:inherit" onclick="window._app.closeModal();window._app.exportCal('${e}')">📅 Zum Apple Kalender hinzufügen</button>
      <button style="width:100%;margin-top:8px;padding:13px;border:none;border-radius:10px;background:var(--accent-bg);color:var(--accent);font-weight:600;font-size:14px;cursor:pointer;font-family:inherit" onclick="window._app.closeModal();window._app.showEditModal('${e}')"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:6px"><path d="M11 2l3 3-8 8H3v-3l8-8z"/></svg>Bearbeiten</button>
      <button style="width:100%;margin-top:8px;padding:13px;border:none;border-radius:10px;background:#FEF2F2;color:#DC2626;font-weight:600;font-size:14px;cursor:pointer;font-family:inherit" onclick="window._app.closeModal();window._app.deleteTask('${e}','${r}')"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:6px"><path d="M2 4h12M5 4V3h6v1M5.5 7v5M8 7v5M10.5 7v5M3 4l1 9h8l1-9"/></svg>Löschen</button>
      <button class="modal-close" onclick="window._app.closeModal()">Schließen</button>`);return}let u=o?``:`
    <div style="display:flex;gap:8px;margin-bottom:12px">
      <button style="flex:1;padding:10px;border:none;border-radius:10px;background:${a?`#F0FDF4`:`#FEF9C3`};color:${a?`#16a34a`:`#ca8a04`};font-weight:600;font-size:13px;cursor:pointer;font-family:inherit" onclick="window._app.toggleDone('${e}','${r}');window._app.closeModal()">
        ${a?`↩ Als offen markieren`:`✓ Als erledigt markieren`}
      </button>
      ${i?`<button style="padding:10px 14px;border:none;border-radius:10px;background:#FEF2F2;color:#DC2626;font-weight:600;font-size:13px;cursor:pointer;font-family:inherit" onclick="window._app.unassign('${e}','${r}');window._app.closeModal()">× Freigeben</button>`:``}
    </div>`,d=E.members.map(t=>{let n=i===t,a=E.photos?.[t]?`<img src="${E.photos[t]}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;flex-shrink:0">`:`<span style="font-size:20px;line-height:1">${E.av[t]||`👤`}</span>`;return`<button onclick="window._app.assignTask('${e}','${C(t)}','${r}')"
      style="display:flex;align-items:center;gap:8px;padding:8px 14px 8px 8px;border:2px solid ${n?`#5C4EE5`:`#ECEEF2`};border-radius:20px;background:${n?`var(--accent-bg)`:`var(--surface)`};cursor:pointer;font-family:inherit;font-size:13px;font-weight:${n?`700`:`600`};color:${n?`#5C4EE5`:`#374151`};transition:all 0.15s;flex-shrink:0">
      ${a}
      <span>${f(t)}</span>
      ${n?`<span style="font-size:14px;margin-left:2px">✓</span>`:``}
    </button>`}).join(``);U(`
    <div class="modal-handle"></div>
    <div class="modal-title">${n.emoji?n.emoji+` `:``}${f(n.title)}</div>
    ${c}${l}${u}
    <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px">Wer übernimmt?</div>
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:4px">${d}</div>
    <button style="width:100%;margin-top:12px;padding:13px;border:none;border-radius:10px;background:var(--accent-bg);color:var(--accent);font-weight:600;font-size:14px;cursor:pointer;font-family:inherit" onclick="window._app.closeModal();window._app.showEditModal('${e}')"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:6px"><path d="M11 2l3 3-8 8H3v-3l8-8z"/></svg>Bearbeiten</button>
    <button style="width:100%;margin-top:8px;padding:13px;border:none;border-radius:10px;background:#FEF2F2;color:#DC2626;font-weight:600;font-size:14px;cursor:pointer;font-family:inherit" onclick="window._app.closeModal();window._app.deleteTask('${e}','${r}')"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:6px"><path d="M2 4h12M5 4V3h6v1M5.5 7v5M8 7v5M10.5 7v5M3 4l1 9h8l1-9"/></svg>Löschen</button>
    <button class="modal-close" onclick="window._app.closeModal()">Schließen</button>`)}function Wn(e,t){let n=E.tasks.find(t=>t.id===e);if(!n)return;let r=t&&n.recurring!==`once`?e+`_`+t:e;U(`<div class="modal-handle"></div>
    <div class="modal-title">${n.emoji?n.emoji+` `:``}${f(n.title)}</div>
    <div class="modal-sub" style="margin-bottom:14px">Kommentare</div>
    <div class="cmt-list" id="cmt-list">${(()=>{let e=E.taskComments[r]||{},t=Object.entries(e).sort((e,t)=>e[1].ts-t[1].ts);return t.length?t.map(([,e])=>{let t=new Date(e.ts).toLocaleTimeString(`de`,{hour:`2-digit`,minute:`2-digit`}),n=new Date(e.ts).toLocaleDateString(`de`,{day:`2-digit`,month:`2-digit`});return`<div class="cmt-row"><div class="cmt-av">${E.av[e.author]||`👤`}</div><div class="cmt-bubble"><div class="cmt-name">${f(e.author)}</div><div class="cmt-text">${f(e.text)}</div><div class="cmt-time">${n} · ${t}</div></div></div>`}).join(``):`<div class="cmt-empty">Noch keine Kommentare 💬</div>`})()}</div>
    <div class="cmt-input-row">
      <div class="cmt-av">${E.av[E.curUser]||`👤`}</div>
      <input class="cmt-input" id="cmt-input" maxlength="1000" placeholder="Kommentar schreiben…" onkeydown="if(event.key==='Enter')window._app.submitComment('${r}')"/>
      <button class="cmt-send" onclick="window._app.submitComment('${r}')">↑</button>
    </div>
    <button class="modal-close" onclick="window._app.closeModal()" style="margin-top:10px">Schließen</button>`),setTimeout(()=>document.getElementById(`cmt-input`)?.focus(),350)}var Gn=n((()=>{_(),D(),w(),xe(),We(),V(),W(),$t(),Ae(),hn()}));zt(),Gn();var Kn=e({exitDemoMode:()=>or,obAddTemplates:()=>$n,obCreateFamily:()=>Xn,obCreateProfile:()=>Qn,obFinish:()=>tr,obGoTo:()=>J,obJoinFamily:()=>Zn,obSelectEmoji:()=>Jn,obShareInvite:()=>er,obShowDemo:()=>ar,onFabClick:()=>ir,shareInviteLink:()=>nr,showFamilySetup:()=>Yn,showInstallPrompt:()=>rr});_(),D(),w(),A(),V(),W(),F();function J(e){O({obCurrentSlide:e});let t=document.getElementById(`ob-slides`);t&&(t.style.transform=`translateX(-${e*100}%)`);let n=document.getElementById(`ob-progress-fill`);if(n){let t=e===0?0:e===1?20:e===2?40:e===3?70:e===4?40:100;n.style.width=t+`%`}e===2&&setTimeout(()=>document.getElementById(`ob-family-name`)?.focus(),400),e===3&&(qn(),setTimeout(()=>document.getElementById(`ob-profile-name`)?.focus(),400)),e===4&&setTimeout(()=>document.getElementById(`ob-join-id`)?.focus(),400)}function qn(){let e=document.getElementById(`ob-emoji-grid`);e&&(e.innerHTML=s.map(e=>`<button class="ob-emoji-btn${E.obSelectedEmoji===e?` sel`:``}"
      onclick="window._app.obSelectEmoji('${e}')">${e}</button>`).join(``))}function Jn(e){O({obSelectedEmoji:e}),document.querySelectorAll(`#ob-emoji-grid .ob-emoji-btn`).forEach(t=>{t.classList.toggle(`sel`,t.textContent===e)})}function Yn(){let e=document.getElementById(`name-screen`);e&&e.remove();let t=document.getElementById(`auth-screen`);t&&(t.style.display=`none`);let n=document.getElementById(`family-screen`);n&&(n.style.display=`flex`),J(0)}async function Xn(){let e=(document.getElementById(`ob-family-name`)?.value||``).trim(),t=document.getElementById(`ob-create-err`);if(!e){t&&(t.textContent=`Bitte einen Familiennamen eingeben`);return}t&&(t.textContent=``);let n=y();try{await N(`${T}/families/${n}/meta.json`,{method:`PUT`,body:JSON.stringify({name:e,created:Date.now()})})}catch{t&&(t.textContent=`Verbindungsfehler. Bitte erneut versuchen.`);return}O({familyId:n,familyName:e}),localStorage.setItem(`fp_family_id`,n),localStorage.setItem(`fp_family_name`,e),localStorage.setItem(`fp_family_role`,`creator`),window.history.replaceState({},``,window.location.pathname),await ft();try{await N(`${T}/admin/familyIndex/${n}.json`,{method:`PUT`,body:JSON.stringify({name:e,created:Date.now()})})}catch{}await ie(),fetch(`${a}/push/send`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({familyId:h,type:`default`,payload:{text:`🎉 Neue Familie: „${e}“ (${n})`}})}).catch(()=>{}),J(5)}async function Zn(){let e=(document.getElementById(`ob-join-id`)?.value||``).trim().toUpperCase(),t=document.getElementById(`ob-join-err`);if(!e||e.length<6){t&&(t.textContent=`Bitte eine gültige Familien-ID eingeben`);return}t&&(t.textContent=`Wird gesucht…`);try{let n=await(await N(`${T}/families/${e}/meta.json`)).json();if(!n){t&&(t.textContent=`Familie nicht gefunden. ID prüfen.`);return}let r=n.name||e;O({familyId:e,familyName:r}),localStorage.setItem(`fp_family_id`,e),localStorage.setItem(`fp_family_name`,r),localStorage.setItem(`fp_family_role`,`member`),window.history.replaceState({},``,window.location.pathname),await ft(),t&&(t.textContent=``),J(5)}catch{t&&(t.textContent=`Fehler beim Verbinden.`)}}async function Qn(){let e=(document.getElementById(`ob-profile-name`)?.value||``).trim(),t=document.getElementById(`ob-profile-err`);if(!e){t&&(t.textContent=`Bitte einen Namen eingeben`);return}if(t&&(t.textContent=``),!await B(`member`))return;await _t(e,E.obSelectedEmoji||`🧑`,!0,B),O({curUser:e});try{localStorage.setItem(`fp_user`,e)}catch{}let n=document.getElementById(`ob-done-sub`);n&&(n.textContent=`Hallo ${E.obSelectedEmoji} ${e}! Willkommen bei famiplan.`),J(5)}async function $n(){let{familyId:e,curUser:t}=E;if(!e||e===`DEMO01`)return;let n=x(),r=[`Montag`,`Dienstag`,`Mittwoch`,`Donnerstag`,`Freitag`,`Samstag`,`Sonntag`][m(new Date().getDay())];for(let e of[{title:`Hausaufgaben kontrollieren`,emoji:`📚`,time:`16:00`,endTime:`16:30`,recurring:`daily`,weekdays:[0,1,2,3,4],type:`task`},{title:`Wäsche waschen`,emoji:`🧺`,time:`09:00`,endTime:``,recurring:`weekly`,weekdays:[],type:`task`},{title:`Wocheneinkauf`,emoji:`🛒`,time:`10:00`,endTime:`11:00`,recurring:`weekly`,weekdays:[],type:`task`},{title:`Mülleimer rausstellen`,emoji:`🗑`,time:`19:00`,endTime:``,recurring:`weekly`,weekdays:[],type:`task`}]){let i=new Uint8Array(4);crypto.getRandomValues(i),await M(`tasks/${`t_`+Array.from(i).map(e=>e.toString(16).padStart(2,`0`)).join(``)}`,{...e,date:n,day:r,color:`#667eea`,recurringInterval:1,assignments:{},location:``,createdBy:t})}H(`4 Vorlagen-Aufgaben angelegt ✨`)}function er(){let{familyId:e,familyName:t}=E;if(!e||e===`DEMO01`)return;let n=`${location.origin}/join.html?id=${e}&name=${encodeURIComponent(t)}`,r=`Hey! Ich nutze famiplan für unsere Familienplanung. Tritt hier bei: ${n}`;navigator.share?navigator.share({title:`famiplan – Einladung`,text:r,url:n}).catch(()=>{}):/android|iphone|ipad/i.test(navigator.userAgent)?window.open(`https://wa.me/?text=${encodeURIComponent(r)}`):navigator.clipboard?.writeText(n).then(()=>H(`Link kopiert! 📋`)).catch(()=>H(`Link: `+n))}function tr(){let e=document.getElementById(`family-screen`);e&&(e.style.transition=`opacity 0.4s`,e.style.opacity=`0`,setTimeout(()=>e.style.display=`none`,400));let{familyId:t,familyName:n,curUser:r,av:i}=E,a=document.getElementById(`family-info-bar`),o=document.getElementById(`family-name-display`),s=document.getElementById(`family-id-display`);a&&(a.style.display=`none`),o&&(o.textContent=n),s&&(s.textContent=t);let c=document.getElementById(`user-btn`);c&&(c.textContent=(i[r]||`👤`)+` `+r),Promise.all([I(()=>Promise.resolve().then(()=>(Gn(),gn)).then(e=>{I(()=>import(`./tasks-u2ACPD6L.js`).then(e=>(e.s(),e.h)).then(t=>t.loadTasks(e.renderContent,()=>{})),__vite__mapDeps([8,1,2,3,0,7,9,5])),I(()=>import(`./shopping-jp0CsUb_.js`).then(e=>(e.n(),e.p)).then(t=>t.loadShopping(e.renderContent)),__vite__mapDeps([6,1,2,3,0,7,5])),I(()=>Promise.resolve().then(()=>(zt(),Tt)).then(t=>t.loadMeals(e.renderContent)),void 0),I(()=>import(`./board-C_7hY_L_.js`).then(e=>(e.f(),e.d)).then(t=>t.loadBoard(e.renderContent,()=>{})),__vite__mapDeps([10,1,2,3,0,4,5]))}),void 0)]),rr(),setTimeout(()=>window._app?.setTab?.(`today`),1200)}function nr(){G();let{familyId:e,familyName:t}=E;if(!e)return;let n=`${location.origin}/join.html?id=${e}&name=${encodeURIComponent(t)}`,r=`Hey! 👋 Ich nutze famiplan für unsere Familienplanung – Aufgaben, Termine & Einkauf auf einen Blick.\n\nTritt hier bei: ${n}`;if(navigator.share){navigator.share({title:`famiplan – Familieneinladung`,text:r,url:n}).catch(()=>{});return}U(`
    <div class="modal-handle"></div>
    <div class="modal-title">🔗 Familie einladen</div>
    <div class="modal-sub">Teile diesen Link mit deiner Familie</div>
    <div style="background:#F5F3FF;border-radius:12px;padding:12px 14px;margin-bottom:16px;word-break:break-all;font-size:12px;color:#5C4EE5;font-weight:600;border:1px solid #EDE9FE">${n}</div>
    <a href="https://wa.me/?text=${encodeURIComponent(r)}" target="_blank"
      style="display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:14px;background:#25D366;color:white;border:none;border-radius:14px;font-size:15px;font-weight:800;cursor:pointer;font-family:inherit;text-decoration:none;margin-bottom:10px">
      <span style="font-size:20px">💬</span> Per WhatsApp teilen
    </a>
    <button onclick="navigator.clipboard?.writeText('${n}').then(()=>window._app.showSync('Link kopiert! 📋'))"
      style="width:100%;padding:13px;background:#EEF2FF;color:#5C4EE5;border:none;border-radius:14px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;margin-bottom:10px">
      📋 Link kopieren
    </button>
    <button class="modal-close" onclick="window._app.closeModal()">Schließen</button>
  `)}function rr(){if(localStorage.getItem(`fp_install_shown`)||localStorage.getItem(`fp_demo_mode`)||window.matchMedia(`(display-mode: standalone)`).matches)return;localStorage.setItem(`fp_install_shown`,`1`);let e=/iphone|ipad|ipod/i.test(navigator.userAgent),t=/android/i.test(navigator.userAgent),n=e?`iPhone/iPad`:t?`Android`:`Desktop`,r=``;r=e?`
      <div class="install-step"><div class="install-ico">1</div><div class="install-txt">Tippe auf das <strong>Teilen-Symbol</strong> <span style="font-size:16px">⬆️</span> unten in Safari</div></div>
      <div class="install-step"><div class="install-ico">2</div><div class="install-txt">Wähle <strong>„Zum Home-Bildschirm"</strong> <span style="font-size:16px">➕</span></div></div>
      <div class="install-step"><div class="install-ico">3</div><div class="install-txt">Tippe oben rechts auf <strong>„Hinzufügen"</strong></div></div>`:t?`
      <div class="install-step"><div class="install-ico">1</div><div class="install-txt">Tippe oben rechts auf das <strong>Menü ⋮</strong> in Chrome</div></div>
      <div class="install-step"><div class="install-ico">2</div><div class="install-txt">Wähle <strong>„App installieren"</strong></div></div>
      <div class="install-step"><div class="install-ico">3</div><div class="install-txt">Tippe auf <strong>„Installieren"</strong> – fertig!</div></div>`:`
      <div class="install-step"><div class="install-ico">1</div><div class="install-txt">Klicke in der Adressleiste auf das <strong>Install-Symbol</strong> ⊕</div></div>
      <div class="install-step"><div class="install-ico">2</div><div class="install-txt">Klicke auf <strong>„Installieren"</strong></div></div>`,setTimeout(()=>U(`
    <div class="modal-handle"></div>
    <div style="text-align:center;margin-bottom:16px">
      <div style="font-size:48px;margin-bottom:8px">📲</div>
      <div class="modal-title">App installieren</div>
      <div class="modal-sub">Füge famiplan zum Homescreen hinzu.</div>
    </div>
    <div style="background:#F5F3FF;border-radius:14px;padding:16px;margin-bottom:16px">
      <div style="font-size:11px;font-weight:700;color:#8b5cf6;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:12px">${n}</div>
      <div style="display:flex;flex-direction:column;gap:10px">${r}</div>
    </div>
    <button class="submit-btn" onclick="window._app.closeModal()">Verstanden ✓</button>
    <button class="modal-close" onclick="window._app.closeModal()">Später</button>
  `),1e3)}function ir(){let{tab:e,selISO:t,calSelISO:n}=E;if(e===`shop`){window._app.showShopAddModal();return}if(e===`meals`){I(()=>Promise.resolve().then(()=>($(),Z)).then(e=>e.showMealEditModal(x(),`dinner`)),void 0);return}let r=e===`cal`?n:t;O({fd:{...E.fd,date:r,day:u(r)}}),I(()=>Promise.resolve().then(()=>($(),Z)).then(e=>e.showAddModal()),void 0)}function ar(){let e=x(),t=[`Montag`,`Dienstag`,`Mittwoch`,`Donnerstag`,`Freitag`,`Samstag`,`Sonntag`][m(new Date().getDay())],n=t=>{let n=new Date(e+`T12:00:00`);return n.setDate(n.getDate()+t),n.toISOString().split(`T`)[0]},r=n(1),i=n(2),a=n(3);O({familyId:`DEMO01`,familyName:`Familie Demo`,members:[`Mama`,`Papa`,`Lea`],av:{Mama:`👩`,Papa:`👨`,Lea:`👧`},memberColorMap:{Mama:`#5C4EE5`,Papa:`#E53E3E`,Lea:`#38A169`},curUser:`Mama`,dayNotes:{[e]:`Heute: Lea hat Schulausflug! 🚌`},tasks:[{id:`demo1`,title:`Lea zur Schule bringen`,emoji:`🎒`,date:e,day:t,time:`07:30`,endTime:`08:00`,recurring:`daily`,recurringInterval:1,weekdays:[0,1,2,3,4],type:`event`,color:`#5C4EE5`,assignments:{[e]:{assignedTo:`Papa`,done:!0}},location:`Grundschule`,createdBy:`Mama`},{id:`demo2`,title:`Einkauf Rewe`,emoji:`🛒`,date:e,day:t,time:`10:00`,endTime:``,recurring:`once`,recurringInterval:1,weekdays:[],type:`task`,color:`#E53E3E`,assignments:{[e]:{assignedTo:`Mama`,done:!1}},location:`Rewe`,createdBy:`Mama`},{id:`demo3`,title:`Hausaufgaben kontrollieren`,emoji:`📚`,date:e,day:t,time:`15:00`,endTime:`15:30`,recurring:`daily`,recurringInterval:1,weekdays:[0,1,2,3,4],type:`task`,color:`#667eea`,assignments:{[e]:{assignedTo:`Papa`,done:!1}},location:``,createdBy:`Mama`},{id:`demo4`,title:`Fußballtraining Lea`,emoji:`⚽`,date:e,day:t,time:`16:30`,endTime:`18:00`,recurring:`weekly`,recurringInterval:1,weekdays:[],type:`event`,color:`#38A169`,assignments:{[e]:{assignedTo:`Papa`,done:!1}},location:`Sportplatz Nord`,createdBy:`Papa`},{id:`demo5`,title:`Abendessen kochen`,emoji:`🍝`,date:e,day:t,time:`18:30`,endTime:`19:00`,recurring:`once`,recurringInterval:1,weekdays:[],type:`task`,color:`#F59E0B`,assignments:{[e]:{assignedTo:`Mama`,done:!1}},location:``,createdBy:`Mama`},{id:`demo6`,title:`Zahnarzt Lea`,emoji:`🦷`,date:r,day:u(r),time:`09:00`,endTime:`09:30`,recurring:`once`,recurringInterval:1,weekdays:[],type:`event`,color:`#EC4899`,assignments:{},location:`Dr. Müller Praxis`,createdBy:`Mama`},{id:`demo7`,title:`Müll rausbringen`,emoji:`🗑️`,date:r,day:u(r),time:`07:00`,endTime:``,recurring:`weekly`,recurringInterval:1,weekdays:[],type:`task`,color:`#6B7280`,assignments:{},location:``,createdBy:`Papa`},{id:`demo8`,title:`Elternabend`,emoji:`🏫`,date:i,day:u(i),time:`19:30`,endTime:`21:00`,recurring:`once`,recurringInterval:1,weekdays:[],type:`event`,color:`#5C4EE5`,assignments:{},location:`Grundschule Aula`,createdBy:`Mama`},{id:`demo9`,title:`Geburtstag Oma`,emoji:`🎂`,date:a,day:u(a),time:`14:00`,endTime:`17:00`,recurring:`yearly`,recurringInterval:1,weekdays:[],type:`event`,color:`#EC4899`,assignments:{},location:``,createdBy:`Mama`},{id:`demotodo1`,title:`Urlaub buchen`,emoji:`✈️`,openTodo:!0,time:`12:00`,color:`#F59E0B`,assignments:{},recurring:`once`,recurringInterval:1,weekdays:[],type:`task`,createdBy:`Mama`,visibleTo:`all`}],shopItems:[{id:`si1`,name:`Milch`,qty:2,unit:`L`,category:`milch`,list:`Wocheneinkauf`,checked:!1,fav:!0,addedAt:Date.now()-36e5},{id:`si2`,name:`Äpfel`,qty:6,unit:``,category:`obst`,list:`Wocheneinkauf`,checked:!1,fav:!1,addedAt:Date.now()-32e5},{id:`si3`,name:`Hackfleisch`,qty:500,unit:`g`,category:`fleisch`,list:`Wocheneinkauf`,checked:!1,fav:!1,addedAt:Date.now()-28e5},{id:`si4`,name:`Pasta`,qty:2,unit:`Pck`,category:`sonstiges`,list:`Wocheneinkauf`,checked:!0,fav:!0,addedAt:Date.now()-24e5},{id:`si5`,name:`Dosentomaten`,qty:3,unit:`Dose`,category:`sonstiges`,list:`Wocheneinkauf`,checked:!1,fav:!1,addedAt:Date.now()-2e6},{id:`si6`,name:`Brot`,qty:1,unit:``,category:`brot`,list:`Wocheneinkauf`,checked:!0,fav:!0,addedAt:Date.now()-16e5},{id:`si7`,name:`Spülmittel`,qty:1,unit:``,category:`haushalt`,list:`Wocheneinkauf`,checked:!1,fav:!1,addedAt:Date.now()-12e5}],shopLists:[`Wocheneinkauf`],activeShopList:`Wocheneinkauf`,meals:{[e]:{breakfast:{name:`Müsli mit Früchten`,ingredients:[`Haferflocken`,`Milch`,`Banane`],savedAt:Date.now()},lunch:null,dinner:{name:`Spaghetti Bolognese`,ingredients:[`Hackfleisch 500g`,`Pasta 400g`,`Dosentomaten 1 Dose`,`Zwiebeln 2`,`Knoblauch 3 Zehen`,`Olivenöl 2 EL`],recipeId:`r1`,savedAt:Date.now()}},[r]:{breakfast:{name:`Pfannkuchen`,ingredients:[`Mehl 200g`,`Eier 2`,`Milch 300ml`,`Butter 1 EL`],recipeId:`r2`,savedAt:Date.now()},lunch:{name:`Reste vom Vortag`,ingredients:[],savedAt:Date.now()},dinner:null},[i]:{breakfast:null,lunch:null,dinner:{name:`Pizzaabend 🍕`,ingredients:[`Pizzateig`,`Tomatensoße`,`Mozzarella`,`Salami`],savedAt:Date.now()}}},mealRecipes:{r1:{name:`Spaghetti Bolognese`,ingredients:[`Hackfleisch 500g`,`Pasta 400g`,`Dosentomaten 1 Dose`,`Zwiebeln 2`,`Knoblauch 3 Zehen`,`Olivenöl 2 EL`],prepTime:35,servings:4,useCount:5,usedAt:Date.now()-864e5,steps:[`Zwiebeln und Knoblauch fein hacken und in Olivenöl glasig dünsten.`,`Hackfleisch dazugeben und krümelig anbraten bis es gebräunt ist.`,`Dosentomaten hinzufügen, salzen und pfeffern. 20 Minuten köcheln lassen.`,`Pasta nach Packungsanleitung al dente kochen. Mit der Soße servieren.`]},r2:{name:`Pfannkuchen`,ingredients:[`Mehl 200g`,`Eier 2`,`Milch 300ml`,`Butter 1 EL`,`Zucker 1 TL`,`Prise Salz`],prepTime:20,servings:4,useCount:3,usedAt:Date.now()-1728e5,steps:[`Mehl, Eier, Milch, Zucker und Salz zu einem glatten Teig verrühren. 10 Minuten quellen lassen.`,`Butter in einer Pfanne erhitzen und den Teig portionsweise ausbacken.`,`Jeden Pfannkuchen goldbraun von beiden Seiten backen und warm halten.`]},r3:{name:`Hühnchen-Curry`,ingredients:[`Hähnchenbrustfilet 600g`,`Kokosmilch 400ml`,`Currypaste 2 EL`,`Paprika 2`,`Zwiebel 1`,`Reis 300g`],prepTime:30,servings:4,useCount:2,usedAt:Date.now()-2592e5,steps:[`Hähnchen in Würfel schneiden, Paprika und Zwiebel klein schneiden.`,`Zwiebel anbraten, Currypaste kurz mitrösten, dann Hähnchen dazugeben.`,`Kokosmilch und Paprika hinzufügen, 15 Minuten köcheln lassen.`,`Reis nach Packungsanleitung kochen und zusammen servieren.`]},r4:{name:`Gemüse-Frittata`,ingredients:[`Eier 6`,`Zucchini 1`,`Paprika 1`,`Zwiebel 1`,`Parmesan 50g`,`Olivenöl 2 EL`,`Salz`,`Pfeffer`],prepTime:25,servings:3,useCount:1,usedAt:Date.now()-432e6,steps:[`Gemüse in kleine Würfel schneiden und in Olivenöl 5 Minuten anbraten.`,`Eier mit Parmesan, Salz und Pfeffer verquirlen und über das Gemüse gießen.`,`Bei mittlerer Hitze stocken lassen, dann unter dem Grill 3–4 Minuten überbacken.`]}},boardPosts:{bp1:{author:`Papa`,text:`Lea hat heute ihr erstes Tor beim Training geschossen! 🥳⚽`,ts:Date.now()-36e5*2,reactions:{uid_mama:`❤️`,uid_lea:`🙌`}},bp2:{author:`Mama`,text:`Bett wird am 15. geliefert – bitte jemand zuhause sein! 🛏️`,ts:Date.now()-36e5*14,reactions:{uid_papa:`👍`}},bp3:{author:`Lea`,text:`Kann ich heute Abend noch eine Stunde länger aufbleiben? 🙏😇`,ts:Date.now()-36e5*20,reactions:{}}}}),localStorage.setItem(`fp_family_id`,`DEMO01`),localStorage.setItem(`fp_family_name`,`Familie Demo`),localStorage.setItem(`fp_demo_mode`,`1`);try{localStorage.setItem(`fp_user`,`Mama`)}catch{}at();let o=document.getElementById(`family-screen`);o&&(o.style.transition=`opacity 0.4s`,o.style.opacity=`0`,setTimeout(()=>o.style.display=`none`,400));let s=document.getElementById(`family-info-bar`),c=document.getElementById(`family-name-display`),l=document.getElementById(`family-id-display`);s&&(s.style.display=`none`),c&&(c.textContent=`Familie Demo`),l&&(l.textContent=`DEMO01`);let d=document.getElementById(`user-btn`);d&&(d.textContent=`👩 Mama`),window._app?.renderContent();let f=document.createElement(`div`);f.id=`demo-banner`,f.style.cssText=`position:fixed;top:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;background:#F59E0B;color:white;text-align:center;padding:10px 16px;font-size:13px;font-weight:700;z-index:500;display:flex;align-items:center;justify-content:space-between;gap:8px;box-shadow:0 2px 8px rgba(0,0,0,0.15)`,f.innerHTML=`<span>👀 Demo-Modus</span><button onclick="window._app.exitDemoMode()" style="background:var(--surface);color:#F59E0B;border:none;border-radius:8px;padding:5px 12px;font-size:12px;font-weight:800;cursor:pointer;font-family:inherit">Registrieren →</button>`,document.body.appendChild(f);let p=document.getElementById(`scroll-area`);p&&(p.style.paddingTop=`62px`)}function or(){[`fp_family_id`,`fp_family_name`,`fp_user`,`fp_demo_mode`].forEach(e=>localStorage.removeItem(e)),location.reload()}_(),D(),w(),xe(),A(),W(),V();function sr(){try{return JSON.parse(localStorage.getItem(`fp_push_settings`)||`{}`)}catch{return{}}}function cr(e){try{localStorage.setItem(`fp_push_settings`,JSON.stringify(e))}catch{}}function Y(e,t){let n=sr();return n[e]===void 0?t:n[e]}function X(e,t){let n=sr();n[e]=t,cr(n)}function lr(e){let t=e.trim().replace(/-/g,`+`).replace(/_/g,`/`),n=`=`.repeat((4-t.length%4)%4),r=atob(t+n),i=new Uint8Array(r.length);for(let e=0;e<r.length;e++)i[e]=r.charCodeAt(e);return i}async function ur(e){let{currentAuthUser:t,familyId:n,curUser:r}=E;if(!(!t||!n))try{let i={subscription:e.toJSON?e.toJSON():e,memberName:r||``,reminderMinutes:Y(`reminderMinutes`,30),reminderEnabled:Y(`reminderEnabled`,!0),dailyEnabled:Y(`dailyEnabled`,!0),dailyHour:Y(`dailyHour`,7),updatedAt:Date.now()};await N(`${T}/families/${n}/pushSubscriptions/${t.uid}.json`,{method:`PUT`,body:JSON.stringify(i)})}catch(e){console.warn(`Save subscription error:`,e)}}async function dr(){try{let e=await(await navigator.serviceWorker.ready).pushManager.getSubscription();e&&await e.unsubscribe();let{currentAuthUser:t,familyId:n}=E;if(t&&n){let e=await ne().catch(()=>null),r={"Content-Type":`application/json`};e&&(r.Authorization=`Bearer `+e),await fetch(`${a}/push/unsubscribe`,{method:`POST`,headers:r,body:JSON.stringify({familyId:n,uid:t.uid})})}X(`enabled`,!1),H(`🔕 Push-Benachrichtigungen deaktiviert.`)}catch(e){console.error(`Disable push error:`,e)}}async function fr(e,t,n={}){let{familyId:r,currentAuthUser:i}=E;if(!(!r||!i))try{let o=await ne(),s={"Content-Type":`application/json`};o&&(s.Authorization=`Bearer `+o),await fetch(`${a}/push/send`,{method:`POST`,headers:s,body:JSON.stringify({familyId:r,type:e,payload:t,excludeUid:n.excludeSelf?i.uid:void 0,targetUid:n.targetUid||void 0})})}catch(e){console.warn(`Push send error:`,e)}}function pr(e,t,n={}){!(`Notification`in window)||Notification.permission!==`granted`||navigator.serviceWorker.ready.then(r=>{r.showNotification(e,{body:t,icon:`/icon-192.png`,badge:`/icon-192.png`,vibrate:[200,100,200],tag:n.tag||`famiplan`,data:n.data||{url:`/`}})})}function mr(){if(E._reminderTimers.forEach(e=>clearTimeout(e)),E._reminderTimers=[],!Y(`enabled`,!1)||!Y(`reminderEnabled`,!0)||!E.curUser||!E.tasks.length)return;let e=Y(`reminderMinutes`,30),t=Date.now(),n=x(),r=d[m(new Date().getDay())];E.tasks.filter(e=>!e.openTodo&&R(e,r,n)).forEach(r=>{if(!r.time)return;let[i,a]=r.time.split(`:`).map(Number),o=new Date;o.setHours(i,a,0,0);let s=o.getTime()-e*6e4;if(s<=t||s-t>864e5)return;let c=setTimeout(()=>{let t=L(r,n);t.done||t.assignedTo&&t.assignedTo!==E.curUser||pr(r.type===`event`?`⏰ Termin in ${e} Min.`:`⏰ Erinnerung in ${e} Min.`,`${r.emoji} ${r.title}${r.location?` · `+r.location:``}`,{tag:`reminder-${r.id}`,data:{url:`/`,taskId:r.id}})},s-t);E._reminderTimers.push(c)}),hr()}function hr(){if(!Y(`dailyEnabled`,!0))return;let e=Y(`dailyHour`,7),t=new Date,n=new Date;n.setHours(e,0,0,0),n<=t&&n.setDate(n.getDate()+1);let r=n-t;if(r>864e5)return;let i=setTimeout(async()=>{let e=x(),t=d[m(new Date().getDay())],n=E.tasks.filter(n=>!n.openTodo&&R(n,t,e)).filter(t=>{let n=L(t,e);return!n.done&&(!n.assignedTo||n.assignedTo===E.curUser)});n.length&&await fr(`daily`,{dateLabel:new Date().toLocaleDateString(`de`,{weekday:`long`,day:`numeric`,month:`long`}),summary:n.length===1?`${n[0].emoji} ${n[0].title}`:`${n.length} Aufgaben – z.B. ${n[0].emoji} ${n[0].title}`})},r);E._reminderTimers.push(i)}function gr(e,t){let n=!Y(e,!0);X(e,n),t.style.background=n?`#5C4EE5`:`#D1D5DB`;let r=t.querySelector(`span`);r&&(r.style.left=n?``:`3px`,r.style.right=n?`3px`:``)}function _r(){let e=document.createElement(`div`);e.id=`push-page`,e.style.cssText=`position:fixed;inset:0;background:#5C4EE5;z-index:999;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:max(env(safe-area-inset-top),48px) 20px max(env(safe-area-inset-bottom,0px),80px);`;let t=`Notification`in window&&`PushManager`in window?Notification.permission:`denied`,n=Y(`enabled`,!1),r=Y(`reminderMinutes`,30),i=Y(`dailyEnabled`,!0),a=Y(`dailyHour`,7);Y(`assignEnabled`,!0),Y(`commentEnabled`,!0),Y(`boardEnabled`,!0);let s=Y(`reminderEnabled`,!0),c=e=>`width:44px;height:26px;border-radius:13px;border:none;background:${e?`#5C4EE5`:`#D1D5DB`};position:relative;cursor:pointer;flex-shrink:0`,l=e=>`<span style="position:absolute;top:3px;${e?`right:3px`:`left:3px`};width:20px;height:20px;border-radius:50%;background:var(--surface);display:block"></span>`,u=(e,t,n,r,i)=>`
    <div style="padding:14px 16px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border2,#F5F6FA)">
      <div><div style="font-size:13px;font-weight:600;color:var(--text1)">${t}</div><div style="font-size:11px;color:var(--text2)">${n}</div></div>
      <button id="${e}" style="${c(Y(r,i))}">${l(Y(r,i))}</button>
    </div>`,d=localStorage.getItem(`fp_dark_mode`)||`system`;e.innerHTML=`
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:28px">
      <div style="font-size:22px;font-weight:800;color:white">🔔 Benachrichtigungen</div>
      <button id="push-done-btn" style="background:rgba(255,255,255,0.2);border:none;border-radius:20px;padding:8px 16px;color:white;font-weight:700;font-size:14px;cursor:pointer;font-family:inherit">Fertig</button>
    </div>

    <div style="background:var(--surface);border-radius:16px;padding:18px;margin-bottom:16px">
      <div style="font-size:14px;font-weight:700;color:var(--text1);margin-bottom:10px">📍 Region</div>
      <label style="font-size:12px;color:var(--text2);display:block;margin-bottom:6px">Bundesland für Feiertage & Schulferien</label>
      <select id="bl-select" onchange="window._app.setBundesland(this.value)"
        style="width:100%;padding:10px;border-radius:10px;border:1.5px solid var(--border);background:var(--input-bg);color:var(--text1);font-size:13px;font-family:inherit">
        ${[[`BW`,`Baden-Württemberg`],[`BY`,`Bayern`],[`BE`,`Berlin`],[`BB`,`Brandenburg`],[`HB`,`Bremen`],[`HH`,`Hamburg`],[`HE`,`Hessen`],[`MV`,`Mecklenburg-Vorpommern`],[`NI`,`Niedersachsen`],[`NW`,`Nordrhein-Westfalen`],[`RP`,`Rheinland-Pfalz`],[`SL`,`Saarland`],[`SN`,`Sachsen`],[`ST`,`Sachsen-Anhalt`],[`SH`,`Schleswig-Holstein`],[`TH`,`Thüringen`]].map(([e,t])=>`<option value="${e}" ${(localStorage.getItem(`fp_bundesland`)||`NW`)===e?`selected`:``}>${t}</option>`).join(``)}
      </select>
    </div>

    <div style="background:var(--surface);border-radius:16px;padding:18px;margin-bottom:16px">
      <div style="font-size:14px;font-weight:700;color:var(--text1);margin-bottom:4px">🌙 Darstellung</div>
      <div style="display:flex;gap:6px;margin-top:10px">
        <button id="dm-light" style="flex:1;padding:10px 6px;border:1.5px solid ${d===`light`?`#5C4EE5`:`var(--border)`};border-radius:10px;background:${d===`light`?`#EEF2FF`:`#F5F6FA`};color:${d===`light`?`#5C4EE5`:`#6b7280`};font-weight:600;font-size:12px;cursor:pointer;font-family:inherit">☀️ Hell</button>
        <button id="dm-system" style="flex:1;padding:10px 6px;border:1.5px solid ${d===`system`?`#5C4EE5`:`var(--border)`};border-radius:10px;background:${d===`system`?`#EEF2FF`:`#F5F6FA`};color:${d===`system`?`#5C4EE5`:`#6b7280`};font-weight:600;font-size:12px;cursor:pointer;font-family:inherit">📱 Auto</button>
        <button id="dm-dark" style="flex:1;padding:10px 6px;border:1.5px solid ${d===`dark`?`#5C4EE5`:`var(--border)`};border-radius:10px;background:${d===`dark`?`#EEF2FF`:`#F5F6FA`};color:${d===`dark`?`#5C4EE5`:`#6b7280`};font-weight:600;font-size:12px;cursor:pointer;font-family:inherit">🌙 Dunkel</button>
      </div>
    </div>

    <div style="background:var(--surface);border-radius:16px;padding:18px;margin-bottom:16px">
      <div style="font-size:14px;font-weight:700;color:var(--text1);margin-bottom:4px">Push-Nachrichten</div>
      <div style="font-size:12px;color:var(--text2);margin-bottom:14px">Auch wenn die App geschlossen ist</div>
      <button id="pp-master-btn" style="width:100%;padding:14px;border:2px solid ${n?`#5C4EE5`:`var(--border)`};border-radius:12px;background:${n?`#5C4EE5`:`#F5F6FA`};color:${n?`white`:`#5C4EE5`};font-weight:700;font-size:15px;cursor:pointer;font-family:inherit">
        ${n?`✓ Aktiv – deaktivieren`:`Push aktivieren`}
      </button>
      <div id="pp-status" style="font-size:12px;color:var(--text2);text-align:center;margin-top:8px">
        Status: ${t===`granted`?`✓ Erlaubnis erteilt`:t===`denied`?`✗ Blockiert`:`⚠️ Noch nicht erlaubt`}
      </div>
    </div>

    <div style="background:var(--surface);border-radius:16px;overflow:hidden;margin-bottom:16px">
      ${u(`pp-assign`,`📋 Aufgabe zugewiesen`,`Wenn dir jemand eine Aufgabe gibt`,`assignEnabled`,!0)}
      ${u(`pp-comment`,`💬 Neuer Kommentar`,`Bei neuen Kommentaren`,`commentEnabled`,!0)}
      ${u(`pp-board`,`📌 Home-Feed`,`Bei neuen Beiträgen`,`boardEnabled`,!0)}
    </div>
    ${Le()?``:`<div onclick="window._app.showUpgradeModal('pushFull')" style="display:flex;align-items:center;gap:10px;background:linear-gradient(135deg,#EEF2FF,#F5F3FF);border:1px solid #c7d2fe;border-radius:12px;padding:10px 14px;margin-bottom:16px;cursor:pointer">
      <span style="font-size:18px">🔒</span>
      <div style="flex:1"><div style="font-size:12px;font-weight:700;color:#5C4EE5">Weitere Benachrichtigungen mit Plus</div><div style="font-size:11px;color:#6b7280">Kommentare, Board-Posts & Morgens-Übersicht</div></div>
      <span style="color:#5C4EE5;font-size:14px">›</span>
    </div>`}

    <div style="background:var(--surface);border-radius:16px;overflow:hidden;margin-bottom:32px">
      <div style="padding:14px 16px;border-bottom:1px solid var(--border2,#F5F6FA)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <div style="font-size:13px;font-weight:600;color:var(--text1)">⏰ Erinnerung vor Termin</div>
          <button id="pp-reminder" style="${c(s)}">${l(s)}</button>
        </div>
        <div style="display:flex;gap:8px">
          ${[10,15,30,60].map(e=>`<button class="pp-min-btn" data-mins="${e}" style="flex:1;padding:8px 4px;border:1px solid ${r===e?`#5C4EE5`:`var(--border)`};border-radius:8px;background:${r===e?`#EEF2FF`:`#F5F6FA`};color:${r===e?`#5C4EE5`:`#6b7280`};font-size:12px;font-weight:600;cursor:pointer;font-family:inherit">${e<60?e+` Min.`:`1 Std.`}</button>`).join(``)}
        </div>
      </div>
      <div style="padding:14px 16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <div>
            <div style="font-size:13px;font-weight:600;color:var(--text1)">🌅 Morgens-Übersicht</div>
            <div style="font-size:11px;color:var(--text2)">Alle heutigen Aufgaben</div>
          </div>
          <button id="pp-daily" style="${c(i)}">${l(i)}</button>
        </div>
        <div style="display:flex;gap:8px">
          ${[6,7,8,9].map(e=>`<button class="pp-hour-btn" data-hour="${e}" style="flex:1;padding:8px 4px;border:1px solid ${a===e?`#5C4EE5`:`var(--border)`};border-radius:8px;background:${a===e?`#EEF2FF`:`#F5F6FA`};color:${a===e?`#5C4EE5`:`#6b7280`};font-size:12px;font-weight:600;cursor:pointer;font-family:inherit">${e}:00</button>`).join(``)}
        </div>
      </div>
    </div>`,document.body.appendChild(e),document.getElementById(`push-done-btn`).addEventListener(`click`,()=>e.remove()),[`light`,`system`,`dark`].forEach(t=>{document.getElementById(`dm-`+t)?.addEventListener(`click`,()=>{window._app.setDarkMode(t),e.remove(),window._app.showPushPage()})}),[`pp-assign`,`pp-comment`,`pp-board`,`pp-reminder`,`pp-daily`].forEach(e=>{let t={"pp-assign":`assignEnabled`,"pp-comment":`commentEnabled`,"pp-board":`boardEnabled`,"pp-reminder":`reminderEnabled`,"pp-daily":`dailyEnabled`};document.getElementById(e)?.addEventListener(`click`,function(){gr(t[e],this)})}),e.querySelectorAll(`.pp-min-btn`).forEach(t=>{t.addEventListener(`click`,function(){X(`reminderMinutes`,parseInt(this.dataset.mins)),e.querySelectorAll(`.pp-min-btn`).forEach(e=>{e.style.background=`#F5F6FA`,e.style.color=`#6b7280`,e.style.borderColor=`var(--border)`}),this.style.background=`#EEF2FF`,this.style.color=`#5C4EE5`,this.style.borderColor=`#5C4EE5`,f()})}),e.querySelectorAll(`.pp-hour-btn`).forEach(t=>{t.addEventListener(`click`,function(){X(`dailyHour`,parseInt(this.dataset.hour)),e.querySelectorAll(`.pp-hour-btn`).forEach(e=>{e.style.background=`#F5F6FA`,e.style.color=`#6b7280`,e.style.borderColor=`var(--border)`}),this.style.background=`#EEF2FF`,this.style.color=`#5C4EE5`,this.style.borderColor=`#5C4EE5`,f()})});async function f(){try{let e=await(await navigator.serviceWorker.ready).pushManager.getSubscription();e&&(X(`enabled`,!0),await ur(e))}catch(e){console.warn(`sync sub:`,e)}}document.getElementById(`pp-master-btn`).addEventListener(`click`,function(){let e=this;if(Y(`enabled`,!1)){e.disabled=!0,e.textContent=`⏳ Bitte warten…`,dr().then(()=>{e.textContent=`Push aktivieren`,e.style.background=`#F5F6FA`,e.style.color=`#5C4EE5`,e.style.borderColor=`var(--border)`,document.getElementById(`pp-status`).textContent=`Status: deaktiviert`,e.disabled=!1});return}e.textContent=`⏳ Erlaubnis anfragen…`,Notification.requestPermission().then(t=>{let n=document.getElementById(`pp-status`);if(t===`denied`){e.textContent=`Push aktivieren`,H(`Bitte in Einstellungen → famiplan → Mitteilungen erlauben`),e.disabled=!1;return}e.textContent=`⏳ SW bereit machen…`,n&&(n.textContent=`Warte auf Service Worker…`);let r=setTimeout(()=>{n&&(n.textContent=`Fehler: SW timeout – bitte App neu starten`),e.textContent=`Push aktivieren`,e.disabled=!1},8e3);navigator.serviceWorker.ready.then(t=>{clearTimeout(r),n&&(n.textContent=`SW bereit, subscribe läuft…`),e.textContent=`⏳ Subscribe…`;let i;try{i=lr(o)}catch(t){n&&(n.textContent=`VAPID Fehler: `+t.message),e.textContent=`Push aktivieren`,e.disabled=!1;return}let a=setTimeout(()=>{n&&(n.textContent=`Subscribe timeout – versuche erneut`),e.textContent=`Push aktivieren`,e.disabled=!1},1e4);crypto.subtle.importKey(`raw`,i.buffer,{name:`ECDSA`,namedCurve:`P-256`},!1,[]).then(e=>(n&&(n.textContent=`Subscribe mit CryptoKey…`),t.pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:e}))).catch(()=>(n&&(n.textContent=`Subscribe mit Uint8Array…`),t.pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:i}))).then(t=>{clearTimeout(a),X(`enabled`,!0),ur(t).catch(e=>console.warn(e)),e.textContent=`✓ Aktiv – deaktivieren`,e.style.background=`#5C4EE5`,e.style.color=`white`,e.style.borderColor=`#5C4EE5`,n&&(n.textContent=`Status: ✓ Aktiv`),e.disabled=!1,mr(),H(`🔔 Push-Benachrichtigungen aktiviert!`)}).catch(t=>{clearTimeout(a),n&&(n.textContent=`Fehler: `+t.name+`: `+t.message),H(`Fehler: `+t.name+` – `+t.message),e.textContent=`Push aktivieren`,e.disabled=!1})}).catch(t=>{clearTimeout(r),n&&(n.textContent=`SW Fehler: `+t.message),e.textContent=`Push aktivieren`,e.disabled=!1})})})}_(),D(),A(),V(),w(),W();var vr=e=>`window._app.${e}`;async function yr(){if(!z())return null;try{let e=await N(`${T}/admin/familyIndex.json?t=${Date.now()}`),t=await e.text();if(e.status!==200)return{_error:`HTTP ${e.status}: ${t.slice(0,100)}`};let n=JSON.parse(t);if(!n)return{};let r={},i=(e,t=5e3)=>Promise.race([e,new Promise((e,n)=>setTimeout(()=>n(Error(`timeout`)),t))]);return await Promise.all(Object.entries(n).map(async([e,t])=>{try{let[n,a,o]=await i(Promise.all([N(`${T}/families/${e}/members.json`),N(`${T}/families/${e}/access.json`),N(`${T}/families/${e}/lastActiveAt.json`)])),s=n.ok?await n.json():null,c=a.ok?await a.json():null,l=o.ok?await o.json():null;r[e]={familyId:e,familyName:t.name||e,memberCount:s?Object.keys(s).length:0,created:t.created||0,lastActiveAt:l||0,granted:c?.granted||!1,note:c?.note||``}}catch{r[e]={familyId:e,familyName:t.name||e,memberCount:`?`,created:t.created||0,lastActiveAt:0,granted:!1,note:``}}})),r}catch(e){return{_error:e.message}}}async function br(){if(!z())return{};try{return await(await N(`https://family-task-2cacf-default-rtdb.europe-west1.firebasedatabase.app/admin/settings.json`)).json()||{}}catch{return{}}}function xr(e,t){let n=t.granted===!0,r=n?`<span style="background:#ECFDF5;color:#059669;font-size:10px;font-weight:700;padding:2px 7px;border-radius:4px">✓ Freizugang</span>`:`<span style="background:var(--bg3);color:var(--text3);font-size:10px;font-weight:700;padding:2px 7px;border-radius:4px">Standard</span>`,i=n?`<button onclick="window._app.adminRevokeFamily('${e}')" style="font-size:11px;padding:5px 10px;border:1px solid var(--border);border-radius:6px;background:var(--surface);color:#DC2626;cursor:pointer;font-family:inherit;font-weight:600">Entziehen</button>`:`<button onclick="window._app.adminGrantFamily('${e}')" style="font-size:11px;padding:5px 10px;border:none;border-radius:6px;background:#5C4EE5;color:white;cursor:pointer;font-family:inherit;font-weight:600">Freizugang</button>`,a=`<button data-fid="${f(e)}" data-fname="${f(t.familyName||``)}"
    class="admin-delete-btn"
    style="font-size:11px;padding:5px 8px;border:1px solid #FECACA;border-radius:6px;background:var(--surface);color:#DC2626;cursor:pointer;font-family:inherit;font-weight:600">
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5 4V2.5h4V4M5.5 6.5v4M8.5 6.5v4M3 4l.8 7.5h6.4L11 4" stroke="#6b7280" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </button>`,o=t.created?new Date(t.created).toLocaleDateString(`de`,{day:`2-digit`,month:`2-digit`,year:`2-digit`}):`–`,s=t.lastActiveAt?new Date(t.lastActiveAt).toLocaleDateString(`de`,{day:`2-digit`,month:`2-digit`,year:`2-digit`}):null;return`<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #F5F6FA">
    <div style="flex:1;min-width:0">
      <div style="font-size:13px;font-weight:600;color:var(--text1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">🏠 ${f(t.familyName)}</div>
      <div style="font-size:11px;color:var(--text3);margin-top:2px">${t.memberCount} Mitglied${t.memberCount===1?``:`er`} · seit ${o}${s?` · zuletzt `+s:``}</div>
      ${t.note?`<div style="font-size:11px;color:var(--text2);margin-top:2px">📝 ${f(t.note)}</div>`:``}
    </div>
    ${r}${i}${a}
  </div>`}async function Sr(){let e=document.getElementById(`admin-list`);if(!e)return;e.innerHTML=`<div style="text-align:center;padding:20px;color:var(--text3);font-size:13px">Lade…</div>`;let t=await yr();if(!e.isConnected)return;if(!t||t._error){e.innerHTML=`<div style="color:#DC2626;font-size:12px;padding:8px 0">${t?._error||`Fehler beim Laden`}</div>`;return}let n=Object.entries(t).sort((e,t)=>t[1].created-e[1].created);if(!n.length){e.innerHTML=`<div style="color:var(--text3);font-size:13px;text-align:center;padding:16px 0">Noch keine Familien.</div>`;return}e.innerHTML=n.map(([e,t])=>xr(e,t)).join(``),e.addEventListener(`click`,e=>{let t=e.target.closest(`.admin-delete-btn`);t&&Er(t.dataset.fid,t.dataset.fname)},{once:!0})}async function Cr(e){if(!z())return;let t=prompt(`Notiz (optional, z.B. "Beta Tester"):`,``)??``;t!==null&&(await N(`${T}/families/${e}/access.json`,{method:`PUT`,body:JSON.stringify({granted:!0,grantedBy:E.currentAuthUser.uid,note:t,grantedAt:Date.now()})}),H(`✓ Freizugang gewährt`),Sr())}async function wr(e){z()&&(await N(`${T}/families/${e}/access.json`,{method:`DELETE`}),H(`✓ Freizugang entzogen`),Sr())}async function Tr(){if(!z())return;let e=await(await N(`${T}/admin/familyIndex.json`)).json();if(!e){H(`Keine Familien im Index gefunden.`);return}let t=Object.keys(e);H(`Indexiere `+t.length+` Familien…`);let n=0;await Promise.all(t.map(async t=>{try{let r=await(await N(`${T}/families/${t}/meta.json`)).json();if(!r?.name)return;(await N(`https://family-task-2cacf-default-rtdb.europe-west1.firebasedatabase.app/admin/familyIndex/${t}.json`,{method:`PUT`,body:JSON.stringify({name:r.name,created:r.created||e[t]?.created||Date.now()})})).ok&&n++}catch(e){console.warn(t,`Fehler:`,e.message)}})),H(`✅ ${n} von ${t.length} Familien aktualisiert`),Sr()}function Er(e,t){if(!z()){H(`Kein Zugriff.`);return}G();let n=document.createElement(`div`);n.className=`modal-overlay`,n.innerHTML=`<div class="modal">
    <div class="modal-handle"></div>
    <div style="text-align:center;font-size:36px;margin-bottom:12px">🗑️</div>
    <div class="modal-title" style="color:#DC2626">Familie löschen</div>
    <div class="modal-sub" style="margin-bottom:16px">Diese Aktion kann nicht rückgängig gemacht werden.</div>
    <div style="background:#FEF2F2;border-radius:10px;padding:12px 14px;margin-bottom:20px;font-size:13px;color:#991b1b;line-height:1.6">
      <strong>${f(t)}</strong><br>Löscht ALLE Daten dieser Familie unwiderruflich.
    </div>
    <div id="admin-del-status" style="display:none;text-align:center;padding:8px;font-size:13px;color:#DC2626;font-weight:600"></div>
    <button id="admin-del-confirm" style="width:100%;padding:14px;border:none;border-radius:12px;background:#DC2626;color:white;font-size:15px;font-weight:800;cursor:pointer;font-family:inherit;margin-bottom:8px">Ja, unwiderruflich löschen</button>
    <button id="admin-del-cancel" style="width:100%;padding:12px;border:1px solid var(--border);border-radius:12px;background:var(--surface);font-size:14px;cursor:pointer;font-family:inherit">Abbrechen</button>
  </div>`,document.body.appendChild(n),O({modalEl:n}),requestAnimationFrame(()=>requestAnimationFrame(()=>{n.classList.add(`show`);let t=n.querySelector(`#admin-del-confirm`),r=n.querySelector(`#admin-del-cancel`),i=n.querySelector(`#admin-del-status`),a=!1;t.addEventListener(`click`,async function(){if(!a){a=!0,t.textContent=`Wirklich? Nochmal klicken!`,t.style.background=`#991b1b`,i.style.display=`block`,i.textContent=`⚠️ Diese Aktion kann nicht rückgängig gemacht werden!`,setTimeout(()=>{a&&(a=!1,t.textContent=`Ja, unwiderruflich löschen`,t.style.background=`#DC2626`,i.style.display=`none`)},4e3);return}t.disabled=!0,t.textContent=`Lösche…`,i.style.display=`none`;try{let t=await N(`${T}/families/${e}.json`,{method:`DELETE`});if(!t.ok)throw Error(`families `+t.status);await N(`${T}/admin/familyIndex/${e}.json`,{method:`DELETE`}),await N(`${T}/public/${e}.json`,{method:`DELETE`}).catch(()=>{}),n.classList.remove(`show`),setTimeout(()=>{n.remove(),O({modalEl:null}),H(`✓ Familie gelöscht`),Or()},300)}catch(e){a=!1,t.disabled=!1,t.textContent=`Ja, unwiderruflich löschen`,t.style.background=`#DC2626`,i.style.display=`block`,i.textContent=`Fehler: `+e.message}}),r.addEventListener(`click`,()=>{G(),Or()})}))}async function Dr(){if(!z())return;let e=document.getElementById(`bc-title`)?.value?.trim(),t=document.getElementById(`bc-body`)?.value?.trim();if(!e||!t){H(`⚠️ Titel und Text ausfüllen`);return}let n=document.getElementById(`bc-send-btn`);n&&(n.disabled=!0,n.textContent=`⏳ Sende…`);try{let r=await ne();H(`✅ Update-Push gesendet an ${(await(await fetch(`${PUSH_WORKER_URL}/push/broadcast`,{method:`POST`,headers:{"Content-Type":`application/json`,Authorization:`Bearer `+r},body:JSON.stringify({title:e,body:t,tag:`famiplan-update`,url:`/`})})).json().catch(()=>({}))).sent||0} Geräte`),n&&(n.disabled=!1,n.textContent=`📢 Jetzt senden`),document.getElementById(`bc-title`)&&(document.getElementById(`bc-title`).value=``),document.getElementById(`bc-body`)&&(document.getElementById(`bc-body`).value=``)}catch(e){H(`Fehler: `+e.message),n&&(n.disabled=!1,n.textContent=`📢 Jetzt senden`)}}async function Or(){if(!z()){H(`Kein Zugriff.`);return}U(`
    <div class="modal-handle"></div>
    <div class="modal-title">🛡 Admin-Panel</div>

    <div id="admin-settings" style="margin-bottom:14px">
      <div style="text-align:center;padding:10px;color:var(--text3);font-size:12px">Lade…</div>
    </div>

    <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">📢 Update-Benachrichtigung</div>
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:14px">
      <input id="bc-title" class="form-input" placeholder="Titel (z.B. famiplan Update 🚀)"
        style="margin-bottom:8px"
        value="famiplan Update 🚀"/>
      <textarea id="bc-body" class="form-input" rows="4"
        style="resize:none;line-height:1.5;margin-bottom:10px"
        placeholder="Was ist neu?"
      >✨ Kalender: Wischgesten & Zoom-Stufen&#10;📋 Tagesansicht: Zeitraum-Gruppen & direktes Abhaken&#10;🏠 Home: Schnellzugriff & Demnächst-Widget&#10;🛒 Einkauf: Autovervollständigung & Sofort-Hinzufügen&#10;🍽️ Mahlzeiten: Rezept-Vorschläge & Wochentransfer</textarea>
      <button id="bc-send-btn" onclick="${vr(`adminSendBroadcast()`)}"
        style="width:100%;padding:12px;background:#5C4EE5;color:white;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit">
        📢 Jetzt senden
      </button>
      <div style="font-size:11px;color:var(--text3);text-align:center;margin-top:6px">Sendet an alle aktiven Push-Subscriptions aller Nutzer</div>
    </div>

    <div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between">
      <span>Familien</span>
      <button onclick="${vr(`adminBulkIndexFamilies()`)}" style="font-size:11px;padding:4px 10px;border:1px solid var(--border);border-radius:6px;background:var(--surface);color:#5C4EE5;cursor:pointer;font-family:inherit;font-weight:600">Alle indexieren</button>
    </div>
    <div id="admin-list"><div style="text-align:center;padding:20px;color:var(--text3);font-size:13px">Lade Familien…</div></div>
    <button class="modal-close" onclick="${vr(`closeModal()`)}">Schließen</button>
  `);let[e]=await Promise.all([br(),Sr()]),t=document.getElementById(`admin-settings`);t&&(t.innerHTML=`
      <div style="background:#ECFDF5;border-radius:12px;padding:12px 14px;border:1px solid #D1FAE5">
        <div style="font-size:13px;font-weight:600;color:#059669">✓ famiplan Plus ist aktiv</div>
        <div style="font-size:11px;color:var(--text2);margin-top:2px">Zahlungen laufen über LemonSqueezy</div>
      </div>`)}_(),D(),A(),V(),F();var kr=`famiplan`,Ar=`fp_calendar_sync_last`;function jr(){return!1}function Mr(){return localStorage.getItem(`fp_calendar_sync_optin`)===`1`}function Nr(e){e?localStorage.setItem(`fp_calendar_sync_optin`,`1`):localStorage.removeItem(`fp_calendar_sync_optin`)}var Pr=null;function Fr(){return Pr||=I(()=>import(`./esm-SZqLpkQS.js`).then(e=>e.CapacitorCalendar),__vite__mapDeps([11,5,1,12])),Pr}async function Ir(){if(!jr())return!1;try{let{result:e}=await(await Fr()).requestFullCalendarAccess();return e===`granted`}catch(e){return console.warn(`Calendar permission request failed:`,e.message),!1}}var Lr=null;async function Rr(e){if(Lr)return Lr;let{result:t}=await e.listCalendars(),n=(t||[]).find(e=>e.title===kr);if(n)return Lr=n.id,n.id;let{id:r}=await e.createCalendar({title:kr,color:`#5C4EE5`});return Lr=r,r}function zr(e){if(e.type!==`event`)return!1;let t=e.visibleTo;return!t||t===`all`?!0:Array.isArray(t)?t.includes(E.curUser):t===E.curUser}function Br(e){let t=e.date,n,r,i;if(e.allDay){i=!0,n=new Date(t+`T00:00:00`).getTime();let a=e.endDate||t;r=new Date(a+`T23:59:59`).getTime()}else i=!1,n=new Date(t+`T`+(e.time||`12:00`)+`:00`).getTime(),r=e.endTime?new Date(t+`T`+e.endTime+`:00`).getTime():n+36e5;return{title:`${e.emoji||``} ${e.title}`.trim(),startDate:n,endDate:r,isAllDay:i,location:e.location||``,description:`Synchronisiert von famiplan`}}async function Vr(e,t,n){let r=Br(e);if(e.appleEventId)try{return await n.modifyEvent({id:e.appleEventId,...r,calendarId:t}),e.appleEventId}catch{}let{id:i}=await n.createEvent({...r,calendarId:t});return i}function Hr(e){if(E.tasks.find(t=>t.appleEventId===e.id))return null;let t=new Date(e.startDate),n=`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,`0`)}-${String(t.getDate()).padStart(2,`0`)}`;return{title:(e.title||`Termin`).trim(),emoji:``,type:`event`,date:n,day:null,time:e.isAllDay?`00:00`:`${String(t.getHours()).padStart(2,`0`)}:${String(t.getMinutes()).padStart(2,`0`)}`,endTime:``,color:`#5C4EE5`,recurring:`once`,recurringInterval:1,weekdays:[],location:e.location||``,attendees:[],openTodo:!1,visibleTo:E.curUser,allDay:!!e.isAllDay,appleEventId:e.id,appleSyncedAt:Date.now(),updatedAt:Date.now(),createdBy:E.curUser,assignments:{[n]:{assignedTo:E.curUser,done:!1}}}}function Ur(e,t){return t?e?t>e?`eventkit`:`firebase`:`eventkit`:`firebase`}function Wr(e){let{id:t,...n}=e;return n}async function Gr({silent:e=!1}={}){if(!jr())return{ok:!1,reason:`unsupported`};if(!Mr())return{ok:!1,reason:`opted-out`};if(!Le())return{ok:!1,reason:`not-premium`};if(!E.familyId||!E.curUser)return{ok:!1,reason:`no-family`};if(!await Ir())return{ok:!1,reason:`permission-denied`};let t,n;try{t=await Fr(),n=await Rr(t)}catch(e){return console.warn(`Calendar sync setup failed:`,e.message),{ok:!1,reason:`setup-failed`,error:e.message}}let r={exported:0,imported:0,updated:0,skipped:0,errors:0},i=Date.now()-744*60*60*1e3,a=Date.now()+4392*60*60*1e3,o=[];try{let{result:e}=await t.listEventsInRange({from:i,to:a});o=(e||[]).filter(e=>e.calendarId===n)}catch(e){console.warn(`Sync: listEventsInRange failed:`,e.message)}let s=new Map(o.map(e=>[e.id,e])),c=E.tasks.filter(zr);for(let e of c)try{let i=e.appleEventId?s.get(e.appleEventId):null;if(Ur(e.updatedAt,i?.lastModifiedDate)===`eventkit`&&i){let t={title:(i.title||e.title).trim()||e.title,location:i.location||e.location,updatedAt:Date.now(),appleSyncedAt:Date.now()};await M(`tasks/${e.id}`,{...Wr(e),...t}),O({tasks:E.tasks.map(n=>n.id===e.id?{...n,...t}:n)}),r.updated++;continue}let a=await Vr(e,n,t);a&&a!==e.appleEventId&&(await M(`tasks/${e.id}/appleEventId`,a),await M(`tasks/${e.id}/appleSyncedAt`,Date.now()),O({tasks:E.tasks.map(t=>t.id===e.id?{...t,appleEventId:a,appleSyncedAt:Date.now()}:t)})),r.exported++}catch(t){console.warn(`Sync export error for task`,e.id,t.message),r.errors++}for(let e of o)try{let t=Hr(e);if(!t){r.skipped++;continue}let n={id:(await te(`tasks`,t)).name,...t};O({tasks:[...E.tasks,n]}),r.imported++}catch(t){console.warn(`Sync import error for event`,e.id,t.message),r.errors++}return localStorage.setItem(Ar,String(Date.now())),e||console.log(`Calendar sync finished:`,r),{ok:!0,stats:r}}function Kr(){let e=localStorage.getItem(Ar);return e?parseInt(e):null}D(),V();function qr(e){if(!e)return`Noch nie synchronisiert`;let t=Math.round((Date.now()-e)/6e4);if(t<1)return`Gerade eben synchronisiert`;if(t<60)return`Vor ${t} Min. synchronisiert`;let n=Math.round(t/60);return n<24?`Vor ${n} Std. synchronisiert`:`Vor ${Math.round(n/24)} Tagen synchronisiert`}function Jr(){if(!jr())return;let e=document.createElement(`div`);e.id=`calendar-sync-page`,e.style.cssText=`position:fixed;inset:0;background:#5C4EE5;z-index:999;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:max(env(safe-area-inset-top),48px) 20px max(env(safe-area-inset-bottom,0px),80px);`;let t=Mr(),n=Le(),r=Kr();e.innerHTML=`
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:28px">
      <div style="font-size:22px;font-weight:800;color:white">🗓️ Apple Kalender</div>
      <button id="cal-sync-done-btn" style="background:rgba(255,255,255,0.2);border:none;border-radius:20px;padding:8px 16px;color:white;font-weight:700;font-size:14px;cursor:pointer;font-family:inherit">Fertig</button>
    </div>

    ${n?``:`
    <div onclick="window._app.showUpgradeModal('calendarSync')" style="display:flex;align-items:center;gap:10px;background:var(--surface);border:1px solid #c7d2fe;border-radius:12px;padding:14px;margin-bottom:16px;cursor:pointer">
      <span style="font-size:18px">🔒</span>
      <div style="flex:1"><div style="font-size:13px;font-weight:700;color:#5C4EE5">Plus-Feature</div><div style="font-size:11px;color:var(--text2)">Apple Kalender Sync ist Teil von famiplan Plus</div></div>
      <span style="color:#5C4EE5;font-size:14px">›</span>
    </div>`}

    <div style="background:var(--surface);border-radius:16px;padding:18px;margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <div>
          <div style="font-size:14px;font-weight:700;color:var(--text1)">Synchronisierung</div>
          <div style="font-size:11px;color:var(--text2)">Termine zwischen famiplan und deinem iPhone-Kalender abgleichen</div>
        </div>
        <button id="cal-sync-toggle" style="${(e=>`width:44px;height:26px;border-radius:13px;border:none;background:${e?`#5C4EE5`:`#D1D5DB`};position:relative;cursor:pointer;flex-shrink:0`)(t)}">${(e=>`<span style="position:absolute;top:3px;${e?`right:3px`:`left:3px`};width:20px;height:20px;border-radius:50%;background:var(--surface);display:block"></span>`)(t)}</button>
      </div>
    </div>

    <div style="background:var(--surface);border-radius:16px;padding:18px;margin-bottom:16px">
      <div style="font-size:12px;color:var(--text2);line-height:1.5">
        Famiplan legt einen eigenen Kalender „famiplan" auf deinem iPhone an. Neue Termine
        aus famiplan erscheinen dort automatisch, und Änderungen, die du direkt im
        iOS-Kalender machst, werden zurück übernommen. Die Synchronisierung läuft beim
        Öffnen der App und im Hintergrund, sobald iOS dafür Zeit gewährt – nicht in Echtzeit.
      </div>
    </div>

    <div style="background:var(--surface);border-radius:16px;padding:18px;margin-bottom:16px;text-align:center">
      <div style="font-size:12px;color:var(--text2);margin-bottom:10px">${qr(r)}</div>
      <button id="cal-sync-now-btn" ${t?``:`disabled`} style="width:100%;padding:13px;border:none;border-radius:12px;background:${t?`#5C4EE5`:`#D1D5DB`};color:white;font-weight:700;font-size:14px;cursor:${t?`pointer`:`not-allowed`};font-family:inherit">
        Jetzt synchronisieren
      </button>
      <div id="cal-sync-status" style="font-size:12px;color:var(--text2);margin-top:8px;min-height:16px"></div>
    </div>`,document.body.appendChild(e),document.getElementById(`cal-sync-done-btn`).addEventListener(`click`,()=>e.remove()),document.getElementById(`cal-sync-toggle`).addEventListener(`click`,async function(){if(!n){e.remove(),window._app.showUpgradeModal(`calendarSync`);return}let t=!Mr();if(t&&!await Ir()){document.getElementById(`cal-sync-status`).textContent=`⚠️ Kalenderzugriff wurde nicht erlaubt`;return}Nr(t),e.remove(),Jr()}),document.getElementById(`cal-sync-now-btn`).addEventListener(`click`,async function(){if(!Mr())return;let e=this,t=document.getElementById(`cal-sync-status`);e.disabled=!0,e.textContent=`Synchronisiere…`;let n=await Gr();if(e.disabled=!1,e.textContent=`Jetzt synchronisieren`,n.ok){let{exported:e,imported:r,updated:i,errors:a}=n.stats;t.textContent=`✓ ${e} exportiert, ${r} importiert, ${i} aktualisiert${a?`, ${a} Fehler`:``}`}else t.textContent=`⚠️ Synchronisierung fehlgeschlagen: `+n.reason})}var Z=e({_mealIngrAcKey:()=>Di,_mealIngrAcSelect:()=>Ei,_mealIngrAcUpdate:()=>Ti,_mealNameAcKey:()=>wi,_mealNameAcSelect:()=>Ci,_mealNameAcUpdate:()=>Si,_recipeImportPhotoSelected:()=>Ui,_recipeImportSave:()=>Vi,_recipeImportStart:()=>zi,_recipeImportTab:()=>Hi,applyMealRecipe:()=>li,confirmSaveMeal:()=>Oi,exportCal:()=>ci,onDurChange:()=>ei,onEndTimeChange:()=>$r,openMaps:()=>Pi,recipeManagerApply:()=>gi,recipeManagerDelete:()=>xi,recipeManagerDeleteConfirm:()=>bi,recipeManagerEdit:()=>vi,recipeManagerSearch:()=>mi,recipeManagerSort:()=>hi,selectUser:()=>ji,setDate:()=>Zr,setFF:()=>Xr,showAddModal:()=>oi,showBoardNewModal:()=>Mi,showDeleteAccountModal:()=>Fi,showEditModal:()=>si,showMealEditModal:()=>Q,showRecipeDetailModal:()=>Li,showRecipeEditModal:()=>yi,showRecipeImportModal:()=>Ri,showRecipeManager:()=>pi,showRecipeStepsModal:()=>Ii,showRecipeViewModal:()=>_i,showUpgradeModal:()=>Ni,showUserModal:()=>Ai,toggleAttendee:()=>ti,toggleVisibleTo:()=>ni,toggleWD:()=>Qr});function Yr(e,t){let n=document.getElementById(`meal-opt-checks`);if(!n)return;let r=(e||``).split(`
`).map(e=>e.trim()).filter(Boolean);if(!r.length){n.innerHTML=``;return}let i=t||[];n.innerHTML=`<div style="font-size:11px;color:var(--text3);margin-bottom:2px">Diese Woche dabei?</div>`+r.map(function(e){let t=i.includes(e),n=`opt-cb-`+e.replace(/[^a-z0-9]/gi,`_`),r=t?`width:18px;height:18px;border-radius:5px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border:1.5px solid #059669;background:#059669;`:`width:18px;height:18px;border-radius:5px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border:1.5px solid #CBD5E0;background:transparent;`,a=t?`font-size:13px;color:#059669;`:`font-size:13px;color:var(--text1);`;return`<label style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:3px 0" onclick="window._togOptCb('`+n+`')"><input type="checkbox" id="`+n+`" name="opt-sel" value="`+e.replace(/"/g,`&quot;`)+`"`+(t?` checked`:``)+` style="display:none"><span id="box-`+n+`" style="`+r+`">`+(t?`<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 5l2.5 2.5 4.5-4.5"/></svg>`:``)+`</span><span id="txt-`+n+`" style="`+a+`">`+e+`</span></label>`}).join(``)}function Xr(e,t,n){if(O(n===`e`?{ed:{...E.ed,[e]:t}}:{fd:{...E.fd,[e]:t}}),e===`color`){try{localStorage.setItem(`fp_last_color`,t)}catch{}document.querySelectorAll(`.color-btn`).forEach(e=>{e.classList.toggle(`sel`,e.style.background===t||e.style.backgroundColor===t)});return}e===`type`&&t===`event`&&O(n===`e`?{ed:{...E.ed,openTodo:!1}}:{fd:{...E.fd,openTodo:!1}}),new Set([`type`,`emoji`,`recurring`,`openTodo`,`allDay`]).has(e)&&(e===`recurring`&&O(n===`e`?{ed:{...E.ed,recurringInterval:1}}:{fd:{...E.fd,recurringInterval:1}}),n===`e`?si():oi())}function Zr(e,t){t===`e`?(O({ed:{...E.ed,date:e,day:u(e)}}),si()):(O({fd:{...E.fd,date:e,day:u(e)}}),oi())}function Qr(e,t){let n=t===`e`?E.ed:E.fd,r=n.weekdays.includes(e)?n.weekdays.filter(t=>t!==e):[...n.weekdays,e];O(t===`e`?{ed:{...E.ed,weekdays:r}}:{fd:{...E.fd,weekdays:r}}),document.querySelectorAll(`.wd-btn`).forEach((e,t)=>{e.className=`wd-btn`+(r.includes(t)?` sel`:``)})}function $r(e,t){O(t===`e`?{ed:{...E.ed,endTime:e}}:{fd:{...E.fd,endTime:e}});let n=g((t===`e`?E.ed:E.fd).time,e),r=document.getElementById(`f-dur-select`);if(r&&n>0){let e=[...r.options].map(e=>parseInt(e.value));r.value=e.reduce((e,t)=>Math.abs(t-n)<Math.abs(e-n)?t:e,e[0])}}function ei(e,t){let n=t===`e`?E.ed:E.fd;if(!n.time||!e)return;let r=b(n.time,e);O(t===`e`?{ed:{...E.ed,endTime:r}}:{fd:{...E.fd,endTime:r}});let i=document.getElementById(`f-endtime`);i&&(i.value=r)}function ti(e,t){let n=(t===`e`?E.ed:E.fd).attendees||[],r=n.includes(e)?n.filter(t=>t!==e):[...n,e];O(t===`e`?{ed:{...E.ed,attendees:r}}:{fd:{...E.fd,attendees:r}});let i=document.getElementById(`f-attendees-grid`);i&&i.querySelectorAll(`.member-btn`).forEach(t=>{t.dataset.member===e&&t.classList.toggle(`sel`,r.includes(e))})}function ni(e,t){let n=t===`e`?E.ed:E.fd,r=Array.isArray(n.visibleTo)?n.visibleTo:!n.visibleTo||n.visibleTo===`all`?[]:[n.visibleTo],i=r.includes(e)?r.filter(t=>t!==e):[...r,e];O(t===`e`?{ed:{...E.ed,visibleTo:i.length?i:`all`}}:{fd:{...E.fd,visibleTo:i.length?i:`all`}});let a=document.getElementById(`f-visibleto-grid`);a&&a.querySelectorAll(`.member-btn`).forEach(t=>{t.dataset.member===e&&t.classList.toggle(`sel`,i.includes(e))})}function ri(e,t){if(!E.members.length)return``;let n=e.attendees||[];return`<div class="form-group"><label class="form-lbl">Teilnehmer</label><div class="member-grid" id="f-attendees-grid">${E.members.map(e=>{let r=n.includes(e),i=E.photos?.[e]?`<img src="${E.photos[e]}" style="width:32px;height:32px;border-radius:50%;object-fit:cover">`:E.av[e]||`👤`;return`<button type="button" class="member-btn${r?` sel`:``}" data-member="${C(e)}"
      onclick="window._app.toggleAttendee('${C(e)}','${t}')">
      <div class="member-av">${i}</div>
      <div class="member-nm">${f(e)}</div>
    </button>`}).join(``)}</div></div>`}function ii(e,t){let n=[15,30,45,60,90,120,180,240,480].map(t=>{let n=e.endTime&&e.time&&g(e.time,e.endTime)===t?` selected`:``,r=t<60?t+` Min`:t===60?`1 Std`:t/60+` Std`;return`<option value="`+t+`"`+n+`>`+r+`</option>`}).join(``);return`<div class="form-group"><label class="form-lbl">Dauer</label><select class="form-select" id="f-dur-select" onchange="window._app.onDurChange(this.value,'`+t+`')"><option value="">–</option>`+n+`</select></div>`}function ai(e,t){let n=t?`e`:`a`,i=e.date||p(e.day||x())||x(),a=v.map(t=>`<button class="emoji-btn${e.emoji===t?` sel`:``}" onclick="window._app.setFF('emoji','${t}','${n}')">  ${t}</button>`).join(``),o=r.map((t,r)=>`<button class="wd-btn${(e.weekdays||[]).includes(r)?` sel`:``}" onclick="window._app.toggleWD(${r},'${n}')">  ${t}</button>`).join(``),s=ee.map(t=>`<button type="button" class="color-btn${e.color===t?` sel`:``}" style="background:${t}" onclick="window._app.setFF('color','${t}','${n}')"></button>`).join(``),c=e.type===`task`?`
    <div class="form-group">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:var(--bg3);border-radius:10px;cursor:pointer"
        onclick="window._app.setFF('openTodo',${!e.openTodo},'${n}')">
        <div>
          <div style="font-size:14px;font-weight:600;color:var(--text1)">📋 Offene To-Do</div>
          <div style="font-size:12px;color:var(--text2);margin-top:2px">Kein Datum – bleibt bis zur Erledigung sichtbar</div>
        </div>
        <div style="width:44px;height:26px;border-radius:13px;background:${e.openTodo?`#5C4EE5`:`#D1D5DB`};position:relative;transition:background 0.2s;flex-shrink:0">
          <div style="position:absolute;top:3px;left:${e.openTodo?`21`:`3`}px;width:20px;height:20px;border-radius:50%;background:var(--surface);transition:left 0.2s;box-shadow:0 1px 3px rgba(0,0,0,0.2)"></div>
        </div>
      </div>
      ${e.openTodo?`
        <div style="margin-top:10px">
          <label class="form-lbl">Sichtbar für</label>
          <div class="member-grid" id="f-visibleto-grid" style="margin-top:6px">
            ${E.members.map(t=>{let r=(Array.isArray(e.visibleTo)?e.visibleTo:!e.visibleTo||e.visibleTo===`all`?[]:[e.visibleTo]).includes(t),i=E.photos?.[t]?`<img src="${E.photos[t]}" style="width:32px;height:32px;border-radius:50%;object-fit:cover">`:E.av[t]||`👤`;return`<button type="button" class="member-btn${r?` sel`:``}" data-member="${C(t)}"
                onclick="window._app.toggleVisibleTo('${C(t)}','${n}')">
                <div class="member-av">${i}</div>
                <div class="member-nm">${f(t)}</div>
              </button>`}).join(``)}
          </div>
          <div style="font-size:11px;color:var(--text3);margin-top:6px">
            ${(()=>{let t=Array.isArray(e.visibleTo)?e.visibleTo:!e.visibleTo||e.visibleTo===`all`?[]:[e.visibleTo];return t.length===0?`👥 Alle Familienmitglieder sehen diese Aufgabe`:`👁 Nur `+t.map(e=>f(e)).join(`, `)})()}
          </div>
        </div>`:``}
    </div>`:``,l=e.type===`event`,d=e.allDay===!0,m=e.endDate||i,h=e.openTodo?``:`
    ${l?`
    <div class="form-group">
      <div class="allday-toggle-row" onclick="window._app.setFF('allDay',${!d},'${n}')">
        <div>
          <div style="font-size:14px;font-weight:600;color:var(--text1)">🌅 Ganztägig</div>
          <div style="font-size:12px;color:var(--text2);margin-top:2px">Kein fester Zeitpunkt</div>
        </div>
        <div class="toggle-switch" style="background:${d?`#5C4EE5`:`#D1D5DB`}">
          <div class="toggle-knob" style="left:${d?`21`:`3`}px"></div>
        </div>
      </div>
    </div>`:``}
    <div class="row2">
      <div class="form-group">
        <label class="form-lbl">${e.recurring===`once`?`Datum`:`Startdatum`}</label>
        <input type="date" class="form-input" value="${i}" onchange="window._app.setDate(this.value,'${n}')"/>
        <div class="day-hint">📅 ${e.day||u(i)}</div>
      </div>
      ${l&&d?`
      <div class="form-group">
        <label class="form-lbl">Enddatum</label>
        <input type="date" class="form-input" value="${m}" min="${i}"
          onchange="window._app.setFF('endDate',this.value,'${n}')"/>
      </div>`:`
      <div class="form-group">
        <label class="form-lbl">Uhrzeit</label>
        <input type="time" class="form-input" value="${e.time}" onchange="window._app._fdSet('time',this.value,'${n}')"/>
      </div>`}
    </div>
    ${d?``:`
    <div class="row2">
      <div class="form-group">
        <label class="form-lbl">Endzeit</label>
        <input type="time" class="form-input" id="f-endtime" value="${e.endTime||``}" onchange="window._app.onEndTimeChange(this.value,'${n}')"/>
      </div>
      ${l?`
      <div class="form-group">
        <label class="form-lbl">Enddatum (optional)</label>
        <input type="date" class="form-input" value="${m}" min="${i}"
          onchange="window._app.setFF('endDate',this.value,'${n}')"/>
      </div>`:ii(e,n)}
    </div>`}
    <div class="form-group">
      <label class="form-lbl">Wiederholung</label>
      <select class="form-select" onchange="window._app.setFF('recurring',this.value,'${n}')">
        <option value="once"${e.recurring===`once`?` selected`:``}>Einmalig</option>
        <option value="daily"${e.recurring===`daily`?` selected`:``}>Täglich / Wochentage</option>
        <option value="weekly"${e.recurring===`weekly`?` selected`:``}>Wöchentlich</option>
        <option value="monthly"${e.recurring===`monthly`?` selected`:``}>Monatlich</option>
        <option value="yearly"${e.recurring===`yearly`?` selected`:``}>Jährlich</option>
      </select>
      ${e.recurring===`weekly`||e.recurring===`monthly`?`
        <div style="display:flex;align-items:center;gap:10px;margin-top:10px">
          <span style="font-size:13px;color:var(--text2);white-space:nowrap">Alle</span>
          <input type="number" min="1" max="52" class="form-input" id="f-interval"
            style="width:72px;text-align:center;padding:8px"
            value="${e.recurringInterval||1}"
            onchange="window._app.setFF('recurringInterval',Math.max(1,parseInt(this.value)||1),'${n}')"
            oninput="window._app.setFF('recurringInterval',Math.max(1,parseInt(this.value)||1),'${n}')"/>
          <span style="font-size:13px;color:var(--text2);white-space:nowrap">${e.recurring===`weekly`?(e.recurringInterval||1)===1?`Woche`:`Wochen`:(e.recurringInterval||1)===1?`Monat`:`Monate`}</span>
        </div>`:``}
    </div>
    ${e.recurring===`daily`?`
      <div class="form-group"><label class="form-lbl">Wochentage</label><div class="wd-grid">${o}</div></div>`:``}`;return`
    <div class="modal-handle"></div>
    <div class="modal-title">${t?`Bearbeiten`:`Neue Aufgabe`}</div>
    <div class="modal-sub">${t?`Änderungen für alle speichern`:`Was soll hinzugefügt werden?`}</div>
    <div class="type-toggle">
      <button class="type-btn${e.type===`task`?` sel`:``}" onclick="window._app.setFF('type','task','${n}')">✅ Aufgabe</button>
      <button class="type-btn${e.type===`event`?` sel`:``}" onclick="window._app.setFF('type','event','${n}')">📅 Termin</button>
    </div>
    ${c}
    <div class="form-group">
      <label class="form-lbl">Titel</label>
      <input class="form-input" id="f-title" value="${f(e.title)}" maxlength="200"
        oninput="window._app._fdSet?.('title',this.value,'${n}')" placeholder="z.B. Kind abholen…"/>
    </div>
    <div class="form-group">
      <label class="form-lbl">Ort (optional)</label>
      <input class="form-input" value="${f(e.location||``)}" maxlength="200"
        oninput="window._app._fdSet?.('location',this.value,'${n}')" placeholder="z.B. Sporthalle, Arzt…"/>
    </div>
    ${e.type===`event`?ri(e,n):``}
    <div class="form-group">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
        <label class="form-lbl" style="margin-bottom:0">Emoji</label>
        <button type="button" onclick="window._app.toggleEmojiGrid(this)"
          style="font-size:11px;font-weight:600;color:#5C4EE5;background:var(--accent-bg);border:none;border-radius:6px;padding:4px 10px;cursor:pointer;font-family:inherit">
          ▸ Auswählen
        </button>
      </div>
      <div class="emoji-grid" id="f-emoji-grid" style="display:none">${a}</div>
    </div>
    <div class="form-group">
      <label class="form-lbl">Farbe</label>
      <div class="color-grid">${s}</div>
    </div>
    ${h}
    <button class="submit-btn" onclick="${t?`window._app.saveEdit()`:`window._app.addTask()`}" ${!t&&E.taskSaving?`disabled`:``}>
      ${E.taskSaving?`Wird gespeichert…`:t?`Änderungen speichern ✓`:e.type===`event`?`Termin hinzufügen`:`Aufgabe hinzufügen`}
    </button>
    <button class="modal-close" onclick="window._app.closeModal()">Abbrechen</button>`}function oi(){U(ai(E.fd,!1)),setTimeout(()=>document.getElementById(`f-title`)?.focus(),350)}function si(e){e&&O({ed:{...E.tasks.find(t=>t.id===e)}}),E.ed&&(E.taskSaving&&O({taskSaving:!1}),U(ai(E.ed,!0)),setTimeout(()=>document.getElementById(`f-title`)?.focus(),350))}function ci(e){let t=E.tasks.find(t=>t.id===e);if(!t)return;let n=x(),r=t.date||n,i=e=>{let t=e=>String(e).padStart(2,`0`);return`${e.getFullYear()}${t(e.getMonth()+1)}${t(e.getDate())}T${t(e.getHours())}${t(e.getMinutes())}00`},a,o;if(t.allDay){let e=r.replace(/-/g,``),n=t.endDate?t.endDate:r,i=new Date(n+`T12:00:00`);i.setDate(i.getDate()+1);let s=`${i.getFullYear()}${String(i.getMonth()+1).padStart(2,`0`)}${String(i.getDate()).padStart(2,`0`)}`;a=`DTSTART;VALUE=DATE:${e}`,o=`DTEND;VALUE=DATE:${s}`}else{let e=new Date(r+`T`+(t.time||`12:00`)+`:00`),n=t.endTime?new Date(r+`T`+t.endTime+`:00`):new Date(e.getTime()+36e5);a=`DTSTART;TZID=Europe/Berlin:${i(e)}`,o=`DTEND;TZID=Europe/Berlin:${i(n)}`}let s=``;if(t.recurring===`weekly`)s=`RRULE:FREQ=WEEKLY`;else if(t.recurring===`monthly`)s=`RRULE:FREQ=MONTHLY`;else if(t.recurring===`yearly`)s=`RRULE:FREQ=YEARLY`;else if(t.recurring===`daily`)if(t.weekdays?.length){let e=[`MO`,`TU`,`WE`,`TH`,`FR`,`SA`,`SU`];s=`RRULE:FREQ=WEEKLY;BYDAY=${t.weekdays.map(t=>e[t]).join(`,`)}`}else s=`RRULE:FREQ=DAILY`;let c=`${t.emoji||``} ${t.title}`.trim(),l=[`BEGIN:VCALENDAR`,`VERSION:2.0`,`PRODID:-//famiplan//famiplan.app//DE`,`BEGIN:VEVENT`,`UID:${e}@famiplan.app`,a,o,`SUMMARY:${c}`];t.location&&l.push(`LOCATION:${t.location}`),s&&l.push(s),l.push(`END:VEVENT`,`END:VCALENDAR`);let u=l.join(`\r
`),d=new Blob([u],{type:`text/calendar;charset=utf-8`}),f=URL.createObjectURL(d),p=document.createElement(`a`);p.href=f,p.download=(t.title||`termin`).replace(/[^\w\säöüÄÖÜß-]/g,``).replace(/\s+/g,`_`)+`.ics`,document.body.appendChild(p),p.click(),setTimeout(()=>{document.body.removeChild(p),URL.revokeObjectURL(f)},1e3),G()}function Q(e,t){let n=E.meals[e]?.[t],r=[{id:`breakfast`,label:`Frühstück`},{id:`lunch`,label:`Mittagessen`},{id:`dinner`,label:`Abendessen`}].find(e=>e.id===t)?.label||t,i=new Date(e+`T12:00:00`).toLocaleDateString(`de-DE`,{weekday:`long`,day:`numeric`,month:`long`}),a=n?.ingredients?.join(`
`)||``,o=n?.optionalIngredients,s=o?Array.isArray(o)?o:Object.values(o):[],c=s.join(`
`),l=n?.selectedOptionals,u=l?Array.isArray(l)?l:Object.values(l):[];s.length&&``+s.map(e=>{let t=u.includes(e),n=`opt-cb-`+e.replace(/[^a-z0-9]/gi,`_`),r=t?`width:18px;height:18px;border-radius:5px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border:1.5px solid #059669;background:#059669;`:`width:18px;height:18px;border-radius:5px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border:1.5px solid var(--border);background:transparent;`,i=t?`font-size:13px;color:#059669;`:`font-size:13px;color:var(--text1);`,a=t?` checked`:``;return`<label id="lbl-`+n+`" style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:3px 0" onclick="window._togOptCb('`+n+`')"><input type="checkbox" id="`+n+`" name="opt-sel" value="`+C(e)+`"`+a+` style="display:none"><span id="box-`+n+`" style="`+r+`">`+(t?`<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 5l2.5 2.5 4.5-4.5"/></svg>`:``)+`</span><span id="txt-`+n+`" style="`+i+`">`+f(e)+`</span></label>`}).join(``);let d=Object.entries(E.mealRecipes).map(([e,t])=>({key:e,...t}));window._mealRecipesList=d;let p=[...d].sort((e,t)=>(t.useCount??1)-(e.useCount??1)).slice(0,8),m=d.length?`
    <div class="form-group">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
        <label class="form-lbl" style="margin-bottom:0">Häufig gekocht</label>
        <button type="button" onclick="window._app.showRecipeManager('${e}','${t}')"
          style="font-size:11px;font-weight:600;color:#5C4EE5;background:var(--accent-bg);border:none;border-radius:6px;padding:4px 10px;cursor:pointer;font-family:inherit">
          📋 Alle Rezepte
        </button>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:6px" id="meal-recipes-grid">
        ${p.map(e=>`<button class="meal-recipe-btn" data-idx="${d.findIndex(t=>t.key===e.key)}" onclick="window._app.applyMealRecipe(this)">${f(e.name)}</button>`).join(``)}
      </div>
    </div>`:``;U(`
    <div class="modal-handle"></div>
    <div class="modal-title">🍽️ ${f(r)}</div>
    <div class="modal-sub">${f(i)}</div>
    ${m}
    <div class="form-group">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
        <label class="form-lbl" style="margin-bottom:0">Gericht</label>
        <button type="button" onclick="window._app.showRecipeImportModal()"
          style="font-size:11px;font-weight:700;color:white;background:linear-gradient(135deg,#5C4EE5,#7C6EE8);border:none;border-radius:6px;padding:4px 10px;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:4px">
          ✨ KI-Import
        </button>
      </div>
      <div style="position:relative">
        <input class="form-input" id="meal-name-input" placeholder="z.B. Spaghetti Bolognese" maxlength="80"
          value="${f(n?.name||``)}" autocomplete="off"
          oninput="window._app._mealNameAcUpdate(this.value)"
          onkeydown="window._app._mealNameAcKey(event)"/>
      </div>
      <div id="meal-name-ac" style="display:none;background:var(--surface);border:1px solid var(--border);border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.10);margin-top:4px;overflow:hidden;max-height:200px;overflow-y:auto"></div>
    </div>
    <div class="form-group">
      <label class="form-lbl">Zutaten (eine pro Zeile – für Einkaufsliste)</label>
      <textarea class="form-input" id="meal-ingr-input"
        placeholder="z.B.&#10;500g Hackfleisch&#10;Zwiebeln&#10;Dosentomaten"
        rows="4" style="resize:none;line-height:1.6"
        onkeyup="window._app._mealIngrAcUpdate(event)"
        onkeydown="window._app._mealIngrAcKey(event)">${f(a)}</textarea>
      <div id="meal-ingr-ac" style="display:none;background:var(--surface);border:1px solid var(--border);border-radius:10px;box-shadow:0 4px 12px rgba(0,0,0,0.10);margin-top:4px;overflow:hidden;max-height:160px;overflow-y:auto"></div>
    </div>
    <div class="form-group">
      <label class="form-lbl" style="display:flex;align-items:center;gap:6px">
        <span>Optionale Zutaten</span>
        <span style="font-size:11px;font-weight:400;color:var(--text3)">(selten gebraucht)</span>
      </label>
      <textarea class="form-input" id="meal-opt-ingr-input"
        placeholder="z.B.&#10;Parmesan&#10;Basilikum&#10;Chili"
        rows="3" style="resize:none;line-height:1.6"
        oninput="window._rebuildOptChecks(this.value)">${f(c)}</textarea>
      ${s.length?`<div style="margin-top:8px">
        <div style="font-size:11px;color:var(--text3);margin-bottom:4px">Diese Woche dabei?</div>
        ${s.map(e=>{let t=u.includes(e),n=`opt-cb-`+e.replace(/[^a-z0-9]/gi,`_`);return`<label style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:3px 0" onclick="window._togOptCb('`+n+`')"><input type="checkbox" id="`+n+`" name="opt-sel" value="`+C(e)+`"`+(t?` checked`:``)+` style="display:none"><span id="box-`+n+`" style="width:18px;height:18px;border-radius:5px;flex-shrink:0;display:flex;align-items:center;justify-content:center;`+(t?`border:1.5px solid #059669;background:#059669;`:`border:1.5px solid #CBD5E0;background:transparent;`)+`">`+(t?`<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 5l2.5 2.5 4.5-4.5"/></svg>`:``)+`</span><span id="txt-`+n+`" style="font-size:13px;`+(t?`color:#059669;`:`color:var(--text1);`)+`">`+f(e)+`</span></label>`}).join(``)}
        <div id="meal-opt-checks" style="display:none"></div>
      </div>`:`<div id="meal-opt-checks"></div>`}
    </div>
    <div class="form-group">
      <button type="button" id="meal-steps-btn"
        style="width:100%;padding:11px 14px;border:1.5px dashed var(--border);border-radius:10px;background:transparent;font-size:13px;font-weight:600;color:var(--text3);cursor:pointer;font-family:inherit;text-align:left"
        onclick="window._app.showRecipeStepsModal('${C(e)}','${C(t)}')">
        Zubereitung hinzufügen
      </button>
    </div>
    <button class="submit-btn" onclick="window._app.confirmSaveMeal('${C(e)}','${C(t)}')">Speichern</button>
    <button class="modal-close" onclick="window._app.closeModal()">Abbrechen</button>
  `),setTimeout(function(){document.getElementById(`meal-name-input`)?.focus();let e=window._mealCurrentRecipeKey;e&&E.mealRecipes[e]&&ui(E.mealRecipes[e])},300)}function li(e){let t=parseInt(e.getAttribute(`data-idx`)),n=window._mealRecipesList?.[t];if(!n)return;let r=document.getElementById(`meal-name-input`),i=document.getElementById(`meal-ingr-input`);r&&(r.value=n.name),i&&(i.value=(n.ingredients||[]).join(`
`));let a=document.getElementById(`meal-opt-ingr-input`);a&&(a.value=(n.optionalIngredients||[]).join(`
`),window._rebuildOptChecks&&window._rebuildOptChecks(a.value)),window._mealCurrentRecipeKey=n.key,document.querySelectorAll(`.meal-recipe-btn`).forEach(e=>e.classList.remove(`sel`)),e.classList.add(`sel`),ui(n);let o=document.getElementById(`meal-name-ac`);o&&(o.style.display=`none`)}function ui(e){let t=document.getElementById(`meal-steps-btn`);if(!t)return;let n=e?.steps?.length>0;t.textContent=n?`Zubereitung (${e.steps.length} Schritte)`:`+ Zubereitung`,t.style.color=n?`#5C4EE5`:`var(--text3)`}function di(e){if(!e)return``;let t=Date.now()-e,n=Math.floor(t/864e5);if(n<=0)return`heute`;if(n===1)return`vor 1 Tag`;if(n<7)return`vor ${n} Tagen`;let r=Math.floor(n/7);if(r===1)return`vor 1 Woche`;if(r<5)return`vor ${r} Wochen`;let i=Math.floor(n/30);return i<=1?`vor 1 Monat`:`vor ${i} Monaten`}function fi(){let e=window._recipeManagerQuery.trim().toLowerCase(),t=window._recipeManagerSort,n=Object.entries(E.mealRecipes).map(([e,t])=>({key:e,...t}));return e&&(n=n.filter(t=>t.name.toLowerCase().includes(e))),t===`freq`?n.sort((e,t)=>(t.useCount??1)-(e.useCount??1)||e.name.localeCompare(t.name,`de`)):n.sort((e,t)=>e.name.localeCompare(t.name,`de`)),n.length?n.map(e=>{let t=e.ingredients?.length||0,n=e.useCount??1,r=di(e.usedAt);return`<div style="display:flex;align-items:center;gap:10px;padding:11px 12px;border-bottom:1px solid var(--border2)">
      <button onclick="window._app.recipeManagerApply('${C(e.key)}')"
        style="background:var(--green-bg);color:var(--green-text);font-size:10px;font-weight:600;padding:4px 8px;border-radius:6px;white-space:nowrap;border:none;cursor:pointer;font-family:inherit;flex-shrink:0">
        ＋ Einfügen
      </button>
      <div style="flex:1;min-width:0">
        <div style="font-size:14px;font-weight:600;color:var(--text1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
          ${e.steps?.length?`<span style="font-size:11px;margin-right:4px">&#x1F4D6;</span>`:``}${f(e.name)}
        </div>
        <div style="font-size:11px;color:var(--text3);margin-top:2px">
          ${t} Zutat${t===1?``:`en`}${e.steps?.length?` · `+e.steps.length+` Schritte`:``} · ${n}× gekocht${r?` · zuletzt `+r:``}
        </div>
      </div>
      <button onclick="window._app.showRecipeViewModal('${C(e.key)}')"
        style="width:32px;height:32px;border:none;border-radius:8px;background:var(--bg3);color:var(--text2);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0" title="Anzeigen">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
      </button>
      <button onclick="window._app.recipeManagerEdit('${C(e.key)}')"
        style="width:32px;height:32px;border:none;border-radius:8px;background:var(--bg3);color:var(--text2);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z"/></svg>
      </button>
      <button onclick="window._app.recipeManagerDeleteConfirm('${C(e.key)}','${C(e.name)}')"
        style="width:32px;height:32px;border:none;border-radius:8px;background:var(--red-bg);color:var(--red-text);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4h10M5 4V2.5h4V4M5.5 6.5v4M8.5 6.5v4M3 4l.8 7.5h6.4L11 4"/></svg>
      </button>
    </div>`}).join(``):`<div style="text-align:center;padding:32px 12px;color:var(--text3)">
      <div style="font-size:36px;margin-bottom:8px">🍽️</div>
      <div style="font-size:14px;font-weight:600">${e?`Keine Treffer`:`Noch keine Rezepte gespeichert`}</div>
      ${e?``:`<div style="font-size:13px;margin-top:4px">Rezepte werden automatisch gespeichert, wenn du Zutaten zu einer Mahlzeit hinzufügst.</div>`}
    </div>`}function pi(e,t){window._recipeManagerQuery=``,window._recipeManagerIso=e||x(),window._recipeManagerType=t||`dinner`,U(`
    <div class="modal-handle"></div>
    <div class="modal-title">🍽️ Meine Rezepte</div>
    <div class="modal-sub">Gespeicherte Gerichte verwalten</div>
    <button type="button" onclick="window._app.showRecipeImportModal()"
      style="width:100%;padding:11px 14px;border:none;border-radius:10px;background:linear-gradient(135deg,#5C4EE5,#7C6EE8);color:white;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;margin-bottom:12px;display:flex;align-items:center;justify-content:center;gap:8px">
      ✨ Rezept importieren (KI)
    </button>
    <div class="form-group">
      <input class="form-input" id="recipe-mgr-search" placeholder="Suchen…" autocomplete="off"
        oninput="window._app.recipeManagerSearch(this.value)"/>
    </div>
    <div style="display:flex;gap:8px;margin-bottom:12px">
      <button id="recipe-mgr-sort-alpha" class="cat-btn${window._recipeManagerSort===`alpha`?` sel`:``}" style="flex:1" onclick="window._app.recipeManagerSort('alpha')">A–Z</button>
      <button id="recipe-mgr-sort-freq" class="cat-btn${window._recipeManagerSort===`freq`?` sel`:``}" style="flex:1" onclick="window._app.recipeManagerSort('freq')">Häufigkeit</button>
    </div>
    <div id="recipe-mgr-list" style="border:1px solid var(--border);border-radius:12px;overflow:hidden;max-height:45vh;overflow-y:auto;margin-bottom:12px">
      ${fi()}
    </div>
    <button class="modal-close" onclick="window._app.closeModal()">Schließen</button>
  `),setTimeout(()=>document.getElementById(`recipe-mgr-search`)?.focus(),350)}function mi(e){window._recipeManagerQuery=e;let t=document.getElementById(`recipe-mgr-list`);t&&(t.innerHTML=fi())}function hi(e){window._recipeManagerSort=e,document.getElementById(`recipe-mgr-sort-alpha`)?.classList.toggle(`sel`,e===`alpha`),document.getElementById(`recipe-mgr-sort-freq`)?.classList.toggle(`sel`,e===`freq`);let t=document.getElementById(`recipe-mgr-list`);t&&(t.innerHTML=fi())}async function gi(e){let t=E.mealRecipes[e];if(!t)return;let n=window._recipeManagerIso||x(),r=window._recipeManagerType||`dinner`;G(),setTimeout(()=>{Q(n,r),setTimeout(()=>{let n=document.getElementById(`meal-name-input`),r=document.getElementById(`meal-ingr-input`);n&&(n.value=t.name),r&&(r.value=(t.ingredients||[]).join(`
`));let i=document.getElementById(`meal-opt-ingr-input`);i&&(i.value=(t.optionalIngredients||[]).join(`
`),window._rebuildOptChecks&&window._rebuildOptChecks(i.value)),window._mealCurrentRecipeKey=e,ui(t)},50)},350)}function _i(e){let t=E.mealRecipes[e];if(!t)return;let n=t.ingredients?.length||0,r=[t.prepTime?`⏱ ${t.prepTime} Min.`:``,t.servings?`👥 ${t.servings} Portionen`:``].filter(Boolean).join(` · `),i=n?`
    <div style="margin-bottom:16px">
      <div style="font-size:12px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">Zutaten</div>
      ${t.ingredients.map(e=>`
        <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border2);font-size:14px;color:var(--text1)">
          <span style="color:var(--text3)">·</span> ${f(e)}
        </div>`).join(``)}
    </div>`:``,a=t.optionalIngredients?.length?`
    <div style="margin-bottom:16px">
      <div style="font-size:12px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">Optionale Zutaten</div>
      ${t.optionalIngredients.map(e=>`
        <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border2);font-size:14px;color:var(--text2)">
          <span style="color:var(--text3)">·</span> ${f(e)}
        </div>`).join(``)}
    </div>`:``,o=t.steps?.length?`
    <div style="margin-bottom:16px">
      <div style="font-size:12px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">Zubereitung</div>
      ${t.steps.map((e,t)=>`
        <div style="display:flex;gap:12px;margin-bottom:12px;align-items:flex-start">
          <div style="width:26px;height:26px;border-radius:50%;background:#5C4EE5;color:white;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0">${t+1}</div>
          <div style="flex:1;font-size:14px;color:var(--text1);line-height:1.5;padding-top:3px">${f(e)}</div>
        </div>`).join(``)}
    </div>`:`<div style="text-align:center;padding:12px;color:var(--text3);font-size:13px;margin-bottom:16px">Keine Zubereitungsschritte hinterlegt.</div>`;U(`
    <div class="modal-handle"></div>
    <div style="text-align:center;font-size:40px;margin-bottom:6px">&#x1F37D;&#xFE0F;</div>
    <div class="modal-title">${f(t.name)}</div>
    ${r?`<div style="text-align:center;font-size:13px;color:var(--text3);margin-bottom:16px">${r}</div>`:`<div style="margin-bottom:16px"></div>`}
    ${i}
    ${a}
    ${o}
    <button class="submit-btn" style="margin-bottom:8px" onclick="window._app.closeModal();setTimeout(()=>import('./ui/modals.js').then(m=>m.showRecipeEditModal('${C(e)}')),350)">✏️ Rezept bearbeiten</button>
    <button class="modal-close" onclick="window._app.closeModal();setTimeout(()=>import('./ui/modals.js').then(m=>m.showRecipeManager(window._recipeManagerIso,window._recipeManagerType)),350)">‹ Zurück zur Übersicht</button>
  `)}function vi(e){G(),setTimeout(()=>yi(e),350)}function yi(e){let t=E.mealRecipes[e]||{},n=t.steps||[],r=(t.ingredients||[]).map((e,t)=>`
    <div class="recipe-ingr-row" id="ingr-row-${t}" style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
      <input class="form-input ingr-input" data-ingr="${t}" value="${f(e)}"
        placeholder="Zutat ${t+1}" style="flex:1;font-size:13px"/>
      <button type="button" onclick="window._app._recipeEditRemoveIngr(${t})"
        style="width:30px;height:36px;border:none;border-radius:8px;background:var(--red-bg);color:var(--red-text);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;font-size:16px">×</button>
    </div>`).join(``),i=n.map((e,t)=>`
    <div class="recipe-step-row" id="step-row-${t}" style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px">
      <div style="width:24px;height:24px;border-radius:50%;background:#5C4EE5;color:white;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:8px">${t+1}</div>
      <textarea class="form-input step-input" data-step="${t}" rows="2"
        style="flex:1;resize:none;line-height:1.5;font-size:13px"
        placeholder="Schritt ${t+1} beschreiben…">${f(e)}</textarea>
      <button type="button" onclick="window._app._recipeRemoveStep(${t})"
        style="width:28px;height:28px;border:none;border-radius:6px;background:var(--red-bg);color:var(--red-text);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;margin-top:6px;font-size:14px">×</button>
    </div>`).join(``);U(`
    <div class="modal-handle"></div>
    <div class="modal-title">✏️ Rezept bearbeiten</div>
    <div class="modal-sub" style="margin-bottom:14px">${f(t.name||``)}</div>

    <div class="form-group">
      <label class="form-lbl">Name</label>
      <input class="form-input" id="recipe-edit-name" value="${f(t.name||``)}" maxlength="80" placeholder="Rezeptname"/>
    </div>

    <div style="display:flex;gap:10px;margin-bottom:14px">
      <div style="flex:1">
        <label class="form-lbl">Vorbereitungszeit</label>
        <div style="display:flex;align-items:center;gap:6px">
          <input class="form-input" id="recipe-prep-time" type="number" min="0" max="300" value="${t.prepTime||``}"
            placeholder="0" style="width:70px;text-align:center"/>
          <span style="font-size:13px;color:var(--text2)">Min.</span>
        </div>
      </div>
      <div style="flex:1">
        <label class="form-lbl">Portionen</label>
        <div style="display:flex;align-items:center;gap:6px">
          <input class="form-input" id="recipe-servings" type="number" min="1" max="20" value="${t.servings||4}"
            placeholder="4" style="width:70px;text-align:center"/>
          <span style="font-size:13px;color:var(--text2)">Pers.</span>
        </div>
      </div>
    </div>

    <div class="form-group">
      <label class="form-lbl">Zutaten</label>
      <div id="recipe-ingr-list" style="margin-bottom:8px">
        ${r||`<div id="ingr-empty" style="text-align:center;padding:12px;color:var(--text3);font-size:13px">Noch keine Zutaten</div>`}
      </div>
      <button type="button" onclick="window._app._recipeEditAddIngr()"
        style="width:100%;padding:9px;border:1.5px dashed var(--border);border-radius:10px;background:transparent;font-size:13px;font-weight:600;color:#5C4EE5;cursor:pointer;font-family:inherit;margin-bottom:4px">
        + Zutat hinzufügen
      </button>
    </div>

    <div class="form-group">
      <label class="form-lbl">Zubereitung</label>
      <div id="recipe-steps-list" style="margin-bottom:10px">
        ${i||`<div id="steps-empty" style="text-align:center;padding:12px;color:var(--text3);font-size:13px">Noch keine Schritte</div>`}
      </div>
      <button type="button" onclick="window._app._recipeAddStep()"
        style="width:100%;padding:9px;border:1.5px dashed var(--border);border-radius:10px;background:transparent;font-size:13px;font-weight:600;color:#5C4EE5;cursor:pointer;font-family:inherit;margin-bottom:4px">
        + Schritt hinzufügen
      </button>
    </div>

    <button class="submit-btn" onclick="window._app._recipeEditSave('${C(e)}')">Speichern</button>
    <button class="modal-close" onclick="window._app.showRecipeManager()">Zurück</button>
  `)}function bi(e,t){U(`
    <div class="modal-handle"></div>
    <div style="text-align:center;font-size:36px;margin-bottom:12px">🗑️</div>
    <div class="modal-title" style="text-align:center">Rezept löschen?</div>
    <div class="modal-sub" style="text-align:center;margin-bottom:20px">„${f(t)}" wird endgültig entfernt. Diese Aktion kann nicht rückgängig gemacht werden.</div>
    <button style="width:100%;padding:13px;border:none;border-radius:10px;background:#DC2626;color:white;font-weight:700;font-size:15px;cursor:pointer;font-family:inherit"
      onclick="window._app.recipeManagerDelete('${C(e)}')">Ja, löschen</button>
    <button class="modal-close" onclick="window._app.showRecipeManager('${window._recipeManagerIso}','${window._recipeManagerType}')">Abbrechen</button>
  `)}async function xi(e){await kt(e,null,H),pi(window._recipeManagerIso,window._recipeManagerType)}function Si(e){let t=document.getElementById(`meal-name-ac`);if(!t)return;window._mealNameAcIdx=-1;let n=e.trim().toLowerCase();if(!n||n.length<1){t.style.display=`none`;return}let r=window._mealRecipesList||[],i=r.filter(e=>e.name.toLowerCase().startsWith(n)),a=r.filter(e=>!e.name.toLowerCase().startsWith(n)&&e.name.toLowerCase().includes(n)),o=[...i,...a].slice(0,6);if(!o.length){t.style.display=`none`;return}t.innerHTML=o.map((e,t)=>{let n=e.ingredients?.length||0;return`<div class="meal-ac-item" data-idx="${t}"
      style="display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer;border-bottom:1px solid var(--border2);transition:background 0.1s"
      onmousedown="event.preventDefault()"
      onclick="window._app._mealNameAcSelect(${t})">
      <span style="font-size:18px;flex-shrink:0">🍽️</span>
      <span style="flex:1;font-size:14px;font-weight:600;color:var(--text1)">${f(e.name)}</span>
      ${n?`<span style="font-size:11px;color:var(--text3)">${n} Zutat${n===1?``:`en`}</span>`:``}
    </div>`}).join(``);let s=t.querySelector(`.meal-ac-item:last-child`);s&&(s.style.borderBottom=`none`),window._mealNameAcMatches=o,t.style.display=`block`}function Ci(e){let t=(window._mealNameAcMatches||[])[e];if(!t)return;let n=document.getElementById(`meal-name-input`),r=document.getElementById(`meal-ingr-input`);n&&(n.value=t.name),r&&(r.value=(t.ingredients||[]).join(`
`));let i=(window._mealRecipesList||[]).findIndex(e=>e.name===t.name);document.querySelectorAll(`.meal-recipe-btn`).forEach(e=>e.classList.toggle(`sel`,parseInt(e.dataset.idx)===i));let a=document.getElementById(`meal-name-ac`);a&&(a.style.display=`none`),window._mealNameAcIdx=-1}function wi(e){let t=document.getElementById(`meal-name-ac`);if(!t||t.style.display===`none`)return;let n=t.querySelectorAll(`.meal-ac-item`);if(n.length){if(e.key===`ArrowDown`)e.preventDefault(),window._mealNameAcIdx=Math.min((window._mealNameAcIdx||-1)+1,n.length-1);else if(e.key===`ArrowUp`)e.preventDefault(),window._mealNameAcIdx=Math.max((window._mealNameAcIdx||0)-1,0);else if(e.key===`Enter`&&(window._mealNameAcIdx||-1)>=0){e.preventDefault(),window._app._mealNameAcSelect(window._mealNameAcIdx);return}else if(e.key===`Escape`){t.style.display=`none`,window._mealNameAcIdx=-1;return}else return;n.forEach((e,t)=>{e.style.background=t===window._mealNameAcIdx?`var(--accent-bg)`:``}),n[window._mealNameAcIdx]?.scrollIntoView({block:`nearest`})}}function Ti(e){let t=document.getElementById(`meal-ingr-ac`),n=document.getElementById(`meal-ingr-input`);if(!t||!n)return;window._mealIngrAcIdx=-1;let r=n.value,i=n.selectionStart,a=r.lastIndexOf(`
`,i-1)+1,o=r.indexOf(`
`,i),s=r.slice(a,o===-1?void 0:o).trim(),c=s.match(/^[0-9.,/½¼¾]+\s*(?:g|kg|ml|l|L|cl|Stück|Stk|Pck|EL|TL|Dose|Fla|Bund|Zehe|cm)?\s*(.+)$/i),l=(c?c[1]:s).trim().toLowerCase();if(!l||l.length<2){t.style.display=`none`;return}let u=new Set,d=[];E.shopItems.filter(e=>e.name).forEach(e=>{let t=e.name.trim().toLowerCase();u.has(t)||(u.add(t),d.push(e.name))}),Object.values(E.mealRecipes).forEach(e=>{(e.ingredients||[]).forEach(e=>{let t=e.trim().replace(/^[0-9.,/½¼¾]+\s*(?:g|kg|ml|l|L|cl|Stück|Stk|Pck|EL|TL|Dose|Fla|Bund|Zehe|cm)?\s*/i,``).trim();if(t){let e=t.toLowerCase();u.has(e)||(u.add(e),d.push(t))}})});let p=d.filter(e=>e.toLowerCase().startsWith(l)),m=d.filter(e=>!e.toLowerCase().startsWith(l)&&e.toLowerCase().includes(l)),h=[...p,...m].slice(0,5);if(!h.length){t.style.display=`none`;return}t.innerHTML=h.map((e,t)=>`<div class="meal-ac-item" data-idx="${t}"
    style="padding:8px 14px;cursor:pointer;font-size:13px;font-weight:500;color:var(--text1);border-bottom:1px solid var(--border2);transition:background 0.1s"
    onmousedown="event.preventDefault()"
    onclick="window._app._mealIngrAcSelect(${t})">${f(e)}</div>`).join(``);let g=t.querySelector(`.meal-ac-item:last-child`);g&&(g.style.borderBottom=`none`),window._mealIngrAcMatches=h,t.style.display=`block`}function Ei(e){let t=(window._mealIngrAcMatches||[])[e],n=document.getElementById(`meal-ingr-input`),r=document.getElementById(`meal-ingr-ac`);if(!t||!n)return;let i=n.value,a=n.selectionStart,o=i.lastIndexOf(`
`,a-1)+1,s=i.indexOf(`
`,a),c=i.slice(o,s===-1?void 0:s).match(/^([0-9.,/½¼¾]+\s*(?:g|kg|ml|l|L|cl|Stück|Stk|Pck|EL|TL|Dose|Fla|Bund|Zehe|cm)?\s*)/i),l=(c?c[1]:``)+t,u=s===-1?i.length:s;n.value=i.slice(0,o)+l+i.slice(u),n.selectionStart=n.selectionEnd=o+l.length,r&&(r.style.display=`none`),window._mealIngrAcIdx=-1}function Di(e){let t=document.getElementById(`meal-ingr-ac`);if(!t||t.style.display===`none`)return;let n=t.querySelectorAll(`.meal-ac-item`);if(n.length){if(e.key===`ArrowDown`)e.preventDefault(),window._mealIngrAcIdx=Math.min((window._mealIngrAcIdx||-1)+1,n.length-1);else if(e.key===`ArrowUp`)e.preventDefault(),window._mealIngrAcIdx=Math.max((window._mealIngrAcIdx||0)-1,0);else if(e.key===`Tab`&&(window._mealIngrAcIdx||-1)>=0){e.preventDefault(),window._app._mealIngrAcSelect(window._mealIngrAcIdx);return}else if(e.key===`Escape`){t.style.display=`none`,window._mealIngrAcIdx=-1;return}else return;n.forEach((e,t)=>{e.style.background=t===window._mealIngrAcIdx?`var(--accent-bg)`:``}),n[window._mealIngrAcIdx]?.scrollIntoView({block:`nearest`})}}async function Oi(e,t){let n=document.getElementById(`meal-name-input`)?.value||``;if(!n.trim()){let e=document.getElementById(`meal-name-input`);e&&(e.style.borderColor=`#DC2626`);return}let r=document.getElementById(`meal-ingr-input`)?.value||``,i=document.getElementById(`meal-opt-ingr-input`)?.value||``,a=r.split(`
`).map(e=>e.trim()).filter(Boolean),o=i.split(`
`).map(e=>e.trim()).filter(Boolean),s=Array.from(document.querySelectorAll(`input[name="opt-sel"]:checked`)).map(e=>e.value);G(),await At(e,t,n,`🍽️`,a,q,H,o,s)}function ki(){let e=E._verifiedPlan;if(e===`premium`||e===`granted`){let t=e===`granted`?`Freizugang`:`Premium`,n=E.userPlanData?.premium?.currentPeriodEnd?new Date(E.userPlanData.premium.currentPeriodEnd).toLocaleDateString(`de`,{day:`2-digit`,month:`2-digit`,year:`numeric`}):null;return`<div style="width:100%;margin-top:10px;background:linear-gradient(135deg,#5C4EE5,#764ba2);border-radius:12px;padding:14px 16px;display:flex;align-items:center;gap:12px">
      <div style="font-size:28px;flex-shrink:0">⭐</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:700;color:white">famiplan Plus · ${t}</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.7);margin-top:2px">${n?`Aktiv bis `+n:`Aktiv`}</div>
      </div>
      <a href="https://app.lemonsqueezy.com/my-orders" target="_blank" style="font-size:11px;color:rgba(255,255,255,0.7);text-decoration:none;white-space:nowrap">Abo verwalten ›</a>
    </div>`}return`<button style="width:100%;margin-top:6px;padding:11px;border:none;border-radius:10px;background:#5C4EE5;color:white;font-weight:700;font-size:14px;cursor:pointer;font-family:inherit" onclick="window._app.closeModal();window._app.showUpgradeModal()">⭐ famiplan Plus</button>`}function Ai(){let e=E.members.map(e=>{let t=E.photos?.[e]?`<img src="${E.photos[e]}" style="width:32px;height:32px;border-radius:50%;object-fit:cover">`:E.av[e]||`👤`;return`<div style="position:relative">
      <button class="member-btn${E.curUser===e?` sel`:``}" onclick="window._app.selectUser('${C(e)}')">
        <div class="member-av" style="position:relative;display:inline-flex;width:32px;height:32px;align-items:center;justify-content:center">
          ${t}
          <span onclick="event.stopPropagation();window._app.showEditMemberModal('${C(e)}')"
            style="position:absolute;bottom:-5px;right:-5px;background:var(--surface);border:1px solid var(--border);border-radius:50%;width:18px;height:18px;font-size:9px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 3px rgba(0,0,0,0.2);line-height:1">✏️</span>
        </div>
        <div class="member-nm">${f(e)}</div>
      </button>
    </div>`}).join(``);U(`
    <div class="modal-handle"></div>
    <div class="modal-title">👋 Wer bist du?</div>
    <div class="modal-sub">Wähle dein Familienprofil</div>
    ${E.familyName?`
    <div style="margin-bottom:14px">
      ${E.familyName===E.familyId?``:`<div style="font-size:13px;font-weight:600;color:var(--text1);text-align:center;margin-bottom:2px">${f(E.familyName)}</div>`}
      <div style="font-size:10px;color:#c4c9d4;text-align:center;margin-bottom:10px;letter-spacing:0.5px">ID: ${E.familyId}</div>
      <button onclick="window._app.shareInviteLink()" style="width:100%;padding:12px;border:none;border-radius:12px;background:linear-gradient(135deg,#5C4EE5,#764ba2);color:white;font-weight:700;font-size:14px;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:8px">
        🔗 Familienmitglied einladen
      </button>
      <div style="font-size:10px;color:#c4c9d4;text-align:center;margin-top:6px;letter-spacing:0.5px">Teile den Link per WhatsApp, SMS oder E-Mail</div>
    </div>`:``}
    <div class="member-grid">${e}</div>
    ${E.members.length===0?`<div style="text-align:center;padding:20px;color:var(--text3);font-size:13px">Noch keine Profile.<br>Füge das erste hinzu!</div>`:``}
    <button style="width:100%;margin-top:14px;padding:11px;border:1px dashed #5C4EE5;border-radius:10px;background:var(--accent-bg);color:#5C4EE5;font-weight:600;font-size:14px;cursor:pointer;font-family:inherit" onclick="window._app.showAddMemberModal(false)">➕ Profil hinzufügen</button>
    ${E.curUser?`<button class="modal-close" onclick="window._app.closeModal()">Abbrechen</button>`:``}
    <button style="width:100%;margin-top:8px;padding:11px;border:none;border-radius:10px;background:#F5F3FF;color:#5C4EE5;font-weight:600;font-size:13px;cursor:pointer;font-family:inherit" onclick="window._app.closeModal();setTimeout(()=>window._app.showPushPage(),400)">🔔 Benachrichtigungen</button>
    ${window._app.isCalendarSyncSupported&&window._app.isCalendarSyncSupported()?`<button style="width:100%;margin-top:6px;padding:11px;border:none;border-radius:10px;background:#F5F3FF;color:#5C4EE5;font-weight:600;font-size:13px;cursor:pointer;font-family:inherit" onclick="window._app.closeModal();setTimeout(()=>window._app.showCalendarSyncPage(),400)">🗓️ Apple Kalender</button>`:``}
    <button style="width:100%;margin-top:6px;padding:11px;border:none;border-radius:10px;background:#FEF2F2;color:#DC2626;font-weight:600;font-size:13px;cursor:pointer;font-family:inherit" onclick="window._app.authSignOut()">🚪 Abmelden</button>
    <button style="width:100%;margin-top:6px;padding:9px;border:none;border-radius:10px;background:none;color:var(--text3);font-weight:500;font-size:12px;cursor:pointer;font-family:inherit" onclick="window._app.showDeleteAccountModal()">Account löschen</button>
    ${z()?`<button style="width:100%;margin-top:6px;padding:9px;border:1px solid var(--border);border-radius:10px;background:var(--bg3);color:#5C4EE5;font-weight:600;font-size:12px;cursor:pointer;font-family:inherit" onclick="window._app.closeModal();window._app.showAdminPanel()">🛡 Admin-Panel</button>`:``}
    ${ki()}
  `)}function ji(e){O({curUser:e});try{localStorage.setItem(`fp_user`,e)}catch{}let t=document.getElementById(`user-btn`);t&&(t.textContent=(E.av[e]||`👤`)+` `+e),G()}function Mi(){U(`
    <div class="modal-handle"></div>
    <div class="modal-title">📌 Neuer Beitrag</div>
    <div class="form-group">
      <textarea class="form-input" id="board-text" placeholder="Was möchtest du teilen?" rows="4" style="resize:none;font-size:16px;line-height:1.5"></textarea>
    </div>
    <div class="form-group">
      <div style="display:flex;align-items:center;gap:10px">
        <div id="board-photo-preview" style="display:none;width:64px;height:64px;border-radius:10px;overflow:hidden;flex-shrink:0">
          <img id="board-photo-img" style="width:100%;height:100%;object-fit:cover">
        </div>
        <button type="button" onclick="document.getElementById('board-photo-input').click()"
          style="flex:1;padding:10px;border:1.5px dashed #5C4EE5;border-radius:10px;background:var(--accent-bg);color:#5C4EE5;font-weight:600;font-size:13px;cursor:pointer;font-family:inherit">
          📷 Foto hinzufügen
        </button>
        <input type="file" id="board-photo-input" accept="image/*" style="display:none" onchange="window._app.boardHandlePhoto(this)">
      </div>
    </div>
    <button class="submit-btn" onclick="window._app.boardSubmitPost()">Veröffentlichen</button>
    <button class="modal-close" onclick="window._app.closeModal()">Abbrechen</button>
  `),setTimeout(()=>document.getElementById(`board-text`)?.focus(),350)}function Ni(e=`general`){let t={comments:{icon:`💬`,title:`Kommentar-Limit erreicht`,sub:`Du hast heute 5 von 5 kostenlosen Kommentaren genutzt.`,highlight:`Mit famiplan Plus kommentierst du unbegrenzt – und nutzt alle weiteren Features.`},tasks:{icon:`📋`,title:`Aufgaben-Limit erreicht`,sub:`Du hast das kostenlose Limit von 15 aktiven Aufgaben erreicht.`,highlight:`Mit famiplan Plus legst du unbegrenzt Aufgaben und Termine an.`},members:{icon:`👨‍👩‍👧‍👦`,title:`Mitglieder-Limit erreicht`,sub:`Im kostenlosen Plan sind bis zu 3 Familienmitglieder möglich.`,highlight:`Mit famiplan Plus lädt ihr unbegrenzt Familienmitglieder ein.`},shopLists:{icon:`🛒`,title:`Einkaufslisten-Limit erreicht`,sub:`Im kostenlosen Plan ist 1 Einkaufsliste möglich.`,highlight:`Mit famiplan Plus erstellt ihr beliebig viele Listen – z.B. für verschiedene Märkte.`},mealWeeks:{icon:`🍽️`,title:`Mahlzeiten vergangener Wochen`,sub:`Im kostenlosen Plan ist nur die aktuelle Woche verfügbar.`,highlight:`Mit famiplan Plus planst du beliebige Wochen – auch rückwirkend.`},pushFull:{icon:`🔔`,title:`Mehr Push-Benachrichtigungen`,sub:`Im kostenlosen Plan sind nur Erinnerungen vor Terminen verfügbar.`,highlight:`Mit famiplan Plus erhältst du alle Benachrichtigungen – neue Aufgaben, Kommentare, Board-Posts und Morgens-Übersicht.`},calendarSync:{icon:`🗓️`,title:`Apple Kalender Sync`,sub:`Automatischer Termin-Abgleich ist ein Plus-Feature.`,highlight:`Mit famiplan Plus erscheinen famiplan-Termine automatisch in deinem iPhone-Kalender – und umgekehrt.`},general:{icon:`⭐`,title:`famiplan Plus`,sub:`Unbegrenzter Zugang für deine Familie.`,highlight:`Alles was famiplan bietet – ohne Einschränkungen.`}},n=t[e]||t.general;U(`
    <div class="modal-handle"></div>
    <div style="text-align:center;padding:8px 0 4px">
      <div style="font-size:48px;margin-bottom:10px">${n.icon}</div>
      <div class="modal-title">${n.title}</div>
      <div class="modal-sub" style="margin-bottom:16px">${n.sub}</div>
    </div>

    <div style="background:linear-gradient(135deg,#EEF2FF,#F5F3FF);border-radius:14px;padding:14px 16px;margin-bottom:16px;border:1px solid #c7d2fe">
      <div style="font-size:12px;font-weight:600;color:#4338ca;margin-bottom:8px">${n.highlight}</div>
      <div style="font-size:12px;color:#4338ca;line-height:1.9">
        ✓ Unbegrenzte Aufgaben, Kommentare & Board-Posts<br>
        ✓ Unbegrenzte Familienmitglieder & Einkaufslisten<br>
        ✓ Mahlzeiten für alle Wochen planbar<br>
        ✓ ✨ KI-Rezept-Import per URL, Text oder Foto<br>
        ✓ Alle Push-Benachrichtigungen<br>
        ✓ Apple Kalender Sync (iOS)
      </div>
    </div>

    <div style="background:#5C4EE5;border-radius:14px;padding:16px;margin-bottom:8px;cursor:pointer;position:relative;overflow:hidden" onclick="window._app.openCheckout('yearly')">
      <div style="position:absolute;top:8px;right:10px;background:#F59E0B;color:white;font-size:9px;font-weight:800;padding:2px 7px;border-radius:20px;letter-spacing:0.5px">BELIEBT</div>
      <div style="font-size:16px;font-weight:800;color:white">14,99 € / Jahr</div>
      <div style="font-size:12px;color:rgba(255,255,255,0.75);margin-top:2px">= 1,25 € pro Monat · 2 Monate gratis</div>
    </div>

    <button style="width:100%;padding:13px;background:var(--accent-bg);color:#5C4EE5;border:1.5px solid #c7d2fe;border-radius:12px;font-weight:700;font-size:14px;cursor:pointer;font-family:inherit;margin-bottom:4px" onclick="window._app.openCheckout('monthly')">
      1,99 € / Monat
    </button>

    <div style="font-size:11px;color:var(--text3);text-align:center;margin-bottom:12px">Jederzeit kündbar · Sichere Zahlung via LemonSqueezy</div>
    <button class="modal-close" onclick="window._app.closeModal()">Vielleicht später</button>
  `)}function Pi(e){if(!e)return;let t=encodeURIComponent(e),n=document.createElement(`a`);n.href=`maps://maps.apple.com/?q=${t}`,n.click(),setTimeout(()=>{let e=document.createElement(`a`);e.href=`https://maps.apple.com/?q=${t}`,e.target=`_blank`,e.click()},300)}function Fi(){U(`
    <div class="modal-handle"></div>
    <div style="text-align:center;font-size:40px;margin-bottom:12px">⚠️</div>
    <div class="modal-title" style="color:#DC2626">Account löschen</div>
    <div class="modal-sub" style="margin-bottom:16px">Diese Aktion kann nicht rückgängig gemacht werden.</div>
    ${E.currentAuthUser?.providerData?.[0]?.providerId===`google.com`?``:`
    <div style="margin-bottom:14px">
      <label style="display:block;font-size:11px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px">Passwort bestätigen</label>
      <input type="password" id="del-password" class="form-input" placeholder="Dein Passwort" autocomplete="current-password"/>
    </div>`}
    <div id="del-err" style="font-size:12px;color:#DC2626;min-height:18px;margin-bottom:8px;font-weight:500"></div>
    <button id="del-confirm-btn" style="width:100%;padding:13px;border:none;border-radius:10px;background:#DC2626;color:white;font-weight:700;font-size:15px;cursor:pointer;font-family:inherit"
      onclick="window._app.deleteAccount()">Ja, Account unwiderruflich löschen</button>
    <button class="modal-close" onclick="window._app.closeModal()">Abbrechen</button>
  `)}function Ii(e,t,n){let r=n||window._mealCurrentRecipeKey,i=document.getElementById(`meal-name-input`)?.value?.trim()||``,a=i.toLowerCase().replace(/[^a-z0-9äöüß]/g,`_`).slice(0,40),o=r||a,s=E.mealRecipes[o]||{name:i,steps:[],prepTime:0,servings:4},c=(s.steps||[]).map((e,t)=>`
    <div class="recipe-step-row" id="step-row-${t}" style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px">
      <div style="width:24px;height:24px;border-radius:50%;background:#5C4EE5;color:white;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:8px">${t+1}</div>
      <textarea class="form-input step-input" data-step="${t}" rows="2"
        style="flex:1;resize:none;line-height:1.5;font-size:13px"
        placeholder="Schritt ${t+1} beschreiben…">${f(e)}</textarea>
      <button type="button" onclick="window._app._recipeRemoveStep(${t})"
        style="width:28px;height:28px;border:none;border-radius:6px;background:var(--red-bg);color:var(--red-text);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;margin-top:6px;font-size:14px">×</button>
    </div>`).join(``);U(`
    <div class="modal-handle"></div>
    <div class="modal-title">📖 Zubereitung</div>
    <div class="modal-sub" style="margin-bottom:14px">${f(s.name||i||`Rezept`)}</div>
    <div style="display:flex;gap:10px;margin-bottom:14px">
      <div style="flex:1">
        <label class="form-lbl">Vorbereitungszeit</label>
        <div style="display:flex;align-items:center;gap:6px">
          <input class="form-input" id="recipe-prep-time" type="number" min="0" max="300" value="${s.prepTime||``}"
            placeholder="0" style="width:70px;text-align:center"/>
          <span style="font-size:13px;color:var(--text2)">Min.</span>
        </div>
      </div>
      <div style="flex:1">
        <label class="form-lbl">Portionen</label>
        <div style="display:flex;align-items:center;gap:6px">
          <input class="form-input" id="recipe-servings" type="number" min="1" max="20" value="${s.servings||4}"
            placeholder="4" style="width:70px;text-align:center"/>
          <span style="font-size:13px;color:var(--text2)">Pers.</span>
        </div>
      </div>
    </div>
    <div id="recipe-steps-list" style="margin-bottom:10px">
      ${c||`<div id="steps-empty" style="text-align:center;padding:20px;color:var(--text3);font-size:13px">Noch keine Schritte – füge den ersten hinzu</div>`}
    </div>
    <button type="button" onclick="window._app._recipeAddStep()"
      style="width:100%;padding:10px;border:1.5px dashed var(--border);border-radius:10px;background:transparent;font-size:13px;font-weight:600;color:#5C4EE5;cursor:pointer;font-family:inherit;margin-bottom:14px">
      + Schritt hinzufügen
    </button>
    <button class="submit-btn" onclick="window._app._recipeSaveSteps('${C(e)}','${C(t)}','${C(o)}')">Speichern</button>
    <button class="modal-close" onclick="window._app._recipeStepsBack('${C(e)}','${C(t)}')">Zurück zur Mahlzeit</button>
  `)}function Li(e,t){let n=E.meals[e]?.[t];if(!n?.name)return;let r=n.name.toLowerCase().replace(/[^a-z0-9äöüß]/g,`_`).slice(0,40),i=E.mealRecipes[r];if(!i?.steps?.length){Q(e,t);return}new Date(e+`T12:00:00`).toLocaleDateString(`de-DE`,{weekday:`long`,day:`numeric`,month:`long`});let a=i.ingredients?.length||0,o=[i.prepTime?`⏱ ${i.prepTime} Min.`:``,i.servings?`👥 ${i.servings} Portionen`:``].filter(Boolean).join(` · `),s=a?`
    <div style="margin-bottom:16px">
      <div style="font-size:12px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">Zutaten</div>
      ${i.ingredients.map(e=>`
        <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border2);font-size:14px;color:var(--text1)">
          <span style="color:var(--text3)">·</span> ${f(e)}
        </div>`).join(``)}
    </div>`:``,c=`
    <div style="margin-bottom:16px">
      <div style="font-size:12px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">Zubereitung</div>
      ${i.steps.map((e,t)=>`
        <div style="display:flex;gap:12px;margin-bottom:12px;align-items:flex-start">
          <div style="width:26px;height:26px;border-radius:50%;background:#5C4EE5;color:white;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0">${t+1}</div>
          <div style="flex:1;font-size:14px;color:var(--text1);line-height:1.5;padding-top:3px">${f(e)}</div>
        </div>`).join(``)}
    </div>`,l=a&&!n.addedToShop?`<button class="submit-btn" style="margin-bottom:8px" onclick="window._app.mealIngredientsToShop('${C(e)}','${C(t)}');window._app.closeModal()">
        🛒 Zutaten zur Einkaufsliste
      </button>`:``;U(`
    <div class="modal-handle"></div>
    <div style="text-align:center;font-size:40px;margin-bottom:6px">&#x1F37D;&#xFE0F;</div>
    <div class="modal-title">${f(n.name)}</div>
    ${o?`<div style="text-align:center;font-size:13px;color:var(--text3);margin-bottom:16px">${o}</div>`:`<div style="margin-bottom:16px"></div>`}
    ${s}
    ${c}
    ${l}
    <button class="submit-btn" style="margin-bottom:8px" onclick="window._app.closeModal();setTimeout(()=>import('./ui/modals.js').then(m=>m.showRecipeEditModal('${C(r)}')),350)">✏️ Rezept bearbeiten</button>
    <button class="modal-close" onclick="window._app.closeModal()">Schließen</button>
  `)}function Ri(){if(!Le()&&!z()){U(`
      <div class="modal-handle"></div>
      <div style="text-align:center;font-size:48px;margin-bottom:8px">✨</div>
      <div class="modal-title">KI-Rezept-Import</div>
      <div class="modal-sub" style="margin-bottom:20px">Importiere Rezepte per URL, Text oder Foto – nur mit famiplan Plus.</div>
      <button onclick="window._app.closeModal();setTimeout(()=>import('./modules/premium.js').then(m=>m.showPremiumModal()),100)"
        style="width:100%;padding:14px;background:linear-gradient(135deg,#5C4EE5,#7C6EE8);color:white;border:none;border-radius:12px;font-weight:700;font-size:15px;cursor:pointer;font-family:inherit;margin-bottom:10px">
        ⭐ Jetzt Plus holen
      </button>
      <button onclick="window._app.closeModal()"
        style="width:100%;padding:12px;background:transparent;color:var(--text3);border:none;border-radius:12px;font-size:14px;cursor:pointer;font-family:inherit">
        Abbrechen
      </button>
    `);return}U(`
    <div class="modal-handle"></div>
    <div class="modal-title">✨ Rezept importieren</div>
    <div class="modal-sub" style="margin-bottom:14px">URL, Text oder Foto – die KI erkennt alles</div>

    <div style="display:flex;gap:8px;margin-bottom:14px">
      <button type="button" id="import-tab-text" onclick="window._app._recipeImportTab('text')"
        style="flex:1;padding:9px;border:1.5px solid #5C4EE5;border-radius:10px;background:#5C4EE5;color:white;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">
        🔗 URL / Text
      </button>
      <button type="button" id="import-tab-photo" onclick="window._app._recipeImportTab('photo')"
        style="flex:1;padding:9px;border:1.5px solid var(--border);border-radius:10px;background:transparent;color:var(--text2);font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">
        📷 Foto
      </button>
    </div>

    <div id="import-panel-text">
      <div class="form-group">
        <label class="form-lbl">URL (optional)</label>
        <input class="form-input" id="recipe-import-url" type="url"
          placeholder="z.B. https://www.chefkoch.de/rezepte/..."
          autocomplete="off" autocorrect="off" autocapitalize="off"/>
        <div style="font-size:11px;color:var(--text3);margin-top:4px">Klappt nicht bei allen Seiten – dann Text einfügen</div>
      </div>
      <div class="form-group">
        <label class="form-lbl">Rezepttext</label>
        <textarea class="form-input" id="recipe-import-text" rows="5"
          style="resize:none;line-height:1.5;font-size:13px"
          placeholder="Rezept hier einfügen – Name, Zutaten, Zubereitung…&#10;&#10;Die KI erkennt das Format automatisch."></textarea>
      </div>
    </div>

    <div id="import-panel-photo" style="display:none">
      <div style="margin-bottom:12px">
        <input type="file" id="recipe-import-photo" accept="image/*" capture="environment" style="display:none"
          onchange="window._app._recipeImportPhotoSelected(this)"/>
        <div id="recipe-photo-preview" style="width:100%;min-height:160px;border:2px dashed var(--border);border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;cursor:pointer;background:var(--bg2)"
          onclick="document.getElementById('recipe-import-photo').click()">
          <div style="font-size:36px">📷</div>
          <div style="font-size:13px;font-weight:600;color:var(--text2)">Foto aufnehmen oder aus Galerie wählen</div>
          <div style="font-size:11px;color:var(--text3)">Kochbuch, Zeitschrift, handgeschriebenes Rezept</div>
        </div>
      </div>
    </div>

    <div id="recipe-import-err" style="font-size:12px;color:#DC2626;min-height:16px;margin-bottom:8px"></div>
    <button class="submit-btn" id="recipe-import-btn" onclick="window._app._recipeImportStart()">
      ✨ Analysieren
    </button>
    <button class="modal-close" onclick="window._app.showRecipeManager()">Zurück</button>
  `)}async function zi(){let e=document.getElementById(`recipe-import-url`),t=document.getElementById(`recipe-import-text`),n=document.getElementById(`recipe-import-err`),r=document.getElementById(`recipe-import-btn`),i=e?.value.trim()||``,a=t?.value.trim()||``,o=window._recipeImportPhotoData||null,s=document.getElementById(`import-panel-photo`),c=s&&s.style.display!==`none`;if(c&&!o){n&&(n.textContent=`Bitte zuerst ein Foto auswählen`);return}if(!c&&!i&&!a){n&&(n.textContent=`Bitte URL oder Text eingeben`);return}r&&(r.disabled=!0,r.textContent=`✨ Wird analysiert…`),n&&(n.textContent=``);try{let e=await fetch(`https://famiplan-recipe-import.maikotten78.workers.dev`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify(c?{photo:o}:{url:i||void 0,text:a||void 0}),signal:AbortSignal.timeout(25e3)}),s=await e.json();if(!e.ok||s.error){if(e.status===422){n&&(n.textContent=s.hint||s.error||`URL konnte nicht geladen werden`),t&&(t.focus(),t.placeholder=`Bitte Rezepttext hier manuell einfügen…`),r&&(r.disabled=!1,r.textContent=`✨ Analysieren`);return}throw Error(s.error||`Unbekannter Fehler`)}let l=s.recipe;if(!l?.name)throw Error(`Kein Rezept erkannt`);window._recipeImportPhotoData=null,Bi(l)}catch(e){n&&(n.textContent=`Fehler: `+(e.message||`Unbekannter Fehler`)),r&&(r.disabled=!1,r.textContent=`✨ Analysieren`)}}function Bi(e){let t=(e.ingredients||[]).map((e,t)=>`<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid var(--border2)">
      <input type="text" class="recipe-preview-ingr" data-idx="${t}" value="${f(e)}"
        style="flex:1;border:none;background:transparent;font-size:13px;color:var(--text1);outline:none;font-family:inherit"/>
    </div>`).join(``),n=(e.steps||[]).map((e,t)=>`<div style="display:flex;gap:10px;margin-bottom:8px;align-items:flex-start">
      <div style="width:22px;height:22px;border-radius:50%;background:#5C4EE5;color:white;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px">${t+1}</div>
      <textarea class="recipe-preview-step form-input" data-idx="${t}" rows="2"
        style="flex:1;resize:none;font-size:13px;line-height:1.5">${f(e)}</textarea>
    </div>`).join(``),r=[e.prepTime?`${e.prepTime} Min.`:``,e.servings?`${e.servings} Portionen`:``].filter(Boolean).join(` · `);U(`
    <div class="modal-handle"></div>
    <div class="modal-title">✅ Rezept erkannt</div>
    <div style="margin-bottom:14px">
      <label class="form-lbl">Name</label>
      <input class="form-input" id="recipe-preview-name" value="${f(e.name||``)}" maxlength="80"/>
      ${r?`<div style="font-size:11px;color:var(--text3);margin-top:4px">${f(r)}</div>`:``}
    </div>
    ${t?`<div style="margin-bottom:14px">
      <label class="form-lbl">${(e.ingredients||[]).length} Zutaten (bearbeitbar)</label>
      <div style="border:1px solid var(--border);border-radius:10px;padding:4px 10px;max-height:160px;overflow-y:auto">
        ${t}
      </div>
    </div>`:``}
    ${n?`<div style="margin-bottom:14px">
      <label class="form-lbl">${(e.steps||[]).length} Zubereitungsschritte (bearbeitbar)</label>
      <div style="max-height:200px;overflow-y:auto">
        ${n}
      </div>
    </div>`:``}
    <button class="submit-btn" onclick="window._app._recipeImportSave(${JSON.stringify(e).replace(/"/g,`&quot;`)})">
      ✓ Rezept speichern
    </button>
    <button class="modal-close" onclick="window._app.showRecipeImportModal()">Nochmal versuchen</button>
  `)}async function Vi(e){let t=document.getElementById(`recipe-preview-name`)?.value.trim()||e.name;if(!t)return;let n=Array.from(document.querySelectorAll(`.recipe-preview-ingr`)).map(e=>e.value.trim()).filter(Boolean),r=Array.from(document.querySelectorAll(`.recipe-preview-step`)).map(e=>e.value.trim()).filter(Boolean),i=t.toLowerCase().replace(/[^a-z0-9äöüß]/g,`_`).slice(0,40),a={name:t,ingredients:n,steps:r,...e.prepTime?{prepTime:e.prepTime}:{},...e.servings?{servings:e.servings}:{},usedAt:Date.now(),useCount:1},{saveRecipeSteps:o}=await I(async()=>{let{saveRecipeSteps:e}=await Promise.resolve().then(()=>(zt(),Tt));return{saveRecipeSteps:e}},void 0),{fbSet:s}=await I(async()=>{let{fbSet:e}=await import(`./firebase-BULWIflD.js`).then(e=>(e.l(),e.s));return{fbSet:e}},__vite__mapDeps([0,1,2,3])),{state:c}=await I(async()=>{let{state:e}=await import(`./state-BxTl7OOb.js`).then(e=>(e.n(),e.a));return{state:e}},__vite__mapDeps([3,1,2]));if(!c.familyId)return;let{setState:l}=await I(async()=>{let{setState:e}=await import(`./state-BxTl7OOb.js`).then(e=>(e.n(),e.a));return{setState:e}},__vite__mapDeps([3,1,2]));l({mealRecipes:{...c.mealRecipes,[i]:a}});try{await s(`mealRecipes/${i}`,a);let{showSync:e}=await I(async()=>{let{showSync:e}=await import(`./modal-C6B7Vjjr.js`).then(e=>(e.n(),e.r));return{showSync:e}},__vite__mapDeps([13,1,3,2]));e(`✓ Rezept importiert!`)}catch{}pi(window._recipeManagerIso||null,window._recipeManagerType||`dinner`)}function Hi(e){let t=document.getElementById(`import-panel-text`),n=document.getElementById(`import-panel-photo`),r=document.getElementById(`import-tab-text`),i=document.getElementById(`import-tab-photo`);if(!t||!n)return;let a=e===`text`;t.style.display=a?``:`none`,n.style.display=a?`none`:``;let o=`flex:1;padding:9px;border:1.5px solid #5C4EE5;border-radius:10px;background:#5C4EE5;color:white;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit`,s=`flex:1;padding:9px;border:1.5px solid var(--border);border-radius:10px;background:transparent;color:var(--text2);font-size:12px;font-weight:700;cursor:pointer;font-family:inherit`;r&&(r.style.cssText=a?o:s),i&&(i.style.cssText=a?s:o)}function Ui(e){let t=e.files?.[0];if(!t)return;let n=new FileReader;n.onload=e=>{let t=e.target.result;window._recipeImportPhotoData=t;let n=document.getElementById(`recipe-photo-preview`);n&&(n.innerHTML=`
        <img src="${t}" style="width:100%;max-height:220px;object-fit:contain;border-radius:10px"/>
        <div style="font-size:12px;color:var(--text3);margin-top:6px">Foto ausgewählt – jetzt Analysieren tippen</div>
      `,n.style.border=`2px solid #5C4EE5`,n.style.cursor=`default`,n.onclick=null)},n.readAsDataURL(t)}var $=n((()=>{_(),D(),w(),xe(),V(),W(),F(),window._recipeManagerSort=window._recipeManagerSort||`alpha`,window._recipeManagerQuery=window._recipeManagerQuery||``,typeof window<`u`&&(window._rebuildOptChecks=Yr,window._rebuildOptChecks=function(e){let t=document.getElementById(`meal-opt-checks`);if(!t)return;let n=e.split(`
`).map(e=>e.trim()).filter(Boolean);if(!n.length){t.innerHTML=``;return}let r={};t.querySelectorAll(`input[name="opt-sel"]`).forEach(e=>{r[e.value]=e.checked}),t.innerHTML=`<div style="font-size:11px;color:var(--text3);margin-bottom:2px">Diese Woche dabei?</div>`+n.map(function(e){var t=r[e]||!1,n=`opt-cb-`+e.replace(/[^a-z0-9]/gi,`_`),i=t?`width:18px;height:18px;border-radius:5px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border:1.5px solid #059669;background:#059669;`:`width:18px;height:18px;border-radius:5px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border:1.5px solid var(--border);background:transparent;`,a=t?`font-size:13px;color:#059669;`:`font-size:13px;color:var(--text1);`;return`<label style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:3px 0" onclick="window._togOptCb('`+n+`')"><input type="checkbox" id="`+n+`" name="opt-sel" value="`+e.replace(/"/g,`&quot;`)+`"`+(t?` checked`:``)+` style="display:none"><span id="box-`+n+`" style="`+i+`">`+(t?`<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 5l2.5 2.5 4.5-4.5"/></svg>`:``)+`</span><span id="txt-`+n+`" style="`+a+`">`+e+`</span></label>`}).join(``)},window._togOptCb=function(e){let t=document.getElementById(e),n=document.getElementById(`box-`+e),r=document.getElementById(`txt-`+e);!t||!n||(t.checked=!t.checked,t.checked?(n.style.cssText=`width:18px;height:18px;border-radius:5px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border:1.5px solid #059669;background:#059669;`,n.innerHTML=`<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 5l2.5 2.5 4.5-4.5"/></svg>`,r&&(r.style.color=`#059669`)):(n.style.cssText=`width:18px;height:18px;border-radius:5px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border:1.5px solid var(--border);background:transparent;`,n.innerHTML=``,r&&(r.style.color=`var(--text1)`)))})}));D(),A(),oe(),w(),xe(),Ae(),zt(),We(),V(),W(),$t(),Gn(),$(),hn(),F();function Wi(){let e=localStorage.getItem(`fp_dark_mode`)||`system`,t=document.documentElement;e===`dark`?t.setAttribute(`data-theme`,`dark`):e===`light`?t.setAttribute(`data-theme`,`light`):t.removeAttribute(`data-theme`)}Wi(),ln(),window.matchMedia(`(prefers-color-scheme: dark)`).addEventListener(`change`,()=>{(!localStorage.getItem(`fp_dark_mode`)||localStorage.getItem(`fp_dark_mode`)===`system`)&&Wi()}),window._app={renderContent:q,toggleShopCat:Vn,showAddModal:oi,showEditModal:si,exportCal:ci,openMaps:Pi,setFF:Xr,setDate:Zr,toggleWD:Qr,onEndTimeChange:$r,onDurChange:ei,toggleAttendee:ti,toggleVisibleTo:ni,showMealEditModal:Q,applyMealRecipe:li,confirmSaveMeal:Oi,_mealNameAcUpdate:Si,_mealNameAcSelect:Ci,_mealNameAcKey:wi,_mealIngrAcUpdate:Ti,_mealIngrAcSelect:Ei,_mealIngrAcKey:Di,showRecipeManager:pi,recipeManagerSearch:mi,recipeManagerSort:hi,recipeManagerEdit:vi,recipeManagerDeleteConfirm:bi,recipeManagerDelete:xi,recipeManagerApply:gi,toggleMealExtras:e=>{I(()=>Promise.resolve().then(()=>(Gn(),gn)).then(t=>t.toggleMealExtras(e)),void 0)},showUserModal:Ai,selectUser:ji,showCalendarSyncPage:Jr,isCalendarSyncSupported:jr,showBoardNewModal:Mi,showUpgradeModal:Ni,showDeleteAccountModal:()=>Fi(),toggleEmojiGrid:e=>{let t=document.getElementById(`f-emoji-grid`),n=t.style.display===`none`;t.style.display=n?`grid`:`none`,e.textContent=n?`▾ Schließen`:`▸ Auswählen`},_fdSet:(e,t,n)=>{O(n===`e`?{ed:{...E.ed,[e]:t}}:{fd:{...E.fd,[e]:t}})},closeModal:G,showSync:H,showAddMemberModal:e=>Ct(e,U,G,H,Ai),showEditMemberModal:e=>wt(e,U),obGoTo:J,obSelectEmoji:Jn,obCreateFamily:Xn,obJoinFamily:Zn,obCreateProfile:Qn,exitDemoMode:or,obAddTemplates:$n,obShareInvite:er,obFinish:tr,obShowDemo:ar,exitDemoMode:or,shareInviteLink:nr,showInstallPrompt:rr,onFabClick:ir,showShopAddModal:()=>{O({newShopItem:{name:``,emoji:`🛒`,category:`sonstiges`,qty:1,unit:``,fav:!1}});let e=[{id:`obst`,name:`Obst & Gemüse`,icon:`🥦`},{id:`milch`,name:`Milch & Käse`,icon:`🧀`},{id:`fleisch`,name:`Fleisch & Fisch`,icon:`🥩`},{id:`brot`,name:`Brot`,icon:`🍞`},{id:`tiefkuehl`,name:`Tiefkühl`,icon:`🧊`},{id:`getraenke`,name:`Getränke`,icon:`🥤`},{id:`snacks`,name:`Snacks`,icon:`🍫`},{id:`haushalt`,name:`Haushalt`,icon:`🧹`},{id:`hygiene`,name:`Hygiene`,icon:`🧴`},{id:`sonstiges`,name:`Sonstiges`,icon:`📦`}],t={};try{t=JSON.parse(localStorage.getItem(`fp_shop_cat_freq`)||`{}`)}catch{}let n=[...e].sort((e,n)=>(t[n.id]||0)-(t[e.id]||0)),r=n[0]?.id||`sonstiges`;window._app._shopAddCat=r;let i=[1,2,3,4,5,6,7,8,9,10,12,15,20,25,50,100,200,500].map(e=>`<option value="${e}"${e===1?` selected`:``}>${e}</option>`).join(``),a=[``,`Stück`,`g`,`kg`,`ml`,`L`,`EL`,`TL`,`Pck`,`Bund`,`Zehe`,`Scheibe`,`Dose`,`Fla`].map(e=>`<option value="${e}">${e||`–`}</option>`).join(``),o=n.map(e=>`<button class="cat-btn${e.id===r?` sel`:``}" data-cat="${e.id}"
      onclick="document.querySelectorAll('#shop-add-cats .cat-btn').forEach(b=>b.classList.remove('sel'));this.classList.add('sel');window._app._shopAddCat=this.dataset.cat"
      >${e.icon} ${e.name}</button>`).join(``),s=`SpeechRecognition`in window||`webkitSpeechRecognition`in window;U(`
      <div class="modal-handle"></div>
      <div class="modal-title">🛒 Artikel hinzufügen</div>
      <div class="form-group">
        <label class="form-lbl">Artikel</label>
        <div style="position:relative">
          <input class="form-input" id="shop-item-name" maxlength="100" placeholder="z.B. Milch, Brot…" autocomplete="off"
            style="${s?`padding-right:40px`:``}"
            oninput="window._app._shopAcUpdate(this.value)"
            onkeydown="window._app._shopAcKey(event)"/>
          ${s?`<button type="button" id="shop-mic-btn" onclick="window._app._shopMicStart()"
           style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;font-size:20px;cursor:pointer;padding:4px;line-height:1;color:var(--text3);transition:color 0.2s"
           title="Spracheingabe">🎤</button>`:``}
        </div>
        <div id="shop-ac-list" style="display:none;background:var(--surface);border:1px solid var(--border);border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.10);margin-top:4px;overflow:hidden;max-height:220px;overflow-y:auto"></div>
      </div>
      <div class="form-group">
        <label class="form-lbl">Menge & Einheit</label>
        <div style="display:flex;gap:10px">
          <select class="form-select" id="shop-add-qty">${i}</select>
          <select class="form-select" id="shop-add-unit">${a}</select>
        </div>
      </div>
      <div class="form-group">
        <label class="form-lbl">Kategorie</label>
        <div class="cat-grid" id="shop-add-cats">${o}</div>
      </div>
      <button class="submit-btn" onclick="window._app._shopConfirmAdd()">Hinzufügen ✓</button>
      <button class="modal-close" onclick="window._app.closeModal()">Abbrechen</button>
    `),setTimeout(()=>document.getElementById(`shop-item-name`)?.focus(),350)},_shopAddCat:`sonstiges`,_shopAcIdx:-1,_shopAcCandidates:[],_shopCatFreqBump:e=>{if(!(!e||e===`sonstiges`))try{let t=JSON.parse(localStorage.getItem(`fp_shop_cat_freq`)||`{}`);t[e]=(t[e]||0)+1,localStorage.setItem(`fp_shop_cat_freq`,JSON.stringify(t))}catch{}},_shopMicStart:()=>{let e=window.SpeechRecognition||window.webkitSpeechRecognition;if(!e)return;let t=new e;t.lang=`de-DE`,t.interimResults=!1,t.maxAlternatives=1;let n=document.getElementById(`shop-mic-btn`);n&&(n.textContent=`🔴`,n.style.color=`#DC2626`),t.start(),t.onresult=e=>{let t=e.results[0][0].transcript.trim(),r=document.getElementById(`shop-item-name`);r&&(r.value=t,window._app._shopAcUpdate(t)),n&&(n.textContent=`🎤`,n.style.color=``)},t.onerror=()=>{n&&(n.textContent=`🎤`,n.style.color=``)},t.onend=()=>{n&&(n.textContent=`🎤`,n.style.color=``)}},_shopAcUpdate:e=>{let t=Te(e);t&&(window._app._shopAddCat=t,document.querySelectorAll(`#shop-add-cats .cat-btn`).forEach(e=>e.classList.toggle(`sel`,e.dataset.cat===t)));let n=document.getElementById(`shop-ac-list`);if(!n)return;window._app._shopAcIdx=-1;let r=e.trim().toLowerCase();if(!r){n.style.display=`none`;return}let i=e=>String(e||``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`),a={};E.shopItems.filter(e=>e.name).forEach(e=>{let t=e.name.trim().toLowerCase();(!a[t]||(e.addedAt||0)>(a[t].addedAt||0))&&(a[t]=e)});let o=Object.values(a).sort((e,t)=>e.fav&&!t.fav?-1:!e.fav&&t.fav?1:(t.addedAt||0)-(e.addedAt||0)),s=o.filter(e=>e.name.toLowerCase().startsWith(r)),c=o.filter(e=>!e.name.toLowerCase().startsWith(r)&&e.name.toLowerCase().includes(r)),l=[...s,...c].slice(0,6);if(!l.length){n.style.display=`none`;return}let u={obst:`🥦`,milch:`🧀`,fleisch:`🥩`,brot:`🍞`,tiefkuehl:`🧊`,getraenke:`🥤`,snacks:`🍫`,haushalt:`🧹`,hygiene:`🧴`,sonstiges:`📦`};n.innerHTML=l.map((e,t)=>{let n=e.category||Te(e.name)||`sonstiges`,r=u[n]||`📦`,a=e.qty&&e.qty!==1?` · ${e.qty}${e.unit?` `+e.unit:``}`:e.unit?` · ${e.unit}`:``,o=!!(e.name&&n);return`<div class="shop-ac-item" data-idx="${t}"
        style="display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer;border-bottom:1px solid var(--border2);transition:background 0.1s"
        onmousedown="event.preventDefault()">
        <span style="font-size:18px;flex-shrink:0" onclick="window._app._shopAcSelect(${t})">${e.fav?`⭐`:r}</span>
        <span style="flex:1;font-size:14px;font-weight:600;color:var(--text1)" onclick="window._app._shopAcSelect(${t})">${i(e.name)}</span>
        <span style="font-size:11px;color:var(--text3);white-space:nowrap;margin-right:6px" onclick="window._app._shopAcSelect(${t})">${i(a)}</span>
        ${o?`<button onmousedown="event.preventDefault()" onclick="window._app._shopAcQuickAdd(${t})"
          style="flex-shrink:0;padding:4px 9px;background:#5C4EE5;color:white;border:none;border-radius:7px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;white-space:nowrap">+ Sofort</button>`:``}
      </div>`}).join(``);let d=n.querySelector(`.shop-ac-item:last-child`);d&&(d.style.borderBottom=`none`),window._app._shopAcCandidates=l,n.style.display=`block`},_shopAcSelect:e=>{let t=(window._app._shopAcCandidates||[])[e];if(!t)return;let n=document.getElementById(`shop-item-name`);n&&(n.value=t.name);let r=t.category||Te(t.name)||`sonstiges`;if(window._app._shopAddCat=r,document.querySelectorAll(`#shop-add-cats .cat-btn`).forEach(e=>e.classList.toggle(`sel`,e.dataset.cat===r)),t.qty){let e=document.getElementById(`shop-add-qty`);e&&[...e.options].find(e=>String(e.value)===String(t.qty))&&(e.value=t.qty)}if(t.unit!==void 0){let e=document.getElementById(`shop-add-unit`);e&&[...e.options].find(e=>e.value===t.unit)&&(e.value=t.unit)}let i=document.getElementById(`shop-ac-list`);i&&(i.style.display=`none`),window._app._shopAcIdx=-1},_shopAcQuickAdd:async e=>{let t=(window._app._shopAcCandidates||[])[e];if(!t)return;let n=t.category||Te(t.name)||`sonstiges`,r=t.name.trim().toLowerCase(),i=E.shopItems.find(e=>e.list===E.activeShopList&&e.name.trim().toLowerCase()===r&&!e.checked);if(i){let e=(parseFloat(i.qty)||1)+(parseFloat(t.qty)||1),{id:n,...r}=i,{fbSet:a}=await I(async()=>{let{fbSet:e}=await import(`./firebase-BULWIflD.js`).then(e=>(e.l(),e.s));return{fbSet:e}},__vite__mapDeps([0,1,2,3]));await a(`shopping/items/${i.id}`,{...r,qty:e}),O({shopItems:E.shopItems.map(t=>t.id===i.id?{...t,qty:e}:t)}),G(),H(`✓ ${t.name} · Menge auf ${e} erhöht`),q();return}O({newShopItem:{name:t.name,emoji:`🛒`,category:n,qty:t.qty||1,unit:t.unit||``,fav:!1}}),ke(t.name,n),window._app._shopCatFreqBump(n);let{shopAddItem:a}=await I(async()=>{let{shopAddItem:e}=await import(`./shopping-jp0CsUb_.js`).then(e=>(e.n(),e.p));return{shopAddItem:e}},__vite__mapDeps([6,1,2,3,0,7,5]));await a(G,H,q,B)},_shopAcKey:e=>{let t=document.getElementById(`shop-ac-list`);if(!t||t.style.display===`none`)return;let n=t.querySelectorAll(`.shop-ac-item`);if(n.length){if(e.key===`ArrowDown`)e.preventDefault(),window._app._shopAcIdx=Math.min(window._app._shopAcIdx+1,n.length-1);else if(e.key===`ArrowUp`)e.preventDefault(),window._app._shopAcIdx=Math.max(window._app._shopAcIdx-1,0);else if(e.key===`Enter`&&window._app._shopAcIdx>=0){e.preventDefault(),window._app._shopAcSelect(window._app._shopAcIdx);return}else if(e.key===`Escape`){t.style.display=`none`,window._app._shopAcIdx=-1;return}else return;n.forEach((e,t)=>{e.style.background=t===window._app._shopAcIdx?`var(--accent-bg)`:``}),n[window._app._shopAcIdx]?.scrollIntoView({block:`nearest`})}},_shopConfirmAdd:async()=>{let e=document.getElementById(`shop-item-name`)?.value?.trim();if(!e){document.getElementById(`shop-item-name`)?.focus();return}let t=parseFloat(document.getElementById(`shop-add-qty`)?.value)||1,n=document.getElementById(`shop-add-unit`)?.value||``,r=window._app._shopAddCat||`sonstiges`,i=e.trim().toLowerCase(),a=E.shopItems.find(e=>e.list===E.activeShopList&&e.name.trim().toLowerCase()===i&&!e.checked);if(a){let n=(parseFloat(a.qty)||1)+t,{id:i,...o}=a,{fbSet:s}=await I(async()=>{let{fbSet:e}=await import(`./firebase-BULWIflD.js`).then(e=>(e.l(),e.s));return{fbSet:e}},__vite__mapDeps([0,1,2,3]));await s(`shopping/items/${a.id}`,{...o,qty:n}),O({shopItems:E.shopItems.map(e=>e.id===a.id?{...e,qty:n}:e)}),G(),H(`✓ ${e} · Menge auf ${n} erhöht`),q(),window._app._shopCatFreqBump(r);return}O({newShopItem:{name:e,emoji:`🛒`,category:r,qty:t,unit:n,fav:!1}}),ke(e,r),window._app._shopCatFreqBump(r);let{shopAddItem:o}=await I(async()=>{let{shopAddItem:e}=await import(`./shopping-jp0CsUb_.js`).then(e=>(e.n(),e.p));return{shopAddItem:e}},__vite__mapDeps([6,1,2,3,0,7,5]));await o(G,H,q,B)},_shareInviteLink_stub:async()=>{let e=E.familyId,t=`https://famiplan.app/join.html?id=${e}&name=${encodeURIComponent(E.familyName||e)}`,{syncPublicFamily:n}=await I(async()=>{let{syncPublicFamily:e}=await import(`./firebase-BULWIflD.js`).then(e=>(e.l(),e.s));return{syncPublicFamily:e}},__vite__mapDeps([0,1,2,3]));await n(),navigator.share?navigator.share({title:`famiplan`,text:`Tritt unserer Familie auf famiplan bei!`,url:t}).catch(()=>{}):(navigator.clipboard?.writeText(t),H(`Link kopiert! ✓`))},showAdminPanel:Or,adminGrantFamily:Cr,adminRevokeFamily:wr,splashRegister:()=>{localStorage.setItem(`fp_visited`,`1`);let e=document.getElementById(`splash-screen`);e&&(e.style.display=`none`),it(),setTimeout(()=>window._app.authSetMode?.(`register`),100)},splashLogin:()=>{localStorage.setItem(`fp_visited`,`1`),it(),setTimeout(()=>window._app.authSetMode?.(`login`),100)},splashDemo:()=>{localStorage.setItem(`fp_visited`,`1`);let e=document.getElementById(`splash-screen`);e&&(e.style.display=`none`),I(()=>Promise.resolve().then(()=>Kn).then(e=>e.obShowDemo()),void 0)},adminBulkIndexFamilies:Tr,adminDeleteFamily:Er,adminSendBroadcast:Dr,showPushPage:_r,scheduleReminders:mr,getPushSetting:Y,setPushSetting:X,sendPushToFamily:fr,showOvTaskMenu:(e,t)=>Hn(e,t),showAssignModal:(e,t)=>Un(e,t),showCommentsModal:e=>Wn(e),submitComment:async e=>{let t=document.getElementById(`cmt-input`);if(!t?.value.trim())return;let n=t.value.trim();t.disabled=!0,await Se(e,n,H,q,B,Le,()=>{},()=>!0),t.value=``,t.disabled=!1,t.focus()},addTask:()=>_e(q,G,H,Ni,B,Le),saveEdit:()=>ye(q,G,H),calPrev:()=>{let{calView:e,calMonth:t,calYear:n,calSelISO:r}=E;if(e===`month`)t--,t<0&&(t=11,n--);else if(e===`week`){let e=new Date(r+`T12:00:00`);e.setDate(e.getDate()-7),O({calSelISO:x(e)})}O({calMonth:t,calYear:n}),q()},calNext:()=>{let{calView:e,calMonth:t,calYear:n,calSelISO:r}=E;if(e===`month`)t++,t>11&&(t=0,n++);else if(e===`week`){let e=new Date(r+`T12:00:00`);e.setDate(e.getDate()+7),O({calSelISO:x(e)})}O({calMonth:t,calYear:n}),q()},calSelectDay:e=>{let t=new Date(e+`T12:00:00`);O({calSelISO:e,calYear:t.getFullYear(),calMonth:t.getMonth()}),q()},calGoToday:()=>{let e=new Date;O({calSelISO:x(),calYear:e.getFullYear(),calMonth:e.getMonth()}),q()},shopAddAllFavsToList:async()=>{let e=E.shopItems.filter(e=>e.fav);if(e.length){for(let t of e){if(E.shopItems.some(e=>e.list===E.activeShopList&&e.name.toLowerCase()===t.name.toLowerCase()&&!e.checked))continue;let{shopPush:e}=await I(async()=>{let{shopPush:e}=await import(`./firebase-BULWIflD.js`).then(e=>(e.l(),e.s));return{shopPush:e}},__vite__mapDeps([0,1,2,3])),n={name:t.name,emoji:t.emoji,category:t.category||`sonstiges`,qty:t.qty||1,unit:t.unit||``,checked:!1,addedBy:E.curUser||`Ich`,addedAt:Date.now(),list:E.activeShopList,fav:!1},{fbPush:r}=await I(async()=>{let{fbPush:e}=await import(`./firebase-BULWIflD.js`).then(e=>(e.l(),e.s));return{fbPush:e}},__vite__mapDeps([0,1,2,3])),i=await r(`shopping/items`,n);O({shopItems:[...E.shopItems,{id:i.name,...n}]})}q()}},shopEditItem:e=>{let n=E.shopItems.find(t=>t.id===e);if(!n)return;O({newShopItem:{name:n.name,emoji:n.emoji||`🛒`,category:n.category||`sonstiges`,qty:n.qty||1,unit:n.unit||``,fav:n.fav||!1}});let{SHOP_CATS:r,QTY_VALUES:i,UNIT_VALUES:a}=(Ae(),t(Me)),o=e=>String(e||``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`),s=[1,2,3,4,5,6,7,8,9,10,12,15,20,25,50,100,200,500,`½`,`¼`,`¾`].map(e=>`<option value="${e}"${String(n.qty||1)===String(e)?` selected`:``}>${e}</option>`).join(``),c=[``,`Stück`,`g`,`kg`,`ml`,`L`,`EL`,`TL`,`Pck`,`Bund`,`Zehe`,`Scheibe`,`Dose`,`Fla`].map(e=>`<option value="${e}"${(n.unit||``)===e?` selected`:``}>${e||`–`}</option>`).join(``),l=[{id:`obst`,name:`Obst & Gemüse`,icon:`🥦`},{id:`milch`,name:`Milch & Käse`,icon:`🧀`},{id:`fleisch`,name:`Fleisch & Fisch`,icon:`🥩`},{id:`brot`,name:`Brot`,icon:`🍞`},{id:`tiefkuehl`,name:`Tiefkühl`,icon:`🧊`},{id:`getraenke`,name:`Getränke`,icon:`🥤`},{id:`snacks`,name:`Snacks`,icon:`🍫`},{id:`haushalt`,name:`Haushalt`,icon:`🧹`},{id:`hygiene`,name:`Hygiene`,icon:`🧴`},{id:`sonstiges`,name:`Sonstiges`,icon:`📦`}].map(e=>`<button class="cat-btn${(n.category||`sonstiges`)===e.id?` sel`:``}" 
      onclick="document.querySelectorAll('.cat-btn').forEach(b=>b.classList.remove('sel'));this.classList.add('sel');window._app._shopEditCat='${e.id}'"
      >${e.icon} ${e.name}</button>`).join(``);window._shopEditCat=n.category||`sonstiges`,U(`
      <div class="modal-handle"></div>
      <div class="modal-title">✏️ Artikel bearbeiten</div>
      <div class="form-group">
        <label class="form-lbl">Name</label>
        <input class="form-input" id="shop-edit-name" value="${o(n.name)}" maxlength="100"/>
      </div>
      <div class="form-group">
        <label class="form-lbl">Menge & Einheit</label>
        <div style="display:flex;gap:10px">
          <select class="form-select" id="shop-edit-qty">${s}</select>
          <select class="form-select" id="shop-edit-unit">${c}</select>
        </div>
      </div>
      <div class="form-group">
        <label class="form-lbl">Kategorie</label>
        <div class="cat-grid">${l}</div>
      </div>
      <button class="submit-btn" onclick="window._app._shopSaveEdit('${e}')">Speichern ✓</button>
      <button class="modal-close" onclick="window._app.closeModal()">Abbrechen</button>
    `)},_shopEditCat:`sonstiges`,_shopSaveEdit:async e=>{let t=E.shopItems.find(t=>t.id===e);if(!t)return;let n=document.getElementById(`shop-edit-name`)?.value?.trim();if(!n){G();return}let r=document.getElementById(`shop-edit-qty`)?.value,i=document.getElementById(`shop-edit-unit`)?.value||``,a=window._app._shopEditCat||t.category||`sonstiges`;G();let o=isNaN(Number(r))?r:parseFloat(r)||1;O({newShopItem:{name:n,emoji:t.emoji||`🛒`,category:a,qty:o,unit:i,fav:t.fav||!1}});let{shopSaveEdit:s}=await I(async()=>{let{shopSaveEdit:e}=await import(`./shopping-jp0CsUb_.js`).then(e=>(e.n(),e.p));return{shopSaveEdit:e}},__vite__mapDeps([6,1,2,3,0,7,5]));await s(e,G,H,q)},shopAddFavToList:async e=>{let t=E.shopItems.find(t=>t.id===e);if(!t)return;if(E.shopItems.some(e=>e.list===E.activeShopList&&e.name.toLowerCase()===t.name.toLowerCase()&&!e.checked)){H(`⚠️ Bereits in der Liste`);return}let{fbPush:n}=await I(async()=>{let{fbPush:e}=await import(`./firebase-BULWIflD.js`).then(e=>(e.l(),e.s));return{fbPush:e}},__vite__mapDeps([0,1,2,3])),r={name:t.name,emoji:t.emoji,category:t.category||`sonstiges`,qty:t.qty||1,unit:t.unit||``,checked:!1,addedBy:E.curUser||`Ich`,addedAt:Date.now(),list:E.activeShopList,fav:!1},i=await n(`shopping/items`,r);O({shopItems:[...E.shopItems,{id:i.name,...r}]}),H(`✓ Hinzugefügt`),q()},setTab:Ut,setDay:Wt,openModal:U,closeModal:G,showSync:H,startTabTour:Ht,getTab:()=>E.tab,authSetMode:ot,authSubmit:st,authGoogle:ct,authForgotPassword:lt,authSignOut:()=>pt(),deleteAccount:()=>mt(H,G,()=>{}),renameMember:(e,t,n)=>vt(e,t,n,q),deleteMember:e=>yt(e,q),handlePhotoUpload:(e,t)=>St(e,t,H,q),toggleDone:(e,t)=>me(e,t,q,H),overdueMarkDone:async(e,t)=>{await me(e,t,q,H),H(`✓ Als erledigt markiert`)},overdueSnooze:async(e,t)=>{let n=E.tasks.find(t=>t.id===e);if(n){if(n.recurring===`once`){let{id:t,...r}=n,i=x(),{dayFromISO:a}=await I(async()=>{let{dayFromISO:e}=await import(`./utils-DlBB0M1o.js`).then(e=>(e.u(),e.m));return{dayFromISO:e}},__vite__mapDeps([2,1]));await I(async()=>{let{fbSet:e}=await import(`./firebase-BULWIflD.js`).then(e=>(e.l(),e.s));return{fbSet:e}},__vite__mapDeps([0,1,2,3])).then(({fbSet:t})=>t(`tasks/`+e,{...r,date:i,day:a(i)})),O({tasks:E.tasks.map(t=>t.id===e?{...t,date:i,day:a(i)}:t)})}H(`→ Für heute vorgemerkt`),q()}},assignTask:(e,t,n)=>be(e,t,n,q,G,H,U,()=>{},()=>!0,()=>{}),unassign:(e,t)=>ue(e,t,q,H),deleteTask:(e,t)=>he(e,t,q,U,G,H),shopToggleCheck:e=>Ee(e,q),shopToggleFav:e=>De(e,H,q),shopDeleteItem:e=>je(e,H,q),shopSaveEdit:e=>Ie(e,G,H,q),shopClearChecked:()=>we(H,q),shopSetListByIndex:e=>{if(E.shopLists[e]){O({activeShopList:E.shopLists[e]});try{localStorage.setItem(`fp_active_shop_list`,E.shopLists[e])}catch{}q()}},shopDeleteListByIndex:e=>{E.shopLists[e]&&Pe(E.shopLists[e],H,q)},shopPromptAddList:()=>{let e=prompt(`Name der neuen Liste:`);e?.trim()&&Oe(e.trim(),q)},shopSetView:e=>{O({shopView:e}),q()},deleteMeal:(e,t)=>jt(e,t,H,q),mealIngredientsToShop:async(e,t,n)=>{let r=await Rt(e,t,H,q,Ut,n);if(r?.needsScaling){let n=r.defaultServings;U(`
        <div class="modal-handle"></div>
        <div class="modal-title">Für wie viele Personen?</div>
        <div class="modal-sub">Rezept ist für ${n} Portionen – Mengen werden angepasst</div>
        <div style="display:flex;align-items:center;justify-content:center;gap:16px;margin:24px 0">
          <button type="button" onclick="
            const el=document.getElementById('scale-servings');
            if(parseInt(el.value)>1){el.value=parseInt(el.value)-1;document.getElementById('scale-label').textContent=el.value+' Personen';}
          " style="width:44px;height:44px;border:none;border-radius:50%;background:var(--bg3);font-size:22px;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center">−</button>
          <div style="text-align:center">
            <input type="number" id="scale-servings" value="${n}" min="1" max="20" style="display:none"/>
            <div id="scale-label" style="font-size:32px;font-weight:700;color:var(--text1)">${n} Personen</div>
          </div>
          <button type="button" onclick="
            const el=document.getElementById('scale-servings');
            if(parseInt(el.value)<20){el.value=parseInt(el.value)+1;document.getElementById('scale-label').textContent=el.value+' Personen';}
          " style="width:44px;height:44px;border:none;border-radius:50%;background:var(--bg3);font-size:22px;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center">+</button>
        </div>
        <button class="submit-btn" onclick="
          const wished=parseInt(document.getElementById('scale-servings').value)||${n};
          const factor=Math.round(wished/${n}*100)/100;
          window._app.closeModal();
          window._app.mealIngredientsToShop('${e}','${t}',factor);
        ">Zur Einkaufsliste hinzufügen</button>
        <button class="modal-close" onclick="window._app.closeModal()">Abbrechen</button>
      `)}},showRecipeStepsModal:(e,t,n)=>Ii(e,t,n),showRecipeDetailModal:(e,t)=>Li(e,t),showRecipeViewModal:e=>_i(e),showRecipeImportModal:()=>Ri(),_recipeImportStart:()=>zi(),_recipeImportSave:e=>Vi(e),_recipeImportTab:e=>Hi(e),_recipeImportPhotoSelected:e=>Ui(e),_recipeEditSave:async e=>{let t=document.getElementById(`recipe-edit-name`)?.value.trim(),n=parseInt(document.getElementById(`recipe-prep-time`)?.value)||0,r=parseInt(document.getElementById(`recipe-servings`)?.value)||4,i=Array.from(document.querySelectorAll(`.ingr-input`)).map(e=>e.value.trim()).filter(Boolean),a=Array.from(document.querySelectorAll(`.step-input`)).map(e=>e.value.trim()).filter(Boolean),o=E.mealRecipes[e]||{},s={...o,name:t||o.name,prepTime:n,servings:r,ingredients:i,steps:a};O({mealRecipes:{...E.mealRecipes,[e]:s}});let{fbSet:c}=await I(async()=>{let{fbSet:e}=await import(`./firebase-BULWIflD.js`).then(e=>(e.l(),e.s));return{fbSet:e}},__vite__mapDeps([0,1,2,3]));await c(`mealRecipes/${e}`,s),H(`✓ Rezept gespeichert`),I(()=>Promise.resolve().then(()=>($(),Z)).then(e=>{G(),setTimeout(()=>e.showRecipeManager(),350)}),void 0)},_recipeEditAddIngr:()=>{let e=document.getElementById(`recipe-ingr-list`);if(!e)return;let t=document.getElementById(`ingr-empty`);t&&t.remove();let n=e.querySelectorAll(`.recipe-ingr-row`).length,r=document.createElement(`div`);r.className=`recipe-ingr-row`,r.id=`ingr-row-`+n,r.style.cssText=`display:flex;align-items:center;gap:8px;margin-bottom:8px`,r.innerHTML=`<input class="form-input ingr-input" data-ingr="`+n+`" placeholder="Zutat `+(n+1)+`" style="flex:1;font-size:13px"/><button type="button" onclick="window._app._recipeEditRemoveIngr(`+n+`)" style="width:30px;height:36px;border:none;border-radius:8px;background:var(--red-bg);color:var(--red-text);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;font-size:16px">×</button>`,e.appendChild(r),r.querySelector(`input`)?.focus()},_recipeEditRemoveIngr:e=>{let t=document.getElementById(`ingr-row-`+e);t&&t.remove(),document.querySelectorAll(`.recipe-ingr-row`).forEach((e,t)=>{let n=e.querySelector(`input`);n&&n.setAttribute(`data-ingr`,t),n.placeholder=`Zutat `+(t+1);let r=e.querySelector(`button`);r&&r.setAttribute(`onclick`,`window._app._recipeEditRemoveIngr(`+t+`)`),e.id=`ingr-row-`+t})},_recipeAddStep:()=>{let e=document.getElementById(`recipe-steps-list`);if(!e)return;let t=document.getElementById(`steps-empty`);t&&t.remove();let n=e.querySelectorAll(`.recipe-step-row`).length,r=document.createElement(`div`);r.className=`recipe-step-row`,r.id=`step-row-`+n,r.style.cssText=`display:flex;align-items:flex-start;gap:10px;margin-bottom:10px`,r.innerHTML=`<div style="width:24px;height:24px;border-radius:50%;background:#5C4EE5;color:white;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:8px">`+(n+1)+`</div><textarea class="form-input step-input" data-step="`+n+`" rows="2" style="flex:1;resize:none;line-height:1.5;font-size:13px" placeholder="Schritt `+(n+1)+` beschreiben…"></textarea><button type="button" onclick="window._app._recipeRemoveStep(`+n+`)" style="width:28px;height:28px;border:none;border-radius:6px;background:var(--red-bg);color:var(--red-text);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;margin-top:6px;font-size:14px">×</button>`,e.appendChild(r),r.querySelector(`textarea`)?.focus()},_recipeRemoveStep:e=>{let t=document.getElementById(`step-row-`+e);t&&t.remove(),document.querySelectorAll(`.recipe-step-row`).forEach((e,t)=>{let n=e.querySelector(`div`);n&&(n.textContent=t+1);let r=e.querySelector(`textarea`);r&&r.setAttribute(`data-step`,t);let i=e.querySelector(`button`);i&&i.setAttribute(`onclick`,`window._app._recipeRemoveStep(`+t+`)`),e.id=`step-row-`+t})},_recipeSaveSteps:async(e,t,n)=>{await Ot(n,Array.from(document.querySelectorAll(`.step-input`)).map(e=>e.value.trim()).filter(Boolean),parseInt(document.getElementById(`recipe-prep-time`)?.value)||0,parseInt(document.getElementById(`recipe-servings`)?.value)||4),H(`✓ Zubereitung gespeichert`),G(),setTimeout(()=>Q(e,t),350)},_recipeStepsBack:(e,t)=>{G(),setTimeout(()=>Q(e,t),350)},toggleOptionalIngredient:(e,t,n)=>Lt(e,t,n,q,H),copyMealWeekToNext:()=>Nt(H,q),_quickAddEvent:()=>{I(async()=>{let{localISO:e,dayFromISO:t}=await import(`./utils-DlBB0M1o.js`).then(e=>(e.u(),e.m));return{localISO:e,dayFromISO:t}},__vite__mapDeps([2,1])).then(({localISO:e,dayFromISO:t})=>{let n=e();O({fd:{...E.fd,date:n,day:t(n),type:`event`,time:`12:00`}}),I(()=>Promise.resolve().then(()=>($(),Z)).then(e=>e.showAddModal()),void 0)})},_todoLpTimer:null,_todoLpStart:(e,t)=>{window._app._todoLpEnd(),window._app._todoLpTimer=setTimeout(async()=>{window._app._todoLpTimer=null;let e=E.tasks.find(e=>e.id===t);if(!e)return;let{fbSet:n}=await I(async()=>{let{fbSet:e}=await import(`./firebase-BULWIflD.js`).then(e=>(e.l(),e.s));return{fbSet:e}},__vite__mapDeps([0,1,2,3])),r={...e.assignments||{},open:{...e.assignments?.open||{},done:!0,doneAt:Date.now()}};await n(`tasks/${t}/assignments`,r),O({tasks:E.tasks.map(e=>e.id===t?{...e,assignments:r}:e)}),H(`✓ Erledigt`),q()},600)},_todoLpEnd:()=>{window._app._todoLpTimer&&(clearTimeout(window._app._todoLpTimer),window._app._todoLpTimer=null)},_boardReactionPicker:e=>{I(async()=>{let{openModal:e,closeModal:t}=await import(`./modal-C6B7Vjjr.js`).then(e=>(e.n(),e.r));return{openModal:e,closeModal:t}},__vite__mapDeps([13,1,3,2])).then(({openModal:t,closeModal:n})=>{t(`<div class="modal-handle"></div>
        <div class="modal-title">Reaktion wählen</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;padding:8px 0 12px">${[`👍`,`❤️`,`😂`,`😮`,`🙌`].map(t=>`<button onclick="window._app.boardToggleReaction('${e}','${t}');window._app.closeModal()"
          style="font-size:28px;background:none;border:1px solid var(--border);border-radius:12px;width:52px;height:52px;cursor:pointer;display:flex;align-items:center;justify-content:center">${t}</button>`).join(``)}</div>
        <button class="modal-close" onclick="window._app.closeModal()">Abbrechen</button>`)})},_boardPhotoZoom:e=>{let t=E.boardPosts[e];t?.photo&&I(async()=>{let{openModal:e}=await import(`./modal-C6B7Vjjr.js`).then(e=>(e.n(),e.r));return{openModal:e}},__vite__mapDeps([13,1,3,2])).then(({openModal:e})=>{e(`<div class="modal-handle"></div>
        <img src="${t.photo}" style="width:100%;border-radius:12px;display:block;margin-bottom:8px" onclick="window._app.closeModal()">
        <button class="modal-close" onclick="window._app.closeModal()">Schließen</button>`)})},copyMealWeekFromPrev:()=>Pt(H,q),_mealCopyToNextConfirm:e=>{if(!e){Nt(H,q);return}U(`
      <div class="modal-handle"></div>
      <div style="text-align:center;padding:8px 0 4px">
        <div style="font-size:36px;margin-bottom:8px">⚠️</div>
        <div class="modal-title">Nächste Woche überschreiben?</div>
        <div class="modal-sub">Die nächste Woche hat bereits geplante Mahlzeiten. Diese werden durch die aktuelle Woche ersetzt.</div>
      </div>
      <button class="submit-btn" style="background:#DC2626" onclick="window._app.closeModal();window._app.copyMealWeekToNext()">Ja, überschreiben</button>
      <button class="modal-close" onclick="window._app.closeModal()">Abbrechen</button>
    `)},_mealCopyFromPrevConfirm:e=>{if(!e){Pt(H,q);return}U(`
      <div class="modal-handle"></div>
      <div style="text-align:center;padding:8px 0 4px">
        <div style="font-size:36px;margin-bottom:8px">⚠️</div>
        <div class="modal-title">Aktuelle Woche überschreiben?</div>
        <div class="modal-sub">Diese Woche hat bereits geplante Mahlzeiten. Wenn du die Vorwoche überträgst, werden sie ersetzt.</div>
      </div>
      <button class="submit-btn" style="background:#DC2626" onclick="window._app.closeModal();window._app.copyMealWeekFromPrev()">Ja, überschreiben</button>
      <button class="modal-close" onclick="window._app.closeModal()">Abbrechen</button>
    `)},_mealSwipe:{},_mealSwipeStart:(e,t,n)=>{let r=e.touches[0];window._app._mealSwipe[t+`_`+n]={startX:r.clientX,startY:r.clientY}},_mealSwipeMove:(e,t)=>{let n=document.getElementById(t);if(!n)return;let r=Object.values(window._app._mealSwipe)[0];if(!r)return;let i=e.touches[0].clientX-r.startX;if(!(Math.abs(e.touches[0].clientY-r.startY)>20)&&i<0){e.preventDefault();let t=Math.max(i,-80);n.style.transform=`translateX(${t}px)`,n.style.transition=`none`,n.style.background=t<-40?`#FEF2F2`:``}},_mealSwipeEnd:(e,t,n,r)=>{let i=document.getElementById(r),a=t+`_`+n,o=window._app._mealSwipe[a];if(delete window._app._mealSwipe[a],!i||!o)return;let s=e.changedTouches[0].clientX-o.startX,c=Math.abs(e.changedTouches[0].clientY-o.startY);i.style.transition=`transform 0.25s ease`,s<-60&&c<30?(i.style.transform=`translateX(-100%)`,i.style.opacity=`0`,setTimeout(()=>window._app.deleteMeal(t,n),220)):(i.style.transform=``,i.style.background=``)},setMealWeekOffset:e=>{O({mealWeekOffset:e}),q()},_mealWeekLock:()=>{I(()=>Promise.resolve().then(()=>($(),Z)).then(e=>e.showUpgradeModal(`mealWeeks`)),void 0)},boardToggleReaction:(e,t)=>et(e,t,q),boardShowReaders:e=>Ye(e,U,f,Ke),boardDeletePost:e=>$e(e,q),boardSubmitPost:()=>Qe(G,q,H,B,(e,t,n)=>fr(e,t,n),(e,t)=>Y(e,t)),boardHandlePhoto:e=>Ze(e),boardSubmitReply:(e,t)=>Ue(e,t,q,H,B,(e,t,n)=>fr(e,t,n),(e,t)=>Y(e,t)),boardDeleteReply:(e,t)=>Je(e,t,q),_boardToggleReplies:e=>{window._boardOpenReplies||(window._boardOpenReplies=new Set),window._boardOpenReplies.has(e)?window._boardOpenReplies.delete(e):window._boardOpenReplies.add(e),q(),window._boardOpenReplies.has(e)&&setTimeout(()=>document.getElementById(`board-ri-`+e)?.focus(),100)},openCheckout:Be,setTodayView:e=>{O({todayView:e}),q()},setTodayTimeline:e=>{O({todayTimeline:e}),q()},_toggleTodaySection:e=>{let t=new Set(E._collapsedSections||[]);t.has(e)?t.delete(e):t.add(e),O({_collapsedSections:t}),q()},_dayNoteTimer:null,_dayNoteInput:(e,t)=>{let n=e.value;O({dayNotes:{...E.dayNotes||{},[t]:n}}),clearTimeout(window._app._dayNoteTimer),window._app._dayNoteTimer=setTimeout(async()=>{if(!E.familyId)return;let{fbSet:e}=await I(async()=>{let{fbSet:e}=await import(`./firebase-BULWIflD.js`).then(e=>(e.l(),e.s));return{fbSet:e}},__vite__mapDeps([0,1,2,3]));await e(`dayNotes/`+t,n||null).catch(()=>{})},800)},setBundesland:e=>{tn(e),ln(),q()},setDarkMode:e=>{localStorage.setItem(`fp_dark_mode`,e),Wi()},setTodayMember:e=>{O({todayMember:e}),q()},setDayView:e=>{O({calDayView:e}),q()},setCalView:e=>{O({calView:e}),q()},_calTimeSlotTap:(e,t,n,r)=>{if(e.target.closest(`.tl3-event, .wk7-event, .tl3-event-title, .tl3-event-meta`))return;let i=e.currentTarget.getBoundingClientRect(),a=n+(e.clientY-i.top)/r,o=Math.max(0,Math.min(23,Math.floor(a))),s=a%1>=.5?30:0,c=String(o).padStart(2,`0`)+`:`+String(s).padStart(2,`0`);I(async()=>{let{dayFromISO:e}=await import(`./utils-DlBB0M1o.js`).then(e=>(e.u(),e.m));return{dayFromISO:e}},__vite__mapDeps([2,1])).then(({dayFromISO:e})=>{O({fd:{...E.fd,date:t,day:e(t),time:c,type:`event`}}),I(()=>Promise.resolve().then(()=>($(),Z)).then(e=>e.showAddModal()),void 0)})},setCalZoom:e=>{O({calZoom:Math.max(0,Math.min(2,e)),calShowTimeline:!1}),q()},calDayTap:e=>{let t=E.calSelISO===e,n=E.calShowTimeline;O({calSelISO:e,calShowTimeline:t?!n:!0}),q()},_calGesture:{startX:0,startY:0,startDist:0,lastDist:0,isPinch:!1,tracking:!1},_calInitGesture:()=>{let e=document.getElementById(`cal-month-grid`);if(!e||e._gestureInit)return;e._gestureInit=!0;let t=window._app._calGesture;e.addEventListener(`touchstart`,e=>{if(e.touches.length===1)t.startX=e.touches[0].clientX,t.startY=e.touches[0].clientY,t.endX=e.touches[0].clientX,t.endY=e.touches[0].clientY,t.tracking=!0,t.swipeDone=!1;else if(e.touches.length===2){let n=e.touches[0].clientX-e.touches[1].clientX,r=e.touches[0].clientY-e.touches[1].clientY,i=Math.hypot(n,r);t.startDist=i,t.lastDist=i,t.isPinch=!0,t.tracking=!1}},{passive:!0}),e.addEventListener(`touchmove`,e=>{if(t.isPinch&&e.touches.length===2){e.preventDefault();let n=e.touches[0].clientX-e.touches[1].clientX,r=e.touches[0].clientY-e.touches[1].clientY;t.lastDist=Math.hypot(n,r);return}!t.tracking||e.touches.length!==1||(t.endX=e.touches[0].clientX,t.endY=e.touches[0].clientY)},{passive:!0}),e.addEventListener(`touchend`,n=>{if(t.isPinch){let e=t.lastDist/t.startDist;e>1.2?window._app.setCalZoom((E.calZoom||0)+1):e<.8&&window._app.setCalZoom((E.calZoom||0)-1),t.isPinch=!1,t.tracking=!1;return}if(!t.tracking||t.swipeDone)return;t.tracking=!1;let r=t.endX-t.startX,i=t.endY-t.startY,a=Math.abs(r),o=Math.abs(i),s=E.calZoom||0;if(a>100&&a>o*4){if(t.swipePending)return;t.swipePending=!0,t.swipeDone=!0,setTimeout(()=>{t.swipePending=!1},600);let n=r>0?-1:1;e.style.transition=`transform 0.18s ease, opacity 0.18s`,e.style.transform=`translateX(${n*-50}px)`,e.style.opacity=`0`,setTimeout(()=>{r>0?window._app.calPrev():window._app.calNext(),requestAnimationFrame(()=>{let e=document.getElementById(`cal-month-grid`);e&&(e.style.transition=`none`,e.style.transform=`translateX(${n*50}px)`,e.style.opacity=`0`,requestAnimationFrame(()=>{e.style.transition=`transform 0.18s ease, opacity 0.18s`,e.style.transform=``,e.style.opacity=``,setTimeout(()=>{e&&(e.style.transition=``)},200)}))})},140);return}if(s>0&&o>100&&o>a*4){let t=i<0?1:-1,n=new Date(E.calSelISO+`T12:00:00`);n.setDate(n.getDate()+t*7);let r=n.toISOString().split(`T`)[0];e.style.transition=`transform 0.18s ease, opacity 0.18s`,e.style.transform=`translateY(${t*-30}px)`,e.style.opacity=`0`,setTimeout(()=>{O({calSelISO:r,calYear:n.getFullYear(),calMonth:n.getMonth()}),q(),requestAnimationFrame(()=>{let e=document.getElementById(`cal-month-grid`);e&&(e.style.transition=`none`,e.style.transform=`translateY(${t*30}px)`,e.style.opacity=`0`,requestAnimationFrame(()=>{e.style.transition=`transform 0.18s ease, opacity 0.18s`,e.style.transform=``,e.style.opacity=``,setTimeout(()=>{e&&(e.style.transition=``)},200)}))})},140)}},{passive:!0})},_calMonthGestureStart:()=>{},_calMonthGestureMove:()=>{},_calMonthGestureEnd:()=>{},_calLpTimer:null,_calLpStart:(e,t)=>{window._app._calLpEnd(),window._app._calLpTimer=setTimeout(()=>{window._app._calLpTimer=null,I(async()=>{let{dayFromISO:e}=await import(`./utils-DlBB0M1o.js`).then(e=>(e.u(),e.m));return{dayFromISO:e}},__vite__mapDeps([2,1])).then(({dayFromISO:e})=>{O({fd:{...E.fd,date:t,day:e(t),time:`12:00`,type:`event`}}),I(()=>Promise.resolve().then(()=>($(),Z)).then(e=>e.showAddModal()),void 0)})},500)},_calLpEnd:()=>{window._app._calLpTimer&&(clearTimeout(window._app._calLpTimer),window._app._calLpTimer=null)}},window._togOptCb=function(e){let t=document.getElementById(e),n=document.getElementById(`box-`+e),r=document.getElementById(`txt-`+e);!t||!n||(t.checked=!t.checked,t.checked?(n.style.cssText=`width:18px;height:18px;border-radius:5px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border:1.5px solid #059669;background:#059669;`,n.innerHTML=`<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 5l2.5 2.5 4.5-4.5"/></svg>`,r&&(r.style.color=`#059669`)):(n.style.cssText=`width:18px;height:18px;border-radius:5px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border:1.5px solid #CBD5E0;background:transparent;`,n.innerHTML=``,r&&(r.style.color=`var(--text1)`)))},window._rebuildOptChecks=function(e){let t=document.getElementById(`meal-opt-checks`);if(!t)return;let n=(e||``).split(`
`).map(e=>e.trim()).filter(Boolean);if(!n.length){t.innerHTML=``;return}let r={};t.querySelectorAll(`input[name="opt-sel"]`).forEach(e=>{r[e.value]=e.checked}),t.innerHTML=`<div style="font-size:11px;color:var(--text3);margin-bottom:2px">Diese Woche dabei?</div>`+n.map(function(e){let t=r[e]||!1,n=`opt-cb-`+e.replace(/[^a-z0-9]/gi,`_`),i=t?`width:18px;height:18px;border-radius:5px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border:1.5px solid #059669;background:#059669;`:`width:18px;height:18px;border-radius:5px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border:1.5px solid #CBD5E0;background:transparent;`,a=t?`font-size:13px;color:#059669;`:`font-size:13px;color:var(--text1);`;return`<label style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:3px 0" onclick="window._togOptCb('`+n+`')"><input type="checkbox" id="`+n+`" name="opt-sel" value="`+e.replace(/"/g,`&quot;`)+`"`+(t?` checked`:``)+` style="display:none"><span id="box-`+n+`" style="`+i+`">`+(t?`<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 5l2.5 2.5 4.5-4.5"/></svg>`:``)+`</span><span id="txt-`+n+`" style="`+a+`">`+e+`</span></label>`}).join(``)};function Gi(){E.familyId||O({familyId:localStorage.getItem(`fp_family_id`)||``,familyName:localStorage.getItem(`fp_family_name`)||``});let e=localStorage.getItem(`fp_user`);if(!E.familyId)Yn();else{let t=document.getElementById(`family-info-bar`),n=document.getElementById(`family-name-display`),r=document.getElementById(`family-id-display`);t&&(t.style.display=`none`),n&&(n.textContent=E.familyName),r&&(r.textContent=E.familyId);let i=e=>Ct(e,U,G,H,Ai),a=()=>{ge(q,Ce),Ne(q),Ce(),bt(),Et(q),Xe(q,qe)};if(e){let t=document.getElementById(`name-screen`);t&&t.remove(),O({curUser:e,boardLastSeen:parseInt(localStorage.getItem(`fp_board_seen`)||`0`)}),gt(q,i).then(a),`Notification`in window&&Notification.permission==="default"&&!localStorage.getItem(`fp_push_prompted`)&&localStorage.setItem(`fp_push_prompted`,`1`)}else gt(q,i).then(()=>{a(),E.members.length>0&&Ki()})}}function Ki(){let e=document.getElementById(`name-screen`);e&&(e.style.display=`flex`,e.style.opacity=`1`,e.classList.add(`visible`));let t=document.getElementById(`name-grid`);if(t){if(E.members.length===0){Ct(!0,U,G,H,()=>{});return}t.innerHTML=E.members.map(e=>`<button class="name-btn" onclick="window._app.selectName('${C(e)}')">
       <div class="name-av">${E.av[e]||`👤`}</div>
       <div class="name-nm">${f(e)}</div>
     </button>`).join(``)}}window._app.selectName=e=>{try{localStorage.setItem(`fp_user`,e)}catch{}O({curUser:e});let t=document.getElementById(`name-screen`);t&&(t.classList.remove(`visible`),t.style.transition=`opacity 0.4s`,t.style.opacity=`0`,setTimeout(()=>t.remove(),400));let n=document.getElementById(`user-btn`);n&&(n.textContent=(E.av[e]||`👤`)+` `+e),ge(q,Ce),Ne(q),Ce(),bt(),Et(q)},window._app.confirmAddMember=e=>{let t=(document.getElementById(`new-member-name`)?.value||``).trim();if(!t){document.getElementById(`new-member-name`)?.focus();return}if(E.members.includes(t)){alert(`Diesen Namen gibt es bereits.`);return}_t(t,E._newMemberEmoji||`🧑`,!0,B).then(()=>{if(G(),H(`✓ Profil erstellt!`),e){O({curUser:t});try{localStorage.setItem(`fp_user`,t)}catch{}fe(q,Ce),Ne(q)}else Ai()})},`serviceWorker`in navigator&&(window.addEventListener(`load`,()=>{navigator.serviceWorker.register(`/sw.js`).catch(e=>console.warn(`SW error:`,e))}),navigator.serviceWorker.addEventListener(`message`,e=>{e.data?.type===`OPEN_TAB`&&e.data.tab&&window._app?.setTab(e.data.tab)})),Yt(),nt(()=>dt(Gi,ze,Ve),rt);export{Z as n,$ as t};