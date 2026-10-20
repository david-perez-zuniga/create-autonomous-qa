export const PACKAGE_MANAGERS = {
  pnpm: {
    id: "pnpm",
    name: "pnpm",
    packageManager: "pnpm@12.14.0",
    installCommand: "pnpm install",
    testCommand: "pnpm test",
    lockfile: "pnpm-lock.yaml",
  },
  bun: {
    id: "bun",
    name: "bun",
    packageManager: "bun@latest",
    installCommand: "bun install",
    testCommand: "bun run test",
    lockfile: "bun.lock",
  },
} as const;

export type PackageManagerId = keyof typeof PACKAGE_MANAGERS;
export type PackageManagerConfig = (typeof PACKAGE_MANAGERS)[PackageManagerId];

export const DEFAULT_PACKAGE_MANAGER_ID: PackageManagerId = "pnpm";

export function isPackageManagerId(value: string): value is PackageManagerId {
  return Object.prototype.hasOwnProperty.call(PACKAGE_MANAGERS, value);
}

export function getPackageManager(id: PackageManagerId): PackageManagerConfig {
  return PACKAGE_MANAGERS[id];
}
