import { useState } from 'react';
import { ResourceRecord } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EditIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '../ui/button';
import { browse } from '@/lib/utils';
import { toast } from 'react-toastify';

function EditResourceDialog(props: {
  resource: ResourceRecord
}) {
  const { resource } = props;
  const [open, setOpen] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [downloadPath, setDownloadPath] = useState(resource.downloadPath ?? '');

  async function regenerate() {
    setDisabled(true);
    await window.api.manifest.resource(resource.id);
    setDisabled(false);
  }

  async function deleteProject() {
    setDisabled(true);
    await window.api.resource.delete(resource.id);
    setDisabled(false);
    location.reload();
    setOpen(false);
  }

  async function changeDownloadPath() {
    const path = await browse();
    const res = await window.api.resource.changeDownloadPath(resource.id, path);
    if (res) {
      console.log(path);
      setDownloadPath(path);
      toast.success(`Download path updated: ${path}`);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><EditIcon className="cursor-pointer" size="15" /></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          {/* <DialogDescription></DialogDescription> */}
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-row gap-2 justify-between">
            <div className="flex flex-col gap-2">
              <p>Regenerate Manifest</p>
              <small className="text-slate-500">NOTE: this will regenerate the manifest file based on currently downloaded files.</small>
            </div>

            <Button 
              onClick={regenerate} 
              variant="destructive"
              disabled={disabled}
            >Regenerate</Button>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-row gap-2 justify-between">
            <div className="flex flex-col gap-2">
              <p>Delete Resource</p>
              <small className="text-slate-500">NOTE: this will only delete the entry from the application and not any files on disk.</small>
            </div>

            <Button 
              onClick={deleteProject} 
              variant="destructive"
              disabled={disabled}
            >Delete</Button>
          </div>
        </div>

    
        <div className="flex flex-col gap-3">
          <p>Change Download Path</p>
          <Input placeholder="Download Path" className="w-full" value={downloadPath} readOnly={true} />
          <Button type="button" onClick={changeDownloadPath}>Browse</Button>
        </div>
        
        <DialogFooter>

        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EditResourceDialog;