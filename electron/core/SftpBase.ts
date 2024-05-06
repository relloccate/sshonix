import Client from 'ssh2-sftp-client';
import { PassThrough } from 'stream';
import { splitArrayByChunks } from './Misc';
import { ConnectionStatus } from 'types/store.d';

import type { ConnectOptions } from 'ssh2-sftp-client';
import type { TSftpSelectedItems } from 'types/core';
import type { PiniaActiveSftpsState } from 'types/store';

export default class SftpBase {
    protected client: Client = new Client();
    private interval: ReturnType<typeof setInterval>;
    public status = {
        value: ConnectionStatus.Init,
        change: (value: ConnectionStatus) => {
            this.status.value = value;

            if (this.status.callback !== undefined) {
                this.status?.callback(value);
            }
        },
        callback: undefined
    };

    constructor(public connectOptions: ConnectOptions) {
        this.client.on('close', this.onClose);
    }

    onClose = () => {
        if (this.status.value === ConnectionStatus.ClosedManually) return;

        if (this.status.value === ConnectionStatus.Connected || this.status.value === ConnectionStatus.Init) {
            this.status.change(ConnectionStatus.Disconnected);
        }

        if (this.interval) clearInterval(this.interval);
        this.interval = setInterval(() => {
            this.connect();
        }, 2000);
    };

    connect = async () => {
        try {
            this.status.change(ConnectionStatus.Connecting);
            await this.client.connect(this.connectOptions);
            this.status.change(ConnectionStatus.Connected);

            if (this.interval) clearInterval(this.interval);
        } catch (error) {
            // @ts-ignore
            if (import.meta.env.DEV) {
                console.error(error);
            }

            if (error.message.includes('authentication methods failed')) {
                await this.close();
                this.status.change(ConnectionStatus.Unauthorized);
            }
        }
    };

    list = async (path: string) => {
        return await this.client.list(path);
    };

    create = async (remote: string, type: 'folder' | 'file') => {
        if (type === 'file') {
            return await this.client.put(Buffer.from([]), remote);
        } else {
            return await this.client.mkdir(remote, true);
        }
    };

    rename = async (from: string, to: string) => {
        await this.client.rename(from, to);
    };

    getQuickEdit = async (from: string) => {
        let data = '';
        const passthrought = new PassThrough();

        passthrought.on('data', chunk => {
            data += chunk;
        });

        await this.client.get(from, passthrought);

        return data;
    };

    copy = async (files: PiniaActiveSftpsState['buffer']['files'], to: string) => {
        const scan = async (file: TSftpSelectedItems, toDir: string) => {
            const initialName = file.name;

            const recursive = async (path, initialName) => {
                const list = await this.list(path);

                await this.create(initialName, 'folder');

                const directoriesList = list.filter(item => item.type === 'd');
                const filesList = list.filter(item => item.type === '-');

                for await (const chunk of splitArrayByChunks(filesList, 50)) {
                    await Promise.all(
                        chunk.map(item => {
                            return this.client.rcopy(path + '/' + item.name, initialName + '/' + item.name);
                        })
                    );
                }

                for await (const item of directoriesList) {
                    await recursive(path + '/' + item.name, initialName + '/' + item.name);
                }
            };

            await recursive(file.path, toDir + '/' + initialName);
        };

        const directoriesList = files.filter(item => item.type === 'd');
        const filesList = files.filter(item => item.type === '-');

        for await (const chunk of splitArrayByChunks(filesList, 50)) {
            await Promise.all(
                chunk.map(item => {
                    return this.client.rcopy(item.path, to + '/' + item.name);
                })
            );
        }

        for await (const chunk of splitArrayByChunks(directoriesList, 2)) {
            await Promise.all(
                chunk.map(item => {
                    return scan(item, to);
                })
            );
        }
    };

    cut = async (files: PiniaActiveSftpsState['buffer']['files'], to: string) => {
        for await (const chunk of splitArrayByChunks(files, 50)) {
            await Promise.all(
                chunk.map(item => {
                    return this.client.rename(item.path, to + '/' + item.name);
                })
            );
        }
    };

    writeQuickEdit = async (to: string, data: string) => {
        return await this.client.put(Buffer.from(data, 'utf-8'), to);
    };

    delete = async (items: TSftpSelectedItems[]) => {
        for await (const chunk of splitArrayByChunks(items, 25)) {
            await Promise.all(
                chunk.map(({ type, path }) => {
                    if (type === '-') {
                        return this.client.delete(path);
                    } else if (type === 'd') {
                        return this.client.rmdir(path, true);
                    }
                })
            );
        }
    };

    close = async () => {
        if (this.interval) clearInterval(this.interval);

        this.status.change(ConnectionStatus.ClosedManually);
        this.client.removeListener('close', this.onClose);

        await this.client.end();
    };
}

// (async () => {
//     const testFiles = [
//         {
//             type: 'd',
//             name: 'Rockstar Games',
//             path: '/upload/FlyDigi/Rockstar Games'
//         },
//         { type: '-', name: 'Ad.fdg', path: '/upload/FlyDigi/Ad.fdg' },
//         {
//             type: 'd',
//             name: 'Sugar Bytes',
//             path: '/upload/FlyDigi/Sugar Bytes'
//         }
//     ] as PiniaActiveSftpsState['buffer']['files'];

//     const testTo = '/upload/kekes';

//     const client = new SftpBase({
//         host: 'localhost',
//         port: 22,
//         username: 'foo',
//         password: 'pass'
//     });

//     await client.connect();

//     await client.copy(testFiles, testTo);
// })();
