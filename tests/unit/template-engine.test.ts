import { describe, expect, it } from "vitest";

import { CliError } from "../../src/errors/cli-error.js";
import {
  assertNoUnresolvedVariables,
  findUnresolvedVariables,
  replaceTemplateVariables,
} from "../../src/utils/template-engine.js";

describe("replaceTemplateVariables", () => {
  it("reemplaza placeholders simples", () => {
    expect(
      replaceTemplateVariables("# {{PROJECT_NAME}}", {
        PROJECT_NAME: "banking-qa",
      })
    ).toBe("# banking-qa");
  });

  it("reemplaza todas las ocurrencias", () => {
    expect(
      replaceTemplateVariables("{{NAME}} {{NAME}}", { NAME: "demo" })
    ).toBe("demo demo");
  });

  it("inserta literalmente valores con $& y $1", () => {
    expect(replaceTemplateVariables("{{VALUE}}", { VALUE: "$& $1 \\" })).toBe(
      "$& $1 \\"
    );
  });

  it("reemplaza valores undefined y null por cadena vacía", () => {
    expect(
      replaceTemplateVariables("a{{ONE}}b{{TWO}}c", {
        ONE: undefined,
        TWO: null,
      })
    ).toBe("abc");
  });

  it("preserva unicode", () => {
    expect(replaceTemplateVariables("{{NAME}}", { NAME: "Ñandú 🚀" })).toBe(
      "Ñandú 🚀"
    );
  });

  it("deja intactos los placeholders sin valor", () => {
    expect(replaceTemplateVariables("{{OTHER}}", { NAME: "demo" })).toBe(
      "{{OTHER}}"
    );
  });
});

describe("findUnresolvedVariables", () => {
  it("devuelve las variables pendientes ordenadas y sin duplicados", () => {
    expect(findUnresolvedVariables("{{B}} {{A}} {{B}} {{lower}}")).toEqual([
      "{{A}}",
      "{{B}}",
    ]);
  });

  it("devuelve una lista vacía cuando no hay placeholders", () => {
    expect(findUnresolvedVariables("contenido final")).toEqual([]);
  });
});

describe("assertNoUnresolvedVariables", () => {
  it("no lanza cuando todo está resuelto", () => {
    expect(() =>
      assertNoUnresolvedVariables("contenido final", "README.md")
    ).not.toThrow();
  });

  it("lanza CliError con las variables pendientes", () => {
    try {
      assertNoUnresolvedVariables("{{PROJECT_NAME}}", "README.md");
      throw new Error("Expected assertNoUnresolvedVariables to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(CliError);
      expect((error as CliError).code).toBe("E_CONFIG_FAILED");
      expect((error as CliError).message).toContain("{{PROJECT_NAME}}");
    }
  });
});
