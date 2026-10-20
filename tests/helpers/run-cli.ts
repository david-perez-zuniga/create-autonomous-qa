import path from "node:path";
import { execa } from "execa";

export const projectRoot = process.cwd();
export const cliPath = path.join(projectRoot, "dist", "cli", "index.js");

export function runCli(
  args: string[],
  cwd: string,
  env: Record<string, string> = {}
) {
  return execa(process.execPath, [cliPath, ...args], {
    cwd,
    reject: false,
    env: {
      ...process.env,
      NO_COLOR: "1",
      CI: "1",
      ...env,
    },
  });
}
