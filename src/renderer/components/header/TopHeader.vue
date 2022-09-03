<template>
    <header>
        <div class="wrap">
            <TopHeaderActiveTerminals />
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

    & .wrap {
        width: 100%;
        max-width: 1550px;
        height: 100%;
        margin: auto;
        border-radius: 0 0 0.75em 0.75em;
        border: 1px solid color-mod(var(--main-color) a(15%));
        border-top: none;
        display: flex;
    }
}
</style>
