import electron from 'electron';
import { spawn } from 'child_process';
import { createServer, build } from 'vite';

const query = new URLSearchParams(import.meta.url.split('?')[1]);
const debug = query.has('debug');

/**
 * @type {(server: import('vite').ViteDevServer) => Promise<import('rollup').RollupWatcher>}
 */
function watchMain(server) {
    /**
     * @type {import('child_process').ChildProcessWithoutNullStreams | null}
     */
    let electronProcess = null;
    const address = server.httpServer.address();
    const env = Object.assign(process.env, {
        VITE_DEV_SERVER_HOST: address.address,
        VITE_DEV_SERVER_PORT: address.port
    });
    /**
     * @type {import('vite').Plugin}
     */
    const startElectron = {
        name: 'electron-main-watcher',
        writeBundle() {
            electronProcess && electronProcess.kill();
            electronProcess = spawn(electron, ['.'], { stdio: 'inherit', env });
        }
    };

    return build({
        // configFile: 'config/vite.config.main.ts',
        configFile: 'src/main/vite.config.ts',
        mode: 'development',
        plugins: [!debug && startElectron].filter(Boolean),
        build: {
            watch: {}
        }
    });
}

// const server = await createServer({ configFile: 'config/vite.config.renderer.ts' });
const server = await createServer({ configFile: 'src/renderer/vite.config.ts' });

await server.listen();
await watchMain(server);
