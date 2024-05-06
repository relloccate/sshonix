import ContextMenu from 'front/globals/ContextMenu/ContextMenu.vue';
import { App, h, render } from 'vue';
// import type { Options } from 'front/globals/ContextMenu/ContextMenu.d.ts';

export type Options = {
    x: number;
    y: number;
    items: {
        title: string;
        invoke(): Function;
    }[];
};

const initInstance = (container: HTMLElement, options: Options) => {
    const node = h(ContextMenu, {
        options,
        close: () => {
            try {
                render(null, container);
            } catch (error) {}
        }
    });

    render(node, container);

    const app = document.querySelector('#app');

    if (app) {
        const element = app.appendChild(container.firstElementChild as Node) as HTMLElement;
        const contextMenuCoords = element.getBoundingClientRect();
        const maxAppHeight = app.getBoundingClientRect().height;
        const isOverY = contextMenuCoords.height + contextMenuCoords.y > maxAppHeight;

        element.className = 'context-menu';

        if (isOverY) {
            element.style.top = `${maxAppHeight - contextMenuCoords.height}px`;
        }

        element.focus();
    }

    return node.component;
};

export default {
    install(app: App<Element>): void {
        app.config.globalProperties.$ContextMenu = (options: Options) => initInstance(document.createElement('div'), options);
    }
};
