/// <reference types="vite/client" />

import ContextMenu from 'front/globals/ContextMenu/ContextMenu';

// import type EmptyComponent from 'front/components/global/Empty.vue';

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $ContextMenu: ContextMenu;
    }
}

declare module '*.vue' {
    import type { DefineComponent } from 'vue';
    const component: DefineComponent<{}, {}, any>;
    export default component;
}

// declare module '@vue/runtime-core' {
//     export interface GlobalComponents {
//         Empty: typeof EmptyComponent;
//     }
// }

interface Window {
    // expose in the `electron/preload/index.ts`
    ipcRenderer: import('electron').IpcRenderer;
    constants: {
        IS_PORTABLE: boolean;
        IS_DEV: boolean;
        HOME_DIR: string;
        SETTINGS_FILE_NAME: string;
        SETTINGS_DEV_FILE_NAME: string;
        APP_VERSION: string;
        APP_RELEASES_URL: string;
    };
    api: {
        settings: {
            get: Function;
            write: Function;
        };
        misc: {
            openLink: Function;
            showInExplorer: Function;
            resolvePath: Function;
            parsePath: Function;
        };
        ipc: {
            setStartup: Function;
            choosePath: Function;
        };
    };
}

// declare module '*.svg' {
//     import type { DefineComponent } from 'vue';
//     const component: DefineComponent;
//     export default component;
// }
