import { ipcMain } from 'electron';
import { spawn } from 'node-pty';
import { platform } from 'os';

import type { TTerminalLocal } from 'types/core';
import type { WebContents } from 'electron';

export default class TerminalLocal {
    private terminalProcess: ReturnType<typeof spawn> | undefined;

    constructor({ channel, cwd, sizes }: TTerminalLocal, webContentsInstance: WebContents | undefined) {
        try {
            if (webContentsInstance) {
                const shell = platform() === 'win32' ? 'powershell.exe' : 'bash';
                const { cols, rows } = sizes;

                this.terminalProcess = spawn(shell, [], {
                    cols,
                    rows,
                    cwd
                });

                this.terminalProcess.onData(data => {
                    webContentsInstance.send(`terminal:${channel}.on-data`, data);
                });

                ipcMain.on(`terminal:${channel}.fit`, (event, { cols, rows }) => {
                    this.terminalProcess?.resize(cols, rows);
                });

                ipcMain.on(`terminal:${channel}.on-key`, (event, data) => {
                    if (this.terminalProcess) this.terminalProcess.write(data);
                });
            }
        } catch (error) {
            console.log(error);
        }
    }

    close = () => {
        this.terminalProcess?.kill();
        this.terminalProcess = undefined;
    };
}
