<template>
    <div class="pool">
        <PoolWrap
            :channel="item.channel"
            :title="item.title"
            :active="item.active"
            :focus="item.focus"
            :type="item.type"
            :terminal="item.terminal"
            :sftp="item.sftp"
            v-for="item in getItems"
            :key="item.channel"
            v-show="item.active"
        />
    </div>
</template>
<script lang="ts">
import StoreActiveTerminals from 'front/store/StoreActiveTerminals';
import StoreActiveSftps from 'front/store/StoreActiveSftps';
import PoolWrap from 'front/components/PoolWrap.vue';
import StoreActiveTabs from 'front/store/StoreActiveTabs';

import type { PiniaActiveTerminalItem, PiniaActiveSftpsItem, PiniaActiveTabItem } from 'types/store';

export default {
    components: { PoolWrap },
    computed: {
        getItems() {
            const { items: tabs } = StoreActiveTabs;
            const result: {
                [key: number]: {
                    terminal?: PiniaActiveTerminalItem;
                    sftp?: PiniaActiveSftpsItem;
                } & PiniaActiveTabItem;
            } = {};

            for (const tab of tabs) {
                if (result[tab.channel] === undefined) {
                    result[tab.channel] = {
                        title: tab.title,
                        active: tab.active,
                        focus: tab.focus,
                        type: tab.type,
                        channel: tab.channel,
                        terminal: undefined,
                        sftp: undefined
                    };
                }

                const terminal = StoreActiveTerminals.items.find(item => item.channel === tab.channel);
                const sftp = StoreActiveSftps.items.find(item => item.channel === tab.channel);

                if (tab.type === 'both' || tab.type === 'ssh') {
                    result[tab.channel].terminal = terminal;
                }

                if (tab.type === 'both' || tab.type === 'sftp') {
                    result[tab.channel].sftp = sftp;
                }
            }

            return Object.values(result) as typeof result;
        }
    }
};
</script>
<style lang="postcss">
.pool {
    display: flex;
    margin: auto;
    margin-top: 0;
    width: 100%;
    height: calc(100vh - 9em);
    animation: fade-left 0.3s var(--ease);
    /* overflow: hidden; */
}
</style>
