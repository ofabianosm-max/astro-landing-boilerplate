#!/usr/bin/env node
import { execSync } from 'child_process';
import inquirer from 'inquirer';

function run(cmd, opts = {}) {
  try {
    return execSync(cmd, {
      stdio: 'pipe',
      encoding: 'utf-8',
      ...opts,
    }).trim();
  } catch (e) {
    return null;
  }
}

async function main() {
  const args = process.argv.slice(2);
  let repoSlug = null;

  for (const arg of args) {
    if (arg.startsWith('--repo=')) {
      repoSlug = arg.replace('--repo=', '');
    }
  }

  if (!repoSlug) {
    const { slug } = await inquirer.prompt([
      { type: 'input', name: 'slug', message: 'Slug do cliente (repo):' },
    ]);
    repoSlug = slug;
  }

  const owner = run('gh api user --jq .login');
  const fullName = `${owner}/${repoSlug}`;
  const workerName = `cms-oauth-${repoSlug}`;

  console.log(`\n🗑️  Deletando cliente: ${repoSlug}\n`);

  // 1. Deletar repo
  const repoExists = run(`gh repo view ${fullName} --jq .name`, { throw: false });
  if (repoExists) {
    console.log('📦 Deletando repositório GitHub...');
    run(`gh repo delete ${fullName} --yes`);
    console.log('✅ Repo deletado');
  } else {
    console.log('⚠️  Repo não encontrado, pulando');
  }

  // 2. Deletar Worker
  console.log('\n🌤️  Deletando Cloudflare Worker...');
  try {
    run(`wrangler delete cms-oauth-${repoSlug} --force`, { throw: false });
    console.log('✅ Worker deletado');
  } catch {
    console.log('⚠️  Worker não encontrado ou já deletado');
  }

  // 3. Limpar pasta local
  const repoDir = `./repos/${repoSlug}`;
  try {
    const fs = await import('fs');
    if (fs.existsSync(repoDir)) {
      fs.rmSync(repoDir, { recursive: true });
      console.log('\n📁 Pasta local removida');
    }
  } catch {}

  console.log(`
╔══════════════════════════════════════════════════╗
║              ✅ Limpeza concluída!               ║
╠══════════════════════════════════════════════════╣
║ Repo:    ${fullName}          ║
║ Worker:  ${workerName}           ║
╚══════════════════════════════════════════════════╝
`);
}

main().catch(err => {
  console.error('\n❌ Erro:', err.message);
  process.exit(1);
});
