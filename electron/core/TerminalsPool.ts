import WebContentsInstance from './WebContentsInstance';
import TerminalLocal from './TerminalLocal';
import TerminalRemote from './TerminalRemote';
import { ipcMain } from 'electron';

import type { TTerminalLocal, TTerminalRemote } from 'types/core';

process.on('uncaughtException', (error: Error & { errno: number }) => {
    if (error?.errno !== -4047) {
        console.error('GOT ERROR');
        console.error(error);
    }
});

class TerminalsPool {
    private runned: {
        [key: TTerminalLocal['channel']]: TerminalLocal | TerminalRemote;
    } = {};

    constructor() {
        ipcMain.handle('terminal:run', (event, { channel, cwd, exec, sizes, type, remoteData = {} }) => {
            if (type === 'remote') {
                this.runRemote({ channel, cwd, sizes, remoteData });
            } else {
                this.runLocal({ channel, cwd, exec, sizes });
            }
        });

        ipcMain.handle('terminal:close', (event, channel) => {
            this.close(channel);
        });

        ipcMain.handle('terminal:exec', async (event, { channel, command }) => {
            if (this.runned[channel] instanceof TerminalRemote) {
                return await this.runned[channel].exec(command);
            }
        });
    }

    isRunned = (channel: TTerminalLocal['channel']) => {
        return this.runned[channel] !== undefined;
    };

    runRemote = async ({ channel, cwd, sizes, remoteData }: TTerminalRemote) => {
        if (this.isRunned(channel)) return;

        this.runned[channel] = new TerminalRemote({ channel, cwd, sizes, remoteData });
        this.runned[channel].status.callback = value => {
            WebContentsInstance.send('sftp:ssh:connection', {
                type: 'ssh',
                channel,
                event: 'status',
                value
            });
        };

        await this.runned[channel].connect();
    };

    runLocal = ({ channel, cwd, sizes, exec }: TTerminalLocal) => {
        if (this.isRunned(channel)) return;
        this.runned[channel] = new TerminalLocal({ channel, cwd, sizes, exec });
    };

    close = (channel: TTerminalLocal['channel']) => {
        if (this.isRunned(channel)) {
            this.runned[channel].close();
            delete this.runned[channel];
        }
    };
}

export default new TerminalsPool();
