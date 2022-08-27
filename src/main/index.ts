import '../core/Loader';
import installExtension from 'electron-devtools-installer';
import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { join } from 'path';
import type { Event } from 'electron';

app.commandLine.appendSwitch('force_high_performance_gpu');
// app.disableHardwareAcceleration();

(async () => {
    if (process.platform === 'win32') app.setAppUserModelId(app.getName());
    if (!app.requestSingleInstanceLock()) {
        app.quit();
        process.exit(0);
    }

    await app.whenReady();

    if (!app.isPackaged) {
        try {
            // https://chrome.google.com/webstore/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd
            await installExtension('nhdogjmejiglipccpnnnanhbledajbpd'); // ID
        } catch (error) {
            console.log(error);
        }
    }

    const win = new BrowserWindow({
        title: 'SSHONIX',
        show: false,
        frame: false,
        resizable: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);

        return {
            action: 'deny'
        };
    });

    win.webContents.on('will-navigate', (event, url) => {
        // ALLOW LOCAL NAVIGATE FROM HOT RELOAD
        if (url.startsWith('http://127.0')) return;

        shell.openExternal(url);
        event.preventDefault();
    });

    ipcMain.on('window:close', () => {
        win.close();
    });

    ipcMain.on('window:minimize', () => {
        win.minimize();
    });

    ipcMain.on('window:restore', () => {
        win.restore();
    });

    ipcMain.on('window:maximize', () => {
        win.maximize();
    });

    win.on('unmaximize', () => {
        win.webContents.send('window:unmaximize');
    });

    win.on('maximize', () => {
        win.webContents.send('window:maximize');
    });

    win.once('ready-to-show', () => {
        win.show();
    });

    if (app.isPackaged) {
        win.loadFile(join(__dirname, '../renderer/index.html'));
    } else {
        win.loadURL(`http://${process.env['VITE_DEV_SERVER_HOST']}:${process.env['VITE_DEV_SERVER_PORT']}`);
    }
})();
