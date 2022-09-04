<template>
    <div class="item" :class="{ file: file.type !== 'd', selected }">
        <div class="main-data" @dblclick="onDblClick" @click="onClick" @click.right="onRightClick">
            <div class="name">
                <FolderSvg v-if="file.type === 'd'" v-once />
                <FileSvg v-else-if="file.type === '-'" v-once />
                <input
                    v-if="renaming.status"
                    :value="renaming.value"
                    @input="setRenaming(true, $event.target.value)"
                    @keyup="onRenameInput"
                    @blur="setRenaming(false, '')"
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
import { ipcRenderer } from 'electron';

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
        // TODO: MOVE THIS AND REMOVE UPDATE METHOD
        if (this.renaming.status) {
            this.$nextTick(() => {
                const input = document.querySelector('.renaming');
                input.focus();
            });
        }
    },
    methods: {
        getSize() {
            const { size, mark } = bytesToSize(this.file.size);
            return `${size} ${mark}`;
        },
        async onRenameInput(event) {
            if (event.code === 'Enter') {
                await ipcRenderer.invoke('sftp:rename', {
                    channel: this.channel,
                    from: `${this.currentPath}${this.file.name}`,
                    to: `${this.currentPath}${this.renaming.value}`
                });

                StoreActiveSftps.refresh(this.channel);
            }

            if (event.code === 'Escape') {
                this.setRenaming(false, '');
            }
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
    border-bottom: 1px dashed color-mod(var(--main-color) a(15%));
    user-select: none;
    transition: color 0.3s var(--ease), background-color 0.3s var(--ease);

    &.file {
        color: color-mod(var(--dark-white-color) a(85%));
        border-bottom: 1px dashed color-mod(var(--dark-white-color) a(10%));

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

    &.selected:not(.deleting) {
        color: var(--back-color);
        background-color: color-mod(var(--main-color) a(85%));
        border-bottom: 1px dashed var(--back-color);

        &.file {
            background-color: color-mod(var(--dark-white-color) a(75%));
        }

        & input {
            color: var(--back-color);
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

        &.deleting {
            justify-content: space-between;

            & button {
                width: calc(50% - 0.5rem);
            }
        }

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
