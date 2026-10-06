import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);

export function getConfigPath() {
  return path.join(process.cwd(), 'cognates.config.js');
}

export function detectModule() {
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
    return packageJson.type === 'module';
  } catch {
    return false;
  }
}

export async function getConfigAsync() {
  const configPath = getConfigPath();
  if (!fs.existsSync(configPath)) {
    throw new Error(`Config file not found at ${configPath}. Run cognates setup first.`);
  }

  if (detectModule()) {
    const configUrl = `${pathToFileURL(configPath).href}?update=${Date.now()}`;
    return (await import(configUrl)).default;
  }

  delete require.cache[require.resolve(configPath)];
  return require(configPath);
}

export async function loadConfigAsync() {
  const config = await getConfigAsync();
  console.log('📄 Loaded Configuration:', config);
  return config;
}

export async function updateConfigAsync(newConfig) {
  const configPath = getConfigPath();
  const packageName = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8')).name;
  const packageImport = JSON.stringify(packageName);
  const fields = Object.entries(newConfig).map(([key, value]) => {
    if (!/^[A-Za-z_$][\w$]*$/.test(key)) {
      throw new Error(`Invalid config key: ${key}`);
    }
    return `  ${key}: ${JSON.stringify(value)},`;
  }).join('\n');
  const configContent = detectModule()
    ? `import { defineConfig } from ${packageImport};\n\nexport default defineConfig({\n${fields}\n});\n`
    : `const { defineConfig } = require(${packageImport});\n\nmodule.exports = defineConfig({\n${fields}\n});\n`;
  await fs.promises.writeFile(configPath, configContent, 'utf8');
}

export async function generateType() {
  const config = await getConfigAsync();
  const localeFilePath = path.resolve(config.localeDir, `${config.defaultLanguage}.json`);
  const localeData = JSON.parse(await fs.promises.readFile(localeFilePath, 'utf8'));

  function definition(value, indent = 0) {
    if (Array.isArray(value)) {
      return value.length ? `(${[...new Set(value.map(item => definition(item, indent)))].join(' | ')})[]` : 'string[]';
    }
    if (value !== null && typeof value === 'object') {
      const spaces = '  '.repeat(indent);
      const entries = Object.entries(value).map(([key, item]) =>
        `${spaces}  ${JSON.stringify(key)}: ${definition(item, indent + 1)};`
      );
      return entries.length ? `{\n${entries.join('\n')}\n${spaces}}` : '{}';
    }
    return 'string';
  }

  const typeDefinition = `export default interface Locale ${definition(localeData)}\n`;
  await fs.promises.writeFile(path.resolve(config.localeDir, 'locale.ts'), typeDefinition, 'utf8');
}
