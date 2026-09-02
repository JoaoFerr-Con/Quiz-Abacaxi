// ============================================================================
// screens/result.js — patente final, ranking, ticket em QR Code e reinício
// ============================================================================
import { APP_NAME } from "../config.js";
import { icon, burstConfetti, renderQrCode } from "../effects.js";
import { getRank } from "../ranks.js";
import { evaluateAchievements } from "../achievements.js";
import { buildGameSet, loadQuestionPool } from "../questions.js";
import { beginGame, fetchRanking } from "../supabase.js";
import { state, setState, goTo, clearProgress } from "../state.js";

export function mount(root) {
  root.innerHTML = "";
  const rank = getRank(state.correct);
  root.appendChild(view(rank));

  root.querySelector("#trophy-slot").appendChild(icon("trophy", { size: 64 }));

  setTimeout(() => burstConfetti(window.innerWidth / 2, window.innerHeight * 0.25, 90), 200);

  mountTicketQr(root);
  mountAchievements(root);
  mountLeaderboard(root);

  root.querySelector("#btn-share").addEventListener("click", () => share(rank));
  root.querySelector("#btn-restart").addEventListener("click", () => restart(root));
  root.querySelector("#btn-home").addEventListener("click", () => goTo("login"));
}

function view(rank) {
  const accuracy = state.answerable > 0 ? Math.round((state.correct / state.answerable) * 100) : 0;
  const wrap = document.createElement("div");
  wrap.className = "screen screen--result";
  wrap.innerHTML = `
    <div class="ticket ticket--result">
      <span id="trophy-slot" class="icon-hero-slot"></span>
      <p class="eyebrow">${APP_NAME}</p>
      <h1>${rank.icon} ${rank.title}</h1>
      <p class="lede">${state.player.nome} — ${rank.tagline}</p>

      <div class="result-stats">
        <div class="result-stats__item"><strong>${state.xp}</strong><span>XP total</span></div>
        <div class="result-stats__item"><strong>${state.correct}</strong><span>acertos</span></div>
        <div class="result-stats__item"><strong>${accuracy}%</strong><span>precisão</span></div>
        <div class="result-stats__item"><strong>${state.maxStreak}</strong><span>streak máx.</span></div>
      </div>

      <div class="ticket-qr">
        <p class="ticket-qr__label">Mostre este QR na tenda do festival para validar sua participação</p>
        <canvas id="ticket-canvas" width="160" height="160"></canvas>
      </div>

      <div class="achievements">
        <p class="achievements__title">🎖️ Conquistas</p>
        <div id="achievements-grid" class="achievements__grid"></div>
      </div>

      <div id="leaderboard" class="leaderboard" hidden>
        <p class="leaderboard__title">🏆 Ranking do festival</p>
        <ol id="leaderboard-list" class="leaderboard__list"></ol>
      </div>

      <div class="result-actions">
        <button id="btn-share" class="btn btn--primary btn--block">Compartilhar resultado</button>
        <button id="btn-restart" class="btn btn--ghost btn--block">Jogar novamente</button>
        <button id="btn-home" class="btn btn--ghost btn--block">↩ Voltar ao início</button>
      </div>
    </div>
  `;
  return wrap;
}

async function mountTicketQr(root) {
  const canvas = root.querySelector("#ticket-canvas");
  const payload = JSON.stringify({
    cpf: state.player.cpf,
    nome: state.player.nome,
    xp: state.xp,
    correct: state.correct,
    at: Date.now(),
  });
  const ok = await renderQrCode(canvas, payload);
  if (!ok) {
    canvas.replaceWith(Object.assign(document.createElement("p"), {
      className: "ticket-qr__fallback",
      textContent: "Não foi possível gerar o QR agora — mostre esta tela na tenda do festival.",
    }));
  }
}

function mountAchievements(root) {
  const grid = root.querySelector("#achievements-grid");
  const list = evaluateAchievements(state);
  grid.innerHTML = list
    .map(
      (a, i) => `<div class="achievement ${a.earned ? "is-earned" : "is-locked"}" style="--i:${i}">
        <span class="achievement__icon">${a.earned ? a.icon : "🔒"}</span>
        <span class="achievement__name">${a.earned ? a.name : "???"}</span>
      </div>`
    )
    .join("");
}

async function mountLeaderboard(root) {
  const board = await fetchRanking(8);
  if (!board.length) return; // sem Supabase configurado ou ranking vazio: seção some

  const wrap = root.querySelector("#leaderboard");
  const list = root.querySelector("#leaderboard-list");
  const medals = ["🥇", "🥈", "🥉"];

  list.innerHTML = board
    .map((p, i) => {
      const isMe = p.nome === state.player.nome && p.xp === state.xp;
      return `<li class="leaderboard__item ${isMe ? "is-me" : ""}">
        <span class="leaderboard__pos">${medals[i] || i + 1 + "º"}</span>
        <span class="leaderboard__name">${p.nome}${isMe ? " (você)" : ""}</span>
        <span class="leaderboard__xp">${p.xp} XP</span>
      </li>`;
    })
    .join("");
  wrap.hidden = false;
}

function share(rank) {
  const text = `🍍 Joguei o ${APP_NAME} e conquistei o título de ${rank.icon} ${rank.title} com ${state.xp} XP! Bora testar o seu conhecimento sobre Barcarena?`;
  if (navigator.share) {
    navigator.share({ title: APP_NAME, text, url: window.location.origin }).catch(() => {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(`${text} ${window.location.origin}`);
  }
}

async function restart(root) {
  const btn = root.querySelector("#btn-restart");
  btn.disabled = true;
  btn.textContent = "Preparando novo quiz…";
  root.classList.remove("theme-glow"); // partida nova: sem o efeito visual da anterior

  clearProgress(state.player.cpf);
  const pool = await loadQuestionPool();
  const gameSet = buildGameSet(pool);

  setState({
    gameSet,
    roundIndex: 0, questionIndex: 0,
    xp: 0, streak: 0, maxStreak: 0, correct: 0, answerable: 0, log: [],
    mascotShown: false,
  });

  if (state.player.usuarioId) {
    beginGame(state.player.usuarioId, gameSet);
  }

  goTo("quiz");
}
