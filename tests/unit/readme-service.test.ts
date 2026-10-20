import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { CliError } from "../../src/errors/cli-error.js";
import { updateReadme } from "../../src/services/readme-service.js";
import { buildContext } from "../helpers/context.js";
import { withTempDir } from "../helpers/temp-dir.js";

describe("updateReadme", () => {
  it("reemplaza todas las variables del contexto", async () => {
    await withTempDir(async (directory) => {
      const readmePath = path.join(directory, "README.md");
      await fs.writeFile(
        readmePath,
        [
          "# {{PROJECT_NAME}}",
          "",
          "{{PACKAGE_MANAGER}}",
          "{{INSTALL_COMMAND}}",
          "{{TEST_COMMAND}}",
        ].join("\n")
      );

      updateReadme({ readmePath, context: buildContext() });

      const content = await fs.readFile(readmePath, "utf8");
      expect(content).toContain("# demo");
      expect(content).toContain("pnpm");
      expect(content).toContain("pnpm install");
      expect(content).toContain("pnpm test");
      expect(content).not.toContain("{{");
    });
  });

  it("es idempotente", async () => {
    await withTempDir(async (directory) => {
      const readmePath = path.join(directory, "README.md");
      await fs.writeFile(readmePath, "# {{PROJECT_NAME}}");

      updateReadme({ readmePath, context: buildContext() });
      const first = await fs.readFile(readmePath, "utf8");
      updateReadme({ readmePath, context: buildContext() });
      const second = await fs.readFile(readmePath, "utf8");

      expect(second).toBe(first);
    });
  });

  it("falla si quedan placeholders sin resolver", async () => {
    await withTempDir(async (directory) => {
      const readmePath = path.join(directory, "README.md");
      await fs.writeFile(readmePath, "# {{UNKNOWN}}");

      expect(() =>
        updateReadme({ readmePath, context: buildContext() })
      ).toThrowError(CliError);
    });
  });

  it("falla si el README no existe", async () => {
    await withTempDir(async (directory) => {
      const readmePath = path.join(directory, "README.md");

      try {
        updateReadme({ readmePath, context: buildContext() });
        throw new Error("Expected updateReadme to throw");
      } catch (error) {
        expect(error).toBeInstanceOf(CliError);
        expect((error as CliError).code).toBe("E_CONFIG_FAILED");
      }
    });
  });
});
