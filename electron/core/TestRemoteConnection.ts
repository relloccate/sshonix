import { ipcMain } from 'electron';
import { Client } from 'ssh2';

import type { TTerminalRemote } from 'types/core';

ipcMain.on('test-remote', async (event, { remoteData: { port, login, auth, host } }: Pick<TTerminalRemote, 'remoteData'>) => {
    try {
        const client = new Client();

        const sendVerdict = (verdict: 'fail' | 'timeout' | 'success') => {
            client.end();
            event.sender.send('test-remote', {
                verdict
            });
        };

        client.on('error', () => {
            sendVerdict('fail');
        });

        client.on('timeout', () => {
            sendVerdict('timeout');
        });

        client.on('ready', () => {
            sendVerdict('success');
        });

        client.connect({
            port,
            username: login,
            ...auth,
            host,
            readyTimeout: 5000,
            timeout: 5000
        });
    } catch {
        event.sender.send('test-remote', {
            verdict: 'fail'
        });
    }
});
