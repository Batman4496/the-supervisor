import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useState } from 'react';
import { ImportData, DownloadData, ResourceData } from '@/types';
import { SERVICES } from '@/lib/constants';
import { ImportSchema, QueueSchema } from '@/validations/upload-validator';
import { browse } from '@/lib/utils';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';

function AddResourceDialog() {
  const [open, setOpen] = useState(false);

  const uploadForm = useForm({
    resolver: zodResolver(QueueSchema),
    defaultValues: {
      type: 'local'
    }
  });

  const uploadType = uploadForm.watch('type');

  const importForm = useForm({
    resolver: zodResolver(ImportSchema),
    defaultValues: {
      type: 'google-drive'
    }
  });

  const downloadForm = useForm({
    resolver: zodResolver(QueueSchema),
    defaultValues: {
      type: 'google-drive',
      data: {
        downloadFiles: false
      }
    }
  });

  const onUploadSubmit = (values: ResourceData) => {
    window.api.queue.add({ ...values, queueType: 'upload' });
    setOpen(false);
    uploadForm.reset();
  };

  const onDownloadSubmit = async (values: DownloadData) => {
    window.api.queue.add({ ...values, queueType: 'download' });
    setOpen(false);
    importForm.reset();
  };

  const onImportSubmit = async (values: ImportData) => {
    await window.api.manifest.import(values);
    setOpen(false);
    importForm.reset();
  };


  const handleBrowse = async (form: any, field: string, options?: string[]) => {
    const path = await browse(options);
    if (path) form.setValue(field, path, { shouldValidate: true });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button className="p-1">+</Button></DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <Tabs defaultValue="Upload">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="Upload">Upload</TabsTrigger>
            <TabsTrigger value="Download">Download</TabsTrigger>
            <TabsTrigger value="Import">Import</TabsTrigger>
          </TabsList>

          {/* UPLOAD TAB */}
          <TabsContent value="Upload">
            <Form {...uploadForm}>
              <form onSubmit={uploadForm.handleSubmit(onUploadSubmit)} className="space-y-4">
                <h2 className="text-2xl font-semibold m-0">Upload</h2>
                <p className="text-gray-500">Upload a directory to available services</p>

                <FormField
                  control={uploadForm.control}
                  name="name"
                  render={({ field }: any) => (
                    <FormItem>
                      <FormControl><Input placeholder="Project Name" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={uploadForm.control}
                  name="description"
                  render={({ field }: any) => (
                    <FormItem>
                      <FormControl><Textarea placeholder="Description" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex gap-2">
                  <FormField
                    control={uploadForm.control}
                    name="sourcePath"
                    render={({ field }: any) => (
                      <FormItem className="flex-1">
                        <FormControl><Input placeholder="Source Path" {...field} readOnly /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="button" onClick={() => handleBrowse(uploadForm, 'sourcePath')}>Browse</Button>
                </div>

                <div className="flex gap-2">
                  <FormField
                    control={uploadForm.control}
                    name="targetPath"
                    render={({ field }: any) => (
                      <FormItem className="flex-1">
                        <FormControl><Input placeholder="Target Path" {...field} readOnly={uploadType === 'local'} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {uploadType === 'local' && (
                    <Button type="button" onClick={() => handleBrowse(uploadForm, 'targetPath')}>Browse</Button>
                  )}
                </div>

                <FormField
                  control={uploadForm.control}
                  name="type"
                  defaultValue='local'
                  render={({ field }: any) => (
                    <FormItem>
                      <RadioGroup
                        onValueChange={(val) => {
                          field.onChange(val);
                          const s = SERVICES.find(s => s.id === val);
                          if(s) {
                            uploadForm.setValue('targetPath', s.targetPath || '');
                          }
                        }} 
                        defaultValue={field.value}
                      >
                        {SERVICES.map(s => (
                          <div key={s.id} className="flex items-center space-x-2">
                            <RadioGroupItem value={s.id} id={s.id} />
                            <Label htmlFor={s.id}>{s.name}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">Upload</Button>
              </form>
            </Form>
          </TabsContent>

          {/* DOWNLOAD TAB */}
          <TabsContent value="Download">
            <Form {...downloadForm}>
              <form onSubmit={downloadForm.handleSubmit(onDownloadSubmit)} className="space-y-4">
                <h2 className="text-2xl font-semibold m-0">Download</h2>
                <p className="text-gray-500">Download a project from remote service</p>

                <FormField
                  control={downloadForm.control}
                  name="name"
                  render={({ field }: any) => (
                    <FormItem>
                      <FormControl><Input placeholder="Project Name" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={downloadForm.control}
                  name="description"
                  render={({ field }: any) => (
                    <FormItem>
                      <FormControl><Textarea placeholder="Description" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />


                <div className="flex gap-2">
                  <FormField
                    control={downloadForm.control}
                    name="sourcePath"
                    render={({ field }: any) => (
                      <FormItem className="flex-1">
                        <FormControl><Input placeholder="Download Path" {...field} readOnly /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="button" onClick={() => handleBrowse(downloadForm, 'sourcePath')}>Browse</Button>
                </div>
                                
                <div className="flex gap-2">
                  <FormField
                    control={downloadForm.control}
                    name="targetPath"
                    render={({ field }: any) => (
                      <FormItem className="flex-1">
                        <FormControl><Input placeholder="Target Path" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={downloadForm.control}
                  name="type"
                  render={({ field }: any) => (
                    <FormItem>
                      <RadioGroup
                        onValueChange={(val) => {
                          field.onChange(val);
                          const s = SERVICES.find(s => s.id === val);
                          if(s) {
                            downloadForm.setValue('targetPath', s.targetPath || '');
                          }
                        }} 
                        defaultValue={field.value}
                      >
                        {SERVICES.filter(s => s.id !== 'local').map(s => (
                          <div key={s.id} className="flex items-center space-x-2">
                            <RadioGroupItem value={s.id} id={s.id} />
                            <Label htmlFor={s.id}>{s.name}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormItem>
                  )}
                />

                <FormField 
                  control={downloadForm.control}
                  name="data.downloadFiles"
                  render={({field}: any) => (
                    <FormItem className="flex flex-row gap-2">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Download the files</FormLabel>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">Download</Button>
              </form>
            </Form>
          </TabsContent>

          {/* IMPORT TAB */}
          <TabsContent value="Import">
            <Form {...importForm}>
              <form onSubmit={importForm.handleSubmit(onImportSubmit)} className="space-y-4">
                <h2 className="text-2xl font-semibold m-0">Import</h2>
                <p className="text-gray-500">Import a resource from a download file</p>
                <div className="flex gap-2">
                  <FormField
                    control={importForm.control}
                    name="sourcePath"
                    render={({ field }: any) => (
                      <FormItem className="flex-1">
                        <FormControl><Input placeholder="Manifest File Path" {...field} readOnly /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="button" onClick={() => handleBrowse(importForm, 'sourcePath', ['openFile'])}>Browse</Button>
                </div>

                <div className="flex gap-2">
                  <FormField
                    control={importForm.control}
                    name="downloadPath"
                    render={({ field }: any) => (
                      <FormItem className="flex-1">
                        <FormControl><Input placeholder="Download Path" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="button" onClick={() => handleBrowse(importForm, 'downloadPath')}>Browse</Button>
                </div>
                
                <FormField
                  control={importForm.control}
                  name="type"
                  render={({ field }: any) => (
                    <FormItem>
                      <RadioGroup
                        onValueChange={(val) => {
                          field.onChange(val);
                        }} 
                        defaultValue={field.value}
                      >
                        {SERVICES.filter(s => s.id !== 'local').map(s => (
                          <div key={s.id} className="flex items-center space-x-2">
                            <RadioGroupItem value={s.id} id={s.id} />
                            <Label htmlFor={s.id}>{s.name}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">Import</Button>
              </form>
            </Form>
          </TabsContent>

        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default AddResourceDialog;