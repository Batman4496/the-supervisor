import http from "http";
import { google } from "googleapis";
import { shell } from "electron";
import url from "url";
import Store from "electron-store";
import { GOOGLE_DRIVE_SCOPES } from "@/lib/constants";

export async function authenticate(clientId: string, clientSecret: string, store: Store) {

    const server = http.createServer(async (req, res) => {
        try {
            const address = server.address() as any;
            const port = address.port;
            const redirectUri = `http://127.0.0.1:${port}/callback`;
            const oauthClient = new google.auth.OAuth2({
                clientId: clientId,
                clientSecret: clientSecret,
                redirectUri: redirectUri
            });
            if (req?.url?.startsWith('/callback')) {
                const qs = new url.URL(req.url, 'http://127.0.0.1').searchParams;
                const code = qs.get('code');

                if (!code) {
                    res.end('Authentication failed!');
                    server.close();
                    return;
                }


                const { tokens } = await oauthClient.getToken(code);
                // Store tokens securely (e.g., in safeStorage or keytar)
                store.set('gdrive_refresh_token', tokens.refresh_token);
                store.set('gdrive_access_token', tokens.access_token);
                res.end('Authentication successful! You can close this tab.');
                server.close();
            }
        } catch (e) {
            console.log(e);
            res.end('Authentication failed.');
            server.close();
        }
    });

    server.listen(0, () => {
        if (!server) return;

        const address = server.address() as any;
        const port = address.port;
        const redirectUri = `http://127.0.0.1:${port}/callback`;
        const oauthClient = new google.auth.OAuth2({
            clientId: clientId,
            clientSecret: clientSecret,
            redirectUri: "http://127.0.0.1"
        });
        const authorizeUrl = oauthClient.generateAuthUrl({
            access_type: 'offline',
            scope: GOOGLE_DRIVE_SCOPES,
            redirect_uri: redirectUri
        });

        shell.openExternal(authorizeUrl);
    });
}