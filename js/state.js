// ============================================================================
// state.js — fonte única de verdade da SPA (sem framework, com pub/sub simples)
// ============================================================================
import { STORAGE } from "./config.js";
import { saveProgressRemote, finishParticipationRemote } from "./supabase.js";
import { toast } from "./toast.js";

const listeners = new Set();

export const state = {
  screen: "login", // "login" | "quiz" | "result"
  entry: null, // token de entrada (QR Code), se houver
  player: null, // { nome, cpf, usuarioId? } — usuarioId só existe se o Supabase confirmou o login

  gameSet: [], // rodadas + perguntas embaralhadas da partida atual
  roundIndex: 0,
  questionIndex: 0,

  xp: 0,
  streak: 0,
  maxStreak: 0,
  correct: 0,
  answerable: 0, // nº de perguntas com certo/errado (exclui a rodada de opinião)
  log: [], // histórico de respostas, para a tela de resultado
};

/** Componentes se inscrevem aqui para re-renderizar quando o estado mudar. */
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify() {
  listeners.forEach((fn) => fn(state));
}

/** Único ponto de mutação do estado — mantém previsível e fácil de debugar. */
export function setState(patch) {
  Object.assign(state, typeof patch === "function" ? patch(state) : patch);
  notify();
}

export function goTo(screen) {
  setState({ screen });
}

// ── Aviso de sincronização (uma vez só, não a cada resposta) ──────────────
// Se o Supabase JÁ tinha confirmado o login (existe usuarioId) e depois uma
// gravação falha, é sinal de queda de conexão real no meio do jogo — isso
// merece um aviso. Se nunca houve usuarioId (Supabase nunca configurado /
// offline desde o início), é o modo local esperado: fica em silêncio.
let syncWarned = false;

function reportSyncOutcome(ok) {
  if (!state.player?.usuarioId) return;
  if (!ok && !syncWarned) {
    syncWarned = true;
    toast("Sem conexão com o servidor — seu progresso continua salvo neste aparelho e sincroniza quando a internet voltar.", { tone: "warn", duration: 4200 });
  }
  if (ok) syncWarned = false; // conexão voltou: se cair de novo, avisa outra vez
}

// ── Persistência local, por CPF (permite retomar se a aba fechar) ─────────
// Cada gravação escreve em DOIS lugares: localStorage (instantâneo, funciona
// offline, é a fonte usada para retomar no MESMO aparelho) e Supabase
// (best-effort, em segundo plano — é o que permite retomar em outro
// aparelho e aparecer no ranking). Se o Supabase falhar, o jogo continua
// normalmente só com o cache local; nada trava esperando a rede.
export function saveProgress() {
  if (!state.player) return;
  const key = STORAGE.progress(state.player.cpf);
  const snapshot = {
    player: state.player,
    gameSet: state.gameSet,
    roundIndex: state.roundIndex,
    questionIndex: state.questionIndex,
    xp: state.xp,
    streak: state.streak,
    maxStreak: state.maxStreak,
    correct: state.correct,
    answerable: state.answerable,
    log: state.log,
    savedAt: Date.now(),
  };
  localStorage.setItem(key, JSON.stringify(snapshot));

  if (!state.player.usuarioId) return; // nunca logou no Supabase: só local mesmo
  saveProgressRemote(state.player.usuarioId, {
    roundIndex: state.roundIndex,
    questionIndex: state.questionIndex,
    xp: state.xp,
    correct: state.correct,
    answerable: state.answerable,
    maxStreak: state.maxStreak,
  }).then(reportSyncOutcome);
}

export function loadProgress(cpf) {
  try {
    const raw = localStorage.getItem(STORAGE.progress(cpf));
    if (!raw) return null;
    const data = JSON.parse(raw);
    // Progresso expira em 6h para não travar alguém em uma partida antiga.
    if (Date.now() - (data.savedAt || 0) > 6 * 60 * 60 * 1000) return null;
    return data;
  } catch {
    return null;
  }
}

export function clearProgress(cpf) {
  localStorage.removeItem(STORAGE.progress(cpf));
}

export function saveResult() {
  if (!state.player) return;
  localStorage.setItem(
    STORAGE.result(state.player.cpf),
    JSON.stringify({
      player: state.player,
      xp: state.xp,
      correct: state.correct,
      answerable: state.answerable,
      maxStreak: state.maxStreak,
      finishedAt: Date.now(),
    })
  );

  if (!state.player.usuarioId) return;
  finishParticipationRemote(state.player.usuarioId, {
    xp: state.xp,
    correct: state.correct,
    answerable: state.answerable,
    maxStreak: state.maxStreak,
  }).then((ok) => {
    reportSyncOutcome(ok);
    if (!ok) {
      toast("Não conseguimos confirmar seu resultado final no servidor agora. Guarde o QR desta tela — sua pontuação já está salva neste aparelho.", { tone: "warn", duration: 5000 });
    }
  });
}
