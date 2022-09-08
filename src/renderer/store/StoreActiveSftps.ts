import PiniaInstance from './PiniaInstance';
import { defineStore } from 'pinia';
import { ipcRenderer } from 'electron';

import type { PiniaActiveTerminalItem, PiniaActiveSftpsItem, PiniaActiveSftpsState } from 'types/store';
import type { FileInfo } from 'ssh2-sftp-client';

const StoreActiveSftps = defineStore('StoreActiveSftps', {
    state: (): PiniaActiveSftpsState => {
        return {
            items: []
        };
    },
    actions: {
        add({ channel, added }: { channel: PiniaActiveTerminalItem['channel']; added: PiniaActiveTerminalItem['added'] }): void {
            this.items.push({
                channel,
                added,
                files: [],
                search: '',
                currentPath: '/',
                history: [],
                sort: {
                    by: 'name',
                    asc: true
                }
            });
        },
        remove(channel: PiniaActiveTerminalItem['channel']) {
            this.items = this.items.filter(item => item.channel !== channel);
        },
        sort(channel: PiniaActiveTerminalItem['channel'], by: PiniaActiveSftpsItem['sort']['by']) {
            let element = this.items.find(item => item.channel === channel);

            if (element) {
                element.sort = {
                    by,
                    asc: !element.sort.asc
                };
            }
        },
        search(channel: PiniaActiveTerminalItem['channel'], text: string) {
            let element = this.items.find(item => item.channel === channel);

            if (element) {
                element.search = text;
            }
        },
        setRenaming(channel: PiniaActiveTerminalItem['channel'], file: FileInfo, status: boolean = false, value: string) {
            let element = this.items.find(item => item.channel === channel);

            if (element) {
                const fileElement = element.files.find(item => file.name === item.data.name);

                if (fileElement) {
                    fileElement.renaming = {
                        status,
                        value
                    };
                }
            }
        },
        select(channel: PiniaActiveTerminalItem['channel'], file: FileInfo, deselectOthers: boolean = false, ranged: boolean = false) {
            let element = this.items.find(item => item.channel === channel);

            if (deselectOthers) {
                this.setSelectingAll(channel, false);
            }

            if (element) {
                const fileElement = element.files.find(item => file.name === item.data.name);

                if (fileElement) {
                    fileElement.selected = !fileElement.selected;
                }
            }
        },
        selectRange(channel: PiniaActiveTerminalItem['channel'], indexes: number[]) {
            let element = this.items.find(item => item.channel === channel);

            if (element) {
                this.setSelectingAll(channel, false);

                for (const item of element.files) {
                    if (indexes.includes(item.index)) {
                        item.selected = true;
                    }
                }
            }
        },
        setSelectingAll(channel: PiniaActiveTerminalItem['channel'], selected: boolean) {
            let element = this.items.find(item => item.channel === channel);

            if (element) {
                // bug fix: if the user has filtered and pressed CTRL + A, then all items will be selected, not those that are filtered
                // @ts-ignore
                const items = selected && element.search.length > 0 ? element.files.filter(({ data }) => new RegExp(element.search, 'i').test(data.name)) : element.files;

                for (const file of items) {
                    if (file.selected !== selected) {
                        file.selected = selected;
                    }
                }
            }
        },
        async init(channel: PiniaActiveTerminalItem['channel']) {
            let element = this.items.find(item => item.channel === channel);

            if (element) {
                const files: FileInfo[] = await getIpcSftpFiles(channel, element.currentPath);

                if (files) {
                    element.history.push(element.currentPath);
                    element.files = files.map((file, index) => ({
                        index,
                        renaming: {
                            status: false,
                            value: ''
                        },
                        selected: false,
                        data: Object.freeze(file)
                    }));
                }
            }
        },
        async choosePath(channel: PiniaActiveTerminalItem['channel'], path: string, append: boolean = false) {
            let element = this.items.find(item => item.channel === channel);

            if (element) {
                const nextPath = append ? `${element.currentPath}${path}/` : path;
                const files: FileInfo[] = await getIpcSftpFiles(channel, nextPath);

                if (files) {
                    element.currentPath = nextPath;
                    element.history.push(nextPath);
                    element.files = files.map((file, index) => ({
                        index,
                        renaming: {
                            status: false,
                            value: ''
                        },
                        selected: false,
                        data: Object.freeze(file)
                    }));
                }
            }
        },
        async refresh(channel: PiniaActiveTerminalItem['channel']) {
            let element = this.items.find(item => item.channel === channel);

            if (element) {
                const files: FileInfo[] = await getIpcSftpFiles(channel, element.currentPath);

                if (files) {
                    element.files = files.map((file, index) => ({
                        index,
                        renaming: {
                            status: false,
                            value: ''
                        },
                        selected: false,
                        data: Object.freeze(file)
                    }));
                }
            }
        },
        async back(channel: PiniaActiveTerminalItem['channel']) {
            let element = this.items.find(item => item.channel === channel);

            if (element && element.history.length > 1) {
                const nextHistory = element.history.slice(0, -1);
                const lastHistory = nextHistory[nextHistory.length - 1];

                const files: FileInfo[] = await getIpcSftpFiles(channel, lastHistory);

                if (files) {
                    element.history = nextHistory;
                    element.currentPath = lastHistory;
                    element.files = files.map((file, index) => ({
                        index,
                        renaming: {
                            status: false,
                            value: ''
                        },
                        selected: false,
                        data: Object.freeze(file)
                    }));
                }
            }
        }
    }
})(PiniaInstance);

export default StoreActiveSftps;

export const getIpcSftpFiles = async (channel: PiniaActiveTerminalItem['channel'], path: PiniaActiveSftpsItem['currentPath']) => {
    return await ipcRenderer.invoke('sftp:list', {
        channel,
        path
    });
};

export const getSelectedFiles = (channel: PiniaActiveTerminalItem['channel']) => {
    const [{ files, currentPath }] = StoreActiveSftps.items.filter(item => item.channel === channel);
    const result = [];

    for (const { selected, data } of files) {
        if (selected) {
            result.push({
                type: data.type,
                name: data.name,
                path: `${currentPath}${data.name}`
            });
        }
    }

    return result;
};
