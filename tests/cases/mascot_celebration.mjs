import { pathToFileURL } from "url";
import { setupBrowser, wait, fireInput, fireClick, fireSubmit, check, finish } from "../harness.mjs";

const APP_DIR = new URL("../..", import.meta.url).pathname.replace(/\/$/, "");
const { document, errors } = setupBrowser();

console.log("[D] Mascote comemora ao passar de 6 acertos, e some 'trocando de cor' até o fim");

const { state } = await import(pathToFileURL(`${APP_DIR}/js/state.js`).href);
await import(pathToFileURL(`${APP_DIR}/js/main.js`).href);
await wait();

fireInput(document.getElementById("nome"), "Sortudo dos Acertos");
fireInput(document.getElementById("cpf"), "111.444.777-35"); // CPF válido (dígitos verificadores corretos)
fireSubmit(document.getElementById("login-form"));
await wait(150);
check("entrou no quiz", !!document.querySelector(".screen--quiz"));

let mascotSeen = false;
let guard = 0;

while (document.querySelector(".screen--quiz") && guard++ < 40) {
  // Responde sempre CERTO (usa o estado real do jogo pra saber qual alternativa é a certa,
  // ou qualquer uma nas perguntas de opinião — lá tudo conta como "acerto").
  const entry = state.gameSet[state.roundIndex];
  const question = entry.questions[state.questionIndex];
  const correctIndex = question.answer < 0 ? 0 : question.answer;

  const options = document.querySelectorAll(".option");
  if (!options.length) break;
  fireClick(options[correctIndex]);
  await wait(40);

  // O mascote aparece EM VEZ do próximo botão normal, assim que correct >= 7.
  const mascotOverlay = document.querySelector(".overlay--mascot");
  if (mascotOverlay && !mascotSeen) {
    mascotSeen = true;
    check("correct chegou a 7 quando o mascote apareceu", state.correct >= 7);
    check("pop-up mostra a mensagem do mascote", !!mascotOverlay.querySelector(".mascot-bubble p")?.textContent?.length);
    check("pop-up mostra o botão continuar", !!mascotOverlay.querySelector('[data-action="continue"]'));
    fireClick(mascotOverlay.querySelector('[data-action="continue"]'));
    await wait(60);
    check("pop-up fecha depois de clicar em continuar", !document.querySelector(".overlay--mascot"));
    check("tela ganha a classe theme-glow depois da celebração", document.getElementById("app").classList.contains("theme-glow"));
    continue; // essa resposta já avançou pro overlay; segue o loop pra próxima pergunta
  }

  const next = document.getElementById("next-btn");
  if (next) { fireClick(next); await wait(40); }
}

check("o mascote apareceu em algum momento da partida", mascotSeen);
check("chegou até o resultado", !!document.querySelector(".screen--result"));
check("nenhum erro de JS durante o cenário inteiro", errors.length === 0);
if (errors.length) errors.forEach((e) => console.log("     erro:", e));

console.log("2) Testando que uma partida NOVA não herda o theme-glow da anterior...");
fireClick(document.getElementById("btn-restart"));
await wait(150);
check("theme-glow foi removido ao começar de novo", !document.getElementById("app").classList.contains("theme-glow"));
check("mascotShown foi resetado (não deve reaparecer o pop-up sozinho)", !document.querySelector(".overlay--mascot"));

finish();
