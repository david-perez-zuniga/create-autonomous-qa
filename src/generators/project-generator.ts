import fs from "node:fs";
import path from "node:path";

export function createProject(projectName: string) {
  const targetDir = path.join(process.cwd(), projectName);

  const templateDir = path.join(
    process.cwd(),
    "template"
  );

  fs.cpSync(
    templateDir,
    targetDir,
    { recursive: true }
  );

  console.log(`✅ Proyecto creado: ${targetDir}`);
}
