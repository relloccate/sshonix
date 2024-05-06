import StoreActiveSftps, { getSelectedFiles } from 'front/store/StoreActiveSftps';
import StoreActiveTabs from 'front/store/StoreActiveTabs';
import StoreNotifications from 'front/store/StoreNotifications';
import StoreServers from 'front/store/StoreServers';
import { ipcRenderer } from 'electron';
import { deproxy } from './Object';

export const getActiveChannel = () => StoreActiveTabs.activeTerminal.channel;
export const getActiveSftpPath = (channel: number) => StoreActiveSftps.items.find(item => item.channel === channel)?.currentPath;
export const isLinuxCommandsAvailable = (channel: number) => {
    const id = StoreActiveSftps.items.find(item => item.channel === channel)?.serverId;

    if (id) {
        const instance = StoreServers.items.find(item => item.id === id);

        if (instance && instance.os === 'linux' && instance.mode === 'both') {
            return true;
        }
    }

    return false;
};

export const getSelectedItems = () => {
    let element = StoreActiveSftps.items.find(item => item.channel === getActiveChannel());

    if (element) {
        return element.files.filter(file => file.selected);
    }

    return [];
};

// export const isHasSelectedItems = () => {
//     const channel = getActiveChannel();
//     const selectedItems = getSelectedFiles(channel);
//     if (!selectedItems.length) return;
// };

export const setRenaming = (status: boolean) => {
    const [item] = getSelectedItems();
    if (!item) return;

    item.renaming = {
        status,
        value: item.data.name
    };
};

export const setSelecting = (status: boolean) => {
    StoreActiveSftps.setSelectingAll(getActiveChannel(), status);
};

export const refresh = async () => {
    await StoreActiveSftps.refresh(getActiveChannel());
    StoreNotifications.add({ text: 'Refreshed' });
};

export const deleteitems = async (viaCommand: boolean = false) => {
    const channel = getActiveChannel();
    const items = getSelectedFiles(channel);
    const isCommands = isLinuxCommandsAvailable(channel);

    if (isCommands && viaCommand) {
        await ipcRenderer.invoke('terminal:exec', {
            channel,
            command: `rm -rf ${items.map(({ path }) => `"${path}"`).join(' ')}`
        });
    } else {
        await ipcRenderer.invoke('sftp:delete', {
            channel,
            items
        });
    }

    await StoreActiveSftps.refresh(channel);

    StoreNotifications.add({ text: 'Deleted' });
};

export const downloadItems = async () => {
    const to = await ipcRenderer.invoke('choose-path');
    const channel = getActiveChannel();

    if (to) {
        ipcRenderer.send('sftp:download', {
            channel,
            items: getSelectedFiles(channel),
            to
        });
    }
};

export const createFolder = async () => {
    const channel = getActiveChannel();

    await ipcRenderer.invoke('sftp:create', {
        channel,
        type: 'folder',
        path: {
            remote: `${getActiveSftpPath(channel)}001-RENAME-ME-${Date.now()}`
        }
    });

    await StoreActiveSftps.refresh(channel);
};

export const createFile = async () => {
    const channel = getActiveChannel();

    await ipcRenderer.invoke('sftp:create', {
        channel,
        type: 'file',
        path: {
            remote: `${getActiveSftpPath(channel)}001-RENAME-ME-${Date.now()}`
        }
    });

    await StoreActiveSftps.refresh(channel);
};

export const upload = async (items: { folders: string[]; files: string[] }, to: string) => {
    const channel = getActiveChannel();

    ipcRenderer.send('sftp:upload', {
        channel,
        to,
        items
    });
};

export const uploadFolders = async () => {
    const folders = await ipcRenderer.invoke('choose-multi', 'folders');
    if (!folders) return;

    const channel = getActiveChannel();
    const to = getActiveSftpPath(channel);

    ipcRenderer.send('sftp:upload', {
        channel,
        to,
        items: {
            folders,
            files: []
        }
    });
};

