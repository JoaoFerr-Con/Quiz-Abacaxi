// ============================================================================
// mascot.js — celebração do mascote quando a pessoa está indo muito bem
// ============================================================================
import { icon } from "./effects.js";

const MESSAGES = [
  "Você tá indo muito bem! 🍍",
  "Uau, olha só esse desempenho!",
  "Isso aí! Continue assim!",
  "Você conhece Barcarena de verdade!",
];

/** Mostra o mascote batendo um papo rápido; `onContinue` roda ao fechar. */
export function showMascotCelebration(onContinue) {
  const overlay = document.createElement("div");
  overlay.className = "overlay overlay--mascot";
  overlay.innerHTML = `
    <div class="mascot-popup" role="dialog" aria-modal="true">
      <span id="mascot-slot" class="mascot-slot"></span>
      <div class="mascot-bubble">
        <p>${MESSAGES[(Math.random() * MESSAGES.length) | 0]}</p>
      </div>
      <button class="btn btn--primary btn--block" data-action="continue">Continuar →</button>
    </div>
  `;
  overlay.querySelector("#mascot-slot").appendChild(icon("mascot", { size: 150 }));
  document.body.appendChild(overlay);

  overlay.querySelector('[data-action="continue"]').addEventListener("click", () => {
    overlay.remove();
    onContinue?.();
  });
}
