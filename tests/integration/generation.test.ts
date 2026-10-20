import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { PACKAGE_MANAGERS } from "../../src/constants/package-managers.js";
import { CliError } from "../../src/errors/cli-error.js";
import { createProject } from "../../src/generators/project-generator.js";
import { createConsoleService } from "../../src/services/console-service.js";
import { withTempDir } from "../helpers/temp-dir.js";

const templateDir = path.resolve("template");

function createOutput() {
  const stdout: string[] = [];
  const stderr: string[] = [];
  const consoleService = createConsoleService({
    stdout: (line) => stdout.push(line),
    stderr: (line) => stderr.push(line),
    color: false,
  });

  return { stdout, stderr, consoleService };
}

async function listFiles(root: string): Promise<string[]> {
  const result: string[] = [];

  async function walk(directory: string): Promise<void> {
    const entries = await fs.readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      const relative = path.relative(root, fullPath).split(path.sep).join("/");

      if (entry.isDirectory()) {
        await walk(fullPath);
      } else {
        result.push(relative);
      }
    }
  }

  await walk(root);
  return result.sort();
}

describe("createProject", () => {
  it("genera la estructura completa con pnpm", async () => {
    await withTempDir(async (directory) => {
      const output = createOutput();
      const result = createProject(
        "banking-qa",
        { cwd: directory, templateDir, packageManager: "pnpm" },
        { console: output.consoleService }
      );

      expect(result.targetDir).toBe(path.join(directory, "banking-qa"));
      expect(result.packageManager).toBe(PACKAGE_MANAGERS.pnpm);

      const files = await listFiles(result.targetDir);
      expect(files).toEqual(
        expect.arrayContaining([
          ".env.example",
          ".gitignore",
          ".opencode/skills/autonomous-qa/skill.md",
          "README.md",
          "package.json",
          "playwright.config.ts",
          "tests/example.spec.ts",
          "pages/.gitkeep",
          "fixtures/.gitkeep",
          "qa-results/defects/.gitkeep",
          "qa-results/evidence/.gitkeep",
          "qa-results/evidence/screenshots/.gitkeep",
          "qa-results/evidence/videos/.gitkeep",
          "qa-results/evidence/traces/.gitkeep",
          "qa-results/evidence/console/.gitkeep",
          "qa-results/evidence/network/.gitkeep",
          "qa-results/analytics/.gitkeep",
          "qa-results/playwright/.gitkeep",
          "qa-results/playwright/generated-tests/.gitkeep",
          "qa-results/playwright/execution-results/.gitkeep",
        ])
      );

      const packageJson = JSON.parse(
        await fs.readFile(path.join(result.targetDir, "package.json"), "utf8")
      ) as Record<string, unknown>;

      expect(packageJson["name"]).toBe("banking-qa");
      expect(packageJson["packageManager"]).toBe("pnpm@12.14.0");

      const readme = await fs.readFile(
        path.join(result.targetDir, "README.md"),
        "utf8"
      );
      expect(readme).toContain("# banking-qa");
      expect(readme).toContain("pnpm install");
      expect(readme).not.toContain("{{");

      const skill = await fs.readFile(
        path.join(result.targetDir, ".opencode/skills/autonomous-qa/skill.md"),
        "utf8"
      );
      expect(skill).toContain("name: autonomous-qa");
      expect(skill).toContain("banking-qa");
      expect(skill).not.toContain("{{");

      expect(output.stdout).toContain("🚀 Creating Autonomous QA Project");
      expect(output.stdout).toContain("✅ Template copied");
      expect(output.stdout).toContain("✅ package.json configured");
      expect(output.stdout).toContain("✅ README configured");
      expect(output.stdout).toContain("✅ Skill installed");
      expect(output.stdout).toContain("Project created successfully");
      expect(output.stdout).toContain("cd banking-qa");
      expect(output.stdout).toContain("pnpm install");
      expect(output.stdout).toContain("pnpm test");
      expect(output.stderr).toEqual([]);
    });
  });

  it("genera la configuración de Bun", async () => {
    await withTempDir(async (directory) => {
      const output = createOutput();
      const result = createProject(
        "bun-project",
        { cwd: directory, templateDir, packageManager: "bun" },
        { console: output.consoleService }
      );

      const packageJson = JSON.parse(
        await fs.readFile(path.join(result.targetDir, "package.json"), "utf8")
      ) as Record<string, unknown>;

      expect(packageJson["packageManager"]).toBe("bun@latest");
      expect(output.stdout).toContain("bun install");
      expect(output.stdout).toContain("bun run test");
    });
  });

  it("respeta subdirectorios y normaliza el nombre del paquete", async () => {
    await withTempDir(async (directory) => {
      const output = createOutput();
      const result = createProject(
        "clients/My Project",
        { cwd: directory, templateDir },
        { console: output.consoleService }
      );

      expect(result.targetDir).toBe(
        path.join(directory, "clients", "My Project")
      );

      const packageJson = JSON.parse(
        await fs.readFile(path.join(result.targetDir, "package.json"), "utf8")
      ) as Record<string, unknown>;

      expect(packageJson["name"]).toBe("my-project");
    });
  });

  it("no sobrescribe un directorio existente", async () => {
    await withTempDir(async (directory) => {
      const target = path.join(directory, "existing");
      await fs.mkdir(target);
      await fs.writeFile(path.join(target, "keep.txt"), "keep");

      const output = createOutput();

      expect(() =>
        createProject(
          "existing",
          { cwd: directory, templateDir },
          { console: output.consoleService }
        )
      ).toThrowError(CliError);

      expect(await fs.readFile(path.join(target, "keep.txt"), "utf8")).toBe(
        "keep"
      );
    });
  });

  it("hace rollback si falla la configuración", async () => {
    await withTempDir(async (directory) => {
      const invalidTemplate = path.join(directory, "invalid-template");
      await fs.mkdir(
        path.join(invalidTemplate, ".opencode/skills/autonomous-qa"),
        { recursive: true }
      );
      await fs.writeFile(
        path.join(invalidTemplate, "package.json"),
        "{ invalid json"
      );
      await fs.writeFile(path.join(invalidTemplate, "README.md"), "# demo");
      await fs.writeFile(
        path.join(invalidTemplate, ".opencode/skills/autonomous-qa/skill.md"),
        "# demo"
      );

      const output = createOutput();
      const target = path.join(directory, "rollback");

      expect(() =>
        createProject(
          "rollback",
          { cwd: directory, templateDir: invalidTemplate },
          { console: output.consoleService }
        )
      ).toThrowError(CliError);

      await expect(fs.access(target)).rejects.toThrow();
    });
  });

  it("falla si el template no existe", async () => {
    await withTempDir(async (directory) => {
      const output = createOutput();

      try {
        createProject(
          "demo",
          {
            cwd: directory,
            templateDir: path.join(directory, "missing-template"),
          },
          { console: output.consoleService }
        );
        throw new Error("Expected createProject to throw");
      } catch (error) {
        expect(error).toBeInstanceOf(CliError);
        expect((error as CliError).code).toBe("E_TEMPLATE_MISSING");
      }
    });
  });
});
