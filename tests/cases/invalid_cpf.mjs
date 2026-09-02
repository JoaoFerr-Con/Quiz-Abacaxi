import { pathToFileURL } from "url";
import { setupBrowser, wait, fireInput, fireSubmit, check, finish } from "../harness.mjs";

const APP_DIR = new URL("../..", import.meta.url).pathname.replace(/\/$/, "");
const { document } = setupBrowser();

console.log("[A] CPF inválido não deve deixar passar");
await import(pathToFileURL(`${APP_DIR}/js/main.js`).href);
await wait();

fireInput(document.getElementById("nome"), "Fulano de Tal");
fireInput(document.getElementById("cpf"), "111.111.111-11"); // dígitos verificadores inválidos
fireSubmit(document.getElementById("login-form"));
await wait(80);

check("continua na tela de login (não avançou)", !!document.querySelector(".screen--login"));
check("mostra mensagem de erro no campo CPF", (document.querySelector('[data-for="cpf"]')?.textContent || "").length > 0);
check("input de CPF ganha a classe de erro visual", document.getElementById("cpf").classList.contains("is-invalid"));
finish();
