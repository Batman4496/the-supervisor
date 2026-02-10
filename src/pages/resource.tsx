import FileItem from '@/components/file-item';
import Mainlayout from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SEARCH_LIMIT } from '@/lib/constants';
import { setData } from '@/lib/utils';
import { FileRecord, FileSearchData, ResourceRecord } from '@/types';
import { LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

function Resource() {
  const params = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState<ResourceRecord>();
  const [search, setSearch] = useState<string>('');
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [filtered, setFiltered] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    window.api.resource.get(Number(params.resourceId)).then((data: {
      resource: ResourceRecord,
      files: FileRecord[]
    }) => {
      if (data.resource) {
        setResource(data.resource);
        setFiles(data.files);
        setFiltered([]);
        setLoading(false);
      } else {
        navigate('/');
      }
    });
  }, [params.resourceId]);


  useEffect(() => {

    const timeout = setTimeout(async () => {
      if (!search.length) {
        return setFiltered([]);
      }

      const files = await window.api.file.search({
        resourceId: resource?.id,
        search: search
      });

      if (files.length) {
        setFiltered(files);
      }
    }, 500);

    return () => {
      clearTimeout(timeout);
    }
  }, [search]);

  return loading ? (
    <Mainlayout>
      <div className="flex flex-col h-full items-center justify-center">
        <LoaderCircle size={50} className="animate-spin" /> 
      </div>
    </Mainlayout>
  ) : (
    <Mainlayout>
      <div className="flex flex-col items-start gap-2 p-3">
        <h1 className="text-2xl">{resource?.name} <span className="text-sm text-slate-500">({resource?.type})</span></h1>
        <small className="text-blue-500 text-start cursor-pointer" onClick={() => window.api.openFolder(resource?.targetPath)}>{resource?.targetPath}</small>
      </div>
        <Card>
          <CardHeader>
            <Input placeholder="Search files..." value={search} onChange={(e) => setSearch(e.target.value)}  />
          </CardHeader>

          <CardContent className="flex flex-col gap-2 max-h-[50vh] overflow-y-scroll">
            {!!filtered.length && (
              <div className="flex flex-col gap-2">
                {filtered.map((f, k) => (<FileItem key={k} className="bg-blue-100" resource={resource} file={f} />))}
              </div>
            )}

            {!files.length && <p>No files found.</p>} 
            {files.map((f, i) => (
              <FileItem key={i} resource={resource} file={f} />
            ))}
          </CardContent>
        </Card>
    </Mainlayout>
  );
}

export default Resource;