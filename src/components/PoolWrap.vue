<template>
    <div :class="`pool-wrap`" :id="`${channel}-focus`" tabindex="0" @keydown="onKeyDown">
        <div class="pages">
            <div class="page-background" :style="{ left: page === 'terminal' ? '0' : '50%' }" v-if="type === 'both'" />
            <div class="page" :class="{ active: page === 'terminal' }" @click="page = 'terminal'" v-if="terminal !== undefined">
                <TerminalSvg />
                <span>Terminal</span>
                <span class="status" v-if="terminal.type === 'remote' && terminal.connection.status !== ConnectionStatus.Connected">{{ terminal.connection.status }}</span>
            </div>
            <div class="page" :class="{ active: page === 'sftp' }" @click="page = 'sftp'" v-if="sftp !== undefined">
                <FilesSvg />
                <span>Sftp</span>
                <span class="status" v-if="sftp.connection.status !== ConnectionStatus.Connected">{{ sftp.connection.status }}</span>
            </div>
        </div>
        <div class="page-data">
            <Terminal
                v-if="terminal"
                :serverId="terminal.serverId"
                :exec="terminal.exec"
                :channel="terminal.channel"
                :cwd="terminal.cwd"
                :type="terminal.type"
                :focus="focus"
                v-show="page === 'terminal'"
            />
            <Sftp v-if="sftp !== undefined" :sftp="sftp" v-show="page === 'sftp'" :toggleExplorer="toggleExplorer" />
            <SftpLocalExplorer v-if="explorer.show && sftp !== undefined" :type="explorer.type" :to="explorer.to" :channel="channel" :toggleExplorer="toggleExplorer" />
        </div>
    </div>
</template>
<script setup lang="ts">
import Terminal from 'front/components/Terminal.vue';
import Sftp from 'front/components/sftp/Sftp.vue';
import SftpLocalExplorer from 'front/components/sftp/SftpLocalExplorer.vue';
import { setRenaming, setSelecting, refresh, deleteItems, setBuffer, paste } from 'front/misc/SftpEvents';
import { ctrlA, ctrlC, ctrlR, ctrlV, ctrlX, Delete, Escape, F2, F5 } from 'front/misc/KeyboardEvents';
import { getCurrentInstance, ref, toRef } from 'vue';
import { ConnectionStatus } from 'types/store.d';

import type { PiniaActiveTerminalItem, PiniaActiveSftpsItem, PiniaActiveTabItem } from 'types/store';

import TerminalSvg from 'front/svg/terminal.svg';
import FilesSvg from 'front/svg/files.svg';

const $ConfirmMenu = getCurrentInstance()?.appContext.config.globalProperties.$ConfirmMenu;
const props = defineProps<
    {
        terminal: PiniaActiveTerminalItem | undefined;
        sftp: PiniaActiveSftpsItem | undefined;
    } & PiniaActiveTabItem
>();

const page = ref(props.type === 'sftp' ? 'sftp' : 'terminal');

// FIXME: REMOVE THIS EXPLORER
const explorer = toRef({
    show: false,
    type: 'none', // upload | download,
    to: ''
});

const onKeyDown = function (event: KeyboardEvent) {
    if ((page.value !== 'sftp' && props.type === 'both') || explorer.value.show) return;

    ctrlR(event, refresh);
    ctrlV(event, paste);
    F5(event, refresh);

    F2(event, () => {
        setRenaming(true);
    });

    ctrlA(event, () => {
        setSelecting(true);
    });

    ctrlX(event, () => {
        setBuffer('cut');
    });

    ctrlC(event, () => {
        setBuffer('copy');
    });

    const isConfirmMenuOpened = document.querySelector('.confirm-menu');

    // !event.target?.select - IF WE NOT IN INPUT/TEXTAREA
    // @ts-ignore
    if (!isConfirmMenuOpened && !event?.target?.select) {
        Escape(event, () => {
            setSelecting(false);
        });

        Delete(event, () => {
            deleteItems($ConfirmMenu, true);
        });
    }
};

const toggleExplorer = (show: boolean, type: string, to: string) => {
    explorer.value = {
        show,
        type,
        to
    };
};
</script>
<style lang="postcss">
.pool-wrap {
    display: flex;
    flex-flow: column;
    margin: auto;
    height: 100%;
    width: 100%;
    max-width: 1550px;
    background-color: color-mod(var(--dark-white-color) a(2%));
    border-radius: 0.75rem;
    margin-top: 1em;
    overflow: hidden;

    & .pages {
        position: relative;
        width: 100%;
        display: flex;
        justify-content: space-between;
        margin: 0 auto;

        /* &.both {
            border-radius: 0.75rem;
            background-color: color-mod(var(--dark-white-color) a(5%));
        } */

        & .page-background {
            position: absolute;
            height: 100%;
            width: 50%;
            left: 50%;
            background-color: color-mod(var(--dark-white-color) a(3%));
            transition: left 0.3s var(--ease);
            /* transition: left 0.3s cubic-bezier(.21,.2,.36,.91); */
            border-radius: 0.75rem;
        }

        & .page {
            width: 50%;
            display: flex;
            flex-flow: row nowrap;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            user-select: none;
            padding: 0.75rem 1.5rem;
            /* background-color: color-mod(var(--dark-white-color) a(5%)); */
            border-radius: 0.75rem;
            z-index: 1;

            &:only-child {
                width: 100%;
                cursor: default;
            }

            &:not(.active):hover {
                & span {
                    color: color-mod(var(--dark-white-color) a(65%));

                    &.status {
                        color: var(--back-color);
                    }
                }

                & svg path {
                    fill: color-mod(var(--dark-white-color) a(65%));
                }
            }

            /* transition: transform 0.2s var(--ease), background-color 0.3s var(--ease);
            


            &:active {
                transform: translateY(-1px);
            } */

            &:last-child {
                margin-right: 0;
            }

            &.active {
                /* background-color: color-mod(var(--dark-white-color) a(5%)); */

                & span {
                    color: var(--main-color);
                }

                & svg path {
                    fill: var(--main-color);
                }
            }

            & span {
                display: flex;
                color: var(--dark-white-color);
                font-weight: 600;
                font-size: 0.95em;
                transition: color 0.3s var(--ease);

                &.status {
                    margin-left: 1em;
                    padding: 0.2em 0.75em;
                    animation: fade-left 0.3s var(--ease);
                    font-size: 0.75rem;
                    background-color: var(--main-color);
                    border-radius: 0.75rem;
                    color: var(--back-color);
                }
            }

            & svg {
                width: 1.25rem;
                min-width: 1.25rem;
                height: 1.25rem;
                min-height: 1.25rem;
                margin-right: 1rem;

                & path {
                    transition: fill 0.3s var(--ease);
                    fill: var(--dark-white-color);
                }
            }
        }
    }

    & .page-data {
        width: 100%;
        margin: 0;
        padding-top: 1em;
        height: 100%;
        overflow: hidden;
    }
}
</style>
