import TerminalLocal from './TerminalLocal';
import TerminalRemote from './TerminalRemote';
import { ipcMain } from 'electron';

import type { PiniaActiveTerminalItem } from 'types/store';
import type { TTerminalLocal, TTerminalRemote } from 'types/core';
import type { WebContents } from 'electron';

class TerminalsPool {
    private runned: {
        [key: TTerminalLocal['channel']]: TerminalLocal | TerminalRemote;
    } = {};

    public webContentsInstance: WebContents | undefined = undefined;

    constructor() {
        ipcMain.handle('terminal:run', (event, { channel, cwd, sizes, type, remoteData = {} }) => {
            if (!this.webContentsInstance) {
                this.webContentsInstance = event.sender;
            }

            this.run({ channel, cwd, type, remoteData, sizes });
        });

        ipcMain.handle('terminal:close', (event, channel) => {
            this.close(channel);
        });
    }

    isRunned = (channel: TTerminalLocal['channel']) => {
        return this.runned[channel] !== undefined;
    };

    run = ({ channel, cwd, type, sizes, remoteData }: TTerminalRemote & { type: PiniaActiveTerminalItem['type'] }) => {
        if (this.isRunned(channel)) return;

        if (type === 'local') {
            this.runned[channel] = new TerminalLocal({ channel, cwd, sizes }, this.webContentsInstance);
        } else {
            this.runned[channel] = new TerminalRemote({ channel, cwd, sizes, remoteData }, this.webContentsInstance);
        }
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
