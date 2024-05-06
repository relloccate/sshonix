import PiniaInstance from './PiniaInstance';
import { defineStore } from 'pinia';
import { ipcRenderer } from 'electron';
import { deproxy } from 'front/misc/Object';

import type { PiniaServersState, PiniaServersItem } from 'types/store';

const StoreServers = defineStore('StoreServers', {
    state: (): PiniaServersState => {
        return {
            items: []
        };
    },
    getters: {
        isHasTheSameHostPort() {
            return (host: string, port: number) => this.items.some(item => item.host === host && item.port === port);
        }
    },
    actions: {
        async fill() {
            const { items } = await ipcRenderer.invoke('settings:get', 'servers');

            this.items = items;
        },
        add(data: PiniaServersItem): void {
            const { title, description, host, port, login, auth, tags, os, mode } = data;

            this.items.unshift({
                id: Date.now(),
                title,
                description,
                host,
                port,
                login,
                auth,
                tags,
                os,
                mode
            });
        },
        remove(id: PiniaServersItem['id']): void {
            this.items = this.items.filter((item: PiniaServersItem) => item.id !== id);
        },
        getRemoteData(id: PiniaServersItem['id']) {
            let element = this.items.find(item => item.id === id);

            if (element) {
                const auth = element.auth.key.active ? { privateKey: element.auth.key.data, passphrase: element.auth.key.passphrase } : { password: element.auth.password.data };

                return {
                    host: element.host,
                    port: element.port,
                    login: element.login,
                    auth
                };
            }
        },
        updateServer(id: PiniaServersItem['id'], data: PiniaServersItem): void {
            let element = this.items.find(item => item.id === id);

            if (element) {
                element.title = data.title;
                element.description = data.description;
                element.host = data.host;
                element.port = data.port;
                element.login = data.login;
                element.auth = data.auth;
                element.tags = data.tags;
                element.os = data.os;
                element.mode = data.mode;
            }
        }
    }
})(PiniaInstance);

(async () => {
    let timeout: ReturnType<typeof setTimeout> | undefined;

    StoreServers.$onAction(({ name, after, store }) => {
        if (['add', 'remove', 'updateServer'].includes(name)) {
            after(() => {
                // SET TIMEOUT BEFORE SAVING, TO AVOID BURSTABLE WRITING TO THE ONE FILE
                if (timeout) clearTimeout(timeout);

                timeout = setTimeout(async () => {
                    await ipcRenderer.invoke(
                        'settings:write',
                        {
                            items: deproxy(store.items)
                        },
                        'servers'
                    );
                }, 250);
            });
        }
    });
})();

export default StoreServers;
