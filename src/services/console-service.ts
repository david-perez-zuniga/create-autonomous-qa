import type { GeneratorOptions } from "../types/generator-options";

export function showNextSteps(
  projectName: string,
  options: GeneratorOptions
) {
  const packageManager =
    options.bun ? "bun" : "pnpm";

  console.log("\n📋 Próximos pasos:");

  console.log(
    `cd ${projectName}`
  );

  console.log(
    `${packageManager} install`
  );

  console.log(
    `${packageManager} test`
  );
}