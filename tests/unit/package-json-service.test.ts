import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { PACKAGE_MANAGERS } from "../../src/constants/package-managers.js";
import { CliError } from "../../src/errors/cli-error.js";
import { updatePackageJson } from "../../src/services/package-json-service.js";
import { withTempDir } from "../helpers/temp-dir.js";

describe("updatePackageJson", () => {
  it("configura los campos obligatorios y preserva los extra", async () => {
    await withTempDir(async (directory) => {
      const packageJsonPath = path.join(directory, "package.json");
      await fs.writeFile(
        packageJsonPath,
        JSON.stringify({
          name: "template",
          private: false,
          customField: "keep-me",
          scripts: { custom: "echo custom" },
        })
      );

      updatePackageJson({
        packageJsonPath,
        packageName: "banking-qa",
        packageManager: PACKAGE_MANAGERS.pnpm,
      });

      const content = await fs.readFile(packageJsonPath, "utf8");
      const parsed = JSON.parse(content) as Record<string, unknown>;

      expect(parsed["name"]).toBe("banking-qa");
      expect(parsed["version"]).toBe("0.1.0");
      expect(parsed["private"]).toBe(true);
      expect(parsed["type"]).toBe("module");
      expect(parsed["customField"]).toBe("keep-me");
      expect(parsed["packageManager"]).toBe("pnpm@12.14.0");
      expect(parsed["scripts"]).toMatchObject({
        custom: "echo custom",
        test: "playwright test",
      });
      expect(content.endsWith("\n")).toBe(true);
      expect(content).toContain('\n  "name": "banking-qa"');
    });
  });

  it("es idempotente", async () => {
    await withTempDir(async (directory) => {
      const packageJsonPath = path.join(directory, "package.json");
      await fs.writeFile(packageJsonPath, JSON.stringify({ name: "template" }));

      const input = {
        packageJsonPath,
        packageName: "demo",
        packageManager: PACKAGE_MANAGERS.bun,
      };

      updatePackageJson(input);
      const first = await fs.readFile(packageJsonPath, "utf8");
      updatePackageJson(input);
      const second = await fs.readFile(packageJsonPath, "utf8");

      expect(second).toBe(first);
    });
  });

  it("falla con JSON inválido", async () => {
    await withTempDir(async (directory) => {
      const packageJsonPath = path.join(directory, "package.json");
      await fs.writeFile(packageJsonPath, "{ invalid");

      expect(() =>
        updatePackageJson({
          packageJsonPath,
          packageName: "demo",
          packageManager: PACKAGE_MANAGERS.pnpm,
        })
      ).toThrowError(CliError);
    });
  });

  it("falla si el archivo no existe", async () => {
    await withTempDir(async (directory) => {
      const packageJsonPath = path.join(directory, "missing.json");

      try {
        updatePackageJson({
          packageJsonPath,
          packageName: "demo",
          packageManager: PACKAGE_MANAGERS.pnpm,
        });
        throw new Error("Expected updatePackageJson to throw");
      } catch (error) {
        expect(error).toBeInstanceOf(CliError);
        expect((error as CliError).code).toBe("E_CONFIG_FAILED");
      }
    });
  });
});
