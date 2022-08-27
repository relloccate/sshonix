<template>
    <div class="sftp">
        <SftpTop :currentPath="sftp.currentPath" :search="sftp.search" />
        <SftpItems :files="sftp.files" :currentPath="sftp.currentPath" :sort="sftp.sort" :search="sftp.search" />
    </div>
</template>
<script>
import SftpTop from 'front/components/sftp/SftpTop.vue';
import SftpItems from 'front/components/sftp/SftpItems.vue';
import StoreServers from 'front/store/StoreServers';
import StoreActiveSftps from 'front/store/StoreActiveSftps';
import { ipcRenderer } from 'electron';

export default {
    components: { SftpTop, SftpItems },
    props: {
        sftp: Object
    },
    provide() {
        return {
            channel: this.sftp.channel
        };
    },
    async mounted() {
        await ipcRenderer.invoke('sftp:connect', {
            channel: this.sftp.channel,
            remoteData: StoreServers.getRemoteData(this.sftp.added)
        });

        StoreActiveSftps.init(this.sftp.channel);
    },
    async unmounted() {
        await ipcRenderer.invoke('sftp:close', this.sftp.channel);
    }
};
</script>
<style lang="postcss" scoped>
.sftp {
    display: flex;
    flex-flow: column;
    height: calc(100% - 3.3em);
    width: 100%;
}
</style>
