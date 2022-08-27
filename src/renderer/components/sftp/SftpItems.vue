<template>
    <div class="titles">
        <div class="title-wrap">
            <span @click="setSort('name')">Name</span>
        </div>
        <div class="title-wrap">
            <span @click="setSort('size')">Size</span>
        </div>
        <div class="title-wrap">
            <span @click="setSort('modifyTime')">Modified</span>
        </div>
        <div class="title-wrap">
            <span @click="setSort('accessTime')">Accessed</span>
        </div>
    </div>
    <div class="items scroll-theme" v-if="sortedResults.length" @contextmenu="onContextMenu">
        <SftpItem @selectRange="selectRange" :renaming="file.renaming" :selected="file.selected" :currentPath="currentPath" :file="file.data" v-for="file in sortedResults" :key="file.data.name" />
    </div>
    <div class="empty" v-else @contextmenu="onContextMenu">
        <EmptySvg />
        <span>Nothing</span>
    </div>
</template>
<script>
import SftpItem from 'front/components/sftp/SftpItem.vue';
import StoreActiveSftps from 'front/store/StoreActiveSftps';
import { copyPaths, createFile, createFolder, deleteItems, downloadItems, getQuickEdit, getSelectedItems, refresh, setRenaming, uploadFiles, uploadFolders } from 'front/misc/SftpEvents';

import EmptySvg from 'front/svg/empty.svg';

export default {
    components: { SftpItem, EmptySvg },
    inject: ['channel'],
    props: {
        sort: Object,
        files: Object,
        search: String,
        currentPath: String
    },
    computed: {
        filtered() {
            try {
                if (this.search.length > 0) {
                    return this.files.filter(({ data }) => new RegExp(this.search, 'i').test(data.name));
                }

                return this.files;
            } catch (error) {
                return [];
            }
        },
        sortedResults() {
            const directories = [];
            const files = [];

            for (const file of Object.values(this.filtered)) {
                if (file.data.type === 'd') {
                    directories.push(file);
                } else {
                    files.push(file);
                }
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
        setSort(by) {
            StoreActiveSftps.sort(this.channel, by);
        },
        isEditable() {
            const items = getSelectedItems();

            if (items.length > 1) return false;
            if (items[0].data.type !== '-' || items[0].data.size > 10000000) return false;

            return true;
        },
        onContextMenu(event) {
            event.preventDefault();

            const events = {
                refresh: {
                    label: 'Refresh',
                    onClick: refresh
                },
                edit: {
                    label: 'Edit',
                    onClick: getQuickEdit.bind(this)
                },
                uploadFiles: {
                    label: 'Upload Files',
                    onClick: uploadFiles
                },
                // uploadFiles: {
                //     label: 'Upload Files',
                //     onClick: () => {
                //         this.$ConfirmMenu({
                //             text: `If the files already exist, they will be overwritten`,
                //             accept: {
                //                 text: 'OK',
                //                 event: uploadFiles
                //             },
                //             decline: {
                //                 text: 'BACK',
                //                 event: null
                //             }
                //         });
                //     }
                // },
                uploadFolders: {
                    label: 'Upload Folders',
                    onClick: uploadFolders
                },
                createFile: {
                    label: 'Create File',
                    onClick: createFile
                },
                createFolder: {
                    label: 'Create Folder',
                    onClick: createFolder
                },
                download: {
                    label: 'Download',
                    onClick: downloadItems
                },
                copyPaths: {
                    label: 'Copy Paths',
                    onClick: copyPaths
                },
                copyNames: {
                    label: 'Copy Names',
                    onClick: () => {
                        copyPaths(true);
                    }
                },
                delete: {
                    label: 'Delete',
                    onClick: deleteItems.bind(this)
                },
                rename: {
                    label: 'Rename',
                    onClick: async () => {
                        setRenaming(true);
                    }
                }
            };

            this.$contextmenu({
                x: event.x,
                y: event.y,
                items:
                    // if we have a list of files/folders
                    this.filtered.length > 0
                        ? [
                              events.refresh,
                              ...(this.isEditable() ? [events.edit] : []),
                              events.uploadFiles,
                              events.uploadFolders,
                              events.createFile,
                              events.createFolder,
                              events.download,
                              events.delete,
                              events.rename,
                              events.copyPaths,
                              events.copyNames
                          ]
                        : // if not
                          [events.refresh, events.uploadFiles, events.uploadFolders, events.createFile, events.createFolder]
            });
        }
    }
};
</script>
<style lang="postcss" scoped>
.titles {
    display: flex;
    padding: 0 1.25em;

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
            user-select: none;
            cursor: pointer;
            display: flex;
            border-radius: 0.5rem 0.5rem 0 0;
            font-size: 0.8em;
            font-weight: 600;
            background-color: color-mod(var(--grey-color) a(5%));
            /* border: 1px solid color-mod(var(--main-color) a(15%)); */
            /* border-bottom: none; */
            padding: 0.5rem 1rem;
            color: var(--grey-color);
            margin: 0 1rem 0 0;

            &:hover {
                background-color: color-mod(var(--grey-color) a(10%));
            }
        }
    }
}

.items {
    border-radius: 0.75em;
    border: 1px solid color-mod(var(--main-color) a(15%));
    overflow: auto;
    /* height: calc(100vh - 15.5em); */
    /* height: auto; */
    /* display: flex; */
    /* flex-flow: column; */
}

.empty {
    padding: 1.5em 1.25em;
    border-radius: 0.75em;
    border: 1px solid color-mod(var(--main-color) a(15%));
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
