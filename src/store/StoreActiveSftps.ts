import PiniaInstance from './PiniaInstance';
import { defineStore } from 'pinia';
import { ipcRenderer } from 'electron';
import { ConnectionStatus } from 'types/store.d';

import type { PiniaActiveSftpsItem, PiniaActiveSftpsState } from 'types/store';
import type { FileInfo } from 'ssh2-sftp-client';

const StoreActiveSftps = defineStore('StoreActiveSftps', {
    state: (): PiniaActiveSftpsState => {
        return {
            items: [],
            buffer: {
                action: 'none',
                channel: 0,
                files: []
            }
        };
    },
    actions: {
        add({ channel, serverId }: { channel: PiniaActiveSftpsItem['channel']; serverId: PiniaActiveSftpsItem['serverId'] }): void {
            this.items.push({
                channel,
                connection: {
                    status: ConnectionStatus.Init,
                    messages: []
                },
                serverId,
                files: [],
                search: '',
                currentPath: '/',
                history: ['/'],
                sort: {
                    by: 'name',
                    splitFilesAndFolders: true,
                    asc: true
                }
            });
        },
        remove(channel: PiniaActiveSftpsItem['channel']) {
            this.items = this.items.filter(item => item.channel !== channel);
        },
        setBuffer({ action, channel, files }: PiniaActiveSftpsState['buffer']) {
            this.buffer = {
                action,
                channel,
                files
            };
        },
        sort(channel: PiniaActiveSftpsItem['channel'], by: PiniaActiveSftpsItem['sort']['by'], splitFilesAndFolders = true) {
            let element = this.items.find(item => item.channel === channel);

            if (element) {
                element.sort = {
                    by,
                    splitFilesAndFolders,
                    asc: !element.sort.asc
                };
            }
        },
        changeConnectionStatus(channel: PiniaActiveSftpsItem['channel'], status: ConnectionStatus) {
            let element = this.items.find(item => item.channel === channel);

            if (element) {
                element.connection.status = status;
            }
        },
        writeConnectionMessage(channel: PiniaActiveSftpsItem['channel'], message: string) {
            let element = this.items.find(item => item.channel === channel);

            if (element) {
                element.connection.messages.unshift(message);
            }
        },
        search(channel: PiniaActiveSftpsItem['channel'], text: string) {
            let element = this.items.find(item => item.channel === channel);

            if (element) {
                element.search = text;
            }
        },
        setRenaming(channel: PiniaActiveSftpsItem['channel'], file: FileInfo, status: boolean = false, value: string) {
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
        select(channel: PiniaActiveSftpsItem['channel'], file: FileInfo, deselectOthers: boolean = false) {
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
        selectRange(channel: PiniaActiveSftpsItem['channel'], indexes: number[]) {
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
        setSelectingAll(channel: PiniaActiveSftpsItem['channel'], selected: boolean) {
            let element = this.items.find(item => item.channel === channel);

            if (element) {
                // bug fix: if the user has filtered and pressed CTRL + A, then all items will be selected, not those that are filtered
                // @ts-ignore
                const items = selected && element.search.length > 0 ? element.files.filter(({ data }) => new RegExp(element.search, 'i').test(data.name)) : element.files;

                for (const file of items) {
                    if (file.selected !== selected) {
                        file.selected = selected;
                        file.renaming = {
                            status: false,
                            value: ''
                        };
                    }
                }
            }
        },
        // async init(channel: PiniaActiveSftpsItem['channel']) {
        //     let element = this.items.find(item => item.channel === channel);

        //     if (element) {
        //         const files: FileInfo[] = await getIpcSftpFiles(channel, element.currentPath);

        //         if (files) {
        //             element.history.push(element.currentPath);
        //             element.files = files.map((file, index) => ({
        //                 index,
        //                 renaming: {
        //                     status: false,
        //                     value: ''
        //                 },
        //                 selected: false,
        //                 data: Object.freeze(file)
        //             }));
        //         }
        //     }
        // },
        async choosePath(channel: PiniaActiveSftpsItem['channel'], path: string, append: boolean = false) {
            let element = this.items.find(item => item.channel === channel);

            if (element) {
                const nextPath = append ? `${element.currentPath}${path}/` : path;
                const files: FileInfo[] = await getIpcSftpFiles(channel, nextPath);

                if (files) {
                    element.currentPath = nextPath;
                    element.history.push(nextPath);
                    element.search = '';
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
        async refresh(channel: PiniaActiveSftpsItem['channel']) {
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
        async back(channel: PiniaActiveSftpsItem['channel']) {
            let element = this.items.find(item => item.channel === channel);

            if (element && element.history.length > 1) {
                const nextHistory = element.history.slice(0, -1);
                const lastHistory = nextHistory[nextHistory.length - 1];

                const files: FileInfo[] = await getIpcSftpFiles(channel, lastHistory);

                if (files) {
                    element.history = nextHistory;
                    element.currentPath = lastHistory;
                    element.search = '';
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

export const getIpcSftpFiles = async (channel: PiniaActiveSftpsItem['channel'], path: PiniaActiveSftpsItem['currentPath']) => {
    return await ipcRenderer.invoke('sftp:list', {
        channel,
        path
    });
};

export const getSelectedFiles = (channel: PiniaActiveSftpsItem['channel']) => {
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
