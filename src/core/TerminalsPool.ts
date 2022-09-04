import TerminalLocal from './TerminalLocal';
import TerminalRemote from './TerminalRemote';
import { ipcMain } from 'electron';

import type { TTerminalLocal, TTerminalRemote } from 'types/core';
import type { WebContents } from 'electron';

class TerminalsPool {
    private runned: {
        [key: TTerminalLocal['channel']]: TerminalLocal | TerminalRemote;
    } = {};

    public webContentsInstance: WebContents | undefined = undefined;

    constructor() {
        ipcMain.handle('terminal:run', (event, { channel, cwd, exec, sizes, type, remoteData = {} }) => {
            if (!this.webContentsInstance) {
                this.webContentsInstance = event.sender;
            }

            if (type === 'remote') {
                this.runRemote({ channel, cwd, sizes, remoteData });
            } else {
                this.runLocal({ channel, cwd, exec, sizes });
            }
        });

        ipcMain.handle('terminal:close', (event, channel) => {
            this.close(channel);
        });
    }

    isRunned = (channel: TTerminalLocal['channel']) => {
        return this.runned[channel] !== undefined;
    };

    runRemote = ({ channel, cwd, sizes, remoteData }: TTerminalRemote) => {
        if (this.isRunned(channel)) return;
        this.runned[channel] = new TerminalRemote({ channel, cwd, sizes, remoteData }, this.webContentsInstance);
    };

    runLocal = ({ channel, cwd, sizes, exec }: TTerminalLocal) => {
        if (this.isRunned(channel)) return;
        this.runned[channel] = new TerminalLocal({ channel, cwd, sizes, exec }, this.webContentsInstance);
    };

    close = (channel: TTerminalLocal['channel']) => {
        if (this.isRunned(channel)) {
            ipcMain.removeAllListeners(`terminal:${channel}.on-key`);

            this.runned[channel].close();
            delete this.runned[channel];
        }
    };
}

export default new TerminalsPool();
