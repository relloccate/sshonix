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
        const data = this.runned[started].instance.getTransferProgressData();

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

    private sendTransferDone(started: PiniaActiveSftpTransfersItem['started'], webContents: WebContents) {
        webContents.send('sftp:transfer:progress', {
            event: 'done',
            data: { started }
        });
    }

    watchTransfer = ({ channel, type }: Pick<PiniaActiveSftpTransfersItem, 'channel' | 'type'>, instance: SftpTransfer, webContents: any) => {
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

        return () => {
            this.sendTransferUpdate(started, webContents);
            this.sendTransferDone(started, webContents);
            delete this.runned[started];

            if (Object.keys(this.runned).length === 0) {
                clearInterval(this.transfersWatcher);
                this.transfersWatcher = undefined;
            }
        };
    };
}
