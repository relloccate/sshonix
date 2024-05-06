<template>
    <div class="terminals">
        <div class="terminal" :class="{ active: tab.active }" v-for="tab in items" :key="tab.channel" @click="setActive(tab.channel)">
            <div class="title">{{ tab.title }}</div>
            <div class="close" v-if="tab.active" @click="close(tab.channel)">
                <CloseSvg />
            </div>
        </div>
    </div>
</template>
<script>
import StoreActiveTerminals from 'front/store/StoreActiveTerminals';
import StoreActiveSftps from 'front/store/StoreActiveSftps';
import StoreActiveTabs from 'front/store/StoreActiveTabs';
import { storeToRefs } from 'pinia';
import { focusOnElement } from 'front/misc/DOM';

import CloseSvg from 'front/svg/close.svg';

export default {
    components: { CloseSvg },
    setup() {
        const { items } = storeToRefs(StoreActiveTabs);
        const { setActiveTab } = StoreActiveTabs;

        const { remove: removeTerminal } = StoreActiveTerminals;
        const { remove: removeSftp } = StoreActiveSftps;
        const { remove: removeTab } = StoreActiveTabs;

        const close = channel => {
            // JUST REMOVE, IPC CHANNELS CLOSES ON UNMOUNT METHODS IN SFTP & TERMINAL
            removeTerminal(channel);
            removeSftp(channel);
            removeTab(channel);
        };

        const setActive = async channel => {
            setActiveTab(channel);
            focusOnElement(`[id='${channel}-focus']`);
        };

        return {
            items,
            setActive,
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
        -webkit-app-region: no-drag;

        &:first-child {
            padding-left: 0;
        }

        & .title {
            white-space: nowrap;
            padding: 0.5em 1em;
            color: color-mod(var(--dark-white-color) a(85%));
            background-color: color-mod(var(--dark-white-color) a(5%));
            border-radius: 0.75em;
        }

        & .close {
            top: 3px;
            right: 3px;

            width: 22px;
            min-width: 22px;
            height: 22px;
            min-height: 22px;

            position: absolute;
            padding: 3px;
            cursor: pointer;
            display: flex;
            align-items: center;
            background-color: var(--back-color);
            border-radius: 0.5rem;
            border: 1px solid color-mod(var(--main-color) a(85%));

            & svg {
                margin: 0;
                width: 14px;
                min-width: 14px;
                height: 14px;
                min-height: 14px;
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
