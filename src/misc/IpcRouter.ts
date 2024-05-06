import StoreActiveSftpTransfers from 'front/store/StoreActiveSftpTransfers';
import StoreNotifications from 'front/store/StoreNotifications';
import StoreActiveSftps from 'front/store/StoreActiveSftps';
import { ipcRenderer } from 'electron';
import { ConnectionStatus } from 'types/store.d';
import StoreActiveTerminals from 'front/store/StoreActiveTerminals';

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

ipcRenderer.on('sftp:ssh:connection', (ipcEvent, { type, channel, event, value }: { type: 'sftp' | 'ssh'; channel: number; event: 'status' | 'message'; value: string | ConnectionStatus }) => {
    if (event === 'message') {
        StoreActiveSftps.writeConnectionMessage(channel, value);
    }

    if (event === 'status') {
        if (type === 'ssh') {
            StoreActiveTerminals.changeConnectionStatus(channel, <ConnectionStatus>value);
        } else {
            StoreActiveSftps.changeConnectionStatus(channel, <ConnectionStatus>value);

            if (<ConnectionStatus>value === ConnectionStatus.Connected) {
                StoreActiveSftps.refresh(channel);
            }
        }
    }
});
