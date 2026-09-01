// ============================================================================
// supabase-config.js — credenciais do projeto (Project Settings → API)
// ============================================================================
// A "anon key" é pública por design (vai para o navegador de qualquer
// pessoa) — não é um segredo a proteger. A segurança de verdade está nas
// RPCs + RLS definidas em supabase/schema.sql. Ainda assim, use a anon key
// (nunca a service_role key) aqui.
//
// Enquanto os valores abaixo não forem preenchidos, o app inteiro continua
// funcionando 100% localmente (localStorage + banco de perguntas embutido em
// js/questions.js) — ver o fallback em js/supabase.js.

export const SUPABASE_URL = "https://SEU-PROJETO.supabase.co";
export const SUPABASE_ANON_KEY = "SUA_ANON_KEY_AQUI";
