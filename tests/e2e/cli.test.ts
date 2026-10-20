import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { getCliVersion } from "../../src/utils/paths.js";
import { runCli } from "../helpers/run-cli.js";
import { withTempDir } from "../helpers/temp-dir.js";

describe("CLI", () => {
  it("muestra ayuda sin argumentos", async () => {
    await withTempDir(async (directory) => {
      const result = await runCli([], directory);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("Usage: create-autonomous-qa");
      expect(result.stdout).toContain("--pnpm");
      expect(result.stdout).toContain("--bun");
      expect(result.stdout).toContain("Examples:");
    });
  });

  it("muestra la versión desde package.json", async () => {
    await withTempDir(async (directory) => {
      const result = await runCli(["--version"], directory);

      expect(result.exitCode).toBe(0);
      expect(result.stdout.trim()).toBe(getCliVersion());
    });
  });

  it("genera un proyecto con pnpm", async () => {
    await withTempDir(async (directory) => {
      const result = await runCli(["banking-qa", "--pnpm"], directory);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("✅ Template copied");
      expect(result.stdout).toContain("✅ package.json configured");
      expect(result.stdout).toContain("✅ README configured");
      expect(result.stdout).toContain("✅ Skill installed");
      expect(result.stdout).toContain("Project created successfully");
      expect(result.stdout).toContain("cd banking-qa");
      expect(result.stdout).toContain("pnpm install");
      expect(result.stdout).toContain("pnpm test");
      expect(result.stdout).not.toContain("Options:");
      expect(result.stderr).toBe("");

      const packageJson = JSON.parse(
        await fs.readFile(
          path.join(directory, "banking-qa", "package.json"),
          "utf8"
        )
      ) as Record<string, unknown>;

      expect(packageJson["packageManager"]).toBe("pnpm@12.14.0");
    });
  });

  it("genera un proyecto con Bun", async () => {
    await withTempDir(async (directory) => {
      const result = await runCli(["bun-qa", "--bun"], directory);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("bun install");
      expect(result.stdout).toContain("bun run test");

      const packageJson = JSON.parse(
        await fs.readFile(
          path.join(directory, "bun-qa", "package.json"),
          "utf8"
        )
      ) as Record<string, unknown>;

      expect(packageJson["packageManager"]).toBe("bun@latest");
    });
  });

  it("falla con flags en conflicto", async () => {
    await withTempDir(async (directory) => {
      const result = await runCli(["demo", "--pnpm", "--bun"], directory);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain(
        "Choose either --pnpm or --bun, not both"
      );
      await expect(fs.access(path.join(directory, "demo"))).rejects.toThrow();
    });
  });

  it("falla si el directorio ya existe", async () => {
    await withTempDir(async (directory) => {
      await fs.mkdir(path.join(directory, "demo"));

      const result = await runCli(["demo"], directory);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Directory "demo" already exists');
      expect(result.stdout).not.toContain("Project created successfully");
    });
  });

  it("falla con un nombre inválido", async () => {
    await withTempDir(async (directory) => {
      const result = await runCli(["../escape"], directory);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("Invalid project name");
    });
  });

  it("falla con una opción desconocida", async () => {
    await withTempDir(async (directory) => {
      const result = await runCli(["demo", "--unknown"], directory);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("unknown option");
    });
  });

  it("muestra el stack trace con --debug", async () => {
    await withTempDir(async (directory) => {
      const result = await runCli(
        ["demo", "--pnpm", "--bun", "--debug"],
        directory
      );

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain("CliError");
      expect(result.stderr).toContain("at ");
    });
  });
});
