import type { FileInfo } from 'ssh2-sftp-client';

// PINIA - SERVERS
export type PiniaServersItem = {
    /** it is a main key, uses as ID */
    added: number;
    title: string;
    description: string;
    host: string;
    port: number;
    login: string;
    auth: {
        password: {
            active: boolean;
            data: string;
        };
        key: {
            active: boolean;
            data: string;
            passphrase: string;
        };
    };
};

export type PiniaServersState = {
    isFilled: boolean;
    items: PiniaServersItem[];
};

// PINIA - ACTIVE TERMINALS
export type PiniaActiveTerminalItem = {
    active: boolean;
    channel: number;
    added: number;
    title: string;
    type: 'local' | 'remote';
    cwd: string;
    exec: 'powershell.exe' | 'cmd.exe' | 'bash';
};

export type PiniaActiveTerminalsState = {
    items: PiniaActiveTerminalItem[];
};

// PINIA - ACTIVE SFTPS
export type PiniaActiveSftpsItem = {
    channel: number;
    added: PiniaServersItem['added'];
    files: {
        index: number;
        selected: boolean;
        renaming: {
            status: boolean;
            value: string;
        };
        data: FileInfo;
    }[];
    search: string;
    currentPath: string;
    history: string[];
    sort: {
        by: 'name' | 'size' | 'modifyTime' | 'accessTime';
        asc: boolean;
    };
};

export type PiniaActiveSftpsState = {
    items: PiniaActiveSftpsItem[];
};

// PINIA - ACTIVE NOTIFICATIONS
export type PiniaNotificationsItem = {
    text: string;
    added: number;
};

export type PiniaNotificationsState = {
    notifications: PiniaNotificationsItem[];
};

// PINIA - ACTIVE SFTP TRANSFERS
type PiniaActiveSftpTransfersFile = {
    from: string;
    to: string;
};

export type PiniaActiveSftpTransfersItem = {
    channel: PiniaActiveSftpsItem['channel'];
    started: number;
    type: 'download' | 'upload';
    status: 'done' | 'in-progress' | 'stopped';
    errors: string[];
    files: {
        done: PiniaActiveSftpTransfersFile[];
        wait: PiniaActiveSftpTransfersFile[];
        inProgress: {
            [key: string]: string;
        };
    };
};

export type PiniaActiveSftpTransfers = {
    items: PiniaActiveSftpTransfersItem[];
};

// UPDATES
export type PiniaUpdatesState = {
    releases: {
        body: string;
        tag_name: string;
        draft: boolean;
        assets: {
            browser_download_url: string;
            size: number;
        }[];
    }[];
    isFilled: boolean;
    isAvailable: boolean;
};
