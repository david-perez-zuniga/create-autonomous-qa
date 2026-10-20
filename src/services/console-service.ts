import type { PackageManagerConfig } from "../constants/package-managers.js";
import { MESSAGES } from "../constants/messages.js";

export interface ConsoleService {
  banner(): void;
  success(message: string): void;
  info(message: string): void;
  error(message: string): void;
  nextSteps(projectPath: string, packageManager: PackageManagerConfig): void;
}

export interface ConsoleServiceOptions {
  stdout?: (line: string) => void;
  stderr?: (line: string) => void;
  color?: boolean;
}

function supportsColor(): boolean {
  if (process.env["NO_COLOR"] !== undefined) {
    return false;
  }

  if (process.env["CI"] === "1" || process.env["CI"] === "true") {
    return false;
  }

  return Boolean(process.stdout.isTTY);
}

export function createConsoleService(
  options: ConsoleServiceOptions = {}
): ConsoleService {
  const out =
    options.stdout ??
    ((line: string) => {
      process.stdout.write(`${line}\n`);
    });
  const err =
    options.stderr ??
    ((line: string) => {
      process.stderr.write(`${line}\n`);
    });
  const useColor = options.color ?? supportsColor();

  const paint = (code: number, text: string): string =>
    useColor ? `\u001b[${code}m${text}\u001b[0m` : text;

  return {
    banner() {
      out(paint(36, MESSAGES.banner));
      out("");
    },
    success(message: string) {
      out(paint(32, `✅ ${message}`));
    },
    info(message: string) {
      out(message);
    },
    error(message: string) {
      err(paint(31, `❌ ${message}`));
    },
    nextSteps(projectPath: string, packageManager: PackageManagerConfig) {
      out("");
      out(MESSAGES.nextSteps);
      out("");
      out(`cd ${projectPath}`);
      out(packageManager.installCommand);
      out(packageManager.testCommand);
    },
  };
}

export const consoleService = createConsoleService();
