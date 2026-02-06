import { QueueItem, ResourceRecord } from "@/types";
import { createContext, useContext, useEffect, useState } from "react";

const ResourceContext = createContext<{
  resources: ResourceRecord[],
  refresh: () => void
}>({
  resources: [],
  refresh: () => undefined,
});

export function useResource() {
  return useContext(ResourceContext);
}


export default function ResourceProvider(props: React.PropsWithChildren) {
  const [resources, setResources] = useState<ResourceRecord[]>([]);

  async function refresh() {
    const res = await window.api.resource.all();
    setResources(res);
  }
  
  useEffect(() => {
    window.api.resource.onNew((resources: ResourceRecord[]) => {
      setResources(resources);
    });
    refresh();
  }, []);

  return (
    <ResourceContext.Provider value={{
      resources: resources,
      refresh: refresh
    }}>

      {props.children}
    </ResourceContext.Provider>
  );
}