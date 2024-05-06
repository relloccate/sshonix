import type { FileInfo } from 'ssh2-sftp-client';
import type { TSftpSelectedItems } from './core';

// PINIA - SERVERS
export type PiniaServersItem = {
    id: number;
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
    tags: string[];
    os: string;
    mode: 'ssh' | 'sftp' | 'both';
};

export type PiniaServersState = {
    items: PiniaServersItem[];
};

// PINIA - ACTIVE TERMINALS
export type PiniaActiveTabItem = {
    active: boolean;
    channel: number;
    focus: boolean;
    title: string;
    type: 'ssh' | 'sftp' | 'both';
};

export type PiniaActiveTabsState = {
    items: PiniaActiveTabItem[];
};

// PINIA - ACTIVE TERMINALS
export type PiniaActiveTerminalItem = {
    channel: number;
    connection: {
        status: ConnectionStatus;
        messages: string[];
    };
    type: 'local' | 'remote';
    cwd?: string;
    exec?: 'powershell.exe' | 'cmd.exe' | 'bash';
    serverId?: number;
};

export type PiniaActiveTerminalsState = {
    items: PiniaActiveTerminalItem[];
};

export enum ConnectionStatus {
    Init = 'Init',
    Connected = 'Connected',
    Connecting = 'Connecting',
    Disconnected = 'Disconnected',
    ClosedManually = 'ClosedManually',
    Unauthorized = 'Unauthorized'
}

// PINIA - ACTIVE SFTPS
export type PiniaActiveSftpsItem = {
    channel: number;
    connection: {
        status: ConnectionStatus;
        messages: string[];
    };
    serverId: PiniaServersItem['id'];
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
        splitFilesAndFolders: boolean;
        asc: boolean;
    };
};

export type PiniaActiveSftpsState = {
    items: PiniaActiveSftpsItem[];
    buffer: {
        action: 'none' | 'copy' | 'cut';
        channel: PiniaActiveSftpsItem['channel'];
        files: TSftpSelectedItems[];
    };
};

// PINIA - ACTIVE NOTIFICATIONS
export type PiniaNotificationsItem = {
    text: string;
    id: number;
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
