import pkg from '../../package.json';
import { builtinModules } from 'module';
import { defineConfig } from 'vite';

export default defineConfig({
    root: __dirname,
    build: {
        outDir: '../../dist/main',
        emptyOutDir: true,
        minify: process.env.NODE_ENV === 'production',
        sourcemap: true,
        lib: {
            entry: 'index.ts',
            formats: ['cjs'],
            fileName: () => '[name].cjs'
        },
        rollupOptions: {
            external: [
                'electron',
                ...builtinModules,
                // @ts-ignore
                ...Object.keys(pkg.dependencies || {})
            ]
        }
    }
});
