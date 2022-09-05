import PiniaInstance from './PiniaInstance';
import { defineStore } from 'pinia';

import type { PiniaActiveSftpTransfers, PiniaActiveSftpTransfersItem } from 'types/store';
import type { TSftpTransfers } from 'types/core';

export default defineStore('StoreActiveSftpTransfers', {
    state: (): PiniaActiveSftpTransfers => {
        return {
            items: []
        };
    },
    actions: {
        add({ started, type, channel }: PiniaActiveSftpTransfersItem): void {
            this.items.push({
                started,
                channel,
                type,
                errors: [],
                status: 'in-progress',
                files: {
                    done: [],
                    wait: [],
                    inProgress: {}
                }
            });
        },
        end({ started, status }: PiniaActiveSftpTransfersItem): void {
            const element = this.items.find(item => item.started === started);

            if (element) {
                element.status = status;
                element.files.inProgress = {};
            }
        },
        remove({ started }: PiniaActiveSftpTransfersItem): void {
            this.items = this.items.filter(item => item.started !== started);
        },
        update({ started, data }: { started: PiniaActiveSftpTransfersItem['started']; data: TSftpTransfers & Pick<PiniaActiveSftpTransfersItem, 'errors'> }) {
            const element = this.items.find(item => item.started === started);

            if (element) {
                if (element.type === 'upload') {
                    element.files.done.push(...data.done);
                    element.files.inProgress = data.inProgress;
                }

                if (element.type === 'download') {
                    element.files.done.push(...data.done);
                    element.files.inProgress = data.inProgress;
                }

                element.errors.push(...data.errors);
            }
        }
    }
})(PiniaInstance);
