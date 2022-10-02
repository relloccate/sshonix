import Settings from 'core/Settings';
import PiniaInstance from './PiniaInstance';
import { defineStore } from 'pinia';
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
        fill(items: PiniaServersItem[]) {
            this.items = items;
        },
        add(data: PiniaServersItem): void {
            const { title, description, host, port, login, auth, tags, os, mode } = data;

            this.items.unshift({
                added: Date.now(),
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
        remove(added: PiniaServersItem['added']): void {
            this.items = this.items.filter((item: PiniaServersItem) => item.added !== added);
        },
        getRemoteData(added: PiniaServersItem['added']) {
            let element = this.items.find(item => item.added === added);

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
        updateServer(added: PiniaServersItem['added'], data: PiniaServersItem): void {
            let element = this.items.find(item => item.added === added);

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

StoreServers.$onAction(({ name, after, store }) => {
    if (['add', 'remove', 'updateServer'].includes(name)) {
        after(() => {
            Settings.writeToState('servers', store.items);
        });
    }
});

export default StoreServers;
