import type { PackageManagerId } from "../constants/package-managers.js";

export interface GeneratorOptions {
  packageManager?: PackageManagerId;
  cwd?: string;
  templateDir?: string;
  debug?: boolean;
}
