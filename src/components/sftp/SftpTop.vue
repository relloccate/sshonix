<template>
    <div class="top-actions">
        <div class="back">
            <button @click="back">
                <BackSvg />
                <span>Back</span>
            </button>
        </div>
        <div class="misc">
            <div class="current">
                <span>Current Path</span>
                <input type="text" class="text-input" :value="currentPath" @keyup.enter="enter" />
            </div>
            <div class="search">
                <span>Search</span>
                <input type="text" class="text-input" :value="search" @input="onSearch" />
            </div>
            <div class="menu" v-tooltip="'Not Available Yet'">
                <MenuSvg />
            </div>
        </div>
    </div>
</template>
<script>
import StoreActiveSftps from 'front/store/StoreActiveSftps';
import BackSvg from 'front/svg/back.svg';
import MenuSvg from 'front/svg/menu.svg';

export default {
    props: {
        search: String,
        currentPath: String
    },
    components: { BackSvg, MenuSvg },
    inject: ['channel'],
    methods: {
        back() {
            StoreActiveSftps.back(this.channel);
        },
        getPath(event) {
            const path = event.target.value.endsWith('/') ? event.target.value : `${event.target.value}/`;
            const nextPath = path.startsWith('/') ? path : `/${path}`;

            return nextPath;
        },
        enter(event) {
            const path = this.getPath(event);

            if (this.currentPath !== path) {
                StoreActiveSftps.choosePath(this.channel, path);
            }
        },
        onSearch(event) {
            StoreActiveSftps.search(this.channel, event.target.value);
        }
    }
};
</script>
<style lang="postcss" scoped>
.top-actions {
    display: flex;
    align-items: center;
    padding: 0 1.25em;
    margin-bottom: 1em;

    & .back button {
        height: 2.5rem;
        margin-right: 1rem;
    }

    & .misc {
        width: 100%;
        display: flex;
        margin-left: auto;
        align-items: center;

        & .current,
        & .search {
            position: relative;
            width: 100%;
            border-radius: 0.5rem;
            border: 1px solid color-mod(var(--dark-white-color) a(7%));
            /* background-color: color-mod(var(--dark-white-color) a(5%)); */

            & input {
                height: 2.5em;
                padding: 0.5rem 1.25rem;
            }

            & span {
                top: -0.6rem;
                left: 1rem;
                /* top: -0.8rem; */
                position: absolute;
                user-select: none;
                display: flex;
                border-radius: 0.35rem;
                font-size: 0.8em;
                font-weight: 600;
                padding: 0.1rem 0.35rem;
                color: color-mod(var(--dark-white-color) a(65%));
                /* background: var(--back-color); */
                /* border: 1px solid color-mod(var(--dark-white-color) a(15%)); */

                /* background-color: color-mod(var(--dark-white-color) a(65%)); */
            }
        }

        & .current {
            margin-right: 1em;
        }

        & svg {
            width: 2em;
            height: 2em;
            margin-left: 0.75rem;
            fill: color-mod(var(--main-color) a(85%));
        }
    }
}
</style>
