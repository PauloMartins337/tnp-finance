# Como colocar seu site Online (Deploy)

Como já configuramos o Supabase e geramos a versão final do site, a forma mais rápida de colocar no ar é usando o **Netlify Drop**.

## Passo 1: Localizar a pasta do site
O site pronto para ser publicado está na pasta `dist` dentro do seu projeto.
Caminho: `c:\Users\rober\Desktop\app de controle\dist`

## Passo 2: Publicar
1. Acesse o site: [https://app.netlify.com/drop](https://app.netlify.com/drop)
2. Se pedir login, crie uma conta rápida (pode usar Google/GitHub).
3. **Arraste a pasta `dist`** inteira para a área pontilhada na tela do Netlify.

## Passo 3: Pronto!
- O Netlify vai te dar um link (ex: `random-name.netlify.app`).
- Você pode acessar esse link do seu celular ou enviar para outras pessoas.
- O sistema já está conectado ao seu banco de dados Supabase.

## Opção Alternativa (Vercel)
Se preferir usar a Vercel (recomendado para projetos maiores):
1. Crie um repositório no GitHub e suba seu código.
2. Conecte sua conta do GitHub na Vercel.
3. Importe o projeto.
4. Nas configurações de "Environment Variables", adicione as chaves que estão no seu arquivo `.env`.
