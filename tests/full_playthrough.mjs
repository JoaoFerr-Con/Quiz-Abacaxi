// ============================================================================
// Teste de integração: simula um navegador real (jsdom) e joga o quiz do
// início ao fim, igual uma pessoa faria — pega erros que checagem de sintaxe
// sozinha não pega (foi assim que o bug do "undefined" passou antes).
// ============================================================================
import { JSDOM } from "jsdom";
import { pathToFileURL } from "url";

const APP_DIR = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const errors = [];
const warnings = [];

const dom = new JSDOM(
  `<!doctype html><html><body>
    <div id="boot-loader"></div>
    <main id="app"></main>
  </body></html>`,
  { url: "http://localhost/", pretendToBeVisual: true }
);

const { window } = dom;

// ── Polyfills mínimos pro código do app rodar num DOM simulado ────────────
window.requestAnimationFrame = (cb) => setTimeout(cb, 16);
window.cancelAnimationFrame = (id) => clearTimeout(id);
window.Element.prototype.scrollIntoView = function () {};
window.HTMLCanvasElement.prototype.getContext = function () {
  const store = {};
  return new Proxy({}, {
    get(_t, prop) { return prop in store ? store[prop] : (() => {}); },
    set(_t, prop, v) { store[prop] = v; return true; },
  });
};
// QR "já carregado localmente" (é assim que roda de verdade, via <script> no index.html)
window.QRCode = { toCanvas: async () => {} };
window.navigator.share = undefined;
window.navigator.clipboard = { writeText: async () => {} };

// Captura qualquer erro JS não tratado dentro do "navegador"
window.addEventListener("error", (e) => errors.push(e.error?.stack || e.message));
window.onunhandledrejection = (e) => errors.push("unhandledrejection: " + (e.reason?.stack || e.reason));

global.window = window;
global.document = window.document;
Object.defineProperty(global, "navigator", { value: window.navigator, configurable: true });
global.localStorage = window.localStorage;
global.customElements = window.customElements;
global.HTMLElement = window.HTMLElement;
global.requestAnimationFrame = window.requestAnimationFrame;
// (performance.now já existe nativamente no Node — não sobrescrever com a do
// jsdom evita um bug conhecido de recursão infinita entre as duas versões)

const wait = (ms = 30) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log("  ", ...a);

function fireInput(el, value) {
  el.value = value;
  el.dispatchEvent(new window.Event("input", { bubbles: true }));
}
function fireClick(el) {
  el.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));
}
function fireSubmit(el) {
  el.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
}

function findUndefinedText(root) {
  // Procura literalmente a string "undefined" em qualquer texto visível —
  // foi exatamente esse tipo de bug que passou despercebido antes.
  const walker = document.createTreeWalker(root, window.NodeFilter.SHOW_TEXT);
  const hits = [];
  let n;
  while ((n = walker.nextNode())) {
    if (/\bundefined\b/.test(n.textContent)) hits.push(n.textContent.trim());
  }
  return hits;
}

