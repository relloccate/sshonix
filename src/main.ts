import 'front/css/vars.postcss';
import 'front/css/main.postcss';

import PiniaInstance from 'front/store/PiniaInstance';
import StoreServers from 'front/store/StoreServers';
import StoreUpdates from 'front/store/StoreUpdates';

import 'front/misc/IpcRouter';

import App from './App.vue';
import WindowBar from 'front/components/header/WindowBar.vue';
import tooltip from 'front/directives/tooltip';
import ContextMenu from 'front/globals/ContextMenu/ContextMenu';
import ConfirmMenu from 'front/globals/ConfirmMenu/ConfirmMenu';
import EditFile from 'front/globals/EditFile/EditFile';

import { createApp } from 'vue';
import { initializeLocalTerminal } from 'front/misc/SshEvents';

(async () => {
    await StoreServers.fill();
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
})();
