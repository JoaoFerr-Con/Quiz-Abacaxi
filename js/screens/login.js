// ============================================================================
// screens/login.js — cadastro (nome + CPF), token de QR e retomada de partida
// ============================================================================
import { APP_NAME, APP_EDITION, SOURCE_URL } from "../config.js";
import { maskCpf, isValidCpf, normalizeCpf } from "../cpf.js";
import { icon } from "../effects.js";
import { buildGameSet, loadQuestionPool } from "../questions.js";
import { loginOrRegister, beginGame } from "../supabase.js";
import { toast } from "../toast.js";
import { setState, goTo, loadProgress } from "../state.js";
import { showResumeChoice } from "./dialog.js";

export function mount(root, { entry } = {}) {
  root.innerHTML = "";
  root.appendChild(view(entry));

  const cpfInput = root.querySelector("#cpf");
  cpfInput.addEventListener("input", (e) => {
    e.target.value = maskCpf(e.target.value);
    clearFieldError(root, "cpf");
  });

  root.querySelector("#emblem-slot").appendChild(icon("emblem", { size: 120 }));

  root.querySelector("#login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    handleSubmit(root, entry);
  });
}

function view(entry) {
  const wrap = document.createElement("div");
  wrap.className = "screen screen--login";
  wrap.innerHTML = `
    <div class="ticket">
      <div class="ticket__hero">
        <span id="emblem-slot" class="icon-hero-slot"></span>
        <p class="eyebrow">${APP_EDITION}</p>
        <h1>${APP_NAME}</h1>
        <p class="lede">Responda, acumule XP e descubra o quanto você conhece
          Barcarena e o Festival do Abacaxi.</p>
      </div>

      ${entry?.valid ? `
        <div class="entry-badge" title="Acesso via QR Code">
          🔗 Entrada validada · <strong>${entry.label}</strong>
        </div>` : ""}

      <form id="login-form" class="form" novalidate>
        <label class="field">
          <span>Nome completo</span>
          <input id="nome" name="nome" type="text" autocomplete="name"
                 placeholder="Como você quer aparecer no ranking" required maxlength="60">
          <small class="field-error" data-for="nome"></small>
        </label>

        <label class="field">
          <span>CPF</span>
          <input id="cpf" name="cpf" type="tel" inputmode="numeric"
                 placeholder="000.000.000-00" maxlength="14" required>
          <small class="field-error" data-for="cpf"></small>
        </label>

        <p class="privacy-note">Usamos seu CPF só para identificar sua
          participação única no quiz e liberar seu certificado ao final.</p>

        <button type="submit" class="btn btn--primary btn--block">Começar a jornada </button>
      </form>

      <a class="source-link" href="${SOURCE_URL}" target="_blank" rel="noopener">
        Site oficial do Festival do Abacaxi ↗
      </a>
    </div>
  `;
  return wrap;
}

function clearFieldError(root, field) {
  const el = root.querySelector(`.field-error[data-for="${field}"]`);
  if (el) el.textContent = "";
  root.querySelector(`#${field}`)?.classList.remove("is-invalid");
}

function setFieldError(root, field, message) {
  const el = root.querySelector(`.field-error[data-for="${field}"]`);
  if (el) el.textContent = message;
  root.querySelector(`#${field}`)?.classList.add("is-invalid");
}

function handleSubmit(root, entry) {
  const nome = root.querySelector("#nome").value.trim();
  const cpfRaw = root.querySelector("#cpf").value.trim();
  let ok = true;

  if (nome.length < 3) {
    setFieldError(root, "nome", "Digite seu nome completo.");
    ok = false;
  } else clearFieldError(root, "nome");

  if (!isValidCpf(cpfRaw)) {
    setFieldError(root, "cpf", "CPF inválido — confira os números.");
    ok = false;
  } else clearFieldError(root, "cpf");

  if (!ok) return;

  const player = { nome, cpf: normalizeCpf(cpfRaw) };

  // Caminho rápido: já existe progresso salvo NESTE aparelho (funciona offline,
  // não depende do Supabase responder). Se a pessoa trocar de aparelho, o
  // caminho abaixo (checkRemoteAndProceed) é quem resolve.
  const localSave = loadProgress(player.cpf);
  if (localSave && localSave.gameSet?.length) {
    showResumeChoice({
      title: "Bem-vindo(a) de volta! 🍍",
      message: `Encontramos uma partida em andamento com ${localSave.xp} XP. Quer continuar de onde parou?`,
      confirmLabel: "Continuar jornada",
      cancelLabel: "Começar do zero",
      onConfirm: () => setState({ ...localSave, entry: null, screen: "quiz" }),
      onCancel: () => startNewGame(root, player, entry),
    });
    return;
  }

  checkRemoteAndProceed(root, player, entry);
}

