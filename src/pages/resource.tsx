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
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [filtered, setFiltered] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchData, setSearchData] = useState<FileSearchData>({
    resourceId: resource?.id ?? 0,
    search: '',
    limit: SEARCH_LIMIT,
    offset: 0
  })

  useEffect(() => {
    setLoading(true);
    window.api.resource.get(Number(params.resourceId)).then((resource: ResourceRecord) => {
      if (resource) {
        setResource(resource);
        setData('resourceId', resource.id, setSearchData);
        setData('search', '', setSearchData);
        setData('offset', 0, setSearchData);
        setFiles([]);
        setFiltered([]);
        setLoading(false);
      } else {
        navigate('/');
      }
    });
  }, [params.resourceId]);

  useEffect(() => {
    loadMore();
  }, [resource]);

  useEffect(() => {
    if (!searchData.search || searchData.search.trim().length < 2 && files.length !== filtered.length) {
      return setFiltered([]);
    }

    const timeout = setTimeout(() => {
      window.api.file.search({ resourceId: searchData.resourceId, search: searchData.search, limit: 10 }).then((fs: FileRecord[]) => {
        setFiltered(fs);
      });
    }, 500);

    return () => {
      clearTimeout(timeout);
    }
  }, [searchData.search]);


  async function loadMore() {
    window.api.file.search({
      resourceId: searchData.resourceId,
      limit: searchData.limit,
      offset: searchData.offset,
    }).then((fs: FileRecord[]) => {
        setSearchData(prev => ({
          ...prev,
          offset: fs.length < (prev.limit ?? SEARCH_LIMIT) ? -1 : ((prev.offset ?? -1) + (prev.limit ?? 0))
        }));
        setFiles(prev => ([...prev, ...fs]));
    });
    
  }

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
        <p className="text-blue-500 text-start cursor-pointer" onClick={() => window.api.openFolder(resource?.targetPath)}>{resource?.targetPath}</p>
      </div>
        <Card>
          <CardHeader>
            <Input placeholder="Search files..." value={searchData.search} onChange={(e) => setSearchData(prev => ({ ...prev, search: e.target.value}))}  />

          </CardHeader>

          <CardContent className="flex flex-col gap-2 max-h-[50vh] overflow-y-scroll">
            {!!filtered.length && (
              <div className="flex flex-col gap-2">
                {filtered.map(f => (<FileItem className="bg-blue-100" resource={resource} file={f} />))}
              </div>
            )}

            {!files.length && <p>No files found.</p>} 
            {files.map((f) => (
              <FileItem resource={resource} file={f} />
            ))}
            
            {searchData.offset !== -1 && (
              <Button variant="outline" onClick={() => loadMore()}>Load More</Button>
            )}
          </CardContent>
        </Card>
    </Mainlayout>
  );
}

export default Resource;