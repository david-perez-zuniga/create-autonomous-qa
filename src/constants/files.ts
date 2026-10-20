export const FILES = {
  packageJson: "package.json",
  readme: "README.md",
  skill: ".opencode/skills/autonomous-qa/skill.md",
  template: "template",
} as const;

export const QA_RESULTS_DIRECTORIES = [
  "qa-results",
  "qa-results/defects",
  "qa-results/evidence",
  "qa-results/evidence/screenshots",
  "qa-results/evidence/videos",
  "qa-results/evidence/traces",
  "qa-results/evidence/console",
  "qa-results/evidence/network",
  "qa-results/playwright",
  "qa-results/playwright/generated-tests",
  "qa-results/playwright/execution-results",
  "qa-results/analytics",
] as const;

export const REQUIRED_TEMPLATE_FILES = [
  "package.json",
  "README.md",
  "playwright.config.ts",
  ".env.example",
  ".gitignore",
  "tests/example.spec.ts",
  ".opencode/skills/autonomous-qa/skill.md",
] as const;
