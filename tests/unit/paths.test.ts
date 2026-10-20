import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  getCliAuthor,
  getCliPackageJson,
  getCliRoot,
  getCliVersion,
  getNodeEngine,
  getTemplateDir,
} from "../../src/utils/paths.js";

describe("paths", () => {
  it("resuelve la raíz del paquete", () => {
    expect(fs.existsSync(path.join(getCliRoot(), "package.json"))).toBe(true);
  });

  it("resuelve el template desde la raíz del paquete", () => {
    const templateDir = getTemplateDir();

    expect(path.basename(templateDir)).toBe("template");
    expect(fs.existsSync(path.join(templateDir, "package.json"))).toBe(true);
    expect(
      fs.existsSync(
        path.join(templateDir, ".opencode/skills/autonomous-qa/skill.md")
      )
    ).toBe(true);
  });

  it("lee la versión desde package.json", () => {
    const pkg = getCliPackageJson();
    expect(getCliVersion()).toBe(pkg["version"]);
  });

  it("lee el engine de Node", () => {
    expect(getNodeEngine()).toMatch(/^>=/);
  });

  it("lee el autor del paquete", () => {
    expect(getCliAuthor()).toBe(getCliPackageJson()["author"]);
  });
});
