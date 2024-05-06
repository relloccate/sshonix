import PiniaInstance from './PiniaInstance';
import { defineStore } from 'pinia';
import { ConnectionStatus } from 'types/store.d';

import type { PiniaActiveTerminalItem, PiniaActiveTerminalsState } from 'types/store';

const StoreActiveTerminals = defineStore('StoreActiveTerminals', {
    state: (): PiniaActiveTerminalsState => {
        return {
            items: []
        };
    },
    actions: {
        add({ channel, serverId, type, cwd, exec }: PiniaActiveTerminalItem): void {
            this.items.push({
                channel,
                connection: {
                    status: ConnectionStatus.Init,
                    messages: []
                },
                serverId,
                type,
                cwd,
                exec
            });
        },
        remove(channel: PiniaActiveTerminalItem['channel']) {
            this.items = this.items.filter(item => item.channel !== channel);
        },
        changeConnectionStatus(channel: PiniaActiveTerminalItem['channel'], status: ConnectionStatus) {
            let element = this.items.find(item => item.channel === channel);

            if (element) {
                element.connection.status = status;
            }
        }
    }
})(PiniaInstance);

export default StoreActiveTerminals;
