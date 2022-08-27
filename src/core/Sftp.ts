import Client from 'ssh2-sftp-client';
import { PassThrough } from 'stream';
import { EventEmitter } from 'events';
import { splitArrayByChunks } from './Misc';

import type { ConnectOptions } from 'ssh2-sftp-client';
import type { TSftpSelectedItems } from 'types/core';

EventEmitter.setMaxListeners(0);

export default class Sftp {
    protected client: Client = new Client();

    constructor(public connectOptions: ConnectOptions) {}

    connect = async () => {
        await this.client.connect(this.connectOptions);
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
        await this.client.end();
    };
}
