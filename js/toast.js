// ============================================================================
// toast.js — aviso não bloqueante no canto da tela
// ============================================================================
// Existe por causa de um princípio simples: uma escrita que falha em
// silêncio é pior do que uma que nunca aconteceu — a pessoa acha que seu
// progresso foi salvo quando não foi. Isso é usado principalmente para
// avisos de conectividade (ver js/state.js e js/screens/login.js).

let stack;

function ensureStack() {
  if (stack) return stack;
  stack = document.createElement("div");
  stack.className = "toast-stack";
  document.body.appendChild(stack);
  return stack;
}

/** @param {"default"|"warn"|"success"} tone */
export function toast(message, { duration = 3600, tone = "default" } = {}) {
  const el = document.createElement("div");
  el.className = `toast toast--${tone}`;
  el.setAttribute("role", "status");
  el.textContent = message;

  ensureStack().appendChild(el);
  requestAnimationFrame(() => el.classList.add("is-visible"));

  setTimeout(() => {
    el.classList.remove("is-visible");
    setTimeout(() => el.remove(), 250);
  }, duration);
}
