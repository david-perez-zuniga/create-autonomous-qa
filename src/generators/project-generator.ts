import fs from "node:fs";
import path from "node:path";
import type { GeneratorOptions } from "../types/generator-options";
import { updatePackageJson } from "../services/package-json-service";
import { updateReadme } from "../services/readme-service";

export function createProject(projectName: string, options: GeneratorOptions) {
  const targetDir = path.join(process.cwd(), projectName);
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
    { recursive: true }
  );

  const packageJsonPath = path.join(
  targetDir,
  "package.json"
);

let packageManager: string | undefined;

if (options.bun) {
  packageManager = "bun@latest";
}

if (options.pnpm) {
  packageManager = "pnpm@12.14.0";
}

updatePackageJson(
  packageJsonPath,
  projectName,
  packageManager
);

  const readmePath = path.join(
  targetDir,
  "README.md"
);

  updateReadme(
  readmePath,
  projectName
  );

  console.log("✅ Template copiado");
  console.log("✅ package.json configurado");
  console.log(`✅ Proyecto creado: ${targetDir}`);

  console.log("\n📋 Próximos pasos:");
  console.log(`cd ${projectName}`);
  console.log("pnpm install");
  console.log("pnpm test");
}