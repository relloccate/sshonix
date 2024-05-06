<template>
    <div class="page-content">
        <div class="left">
            <div class="local" @click="connect('local', $event)">
                <span>Run Local Terminal</span>
                <NetworkSvg />
            </div>
            <div class="items-remote scroll-theme" v-if="items.length > 0">
                <div class="item" :class="{ selected: selected === server.id }" v-for="server in items" :key="server.id">
                    <div class="main-wrap" @click="select(server)">
                        <div class="title">{{ server.title ? server.title : 'No Title' }}</div>
                        <div class="wrap">
                            <div class="host">{{ server.host ? server.host : 'No Host' }}</div>
                            <span>:</span>
                            <div class="port">{{ server.port ? server.port : 'No Port' }}</div>
                        </div>
                    </div>
                    <div class="actions">
                        <div class="wrap" @click="connect(server, $event)" v-tooltip="'Connect'">
                            <NetworkSvg />
                        </div>
                        <div class="wrap" @click="copy(`${server.host}:${server.port}`)" v-tooltip="'Copy HOST:PORT'">
                            <CopySvg />
                        </div>
                    </div>
                </div>
            </div>
            <div class="no-remote-items">
                <span>You Have No Remote Servers</span>
            </div>
        </div>
        <MenuServersRight :selected="selected" :selectedData="selectedData" @delelect="delelect" />
    </div>
</template>
<script>
import MenuServersRight from 'front/components/menu/MenuServersRight.vue';
import StoreServers from 'front/store/StoreServers';
import StoreNotifications from 'front/store/StoreNotifications';
import { storeToRefs } from 'pinia';
import { connectToServer, initializeLocalTerminal } from 'front/misc/SshEvents';

import NetworkSvg from 'front/svg/network.svg';
import CopySvg from 'front/svg/copy.svg';

export default {
    components: { MenuServersRight, NetworkSvg, CopySvg },
    setup() {
        const { items } = storeToRefs(StoreServers);

        return {
            items
        };
    },
    data() {
        return {
            selected: 0,
            selectedData: {}
        };
    },
    methods: {
        delelect() {
            this.selected = 0;
            this.selectedData = {};
        },
        copy(hostPort) {
            navigator.clipboard.writeText(hostPort);
            StoreNotifications.add({ text: `Copied: ${hostPort}` });
        },
        select(data) {
            if (this.selected === data.id) {
                this.selected = 0;
            } else {
                this.selectedData = data;
                this.selected = data.id;
            }
        },
        connect(data, event) {
            if (data === 'local') {
                initializeLocalTerminal();
            } else {
                if (data.auth.password.active && !data.auth.password.data) return;
                if (data.auth.key.active && !data.auth.key.data) return;

                connectToServer(data.id);
            }

            if (!event.ctrlKey) {
                this.$parent.$emit('toggleMenu');
            }
        }
    }
};
</script>
<style lang="postcss" scoped>
.page-content {
    display: flex;
    color: color-mod(var(--main-color) a(85%));
    height: calc(100% - 14em);
    overflow: hidden;
    border-radius: 0.75em;
    border: 1px solid color-mod(var(--main-color) a(15%));
    animation: fade-left 0.3s var(--ease);

    & .left {
        width: 40%;
        border-right: 1px solid color-mod(var(--main-color) a(15%));

        & .no-remote-items {
            padding: 1em;
            margin: 1em;
            border-radius: 0.75em;
            border: 1px dashed color-mod(var(--dark-white-color) a(15%));

            & span {
                display: flex;
                color: color-mod(var(--dark-white-color) a(85%));
                font-weight: 600;
                justify-content: center;
                font-size: 0.85em;
            }
        }

        & .items-remote {
            padding-right: 1.25rem;
            /* background-color: color-mod(var(--main-color) a(15%)); */
            overflow-y: auto;
            overflow-x: hidden;
            height: calc(100% - 75px);
            padding: 1.25rem;

            & .item {
                display: flex;
                user-select: none;
                padding-bottom: 1.25rem;
                margin-bottom: 1.25rem;
                border-bottom: 1px solid color-mod(var(--main-color) a(15%));

                &.selected .main-wrap {
                    background-color: color-mod(var(--main-color) a(15%));

                    & .title {
                        background-color: var(--main-color);
                        color: var(--back-color);
                    }
                }

                & .main-wrap {
                    border-radius: 0.75em;
                    padding: 0 1.25rem 1.25rem 1.25rem;
                    width: 100%;
                    margin-right: 1em;
                    background-color: color-mod(var(--main-color) a(1%));
                    overflow: hidden;
                    cursor: pointer;

                    & .title {
                        background-color: var(--back-color);
                        font-size: 1.25em;
                        color: color-mod(var(--dark-white-color) a(85%));
                        text-overflow: ellipsis;
                        overflow: hidden;
                        white-space: nowrap;
                        border-bottom: 1px solid var(--back-color);
                        padding: 0.25rem 1rem;
                        border-radius: 0 0 1rem 1rem;
                    }

                    & .wrap {
                        padding-top: 1rem;
                        display: flex;

                        & .host {
                            font-weight: 600;
                            margin-right: 0.5rem;
                            color: color-mod(var(--dark-white-color) a(85%));
                        }
                    }
                }

                & .actions {
                    margin-left: auto;

                    & .wrap {
                        padding-bottom: 0.5em;
                        cursor: pointer;

                        &:last-child {
                            padding-bottom: 0;
                        }

                        & svg {
                            fill: color-mod(var(--main-color) a(85%));
                            width: 1.25rem;
                            height: 1.25rem;
                        }
                    }
                }

                &:last-child {
                    padding-bottom: 0;
                    margin-bottom: 0;
                    border-bottom: none;
                }
            }
        }

        & .local {
            user-select: none;
            display: flex;
            cursor: pointer;
            padding: 1.25rem;
            overflow: hidden;
            height: 75px;
            border-bottom: 1px solid color-mod(var(--main-color) a(15%));
            justify-content: center;
            align-items: center;

            & span {
                display: flex;
                color: color-mod(var(--dark-white-color) a(85%));
                font-weight: 600;
                margin-right: 1em;
            }

            & svg {
                fill: color-mod(var(--dark-white-color) a(85%));
                width: 1.25rem;
                height: 1.25rem;
            }
        }
    }
}
</style>
