// ============================================================================
// effects.js — confete, ícones Lordicon (com fallback) e QR Code
// ============================================================================
// Por que um fallback para o Lordicon?
// Os códigos de ícone (`lord-icon src="...json"`) pertencem à conta/catálogo
// Lordicon de quem publica o site — não dá pra "adivinhar" com segurança quais
// IDs existem na conta final do festival. Em vez de arriscar um ícone quebrado
// no evento, cada <lord-icon> aqui tem um "irmão" em CSS puro (abacaxi/foguinho
// desenhados e animados) que assume automaticamente se o Lordicon não carregar
// a tempo. Troque os `src` no objeto ICONS abaixo pelos ícones da sua conta
// Lordicon (lordicon.com → escolha o ícone → copie o link do Lottie/JSON) e a
// animação real do Lordicon passa a ser usada sem nenhuma outra mudança.

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

const LORDICON_READY_TIMEOUT = 1200; // ms — depois disso, assume-se fallback

/**
 * Cria um <lord-icon>; se o custom element não "acender" a tempo (offline,
 * ícone inexistente, CDN bloqueado…), troca por um fallback em CSS puro.
 * @param {"pineapple"|"check"|"fire"|"trophy"} key
 * @param {{trigger?:string, colors?:string, size?:number, className?:string}} opts
 */
export function icon(key, opts = {}) {
  const wrap = document.createElement("span");
  wrap.className = `icon-slot icon-slot--${key} ${opts.className || ""}`.trim();
  const size = opts.size || 48;
  wrap.style.setProperty("--icon-size", `${size}px`);

  const fallback = buildFallback(key);
  wrap.appendChild(fallback);

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
      fallback.style.display = "none";
    };
    const giveUp = () => {
      if (settled) return;
      settled = true;
      el.remove(); // mantém só o fallback visível — nunca deixa um espaço em branco
    };
    el.addEventListener("ready", activate, { once: true });
    el.addEventListener("error", giveUp, { once: true });
    // Sem uma API 100% confirmada para "carregou com sucesso" em toda versão do
    // player, também checamos se algo foi de fato desenhado dentro do shadow DOM
    // (svg/canvas) depois de um tempo — não só se o shadow root existe.
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
  const el = document.createElement("span");
  el.className = `icon-fallback icon-fallback--${key}`;
  el.setAttribute("aria-hidden", "true");
  el.textContent = { pineapple: "🍍", check: "✅", fire: "🔥", trophy: "🏆" }[key] || "🍍";
  return el;
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

// ── QR Code (carregado sob demanda, só quando a tela precisa dele) ────────
let qrLibPromise = null;

function loadQrLib() {
  if (window.QRCode) return Promise.resolve(window.QRCode);
  if (qrLibPromise) return qrLibPromise;
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
