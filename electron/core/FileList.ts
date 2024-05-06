import { resolve, parse } from 'path';
import { readdir, stat } from 'fs/promises';
import type { Stats } from 'fs';

export type TFileData = {
    isDirectory: boolean;
    fullPath: string;
    dir: string;
    name: string;
    extension?: string;
    stat?: Stats;
};

type TGetDirectoryFiles = {
    [index: string]: TFileData;
};

export default class FileList {
    /**
     * TO REMEMBER THE FILENAME IN PROMISE ALL
     * @param {*} fullPath
     * @returns fullPath and file stat
     */
    static statWrappper = async (fullPath: string) => {
        try {
            return {
                fullPath,
                stat: await stat(fullPath)
            };
        } catch {
            return {
                fullPath
            };
        }
    };

    static getDirectoryFiles = async (directory: string): Promise<TFileData[]> => {
        const files = await readdir(directory, { withFileTypes: true });
        const results: TGetDirectoryFiles = {};
        const promises = [];

        for (const file of files) {
            // IMPORTANT, SKIP SYMBOLIC LINKS
            // TO AVOID BROKEN LINKS TO DIRS
            // AND NOT PERMITTED HIDDEN WINDOWS LINKS TO DIRS, SUCH AS: "My Videos", "My Music" etc... (these links found in "My Documents")
            if (!file.isSymbolicLink()) {
                const fullPath = resolve(directory, file.name);
                const isDirectory = file.isDirectory();
                const { ext: extension, dir } = parse(fullPath);

                /* @ts-ignore */
                results[fullPath] = {
                    isDirectory,
                    fullPath,
                    dir,
                    name: file.name,
                    ...(!isDirectory ? { extension } : null)
                };

                promises.push(this.statWrappper(fullPath));
            }
        }

        const promisesResponse = await Promise.all(promises);

        for (const response of promisesResponse) {
            results[response.fullPath].stat = response.stat;
        }

        return Object.values(results);
    };

    static getLocalDirectoryEntities = async (from: string) => {
        const dirs: {
            relative: string;
            full: string;
        }[] = [];

        const files: {
            relative: string;
            full: string;
        }[] = [];

        const scan = async (from: string, to: string) => {
            try {
                const entities = await this.getDirectoryFiles(from);

                for await (const file of entities) {
                    if (file.isDirectory) {
                        dirs.push({
                            relative: to + '/' + file.name,
                            full: file.fullPath
                        });

                        await scan(file.fullPath, to + '/' + file.name);
                    } else {
                        files.push({
                            relative: to + '/' + file.name,
                            full: file.fullPath
                        });
                    }
                }
            } catch (error: any) {}
        };

        await scan(from, '');

        return {
            dirs,
            files
        };
    };
}
