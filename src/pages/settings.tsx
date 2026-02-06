import React, { useEffect, useState } from 'react';
import Mainlayout from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { browse, setData } from '@/lib/utils';

function Settings() {
  const [settings, setSettings] = useState({
    trove_api_key: '',
    trove_api_url: '',
    gdrive_client_id: '',
    gdrive_client_secret: '',
    gdrive_refresh_token: '',
    gdrive_access_token: ''
  });
  
  async function load() {
    Object.keys(settings).forEach(async (k) => {
      const v = await window.api.store.get(k);
      setData<any>(k, v ?? '', setSettings);
    });
  }

  useEffect(() => {
    load();
  }, []);
  

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();    
    console.log(settings);
    await window.api.store.save(settings);
  }
  
  async function getGoogleToken() {
    const res = await window.api.oauth.googleToken(settings.gdrive_client_id, settings.gdrive_client_secret);
    if (res) load();
  }

  return (
    <Mainlayout>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="flex flex-col gap-2">
            <CardTitle>Google Drive</CardTitle>
            <div className="flex flex-col gap-2">
              <Input placeholder="GDrive Client ID" value={settings.gdrive_client_id || ''} onChange={(e) => setData('gdrive_client_id', e.target.value, setSettings)} />
              <Input placeholder="GDrive Client Secret" value={settings.gdrive_client_secret || ''} onChange={(e) => setData('gdrive_client_secret', e.target.value, setSettings)} />
              <Input placeholder="GDrive Refresh Token" defaultValue={settings.gdrive_refresh_token || ''} disabled readOnly />
              <Input placeholder="GDrive Access Token" defaultValue={settings.gdrive_access_token || ''} disabled readOnly />
            </div>
            <div>
            <Button type="button" className="bg-green-600 hover:bg-green-800" onClick={getGoogleToken}>Authorize</Button>
            </div>

          </CardContent>

           <CardFooter>
            <Button>Save</Button>
          </CardFooter>
        </Card>
      </form>
    </Mainlayout>
  );
}

export default Settings;