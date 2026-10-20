import type { PackageManagerConfig } from "../../src/constants/package-managers.js";
import { PACKAGE_MANAGERS } from "../../src/constants/package-managers.js";
import type { TemplateContext } from "../../src/types/template-context.js";

export function buildContext(
  overrides: Partial<TemplateContext> = {},
  packageManager: PackageManagerConfig = PACKAGE_MANAGERS.pnpm
): TemplateContext {
  return {
    PROJECT_NAME: "demo",
    PROJECT_PATH: "demo",
    PACKAGE_NAME: "demo",
    PACKAGE_MANAGER: packageManager.name,
    PACKAGE_MANAGER_FIELD: packageManager.packageManager,
    INSTALL_COMMAND: packageManager.installCommand,
    TEST_COMMAND: packageManager.testCommand,
    AUTHOR: "QA Team",
    DATE: "2026-10-20",
    YEAR: "2026",
    VERSION: "0.1.0",
    NODE_VERSION: ">=20",
    ...overrides,
  };
}
