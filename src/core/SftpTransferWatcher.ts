import SftpTransfer from './SftpTransfer';

import type { PiniaActiveSftpTransfersItem } from 'types/store';
import type { WebContents } from 'electron';

export default class SftpTransferWatcher {
    private transfersWatcher: ReturnType<typeof setInterval> | undefined;
    private runned: {
        [key: number]: {
            channel: number;
            type: 'download' | 'upload';
            instance: SftpTransfer;
            webContents: WebContents;
        };
    } = {};

    private sendTransferUpdate(started: PiniaActiveSftpTransfersItem['started'], webContents: WebContents) {
        const data = this.runned[started].instance.getTransferState();

        webContents.send('sftp:transfer:progress', {
            event: 'update',
            data: {
                started,
                data
            }
        });
    }

    private sendTransferStart({ started, channel, type }: Pick<PiniaActiveSftpTransfersItem, 'channel' | 'started' | 'type'>, webContents: WebContents) {
        webContents.send('sftp:transfer:progress', {
            event: 'start',
            data: {
                started,
                channel,
                type
            }
        });
    }

    private sendTransferEnd({ started, status }: Pick<PiniaActiveSftpTransfersItem, 'started' | 'status'>, webContents: WebContents) {
        const { type, channel } = this.runned[started];

        webContents.send('sftp:transfer:progress', {
            event: 'end',
            data: {
                started,
                status,
                type,
                channel
            }
        });
    }

    add = ({ channel, type }: Pick<PiniaActiveSftpTransfersItem, 'channel' | 'type'>, instance: SftpTransfer, webContents: any) => {
        const started = Date.now();

        this.runned[started] = {
            channel,
            type,
            instance,
            webContents
        };

        this.sendTransferStart({ started, channel, type }, webContents);

        if (!this.transfersWatcher) {
            this.transfersWatcher = setInterval(() => {
                for (const started of Object.keys(this.runned).map(item => Number(item))) {
                    this.sendTransferUpdate(started, webContents);
                }
            }, 250);
        }

        return started;
    };

    end = async (started: PiniaActiveSftpTransfersItem['started'], webContents: any, status?: 'done' | 'stopped', message?: string) => {
        if (!this.runned[started]) return;
        if (message) webContents.send('sftp:message', message);

        this.sendTransferUpdate(started, webContents);

        if (status) {
            this.sendTransferEnd({ started, status }, webContents);
        }

        this.destroySocketAndInterval(started);
    };

    destroySocketAndInterval = async (started: PiniaActiveSftpTransfersItem['started']) => {
        // FIXME: MOVE CLOSE SOCKET
        await this.runned[started].instance.close();
        delete this.runned[started];

        if (Object.keys(this.runned).length === 0) {
            clearInterval(this.transfersWatcher);
            this.transfersWatcher = undefined;
        }
    };
}
