import StoreActiveSftpTransfers from 'front/store/StoreActiveSftpTransfers';
import StoreNotifications from 'front/store/StoreNotifications';
import StoreActiveSftps from 'front/store/StoreActiveSftps';
import { ipcRenderer } from 'electron';

ipcRenderer.on('sftp:transfer:progress', (ipcEvent, { event, data }) => {
    if (event === 'start') {
        StoreActiveSftpTransfers.add(data);
    } else if (event === 'update') {
        StoreActiveSftpTransfers.update(data);
    } else if (event === 'end') {
        StoreActiveSftpTransfers.end(data);

        if (data.type === 'upload') {
            StoreActiveSftps.refresh(data.channel);
        }
    }
});

ipcRenderer.on('sftp:message', (event, message) => {
    StoreNotifications.add({ text: message });
});
