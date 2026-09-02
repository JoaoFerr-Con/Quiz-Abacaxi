// Utilitários comuns aos testes de caso isolado (cada arquivo em cases/ roda
// num processo `node` próprio — zero módulo compartilhado entre cenários).
import { JSDOM } from "jsdom";

export function setupBrowser() {
  const dom = new JSDOM(
    `<!doctype html><html><body><div id="boot-loader"></div><main id="app"></main></body></html>`,
    { url: "http://localhost/", pretendToBeVisual: true }
  );
  const { window } = dom;
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
  window.QRCode = { toCanvas: async () => {} };
  window.navigator.clipboard = { writeText: async () => {} };

  const errors = [];
  window.addEventListener("error", (e) => errors.push(e.error?.stack || e.message));
  window.onunhandledrejection = (e) => errors.push("unhandledrejection: " + (e.reason?.stack || e.reason));

  global.window = window;
  global.document = window.document;
  Object.defineProperty(global, "navigator", { value: window.navigator, configurable: true });
  global.localStorage = window.localStorage;
  global.customElements = window.customElements;
  global.HTMLElement = window.HTMLElement;
  global.requestAnimationFrame = window.requestAnimationFrame;

  return { window, document: window.document, errors };
}

export const wait = (ms = 30) => new Promise((r) => setTimeout(r, ms));
export function fireInput(el, value) { el.value = value; el.dispatchEvent(new window.Event("input", { bubbles: true })); }
export function fireClick(el) { el.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }
export function fireSubmit(el) { el.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true })); }

let pass = 0, fail = 0;
export function check(label, cond) {
  if (cond) { console.log("  ✓", label); pass++; }
  else { console.log("  ✗ FALHOU:", label); fail++; }
}
export function finish() {
  console.log(`\n${pass} ok, ${fail} falharam.`);
  process.exit(fail > 0 ? 1 : 0);
}
