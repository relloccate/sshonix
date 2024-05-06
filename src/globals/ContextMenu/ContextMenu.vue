<template>
    <div class="context-menu" :style="{ left: `${options.x}px`, top: `${options.y}px` }" @focusout="close()" tabindex="0">
        <div class="items">
            <div class="item" v-for="item in options.items" @click="onClick(item.invoke)">
                {{ item.title }}
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue';

type OptionsItem = {
    title: string;
    invoke(): Function;
};

type Options = {
    x: number;
    y: number;
    items: OptionsItem[];
};

export default defineComponent({
    props: {
        close: {
            type: Function,
            required: true
        },
        options: {
            type: Object as PropType<Options>,
            required: true
        }
    },
    methods: {
        onClick(invoke: OptionsItem['invoke']) {
            invoke();
            this.close();
        }
    }
});
</script>
<style lang="postcss" scoped>
.context-menu {
    position: fixed;
    /* height: auto; */
    width: 250px;
    z-index: 12;

    & .items {
        user-select: none;
        border-radius: 0.75em;
        border: 1px solid color-mod(var(--main-color) a(15%));
        background-color: var(--back-color);
        overflow: hidden;

        & .item {
            width: 100%;
            cursor: pointer;
            border-bottom: 1px solid var(--back-color);
            margin: 0;
            padding: 0.75rem 2.5rem;
            font-size: 0.85em;
            font-weight: 600;
            color: var(--back-color);
            background-color: var(--main-color);
            background-image: linear-gradient(129deg, color-mod(var(--grey-color) a(1%)), color-mod(var(--main-color) a(1%)));

            &:hover {
                background-color: var(--back-color);
                color: var(--main-color);
            }
        }
    }
}
</style>
