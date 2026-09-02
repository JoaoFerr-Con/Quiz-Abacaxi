# Testes automatizados

Simulam um navegador de verdade (via [jsdom](https://github.com/jsdom/jsdom))
e jogam o quiz do início ao fim, clicando nos mesmos botões que uma pessoa
clicaria — não são testes unitários isolados, são testes de fluxo completo.
Existem porque um bug real ("undefined" aparecendo na tela) passou batido
antes disso existir; a ideia é não depender só de olho humano pra pegar esse
tipo de coisa de novo.

## Rodar

```bash
cd tests
npm install
npm test
```

## O que cada cenário cobre

- **`full_playthrough.mjs`** — login → responde as 15-16 perguntas de uma
  partida inteira → tela de resultado → "jogar novamente". Falha se aparecer
  qualquer `undefined` visível, se faltar alguma alternativa, ou se algum
  erro de JS não tratado acontecer no meio do caminho.
- **`cases/invalid_cpf.mjs`** — CPF com dígito verificador errado não deve
  deixar a pessoa passar da tela de login.
- **`cases/timeout.mjs`** — o que acontece quando o cronômetro de uma
  pergunta chega a zero sem ninguém responder: precisa mostrar a resposta
  certa e **seguir sozinho para a próxima pergunta**, sem exigir clique
  nenhum (esse cenário existe porque esse comportamento já quebrou de
  verdade em produção uma vez).
- **`cases/same_person_twice.mjs`** — o cenário mais importante pra uso em
  quiosque: a MESMA pessoa (mesmo CPF) termina uma partida e tenta jogar nas
  mesmo aparelho de novo — precisa começar do zero, não pode ficar oferecendo
  "continuar" com uma partida antiga já terminada.
- **`cases/mascot_celebration.mjs`** — joga acertando tudo até passar do
  limiar de conquistas, confirma que o pop-up do mascote aparece exatamente
  uma vez, que o botão "Continuar" funciona, e que o efeito visual
  (`theme-glow`) some sozinho numa partida nova.

## Limitações — o que isso NÃO testa

- **Não roda num navegador de verdade** (sem layout, sem CSS aplicado, sem
  clique de mouse real) — é o motor da SPA rodando num DOM simulado. Pega
  bugs de lógica e de renderização de conteúdo, não bugs visuais/de estilo.
- **Não testa o modo Supabase online** (login_or_register, ranking ao vivo,
  retomada entre aparelhos) — os testes rodam sem `js/supabase-config.js`
  preenchido de propósito, então sempre caem no modo local. Isso é
  intencional (evita depender de rede pros testes), mas significa que o
  caminho "com Supabase configurado" ainda depende de teste manual.
- Sempre que adicionar uma tela ou mudar um fluxo importante, vale escrever
  um cenário novo em `cases/` seguindo o padrão dos existentes.
