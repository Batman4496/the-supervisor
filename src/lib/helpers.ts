import fs from "fs/promises";
import { app } from "electron";
import path from "path";

export function assetPath(p: string) {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'app.asar.unpacked', 'public', p)
    : path.join(app.getAppPath(), 'public', p);
};

export async function createRelativeDirectory(path: string) {
  return await fs.mkdir(path, { recursive: true });
};

export async function fileExists(path: string): Promise<boolean> {
  try {
    await fs.access(path, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}