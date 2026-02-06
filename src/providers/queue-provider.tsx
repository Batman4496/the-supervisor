import { QueueItem } from "@/types";
import { createContext, useContext, useEffect, useState } from "react";

const QueueContext = createContext<{
  queue: QueueItem[],
  getRunning: () => QueueItem|undefined,
  cancel: (id: string) => void,
  remove: (id: string) => void
}>({
  queue: [],
  getRunning: () => undefined,
  cancel: (id) => undefined,
  remove: (id) => undefined,
});

export function useQueue() {
  return useContext(QueueContext);
}


export default function QueueProvider(props: React.PropsWithChildren) {
  const [queue, setQueue] = useState<QueueItem[]>([]);

  async function sync() {
    const queues = await window.api.queue.sync();
    setQueue(queue);
  }

  async function cancel(id: string) {
    await window.api.queue.cancel(id);
  }

  async function remove(id: string) {
    await window.api.queue.remove(id);
  }
  
  function getRunning() {
    return queue.find((q) => q.running == true);
  }

  useEffect(() => {
    window.api.queue.onSync((queue: QueueItem[]) => {
      setQueue(queue);
    });
  }, []);

  return (
    <QueueContext.Provider value={{
      queue: queue,
      getRunning: getRunning,
      cancel: cancel,
      remove: remove
    }}>

      {props.children}
    </QueueContext.Provider>
  );
}