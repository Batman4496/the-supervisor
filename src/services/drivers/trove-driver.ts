import fsSync from "fs";
import fs from "fs/promises";
import path from "path";
import { ipcMain } from "electron";
import BaseDriver from "./base-driver";
import { Driver, DriverResponse, ManifestFile, QueueItem, UploadType } from "@/types";
import moment from "moment";
import { Blob } from 'node:buffer';

class TroveDriver extends BaseDriver implements Driver {

  #apiKey?: string;
  #apiUrl?: string;

  async getDirectory(fullPath: string) {
    if (!this.#apiKey) {
      return  [];
    }

    const res = await fetch("")
    const dirFiles = await fs.readdir(path.join(fullPath));
    

    return await Promise.all(dirFiles.map(async (f) => {
      const stats = await fs.stat(path.join(fullPath, f));
      
      return { name: f, ext: stats.isFile() ? path.extname(f) : '', path: path.join(fullPath, f), type: (stats.isDirectory() ? 'folder' : 'file') as UploadType }
    }));
  }

  async upload(name: string, from: string, to: string, type: UploadType, data?: any) {
    if (!this.#apiKey) {
      throw new Error("Invalid API Key");
    }

    const folderId = data?.folderId;
    if (!folderId) {
      throw new Error("No folder ID provided");
    }
    
    if (type === 'folder') {
      const url = new URL('/api/folder', this.#apiUrl);
      const res = await fetch(url, {
        method: "POST",
        headers: {
          'Authorization': "Bearer " + this.#apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name,
          parent_id: folderId
        })
      });

      const data = await res.json();
      return { name: data.folder.name, path: (new URL('/api/folder/' + data.folder.id, this.#apiUrl)).toString(), type, forward: {
        folderId: data.folder.id
      } }
    }

    if (type === 'file') {
      const rawData = await fs.readFile(from);
      const fileBlob = new Blob([rawData]);
      const formData = new FormData();
      formData.set('folder_id', folderId);
      formData.set('file', fileBlob as any, from);
      
      const url = new URL('/api/file', this.#apiUrl);
      const res = await fetch(url, {
        method: "POST",
        headers: {
          'Authorization': "Bearer " + this.#apiKey,
        },
        body: formData
      });

      const data = await res.json();
      return { name: data.file.name, path: (new URL('/api/file/' + data.file.id + '/download', this.#apiUrl)).toString(), type, forward: {
        folderId: data.file.folder_id
      } }
    }
    
    throw new Error("Something went wrong");  
  }

  setApiKey(apiKey: string) {
    this.#apiKey = apiKey;
    return this;
  }

  setApiUrl(apiUrl: string) {
    this.#apiUrl = apiUrl;
    return this;
  }
}

export default TroveDriver;