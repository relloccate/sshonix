<template>
    <div class="transfers">
        <div class="item" :class="transfer.status" v-for="transfer in items" :key="transfer.started" @mouseenter="onHover(transfer, $event)" @mouseleave="onLeave">
            <div class="type">
                <UploadSvg v-if="transfer.type === 'upload'" />
                <DownloadSvg v-else />
            </div>
            <div class="amount">{{ transfer.files.done.length }}</div>
        </div>
    </div>
    <div
        class="details"
        v-if="this.details.show"
        :style="{ top: `${this.details.y - 518}px`, left: `${this.details.x - 225}px` }"
        @mouseenter="this.details.shouldClose = false"
        @mouseleave="onLeave(true)"
    >
        <div class="status">{{ this.details.data.status }}</div>
        <div class="in-progress scroll-theme">
            <div class="file" v-for="(percent, file) in this.details.data.files.inProgress" :key="file" :title="file">
                <div class="name">
                    <span>{{ file }}</span>
                </div>
                <div class="percent">{{ percent }}%</div>
            </div>
        </div>
        <button @click="stop" v-if="this.details.data.status !== 'done'">Stop Transfer</button>
        <button @click="remove" v-if="this.details.data.status === 'done'">Delete Transfer</button>
    </div>
</template>
<script>
import StoreActiveSftpTransfers from 'front/store/StoreActiveSftpTransfers';
import { stopTransfer } from 'front/misc/SftpEvents';
import { storeToRefs } from 'pinia';

import DownloadSvg from 'front/svg/download.svg';
import UploadSvg from 'front/svg/upload.svg';

export default {
    components: { DownloadSvg, UploadSvg },
    setup() {
        const { items } = storeToRefs(StoreActiveSftpTransfers);

        return {
            items
        };
    },
    data() {
        return {
            detailsCloseTimeout: null,
            details: {
                show: false,
                data: null,
                x: 0,
                y: 0,
                shouldClose: false
            }
        };
    },
    methods: {
        stop() {
            stopTransfer(this.details.data.started);
        },
        remove() {
            const { started } = this.details.data;
            StoreActiveSftpTransfers.remove({ started });
            this.onLeave(true);
        },
        onHover(transfer, e) {
            const { x, y } = e.target.getBoundingClientRect();

            this.details = {
                show: true,
                data: transfer,
                x,
                y,
                shouldClose: false
            };
        },
        onLeave(forceClose) {
            if (this.detailsCloseTimeout) clearTimeout(this.detailsCloseTimeout);

            this.details.shouldClose = true;
            this.detailsCloseTimeout = setTimeout(() => {
                if (this.details.shouldClose || forceClose === true) {
                    this.details = {
                        show: false,
                        data: null,
                        x: 0,
                        y: 0,
                        shouldClose: true
                    };
                }
            }, 100);
        }
    }
};
</script>
<style lang="postcss" scoped>
.details {
    position: fixed;
    top: 0;
    left: 0;
    width: 500px;
    height: 500px;
    z-index: 11;
    overflow: hidden;
    backdrop-filter: saturate(150%) blur(5px);
    animation: fade-up 0.3s var(--ease);
    background-color: color-mod(var(--main-color) a(35%));
    background-image: linear-gradient(100deg, color-mod(var(--back-color) a(90%)), color-mod(var(--back-color) a(90%)));
    border-radius: 0.75em;
    display: flex;
    flex-flow: column;
    overflow: hidden;
    border: 1px solid color-mod(var(--main-color) a(15%));

    & .status {
        padding: 1em 1.25em;
        background-color: var(--main-color);
        border-bottom: 1px solid var(--main-color);
        color: var(--back-color);
        font-weight: 600;
        text-transform: capitalize;
        text-align: center;
    }

    & button {
        width: auto;
        margin: auto;

        border-radius: 0.75rem 0.75rem 0.25rem 0.25rem;
    }

    & .in-progress {
        overflow-y: auto;
        height: 100%;
        overflow-x: hidden;
        margin: 1em;
        padding-right: 1em;

        & .file {
            cursor: default;
            display: flex;
            font-weight: 600;
            font-size: 0.85em;
            margin-right: auto;
            overflow: hidden;
            padding: 0.35em 0;

            &:last-child {
                padding-bottom: 0;
            }

            &:first-child {
                padding-top: 0;
            }

            & .name {
                display: flex;
                width: calc(100% - 60px);
                padding-right: 0.5rem;

                & span {
                    text-overflow: ellipsis;
                    overflow: hidden;
                    text-align: right;
                    white-space: nowrap;
                }
            }

            & .percent {
                color: var(--main-color);
                margin-left: auto;
                width: 60px;
            }
        }
    }
}

.transfers {
    display: flex;
    align-items: center;
    padding: 0.5em 1.25em;

    & .item {
        align-items: center;
        display: flex;
        margin-right: 1em;
        cursor: pointer;
        user-select: none;

        &:last-child {
            margin-right: 0;
        }

        &.in-progress {
            & .type svg {
                fill: var(--main-color);
            }

            & .amount {
                color: var(--main-color);
            }
        }

        & .type svg {
            width: 1em;
            height: 1em;
            margin-right: 0.75em;
            fill: color-mod(var(--dark-white-color) a(35%));
        }

        & .amount {
            font-size: 0.85em;
            font-weight: 600;
            padding-bottom: 0.15em;
            color: color-mod(var(--dark-white-color) a(35%));
        }
    }
}
</style>
