import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_PATTERN = '{locale}.json';
const LOCALE_CODE = /^[A-Za-z0-9_-]+$/;

export function localeFilePattern(config) {
  const pattern = config.localeFilePattern ?? DEFAULT_PATTERN;
  if (pattern === DEFAULT_PATTERN) return { nested: false, fileName: null };
  const match = /^\{locale\}\/([A-Za-z0-9_-]+\.json)$/.exec(pattern);
  if (match) return { nested: true, fileName: match[1] };
  throw new Error("localeFilePattern must be '{locale}.json' or '{locale}/<name>.json'.");
}

export function localeCode(value) {
  if (typeof value !== 'string') return null;
  const code = value.endsWith('.json') ? value.slice(0, -5) : value;
  return LOCALE_CODE.test(code) ? code : null;
}

export function localeFilePath(config, code, projectRoot = process.cwd()) {
  if (!LOCALE_CODE.test(code)) throw new Error(`Invalid locale code: ${code}`);
  const { nested, fileName } = localeFilePattern(config);
  const localeDir = path.resolve(projectRoot, config.localeDir);
  return nested ? path.join(localeDir, code, fileName) : path.join(localeDir, `${code}.json`);
}

export function listLocaleFiles(config, projectRoot = process.cwd()) {
  const { nested, fileName } = localeFilePattern(config);
  const localeDir = path.resolve(projectRoot, config.localeDir);
  return fs.readdirSync(localeDir, { withFileTypes: true })
    .filter(entry => nested ? entry.isDirectory() : entry.isFile())
    .filter(entry => {
      const code = nested ? entry.name : localeCode(entry.name);
      if (!code || (!nested && entry.name !== `${code}.json`)) return false;
      return !nested || fs.existsSync(path.join(localeDir, code, fileName));
    })
    .map(entry => {
      const code = nested ? entry.name : entry.name.slice(0, -5);
      const relativePath = nested ? path.join(code, fileName) : entry.name;
      return { code, fileName: nested ? fileName : entry.name, filePath: relativePath };
    })
    .sort((a, b) => a.code.localeCompare(b.code));
}
