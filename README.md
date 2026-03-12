# DN-Access

Formulário de captação de leads em 2 passos (dados + código de verificação), com gravação no Supabase e opcional integração com API externa.

## Fluxo

1. **Step 1:** Nome, e-mail e telefone → "Avançar" → lead criado no Supabase com `status: pending`.
2. **Step 2:** Código de 8 dígitos → "Avançar" → validação na tabela `validation_codes`; se válido, chamada à API externa (nome, e-mail, telefone, product_id), código marcado como usado e lead atualizado para `status: completed` → tela de sucesso; se inválido ou já usado → modal de erro.

## Pré-requisitos

- Node.js 18+
- Conta [Supabase](https://supabase.com)
- (Opcional) API externa para liberação, com endpoint que aceite `name`, `email`, `phone`, `product_id`

## Setup

1. Clone e instale dependências:

   ```bash
   npm install
   ```

2. Configure as variáveis do Supabase — veja **[Passo a passo: variáveis do Supabase](#passo-a-passo-variáveis-do-supabase)** abaixo.

3. No Supabase, execute o SQL das migrations em ordem: `001_initial.sql` e depois `002_lead_physical_case.sql` (SQL Editor no dashboard ou CLI).

4. (Opcional) Insira códigos de teste em `validation_codes` (ex.: `code = '12345678'`, `product_id = 'prod-xyz'`, `used = false`).

---

## Passo a passo: variáveis do Supabase

Siga na ordem para registrar as variáveis da maneira correta.

### 1. Onde pegar os valores no Supabase

1. Acesse [supabase.com](https://supabase.com) e entre no seu projeto.
2. No menu lateral, clique em **Project Settings** (ícone de engrenagem).
3. Clique em **API** no submenu.
4. Na página você verá:
   - **Project URL** — use como valor de `NEXT_PUBLIC_SUPABASE_URL`.
   - **Project API keys**:
     - **anon public** — use como `NEXT_PUBLIC_SUPABASE_ANON_KEY` (opcional, para uso no cliente).
     - **service_role** — use como `SERVICE_ROLE_KEY` (obrigatório para a API do app; **não exponha no front**).

Copie a **Project URL** e a chave **service_role** (clique em “Reveal” se estiver oculta).

### 2. Onde colocar no seu computador (desenvolvimento)

1. Na **raiz do projeto** (mesma pasta onde está o `package.json`), crie ou edite o arquivo **`.env.local`**.
2. Cole as variáveis **uma por linha**, **sem espaços antes/depois do `=`** e **sem aspas** em volta do valor:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

   Substitua pelos seus valores reais (URL do seu projeto e a chave service_role).

3. **Salve** o arquivo (Cmd+S / Ctrl+S).
4. **Reinicie o servidor** do Next.js:
   - Pare com `Ctrl+C` no terminal onde está rodando `npm run dev`.
   - Rode de novo: `npm run dev`.

O Next.js só lê o `.env.local` ao iniciar; por isso o reinício é necessário.

### 3. Conferindo

- O arquivo deve se chamar exatamente **`.env.local`** (começa com ponto).
- Deve estar na **raiz do projeto**, não dentro de `app/` ou `src/`.
- Não use aspas: `SERVICE_ROLE_KEY=eyJ...` e não `SERVICE_ROLE_KEY="eyJ..."`.
- Não deixe espaço: `SERVICE_ROLE_KEY=eyJ...` e não `SERVICE_ROLE_KEY = eyJ...`.

### 4. Deploy (Vercel, Cloudflare, etc.)

No painel do serviço onde o app está hospedado:

1. Abra **Settings** → **Environment variables** (ou equivalente).
2. Crie cada variável:
   - **Name:** `NEXT_PUBLIC_SUPABASE_URL` → **Value:** a URL do projeto Supabase.
   - **Name:** `SERVICE_ROLE_KEY` → **Value:** a chave service_role.
3. Salve e **refaça o deploy** para as variáveis passarem a valer.

## Desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Build e produção

```bash
npm run build
npm start
```

## Deploy no Cloudflare Pages

- Use o adapter [@cloudflare/next-on-pages](https://github.com/cloudflare/next-on-pages) para fazer o build Next.js compatível com Cloudflare Workers.
- Configure as variáveis de ambiente no dashboard do Cloudflare Pages (Supabase e API externa).

## Estrutura

- `app/page.tsx` – página principal (steps + sucesso + modal de erro)
- `app/api/lead/route.ts` – POST para criar lead
- `app/api/validate-code/route.ts` – POST para validar código e liberar
- `components/` – LeadFormStep1, VerificationStep, SuccessScreen, ErrorModal
- `lib/supabase.ts` – cliente Supabase (service role)
- `types/index.ts` – tipos TypeScript
- `supabase/migrations/001_initial.sql` – schema das tabelas

## Estilo

Layout e formulário seguem o padrão visual do DN-V1 (fundo escuro, gradiente, inputs com borda inferior e linha vermelha no foco, logo Detective Night).
