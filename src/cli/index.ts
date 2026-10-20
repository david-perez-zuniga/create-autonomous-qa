#!/usr/bin/env node
import { Command } from "commander";

import { DEFAULT_PACKAGE_MANAGER_ID } from "../constants/package-managers.js";
import type { PackageManagerId } from "../constants/package-managers.js";
import { MESSAGES } from "../constants/messages.js";
import { CliError, toErrorMessage } from "../errors/cli-error.js";
import { createProject } from "../generators/project-generator.js";
import { consoleService } from "../services/console-service.js";
import type { CliOptions } from "../types/cli-options.js";
import { getCliVersion } from "../utils/paths.js";

const program = new Command();

program
  .name("create-autonomous-qa")
  .description(
    "Scaffold autonomous QA projects with Playwright, TypeScript and AI agents"
  )
  .version(getCliVersion())
  .argument("<project-name>", "Name of the QA project to create")
  .option("--pnpm", "Configure the project for pnpm (default)")
  .option("--bun", "Configure the project for Bun")
  .option("--debug", "Show stack traces for unexpected errors")
  .addHelpText(
    "after",
    [
      "",
      "Examples:",
      "  $ create-autonomous-qa banking-qa",
      "  $ create-autonomous-qa banking-qa --pnpm",
      "  $ create-autonomous-qa banking-qa --bun",
    ].join("\n")
  )
  .action((projectName: string, options: CliOptions) => {
    try {
      if (options.pnpm && options.bun) {
        throw new CliError("E_CONFLICT_FLAGS", MESSAGES.errors.conflictFlags);
      }

      const packageManager: PackageManagerId = options.bun
        ? "bun"
        : DEFAULT_PACKAGE_MANAGER_ID;

      createProject(projectName, {
        packageManager,
        debug: options.debug === true,
      });
    } catch (error) {
      consoleService.error(toErrorMessage(error));

      if (options.debug && error instanceof Error && error.stack) {
        process.stderr.write(`${error.stack}\n`);
      }

      process.exitCode = 1;
    }
  });

export function run(argv: string[] = process.argv): void {
  if (argv.length <= 2) {
    program.outputHelp();
    return;
  }

  program.parse(argv);
}

run();
