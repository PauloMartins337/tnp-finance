# Guia de Correção na Vercel

Se você já conectou seu GitHub na Vercel, o "Deploy" (atualização) acontece automaticamente toda vez que eu envio correções (o que acabei de fazer).

**Se a tela continua branca, 99% de chance de ser falta das chaves do Supabase.**

## Como configurar as Chaves (Obrigatório)

1. Acesse o painel do seu projeto na [Vercel](https://vercel.com/dashboard).
2. Vá na aba **Settings** (Configurações) > **Environment Variables**.
3. Adicione as duas chaves que estão no seu arquivo `.env` aqui no VS Code:

   **Chave 1:**
   - **Key:** `VITE_SUPABASE_URL`
   - **Value:** (Copie o valor do seu arquivo .env)

   **Chave 2:**
   - **Key:** `VITE_SUPABASE_ANON_KEY`
   - **Value:** (Copie o valor do seu arquivo .env)

4. Clique em **Save**.

## Importante: Redeploy
Depois de salvar as chaves, elas não funcionam na hora. Você precisa forçar uma atualização:

1. Vá na aba **Deployments**.
2. Clique nos três pontinhos (...) do último deploy.
3. Escolha **Redeploy**.
4. Espere terminar e teste o link novamente.
