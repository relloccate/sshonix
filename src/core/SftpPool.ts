import Sftp from './Sftp';
import SftpTransfer from './SftpTransfer';
import SftpTransferWatcher from './SftpTransferWatcher';
import { ipcMain } from 'electron';

import type { TTerminalRemote } from 'types/core';
import type { WebContents } from 'electron';

class SftpPool {
    private runned: {
        [key: TTerminalRemote['channel']]: Sftp;
    } = {};

    public webContentsInstance: WebContents | undefined = undefined;
    private watcher = new SftpTransferWatcher();

    constructor() {
        ipcMain.handle('sftp:connect', async (event, { channel, remoteData = {} }) => {
            try {
                if (!this.webContentsInstance) {
                    this.webContentsInstance = event.sender;
                }

                const { port, login, auth, host } = remoteData;

                this.runned[channel] = new Sftp({
                    port,
                    username: login,
                    ...auth,
                    host
                });

                await this.runned[channel].connect();
            } catch (error: any) {
                this.webContentsInstance?.send('sftp:message', error.message);
            }
        });

        ipcMain.handle('sftp:list', async (event, { channel, path }) => {
            try {
                return await this.runned[channel].list(path);
            } catch (error: any) {
                this.webContentsInstance?.send('sftp:message', error.message);
            }
        });

        ipcMain.handle('sftp:edit:get', async (event, { channel, from }) => {
            try {
                return await this.runned[channel].getQuickEdit(from);
            } catch (error: any) {
                this.webContentsInstance?.send('sftp:message', error.message);
            }
        });

        ipcMain.handle('sftp:edit:write', async (event, { channel, to, data }) => {
            try {
                return await this.runned[channel].writeQuickEdit(to, data);
            } catch (error: any) {
                console.log(error.message);

                this.webContentsInstance?.send('sftp:message', error.message);
            }
        });

        ipcMain.handle('sftp:download', async (event, { channel, to, items }) => {
            const connectOptions = this.runned[channel].connectOptions;
            const transfer = new SftpTransfer(connectOptions);
            const watchTransfer = this.watcher.watchTransfer({ channel, type: 'download' }, transfer, this.webContentsInstance);

            try {
                await transfer.connect();
                await transfer.download(to, items);

                this.webContentsInstance?.send('sftp:message', 'Downloaded');
            } catch (error: any) {
                this.webContentsInstance?.send('sftp:message', error.message);
            } finally {
                watchTransfer();
                await transfer.close();
            }
        });

        ipcMain.handle('sftp:upload', async (event, { channel, to, items }) => {
            const connectOptions = this.runned[channel].connectOptions;
            const transfer = new SftpTransfer(connectOptions);
            const watchTransfer = this.watcher.watchTransfer({ channel, type: 'upload' }, transfer, this.webContentsInstance);

            try {
                await transfer.connect();
                await transfer.upload(to, items);

                this.webContentsInstance?.send('sftp:message', 'Uploaded');
            } catch (error: any) {
                this.webContentsInstance?.send('sftp:message', error.message);
            } finally {
                watchTransfer();
                await transfer.close();
            }
        });

        ipcMain.handle('sftp:create', async (event, { channel, type, path: { remote } }) => {
            try {
                await this.runned[channel].create(remote, type);
                this.webContentsInstance?.send('sftp:message', 'Created');
            } catch (error: any) {
                this.webContentsInstance?.send('sftp:message', error.message);
            }
        });

        ipcMain.handle('sftp:delete', async (event, { channel, items }) => {
            try {
                await this.runned[channel].delete(items);
                this.webContentsInstance?.send('sftp:message', 'Deleted');
            } catch (error: any) {
                this.webContentsInstance?.send('sftp:message', error.message);
            }
        });

        ipcMain.handle('sftp:rename', async (event, { channel, from, to }) => {
            try {
                await this.runned[channel].rename(from, to);
                this.webContentsInstance?.send('sftp:message', 'Renamed');
            } catch (error: any) {
                this.webContentsInstance?.send('sftp:message', error.message);
            }
        });

        ipcMain.handle('sftp:close', (event, channel) => {
            try {
                this.close(channel);
            } catch (error: any) {
                this.webContentsInstance?.send('sftp:message', error.message);
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
