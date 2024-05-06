<template>
    <div class="menu">
        <div class="wrap">
            <div class="pages">
                <div class="page" :class="{ active: page === 'servers' }" @click="page = 'servers'">
                    <ServersSvg />
                    <span>Servers</span>
                </div>
                <!-- <div class="page updates" :class="{ active: page === 'updates' }" @click="page = 'updates'">
                    <UpdateSvg />
                    <span>Updates</span>
                </div> -->
            </div>
            <div class="main">
                <MenuServers v-if="page === 'servers'" />
                <!-- <MenuUpdates v-else-if="page === 'updates'" /> -->
            </div>
        </div>
    </div>
</template>
<script>
import MenuServers from 'front/components/menu/MenuServers.vue';
// import MenuUpdates from 'front/components/footer/MenuUpdates.vue';
import ServersSvg from 'front/svg/servers.svg';
// import UpdateSvg from 'front/svg/update.svg';

export default {
    components: {
        MenuServers,
        // MenuUpdates,
        ServersSvg
        // UpdateSvg
    },
    data() {
        return {
            page: 'servers'
        };
    }
};
</script>
<style lang="postcss" scoped>
.menu {
    position: fixed;
    top: 4em;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    /* transition: height 0.3s var(--ease); */
    overflow: hidden;
    backdrop-filter: saturate(150%) blur(5px);
    background-color: color-mod(var(--back-color) a(95%));

    &.settings-opened {
        height: 100%;

        & .wrap {
            border-radius: 0;
        }
    }

    & .wrap {
        width: 100%;
        max-width: 1612px;
        height: 100%;
        margin: auto;
        border-radius: 0 0 0.75em 0.75em;
        padding: 2em;
        animation: fade-left 0.5s var(--ease);

        & .pages {
            width: 100%;
            display: flex;
            padding-bottom: 2em;
            border-bottom: 1px solid color-mod(var(--main-color) a(15%));

            & .page {
                display: flex;
                flex-flow: row nowrap;
                align-items: center;
                cursor: pointer;
                user-select: none;
                padding: 1rem 2rem;
                background-color: color-mod(var(--main-color) a(5%));
                margin-right: 2rem;
                border-radius: 0.75rem;
                transition: transform 0.3s var(--ease), background-color 0.3s var(--ease);
                /* 
                &.updates {
                    margin-left: auto;
                    padding: 0;
                    background-color: transparent;

                    &.active {
                        background-color: transparent;
                        color: color-mod(var(--dark-white-color) a(85%));

                        & span {
                            color: color-mod(var(--dark-white-color) a(85%));
                        }

                        & svg {
                            fill: color-mod(var(--dark-white-color) a(85%));
                        }
                    }

                    & span {
                        color: color-mod(var(--dark-white-color) a(65%));
                    }

                    & svg {
                        fill: color-mod(var(--dark-white-color) a(65%));
                    }

                    &:not(.active):hover {
                        background-color: transparent;
                    }
                } */

                &:not(.active):hover {
                    transform: translateY(-2px);
                    background-color: color-mod(var(--main-color) a(15%));
                }

                &:last-child {
                    margin-right: 0;
                }

                &:active {
                    transform: translateY(1px);
                }

                &.active {
                    background-color: color-mod(var(--main-color) a(85%));

                    & span {
                        color: var(--back-color);
                    }

                    & svg {
                        fill: var(--back-color);
                    }
                }

                & span {
                    display: flex;
                    font-size: 1.5em;
                    font-weight: 600;
                    color: color-mod(var(--main-color) a(85%));
                }

                & svg {
                    width: 1.75em;
                    height: 1.75em;
                    margin-right: 1em;
                    fill: color-mod(var(--main-color) a(85%));
                }
            }
        }

        & .main {
            margin-top: 2em;
            height: 100%;

            /* background-color: color-mod(var(--main-color) a(5%)); */
        }
    }
}
</style>
