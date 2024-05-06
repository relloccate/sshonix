import { APP_RELEASES_URL } from 'core/Constants';
import Settings from 'core/Settings';
import TransferPool from 'core/backups/TransferPool';
import { app, dialog, ipcMain } from 'electron';

ipcMain.handle('choose-path', async (event, file: boolean) => {
    try {
        const {
            filePaths: [path]
        } = await dialog.showOpenDialog({
            properties: [file ? 'openFile' : 'openDirectory']
        });

        if (path) return path;
    } catch (error) {
        console.error(error);
    }
});

// https://developpaper.com/electron-practical-tips-hide-the-main-window-at-startup-and-only-show-the-system-tray/
ipcMain.handle('set-on-startup', async (event, state: boolean) =>
    app.setLoginItemSettings({
        openAtLogin: state,
        // FOR MAC OS IN FUTURE
        openAsHidden: true,
        // FOR WINDOWS
        args: ['MINIMIZED']
    })
);

ipcMain.handle('get-on-startup', async () => app.getLoginItemSettings());
ipcMain.handle('get-version', app.getVersion);

ipcMain.handle('settings:get', async (event, scope: 'backups' | 'providers' | 'main') => {
    try {
        return await Settings.get(scope);
    } catch (error) {
        console.log(error);
    }
});

ipcMain.handle('settings:write', async (event, data, scope: 'backups' | 'providers' | 'main') => {
    try {
        return await Settings.write(data, scope);
    } catch (error) {
        console.log(error);
    }
});

ipcMain.handle('transfer-pool:add', (event, data, providerData?) => {
    try {
        return TransferPool.add(data, providerData);
    } catch (error) {
        console.log(error);
    }
});

ipcMain.handle('transfer-pool:start', (event, data) => {
    try {
        return TransferPool.start(data);
    } catch (error) {
        console.log(error);
    }
});

ipcMain.handle('transfer-pool:stop', (event, data) => {
    try {
        return TransferPool.stop(data);
    } catch (error) {
        console.log(error);
    }
});

ipcMain.handle('releases:get', async () => {
    try {
        const response = await fetch(APP_RELEASES_URL);
        const releases = await response.json();

        return releases;
    } catch (error) {
        console.log(error);
    }
});
