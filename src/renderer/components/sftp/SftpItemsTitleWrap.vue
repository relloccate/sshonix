<template>
    <div class="title-wrap">
        <span @click="$emit('setSort', sortBy)"
            >{{ title }}
            <template v-if="sort.by === sortBy">
                <DownSvg v-if="sort.asc" v-tooltip="'Lower -> Higher'" />
                <UpSvg v-else v-tooltip="'Higher -> Lower'" />
            </template>
        </span>
    </div>
</template>
<script>
import UpSvg from 'front/svg/up.svg';
import DownSvg from 'front/svg/down.svg';

export default {
    components: { UpSvg, DownSvg },
    props: {
        title: String,
        sortBy: String,
        sortEvent: Function,
        sort: {
            by: String,
            asc: Boolean
        }
    }
};
</script>
<style lang="postcss" scoped>
.title-wrap {
    &:nth-child(1) {
        width: 35%;
    }

    &:nth-child(2) {
        width: 25%;
    }

    &:nth-child(3) {
        width: 20%;
    }

    &:nth-child(4) {
        width: 20%;

        & span {
            margin-right: 0;
        }
    }

    & span {
        user-select: none;
        cursor: pointer;
        display: flex;
        border-radius: 0.5rem 0.5rem 0 0;
        font-size: 0.8em;
        font-weight: 600;
        background-color: color-mod(var(--main-color) a(5%));
        /* border: 1px solid color-mod(var(--main-color) a(15%)); */
        /* border-bottom: none; */
        padding: 0.5rem 0.85rem 0.5rem 1rem;
        color: var(--main-color);
        margin: 0 1rem 0 0;
        max-height: 31px;

        &:hover {
            background-color: color-mod(var(--main-color) a(10%));
        }

        & svg {
            margin-left: auto;
            height: 16px;
            animation: fade-up 0.3s var(--ease);
            fill: var(--main-color);
        }
    }
}
</style>
