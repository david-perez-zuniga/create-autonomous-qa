export function replaceTemplateVariables(
  content: string,
  variables: Record<string, string>
): string {
  let result = content;

  for (const [key, value] of Object.entries(
    variables
  )) {
    result = result.replace(
      new RegExp(
        `{{${key}}}`,
        "g"
      ),
      value
    );
  }

  return result;
}