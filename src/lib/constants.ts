import { DriverType, Service } from "@/types";

export const APP_NAME = "Supervisor";
export const SERVICES: Service[] = [
  { id: 'local', name: 'Local', description: ''},
  { id: 'google-drive', name: 'Google Drive', description: ''},
];

export const SEARCH_LIMIT = 50;
export const GOOGLE_DRIVE_SCOPES = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/drive.readonly"
];