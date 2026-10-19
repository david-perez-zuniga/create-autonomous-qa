import fs from "fs";
import path from "path";

export function createProject(projectName: string) {
  const target = path.join(process.cwd(), projectName);

  fs.mkdirSync(target, { recursive: true });

  console.log(`✅ Proyecto creado: ${target}`);
}
