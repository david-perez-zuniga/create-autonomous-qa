import { Command } from "commander";
import { createProject } from "../generators/project-generator";

const program = new Command();

program
  .name("create-autonomous-qa")
  .description(
    "CLI para generar proyectos de QA autónomo con Playwright"
  )
  .version("0.1.0");

program
  .argument("<project-name>", "Nombre del proyecto")
  .option("--bun", "Configurar proyecto para Bun")
  .option("--pnpm", "Configurar proyecto para PNPM")
  .action((projectName: string, options) => {
    console.log("🚀 Creating Autonomous QA Project\n");

    console.log("Options:");
    console.log(options);

    createProject(projectName);
  });

program.parse();