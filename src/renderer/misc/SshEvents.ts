import StoreActiveTerminals from 'front/store/StoreActiveTerminals';

export const initializeLocalTerminal = () => {
    const ts = Date.now();

    StoreActiveTerminals.add({
        added: ts,
        title: 'LOCAL',
        cwd: process.env.HOME ? process.env.HOME : '',
        type: 'local',
        active: true,
        channel: ts
    });
};
