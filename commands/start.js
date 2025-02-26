import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

// Serve React UI
app.use(express.static(path.join(__dirname, "../ui/dist")));



export function startCommand() {
  console.log("Starting Cognates UI...");
  app.listen(PORT, () => {
  console.log(`🚀 Cognates UI running at http://localhost:${PORT}`);
});
}