export const uploadFiles = async () => {
    const files = await ipcRenderer.invoke('choose-multi', 'files');
    if (!files) return;

    const channel = getActiveChannel();
    const to = getActiveSftpPath(channel);

    ipcRenderer.send('sftp:upload', {
        channel,
        to,
        items: {
            folders: [],
            files
        }
    });
};

export const rename = async (from: string, to: string) => {
    const channel = getActiveChannel();

    await ipcRenderer.invoke('sftp:rename', {
        channel,
        from,
        to: `${to.trim()}`
    });

    await StoreActiveSftps.refresh(channel);
    StoreNotifications.add({ text: 'Renamed' });
};

export const paste = async () => {
    const channel = getActiveChannel();
    const to = getActiveSftpPath(channel);
    const buffer = StoreActiveSftps.$state.buffer;

    if (channel !== buffer.channel) return;

    const isCommands = isLinuxCommandsAvailable(channel);

    if (!isCommands) {
        if (buffer.action === 'copy') {
            await ipcRenderer.invoke('sftp:copy', {
                channel,
                files: deproxy(buffer.files),
                to
            });
        }

        if (buffer.action === 'cut') {
            await ipcRenderer.invoke('sftp:cut', {
                channel,
                files: deproxy(buffer.files),
                to
            });
        }
    } else {
        if (buffer.action === 'copy') {
            await ipcRenderer.invoke('terminal:exec', {
                channel,
                command: `cp -r ${buffer.files.map(({ path }) => `"${path}"`).join(' ')} "${to}"`
            });
        }

        if (buffer.action === 'cut') {
            await ipcRenderer.invoke('terminal:exec', {
                channel,
                command: `mv -f ${buffer.files.map(({ path }) => `"${path}"`).join(' ')} "${to}"`
            });
        }
    }

    StoreActiveSftps.setBuffer({
        action: 'none',
        channel: 0,
        files: []
    });

    await StoreActiveSftps.refresh(channel);

    StoreNotifications.add({ text: 'Pasted' });
};

export const setBuffer = (action: 'cut' | 'copy') => {
    const channel = getActiveChannel();
    const selectedItems = getSelectedFiles(channel);

    if (!selectedItems.length) return;

    const files = getSelectedFiles(channel);

    if (!files) return;

    StoreActiveSftps.setBuffer({
        action,
        channel,
        files
    });

    StoreNotifications.add({ text: action === 'copy' ? 'Copied' : 'Cutted' });
};

// REQUIRED VUE JS CONTEXT
export const deleteItems = async function ($ConfirmMenu: any, viaCommand: boolean = false) {
    const channel = getActiveChannel();
    const selectedItems = getSelectedFiles(channel);
    let text;

    if (!selectedItems.length) return;

    if (selectedItems.length === 1) {
        text = `You are sure, you want to delete "${selectedItems[0].name}"?`;
    } else {
        text = `You are sure, you want to delete ${selectedItems.length} items?`;
    }

    $ConfirmMenu({
        text,
        accept: {
            text: 'DELETE',
            event: () => deleteitems(viaCommand)
        },
        decline: {
            text: 'BACK',
            event: null
        }
    });
};

// REQUIRED VUE JS CONTEXT
export const getQuickEdit = async function (this: any) {
    const channel = getActiveChannel();
    const [file] = getSelectedFiles(channel);

    const data = await ipcRenderer.invoke('sftp:edit:get', {
        channel,
        from: file.path
    });

    this.$EditFile(channel, {
        data,
        path: file.path,
        name: file.name
    });
};

export const writeQuickEdit = async (to: string, data: string) => {
    const channel = getActiveChannel();

    return await ipcRenderer.invoke('sftp:edit:write', {
        channel,
        to,
        data
    });
};

export const copyPaths = async (onlyNames: boolean = false) => {
    const channel = getActiveChannel();
    const data = onlyNames ? getSelectedFiles(channel).map(item => item.name) : getSelectedFiles(channel).map(item => item.path);

    await navigator.clipboard.writeText(data.join(' '));

    StoreNotifications.add({ text: 'Copied' });
};

export const stopTransfer = (started: number) => ipcRenderer.send('sftp:stop', started);
