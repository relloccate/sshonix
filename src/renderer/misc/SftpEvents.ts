import StoreActiveSftps, { getSelectedFiles } from 'front/store/StoreActiveSftps';
import StoreActiveTerminals from 'front/store/StoreActiveTerminals';
import StoreNotifications from 'front/store/StoreNotifications';
import { ipcRenderer } from 'electron';

export const getActiveChannel = () => StoreActiveTerminals.activeTerminal.channel;
export const getActiveSftpPath = (channel: number) => StoreActiveSftps.items.find(item => item.channel === channel)?.currentPath;

export const getSelectedItems = () => {
    let element = StoreActiveSftps.items.find(item => item.channel === getActiveChannel());

    if (element) {
        return element.files.filter(file => file.selected);
    }

    return [];
};

export const setRenaming = (status: boolean) => {
    if (status) {
        const [item] = getSelectedItems();
        if (!item) return;

        item.renaming = {
            status: true,
            value: item.data.name
        };
    } else {
        // FIXME: WHAT IS THIS?
    }
};

export const setSelecting = (status: boolean) => {
    StoreActiveSftps.setSelectingAll(getActiveChannel(), status);
};

export const refresh = async () => {
    await StoreActiveSftps.refresh(getActiveChannel());
    StoreNotifications.add({ text: 'Refreshed' });
};

export const deleteitems = async () => {
    const channel = getActiveChannel();

    await ipcRenderer.invoke('sftp:delete', {
        channel,
        items: getSelectedFiles(channel)
    });

    await StoreActiveSftps.refresh(channel);
};

export const downloadItems = async () => {
    const to = await ipcRenderer.invoke('choose-path');
    const channel = getActiveChannel();

    if (to) {
        await ipcRenderer.invoke('sftp:download', {
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

export const uploadFolders = async () => {
    const folders = await ipcRenderer.invoke('choose-multi', 'folders');
    if (!folders) return;

    const channel = getActiveChannel();
    const to = getActiveSftpPath(channel);

    await ipcRenderer.invoke('sftp:upload', {
        channel,
        to,
        items: {
            folders,
            files: []
        }
    });

    await StoreActiveSftps.refresh(channel);
};

export const uploadFiles = async () => {
    const files = await ipcRenderer.invoke('choose-multi', 'files');
    if (!files) return;

    const channel = getActiveChannel();
    const to = getActiveSftpPath(channel);

    await ipcRenderer.invoke('sftp:upload', {
        channel,
        to,
        items: {
            folders: [],
            files
        }
    });

    await StoreActiveSftps.refresh(channel);
};

// REQUIRED VUE JS CONTEXT
export const deleteItems = async function (this: any) {
    const channel = getActiveChannel();
    const selectedItems = getSelectedFiles(channel);
    if (!selectedItems.length) return;

    this.$ConfirmMenu({
        text: `You are sure, you want to delete ${selectedItems.length} items?`,
        accept: {
            text: 'DELETE',
            event: deleteitems
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

export const writeQuickEdit = async (to, data) => {
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
