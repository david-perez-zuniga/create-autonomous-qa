import { describe, expect, it } from "vitest";

import {
  CliError,
  isCliError,
  toErrorMessage,
} from "../../src/errors/cli-error.js";

describe("CliError", () => {
  it("conserva código, mensaje y causa", () => {
    const cause = new Error("root cause");
    const error = new CliError("E_COPY_FAILED", "copy failed", { cause });

    expect(error.code).toBe("E_COPY_FAILED");
    expect(error.message).toBe("copy failed");
    expect(error.cause).toBe(cause);
    expect(error.name).toBe("CliError");
  });

  it("funciona sin causa", () => {
    const error = new CliError("E_UNKNOWN", "unexpected");

    expect(error.cause).toBeUndefined();
  });

  it("isCliError distingue errores de la CLI", () => {
    expect(isCliError(new CliError("E_UNKNOWN", "x"))).toBe(true);
    expect(isCliError(new Error("x"))).toBe(false);
    expect(isCliError("x")).toBe(false);
  });

  it("toErrorMessage devuelve el mensaje de un Error", () => {
    expect(toErrorMessage(new Error("message"))).toBe("message");
  });

  it("toErrorMessage convierte valores que no son Error", () => {
    expect(toErrorMessage("value")).toBe("value");
    expect(toErrorMessage(42)).toBe("42");
  });
});
