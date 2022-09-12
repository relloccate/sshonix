<template>
    <div :class="`terminal-wrap ${type} ${channel} scroll-theme`" />
    <!-- <div :class="`terminal-wrap filled ${type} ${channel} scroll-theme`" /> -->
</template>
<script>
import StoreServers from 'front/store/StoreServers';
import { ipcRenderer, shell } from 'electron';
import { Terminal } from 'xterm';
import { WebLinksAddon } from 'xterm-addon-web-links';

export default {
    props: {
        channel: [String, Number],
        added: Number,
        cwd: String,
        exec: String,
        type: String
    },
    setup() {
        return {
            addons: {
                webLinks: new WebLinksAddon((e, url) => {
                    e.preventDefault();
                    shell.openExternal(url);
                })
            },
            term: null
        };
    },
    mounted() {
        const sizes = this.getSizes();

        this.initTerminal(sizes);
        this.setupAddons();

        this.$nextTick(() => {
            this.setupIpc(sizes);
            this.term.focus();
        });

        window.addEventListener('resize', this.fit);
    },
    async unmounted() {
        ipcRenderer.removeAllListeners(`terminal:${this.channel}.on-data`);
        window.removeEventListener('resize', this.fit);
        await ipcRenderer.invoke('terminal:close', this.channel);
    },
    methods: {
        initTerminal({ cols, rows }) {
            this.term = new Terminal({
                cols,
                rows,
                windowsMode: true,
                convertEol: true,
                allowTransparency: true,
                cursorBlink: true,
                fontFamily: 'Consolas',
                fontSize: 14,
                letterSpacing: '0.5',
                scrollback: 500,
                screenKeys: true,
                fontWeight: '600',
                rendererType: 'canvas',
                lineHeight: 1,
                experimentalCharAtlas: 'dynamic',
                theme: {
                    foreground: '#D84315',
                    background: 'transparent',
                    cursor: 'rgba(216, 67, 21, 0.3)',
                    selection: 'rgba(23, 0, 23, .3)',
                    white: 'rgba(213, 219, 219, 0.75)',
                    brightWhite: 'rgb(213, 219, 219)',
                    yellow: 'rgba(190, 196, 56)',
                    brightYellow: 'rgb(223, 231, 27)',
                    brightGreen: 'rgb(87, 221, 138)',
                    green: 'rgb(48, 187, 100)',
                    brightCyan: 'rgb(75, 209, 218)',
                    cyan: 'rgb(47, 159, 166)',
                    blue: 'rgb(24, 95, 135)',
                    brightBlue: 'rgb(40, 149, 222)',
                    brightMagenta: 'rgb(247, 57, 121)',
                    magenta: 'rgb(224, 47, 107)',
                    brightRed: 'rgb(193, 52, 30)',
                    red: 'rgb(193, 52, 30)'
                    // black: '',
                    // brightBlack: '',
                    // cursorAccent: '',

                }
            });

            this.term.attachCustomKeyEventHandler(async arg => {
                if (arg.ctrlKey && arg.shiftKey && arg.type === 'keydown' && arg.code === 'KeyC') {
                    const data = this.term.getSelection();

                    if (data.length > 0) {
                        navigator.clipboard.writeText(data);
                    }
                }

                // if (arg.code === 'Escape') {
                // }
            });

            this.term.open(document.getElementsByClassName(this.channel)[0]);
        },
        setupAddons() {
            for (const addon of Object.keys(this.addons)) {
                this.term.loadAddon(this.addons[addon]);
            }
        },
        setupIpc(sizes) {
            this.term.onData(data => {
                ipcRenderer.send(`terminal:${this.channel}.on-key`, data);
            });

            ipcRenderer.on(`terminal:${this.channel}.on-data`, (event, data) => {
                this.term.write(data);
            });

            if (this.type === 'local') {
                ipcRenderer.invoke('terminal:run', { channel: this.channel, type: this.type, cwd: this.cwd, exec: this.exec, sizes });
            } else {
                ipcRenderer.invoke('terminal:run', {
                    channel: this.channel,
                    type: this.type,
                    remoteData: StoreServers.getRemoteData(this.added),
                    sizes
                });
            }
        },
        getSizes() {
            const { width, height } = document.querySelector('.pool-wrap:not([style*="display: none"])').getBoundingClientRect();

            const nextWidth = width; // just to be
            const nextHeight = height - 96;

            const cols = Number((nextWidth / 8).toFixed(0));
            // const cols = Number((nextWidth / 8.2).toFixed(0));
            const rows = Number((nextHeight / 17).toFixed(0));

            return {
                rows,
                cols,
                width: nextWidth,
                height: nextHeight
            };
        },
        fit() {
            try {
                const { cols, rows, width, height } = this.getSizes();

                if (cols > 0 && rows > 0) {
                    ipcRenderer.send(`terminal:${this.channel}.fit`, {
                        cols,
                        rows,
                        width,
                        height
                    });

                    this.term.resize(cols, rows);
                }
            } catch {}
        }
    }
};
</script>
<style lang="postcss">
.terminal-wrap {
    position: relative;
    height: calc(100vh - 13.3rem);

    &.filled {
        border-radius: 0.75em;
        height: calc(100% - 1em);
        /* box-shadow: 0 1px 6px color-mod(var(--dark-white-color) a(2%)); */
        /* background-color: #1B1A1A; */
        background-color: color-mod(var(--dark-white-color) a(2%));
        /* background-image: linear-gradient(129deg, color-mod(var(--dark-white-color) a(1%)), color-mod(var(--main-color) a(1%))); */
        /* border: 1px solid color-mod(var(--main-color) a(15%)); */

        padding: 1em;
    }

    & .xterm {
        position: relative;
        user-select: none;
        -ms-user-select: none;
        -webkit-user-select: none;
        cursor: text;

        &.focus,
        &:focus {
            outline: none;
        }

        & .xterm-helpers {
            position: absolute;
            top: 0;
            z-index: 5;
        }
    }
}

