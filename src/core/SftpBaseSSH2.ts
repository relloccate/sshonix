import { Client } from 'ssh2';
import { PassThrough } from 'stream';
// import { splitArrayByChunks } from './Misc';

import type { ConnectOptions } from 'ssh2-sftp-client';
import type { SFTPWrapper } from 'ssh2';
import { join } from 'path/posix';
// import type { TSftpSelectedItems } from 'types/core';

type TVia = 'command' | 'method';
type FileInfo = {
    type: 'd' | '-' | 'l';
    name: string;
    fullPath: string;
    size: number;
    modifyTime: number;
    accessTime: number;
    rights: {
        user: string;
        group: string;
        other: string;
    };
    owner: number;
    group: number;
    longname: string;
};

export default class SftpBaseSSH2 {
    protected client: Client = new Client();
    protected sftp: SFTPWrapper | undefined;

    constructor(public connectOptions: ConnectOptions) {}

    connect = () => {
        return new Promise((resolve, reject) => {
            this.client.connect(this.connectOptions);
            this.client.on('ready', () => {
                this.client.sftp((error, sftp) => {
                    if (error) reject(error);
                    this.sftp = sftp;
                    resolve(true);
                });
            });
        });
    };

    list = async (path: string) => {
        return new Promise<FileInfo[]>((resolve, reject) => {
            this.sftp?.readdir(path, (error, list) => {
                if (error) return reject(error.message);

                // https://github.com/theophilusx/ssh2-sftp-client/blob/b308ca662776ff6ed1667288777accbd8ed92fc9/src/index.js#L432
                const expression = /-/gi;
                const transformed = list.map(item => {
                    return {
                        type: item.longname.slice(0, 1),
                        name: item.filename,
                        fullPath: join(path, '/', item.filename),
                        size: item.attrs.size,
                        modifyTime: item.attrs.mtime * 1000,
                        accessTime: item.attrs.atime * 1000,
                        rights: {
                            user: item.longname.slice(1, 4).replace(expression, ''),
                            group: item.longname.slice(4, 7).replace(expression, ''),
                            other: item.longname.slice(7, 10).replace(expression, '')
                        },
                        owner: item.attrs.uid,
                        group: item.attrs.gid,
                        longname: item.longname
                    };
                });

                // @ts-ignore
                resolve(transformed);
            });
        });
    };

    exec = (command: string) => {
        return new Promise<{ output: string; errors: string } | string>((resolve, reject) => {
            this.client.exec(command, (error, stream) => {
                if (error) reject(error.message);

                let output = '';
                let errors = '';

                stream.on('data', (data: string) => {
                    output += data;
                });

                stream.stderr.on('data', (data: string) => {
                    errors += data;
                });

                stream.on('close', () => {
                    resolve({ output, errors });
                });
            });
        });
    };

    execWrap = (command: string, returnData?: any) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await this.exec(command);

                // @ts-ignore
                if (result.errors.length > 0) reject(result.errors);
                resolve(returnData ? returnData : command);
            } catch (error) {
                reject(error);
            }
        });
    };

    createFile = (path: string, via: TVia = 'method') => {
        if (via === 'method') {
            return new Promise((resolve, reject) => {
                if (this.sftp) {
                    const data = new PassThrough();
                    const remoteStream = this.sftp.createWriteStream(path);

                    remoteStream.on('ready', () => {
                        data.push(Buffer.from([]));
                        data.pipe(remoteStream);
                        data.end();
                    });

                    remoteStream.once('finish', () => {
                        resolve(path);
                    });

                    remoteStream.once('error', error => {
                        reject(error.message);
                    });
                }
            });
        }

        if (via === 'command') {
            return this.execWrap(`touch ${path}`, path);
        }
    };

    createFolder = (path: string, via: TVia = 'method') => {
        // NO RECURSIVE VIA METHOD!!!!!!!!!!!!!!!!!
        if (via === 'method') {
            return new Promise((resolve, reject) => {
                this.sftp?.mkdir(path, error => {
                    if (error) reject(error.message);
                    resolve(path);
                });
            });
        }

        if (via === 'command') {
            return this.execWrap(`mkdir -p ${path}`, path);
        }
    };

    create = async (remotePath: string, type: 'folder' | 'file', via: TVia = 'method') => {
        if (type === 'file') {
            return this.createFile(remotePath, via);
        }

        if (type === 'folder') {
            return this.createFolder(remotePath, via);
        }
    };

    rename = async (from: string, to: string) => {
        return new Promise((resolve, reject) => {
            this.sftp?.rename(from, to, error => {
                if (error) reject(error.message);
                resolve(to);
            });
        });
    };

    // getQuickEdit = async (from: string) => {
    //     let data = '';
    //     const passthrought = new PassThrough();

    //     passthrought.on('data', chunk => {
    //         data += chunk;
    //     });

    //     await this.client.get(from, passthrought);

    //     return data;
    // };

    // writeQuickEdit = async (to: string, data: string) => {
    //     return await this.client.put(Buffer.from(data, 'utf-8'), to);
    // };

    // delete = async (items: TSftpSelectedItems[]) => {
    //     for await (const chunk of splitArrayByChunks(items, 25)) {
    //         await Promise.all(
    //             chunk.map(({ type, path }) => {
    //                 if (type === '-') {
    //                     return this.client.delete(path);
    //                 } else if (type === 'd') {
    //                     return this.client.rmdir(path, true);
    //                 }
    //             })
    //         );
    //     }
    // };

    // close = async () => {
    //     await this.client.end();
    // };
}
