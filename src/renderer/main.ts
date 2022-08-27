import 'front/css/vars.css';
import 'front/css/main.postcss';
import 'front/css/contextmenu.postcss';

import PiniaInstance from 'front/store/PiniaInstance';
import StoreServers from 'front/store/StoreServers';
import StoreUpdates from 'front/store/StoreUpdates';

import 'front/misc/SftpIpcRouter';

import App from './App.vue';
import WindowBar from 'front/WindowBar.vue';
import tooltip from 'front/directives/tooltip';
import Settings from 'core/Settings';
import ContextMenu from '@imengyu/vue3-context-menu';
import ConfirmMenu from 'front/globals/ConfirmMenu/ConfirmMenu';
import EditFile from 'front/globals/EditFile/EditFile';
import { createApp } from 'vue';
import { initializeLocalTerminal } from 'front/misc/SshEvents';

(async () => {
    const isReady = await Settings.fill();

    if (isReady) {
        StoreServers.fill(Settings.state.servers);
        StoreUpdates.fill();

        createApp(WindowBar).mount('#window-bar');

        const app = createApp(App);

        app.directive('tooltip', tooltip);
        app.use(PiniaInstance);
        app.use(ContextMenu);
        app.use(ConfirmMenu);
        app.use(EditFile);
        app.mount('#app');

        initializeLocalTerminal();
    }
})();
