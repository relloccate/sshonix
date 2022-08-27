<template>
    <header>
        <div class="wrap">
            <div class="top">
                <!-- <div class="logo">
                    <span>SSHONIX</span>
                </div> -->
                <TopHeaderActiveTerminals />
            </div>
        </div>
    </header>
</template>
<script>
import TopHeaderActiveTerminals from 'front/components/header/TopHeaderActiveTerminals.vue';

export default {
    components: { TopHeaderActiveTerminals }
};
</script>
<style lang="postcss" scoped>
header {
    position: fixed;
    top: 3em;
    width: calc(100% - 4em);
    height: 3.75em;
    z-index: 10;
    /* backdrop-filter: saturate(150%) blur(5px); */
    transition: height 0.3s var(--ease);

    &.settings-opened {
        height: 100%;

        & .wrap {
            border-radius: 0;
        }
    }

    & .wrap {
        width: 100%;
        max-width: 1550px;
        height: 100%;
        margin: auto;
        border-radius: 0 0 0.75em 0.75em;
        border: 1px solid color-mod(var(--main-color) a(15%));
        border-top: none;

        & .top {
            width: 100%;
            display: flex;
        }

        & .logo {
            padding: 1.25em 2em;
            border-right: 1px solid color-mod(var(--main-color) a(15%));

            & span {
                display: inline-flex;
                font-weight: 600;
                color: var(--grey-color);
            }
        }

        & .icons {
            margin-left: auto;
            margin-right: 2em;
            padding-top: 1em;
            cursor: pointer;

            & svg {
                width: 1.75em;
                height: 1.75em;
                fill: var(--grey-color);
            }
        }
    }
}
</style>
