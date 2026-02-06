import Store from "electron-store";

declare module '*.css'


declare global {
  interface Window {
    constants: {
      [key: string]: any
    },
    api: {
      [key: string]: any,
    }
  }
}