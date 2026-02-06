import { app } from "electron";
import path from "path";

export function assetPath(p: string) {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'app.asar.unpacked', 'public', p)
    : path.join(app.getAppPath(), 'public', p);
};