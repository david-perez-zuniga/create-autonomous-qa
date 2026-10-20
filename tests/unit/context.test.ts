import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { PACKAGE_MANAGERS } from "../../src/constants/package-managers.js";
import type { ProjectNameInfo } from "../../src/types/project-name-info.js";
import {
  buildTemplateContext,
  formatDate,
  resolveAuthor,
} from "../../src/utils/context.js";
import { withTempDir } from "../helpers/temp-dir.js";

const project: ProjectNameInfo = {
  input: "clients/banking-qa",
  folderName: "banking-qa",
  packageName: "banking-qa",
  targetPath: path.resolve("/tmp/banking-qa"),
  projectPath: "clients/banking-qa",
};

describe("formatDate", () => {
  it("formatea una fecha local como YYYY-MM-DD", () => {
    expect(formatDate(new Date(2026, 9, 20))).toBe("2026-10-20");
  });
});

function withoutGitConfig<T>(fn: () => T): T {
  const previousGlobal = process.env["GIT_CONFIG_GLOBAL"];
  const previousSystem = process.env["GIT_CONFIG_SYSTEM"];

  process.env["GIT_CONFIG_GLOBAL"] = os.devNull;
  process.env["GIT_CONFIG_SYSTEM"] = os.devNull;

  try {
    return fn();
  } finally {
    if (previousGlobal === undefined) {
      delete process.env["GIT_CONFIG_GLOBAL"];
    } else {
      process.env["GIT_CONFIG_GLOBAL"] = previousGlobal;
    }

    if (previousSystem === undefined) {
      delete process.env["GIT_CONFIG_SYSTEM"];
    } else {
      process.env["GIT_CONFIG_SYSTEM"] = previousSystem;
    }
  }
}

describe("resolveAuthor", () => {
  it("lee author desde package.json cuando git no está disponible", async () => {
    await withTempDir(async (directory) => {
      await fs.writeFile(
        path.join(directory, "package.json"),
        JSON.stringify({ author: "QA Team" })
      );

      expect(withoutGitConfig(() => resolveAuthor(directory))).toBe("QA Team");
    });
  });

  it("lee author como objeto", async () => {
    await withTempDir(async (directory) => {
      await fs.writeFile(
        path.join(directory, "package.json"),
        JSON.stringify({ author: { name: "Jane Doe" } })
      );

      expect(withoutGitConfig(() => resolveAuthor(directory))).toBe("Jane Doe");
    });
  });

  it("tolera package.json inválido", async () => {
    await withTempDir(async (directory) => {
      await fs.writeFile(path.join(directory, "package.json"), "{ invalid");

      expect(typeof withoutGitConfig(() => resolveAuthor(directory))).toBe(
        "string"
      );
    });
  });
});

describe("buildTemplateContext", () => {
  it("construye el contexto completo para pnpm", () => {
    const context = buildTemplateContext({
      project,
      packageManager: PACKAGE_MANAGERS.pnpm,
      cwd: process.cwd(),
      date: new Date(2026, 9, 20),
    });

    expect(context.PROJECT_NAME).toBe("banking-qa");
    expect(context.PROJECT_PATH).toBe("clients/banking-qa");
    expect(context.PACKAGE_NAME).toBe("banking-qa");
    expect(context.PACKAGE_MANAGER).toBe("pnpm");
    expect(context.PACKAGE_MANAGER_FIELD).toBe("pnpm@12.14.0");
    expect(context.INSTALL_COMMAND).toBe("pnpm install");
    expect(context.TEST_COMMAND).toBe("pnpm test");
    expect(context.DATE).toBe("2026-10-20");
    expect(context.YEAR).toBe("2026");
    expect(context.VERSION).toMatch(/^\d+\.\d+\.\d+/);
    expect(context.NODE_VERSION).toMatch(/^>=/);
  });

  it("construye los comandos de Bun", () => {
    const context = buildTemplateContext({
      project,
      packageManager: PACKAGE_MANAGERS.bun,
      cwd: process.cwd(),
      date: new Date(2026, 0, 2),
    });

    expect(context.PACKAGE_MANAGER).toBe("bun");
    expect(context.PACKAGE_MANAGER_FIELD).toBe("bun@latest");
    expect(context.INSTALL_COMMAND).toBe("bun install");
    expect(context.TEST_COMMAND).toBe("bun run test");
    expect(context.DATE).toBe("2026-01-02");
    expect(context.YEAR).toBe("2026");
  });
});
