export default {
    handleLeave() {
        const tooltipElement = document.getElementById('tooltip');

        if (tooltipElement) {
            tooltipElement.remove();
        }
    },
    mounted(el: HTMLElement, { value, dir, modifiers }) {
        dir.handleHover = () => {
            const color = Object.keys(modifiers)[0];

            const currentElementCoords = el.getBoundingClientRect();
            const appElement = document.getElementById('app');
            const tooltipElement = document.createElement('div');

            tooltipElement.id = 'tooltip';
            tooltipElement.className = `tooltip ${color}`;
            tooltipElement.innerHTML = value;

            appElement.appendChild(tooltipElement);

            const tooltipElementCoords = tooltipElement.getBoundingClientRect();
            const offset = tooltipElementCoords.width / 2;
            const offset2 = currentElementCoords.width / 2;

            tooltipElement.style.top = `${currentElementCoords.y + window.pageYOffset - tooltipElementCoords.height - 16}px`;
            tooltipElement.style.left = `${currentElementCoords.x - offset + offset2}px`;
        };

        el.addEventListener(
            'mouseleave',
            () => {
                el.removeEventListener('mouseleave', dir.handleLeave);
                dir.handleLeave();
            },
            false
        );

        el.addEventListener('mouseenter', dir.handleHover, false);
    },
    beforeUnmount(el: HTMLElement, { dir }) {
        dir.handleLeave();

        el.removeEventListener('mouseleave', dir.handleLeave);
        el.removeEventListener('mouseenter', dir.handleHover);
    }
};
