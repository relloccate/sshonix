import os from 'os';
import { version } from '../../package.json';

export const IS_PORTABLE: boolean = process.env.PORTABLE_EXECUTABLE_DIR ? true : false;
export const IS_DEV: boolean = process.env.NODE_ENV === 'production' ? false : true;

export const HOME_DIR: string = os.homedir();
export const SETTINGS_FILE_NAME: string = 'sshonix.settings.json';
export const SETTINGS_DEV_FILE_NAME: string = 'sshonix.settings.dev.json';
export const APP_VERSION: string = version;
export const APP_RELEASES_URL: string = 'https://api.github.com/repos/relloccate/sshonix/releases';
