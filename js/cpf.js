// ============================================================================
// cpf.js — máscara de digitação e validação de CPF (dígitos verificadores)
// ============================================================================

/** Aplica a máscara 000.000.000-00 enquanto o usuário digita. */
export function maskCpf(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return digits.replace(/(\d{3})(\d+)/, "$1.$2");
  if (digits.length <= 9) return digits.replace(/(\d{3})(\d{3})(\d+)/, "$1.$2.$3");
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, "$1.$2.$3-$4");
}

/** Valida os dois dígitos verificadores do CPF (mesmo algoritmo da Receita). */
export function isValidCpf(value) {
  const cpf = value.replace(/\D/g, "");
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false; // todos os dígitos iguais

  const digit = (base) => {
    let sum = 0;
    for (let i = 0; i < base.length; i++) {
      sum += parseInt(base[i], 10) * (base.length + 1 - i);
    }
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  const d1 = digit(cpf.slice(0, 9));
  if (d1 !== parseInt(cpf[9], 10)) return false;
  const d2 = digit(cpf.slice(0, 10));
  if (d2 !== parseInt(cpf[10], 10)) return false;

  return true;
}

/** Só os dígitos — chave estável para localStorage/URLs, independente da máscara. */
export function normalizeCpf(value) {
  return value.replace(/\D/g, "");
}
