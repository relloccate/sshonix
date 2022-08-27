<template>
    <div class="pool">
        <PoolWrap :terminal="item.terminal" :sftp="item.sftp" v-for="item in getItems" :key="item.channel" v-show="item.terminal.active" />
    </div>
</template>
<script>
import StoreActiveTerminals from 'front/store/StoreActiveTerminals';
import StoreActiveSftps from 'front/store/StoreActiveSftps';
import PoolWrap from 'front/components/PoolWrap.vue';

export default {
    components: { PoolWrap },
    computed: {
        getItems() {
            const { items: terminals } = StoreActiveTerminals;
            const { items: sftps } = StoreActiveSftps;
            const result = {};

            for (const terminal of terminals) {
                result[terminal.channel] = {
                    channel: terminal.channel,
                    terminal,
                    sftp: null
                };
            }

            for (const sftp of sftps) {
                result[sftp.channel].sftp = sftp;
            }

            return Object.values(result);
        }
    }
};
</script>
<style lang="postcss">
.pool {
    display: flex;
    margin: auto;
    margin-top: 4em;
    width: 100%;
    height: calc(100vh - 9em);
    animation: fade-left 0.3s var(--ease);
    /* overflow: hidden; */
}
</style>
