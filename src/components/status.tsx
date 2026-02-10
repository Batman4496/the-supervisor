import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { useQueue } from '@/providers/queue-provider';
import { 
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger 
} from '@/components/ui/accordion';
import { LogData } from '@/types';
import { useLog } from '@/providers/log-provider';
import { X } from 'lucide-react';

function Status() {
  const queue = useQueue();
  const logs = useLog();

  function createLog(data: LogData) {
    let className = '';
    if (data.type == 'error') {
      className = "text-red-800";
    }
    if (data.type == 'info') {
      className = "text-blue-800";
    }
    if (data.type == 'success') {
      className = "text-green-800";
    }

    return (<p className="text-slate-500">{data.at}: <span className={className}>{data.message}</span></p>);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">{queue.getRunning()?.name ??  '...'}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Queue</DialogTitle>
        </DialogHeader>
        <Accordion type="single" collapsible>
          <AccordionItem value="log">
              <AccordionTrigger>
              <p>Logs</p>
              </AccordionTrigger> 
              <AccordionContent>
                <div className="py-2 border-b-2">
                  {logs.latest && createLog(logs.latest)}
                </div>
                <div className="flex flex-col gap-2 max-h-[20vh] overflow-y-scroll">
                  {logs.logs.map((l) => createLog(l))}
                </div>
              </AccordionContent>

          </AccordionItem>
        </Accordion>
        {!queue.queue.length && <i className="text-slate-500">Nothing here..</i>}

        {queue.queue.map((q) => (
          <div className="flex flex-row p-2 items-center justify-between">
            <p>{q.name} <small className="text-slate-500">({q.type})</small></p>

            <div className="flex flex-row gap-2">
              {q.running && !q.completed && <Button variant="destructive" onClick={() => queue.cancel(q.id)}>Cancel</Button>}
              {q.completed && !q.cancelled && <Button variant="default">Completed</Button>}
              {q.cancelled && <Button variant="outline">Cancelled</Button>}
              {!q.running && (
                <Button variant="outline" onClick={() => queue.remove(q.id)}><X /></Button>
              )}
            </div>
          </div>  
        ))}
      </DialogContent>
    </Dialog>
  );
}

export default Status;