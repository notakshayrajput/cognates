import fs from "fs";

export function setupCommand() {
  const configPath = "./cognates.config.js";
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, `module.exports = { languages: ["en", "es"] };`);
    console.log("✅ Created cognates.config.js");
  } else {
    console.log("⚠️ cognates.config.js already exists");
  }
}
