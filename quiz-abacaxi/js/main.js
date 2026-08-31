// ============================================================================
// main.js — bootstrap da aplicação
// ============================================================================
import { readEntryToken } from "./config.js";
import { startRouter } from "./router.js";

const entry = readEntryToken(); // vem do ?t= / ?token= da URL (QR Code)
const root = document.getElementById("app");

startRouter(root, { entry });

// Loading screen (index.html) sai de cena assim que o primeiro mount ocorre.
document.getElementById("boot-loader")?.remove();
