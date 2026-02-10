import fsSync from "fs";
import fs from "fs/promises";
import path from "path";
import BaseDriver from "./base-driver";
import { Driver, FileRecord, QueueItem, UploadType } from "@/types";
import { createRelativeDirectory } from "@/lib/helpers";

class LocalDriver extends BaseDriver implements Driver {

  async generatePath(name: string, targetPath: string, queueItem: QueueItem) {
    return path.join(targetPath, name);
  }
  
  async getDirectory(fullPath: string) {
    const stats = await fs.stat(fullPath);
    if (!stats.isDirectory()) {
      return [{ name: path.basename(fullPath), ext: path.extname(fullPath), path: fullPath, type: 'file' as UploadType }];
    }
    
    const dirFiles = await fs.readdir(path.join(fullPath));
    

    return await Promise.all(dirFiles.map(async (f) => {
      const stats = await fs.stat(path.join(fullPath, f));
      
      return { name: f, ext: stats.isFile() ? path.extname(f) : '', path: path.join(fullPath, f), type: (stats.isDirectory() ? 'folder' : 'file') as UploadType }
    }));
  }

  async upload(name: string, from: string, to: string, type: UploadType) {
    if (!fsSync.existsSync(from)) {
      throw new Error("Source path don't exist");  
    }
    
    if (type === 'folder') {
      await fs.mkdir(path.join(to, name));
      return { name, path: path.join(to, name), type };
    }
    
    if (type === 'file') {
      await fs.cp(from, path.join(to, name));
      return { name, path: path.join(to, name), type, ext: path.extname(name), downloadPath: path.join(to, name), downloaded: true };
    }
    
    throw new Error("Something went wrong");  
  }

  async download(file: FileRecord, targetPath: string) {
    if (!file.path) return file;

    await createRelativeDirectory(targetPath);

    await fs.cp(file.path, targetPath);
    
    file.downloadPath = targetPath;
    file.downloaded = true;

    return file;
  }
}

export default LocalDriver;