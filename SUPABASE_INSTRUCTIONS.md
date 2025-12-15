# Configuração do Supabase para TNP CONTROL

O aplicativo foi migrado para usar o Supabase como backend (Banco de Dados e Autenticação). Siga os passos abaixo para configurar:

## 1. Criar Projeto no Supabase
1. Acesse [https://supabase.com](https://supabase.com) e crie uma conta.
2. Crie um novo projeto.
3. Anote a **Project URL** e a **API Key (anon/public)**.

## 2. Configurar Variáveis de Ambiente
1. Na pasta do projeto, crie um arquivo chamado `.env` (copie o `.env.example`).
2. Preencha com suas credenciais:
   ```
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-longa-aqui
   ```

## 3. Criar Tabelas do Banco de Dados
1. No painel do Supabase, vá para **SQL Editor**.
2. Clique em **New Query**.
3. Copie o conteúdo do arquivo `supabase_setup.sql` deste projeto.
4. Cole no editor do Supabase e clique em **Run**.

## 4. Configurar Autenticação
1. No painel do Supabase, vá para **Authentication** > **Providers**.
2. Certifique-se de que **Email** está habilitado.
3. (Opcional) Desabilite "Confirm email" em **Authentication** > **URL Configuration** se quiser login imediato sem verificação de email.

## 5. Rodar o Projeto
1. Reinicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
2. Acesse o app e crie uma nova conta em "Criar conta".

## Observações
- O Chat agora é em tempo real!
- Os dados são salvos na nuvem e podem ser acessados de qualquer dispositivo.
- O sistema usa "Row Level Security" (RLS) para garantir que usuários só vejam dados permitidos (embora neste setup inicial, o chat seja público entre usuários logados e recibos sejam globais para simplificação, conforme script SQL).
