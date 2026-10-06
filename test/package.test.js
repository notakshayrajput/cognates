import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { createRequire } from 'node:module';
import { defineConfig as defineEsmConfig } from '../index.js';
import { generateType, getConfigAsync } from '../lib/util.js';

const require = createRequire(import.meta.url);
const { defineConfig: defineCjsConfig } = require('../index.cjs');

test('ESM and CommonJS exports share configuration defaults', () => {
  assert.deepEqual(defineEsmConfig(), defineCjsConfig());
  assert.equal(defineCjsConfig({ port: 3000 }).port, 3000);
});

test('CommonJS config loads and generates a valid locale shape', async (t) => {
  const originalCwd = process.cwd();
  const projectRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'cognates-package-'));
  t.after(async () => {
    process.chdir(originalCwd);
    await fs.rm(projectRoot, { recursive: true, force: true });
  });
  await fs.writeFile(path.join(projectRoot, 'package.json'), '{"type":"commonjs"}');
  await fs.writeFile(path.join(projectRoot, 'cognates.config.js'),
    "module.exports = { defaultLanguage: 'en', localeDir: 'cognates/' };\n");
  await fs.mkdir(path.join(projectRoot, 'cognates'));
  await fs.writeFile(path.join(projectRoot, 'cognates', 'en.json'),
    JSON.stringify({ 'welcome-message': 'Hello', months: ['Jan', 'Feb'] }));

  process.chdir(projectRoot);
  assert.equal((await getConfigAsync()).defaultLanguage, 'en');
  await generateType();
  const output = await fs.readFile(path.join(projectRoot, 'cognates', 'locale.ts'), 'utf8');
  assert.match(output, /"welcome-message": string;/);
  assert.match(output, /"months": \(string\)\[\];/);
});
