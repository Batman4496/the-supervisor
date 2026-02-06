import { FileRecord, ResourceRecord } from '@/types';
import { Download, File, Folder, FolderOpen, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useTransition } from 'react';
import { toast } from 'react-toastify';

function FileItem (props: { resource?: ResourceRecord, file: FileRecord, className?: string }) {
  const { resource, className } = props;
  const [file, setFile] = useState(props.file);
  const [downloading, startTransition] = useTransition();

  function startDrag(path: string) {
    window.api.startDrag(path);
  }

  async function downloadFile(file: FileRecord) {
    if (!resource?.downloadPath) {
      return toast.warning("Please set a download path for the resource first");
    }
    startTransition(async () => {
      const f = await window.api.file.download(resource, file) as FileRecord;
      if (f) setFile(f);
    });
  }

  return (
    <div className={cn("flex flex-row gap-2 items-center justify-between p-2 rounded- border-1", className)}>
        <div className="flex flex-row gap-2 items-center">
          {file.type == 'file' && <File />}
          {file.type == 'folder' && <Folder />}
          <p>{file.name}</p>
        </div>

        <div className="flex flex-row gap-2 items-center">
          {!!(file.downloaded && file.downloadPath && file.type === 'file') && (
              <Button draggable onDragStart={(e) => {
                  e.preventDefault();
                  startDrag(file.downloadPath ?? '');
              }} className="text-black" variant="outline">
                <Link />
              </Button>
          )}

          {!!(!file.downloaded && file.type === 'file') && (
              <Button disabled={downloading} onClick={() => downloadFile(file)} className="text-black" variant="outline">
                <Download />
              </Button>
          )}

          {file.type === 'folder' && (
            <Button variant="outline" onClick={() => window.api.openFolder(file.path)} >
              <FolderOpen />
            </Button>
          )}
        </div>
      </div>
  );
}

export default FileItem;