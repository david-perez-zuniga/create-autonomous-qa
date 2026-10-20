import path from "node:path";

import { MESSAGES } from "../constants/messages.js";
import { CliError } from "../errors/cli-error.js";
import type { ProjectNameInfo } from "../types/project-name-info.js";

const WINDOWS_RESERVED_NAME = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\..*)?$/i;
const WINDOWS_INVALID_CHARACTERS = /[<>:"|?*]/;
const MAX_FOLDER_LENGTH = 255;
const MAX_PACKAGE_NAME_LENGTH = 214;

function invalidName(input: string): never {
  throw new CliError("E_INVALID_NAME", MESSAGES.errors.invalidName(input));
}

function hasControlCharacters(value: string): boolean {
  return [...value].some((character) => {
    const code = character.codePointAt(0) ?? 0;
    return code <= 0x1f || code === 0x7f;
  });
}

function validateSegment(segment: string, input: string): void {
  if (segment.length === 0 || segment.length > MAX_FOLDER_LENGTH) {
    invalidName(input);
  }

  if (segment === "." || segment === "..") {
    invalidName(input);
  }

  if (segment !== segment.trim() || /[. ]$/.test(segment)) {
    invalidName(input);
  }

  if (
    hasControlCharacters(segment) ||
    WINDOWS_INVALID_CHARACTERS.test(segment)
  ) {
    invalidName(input);
  }

  if (WINDOWS_RESERVED_NAME.test(segment)) {
    invalidName(input);
  }
}

export function toPackageName(folderName: string): string {
  const normalized = folderName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^[._-]+/, "")
    .replace(/[._-]+$/, "");

  const safeName = normalized.length > 0 ? normalized : "qa-project";
  const truncated = safeName
    .slice(0, MAX_PACKAGE_NAME_LENGTH)
    .replace(/[._-]+$/, "");

  return truncated.length > 0 ? truncated : "qa-project";
}

export function resolveProjectName(
  input: string,
  cwd: string
): ProjectNameInfo {
  if (typeof input !== "string" || input.trim().length === 0) {
    invalidName(input);
  }

  if (input !== input.trim() || input.includes("\0")) {
    invalidName(input);
  }

  if (
    path.isAbsolute(input) ||
    /^[A-Za-z]:[\\/]/.test(input) ||
    input.startsWith("\\\\")
  ) {
    invalidName(input);
  }

  const segments = input.split(/[\\/]/);

  if (segments.length === 0) {
    invalidName(input);
  }

  for (const segment of segments) {
    validateSegment(segment, input);
  }

  const folderName = segments[segments.length - 1];

  if (!folderName) {
    invalidName(input);
  }

  const targetPath = path.resolve(cwd, ...segments);
  const relative = path.relative(cwd, targetPath);

  if (
    relative.length === 0 ||
    relative.startsWith("..") ||
    path.isAbsolute(relative)
  ) {
    invalidName(input);
  }

  return {
    input,
    folderName,
    packageName: toPackageName(folderName),
    targetPath,
    projectPath: input,
  };
}

export function isValidProjectName(input: string, cwd: string): boolean {
  try {
    resolveProjectName(input, cwd);
    return true;
  } catch {
    return false;
  }
}
