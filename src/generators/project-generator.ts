import fs from "node:fs";
import path from "node:path";
import type { GeneratorOptions } from "../types/generator-options";

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

  // Personalizar package.json
  const packageJsonPath = path.join(
    targetDir,
    "package.json"
  );

  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(
      fs.readFileSync(
        packageJsonPath,
        "utf-8"
      )
    );

    packageJson.name = projectName;

    packageJson.description =
      `Proyecto generado por create-autonomous-qa`;

    packageJson.version = "0.1.0";

    if (options.bun) {
    packageJson.packageManager ="bun@latest";
    }

    if (options.pnpm) {
    packageJson.packageManager ="pnpm@12.14.0";
    }

    fs.writeFileSync(
      packageJsonPath,
      JSON.stringify(
        packageJson,
        null,
        2
      )
    );
  }

  const readmePath = path.join(
  targetDir,
  "README.md"
);

if (fs.existsSync(readmePath)) {
  let readme = fs.readFileSync(
    readmePath,
    "utf-8"
  );

  readme = readme.replace(
    /{{PROJECT_NAME}}/g,
    projectName
  );

  fs.writeFileSync(
    readmePath,
    readme
  );
}

  console.log("✅ Template copiado");
  console.log("✅ package.json configurado");
  console.log(`✅ Proyecto creado: ${targetDir}`);

  console.log("\n📋 Próximos pasos:");
  console.log(`cd ${projectName}`);
  console.log("pnpm install");
  console.log("pnpm test");
}