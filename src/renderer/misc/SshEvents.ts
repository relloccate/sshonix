import StoreActiveTerminals from 'front/store/StoreActiveTerminals';
import { HOME_DIR } from 'core/Constants';

export const initializeLocalTerminal = () => {
    const ts = Date.now();

    StoreActiveTerminals.add({
        added: ts,
        title: 'LOCAL',
        cwd: HOME_DIR,
        type: 'local',
        active: true,
        channel: ts
    });
};
