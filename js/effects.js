// ============================================================================
// effects.js — confete, ícones (SVG local + Lordicon opcional) e QR Code
// ============================================================================
// Estratégia de ícones, em ordem de prioridade:
//   1) SVG local em assets/icons/ — sempre funciona, inclusive sem internet
//      (é o que vai valer no dia do evento, se não houver rede no local).
//   2) Lordicon (CDN) — só entra como CAMADA A MAIS, por cima do SVG, se
//      a internet estiver disponível e o ícone carregar a tempo. Troque os
//      `src` no objeto ICONS pelos ícones da sua conta lordicon.com se quiser
//      essa animação extra; sem internet, ninguém percebe a ausência dele.

export const ICON_ASSETS = {
  pineapple: "assets/icons/pineapple.svg",
  check: "assets/icons/check.svg",
  fire: "assets/icons/fire.svg",
  trophy: "assets/icons/trophy.svg",
};

export const ICONS = {
  // Ícone de carregamento / abacaxi de destaque (tela de login).
  pineapple: "https://cdn.lordicon.com/lbjtvqiv.json",
  // Selo de acerto / confirmação (feedback de resposta certa).
  check: "https://cdn.lordicon.com/lbjtvqiv.json",
  // Chama do streak (2+ acertos seguidos).
  fire: "https://cdn.lordicon.com/rmkpgtpt.json",
  // Troféu da tela de resultado.
  trophy: "https://cdn.lordicon.com/lewtedlh.json",
};

const LORDICON_READY_TIMEOUT = 1200; // ms — depois disso, fica só no SVG local

/**
 * Cria o ícone: SVG local sempre visível de imediato; se o Lordicon
 * (opcional, via CDN) carregar a tempo, ele assume por cima com a animação.
 * @param {"pineapple"|"check"|"fire"|"trophy"} key
 * @param {{trigger?:string, colors?:string, size?:number, className?:string}} opts
 */
export function icon(key, opts = {}) {
  const wrap = document.createElement("span");
  wrap.className = `icon-slot icon-slot--${key} ${opts.className || ""}`.trim();
  const size = opts.size || 48;
  wrap.style.setProperty("--icon-size", `${size}px`);

  const localSvg = buildFallback(key);
  wrap.appendChild(localSvg);

  if (customElements.get("lord-icon") && ICONS[key]) {
    const el = document.createElement("lord-icon");
    el.setAttribute("src", ICONS[key]);
    el.setAttribute("trigger", opts.trigger || "loop");
    if (opts.colors) el.setAttribute("colors", opts.colors);
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.display = "none";

    let settled = false;
    const activate = () => {
      if (settled) return;
      settled = true;
      el.style.display = "block";
      localSvg.style.display = "none";
    };
    const giveUp = () => {
      if (settled) return;
      settled = true;
      el.remove(); // fica só o SVG local — nunca um espaço em branco
    };
    el.addEventListener("ready", activate, { once: true });
    el.addEventListener("error", giveUp, { once: true });
    setTimeout(() => {
      if (settled) return;
      const painted = el.shadowRoot?.querySelector("svg, canvas");
      painted ? activate() : giveUp();
    }, LORDICON_READY_TIMEOUT);

    wrap.appendChild(el);
  }

  return wrap;
}

function buildFallback(key) {
  const img = document.createElement("img");
  img.className = `icon-fallback icon-fallback--${key}`;
  img.src = ICON_ASSETS[key] || ICON_ASSETS.pineapple;
  img.alt = "";
  img.setAttribute("aria-hidden", "true");
  img.width = 48;
  img.height = 48;
  return img;
}

/** Ativa/desativa a "onda de fogo" de streak em qualquer container. */
export function setStreakActive(container, active) {
  container.classList.toggle("is-streaking", active);
}

// ── Confete (canvas leve, sem dependências) ────────────────────────────────
let canvas, ctx, particles = [], raf = null;
const COLORS = ["#FFC94A", "#FF9F1C", "#2FBF71", "#FF5D73", "#3BC8E8", "#FFF6E4"];

function ensureCanvas() {
  if (canvas) return;
  canvas = document.createElement("canvas");
  canvas.className = "confetti-canvas";
  document.body.appendChild(canvas);
  ctx = canvas.getContext("2d");
  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener("resize", resize);
}

export function burstConfetti(x, y, count = 40) {
  ensureCanvas();
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 3 + Math.random() * 7;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 4,
      size: 4 + Math.random() * 6,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      rot: Math.random() * 360,
      rotV: (Math.random() - 0.5) * 12,
      life: 1,
    });
  }
  if (!raf) raf = requestAnimationFrame(tick);
}

function tick() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles = particles.filter((p) => p.life > 0.02);
  for (const p of particles) {
    p.x += p.vx; p.y += p.vy; p.vy += 0.28; p.vx *= 0.99;
    p.life -= 0.02; p.rot += p.rotV;
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rot * Math.PI) / 180);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    ctx.restore();
  }
  if (particles.length) raf = requestAnimationFrame(tick);
  else { raf = null; ctx.clearRect(0, 0, canvas.width, canvas.height); }
}

// ── QR Code (vendorizado localmente em assets/qrcode.min.js — ver index.html;
// funciona sem internet, o que é essencial pro ticket final no evento) ─────
let qrLibPromise = null;

function loadQrLib() {
  if (window.QRCode) return Promise.resolve(window.QRCode); // caminho normal: já carregado local
  if (qrLibPromise) return qrLibPromise;
  // Só chega aqui se o <script src="assets/qrcode.min.js"> do index.html
  // não tiver carregado por algum motivo — tenta o CDN como último recurso
  // (isso SIM depende de internet).
  qrLibPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js";
    script.onload = () => resolve(window.QRCode);
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return qrLibPromise;
}

/** Desenha um QR Code num <canvas> já existente; devolve true/false (sucesso). */
export async function renderQrCode(canvasEl, text) {
  try {
    const QRCode = await loadQrLib();
    await QRCode.toCanvas(canvasEl, text, {
      width: canvasEl.width || 180,
      margin: 1,
      color: { dark: "#150C29", light: "#FFF6E4" },
    });
    return true;
  } catch {
    return false;
  }
}
