#!/usr/bin/env node
import inquirer from 'inquirer';
import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── DADOS FICTÍCIOS ──────────────────────────────────────────────────────────

const NICHES = [
  { slug: 'clinica', name: 'Clínica', businessSuffix: 'Odontológica' },
  { slug: 'advocacia', name: 'Advocacia', businessSuffix: 'e Consultoria Jurídica' },
  { slug: 'estetica', name: 'Studio', businessSuffix: 'de Estética' },
  { slug: 'restaurante', name: 'Restaurante', businessSuffix: '' },
  { slug: 'educacao', name: 'Instituto', businessSuffix: 'de Ensino' },
  { slug: 'servicos', name: 'Serviços', businessSuffix: 'Especializados' },
];

const FIRST_NAMES = [
  'Ana', 'Carlos', 'Fernanda', 'Ricardo', 'Mariana',
  'Paulo', 'Juliana', 'Roberto', 'Camila', 'Diego'
];

const LAST_NAMES = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Lima',
  'Costa', 'Pereira', 'Ferreira', 'Alves', 'Gomes'
];

const CITIES = [
  { name: 'Porto Alegre', slug: 'porto-alegre', state: 'RS' },
  { name: 'Caxias do Sul', slug: 'caxias-do-sul', state: 'RS' },
  { name: 'Bento Gonçalves', slug: 'bento-goncalves', state: 'RS' },
  { name: 'Florianópolis', slug: 'florianopolis', state: 'SC' },
  { name: 'Curitiba', slug: 'curitiba', state: 'PR' },
  { name: 'São Paulo', slug: 'sao-paulo', state: 'SP' },
  { name: 'Belo Horizonte', slug: 'belo-horizonte', state: 'MG' },
];

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateFakeClient() {
  const niche    = rand(NICHES);
  const fname    = rand(FIRST_NAMES);
  const lname    = rand(LAST_NAMES);
  const city     = rand(CITIES);
  const id       = Math.random().toString(36).slice(2, 6);

  const businessName =
    `${niche.name} ${lname} ${niche.businessSuffix}`.trim();

  const repoSlug =
    `${niche.slug}-${lname.toLowerCase()}-${city.slug}-${id}`;

  const cfDomain = `${repoSlug}.pages.dev`;

  return {
    slug:         repoSlug,
    clientName:   businessName,
    domain:       cfDomain,
    clientEmail:  `teste+${id}@seudominio.com.br`,
    niche:        niche.slug,
    city:         city.name,
    state:        city.state,
    repoName:     repoSlug,
    isFake:       true,
    isCfPages:    true,
  };
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function run(cmd, opts = {}) {
  const env = opts.env || process.env;
  try {
    return execSync(cmd, {
      stdio: 'pipe',
      encoding: 'utf-8',
      env: { ...process.env, ...opts.env },
      ...opts,
    }).trim();
  } catch (e) {
    if (opts.throw !== false) throw e;
    return e.stdout?.trim() || e.stderr?.trim() || '';
  }
}

function loadEnv() {
  const envPath = join(__dirname, '..', '.env');
  if (!existsSync(envPath)) return {};
  const content = readFileSync(envPath, 'utf-8');
  const env = {};
  content.split('\n').forEach(line => {
    const [key, ...vals] = line.split('=');
    if (key && vals.length) env[key.trim()] = vals.join('=').trim();
  });
  return env;
}

// ─── ETAPA 1 — Criar Repo ─────────────────────────────────────────────────────

async function createRepo(slug, owner) {
  console.log('\n📦 ETAPA 1 — Criando repositório GitHub...');

  const fullName = `${owner}/${slug}`;
  const repoDir = join(__dirname, '..', 'repos', slug);

  // Verificar se já existe no GitHub
  let exists = false;
  try {
    const result = run(`gh repo view ${fullName} --jq .name`, { throw: true, stdio: 'pipe' });
    exists = (result === slug);
  } catch {
    exists = false;
  }

  if (exists) {
    console.log(`⚠️  Repo ${fullName} já existe.`);

    // Clone se não existir localmente
    if (!existsSync(repoDir)) {
      console.log(`📥 Clonando repo...`);
      const cloneCmd = process.platform === 'win32'
        ? `git clone "https://github.com/${fullName}.git" "${repoDir}"`
        : `git clone https://github.com/${fullName}.git ${repoDir}`;
      run(cloneCmd);
    }
    return fullName;
  }

  // Não existe, criar
  run(`gh repo create ${slug} --public --clone`);
  console.log(`✅ Repo criado: ${fullName}`);
  return fullName;
}

// ─── ETAPA 2 — OAuth App ──────────────────────────────────────────────────────

async function createOAuthApp(mode, data) {
  console.log('\n🔐 ETAPA 2 — Configurando OAuth App...');

  if (mode === 'fake') {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error(`
⚠️  Configure GITHUB_CLIENT_ID e GITHUB_CLIENT_SECRET no .env
    do boilerplate para usar o modo fictício.
`);
      process.exit(1);
    }

    data.oauthApp = {
      clientId,
      clientSecret,
    };
    console.log(`✅ Usando OAuth App do .env`);
    return;
  }

  // Modo real — criar GitHub App
  const appName = `cms-${data.slug}`;

  // Verificar se já existe
  let existingId;
  try {
    existingId = run(`gh api apps/{client_id} --jq .client_id 2>/dev/null || echo ""`, { throw: false });
  } catch {
    existingId = '';
  }

  if (existingId) {
    console.log(`⚠️  GitHub App ${appName} já existe.`);
    data.oauthApp = { clientId: existingId };
    return;
  }

  const result = run(`gh api graphql -f query='
    mutation {
      createApp(input: {
        name: "${appName}",
        homepageUrl: "https://example.com",
        callbackUrl: "https://example.com/callback",
        requestSignatures: false,
        webhookActive: false
      }) {
        app {
          clientId
          clientSecret
        }
      }
    }
  ' --jq '.data.createApp.app'`);

  const { clientId, clientSecret } = JSON.parse(result);
  data.oauthApp = { clientId, clientSecret };
  console.log(`✅ GitHub App criado: ${appName}`);
}

