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
            for (const item of this.items) {
                if (item.active) {
                    item.active = false;
                    break;
                }
            }

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
            for (const item of this.items) {
                if (item.active && item.channel === channel) {
                    break;
                }

                if (item.active) {
                    item.active = false;
                }

                if (item.channel === channel) {
                    item.active = true;
                }
            }
        },
        remove(channel: PiniaActiveTerminalItem['channel']) {
            this.items = this.items.filter(item => item.channel !== channel);

            if (!this.items.length) return;

            setImmediate(() => {
                this.setActiveTerminal(this.items[this.items.length - 1].channel);
            });
        }
    }
})(PiniaInstance);

export default StoreActiveTerminals;
