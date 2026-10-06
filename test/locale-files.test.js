import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { checkLocales } from '../lib/check-locales.js';
import { listLocaleFiles, localeFilePath, localeFilePattern } from '../lib/locale-files.js';

test('discovers and checks locale folders using a fixed JSON filename', async (t) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'cognates-folders-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const config = { localeDir: 'src/i18n', localeFilePattern: '{locale}/translation.json', defaultLanguage: 'en' };
  await fs.mkdir(path.join(root, 'src/i18n/en'), { recursive: true });
  await fs.mkdir(path.join(root, 'src/i18n/es'));
  await fs.mkdir(path.join(root, 'src/i18n/unused'));
  await fs.writeFile(localeFilePath(config, 'en', root), JSON.stringify({ hello: 'Hello' }));
  await fs.writeFile(localeFilePath(config, 'es', root), JSON.stringify({ hello: '' }));
  await fs.writeFile(path.join(root, 'src/i18n/unused/other.json'), '{}');

  assert.deepEqual(listLocaleFiles(config, root).map(file => [file.code, file.filePath]), [
    ['en', path.join('en', 'translation.json')],
    ['es', path.join('es', 'translation.json')],
  ]);
  const report = await checkLocales(config, root);
  assert.equal(report.defaultFile, path.join('en', 'translation.json'));
  assert.deepEqual(report.results, [
    { file: path.join('es', 'translation.json'), issues: [{ kind: 'empty', key: 'hello' }] },
  ]);
});

test('rejects unsupported patterns instead of scanning arbitrary paths', () => {
  assert.throws(() => localeFilePattern({ localeFilePattern: '../{locale}.json' }), /localeFilePattern/);
  assert.throws(() => localeFilePath({ localeDir: 'locales' }, '../en'), /Invalid locale code/);
});
