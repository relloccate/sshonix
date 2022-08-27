<template>
    <div tabindex="-1" @contextmenu="openMenu">
        <ul tabindex="0" @mouseleave="closeMenu" v-if="viewMenu" @blur="closeMenu" :style="{ left, top }">
            <li>Copy</li>
            <li>Paste</li>
        </ul>
    </div>
</template>
<script>
export default {
    data() {
        return {
            viewMenu: false,
            top: '0px',
            left: '0px'
        };
    },
    methods: {
        setMenu(top, left) {
            this.top = top + 'px';
            this.left = left + 'px';
        },
        closeMenu() {
            this.viewMenu = false;
        },
        openMenu(e) {
            this.viewMenu = true;

            this.$nextTick(() => {
                this.setMenu(e.y, e.x);
                this.$el.focus();
            });

            e.preventDefault();
        }
    }
};
</script>
<style lang="postcss" scoped>
ul {
    display: block;
    list-style: none;
    margin: 0;
    padding: 0;
    position: absolute;
    z-index: 15;
    border-radius: 0.75rem;
    overflow: hidden;
    background-color: var(--main-color);
    background-image: linear-gradient(129deg, color-mod(var(--grey-color) a(1%)), color-mod(var(--main-color) a(1%)));
    border: 1px solid var(--main-color);

    & li {
        cursor: pointer;
        border-bottom: 1px solid var(--back-color);
        margin: 0;
        padding: 0.75rem 1.25rem;
        font-size: 0.85em;
        font-weight: 600;
        color: var(--back-color);
        background-color: var(--main-color);
        background-image: linear-gradient(129deg, color-mod(var(--grey-color) a(1%)), color-mod(var(--main-color) a(1%)));

        &:last-child {
            border-bottom: none;
        }

        &:hover {
            background-color: var(--back-color);
            color: var(--main-color);
        }
    }
}
</style>
