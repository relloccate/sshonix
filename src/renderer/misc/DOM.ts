import { nextTick } from 'vue';

export const focusOnElement = async (selector: string) => {
    try {
        await nextTick();

        const element = document.querySelector(selector) as HTMLElement | null;

        if (element) {
            element.focus();
        }
    } catch (error) {
        console.log(error);
    }
};
