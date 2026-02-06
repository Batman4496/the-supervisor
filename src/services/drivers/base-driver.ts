import { QueueItem } from "@/types";
import QueueManager from "../queue-manager";

class BaseDriver {
  queueManager?: QueueManager;
  queueItem?: QueueItem;
  
  setQueueManager(queueManager: QueueManager) {
    this.queueManager = queueManager;
    return this;
  }

  setQueueItem(queueItem: QueueItem) {
    this.queueItem = queueItem;
    return this;
  }
}

export default BaseDriver;