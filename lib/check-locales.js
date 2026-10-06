import fs from 'node:fs/promises';
import path from 'node:path';
import { listLocaleFiles, localeFilePath } from './locale-files.js';

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function placeholders(value) {
  return new Set([...value.matchAll(/\{([A-Za-z_][\w]*|\d+)\}/g)].map(match => match[1]));
}

export function compareLocales(reference, translation) {
  const issues = [];

  function compare(expected, actual, keyPath) {
    if (Array.isArray(expected)) {
      if (!Array.isArray(actual)) {
        issues.push({ kind: 'type', key: keyPath, detail: 'expected an array' });
        return;
      }
      expected.forEach((value, index) => {
        const childPath = `${keyPath}[${index}]`;
        if (index >= actual.length) {
          issues.push({ kind: 'missing', key: childPath });
        } else {
          compare(value, actual[index], childPath);
        }
      });
      for (let index = expected.length; index < actual.length; index++) {
        issues.push({ kind: 'extra', key: `${keyPath}[${index}]` });
      }
      return;
    }
    if (isObject(expected)) {
      if (!isObject(actual)) {
        issues.push({ kind: 'type', key: keyPath || '(root)', detail: 'expected an object' });
        return;
      }
      for (const [key, value] of Object.entries(expected)) {
        const childPath = keyPath ? `${keyPath}.${key}` : key;
        if (!Object.hasOwn(actual, key)) {
          issues.push({ kind: 'missing', key: childPath });
        } else {
          compare(value, actual[key], childPath);
        }
      }
      for (const key of Object.keys(actual)) {
        if (!Object.hasOwn(expected, key)) {
          issues.push({ kind: 'extra', key: keyPath ? `${keyPath}.${key}` : key });
        }
      }
      return;
    }

    if (typeof expected !== 'string') {
      issues.push({ kind: 'type', key: keyPath, detail: 'default value must be a string or object' });
      return;
    }
    if (typeof actual !== 'string') {
      issues.push({ kind: 'type', key: keyPath, detail: 'expected a string' });
      return;
    }
    if (!actual.trim()) {
      issues.push({ kind: 'empty', key: keyPath });
      return;
    }

    const expectedNames = placeholders(expected);
    const actualNames = placeholders(actual);
    const missing = [...expectedNames].filter(name => !actualNames.has(name));
    const extra = [...actualNames].filter(name => !expectedNames.has(name));
    if (missing.length || extra.length) {
      const detail = [
        missing.length ? `missing {${missing.join('}, {')}}` : '',
        extra.length ? `unexpected {${extra.join('}, {')}}` : '',
      ].filter(Boolean).join('; ');
      issues.push({ kind: 'placeholders', key: keyPath, detail });
    }
  }

  compare(reference, translation, '');
  return issues;
}

export async function checkLocales(config, projectRoot = process.cwd()) {
  if (!config || typeof config.localeDir !== 'string' || !config.localeDir ||
      typeof config.defaultLanguage !== 'string' || !config.defaultLanguage) {
    throw new Error('Config must define localeDir and defaultLanguage.');
  }

  const localeDir = path.resolve(projectRoot, config.localeDir);
  const files = listLocaleFiles(config, projectRoot);
  const defaultLocale = files.find(file => file.code === config.defaultLanguage);
  if (!defaultLocale) {
    throw new Error(`Default locale file not found: ${localeFilePath(config, config.defaultLanguage, projectRoot)}`);
  }
  const defaultFile = defaultLocale.filePath;

  async function readLocale(file) {
    const filePath = path.join(localeDir, file);
    let data;
    try {
      data = JSON.parse(await fs.readFile(filePath, 'utf8'));
    } catch (error) {
      throw new Error(`Cannot read ${filePath}: ${error.message}`, { cause: error });
    }
    if (!isObject(data)) throw new Error(`Locale must contain a JSON object: ${filePath}`);
    return data;
  }

  const reference = await readLocale(defaultFile);
  const results = [];
  for (const file of files) {
    if (file.code === config.defaultLanguage) continue;
    const translation = await readLocale(file.filePath);
    results.push({ file: file.filePath, issues: compareLocales(reference, translation) });
  }
  return { defaultFile, results };
}
