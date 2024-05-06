import StoreNotifications from 'front/store/StoreNotifications';
import { upload } from './SftpEvents';

const getItems = (dataTransfer: DataTransfer) => {
    try {
        // @ts-ignore
        return [...dataTransfer.items].map((item: DataTransferItem) => {
            const file = item.getAsFile();
            const isFile = item.webkitGetAsEntry()?.isFile;

            if (file) {
                return {
                    type: isFile ? 'file' : 'folder',
                    path: file.path,
                    name: file.name
                };
            } else {
                throw new Error('Unable to determine files');
            }
        });
    } catch (error: any) {
        StoreNotifications.add({ text: error.message });
    }
};

export const dropHandler = (ev: DragEvent, to: string, invoke: Function) => {
    ev.preventDefault();
    ev.stopPropagation();

    if (ev.dataTransfer?.items) {
        const items = getItems(ev.dataTransfer);

        if (items) {
            const files = items.filter(item => item.type === 'file').map(item => item.path);
            const folders = items.filter(item => item.type === 'folder').map(item => item.path);

            upload(
                {
                    folders,
                    files
                },
                to
            );

            if (invoke) invoke();
        }
    }
};
