// ============================================================================
// supabase.js — cliente Supabase + wrappers das RPCs (login, progresso, ranking)
// ============================================================================
// Tratamento de erro é a regra aqui, não a exceção: nenhuma função deste
// módulo lança exceção pro chamador. Se o Supabase não estiver configurado,
// a lib não carregou, ou a rede falhar no meio do jogo, cada função devolve
// um resultado "falho" previsível — quem chama decide o fallback (em geral:
// seguir só com localStorage, como o app já faz desde a primeira versão).

import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabase-config.js";

let client;
let clientInitialized = false;

function getClient() {
  if (clientInitialized) return client;
  clientInitialized = true;

  const configured =
    SUPABASE_URL && !SUPABASE_URL.includes("SEU-PROJETO") &&
    SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.includes("SUA_ANON_KEY");

  if (!configured || !window.supabase) {
    client = null;
    return null;
  }
  try {
    client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (err) {
    console.warn("[supabase] não foi possível iniciar o client:", err);
    client = null;
  }
  return client;
}

export function isSupabaseConfigured() {
  return !!getClient();
}

/**
 * Chama uma RPC de forma segura. `reason` diferencia POR QUE falhou:
 * - "not-configured": Supabase nunca foi configurado (comportamento normal
 *   em dev/local) — quem chama não deve alarmar o usuário por isso.
 * - "network" / "rpc-error": Supabase está configurado mas a chamada falhou
 *   de verdade (offline, erro do servidor) — isso sim vale um aviso na UI.
 */
async function callRpc(name, params) {
  const sb = getClient();
  if (!sb) return { ok: false, reason: "not-configured" };
  try {
    const { data, error } = await sb.rpc(name, params);
    if (error) {
      console.warn(`[supabase] ${name}:`, error.message);
      return { ok: false, reason: "rpc-error", error };
    }
    return { ok: true, data };
  } catch (err) {
    console.warn(`[supabase] ${name} (falha de rede):`, err?.message || err);
    return { ok: false, reason: "network" };
  }
}

/** Busca o banco de perguntas ativo no Supabase. `null` = use o fallback local. */
export async function fetchQuestions() {
  const sb = getClient();
  if (!sb) return null;
  try {
    const { data, error } = await sb
      .from("perguntas")
      .select("round_id, round_order, text, option_a, option_b, option_c, option_d, correct_index, fact")
      .eq("active", true)
      .order("round_order", { ascending: true });
    if (error || !data?.length) return null;
    return data;
  } catch (err) {
    console.warn("[supabase] fetchQuestions (falha de rede):", err?.message || err);
    return null;
  }
}

/**
 * Login "inteligente": cria a conta se o CPF for novo, ou só registra mais
 * um acesso (contador + data) se já existir. Devolve `isFirstLogin` e o
 * estado atual da partida daquele usuário — é essa resposta que o front
 * usa para decidir entre "começar", "continuar de onde parou" ou "você já
 * jogou".
 */
export async function loginOrRegister({ nome, cpf, entryToken }) {
  const res = await callRpc("login_or_register", {
    p_nome: nome, p_cpf: cpf, p_entry_token: entryToken || null,
  });
  if (!res.ok) return { ok: false, reason: res.reason };

  const row = res.data?.[0];
  if (!row) return { ok: false, reason: "empty-response" };

  return {
    ok: true,
    usuarioId: row.usuario_id,
    isFirstLogin: row.is_first_login,
    participation: {
      roundIndex: row.round_index,
      questionIndex: row.question_index,
      xp: row.xp,
      correct: row.correct,
      answerable: row.answerable,
      maxStreak: row.max_streak,
      completed: row.completed,
      gameSnapshot: row.game_snapshot,
    },
  };
}

/** Cria/reinicia a partida de um usuário já logado (zera pontuação, grava a nova sequência). */
export async function beginGame(usuarioId, gameSnapshot) {
  const res = await callRpc("begin_game", { p_usuario_id: usuarioId, p_game_snapshot: gameSnapshot });
  return res.ok;
}

/** Salva o progresso (chamado após cada resposta) — best effort, não bloqueia a UI. */
export async function saveProgressRemote(usuarioId, { roundIndex, questionIndex, xp, correct, answerable, maxStreak }) {
  const res = await callRpc("save_progress", {
    p_usuario_id: usuarioId,
    p_round_index: roundIndex,
    p_question_index: questionIndex,
    p_xp: xp,
    p_correct: correct,
    p_answerable: answerable,
    p_max_streak: maxStreak,
  });
  return res.ok;
}

/** Marca a partida como concluída. */
export async function finishParticipationRemote(usuarioId, { xp, correct, answerable, maxStreak }) {
  const res = await callRpc("finish_participation", {
    p_usuario_id: usuarioId, p_xp: xp, p_correct: correct, p_answerable: answerable, p_max_streak: maxStreak,
  });
  return res.ok;
}

/** Top N do ranking (sem CPF nem id interno — só o necessário pro placar). */
export async function fetchRanking(limit = 10) {
  const res = await callRpc("get_ranking", { p_limit: limit });
  return res.ok ? res.data ?? [] : [];
}
