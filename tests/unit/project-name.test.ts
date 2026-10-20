import path from "node:path";
import { describe, expect, it } from "vitest";

import { CliError } from "../../src/errors/cli-error.js";
import {
  isValidProjectName,
  resolveProjectName,
  toPackageName,
} from "../../src/utils/project-name.js";

const cwd = path.resolve("/tmp/caqa-project-name");

function expectInvalid(input: string): void {
  try {
    resolveProjectName(input, cwd);
    throw new Error(`Expected "${input}" to be invalid`);
  } catch (error) {
    expect(error).toBeInstanceOf(CliError);
    expect((error as CliError).code).toBe("E_INVALID_NAME");
  }
}

describe("resolveProjectName", () => {
  it("acepta un nombre simple", () => {
    const result = resolveProjectName("demo", cwd);

    expect(result.folderName).toBe("demo");
    expect(result.packageName).toBe("demo");
    expect(result.targetPath).toBe(path.join(cwd, "demo"));
  });

  it("acepta rutas relativas con subdirectorios", () => {
    const result = resolveProjectName("clients/banking-qa", cwd);

    expect(result.folderName).toBe("banking-qa");
    expect(result.packageName).toBe("banking-qa");
    expect(result.targetPath).toBe(path.join(cwd, "clients", "banking-qa"));
  });

  it("normaliza el nombre del paquete", () => {
    const result = resolveProjectName("My Project", cwd);

    expect(result.folderName).toBe("My Project");
    expect(result.packageName).toBe("my-project");
  });

  it("rechaza nombres vacíos", () => {
    expectInvalid("");
    expectInvalid("   ");
  });

  it("rechaza rutas absolutas", () => {
    expectInvalid("/tmp/escape");
    expectInvalid("C:\\escape");
  });

  it("rechaza path traversal", () => {
    expectInvalid("..");
    expectInvalid("../escape");
    expectInvalid("clients/../../escape");
  });

  it("rechaza segmentos vacíos", () => {
    expectInvalid("clients//demo");
    expectInvalid("clients/");
  });

  it("rechaza nombres reservados de Windows", () => {
    expectInvalid("CON");
    expectInvalid("con.txt");
    expectInvalid("LPT1");
  });

  it("rechaza nombres con punto o espacio final", () => {
    expectInvalid("demo.");
    expectInvalid("demo ");
  });

  it("rechaza nombres demasiado largos", () => {
    expectInvalid("a".repeat(256));
  });

  it("expone isValidProjectName", () => {
    expect(isValidProjectName("demo", cwd)).toBe(true);
    expect(isValidProjectName("../demo", cwd)).toBe(false);
  });
});

describe("toPackageName", () => {
  it("convierte espacios y mayúsculas", () => {
    expect(toPackageName("My Project")).toBe("my-project");
  });

  it("elimina acentos y caracteres inválidos", () => {
    expect(toPackageName("Ñandú QA!")).toBe("nandu-qa");
  });

  it("usa un fallback cuando no queda texto", () => {
    expect(toPackageName("...")).toBe("qa-project");
  });
});
