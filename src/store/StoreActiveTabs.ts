import PiniaInstance from './PiniaInstance';
import { defineStore } from 'pinia';

import type { PiniaActiveTabItem, PiniaActiveTabsState } from 'types/store';

const StoreActiveTabs = defineStore('StoreActiveTabs', {
    state: (): PiniaActiveTabsState => {
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
        add({ channel, type, title, focus, active }: PiniaActiveTabItem): void {
            for (const item of this.items) {
                if (item.active) {
                    item.active = false;
                    break;
                }
            }

            this.items.push({
                channel,
                title: title.length > 0 ? title : 'No Title',
                type,
                focus,
                active
            });
        },
        setActiveTab(channel: PiniaActiveTabItem['channel']): void {
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
        remove(channel: PiniaActiveTabItem['channel']) {
            this.items = this.items.filter(item => item.channel !== channel);

            if (!this.items.length) return;

            setImmediate(() => {
                this.setActiveTab(this.items[this.items.length - 1].channel);
            });
        }
    }
})(PiniaInstance);

export default StoreActiveTabs;
