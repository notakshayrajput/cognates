#!/usr/bin/env node

import { program } from "commander";
import { setupCommand } from "../commands/setup.js";
import { startCommand } from "../commands/start.js";

program
  .command("setup")
  .description("Initialize Cognates configuration")
  .action(() => {
    console.log("Executing setup...");
    setupCommand();
  });

program
  .command("start")
  .description("Launch Cognates UI")
  .action(() => {
    console.log("Executing start...");
    startCommand();
  });

program.parse(process.argv);
