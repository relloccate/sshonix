<template>
    <div class="terminals">
        <div class="terminal" :class="{ active: terminal.active }" v-for="terminal in items" :key="terminal.channel" @click="setActiveTerminal(terminal.channel)">
            <div class="title">{{ terminal.title }}</div>
            <div class="close" v-if="terminal.active" @click="close(terminal.channel)">
                <CloseSvg />
            </div>
        </div>
    </div>
</template>
<script>
import StoreActiveTerminals from 'front/store/StoreActiveTerminals';
import StoreActiveSftps from 'front/store/StoreActiveSftps';
import { storeToRefs } from 'pinia';

import CloseSvg from 'front/svg/close.svg';

export default {
    components: { CloseSvg },
    setup() {
        const { items } = storeToRefs(StoreActiveTerminals);
        const { setActiveTerminal, remove } = StoreActiveTerminals;
        const { remove: removeSftp } = StoreActiveSftps;

        const close = channel => {
            // JUST REMOVE, IPC CHANNELS CLOSED IN UNMOUNT METHODS IN SFTP & TERMINAL
            remove(channel);
            removeSftp(channel);
        };

        return {
            items,
            setActiveTerminal,
            close
        };
    }
};
</script>
<style lang="postcss" scoped>
.terminals {
    color: var(--main-color);
    align-items: center;
    overflow: hidden;
    overflow-x: auto;
    display: flex;
    width: 100%;
    padding-right: 0.5em;

    &::-webkit-scrollbar {
        height: 2px;
        overflow: hidden;
        border-radius: 0.75em;
    }

    &::-webkit-scrollbar-track {
        /* background-color: transparent; */
        background-color: color-mod(var(--main-color) a(15%));
        border-radius: 0.75em;
    }

    &::-webkit-scrollbar-thumb {
        background-color: color-mod(var(--main-color) a(25%));
        border-radius: 0.75em;
        background-clip: padding-box;
    }

    & .terminal {
        height: 100%;
        user-select: none;
        cursor: pointer;
        padding: 0.75em 0.5em;
        display: flex;
        position: relative;

        &:first-child {
            padding-left: 1em;
        }

        & .title {
            white-space: nowrap;
            padding: 0.5em 1em;
            color: color-mod(var(--dark-white-color) a(85%));
            background-color: color-mod(var(--dark-white-color) a(5%));
            border-radius: 0.75em;
        }

        & .close {
            top: 0.2em;
            right: 0.2em;
            position: absolute;
            padding: 0.2em;
            cursor: pointer;
            display: flex;
            align-items: center;
            background-color: var(--back-color);
            border-radius: 0.5em;
            border: 1px solid color-mod(var(--main-color) a(85%));

            & svg {
                width: 0.85em;
                height: 0.85em;
                fill: color-mod(var(--main-color) a(85%));
            }
        }

        &.active {
            cursor: default;

            & .title {
                background-color: color-mod(var(--main-color) a(85%));
                color: var(--back-color);
            }
        }
    }
}
</style>
