<template>
    <div class="explorer" tabindex="0" @keydown="onKeyDown" autofocus>
        <div class="wrap">
            <div class="top">
                <div class="buttons">
                    <button @click="back"><BackSvg /></button>
                    <button @click="selectDirectory(false)">Choose Folder</button>
                </div>
                <div class="path">
                    <div class="chunks" v-if="currentPathChunks.length > 0">
                        <div class="chunk" v-for="chunk in currentPathChunks" :key="chunk.fullPath">
                            <span class="chunk-path" @click="setDir(chunk.fullPath)">{{ chunk.title }}</span>
                            <span class="delimeter">/</span>
                        </div>
                    </div>
                    <input type="text" class="text-input" v-model="currentPath" @keyup.enter="onPathEnter" />
                </div>
                <div class="buttons">
                    <button @click="toggleExplorer(false, 'none', '')"><CloseSvg /></button>
                </div>
            </div>
            <div class="titles">
                <div class="title-wrap">
                    <span>Name</span>
                </div>
                <div class="title-wrap">
                    <span>Size</span>
                </div>
                <div class="title-wrap">
                    <span>Created</span>
                </div>
                <div class="title-wrap">
                    <span>Modified</span>
                </div>
            </div>
            <div class="items scroll-theme" v-if="sortedResults.length">
                <div
                    class="item"
                    :class="{ selected: file.selected, file: !file.data.isDirectory }"
                    v-for="file in sortedResults"
                    :key="file.data.fullPath"
                    @click="select(file.data, $event)"
                    @dblclick="selectDirectory(file.data)"
                >
                    <div class="main-data">
                        <div class="name">
                            <FolderSvg v-if="file.data.isDirectory" />
                            <FileSvg v-else />
                            <span>{{ file.data.name }}</span>
                        </div>
                        <div class="size">
                            <span v-if="!file.data.isDirectory && file.data.stat">{{ BytesToSize(file.data.stat.size, true) }}</span>
                        </div>
                        <div class="created">
                            <span v-if="file.data.stat">{{ new Date(file.data.stat.birthtime).toLocaleString() }}</span>
                            <span v-else>No Stat</span>
                        </div>
                        <div class="modified">
                            <span v-if="file.data.stat">{{ new Date(file.data.stat.mtime).toLocaleString() }}</span>
                            <span v-else>No Stat</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="empty" v-else>
                <EmptySvg />
                <span>Nothing here</span>
            </div>
            <div class="bottom" v-if="type === 'upload' && sortedResults.length > 0">
                <div class="left">
                    <div class="buttons">
                        <button @click="upload" v-if="selectedCount === 0">UPLOAD ALL</button>
                        <button @click="upload" v-else>UPLOAD SELECTED</button>
                    </div>
                    <div class="options">
                        <label>
                            <input type="checkbox" class="option-input" v-model="options.createParentFolder" />
                            <span>Create Parent Folder</span>
                        </label>
                    </div>
                </div>
                <div class="path-to">
                    To: <span>{{ toPath }}</span>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
// FIXME: SO DIRTY
import StoreNotifications from 'front/store/StoreNotifications';
import BytesToSize from 'front/misc/BytesToSize';
import { ipcRenderer } from 'electron';
import { focusOnElement } from 'front/misc/DOM';
import { upload } from 'front/misc/SftpEvents';

import FolderSvg from 'front/svg/folder.svg';
import FileSvg from 'front/svg/file.svg';
import BackSvg from 'front/svg/back.svg';
import EmptySvg from 'front/svg/empty.svg';
import CloseSvg from 'front/svg/close.svg';
import { ctrlA, ctrlR, Escape, F5 } from 'front/misc/KeyboardEvents';

