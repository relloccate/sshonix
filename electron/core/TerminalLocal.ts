import { ipcMain } from 'electron';
import { spawn } from 'node-pty';
import WebContentsInstance from './WebContentsInstance';

import type { TTerminalLocal } from 'types/core';

export default class TerminalLocal {
    private terminalProcess: ReturnType<typeof spawn> | undefined;

    constructor({ channel, cwd, sizes, exec }: TTerminalLocal) {
        try {
            const { cols, rows } = sizes;

            this.terminalProcess = spawn(exec, [], {
                name: 'xterm-256color',
                cols,
                rows,
                cwd
            });

            this.terminalProcess.onData(data => {
                WebContentsInstance.send(`terminal:${channel}.on-data`, data);
            });

            ipcMain.on(`terminal:${channel}.fit`, (event, { cols, rows }) => {
                this.terminalProcess?.resize(cols, rows);
            });

            ipcMain.on(`terminal:${channel}.on-key`, (event, data) => {
                if (this.terminalProcess) this.terminalProcess.write(data);
            });
        } catch (error) {
            console.log(error);
        }
    }

    close = () => {
        this.terminalProcess?.kill();
        this.terminalProcess = undefined;
    };
}
