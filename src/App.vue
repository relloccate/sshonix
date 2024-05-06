<template>
    <!-- <TopHeader /> -->
    <Notifications />
    <Pool />
    <MenuMain v-show="showManu" @toggleMenu="toggleMenu" />
    <Footer :showManu="showManu" @toggleMenu="toggleMenu" />
</template>
<script>
import TopHeader from 'front/components/header/TopHeader.vue';
import Notifications from 'front/components/misc/Notifications.vue';
import Pool from 'front/components/Pool.vue';
import MenuMain from 'front/components/menu/MenuMain.vue';
import Footer from 'front/components/footer/Footer.vue';
import { ctrlA, ctrlR } from './misc/KeyboardEvents';

export default {
    components: { TopHeader, Notifications, Pool, MenuMain, Footer },
    data() {
        return {
            showManu: false
        };
    },
    unmounted() {
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('mousedown', this.onMouseDown);
    },
    mounted() {
        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('mousedown', this.onMouseDown);
    },
    methods: {
        onKeyDown(event) {
            // JUST PREVENT DEFAULT
            ctrlR(event);
            ctrlA(event);
        },
        onMouseDown(event) {
            if (event.ctrlKey && event.button === 1) {
                event.preventDefault();
                this.showManu = !this.showManu;
            }
        },
        toggleMenu() {
            this.showManu = !this.showManu;
        }
    }
};
</script>
