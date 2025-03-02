import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

export async function getConfigAsync() {
  try {   
    const configPath = getConfigPath();
    const isModule = detectModule();
    
    if (!fs.existsSync(configPath)) {
      throw new Error(`Config file not found at ${configPath}`);
    }

    if (isModule) {
      // Append a unique query param to force reloading the module
      const configUrl = `${pathToFileURL(configPath).href}?update=${Date.now()}`;
      const { default: config } = await import(configUrl);
      return config;
    } else {
      // Delete from require cache to force reload
      delete require.cache[require.resolve(configPath)];
      const config = require(configPath);
      return config;
    }
  } catch (error) {
    console.error("❌ Error loading config:", error);
    return { error: "Failed to load config" };
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
export async function updateConfigAsync(newConfig) {
  try {
    const configPath = getConfigPath();
    const isModule = detectModule();

    const formatValue = (value) => {
      if (typeof value === "string") return `'${value}'`;
      if (Array.isArray(value)) return `[${value.map(formatValue).join(", ")}]`;
      return value;
    };

    const formattedConfig = Object.entries(newConfig)
      .map(([key, value]) => `    ${key}: ${formatValue(value)},`)
      .join("\n");

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
`;

    await fs.promises.writeFile(configPath, configContent, "utf8");
    console.log("✅ Configuration updated successfully");
  } catch (error) {
    console.error("❌ Error updating config:", error);
  }
}
