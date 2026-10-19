import fs from "node:fs";
import path from "node:path";

import type { GeneratorOptions } from "../types/generator-options";

import { updatePackageJson } from "../services/package-json-service";
import { updateReadme } from "../services/readme-service";
import { showNextSteps } from "../services/console-service";

import { PACKAGE_MANAGERS } from "../constants/package-managers";

export function createProject(
  projectName: string,
  options: GeneratorOptions
) {
  const targetDir = path.join(
    process.cwd(),
    projectName
  );

  const templateDir = path.join(
    process.cwd(),
    "template"
  );

  if (fs.existsSync(targetDir)) {
    console.error(
      `❌ El directorio "${projectName}" ya existe`
    );

    process.exit(1);
  }

  console.log("🚀 Creando proyecto...");

  // Copiar template
  fs.cpSync(
    templateDir,
    targetDir,
    {
      recursive: true
    }
  );

  console.log("✅ Template copiado");

  // Resolver package manager
  const packageManager = options.bun
    ? PACKAGE_MANAGERS.BUN
    : options.pnpm
      ? PACKAGE_MANAGERS.PNPM
      : undefined;

  // Configurar package.json
  const packageJsonPath = path.join(
    targetDir,
    "package.json"
  );

  updatePackageJson(
    packageJsonPath,
    projectName,
    packageManager
  );

  console.log(
    "✅ package.json configurado"
  );

  // Configurar README
  const readmePath = path.join(
    targetDir,
    "README.md"
  );

  updateReadme(
    readmePath,
    projectName
  );

  console.log(
    "✅ README configurado"
  );

  console.log(
    `✅ Proyecto creado: ${targetDir}`
  );

  showNextSteps(
    projectName,
    options
  );
}