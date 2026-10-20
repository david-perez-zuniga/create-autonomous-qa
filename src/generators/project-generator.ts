import fs from "node:fs";
import path from "node:path";

import {
  DEFAULT_PACKAGE_MANAGER_ID,
  getPackageManager,
} from "../constants/package-managers.js";
import type { PackageManagerConfig } from "../constants/package-managers.js";
import { FILES } from "../constants/files.js";
import { MESSAGES } from "../constants/messages.js";
import { CliError, isCliError } from "../errors/cli-error.js";
import { consoleService } from "../services/console-service.js";
import type { ConsoleService } from "../services/console-service.js";
import { updatePackageJson } from "../services/package-json-service.js";
import { updateReadme } from "../services/readme-service.js";
import { installSkill } from "../services/skill-service.js";
import type { GeneratorOptions } from "../types/generator-options.js";
import type { ProjectNameInfo } from "../types/project-name-info.js";
import { buildTemplateContext } from "../utils/context.js";
import {
  isPermissionError,
  pathExists,
  removePath,
} from "../utils/fs-utils.js";
import { getTemplateDir } from "../utils/paths.js";
import { resolveProjectName } from "../utils/project-name.js";

export interface CreateProjectResult {
  targetDir: string;
  project: ProjectNameInfo;
  packageManager: PackageManagerConfig;
}

export interface GeneratorDependencies {
  console?: ConsoleService;
}

function resolvePackageManager(
  options: GeneratorOptions
): PackageManagerConfig {
  return getPackageManager(
    options.packageManager ?? DEFAULT_PACKAGE_MANAGER_ID
  );
}

function ensureTemplateExists(templateDir: string): void {
  if (!pathExists(templateDir) || !fs.statSync(templateDir).isDirectory()) {
    throw new CliError("E_TEMPLATE_MISSING", MESSAGES.errors.templateMissing);
  }
}

function activateTemplateFiles(targetDir: string): void {
  const source = path.join(targetDir, FILES.templateGitignore);
  const destination = path.join(targetDir, FILES.gitignore);

  if (!pathExists(source)) {
    return;
  }

  if (pathExists(destination)) {
    fs.rmSync(destination, { force: true });
  }

  fs.renameSync(source, destination);
}

export function createProject(
  projectName: string,
  options: GeneratorOptions = {},
  dependencies: GeneratorDependencies = {}
): CreateProjectResult {
  const cwd = options.cwd ?? process.cwd();
  const templateDir = options.templateDir ?? getTemplateDir();
  const output = dependencies.console ?? consoleService;
  const project = resolveProjectName(projectName, cwd);
  const packageManager = resolvePackageManager(options);

  if (pathExists(project.targetPath)) {
    throw new CliError(
      "E_DIR_EXISTS",
      MESSAGES.errors.dirExists(project.projectPath)
    );
  }

  ensureTemplateExists(templateDir);

  output.banner();

  try {
    fs.mkdirSync(path.dirname(project.targetPath), { recursive: true });
    fs.cpSync(templateDir, project.targetPath, {
      recursive: true,
      force: false,
      errorOnExist: true,
    });
    activateTemplateFiles(project.targetPath);
  } catch (error) {
    removePath(project.targetPath);

    if (isPermissionError(error)) {
      throw new CliError(
        "E_PERMISSION",
        MESSAGES.errors.permission(project.targetPath)
      );
    }

    const detail = error instanceof Error ? error.message : String(error);
    throw new CliError("E_COPY_FAILED", MESSAGES.errors.copyFailed(detail), {
      cause: error,
    });
  }

  output.success(MESSAGES.templateCopied);

  const context = buildTemplateContext({
    project,
    packageManager,
    cwd,
  });

  try {
    updatePackageJson({
      packageJsonPath: path.join(project.targetPath, FILES.packageJson),
      packageName: project.packageName,
      packageManager,
    });

    output.success(MESSAGES.packageJsonConfigured);

    updateReadme({
      readmePath: path.join(project.targetPath, FILES.readme),
      context,
    });

    output.success(MESSAGES.readmeConfigured);

    installSkill({
      targetDir: project.targetPath,
      templateDir,
      context,
    });

    output.success(MESSAGES.skillInstalled);
  } catch (error) {
    removePath(project.targetPath);

    if (isCliError(error)) {
      throw error;
    }

    const detail = error instanceof Error ? error.message : String(error);
    throw new CliError(
      "E_CONFIG_FAILED",
      MESSAGES.errors.configFailed("generated project", detail),
      { cause: error }
    );
  }

  output.info("");
  output.info(MESSAGES.projectCreated);
  output.nextSteps(project.projectPath, packageManager);

  return {
    targetDir: project.targetPath,
    project,
    packageManager,
  };
}
