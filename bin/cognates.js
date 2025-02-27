#!/usr/bin/env node

import { program } from "commander";
import { setupCommand } from "../commands/setup.js";
import { startCommand } from "../commands/start.js";

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

program.parse(process.argv);
