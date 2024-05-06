import WebContentsInstance from './WebContentsInstance';
import { ipcMain } from 'electron';
import { Client } from 'ssh2';
import { ConnectionStatus } from 'types/store.d';

import type { TTerminalRemote } from 'types/core';
import type { ClientChannel } from 'ssh2';

export default class TerminalRemote {
    private client: Client = new Client();
    private connectOptions: TTerminalRemote['remoteData'];
    private reconnectTimeout: ReturnType<typeof setTimeout>;
    private sizes: TTerminalRemote['sizes'];
    private channel: TTerminalRemote['channel'];

    public status = {
        value: ConnectionStatus.Init,
        change: (value: ConnectionStatus) => {
            this.status.value = value;

            if (this.status.callback !== undefined) {
                this.status?.callback(value);
            }
        },
        callback: undefined
    };

    constructor({ channel, sizes, remoteData }: TTerminalRemote) {
        this.connectOptions = remoteData;
        this.channel = channel;
        this.sizes = sizes;

        this.client.on('close', this.onClose);
    }

    onClose = () => {
        if (this.status.value === ConnectionStatus.ClosedManually) return;

        if (this.status.value === ConnectionStatus.Connected || this.status.value === ConnectionStatus.Init) {
            this.status.change(ConnectionStatus.Disconnected);
        }

        if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);

        this.reconnectTimeout = setTimeout(this.connect, 2000);
    };

    _connect = () => {
        const { port, login, auth, host } = this.connectOptions;

        return new Promise((resolve, reject) => {
            this.client.connect({
                tryKeyboard: true,
                port,
                username: login,
                ...auth,
                host
            });

            const closeListeners = () => {
                this.client.removeAllListeners('ready');
                this.client.removeAllListeners('error');
            };

            this.client.on('ready', () => {
                resolve(this.client);
                closeListeners();
            });

            this.client.on('error', error => {
                reject(error);
                closeListeners();
            });
        });
    };

    connect = async () => {
        try {
            this.status.change(ConnectionStatus.Connecting);
            await this._connect();
            this.initPty();
            this.status.change(ConnectionStatus.Connected);

            if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
        } catch (error) {
            // @ts-ignore
            if (import.meta.env.DEV) {
                console.error(error);
            }

            if (error?.message.includes('authentication methods failed')) {
                this.close();
                this.status.change(ConnectionStatus.Unauthorized);
            }
        }
    };

    initPty = () => {
        this.client.shell({ ...this.sizes, term: 'xterm-256color' }, (err, stream) => {
            if (err) throw err;

            this.initIpc(stream);

            stream.on('close', this.closeIpc);
            stream.on('data', (data: Buffer) => {
                WebContentsInstance.send(`terminal:${this.channel}.on-data`, data);
            });

            stream.stderr.on('data', (data: Buffer) => {
                WebContentsInstance.send(`terminal:${this.channel}.on-data`, data);
            });
        });
    };

    exec = (command: string) => {
        return new Promise((resolve, reject) => {
            this.client.exec(command, (error, stream) => {
                if (error) reject(error);

                let output = '';

                stream.on('data', (data: string) => {
                    output += data;
                });

                stream.stderr.on('data', (data: string) => {
                    output += data;
                });

                stream.on('close', () => {
                    resolve(output);
                });
            });
        });
    };

    initIpc = (stream: ClientChannel) => {
        ipcMain.on(`terminal:${this.channel}.on-key`, (event, data) => {
            stream.write(data);
        });

        ipcMain.on(`terminal:${this.channel}.fit`, (event, { rows, cols, height, width }) => {
            this.sizes = { rows, cols, height, width };
            stream.setWindow(rows, cols, height, width);
        });
    };

    closeIpc = () => {
        ipcMain.removeAllListeners(`terminal:${this.channel}.on-key`);
        ipcMain.removeAllListeners(`terminal:${this.channel}.fit`);
    };

    close = () => {
        if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);

        this.status.change(ConnectionStatus.ClosedManually);
        this.client.removeAllListeners('close');

        this.closeIpc();
        this.client.end();
        this.client.destroy();
    };
}