export default {
    components: { FolderSvg, FileSvg, BackSvg, EmptySvg, CloseSvg },
    props: {
        type: String, // upload | download
        to: String,
        toggleExplorer: Function
    },
    data() {
        return {
            options: {
                createParentFolder: false
            },
            files: [],
            history: [],
            currentPath: 'C:\\'
        };
    },
    async mounted() {
        this.setDir(this.currentPath);
        focusOnElement('.explorer');
    },
    computed: {
        currentPathChunks() {
            let path = '';
            const nextItems = [];
            const chunks = this.currentPath
                .replaceAll('\\', '/')
                .split('/')
                .filter(item => item.length > 0);

            for (let index = 0; index < chunks.length; index++) {
                const chunk = chunks[index];
                path += chunk + '/';

                nextItems.push({
                    title: chunk,
                    fullPath: path.slice(0, -1)
                });
            }

            return nextItems;
        },
        toPath() {
            let path = this.to;

            if (this.options.createParentFolder) {
                path += this.currentPathChunks[this.currentPathChunks.length - 1].title + '/';
            }

            return path;
        },
        lastDirectory() {
            const { length, [length - 1]: directory } = this.history;
            return directory ? directory : null;
        },
        sortedResults() {
            const directories = [];
            const files = [];

            for (const file of Object.values(this.files)) {
                if (file.data.isDirectory) {
                    directories.push(file);
                } else {
                    files.push(file);
                }
            }

            return [...directories.sort(), ...files.sort()];
        },
        selectedCount() {
            return this.files.filter(item => item.selected).length;
        }
    },
    methods: {
        BytesToSize,
        getItems() {
            const files = this.selectedCount > 0 ? this.files.filter(item => item.selected) : this.files;
            const items = {
                files: files.filter(({ data }) => !data.isDirectory).map(({ data }) => data.fullPath),
                folders: files.filter(({ data }) => data.isDirectory).map(({ data }) => data.fullPath)
            };

            return items;
        },
        upload() {
            upload(this.getItems(), this.toPath);
            this.toggleExplorer(false, 'none', '');
        },
        onPathEnter(event) {
            this.setDir(event.target.value);
        },
        async setDir(path, noHistoryPush) {
            const files = await ipcRenderer.invoke('get-directory-files', path);

            if (typeof files === 'string') {
                return StoreNotifications.add({ text: files });
            }

            const nextPath = path.replaceAll('\\', '/');

            if (!noHistoryPush && this.lastDirectory !== nextPath) this.history.push(nextPath);
            this.setFiles(files);
            this.currentPath = nextPath;
        },
        setFiles(items) {
            this.files = items.map((item, index) => {
                return {
                    index,
                    selected: false,
                    data: item
                };
            });
        },
        selectRange(file) {
            const firstSelected = this.sortedResults.findIndex(file => file.selected);
            const lastSelected = this.sortedResults.findIndex(item => file.fullPath === item.data.fullPath);
            const indexes = [];

            if (firstSelected < lastSelected) {
                for (let index = firstSelected; index < lastSelected + 1; index++) {
                    indexes.push(this.sortedResults[index].index);
                }
            } else {
                for (let index = lastSelected; index < firstSelected + 1; index++) {
                    indexes.push(this.sortedResults[index].index);
                }
            }

            for (const item of this.files) {
                if (item.selected) item.selected = false;
                if (indexes.includes(item.index)) {
                    item.selected = true;
                }
            }
        },
        select(data, event) {
            if (event.shiftKey) {
                this.selectRange(data);
            } else {
                for (const file of this.files) {
                    if (!event.ctrlKey && file.selected) file.selected = false;
                    if (file.data.fullPath === data.fullPath) file.selected = !file.selected;
                }
            }
        },
        selectAll(state) {
            for (const file of this.files) {
                file.selected = state;
            }
        },
        refresh(event) {
            event.preventDefault();
            this.setDir(this.currentPath, true);
            StoreNotifications.add({ text: 'Refreshed' });
        },
        onKeyDown(event) {
            ctrlR(event, () => {
                this.refresh(event);
            });

            ctrlA(event, () => {
                this.selectAll(true);
            });

            F5(event, () => {
                this.refresh(event);
            });

            const isConfirmMenuOpened = document.querySelector('.confirm-menu');

            // !event.target?.select - IF WE NOT IN INPUT/TEXTAREA
            if (!isConfirmMenuOpened && !event.target?.select) {
                Escape(event, () => {
                    if (this.selectedCount > 0) {
                        this.selectAll(false);
                    } else {
                        this.toggleExplorer(false, 'none', '');
                    }
                });
            }
        },
        async selectDirectory(file) {
            if (file && !file.isDirectory) return;

            const directory = file.fullPath ? file.fullPath : await ipcRenderer.invoke('choose-path');

            if (directory) {
                this.setDir(directory);
            }
        },
        async back() {
            if (!this.history.length || this.history.length === 1) return;

            this.history = this.history.slice(0, -1);
            this.setDir(this.lastDirectory, true);
        }
    }
};
</script>
<style lang="postcss" scoped>
.explorer {
    user-select: none;
    position: fixed;
    top: calc(4em);
    left: 0;
    height: calc(100% - 6em);
    width: 100%;
    padding: 2em;
    z-index: 10;
    background-color: color-mod(var(--back-color) a(99%));

    & .wrap {
        margin: auto;
        width: 100%;
        max-width: 1550px;
        height: auto;
        max-height: 100%;
        border: 1px solid color-mod(var(--main-color) a(15%));
        /* overflow: hidden; */
        display: flex;
        flex-flow: column;
        border-radius: 0.75em;

        & .bottom {
            border-top: 1px solid color-mod(var(--main-color) a(15%));
            display: flex;
            align-items: center;

            & .left {
                padding: 1em;
                width: 50%;
                align-items: center;
                display: flex;

                & .buttons {
                    margin-right: 1em;
                }
            }

            & .path-to {
                padding: 1em;
                border-left: 1px solid color-mod(var(--main-color) a(15%));
                width: 50%;
                font-weight: 600;
                font-size: 0.85em;

                & span {
                    color: var(--main-color);
                }
            }
        }

        & .top {
            align-items: center;
            padding: 1em;
            display: flex;
            /* background-color: color-mod(var(--main-color) a(5%)); */
            border-bottom: 1px solid color-mod(var(--main-color) a(15%));

            & .path {
                padding: 0.75em;
                /* border: 1px solid color-mod(var(--main-color) a(15%)); */
                background-color: var(--back-color);
                width: 100%;
                margin: 0 1em;
                border-radius: 0.75em;
                position: relative;

                & .chunks {
                    position: absolute;
                    display: flex;
                    flex-flow: row nowrap;
                    overflow-x: auto;
                    overflow-y: hidden;
                    top: -2em;
                    /* background-color: color-mod(var(--main-color) a(5%)); */
                    background-color: var(--back-color);
                    padding: 0.5rem 1rem;
                    border-radius: 1em;
                    border: 1px solid color-mod(var(--main-color) a(15%));

                    & .chunk {
                        white-space: nowrap;
                        font-weight: 600;
                        font-size: 0.85em;

                        &:last-child .delimeter {
                            display: none;
                        }

                        & .chunk-path {
                            color: var(--main-color);
                            cursor: pointer;
                        }

                        & .delimeter {
                            font-size: 0.85em;
                            margin: 0.5rem;
                        }
                    }
                }
            }

            & .buttons {
                display: flex;
                align-items: center;

                & button {
                    margin-right: 1em;
                    white-space: nowrap;

                    &:last-child {
                        margin-right: 0;
                    }
                }
            }
        }
    }
}

.titles {
    display: flex;
    padding: 1em;

    & .title-wrap {
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
            display: flex;
            border-radius: 0.5rem;
            font-size: 0.8em;
            font-weight: 600;
            background-color: color-mod(var(--main-color) a(5%));
            padding: 0.5rem 1rem;
            color: var(--main-color);
            margin: 0 0.5rem 0 0;
        }
    }
}

.empty {
    padding: 1.5em 1.25em;
    border-top: 1px solid color-mod(var(--main-color) a(15%));
    display: flex;
    justify-content: center;
    align-items: center;

    & svg {
        width: 1.25em;
        height: 1.25em;
        margin-right: 1em;
        fill: var(--main-color);
    }

    & span {
        display: flex;
        color: var(--main-color);
        font-weight: 600;
        font-size: 0.9em;
    }
}

.items {
    overflow: auto;
    border-top: 1px solid color-mod(var(--main-color) a(15%));

    & .item {
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

                & .created,
                & .modified {
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

                & .created,
                & .modified {
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

            & .created,
            & .modified {
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
}
</style>
