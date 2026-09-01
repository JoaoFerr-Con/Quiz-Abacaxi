// ============================================================================
// screens/quiz.js — motor do quiz: perguntas, cronômetro, XP e streak
// ============================================================================
import { RULES } from "../config.js";
import { icon, burstConfetti, setStreakActive } from "../effects.js";
import { state, setState, goTo, saveProgress, saveResult, clearProgress } from "../state.js";

let timerId = null;
let lastRenderedRound = null;

export function mount(root) {
  root.innerHTML = "";
  root.appendChild(shell());
  root.querySelector("#streak-fire-slot").appendChild(icon("fire", { size: 26, trigger: "loop" }));
  lastRenderedRound = null;
  renderQuestion(root);

  return () => stopTimer(); // cleanup ao sair da tela
}

function shell() {
  const wrap = document.createElement("div");
  wrap.className = "screen screen--quiz";
  wrap.innerHTML = `
    <header class="quiz-top">
      <div class="quiz-top__dots" id="round-dots"></div>
      <div class="quiz-top__stats">
        <span class="stat stat--xp" id="stat-xp">0 XP</span>
        <span class="stat stat--streak" id="stat-streak">
          <span id="streak-fire-slot" class="streak-fire-slot"></span>
          <span id="streak-count">0</span>
        </span>
      </div>
    </header>

    <div class="timer-bar"><div class="timer-bar__fill" id="timer-fill"></div></div>

    <div id="round-banner" class="round-banner" hidden></div>

    <main id="question-area" class="question-area"></main>
  `;
  return wrap;
}

function currentQuestion() {
  const entry = state.gameSet[state.roundIndex];
  return { round: entry.round, question: entry.questions[state.questionIndex] };
}

function totalQuestions() {
  return state.gameSet.reduce((sum, r) => sum + r.questions.length, 0);
}

function answeredSoFar() {
  let n = 0;
  for (let i = 0; i < state.roundIndex; i++) n += state.gameSet[i].questions.length;
  return n + state.questionIndex;
}

function renderQuestion(root) {
  const { round, question } = currentQuestion();
  renderDots(root);
  renderStats(root);

  const banner = root.querySelector("#round-banner");
  if (lastRenderedRound !== round.id) {
    lastRenderedRound = round.id;
    banner.hidden = false;
    banner.innerHTML = `<span class="round-banner__icon">${round.icon}</span>
      <div><strong>${round.title}</strong><small>${round.subtitle}</small></div>`;
    setTimeout(() => (banner.hidden = true), 1400);
  }

  const area = root.querySelector("#question-area");
  area.innerHTML = "";
  area.appendChild(questionCard(round, question));

  startTimer(root, () => handleAnswer(root, -1, true));
}

function renderDots(root) {
  const dots = root.querySelector("#round-dots");
  dots.innerHTML = state.gameSet
    .map((entry, i) => {
      const cls = i < state.roundIndex ? "done" : i === state.roundIndex ? "active" : "";
      return `<span class="round-dot ${cls}" title="${entry.round.title}">${entry.round.icon}</span>`;
    })
    .join("");
}

function renderStats(root) {
  root.querySelector("#stat-xp").textContent = `${state.xp} XP`;
  root.querySelector("#stat-streak").classList.toggle("is-hot", state.streak >= RULES.streakStartsAt);
  root.querySelector("#streak-count").textContent = state.streak;
  setStreakActive(root, state.streak >= RULES.streakStartsAt);
}

function questionCard(round, question) {
  const card = document.createElement("div");
  card.className = "q-card";
  const progress = `${answeredSoFar() + 1} / ${totalQuestions()}`;
  card.innerHTML = `
    <div class="q-card__meta">
      <span class="q-card__round">${round.icon} ${round.title}</span>
      <span class="q-card__progress">${progress}</span>
    </div>
    <h2 class="q-card__text">${question.text}</h2>
    <div class="q-card__options"></div>
    <div class="q-card__feedback" hidden></div>
  `;
  const optionsWrap = card.querySelector(".q-card__options");
  question.options.forEach((text, i) => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.type = "button";
    btn.innerHTML = `<span class="option__letter">${String.fromCharCode(65 + i)}</span><span>${text}</span>`;
    btn.addEventListener("click", () => handleAnswer(document.querySelector(".screen--quiz"), i, false), { once: true });
    optionsWrap.appendChild(btn);
  });
  return card;
}

