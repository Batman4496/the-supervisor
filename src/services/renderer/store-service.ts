import { ipcRenderer } from "electron";

class StoreService {

  save(data: any) {
    return ipcRenderer.invoke('settings:save', data);
  } 
}

export default StoreService;