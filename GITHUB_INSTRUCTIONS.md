# Como subir seu código para o GitHub

Eu já preparei tudo no seu computador (iniciei o Git e salvei os arquivos). Agora você precisa criar o repositório na sua conta do GitHub e conectar.

## Passo 1: Criar Repositório no GitHub
1. Acesse [github.com/new](https://github.com/new).
2. Nome do repositório: `tnp-finance` (ou outro que preferir).
3. Deixe como **Public** ou **Private**.
4. **NÃO** marque nenhuma opção de "Initialize this repository with..." (README, .gitignore, etc).
5. Clique em **Create repository**.

## Passo 2: Conectar e Enviar
Copie os comandos que aparecerão na tela do GitHub (na seção "...or push an existing repository from the command line") ou use os comandos abaixo (substitua `SEU_USUARIO` pelo seu nome de usuário do GitHub):

```bash
git remote add origin https://github.com/SEU_USUARIO/tnp-finance.git
git branch -M main
git push -u origin main
```

## Passo 3: Publicar na Vercel (Opcional)
Se quiser usar a Vercel em vez do Netlify:
1. Acesse [vercel.com](https://vercel.com).
2. Clique em **Add New...** > **Project**.
3. Importe o repositório `tnp-finance` que você acabou de criar.
4. Nas configurações de **Environment Variables**, adicione:
   - `VITE_SUPABASE_URL`: (sua url do supabase)
   - `VITE_SUPABASE_ANON_KEY`: (sua chave do supabase)
5. Clique em **Deploy**.
