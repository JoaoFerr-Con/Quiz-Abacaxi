// ============================================================================
// screens/dialog.js — modal de confirmação genérico e reutilizável
// ============================================================================

export function showResumeChoice({ title, message, confirmLabel, cancelLabel, onConfirm, onCancel }) {
  const overlay = document.createElement("div");
  overlay.className = "overlay";
  overlay.innerHTML = `
    <div class="dialog" role="dialog" aria-modal="true">
      <h2>${title}</h2>
      <p>${message}</p>
      <div class="dialog__actions">
        <button class="btn btn--primary btn--block" data-action="confirm">${confirmLabel}</button>
        <button class="btn btn--ghost btn--block" data-action="cancel">${cancelLabel}</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  overlay.querySelector('[data-action="confirm"]').addEventListener("click", () => { close(); onConfirm?.(); });
  overlay.querySelector('[data-action="cancel"]').addEventListener("click", () => { close(); onCancel?.(); });
  overlay.addEventListener("click", (e) => { if (e.target === overlay) { close(); onCancel?.(); } });
}
