import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { FILES } from "../../src/constants/files.js";
import { CliError } from "../../src/errors/cli-error.js";
import { installSkill } from "../../src/services/skill-service.js";
import { buildContext } from "../helpers/context.js";
import { withTempDir } from "../helpers/temp-dir.js";

describe("installSkill", () => {
  it("copia y personaliza la skill", async () => {
    await withTempDir(async (directory) => {
      const templateDir = path.join(directory, "template");
      const targetDir = path.join(directory, "target");
      const sourcePath = path.join(templateDir, FILES.skill);

      await fs.mkdir(path.dirname(sourcePath), { recursive: true });
      await fs.writeFile(
        sourcePath,
        [
          "---",
          "name: autonomous-qa",
          "description: test",
          "---",
          "",
          "# {{PROJECT_NAME}}",
          "{{PACKAGE_MANAGER}}",
        ].join("\n")
      );

      installSkill({
        targetDir,
        templateDir,
        context: buildContext(),
      });

      const destinationPath = path.join(targetDir, FILES.skill);
      const content = await fs.readFile(destinationPath, "utf8");

      expect(content).toContain("name: autonomous-qa");
      expect(content).toContain("# demo");
      expect(content).toContain("pnpm");
      expect(content).not.toContain("{{");
    });
  });

  it("es idempotente", async () => {
    await withTempDir(async (directory) => {
      const templateDir = path.join(directory, "template");
      const targetDir = path.join(directory, "target");
      const sourcePath = path.join(templateDir, FILES.skill);

      await fs.mkdir(path.dirname(sourcePath), { recursive: true });
      await fs.writeFile(sourcePath, "# {{PROJECT_NAME}}");

      installSkill({ targetDir, templateDir, context: buildContext() });
      const destinationPath = path.join(targetDir, FILES.skill);
      const first = await fs.readFile(destinationPath, "utf8");
      installSkill({ targetDir, templateDir, context: buildContext() });
      const second = await fs.readFile(destinationPath, "utf8");

      expect(second).toBe(first);
    });
  });

  it("falla si la skill no existe en el template", async () => {
    await withTempDir(async (directory) => {
      try {
        installSkill({
          targetDir: path.join(directory, "target"),
          templateDir: path.join(directory, "template"),
          context: buildContext(),
        });
        throw new Error("Expected installSkill to throw");
      } catch (error) {
        expect(error).toBeInstanceOf(CliError);
        expect((error as CliError).code).toBe("E_TEMPLATE_MISSING");
      }
    });
  });

  it("falla si quedan variables sin resolver", async () => {
    await withTempDir(async (directory) => {
      const templateDir = path.join(directory, "template");
      const targetDir = path.join(directory, "target");
      const sourcePath = path.join(templateDir, FILES.skill);

      await fs.mkdir(path.dirname(sourcePath), { recursive: true });
      await fs.writeFile(sourcePath, "# {{UNKNOWN}}");

      expect(() =>
        installSkill({ targetDir, templateDir, context: buildContext() })
      ).toThrowError(CliError);
    });
  });
});
