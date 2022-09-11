<template>
    <div class="confirm-menu">
        <div class="wrap">
            <div class="text">{{ options.text }}</div>
            <div class="actions">
                <button @click="accept">{{ options.accept.text }}</button>
                <button @click="decline">{{ options.decline.text }}</button>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    props: {
        close: Function,
        options: Object
    },
    unmounted() {
        document.removeEventListener('keydown', this.onKeyDown);
    },
    mounted() {
        document.addEventListener('keydown', this.onKeyDown);
    },
    methods: {
        onKeyDown(event) {
            if (event.code === 'Enter') {
                event.preventDefault();
                this.accept();
            }

            if (event.code === 'Escape') {
                event.preventDefault();
                this.decline();
            }
        },
        accept() {
            this.options?.accept?.event();
            this.close();
        },
        decline() {
            if (this.options.decline.event) return this.options.decline.event();

            this.close();
        }
    }
};
</script>
<style lang="postcss" scoped>
.confirm-menu {
    display: block;
    margin: 0;
    position: absolute;
    z-index: 15;
    overflow: hidden;
    width: calc(100% - 4em);
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    backdrop-filter: saturate(150%) blur(5px);
    background-color: color-mod(var(--back-color) a(95%));
    animation: fade-left 0.3s var(--ease);

    & .wrap {
        padding: 1.25em 1.75em;
        border-radius: 0.75rem;
        background-image: linear-gradient(129deg, color-mod(var(--grey-color) a(1%)), color-mod(var(--main-color) a(1%)));
        background-color: var(--back-color);
        border: 1px dashed color-mod(var(--main-color) a(25%));

        & .text {
            /* font-weight: 600; */
        }

        & .actions {
            display: flex;
            justify-content: space-between;
            margin-top: 1em;

            & > button {
                width: calc(50% - 0.5em);
                justify-content: center;
            }
        }
    }
}
</style>
