import { Driver, DriverType } from "@/types";
import LocalDriver from "@/services/drivers/local-driver";
import GoogleDriver from "@/services/drivers/google-driver";
import Store from "electron-store";

class DriverManager {
  
  static run(driver: DriverType, store: Store): Driver {
    if (driver === 'local') {
      return new LocalDriver();
    }

    if (driver === 'google-drive') {
      const d =  new GoogleDriver();
      if (store) {
        d.setCredentialPath(store.get('gdrive_access_token', '') as string);
      }

      return d;
    }
    
    return new LocalDriver();
  }
}

export default DriverManager;