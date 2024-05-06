<template>
    <div class="sftp" v-on="{ dragenter: event => (dragging = true), dragend: onDragEnd, dragleave: onDragLeave }">
        <SftpTop :currentPath="sftp.currentPath" :search="sftp.search" />
        <SftpItems :files="sftp.files" :currentPath="sftp.currentPath" :sort="sftp.sort" :search="sftp.search" :toggleExplorer="toggleExplorer" :showDrag="dragging" @onDragEnd="onDragEnd" />
    </div>
</template>
<script>
import SftpTop from 'front/components/sftp/SftpTop.vue';
import SftpItems from 'front/components/sftp/SftpItems.vue';
import StoreServers from 'front/store/StoreServers';
import { ipcRenderer } from 'electron';

export default {
    components: { SftpTop, SftpItems },
    props: {
        sftp: Object,
        toggleExplorer: Function
    },
    provide() {
        return {
            channel: this.sftp.channel
        };
    },
    data() {
        return {
            dragging: false,
            dragLeaveTimer: null
        };
    },
    async mounted() {
        await ipcRenderer.invoke('sftp:connect', {
            channel: this.sftp.channel,
            remoteData: StoreServers.getRemoteData(this.sftp.serverId)
        });
    },
    async unmounted() {
        await ipcRenderer.invoke('sftp:close', this.sftp.channel);
    },
    methods: {
        onDragLeave(event) {
            if (event.currentTarget.contains(event.relatedTarget)) {
                return;
            }

            //             dragleave(e) {
            //     if(e.clientY < rect.top || e.clientY >= rect.bottom || e.clientX < rect.left || e.clientX >= rect.right) {
            //         //real leave
            //     }
            // }

            if (this.dragLeaveTimer) clearTimeout(this.dragLeaveTimer);

            this.dragLeaveTimer = setTimeout(() => {
                this.dragging = false;
            }, 200);
        },
        onDragEnd() {
            this.dragging = false;
        }
    }
};
</script>
<style lang="postcss" scoped>
.sftp {
    display: flex;
    flex-flow: column;
    height: 100%;
    width: 100%;
}
</style>
