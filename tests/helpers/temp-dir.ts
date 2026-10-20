import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export async function withTempDir<T>(
  fn: (directory: string) => Promise<T>
): Promise<T> {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "caqa-test-"));

  try {
    return await fn(directory);
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
}
