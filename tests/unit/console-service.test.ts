import { describe, expect, it } from "vitest";

import { PACKAGE_MANAGERS } from "../../src/constants/package-managers.js";
import { createConsoleService } from "../../src/services/console-service.js";

function createOutput(color = false) {
  const stdout: string[] = [];
  const stderr: string[] = [];
  const service = createConsoleService({
    stdout: (line) => stdout.push(line),
    stderr: (line) => stderr.push(line),
    color,
  });

  return { stdout, stderr, service };
}

describe("createConsoleService", () => {
  it("escribe el banner y una línea vacía", () => {
    const { stdout, service } = createOutput();
    service.banner();

    expect(stdout).toEqual(["🚀 Creating Autonomous QA Project", ""]);
  });

  it("escribe mensajes de éxito en stdout", () => {
    const { stdout, stderr, service } = createOutput();
    service.success("Template copied");

    expect(stdout).toEqual(["✅ Template copied"]);
    expect(stderr).toEqual([]);
  });

  it("escribe errores en stderr", () => {
    const { stdout, stderr, service } = createOutput();
    service.error("Something failed");

    expect(stdout).toEqual([]);
    expect(stderr).toEqual(["❌ Something failed"]);
  });

  it("muestra los próximos pasos de pnpm", () => {
    const { stdout, service } = createOutput();
    service.nextSteps("banking-qa", PACKAGE_MANAGERS.pnpm);

    expect(stdout).toEqual([
      "",
      "Next steps:",
      "",
      "cd banking-qa",
      "pnpm install",
      "pnpm test",
    ]);
  });

  it("muestra los próximos pasos de Bun", () => {
    const { stdout, service } = createOutput();
    service.nextSteps("banking-qa", PACKAGE_MANAGERS.bun);

    expect(stdout).toContain("bun install");
    expect(stdout).toContain("bun run test");
  });

  it("omite ANSI cuando color es false y lo incluye cuando es true", () => {
    const plain = createOutput(false);
    plain.service.success("ok");
    expect(plain.stdout[0]).not.toContain("\u001b[");

    const colored = createOutput(true);
    colored.service.success("ok");
    expect(colored.stdout[0]).toContain("\u001b[");
  });
});
