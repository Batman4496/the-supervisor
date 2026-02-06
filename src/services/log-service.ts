import { LogType } from "@/types";
import { BrowserWindow } from "electron";
import moment from "moment";

class LogService {
  mainWindow: BrowserWindow;

constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  new(message: string, type: LogType = 'plain') {
    this.mainWindow.webContents.send('log:new', {
      message: message,
      type: type,
      at: moment().format('YYYY-MM-DD HH:mm:ss')
    });
  }

}


export default LogService;