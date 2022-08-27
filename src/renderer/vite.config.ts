import vue from '@vitejs/plugin-vue';
import electron from 'vite-plugin-electron-renderer';
import path from 'path';
import svgLoader from 'vite-svg-loader';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    mode: process.env.NODE_ENV,
    root: __dirname,
    plugins: [vue(), svgLoader(), electron()],
    resolve: {
        alias: [
            { find: 'front', replacement: path.resolve(__dirname + '/') },
            { find: 'core', replacement: path.resolve(__dirname + '/' + '../../src/core/') }
        ]
    },
    base: './',
    build: {
        outDir: '../../dist/renderer',
        emptyOutDir: true,
        sourcemap: true
    },
    server: {
        host: '127.0.0.1',
        port: 3344
    },
    css: {
        postcss: {
            plugins: [
                require('postcss-preset-env')({
                    stage: 4,
                    features: {
                        'nesting-rules': true
                    }
                }),
                require('postcss-color-mod-function')({})
            ]
        }
    }
});
