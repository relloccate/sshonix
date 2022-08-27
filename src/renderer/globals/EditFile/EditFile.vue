<template>
    <div class="edit-file">
        <div class="wrap">
            <div class="top">
                <div class="name">{{ file.name }}</div>
                <div class="actions">
                    <button @click="save">{{ isPending ? 'UPLOADING' : 'SAVE' }}</button>
                </div>
            </div>
            <textarea class="text-input scroll-theme" v-model="value" />
        </div>
    </div>
</template>
<script>
import { refresh, writeQuickEdit } from 'front/misc/SftpEvents';

export default {
    data() {
        return {
            isPending: false,
            value: this.file.data
        };
    },
    props: {
        close: Function,
        channel: Number,
        file: {
            data: String,
            name: String,
            path: String
        }
    },
    unmounted() {
        document.removeEventListener('keydown', this.onKeyDown);
    },
    mounted() {
        document.addEventListener('keydown', this.onKeyDown);
    },
    methods: {
        onKeyDown(event) {
            if (event.code === 'Escape') {
                this.close();
            }
        },
        async save() {
            if (this.isPending) return;

            this.isPending = true;

            await writeQuickEdit(this.file.path, this.value);
            await refresh();
            this.close();

            this.isPending = false;
        }
    }
};
</script>
<style lang="postcss" scoped>
.edit-file {
    top: 3em;
    margin: 0;
    position: absolute;
    z-index: 15;
    overflow: hidden;
    width: calc(100% - 4em);
    height: 100%;
    display: flex;
    backdrop-filter: saturate(150%) blur(5px);
    background-color: color-mod(var(--back-color) a(90%));
    animation: fade-left 0.3s var(--ease);

    & .wrap {
        width: 100%;
        height: calc(100% - 7em);
        display: flex;
        margin: 2em auto;
        max-width: 1550px;
        flex-flow: column;

        & .top {
            margin-bottom: 2rem;
            display: flex;
            align-items: center;

            & .name {
                font-weight: 600;
                font-size: 1.75em;
            }

            & .actions {
                display: flex;
                justify-content: space-between;
                margin-left: auto;

                & > button {
                    justify-content: center;
                }
            }
        }

        & textarea {
            padding: 1.25em 1.75em;
            border-radius: 0.75rem;
            border: 1px dashed color-mod(var(--main-color) a(25%));
            height: 100%;
            width: 100%;
            resize: none;
        }
    }
}
</style>
