import SftpBase from './SftpBase';
import SftpTransfer from './SftpTransfer';
import SftpTransferWatcher from './SftpTransferWatcher';
import WebContentsInstance from './WebContentsInstance';
import { ipcMain } from 'electron';

import type { TTerminalRemote } from 'types/core';

class SftpPool {
    private runned: {
        [key: TTerminalRemote['channel']]: SftpBase;
    } = {};

    private watcher = new SftpTransferWatcher();

    constructor() {
        ipcMain.handle('sftp:connect', async (event, { channel, remoteData = {} }) => {
            try {
                const { port, login, auth, host } = remoteData;

                this.runned[channel] = new SftpBase({
                    port,
                    username: login,
                    ...auth,
                    host
                });

                this.runned[channel].status.callback = value => {
                    WebContentsInstance.send('sftp:ssh:connection', {
                        type: 'sftp',
                        channel,
                        event: 'status',
                        value
                    });
                };

                await this.runned[channel].connect();
            } catch (error: any) {
                WebContentsInstance.send('sftp:message', error.message);
            }
        });

        ipcMain.handle('sftp:list', async (event, { channel, path }) => {
            try {
                return await this.runned[channel].list(path);
            } catch (error: any) {
                WebContentsInstance.send('sftp:message', error.message);
            }
        });

        ipcMain.handle('sftp:edit:get', async (event, { channel, from }) => {
            try {
                return await this.runned[channel].getQuickEdit(from);
            } catch (error: any) {
                WebContentsInstance.send('sftp:message', error.message);
            }
        });

        ipcMain.handle('sftp:edit:write', async (event, { channel, to, data }) => {
            try {
                return await this.runned[channel].writeQuickEdit(to, data);
            } catch (error: any) {
                WebContentsInstance.send('sftp:message', error.message);
            }
        });

        ipcMain.handle('sftp:copy', async (event, { channel, files, to }) => {
            try {
                return await this.runned[channel].copy(files, to);
            } catch (error: any) {
                WebContentsInstance.send('sftp:message', error.message);
            }
        });

        ipcMain.handle('sftp:cut', async (event, { channel, files, to }) => {
            try {
                return await this.runned[channel].cut(files, to);
            } catch (error: any) {
                WebContentsInstance.send('sftp:message', error.message);
            }
        });

        ipcMain.on('sftp:download', async (event, { channel, to, items }) => {
            const connectOptions = this.runned[channel].connectOptions;
            const transfer = new SftpTransfer(connectOptions);
            const addedToWatcher = this.watcher.add({ channel, type: 'download' }, transfer);

            try {
                await transfer.connect();
                await transfer.download(to, items);

                this.watcher.end(addedToWatcher, 'done', 'Downloaded');
            } catch (error: any) {
                this.watcher.end(addedToWatcher);
            }
        });

        ipcMain.on('sftp:upload', async (event, { channel, to, items }) => {
            const connectOptions = this.runned[channel].connectOptions;
            const transfer = new SftpTransfer(connectOptions);
            const addedToWatcher = this.watcher.add({ channel, type: 'upload' }, transfer);

            try {
                await transfer.connect();
                await transfer.upload(to, items);

                this.watcher.end(addedToWatcher, 'done', 'Uploaded');
            } catch (error: any) {
                this.watcher.end(addedToWatcher);
            }
        });

        ipcMain.on('sftp:stop', async (event, started) => {
            this.watcher.end(started, 'stopped', 'Stopped');
        });

        ipcMain.handle('sftp:create', async (event, { channel, type, path: { remote } }) => {
            try {
                await this.runned[channel].create(remote, type);
                WebContentsInstance.send('sftp:message', 'Created');
            } catch (error: any) {
                WebContentsInstance.send('sftp:message', error.message);
            }
        });

        ipcMain.handle('sftp:delete', async (event, { channel, items }) => {
            try {
                return await this.runned[channel].delete(items);
            } catch (error: any) {
                WebContentsInstance.send('sftp:message', error.message);
            }
        });

        ipcMain.handle('sftp:rename', async (event, { channel, from, to }) => {
            try {
                return await this.runned[channel].rename(from, to);
            } catch (error: any) {
                WebContentsInstance.send('sftp:message', error.message);
            }
        });

        ipcMain.handle('sftp:close', (event, channel) => {
            try {
                this.close(channel);
            } catch (error: any) {
                WebContentsInstance.send('sftp:message', error.message);
            }
        });
    }

    isRunned = (channel: TTerminalRemote['channel']) => {
        return this.runned[channel] !== undefined;
    };

    close = (channel: TTerminalRemote['channel']) => {
        if (this.isRunned(channel)) {
            this.runned[channel].close();
            delete this.runned[channel];
        }
    };
}

export default new SftpPool();