function startTimer(root, onExpire) {
  stopTimer();
  const totalMs = RULES.secondsPerQuestion * 1000;
  const start = performance.now();
  const fill = root.querySelector("#timer-fill");
  fill.style.width = "100%";
  fill.dataset.state = "ok";

  timerId = setInterval(() => {
    const elapsed = performance.now() - start;
    const remaining = Math.max(0, totalMs - elapsed);
    const pct = (remaining / totalMs) * 100;
    fill.style.width = `${pct}%`;
    fill.dataset.state = pct < 20 ? "danger" : pct < 50 ? "warn" : "ok";
    if (remaining <= 0) {
      stopTimer();
      onExpire();
    }
  }, 100);
}

function stopTimer() {
  clearInterval(timerId);
  timerId = null;
}

function secondsLeft(root) {
  const pct = parseFloat(root.querySelector("#timer-fill")?.style.width || "0");
  return (pct / 100) * RULES.secondsPerQuestion;
}

function handleAnswer(root, selectedIndex, timedOut) {
  stopTimer();

  const { question } = currentQuestion();
  const isFreeform = question.answer < 0;
  const isCorrect = isFreeform ? true : selectedIndex === question.answer;
  const left = timedOut ? 0 : secondsLeft(root);

  const options = root.querySelectorAll(".option");
  options.forEach((btn, i) => {
    btn.disabled = true;
    if (!isFreeform && i === question.answer) btn.classList.add("is-correct");
    else if (i === selectedIndex && !isCorrect) btn.classList.add("is-wrong");
  });

  let earned = 0;
  if (isCorrect) {
    earned = RULES.basePoints;
    if (left >= RULES.speedBonusThreshold) earned += RULES.speedBonus;
    const newStreak = isFreeform ? state.streak : state.streak + 1;
    if (!isFreeform && newStreak >= RULES.streakStartsAt) {
      earned += Math.floor(RULES.basePoints * RULES.streakMultiplier);
    }
    if (!isFreeform) {
      const btn = options[selectedIndex];
      if (btn) {
        const r = btn.getBoundingClientRect();
        burstConfetti(r.left + r.width / 2, r.top + r.height / 2, newStreak >= RULES.streakStartsAt ? 60 : 32);
      }
    }
    setState((s) => ({
      xp: s.xp + earned,
      streak: isFreeform ? s.streak : s.streak + 1,
      maxStreak: Math.max(s.maxStreak, isFreeform ? s.streak : s.streak + 1),
      correct: s.correct + (isFreeform ? 0 : 1),
      answerable: s.answerable + (isFreeform ? 0 : 1),
    }));
  } else {
    setState((s) => ({ streak: 0, answerable: s.answerable + 1 }));
  }

  setState((s) => ({
    log: [...s.log, { round: currentQuestion().round.id, isFreeform, isCorrect, selectedIndex, earned, timedOut }],
  }));
  renderStats(root);
  saveProgress();

  showFeedback(root, question, { isCorrect, isFreeform, earned, timedOut });
}

function showFeedback(root, question, { isCorrect, isFreeform, earned, timedOut }) {
  const feedback = root.querySelector(".q-card__feedback");
  feedback.hidden = false;
  const headline = isFreeform
    ? "Obrigado por opinar! 🙏"
    : isCorrect
    ? (timedOut ? "" : "Certinho! 🎯")
    : timedOut ? "Tempo esgotado ⏱️" : "Quase! 🤔";

  feedback.innerHTML = `
    <p class="q-card__headline">${headline} ${earned ? `<span class="xp-pill">+${earned} XP</span>` : ""}</p>
    ${question.fact ? `<p class="q-card__fact">${question.fact}</p>` : ""}
    <button type="button" class="btn btn--primary btn--block" id="next-btn">
      ${isLastQuestion() ? "Ver meu resultado →" : "Próxima pergunta →"}
    </button>
  `;
  feedback.querySelector("#next-btn").addEventListener("click", () => advance(root));
  feedback.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function isLastQuestion() {
  const isLastRound = state.roundIndex === state.gameSet.length - 1;
  const isLastInRound = state.questionIndex === state.gameSet[state.roundIndex].questions.length - 1;
  return isLastRound && isLastInRound;
}

function advance(root) {
  const round = state.gameSet[state.roundIndex];
  if (state.questionIndex + 1 < round.questions.length) {
    setState({ questionIndex: state.questionIndex + 1 });
  } else if (state.roundIndex + 1 < state.gameSet.length) {
    setState({ roundIndex: state.roundIndex + 1, questionIndex: 0 });
  } else {
    saveResult();
    clearProgress(state.player.cpf); // apaga o "em andamento" — a partida terminou de verdade
    goTo("result");
    return;
  }
  saveProgress();
  renderQuestion(root);
}
