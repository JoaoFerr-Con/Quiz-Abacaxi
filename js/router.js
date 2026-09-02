// ============================================================================
// router.js — troca de telas dentro da SPA (sem reload de página)
// ============================================================================
import { state, subscribe } from "./state.js";
import * as Login from "./screens/login.js";
import * as Quiz from "./screens/quiz.js";
import * as Result from "./screens/result.js";

const SCREENS = { login: Login, quiz: Quiz, result: Result };

export function startRouter(root, initialProps) {
  let currentScreen = null;
  let cleanup = null;

  const render = () => {
    if (state.screen === currentScreen) return; // só remonta em troca de tela
    cleanup?.();
    currentScreen = state.screen;
    const screenModule = SCREENS[currentScreen];
    cleanup = screenModule.mount(root, currentScreen === "login" ? initialProps : undefined) || null;
    root.dataset.screen = currentScreen;
  };

  subscribe(render);
  render();
}
