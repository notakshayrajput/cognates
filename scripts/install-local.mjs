import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sample = join(root, 'Test Environment');
const npmCli = process.env.npm_execpath;

if (!npmCli) {
  throw new Error('Run this command through npm: npm run install:local');
}

function npm(args, cwd = root) {
  console.log(`\n> npm ${args.join(' ')}\n`);
  const result = spawnSync(process.execPath, [npmCli, ...args], {
    cwd,
    stdio: 'inherit',
    env: {
      ...process.env,
      NPM_CONFIG_CACHE: join(root, '.npm-cache'),
      NPM_CONFIG_OFFLINE: 'false',
    },
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`npm ${args[0]} failed with exit code ${result.status}`);
  }
}

if (!existsSync(join(root, 'ui', 'node_modules', 'vite'))) {
  npm(['ci', '--prefix', 'ui', '--no-audit', '--no-fund']);
}
npm(['run', 'build']);

if (!existsSync(join(root, 'node_modules', 'express'))) {
  npm(['ci', '--omit=dev', '--no-audit', '--no-fund']);
}
npm(['link']);
npm(['link', 'cognates', '--no-audit', '--no-fund'], sample);

console.log('\nCognates is linked globally and in Test Environment.');
