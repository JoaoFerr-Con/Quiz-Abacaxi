import { pathToFileURL } from "url";
import { setupBrowser, wait, fireInput, fireSubmit, check, finish } from "../harness.mjs";

const APP_DIR = new URL("../..", import.meta.url).pathname.replace(/\/$/, "");
const { document, errors } = setupBrowser();

console.log("[B] Tempo esgotado (timeout) numa pergunta");
const { RULES } = await import(pathToFileURL(`${APP_DIR}/js/config.js`).href);
RULES.secondsPerQuestion = 1; // acelera o teste — mutando o ÚNICO config.js que o app inteiro usa

await import(pathToFileURL(`${APP_DIR}/js/main.js`).href);
await wait();
fireInput(document.getElementById("nome"), "Beltrano Timeout");
fireInput(document.getElementById("cpf"), "111.444.777-35");
fireSubmit(document.getElementById("login-form"));
await wait(150);
check("entrou no quiz", !!document.querySelector(".screen--quiz"));

// não clica em nada — deixa o cronômetro estourar de propósito
await wait(1500);

check("alternativa certa é revelada ao estourar o tempo", !!document.querySelector(".option.is-correct"));
const feedback = document.querySelector(".q-card__feedback");
check("feedback de 'tempo esgotado' aparece", (feedback?.textContent || "").includes("esgotado"));
check("botão para seguir em frente aparece mesmo perdendo por tempo", !!document.getElementById("next-btn"));
check("nenhum erro de JS", errors.length === 0);
if (errors.length) errors.forEach((e) => console.log("     erro:", e));
finish();