async function checkRemoteAndProceed(root, player, entry) {
  const submitBtn = root.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = "Entrando…";

  const login = await loginOrRegister({ nome: player.nome, cpf: player.cpf, entryToken: entry?.label });

  submitBtn.disabled = false;
  submitBtn.textContent = "Começar a jornada →";

  if (!login.ok) {
    // "not-configured" é o modo local esperado (sem Supabase) — fica quieto.
    // Qualquer outro motivo é uma falha de verdade (rede caiu, servidor fora).
    if (login.reason && login.reason !== "not-configured") {
      toast("Não conseguimos falar com o servidor agora — seguindo só neste aparelho.", { tone: "warn" });
    }
    return startNewGame(root, player, entry);
  }

  const player2 = { ...player, usuarioId: login.usuarioId };

  if (login.isFirstLogin) {
    toast("🍍 Conta criada! Boa sorte na sua primeira jornada.", { tone: "success" });
  }

  const p = login.participation;

  if (p.completed) {
    showResumeChoice({
      title: "Que bom te ver de novo! 🏆",
      message: `Você já concluiu esta jornada com ${p.xp} XP e ${p.correct} acertos. Cada CPF participa uma vez — quer ver seu resultado, ou reiniciar (isso zera sua pontuação)?`,
      confirmLabel: "Ver meu resultado →",
      cancelLabel: "Reiniciar (zerar pontuação)",
      onConfirm: () => showReadOnlyResult(player2, p),
      onCancel: () => startNewGame(root, player2, entry),
    });
    return;
  }

  if (p.gameSnapshot?.length) {
    showResumeChoice({
      title: "Bem-vindo(a) de volta! 🍍",
      message: `Encontramos uma partida em andamento com ${p.xp} XP. Quer continuar de onde parou?`,
      confirmLabel: "Continuar jornada →",
      cancelLabel: "Começar do zero",
      onConfirm: () => resumeFromRemote(player2, p),
      onCancel: () => startNewGame(root, player2, entry),
    });
    return;
  }

  startNewGame(root, player2, entry);
}

async function startNewGame(root, player, entry) {
  const submitBtn = root.querySelector('button[type="submit"]');
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Preparando o quiz…"; }

  root.classList.remove("theme-glow"); // partida nova: sem o efeito visual da anterior

  const pool = await loadQuestionPool();
  const gameSet = buildGameSet(pool);

  setState({
    player, entry, gameSet,
    roundIndex: 0, questionIndex: 0,
    xp: 0, streak: 0, maxStreak: 0, correct: 0, answerable: 0, log: [],
    mascotShown: false,
  });

  if (player.usuarioId) {
    beginGame(player.usuarioId, gameSet); // best-effort: já resolvido dentro de supabase.js
  }

  goTo("quiz");
}

function resumeFromRemote(player, participation) {
  setState({
    player, entry: null,
    gameSet: participation.gameSnapshot,
    roundIndex: participation.roundIndex,
    questionIndex: participation.questionIndex,
    xp: participation.xp,
    correct: participation.correct,
    answerable: participation.answerable,
    maxStreak: participation.maxStreak,
    streak: 0, // o streak "ao vivo" não é persistido — retomamos com o contador zerado
    log: [],
    mascotShown: participation.correct >= 7, // já passou do gatilho antes de trocar de aparelho: não repete
    screen: "quiz",
  });
}

function showReadOnlyResult(player, participation) {
  setState({
    player,
    xp: participation.xp,
    correct: participation.correct,
    answerable: participation.answerable,
    maxStreak: participation.maxStreak,
    screen: "result",
  });
}
