import React from "react";

export type DriverType = 'local' | 'trove' | 'google-drive' | 'mediafire'; 

export type DriverResponse = {
  success: boolean,
  message: string,
  queueItem?: QueueItem
};


export type Service = {
  id: DriverType,
  name: string,
  description: string,
  targetPath?: string,
  partial?: React.ElementType
};

export type QueueType = 'upload' | 'download';
export type UploadType = 'file' | 'folder';

export type QueueItem = {
  id: string,
  name: string,
  description: string,
  resourceId?: number,
  completed: boolean,
  cancelled: boolean,
  running: boolean,
  sourcePath: string,
  targetPath: string,
  type: DriverType,
  queueType: QueueType,
  data?: Record<string, any>
};

export interface QueueData {
  name: string;
  type: DriverType;
  description: string;
  sourcePath: string;
  targetPath: string;
  queueType: QueueType;
  data?: null| Record<string, any>;
}

export type UploadPartial = {
  payload: QueueData,
  setPayload: React.Dispatch<React.SetStateAction<QueueData>>
}

export type DriverFileData = {
  name: string,
  path: string,
  type: UploadType,
  ext?: string,
  downloaded?: boolean,
  downloadPath?: string,
  forward?: Record<string, any>
};

export interface Driver {
  getDirectory(path: string): Promise<{ name: string, ext?: string, path: string, type: UploadType }[]>;
  download(file: FileRecord, targetPath: string): Promise<FileRecord>;
  upload(name: string, from: string, to: string, type: UploadType, data?: Record<string, any>): Promise<DriverFileData>;
}

export interface SearchData {
  search?: string,
  limit?: number,
  offset?: number,
}

export interface FileSearchData extends SearchData {
  resourceId: number,
}

export interface ResourceData {
  name: string;
  description?: string; // Optional field
  sourcePath: string;
  targetPath: string;
  downloadPath?: string;
  type: DriverType;
};

export interface ImportData {
  sourcePath: string;
  downloadPath?: string;
  type: DriverType;
};

export interface DownloadData {
  sourcePath: string;
  type: DriverType;
};

export interface ResourceRecord extends ResourceData {
  id: number;
  created_at: string;
  updated_at: string;
};

export interface FileData {
  resource_id: number;
  name: string;
  downloadPath?: string;
  downloaded?: boolean;
  extension?: string | null;
  parent_id?: number | null;
  path?: string;
  type: UploadType;
}

export interface FileRecord extends FileData {
  id: number;
  created_at: string;
  updated_at: string;
}

export type LogType = 'plain' | 'info' | 'error' | 'success';

export type LogData = {
  message: string,
  type: LogType,
  at: string
}

export type ManifestFile = {
  name: string,
  path: string,
  type: 'file' | 'folder',
  files?: ManifestFile[]
};

export type Manifest = {
  name: string,
  description: string,
  path: string,
  type: DriverType,
  totalFiles: number,
  files: ManifestFile[]
}