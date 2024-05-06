<template>
    <div class="connect-to-server">
        <hr />
        <div @blur="showItems = false" tabindex="0">
            <div class="svg-wrap" :class="{ active: showItems }" @click="showItems = !showItems">
                <PlusSvg />
            </div>
            <div class="servers-wrap" v-if="showItems">
                <div class="servers">
                    <div class="items" v-if="items.length">
                        <div class="item" :key="item.id" v-for="item in items" @click="onClick(item.id, $event)">
                            <span>{{ item.title }}</span>
                        </div>
                    </div>
                    <div class="no-items" v-else>No Added Servers</div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import StoreServers from 'front/store/StoreServers';
import { ref } from 'vue';
import { connectToServer } from 'front/misc/SshEvents';
import PlusSvg from 'front/svg/plus.svg';

const { items } = StoreServers;
const showItems = ref(false);
const onClick = (id: number, event: MouseEvent) => {
    connectToServer(id, !event.ctrlKey);
    if (!event.ctrlKey) showItems.value = false;
};
</script>
<style lang="postcss" scoped>
.connect-to-server {
    align-items: center;
    display: flex;

    & .svg-wrap {
        background-color: color-mod(var(--dark-white-color) a(5%));
        padding: 0.5rem 1rem;
        border-radius: 0.75rem;
        display: flex;
        align-items: center;
        cursor: pointer;
        transition: background-color 0.3s var(--ease);
        -webkit-app-region: no-drag;

        &.active {
            background-color: color-mod(var(--main-color) a(5%));

            & svg {
                fill: color-mod(var(--main-color) a(85%));
            }
        }

        & svg {
            width: 1rem;
            height: 1rem;
            transition: fill 0.3s var(--ease);
            fill: color-mod(var(--dark-white-color) a(85%));
        }
    }

    & hr {
        margin: 0;
        display: flex;
        height: 2em;
        width: 1px;
        margin-right: 1em;
        background-color: color-mod(var(--dark-white-color) a(15%));
        border: none;
    }

    & .servers-wrap {
        position: relative;
        animation: fade-up 0.3s var(--ease);
        z-index: 10;

        & .servers {
            width: 250px;
            display: flex;
            flex-flow: column;
            position: absolute;
            background-color: var(--back-color);
            /* background-color: color-mod(var(--dark-white-color) a(5%)); */
            top: 1.5em;
            left: -200px;
            border-radius: 1rem;
            max-height: 620px;
            overflow: hidden;
            box-shadow: 1px 1px 10px 2px var(--back-color);

            & .items {
                display: flex;
                flex-flow: column;
                background-color: color-mod(var(--dark-white-color) a(5%));
                /* max-height: 150px; */
                overflow-y: auto;
                border-top: none;
                padding: 0.5em;
                overflow-y: auto;

                & .item {
                    user-select: none;
                    cursor: pointer;
                    margin-bottom: 0.5em;

                    &:first-child {
                        & span {
                            border-radius: 0.75rem 0.75rem 0.25rem 0.25rem;
                        }
                    }

                    &:last-child {
                        margin-bottom: 0;

                        & span {
                            border-radius: 0.25rem 0.25rem 0.75rem 0.75rem;
                        }
                    }

                    &:only-child {
                        & span {
                            border-radius: 0.75rem;
                        }
                    }

                    & span {
                        display: flex;
                        font-weight: 600;
                        padding: 0.75rem 1rem;
                        font-size: 0.8rem;
                        background-color: color-mod(var(--dark-white-color) a(5%));
                        /* border-radius: 0.75rem; */
                        color: var(--dark-white-color);
                        transition: color 0.3s var(--ease);
                        border-radius: 0.25rem;

                        &:hover {
                            background-color: var(--main-color);
                            color: var(--back-color);
                        }
                    }
                }
            }

            & .no-items {
                background-color: color-mod(var(--dark-white-color) a(5%));
                font-weight: 600;
                font-size: 0.95rem;
                padding: 0.5em 1.5em;
                text-align: center;
            }
        }
    }
}
</style>
