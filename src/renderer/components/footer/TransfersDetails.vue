<template>
    <div class="details" v-if="details.show" :style="{ top: `${details.y - 518}px`, left: `${details.x - 225}px` }" @mouseenter="details.shouldClose = false" @mouseleave="$emit('onLeave', true)">
        <div class="status">{{ details.data.status }}</div>
        <div class="tabs">
            <div class="tab" @click="tab = 'active'" :class="{ active: tab === 'active' }">
                Active <span>{{ getActiveTransfersCount }}</span>
            </div>
            <div class="tab" @click="tab = 'done'" :class="{ active: tab === 'done' }">
                Done <span>{{ details.data.files.done.length }}</span>
            </div>
            <div class="tab" @click="tab = 'errors'" :class="{ active: tab === 'errors' }">
                Errors <span>{{ details.data.errors.length }}</span>
            </div>
        </div>
        <div class="in-progress scroll-theme" v-if="tab === 'active'">
            <div class="file" v-for="(percent, file) in details.data.files.inProgress" :key="file" :title="file">
                <div class="name">
                    <span>{{ file }}</span>
                </div>
                <div class="percent">{{ percent }}%</div>
            </div>
        </div>
        <div class="done-files scroll-theme" v-else-if="tab === 'done'">
            <div class="file" v-for="file in details.data.files.done" :key="file.from">
                <div class="from">
                    From:
                    <span>{{ file.from }}</span>
                </div>
                <div class="to">
                    To:
                    <span>{{ file.to }}</span>
                </div>
            </div>
        </div>
        <div class="errors scroll-theme" v-else>
            <div class="error" v-for="error in details.data.errors" :key="error">
                <span>{{ error }}</span>
            </div>
        </div>
        <button @click="stop" v-if="details.data.status === 'in-progress'">Stop Transfer</button>
        <button @click="remove" v-else>Delete Transfer</button>
    </div>
</template>
<script>
import StoreActiveSftpTransfers from 'front/store/StoreActiveSftpTransfers';
import { stopTransfer } from 'front/misc/SftpEvents';

import DownloadSvg from 'front/svg/download.svg';
import UploadSvg from 'front/svg/upload.svg';

export default {
    components: { DownloadSvg, UploadSvg },
    props: {
        details: Object
    },
    data() {
        return {
            tab: 'active'
        };
    },
    computed: {
        getActiveTransfersCount() {
            try {
                return Object.keys(this.details.data.files.inProgress).length;
            } catch {
                return 0;
            }
        }
    },
    methods: {
        stop() {
            stopTransfer(this.details.data.started);
        },
        remove() {
            const { started } = this.details.data;
            StoreActiveSftpTransfers.remove({ started });
            this.$emit('onLeave', true);
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
    background-image: linear-gradient(100deg, color-mod(var(--back-color) a(95%)), color-mod(var(--back-color) a(95%)));
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

    & .tabs {
        display: flex;
        width: 100%;
        user-select: none;
        padding: 1em 1em 0 1em;

        & .tab {
            display: flex;
            width: 33.3333333333333333%;
            border-bottom: 1px solid color-mod(var(--dark-white-color) a(10%));
            padding-bottom: 1em;
            align-items: center;
            justify-content: center;
            cursor: pointer;

            & span {
                display: flex;
                border-radius: 0.5rem;
                font-size: 0.8em;
                font-weight: 600;
                padding: 0.5rem 1rem;
                background-color: color-mod(var(--dark-white-color) a(5%));
                color: var(--dark-white-color);
                margin: 0 0 0 1rem;
            }

            &.active {
                border-bottom: 1px solid color-mod(var(--main-color) a(10%));
                color: var(--main-color);

                & span {
                    background-color: color-mod(var(--main-color) a(5%));
                    color: var(--main-color);
                }
            }
        }
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

    & .done-files {
        overflow-y: auto;
        height: 100%;
        overflow-x: hidden;
        margin: 1em;
        padding-right: 1em;

        & .file {
            cursor: default;
            display: flex;
            flex-flow: column;
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

            & .from,
            & .to {
                display: flex;
                width: 100%;
                padding-right: 0.5rem;

                & span {
                    text-overflow: ellipsis;
                    overflow: hidden;
                    text-align: right;
                    white-space: nowrap;
                    margin-left: 0.25em;
                    color: var(--main-color);
                }
            }
        }
    }

    & .errors {
        overflow-y: auto;
        height: 100%;
        overflow-x: hidden;
        margin: 1em;
        padding-right: 1em;

        & .error {
            cursor: default;
            display: flex;
            flex-flow: column;
            font-weight: 600;
            font-size: 0.85em;
            margin-right: auto;
            overflow: hidden;
            padding: 0.35em 0;
        }
    }
}
</style>
