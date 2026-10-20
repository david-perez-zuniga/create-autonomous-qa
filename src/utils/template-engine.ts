import { MESSAGES } from "../constants/messages.js";
import { CliError } from "../errors/cli-error.js";

export type TemplateVariables = Record<
  string,
  string | number | null | undefined
>;

const UNRESOLVED_PATTERN = /{{[A-Z][A-Z0-9_]*}}/g;

export function replaceTemplateVariables(
  content: string,
  variables: TemplateVariables
): string {
  let result = content;

  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    const replacement =
      value === null || value === undefined ? "" : String(value);
    result = result.split(placeholder).join(replacement);
  }

  return result;
}

export function findUnresolvedVariables(content: string): string[] {
  const matches = content.match(UNRESOLVED_PATTERN);

  if (!matches) {
    return [];
  }

  return [...new Set(matches)].sort();
}

export function assertNoUnresolvedVariables(
  content: string,
  filePath: string
): void {
  const unresolved = findUnresolvedVariables(content);

  if (unresolved.length > 0) {
    throw new CliError(
      "E_CONFIG_FAILED",
      MESSAGES.errors.unresolvedVariables(filePath, unresolved)
    );
  }
}
