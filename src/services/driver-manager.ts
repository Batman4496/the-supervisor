import { Driver, DriverType } from "@/types";
import LocalDriver from "@/services/drivers/local-driver";
import GoogleDriver from "@/services/drivers/google-driver";
import TroveDriver from "@/services/drivers/trove-driver";
import Store from "electron-store";

class DriverManager {
  
  static run(driver: DriverType, store: Store): Driver {
    if (driver === 'local') {
      return new LocalDriver();
    }

    // if (driver === 'trove') {
    //   const d = new TroveDriver();
    //   d.setApiKey(store.get('trove_api_key', '') as string);
    //   d.setApiUrl(store.get('trove_api_url', '') as string);
    //   return d;
    // }

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