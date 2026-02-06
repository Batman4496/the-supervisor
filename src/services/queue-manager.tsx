import { DriverType, QueueItem, DriverResponse, QueueData, UploadType } from "@/types";
import LocalDriver from "./drivers/local-driver";
import DBService from "./db-serivce";
import { BrowserWindow } from "electron";
import crypto from "crypto";
import LogService from "./log-service";
import DriverManager from "./driver-manager";
import Store from "electron-store";
import ManifestService from "./manifest-service";

class QueueManager {
  mainWindow: BrowserWindow;
  db: DBService;
  queue: QueueItem[] = [];
  finishedQueue: QueueItem[] = [];
  logService: LogService;
  current?: string;
  store: Store;

  constructor(mainWindow: BrowserWindow, database: DBService, store: Store) {
    this.mainWindow = mainWindow;
    this.db = database;
    this.store = store;
    this.logService = new LogService(mainWindow);
  }

  add(data: QueueData) {
    this.queue.push({
      id: crypto.randomBytes(4).toString('hex'),
      name: data.name,
      description: data.description,
      cancelled: false,
      completed: false,
      sourcePath: data.sourcePath,
      targetPath: data.targetPath,
      type: data.type,
      running: false,
      queueType: data.queueType,
      data: data.data ?? {}
    });

    this.mainWindow.webContents.send('queue:sync', [...this.queue, ...this.finishedQueue]);
    this.work();
  }


  get(id: string) {
    return this.queue.find((v) => v.id === id);
  }

  remove(id: string) {
    const item = this.queue.find(q => q.id === id);
    if (item) {
      this.finishedQueue.push(item);
    }
    this.queue = this.queue.filter(q => q.id !== id);
    if (id === this.current) {
      this.current = undefined;
    }

    this.mainWindow.webContents.send('queue:sync', [...this.queue, ...this.finishedQueue]);
    return true;
  }

  cancel(id: string) {
    const item = this.queue.find((v) => (v.id === id));

    if (item) {
      item.running = false;
      item.completed = true;
      item.cancelled = true;
      this.current = undefined;
      this.mainWindow.webContents.send('queue:sync', [...this.queue, ...this.finishedQueue]);
      this.work();

      return true;
    }

    return false;
  }

  async #upload(item: QueueItem, sourcePath: string, targetPath: string, parentId?: number, forward?: any) {
    if (!item.resourceId) return false;

    const local = DriverManager.run('local', this.store);
    const driver = DriverManager.run(item.type, this.store);

    const fileList = await local.getDirectory(sourcePath);

    if (!fileList.length) {
      return false;
    }

    for (let i = 0; i < fileList.length; ++i) {
      if (item.cancelled) {
        return false;
      }

      try {
        const res = await driver.upload(fileList[i].name, fileList[i].path, targetPath, fileList[i].type, forward ?? item.data);

        if (res) {
          let p = await this.db.createFile({
            name: res.name,
            resource_id: item.resourceId,
            type: res.type,
            path: res.path,
            extension: res.ext,
            downloadPath: res.downloadPath,
            downloaded: res.downloaded,
            parent_id: parentId
          });

          this.logService.new(`Uploaded - ${fileList[i].name} (${fileList[i].type})`, 'info');

          if (fileList[i].type === 'folder') {
            await this.#upload(item, fileList[i].path, res.path, p, res.forward);
          }

        } else {
          return false;
        }
      } catch (e) {
        if (e instanceof Error) {
          await this.db.deleteResource(item.resourceId!);
          this.logService.new(e.message, 'error');
        }

        return false;
      }

    }

    return true;
  }

  async #download(item: QueueItem, sourcePath: string, targetPath: string, parentId?: number) {
    if (!item.resourceId) return false;
    const driver = DriverManager.run(item.type, this.store);

    const fileList = await driver.getDirectory(targetPath);

    if (!fileList.length) {
      return false;
    }

    for (let i = 0; i < fileList.length; ++i) {
      if (item.cancelled) {
        return false;
      }

      try {
          let p = await this.db.createFile({
            name: fileList[i].name,
            resource_id: item.resourceId,
            type: fileList[i].type,
            path: fileList[i].path,
            extension: fileList[i].ext,
            downloaded: false,
            parent_id: parentId
          });

          this.logService.new(`Download - ${fileList[i].name} (${fileList[i].type})`, 'info');

          if (fileList[i].type === 'folder') {
            await this.#download(item, fileList[i].path, fileList[i].path, p);
          }

      } catch (e) {
        if (e instanceof Error) {
          await this.db.deleteResource(item.resourceId!);
          this.logService.new(e.message, 'error');
        }

        return false;
      }

    }

    return true;

  }

  async work() {
    try {
      if (!this.queue.length) return;

      let current;
      if (!this.current) {
        current = this.queue.find((v) => !v.running && !v.cancelled && !v.completed);
        this.current = current?.id;
      } else {
        current = this.get(this.current ?? '');
      }

      if (!current || current?.running || current?.completed) return false;

      const item = current;
      item.running = true;


      const id = await this.db.createResource({
        name: item.name,
        description: item.description,
        sourcePath: item.sourcePath,
        targetPath: item.targetPath,
        type: item.type
      });

      item.resourceId = id;
      this.current = item.id;

      this.mainWindow.webContents.send('resource:new', await this.db.allResource());
      this.mainWindow.webContents.send('queue:sync', [...this.queue, ...this.finishedQueue]);
      let res = false;
      if (item.queueType === 'upload') {
        this.logService.new(`Starting Upload - ${item.name} (${item.type})`, 'success');
        res = await this.#upload(item, item.sourcePath, item.targetPath);
        if (res) {
          const manifest = new ManifestService(this.db, this.store);
          await manifest.createManifestFromResource(item.resourceId);
        }
      }
      
      if (item.queueType === 'download') {
        this.logService.new(`Starting Download - ${item.name} (${item.type})`, 'success');
        res = await this.#download(item, item.sourcePath, item.targetPath);
        if (res) {
          await this.db.updateResource(item.resourceId, {
            downloadPath: item.sourcePath
          });
        }
      }

      if (res) {
        item.completed = true;
        item.running = false;
      } else {
        item.completed = true;
        item.cancelled = true;
        item.running = false;
      }
      
      if (item.completed && item.cancelled) {
        await this.db.deleteResource(item.resourceId);
        this.logService.new(`Cancelled - ${item.name}`, 'error');
      }

      if (item.completed && !item.cancelled) {
        this.logService.new(`Completed - ${item.name}`, 'success');
      }

      this.remove(item.id);
      this.mainWindow.webContents.send('queue:sync', [...this.queue, ...this.finishedQueue]);
      this.mainWindow.webContents.send('resource:new', await this.db.allResource());
      this.work();
    } catch (err) {
      if (this.current) {
        this.remove(this.current);
      }
      this.mainWindow.webContents.send('error', err);
      return false;
    }
  }

}

export default QueueManager;