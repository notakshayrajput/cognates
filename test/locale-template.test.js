import assert from 'node:assert/strict';
import test from 'node:test';
import { emptyLocaleValues } from '../lib/locale-template.js';

test('new locales preserve every key and leave values empty', () => {
  const source = {
    app: { title: 'Sales', enabled: true, count: 3 },
    months: ['Jan', 'Feb'],
    emptyGroup: {},
  };

  assert.deepEqual(emptyLocaleValues(source), {
    app: { title: '', enabled: '', count: '' },
    months: ['', ''],
    emptyGroup: {},
  });
  assert.equal(source.app.title, 'Sales');
});
