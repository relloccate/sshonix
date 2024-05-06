<template>
    <div class="items">
        <div class="item" :class="transfer.status" v-for="transfer in items" :key="transfer.started" @mouseenter="onHover(transfer, $event)" @mouseleave="onLeave">
            <div class="type">
                <UploadSvg v-if="transfer.type === 'upload'" />
                <DownloadSvg v-else />
            </div>
            <div class="amount">{{ transfer.files.done.length }}</div>
        </div>
    </div>
    <TransfersDetails :details="details" @onLeave="onLeave" />
</template>
<script>
import TransfersDetails from 'front/components/footer/TransfersDetails.vue';
import StoreActiveSftpTransfers from 'front/store/StoreActiveSftpTransfers';
import { storeToRefs } from 'pinia';

import DownloadSvg from 'front/svg/download.svg';
import UploadSvg from 'front/svg/upload.svg';

export default {
    components: { TransfersDetails, DownloadSvg, UploadSvg },
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
.items {
    display: flex;
    align-items: center;
    padding: 0.5em 1.25em;

    & .item {
        align-items: center;
        display: flex;
        margin-right: 1em;
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
