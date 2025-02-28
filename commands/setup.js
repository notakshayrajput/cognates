import fs from 'fs'
import path from 'path'
import { pathToFileURL, fileURLToPath } from 'url'
import readline from 'readline'
import { getConfigAsync,getConfigPath,loadConfigAsync,detectModule } from '../lib/util.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const packageFolder = path.resolve(__dirname, "..")
const exampleConfigPath = path.join(packageFolder, "example", "cognates.config.js")

const defaultConfig = {
  defaultLanguage: 'en',
  autoDetectLanguage: true,
  source: 'src',
  port: 2410,
  localeDir: 'cognates', // Ensure this is relative
  excludePaths: ['/assets/*', '*.js'],
}

export async function setupCommand() {
  const configPath =getConfigPath();

  let isModule = detectModule();

  if (!fs.existsSync(configPath)) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question('No config file found. Create a default one? (Y/n): ', async (answer) => {
      rl.close();
      
      if (answer.toLowerCase() === 'y' || answer === '') {
        const configContent = isModule
          ? `import { defineConfig } from 'cognates';

export default defineConfig({
    defaultLanguage: "${defaultConfig.defaultLanguage}",
    autoDetectLanguage: ${defaultConfig.autoDetectLanguage},
    source: "${defaultConfig.source}",
    port: ${defaultConfig.port},
    localeDir: "${defaultConfig.localeDir}",
    excludePaths: ${JSON.stringify(defaultConfig.excludePaths)},
});
`
          : `const { defineConfig } = require('cognates');

module.exports = defineConfig({
    defaultLanguage: "${defaultConfig.defaultLanguage}",
    autoDetectLanguage: ${defaultConfig.autoDetectLanguage},
    source: "${defaultConfig.source}",
    port: ${defaultConfig.port},
    localeDir: "${defaultConfig.localeDir}",
    excludePaths: ${JSON.stringify(defaultConfig.excludePaths)},
});
`;

        fs.writeFileSync(configPath, configContent);
        console.log(`✅ Created ${path.basename(configPath)}`);
      } else {
        console.log(`❌ No config file found. Please create one using the example at: ${exampleConfigPath}`);
        return; // Stop execution if the user does not want to create a config
      }

      //  Only proceed after ensuring the config file exists
      await continueSetup();
    });
  } else {
    console.log('♻️ Cognates config already exists.');
    await continueSetup();
  }
}

async function continueSetup() {
  await loadConfigAsync();
  const config = await getConfigAsync();
  if (config) {
    await setupLocaleFolder(config);
  }
}
async function setupLocaleFolder(config) {
  const appRoot = process.cwd();
  const localeDir = path.join(appRoot, config.localeDir);
  const jsonFilePath = path.join(localeDir, `${config.defaultLanguage}.json`);

  if (!fs.existsSync(localeDir)) {
    fs.mkdirSync(localeDir, { recursive: true });
    console.log(`📁 Created locale directory: ${localeDir}`);
  }

  if (!fs.existsSync(jsonFilePath)) {
    fs.writeFileSync(jsonFilePath, JSON.stringify({}, null, 2));
    console.log(`📄 Created file: ${jsonFilePath}`);
  } else {
    console.log(`✔️ JSON file already exists: ${jsonFilePath}`);
  }
}
