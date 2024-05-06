<template>
    <div class="titles">
        <SftpItemsTitleWrap title="Name" sortBy="name" :sort="sort" @setSort="setSort" />
        <SftpItemsTitleWrap title="Size" sortBy="size" :sort="sort" @setSort="setSort" />
        <SftpItemsTitleWrap title="Modified" sortBy="modifyTime" :sort="sort" @setSort="setSort" />
        <SftpItemsTitleWrap title="Accessed" sortBy="accessTime" :sort="sort" @setSort="setSort" />
    </div>
    <div class="drag-there" v-if="showDrag && sortedResults.length > 0" @dragover="dragOverHandler" @drop="dropHandler($event, currentPath, $emit('onDragEnd'))">
        <p>Drop There</p>
    </div>
    <div class="items scroll-theme" v-if="sortedResults.length > 0" @contextmenu="onContextMenu" @dragover="dragOverHandler" @drop="dropHandler($event, currentPath, $emit('onDragEnd'))">
        <SftpItem
            @selectRange="selectRange"
            @onDragEnd="$emit('onDragEnd')"
            :renaming="file.renaming"
            :selected="file.selected"
            :currentPath="currentPath"
            :file="file.data"
            v-for="file in sortedResults"
            :key="currentPath + file.data.name"
        />
    </div>
    <div class="empty" v-else @contextmenu="onContextMenu" @dragover="dragOverHandler" @drop="dropHandler($event, currentPath, $emit('onDragEnd'))">
        <EmptySvg />
        <span>Nothing</span>
    </div>
</template>
<script>
import SftpItem from 'front/components/sftp/SftpItem.vue';
import SftpItemsTitleWrap from 'front/components/sftp/SftpItemsTitleWrap.vue';
import StoreActiveSftps from 'front/store/StoreActiveSftps';
import { dropHandler } from 'front/misc/DragAndDrop';
import {
    copyPaths,
    createFile,
    createFolder,
    deleteItems,
    downloadItems,
    getQuickEdit,
    getSelectedItems,
    paste,
    refresh,
    setBuffer,
    setRenaming
    // uploadFiles,
    // uploadFolders
} from 'front/misc/SftpEvents';

import EmptySvg from 'front/svg/empty.svg';

