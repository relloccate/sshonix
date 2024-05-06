import { contextBridge, ipcRenderer } from 'electron';
// import { openLink, showInExplorer, resolvePath, parsePath } from 'core/Misc';
import * as constants from 'core/Constants';

contextBridge.exposeInMainWorld('constants', constants);

contextBridge.exposeInMainWorld('api', {
    misc: {
        // openLink,
        // showInExplorer,
        // resolvePath,
        // parsePath
    },
    ipc: {
        setStartup: async state => await ipcRenderer.invoke('set-on-startup', state),
        choosePath: async (type: boolean) => await ipcRenderer.invoke('choose-path', type)
    }
});

contextBridge.exposeInMainWorld('ipcRenderer', {
    on(...args: Parameters<typeof ipcRenderer.on>) {
        const [channel, listener] = args;
        return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args));
    },
    // off(...args: Parameters<typeof ipcRenderer.off>) {
    //     const [channel, ...omit] = args;
    //     return ipcRenderer.off(channel, ...omit);
    // },
    // send(...args: Parameters<typeof ipcRenderer.send>) {
    //     const [channel, ...omit] = args;
    //     return ipcRenderer.send(channel, ...omit);
    // },
    invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
        const [channel, ...omit] = args;
        return ipcRenderer.invoke(channel, ...omit);
    }
});
