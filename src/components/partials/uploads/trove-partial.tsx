import React from 'react';
import { UploadPartial } from "@/types";
import { setData } from '@/lib/utils';
import { Input } from '@/components/ui/input';

function TrovePartial(props: UploadPartial) {
  const { payload, setPayload } = props;

  return (
    <>
      <Input placeholder="Enter Folder ID" type="text" value={payload.data?.folderId ?? ''} onChange={(e) => setPayload(prev => ({...prev, data: { ...prev.data, folderId: e.target.value }}))} required />
    </>
  );
}

export default TrovePartial;