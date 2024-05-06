import { readFile, writeFile, rename, rm } from 'fs/promises';
import { resolve } from 'path';
import { HOME_DIR, IS_DEV, APP_VERSION } from './Constants';
import { stat, mkdir } from 'fs/promises';
import { safeStorage } from 'electron';
import { scheduler } from 'timers/promises';
import { UpdateSettingsObject } from './SettingsMigrations';

import type { PiniaServersState } from 'types/store';

type Encoding = 'base64' | 'none' | 'safe-storage';
type Scope = 'servers' | 'main';

class Settings {
    private rootDir = resolve(HOME_DIR + '/.sshonix/');
    private initialized = false;

    constructor() {
        (async () => {
            await this.init();
            this.initialized = true;
            return this;
        })();
    }

    private encrypt = async (data: any, enc: Encoding = 'none') => {
        if (enc === 'base64') {
            return Buffer.from(data).toString('base64');
        }

        if (enc === 'safe-storage') {
            return safeStorage.encryptString(data);
        }

        return data;
    };

    private decrypt = async (data: any, enc: Encoding = 'none') => {
        if (enc === 'base64') {
            return Buffer.from(data, 'base64').toString('utf8');
        }

        if (enc === 'safe-storage') {
            return safeStorage.decryptString(Buffer.from(data));
        }

        return data;
    };

    private getPath = (scope: Scope) => {
        return resolve(this.rootDir, `${scope}${IS_DEV ? '.dev' : ''}`);
    };

    private init = async () => {
        try {
            await stat(this.rootDir);
        } catch (error: any) {
            if (error.code === 'ENOENT') {
                await mkdir(this.rootDir, { recursive: true });
            }
        }

        // TODO: REMOVE IN NEXT VERSIONS
        try {
            if (!IS_DEV) {
                const data = await readFile(`${HOME_DIR}/sshonix.settings.json`, 'utf8');
                const parsed = JSON.parse(data);

                await this.write(await UpdateSettingsObject('servers', parsed), 'servers');

                const json = JSON.stringify({ ...parsed }, null, 4);
                const path = this.getPath('servers');

                await writeFile(path, await this.encrypt(json, 'safe-storage'));

                await writeFile(`${HOME_DIR}/sshonix.settings.json`, await this.encrypt('trash', 'safe-storage'));
                await rm(`${HOME_DIR}/sshonix.settings.json`);
            }
        } catch {}

        try {
            await stat(this.getPath('servers'));
        } catch (error: any) {
            if (error.code === 'ENOENT') {
                await this.write({ version: APP_VERSION, items: [] }, 'servers');
            }
        }

        try {
            await stat(this.getPath('main'));
        } catch (error: any) {
            if (error.code === 'ENOENT') {
                await this.write({ version: APP_VERSION }, 'main');
            }
        }
    };

    private parseData = async (data: any | null, scope: Scope) => {
        if (scope === 'servers') {
            if (data === null) return { items: [] } as PiniaServersState;

            const result = JSON.parse(await this.decrypt(data, 'safe-storage'));

            return result as PiniaServersState;
        }
    };

    get = async (scope: Scope) => {
        if (!scope) throw new Error('No Scope Provided');

        if (!this.initialized) {
            await scheduler.wait(100);
            return await this.get(scope);
        }

        try {
            const path = this.getPath(scope);
            const encoding = scope === 'servers' ? null : 'utf-8';
            const data = await readFile(path, encoding);
            return await UpdateSettingsObject(scope, await this.parseData(data, scope));
        } catch (error: any) {
            if (error.code === 'EPERM') {
                console.error('NO PERMISSIONS TO READ SETTINGS');
                alert('NO PERMISSIONS TO READ SETTINGS');
            }

            return this.parseData(null, scope);
        }
    };

    write = async (data: any, scope: Scope) => {
        if (!scope) throw new Error('No Scope Provided');

        try {
            const json = JSON.stringify({ ...data, version: APP_VERSION }, null, 4);
            const path = this.getPath(scope);

            if (scope === 'servers') {
                await writeFile(path + '.sshnx.safe', await this.encrypt(json, 'safe-storage'));
            } else {
                await writeFile(path + '.sshnx.safe', await this.encrypt(json, 'none'), 'utf8');
            }

            await rename(path + '.sshnx.safe', path);
        } catch (error: any) {
            if (error.code === 'EPERM') {
                console.error('NO PERMISSIONS TO SET SETTINGS');
                alert('NO PERMISSIONS TO SET SETTINGS');
            } else {
                console.error(error);
            }
        }
    };
}

export default new Settings();
