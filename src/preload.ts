import { contextBridge, ipcRenderer } from "electron";
import { QueueItem, ResourceRecord, QueueData, FileSearchData, FileRecord, ManifestData, ImportData } from "@/types";

contextBridge.exposeInMainWorld('constants', {
  appName: process.env.APP_NAME
});

contextBridge.exposeInMainWorld('api', {
  store: {
    browse: (properties: string[]) => ipcRenderer.invoke('directory:browse', properties),
    save: (data: any) => ipcRenderer.invoke('settings:save', data),
    get: (key: string) => ipcRenderer.invoke('settings:get', key),
  },
  oauth: {
    googleToken: (id: string, secret: string) => ipcRenderer.invoke('oauth:googleToken', id, secret)
  },
  queue: {
    add: (data: QueueData) => ipcRenderer.invoke('queue:add', data),
    cancel: (id: string) => ipcRenderer.invoke('queue:cancel', id),
    remove: (id: string) => ipcRenderer.invoke('queue:remove', id),
    onSync: (callback: (queue: QueueItem[]) => void) => ipcRenderer.on('queue:sync', (_, queue: QueueItem[]) => callback(queue))
  },
  log: {
    onNew: (callback: (message: string) => void) => ipcRenderer.on('log:new', (_, message) => callback(message))
  },
  file: {
    download: (resource: ResourceRecord, file: FileRecord) => ipcRenderer.invoke('file:download', resource, file),
    search: (data: FileSearchData) => ipcRenderer.invoke('file:search', data),
  },
  resource: {
    all: () => ipcRenderer.invoke('resource:all'),
    get: (resourceId: number) => ipcRenderer.invoke('resource:get', resourceId),
    changeDownloadPath: (resourceId: string, path: string) => ipcRenderer.invoke('resource:changeDownloadPath', resourceId, path),
    delete: (resourceId: number) => ipcRenderer.invoke('resource:delete', resourceId),
    onNew: (callback: (resource: ResourceRecord) => void) => ipcRenderer.on('resource:new', (_, resource: ResourceRecord) => callback(resource))
  },
  manifest: {
    import: (data: ImportData) => ipcRenderer.invoke('manifest:import', data),
    resource: (resourceId: number) => ipcRenderer.invoke('manifest:resource', resourceId),
    generate: (data: ManifestData) => ipcRenderer.invoke('manifest:generate', data),
  },
  onError: (callback: (error: any) => void) => ipcRenderer.on('error', (_, error) => callback(error)),
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
  openFolder: (path: string) => ipcRenderer.invoke('open-folder', path),
  startDrag: (path: string) => ipcRenderer.invoke('drag:start', path)
})