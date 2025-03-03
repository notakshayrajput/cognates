import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { getConfigAsync,updateConfigAsync } from "../lib/util.js";
import { cultureInfoList } from "../lib/culturesInfo.js";
import open from "open"; 

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 2410;

// Serve React UI
app.use(express.static(path.join(__dirname, "../ui/dist")));
// Middleware to parse JSON request body
app.use(express.json());

// API to update config with validation
app.post("/api/config", async (req, res) => {
  try {
    const newConfig = req.body;
    // Validation to ensure required fields are not empty
    if (!newConfig.defaultLanguage || typeof newConfig.defaultLanguage !== "string") {
      return res.status(400).json({ error: "Invalid or missing 'defaultLanguage' field" });
    }
    if (typeof newConfig.autoDetectLanguage !== "boolean") {
      return res.status(400).json({ error: "Invalid or missing 'autoDetectLanguage' field" });
    }
    if (!newConfig.source || typeof newConfig.source !== "string") {
      return res.status(400).json({ error: "Invalid or missing 'source' field" });
    }
    newConfig.port = Number(newConfig.port);
    if (isNaN(newConfig.port) || newConfig.port <= 0) {
      return res.status(400).json({ error: "Invalid or missing 'port' field" });
    }
    if (!newConfig.localeDir || typeof newConfig.localeDir !== "string") {
      return res.status(400).json({ error: "Invalid or missing 'localeDir' field" });
    }
    if (!Array.isArray(newConfig.excludePaths)) {
      return res.status(400).json({ error: "Invalid or missing 'excludePaths' field" });
    }
    
    await updateConfigAsync(newConfig);
    res.json({ success: true, message: "Configuration updated successfully" });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Failed to update config" });
  }
});

// API to get current config
app.get("/api/config", async (req, res) => {
  try {
    const config = await getConfigAsync();
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve config" });
  }
});
app.get("/api/cultureInfo", (req, res) => {
  try {
    res.json({ success: true, cultureInfoList });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve cultureInfo" });
  }
});
app.get("/api/locales", async (req, res) => {
  try {
    const config = await getConfigAsync();
    const localeDir = path.resolve(config.localeDir);
    
    if (!fs.existsSync(localeDir)) {
      return res.status(404).json({ error: "Locale directory not found" });
    }

    const files = fs.readdirSync(localeDir);
    const jsonFiles = files.filter(file => file.endsWith(".json"));

    const result = jsonFiles.map(file => {
      const filePath = path.relative(localeDir, path.join(localeDir, file));
      const cultureInfo = cultureInfoList.find(lang => lang.code === file.replace(".json", ""));

      return {
        fileName: file,
        filePath: filePath,
        cultureInfo: cultureInfo || undefined,
      };
    });

    res.json(result);
  } catch (error) {
    console.error("Failed to retrieve locale files:", error);
    res.status(500).json({ error: "Failed to retrieve locale files" });
  }
});
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../ui/dist/index.html"));
});
export async function startCommand() {
  var config=await getConfigAsync();
  var port=config.port || PORT
  console.log("Starting Cognates UI...");
  app.listen(port, () => {
    const url = `http://localhost:${port}`;
    console.log(`🚀 Cognates UI running at ${url}`);
    open(url);
});
}

