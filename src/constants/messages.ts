export const MESSAGES = {
  banner: "🚀 Creating Autonomous QA Project",
  templateCopied: "Template copied",
  packageJsonConfigured: "package.json configured",
  readmeConfigured: "README configured",
  skillInstalled: "Skill installed",
  projectCreated: "Project created successfully",
  nextSteps: "Next steps:",
  errors: {
    dirExists: (name: string) => `Directory "${name}" already exists`,
    invalidName: (name: string) => `Invalid project name: ${name}`,
    conflictFlags: "Choose either --pnpm or --bun, not both",
    templateMissing: "Template not found. Reinstall create-autonomous-qa",
    permission: (path: string) => `Permission denied writing to ${path}`,
    copyFailed: (detail: string) => `Failed to copy template: ${detail}`,
    configFailed: (file: string, detail: string) =>
      `Failed to configure ${file}: ${detail}`,
    unresolvedVariables: (file: string, variables: string[]) =>
      `Unresolved template variables in ${file}: ${variables.join(", ")}`,
    unknown: (detail: string) => `Unexpected error: ${detail}`,
  },
} as const;
