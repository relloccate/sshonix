<template>
    <div class="notifications">
        <NotificationsItem :added="notification.added" :text="notification.text" v-for="notification in notifications" :key="notification.added" />
    </div>
</template>
<script>
import NotificationsItem from 'front/components/misc/NotificationsItem.vue';
import StoreNotifications from 'front/store/StoreNotifications';
import { storeToRefs } from 'pinia';

export default {
    components: { NotificationsItem },
    setup() {
        const { notifications } = storeToRefs(StoreNotifications);

        return {
            notifications
        };
    }
};
</script>
<style lang="postcss" scoped>
.notifications {
    z-index: 15;
    display: flex;
    position: relative;
    flex-flow: column;
    height: 0;
    user-select: none;
}
</style>
