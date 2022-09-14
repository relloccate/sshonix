import SftpBase from './SftpBase';
import FileList from './FileList';
import { resolve, parse } from 'path';
import { EventEmitter } from 'events';
import { splitArrayByChunks } from './Misc';
import { mkdir } from 'fs/promises';

import type { TSftpSelectedItems, TSftpTransfers } from 'types/core';

EventEmitter.setMaxListeners(0);

export default class SftpTransfer extends SftpBase {
    private errors: string[] = [];
    private transfers: TSftpTransfers = {
        done: [],
        wait: [],
        inProgress: {}
    };

    getTransferState = () => {
        const { done, inProgress } = { ...this.transfers };
        const errors = [...this.errors];

        this.transfers.done = [];
        this.errors = [];

        return {
            errors,
            done,
            inProgress
        };
    };

    download = async (to: string, items: TSftpSelectedItems[]) => {
        const folders = items.filter(({ type }) => type === 'd');
        const files = items.filter(({ type }) => type === '-');

        for await (const chunk of splitArrayByChunks(folders, 5)) {
            await Promise.all(
                chunk.map(async ({ path, name }) => {
                    const localPath = resolve(to, name);

                    await mkdir(localPath, { recursive: true });
                    await this.getDir(path, localPath);
                })
            );
        }

        for await (const chunk of splitArrayByChunks(files, 50)) {
            await Promise.all(
                chunk.map(({ path, name }) => {
                    const localPath = resolve(to, name);
                    return this.getFile(path, localPath);
                })
            );
        }
    };

    upload = async (to: string, items: { folders: string[]; files: string[] }) => {
        for await (const chunk of splitArrayByChunks(items.folders, 5)) {
            await Promise.all(
                chunk.map(async fullPath => {
                    const { name } = parse(fullPath);

                    await this.client.mkdir(`${to}${name}`, true);
                    await this.putDir(fullPath, `${to}${name}`, true);
                })
            );
        }

        for await (const chunk of splitArrayByChunks(items.files, 50)) {
            await Promise.all(
                chunk.map(fullPath => {
                    const { name, ext } = parse(fullPath);
                    return this.putFile(fullPath, `${to}${name}${ext}`);
                })
            );
        }
    };

    protected getDir = async (remote: string, local: string) => {
        const list = await this.list(remote);

        if (list) {
            const files = list.filter(item => item.type === '-');
            const dirs = list.filter(item => item.type === 'd');

            for await (const { name } of dirs) {
                await mkdir(resolve(local, name), { recursive: true });
            }

            for await (const chunk of splitArrayByChunks(files, 50)) {
                await Promise.all(
                    chunk.map(({ name }) => {
                        const nextRemote = `${remote}/${name}`;
                        const nextLocal = `${local}/${name}`;

                        return this.getFile(nextRemote, nextLocal);
                    })
                );
            }

            for await (const { name } of dirs) {
                const nextRemote = `${remote}/${name}`;
                const nextLocal = `${local}/${name}`;

                await this.getDir(nextRemote, nextLocal);
            }
        } else {
            console.log(`Can't get list of : ${remote}`);
        }
    };

    protected getFile = async (remote: string, local: string) => {
        try {
            this.transfers.inProgress[remote] = '0';

            const result = await this.client.fastGet(remote, local, {
                concurrency: 64,
                chunkSize: 32768 * 6,
                step: (total_transferred, chunk, total) => {
                    this.transfers.inProgress[remote] = ((total_transferred / total) * 100).toFixed(2);
                }
            });

            this.transfers.done.push({ from: remote, to: local });
            delete this.transfers.inProgress[remote];
            return result;
        } catch (error: any) {
            this.errors.push(`Can't download file from ${remote} to ${local}. Message: ${error.message}`);
        }
    };

    protected putFile = async (local: string, remote: string) => {
        try {
            this.transfers.inProgress[remote] = '0';

            const result = await this.client.fastPut(local, remote, {
                concurrency: 64,
                chunkSize: 32768 * 6,
                step: (total_transferred, chunk, total) => {
                    this.transfers.inProgress[remote] = ((total_transferred / total) * 100).toFixed(2);
                }
            });

            this.transfers.done.push({ from: local, to: remote });
            delete this.transfers.inProgress[remote];

            return result;
        } catch (error: any) {
            this.errors.push(`Can't upload file from ${local} to ${remote}. Message: ${error.message}`);
        }
    };

    protected makeDir = async (path: string) => {
        try {
            return await this.client.mkdir(path, true);
        } catch (error: any) {
            this.errors.push(`Can't create remote directory. Message: ${error.message}`);
        }
    };

    protected putDir = async (from: string, to: string, isFirst: boolean = true) => {
        const { base } = parse(from);
        const directoryItems = await FileList.getDirectoryFiles(from);
        const pathTo = isFirst ? to + '/' : to + '/' + base + '/';

        const files = directoryItems.filter(item => !item.isDirectory);
        const dirs = directoryItems.filter(item => item.isDirectory);

        for await (const chunk of splitArrayByChunks(files, 50)) {
            await Promise.all(
                chunk.map(({ fullPath, name }) => {
                    return this.putFile(fullPath, `${pathTo}${name}`);
                })
            );
        }

        for await (const file of dirs) {
            const result = await this.makeDir(`${pathTo}${file.name}`);

            if (result) {
                await this.putDir(file.fullPath, pathTo, false);
            }
        }
    };
}
