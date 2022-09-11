import { ipcMain } from 'electron';
import { Client } from 'ssh2';

import type { TTerminalRemote } from 'types/core';
import type { WebContents } from 'electron';

export default class TerminalRemote {
    private client: Client = new Client();

    constructor({ channel, sizes, remoteData }: TTerminalRemote, private webContentsInstance: WebContents | undefined) {
        try {
            const { port, login, auth, host } = remoteData;

            this.client.on('error', error => {
                this.webContentsInstance?.send(`terminal:${channel}.on-data`, error.message);
            });

            this.client.on('ready', () => {
                this.initPty(channel, sizes);
            });

            this.client.connect({
                port,
                username: login,
                ...auth,
                host
            });
        } catch (error) {
            console.log(error);
        }
    }

    initPty(channel: TTerminalRemote['channel'], sizes: TTerminalRemote['sizes']) {
        this.client.shell(sizes, (err, stream) => {
            if (err) throw err;

            ipcMain.on(`terminal:${channel}.on-key`, (event, data) => {
                stream.write(data);
            });

            ipcMain.on(`terminal:${channel}.fit`, (event, { rows, cols, height, width }) => {
                stream.setWindow(rows, cols, height, width);
            });

            stream.on('close', () => {
                this.client?.end();
            });

            stream.on('data', (data: Buffer) => {
                this.webContentsInstance?.send(`terminal:${channel}.on-data`, data);
            });

            stream.stderr.on('data', (data: Buffer) => {
                this.webContentsInstance?.send(`terminal:${channel}.on-data`, data);
            });
        });
    }

    close = () => {
        this.client.destroy();
    };
}
