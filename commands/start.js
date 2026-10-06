import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { getConfigAsync, updateConfigAsync, generateType } from "../lib/util.js";
import { cultureInfoList } from "../lib/culturesInfo.js";
import { emptyLocaleValues } from "../lib/locale-template.js";
import open from "open";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 2410;
const uiIndex = path.join(__dirname, "../ui/dist/index.html");

function localeFileName(value) {
  if (!/^[A-Za-z0-9_-]+(?:\.json)?$/.test(value)) return null;
  return value.endsWith('.json') ? value : `${value}.json`;
}

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
  } catch {
    res.status(500).json({ error: "Failed to retrieve config" });
  }
});
app.get("/api/cultureInfo", (req, res) => {
  try {
    res.json({ success: true, cultureInfoList });
  } catch {
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
    let files = []
    files = fs.readdirSync(localeDir);
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
app.get("/api/locale/:filePath", async (req, res) => {
  try {
    const config = await getConfigAsync();
    const fileName = localeFileName(req.params.filePath);
    if (!fileName) return res.status(400).json({ error: "Invalid locale filename" });
    const filePath = path.resolve(config.localeDir, fileName);

    if (fs.existsSync(filePath)) {
      return res.json(JSON.parse(fs.readFileSync(filePath, "utf8")));
    }

    // If file does not exist, try default language
    const defaultFilePath = path.join(config.localeDir, `${config.defaultLanguage}.json`);
    if (fs.existsSync(defaultFilePath)) {
      return res.json(JSON.parse(fs.readFileSync(defaultFilePath, "utf8")));
    }

    return res.status(404).json({ error: "File not found" });
  } catch (error) {
    console.error("Failed to retrieve locale file:", error);
    res.status(500).json({ error: "Failed to retrieve locale file" });
  }
});
app.post("/api/locale/:filePath", async (req, res) => {
  try {
    const config = await getConfigAsync();
    const { filePath } = req.params;

    if (!cultureInfoList.some(culture => culture.code === filePath)) {
      return res.status(400).json({ error: "Select a valid locale" });
    }

    const newFilePath = path.join(config.localeDir, `${filePath}.json`);

    if (fs.existsSync(newFilePath)) {
      return res.status(409).json({ error: "Locale file already exists" });
    }

    const defaultFilePath = path.join(config.localeDir, `${config.defaultLanguage}.json`);

    if (!fs.existsSync(defaultFilePath)) {
      return res.status(404).json({ error: "Default language file not found" });
    }

    const defaultContent = JSON.parse(fs.readFileSync(defaultFilePath, "utf8"));
    const newLocaleData = emptyLocaleValues(defaultContent);
    fs.writeFileSync(newFilePath, JSON.stringify(newLocaleData, null, 2), { flag: "wx" });

    res.json({ success: true, message: `Locale file '${filePath}.json' created successfully` });
  } catch (error) {
    console.error("Failed to create locale file:", error);
    res.status(500).json({ error: "Failed to create locale file" });
  }
});

// API to update locale file content
app.put("/api/locale/:filePath", async (req, res) => {
  try {
    const config = await getConfigAsync();
    const { filePath } = req.params;
    const { content } = req.body;

    if (!filePath || typeof filePath !== "string") {
      return res.status(400).json({ error: "Invalid or missing 'filePath' parameter" });
    }

    const fileName = localeFileName(filePath);
    if (!fileName) return res.status(400).json({ error: "Invalid locale filename" });
    const resolvedFilePath = path.resolve(config.localeDir, fileName);

    if (!fs.existsSync(resolvedFilePath)) {
      return res.status(404).json({ error: "Locale file not found" });
    }
    if (!content || typeof content !== "object") {
      return res.status(400).json({ error: "Invalid or missing 'content' field" });
    }

    // Overwrite the content of the locale file
    fs.writeFileSync(resolvedFilePath, JSON.stringify(content, null, 2));

    res.json({ success: true, message: `Locale file '${filePath}' updated successfully` });
    if(config.defaultLanguage == filePath.replace(".json","")){
      await generateType();
    }
  } catch (error) {
    console.error("Failed to update locale file:", error);
    res.status(500).json({ error: "Failed to update locale file" });
  }
});

app.post("/api/locale/key/rename", async (req, res) => {
  try {
    const config = await getConfigAsync();
    const { keyChanges } = req.body;

    if (!Array.isArray(keyChanges)) {
      return res.status(400).json({ error: "Invalid or missing 'keyChanges' field" });
    }

    const localeDir = path.resolve(config.localeDir);
    const files = fs.readdirSync(localeDir).filter(file => file.endsWith(".json"));

    files.forEach(file => {
      const filePath = path.join(localeDir, file);
      const content = JSON.parse(fs.readFileSync(filePath, "utf8"));

      const updatedContent = renameKeys(content, keyChanges);

      fs.writeFileSync(filePath, JSON.stringify(updatedContent, null, 2));
    });

    await generateType();
    res.json({ success: true, message: "Keys renamed successfully in all locale files" });
  } catch (error) {
    console.error("Failed to rename keys in locale files:", error);
    res.status(500).json({ error: "Failed to rename keys in locale files" });
  }
});

// Function to rename keys while keeping the original order
function renameKeys(obj, keyChanges) {
  const keyMap = new Map(keyChanges.map(({ oldKey, newKey }) => [oldKey, newKey]));

  function getNestedKeyPath(key) {
    return key.split(".");
  }

  function renameNestedKey(obj, oldKey, newKey) {
    const oldPath = getNestedKeyPath(oldKey);
    const newPath = getNestedKeyPath(newKey);

    let current = obj;
    let parent = null;
    let lastOldKey = oldPath.pop();
    let lastNewKey = newPath.pop();
    let parentKey = null;

    // Traverse down the object to find the key
    for (const segment of oldPath) {
      if (!(segment in current)) return; // If path is broken, do nothing
      parent = current;
      parentKey = segment;
      current = current[segment];
    }

    if (current && lastOldKey in current) {
      // Rename key while maintaining order
      const updatedEntries = Object.entries(current).map(([key, value]) =>
        key === lastOldKey ? [lastNewKey, value] : [key, value]
      );

      // Reconstruct object while preserving key order
      const updatedObject = Object.fromEntries(updatedEntries);

      // Update reference in parent
      if (parent && parentKey) {
        parent[parentKey] = updatedObject;
      } else {
        Object.assign(obj, updatedObject);
      }
    }
  }

  function processObject(currentObj) {
    if (typeof currentObj !== "object" || currentObj === null) return currentObj;

    const newObj = Array.isArray(currentObj) ? [...currentObj] : {};

    // Recursively process the object
    Object.keys(currentObj).forEach((key) => {
      if (typeof currentObj[key] === "object") {
        newObj[key] = processObject(currentObj[key]);
      } else {
        newObj[key] = currentObj[key];
      }
    });

    // Apply renaming at all levels
    keyMap.forEach((newKey, oldKey) => {
      renameNestedKey(newObj, oldKey, newKey);
    });

    return newObj;
  }

  return processObject(obj);
}

// API to generate type file
app.post("/api/locale/generateType", async (req, res) => {
  try {
    await generateType();
    res.json({ success: true, message: "Type file generated successfully" });
  } catch (error) {
    console.error("Failed to generate type file:", error);
    res.status(500).json({ error: "Failed to generate type file" });
  }
});

app.get("*", (req, res) => {
  res.sendFile(uiIndex);
});

export async function startCommand() {
  const config = await getConfigAsync();
  const port = config.port || PORT;
  if (!fs.existsSync(uiIndex)) {
    throw new Error('Cognates UI is missing from this package. Reinstall Cognates or rebuild it.');
  }
  console.log("Starting Cognates UI...");
  app.listen(port, '127.0.0.1', () => {
    const url = `http://127.0.0.1:${port}`;
    console.log(`🚀 Cognates UI running at ${url}`);
    open(url).catch(() => {
      console.log(`Open ${url} in your browser.`);
    });
  });
}
