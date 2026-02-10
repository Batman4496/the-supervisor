import React from 'react';
import Header from './navigation/header';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import AddResourceDialog from './dialogs/add-resource-dialog';
import { useResource } from '@/providers/resource-provider';
import EditResourceDialog from './dialogs/edit-resource-dialog';

function Mainlayout (props: React.PropsWithChildren) {
  
  const resource = useResource();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="grid grid-cols-4 w-full h-full">
        <div className="flex flex-col gap-2 col-span-2 md:col-span-1 p-3 border-e-[1px] border-slate-500">
          <Card className="py-1">
            <CardContent className="py-1 px-2">
              <CardTitle className="flex flex-row justify-between items-center">
                Resources
                <div className="flex flex-row items-center justify-end">
                  <AddResourceDialog />
                </div>
              </CardTitle>
              
            </CardContent>

          </Card>
          <div className="flex flex-col gap-2 h-[70vh] overflow-y-scroll">
            {resource.resources.map((r) => (
              <div className="relative flex flex-row justify-between items-center px-1 md:px-2">
                <Button variant="link" onClick={() => navigate(`/resource/${r.id}`)}>{r.name}</Button>
                <div className="absolute h-full flex items-center justify-center right-0 px-2 text-black bg-white dark:bg-black dark:text-white">
                  <EditResourceDialog resource={r} />
                </div>
              </div>
            ))}
          </div>
          
        </div>
        <div className="col-span-3 p-3">
          {props.children}
        </div>
      </div>
    </div>
  );
}

export default Mainlayout;