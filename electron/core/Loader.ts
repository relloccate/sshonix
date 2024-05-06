import './TerminalsPool';
import './TestRemoteConnection';
import './SftpPool';
import './ElectronDialog';

import Settings from './Settings';
import { ipcMain } from 'electron';

ipcMain.handle('settings:get', async (event, scope: 'servers' | 'main') => {
    try {
        return await Settings.get(scope);
    } catch (error) {
        console.log(error);
    }
});

ipcMain.handle('settings:write', async (event, data, scope: 'servers' | 'main') => {
    try {
        return await Settings.write(data, scope);
    } catch (error) {
        console.log(error);
    }
});

// import { Client } from 'basic-ftp';
// // ESM: import { Client } from "basic-ftp"

// (async () => {
//     const client = new Client();

//     try {
//         await client.access({
//             host: 'localhost',
//             port: 22,
//             user: 'foo',
//             password: 'pass',
//             secure: true
//         });

//         console.log('kle');

//         console.log(await client.list('/'));
//         console.log('passt');

//         // await client.uploadFrom("README.md", "README_FTP.md")
//         // await client.downloadTo("README_COPY.md", "README_FTP.md")
//     } catch (err) {
//         console.log(err);
//     }

//     client.close();
// })();

// import Client from 'ssh2-sftp-client';
// let sftp = new Client();

// (async () => {
//     try {
//         await sftp.connect({
//             host: 'localhost',
//             port: 22,
//             username: 'foo',
//             password: 'pass'
//         });

//         console.time('time');
//         const data = await sftp.list('/');
//         console.timeEnd('time');

//         console.log(data);
//     } catch (error) {
//         console.log(error);
//     }
// })();
