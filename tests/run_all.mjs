// ============================================================================
// run_all.mjs — roda todos os cenários, cada um em processo Node isolado
// ============================================================================
// Por que processo separado por cenário, e não tudo num "test runner" comum?
// Porque este app guarda estado num módulo singleton (js/state.js) — rodar
// dois cenários no mesmo processo Node faz o segundo herdar o estado do
// primeiro (o Node cacheia módulos por padrão), o que gera falsos
// positivos/negativos. Um processo por cenário = exatamente como uma pessoa
// nova abrindo a página do zero.

import { spawnSync } from "child_process";
import { readdirSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const here = path.dirname(fileURLToPath(import.meta.url));
const files = [
  path.join(here, "full_playthrough.mjs"),
  ...readdirSync(path.join(here, "cases"))
    .filter((f) => f.endsWith(".mjs"))
    .map((f) => path.join(here, "cases", f)),
];

let failed = 0;
for (const f of files) {
  console.log("\n══════════════════════════════════════════════════════");
  console.log("▶", path.relative(here, f));
  const res = spawnSync(process.execPath, [f], { stdio: "inherit" });
  if (res.status !== 0) failed++;
}

console.log("\n══════════════════════════════════════════════════════");
if (failed) {
  console.log(`❌ ${failed} cenário(s) falharam.`);
  process.exit(1);
} else {
  console.log("✅ Todos os cenários passaram.");
}
