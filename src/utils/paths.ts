import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { FILES } from "../constants/files.js";

const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));
const CLI_ROOT = path.resolve(moduleDirectory, "../..");

let cachedPackageJson: Record<string, unknown> | undefined;

export function getCliRoot(): string {
  return CLI_ROOT;
}

export function getTemplateDir(): string {
  return path.join(CLI_ROOT, FILES.template);
}

export function getCliPackageJsonPath(): string {
  return path.join(CLI_ROOT, FILES.packageJson);
}

export function getCliPackageJson(): Record<string, unknown> {
  if (cachedPackageJson) {
    return cachedPackageJson;
  }

  try {
    const content = fs.readFileSync(getCliPackageJsonPath(), "utf8");
    const parsed: unknown = JSON.parse(content);

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      cachedPackageJson = parsed as Record<string, unknown>;
      return cachedPackageJson;
    }
  } catch {
    // Fall through to the safe defaults below.
  }

  cachedPackageJson = {};
  return cachedPackageJson;
}

export function getCliVersion(): string {
  const version = getCliPackageJson()["version"];
  return typeof version === "string" && version.length > 0 ? version : "0.0.0";
}

export function getNodeEngine(): string {
  const engines = getCliPackageJson()["engines"];

  if (engines && typeof engines === "object" && !Array.isArray(engines)) {
    const node = (engines as Record<string, unknown>)["node"];
    if (typeof node === "string" && node.length > 0) {
      return node;
    }
  }

  return ">=20";
}

export function getCliAuthor(): string {
  const author = getCliPackageJson()["author"];

  if (typeof author === "string") {
    return author;
  }

  if (author && typeof author === "object" && !Array.isArray(author)) {
    const name = (author as Record<string, unknown>)["name"];
    if (typeof name === "string") {
      return name;
    }
  }

  return "";
}
