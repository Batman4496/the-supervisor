import { BrowserWindow, dialog, ipcMain, OpenDialogOptions, shell } from "electron";
import Store from "electron-store";
import QueueManager from "@/services/queue-manager";
import DBService from "@/services/db-serivce";
import ManifestService from "./services/manifest-service";
import { assetPath } from "./lib/helpers";
import { DriverType, FileRecord, FileSearchData, ImportData, ResourceRecord } from "./types";
import { authenticate } from "./services/oauth/GoogleOAuth";
import DriverManager from "./services/driver-manager";

export default function (mainWindow: BrowserWindow, store: Store, database: DBService) {

  const queueManager = new QueueManager(mainWindow, database, store);

  ipcMain.handle('settings:save', (e, data: any) => {
    Object.keys(data).forEach((k: string) => {
      if (!data[k]) {
        store.delete(k);
      } else {
        store.set(k, data[k]);
      }
    });

    return data;
  });

  ipcMain.handle('settings:get', (e, key: string) => {
    return store.get(key);
  });

  ipcMain.handle('directory:browse', async (e, properties: OpenDialogOptions['properties']) => {
      const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
        properties: properties
      })

      if (canceled) {
        return '';
      } else {
          return filePaths[0];
      }
  });


  ipcMain.handle('oauth:googleToken', async (_, id, secret) => {
    if (!id || !secret) {
      return false;
    }
    await authenticate(id, secret, store);
    
    return true;
  });

  ipcMain.handle('queue:add', async (e, data) => {
    const index = queueManager.add(data);
    queueManager.work();

    return index;
  });

  ipcMain.handle('queue:cancel', async (e, id: string) => {    
    return queueManager.cancel(id);
  });

  ipcMain.handle('queue:remove', async (e, id: string) => {    
    return queueManager.remove(id);
  });

  ipcMain.handle('resource:all', async () => {
    return await database.allResource();
  });

  ipcMain.handle('resource:delete', async (_, resourceId) => {
    await database.deleteResource(resourceId);
    mainWindow.webContents.send('resource:new', await database.allResource());
  });
  
  ipcMain.handle('resource:changeDownloadPath', async (_, resourceId, downloadPath) => {
    await database.updateResource(resourceId, {
      downloadPath: downloadPath
    });
    mainWindow.webContents.send('resource:new', await database.allResource());
  });
 
  ipcMain.handle('file:download', async (_, resource: ResourceRecord, file: FileRecord) => {
    try {
      if (!resource?.downloadPath || !file) return '';
  
      const driver = DriverManager.run(resource.type, store);
      const download = await driver.download(file, resource.downloadPath);
      return download;
    } catch (err) {
      mainWindow.webContents.send('error', err);
      return false;
    }
  });

  ipcMain.handle('file:search', async (_, data: FileSearchData) => {
    return await database.searchFiles(data.resourceId, data.search ?? '', data.limit, data.offset);
  });

  ipcMain.handle('manifest:resource', async (_, resourceId: number) => {
    try {
      const service = new ManifestService(database, store);
      return await service.createManifestFromResource(resourceId);
    } catch (err) {
      mainWindow.webContents.send('error', err);
      return false;
    }
  });

  ipcMain.handle('manifest:import', async (_, data: ImportData) => {
    try {
      const service = new ManifestService(database, store);
      const res = await service.importManifest(data);
      
      mainWindow.webContents.send('resource:new', await database.allResource());
      return res;
    } catch (err) {
      mainWindow.webContents.send('error', err);
      return false;
    }
  });

  ipcMain.handle('resource:get', async (_, resourceId: number) => {
    const resource = await database.getResource(resourceId);
    return resource;
  });

  ipcMain.handle('open-folder', (_, path: string) => {
    shell.openPath(path);
  });

  ipcMain.handle('drag:start', (event, path: string) => {
    event.sender.startDrag({
      file: path,
    icon: assetPath('file.png')
    });
  });
}