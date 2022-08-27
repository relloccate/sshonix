<template>
    <TopHeader />
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
import { setRenaming, setSelecting, refresh, deleteItems } from 'front/misc/SftpEvents';

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
            if (event.ctrlKey) {
                // shit === false, to keep electron force reload option in dev mode
                if (event.shiftKey === false && event.code === 'KeyR') {
                    event.preventDefault();
                    refresh();
                }

                if (event.code === 'KeyA') {
                    // IF WE IN INPUT - SELECT
                    try {
                        // https://stackoverflow.com/questions/28171741/select-all-ctrla-keyboard-button-not-working-for-input-filed-inside-the-html5
                        event.target?.select();
                    } catch {
                        event.preventDefault();
                        setSelecting(true);
                    }
                }

                // CENTER MOUSE
                if (event.button === 1) {
                    event.preventDefault();
                }
            }

            if (event.code === 'F5') {
                event.preventDefault();
                refresh();
            }

            if (event.code === 'F2') {
                event.preventDefault();
                setRenaming(true);

                // this.$nextTick(() => {
                //     const input = document.querySelector('.renaming');
                //     input.focus();
                // });
            }

            const isConfirmMenuOpened = document.querySelector('.confirm-menu');

            // !event.target?.select - IF WE NOT IN INPUT/TEXTAREA
            if (!isConfirmMenuOpened && !event.target?.select) {
                if (event.code === 'Escape') {
                    event.preventDefault();
                    setSelecting(false);
                }

                if (event.code === 'Delete') {
                    event.preventDefault();
                    deleteItems.bind(this)();
                }
            }
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