.xterm-rows {
    height: calc(100vh - 10em);
    line-height: 1em;
    /* height: 100%; */
}

.xterm .xterm-helper-textarea {
    position: absolute;
    opacity: 0;
    left: -9999em;
    top: 0;
    width: 0;
    height: 0;
    z-index: -5;
    white-space: nowrap;
    overflow: hidden;
    resize: none;
}

.xterm .composition-view {
    background: #000;
    color: #fff;
    display: none;
    position: absolute;
    white-space: nowrap;
    z-index: 1;

    &.active {
        display: block;
    }
}

.xterm .xterm-viewport {
    background-color: #000;
    overflow-y: auto;
    cursor: default;
    position: absolute;
    right: 0;
    left: 0;
    top: 0;
    bottom: 0;

    &::-webkit-scrollbar {
        width: 16px;
    }

    &::-webkit-scrollbar-track {
        border-radius: 0.75em;
        background-color: color-mod(var(--main-color) a(5%));
    }

    &::-webkit-scrollbar-thumb {
        background-color: color-mod(var(--main-color) a(75%));
        border-radius: 0.75em;
    }
}

.xterm .xterm-screen {
    position: relative;

    & canvas {
        position: absolute;
        left: 0;
        top: 0;
    }
}

.xterm .xterm-scroll-area {
    visibility: hidden;
}

.xterm-char-measure-element {
    display: inline-block;
    visibility: hidden;
    position: absolute;
    top: 0;
    left: -9999em;
    line-height: normal;
}

.xterm.enable-mouse-events {
    cursor: default;
}

.xterm.xterm-cursor-pointer {
    cursor: pointer;
}

.xterm.column-select.focus {
    cursor: crosshair;
}

.xterm .xterm-accessibility,
.xterm .xterm-message {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;
    z-index: 10;
    color: transparent;
}

.xterm .live-region {
    position: absolute;
    left: -9999px;
    width: 1px;
    height: 1px;
    overflow: hidden;
}

.xterm-dim {
    opacity: 0.5;
}

.xterm-underline {
    text-decoration: underline;
}

.terminal .xterm-selection {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    opacity: 0.3;
    pointer-events: none;

    & div {
        position: absolute;
        background-color: #fff;
    }
}
</style>
