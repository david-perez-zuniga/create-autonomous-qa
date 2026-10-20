import fs from "node:fs";
import path from "node:path";

import { FILES } from "../constants/files.js";
import { MESSAGES } from "../constants/messages.js";
import { CliError } from "../errors/cli-error.js";
import type { TemplateContext } from "../types/template-context.js";
import {
  assertNoUnresolvedVariables,
  replaceTemplateVariables,
} from "../utils/template-engine.js";

export interface SkillInput {
  targetDir: string;
  templateDir: string;
  context: TemplateContext;
}

export function installSkill(input: SkillInput): void {
  const sourcePath = path.join(input.templateDir, FILES.skill);
  const destinationPath = path.join(input.targetDir, FILES.skill);

  if (!fs.existsSync(sourcePath)) {
    throw new CliError("E_TEMPLATE_MISSING", MESSAGES.errors.templateMissing);
  }

  let content: string;

  try {
    content = fs.readFileSync(sourcePath, "utf8");
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new CliError(
      "E_CONFIG_FAILED",
      MESSAGES.errors.configFailed(FILES.skill, detail)
    );
  }

  const rendered = replaceTemplateVariables(content, input.context);
  assertNoUnresolvedVariables(rendered, FILES.skill);

  try {
    fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
    fs.writeFileSync(destinationPath, rendered, "utf8");
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new CliError(
      "E_CONFIG_FAILED",
      MESSAGES.errors.configFailed(FILES.skill, detail)
    );
  }
}