// ─── ETAPA 3 — Worker ─────────────────────────────────────────────────────────

async function deployWorker(mode, data) {
  console.log('\n🌤️  ETAPA 3 — Deploying Cloudflare Worker...');

  const workerName = `cms-oauth-${data.slug}`;
  const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;

  if (!cfAccountId) {
    console.error('⚠️  CLOUDFLARE_ACCOUNT_ID não configurado no .env');
    process.exit(1);
  }

  try {
    // Pass env vars properly for Windows compatibility
    const env = { ...process.env, CLOUDFLARE_ACCOUNT_ID: cfAccountId };
    run(`wrangler deploy cloudflare-oauth-worker.js --name ${workerName}`, { env });
  } catch (e) {
    console.log('⚠️  Worker deploy falhou (wrangler não está configurado ou credenciais inválidas)');
    console.log('   Você pode deployar manualmente após criar o OAuth App');
    data.workerUrl = `https://cms-oauth-${data.slug}.workers.dev`;
    console.log(`✅ Worker URL: ${data.workerUrl}`);
    return;
  }

  data.workerUrl = `https://${workerName}.workers.dev`;
  console.log(`✅ Worker deployado: ${data.workerUrl}`);
}

// ─── ETAPA 4 — Setup CMS ─────────────────────────────────────────────────────

async function setupCMS(mode, data) {
  console.log('\n⚙️  ETAPA 4 — Configurando CMS...');

  const repoSlug = data.slug;
  const owner = process.env.GH_OWNER || run('gh api user --jq .login');

  // Atualizar config.yml com placeholders substituídos
  const configPath = join(__dirname, '..', 'public', 'admin', 'config.yml');
  let config = readFileSync(configPath, 'utf-8');

  config = config
    .replace(/GITHUB_OWNER/g, owner)
    .replace(/GITHUB_REPO/g, repoSlug)
    .replace(/SLUG_CLIENTE/g, repoSlug)
    .replace(/OAUTH_WORKER_URL/g, data.workerUrl);

  // Commit no repo
  const repoDir = join(__dirname, '..', 'repos', repoSlug);
  if (!existsSync(dirname(repoDir))) mkdirSync(dirname(repoDir), { recursive: true });

  if (!existsSync(repoDir)) {
    try {
      const cloneCmd = process.platform === 'win32'
        ? `git clone "https://github.com/${owner}/${repoSlug}.git" "${repoDir}"`
        : `git clone https://github.com/${owner}/${repoSlug}.git ${repoDir}`;
      run(cloneCmd);
    } catch {
      console.log('⚠️  Não foi possível clonar o repo. Faça manualmente:');
      console.log(`   git clone https://github.com/${owner}/${repoSlug}.git`);
      console.log('   E depois configure o config.yml manualmente');
      return;
    }
  }

  // Ensure directory exists
  if (!existsSync(join(repoDir, 'public', 'admin'))) {
    mkdirSync(join(repoDir, 'public', 'admin'), { recursive: true });
  }

  writeFileSync(join(repoDir, 'public', 'admin', 'config.yml'), config);

  try {
    const pushCmd = process.platform === 'win32'
      ? `cd "${repoDir}" && git add . && git commit -m "feat: configurar Decap CMS" && git push origin main`
      : `cd ${repoDir} && git add . && git commit -m "feat: configurar Decap CMS" && git push origin main`;
    run(pushCmd);
  } catch {
    console.log('⚠️  Não foi possível fazer commit. Faça manualmente no repo.');
  }

  console.log(`✅ CMS configurado em ${data.domain}/admin`);
}