export default {
    components: { SftpItem, SftpItemsTitleWrap, EmptySvg },
    inject: ['channel'],
    emits: ['onDragEnd'],
    props: {
        showDrag: Boolean,
        sort: Object,
        files: Object,
        search: String,
        currentPath: String,
        toggleExplorer: Function
    },
    computed: {
        filtered() {
            try {
                if (this.search.length > 0) {
                    return this.files.filter(({ data }) => new RegExp(this.search, 'i').test(data.name));
                }

                return this.files;
            } catch {
                return [];
            }
        },
        sortedResults() {
            const directories = [];
            const files = [];

            if (this.sort.splitFilesAndFolders) {
                for (const file of this.filtered) {
                    if (file.data.type === 'd') {
                        directories.push(file);
                    } else {
                        files.push(file);
                    }
                }
            } else {
                files.push(...this.filtered);
            }

            switch (this.sort.by) {
                case 'name':
                    if (this.sort.asc) {
                        return [...directories.sort((a, b) => a.data.name.localeCompare(b.data.name)), ...files.sort((a, b) => a.data.name.localeCompare(b.data.name))];
                    } else {
                        return [...directories.sort((a, b) => b.data.name.localeCompare(a.data.name)), ...files.sort((a, b) => b.data.name.localeCompare(a.data.name))];
                    }
                case 'size':
                    if (this.sort.asc) {
                        return [...directories.sort((a, b) => a.data.size - b.data.size), ...files.sort((a, b) => a.data.size - b.data.size)];
                    } else {
                        return [...directories.sort((a, b) => b.data.size - a.data.size), ...files.sort((a, b) => b.data.size - a.data.size)];
                    }
                case 'modifyTime':
                    if (this.sort.asc) {
                        return [...directories.sort((a, b) => a.data.modifyTime - b.data.modifyTime), ...files.sort((a, b) => a.data.modifyTime - b.data.modifyTime)];
                    } else {
                        return [...directories.sort((a, b) => b.data.modifyTime - a.data.modifyTime), ...files.sort((a, b) => b.data.modifyTime - a.data.modifyTime)];
                    }
                case 'accessTime':
                    if (this.sort.asc) {
                        return [...directories.sort((a, b) => a.data.accessTime - b.data.accessTime), ...files.sort((a, b) => a.data.accessTime - b.data.accessTime)];
                    } else {
                        return [...directories.sort((a, b) => b.data.accessTime - a.data.accessTime), ...files.sort((a, b) => b.data.accessTime - a.data.accessTime)];
                    }
            }
        }
    },
    methods: {
        dropHandler,
        dragOverHandler(ev) {
            ev.preventDefault();
        },
        selectRange(file) {
            const firstSelected = this.sortedResults.findIndex(file => file.selected);
            const lastSelected = this.sortedResults.findIndex(item => file.name === item.data.name);
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

            StoreActiveSftps.selectRange(this.channel, indexes);
        },
        setSort(by, event) {
            StoreActiveSftps.sort(this.channel, by, !event.ctrlKey);
        },
        isEditable() {
            const items = getSelectedItems();

            if (items.length !== 1) return false;
            if (items[0].data.type !== '-' || items[0].data.size > 10000000) return false;

            return true;
        },
        onContextMenu(event) {
            event.preventDefault();

            const events = {
                refresh: {
                    title: 'Refresh',
                    invoke: refresh
                },
                edit: {
                    title: 'Edit',
                    invoke: getQuickEdit.bind(this)
                },
                upload: {
                    title: 'Upload',
                    invoke: () => {
                        this.toggleExplorer(true, 'upload', this.currentPath);
                    }
                },
                download: {
                    title: 'Download',
                    invoke: downloadItems
                },
                // uploadFiles: {
                //     label: 'Upload Files',
                //     onClick: uploadFiles
                // },
                // uploadFolders: {
                //     label: 'Upload Folders',
                //     onClick: uploadFolders
                // },
                createFile: {
                    title: 'Create File',
                    invoke: createFile
                },
                createFolder: {
                    title: 'Create Folder',
                    invoke: createFolder
                },
                copyPaths: {
                    title: 'Copy Paths',
                    invoke: copyPaths
                },
                copyNames: {
                    title: 'Copy Names',
                    invoke: () => copyPaths(true)
                },
                delete: {
                    title: 'Delete',
                    invoke: () => {
                        deleteItems(this.$ConfirmMenu, true);
                    }
                },
                rename: {
                    title: 'Rename',
                    invoke: () => setRenaming(true)
                },
                copy: {
                    title: 'Copy',
                    invoke: () => setBuffer('copy')
                },
                cut: {
                    title: 'Cut',
                    invoke: () => setBuffer('cut')
                },
                paste: {
                    title: 'Paste',
                    invoke: paste
                }
            };

            const isCanPaste = StoreActiveSftps.$state.buffer.action !== 'none' && StoreActiveSftps.$state.buffer.channel === this.channel;

            this.$ContextMenu({
                x: event.x,
                y: event.y,
                items:
                    // if we have a list of files/folders
                    this.filtered.length > 0
                        ? [
                              events.refresh,
                              ...(this.isEditable() ? [events.edit] : []),
                              events.upload,
                              events.download,
                              //   events.uploadFiles,
                              //   events.uploadFolders,
                              events.createFile,
                              events.createFolder,
                              events.delete,
                              events.rename,
                              events.copyPaths,
                              events.copyNames,
                              events.copy,
                              events.cut,
                              ...(isCanPaste ? [events.paste] : [])
                          ]
                        : // if not
                          [
                              events.refresh,
                              events.upload,
                              //   events.uploadFiles,
                              //   events.uploadFolders,
                              events.createFile,
                              events.createFolder,
                              ...(isCanPaste ? [events.paste] : [])
                          ]
            });
        }
    }
};
</script>
<style lang="postcss" scoped>
.titles {
    display: flex;
    padding: 0 1.25em;
}

.drag-there {
    font-size: 1rem;
    color: color-mod(var(--dark-white-color) a(65%));
    border: 1px dashed color-mod(var(--dark-white-color) a(15%));
    padding: 0.25rem 1.5rem;
    margin: 1em;
    font-weight: 600;
    text-align: center;
    border-radius: 0.75rem;
    animation: fade-up 0.3s var(--ease);
}

.items {
    /* border-radius: 0.75em; */
    /* border: 1px solid color-mod(var(--main-color) a(15%)); */
    height: 100%;
    overflow: auto;
    /* height: calc(100vh - 15.5em); */
    /* height: auto; */
    /* display: flex; */
    /* flex-flow: column; */
}

.empty {
    padding: 1.5em 1.25em;
    border-radius: 0.75em;
    margin: 1.25rem;
    /* border: 1px solid color-mod(var(--main-color) a(15%)); */
    border: 1px solid var(--back-color);
    display: flex;
    justify-content: center;
    align-items: center;

    & svg {
        width: 1.25em;
        height: 1.25em;
        margin-right: 1em;
        fill: var(--grey-color);
    }

    & span {
        display: flex;
        color: var(--grey-color);
        font-weight: 600;
        font-size: 0.9em;
    }
}
</style>