async function main() {
  console.log("1) Carregando main.js (bootstrap real do app)...");
  await import(pathToFileURL(`${APP_DIR}/js/main.js`).href);
  await wait();

  const app = document.getElementById("app");
  if (!app.querySelector(".screen--login")) throw new Error("Tela de login não montou.");
  log("✓ tela de login montada");

  console.log("2) Preenchendo cadastro e enviando...");
  fireInput(document.getElementById("nome"), "Maria Teste da Silva");
  fireInput(document.getElementById("cpf"), "111.444.777-35"); // CPF válido (dígitos verificadores corretos)
  fireSubmit(document.getElementById("login-form"));
  await wait(150); // dá tempo pro fluxo async (loginOrRegister -> not-configured -> startNewGame)

  if (!app.querySelector(".screen--quiz")) {
    throw new Error("Não entrou na tela de quiz depois do cadastro. HTML atual:\n" + app.innerHTML.slice(0, 500));
  }
  log("✓ entrou no quiz");

  console.log("3) Jogando o quiz inteiro (respondendo tudo, verificando cada tela)...");
  let questionCount = 0;
  const roundsSeen = new Set();

  while (app.querySelector(".screen--quiz")) {
    questionCount++;
    const card = app.querySelector(".q-card");
    if (!card) throw new Error(`Pergunta ${questionCount}: .q-card não existe.`);

    const roundBadge = card.querySelector(".q-card__round")?.textContent || "";
    roundsSeen.add(roundBadge);

    const undef = findUndefinedText(card);
    if (undef.length) throw new Error(`Pergunta ${questionCount}: texto "undefined" encontrado -> ${JSON.stringify(undef)}`);

    const qText = card.querySelector(".q-card__text")?.textContent;
    if (!qText || qText.length < 5) throw new Error(`Pergunta ${questionCount}: texto da pergunta vazio/curto.`);

    const options = [...card.querySelectorAll(".option")];
    if (options.length !== 4) throw new Error(`Pergunta ${questionCount}: esperava 4 alternativas, achei ${options.length}.`);

    fireClick(options[Math.floor(Math.random() * options.length)]);
    await wait(40);

    const nextBtn = app.querySelector("#next-btn");
    if (!nextBtn) throw new Error(`Pergunta ${questionCount}: botão de próxima pergunta não apareceu depois de responder.`);
    const undefAfter = findUndefinedText(app.querySelector(".q-card__feedback"));
    if (undefAfter.length) throw new Error(`Pergunta ${questionCount}: "undefined" no feedback -> ${JSON.stringify(undefAfter)}`);

    fireClick(nextBtn);
    await wait(40);

    if (questionCount > 40) throw new Error("Mais de 40 perguntas — parece loop infinito, abortando.");
  }

  log(`✓ ${questionCount} perguntas respondidas`);
  log(`✓ rodadas vistas: ${[...roundsSeen].join(" | ")}`);

  console.log("4) Conferindo tela de resultado...");
  await wait(100); // leaderboard/QR são assíncronos
  const resultScreen = app.querySelector(".screen--result");
  if (!resultScreen) throw new Error("Não chegou na tela de resultado.");

  const undefResult = findUndefinedText(resultScreen);
  if (undefResult.length) throw new Error(`Resultado: "undefined" encontrado -> ${JSON.stringify(undefResult)}`);

  const xpText = resultScreen.querySelector(".result-stats__item strong")?.textContent;
  log("✓ tela de resultado ok, XP exibido:", xpText);

  const achBoxes = resultScreen.querySelectorAll(".achievement");
  log(`✓ ${achBoxes.length} conquistas renderizadas (${resultScreen.querySelectorAll(".achievement.is-earned").length} desbloqueadas)`);

  const canvas = resultScreen.querySelector("#ticket-canvas");
  log("✓ canvas do QR do ticket presente:", !!canvas);

  console.log("5) Testando 'Jogar novamente'...");
  const restartBtn = document.getElementById("btn-restart");
  fireClick(restartBtn);
  await wait(150);
  if (!app.querySelector(".screen--quiz")) throw new Error("'Jogar novamente' não voltou pro quiz.");
  log("✓ 'Jogar novamente' funciona");

  if (errors.length) {
    console.log("\n❌ ERROS DE JS CAPTURADOS DURANTE O TESTE:");
    errors.forEach((e) => console.log(" -", e));
    process.exitCode = 1;
  } else {
    console.log("\n✅ TESTE COMPLETO: nenhum erro de JS, nenhum \"undefined\" na tela, fluxo inteiro funcionou.");
  }
}

main()
  .catch((err) => {
    console.log("\n❌ FALHA NO TESTE:", err.message);
    if (errors.length) {
      console.log("Erros de JS capturados até aqui:");
      errors.forEach((e) => console.log(" -", e));
    }
    process.exitCode = 1;
  })
  .finally(() => process.exit(process.exitCode ?? 0));
