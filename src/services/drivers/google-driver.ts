import fsSync from "fs";
import path from "path";
import BaseDriver from "./base-driver";
import { Driver, FileRecord, UploadType } from "@/types";
import { google } from 'googleapis';
import { randomInt } from "crypto";
import { finished } from "stream/promises";
import { createRelativeDirectory } from "@/lib/helpers";

class GoogleDriver extends BaseDriver implements Driver {
  #access_token?: string;

  setCredentialPath(access_token: string) {
    this.#access_token = access_token;
    return this;
  }

  async #auth() {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oAuth2Client.setCredentials({
      access_token: this.#access_token,
    });

    return oAuth2Client;
  }

  extractFolderId(url: string) {
    const match = url.match(/(?:folders\/|id=)([a-zA-Z0-9_-]{25,})/);
    return match ? match[1] : null;
  }

  async getDirectory(folderPath: string) {
    let folderId = this.extractFolderId(folderPath);

    if (!folderId) return [];

    const auth = await this.#auth();
    const drive = google.drive({ version: 'v3', auth });

    try {
      const response = await drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: 'files(id, name, mimeType, fileExtension, webViewLink)',
        supportsAllDrives: true, 
        includeItemsFromAllDrives: true,
      });

      const files = response.data.files;

      if (!files || files.length === 0) {
        return [];
      }

      return files.map((file) => {
        const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
        
        return {
          id: file.id,
          name: file.name!,
          ext: file.fileExtension ? `${file.fileExtension.replace('.', '')}` : '',
          path: file.webViewLink!,
          type: (isFolder ? 'folder' : 'file') as UploadType
        };
      });
    } catch (error) {
      console.error("Error fetching Google Drive directory:", error);
      throw error;
    }
  }

  async upload(name: string, from: string, to: string, type: UploadType, data?: Record<string, any>) {
    const folderId = data?.folderId ?? this.extractFolderId(to);

    if (!folderId) {
      throw new Error("Google Drive folder not found");
    }

    if (!fsSync.existsSync(from)) {
      throw new Error("Source path doesn't exist");
    }

    const auth = await this.#auth();
    if (!auth) {
      throw new Error("Authentication failed");
    }

    const drive = google.drive({ version: 'v3', auth });

    if (type === 'folder') {
      const fileMetadata = {
        name: name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [folderId]
      };

      const folder = await drive.files.create({
        requestBody: fileMetadata,
        fields: 'id, webViewLink'
      });

      return { id: folder.data.id, name, path: folder.data.webViewLink!, type, forward: { folderId: folder.data.id! } };
    }

    if (type === 'file') {
      const fileMetadata = {
        name: name,
        fields: 'id, webViewLink',
        parents: [folderId]
      };

      const media = {
        mimeType: 'application/octet-stream',
        body: fsSync.createReadStream(from),
      };

      try {
        const file = await drive.files.create({
          requestBody: fileMetadata,
          media: media,
          fields: 'id, webViewLink',
        });
        

        return {
          id: file.data.id,
          name,
          path: file.data.webViewLink!,
          type,
          ext: path.extname(name)
        };
      } catch (err) {
        console.error('Drive upload error:', err);
        throw err;
      }
    }

    throw new Error("Something went wrong");
  }

  async download(file: FileRecord, targetPath: string) {
    if (!file.fileId) file;

    const auth = await this.#auth();
    const drive = google.drive({ version: 'v3', auth });

    await createRelativeDirectory(targetPath);

    targetPath = path.join(targetPath, `${file.name}`);
    const stream = fsSync.createWriteStream(targetPath);

    const response = await drive.files.get(
      { fileId: file.fileId as string, alt: 'media'},
      { responseType: 'stream' }
    );

    response.data.pipe(stream);

    await finished(stream);

    file.downloadPath = targetPath;
    file.downloaded = true;

    return file;
  }

}

export default GoogleDriver;