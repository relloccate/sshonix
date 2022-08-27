<template>
    <div class="window-bar">
        <div class="logo">
            <div class="title">SSHONIX</div>
            <LogoSvg />
        </div>
        <div class="actions">
            <div class="action" @click="onMinimize">
                <MinimizeSvg />
            </div>
            <div class="action" @click="onToggleMaximize">
                <RestoreSvg v-if="maximized" />
                <MaximizeSvg v-else />
            </div>
            <div class="action" @click="onClose">
                <CloseSvg />
            </div>
        </div>
    </div>
</template>
<script>
import { ipcRenderer } from 'electron';

import CloseSvg from 'front/svg/win-close.svg';
import MinimizeSvg from 'front/svg/win-minimize.svg';
import RestoreSvg from 'front/svg/win-restore.svg';
import MaximizeSvg from 'front/svg/win-maximize.svg';
import LogoSvg from 'front/svg/logo.svg';

export default {
    components: { CloseSvg, MinimizeSvg, RestoreSvg, MaximizeSvg, LogoSvg },
    data() {
        return {
            maximized: false
        };
    },
    mounted() {
        ipcRenderer.on('window:unmaximize', this.onUnmaximize);
        ipcRenderer.on('window:maximize', this.onMaximize);
    },
    unmounted() {
        ipcRenderer.removeAllListeners('window:unmaximize');
        ipcRenderer.removeAllListeners('window:maximize');
    },
    methods: {
        onUnmaximize() {
            this.maximized = false;
        },
        onMaximize() {
            this.maximized = true;
        },
        onClose() {
            ipcRenderer.send('window:close');
        },
        onToggleMaximize() {
            if (this.maximized) {
                ipcRenderer.send('window:restore');
            } else {
                ipcRenderer.send('window:maximize');
            }
        },
        onMinimize() {
            ipcRenderer.send('window:minimize');
        }
    }
};
</script>
<style lang="postcss" scoped>
.window-bar {
    /* position: fixed; */
    /* z-index: 500; */
    /* width: 100%; */
    background-color: var(--back-color);
    height: 3em;
    display: flex;
    align-items: center;
    -webkit-app-region: drag;
    border-bottom: 1px solid color-mod(var(--main-color) a(15%));

    & .logo {
        padding: 0 2em;
        display: flex;

        & svg {
            margin-top: 1px;
            width: 16px;
            height: 16px;
            stroke: var(--main-color);
            margin-left: 0.25em;
        }

        & .title {
            color: var(--main-color);
            font-weight: 600;
        }
    }

    & .actions {
        display: flex;
        margin-left: auto;
        -webkit-app-region: no-drag;
        margin-right: 1em;

        & .action {
            cursor: pointer;
            display: flex;
            align-items: center;
            padding: 0.5em 1em;
            border-radius: 0.5em;

            &:first-child svg {
                margin-bottom: 2px;
            }

            &:last-child {
                margin-right: 0;

                & svg {
                    width: 12px;
                    height: 12px;
                    /* margin-bottom: 1px; */
                }
            }

            & svg {
                width: 11px;
                height: 11px;
                fill: var(--main-color);
            }

            & span {
                color: var(--main-color);
                font-weight: 600;
            }

            &:hover {
                background-color: color-mod(var(--main-color) a(5%));
            }
        }
    }
}
</style>
