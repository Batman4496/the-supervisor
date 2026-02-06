import { LogData } from "@/types";
import { createContext, useContext, useEffect, useState } from "react";

const LogContext = createContext<{
  logs: LogData[],
  latest: LogData|null,

}>({
  latest: null,
  logs: []
});

export function useLog() {
  return useContext(LogContext);
}


export default function LogProvider(props: React.PropsWithChildren) {
  const [logs, setLogs] = useState<LogData[]>([]);
  const [latest, setLatest] = useState<LogData|null>(null);

  useEffect(() => {
    window.api.log.onNew((data: LogData) => {
      setLogs(prev => {
        if (prev.length + 1 > 50) {
          return [data, ...prev.splice(0, 49)];
        }
        return [data, ...prev];
      });
      setLatest(data);
    });
  }, []);

  return (
    <LogContext.Provider value={{
      logs: logs,
      latest: latest
    }}>

      {props.children}
    </LogContext.Provider>
  );
}