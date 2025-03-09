#!/usr/bin/env node

import { program } from "commander";
import { setupCommand } from "../commands/setup.js";
import { startCommand } from "../commands/start.js";
import { generateTypeCommand } from "../commands/generate-type.js";

program
  .command("setup")
  .description("Setup Cognates in your app.")
  .action(() => {
    setupCommand();
  });

  program
  .command("start")
  .description("Launch Cognates UI")
  .action(() => {
    startCommand();
  });

  program
    .command("generate-type")
    .description("Generates a type file for your locales using the default language")
    .action(() => {
      generateTypeCommand();
    });

program.parse(process.argv);
