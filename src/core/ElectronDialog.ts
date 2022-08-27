import { dialog, ipcMain } from 'electron';

ipcMain.handle('choose-path', async (event, file: boolean) => {
    try {
        const {
            filePaths: [path]
        } = await dialog.showOpenDialog({
            title: 'Choose A Path To Download',
            properties: [file ? 'openFile' : 'openDirectory']
        });

        if (path) return path;
    } catch (error) {
        console.error(error);
    }
});

ipcMain.handle('choose-multi', async (event, type: 'folders' | 'files') => {
    try {
        const { filePaths } = await dialog.showOpenDialog({
            title: 'Choose A Files',
            properties: ['multiSelections', type === 'folders' ? 'openDirectory' : 'openFile']
        });

        if (filePaths.length > 0) return filePaths;
    } catch (error) {
        console.error(error);
    }
});
