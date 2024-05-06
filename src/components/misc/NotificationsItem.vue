<template>
    <div class="notification" :class="{ hidden }">
        <div class="text">{{ text }}</div>
    </div>
</template>
<script>
import StoreNotifications from 'front/store/StoreNotifications';

export default {
    props: {
        id: Number,
        text: String
    },
    data() {
        return {
            hidden: false
        };
    },
    mounted() {
        // YES, 2 TIMEOUTS
        setTimeout(() => {
            this.hidden = true;

            setTimeout(() => {
                StoreNotifications.remove(this.id);
            }, 300);
        }, 1500);
    }
};
</script>
<style lang="postcss" scoped>
.notification {
    display: inline-flex;
    width: auto;
    margin: auto;
    margin-top: 1em;
    animation: fade-left 0.5s var(--ease);
    transition: opacity 0.3s var(--ease);

    & .text {
        border-radius: 0.75rem;
        padding: 0.75rem 1.25rem;
        font-size: 0.85em;
        font-weight: 600;
        color: var(--back-color);
        background-color: var(--main-color);
        background-image: linear-gradient(129deg, color-mod(var(--grey-color) a(1%)), color-mod(var(--main-color) a(1%)));
    }

    &.hidden {
        opacity: 0;
    }
}
</style>
