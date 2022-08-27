import PiniaInstance from './PiniaInstance';
import { defineStore } from 'pinia';

import type { PiniaNotificationsState, PiniaNotificationsItem } from 'types/store';

const StoreNotifications = defineStore('StoreNotifications', {
    state: (): PiniaNotificationsState => {
        return {
            notifications: []
        };
    },
    actions: {
        add({ text }: Pick<PiniaNotificationsItem, 'text'>): void {
            this.notifications.unshift({
                text,
                added: Date.now()
            });
        },
        remove(added: PiniaNotificationsItem['added']) {
            this.notifications = this.notifications.filter(item => item.added !== added);
        }
    }
})(PiniaInstance);

export default StoreNotifications;
