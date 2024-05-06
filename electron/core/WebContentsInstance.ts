import type { WebContents } from 'electron';

class WebContentsInstance {
    private webContentsInstance: WebContents | undefined = undefined;

    init = (webContentsInstance: WebContents) => {
        this.webContentsInstance = webContentsInstance;
    };

    send(channel: string, ...args: any) {
        this.webContentsInstance.send(channel, ...args);
    }
}

export default new WebContentsInstance();
