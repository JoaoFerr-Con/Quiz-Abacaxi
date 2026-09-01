import { pathToFileURL } from "url";
import { setupBrowser, wait, fireInput, fireClick, fireSubmit, check, finish } from "../harness.mjs";

const APP_DIR = new URL("../..", import.meta.url).pathname.replace(/\/$/, "");
const { document, errors } = setupBrowser();

console.log("[C] Mesmo CPF jogando de novo depois de terminar (modo local, sem Supabase)");
await import(pathToFileURL(`${APP_DIR}/js/main.js`).href);
await wait();

const cpf = "529.982.247-25";

async function playFullGame(nome) {
  fireInput(document.getElementById("nome"), nome);
  fireInput(document.getElementById("cpf"), cpf);
  fireSubmit(document.getElementById("login-form"));
  await wait(150);
  let guard = 0;
  while (document.querySelector(".screen--quiz") && guard++ < 30) {
    const opts = document.querySelectorAll(".option");
    if (!opts.length) break;
    fireClick(opts[0]);
    await wait(40);
    const next = document.getElementById("next-btn");
    if (next) { fireClick(next); await wait(40); }
  }
}

await playFullGame("Primeira Vez");
check("primeira partida chegou ao resultado", !!document.querySelector(".screen--result"));
const xpAfterFirst = document.querySelector(".result-stats__item strong")?.textContent;

fireClick(document.getElementById("btn-home"));
await wait(60);
check("voltou pra tela de login", !!document.querySelector(".screen--login"));

fireInput(document.getElementById("nome"), "Primeira Vez");
fireInput(document.getElementById("cpf"), cpf);
fireSubmit(document.getElementById("login-form"));
await wait(150);

const staleResumeOverlay = document.querySelector(".overlay .dialog");
check("NÃO oferece 'continuar de onde parou' com dado velho (progresso já tinha sido limpo)", !staleResumeOverlay);
check("entra direto numa partida nova, sem precisar clicar em nada", !!document.querySelector(".screen--quiz"));
check("XP da primeira partida tinha sido registrado (" + xpAfterFirst + ")", Number(xpAfterFirst) >= 0);
check("nenhum erro de JS durante o cenário inteiro", errors.length === 0);
if (errors.length) errors.forEach((e) => console.log("     erro:", e));
finish();
