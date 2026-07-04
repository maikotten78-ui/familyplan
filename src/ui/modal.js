import { state, setState } from '../modules/state.js';

// ── MODAL ─────────────────────────────────────────────────────
export function openModal(html) {
  closeModal();
  const ov = document.createElement('div');
  ov.className = 'modal-overlay';
  ov.innerHTML = `<div class="modal">${html}</div>`;
  ov.addEventListener('click', e => { if (e.target === ov) closeModal(); });
  document.body.appendChild(ov);
  setState({ modalEl: ov });
  requestAnimationFrame(() => requestAnimationFrame(() => ov.classList.add('show')));
}

export function closeModal() {
  if (!state.modalEl) return;
  state.modalEl.classList.remove('show');
  const el = state.modalEl;
  setState({ modalEl: null });
  setTimeout(() => el.remove(), 300);
}

// ── TOAST ─────────────────────────────────────────────────────
export function showSync(msg) {
  document.querySelectorAll('.sync-badge').forEach(e => e.remove());
  const el = document.createElement('div');
  el.className  = 'sync-badge';
  el.textContent = msg || '✓ Für alle gespeichert!';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2200);
}


