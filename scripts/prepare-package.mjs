import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const npmCli = process.env.npm_execpath;
const uiIndex = join(root, 'ui', 'dist', 'index.html');

// A published tarball contains the built UI, but not the UI's build workspace.
if (!existsSync(join(root, 'ui', 'package.json'))) {
  if (!existsSync(uiIndex)) throw new Error('Cognates UI build is missing');
  process.exit(0);
}

if (!npmCli) {
  throw new Error('Run npm pack or npm publish through npm.');
}

function npm(args) {
  const result = spawnSync(process.execPath, [npmCli, ...args], {
    cwd: root,
    stdio: 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`npm ${args.join(' ')} failed`);
}

if (!existsSync(join(root, 'ui', 'node_modules', 'vite'))) {
  npm(['ci', '--prefix', 'ui', '--no-audit', '--no-fund']);
}
npm(['run', 'build']);

if (!existsSync(uiIndex)) {
  throw new Error('UI build did not produce ui/dist/index.html');
}
