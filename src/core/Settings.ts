import { readFile, writeFile, rename } from 'fs/promises';
import { resolve } from 'path';
import { HOME_DIR, SETTINGS_FILE_NAME, SETTINGS_DEV_FILE_NAME, IS_DEV, APP_VERSION } from './Constants';
import type { TSettingsState } from 'types/core';

class Settings {
    private path = resolve(HOME_DIR + '/' + (IS_DEV ? SETTINGS_DEV_FILE_NAME : SETTINGS_FILE_NAME));
    private timeout: ReturnType<typeof setTimeout> | undefined;

    state: Pick<TSettingsState, 'servers' | 'keys'> = {
        servers: [],
        keys: []
    };

    private init = async () => {
        try {
            const json = JSON.stringify(
                {
                    version: APP_VERSION,
                    servers: [],
                    keys: []
                },
                null,
                4
            );

            await writeFile(this.path, json, 'utf-8');
        } catch (error) {
            console.error(error);
        }
    };

    fill = async (): Promise<boolean> => {
        try {
            const data = await readFile(this.path, 'utf-8');
            const { version, servers, keys } = JSON.parse(data);

            // is config is broken
            if (!version || !servers || !keys) {
                await this.init();
                return await this.fill();
            }

            this.state = {
                servers,
                keys
            };

            return true;
        } catch (error: any) {
            // is a first load and no config, create this // or json parse error
            if (error.code === 'ENOENT' || /JSON/.test(error.message)) {
                await this.init();
                return await this.fill();
            } else if (error.code === 'EPERM') {
                alert('NO PERMISSIONS TO READ SETTINGS');
            }

            return false;
        }
    };

    writeToState = async (scope: 'servers' | 'keys', data: any) => {
        this.state[scope] = data;

        if (this.timeout) clearTimeout(this.timeout);

        this.timeout = setTimeout(async () => {
            await this.writeToDisk();
        }, 250);
    };

    private writeToDisk = async () => {
        const version = APP_VERSION;

        try {
            const json = JSON.stringify({ version, ...this.state }, null, 4);

            await writeFile(this.path + '.sshnx.safe', json, 'utf-8');
            await rename(this.path + '.sshnx.safe', this.path);
        } catch (error: any) {
            if (error.code === 'ENOENT') {
                await this.writeToDisk();
            } else if (error.code === 'EPERM') {
                alert('NO PERMISSIONS TO SET SETTINGS');
            }
        }
    };
}

export default new Settings();
