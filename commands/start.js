import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { getConfigAsync } from "../lib/util.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

// Serve React UI
app.use(express.static(path.join(__dirname, "../ui/dist")));



export async function startCommand() {
  var config=await getConfigAsync();
  console.log(config)
  var port=config.port || PORT
  console.log("Starting Cognates UI...");
  app.listen(port, () => {
  console.log(`🚀 Cognates UI running at http://localhost:${port}`);
});
}
