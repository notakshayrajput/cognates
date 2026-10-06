import { spawnSync } from 'node:child_process';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const stage = resolve(root, '.release', 'scoped');
const scopedName = '@akshay-rajput/cognates';
const npmCli = process.env.npm_execpath;

if (!stage.startsWith(`${root}${sep}`)) {
  throw new Error('Scoped release directory must stay inside the repository.');
}
if (!npmCli) throw new Error('Run this script through npm: npm run prepare:scoped');

function npm(args) {
  const result = spawnSync(process.execPath, [npmCli, ...args], {
    cwd: root,
    stdio: 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`npm ${args.join(' ')} failed`);
}

npm(['test']);
npm(['run', 'lint']);
npm(['run', 'typecheck']);
npm(['run', 'build']);

const packageInfo = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
await rm(stage, { recursive: true, force: true });
await mkdir(stage, { recursive: true });

for (const entry of packageInfo.files) {
  const source = resolve(root, entry);
  const destination = resolve(stage, entry);
  if (!source.startsWith(`${root}${sep}`) || !destination.startsWith(`${stage}${sep}`)) {
    throw new Error(`Package file must stay inside its directory: ${entry}`);
  }
  await mkdir(dirname(destination), { recursive: true });
  await cp(source, destination, { recursive: true });
}

const examplePath = join(stage, 'example', 'cognates.config.js');
const example = await readFile(examplePath, 'utf8');
await writeFile(examplePath, example.replaceAll("'cognates'", `'${scopedName}'`));

packageInfo.name = scopedName;
packageInfo.publishConfig = { access: 'public' };
packageInfo.scripts = { prepack: 'node scripts/prepare-package.mjs' };
await writeFile(join(stage, 'package.json'), `${JSON.stringify(packageInfo, null, 2)}\n`);
console.log(`Prepared ${scopedName}@${packageInfo.version} in ${stage}`);
