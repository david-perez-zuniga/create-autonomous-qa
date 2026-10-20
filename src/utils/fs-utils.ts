import fs from "node:fs";

export function pathExists(targetPath: string): boolean {
  return fs.existsSync(targetPath);
}

export function removePath(targetPath: string): void {
  try {
    fs.rmSync(targetPath, { recursive: true, force: true });
  } catch {
    // Rollback is best-effort; the original error must not be hidden.
  }
}

export function isPermissionError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    ((error as NodeJS.ErrnoException).code === "EACCES" ||
      (error as NodeJS.ErrnoException).code === "EPERM")
  );
}