// ─── ETAPA 5 — Zero Trust (só modo real) ────────────────────────────────────

async function setupZeroTrust(mode, data) {
  if (mode === 'fake') {
    console.log('\n⚠️  Modo teste: Zero Trust não configurado.');
    console.log('   O /admin ficará acessível sem autenticação.');
    console.log('   NÃO usar em produção.');
    return;
  }

  console.log('\n🔒 ETAPA 5 — Configurando Cloudflare Zero Trust...');
  console.log('   (Precisa de domínio customizado)');
  // Implementar se necessário
}

// ─── RESUMO ──────────────────────────────────────────────────────────────────

function showSummary(mode, data) {
  if (mode === 'fake') {
    console.log(`
╔══════════════════════════════════════════════════╗
║     🎲 Cliente fictício ativado para teste!      ║
╠══════════════════════════════════════════════════╣
║ Nome:    ${data.clientName}
║ Nicho:   ${data.niche}
║ Cidade:  ${data.city}, ${data.state}
║ Admin:   https://${data.domain}/admin
║ Repo:    github.com/${process.env.GH_OWNER || 'owner'}/${data.repoName}
║ Worker:  ${data.workerUrl}
╠══════════════════════════════════════════════════╣
║  Para testar:                                    ║
║  1. Aguarde o deploy no Cloudflare Pages (~2min) ║
║  2. Acesse: https://${data.domain}/admin            ║
║  3. Faça login com GitHub                        ║
║  4. Edite qualquer conteúdo e publique           ║
║  5. Verifique o site em: https://${data.domain}   ║
╠══════════════════════════════════════════════════╣
║  Para deletar após o teste:                      ║
║  pnpm delete-client --repo=${data.repoName}           ║
╚══════════════════════════════════════════════════╝
`);
  } else {
    console.log(`
╔══════════════════════════════════════════════════╗
║          ✅ Cliente ativado com sucesso!         ║
╠══════════════════════════════════════════════════╣
║ Nome:    ${data.clientName}
║ Domínio: https://${data.domain}
║ Admin:   https://${data.domain}/admin
║ Repo:    github.com/${process.env.GH_OWNER || 'owner'}/${data.repoName}
║ Worker:  ${data.workerUrl}
╚══════════════════════════════════════════════════╝
`);
  }
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 Ativação de cliente — Boilerplate Astro Landing\n');

  const { mode } = await inquirer.prompt([{
    type: 'list',
    name: 'mode',
    message: 'Qual modo de ativação?',
    choices: [
      { name: '🚀 Cliente real', value: 'real' },
      { name: '🎲 Cliente fictício (teste rápido)', value: 'fake' },
    ],
  }]);

  let data;

  if (mode === 'fake') {
    data = generateFakeClient();
    console.log(`\n🎲 Gerando cliente fictício: ${data.clientName}`);
  } else {
    const { clientName, domain, niche, city, state } = await inquirer.prompt([
      { type: 'input', name: 'clientName', message: 'Nome do cliente:' },
      { type: 'input', name: 'domain', message: 'Domínio (ex: cliente.com.br):' },
      { type: 'list', name: 'niche', message: 'Nicho:', choices: NICHES.map(n => n.slug) },
      { type: 'input', name: 'city', message: 'Cidade:' },
      { type: 'input', name: 'state', message: 'Estado (sigla):' },
    ]);

    const nicheObj = NICHES.find(n => n.slug === niche);
    data = {
      clientName,
      domain,
      niche,
      city,
      state,
      slug: domain.replace('.pages.dev', '').replace(/[^a-z0-9-]/g, '-'),
      isFake: false,
    };
  }

  // Carregar .env se existir
  const env = loadEnv();
  Object.assign(process.env, env);

  const owner = process.env.GH_OWNER || run('gh api user --jq .login');

  await createRepo(data.slug, owner);
  await createOAuthApp(mode, data);
  await deployWorker(mode, data);
  await setupCMS(mode, data);
  await setupZeroTrust(mode, data);
  showSummary(mode, data);
}

main().catch(err => {
  console.error('\n❌ Erro:', err.message);
  process.exit(1);
});
