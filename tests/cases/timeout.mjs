import { pathToFileURL } from "url";
import { setupBrowser, wait, fireInput, fireSubmit, check, finish } from "../harness.mjs";

const APP_DIR = new URL("../..", import.meta.url).pathname.replace(/\/$/, "");
const { document, errors } = setupBrowser();

console.log("[B] Tempo esgotado (timeout) numa pergunta — precisa seguir sozinho, sem clique");
const { RULES } = await import(pathToFileURL(`${APP_DIR}/js/config.js`).href);
RULES.secondsPerQuestion = 1; // acelera o teste — mutando o ÚNICO config.js que o app inteiro usa

const { state } = await import(pathToFileURL(`${APP_DIR}/js/state.js`).href);
await import(pathToFileURL(`${APP_DIR}/js/main.js`).href);
await wait();
fireInput(document.getElementById("nome"), "Beltrano Timeout");
fireInput(document.getElementById("cpf"), "111.444.777-35");
fireSubmit(document.getElementById("login-form"));
await wait(150);
check("entrou no quiz", !!document.querySelector(".screen--quiz"));

const questionBefore = state.gameSet[state.roundIndex]?.questions[state.questionIndex]?.text;
const roundBefore = state.roundIndex;
const indexBefore = state.questionIndex;

// não clica em nada — deixa o cronômetro estourar de propósito
await wait(1500);

check("alternativa certa é revelada ao estourar o tempo", !!document.querySelector(".option.is-correct"));
const feedback = document.querySelector(".q-card__feedback");
check("feedback de 'tempo esgotado' aparece", (feedback?.textContent || "").includes("esgotado"));
const nextBtn = document.getElementById("next-btn");
check("botão aparece com contagem regressiva (não precisa de clique)", /\(\d\)/.test(nextBtn?.textContent || ""));

// AQUI ESTÁ O PONTO CENTRAL DO TESTE: espera o auto-avanço sem clicar em nada.
await wait(3600);

const questionAfter = state.gameSet[state.roundIndex]?.questions[state.questionIndex]?.text;
const moved = state.roundIndex !== roundBefore || state.questionIndex !== indexBefore || questionAfter !== questionBefore;
check("o jogo avançou sozinho pra próxima pergunta, SEM clicar em nada", moved || !!document.querySelector(".screen--result"));
check("nenhum erro de JS", errors.length === 0);
if (errors.length) errors.forEach((e) => console.log("     erro:", e));
finish();
