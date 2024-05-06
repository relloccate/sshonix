type Scope = 'servers' | 'main';

export type PiniaServersState_V_0_1_1 = {
    servers: {
        added: number;
        title: string;
        description: string;
        host: string;
        port: number;
        login: string;
        auth: {
            password: {
                active: boolean;
                data: string;
            };
            key: {
                active: boolean;
                data: string;
                passphrase: string;
            };
        };
        tags: string[];
        os: string;
        mode: 'ssh' | 'sftp' | 'both';
    }[];
};

export type PiniaServersState_V_0_3_0 = {
    items: {
        id: number;
        title: string;
        description: string;
        host: string;
        port: number;
        login: string;
        auth: {
            password: {
                active: boolean;
                data: string;
            };
            key: {
                active: boolean;
                data: string;
                passphrase: string;
            };
        };
        tags: string[];
        os: string;
        mode: 'ssh' | 'sftp' | 'both';
    }[];
};

const migrations = {
    servers: [
        {
            version: '0.1.1',
            invoke: async (currentState: PiniaServersState_V_0_1_1) => {
                return {
                    items: currentState.servers.map(({ added, ...others }) => {
                        return {
                            id: added,
                            ...others
                        };
                    })
                } as PiniaServersState_V_0_3_0;
            }
        }
    ]
};

export const UpdateSettingsObject = async (scope: Scope, state: any) => {
    const startIndex = migrations[scope].findIndex(item => item.version === state.version);

    if (startIndex !== -1) {
        const array = migrations[scope].slice(startIndex);

        if (array.length > 0) {
            for (const { invoke } of array) {
                state = await invoke(state);
            }
        }
    }

    return state;
};
