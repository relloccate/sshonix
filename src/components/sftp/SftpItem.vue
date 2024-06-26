<template>
    <div
        class="item"
        :class="{ file: file.type !== 'd', selected, dragging }"
        @drop="dropHandler($event, file.type !== 'd' ? currentPath : `${currentPath}/${file.name}/`, $emit('onDragEnd'))"
        v-on="file.type === 'd' ? { dragover: () => (dragging = true), dragleave: () => (dragging = false) } : {}"
    >
        <div class="main-data" @dblclick="onDblClick" @click="onClick" @click.right="onRightClick">
            <div class="name">
                <FolderSvg v-if="file.type === 'd'" v-once />
                <FileSvg v-else-if="file.type === '-'" v-once />
                <input
                    v-if="renaming.status"
                    :value="renaming.value"
                    @input="setRenaming(true, $event.target.value)"
                    @keyup="onRenameInput"
                    @blur="onBlur"
                    type="text"
                    class="renaming text-input"
                    placeholder="Input New Name"
                />
                <span v-else>{{ file.name }}{{ file.extension }}</span>
            </div>
            <div class="size">
                <span v-if="file.type === '-'">{{ getSize() }}</span>
            </div>
            <div class="modified">
                <span>{{ new Date(file.modifyTime).toLocaleString() }}</span>
            </div>
            <div class="accessed">
                <span>{{ new Date(file.accessTime).toLocaleString() }}</span>
            </div>
        </div>
    </div>
</template>
<script>
import SftpTop from 'front/components/sftp/SftpTop.vue';
import StoreActiveSftps from 'front/store/StoreActiveSftps';
import bytesToSize from 'front/misc/BytesToSize';
import { focusOnElement } from 'front/misc/DOM';
import { rename } from 'front/misc/SftpEvents';
import { dropHandler } from 'front/misc/DragAndDrop';

import FolderSvg from 'front/svg/folder.svg';
import FileSvg from 'front/svg/file.svg';
import EmptySvg from 'front/svg/empty.svg';

// https://askubuntu.com/questions/1028506/how-do-i-display-filetype-with-ls

// ‘-’ regular file
// ‘b’ block special file
// ‘c’ character special file
// ‘C’ high performance (“contiguous data”) file
// ‘d’ directory
// ‘D’ door (Solaris 2.5 and up)
// ‘l’ symbolic link
// ‘M’ off-line (“migrated”) file (Cray DMF)
// ‘n’ network special file (HP-UX)
// ‘p’ FIFO (named pipe)
// ‘P’ port (Solaris 10 and up)
// ‘s’ socket
// ‘?’ some other file type

export default {
    components: { SftpTop, FolderSvg, FileSvg, EmptySvg },
    inject: ['channel'],
    props: {
        selected: Boolean,
        renaming: {
            status: Boolean,
            value: String
        },
        file: Object,
        currentPath: String
    },
    updated() {
        if (this.renaming.status) focusOnElement('.renaming');
    },
    emits: ['onDragEnd', 'selectRange'],
    data() {
        return {
            // ON BLUR EVENT WILL SEND RENAME SECOND TIME
            enterPressed: false,
            dragging: false
        };
    },
    methods: {
        dropHandler,
        getSize() {
            const { size, mark } = bytesToSize(this.file.size);
            return `${size} ${mark}`;
        },
        async onRenameInput(event) {
            if (event.code === 'Enter') {
                this.enterPressed = true;
                await rename(`${this.currentPath}${this.file.name}`, `${this.currentPath}${this.renaming.value}`);
            }

            if (event.code === 'Escape') {
                this.setRenaming(false, '');
            }

            if (event.code === 'Enter' || event.code === 'Escape') {
                await focusOnElement(`[id='${this.channel}-focus']`);
            }
        },
        async onBlur() {
            if (!this.renaming.status || this.enterPressed) return;
            if (this.renaming.value !== this.file.name) {
                await rename(`${this.currentPath}${this.file.name}`, `${this.currentPath}${this.renaming.value}`);
            } else {
                this.setRenaming(false, '');
            }

            if (this.enterPressed) this.enterPressed = false;
        },
        setRenaming(status, value) {
            StoreActiveSftps.setRenaming(this.channel, this.file, status, value);
        },
        onDblClick(event) {
            if (this.renaming.status || event.ctrlKey) return;

            if (this.file.type === 'd') {
                StoreActiveSftps.choosePath(this.channel, this.file.name, true);
            }
        },
        onClick(event) {
            if (this.renaming.status) return;

            const delelectOthers = this.selected ? false : !event.ctrlKey;

            if (event.shiftKey) {
                this.$emit('selectRange', this.file);
            } else {
                StoreActiveSftps.select(this.channel, this.file, delelectOthers);
            }
        },
        onRightClick() {
            if (this.renaming.status) return;

            if (!this.selected) {
                StoreActiveSftps.select(this.channel, this.file, true);
            }
        }
    }
};
</script>
<style lang="postcss" scoped>
.item {
    align-items: center;
    color: var(--grey-color);
    border-bottom: 1px solid var(--back-color);
    user-select: none;
    /* transition: color 0.3s var(--ease), border-color 0.3s var(--ease); */
    transition: color 0.3s var(--ease), background-color 0.3s var(--ease), border-color 0.3s var(--ease);

    &.dragging {
        background-color: color-mod(var(--dark-white-color) a(5%));
    }

    &.file {
        color: color-mod(var(--dark-white-color) a(85%));

        & .main-data {
            &:hover {
                background-color: color-mod(var(--dark-white-color) a(5%));
            }

            & > div svg {
                fill: color-mod(var(--dark-white-color) a(85%));
            }

            & .modified,
            & .accessed {
                & span {
                    background-color: color-mod(var(--dark-white-color) a(15%));
                    color: color-mod(var(--dark-white-color) a(85%));
                }
            }
        }
    }

    &.selected {
        color: var(--back-color);
        background-color: color-mod(var(--main-color) a(85%));
        border-bottom: 1px solid color-mod(var(--back-color) a(15%));

        &.file {
            background-color: color-mod(var(--dark-white-color) a(75%));
        }

        & input {
            color: var(--back-color);
            font-size: 0.9rem;
        }

        & .main-data {
            & > div svg {
                fill: var(--back-color);
            }

            & .modified,
            & .accessed {
                & span {
                    background-color: var(--back-color);
                }
            }
        }
    }

    &:last-child {
        margin-bottom: 0;
        border-bottom: none;
    }

    & .main-data {
        display: flex;
        align-items: center;
        width: 100%;
        padding: 1em 1.25em;
        cursor: pointer;

        &:hover {
            background-color: color-mod(var(--grey-color) a(5%));
        }

        & > div {
            display: flex;
            align-items: center;
            padding: 0 0.5em;

            & svg {
                width: 1em;
                min-width: 1em;
                height: 1em;
                margin-right: 1em;
                fill: var(--grey-color);
            }

            & span {
                font-weight: 600;
                font-size: 0.8em;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }

        & .name {
            display: flex;
            align-items: center;
            width: 35%;
        }

        & .size {
            display: flex;
            align-items: center;
            width: 25%;
        }

        & .modified,
        & .accessed {
            width: 20%;

            & span {
                display: inline-flex;
                text-transform: capitalize;
                border-radius: 1.25em;
                font-size: 0.8em;
                background-color: color-mod(var(--grey-color) a(15%));
                padding: 0.5em 1em;
                font-weight: 600;
                color: var(--grey-color);
            }
        }
    }
}
</style>
