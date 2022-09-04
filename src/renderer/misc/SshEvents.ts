import StoreActiveTerminals from 'front/store/StoreActiveTerminals';
import { HOME_DIR } from 'core/Constants';

export const initializeLocalTerminal = () => {
    const channel = Date.now();

    StoreActiveTerminals.add({
        channel,
        active: true,
        added: channel,
        title: 'LOCAL',
        cwd: HOME_DIR,
        exec: 'powershell.exe',
        type: 'local'
    });
};
