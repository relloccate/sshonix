import PiniaInstance from './PiniaInstance';
import { defineStore } from 'pinia';

import type { PiniaActiveTerminalItem, PiniaActiveTerminalsState } from 'types/store';

const StoreActiveTerminals = defineStore('StoreActiveTerminals', {
    state: (): PiniaActiveTerminalsState => {
        return {
            items: []
        };
    },
    getters: {
        activeTerminal(state) {
            return state.items.filter(item => item.active)[0];
        }
    },
    actions: {
        add({ channel, added, title, type, cwd, exec }: PiniaActiveTerminalItem): void {
            this.items = this.items.map(item => {
                return {
                    ...item,
                    active: false
                };
            });

            this.items.push({
                channel,
                added,
                title,
                type,
                cwd,
                exec,
                active: true
            });
        },
        setActiveTerminal(channel: PiniaActiveTerminalItem['channel']): void {
            this.items = this.items.map(item => {
                return {
                    ...item,
                    active: item.channel === channel ? true : false
                };
            });
        },
        remove(channel: PiniaActiveTerminalItem['channel']) {
            this.items = this.items.filter(item => item.channel !== channel);

            if (this.items.length > 0) {
                return this.items[0].channel;
            }

            return null;
        }
    }
})(PiniaInstance);

export default StoreActiveTerminals;
