import EditFile from 'front/globals/EditFile/EditFile.vue';
import { App, h, render } from 'vue';

type File = {
    data: string;
    name: string;
    path: string;
};

const initInstance = (container: HTMLElement, channel: number, file: File) => {
    const node = h(EditFile, {
        channel,
        file,
        close: () => {
            render(null, container);
        }
    });

    render(node, container);

    // @ts-ignore
    const element = document.querySelector('#app').appendChild(container.firstElementChild as Node);
    // @ts-ignore
    element.className = 'edit-file';
    // @ts-ignore
    element.focus();
    return node.component;
};

export default {
    install(app: App<Element>): void {
        app.config.globalProperties.$EditFile = (channel: number, file: File) => initInstance(document.createElement('div'), channel, file);
    }
};
