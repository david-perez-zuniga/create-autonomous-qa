import fs from "node:fs";

export function updatePackageJson(
  packageJsonPath: string,
  projectName: string,
  packageManager?: string
) {
  const packageJson = JSON.parse(
    fs.readFileSync(packageJsonPath, "utf-8")
  );

  packageJson.name = projectName;

  packageJson.version = "0.1.0";

  packageJson.description =
    "Proyecto generado por create-autonomous-qa";

  if (packageManager) {
    packageJson.packageManager =
      packageManager;
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