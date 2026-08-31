// ============================================================================
// questions.js — banco de perguntas do quiz
// ============================================================================
// Texto de exemplo/placeholder inspirado no Festival do Abacaxi de Barcarena
// (festivaldoabacaxi.com/home). Este arquivo é o FALLBACK: se o Supabase
// estiver configurado (ver js/supabase-config.js), o quiz usa as perguntas
// de lá via `loadQuestionPool()`. Sem Supabase, ou se ele falhar, cai aqui.
//
// `answer: -1` marca uma pergunta "de opinião": não existe certo/errado,
// todo mundo pontua ao responder. É assim que a última rodada funciona.

import { fetchQuestions } from "./supabase.js";

export const ROUNDS = [
  {
    id: "historia",
    title: "Raízes do Festival",
    subtitle: "A história por trás da festa",
    icon: "🏛️",
    accent: "leaf",
  },
  {
    id: "cidade",
    title: "Conhece Barcarena?",
    subtitle: "Geografia e curiosidades locais",
    icon: "🗺️",
    accent: "coral",
  },
  {
    id: "festa",
    title: "Dia de Festival",
    subtitle: "Tradições, comidas e cultura",
    icon: "🍍",
    accent: "gold",
  },
  {
    id: "futuro",
    title: "O Futuro do Abacaxi",
    subtitle: "Rodada de opinião — sem errar!",
    icon: "✨",
    accent: "sky",
    freeform: true,
  },
];

export const QUESTIONS = [
  // ── Rodada 1 · Raízes do Festival ────────────────────────────────────
  {
    round: "historia",
    text: "O Festival do Abacaxi nasceu para celebrar principalmente qual atividade de Barcarena?",
    options: ["A pesca artesanal", "A produção agrícola local", "O comércio portuário", "O turismo de praia"],
    answer: 1,
    fact: "O festival surgiu para dar visibilidade ao trabalho de quem planta e colhe — o abacaxi virou símbolo dessa força produtiva.",
  },
  {
    round: "historia",
    text: "Qual título é disputado todos os anos como um dos símbolos da festa?",
    options: ["Rainha do Abacaxi", "Prefeito Mirim", "Capitão do Festival", "Embaixador Cultural"],
    answer: 0,
    fact: "A eleição da Rainha do Abacaxi é uma das tradições mais esperadas da programação.",
  },
  {
    round: "historia",
    text: "Além da homenagem ao fruto, o festival também é uma vitrine para qual área?",
    options: ["Tecnologia industrial", "Cultura e economia locais", "Esportes olímpicos", "Moda internacional"],
    answer: 1,
    fact: "Música, dança, gastronomia e empreendedorismo local dividem o palco com o abacaxi.",
  },

  // ── Rodada 2 · Conhece Barcarena? ─────────────────────────────────────
  {
    round: "cidade",
    text: "Barcarena fica em qual estado brasileiro?",
    options: ["Pará", "Amazonas", "Maranhão", "Amapá"],
    answer: 0,
    fact: "Barcarena está na região metropolitana de Belém, no estado do Pará.",
  },
  {
    round: "cidade",
    text: "Barcarena é conhecida por abrigar um importante complexo econômico ligado a qual atividade?",
    options: ["Mineração e portos", "Vinícolas", "Estaleiros navais de luxo", "Estações de esqui"],
    answer: 0,
    fact: "O município reúne um dos maiores complexos portuários e industriais do Norte do país.",
  },
  {
    round: "cidade",
    text: "Qual desses elementos faz parte da identidade visual amazônica de Barcarena?",
    options: ["Os rios e igarapés", "Os vulcões ativos", "As dunas de areia", "As geleiras"],
    answer: 0,
    fact: "A relação da cidade com os rios molda o transporte, a economia e a cultura local.",
  },

  // ── Rodada 3 · Dia de Festival ─────────────────────────────────────
  {
    round: "festa",
    text: "Além do abacaxi in natura, o que costuma aparecer com destaque nas barracas do festival?",
    options: ["Doces e pratos com abacaxi", "Frutos do mar congelados", "Comida importada", "Apenas bebidas"],
    answer: 0,
    fact: "Doces, sucos e pratos criativos com abacaxi são parada obrigatória no festival.",
  },
  {
    round: "festa",
    text: "O que normalmente NÃO costuma faltar na programação cultural do festival?",
    options: ["Apresentações musicais e de dança", "Corrida de Fórmula 1", "Desfile de moda em Paris", "Competição de surfe"],
    answer: 0,
    fact: "Shows, quadrilhas e apresentações regionais dão o tom da festa.",
  },
  {
    round: "festa",
    text: "Qual é uma boa prática para curtir o festival com segurança e consciência?",
    options: [
      "Descartar o lixo corretamente e cuidar do espaço público",
      "Levar o próprio abacaxi de casa",
      "Evitar conversar com outros participantes",
      "Chegar sem consultar a programação",
    ],
    answer: 0,
    fact: "Cuidar do espaço da festa é também cuidar de Barcarena — a cidade que recebe todo mundo de braços abertos.",
  },

  // ── Rodada 4 · O Futuro do Abacaxi (opinião, sempre pontua) ───────────
  {
    round: "futuro",
    text: "O que mais te deixaria animado(a) para o próximo Festival do Abacaxi?",
    options: [
      "Mais atrações musicais",
      "Mais espaço para produtores locais",
      "Mais atividades para crianças",
      "Mais opções de gastronomia",
    ],
    answer: -1,
  },
  {
    round: "futuro",
    text: "Na sua opinião, o que Barcarena mais precisa investir nos próximos anos?",
    options: ["Infraestrutura urbana", "Educação e cultura", "Meio ambiente e rios", "Turismo e eventos"],
    answer: -1,
  },
  {
    round: "futuro",
    text: "Se você pudesse dar um conselho para o festival do ano que vem, qual seria o tema?",
    options: [
      "Sustentabilidade",
      "Valorização dos produtores",
      "Mais tecnologia no evento",
      "Mais espaço para novos talentos",
    ],
    answer: -1,
  },
];

