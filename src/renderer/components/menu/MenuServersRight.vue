<template>
    <div class="right scroll-theme">
        <!-- if the server was already added and the user has set wrong creds  -->
        <div class="not-valid" v-if="notValidFields.length > 0 && selected > 0">
            <span>Not Valid</span>
            <div class="items">
                <div class="item" v-for="item in notValidFields" :key="item.scope">
                    {{ item.scope }}
                </div>
            </div>
        </div>
        <div class="title">
            <span>Title</span>
            <input type="text" class="text-input" v-model="title" maxlength="100" placeholder="Title" />
        </div>
        <div class="description">
            <span>Description</span>
            <textarea class="text-input scroll-theme" v-model="description" placeholder="Description" />
        </div>
        <div class="host-port">
            <div class="host">
                <span>Host</span>
                <input type="text" class="text-input" v-model="host" placeholder="Host" />
            </div>
            <div class="port">
                <span>Port</span>
                <input type="number" min="1" max="65535" class="text-input" v-model="port" placeholder="Port" />
            </div>
        </div>
        <div class="login">
            <span>Login</span>
            <input type="text" class="text-input" v-model="login" placeholder="Login" />
        </div>
        <div class="auth">
            <span>Auth</span>
            <div class="types">
                <label>
                    <input type="checkbox" class="option-input" :checked="auth.password.active" @change="changeAuth($event)" />
                    <span>Password</span>
                </label>
                <label>
                    <input type="checkbox" class="option-input" :checked="auth.key.active" @change="changeAuth($event)" />
                    <span>Key</span>
                </label>
            </div>
            <div class="data" v-if="auth.password.active">
                <div class="password">
                    <input type="text" class="text-input" v-model="auth.password.data" placeholder="Password" />
                </div>
            </div>
            <div class="data" v-else>
                <div class="key">
                    <textarea type="text" class="text-input scroll-theme" v-model="auth.key.data" placeholder="Key" />
                </div>
                <div class="passphrase">
                    <input type="text" class="text-input" v-model="auth.key.passphrase" placeholder="Passphrase" />
                </div>
            </div>
        </div>
        <!-- if the server not added yet (won't show the buttons until the user sets valid creds) || or the added server was selected -->
        <div class="buttons-wrap" v-if="!notValidFields.length || selected > 0">
            <template v-if="!notValidFields.length">
                <button @click="testServer">
                    <NetworkSvg />
                    <span>Test</span>
                </button>
                <button @click="addServer" v-if="selected === 0">
                    <PlusSvg />
                    <span>Add</span>
                </button>
            </template>
            <button @click="remove" v-if="selected > 0">
                <TrashSvg />
                <span>Remove</span>
            </button>
        </div>
        <div class="tip" v-if="selected === 0">You adding a new server.</div>
        <div class="tip" v-else>You changing the "{{ this.title ? this.title : 'No Title' }}" server data. If you want to add another one server, just deselect current.</div>
    </div>
</template>
<script>
import StoreServers from 'front/store/StoreServers';
import StoreNotifications from 'front/store/StoreNotifications';
import { ipcRenderer } from 'electron';
import { ipv4, ipv6, url } from 'front/misc/Regexes';

import TrashSvg from 'front/svg/trash.svg';
import PlusSvg from 'front/svg/plus.svg';
import NetworkSvg from 'front/svg/network.svg';

export default {
    props: {
        selected: Number,
        selectedData: Object
    },
    components: { TrashSvg, PlusSvg, NetworkSvg },
    watch: {
        $props: {
            handler(data) {
                if (data.selected !== 0) {
                    this.$data.title = data.selectedData.title;
                    this.$data.description = data.selectedData.description;
                    this.$data.host = data.selectedData.host;
                    this.$data.port = data.selectedData.port;
                    this.$data.login = data.selectedData.login;
                    this.$data.auth = data.selectedData.auth;
                } else {
                    this.$data.title = '';
                    this.$data.description = '';
                    this.$data.host = '';
                    this.$data.port = 22;
                    this.$data.login = 'root';
                    this.$data.auth = {
                        password: {
                            active: true,
                            data: ''
                        },
                        key: {
                            active: false,
                            data: '',
                            passphrase: ''
                        }
                    };
                }
            },
            deep: true
        },
        $data: {
            handler(data) {
                if (this.selected !== 0) {
                    StoreServers.updateServer(this.selected, data);
                }
            },
            deep: true
        }
    },
    mounted() {
        ipcRenderer.on('test-remote', (event, { verdict }) => {
            StoreNotifications.add({ text: `${verdict.toUpperCase()} (${this.auth.password.active ? 'LOGIN & PASSWORD' : 'LOGIN & KEY'})` });
        });
    },
    unmounted() {
        ipcRenderer.removeAllListeners('test-remote');
    },
    data() {
        if (this.selected) {
            return {
                ...this.selectedData
            };
        }

        return {
            title: '',
            description: '',
            host: '',
            port: 22,
            login: 'root',
            auth: {
                password: {
                    active: true,
                    data: ''
                },
                key: {
                    active: false,
                    data: '',
                    passphrase: ''
                }
            }
        };
    },
    computed: {
        notValidFields() {
            const notValid = [];

            if (!url.test(this.host) && !ipv6.test(this.host) && !ipv4.test(this.host)) {
                notValid.push({ scope: 'host', message: 'Host must be an IPv4, IPv6, URL' });
            }

            if (!this.port || this.port > 65535) {
                notValid.push({ scope: 'port', message: '' });
            }

            if (!this.login) {
                notValid.push({ scope: 'login', message: '' });
            }

            if (this.auth.password.active && !this.auth.password.data) {
                notValid.push({ scope: 'password', message: '' });
            }

            if (this.auth.key.active && !this.auth.key.data) {
                notValid.push({ scope: 'key', message: '' });
            }

            return notValid;
        }
    },
    methods: {
        remove() {
            this.$ConfirmMenu({
                text: `You are sure, you want to remove the "${this.selectedData.title ? this.selectedData.title : 'No Title'}" server?`,
                accept: {
                    text: 'DELETE',
                    event: () => {
                        this.$emit('delelect');

                        StoreServers.remove(this.selectedData.added);
                    }
                },
                decline: {
                    text: 'BACK',
                    event: null
                }
            });
        },
        changeAuth(event) {
            event.preventDefault();
            event.target.checked = true;

            this.auth.password.active = !this.auth.password.active;
            this.auth.key.active = !this.auth.key.active;
        },
        addServer() {
            if (this.notValidFields.length > 0) return;

            const isHasTheSameHostPort = StoreServers.isHasTheSameHostPort;
            const isExists = isHasTheSameHostPort(this.host, this.port);

            if (isExists) {
                this.$ConfirmMenu({
                    text: `Server with this HOST & PORT is already exist, do you wan't to add this?`,
                    accept: {
                        text: 'ADD',
                        event: () => {
                            this.confirmAddServer();
                        }
                    },
                    decline: {
                        text: 'BACK',
                        event: null
                    }
                });
            } else {
                this.confirmAddServer();
            }
        },
        confirmAddServer() {
            StoreServers.add({
                title: this.title,
                description: this.description,
                host: this.host,
                port: this.port,
                login: this.login,
                auth: this.auth
            });

            this.$emit('delelect');
        },
        testServer() {
            if (this.notValidFields.length > 0) return;

            if (this.selected > 0) {
                ipcRenderer.send('test-remote', {
                    remoteData: StoreServers.getRemoteData(this.selected)
                });
            } else {
                const auth = this.auth.key.active ? { privateKey: this.auth.key.data, passphrase: this.auth.key.passphrase } : { password: this.auth.password.data };

                ipcRenderer.send('test-remote', {
                    remoteData: {
                        host: this.host,
                        port: this.port,
                        login: this.login,
                        auth
                    }
                });
            }
        }
    }
};
</script>
<style lang="postcss" scoped>
.right {
    width: 60%;
    overflow: auto;

    & .not-valid {
        background-color: var(--main-color);
        color: var(--back-color);
        padding: 1em;
        display: flex;
        align-items: center;

        & span {
            color: var(--main-color);
            display: flex;
            background-color: var(--back-color);
            padding: 0.25rem 1rem;
            border-radius: 0.75rem;
            font-weight: 600;
            font-size: 0.85em;
        }

        & .items {
            margin-left: 1em;
            font-weight: 600;
            display: flex;

            & .item {
                text-transform: capitalize;
                margin-right: 0.2em;

                &:after {
                    content: ',';
                }

                &:last-child {
                    margin-right: 0;

                    &:after {
                        content: '';
                    }
                }
            }
        }
    }

    & .host-port {
        display: flex;

        & .host {
            width: 50%;
            border-right: 1px solid color-mod(var(--main-color) a(15%));
        }

        & .port {
            width: 50%;
        }
    }

    & .title,
    & .description,
    & .host-port .host,
    & .host-port .port,
    & .login,
    & .auth,
    & .buttons-wrap {
        position: relative;
        border-bottom: 1px solid color-mod(var(--main-color) a(15%));

        & input:not(.option-input),
        & textarea {
            &::placeholder {
                color: color-mod(var(--dark-white-color) a(40%));
            }

            padding: 1.25rem;
        }

        & > span {
            top: 0;
            right: 0;
            font-size: 0.85rem;
            display: flex;
            position: absolute;
            /* background-color: color-mod(var(--main-color) a(15%)); */
            border-radius: 0 0 0 0.5em;
            padding: 0.25em 1em;
            border: 1px solid color-mod(var(--main-color) a(15%));
            border-top: none;
            border-right: none;
        }
    }

    & .title {
        font-size: 1.75em;
    }

    & .auth {
        & .types {
            padding: 1.25rem;
            display: flex;
        }

        & .data {
            margin: 0 1.25rem 1.25rem 1.25rem;
            border: 1px solid color-mod(var(--main-color) a(15%));
            border-radius: 0.75em;

            & .password {
            }
        }

        & .passphrase {
            border-top: 1px solid color-mod(var(--main-color) a(15%));
        }
    }

    & textarea {
        width: 100%;
        height: 10em;
        resize: none;
    }

    & .description {
        /* padding: 1rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid color-mod(var(--main-color) a(15%)); */
    }

    & .buttons-wrap {
        padding: 1.25rem;
        display: flex;
        justify-content: space-between;

        & button {
            width: calc(50% - 0.5em);
        }
    }

    & .tip {
        overflow: hidden;
        padding: 1.25rem 2em;
        margin: 1.25rem;
        font-weight: 600;
        font-size: 0.85em;
        color: color-mod(var(--dark-white-color) a(65%));
        border-radius: 0.75rem;
        /* border: 1px dashed color-mod(var(--dark-white-color) a(15%)); */
        background-color: color-mod(var(--dark-white-color) a(3%));
    }
}
</style>
