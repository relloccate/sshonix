import '../core/Loader';
import WebContentsInstance from 'core/WebContentsInstance';
import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { join } from 'node:path';
// import installExtension from 'electron-devtools-installer';

app.commandLine.appendSwitch('force_high_performance_gpu');
// app.disableHardwareAcceleration();

if (process.platform === 'win32') app.setAppUserModelId(app.getName());
if (!app.requestSingleInstanceLock()) {
    app.quit();
    process.exit(0);
}

app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');

process.env.DIST_ELECTRON = join(__dirname, '..');
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist');
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL ? join(process.env.DIST_ELECTRON, '../public') : process.env.DIST;

// const preload = join(__dirname, '../preload/index.mjs');
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = join(process.env.DIST, 'index.html');

(async () => {
    await app.whenReady();

    // if (!app.isPackaged) {
    //     try {
    //         // https://chrome.google.com/webstore/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd
    //         await installExtension('nhdogjmejiglipccpnnnanhbledajbpd'); // ID
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }

    const win = new BrowserWindow({
        show: false,
        frame: false,
        resizable: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
            // nodeIntegration: true,
            // contextIsolation: true,
            // preload
        },
        ...(!app.isPackaged
            ? {
                  width: 1720,
                  height: 1280,
                  x: 1720,
                  y: 0
              }
            : {})
    });

    win.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);

        return {
            action: 'deny'
        };
    });

    win.webContents.on('will-navigate', (event, url) => {
        // ALLOW LOCAL NAVIGATE FROM HOT RELOAD
        if (url.startsWith('http://127.0') || url.startsWith('http://localhost')) return;

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
        win.setMenu(null);
    }

    // win.on('close', (event: Event) => {
    //     event.preventDefault();
    //     if (win) win.hide();
    // });

    win.once('ready-to-show', () => {
        if (!process.argv.includes('MINIMIZED')) {
            if (win) win.show();
        }

        // FOR MAC OS IN FUTURE
        // const { wasOpenedAsHidden } = app.getLoginItemSettings();
        // if (!wasOpenedAsHidden) {
        //     win.show();
        // }
    });

    if (process.env.VITE_DEV_SERVER_URL) {
        await win.loadURL(url);
        win.webContents.openDevTools();
    } else {
        await win.loadFile(indexHtml);
    }

    WebContentsInstance.init(win.webContents);
})();
