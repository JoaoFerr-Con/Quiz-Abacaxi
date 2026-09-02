// ============================================================================
// achievements.js — conquistas/badges calculadas a partir do estado da partida
// ============================================================================
// Cada `check(state)` só olha para dados que já existem em state.js — nada
// aqui precisa de uma tabela nova nem de tracking extra durante o jogo.

export const ACHIEVEMENTS = [
  {
    slug: "primeiro-acerto",
    icon: "🎯",
    name: "Primeiro Acerto",
    check: (s) => s.correct >= 1,
  },
  {
    slug: "sequencia-3",
    icon: "🔥",
    name: "Em Chamas",
    check: (s) => s.maxStreak >= 3,
  },
  {
    slug: "sequencia-5",
    icon: "⚡",
    name: "Imparável",
    check: (s) => s.maxStreak >= 5,
  },
  {
    slug: "embaixador",
    icon: "🌿",
    name: "Embaixador do Abacaxi",
    check: (s) => s.correct >= 6,
  },
  {
    slug: "perfeicao",
    icon: "💎",
    name: "Perfeição",
    check: (s) => s.answerable > 0 && s.correct === s.answerable,
  },
  {
    slug: "opiniao",
    icon: "🗳️",
    name: "Voz Ativa",
    check: (s) => s.log.filter((l) => l.isFreeform).length >= 3,
  },
  {
    slug: "mil-xp",
    icon: "💰",
    name: "Mil XP",
    check: (s) => s.xp >= 1000,
  },
  {
    slug: "mestre",
    icon: "🏆",
    name: "Mestre do Festival",
    check: (s) => s.answerable > 0 && s.correct === s.answerable && s.maxStreak >= 5,
  },
];

/** Devolve todas as conquistas, marcando quais foram alcançadas nessa partida. */
export function evaluateAchievements(state) {
  return ACHIEVEMENTS.map((a) => ({ ...a, earned: a.check(state) }));
}
