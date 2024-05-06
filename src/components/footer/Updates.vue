<template>
    <div class="available-text" @click="opened = !opened" v-if="getUpdatableReleases.length > 0" v-tooltip="'Show / Close'">
        <UpdateSvg />
        <span v-if="isHasImportant">{{ getUpdatableReleases.length }} Updates Available, <b>has IMPORTANT!</b></span>
        <span v-else>{{ getUpdatableReleases.length }} Updates Available</span>
    </div>
    <div class="updates" v-if="opened">
        <div class="wrap scroll-theme">
            <div class="amount">
                <span
                    ><b>{{ getUpdatableReleases.length }}</b> new versions was released</span
                >
            </div>
            <div class="releases">
                <UpdatesRelease v-for="release in getUpdatableReleases" :key="release.id" :release="release" />
            </div>
        </div>
    </div>
</template>
<script>
import UpdatesRelease from 'front/components/footer/UpdatesRelease.vue';
import StoreUpdates from 'front/store/StoreUpdates';
import { storeToRefs } from 'pinia';

import UpdateSvg from 'front/svg/update.svg';

export default {
    components: { UpdatesRelease, UpdateSvg },
    setup() {
        const { getUpdatableReleases, isHasImportant } = storeToRefs(StoreUpdates);

        return {
            getUpdatableReleases,
            isHasImportant
        };
    },
    data() {
        return {
            opened: false
        };
    }
};
</script>
<style lang="postcss" scoped>
.available-text {
    cursor: pointer;
    user-select: none;
    display: flex;
    font-size: 0.85em;
    font-weight: 600;
    align-items: center;
    color: color-mod(var(--dark-white-color) a(85%));
    animation: fade-up 0.3s var(--ease);
    padding: 0 2rem;

    & svg {
        width: 1.25rem;
        min-width: 1.25rem;
        height: 1.25rem;
        margin-right: 1em;
        fill: color-mod(var(--dark-white-color) a(85%));
    }

    & b {
        color: var(--main-color);
    }
}

.updates {
    display: block;
    margin: 0;
    position: fixed;
    top: 4em;
    left: 0;
    z-index: 15;
    width: 100%;
    height: calc(100% - 8em);
    display: flex;
    justify-content: center;
    align-items: center;
    backdrop-filter: saturate(150%) blur(5px);
    background-color: color-mod(var(--back-color) a(95%));
    animation: fade-left 0.3s var(--ease);
    overflow: hidden;
    padding: 1em 2em 0 2em;

    & .wrap {
        border-radius: 0.75rem;
        background-image: linear-gradient(129deg, color-mod(var(--grey-color) a(1%)), color-mod(var(--dark-white-color) a(1%)));
        background-color: var(--back-color);
        height: 100%;
        width: 100%;
        overflow: auto;
        margin: 0 auto;
        max-width: 1550px;

        & .amount {
            margin-bottom: 6em;
            text-align: center;

            & span {
                color: var(--back-color);
                display: inline-flex;
                width: auto;
                background-color: color-mod(var(--dark-white-color) a(75%));
                border-radius: 0 0 0.75em 0.75em;
                padding: 1em 1.5em;

                & b {
                    margin-right: 0.5em;
                }
            }
        }

        & .releases {
            color: var(--grey-color);
            width: 100%;
        }

        & .no-updates {
            width: 100%;
            color: var(--grey-color);
            font-size: 1.5em;
            font-weight: 600;
            text-align: center;
            padding: 1.75rem;
            border-bottom: 2px dashed color-mod(var(--grey-color) a(5%));
            /* margin-top: 2rem; */
        }
    }
}
</style>
