# Ativação do Decap CMS para Cliente

Este documento explica como ativar o painel de edição Decap CMS para um novo cliente.

---

## Pré-requisitos

1. Repositório do cliente criado a partir do template
2. Acesso à Cloudflare (conta gratuita basta)
3. GitHub App criada com permissões de repositório

---

## Passo 1: Criar o Worker OAuth na Cloudflare

### 1.1. Criar projeto Workers

1. Acesse [dash.cloudflare.com](https://dash.cloudflare.com)
2. Vá em **Workers & Pages** → **Create application** → **Create Worker**
3. Dê um nome como `cms-oauth-cliente-NOME`
4. Cole o conteúdo do arquivo `cloudflare-oauth-worker.js`
5. Clique em **Deploy**

### 1.2. Configurar variáveis de ambiente

No painel do Worker, vá em **Settings** → **Variables**:

| Variável | Valor |
|----------|-------|
| `GITHUB_CLIENT_ID` | ID do GitHub App |
| `GITHUB_CLIENT_SECRET` | Secret do GitHub App |
| `SITE_DOMAIN` | Domínio do site do cliente |

### 1.3. Obter o URL do Worker

Após o deploy, o URL será algo como:
`https://cms-oauth-cliente-NOME.workers.dev`

Guarde este URL para o próximo passo.

---

## Passo 2: Configurar o Decap CMS

Edite o arquivo `public/admin/config.yml` no repositório do cliente:

```yaml
backend:
  name: github
  repo: USUARIO_GITHUB/NOME_DO_REPO
  branch: main
  base_url: https://cms-oauth-cliente-NOME.workers.dev  # <- URL do Worker
```

Substitua também `SLUG_CLIENTE` pelo slug real do cliente.

---

## Passo 3: Configurar o GitHub App

### 3.1. Criar GitHub App

1. Acesse **Settings** → **Developer settings** → **GitHub Apps** → **New GitHub App**
2. Preencha:
   - **GitHub App name**: `cms-cliente-NOME`
   - **Homepage URL**: URL do site do cliente
   - **Callback URL**: `https://cms-oauth-cliente-NOME.workers.dev/callback`
   - **Webhook**: desmarque "Active"

### 3.2. Permissões (Permissions)

Em **Permissions**, configure:

| Permissão | Nível |
|-----------|-------|
| Contents | Read and write |
| Metadata | Read-only |

### 3.3. Instalar o App

1. Instale o App no repositório do cliente
2. Anote o **Client ID** e gere um **Client Secret**

---

## Passo 4: Testar o Acesso

1. Acesse `https://seudominio.com/admin/`
2. Clique em "Login with GitHub"
3. Autorize o acesso
4. O painel do CMS deve carregar com todas as seções

---

## Estrutura do CMS

O painel inclui as seguintes coleções:

| Seção | Arquivo | Descrição |
|-------|---------|-----------|
| Informações do Site | `src/config/SLUG.ts` | NAP, endereço, horários |
| Hero | `hero.json` | Título, subtítulo, imagem principal |
| Serviços | `services.json` | Lista de serviços com preços |
| Diferenciais | `benefits.json` | Lista de diferenciais |
| Depoimentos | `testimonials.json` | Avaliações de clientes |
| FAQ | `faq.json` | Perguntas e respostas |
| Sobre | `about.json` | Texto sobre a empresa |
| Contato | `contact.json` | Configurações do formulário |

---

## Solução de Problemas

### "Login Failed - Cannot refresh access token"

Significa que o Worker não está conseguindo comunicar com o GitHub. Verifique:
- `GITHUB_CLIENT_ID` está correto
- `GITHUB_CLIENT_SECRET` está correto
- O App está instalado no repositório

### "Could not fetch latest content"

Verifique se o `base_url` no config.yml está apontando para o URL correto do Worker (incluindo `/callback` no final do callback URL).

### Página em branco no /admin

Abra o DevTools (F12) → Console para ver erros. Geralmente é problema no `config.yml` mal formatado.

---

## Arquivos do Template

```
├── public/
│   └── admin/
│       ├── index.html      # Página do CMS
│       └── config.yml     # Configuração das coleções
├── cloudflare-oauth-worker.js  # Worker OAuth (deployar na Cloudflare)
└── docs/
    └── cms-ativacao-cliente.md  # Este arquivo
```
