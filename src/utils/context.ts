import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import type { PackageManagerConfig } from "../constants/package-managers.js";
import type { ProjectNameInfo } from "../types/project-name-info.js";
import type { TemplateContext } from "../types/template-context.js";
import { getCliAuthor, getCliVersion, getNodeEngine } from "./paths.js";

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function formatDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function readAuthorFromPackageJson(filePath: string): string {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const parsed: unknown = JSON.parse(content);

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const author = (parsed as Record<string, unknown>)["author"];

      if (typeof author === "string") {
        return author;
      }

      if (author && typeof author === "object" && !Array.isArray(author)) {
        const name = (author as Record<string, unknown>)["name"];
        if (typeof name === "string") {
          return name;
        }
      }
    }
  } catch {
    // Ignore unreadable or invalid package.json files.
  }

  return "";
}

export function resolveAuthor(cwd: string): string {
  try {
    const author = execFileSync("git", ["config", "user.name"], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();

    if (author.length > 0) {
      return author;
    }
  } catch {
    // git may not be installed or the directory may not be a repository.
  }

  const fromProject = readAuthorFromPackageJson(path.join(cwd, "package.json"));

  if (fromProject.length > 0) {
    return fromProject;
  }

  return getCliAuthor();
}

export interface BuildTemplateContextInput {
  project: ProjectNameInfo;
  packageManager: PackageManagerConfig;
  cwd: string;
  date?: Date;
}

export function buildTemplateContext(
  input: BuildTemplateContextInput
): TemplateContext {
  const date = input.date ?? new Date();
  const formattedDate = formatDate(date);

  return {
    PROJECT_NAME: input.project.folderName,
    PROJECT_PATH: input.project.projectPath,
    PACKAGE_NAME: input.project.packageName,
    PACKAGE_MANAGER: input.packageManager.name,
    PACKAGE_MANAGER_FIELD: input.packageManager.packageManager,
    INSTALL_COMMAND: input.packageManager.installCommand,
    TEST_COMMAND: input.packageManager.testCommand,
    AUTHOR: resolveAuthor(input.cwd),
    DATE: formattedDate,
    YEAR: String(date.getFullYear()),
    VERSION: getCliVersion(),
    NODE_VERSION: getNodeEngine(),
  };
}
