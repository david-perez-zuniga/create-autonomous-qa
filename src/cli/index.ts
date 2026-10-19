import { createProject } from "../generators/project-generator";

console.log("🚀 Autonomous QA CLI");

console.log(process.argv);

const projectName = process.argv[2];

if (!projectName) {
  console.error("❌ Debes indicar un nombre");
  process.exit(1);
}

createProject(projectName);