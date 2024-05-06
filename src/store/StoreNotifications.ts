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
                id: Date.now()
            });
        },
        remove(id: PiniaNotificationsItem['id']) {
            this.notifications = this.notifications.filter(item => item.id !== id);
        }
    }
})(PiniaInstance);

export default StoreNotifications;
