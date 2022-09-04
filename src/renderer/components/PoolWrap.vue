<template>
    <div class="pool-wrap">
        <div class="pages" v-if="terminal.type === 'remote'">
            <div class="page" :class="{ active: page === 'terminal' }" @click="page = 'terminal'">Terminal</div>
            <div class="page" :class="{ active: page === 'sftp' }" @click="page = 'sftp'">Sftp</div>
        </div>
        <div class="page-data">
            <Terminal :added="terminal.added" :exec="terminal.exec" :channel="terminal.channel" :cwd="terminal.cwd" :type="terminal.type" v-show="page === 'terminal'" />
            <Sftp :sftp="sftp" v-if="sftp" v-show="page === 'sftp'" />
        </div>
    </div>
</template>
<script>
//FIXME: REWRITE Terminal props
import Terminal from 'front/components/Terminal.vue';
import Sftp from 'front/components/sftp/Sftp.vue';

export default {
    components: { Terminal, Sftp },
    props: {
        terminal: Object,
        sftp: Object
    },
    data() {
        return {
            page: 'terminal'
        };
    }
};
</script>
<style lang="postcss">
.pool-wrap {
    display: flex;
    flex-flow: column;
    margin: auto;
    height: 100%;
    width: 100%;
    max-width: 1550px;

    & .pages {
        width: 50%;
        display: flex;
        justify-content: space-between;
        padding: 0 1.25em;
        margin: 0 auto;

        & .page {
            width: calc(50% - 0.5em);
            z-index: 10;
            display: flex;
            flex-flow: row nowrap;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            user-select: none;
            padding: 0.5rem 1.5rem;
            background-color: color-mod(var(--main-color) a(5%));
            border-radius: 0.25rem 0.25rem 0.75rem 0.75rem;
            transition: transform 0.2s var(--ease), background-color 0.3s var(--ease);
            color: var(--main-color);

            &:not(.active):hover {
                transform: translateY(2px);
                background-color: color-mod(var(--main-color) a(15%));
            }

            &:active {
                transform: translateY(-1px);
            }

            &:last-child {
                margin-right: 0;
            }

            &.active {
                background-color: color-mod(var(--main-color) a(85%));
                color: var(--back-color);

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

    & .page-data {
        width: 100%;
        margin: 0;
        padding-top: 1em;
        height: 100%;
    }
}
</style>
