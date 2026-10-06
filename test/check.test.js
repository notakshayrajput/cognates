import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { compareLocales, checkLocales } from '../lib/check-locales.js';

test('finds nested missing, empty, extra, type, and placeholder issues', () => {
  const issues = compareLocales(
    { page: { title: 'Hi {name}', count: '{0} items', note: 'Text', section: { label: 'Label' } } },
    { page: { title: 'Salut {user}', count: '  ', section: 'wrong', unused: 'Extra' } },
  );
  assert.deepEqual(issues, [
    { kind: 'placeholders', key: 'page.title', detail: 'missing {name}; unexpected {user}' },
    { kind: 'empty', key: 'page.count' },
    { kind: 'missing', key: 'page.note' },
    { kind: 'type', key: 'page.section', detail: 'expected an object' },
    { kind: 'extra', key: 'page.unused' },
  ]);
});

test('checks arrays by index', () => {
  assert.deepEqual(compareLocales({ months: ['Jan', 'Feb'] }, { months: ['', 'Fév', 'Mar'] }), [
    { kind: 'empty', key: 'months[0]' },
    { kind: 'extra', key: 'months[2]' },
  ]);
});

test('reads locale files and reports issues', async (t) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'cognates-check-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await fs.mkdir(path.join(root, 'cognates'));
  await fs.writeFile(path.join(root, 'cognates', 'en.json'), JSON.stringify({ hello: 'Hi {name}' }));
  await fs.writeFile(path.join(root, 'cognates', 'fr.json'), JSON.stringify({ hello: '' }));

  const report = await checkLocales({ defaultLanguage: 'en', localeDir: 'cognates/' }, root);
  assert.deepEqual(report.results[0].issues, [{ kind: 'empty', key: 'hello' }]);

  await fs.writeFile(path.join(root, 'cognates', 'fr.json'), JSON.stringify({ hello: 'Salut {name}' }));
  const clean = await checkLocales({ defaultLanguage: 'en', localeDir: 'cognates/' }, root);
  assert.deepEqual(clean.results[0].issues, []);
});
