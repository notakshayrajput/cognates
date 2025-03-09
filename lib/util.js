import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'

export async function getConfigAsync() {
    try {
        const configPath = getConfigPath()
        const isModule = detectModule()

        if (!fs.existsSync(configPath)) {
            throw new Error(`Config file not found at ${configPath}`)
        }

        if (isModule) {
            // Append a unique query param to force reloading the module
            const configUrl = `${pathToFileURL(configPath).href}?update=${Date.now()}`
            const { default: config } = await import(configUrl)
            return config
        } else {
            // Delete from require cache to force reload
            delete require.cache[require.resolve(configPath)]
            const config = require(configPath)
            return config
        }
    } catch (error) {
        console.error('❌ Error loading config:', error)
        return { error: 'Failed to load config' }
    }
}

export function getConfigPath() {
    const appRoot = process.cwd()
    const configPath = path.join(appRoot, 'cognates.config.js')
    return configPath
}
export async function loadConfigAsync() {
    const configPath = getConfigPath()
    const isModule = detectModule()
    try {
        if (isModule) {
            const configUrl = pathToFileURL(configPath).href
            const config = (await import(configUrl)).default
            console.log('📄 Loaded Configuration:', config)
        } else {
            const config = require(configPath)
            console.log('📄 Loaded Configuration:', config)
        }
    } catch (error) {
        console.error('❌ Error loading config:', error)
    }
}
export function detectModule() {
    try {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
        return packageJson.type === 'module'
    } catch (err) {
        console.warn('⚠️ Could not read package.json, assuming CommonJS')
        return false
    }
}
export async function updateConfigAsync(newConfig) {
    try {
        const configPath = getConfigPath()
        const isModule = detectModule()

        const formatValue = (value) => {
            if (typeof value === 'string') return `'${value}'`
            if (Array.isArray(value))
                return `[${value.map(formatValue).join(', ')}]`
            return value
        }

        const formattedConfig = Object.entries(newConfig)
            .map(([key, value]) => `    ${key}: ${formatValue(value)},`)
            .join('\n')

        const configContent = isModule
            ? `import { defineConfig } from 'cognates';

export default defineConfig({
${formattedConfig}
});
`
            : `const { defineConfig } = require('cognates');

module.exports = defineConfig({
${formattedConfig}
});
`

        await fs.promises.writeFile(configPath, configContent, 'utf8')
        console.log('✅ Configuration updated successfully')
    } catch (error) {
        console.error('❌ Error updating config:', error)
    }
}

export async function generateType() {
  try {
    const config = await getConfigAsync();
    const localeFilePath = path.join(config.localeDir, `${config.defaultLanguage}.json`);

    if (!fs.existsSync(localeFilePath)) {
      throw new Error(`Locale file not found at ${localeFilePath}`);
    }

    const localeData = JSON.parse(fs.readFileSync(localeFilePath, "utf8"));

    const generateTypeDefinition = (obj, indent = 1) => {
      const indentation = '  '.repeat(indent);
      const entries = Object.entries(obj).map(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          return `${indentation}${key}: {\n${generateTypeDefinition(value, indent + 1)}\n${indentation}}`;
        } else {
          return `${indentation}${key}: string`;
        }
      });
      return entries.join(';\n');
    };

    const typeDefinition = `export default interface locale {\n${generateTypeDefinition(localeData)}\n};\n`;

    const typeFilePath = path.join(config.localeDir, 'locale.ts');
    await fs.promises.writeFile(typeFilePath, typeDefinition, "utf8");
    console.log("✅ Type file generated successfully");
  } catch (error) {
    console.error("❌ Error generating type file:", error);
  }
}