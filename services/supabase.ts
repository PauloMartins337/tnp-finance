import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERRO CRÍTICO: Chaves do Supabase não encontradas. Verifique o arquivo .env ou as Variáveis de Ambiente na Vercel.');
}

// Usamos valores temporários se as chaves não existirem, para o app não travar na tela branca (crash)
// Assim o usuário consegue ver a tela e o erro no console, em vez de nada.
export const supabase = createClient(
  supabaseUrl || 'https://setup-needed.supabase.co',
  supabaseAnonKey || 'setup-needed'
);

export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;
