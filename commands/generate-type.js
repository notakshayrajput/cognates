import { generateType } from "../lib/util.js";

export async function generateTypeCommand() {
  try {
    await generateType();
    console.log("Type file generated successfully.");
  } catch (error) {
    console.error("Failed to generate type file:", error);
    process.exitCode = 1;
  }
}
