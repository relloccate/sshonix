import SftpTransfer from './SftpTransfer';
import WebContentsInstance from './WebContentsInstance';

import type { PiniaActiveSftpTransfersItem } from 'types/store';

export default class SftpTransferWatcher {
    private transfersWatcher: ReturnType<typeof setInterval> | undefined;
    private runned: {
        [key: number]: {
            channel: number;
            type: 'download' | 'upload';
            instance: SftpTransfer;
        };
    } = {};

    private sendTransferUpdate(started: PiniaActiveSftpTransfersItem['started']) {
        const data = this.runned[started].instance.getTransferState();

        WebContentsInstance.send('sftp:transfer:progress', {
            event: 'update',
            data: {
                started,
                data
            }
        });
    }

    private sendTransferStart({ started, channel, type }: Pick<PiniaActiveSftpTransfersItem, 'channel' | 'started' | 'type'>) {
        WebContentsInstance.send('sftp:transfer:progress', {
            event: 'start',
            data: {
                started,
                channel,
                type
            }
        });
    }

    private sendTransferEnd({ started, status }: Pick<PiniaActiveSftpTransfersItem, 'started' | 'status'>) {
        const { type, channel } = this.runned[started];

        WebContentsInstance.send('sftp:transfer:progress', {
            event: 'end',
            data: {
                started,
                status,
                type,
                channel
            }
        });
    }

    add = ({ channel, type }: Pick<PiniaActiveSftpTransfersItem, 'channel' | 'type'>, instance: SftpTransfer) => {
        const started = Date.now();

        this.runned[started] = {
            channel,
            type,
            instance
        };

        this.sendTransferStart({ started, channel, type });

        if (!this.transfersWatcher) {
            this.transfersWatcher = setInterval(() => {
                for (const started of Object.keys(this.runned).map(item => Number(item))) {
                    this.sendTransferUpdate(started);
                }
            }, 250);
        }

        return started;
    };

    end = async (started: PiniaActiveSftpTransfersItem['started'], status?: 'done' | 'stopped', message?: string) => {
        if (!this.runned[started]) return;
        if (message) WebContentsInstance.send('sftp:message', message);

        this.sendTransferUpdate(started);

        if (status) {
            this.sendTransferEnd({ started, status });
        }

        this.destroySocketAndInterval(started);
    };

    destroySocketAndInterval = async (started: PiniaActiveSftpTransfersItem['started']) => {
        await this.runned[started].instance.close();
        delete this.runned[started];

        if (Object.keys(this.runned).length === 0) {
            clearInterval(this.transfersWatcher);
            this.transfersWatcher = undefined;
        }
    };
}