/** Agrupa e embaralha as perguntas por rodada, mantendo a ordem das rodadas.
 *  `pool` pode vir do Supabase (ver loadQuestionPool) ou do banco local acima. */
export function buildGameSet(pool = QUESTIONS) {
  return ROUNDS.map((round) => {
    const source = shuffle(pool.filter((q) => q.round === round.id));
    return { round, questions: source.map(shuffleOptions) };
  });
}

/**
 * Busca as perguntas no Supabase; se não estiver configurado, offline, ou a
 * consulta vier vazia/incompleta (faltando alguma rodada), cai de volta para
 * o banco local acima — o quiz nunca fica sem perguntas por causa do banco.
 */
export async function loadQuestionPool() {
  const remote = await fetchQuestions();
  if (!remote) return QUESTIONS;

  const mapped = remote.map((row) => ({
    round: row.round_id,
    text: row.text,
    options: [row.option_a, row.option_b, row.option_c, row.option_d],
    answer: row.correct_index,
    fact: row.fact || "",
  }));

  const coversAllRounds = ROUNDS.every((r) => mapped.some((q) => q.round === r.id));
  return coversAllRounds ? mapped : QUESTIONS;
}

function shuffle(list) {
  const arr = list.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Embaralha as alternativas de UMA pergunta sem perder a referência da certa. */
function shuffleOptions(q) {
  if (q.answer < 0) return { ...q, options: shuffle(q.options) };
  const tagged = q.options.map((text, i) => ({ text, correct: i === q.answer }));
  const shuffled = shuffle(tagged);
  return {
    ...q,
    options: shuffled.map((o) => o.text),
    answer: shuffled.findIndex((o) => o.correct),
  };
}
