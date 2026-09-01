// ============================================================================
// ranks.js — patentes finais (título + selo) com base nos acertos
// ============================================================================

export const RANKS = [
  { min: 8, icon: "🏆", title: "Mestre do Festival", tagline: "Você conhece Barcarena de coração." },
  { min: 6, icon: "🏅", title: "Orgulho de Barcarena", tagline: "Conhecimento de gente raiz." },
  { min: 3, icon: "🌿", title: "Embaixador do Abacaxi", tagline: "Já manda bem na história local." },
  { min: 0, icon: "🌱", title: "Amigo do Festival", tagline: "Todo mundo começa de algum lugar." },
];

export function getRank(correct) {
  return RANKS.find((r) => correct >= r.min) ?? RANKS[RANKS.length - 1];
}
