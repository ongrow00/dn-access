# Deploy: GitHub + Cloudflare Pages

## 1. Criar repositório no GitHub

1. Acesse [github.com/new](https://github.com/new).
2. **Repository name:** `DN-Access` (ou outro nome).
3. Deixe **Private** ou **Public** como preferir.
4. **Não** marque "Add a README" (o projeto já tem um).
5. Clique em **Create repository**.

## 2. Conectar este projeto ao repositório e enviar o código

No terminal, na pasta do projeto (`DN-Access`), rode:

```bash
git remote add origin https://github.com/ongrow00/dn-access.git
git branch -M main
git push -u origin main
```

*(Repositório já configurado: [ongrow00/dn-access](https://github.com/ongrow00/dn-access))*

Se o GitHub pedir autenticação, use um **Personal Access Token** (Settings → Developer settings → Personal access tokens) em vez da senha.

---

## 3. Conectar o repositório ao Cloudflare Pages

1. Acesse o [Dashboard do Cloudflare](https://dash.cloudflare.com).
2. No menu lateral: **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Autorize o Cloudflare no GitHub (se pedir) e escolha o repositório **DN-Access**.
4. Configure o build:
   - **Project name:** `dn-access` (ou o que quiser).
   - **Production branch:** `main`.
   - **Framework preset:** `Next.js (Static HTML Export)` ou `Next.js`.
   - **Build command:** `npm run build`
   - **Build output directory:** `out` (se usar Static Export) ou deixe o padrão que o Cloudflare sugerir para Next.js.

### Next.js no Cloudflare Pages

- Se o projeto usar **apenas páginas estáticas**, você pode usar **Static HTML Export**:
  - No `next.config.js` adicione: `output: 'export'`
  - Build output directory: `out`
- Se precisar de **SSR/API routes**, use o preset **Next.js** do Cloudflare (ele usa `@cloudflare/next-on-pages`). O Build output directory costuma ser algo como `.vercel/output/static` ou o valor que o painel indicar.

5. Em **Environment variables**, adicione as variáveis de produção (as mesmas do `.env.local`, mas **sem** commitar):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Outras que a aplicação precisar.

6. Clique em **Save and Deploy**.

O Cloudflare vai fazer o primeiro build. Depois disso, cada `git push` na branch `main` dispara um novo deploy automaticamente.

---

## Resumo

| Onde              | O que fazer |
|-------------------|-------------|
| **GitHub**        | Repositório criado, código enviado com `git push`. |
| **Cloudflare**    | Projeto Pages criado, conectado ao repo, build e variáveis de ambiente configurados. |
| **Próximos deploys** | Só dar `git push origin main` e o Cloudflare publica sozinho. |
