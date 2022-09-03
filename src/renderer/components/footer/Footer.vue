<template>
    <footer>
        <div class="footer-content">
            <div class="sides-placeholder">
                <FooterUpdates />
                <!-- <Commands /> -->
            </div>
            <div class="main-placeholder">
                <div class="open-menu" @click="$emit('toggleMenu')" :class="{ opened: showManu }">
                    <MouseSvg />
                    <span>{{ showManu ? 'Close Menu' : 'Open Menu' }}</span>
                </div>
            </div>
            <div class="sides-placeholder">
                <Transfers />
            </div>
        </div>
    </footer>
</template>
<script>
import Transfers from 'front/components/footer/Transfers.vue';
import Commands from 'front/components/footer/Commands.vue';
import FooterUpdates from 'front/components/footer/Updates.vue';

import MouseSvg from 'front/svg/mouse.svg';

export default {
    components: { Transfers, Commands, FooterUpdates, MouseSvg },
    props: {
        showManu: Boolean
    }
};
</script>
<style lang="postcss" scoped>
footer {
    position: fixed;
    bottom: 0;
    left: 0;
    z-index: 11;
    overflow: hidden;
    display: flex;
    width: 100%;

    & .footer-content {
        margin: auto;
        overflow: hidden;
        display: flex;
        width: 100%;
        max-width: 1550px;

        & .sides-placeholder {
            width: 50%;
            align-items: center;
            display: flex;
        }

        & .main-placeholder {
            width: auto;
            margin: auto;
            text-align: center;
        }

        & .open-menu {
            display: inline-flex;
            cursor: pointer;
            padding: 0.75rem 1.25rem;
            user-select: none;
            border-radius: 1rem 1rem 0 0;
            background-color: color-mod(var(--dark-white-color) a(5%));
            align-items: center;
            width: auto;

            &.opened {
                & span {
                    color: color-mod(var(--main-color) a(85%));
                }

                & svg {
                    fill: color-mod(var(--main-color) a(85%));
                }
            }

            & span {
                display: flex;
                color: color-mod(var(--dark-white-color) a(85%));
                font-weight: 600;
                font-size: 0.8em;
                white-space: nowrap;
            }

            & svg {
                width: 1.25rem;
                min-width: 1.25rem;
                height: 1.25rem;
                margin-right: 1em;
                fill: color-mod(var(--dark-white-color) a(85%));
            }
        }
    }
}
</style>
