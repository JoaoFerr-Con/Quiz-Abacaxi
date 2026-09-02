// ============================================================================
// config.js — constantes globais, leitura de token/QR Code e chaves de storage
// ============================================================================
// Nenhum outro módulo deve ler `location.search` ou `localStorage` diretamente:
// tudo passa por aqui, para que a origem dos dados fique num único lugar.

export const APP_NAME = "Quiz do Festival do Abacaxi";
export const APP_EDITION = "44ª edição · Barcarena 2026";

// Fonte de verdade do quiz: festivaldoabacaxi.com/home (identidade visual e contexto).
export const SOURCE_URL = "https://festivaldoabacaxi.com/home";

export const STORAGE = {
  session: "abacaxi.session", // { nome, cpf, token, entryPoint }
  progress: (cpf) => `abacaxi.progress.${cpf}`,
  result: (cpf) => `abacaxi.result.${cpf}`,
};

// Regras de pontuação / gameplay — centralizadas para fácil ajuste.
export const RULES = {
  questionsPerRound: 4, // quantas perguntas sorteadas de cada rodada por partida (rotação/diversidade)
  mascotThreshold: 7, // a partir de quantos acertos o mascote aparece pra comemorar ("mais de 6")
  secondsPerQuestion: 25,
  basePoints: 100,
  speedBonusThreshold: 15, // segundos restantes para ganhar bônus de velocidade
  speedBonus: 30,
  streakStartsAt: 2, // a partir de quantos acertos seguidos o "foguinho" acende
  streakMultiplier: 0.5, // % extra de XP por streak ativo
};

/**
 * Sistema de entrada por QR Code / token.
 * O QR impresso no evento aponta para algo como:
 *   https://seu-dominio.vercel.app/?t=TENDA-CENTRAL
 * O token não é uma senha: ele identifica a ORIGEM do acesso (qual tenda,
 * totem ou convite trouxe a pessoa até aqui), para relatórios e para pular
 * a tela de boas-vindas indo direto ao cadastro.
 */
export function readEntryToken() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("t") || params.get("token") || "";
  if (!token) return null;

  // Formato esperado: letras/números/hífen, 3–24 caracteres.
  const isValid = /^[A-Za-z0-9-]{3,24}$/.test(token);
  return {
    raw: token,
    valid: isValid,
    label: isValid ? token.toUpperCase() : null,
  };
}

/** Gera o link (com token) que alimenta o QR Code impresso/exibido no evento. */
export function buildEntryUrl(token) {
  const url = new URL(window.location.origin + window.location.pathname);
  if (token) url.searchParams.set("t", token);
  return url.toString();
}
