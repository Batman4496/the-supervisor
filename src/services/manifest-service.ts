import { FileRecord, ImportData, Manifest, ManifestFile } from "@/types";
import DBService from "./db-serivce";
import crypto from "crypto";
import fsSync from "fs/promises";
import fs from "fs/promises";
import path from "path";
import Store from "electron-store";
import DriverManager from "./driver-manager";
import os from "os";
import { APP_NAME } from "@/lib/constants";

class ManifestService {
  db: DBService;
  store: Store;

  constructor(database: DBService, store: Store) {
    this.db = database;
    this.store = store;
  }

  async #getFiles(fileData: FileRecord, rp: string = '') {
    const stmt = await this.db.db.prepare(`SELECT * FROM files WHERE parent_id = ?`);
    await stmt.bind(fileData.id);
    const result = await stmt.all<FileRecord[]>();

    if (!result.length) [];

    return Promise.all(result.map(async (r) => {
      const f: ManifestFile = {
        id: r.fileId ?? '',
        name: r.name,
        path: r.path ?? '',
        relativePath: rp,
        type: r.type
      };

      if (r.type == 'folder') {
        const files = await this.#getFiles(r, path.join(rp, r.name));
        if (files.length) {
          f.files = files;
        }
      }

      return f;
    }));

  }

  async createManifestFromResource(resourceId: number) {
    const resource = await this.db.getResource(resourceId);
    if (!resource) {
      return false;
    }

    const data: Manifest = {
      name: resource.name,
      description: resource.description ?? '',
      path: resource.targetPath,
      totalFiles: 0,
      type: resource.type,
      files: []
    };

    const stmt = await this.db.db.prepare(`SELECT * FROM files WHERE resource_id = ? AND parent_id IS NULL`)
    await stmt.bind(resource.id)
    const result = await stmt.all<FileRecord[]>();

    if (!result.length) return false;

    const promises = result.map(async (fileData) => {
      const f: ManifestFile = {
        id: fileData.fileId ?? undefined,
        name: fileData.name,
        path: fileData.path ?? '',
        type: fileData.type,
        relativePath: ''
      };

      const files = await this.#getFiles(fileData, fileData.name);

      if (files.length) {
        f.files = files;
      }

      data.files.push(f);
      data.totalFiles += 1 + (files.length);
    });

    await Promise.all(promises);

    const fileName = `${APP_NAME}-manifest-${crypto.randomBytes(5).toString('hex')}.json`;

    await fs.writeFile(path.join(os.tmpdir(), fileName), JSON.stringify(data, null, 2), 'utf8');
    const driver = DriverManager.run(resource.type, this.store);
    await driver.upload(fileName, path.join(os.tmpdir(), fileName), resource.targetPath, "file");
    await fsSync.unlink(path.join(os.tmpdir(), fileName));
    return true;
  }

  async importManifest(data: ImportData) {
    
    try {
      const manifestContent = await fs.readFile(data.sourcePath, 'utf8');
      const manifest: Manifest = JSON.parse(manifestContent);
      
      const resourceId = await this.db.createResource({
        name: manifest.name,
        description: manifest.description,
        sourcePath: manifest.path,
        targetPath: data.downloadPath ?? '',
        downloadPath: data.downloadPath ?? '',
        type: manifest.type
      });

      const resource = await this.db.getResource(resourceId);
      if (!resource) return false;
      
      await this.db.db.run('BEGIN TRANSACTION;');

      await this.#insertManifestFiles(resourceId, manifest.files, null);

      await this.db.db.run('COMMIT;');
      return true;
    } catch (error) {
      await this.db.db.run('ROLLBACK;');
      console.error("Failed to import manifest:", error);
      return false;
    }
  }

  async #insertManifestFiles(resourceId: number, files: ManifestFile[], parentId: number | null) {
    for (const file of files) {
      const result = await this.db.createFile({
        resource_id: resourceId,
        parent_id: parentId,
        name: file.name,
        type: file.type,
        path: file.path,
        fileId: file.id,
        relativePath: file.relativePath
      });

      const newId = result;

      if (file.type === 'folder' && file.files && file.files.length > 0) {
        await this.#insertManifestFiles(resourceId, file.files, newId);
      }
    }
  }
}

export default ManifestService;