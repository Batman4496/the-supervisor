import { FileRecord, ResourceRecord } from '@/types';
import { ArrowDown, ArrowUp, Cloud, Download, File, Folder, FolderOpen, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useTransition } from 'react';
import { toast } from 'react-toastify';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
function FileItem(props: { resource?: ResourceRecord, file: FileRecord, className?: string }) {
  const { resource, className } = props;
  const [file, setFile] = useState(props.file);
  const [downloading, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  async function startDrag(path: string) {
    const res = await window.api.startDrag(path);
    if (!res) {
      toast.error("File not found, downloading again...");
      downloadFile(file);
    }
  }

  async function downloadFile(file: FileRecord) {
    if (!resource?.downloadPath) {
      return toast.warning("Please set a download path for the resource first");
    }
    startTransition(async () => {
      const f = await window.api.file.download(resource, file) as FileRecord;
      console.log(f);
      if (f) setFile(f);
    });
  }

  return (
    <div className="flex flex-col gap-2 rounded-1 border-1">
      <div className={cn("flex flex-row gap-2 items-center justify-between p-2", className)}>
        <div className="flex flex-row gap-2 items-center">
          {file.type == 'file' && <File />}
          {file.type == 'folder' && (
            <>
              {open ? (
                <FolderOpen />
              ) : (
                <Folder />
              )}
            </>
          )}
          <p>{file.name}</p>
        </div>

        <div className="flex flex-row gap-2 items-center">
          {!!(file.downloaded && file.downloadPath && file.type === 'file') && (
            <Tooltip>
              <TooltipTrigger>
                <Button disabled={downloading} draggable onDragStart={(e) => {
                  e.preventDefault();
                  startDrag(file.downloadPath ?? '');
                }} className="text-black" variant="outline">
                  <Link />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Drag & Drop
              </TooltipContent>
            </Tooltip>

          )}

          {!!(!file.downloaded && file.type === 'file') && (
            <Tooltip>
              <TooltipTrigger>
                <Button disabled={downloading} onClick={() => downloadFile(file)} className="text-black" variant="outline">
                  <Download />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Download
              </TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger>
              <Button variant="outline" onClick={() => window.api.openFolder(file.type === 'folder' ? file.downloadPath : file.downloadPath?.replace(file.name, ''))} >
                <FolderOpen />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Download Path
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger>
              <Button variant="outline" onClick={() => window.api.openFolder(file.type === 'folder' ? file.path : file.path?.replace(file.name, ''))} >
                <Cloud />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Upload Path
            </TooltipContent>
          </Tooltip>

          {file.files?.length && (
            <>
              {!!(open) ? (
                <ArrowUp className="h-4 w-4 cursor-pointer" onClick={() => setOpen(false)} />
              ) : (
                <ArrowDown className="h-4 w-4 cursor-pointer" onClick={() => setOpen(true)} />
              )}
            </>
          )}
        </div>
      </div>
      {!!(file.files?.length && open) && (
        <div className="m-1 flex flex-col gap-2">
          {file.files.map((f, i) => (
            <FileItem key={i} resource={resource} file={f} className="bg-slate-100" />
          ))}
        </div>
      )}
    </div>
  );
}

export default FileItem;