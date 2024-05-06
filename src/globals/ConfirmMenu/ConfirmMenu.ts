import ConfirmMenu from 'front/globals/ConfirmMenu/ConfirmMenu.vue';
import { App, h, render } from 'vue';

type Options = {
    text: string;
    accept: {
        text: string;
        event(): any;
    };
    decline: {
        text: string;
        event(): any;
    };
};

const initInstance = (container: HTMLElement, options: Options) => {
    const node = h(ConfirmMenu, {
        options,
        close: () => {
            render(null, container);
        }
    });

    render(node, container);

    // @ts-ignore
    const element = document.querySelector('#app').appendChild(container.firstElementChild as Node);
    // @ts-ignore
    element.className = 'confirm-menu';
    // @ts-ignore
    element.focus();
    return node.component;
};

export default {
    install(app: App<Element>): void {
        app.config.globalProperties.$ConfirmMenu = (options: Options) => initInstance(document.createElement('div'), options);
    }
};
