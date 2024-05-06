import StoreActiveTerminals from 'front/store/StoreActiveTerminals';
import StoreActiveSftps from 'front/store/StoreActiveSftps';
import StoreServers from 'front/store/StoreServers';
import { HOME_DIR } from 'core/Constants';
import StoreActiveTabs from 'front/store/StoreActiveTabs';

export const initializeLocalTerminal = () => {
    const channel = Date.now();

    StoreActiveTerminals.add({
        channel,
        cwd: HOME_DIR,
        exec: 'powershell.exe',
        type: 'local'
    });

    StoreActiveTabs.add({
        channel,
        type: 'ssh',
        title: 'LOCAL',
        focus: true,
        active: true
    });
};

export const connectToServer = (serverId: number, focus = true) => {
    const channel = Date.now();
    const element = StoreServers.items.find(item => item.id === serverId);

    if (element) {
        if (element.mode === 'both' || element.mode === 'ssh') {
            StoreActiveTerminals.add({
                channel,
                serverId: element.id,
                type: 'remote'
            });
        }

        if (element.mode === 'both' || element.mode === 'sftp') {
            StoreActiveSftps.add({ channel, serverId: element.id });
        }

        StoreActiveTabs.add({
            channel,
            type: element.mode,
            title: element.title,
            focus,
            active: true
        });
    }
};
