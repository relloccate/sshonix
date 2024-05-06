<template>
    <div class="wrap">
        <TopHeaderActiveTerminals />
        <TopHeaderConnectToServer />
    </div>
</template>
<script>
import TopHeaderActiveTerminals from 'front/components/header/TopHeaderActiveTerminals.vue';
import TopHeaderConnectToServer from 'front/components/header/TopHeaderConnectToServer.vue';

export default {
    components: { TopHeaderActiveTerminals, TopHeaderConnectToServer }
};
</script>
<style lang="postcss" scoped>
.wrap {
    width: calc(100% - 320px);
    max-width: 1550px;
    margin: auto;
    /* border: 1px solid color-mod(var(--main-color) a(15%)); */
    display: flex;
}
</style>
