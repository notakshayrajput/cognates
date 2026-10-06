import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import readline from 'node:readline/promises'
import { getConfigAsync,getConfigPath,loadConfigAsync,updateConfigAsync } from '../lib/util.js'
import { localeFilePath } from '../lib/locale-files.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const packageFolder = path.resolve(__dirname, "..")
const exampleConfigPath = path.join(packageFolder, "example", "cognates.config.js")

const defaultConfig = {
  defaultLanguage: 'en',
  autoDetectLanguage: true,
  source: 'src/',
  port: 2410,
  localeDir: 'cognates/', // Ensure this is relative
  localeFilePattern: '{locale}.json',
  excludePaths: ['/assets/*'],
}

export async function setupCommand() {
  const configPath =getConfigPath();

  if (!fs.existsSync(configPath)) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const answer = await rl.question('No config file found. Create a default one? (Y/n): ');
    rl.close();
    if (answer.toLowerCase() !== 'y' && answer !== '') {
      console.log(`No config file found. Please create one using the example at: ${exampleConfigPath}`);
      return;
    }
    await updateConfigAsync(defaultConfig);
    console.log(`✅ Created ${path.basename(configPath)}`);
    await continueSetup();
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
  const jsonFilePath = localeFilePath(config, config.defaultLanguage, appRoot);

  if (!fs.existsSync(localeDir)) {
    fs.mkdirSync(localeDir, { recursive: true });
    console.log(`📁 Created locale directory: ${localeDir}`);
  }

  if (!fs.existsSync(jsonFilePath)) {
    fs.mkdirSync(path.dirname(jsonFilePath), { recursive: true });
    fs.writeFileSync(jsonFilePath, JSON.stringify({}, null, 2));
    console.log(`📄 Created file: ${jsonFilePath}`);
  } else {
    console.log(`✔️ JSON file already exists: ${jsonFilePath}`);
  }
}
