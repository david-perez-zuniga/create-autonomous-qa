import fs from "node:fs";
import path from "node:path";

import { MESSAGES } from "../constants/messages.js";
import { CliError } from "../errors/cli-error.js";
import type { TemplateContext } from "../types/template-context.js";
import {
  assertNoUnresolvedVariables,
  replaceTemplateVariables,
} from "../utils/template-engine.js";

export interface ReadmeInput {
  readmePath: string;
  context: TemplateContext;
}

function configError(filePath: string, error: unknown): never {
  const detail = error instanceof Error ? error.message : String(error);
  throw new CliError(
    "E_CONFIG_FAILED",
    MESSAGES.errors.configFailed(filePath, detail)
  );
}

export function updateReadme(input: ReadmeInput): void {
  const { readmePath, context } = input;
  const fileName = path.basename(readmePath);

  if (!fs.existsSync(readmePath)) {
    configError(fileName, new Error("README.md not found in template"));
  }

  let content: string;

  try {
    content = fs.readFileSync(readmePath, "utf8");
  } catch (error) {
    configError(fileName, error);
  }

  const updatedContent = replaceTemplateVariables(content, context);
  assertNoUnresolvedVariables(updatedContent, fileName);

  try {
    fs.writeFileSync(readmePath, updatedContent, "utf8");
  } catch (error) {
    configError(fileName, error);
  }
}
