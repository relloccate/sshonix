import { build as viteBuild } from 'vite';
import { build as electronBuild } from 'electron-builder';
import { rm } from 'fs/promises';

console.log('CLEARING DIST DIR');
await rm('./dist', { recursive: true, force: true });
console.log('\r\n\r\n');

console.log('BUILDING VITE');
// await viteBuild({ configFile: 'config/vite.config.main.ts' });
// await viteBuild({ configFile: 'config/vite.config.renderer.ts' });
await viteBuild({ configFile: 'src/main/vite.config.ts' });
await viteBuild({ configFile: 'src/renderer/vite.config.ts' });
console.log('\r\n\r\n');

console.log('BUILDING APP');
await electronBuild({
    // publish: 'always',
    config: {
        appId: 'com.sshonix.app',
        asar: true,
        directories: {
            output: 'dist/release/${version}'
        },
        win: {
            icon: '/assets/LOGO.ico',
            target: [
                {
                    target: 'nsis',
                    arch: ['universal']
                }
                // {
                //     target: 'zip',
                //     arch: ['x64', 'ia32']
                // }
            ],
            artifactName: '${name}-v${version}-${arch}-${os}.${ext}'
        },
        productName: 'SSHONIX',
        copyright: '2022 Relloccate',
        nsis: {
            oneClick: false,
            perMachine: false,
            allowToChangeInstallationDirectory: true,
            deleteAppDataOnUninstall: false,
            artifactName: '${name}-v${version}-${arch}-${os}-installer.${ext}'
        },
        // portable: {
        //     artifactName: '${name}-v${version}-${arch}-${os}-portable.${ext}'
        // },
        publish: {
            provider: 'github',
            owner: 'assnctr',
            repo: 'sshonix',
            private: true
        }
    }
})
    .then(result => {
        console.log(JSON.stringify(result));
    })
    .catch(error => {
        console.error(error);
    });

console.log('\r\n\r\n');
console.log('DONE');
