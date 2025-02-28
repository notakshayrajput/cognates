
import path from 'path'
import fs from 'fs'
import { pathToFileURL, fileURLToPath } from 'url'
export async function getConfigAsync() {
  try {   
    const configPath = getConfigPath()
    const isModule = detectModule();
    if (isModule) {
      const configUrl = pathToFileURL(configPath).href;
      const config = (await import(configUrl)).default;
      return config;
    } else {
      const config = require(configPath);
      return config;
    }
  } catch (error) {
    console.error('❌ Error loading config:', error);
  }
}
export function getConfigPath(){
    
    const appRoot = process.cwd();
    const configPath = path.join(appRoot, 'cognates.config.js');
    return configPath;
}
export async function loadConfigAsync() {
  
  const configPath = getConfigPath();
  const isModule = detectModule();
  try {
    if (isModule) {
      const configUrl = pathToFileURL(configPath).href;
      const config = (await import(configUrl)).default;
      console.log('📄 Loaded Configuration:', config);
    } else {
      const config = require(configPath);
      console.log('📄 Loaded Configuration:', config);
    }
  } catch (error) {
    console.error('❌ Error loading config:', error);
  }
}
export function detectModule() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    return packageJson.type === 'module';
  } catch (err) {
    console.warn('⚠️ Could not read package.json, assuming CommonJS');
    return false;
  }
}